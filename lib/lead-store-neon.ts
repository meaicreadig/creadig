import { neon } from "@neondatabase/serverless"

import type { Locale } from "@/lib/dictionary"
import type {
  LeadListQuery,
  LeadPage,
  LeadRecord,
  LeadStore,
  SalesStatus,
} from "@/lib/lead-store"

/**
 * Der Produktions-Adapter: Neon Postgres, Frankfurt.
 *
 * ---------------------------------------------------------------------------
 * WARUM EIGENE DATEI
 * `lead-store.ts` ist das Modell und die Schnittstelle; hier steht eine von
 * mehreren Implementierungen. Getrennt, weil der Treiber nur geladen werden
 * soll, wenn er auch gebraucht wird — und weil die Schnittstelle lesbar
 * bleiben muss, ohne dass SQL dazwischensteht.
 *
 * ---------------------------------------------------------------------------
 * KEIN ORM
 * `@neondatabase/serverless` und Text. Ein ORM würde für sieben Abfragen ein
 * Schema-Duplikat, eine Migrationskette und eine zweite Wahrheit über die
 * Tabelle mitbringen. Die Tabelle steht in `scripts/migrations/001-leads.sql`
 * und wird von dort gelesen, nicht abgeleitet.
 *
 * Alle Werte gehen als Parameter, nie als Textbaustein. Der Suchbegriff kommt
 * aus einem Formularfeld im Control Center — das ist die eine Stelle, an der
 * ein Tippfehler zu einer Injektion würde.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESER ADAPTER NICHT TUT
 * Er kennt keine Geschäftsregeln. Ob ein Verlustgrund zu einem Status passt,
 * ob ein Datum ohne Aufgabe sinnvoll ist, wann eine Anfrage doppelt ist —
 * das steht im Modell und in der Route. Hier steht nur, wie Zeilen in die
 * Datenbank kommen und wieder heraus. Zwei Orte mit Regeln wären zwei Orte,
 * an denen sie auseinanderlaufen.
 */

/** Was die Datenbank zurückgibt — Spaltennamen, nicht Feldnamen. */
type Row = {
  id: string
  reference: string
  submission_key: string | null
  source: string
  locale: string
  name: string
  email: string
  phone: string
  business: string | null
  message: string | null
  site_url: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  sales_status: string
  next_action: string | null
  next_action_at: Date | string | null
  lost_reason: string | null
  created_at: Date | string
  updated_at: Date | string
}

/** `timestamptz` kommt je nach Treiberfassung als Date oder als Text. */
function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value)
}

/** `date` ohne Zeitanteil — die Oberfläche erwartet `YYYY-MM-DD`. */
function day(value: Date | string | null): string | null {
  if (value === null) return null
  return (value instanceof Date ? value.toISOString() : String(value)).slice(0, 10)
}

function toRecord(row: Row): LeadRecord {
  return {
    id: row.id,
    reference: row.reference,
    submissionKey: row.submission_key,
    source: row.source,
    locale: row.locale as Locale,
    name: row.name,
    email: row.email,
    phone: row.phone,
    business: row.business,
    message: row.message,
    siteUrl: row.site_url,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmTerm: row.utm_term,
    utmContent: row.utm_content,
    salesStatus: row.sales_status as SalesStatus,
    nextAction: row.next_action,
    nextActionAt: day(row.next_action_at),
    lostReason: row.lost_reason,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  }
}

const COLUMNS = `
  id, reference, submission_key, source, locale,
  name, email, phone, business, message, site_url,
  utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  sales_status, next_action, next_action_at, lost_reason,
  created_at, updated_at
`

