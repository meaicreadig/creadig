import "server-only"

import { mitSchemaMarker } from "@/lib/finanz/schema-marker"
import { createHash, randomUUID } from "node:crypto"
import { put } from "@vercel/blob"

import type { Abfrage } from "@/lib/neon-abfrage"
import { naechsterUstSatz } from "@/lib/finanz/fibero-abgleich"

/**
 * Belege in creaDIG Finanz. Jede Zeile hat zwei Achsen: Quelle (woher) ×
 * Geschäftsfeld (wofür). Geschäftsfeld NULL = liegt im Eingangskorb.
 *
 * GRUNDSATZ: nichts wird gelöscht. Quelldaten (quelle_*) werden beim Kopieren
 * überschrieben, eigene Entscheidungen (geschaeftsfeld) nie.
 */
export { GESCHAEFTSFELDER, HAND_UPLOAD_MAX_BYTES, HAND_UPLOAD_TYPEN, istGeschaeftsfeld, geschaeftsfeldSchluessel, type Geschaeftsfeld } from "@/lib/finanz/beleg-felder"
import { GESCHAEFTSFELDER, HAND_UPLOAD_MAX_BYTES, HAND_UPLOAD_TYPEN, istGeschaeftsfeld, type Geschaeftsfeld } from "@/lib/finanz/beleg-felder"

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
  /*
   * Phase 3 — eingehende E-Rechnung (UBL/CII, auch aus ZUGFeRD/Factur-X-PDF
   * ausgelesen). Das Original-XML bleibt stehen, unabhaengig davon, was der
   * Mensch nachher an den uebrigen Feldern korrigiert — siehe
   * lib/finanz/e-eingang.ts und "Lesbare Ansicht" in eingangskorb.tsx.
   */
  `ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_format text CHECK (erechnung_format IN ('ubl','cii'))`,
  `ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_xml text`,
  `ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_nummer text`,
  `ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_iban text`,
  `CREATE TABLE IF NOT EXISTS fin_kopierlaeufe (
    id text PRIMARY KEY,
    quelle text NOT NULL,
    soll jsonb NOT NULL DEFAULT '{}'::jsonb,
    ist jsonb,
    stimmt boolean,
    gestartet_at timestamptz NOT NULL DEFAULT now(),
    fertig_at timestamptz)`,
  /*
   * Säulen-Durchlauf — 'it', 'software' und 'ecommerce' waren drei Felder für
   * dieselbe Säule (Digitalprodukte & -dienstleistungen); 'glasfaser',
   * 'privat' und 'sonstiges' bleiben unverändert. Additiv, idempotent: läuft
   * irrelevant oft, verliert keine Buchung ihre Zuordnung. ALTER vor UPDATE,
   * damit die Spalte unabhängig von der Reihenfolge der *_SCHEMA-Arrays
   * existiert (fin_buchungen selbst legt store.ts an, geschaeftsfeld kommt
   * aus fibero-abgleich.ts / auftraege/store.ts hinzu).
   *
   * fin_buchungen: NUR Zeilen, die der GoBD-Festschreibungs-Trigger
   * (trg_fin_buchungen_festschreibung, scripts/migrations/030-gobd-
   * festschreibung.sql) noch ändern lässt — status<>'gebucht' oder
   * quelle='fibero'. Eine bereits gebuchte, nicht-fibero Zeile zu
   * übersetzen würde der Trigger mit einer Exception verweigern (genau das
   * soll er auch): deren geschaeftsfeld bleibt für immer der Wert von
   * damals und wird stattdessen beim Lesen übersetzt, siehe
   * geschaeftsfeldSchluessel() in lib/finanz/beleg-felder.ts.
   */
  `ALTER TABLE fin_buchungen ADD COLUMN IF NOT EXISTS geschaeftsfeld text`,
  `UPDATE fin_buchungen SET geschaeftsfeld = 'digitalprodukte'
     WHERE geschaeftsfeld IN ('it','software','ecommerce') AND (status <> 'gebucht' OR quelle = 'fibero')`,
  `UPDATE fin_belege SET geschaeftsfeld = 'digitalprodukte' WHERE geschaeftsfeld IN ('it','software','ecommerce')`,
  `ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS zuordnung_quelle text`,
]

