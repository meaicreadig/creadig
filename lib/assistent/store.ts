import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import { protokolliereFaden } from "@/lib/zentrale/faden-protokoll"

/** Legt sich selbst an (additiv), weil die Produktions-DATABASE_URL "Sensitive" ist. */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS assistent_nachrichten (
    id text PRIMARY KEY,
    rolle text NOT NULL CHECK (rolle IN ('user','assistant')),
    text text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS assistent_nachrichten_zeit_idx ON assistent_nachrichten (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS assistent_freigaben (
    id text PRIMARY KEY,
    art text NOT NULL CHECK (art IN ('mail','aufgabe','termin','linkedin','kapital','notiz')),
    titel text NOT NULL,
    inhalt text NOT NULL DEFAULT '',
    empfaenger text,
    betreff text,
    status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','freigegeben','verworfen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    erledigt_at timestamptz)`,
  `CREATE INDEX IF NOT EXISTS assistent_freigaben_offen_idx ON assistent_freigaben (created_at DESC) WHERE status = 'offen'`,
  `ALTER TABLE assistent_freigaben ADD COLUMN IF NOT EXISTS quelle text`,
  `ALTER TABLE assistent_freigaben ADD COLUMN IF NOT EXISTS agent text`,
  `CREATE INDEX IF NOT EXISTS assistent_freigaben_quelle_idx ON assistent_freigaben (quelle)`,
  `ALTER TABLE assistent_freigaben ADD COLUMN IF NOT EXISTS bild_pfad text`,
  `ALTER TABLE assistent_freigaben ADD COLUMN IF NOT EXISTS extra jsonb NOT NULL DEFAULT '{}'::jsonb`,
  `CREATE TABLE IF NOT EXISTS assistent_linkedin (
    id text PRIMARY KEY,
    access_token text NOT NULL,
    person_urn text NOT NULL,
    name text,
    expires_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS assistent_laeufe (
    id text PRIMARY KEY,
    agent text NOT NULL,
    ergebnis text NOT NULL DEFAULT '',
    anzahl int NOT NULL DEFAULT 0,
    fehler text,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS assistent_laeufe_agent_idx ON assistent_laeufe (agent, created_at DESC)`,
  `ALTER TABLE assistent_laeufe ADD COLUMN IF NOT EXISTS dauer_ms int`,
  `CREATE TABLE IF NOT EXISTS assistent_rat (
    id text PRIMARY KEY,
    woche text NOT NULL UNIQUE,
    protokoll jsonb NOT NULL,
    antwort text,
    created_at timestamptz NOT NULL DEFAULT now(),
    beantwortet_at timestamptz)`,
  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistent_freigaben_art_check'
                    AND pg_get_constraintdef(oid) LIKE '%loeschen%') THEN
       ALTER TABLE assistent_freigaben DROP CONSTRAINT IF EXISTS assistent_freigaben_art_check;
       ALTER TABLE assistent_freigaben ADD CONSTRAINT assistent_freigaben_art_check
         CHECK (art IN ('mail','aufgabe','termin','linkedin','kapital','notiz','loeschen'));
     END IF;
   END $$`,
  /* Sperre je Agent: Cron und Seitenaufruf starten denselben Agenten nie gleichzeitig. */
  `CREATE TABLE IF NOT EXISTS assistent_sperren (
    name text PRIMARY KEY,
    bis timestamptz NOT NULL,
    seit timestamptz NOT NULL DEFAULT now())`,
]

/**
 * Interne Arbeit (Aufgaben, Notizen) läuft im Hintergrund über die Koordination.
 * Im Freigabe-Eingang erscheint sie nur, wenn die Koordination sie Emin vorlegt
 * (extra.koordination.beiEmin) – dann mit fertiger Vorlage. Alles andere, was nach
 * außen geht oder löscht, ist immer sichtbar.
 */
export const INTERNE_ARTEN = ["aufgabe", "notiz"] as const
const NUR_SICHTBARE = `(art NOT IN ('aufgabe','notiz') OR coalesce(extra->'koordination'->>'beiEmin', '') = 'true')`

export const FREIGABE_ARTEN = ["mail", "aufgabe", "termin", "linkedin", "kapital", "notiz", "loeschen"] as const
export type FreigabeArt = (typeof FREIGABE_ARTEN)[number]

export type Nachricht = { id: string; rolle: "user" | "assistant"; text: string; zeit: string }
export type Freigabe = {
  id: string
  art: FreigabeArt
  titel: string
  inhalt: string
  empfaenger: string | null
  betreff: string | null
  status: "offen" | "freigegeben" | "verworfen"
  agent: string | null
  bildPfad: string | null
  extra: FreigabeExtra
  zeit: string
}

/** Zusatzwissen je Entwurf – z. B. warum die Redaktion dieses Thema gewählt hat. */
export type FreigabeExtra = {
  webcheck?: { befunde: string[]; https: boolean; mobil: boolean; ladezeitMs: number | null } | null
  warum?: string
  bezug?: string
  alt?: string
  postUrn?: string
  fehler?: string
  /** Mailversand über Resend */
  gesendetAt?: string
  mailId?: string
  antwortAt?: string
  /** Welche Mail den Antwort-Knopf ausgelöst hat und welche Nachfass-Mails dabei verworfen wurden (für Rückgängig). */
  antwortQuelle?: string
  antwortVerworfen?: string[]
  /** Automatische Suche der Kontaktadresse auf der Firmen-Webseite */
  adressSuche?: "gefunden" | "keine"
  /** Produkt, das die Verkaufsmail mit Webseiten-Bild vorstellt. */
  produkt?: "fibero" | "stammo" | "creadig"
  /** Nachfass-Kette: Stufe 1/2, Vorgänger-Mail, angelegte Nachfass-Freigabe */
  stufe?: number
  vorgaenger?: string
  nachfassId?: string
  /** Löschauftrag: betroffene Firmen */
  orgIds?: string[]
  /** Kampagnen-Versand (Mail Studio): eine Zeile je Empfänger, damit Antworten zuordenbar sind — nie Nachfass-Kette. */
  kampagneId?: string
  zustellungId?: string
  /** Instagram-Beitrag aus derselben Redaktions-Freigabe */
  instagramId?: string
  instagramUrl?: string | null
  /** Freigegebene Kapitalchance = Vorhaben mit Stufe und KI-Antragsskizze */
  antrag?: { stufe: KapitalStufe; seit: string; skizze?: string }
  /** Interne Vorarbeit der Koordination (Abteilung, Ergebnis, ob automatisch erledigt, ob Emin vorgelegt). */
  koordination?: { abteilung: string; ergebnis: string; auftragId: string; automatisch?: boolean; beiEmin?: boolean }
  /** Von der Koordination fälschlich geschlossen und Emin wieder vorgelegt (Zeitpunkt). */
  zurueckgeholt?: string
  /** Emin hat den Entwurf vor der Freigabe geändert – Messgröße für die Qualität des Agenten. */
  bearbeitet?: boolean
  /** Bilgi Bekçisi: Behauptung, die nicht zu den Firmenfakten passt. */
  wissen?: string
  /** Recht & Compliance: Prüfergebnis, von Emin bestätigte Rechtsgrundlage (Zeitpunkt), Widerspruch. */
  recht?: string
  rechtOk?: boolean
  basisBestaetigt?: string
  antwortArt?: string
  widerspruch?: boolean
  automatisch?: string
  /** Redaktionsplan LinkedIn: Säule, Kanal, geplanter Zeitpunkt, erster Kommentar mit UTM-Link. */
  saeule?: string
  ziel?: "firma" | "inhaber"
  geplant?: string | null
  kommentar?: string
  /** Freigegeben, wartet auf den geplanten Zeitpunkt. */
  wartet?: { kanal: "firma" | "inhaber" | null; instagram: boolean; text: string; versuche?: number } | null
}

export const KAPITAL_STUFEN = ["pruefen", "schreiben", "eingereicht", "bewilligt", "abgelehnt"] as const
export type KapitalStufe = (typeof KAPITAL_STUFEN)[number]

export type Lauf = { agent: string; ergebnis: string; anzahl: number; fehler: string | null; zeit: string }

/** Schutz gegen Kreditverbrauch: so viele Fragen pro Tag. */
export const TAGESLIMIT = 60

let bereit: Promise<void> | null = null

export async function assistentDb(): Promise<Abfrage | null> {
  const q = neonAbfrage()
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

const neueId = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export async function ladeVerlauf(limit = 40): Promise<Nachricht[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT id, rolle, text, created_at FROM assistent_nachrichten ORDER BY created_at DESC LIMIT $1`,
    [limit],
  )) as { id: string; rolle: "user" | "assistant"; text: string; created_at: string | Date }[]
  return rows
    .reverse()
    .map((r) => ({ id: r.id, rolle: r.rolle, text: r.text, zeit: new Date(r.created_at).toISOString() }))
}

export async function speichereNachricht(rolle: "user" | "assistant", text: string): Promise<Nachricht> {
  const q = await assistentDb()
  const id = neueId("msg")
  if (q) await q(`INSERT INTO assistent_nachrichten (id, rolle, text) VALUES ($1, $2, $3)`, [id, rolle, text])
  return { id, rolle, text, zeit: new Date().toISOString() }
}

export async function fragenHeute(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(
    `SELECT count(*)::int AS n FROM assistent_nachrichten
     WHERE rolle = 'user' AND created_at >= date_trunc('day', now() AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'Europe/Berlin'`,
    [],
  )) as { n: number }[]
  return rows[0]?.n ?? 0
}

export async function legeFreigabeAn(f: {
  art: FreigabeArt
  titel: string
  inhalt: string
  empfaenger?: string | null
  betreff?: string | null
  /** Stabiler Schlüssel – dieselbe Quelle wird nie zweimal vorgeschlagen. */
  quelle?: string | null
  agent?: string | null
  id?: string
  bildPfad?: string | null
  extra?: FreigabeExtra
}): Promise<string | null> {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  if (f.quelle && (await quelleBekannt(f.quelle))) return null
  const id = f.id ?? neueId("frg")
  /* Prüfen und Einfügen in einer Anweisung: zwei gleichzeitige Läufe legen dieselbe Quelle nicht doppelt an. */
  const rows = (await q(
    `INSERT INTO assistent_freigaben (id, art, titel, inhalt, empfaenger, betreff, quelle, agent, bild_pfad, extra)
     SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb
      WHERE $7::text IS NULL OR NOT EXISTS (SELECT 1 FROM assistent_freigaben WHERE quelle = $7::text)
     RETURNING id`,
    [
      id,
      f.art,
      f.titel.slice(0, 160),
      f.inhalt.slice(0, 6000),
      f.empfaenger ?? null,
      f.betreff?.slice(0, 200) ?? null,
      f.quelle ?? null,
      f.agent ?? null,
      f.bildPfad ?? null,
      JSON.stringify(f.extra ?? {}),
    ],
  )) as { id: string }[]
  return rows[0]?.id ?? null
}

/**
 * Sperre nehmen (Lease). Liefert `null`, wenn ein anderer Lauf sie hält.
 * `abgebrochen` = die vorige Sperre ist abgelaufen, ohne freigegeben zu werden –
 * der vorige Lauf ist also mitten drin gestorben (z. B. Zeitlimit der Funktion).
 */
export async function nimmSperre(name: string, minuten: number): Promise<{ abgebrochen: boolean } | null> {
  const q = await assistentDb()
  if (!q) return { abgebrochen: false }
  const rows = (await q(
    `WITH alt AS (SELECT bis FROM assistent_sperren WHERE name = $1)
     INSERT INTO assistent_sperren (name, bis, seit) VALUES ($1, now() + make_interval(mins => $2), now())
     ON CONFLICT (name) DO UPDATE SET bis = EXCLUDED.bis, seit = now() WHERE assistent_sperren.bis < now()
     RETURNING (SELECT bis FROM alt) AS alt_bis`,
    [name, minuten],
  )) as { alt_bis: string | Date | null }[]
  if (!rows[0]) return null
  return { abgebrochen: rows[0].alt_bis != null }
}

export async function gibSperre(name: string): Promise<void> {
  const q = await assistentDb()
  if (q) await q(`DELETE FROM assistent_sperren WHERE name = $1`, [name])
}

export const neueFreigabeId = () => neueId("frg")

type FreigabeZeile = Omit<Freigabe, "zeit" | "bildPfad"> & { bild_pfad: string | null; created_at: string | Date }
const FREIGABE_SPALTEN = `id, art, titel, inhalt, empfaenger, betreff, status, agent, bild_pfad, extra, created_at`
const alsFreigabe = ({ created_at, bild_pfad, ...r }: FreigabeZeile): Freigabe => ({
  ...r,
  extra: r.extra ?? {},
  bildPfad: bild_pfad,
  zeit: new Date(created_at).toISOString(),
})

export async function ladeFreigabe(id: string): Promise<Freigabe | null> {
  const q = await assistentDb()
  if (!q) return null
  const rows = (await q(`SELECT ${FREIGABE_SPALTEN} FROM assistent_freigaben WHERE id = $1`, [id])) as FreigabeZeile[]
  return rows[0] ? alsFreigabe(rows[0]) : null
}

export async function ergaenzeExtra(id: string, extra: FreigabeExtra): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  await q(`UPDATE assistent_freigaben SET extra = extra || $2::jsonb WHERE id = $1`, [id, JSON.stringify(extra)])
}

export async function aendereInhalt(id: string, titel: string, inhalt: string): Promise<void> {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  await q(`UPDATE assistent_freigaben SET titel = $2, inhalt = $3 WHERE id = $1 AND status = 'offen'`, [
    id,
    titel.slice(0, 160),
    inhalt.slice(0, 6000),
  ])
}

/** Titel der letzten Artikel – die Redaktion wiederholt sich nicht. */
export async function letzteArtikel(limit = 10): Promise<{ titel: string; status: string }[]> {
  const q = await assistentDb()
  if (!q) return []
  return (await q(
    `SELECT titel, status FROM assistent_freigaben WHERE art = 'linkedin' ORDER BY created_at DESC LIMIT $1`,
    [limit],
  )) as { titel: string; status: string }[]
}

export type LinkedinVerbindung = { accessToken: string; personUrn: string; name: string | null; ablauf: string }

/** "inhaber" = persönliches Profil, "firma" = creaDIG-Firmenseite (zweite LinkedIn-App). personUrn trägt dann die Organisations-URN. */
export type LinkedinKanal = "inhaber" | "firma"

export async function ladeLinkedin(kanal: LinkedinKanal = "inhaber"): Promise<LinkedinVerbindung | null> {
  const q = await assistentDb()
  if (!q) return null
  const rows = (await q(
    `SELECT access_token, person_urn, name, expires_at FROM assistent_linkedin WHERE id = $1 AND expires_at > now()`,
    [kanal],
  )) as { access_token: string; person_urn: string; name: string | null; expires_at: string | Date }[]
  const r = rows[0]
  return r ? { accessToken: r.access_token, personUrn: r.person_urn, name: r.name, ablauf: new Date(r.expires_at).toISOString() } : null
}

export async function speichereLinkedin(v: {
  kanal: LinkedinKanal
  accessToken: string
  personUrn: string
  name: string | null
  gueltigSek: number
}) {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  await q(
    `INSERT INTO assistent_linkedin (id, access_token, person_urn, name, expires_at)
     VALUES ($5, $1, $2, $3, now() + make_interval(secs => $4))
     ON CONFLICT (id) DO UPDATE SET access_token = EXCLUDED.access_token, person_urn = EXCLUDED.person_urn,
       name = EXCLUDED.name, expires_at = EXCLUDED.expires_at, updated_at = now()`,
    [v.accessToken, v.personUrn, v.name, v.gueltigSek, v.kanal],
  )
}

/**
 * Für welche Gegenstände (Vorgangs-Ids) steht bereits eine OFFENE Erinnerung der Automation
 * (`automation_runs`, Wirkung „erinnern") auf der Liste des Inhabers? Die Truppe schlägt dafür
 * nichts Zweites vor — beide Motoren bleiben, nur die Doppelmeldung entfällt.
 * Fehlt die Tabelle, gilt: nichts offen (kein Ausfall der Truppe wegen der Automation).
 */
export async function offeneAutomationErinnerungen(gegenstaende: string[]): Promise<Set<string>> {
  if (gegenstaende.length === 0) return new Set()
  const q = await assistentDb()
  if (!q) return new Set()
  const rows = (await q(
    `SELECT DISTINCT gegenstand FROM automation_runs
      WHERE zustand = 'offen' AND wirkung = 'erinnern' AND gegenstand = ANY($1::text[])`,
    [gegenstaende],
  ).catch(() => [])) as { gegenstand: string }[]
  return new Set(rows.map((r) => r.gegenstand))
}

export async function trenneLinkedin(kanal: LinkedinKanal) {
  const q = await assistentDb()
  if (q) await q(`DELETE FROM assistent_linkedin WHERE id = $1`, [kanal])
}

export async function quelleBekannt(quelle: string): Promise<boolean> {
  const q = await assistentDb()
  if (!q) return true
  const rows = (await q(`SELECT 1 FROM assistent_freigaben WHERE quelle = $1 LIMIT 1`, [quelle])) as unknown[]
  return rows.length > 0
}

export async function protokolliereLauf(l: {
  agent: string
  ergebnis: string
  anzahl: number
  fehler?: string | null
  dauerMs?: number | null
}) {
  const q = await assistentDb()
  if (!q) return
  await q(`INSERT INTO assistent_laeufe (id, agent, ergebnis, anzahl, fehler, dauer_ms) VALUES ($1, $2, $3, $4, $5, $6)`, [
    neueId("lauf"),
    l.agent,
    l.ergebnis.slice(0, 300),
    l.anzahl,
    l.fehler?.slice(0, 300) ?? null,
    l.dauerMs != null ? Math.round(l.dauerMs) : null,
  ])
  await protokolliereFaden(q, "system", "assistent", `${l.agent}${l.fehler ? " (Fehler)" : ""}`)
}

/** Letzter Lauf je Agent. */
export async function letzteLaeufe(): Promise<Record<string, Lauf>> {
  const q = await assistentDb()
  if (!q) return {}
  const rows = (await q(
    `SELECT DISTINCT ON (agent) agent, ergebnis, anzahl, fehler, created_at FROM assistent_laeufe ORDER BY agent, created_at DESC`,
    [],
  )) as { agent: string; ergebnis: string; anzahl: number; fehler: string | null; created_at: string | Date }[]
  return Object.fromEntries(
    rows.map((r) => [r.agent, { agent: r.agent, ergebnis: r.ergebnis, anzahl: r.anzahl, fehler: r.fehler, zeit: new Date(r.created_at).toISOString() }]),
  )
}

export async function ladeFreigaben(): Promise<Freigabe[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT ${FREIGABE_SPALTEN} FROM assistent_freigaben
     WHERE ${NUR_SICHTBARE} AND (status = 'offen' OR erledigt_at > now() - interval '3 days')
     ORDER BY (status = 'offen') DESC, created_at DESC LIMIT 50`,
    [],
  )) as FreigabeZeile[]
  return rows.map(alsFreigabe)
}

/** Freigegebene Kapitalchancen – bleiben sichtbar, bis bewilligt oder abgelehnt (dann 30 Tage). */
export async function ladeKapitalVorhaben(): Promise<Freigabe[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT ${FREIGABE_SPALTEN} FROM assistent_freigaben
     WHERE art = 'kapital' AND status = 'freigegeben'
       AND (coalesce(extra->'antrag'->>'stufe', 'pruefen') NOT IN ('bewilligt','abgelehnt') OR erledigt_at > now() - interval '30 days')
     ORDER BY created_at DESC LIMIT 20`,
    [],
  )) as FreigabeZeile[]
  return rows.map(alsFreigabe)
}

/** LinkedIn-Beiträge der Redaktion – unabhängig vom Status, damit nichts verschwindet. */
export async function ladeBeitraege(limit = 6): Promise<Freigabe[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT ${FREIGABE_SPALTEN} FROM assistent_freigaben WHERE art = 'linkedin'
     ORDER BY (status = 'offen') DESC, created_at DESC LIMIT $1`,
    [limit],
  )) as FreigabeZeile[]
  return rows.map(alsFreigabe)
}

/** Kurzlage für die Übersicht: offene Entscheidungen der Truppe. */
export async function zaehleOffen(): Promise<{ gesamt: number; linkedin: number }> {
  const q = await assistentDb()
  if (!q) return { gesamt: 0, linkedin: 0 }
  const rows = (await q(
    `SELECT count(*)::int AS gesamt, count(*) FILTER (WHERE art = 'linkedin')::int AS linkedin
     FROM assistent_freigaben WHERE status = 'offen' AND ${NUR_SICHTBARE}`,
    [],
  )) as { gesamt: number; linkedin: number }[]
  return rows[0] ?? { gesamt: 0, linkedin: 0 }
}

export type RatStimme = { rolle: string; sagt: string }
export type RatBeschluss = { was: string; warum: string; kostenEur: number; wer: "truppe" | "emin"; abteilung?: string }
export type RatProtokoll = {
  lage: string
  stimmen: RatStimme[]
  beschluesse: RatBeschluss[]
  verworfen: string[]
  frage: string
  /** KI-Auswertung deiner Antwort: was die Truppe daraus macht. */
  erledigt?: string
}
export type Rat = { id: string; woche: string; protokoll: RatProtokoll; antwort: string | null; zeit: string }

export async function speichereRat(woche: string, protokoll: RatProtokoll): Promise<boolean> {
  const q = await assistentDb()
  if (!q) return false
  const rows = (await q(
    `INSERT INTO assistent_rat (id, woche, protokoll) VALUES ($1, $2, $3::jsonb) ON CONFLICT (woche) DO NOTHING RETURNING id`,
    [neueId("rat"), woche, JSON.stringify(protokoll)],
  )) as { id: string }[]
  return rows.length > 0
}

export async function ladeRaete(limit = 3): Promise<Rat[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT id, woche, protokoll, antwort, created_at FROM assistent_rat ORDER BY created_at DESC LIMIT $1`,
    [limit],
  )) as { id: string; woche: string; protokoll: RatProtokoll; antwort: string | null; created_at: string | Date }[]
  return rows.map((r) => ({ id: r.id, woche: r.woche, protokoll: r.protokoll, antwort: r.antwort, zeit: new Date(r.created_at).toISOString() }))
}

export async function beantworteRat(id: string, antwort: string): Promise<void> {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  await q(`UPDATE assistent_rat SET antwort = $2, beantwortet_at = now() WHERE id = $1`, [id, antwort])
}

export async function setzeRatErledigt(id: string, erledigt: string): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  await q(`UPDATE assistent_rat SET protokoll = jsonb_set(protokoll, '{erledigt}', to_jsonb($2::text)) WHERE id = $1`, [id, erledigt])
}

export async function setzeMailKopf(id: string, empfaenger: string, betreff: string): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  await q(`UPDATE assistent_freigaben SET empfaenger = $2, betreff = $3 WHERE id = $1 AND status = 'offen'`, [
    id,
    empfaenger.slice(0, 200),
    betreff.slice(0, 200),
  ])
}

export async function setzeFreigabe(id: string, status: "freigegeben" | "verworfen"): Promise<void> {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  await q(`UPDATE assistent_freigaben SET status = $2, erledigt_at = now() WHERE id = $1 AND status = 'offen'`, [
    id,
    status,
  ])
}
