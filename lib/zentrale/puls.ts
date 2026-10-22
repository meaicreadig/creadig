import "server-only"

import { assistentDb, letzteLaeufe, protokolliereLauf } from "@/lib/assistent/store"
import { AGENT_KEYS, fuehreAgentAus, koordinationAbarbeiten, type AgentKey } from "@/lib/assistent/truppe"
import { berechneLeistung } from "@/lib/zentrale/leistung"

/**
 * DER PULS — läuft mehrmals am Tag zwischen den Morgen-Takten.
 * 1. Interne Warteschlange abarbeiten (Abteilungen übergeben sich Arbeit).
 * 2. Engpässe erkennen und selbst heilen: gescheiterte oder stille Agenten
 *    neu starten (je Agent höchstens 2 Versuche pro Tag).
 * 3. Hängende Aufträge an die Geschäftsführung eskalieren.
 * Alles, was nicht selbst lösbar ist, bleibt als Engpass sichtbar.
 */

const MAX_NEUSTARTS_PRO_PULS = 2
export const PULS_ABSTAND_STUNDEN = 2

export async function pulsFaellig(): Promise<boolean> {
  const l = (await letzteLaeufe())["puls"]
  return !l || Date.now() - new Date(l.zeit).getTime() > PULS_ABSTAND_STUNDEN * 3600000
}

export async function pulsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const start = Date.now()
  const bearbeitet = await koordinationAbarbeiten()
  const leistung = await berechneLeistung()
  if (!leistung) return { ergebnis: "keine Datenbank", anzahl: 0 }

  const q = await assistentDb()
  const heuteVersuche = new Map<string, number>()
  if (q) {
    const rows = (await q(
      `SELECT agent, count(*)::int AS n FROM assistent_laeufe
        WHERE (created_at AT TIME ZONE 'Europe/Berlin')::date = (now() AT TIME ZONE 'Europe/Berlin')::date
        GROUP BY agent`,
      [],
    )) as { agent: string; n: number }[]
    for (const r of rows) heuteVersuche.set(r.agent, r.n)
  }

  const neustart: AgentKey[] = []
  for (const e of leistung.engpaesse) {
    if (neustart.length >= MAX_NEUSTARTS_PRO_PULS) break
    if ((e.art !== "fehler" && e.art !== "still") || !e.agent) continue
    if (!(AGENT_KEYS as readonly string[]).includes(e.agent)) continue
    if ((heuteVersuche.get(e.agent) ?? 0) >= 2) continue
    neustart.push(e.agent as AgentKey)
  }
  for (const key of neustart) await fuehreAgentAus(key)

  let eskaliert = 0
  const { legeAuftragAn } = await import("@/lib/koordination/koordinator")
  const tag = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })
  for (const e of leistung.engpaesse) {
    if (e.art !== "auftrag_haengt" || e.abteilung === "geschaeftsfuehrung") continue
    const id = await legeAuftragAn({
      von: "koordination",
      an: "geschaeftsfuehrung",
      titel: `Engpass lösen: ${e.text.de}`.slice(0, 160),
      inhalt: `Abteilung ${e.abteilung} kommt nicht voran. Entscheide: neu zuordnen, vereinfachen oder schließen.`,
      quelle: `engpass:${e.id}:${tag}`,
    }).catch(() => null)
    if (id) eskaliert++
  }

  const offen = leistung.engpaesse.length
  const ergebnis = `${bearbeitet} intern bearbeitet · ${neustart.length} Agenten neu gestartet · ${eskaliert} eskaliert · ${offen} Engpässe offen`
  await protokolliereLauf({ agent: "puls", ergebnis, anzahl: bearbeitet + neustart.length + eskaliert, dauerMs: Date.now() - start })
  return { ergebnis, anzahl: bearbeitet + neustart.length + eskaliert }
}