/**
 * Das Schema, wie es `scripts/migrations/001-leads.sql` beschreibt.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS HIER STEHT UND NICHT IN EINEM MIGRATIONSWERKZEUG
 * Die Zugangsdaten zur Datenbank existieren ausschliesslich in der
 * Vercel-Umgebung. Es gibt keinen Arbeitsplatz, von dem aus sich einmalig
 * ein SQL-Skript einspielen liesse, ohne das Geheimnis dorthin zu tragen —
 * und ein Geheimnis, das man herumreicht, ist keins mehr.
 *
 * Deshalb bringt der Adapter sein Schema selbst mit: einmal je Prozess, vor
 * der ersten Abfrage, ausschliesslich `IF NOT EXISTS`. Zwei gleichzeitige
 * Kaltstarts stoeren sich daran nicht; Postgres entscheidet, wer zuerst da war.
 *
 * ---------------------------------------------------------------------------
 * DIE GRENZE DIESES VERFAHRENS
 * Es traegt genau eine Tabelle ohne Datenumbau. Sobald eine Aenderung
 * bestehende Zeilen anfassen muss — eine Spalte umbenennen, Werte umrechnen —
 * ist Laufzeit-DDL das falsche Werkzeug: Es gibt keine Reihenfolge, keinen
 * Rueckweg und kein Protokoll. Dann gehoert hier ein echtes
 * Migrationswerkzeug hin, und die SQL-Datei bleibt die Quelle.
 *
 * Die Datei ist deshalb nicht dekorativ. Sie ist die lesbare Wahrheit ueber
 * die Tabelle; dieser Block haelt sie nur nach.
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id              text PRIMARY KEY,
  reference       text NOT NULL,
  submission_key  text UNIQUE,
  source          text NOT NULL,
  locale          text NOT NULL,
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  business        text,
  message         text,
  site_url        text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,
  utm_content     text,
  sales_status    text NOT NULL DEFAULT 'new'
                  CHECK (sales_status IN (
                    'new','contacted','qualified','discovery','audit',
                    'proposal','negotiation','won','lost'
                  )),
  next_action     text,
  next_action_at  date,
  lost_reason     text,
  created_at      timestamptz NOT NULL,
  updated_at      timestamptz NOT NULL
)`

const INDEXES = [
  `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS leads_sales_status_idx ON leads (sales_status)`,
  `CREATE INDEX IF NOT EXISTS leads_updated_at_idx ON leads (updated_at)`,
]

/**
 * Ein Adapter, der bei jedem Zugriff scheitert — mit Ansage.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT EINFACH `null`
 * `null` heisst im Modell "kein Speicher eingerichtet". Das ist ein
 * GUELTIGER Zustand: Anfragen laufen dann als Mail, und die Oberflaeche sagt
 * das auch so. Bei `LEAD_STORE=neon` mit kaputter Verbindung waere dieselbe
 * Meldung eine Luege — der Speicher ist eingerichtet, er antwortet nur nicht.
 *
 * Der Unterschied ist nicht kosmetisch, er entscheidet ueber die Reaktion:
 *   kein Speicher      → nichts tun, alles laeuft wie vor MP-G
 *   nicht erreichbar   → jemand muss nachsehen, JETZT
 *
 * Und im Schreibweg waere `null` ein stiller Rueckfall: `storeLead` gaebe
 * "skipped" zurueck und niemand erfuehre davon. So wirft es, `storeLead`
 * faengt es, und der Alarm geht raus (§17: nie leise degradieren).
 */
function unreachableStore(reason: string): LeadStore {
  const fail = async (): Promise<never> => {
    throw new Error(`Lead-Speicher nicht erreichbar: ${reason}`)
  }
  return {
    name: "neon (nicht erreichbar)",
    save: fail,
    findBySubmissionKey: fail,
    getById: fail,
    list: fail,
    updateSalesStatus: fail,
    updateNextAction: fail,
  }
}

