import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import { abteilungVonAgent } from "@/lib/zentrale/abteilungen"
import type { Abfrage } from "@/lib/neon-abfrage"

import { bewerte, isoWoche, type AgentZahlen, type Bewertung } from "./regeln"

/**
 * Abteilung Qualität — der Denetçi.
 * Misst jeden KI-Mitarbeiter an dem, was der Inhaber mit seiner Arbeit macht:
 * freigegeben, verworfen, vor der Freigabe umgeschrieben. Dazu Läufe und Fehler.
 * Rein aus der Datenbank, ohne KI – eine Note, die ein Modell vergibt, wäre
 * selbst ungeprüft. Wer unter die Schwellen fällt (lib/agenten/regeln.ts),
 * bekommt einen Verbesserungsauftrag an seine Abteilung.
 */

const ZEITRAUM_TAGE = 14

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS agent_noten (
    tag date NOT NULL,
    agent text NOT NULL,
    entwuerfe int NOT NULL DEFAULT 0,
    freigegeben int NOT NULL DEFAULT 0,
    verworfen int NOT NULL DEFAULT 0,
    bearbeitet int NOT NULL DEFAULT 0,
    laeufe int NOT NULL DEFAULT 0,
    fehler int NOT NULL DEFAULT 0,
    quote numeric,
    kosten_cent int,
    PRIMARY KEY (tag, agent))`,
]

let bereit: Promise<void> | null = null
async function db(): Promise<Abfrage | null> {
  const q = await assistentDb()
  if (!q) return null
  if (!bereit) {
    bereit = (async () => {
      for (const ddl of SCHEMA) await q(ddl, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
  return q
}

const zahl = (v: unknown) => Number(v ?? 0) || 0

/** Zahlen je Agent über die letzten `tage` Tage (Entwürfe aus dem Freigabe-Eingang, Läufe aus dem Protokoll). */
export async function sammleZahlen(q: Abfrage, tage = ZEITRAUM_TAGE): Promise<AgentZahlen[]> {
  const entwuerfe = (await q(
    `SELECT agent,
            count(*)::int AS entwuerfe,
            count(*) FILTER (WHERE status = 'freigegeben')::int AS freigegeben,
            count(*) FILTER (WHERE status = 'verworfen')::int AS verworfen,
            count(*) FILTER (WHERE status = 'offen')::int AS offen,
            count(*) FILTER (WHERE status = 'freigegeben' AND extra->>'bearbeitet' = 'true')::int AS bearbeitet
       FROM assistent_freigaben
      WHERE agent IS NOT NULL AND art NOT IN ('aufgabe','notiz')
        AND created_at > now() - make_interval(days => $1)
      GROUP BY agent`,
    [tage],
  )) as Record<string, unknown>[]
  const laeufe = (await q(
    `SELECT agent, count(*)::int AS laeufe, count(*) FILTER (WHERE fehler IS NOT NULL)::int AS fehler
       FROM assistent_laeufe
      WHERE created_at > now() - make_interval(days => $1)
      GROUP BY agent`,
    [tage],
  )) as Record<string, unknown>[]

  const je = new Map<string, AgentZahlen>()
  const hole = (agent: string) => {
    let z = je.get(agent)
    if (!z) {
      z = { agent, entwuerfe: 0, freigegeben: 0, verworfen: 0, offen: 0, bearbeitet: 0, laeufe: 0, fehler: 0 }
      je.set(agent, z)
    }
    return z
  }
  for (const r of entwuerfe) {
    const z = hole(String(r.agent))
    z.entwuerfe = zahl(r.entwuerfe)
    z.freigegeben = zahl(r.freigegeben)
    z.verworfen = zahl(r.verworfen)
    z.offen = zahl(r.offen)
    z.bearbeitet = zahl(r.bearbeitet)
  }
  for (const r of laeufe) {
    const z = hole(String(r.agent))
    z.laeufe = zahl(r.laeufe)
    z.fehler = zahl(r.fehler)
  }

  /* Leere Läufe in Folge, vom neuesten rückwärts – für die Lieferpflicht (regeln.ts). */
  const serien = (await q(
    `SELECT agent, array_agg(anzahl ORDER BY created_at DESC) AS anzahlen,
            (array_agg(ergebnis ORDER BY created_at DESC))[1] AS letztes
       FROM assistent_laeufe
      WHERE created_at > now() - make_interval(days => $1)
      GROUP BY agent`,
    [tage],
  )) as { agent: string; anzahlen: (number | null)[]; letztes: string | null }[]
  for (const r of serien) {
    const z = hole(String(r.agent))
    const ende = r.anzahlen.findIndex((a) => zahl(a) > 0)
    z.leerInFolge = ende < 0 ? r.anzahlen.length : ende
    z.letztesErgebnis = r.letztes
  }

  /* Wer im Takt steht und im ganzen Zeitraum nie lief, ist still ausgefallen. Dynamisch geladen: truppe.ts ruft diese Datei selbst auf. */
  const { AGENTEN } = await import("@/lib/assistent/truppe")
  for (const a of AGENTEN) {
    const z = hole(a.key)
    if (z.laeufe === 0) z.erwartetOhneLauf = true
  }
  return [...je.values()]
}

async function letzteVerworfene(q: Abfrage, agent: string): Promise<string[]> {
  const rows = (await q(
    `SELECT titel, extra->>'grund' AS grund FROM assistent_freigaben WHERE agent = $1 AND status = 'verworfen' ORDER BY erledigt_at DESC NULLS LAST LIMIT 5`,
    [agent],
  )) as { titel: string; grund: string | null }[]
  return rows.map((r) => (r.grund ? `${r.titel} — Grund: ${r.grund}` : r.titel))
}

function auftragsText(z: AgentZahlen, b: Bewertung, verworfen: string[]): string {
  return [
    `Der Denetçi hat ${z.agent} in den letzten ${ZEITRAUM_TAGE} Tagen gemessen:`,
    ...b.gruende.map((g) => `- ${g}`),
    "",
    `Entwürfe ${z.entwuerfe} · freigegeben ${z.freigegeben} · verworfen ${z.verworfen} · offen ${z.offen} · vor Freigabe umgeschrieben ${z.bearbeitet} · Läufe ${z.laeufe} · Fehler ${z.fehler}`,
    verworfen.length ? `\nZuletzt verworfen:\n${verworfen.map((t) => `- ${t}`).join("\n")}` : "",
    "",
    "Auftrag: Finde das Muster hinter den Verwerfungen bzw. Fehlern (Zielgruppe, Ton, fehlende Daten, falscher Zeitpunkt) und schlage EINE konkrete Änderung an Auswahl, Vorlage oder Regel des Agenten vor. Keine Zahlen erfinden.",
    z.leerInFolge && b.gruende.some((g) => g.startsWith("Liefert nicht"))
      ? "Liefert der Agent gar nichts, zuerst die Ursache benennen: Datenquelle erreichbar? Antwort lesbar? Auftrag zu eng? Ein Fix am Code geht als Auftrag an die Entwicklung."
      : "",
  ].join("\n")
}

/** Täglicher Lauf: Noten festhalten, Auffällige an ihre Abteilung melden. */
export async function qualitaetsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await db()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }
  const tag = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })
  const woche = isoWoche(new Date())
  const zahlen = await sammleZahlen(q)

  let auffaellig = 0
  let auftraege = 0
  for (const z of zahlen) {
    const b = bewerte(z)
    await q(
      `INSERT INTO agent_noten (tag, agent, entwuerfe, freigegeben, verworfen, bearbeitet, laeufe, fehler, quote)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (tag, agent) DO UPDATE SET entwuerfe = EXCLUDED.entwuerfe, freigegeben = EXCLUDED.freigegeben,
         verworfen = EXCLUDED.verworfen, bearbeitet = EXCLUDED.bearbeitet, laeufe = EXCLUDED.laeufe,
         fehler = EXCLUDED.fehler, quote = EXCLUDED.quote`,
      [tag, z.agent, z.entwuerfe, z.freigegeben, z.verworfen, z.bearbeitet, z.laeufe, z.fehler, b.quote],
    )
    if (!b.auffaellig) continue
    auffaellig++
    /*
     * Katman 6 – EINE Rückmeldung je Agent: Eine niedrige Freigabequote lernt das
     * Firmengedächtnis aus Emins Absagen (lib/lernen), das Ergebnis misst der Controller.
     * Ein Auftrag von hier nur noch, wenn der Agent technisch nicht liefert.
     */
    if (b.gruende.every((g) => g.startsWith("Freigabequote"))) continue
    const abt = abteilungVonAgent(z.agent)
    const id = await legeAuftragAn({
      von: "qualitaet",
      an: abt?.id ?? "geschaeftsfuehrung",
      titel: `Qualität: ${z.agent} unter der Schwelle`,
      inhalt: auftragsText(z, b, await letzteVerworfene(q, z.agent)),
      quelle: `qualitaet:${z.agent}:${woche}`,
    })
    if (id) auftraege++
  }
  return {
    ergebnis: `${zahlen.length} Mitarbeiter benotet · ${auffaellig} unter der Schwelle · ${auftraege} Verbesserungsaufträge`,
    anzahl: auffaellig,
  }
}

export type Note = {
  agent: string
  entwuerfe: number
  freigegeben: number
  verworfen: number
  bearbeitet: number
  laeufe: number
  fehler: number
  quote: number | null
  kostenCent: number | null
}

/** Karne je Agent über die letzten `tage` Tage (für Morgenmail und /admin/leistung). Live berechnet, nicht aus Schnappschüssen summiert. */
export async function ladeNoten(tage = 7): Promise<Note[]> {
  const q = await db().catch((e) => {
    console.error("[qualitaet] noten", e instanceof Error ? e.message : e)
    return null
  })
  if (!q) return []
  const zahlen = await sammleZahlen(q, tage)
  return zahlen
    .map((z) => {
      const b = bewerte(z)
      return {
        agent: z.agent,
        entwuerfe: z.entwuerfe,
        freigegeben: z.freigegeben,
        verworfen: z.verworfen,
        bearbeitet: z.bearbeitet,
        laeufe: z.laeufe,
        fehler: z.fehler,
        quote: b.quote,
        kostenCent: null,
      }
    })
    .sort((a, b) => (a.quote ?? 2) - (b.quote ?? 2) || b.entwuerfe - a.entwuerfe)
}
