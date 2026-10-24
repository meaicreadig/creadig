import "server-only"

import { assistentDb, letzteLaeufe, protokolliereLauf } from "@/lib/assistent/store"
import { AGENT_KEYS, fuehreAgentAus, koordinationAbarbeiten, type AgentKey } from "@/lib/assistent/truppe"
import { berechneLeistung } from "@/lib/zentrale/leistung"
import { veroeffentlicheGeplante } from "@/lib/assistent/redaktion-post"
import { initiativeRunde } from "@/lib/koordination/initiative"

/**
 * DER PULS — läuft mehrmals am Tag zwischen den Morgen-Takten.
 * 0. Initiative: einen neuen Auftrag mit wechselndem Schwerpunkt anstoßen
 *    (lib/koordination/initiative.ts) — die Firma sucht sich selbst Arbeit.
 * 1. Interne Warteschlange abarbeiten (Abteilungen übergeben sich Arbeit).
 * 2. Engpässe erkennen und selbst heilen: gescheiterte oder stille Agenten
 *    neu starten (je Agent höchstens 2 Versuche pro Tag).
 * 3. Hängende Aufträge an die Geschäftsführung eskalieren.
 * Alles, was nicht selbst lösbar ist, bleibt als Engpass sichtbar.
 *
 * Takt (vercel.json): alle 2 Stunden rund um die Uhr, außer 06–08 Uhr Berlin,
 * wo die Morgenrunden laufen. Bis 23.10.2026 lief er nur 12 und 16 Uhr — eine
 * Übergabe zwischen zwei Abteilungen brauchte so einen halben Tag, eine Kette
 * Tage, und nachts stand alles. Kosten entstehen je Auftrag, nicht je Puls:
 * Eine leere Warteschlange kostet nichts.
 */

const MAX_NEUSTARTS_PRO_PULS = 2

/** Freigegebene Förderchancen ohne Antragsskizze (Schreiben nach Freigabe war ausgefallen) – je Puls höchstens 2. */
async function holeSkizzenNach(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(
    `SELECT id FROM assistent_freigaben WHERE art = 'kapital' AND status = 'freigegeben'
       AND coalesce(extra->'antrag'->>'skizze', '') = ''
       AND coalesce(extra->'antrag'->>'stufe', 'pruefen') NOT IN ('bewilligt','abgelehnt','eingereicht')
     ORDER BY erledigt_at DESC LIMIT 2`,
    [],
  )) as { id: string }[]
  const { schreibeAntragsskizze } = await import("@/lib/assistent/kapital-antrag")
  const { mitAgent } = await import("@/lib/lernen/kontext")
  for (const r of rows) await mitAgent("kapital", () => schreibeAntragsskizze(r.id))
  return rows.length
}
export const PULS_ABSTAND_STUNDEN = 2

export async function pulsFaellig(): Promise<boolean> {
  const l = (await letzteLaeufe())["puls"]
  return !l || Date.now() - new Date(l.zeit).getTime() > PULS_ABSTAND_STUNDEN * 3600000
}

/** Katman 2: Fällt ein Kernkanal aus, erfährt Emin es sofort – nicht erst, wenn wochenlang keine Anfrage kommt. */
const KERN_KANAELE = ["formular", "mail", "buchung", "linkedin-inhaber"]
async function kanalWache(): Promise<void> {
  const { pruefeKanaele } = await import("@/lib/kanaele/bereitschaft")
  const { raiseAlert } = await import("@/lib/alert")
  for (const k of await pruefeKanaele()) {
    if (KERN_KANAELE.includes(k.id) && k.stand === "rot") await raiseAlert(`kanal-${k.id}`, `${k.name}: ${k.detail}${k.schritt ? ` → ${k.schritt}` : ""}`)
  }
}

export async function pulsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const start = Date.now()
  const initiative = await initiativeRunde().catch((e) => {
    console.error("[puls] initiative", e instanceof Error ? e.message : e)
    return { angelegt: false, grund: "Fehler" }
  })
  const bearbeitet = await koordinationAbarbeiten()
  const { raeumeEingangAuf } = await import("@/lib/koordination/koordinator")
  const aufgeraeumt = await raeumeEingangAuf().catch(() => ({ geschlossen: 0, code: 0 }))
  const skizzen = await holeSkizzenNach().catch(() => 0)
  await veroeffentlicheGeplante().catch(() => 0)
  await kanalWache().catch((e) => console.error("[puls] kanaele", e instanceof Error ? e.message : e))
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
  const { pausierteAgenten } = await import("@/lib/ergebnis/steuerung")
  const pausiert = await pausierteAgenten().catch(() => new Set<string>())
  for (const e of leistung.engpaesse) {
    if (neustart.length >= MAX_NEUSTARTS_PRO_PULS) break
    if ((e.art !== "fehler" && e.art !== "still") || !e.agent) continue
    if (!(AGENT_KEYS as readonly string[]).includes(e.agent) || pausiert.has(e.agent)) continue
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
  const ergebnis = `${initiative.angelegt ? `Initiative: ${initiative.grund} · ` : ""}${bearbeitet} intern bearbeitet · ${aufgeraeumt.geschlossen ? `${aufgeraeumt.geschlossen} interne Karten von der Geschäftsführung geschlossen · ` : ""}${skizzen ? `${skizzen} Antragsskizzen nachgeholt · ` : ""}${neustart.length} Agenten neu gestartet · ${eskaliert} eskaliert · ${offen} Engpässe offen`
  const anzahl = Number(initiative.angelegt) + bearbeitet + aufgeraeumt.geschlossen + skizzen + neustart.length + eskaliert
  await protokolliereLauf({ agent: "puls", ergebnis, anzahl, dauerMs: Date.now() - start })
  return { ergebnis, anzahl }
}
