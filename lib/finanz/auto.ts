import "server-only"

import { get } from "@vercel/blob"
import { generateText } from "ai"

import type { Abfrage } from "@/lib/neon-abfrage"
import { ladeFiberoDatei } from "@/lib/finanz/kopierlauf-fibero"
import { bestaetigeZuordnung, bucheAusgehendenUmsatz, ladeAusgehendeBankUmsaetze, ladeOffeneBankUmsaetze } from "@/lib/finanz/bank-abgleich"
import { GESCHAEFTSFELDER, belegeSchema, verbucheBeleg, type Geschaeftsfeld } from "@/lib/finanz/belege"
import { belegKiBereit, leseBelegAus } from "@/lib/finanz/beleg-ki"

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
content (eigene Marke, Video, Foto, Werbung), glasfaser (Glasfaser-Dienstleistung, Tiefbau, Messgeräte, Fahrzeug/Tanken/Werkzeug für Baustellen), sonstiges (allgemeine Betriebskosten),
privat (offensichtlich private Ausgaben: Lebensmittel-Wocheneinkauf, Kleidung, Freizeit, Familie — nur vorschlagen, nie sicher).
Antworte NUR mit einer JSON-Liste: [{"id":"...","feld":"...","konfidenz":0.0-1.0,"grund":"max 10 Wörter"}] — für JEDE id eine Zeile. Sei ehrlich unsicher: bei Zweifel konfidenz unter 0.8. Erfinde nichts.`

/** Unsichere KI-Antworten (inkl. „privat“) werden als Vorschlag am Beleg gespeichert — ein Klick übernimmt ihn. */
async function speichereVorschlaege(db: Abfrage, text: string, ids: readonly string[]) {
  const a = text.indexOf("[")
  const b = text.lastIndexOf("]")
  if (a < 0 || b <= a) return
  try {
    const roh = JSON.parse(text.slice(a, b + 1)) as { id?: unknown; feld?: unknown; konfidenz?: unknown; grund?: unknown }[]
    const alle = GESCHAEFTSFELDER.map((g) => g.key as string)
    for (const r of roh) {
      const id = String(r.id)
      if (!ids.includes(id) || !alle.includes(String(r.feld))) continue
      const konfidenz = Math.max(0, Math.min(1, Number(r.konfidenz) || 0))
      if (konfidenz >= AUTO_SCHWELLE && String(r.feld) !== "privat") continue
      await db(`UPDATE fin_belege SET ki_vorschlag = $2::jsonb WHERE id = $1 AND geschaeftsfeld IS NULL`, [
        id,
        JSON.stringify({ feld: String(r.feld), konfidenz, grund: typeof r.grund === "string" ? r.grund.slice(0, 140) : null }),
      ])
    }
  } catch {
    /* Vorschläge sind optional */
  }
}

async function kiOrdnet(db: Abfrage, items: { id: string; haendler: string; kategorie: string; bruttoCent: number }[]): Promise<{ id: string; feld: Geschaeftsfeld }[]> {
  if (!items.length) return []
  try {
    const { text } = await generateText({
      model: "openai/gpt-5.4-mini",
      system: SYSTEM,
      prompt: items.map((i) => `${i.id} | ${i.haendler} | ${i.kategorie} | ${(i.bruttoCent / 100).toFixed(2)} EUR`).join("\n"),
      maxOutputTokens: 2500,
    })
    await speichereVorschlaege(db, text, items.map((i) => i.id))
    return leseKiZuordnung(text, items.map((i) => i.id))
  } catch (e) {
    console.error("[finanz-auto] ki", e instanceof Error ? e.message : e)
    return []
  }
}

let spaltenBereit: Promise<unknown> | null = null
async function kiSpalten(db: Abfrage) {
  if (!spaltenBereit) {
    spaltenBereit = db(`ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS ki_gelesen_at timestamptz, ADD COLUMN IF NOT EXISTS ki_vorschlag jsonb`, []).then(
      async () => db(`ALTER TABLE fin_bank_umsaetze ADD COLUMN IF NOT EXISTS ki_vorschlag jsonb`, []).catch(() => null),
      (e) => {
        spaltenBereit = null
        throw e
      },
    )
  }
  await spaltenBereit
}

const BELEGE_LESEN_JE_LAUF = 8

/**
 * Belege ohne Händler und Betrag (z. B. aus fibero, wo das Auslesen damals scheiterte):
 * Datei holen, KI liest Händler/Betrag/Datum/Kategorie aus. Jeder Beleg wird nur einmal
 * versucht (ki_gelesen_at), damit unlesbare Dateien keine Kosten im Kreis erzeugen.
 */
export async function liesLeereBelegeAus(db: Abfrage, max = BELEGE_LESEN_JE_LAUF): Promise<number> {
  if (!belegKiBereit()) return 0
  await belegeSchema(db)
  await kiSpalten(db)
  const leer = await db(
    `SELECT id, quelle, datei_pfad, datei_typ, coalesce(datei_quelle_pfad, rohdaten->>'bild_pfad') AS quellpfad
       FROM fin_belege
      WHERE geschaeftsfeld IS NULL AND art = 'beleg' AND NOT archiviert AND haendler = '' AND ki_gelesen_at IS NULL
        AND (datei_pfad IS NOT NULL OR coalesce(datei_quelle_pfad, rohdaten->>'bild_pfad') IS NOT NULL)
      ORDER BY datum DESC NULLS LAST LIMIT $1`,
    [max],
  )
  let gelesen = 0
  for (const r of leer) {
    const id = String(r.id)
    await db(`UPDATE fin_belege SET ki_gelesen_at = now() WHERE id = $1`, [id])
    try {
      let datei: { bytes: Buffer; typ: string } | null = null
      if (r.datei_pfad) {
        const blob = await get(String(r.datei_pfad), { access: "private" }).catch(() => null)
        if (blob?.stream) {
          datei = { bytes: Buffer.from(await new Response(blob.stream).arrayBuffer()), typ: String(r.datei_typ ?? blob.blob.contentType ?? "application/pdf") }
        }
      }
      if (!datei && r.quellpfad && r.quelle === "fibero") datei = await ladeFiberoDatei(String(r.quellpfad))
      if (!datei) continue
      const v = await leseBelegAus(datei.bytes, datei.typ)
      if (!v?.haendler) continue
      const brutto = v.bruttoCent ?? 0
      const satz = v.ustSatz ?? 19
      const netto = Math.round(brutto / (1 + satz / 100))
      await db(
        `UPDATE fin_belege SET haendler = $2, brutto_cent = CASE WHEN brutto_cent = 0 THEN $3 ELSE brutto_cent END,
                netto_cent = CASE WHEN coalesce(netto_cent,0) = 0 THEN $4 ELSE netto_cent END,
                vorsteuer_cent = CASE WHEN coalesce(vorsteuer_cent,0) = 0 THEN $5 ELSE vorsteuer_cent END,
                datum = coalesce(datum, $6::date), kategorie = CASE WHEN coalesce(kategorie,'') = '' THEN $7 ELSE kategorie END
          WHERE id = $1 AND haendler = ''`,
        [id, v.haendler, brutto, netto, brutto - netto, v.datum, v.kategorie ?? ""],
      )
      gelesen++
    } catch (e) {
      console.error("[finanz-auto] lesen", id, e instanceof Error ? e.message : e)
    }
  }
  if (gelesen) await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('beleg_ki_ausgelesen', $1)`, [JSON.stringify({ gelesen })])
  return gelesen
}

async function belegeZuordnen(db: Abfrage, mitKi: boolean): Promise<{ verlauf: number; ki: number }> {
  await belegeSchema(db)
  await kiSpalten(db)
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
    const antworten = await kiOrdnet(db, rest.map((k) => ({ id: String(k.id), haendler: String(k.haendler), kategorie: String(k.kategorie ?? ""), bruttoCent: Number(k.brutto_cent) })))
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
  if (mitKi) await liesLeereBelegeAus(db).catch((e) => console.error("[finanz-auto] auslesen", e instanceof Error ? e.message : e))
  const b = await belegeZuordnen(db, mitKi)
  const bankAusgaben = await abbuchungenZuordnen(db)
  const bankEingaenge = await eingaengeZuordnen(db)
  return { belegeVerlauf: b.verlauf, belegeKi: b.ki, bankAusgaben, bankEingaenge }
}
