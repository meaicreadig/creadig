import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import type { Art, Buchung, Einstellungen, Frist, FristArt, Status, Wiederholung } from "@/lib/finanz/rechnen"

/**
 * Die Finanzabteilung legt ihr Schema selbst an (additiv, idempotent) — wie
 * der Motor, weil die Produktions-DATABASE_URL nicht von aussen migriert
 * werden kann. Gleicher Text: scripts/migrations/029-finanz.sql.
 *
 * GRUNDSATZ: Nichts wird gelöscht. Eine falsche Buchung wird storniert und
 * bleibt sichtbar; jede Änderung landet im Protokoll.
 */
export const FINANZ_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_buchungen (
    id text PRIMARY KEY,
    art text NOT NULL CHECK (art IN ('einnahme','ausgabe')),
    status text NOT NULL DEFAULT 'gebucht' CHECK (status IN ('gebucht','geplant')),
    datum date NOT NULL,
    brutto_cent bigint NOT NULL CHECK (brutto_cent > 0),
    ust_satz int NOT NULL DEFAULT 19 CHECK (ust_satz IN (0,7,19)),
    kategorie text NOT NULL,
    gegenpartei text,
    notiz text,
    wiederholung text NOT NULL DEFAULT 'keine' CHECK (wiederholung IN ('keine','monatlich','quartal','jaehrlich')),
    quelle text NOT NULL DEFAULT 'manuell',
    storniert_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS fin_buchungen_datum_idx ON fin_buchungen (datum DESC)`,
  `CREATE TABLE IF NOT EXISTS fin_einstellungen (
    id text PRIMARY KEY,
    kontostand_cent bigint NOT NULL DEFAULT 0,
    kontostand_am date NOT NULL DEFAULT CURRENT_DATE,
    est_quote int NOT NULL DEFAULT 30 CHECK (est_quote BETWEEN 0 AND 60),
    ust_pflichtig boolean NOT NULL DEFAULT true,
    ust_rhythmus text NOT NULL DEFAULT 'quartal' CHECK (ust_rhythmus IN ('monatlich','quartal')),
    ust_bezahlt_bis date NOT NULL DEFAULT (date_trunc('quarter', CURRENT_DATE) - interval '1 day')::date,
    updated_at timestamptz NOT NULL DEFAULT now())`,
  /* Phase 6/9 — letzter aus einem Bank-Import gelesener Saldo, ein Vorschlag fürs Einstellungen-Formular, nie automatisch übernommen. */
  `ALTER TABLE fin_einstellungen ADD COLUMN IF NOT EXISTS bank_saldo_cent bigint`,
  `ALTER TABLE fin_einstellungen ADD COLUMN IF NOT EXISTS bank_saldo_am date`,
  `CREATE TABLE IF NOT EXISTS fin_fristen (
    id text PRIMARY KEY,
    titel text NOT NULL,
    art text NOT NULL CHECK (art IN ('ust','est','sonstig')),
    faellig date NOT NULL,
    periode_ende date,
    betrag_cent bigint,
    erledigt_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS fin_protokoll (
    id bigserial PRIMARY KEY,
    aktion text NOT NULL,
    daten jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `INSERT INTO fin_einstellungen (id) VALUES ('haupt') ON CONFLICT (id) DO NOTHING`,
]

let schemaBereit: Promise<void> | null = null

export async function finanzDb(): Promise<Abfrage | null> {
  const abfrage = neonAbfrage()
  if (!abfrage) return null
  if (!schemaBereit) {
    schemaBereit = (async () => {
      for (const sql of FINANZ_SCHEMA) await abfrage(sql, [])
    })().catch((e) => {
      schemaBereit = null
      throw e
    })
  }
  await schemaBereit
  return abfrage
}

const zahl = (v: unknown) => Number(v ?? 0)
const text = (v: unknown) => (v === null || v === undefined ? null : String(v))

export async function ladeAlles(db: Abfrage): Promise<{
  einstellungen: Einstellungen
  buchungen: Buchung[]
  fristen: Frist[]
}> {
  const [e] = await db(
    `SELECT kontostand_cent, to_char(kontostand_am,'YYYY-MM-DD') AS kontostand_am, est_quote, ust_pflichtig,
            ust_rhythmus, to_char(ust_bezahlt_bis,'YYYY-MM-DD') AS ust_bezahlt_bis,
            bank_saldo_cent, to_char(bank_saldo_am,'YYYY-MM-DD') AS bank_saldo_am
       FROM fin_einstellungen WHERE id = 'haupt'`,
    [],
  )
  const b = await db(
    `SELECT id, art, status, to_char(datum,'YYYY-MM-DD') AS datum, brutto_cent, ust_satz, kategorie,
            gegenpartei, notiz, wiederholung, storniert_at IS NOT NULL AS storniert,
            to_jsonb(fin_buchungen) -> 'abzug_prozent' AS abzug_prozent,
            to_jsonb(fin_buchungen) -> 'afa_jahre' AS afa_jahre
       FROM fin_buchungen ORDER BY datum DESC, created_at DESC LIMIT 5000`,
    [],
  )
  const f = await db(
    `SELECT id, titel, art, to_char(faellig,'YYYY-MM-DD') AS faellig, to_char(periode_ende,'YYYY-MM-DD') AS periode_ende,
            betrag_cent, erledigt_at IS NOT NULL AS erledigt
       FROM fin_fristen ORDER BY faellig ASC`,
    [],
  )
  return {
    einstellungen: {
      kontostandCent: zahl(e?.kontostand_cent),
      kontostandAm: String(e?.kontostand_am),
      estQuote: zahl(e?.est_quote),
      ustPflichtig: Boolean(e?.ust_pflichtig),
      ustRhythmus: e?.ust_rhythmus === "monatlich" ? "monatlich" : "quartal",
      ustBezahltBis: String(e?.ust_bezahlt_bis),
      bankSaldoCent: e?.bank_saldo_cent === null || e?.bank_saldo_cent === undefined ? null : zahl(e.bank_saldo_cent),
      bankSaldoAm: e?.bank_saldo_am ? String(e.bank_saldo_am) : null,
    },
    buchungen: b.map((r) => ({
      id: String(r.id),
      art: r.art as Art,
      status: r.status as Status,
      datum: String(r.datum),
      bruttoCent: zahl(r.brutto_cent),
      ustSatz: zahl(r.ust_satz),
      kategorie: String(r.kategorie),
      gegenpartei: text(r.gegenpartei),
      notiz: text(r.notiz),
      wiederholung: r.wiederholung as Wiederholung,
      storniert: Boolean(r.storniert),
      abzugProzent: r.abzug_prozent === null || r.abzug_prozent === undefined ? null : Number(r.abzug_prozent),
      afaJahre: r.afa_jahre === null || r.afa_jahre === undefined ? null : Number(r.afa_jahre),
    })),
    fristen: f.map((r) => ({
      id: String(r.id),
      titel: String(r.titel),
      art: r.art as FristArt,
      faellig: String(r.faellig),
      periodeEnde: text(r.periode_ende),
      betragCent: r.betrag_cent === null ? null : zahl(r.betrag_cent),
      erledigt: Boolean(r.erledigt),
    })),
  }
}

/** Legt die Pflichtfristen an, die noch fehlen. Feste Kennung → keine Doppel. */
export async function sichereFristen(db: Abfrage, soll: Frist[]): Promise<void> {
  for (const f of soll) {
    await db(
      `INSERT INTO fin_fristen (id, titel, art, faellig, periode_ende) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [f.id, f.titel, f.art, f.faellig, f.periodeEnde],
    )
  }
}

export async function protokolliere(db: Abfrage, aktion: string, daten: Record<string, unknown>): Promise<void> {
  await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ($1, $2::jsonb)`, [aktion, JSON.stringify(daten)])
}
