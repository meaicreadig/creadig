import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { protokolliere } from "@/lib/finanz/store"

/**
 * Automatischer Abgleich fibero → Hauptbuch (fin_buchungen). fibero wird NUR
 * gelesen. Jede fibero-Zeile hat eine feste Buchungs-ID (fibero-inv-/-sub-/-exp-),
 * darum ist jeder Lauf idempotent. Nichts wird gelöscht: archiviert in fibero
 * → storniert im Hauptbuch. Eigene Entscheidungen (Geschäftsfeld, Storno von
 * Hand) überschreibt der Abgleich nie.
 *
 * Beträge wie in fibero selbst: Ausgangsrechnungen `total` = netto (+19 %),
 * Subunternehmer `amount` = brutto (§13b → 0 % USt), Belege brutto + MwSt.
 */
const FIRMA = "firm-creadig"
const ABSTAND_MIN = 10

export const ABGLEICH_SCHEMA = [
  `ALTER TABLE fin_buchungen ADD COLUMN IF NOT EXISTS geschaeftsfeld text`,
  `ALTER TABLE fin_buchungen ADD COLUMN IF NOT EXISTS quelle_ref text`,
  `ALTER TABLE fin_buchungen ADD COLUMN IF NOT EXISTS bezahlt boolean`,
  `CREATE INDEX IF NOT EXISTS fin_buchungen_quelle_idx ON fin_buchungen (quelle, datum DESC)`,
  `CREATE TABLE IF NOT EXISTS fin_abgleich (
    quelle text PRIMARY KEY,
    lauf_at timestamptz NOT NULL DEFAULT now(),
    ergebnis jsonb NOT NULL DEFAULT '{}'::jsonb)`,
]

let schemaBereit: Promise<void> | null = null
async function abgleichSchema(db: Abfrage) {
  if (!schemaBereit) {
    schemaBereit = (async () => {
      for (const s of ABGLEICH_SCHEMA) await db(s, [])
    })().catch((e) => {
      schemaBereit = null
      throw e
    })
  }
  await schemaBereit
}

