import "server-only"

import { createHash, randomBytes } from "node:crypto"

import type { Abfrage } from "@/lib/neon-abfrage"
import {
  addTage,
  berechne,
  DOK_TEXT,
  heuteBerlin,
  steuerModus,
  type DokArt,
  type DokStatus,
  type Entwurf,
  type Kunde,
  type Position,
  type Sprache,
  type SteuerModus,
  type Summen,
} from "@/lib/finanz/auftraege/rechnen"

/**
 * Angebote, Rechnungen, Stornos — ein gemeinsamer Kern in creaDIG Finanz.
 *
 * REGELN, die hier hart durchgesetzt werden (nicht in der Oberfläche):
 *  · Nummern vergibt die Datenbank atomar beim Versand (lückenlos je Art + Jahr).
 *    Ein Entwurf hat keine Nummer und kann verworfen werden.
 *  · Ab Versand ist der Inhalt eingefroren (Prüfsumme). Änderung = neue Version
 *    (Angebot) bzw. Storno + neue Rechnung. Nichts wird gelöscht.
 *  · Jede Rechnung erscheint sofort im Hauptbuch (fin_buchungen, geplant zum
 *    Fälligkeitstag) und wird beim Zahlungseingang gebucht.
 * Schema legt sich selbst an (wie fin_*), Text: scripts/migrations/030-finanz-auftraege.sql.
 */