export function createNeonStore(connectionString: string): LeadStore {
  /*
   * `neon()` prueft die Zeichenkette sofort und wirft bei einer kaputten.
   * Ungefangen wuerde das die ganze Seite mit 500 beenden — auch den
   * Materialstand, der mit der Datenbank nichts zu tun hat.
   */
  let sql: ReturnType<typeof neon>
  try {
    sql = neon(connectionString)
  } catch (error) {
    return unreachableStore(error instanceof Error ? error.message : "unbekannt")
  }

  /*
   * Einmal je Prozess. Das Versprechen wird gemerkt, nicht das Ergebnis:
   * Schlaegt es fehl, schlaegt auch die Abfrage fehl, die darauf wartet —
   * und der Lesepfad meldet "nicht erreichbar" statt "keine Anfragen".
   */
  let ready: Promise<void> | null = null
  function ensureSchema(): Promise<void> {
    if (!ready) {
      ready = (async () => {
        await sql.query(SCHEMA)
        for (const stmt of INDEXES) await sql.query(stmt)
      })().catch((error) => {
        ready = null // beim naechsten Versuch neu probieren
        throw error
      })
    }
    return ready
  }

  return {
    name: "neon",

    /**
     * Einfügen oder aktualisieren, anhand der internen Kennung.
     *
     * Die Route sucht vor dem Schreiben nach dem Absende-Token und benutzt
     * bei einem Wiederholversuch dieselbe Kennung. Der Konflikt auf `id`
     * fängt den Fall trotzdem ab — zwei gleichzeitige Anfragen können die
     * Suche beide leer finden.
     *
     * `created_at` bleibt beim Aktualisieren stehen: Wann eine Anfrage
     * eingegangen ist, ändert kein zweiter Klick.
     */
    async save(record: LeadRecord): Promise<void> {
      await ensureSchema()
      await sql.query(
        `INSERT INTO leads (${COLUMNS})
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
         ON CONFLICT (id) DO UPDATE SET
           reference      = EXCLUDED.reference,
           submission_key = EXCLUDED.submission_key,
           source         = EXCLUDED.source,
           locale         = EXCLUDED.locale,
           name           = EXCLUDED.name,
           email          = EXCLUDED.email,
           phone          = EXCLUDED.phone,
           business       = EXCLUDED.business,
           message        = EXCLUDED.message,
           site_url       = EXCLUDED.site_url,
           utm_source     = EXCLUDED.utm_source,
           utm_medium     = EXCLUDED.utm_medium,
           utm_campaign   = EXCLUDED.utm_campaign,
           utm_term       = EXCLUDED.utm_term,
           utm_content    = EXCLUDED.utm_content,
           updated_at     = EXCLUDED.updated_at`,
        [
          record.id, record.reference, record.submissionKey, record.source, record.locale,
          record.name, record.email, record.phone, record.business, record.message, record.siteUrl,
          record.utmSource, record.utmMedium, record.utmCampaign, record.utmTerm, record.utmContent,
          record.salesStatus, record.nextAction, record.nextActionAt, record.lostReason,
          record.createdAt, record.updatedAt,
        ],
      )
    },

    async findBySubmissionKey(key: string): Promise<LeadRecord | null> {
      if (!key) return null
      await ensureSchema()
      const rows = (await sql.query(
        `SELECT ${COLUMNS} FROM leads WHERE submission_key = $1 LIMIT 1`,
        [key],
      )) as Row[]
      return rows.length > 0 ? toRecord(rows[0]) : null
    },

    async getById(id: string): Promise<LeadRecord | null> {
      await ensureSchema()
      const rows = (await sql.query(
        `SELECT ${COLUMNS} FROM leads WHERE id = $1 LIMIT 1`,
        [id],
      )) as Row[]
      return rows.length > 0 ? toRecord(rows[0]) : null
    },

    /**
     * Liste mit Suche, Filtern und Seitenzahl.
     *
     * `total` zählt VOR `limit` — die Kopfzeile soll sagen, wie viele
     * Anfragen es gibt, nicht wie viele gerade auf den Bildschirm passen.
     * Das ist ein zweiter Rundgang zur Datenbank; bei dieser Größenordnung
     * ist er billiger als ein Fensterausdruck über jede Zeile.
     */
    async list(query: LeadListQuery): Promise<LeadPage> {
      await ensureSchema()
      const where: string[] = []
      const params: unknown[] = []

      if (query.status) { params.push(query.status); where.push(`sales_status = $${params.length}`) }
      if (query.source) { params.push(query.source); where.push(`source = $${params.length}`) }
      if (query.locale) { params.push(query.locale); where.push(`locale = $${params.length}`) }
      if (query.search?.trim()) {
        params.push(`%${query.search.trim()}%`)
        const n = params.length
        where.push(
          `(reference ILIKE $${n} OR business ILIKE $${n} OR name ILIKE $${n} OR email ILIKE $${n})`,
        )
      }
      const clause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""

      const counted = (await sql.query(
        `SELECT COUNT(*)::int AS total FROM leads ${clause}`,
        params,
      )) as { total: number }[]
      const total = counted[0]?.total ?? 0

      const limit = query.limit ?? 50
      const offset = query.offset ?? 0
      const rows = (await sql.query(
        `SELECT ${COLUMNS} FROM leads ${clause}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      )) as Row[]

      return { rows: rows.map(toRecord), total }
    },

    /**
     * Der Verlustgrund gehört ausschliesslich zu `lost` — die Regel steht in
     * der Server Action, und hier wird sie noch einmal durchgesetzt: Wer
     * diesen Adapter direkt benutzt, soll an einer gewonnenen Anfrage keinen
     * Verlustgrund hinterlassen können.
     */
    async updateSalesStatus(
      id: string,
      status: SalesStatus,
      lostReason: string | null,
    ): Promise<boolean> {
      await ensureSchema()
      const rows = (await sql.query(
        `UPDATE leads
            SET sales_status = $2::text,
                lost_reason  = CASE WHEN $2::text = 'lost' THEN $3::text ELSE NULL END,
                updated_at   = now()
          WHERE id = $1
        RETURNING id`,
        [id, status, lostReason],
      )) as { id: string }[]
      return rows.length > 0
    },

    /**
     * Ein Datum ohne Aufgabe ist keine Aufgabe — fällt der Text weg, fällt es mit.
     *
     * -----------------------------------------------------------------------
     * WARUM `$2::text` UND NICHT NUR `$2`
     * Ohne die Umwandlung bricht Postgres die Anweisung ab:
     *   42P08 — could not determine data type of parameter $2
     *
     * Der Grund ist die Stelle, an der `$2` zuerst vorkommt: `CASE WHEN $2
     * IS NULL`. `IS NULL` verrät nichts über den Typ — es passt auf jeden.
     * Der Planer kommt damit zu keinem Schluss und lehnt ab, bevor er die
     * zweite Verwendung (`next_action = $2`) überhaupt ansieht.
     *
     * `updateSalesStatus` hat dasselbe Muster und funktioniert trotzdem:
     * dort steht `$2 = 'lost'`, und der Vergleich mit einem Text-Literal
     * legt den Typ fest.
     *
     * Gefunden erst gegen die echte Datenbank — der Datei-Adapter ist
     * JavaScript und kennt keine Typableitung eines SQL-Planers.
     */
    async updateNextAction(
      id: string,
      action: string | null,
      at: string | null,
    ): Promise<boolean> {
      await ensureSchema()
      const rows = (await sql.query(
        `UPDATE leads
            SET next_action    = $2::text,
                next_action_at = CASE WHEN $2::text IS NULL THEN NULL ELSE $3::date END,
                updated_at     = now()
          WHERE id = $1
        RETURNING id`,
        [id, action, at],
      )) as { id: string }[]
      return rows.length > 0
    },
  }
}
