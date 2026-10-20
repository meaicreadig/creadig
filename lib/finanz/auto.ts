import "server-only"

import { generateText } from "ai"

import type { Abfrage } from "@/lib/neon-abfrage"
import { bestaetigeZuordnung, bucheAusgehendenUmsatz, ladeAusgehendeBankUmsaetze, ladeOffeneBankUmsaetze } from "@/lib/finanz/bank-abgleich"
import { GESCHAEFTSFELDER, belegeSchema, verbucheBeleg, type Geschaeftsfeld } from "@/lib/finanz/belege"
import { belegKiBereit } from "@/lib/finanz/beleg-ki"

/**
 * Zuordnen ohne Klicks.
 *
 * Reihenfolge, immer die sicherere zuerst:
 *   1. VERLAUF   dieselbe Gegenpartei wurde schon zugeordnet → gleiche Zuordnung
 *                (mind. 80 % der früheren Fälle zeigen auf dasselbe Feld)
 *   2. KI        nur für Belege ohne Verlauf, nur ab 80 % Sicherheit
 * Nie automatisch: „Privat“ (das entscheidet nur der Owner), Beträge, Steuer.
 * Jede Zuordnung steht mit ihrer Herkunft am Beleg (`zuordnung_quelle`) und ist
 * mit „zurück in den Korb“ rücknehmbar; Bankzahlungen sind Zahlungseingänge und
 * bleiben nur bei EXAKTER Übereinstimmung automatisch.
 */

export const AUTO_SCHWELLE = 0.8
const MAX_BELEGE_JE_LAUF = 40
const ERLAUBT = GESCHAEFTSFELDER.map((g) => g.key).filter((k) => k !== "privat") as Geschaeftsfeld[]

export type AutoErgebnis = { belegeVerlauf: number; belegeKi: number; bankAusgaben: number; bankEingaenge: number }

/** Dominantes Feld aus einer Zählung, wenn es ≥ Schwelle der Fälle trägt. Rein. */
export function dominantesFeld(zaehlung: Record<string, number>): Geschaeftsfeld | null {
  const summe = Object.values(zaehlung).reduce((s, c) => s + c, 0)
  if (summe === 0) return null
  const [feld, anzahl] = Object.entries(zaehlung).sort((a, b) => b[1] - a[1])[0]
  return anzahl / summe >= AUTO_SCHWELLE && (ERLAUBT as string[]).includes(feld) ? (feld as Geschaeftsfeld) : null
}

/** Liest die KI-Antwort (JSON-Liste) streng: nur bekannte IDs, nur erlaubte Felder, nur ab Schwelle. Rein. */
export function leseKiZuordnung(text: string, ids: readonly string[]): { id: string; feld: Geschaeftsfeld }[] {
  const a = text.indexOf("[")
  const b = text.lastIndexOf("]")
  if (a < 0 || b <= a) return []
  try {
    const roh = JSON.parse(text.slice(a, b + 1)) as { id?: unknown; feld?: unknown; konfidenz?: unknown }[]
    const bekannt = new Set(ids)
    const gesehen = new Set<string>()
    const aus: { id: string; feld: Geschaeftsfeld }[] = []
    for (const r of roh) {
      const id = String(r.id)
      if (!bekannt.has(id) || gesehen.has(id)) continue
      if (!(ERLAUBT as string[]).includes(String(r.feld))) continue
      if (!(Number(r.konfidenz) >= AUTO_SCHWELLE)) continue
      gesehen.add(id)
      aus.push({ id, feld: r.feld as Geschaeftsfeld })
    }
    return aus
  } catch {
    return []
  }
}

async function setzeFeld(db: Abfrage, id: string, feld: Geschaeftsfeld, quelle: "verlauf" | "ki"): Promise<boolean> {
  /* `geschaeftsfeld IS NULL` macht es sicher gegen gleichzeitige Läufe und gegen Klicks des Owners. */
  const r = await db(
    `UPDATE fin_belege SET geschaeftsfeld = $2, zugeordnet_at = now(), zuordnung_quelle = $3 WHERE id = $1 AND geschaeftsfeld IS NULL RETURNING id`,
    [id, feld, quelle],
  )
  if (!r.length) return false
  await verbucheBeleg(db, id)
  return true
}

const SYSTEM = `Du ordnest Belege eines deutschen Einzelunternehmens (creaDIG Solutions) einem Geschäftsfeld zu.
Felder: digitalprodukte (Websites, Software, Hosting, Tools, Hardware fürs Büro), beratung (internationale Beratung, Reisen/Messen dafür),
content (eigene Marke, Video, Foto, Werbung), glasfaser (Glasfaser-Dienstleistung, Tiefbau, Messgeräte), sonstiges (allgemeine Betriebskosten).
Antworte NUR mit einer JSON-Liste: [{"id":"...","feld":"...","konfidenz":0.0-1.0}]. Sei ehrlich unsicher: bei Zweifel konfidenz unter 0.8. Erfinde nichts.`