let bereit: Promise<void> | null = null
export async function belegeSchema(db: Abfrage): Promise<void> {
  if (!bereit) {
    bereit = (async () => {
      await mitSchemaMarker(db, "belege", BELEGE_SCHEMA)
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
  /** Woher die Zuordnung kommt: 'verlauf' / 'ki' = automatisch, 'hand' = von Hand, null = (noch) keine. */
  zuordnungQuelle: string | null
  hatDatei: boolean
  dateiName: string | null
  /** Nur gesetzt, wenn eine eingehende E-Rechnung (UBL/CII, auch aus ZUGFeRD-PDF) erkannt wurde. */
  erechnung: { format: "ubl" | "cii"; nummer: string | null; iban: string | null } | null
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
    zuordnungQuelle: r.zuordnung_quelle ? String(r.zuordnung_quelle) : null,
    hatDatei: r.datei_status === "kopiert",
    dateiName: pfad ? pfad.split("/").pop() ?? pfad : null,
    erechnung:
      r.erechnung_format === "ubl" || r.erechnung_format === "cii"
        ? { format: r.erechnung_format, nummer: r.erechnung_nummer ? String(r.erechnung_nummer) : null, iban: r.erechnung_iban ? String(r.erechnung_iban) : null }
        : null,
  }
}

const SPALTEN = `id, art, to_char(datum,'YYYY-MM-DD') AS datum, haendler, brutto_cent, vorsteuer_cent, kategorie, erechnung_format, erechnung_nummer, erechnung_iban,
  geschaeftsfeld, archiviert, datei_status, datei_quelle_pfad, zuordnung_quelle`

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
    db(`SELECT ${SPALTEN} FROM fin_belege WHERE geschaeftsfeld IS NOT NULL ${filter} ORDER BY zugeordnet_at DESC NULLS LAST LIMIT 400`, p),
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

/**
 * Ein zugeordneter Beleg ist eine Ausgabe — die Buchung entsteht hier, nicht
 * erst beim naechsten Abgleich. Idempotent ueber eine feste ID (beleg-<id>):
 * ein zweiter Aufruf fuer denselben Beleg erzeugt keine zweite Buchung. Die
 * Buchung selbst ist danach so unveraenderbar wie jede andere 'gebucht'-Zeile
 * (siehe scripts/migrations/030-gobd-festschreibung.sql) — eine Korrektur
 * laeuft ueber Storno, nicht ueber ein zweites Mal Zuordnen.
 */
export async function verbucheBeleg(db: Abfrage, belegId: string): Promise<boolean> {
  const [r] = await db(
    `SELECT datum, haendler, brutto_cent, vorsteuer_cent, kategorie, geschaeftsfeld FROM fin_belege WHERE id = $1`,
    [belegId],
  )
  if (!r || !r.geschaeftsfeld || n(r.brutto_cent) <= 0) return false
  const satz = naechsterUstSatz(n(r.brutto_cent), n(r.vorsteuer_cent))
  const ergebnis = await db(
    `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, gegenpartei, quelle, quelle_ref, geschaeftsfeld)
     VALUES ($1,'ausgabe','gebucht',coalesce($2::date, CURRENT_DATE),$3,$4,$5,$6,'beleg',$7,$8)
     ON CONFLICT (id) DO NOTHING RETURNING id`,
    [`beleg-${belegId}`, r.datum, n(r.brutto_cent), satz, String(r.kategorie ?? "") || "Beleg", r.haendler ? String(r.haendler) : null, belegId, r.geschaeftsfeld],
  )
  return ergebnis.length > 0
}

export async function ordneZu(db: Abfrage, ids: string[], feld: Geschaeftsfeld | null): Promise<number> {
  if (ids.length === 0) return 0
  const r = await db(
    `UPDATE fin_belege SET geschaeftsfeld = $1, zugeordnet_at = CASE WHEN $1::text IS NULL THEN NULL ELSE now() END,
        zuordnung_quelle = CASE WHEN $1::text IS NULL THEN NULL ELSE 'hand' END
      WHERE id = ANY($2::text[]) RETURNING id`,
    [feld, ids],
  )
  if (feld) for (const row of r) await verbucheBeleg(db, String(row.id))
  await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('beleg_zugeordnet', $1)`, [JSON.stringify({ ids, feld })])
  return r.length
}

export async function ordneHaendlerZu(db: Abfrage, haendler: string, feld: Geschaeftsfeld): Promise<number> {
  const name = haendler === "(ohne Händler)" ? "" : haendler
  const r = await db(
    `UPDATE fin_belege SET geschaeftsfeld = $1, zugeordnet_at = now(), zuordnung_quelle = 'hand'
      WHERE geschaeftsfeld IS NULL AND haendler = $2 RETURNING id`,
    [feld, name],
  )
  for (const row of r) await verbucheBeleg(db, String(row.id))
  await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('haendler_zugeordnet', $1)`, [
    JSON.stringify({ haendler: name, feld, anzahl: r.length }),
  ])
  return r.length
}

export type BelegExport = {
  id: string
  datum: string | null
  haendler: string
  bruttoCent: number
  kategorie: string
  geschaeftsfeld: Geschaeftsfeld | null
  dateiPfad: string | null
  dateiTyp: string | null
  dateiName: string | null
  erechnungXml: string | null
}

/** Alle Belege eines Jahres mit kopierter Datei — fürs Steuerberater-Paket (Phase 5), nicht auf die Eingangskorb-Seitenbegrenzung beschränkt. */
export async function ladeBelegeFuerExport(db: Abfrage, jahr: string): Promise<BelegExport[]> {
  await belegeSchema(db)
  const r = await db(
    `SELECT id, to_char(datum,'YYYY-MM-DD') AS datum, haendler, brutto_cent, kategorie, geschaeftsfeld,
            datei_pfad, datei_typ, datei_quelle_pfad, erechnung_xml
       FROM fin_belege WHERE datum >= $1 AND datum < $2 AND datei_status = 'kopiert' ORDER BY datum`,
    [`${jahr}-01-01`, `${Number(jahr) + 1}-01-01`],
  )
  return r.map((x) => ({
    id: String(x.id),
    datum: x.datum ? String(x.datum) : null,
    haendler: String(x.haendler ?? ""),
    bruttoCent: n(x.brutto_cent),
    kategorie: String(x.kategorie ?? ""),
    geschaeftsfeld: x.geschaeftsfeld && istGeschaeftsfeld(String(x.geschaeftsfeld)) ? (String(x.geschaeftsfeld) as Geschaeftsfeld) : null,
    dateiPfad: x.datei_pfad ? String(x.datei_pfad) : null,
    dateiTyp: x.datei_typ ? String(x.datei_typ) : null,
    dateiName: x.datei_quelle_pfad ? (String(x.datei_quelle_pfad).split("/").pop() ?? null) : null,
    erechnungXml: x.erechnung_xml ? String(x.erechnung_xml) : null,
  }))
}

export async function dateiVon(db: Abfrage, id: string): Promise<{ pfad: string; typ: string | null; name: string } | null> {
  const [r] = await db(`SELECT datei_pfad, datei_typ, datei_quelle_pfad FROM fin_belege WHERE id = $1 AND datei_status = 'kopiert'`, [id])
  if (!r?.datei_pfad) return null
  return { pfad: String(r.datei_pfad), typ: r.datei_typ ? String(r.datei_typ) : null, name: String(r.datei_quelle_pfad ?? "beleg").split("/").pop() ?? "beleg" }
}

/* ------------------------------------------------------------------------ */
/* Eigener Beleg-Upload (Phase 2) — Handy-Kamera, Drag & Drop                */
/* ------------------------------------------------------------------------ */

/** Ist der private Dateispeicher ueberhaupt eingerichtet? Praesenzpruefung, kein Geheimnis. */
export const belegUploadBereit = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

export type BelegEingabe = {
  datum: string | null
  haendler: string
  bruttoCent: number
  ustSatz: 0 | 7 | 19
  kategorie: string
  geschaeftsfeld: Geschaeftsfeld | null
  notiz: string
  /** Gesetzt, wenn die Datei als UBL/CII erkannt wurde (auch aus einem ZUGFeRD-PDF) — das Original-XML bleibt erhalten. */
  erechnung: { format: "ubl" | "cii"; xml: string; nummer: string | null; iban: string | null } | null
}

export type HochladenErgebnis = { ok: true; id: string; doppelt: boolean } | { ok: false; fehler: string }

/**
 * Datei → privater Vercel Blob (finanz/belege/hand/<sha256>), Pruefsumme als
 * extern_id: ein zweites Hochladen DERSELBEN Datei landet nicht zweimal in
 * fin_belege (UNIQUE (quelle, extern_id)) — derselbe Mechanismus wie beim
 * fibero-Spiegel, nur mit dem Dateiinhalt statt einer externen ID als
 * Schluessel. fibero selbst wird dabei nie beruehrt: dies ist ein eigener
 * Beleg, keine fibero-Zeile.
 */
export async function ladeBelegHoch(db: Abfrage, datei: Blob, eingabe: BelegEingabe): Promise<HochladenErgebnis> {
  if (!belegUploadBereit()) return { ok: false, fehler: "Datei-Speicher ist nicht eingerichtet (BLOB_READ_WRITE_TOKEN fehlt) — optionales Modul, siehe .env.example." }
  if (datei.size === 0) return { ok: false, fehler: "Leere Datei." }
  if (datei.size > HAND_UPLOAD_MAX_BYTES) return { ok: false, fehler: `Datei zu groß (max. ${HAND_UPLOAD_MAX_BYTES / 1024 / 1024} MB).` }
  if (!(HAND_UPLOAD_TYPEN as readonly string[]).includes(datei.type)) return { ok: false, fehler: "Nur PDF, JPG, PNG oder HEIC." }

  await belegeSchema(db)
  const bytes = Buffer.from(await datei.arrayBuffer())
  const sha = createHash("sha256").update(bytes).digest("hex")

  const vorhanden = await db(`SELECT id FROM fin_belege WHERE quelle='hand' AND extern_id=$1`, [sha])
  if (vorhanden.length) return { ok: true, id: String(vorhanden[0].id), doppelt: true }

  const blob = await put(`finanz/belege/hand/${sha}`, bytes, { access: "private", contentType: datei.type, addRandomSuffix: false, allowOverwrite: true })

  const vorsteuerCent = eingabe.ustSatz === 0 ? 0 : Math.round((eingabe.bruttoCent * eingabe.ustSatz) / (100 + eingabe.ustSatz))
  const nettoCent = eingabe.bruttoCent - vorsteuerCent
  const id = randomUUID()
  await db(
    `INSERT INTO fin_belege (id, quelle, extern_id, art, datum, haendler, brutto_cent, netto_cent, vorsteuer_cent, kategorie,
       geschaeftsfeld, zugeordnet_at, datei_status, datei_pfad, datei_sha256, datei_bytes, datei_typ, rohdaten,
       erechnung_format, erechnung_xml, erechnung_nummer, erechnung_iban)
     VALUES ($1,'hand',$2,'beleg',$3,$4,$5,$6,$7,$8,$9,CASE WHEN $9::text IS NULL THEN NULL ELSE now() END,'kopiert',$10,$11,$12,$13,$14::jsonb,$15,$16,$17,$18)`,
    [
      id, sha, eingabe.datum, eingabe.haendler, eingabe.bruttoCent, nettoCent, vorsteuerCent, eingabe.kategorie,
      eingabe.geschaeftsfeld, blob.pathname, sha, bytes.length, datei.type, JSON.stringify({ notiz: eingabe.notiz }),
      eingabe.erechnung?.format ?? null, eingabe.erechnung?.xml ?? null, eingabe.erechnung?.nummer ?? null, eingabe.erechnung?.iban ?? null,
    ],
  )
  if (eingabe.geschaeftsfeld) await verbucheBeleg(db, id)
  await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('beleg_hochgeladen', $1)`, [
    JSON.stringify({ id, haendler: eingabe.haendler, bruttoCent: eingabe.bruttoCent }),
  ])
  return { ok: true, id, doppelt: false }
}