function zugang() {
  const url = process.env.FIBERO_SUPABASE_URL?.trim().replace(/\/$/, "")
  const key = process.env.FIBERO_SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}` } }
}

type Zeile = Record<string, unknown>
type Teil = { anzahl: number; fehler: string | null }
export type AbgleichErgebnis = { rechnungen: Teil; subunternehmer: Teil; belege: Teil }

async function lade(tabelle: string, felder: string): Promise<Zeile[]> {
  const z = zugang()
  if (!z) throw new Error("Zugang zu fibero fehlt")
  const alle: Zeile[] = []
  for (let von = 0; ; von += 1000) {
    const res = await fetch(`${z.url}/rest/v1/${tabelle}?select=${felder}&firm_id=eq.${FIRMA}&order=id`, {
      headers: { ...z.headers, "Range-Unit": "items", Range: `${von}-${von + 999}` },
      cache: "no-store",
    })
    if (res.status === 401 || res.status === 403) throw new Error("Lesezugriff in fibero nicht freigegeben")
    if (!res.ok) throw new Error(`fibero antwortet nicht (${res.status})`)
    const seite = (await res.json()) as Zeile[]
    alle.push(...seite)
    if (seite.length < 1000) return alle
  }
}

const cent = (v: unknown) => Math.round(Number(v ?? 0) * 100)
const datum = (...werte: unknown[]) => {
  for (const w of werte) if (typeof w === "string" && /^\d{4}-\d{2}-\d{2}/.test(w)) return w.slice(0, 10)
  return null
}
const satz = (bruttoCent: number, ustCent: number) => {
  const netto = bruttoCent - ustCent
  if (ustCent <= 0 || netto <= 0) return 0
  const p = (ustCent / netto) * 100
  return [0, 7, 19].reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a))
}

type Posten = {
  id: string
  art: "einnahme" | "ausgabe"
  datum: string
  brutto_cent: number
  ust_satz: number
  kategorie: string
  gegenpartei: string | null
  notiz: string | null
  geschaeftsfeld: string | null
  quelle_ref: string
  bezahlt: boolean
  storniert_at: string | null
}

async function schreibe(db: Abfrage, posten: Posten[]) {
  for (let i = 0; i < posten.length; i += 400) {
    await db(
      `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, gegenpartei, notiz,
                                  quelle, geschaeftsfeld, quelle_ref, bezahlt, storniert_at)
       SELECT x.id, x.art, 'gebucht', x.datum::date, x.brutto_cent, x.ust_satz, x.kategorie, x.gegenpartei, x.notiz,
              'fibero', x.geschaeftsfeld, x.quelle_ref, x.bezahlt, x.storniert_at::timestamptz
         FROM jsonb_to_recordset($1::jsonb) AS x(id text, art text, datum text, brutto_cent bigint, ust_satz int,
              kategorie text, gegenpartei text, notiz text, geschaeftsfeld text, quelle_ref text, bezahlt boolean, storniert_at text)
       ON CONFLICT (id) DO UPDATE SET
         datum = EXCLUDED.datum, brutto_cent = EXCLUDED.brutto_cent, ust_satz = EXCLUDED.ust_satz,
         kategorie = EXCLUDED.kategorie, gegenpartei = EXCLUDED.gegenpartei, notiz = EXCLUDED.notiz,
         quelle_ref = EXCLUDED.quelle_ref, bezahlt = EXCLUDED.bezahlt,
         geschaeftsfeld = COALESCE(fin_buchungen.geschaeftsfeld, EXCLUDED.geschaeftsfeld),
         storniert_at = COALESCE(fin_buchungen.storniert_at, EXCLUDED.storniert_at)`,
      [JSON.stringify(posten.slice(i, i + 400))],
    )
  }
}

async function teil(arbeit: () => Promise<Posten[]>, db: Abfrage): Promise<Teil> {
  try {
    const posten = (await arbeit()).filter((p) => p.brutto_cent > 0)
    await schreibe(db, posten)
    return { anzahl: posten.length, fehler: null }
  } catch (e) {
    return { anzahl: 0, fehler: e instanceof Error ? e.message : "unbekannter Fehler" }
  }
}

export async function gleicheFiberoAb(db: Abfrage): Promise<AbgleichErgebnis> {
  await abgleichSchema(db)

  const rechnungen = await teil(async () => {
    const zeilen = await lade("invoices", "id,number,team_name,period,total,status,created_at,due_date,archived_at")
    return zeilen
      .filter((r) => r.status !== "Draft")
      .map((r) => {
        const netto = cent(r.total)
        return {
          id: `fibero-inv-${r.id}`,
          art: "einnahme",
          datum: datum(r.created_at) ?? datum(r.due_date) ?? "1970-01-01",
          brutto_cent: Math.round(netto * 1.19),
          ust_satz: 19,
          kategorie: "Glasfaser-Rechnung",
          gegenpartei: r.team_name ? String(r.team_name) : null,
          notiz: r.number ? `Rechnung ${r.number}${r.period ? ` · ${r.period}` : ""}` : null,
          geschaeftsfeld: "glasfaser",
          quelle_ref: `invoice:${r.id}`,
          bezahlt: r.status === "Paid",
          storniert_at: datum(r.archived_at),
        } satisfies Posten
      })
  }, db)

  const subunternehmer = await teil(async () => {
    const zeilen = await lade("incoming_invoices", "id,amount,date,description,invoice_number,period,is_section_13b,is_paid,created_at,archived_at")
    return zeilen.map((r) => ({
      id: `fibero-sub-${r.id}`,
      art: "ausgabe",
      datum: datum(r.date) ?? datum(r.created_at) ?? "1970-01-01",
      brutto_cent: cent(r.amount),
      ust_satz: r.is_section_13b ? 0 : 19,
      kategorie: "Fremdleistung",
      gegenpartei: r.description ? String(r.description) : "Subunternehmer",
      notiz: [r.invoice_number && `Rechnung ${r.invoice_number}`, r.period, r.is_section_13b && "§13b"].filter(Boolean).join(" · ") || null,
      geschaeftsfeld: "glasfaser",
      quelle_ref: `incoming:${r.id}`,
      bezahlt: Boolean(r.is_paid),
      storniert_at: datum(r.archived_at),
    }) satisfies Posten)
  }, db)

  const belege = await teil(async () => {
    const zeilen = await lade("expenses", "id,beleg_datum,haendler,belegnummer,betrag_brutto,mwst_betrag,kategorie,abzugsfaehig,created_at,archived_at")
    return zeilen.map((r) => {
      const brutto = cent(r.betrag_brutto)
      return {
        id: `fibero-exp-${r.id}`,
        art: "ausgabe",
        datum: datum(r.beleg_datum) ?? datum(r.created_at) ?? "1970-01-01",
        brutto_cent: brutto,
        ust_satz: satz(brutto, cent(r.mwst_betrag)),
        kategorie: r.kategorie ? String(r.kategorie) : "Sonstiges",
        gegenpartei: r.haendler ? String(r.haendler) : null,
        notiz: [r.belegnummer && `Beleg ${r.belegnummer}`, r.abzugsfaehig === "nein" && "nicht abzugsfähig"].filter(Boolean).join(" · ") || null,
        geschaeftsfeld: null,
        quelle_ref: `expense:${r.id}`,
        bezahlt: true,
        storniert_at: datum(r.archived_at),
      } satisfies Posten
    })
  }, db)

  const ergebnis = { rechnungen, subunternehmer, belege }
  await db(
    `INSERT INTO fin_abgleich (quelle, lauf_at, ergebnis) VALUES ('fibero', now(), $1::jsonb)
     ON CONFLICT (quelle) DO UPDATE SET lauf_at = now(), ergebnis = EXCLUDED.ergebnis`,
    [JSON.stringify(ergebnis)],
  )
  await protokolliere(db, "abgleich_fibero", ergebnis)
  return ergebnis
}

export type AbgleichStand = { laufAt: string | null; ergebnis: AbgleichErgebnis | null }

export async function abgleichStand(db: Abfrage): Promise<AbgleichStand> {
  await abgleichSchema(db)
  const [r] = await db(`SELECT lauf_at, ergebnis FROM fin_abgleich WHERE quelle = 'fibero'`, [])
  if (!r) return { laufAt: null, ergebnis: null }
  return { laufAt: new Date(String(r.lauf_at)).toISOString(), ergebnis: r.ergebnis as AbgleichErgebnis }
}

/** Gleicht ab, wenn der letzte Lauf älter als ABSTAND_MIN ist. Erster Lauf blockiert, danach im Hintergrund. */
export async function abgleichFaellig(db: Abfrage): Promise<{ sofort: boolean; faellig: boolean }> {
  if (!zugang()) return { sofort: false, faellig: false }
  const stand = await abgleichStand(db)
  if (!stand.laufAt) return { sofort: true, faellig: true }
  return { sofort: false, faellig: Date.now() - new Date(stand.laufAt).getTime() > ABSTAND_MIN * 60_000 }
}