async function kiOrdnet(items: { id: string; haendler: string; kategorie: string; bruttoCent: number }[]): Promise<{ id: string; feld: Geschaeftsfeld }[]> {
  if (!items.length) return []
  try {
    const { text } = await generateText({
      model: "openai/gpt-5.4-mini",
      system: SYSTEM,
      prompt: items.map((i) => `${i.id} | ${i.haendler} | ${i.kategorie} | ${(i.bruttoCent / 100).toFixed(2)} EUR`).join("\n"),
      maxOutputTokens: 1500,
    })
    return leseKiZuordnung(text, items.map((i) => i.id))
  } catch (e) {
    console.error("[finanz-auto] ki", e instanceof Error ? e.message : e)
    return []
  }
}

async function belegeZuordnen(db: Abfrage, mitKi: boolean): Promise<{ verlauf: number; ki: number }> {
  await belegeSchema(db)
  const korb = await db(
    `SELECT id, haendler, kategorie, brutto_cent FROM fin_belege
      WHERE geschaeftsfeld IS NULL AND art = 'beleg' AND haendler <> '' AND NOT archiviert ORDER BY datum DESC NULLS LAST LIMIT ${MAX_BELEGE_JE_LAUF}`,
    [],
  )
  if (!korb.length) return { verlauf: 0, ki: 0 }
  const hist = await db(
    `SELECT lower(haendler) AS h, geschaeftsfeld AS g, count(*) AS c FROM fin_belege
      WHERE geschaeftsfeld IS NOT NULL AND haendler <> '' AND lower(haendler) = ANY($1::text[]) GROUP BY 1,2`,
    [[...new Set(korb.map((k) => String(k.haendler).toLowerCase()))]],
  )
  const je = new Map<string, Record<string, number>>()
  for (const r of hist) je.set(String(r.h), { ...(je.get(String(r.h)) ?? {}), [String(r.g)]: Number(r.c) })

  let verlauf = 0
  const rest: typeof korb = []
  for (const k of korb) {
    const feld = dominantesFeld(je.get(String(k.haendler).toLowerCase()) ?? {})
    if (feld && (await setzeFeld(db, String(k.id), feld, "verlauf"))) verlauf++
    else if (!feld) rest.push(k)
  }

  let ki = 0
  if (mitKi && belegKiBereit() && rest.length) {
    const antworten = await kiOrdnet(rest.map((k) => ({ id: String(k.id), haendler: String(k.haendler), kategorie: String(k.kategorie ?? ""), bruttoCent: Number(k.brutto_cent) })))
    for (const a of antworten) if (await setzeFeld(db, a.id, a.feld, "ki")) ki++
  }
  if (verlauf + ki) await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('beleg_auto_zugeordnet', $1)`, [JSON.stringify({ verlauf, ki })])
  return { verlauf, ki }
}

/** Abbuchungen: gleiche Gegenpartei wie eine frühere Buchung → gleiche Kategorie, Steuersatz und Feld. Ohne Verlauf bleibt es offen. */
async function abbuchungenZuordnen(db: Abfrage): Promise<number> {
  const offen = await ladeAusgehendeBankUmsaetze(db)
  const mitName = offen.filter((u) => u.gegenpartei)
  if (!mitName.length) return 0
  const hist = await db(
    `SELECT DISTINCT ON (lower(gegenpartei)) lower(gegenpartei) AS g, kategorie, ust_satz, geschaeftsfeld
       FROM fin_buchungen WHERE art = 'ausgabe' AND status = 'gebucht' AND storniert_at IS NULL AND gegenpartei IS NOT NULL AND geschaeftsfeld IS NOT NULL
        AND lower(gegenpartei) = ANY($1::text[]) ORDER BY lower(gegenpartei), datum DESC`,
    [[...new Set(mitName.map((u) => (u.gegenpartei as string).toLowerCase()))]],
  )
  const karte = new Map(hist.map((h) => [String(h.g), h]))
  let n = 0
  for (const u of mitName) {
    const h = karte.get((u.gegenpartei as string).toLowerCase())
    if (!h || String(h.geschaeftsfeld) === "privat") continue
    if (await bucheAusgehendenUmsatz(db, u.id, String(h.kategorie), Number(h.ust_satz), String(h.geschaeftsfeld))) n++
  }
  return n
}

/** Zahlungseingänge: nur bei Rechnungsnummer im Verwendungszweck UND exakt dem offenen Rest, ohne jeden Hinweis. */
async function eingaengeZuordnen(db: Abfrage): Promise<number> {
  let n = 0
  for (const u of await ladeOffeneBankUmsaetze(db)) {
    const v = u.vorschlag
    if (!v || u.hinweis || !v.grund.startsWith("Rechnungsnummer") || v.offenCent !== u.bruttoCent) continue
    if ((await bestaetigeZuordnung(db, u.id, v.dokumentId)).ok) n++
  }
  if (n) await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('bank_auto_zugeordnet', $1)`, [JSON.stringify({ eingaenge: n })])
  return n
}

/** `mitKi: false` = nur die schnellen, sicheren Regeln (Verlauf, exakte Bank-Treffer) — für das Laden einer Seite. */
export async function ordneAllesAutomatischZu(db: Abfrage, mitKi = true): Promise<AutoErgebnis> {
  const b = await belegeZuordnen(db, mitKi)
  const bankAusgaben = await abbuchungenZuordnen(db)
  const bankEingaenge = await eingaengeZuordnen(db)
  return { belegeVerlauf: b.verlauf, belegeKi: b.ki, bankAusgaben, bankEingaenge }
}
