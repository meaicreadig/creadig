import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Belege in creaDIG Finanz. Jede Zeile hat zwei Achsen: Quelle (woher) ×
 * Geschäftsfeld (wofür). Geschäftsfeld NULL = liegt im Eingangskorb.
 *
 * GRUNDSATZ: nichts wird gelöscht. Quelldaten (quelle_*) werden beim Kopieren
 * überschrieben, eigene Entscheidungen (geschaeftsfeld) nie.
 */
export const GESCHAEFTSFELDER = [
  { key: "glasfaser", label: "Glasfaser-Dienstleistung" },
  { key: "it", label: "IT-Dienstleistung" },
  { key: "software", label: "Software-Abo" },
  { key: "ecommerce", label: "E-Commerce" },
  { key: "privat", label: "Privat / nicht betrieblich" },
  { key: "sonstiges", label: "Sonstiges" },
] as const

export type Geschaeftsfeld = (typeof GESCHAEFTSFELDER)[number]["key"]
export const istGeschaeftsfeld = (v: string): v is Geschaeftsfeld => GESCHAEFTSFELDER.some((g) => g.key === v)

export const BELEGE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_belege (
    id text PRIMARY KEY,
    quelle text NOT NULL,
    extern_id text NOT NULL,
    art text NOT NULL DEFAULT 'beleg' CHECK (art IN ('beleg','lose_datei')),
    datum date,
    haendler text NOT NULL DEFAULT '',
    belegnummer text,
    brutto_cent bigint NOT NULL DEFAULT 0,
    netto_cent bigint NOT NULL DEFAULT 0,
    vorsteuer_cent bigint NOT NULL DEFAULT 0,
    kategorie text NOT NULL DEFAULT '',
    datev_konto text NOT NULL DEFAULT '',
    quelle_status text,
    archiviert boolean NOT NULL DEFAULT false,
    geschaeftsfeld text,
    zugeordnet_at timestamptz,
    datei_quelle_pfad text,
    datei_status text NOT NULL DEFAULT 'keine' CHECK (datei_status IN ('keine','offen','kopiert','fehler')),
    datei_pfad text,
    datei_sha256 text,
    quelle_sha256 text,
    datei_bytes bigint,
    datei_typ text,
    datei_fehler text,
    rohdaten jsonb NOT NULL DEFAULT '{}'::jsonb,
    kopiert_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (quelle, extern_id))`,
  `CREATE INDEX IF NOT EXISTS fin_belege_korb_idx ON fin_belege (geschaeftsfeld, datum DESC)`,
  `CREATE INDEX IF NOT EXISTS fin_belege_datei_idx ON fin_belege (datei_status)`,
  `CREATE TABLE IF NOT EXISTS fin_kopierlaeufe (
    id text PRIMARY KEY,
    quelle text NOT NULL,
    soll jsonb NOT NULL DEFAULT '{}'::jsonb,
    ist jsonb,
    stimmt boolean,
    gestartet_at timestamptz NOT NULL DEFAULT now(),
    fertig_at timestamptz)`,
]

let bereit: Promise<void> | null = null
export async function belegeSchema(db: Abfrage): Promise<void> {
  if (!bereit) {
    bereit = (async () => {
      for (const s of BELEGE_SCHEMA) await db(s, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
}

export type Beleg = {
  id: string
  art: "beleg" | "lose_datei"
  datum: string | null
  haendler: string
  bruttoCent: number
  vorsteuerCent: number
  kategorie: string
  geschaeftsfeld: Geschaeftsfeld | null
  archiviert: boolean
  hatDatei: boolean
  dateiName: string | null
}

export type Kennzahlen = {
  belege: number
  archiviert: number
  mitDatei: number
  dateien: number
  bytes: number
  bruttoCent: number
  vorsteuerCent: number
}

export type Abgleich = { soll: Kennzahlen; ist: Kennzahlen; stimmt: boolean; fertigAt: string | null }

const n = (v: unknown) => Number(v ?? 0)

function zuBeleg(r: Record<string, unknown>): Beleg {
  const pfad = r.datei_quelle_pfad ? String(r.datei_quelle_pfad) : null
  return {
    id: String(r.id),
    art: r.art === "lose_datei" ? "lose_datei" : "beleg",
    datum: r.datum ? String(r.datum) : null,
    haendler: String(r.haendler ?? ""),
    bruttoCent: n(r.brutto_cent),
    vorsteuerCent: n(r.vorsteuer_cent),
    kategorie: String(r.kategorie ?? ""),
    geschaeftsfeld: r.geschaeftsfeld && istGeschaeftsfeld(String(r.geschaeftsfeld)) ? (String(r.geschaeftsfeld) as Geschaeftsfeld) : null,
    archiviert: Boolean(r.archiviert),
    hatDatei: r.datei_status === "kopiert",
    dateiName: pfad ? pfad.split("/").pop() ?? pfad : null,
  }
}

const SPALTEN = `id, art, to_char(datum,'YYYY-MM-DD') AS datum, haendler, brutto_cent, vorsteuer_cent, kategorie,
  geschaeftsfeld, archiviert, datei_status, datei_quelle_pfad`

/** Die Ist-Werte aus Finanz — gleiche Definition wie die Soll-Werte der Quelle. */
export async function istKennzahlen(db: Abfrage, quelle: string): Promise<Kennzahlen> {
  const [r] = await db(
    `SELECT count(*) FILTER (WHERE art='beleg') AS belege,
            count(*) FILTER (WHERE art='beleg' AND archiviert) AS archiviert,
            count(*) FILTER (WHERE art='beleg' AND datei_quelle_pfad IS NOT NULL) AS mit_datei,
            count(*) FILTER (WHERE datei_status='kopiert') AS dateien,
            coalesce(sum(datei_bytes) FILTER (WHERE datei_status='kopiert'),0) AS bytes,
            coalesce(sum(brutto_cent) FILTER (WHERE art='beleg' AND NOT archiviert),0) AS brutto,
            coalesce(sum(vorsteuer_cent) FILTER (WHERE art='beleg' AND NOT archiviert),0) AS vorsteuer
       FROM fin_belege WHERE quelle = $1`,
    [quelle],
  )
  return {
    belege: n(r?.belege),
    archiviert: n(r?.archiviert),
    mitDatei: n(r?.mit_datei),
    dateien: n(r?.dateien),
    bytes: n(r?.bytes),
    bruttoCent: n(r?.brutto),
    vorsteuerCent: n(r?.vorsteuer),
  }
}

export async function letzterAbgleich(db: Abfrage, quelle: string): Promise<Abgleich | null> {
  const [r] = await db(
    `SELECT soll, ist, stimmt, to_char(fertig_at AT TIME ZONE 'Europe/Berlin','DD.MM.YYYY HH24:MI') AS fertig
       FROM fin_kopierlaeufe WHERE quelle = $1 AND ist IS NOT NULL ORDER BY gestartet_at DESC LIMIT 1`,
    [quelle],
  )
  if (!r) return null
  return { soll: r.soll as Kennzahlen, ist: r.ist as Kennzahlen, stimmt: Boolean(r.stimmt), fertigAt: r.fertig ? String(r.fertig) : null }
}

export type BelegeUebersicht = {
  korb: Beleg[]
  korbAnzahl: number
  korbHaendler: { haendler: string; anzahl: number; bruttoCent: number }[]
  zugeordnet: Beleg[]
  felder: { key: Geschaeftsfeld; anzahl: number; bruttoCent: number }[]
  gesamt: number
}

export async function ladeBelege(db: Abfrage, suche: string | null): Promise<BelegeUebersicht> {
  const filter = suche ? `AND (haendler ILIKE $1 OR kategorie ILIKE $1 OR datei_quelle_pfad ILIKE $1)` : ""
  const p = suche ? [`%${suche}%`] : []
  const [korb, korbZahl, haendler, zugeordnet, felder, gesamt] = await Promise.all([
    db(`SELECT ${SPALTEN} FROM fin_belege WHERE geschaeftsfeld IS NULL ${filter} ORDER BY datum DESC NULLS LAST, haendler LIMIT 60`, p),
    db(`SELECT count(*) AS c FROM fin_belege WHERE geschaeftsfeld IS NULL`, []),
    db(
      `SELECT CASE WHEN haendler = '' THEN '(ohne Händler)' ELSE haendler END AS h, count(*) AS c, coalesce(sum(brutto_cent),0) AS b
         FROM fin_belege WHERE geschaeftsfeld IS NULL GROUP BY 1 HAVING count(*) > 1 ORDER BY 2 DESC LIMIT 12`,
      [],
    ),
    db(`SELECT ${SPALTEN} FROM fin_belege WHERE geschaeftsfeld IS NOT NULL ${filter} ORDER BY zugeordnet_at DESC NULLS LAST LIMIT 40`, p),
    db(
      `SELECT geschaeftsfeld AS g, count(*) AS c, coalesce(sum(brutto_cent) FILTER (WHERE NOT archiviert),0) AS b
         FROM fin_belege WHERE geschaeftsfeld IS NOT NULL GROUP BY 1`,
      [],
    ),
    db(`SELECT count(*) AS c FROM fin_belege`, []),
  ])
  return {
    korb: korb.map(zuBeleg),
    korbAnzahl: n(korbZahl[0]?.c),
    korbHaendler: haendler.map((r) => ({ haendler: String(r.h), anzahl: n(r.c), bruttoCent: n(r.b) })),
    zugeordnet: zugeordnet.map(zuBeleg),
    felder: GESCHAEFTSFELDER.map((g) => {
      const r = felder.find((f) => f.g === g.key)
      return { key: g.key, anzahl: n(r?.c), bruttoCent: n(r?.b) }
    }),
    gesamt: n(gesamt[0]?.c),
  }
}

export async function ordneZu(db: Abfrage, ids: string[], feld: Geschaeftsfeld | null): Promise<number> {
  if (ids.length === 0) return 0
  const r = await db(
    `UPDATE fin_belege SET geschaeftsfeld = $1, zugeordnet_at = CASE WHEN $1::text IS NULL THEN NULL ELSE now() END
      WHERE id = ANY($2::text[]) RETURNING id`,
    [feld, ids],
  )
  await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('beleg_zugeordnet', $1)`, [JSON.stringify({ ids, feld })])
  return r.length
}

export async function ordneHaendlerZu(db: Abfrage, haendler: string, feld: Geschaeftsfeld): Promise<number> {
  const name = haendler === "(ohne Händler)" ? "" : haendler
  const r = await db(
    `UPDATE fin_belege SET geschaeftsfeld = $1, zugeordnet_at = now()
      WHERE geschaeftsfeld IS NULL AND haendler = $2 RETURNING id`,
    [feld, name],
  )
  await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('haendler_zugeordnet', $1)`, [
    JSON.stringify({ haendler: name, feld, anzahl: r.length }),
  ])
  return r.length
}

export async function dateiVon(db: Abfrage, id: string): Promise<{ pfad: string; typ: string | null; name: string } | null> {
  const [r] = await db(`SELECT datei_pfad, datei_typ, datei_quelle_pfad FROM fin_belege WHERE id = $1 AND datei_status = 'kopiert'`, [id])
  if (!r?.datei_pfad) return null
  return { pfad: String(r.datei_pfad), typ: r.datei_typ ? String(r.datei_typ) : null, name: String(r.datei_quelle_pfad ?? "beleg").split("/").pop() ?? "beleg" }
}