export const AUFTRAEGE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_leistungen (
    id text PRIMARY KEY,
    titel text NOT NULL,
    beschreibung text NOT NULL DEFAULT '',
    einheit text NOT NULL DEFAULT 'Pauschal',
    preis_cent bigint NOT NULL DEFAULT 0,
    ust_satz int NOT NULL DEFAULT 19 CHECK (ust_satz IN (0,7,19)),
    geschaeftsfeld text NOT NULL DEFAULT 'it',
    aktiv boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS fin_kunden (
    id text PRIMARY KEY,
    daten jsonb NOT NULL,
    schluessel text NOT NULL UNIQUE,
    updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS fin_nummernkreis (
    praefix text NOT NULL,
    jahr int NOT NULL,
    letzte int NOT NULL DEFAULT 0,
    PRIMARY KEY (praefix, jahr))`,
  `CREATE TABLE IF NOT EXISTS fin_dokumente (
    id text PRIMARY KEY,
    art text NOT NULL CHECK (art IN ('angebot','rechnung','storno')),
    status text NOT NULL DEFAULT 'entwurf',
    nummer text,
    version int NOT NULL DEFAULT 1,
    vorgaenger_id text,
    angebot_id text,
    storno_von_id text,
    anzahlung_prozent int,
    sprache text NOT NULL DEFAULT 'de',
    titel text NOT NULL DEFAULT '',
    kunde jsonb NOT NULL DEFAULT '{}'::jsonb,
    datum date NOT NULL DEFAULT CURRENT_DATE,
    gueltig_bis date,
    faellig_am date,
    zahlungsziel_tage int NOT NULL DEFAULT 14,
    leistungszeitraum text NOT NULL DEFAULT '',
    einleitung text NOT NULL DEFAULT '',
    schluss text NOT NULL DEFAULT '',
    rabatt_prozent numeric(5,2) NOT NULL DEFAULT 0,
    geschaeftsfeld text NOT NULL DEFAULT 'it',
    positionen jsonb NOT NULL DEFAULT '[]'::jsonb,
    steuer_modus text,
    summen jsonb,
    absender jsonb,
    pruefsumme text,
    token text UNIQUE,
    mahnstufe int NOT NULL DEFAULT 0,
    versendet_at timestamptz,
    geoeffnet_at timestamptz,
    beantwortet_at timestamptz,
    antwort_name text,
    antwort_text text,
    nachgefasst_at timestamptz,
    bezahlt_am date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE UNIQUE INDEX IF NOT EXISTS fin_dokumente_nummer_idx ON fin_dokumente (art, nummer, version) WHERE nummer IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS fin_dokumente_liste_idx ON fin_dokumente (art, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS fin_dokument_verlauf (
    id bigserial PRIMARY KEY,
    dokument_id text NOT NULL,
    aktion text NOT NULL,
    daten jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS fin_dokument_verlauf_idx ON fin_dokument_verlauf (dokument_id, created_at)`,
  `ALTER TABLE fin_buchungen ADD COLUMN IF NOT EXISTS geschaeftsfeld text`,
  `ALTER TABLE fin_buchungen ADD COLUMN IF NOT EXISTS quelle_ref text`,
  `ALTER TABLE fin_einstellungen ADD COLUMN IF NOT EXISTS firma jsonb NOT NULL DEFAULT '{}'::jsonb`,

  /*
   * GoBD-FESTSCHREIBUNG — unveraenderbar in der Datenbank, nicht nur in der
   * Oberflaeche. Lesbare Fassung: scripts/migrations/030-gobd-festschreibung.sql
   * (dort steht auch, warum die Angebot-Annahme-Ausnahme existiert und warum
   * quelle='fibero' von der Buchungssperre ausgenommen ist).
   */
  `CREATE OR REPLACE FUNCTION fin_dokumente_festschreibung() RETURNS trigger AS $BODY$
   BEGIN
     IF OLD.nummer IS NULL THEN
       RETURN NEW;
     END IF;

     IF OLD.art = 'angebot' AND OLD.status = 'versendet' AND NEW.status = 'angenommen' THEN
       IF NEW.nummer IS DISTINCT FROM OLD.nummer
          OR NEW.kunde IS DISTINCT FROM OLD.kunde
          OR NEW.datum IS DISTINCT FROM OLD.datum
          OR NEW.pruefsumme IS DISTINCT FROM OLD.pruefsumme
          OR NEW.steuer_modus IS DISTINCT FROM OLD.steuer_modus
       THEN
         RAISE EXCEPTION 'fin_dokumente %: festgeschrieben (Nummer %) — bei Annahme duerfen nur Positionen/Summen abweichen', OLD.id, OLD.nummer;
       END IF;
       RETURN NEW;
     END IF;

     IF NEW.nummer IS DISTINCT FROM OLD.nummer
        OR NEW.positionen IS DISTINCT FROM OLD.positionen
        OR NEW.summen IS DISTINCT FROM OLD.summen
        OR NEW.kunde IS DISTINCT FROM OLD.kunde
        OR NEW.datum IS DISTINCT FROM OLD.datum
        OR NEW.pruefsumme IS DISTINCT FROM OLD.pruefsumme
        OR NEW.steuer_modus IS DISTINCT FROM OLD.steuer_modus
     THEN
       RAISE EXCEPTION 'fin_dokumente %: festgeschrieben (Nummer %) — nummer/positionen/summen/kunde/datum/pruefsumme/steuer_modus sind unveraenderbar', OLD.id, OLD.nummer;
     END IF;
     RETURN NEW;
   END;
   $BODY$ LANGUAGE plpgsql`,
  `DROP TRIGGER IF EXISTS trg_fin_dokumente_festschreibung ON fin_dokumente`,
  `CREATE TRIGGER trg_fin_dokumente_festschreibung BEFORE UPDATE ON fin_dokumente
     FOR EACH ROW EXECUTE FUNCTION fin_dokumente_festschreibung()`,
  `CREATE OR REPLACE FUNCTION fin_dokumente_kein_delete() RETURNS trigger AS $BODY$
   BEGIN
     IF OLD.nummer IS NOT NULL THEN
       RAISE EXCEPTION 'fin_dokumente %: festgeschrieben (Nummer %) — loeschen verboten, stattdessen stornieren', OLD.id, OLD.nummer;
     END IF;
     RETURN OLD;
   END;
   $BODY$ LANGUAGE plpgsql`,
  `DROP TRIGGER IF EXISTS trg_fin_dokumente_kein_delete ON fin_dokumente`,
  `CREATE TRIGGER trg_fin_dokumente_kein_delete BEFORE DELETE ON fin_dokumente
     FOR EACH ROW EXECUTE FUNCTION fin_dokumente_kein_delete()`,

  `CREATE OR REPLACE FUNCTION fin_buchungen_festschreibung() RETURNS trigger AS $BODY$
   BEGIN
     IF OLD.status <> 'gebucht' OR OLD.quelle = 'fibero' THEN
       RETURN NEW;
     END IF;
     IF (to_jsonb(NEW) - 'storniert_at') IS DISTINCT FROM (to_jsonb(OLD) - 'storniert_at') THEN
       RAISE EXCEPTION 'fin_buchungen %: gebucht — nur storniert_at darf noch gesetzt werden', OLD.id;
     END IF;
     RETURN NEW;
   END;
   $BODY$ LANGUAGE plpgsql`,
  `DROP TRIGGER IF EXISTS trg_fin_buchungen_festschreibung ON fin_buchungen`,
  `CREATE TRIGGER trg_fin_buchungen_festschreibung BEFORE UPDATE ON fin_buchungen
     FOR EACH ROW EXECUTE FUNCTION fin_buchungen_festschreibung()`,
  `CREATE OR REPLACE FUNCTION fin_buchungen_kein_delete() RETURNS trigger AS $BODY$
   BEGIN
     IF OLD.status = 'gebucht' AND OLD.quelle <> 'fibero' THEN
       RAISE EXCEPTION 'fin_buchungen %: gebucht — loeschen verboten, stattdessen stornieren (storniert_at)', OLD.id;
     END IF;
     RETURN OLD;
   END;
   $BODY$ LANGUAGE plpgsql`,
  `DROP TRIGGER IF EXISTS trg_fin_buchungen_kein_delete ON fin_buchungen`,
  `CREATE TRIGGER trg_fin_buchungen_kein_delete BEFORE DELETE ON fin_buchungen
     FOR EACH ROW EXECUTE FUNCTION fin_buchungen_kein_delete()`,

  `CREATE OR REPLACE FUNCTION fin_nur_insert() RETURNS trigger AS $BODY$
   BEGIN
     RAISE EXCEPTION '% ist ein Verlauf — nur INSERT, kein UPDATE und kein DELETE', TG_TABLE_NAME;
   END;
   $BODY$ LANGUAGE plpgsql`,
  `DROP TRIGGER IF EXISTS trg_fin_dokument_verlauf_nur_insert ON fin_dokument_verlauf`,
  `CREATE TRIGGER trg_fin_dokument_verlauf_nur_insert BEFORE UPDATE OR DELETE ON fin_dokument_verlauf
     FOR EACH ROW EXECUTE FUNCTION fin_nur_insert()`,
  `DROP TRIGGER IF EXISTS trg_fin_protokoll_nur_insert ON fin_protokoll`,
  `CREATE TRIGGER trg_fin_protokoll_nur_insert BEFORE UPDATE OR DELETE ON fin_protokoll
     FOR EACH ROW EXECUTE FUNCTION fin_nur_insert()`,

  /*
   * Phase 6 — Teilzahlungen als eigene Zeilen, nicht als ein Betrag-Feld.
   * Dieselbe Entscheidung wie bei `payments` im Gate-18-Schema (siehe
   * lib/rechnung.ts): „Eine Teilzahlung ist kein Sonderfall, sondern zwei
   * Zeilen." Append-only wie fin_dokument_verlauf/fin_protokoll — ein
   * Zahlungseingang wird storniert durch einen GEGENeintrag, nicht durch
   * Loeschen der Zeile.
   */
  `CREATE TABLE IF NOT EXISTS fin_zahlungen (
    id text PRIMARY KEY,
    dokument_id text NOT NULL,
    datum date NOT NULL,
    cent bigint NOT NULL,
    quelle text NOT NULL DEFAULT 'manuell' CHECK (quelle IN ('manuell','bank')),
    ref text,
    erstellt_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS fin_zahlungen_dokument_idx ON fin_zahlungen (dokument_id)`,
  `DROP TRIGGER IF EXISTS trg_fin_zahlungen_nur_insert ON fin_zahlungen`,
  `CREATE TRIGGER trg_fin_zahlungen_nur_insert BEFORE UPDATE OR DELETE ON fin_zahlungen
     FOR EACH ROW EXECUTE FUNCTION fin_nur_insert()`,

  /*
   * Bank-Import (CSV und camt.053) — jeder Umsatz einmal, ueber eine stabile
   * Referenz (Bankreferenz, sonst eine Pruefsumme aus Datum+Betrag+
   * Verwendungszweck) idempotent. Nicht zugeordnete Umsaetze sind der
   * Eingangskorb dieses Imports.
   */
  `CREATE TABLE IF NOT EXISTS fin_bank_umsaetze (
    id text PRIMARY KEY,
    datum date NOT NULL,
    betrag_cent bigint NOT NULL,
    verwendungszweck text NOT NULL DEFAULT '',
    gegenpartei text,
    quelle text NOT NULL CHECK (quelle IN ('csv','camt053')),
    status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','zugeordnet','ignoriert')),
    zugeordnet_dokument_id text,
    rohdaten jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS fin_bank_umsaetze_status_idx ON fin_bank_umsaetze (status, datum DESC)`,
]

let bereit: Promise<void> | null = null
export async function auftraegeSchema(db: Abfrage): Promise<void> {
  if (!bereit) {
    bereit = (async () => {
      for (const sql of AUFTRAEGE_SCHEMA) await db(sql, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
}

/* ------------------------------------------------------------------------ */
/* Firmendaten (Pflichtangaben)                                              */
/* ------------------------------------------------------------------------ */

export type Firma = {
  name: string
  inhaber: string
  strasse: string
  plzOrt: string
  email: string
  telefon: string
  web: string
  steuernummer: string
  ustId: string
  bank: string
  iban: string
  bic: string
}

export const FIRMA_STANDARD: Firma = {
  name: "creaDIG Solutions",
  inhaber: "Muhammed Emin Akyol",
  strasse: "",
  plzOrt: "",
  email: "",
  telefon: "",
  web: "https://creadig.de",
  steuernummer: "",
  ustId: "",
  bank: "",
  iban: "",
  bic: "",
}

export async function ladeFirma(db: Abfrage): Promise<{ firma: Firma; ustPflichtig: boolean }> {
  await auftraegeSchema(db)
  const [r] = await db(`SELECT firma, ust_pflichtig FROM fin_einstellungen WHERE id = 'haupt'`, [])
  const gespeichert = (r?.firma ?? {}) as Partial<Firma>
  return { firma: { ...FIRMA_STANDARD, ...gespeichert, name: FIRMA_STANDARD.name }, ustPflichtig: r ? Boolean(r.ust_pflichtig) : true }
}

export async function speichereFirma(db: Abfrage, f: Firma): Promise<void> {
  await auftraegeSchema(db)
  await db(`UPDATE fin_einstellungen SET firma = $1::jsonb, updated_at = now() WHERE id = 'haupt'`, [JSON.stringify({ ...f, name: FIRMA_STANDARD.name })])
}

/** Was fehlt, damit eine Rechnung rechtlich vollständig ist (§ 14 Abs. 4 UStG)? */
export function fehlendePflichtangaben(firma: Firma, d: { kunde: Kunde; leistungszeitraum: string; positionen: Position[] }, modus: SteuerModus): string[] {
  const fehlt: string[] = []
  if (!firma.strasse.trim() || !firma.plzOrt.trim()) fehlt.push("Deine Anschrift (Grundlagen)")
  if (!firma.steuernummer.trim() && !firma.ustId.trim()) fehlt.push("Steuernummer oder USt-IdNr. (Grundlagen)")
  if (!firma.iban.trim()) fehlt.push("IBAN (Grundlagen)")
  if (modus === "reverse" && !firma.ustId.trim()) fehlt.push("Deine USt-IdNr. – Pflicht bei Reverse Charge")
  if (!(d.kunde.firma.trim() || d.kunde.name.trim())) fehlt.push("Name oder Firma des Kunden")
  if (!d.kunde.strasse.trim() || !d.kunde.plzOrt.trim()) fehlt.push("Anschrift des Kunden")
  if (!d.leistungszeitraum.trim()) fehlt.push("Leistungsdatum / Leistungszeitraum")
  if (!d.positionen.some((p) => p.titel.trim() && p.preisCent !== 0)) fehlt.push("Mindestens eine Position mit Betrag")
  return fehlt
}

/* ------------------------------------------------------------------------ */
/* Lesen                                                                     */
/* ------------------------------------------------------------------------ */

export type Dokument = Entwurf & {
  id: string
  art: DokArt
  status: DokStatus
  nummer: string | null
  version: number
  vorgaengerId: string | null
  angebotId: string | null
  stornoVonId: string | null
  anzahlungProzent: number | null
  faelligAm: string | null
  steuerModus: SteuerModus | null
  summen: Summen | null
  absender: Firma | null
  pruefsumme: string | null
  token: string | null
  mahnstufe: number
  versendetAt: string | null
  geoeffnetAt: string | null
  beantwortetAt: string | null
  antwortName: string | null
  antwortText: string | null
  nachgefasstAt: string | null
  bezahltAm: string | null
  createdAt: string
}

const SPALTEN = `id, art, status, nummer, version, vorgaenger_id, angebot_id, storno_von_id, anzahlung_prozent, sprache, titel, kunde,
  to_char(datum,'YYYY-MM-DD') AS datum, to_char(gueltig_bis,'YYYY-MM-DD') AS gueltig_bis, to_char(faellig_am,'YYYY-MM-DD') AS faellig_am,
  zahlungsziel_tage, leistungszeitraum, einleitung, schluss, rabatt_prozent, geschaeftsfeld, positionen, steuer_modus, summen, absender,
  pruefsumme, token, mahnstufe, versendet_at, geoeffnet_at, beantwortet_at, antwort_name, antwort_text, nachgefasst_at,
  to_char(bezahlt_am,'YYYY-MM-DD') AS bezahlt_am, created_at`

const t = (v: unknown) => (v === null || v === undefined ? null : String(v))
const iso = (v: unknown) => (v === null || v === undefined ? null : new Date(v as string).toISOString())

function zeile(r: Record<string, unknown>): Dokument {
  return {
    id: String(r.id),
    art: r.art as DokArt,
    status: r.status as DokStatus,
    nummer: t(r.nummer),
    version: Number(r.version),
    vorgaengerId: t(r.vorgaenger_id),
    angebotId: t(r.angebot_id),
    stornoVonId: t(r.storno_von_id),
    anzahlungProzent: r.anzahlung_prozent === null ? null : Number(r.anzahlung_prozent),
    sprache: (r.sprache === "en" ? "en" : r.sprache === "tr" ? "tr" : "de") as Sprache,
    titel: String(r.titel ?? ""),
    kunde: r.kunde as Kunde,
    datum: String(r.datum),
    gueltigBis: t(r.gueltig_bis),
    faelligAm: t(r.faellig_am),
    zahlungszielTage: Number(r.zahlungsziel_tage),
    leistungszeitraum: String(r.leistungszeitraum ?? ""),
    einleitung: String(r.einleitung ?? ""),
    schluss: String(r.schluss ?? ""),
    rabattProzent: Number(r.rabatt_prozent ?? 0),
    geschaeftsfeld: String(r.geschaeftsfeld ?? "it"),
    positionen: (r.positionen ?? []) as Position[],
    steuerModus: (r.steuer_modus ?? null) as SteuerModus | null,
    summen: (r.summen ?? null) as Summen | null,
    absender: (r.absender ?? null) as Firma | null,
    pruefsumme: t(r.pruefsumme),
    token: t(r.token),
    mahnstufe: Number(r.mahnstufe ?? 0),
    versendetAt: iso(r.versendet_at),
    geoeffnetAt: iso(r.geoeffnet_at),
    beantwortetAt: iso(r.beantwortet_at),
    antwortName: t(r.antwort_name),
    antwortText: t(r.antwort_text),
    nachgefasstAt: iso(r.nachgefasst_at),
    bezahltAm: t(r.bezahlt_am),
    createdAt: String(iso(r.created_at)),
  }
}

export async function ladeDokumente(db: Abfrage, arten: DokArt[]): Promise<Dokument[]> {
  await auftraegeSchema(db)
  const r = await db(`SELECT ${SPALTEN} FROM fin_dokumente WHERE art = ANY($1::text[]) AND status <> 'verworfen' ORDER BY created_at DESC LIMIT 1000`, [arten])
  return r.map(zeile)
}

export async function ladeDokument(db: Abfrage, id: string): Promise<Dokument | null> {
  await auftraegeSchema(db)
  const [r] = await db(`SELECT ${SPALTEN} FROM fin_dokumente WHERE id = $1`, [id])
  return r ? zeile(r) : null
}

export async function ladeDokumentPerToken(db: Abfrage, token: string): Promise<Dokument | null> {
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) return null
  await auftraegeSchema(db)
  const [r] = await db(`SELECT ${SPALTEN} FROM fin_dokumente WHERE token = $1 AND status <> 'entwurf' AND status <> 'verworfen'`, [token])
  return r ? zeile(r) : null
}

export async function ladeVerwandte(db: Abfrage, d: Dokument): Promise<Dokument[]> {
  const wurzel = d.angebotId ?? d.id
  const r = await db(
    `SELECT ${SPALTEN} FROM fin_dokumente
      WHERE id <> $1 AND status <> 'verworfen'
        AND (angebot_id = $2 OR id = $2 OR storno_von_id = $1 OR id = $3 OR vorgaenger_id = $1 OR id = $4)
      ORDER BY created_at`,
    [d.id, wurzel, d.stornoVonId, d.vorgaengerId],
  )
  return r.map(zeile)
}

export type VerlaufEintrag = { aktion: string; daten: Record<string, unknown>; at: string }
export async function ladeVerlauf(db: Abfrage, id: string): Promise<VerlaufEintrag[]> {
  const r = await db(`SELECT aktion, daten, created_at FROM fin_dokument_verlauf WHERE dokument_id = $1 ORDER BY created_at DESC LIMIT 200`, [id])
  return r.map((x) => ({ aktion: String(x.aktion), daten: (x.daten ?? {}) as Record<string, unknown>, at: String(iso(x.created_at)) }))
}

export async function verlauf(db: Abfrage, id: string, aktion: string, daten: Record<string, unknown> = {}): Promise<void> {
  await db(`INSERT INTO fin_dokument_verlauf (dokument_id, aktion, daten) VALUES ($1,$2,$3::jsonb)`, [id, aktion, JSON.stringify(daten)])
}

/* ------------------------------------------------------------------------ */
/* Leistungskatalog & Kunden                                                 */
/* ------------------------------------------------------------------------ */

export type Leistung = { id: string; titel: string; beschreibung: string; einheit: string; preisCent: number; ustSatz: number; geschaeftsfeld: string; aktiv: boolean }

export async function ladeLeistungen(db: Abfrage, nurAktiv = false): Promise<Leistung[]> {
  await auftraegeSchema(db)
  const r = await db(`SELECT * FROM fin_leistungen ${nurAktiv ? "WHERE aktiv" : ""} ORDER BY aktiv DESC, titel`, [])
  return r.map((x) => ({
    id: String(x.id),
    titel: String(x.titel),
    beschreibung: String(x.beschreibung ?? ""),
    einheit: String(x.einheit),
    preisCent: Number(x.preis_cent),
    ustSatz: Number(x.ust_satz),
    geschaeftsfeld: String(x.geschaeftsfeld),
    aktiv: Boolean(x.aktiv),
  }))
}

export async function ladeKunden(db: Abfrage): Promise<Kunde[]> {
  await auftraegeSchema(db)
  const r = await db(`SELECT daten FROM fin_kunden ORDER BY updated_at DESC LIMIT 300`, [])
  return r.map((x) => x.daten as Kunde)
}

async function merkeKunde(db: Abfrage, k: Kunde): Promise<void> {
  const schluessel = (k.email.trim() || `${k.firma}|${k.name}`).toLowerCase().trim()
  if (!schluessel || schluessel === "|") return
  await db(
    `INSERT INTO fin_kunden (id, daten, schluessel) VALUES ($1,$2::jsonb,$3)
     ON CONFLICT (schluessel) DO UPDATE SET daten = EXCLUDED.daten, updated_at = now()`,
    [crypto.randomUUID(), JSON.stringify(k), schluessel],
  )
}

/* ------------------------------------------------------------------------ */
/* Schreiben                                                                 */
/* ------------------------------------------------------------------------ */

export async function legeEntwurfAn(db: Abfrage, art: "angebot" | "rechnung", vorlage?: Partial<Entwurf> & { angebotId?: string; anzahlungProzent?: number }): Promise<string> {
  await auftraegeSchema(db)
  const id = crypto.randomUUID()
  const heute = heuteBerlin()
  await db(
    `INSERT INTO fin_dokumente (id, art, sprache, titel, kunde, datum, gueltig_bis, zahlungsziel_tage, leistungszeitraum, einleitung, schluss,
       rabatt_prozent, geschaeftsfeld, positionen, angebot_id, anzahlung_prozent)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16)`,
    [
      id,
      art,
      vorlage?.sprache ?? "de",
      vorlage?.titel ?? "",
      JSON.stringify(vorlage?.kunde ?? {}),
      heute,
      art === "angebot" ? addTage(heute, 30) : null,
      vorlage?.zahlungszielTage ?? 14,
      vorlage?.leistungszeitraum ?? "",
      vorlage?.einleitung ?? "",
      vorlage?.schluss ?? "",
      vorlage?.rabattProzent ?? 0,
      vorlage?.geschaeftsfeld ?? "it",
      JSON.stringify(vorlage?.positionen ?? []),
      vorlage?.angebotId ?? null,
      vorlage?.anzahlungProzent ?? null,
    ],
  )
  await verlauf(db, id, "angelegt", { art, aus: vorlage?.angebotId ?? null })
  return id
}

export async function speichereEntwurf(db: Abfrage, id: string, e: Entwurf): Promise<boolean> {
  const r = await db(
    `UPDATE fin_dokumente SET sprache=$2, titel=$3, kunde=$4::jsonb, datum=$5, gueltig_bis=$6, zahlungsziel_tage=$7, leistungszeitraum=$8,
       einleitung=$9, schluss=$10, rabatt_prozent=$11, geschaeftsfeld=$12, positionen=$13::jsonb, updated_at=now()
     WHERE id=$1 AND status='entwurf' RETURNING id`,
    [id, e.sprache, e.titel, JSON.stringify(e.kunde), e.datum, e.gueltigBis, e.zahlungszielTage, e.leistungszeitraum, e.einleitung, e.schluss, e.rabattProzent, e.geschaeftsfeld, JSON.stringify(e.positionen)],
  )
  return r.length > 0
}

async function naechsteNummer(db: Abfrage, art: DokArt, datum: string): Promise<string> {
  const praefix = art === "angebot" ? "AN" : art === "rechnung" ? "RE" : "SR"
  const jahr = Number(datum.slice(0, 4))
  const [r] = await db(
    `INSERT INTO fin_nummernkreis (praefix, jahr, letzte) VALUES ($1,$2,1)
     ON CONFLICT (praefix, jahr) DO UPDATE SET letzte = fin_nummernkreis.letzte + 1
     RETURNING letzte`,
    [praefix, jahr],
  )
  return `${praefix}-${jahr}-${String(r.letzte).padStart(4, "0")}`
}

function pruefsummeVon(d: Dokument, summen: Summen, absender: Firma, nummer: string): string {
  const inhalt = {
    art: d.art,
    nummer,
    version: d.version,
    datum: d.datum,
    kunde: d.kunde,
    positionen: d.positionen,
    rabatt: d.rabattProzent,
    summen,
    absender,
    texte: [d.titel, d.einleitung, d.schluss, d.leistungszeitraum, d.gueltigBis, d.zahlungszielTage],
  }
  return createHash("sha256").update(JSON.stringify(inhalt)).digest("hex")
}

/**
 * Schreibt ein Dokument fest: Nummer, Steuermodus, Summen, Absender-Schnappschuss,
 * Prüfsumme, Kundenlink. Gibt das festgeschriebene Dokument zurück.
 */
export async function schreibeFest(db: Abfrage, id: string): Promise<{ ok: true; dok: Dokument } | { ok: false; fehler: string[] }> {
  const d = await ladeDokument(db, id)
  if (!d || d.status !== "entwurf") return { ok: false, fehler: ["Nur Entwürfe können versendet werden."] }
  const { firma, ustPflichtig } = await ladeFirma(db)
  const modus = steuerModus(d.kunde, ustPflichtig)
  if (!d.kunde.email?.trim()) return { ok: false, fehler: ["E-Mail-Adresse des Kunden fehlt."] }
  if (d.art !== "angebot") {
    const fehlt = fehlendePflichtangaben(firma, d, modus)
    if (fehlt.length) return { ok: false, fehler: fehlt }
  } else if (!d.positionen.some((p) => p.titel.trim())) {
    return { ok: false, fehler: ["Mindestens eine Position fehlt."] }
  }

  const summen = berechne(d.positionen, d.rabattProzent, modus)
  if (d.art === "rechnung" && summen.bruttoCent <= 0) return { ok: false, fehler: ["Der Rechnungsbetrag muss größer als 0 sein."] }

  const vorgaenger = d.vorgaengerId ? await ladeDokument(db, d.vorgaengerId) : null
  const nummer = vorgaenger?.nummer ?? (await naechsteNummer(db, d.art, d.datum))
  const faellig = d.art === "rechnung" ? addTage(d.datum, d.zahlungszielTage) : null
  const pruefsumme = pruefsummeVon(d, summen, firma, nummer)
  const token = randomBytes(24).toString("base64url")

  const [r] = await db(
    `UPDATE fin_dokumente SET status='versendet', nummer=$2, steuer_modus=$3, summen=$4::jsonb, absender=$5::jsonb, pruefsumme=$6,
       token=$7, faellig_am=$8, versendet_at=now(), updated_at=now()
     WHERE id=$1 AND status='entwurf' RETURNING id`,
    [id, nummer, modus, JSON.stringify(summen), JSON.stringify(firma), pruefsumme, token, faellig],
  )
  if (!r) return { ok: false, fehler: ["Das Dokument wurde inzwischen geändert."] }

  if (vorgaenger) {
    await db(`UPDATE fin_dokumente SET status='ersetzt', updated_at=now() WHERE id=$1 AND status IN ('versendet','aenderung','abgelehnt')`, [vorgaenger.id])
    await verlauf(db, vorgaenger.id, "ersetzt", { durch: id, version: d.version })
  }
  await merkeKunde(db, d.kunde)
  if (d.art === "rechnung") await bucheGeplant(db, { ...d, nummer, faelligAm: faellig, summen })
  await verlauf(db, id, "festgeschrieben", { nummer, pruefsumme, brutto: summen.bruttoCent, modus })
  return { ok: true, dok: (await ladeDokument(db, id))! }
}

/** Offene Forderung ins Hauptbuch: je Steuersatz eine geplante Einnahme am Fälligkeitstag. */
async function bucheGeplant(db: Abfrage, d: Dokument): Promise<void> {
  if (!d.summen || !d.faelligAm) return
  const kunde = d.kunde.firma || d.kunde.name
  for (const g of d.summen.gruppen) {
    if (g.bruttoCent <= 0) continue
    await db(
      `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, gegenpartei, notiz, quelle, quelle_ref, geschaeftsfeld)
       VALUES ($1,'einnahme','geplant',$2,$3,$4,'Projekt / Kunde',$5,$6,'rechnung',$7,$8)
       ON CONFLICT (id) DO NOTHING`,
      [`re-${d.id}-${g.satz}`, d.faelligAm, g.bruttoCent, g.satz, kunde.slice(0, 120), `Rechnung ${d.nummer}`, d.id, d.geschaeftsfeld],
    )
  }
}

export async function neueVersion(db: Abfrage, id: string): Promise<string | null> {
  const d = await ladeDokument(db, id)
  if (!d || d.art !== "angebot" || !["versendet", "aenderung", "abgelehnt"].includes(d.status)) return null
  const neu = crypto.randomUUID()
  await db(
    `INSERT INTO fin_dokumente (id, art, version, vorgaenger_id, sprache, titel, kunde, datum, gueltig_bis, zahlungsziel_tage, leistungszeitraum,
       einleitung, schluss, rabatt_prozent, geschaeftsfeld, positionen)
     SELECT $2, art, version + 1, id, sprache, titel, kunde, CURRENT_DATE, CURRENT_DATE + 30, zahlungsziel_tage, leistungszeitraum,
       einleitung, schluss, rabatt_prozent, geschaeftsfeld, positionen
       FROM fin_dokumente WHERE id = $1`,
    [id, neu],
  )
  await verlauf(db, neu, "angelegt", { version: d.version + 1, aus: id })
  return neu
}

export async function verwerfeEntwurf(db: Abfrage, id: string): Promise<void> {
  await db(`UPDATE fin_dokumente SET status='verworfen', updated_at=now() WHERE id=$1 AND status='entwurf'`, [id])
  await verlauf(db, id, "verworfen")
}

/** Kundenantwort auf ein Angebot (über den Link oder mündlich eingetragen). */
export async function beantworteAngebot(
  db: Abfrage,
  id: string,
  a: { antwort: "angenommen" | "abgelehnt" | "aenderung"; name: string; text: string; gewaehlt?: number[]; quelle: "kunde" | "inhaber"; client?: string },
): Promise<boolean> {
  const d = await ladeDokument(db, id)
  if (!d || d.art !== "angebot" || d.status !== "versendet") return false
  if (a.antwort === "angenommen" && d.gueltigBis && d.gueltigBis < heuteBerlin()) return false

  let positionen = d.positionen
  let summen = d.summen
  if (a.antwort === "angenommen") {
    const wahl = new Set(a.gewaehlt ?? [])
    positionen = d.positionen.map((p, i) => (p.optional ? { ...p, gewaehlt: wahl.has(i) } : p))
    summen = berechne(positionen, d.rabattProzent, d.steuerModus ?? "normal")
  }
  const [r] = await db(
    `UPDATE fin_dokumente SET status=$2, antwort_name=$3, antwort_text=$4, beantwortet_at=now(), positionen=$5::jsonb, summen=$6::jsonb, updated_at=now()
      WHERE id=$1 AND status='versendet' RETURNING id`,
    [id, a.antwort, a.name.slice(0, 120), a.text.slice(0, 2000), JSON.stringify(positionen), JSON.stringify(summen)],
  )
  if (!r) return false
  await verlauf(db, id, a.antwort, {
    name: a.name,
    text: a.text.slice(0, 500),
    quelle: a.quelle,
    pruefsumme: d.pruefsumme,
    gewaehlt: a.gewaehlt ?? [],
    brutto: summen?.bruttoCent,
    client: a.client?.slice(0, 200),
  })
  return true
}

export async function markiereGeoeffnet(db: Abfrage, id: string): Promise<void> {
  const r = await db(`UPDATE fin_dokumente SET geoeffnet_at = now() WHERE id=$1 AND geoeffnet_at IS NULL RETURNING id`, [id])
  if (r.length) await verlauf(db, id, "geoeffnet")
}

/** Rechnung aus angenommenem Angebot. Anzahlung = ein Betrag je Steuersatz; Schlussrechnung zieht Anzahlungen ab. */
export async function rechnungAusAngebot(db: Abfrage, angebotId: string, anzahlungProzent: number | null): Promise<string | null> {
  const a = await ladeDokument(db, angebotId)
  if (!a || a.art !== "angebot" || a.status !== "angenommen" || !a.summen) return null
  const ANZAHLUNG_TEXT: Record<Sprache, { anzahlung: (p: number) => string; abzug: (nr: string) => string }> = {
    de: { anzahlung: (p) => `Anzahlung ${p} %`, abzug: (nr) => `Abzüglich Anzahlung ${nr}` },
    en: { anzahlung: (p) => `Advance payment ${p} %`, abzug: (nr) => `Less advance payment ${nr}` },
    tr: { anzahlung: (p) => `Peşinat %${p}`, abzug: (nr) => `${nr} peşinat mahsubu` },
  }
  const text = ANZAHLUNG_TEXT[a.sprache]
  const bezug = `${DOK_TEXT[a.sprache].angebot} ${a.nummer}`
  const EINLEITUNG_TEXT: Record<Sprache, string> = {
    de: `Gemäß ${bezug} berechnen wir Ihnen folgende Leistungen:`,
    en: `As agreed in ${bezug}, we invoice the following services:`,
    tr: `${bezug} kapsamında aşağıdaki hizmetleri faturalandırıyoruz:`,
  }
  let positionen: Position[]

  if (anzahlungProzent) {
    const p = Math.min(Math.max(Math.round(anzahlungProzent), 1), 99)
    positionen = a.summen.gruppen.map((g) => ({
      titel: text.anzahlung(p),
      beschreibung: `${bezug}${a.titel ? ` – ${a.titel}` : ""}`,
      menge: 1,
      einheit: "Pauschal",
      preisCent: Math.round((g.nettoCent * p) / 100),
      ustSatz: g.satz,
      optional: false,
      gewaehlt: false,
    }))
  } else {
    positionen = a.positionen.filter((p) => !p.optional || p.gewaehlt).map((p) => ({ ...p, optional: false, gewaehlt: false }))
    if (a.rabattProzent > 0) {
      positionen = positionen.map((p) => ({ ...p, preisCent: Math.round(p.preisCent * (1 - a.rabattProzent / 100)) }))
    }
    const anzahlungen = await db(
      `SELECT nummer, summen FROM fin_dokumente WHERE angebot_id=$1 AND art='rechnung' AND anzahlung_prozent IS NOT NULL AND status IN ('versendet','bezahlt')`,
      [angebotId],
    )
    for (const z of anzahlungen) {
      for (const g of ((z.summen as Summen | null)?.gruppen ?? [])) {
        positionen.push({
          titel: text.abzug(String(z.nummer)),
          beschreibung: "",
          menge: 1,
          einheit: "Pauschal",
          preisCent: -g.nettoCent,
          ustSatz: g.satz,
          optional: false,
          gewaehlt: false,
        })
      }
    }
  }

  return legeEntwurfAn(db, "rechnung", {
    sprache: a.sprache,
    titel: a.titel,
    kunde: a.kunde,
    geschaeftsfeld: a.geschaeftsfeld,
    leistungszeitraum: a.leistungszeitraum,
    einleitung: EINLEITUNG_TEXT[a.sprache],
    schluss: "",
    positionen,
    rabattProzent: 0,
    angebotId,
    anzahlungProzent: anzahlungProzent ?? undefined,
  })
}

/* ------------------------------------------------------------------------ */
/* Teilzahlungen (Phase 6) — eine Zahlung ist eine Zeile, kein Betrag-Feld   */
/* ------------------------------------------------------------------------ */

export type Zahlung = { id: string; datum: string; cent: number; quelle: "manuell" | "bank"; ref: string | null }

export async function ladeZahlungen(db: Abfrage, dokumentId: string): Promise<Zahlung[]> {
  const r = await db(`SELECT id, to_char(datum,'YYYY-MM-DD') AS datum, cent, quelle, ref FROM fin_zahlungen WHERE dokument_id = $1 ORDER BY datum, erstellt_at`, [dokumentId])
  return r.map((x) => ({ id: String(x.id), datum: String(x.datum), cent: Number(x.cent), quelle: x.quelle === "bank" ? "bank" : "manuell", ref: x.ref ? String(x.ref) : null }))
}

export async function bezahltCent(db: Abfrage, dokumentId: string): Promise<number> {
  const [r] = await db(`SELECT coalesce(sum(cent), 0) AS s FROM fin_zahlungen WHERE dokument_id = $1`, [dokumentId])
  return Number(r?.s ?? 0)
}

export type Zahlungsstand = { bezahltCent: number; offenCent: number; status: "teilbezahlt" | "bezahlt"; ueberzahlt: boolean }

/**
 * Erfasst einen Zahlungseingang — Teil- oder Restzahlung, manuell oder aus
 * dem Bank-Import (Phase 6). "bezahlt" erst bei Rest ≤ 0 — eine
 * Ueberzahlung zaehlt als bezahlt UND wird gemeldet (Hinweis, kein eigener
 * Status: siehe ueberzahlt im Rueckgabewert). Die geplante Buchung wechselt
 * GENAU EINMAL auf 'gebucht', beim Erreichen von Rest ≤ 0 — nicht bei jeder
 * Teilzahlung — und ist danach unveraenderbar (GoBD-Festschreibung, Phase 1).
 */
export async function erfasseZahlung(
  db: Abfrage,
  dokumentId: string,
  cent: number,
  datum: string,
  quelle: "manuell" | "bank" = "manuell",
  ref: string | null = null,
): Promise<{ ok: true; stand: Zahlungsstand } | { ok: false; fehler: string }> {
  if (!Number.isFinite(cent) || cent <= 0) return { ok: false, fehler: "Der Betrag muss größer als 0 sein." }
  const d = await ladeDokument(db, dokumentId)
  if (!d || d.art !== "rechnung" || !["versendet", "teilbezahlt"].includes(d.status) || !d.summen) {
    return { ok: false, fehler: "Nur eine offene Rechnung kann einen Zahlungseingang erfassen." }
  }

  await db(`INSERT INTO fin_zahlungen (id, dokument_id, datum, cent, quelle, ref) VALUES ($1,$2,$3,$4,$5,$6)`, [crypto.randomUUID(), dokumentId, datum, cent, quelle, ref])
  const bezahlt = await bezahltCent(db, dokumentId)
  const rest = d.summen.bruttoCent - bezahlt
  const neuerStatus: "teilbezahlt" | "bezahlt" = rest <= 0 ? "bezahlt" : "teilbezahlt"

  await db(
    `UPDATE fin_dokumente SET status = $2, bezahlt_am = CASE WHEN $2 = 'bezahlt' THEN $3::date ELSE bezahlt_am END, updated_at = now() WHERE id = $1`,
    [dokumentId, neuerStatus, datum],
  )
  if (neuerStatus === "bezahlt") {
    await db(`UPDATE fin_buchungen SET status='gebucht', datum=$2 WHERE quelle='rechnung' AND quelle_ref=$1 AND storniert_at IS NULL`, [dokumentId, datum])
  }
  await verlauf(db, dokumentId, quelle === "bank" ? "zahlung_bank" : "zahlung", { cent, datum, bezahltGesamt: bezahlt, rest, ref })
  return { ok: true, stand: { bezahltCent: bezahlt, offenCent: rest, status: neuerStatus, ueberzahlt: rest < 0 } }
}

/** Schreibt genau den offenen Rest als eine einzige Zahlung — die bestehende "Als bezahlt markieren"-Oberfläche bleibt ein Klick. */
export async function markiereBezahlt(db: Abfrage, id: string, am: string): Promise<boolean> {
  const d = await ladeDokument(db, id)
  if (!d || !d.summen) return false
  const rest = d.summen.bruttoCent - (await bezahltCent(db, id))
  if (rest <= 0) return false
  const r = await erfasseZahlung(db, id, rest, am, "manuell", null)
  return r.ok
}

/** Storno: neues Dokument mit negativen Beträgen + eigene Nummer; Forderung im Hauptbuch storniert. */
export async function storniere(db: Abfrage, id: string, grund: string): Promise<string | null> {
  const d = await ladeDokument(db, id)
  if (!d || d.art !== "rechnung" || d.status !== "versendet" || !d.summen) return null
  const sid = crypto.randomUUID()
  const nummer = await naechsteNummer(db, "storno", heuteBerlin())
  const positionen = d.positionen.map((p) => ({ ...p, preisCent: -p.preisCent }))
  const summen = berechne(positionen, d.rabattProzent, d.steuerModus ?? "normal")
  const token = randomBytes(24).toString("base64url")
  const STORNO_TEXT: Record<Sprache, (nummer: string, datum: string) => string> = {
    de: (nr, dat) => `Diese Rechnung storniert die Rechnung ${nr} vom ${dat}.`,
    en: (nr, dat) => `This invoice cancels invoice ${nr} dated ${dat}.`,
    tr: (nr, dat) => `Bu fatura, ${dat} tarihli ${nr} numaralı faturayı iptal eder.`,
  }
  await db(
    `INSERT INTO fin_dokumente (id, art, status, nummer, storno_von_id, angebot_id, sprache, titel, kunde, datum, leistungszeitraum, einleitung,
       schluss, rabatt_prozent, geschaeftsfeld, positionen, steuer_modus, summen, absender, token, versendet_at, pruefsumme)
     VALUES ($1,'storno','versendet',$2,$3,$4,$5,$6,$7::jsonb,CURRENT_DATE,$8,$9,'',$10,$11,$12::jsonb,$13,$14::jsonb,$15::jsonb,$16,now(),$17)`,
    [
      sid,
      nummer,
      d.id,
      d.angebotId,
      d.sprache,
      d.titel,
      JSON.stringify(d.kunde),
      d.leistungszeitraum,
      `${STORNO_TEXT[d.sprache](String(d.nummer), d.datum)}${grund ? ` ${grund}` : ""}`,
      d.rabattProzent,
      d.geschaeftsfeld,
      JSON.stringify(positionen),
      d.steuerModus,
      JSON.stringify(summen),
      JSON.stringify(d.absender),
      token,
      createHash("sha256").update(JSON.stringify({ nummer, von: d.nummer, summen })).digest("hex"),
    ],
  )
  await db(`UPDATE fin_dokumente SET status='storniert', updated_at=now() WHERE id=$1`, [id])
  await db(`UPDATE fin_buchungen SET storniert_at=now() WHERE quelle='rechnung' AND quelle_ref=$1 AND storniert_at IS NULL`, [id])
  await verlauf(db, id, "storniert", { durch: sid, nummer, grund })
  await verlauf(db, sid, "festgeschrieben", { nummer, storno_von: d.nummer })
  return sid
}

export async function vermerkeNachfass(db: Abfrage, id: string, stufe: number | null): Promise<void> {
  if (stufe) await db(`UPDATE fin_dokumente SET mahnstufe=$2, nachgefasst_at=now() WHERE id=$1`, [id, stufe])
  else await db(`UPDATE fin_dokumente SET nachgefasst_at=now() WHERE id=$1`, [id])
  await verlauf(db, id, stufe ? `mahnung_${stufe}` : "nachgefasst")
}

/* ------------------------------------------------------------------------ */
/* Abgeleitete Lage (für Listen & Nachfassen)                                */
/* ------------------------------------------------------------------------ */

export function anzeigeStatus(d: Dokument, heute = heuteBerlin()): string {
  if (d.art === "angebot" && d.status === "versendet") {
    if (d.gueltigBis && d.gueltigBis < heute) return "abgelaufen"
    return d.geoeffnetAt ? "geoeffnet" : "versendet"
  }
  if (d.art === "rechnung" && (d.status === "versendet" || d.status === "teilbezahlt") && d.faelligAm && d.faelligAm < heute) return "ueberfaellig"
  return d.status
}

/* ------------------------------------------------------------------------ */
/* Nummernkreis-Pruefung (GoBD: Lueckenlosigkeit je Praefix + Jahr)          */
/* ------------------------------------------------------------------------ */

export type NummernkreisLuecke = {
  praefix: string
  jahr: number
  /** Nummern, die zwischen 1 und der hoechsten vergebenen fehlen — eine echte Luecke. */
  fehlend: number[]
  hoechsteVergeben: number
  /** Stand des Zaehlers (fin_nummernkreis). Groesser als hoechsteVergeben heisst: eine Nummer wurde gezogen, aber nie auf einem Dokument festgeschrieben. */
  zaehlerstand: number
}

/**
 * Sollte im Normalbetrieb immer ein leeres Array liefern — jede Nummer
 * entsteht einmalig in schreibeFest() (`naechsteNummer()`), nie im Entwurf.
 * Ein Treffer bedeutet: etwas hat an fin_dokumente vorbeigeschrieben (Import,
 * Konsole, ein abgebrochener Vorgang zwischen Zaehler und UPDATE) — derselbe
 * Fall, gegen den die Trigger aus scripts/migrations/030-gobd-festschreibung.sql
 * schreibend schuetzen. Diese Funktion prueft stattdessen LESEND, ob er
 * trotzdem passiert ist.
 */
export async function pruefeNummernkreis(db: Abfrage): Promise<NummernkreisLuecke[]> {
  await auftraegeSchema(db)
  const vergeben = await db(
    `SELECT split_part(nummer, '-', 1) AS praefix, split_part(nummer, '-', 2)::int AS jahr,
            array_agg(DISTINCT split_part(nummer, '-', 3)::int ORDER BY split_part(nummer, '-', 3)::int) AS vorhanden
       FROM fin_dokumente WHERE nummer IS NOT NULL GROUP BY 1, 2`,
    [],
  )
  const kreise = await db(`SELECT praefix, jahr, letzte FROM fin_nummernkreis`, [])
  const zaehlerVon = new Map(kreise.map((k) => [`${k.praefix}-${k.jahr}`, Number(k.letzte)]))

  const luecken: NummernkreisLuecke[] = []
  for (const r of vergeben) {
    const vorhanden = (r.vorhanden as unknown[]).map(Number)
    const hoechste = vorhanden.length ? vorhanden[vorhanden.length - 1] : 0
    const fehlend: number[] = []
    for (let i = 1; i <= hoechste; i++) if (!vorhanden.includes(i)) fehlend.push(i)
    const zaehlerstand = zaehlerVon.get(`${r.praefix}-${r.jahr}`) ?? hoechste
    if (fehlend.length > 0 || zaehlerstand > hoechste) {
      luecken.push({ praefix: String(r.praefix), jahr: Number(r.jahr), fehlend, hoechsteVergeben: hoechste, zaehlerstand })
    }
  }
  return luecken.sort((a, b) => a.praefix.localeCompare(b.praefix) || a.jahr - b.jahr)
}
