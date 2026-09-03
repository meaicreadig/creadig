import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

/**
 * Der Neon-Zugang und das Schema — an genau einer Stelle.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS SCHEMA IM CODE STEHT
 * Die Zugangsdaten zur Datenbank existieren ausschliesslich in der
 * Vercel-Umgebung. Es gibt keinen Arbeitsplatz, von dem aus sich ein
 * SQL-Skript einspielen liesse, ohne das Geheimnis dorthin zu tragen — und
 * ein Geheimnis, das man herumreicht, ist keins mehr.
 *
 * Deshalb bringt die Anwendung ihr Schema selbst mit: einmal je Prozess, vor
 * der ersten Abfrage. Die Dateien unter `scripts/migrations/` sind die
 * lesbare Wahrheit darüber, was hier passiert — sie werden nicht ausgeführt,
 * sie erklären.
 *
 * ---------------------------------------------------------------------------
 * DIE GRENZE
 * Das trägt additive Änderungen ohne Datenumbau. Sobald eine Migration
 * bestehende Zeilen umrechnen oder eine Spalte umbenennen muss, ist
 * Laufzeit-DDL das falsche Werkzeug: keine Reihenfolge, kein Rückweg, kein
 * Protokoll. Dann gehört hier ein Migrationswerkzeug hin.
 *
 * Jede Anweisung unten ist wiederholbar. Der Backfill besonders: Er läuft
 * bei jedem Kaltstart, und ein Backfill, der beim zweiten Mal Dubletten
 * baut, wäre ein Datenleck mit Ansage.
 */

/** Die konkrete Auspraegung, die `neon()` liefert — nicht die weite Generik. */
export type Sql = NeonQueryFunction<false, false>

const SCHEMA: string[] = [
  // ── 001 · Anfragen ───────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS leads (
     id text PRIMARY KEY,
     reference text NOT NULL,
     submission_key text UNIQUE,
     source text NOT NULL,
     locale text NOT NULL,
     name text NOT NULL,
     email text NOT NULL,
     phone text NOT NULL,
     business text,
     message text,
     site_url text,
     utm_source text, utm_medium text, utm_campaign text,
     utm_term text, utm_content text,
     sales_status text NOT NULL DEFAULT 'new'
       CHECK (sales_status IN ('new','contacted','qualified','discovery','audit','proposal','negotiation','won','lost')),
     next_action text,
     next_action_at date,
     lost_reason text,
     created_at timestamptz NOT NULL,
     updated_at timestamptz NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS leads_sales_status_idx ON leads (sales_status)`,
  `CREATE INDEX IF NOT EXISTS leads_updated_at_idx ON leads (updated_at)`,

  // ── 002 · Organisation, Kontakt, Verkaufschance, Chronik ─────────────────
  `CREATE TABLE IF NOT EXISTS organisations (
     id text PRIMARY KEY,
     name text NOT NULL,
     website text, city text, linkedin_url text, note text,
     created_at timestamptz NOT NULL,
     updated_at timestamptz NOT NULL
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS organisations_name_key ON organisations (lower(name))`,

  `CREATE TABLE IF NOT EXISTS contacts (
     id text PRIMARY KEY,
     organisation_id text REFERENCES organisations (id) ON DELETE SET NULL,
     name text NOT NULL,
     email text NOT NULL,
     email_normalised text NOT NULL,
     phone text, linkedin_url text, role text,
     relationship text NOT NULL DEFAULT 'unbekannt'
       CHECK (relationship IN ('unbekannt','bekannt','warm','eng')),
     last_interaction_at timestamptz,
     next_touch text,
     next_touch_at date,
     note text,
     created_at timestamptz NOT NULL,
     updated_at timestamptz NOT NULL
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_key ON contacts (email_normalised)`,
  `CREATE INDEX IF NOT EXISTS contacts_organisation_idx ON contacts (organisation_id)`,
  `CREATE INDEX IF NOT EXISTS contacts_relationship_idx ON contacts (relationship)`,

  `CREATE TABLE IF NOT EXISTS opportunities (
     id text PRIMARY KEY,
     organisation_id text REFERENCES organisations (id) ON DELETE SET NULL,
     contact_id text REFERENCES contacts (id) ON DELETE SET NULL,
     title text NOT NULL,
     status text NOT NULL DEFAULT 'new'
       CHECK (status IN ('new','contacted','qualified','discovery','audit','proposal','negotiation','won','lost')),
     source text,
     next_action text,
     next_action_at date,
     last_contact_at timestamptz,
     note text,
     estimated_value integer,
     lost_reason text,
     created_at timestamptz NOT NULL,
     updated_at timestamptz NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS opportunities_status_idx ON opportunities (status)`,
  `CREATE INDEX IF NOT EXISTS opportunities_next_action_at_idx ON opportunities (next_action_at)`,
  `CREATE INDEX IF NOT EXISTS opportunities_organisation_idx ON opportunities (organisation_id)`,
  `CREATE INDEX IF NOT EXISTS opportunities_contact_idx ON opportunities (contact_id)`,

  `CREATE TABLE IF NOT EXISTS activities (
     id text PRIMARY KEY,
     subject_type text NOT NULL
       CHECK (subject_type IN ('lead','contact','organisation','opportunity')),
     subject_id text NOT NULL,
     kind text NOT NULL,
     summary text NOT NULL,
     detail text,
     created_at timestamptz NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS activities_subject_idx ON activities (subject_type, subject_id, created_at DESC)`,

  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_id text`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS organisation_id text`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS handling_status text NOT NULL DEFAULT 'neu'`,
  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_handling_status_check') THEN
       ALTER TABLE leads ADD CONSTRAINT leads_handling_status_check
         CHECK (handling_status IN ('neu','gesehen','bearbeitet','archiviert'));
     END IF;
   END $$`,
  `CREATE INDEX IF NOT EXISTS leads_handling_status_idx ON leads (handling_status)`,
  `CREATE INDEX IF NOT EXISTS leads_contact_idx ON leads (contact_id)`,
  `CREATE INDEX IF NOT EXISTS leads_organisation_idx ON leads (organisation_id)`,
]

/**
 * 003 · Der Backfill.
 *
 * Getrennt von `SCHEMA`, weil er etwas anderes ist: DDL beschreibt die Form,
 * das hier verteilt bestehende Daten. Erklärung Schritt für Schritt in
 * `scripts/migrations/003-vertrieb-backfill.sql`.
 */
const BACKFILL: string[] = [
  `INSERT INTO organisations (id, name, created_at, updated_at)
   SELECT gen_random_uuid()::text, btrim(l.business), min(l.created_at), now()
     FROM leads l
    WHERE l.business IS NOT NULL AND btrim(l.business) <> ''
    GROUP BY btrim(l.business)
   ON CONFLICT (lower(name)) DO NOTHING`,

  `INSERT INTO contacts (id, organisation_id, name, email, email_normalised, phone,
                         relationship, last_interaction_at, created_at, updated_at)
   SELECT gen_random_uuid()::text, o.id, j.name, j.email, lower(btrim(j.email)),
          nullif(btrim(j.phone), ''), 'unbekannt', j.last_seen, j.first_seen, now()
     FROM (
       SELECT DISTINCT ON (lower(btrim(l.email)))
              l.email, l.name, l.phone, l.business,
              min(l.created_at) OVER (PARTITION BY lower(btrim(l.email))) AS first_seen,
              max(l.created_at) OVER (PARTITION BY lower(btrim(l.email))) AS last_seen
         FROM leads l
        WHERE l.email IS NOT NULL AND btrim(l.email) <> ''
        ORDER BY lower(btrim(l.email)), l.created_at DESC
     ) j
     LEFT JOIN organisations o ON lower(o.name) = lower(btrim(j.business))
   ON CONFLICT (email_normalised) DO NOTHING`,

  `UPDATE leads l SET contact_id = c.id FROM contacts c
    WHERE l.contact_id IS NULL AND c.email_normalised = lower(btrim(l.email))`,

  `UPDATE leads l SET organisation_id = o.id FROM organisations o
    WHERE l.organisation_id IS NULL AND l.business IS NOT NULL
      AND lower(o.name) = lower(btrim(l.business))`,

  `INSERT INTO opportunities (id, organisation_id, contact_id, title, status, source,
                              next_action, next_action_at, last_contact_at, lost_reason,
                              created_at, updated_at)
   SELECT 'opp-' || l.id, l.organisation_id, l.contact_id,
          coalesce(nullif(btrim(l.business), ''), l.name),
          l.sales_status, l.source, l.next_action, l.next_action_at,
          l.updated_at, l.lost_reason, l.created_at, l.updated_at
     FROM leads l
    WHERE (l.sales_status <> 'new' OR l.next_action IS NOT NULL)
   ON CONFLICT (id) DO NOTHING`,

  `UPDATE leads l SET handling_status = 'bearbeitet'
    WHERE l.handling_status = 'neu'
      AND EXISTS (SELECT 1 FROM opportunities o WHERE o.id = 'opp-' || l.id)`,

  `INSERT INTO activities (id, subject_type, subject_id, kind, summary, created_at)
   SELECT 'act-in-' || l.id, 'lead', l.id, 'lead.received',
          'Anfrage eingegangen über ' || l.source, l.created_at
     FROM leads l
    WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.id = 'act-in-' || l.id)`,

  `INSERT INTO activities (id, subject_type, subject_id, kind, summary, created_at)
   SELECT 'act-opp-' || o.id, 'opportunity', o.id, 'opportunity.created',
          'Aus bestehender Anfrage übernommen (Migration 003)', o.created_at
     FROM opportunities o
    WHERE o.id LIKE 'opp-%'
      AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.id = 'act-opp-' || o.id)`,
]

/**
 * Eine frisch eingegangene Anfrage an Kontakt und Organisation haengen.
 *
 * ---------------------------------------------------------------------------
 * WARUM IM SCHREIBWEG UND NICHT IM BACKFILL
 * Der Backfill laeuft beim Start eines Prozesses. Eine Anfrage, die danach
 * eintrifft, haette bis zum naechsten Kaltstart keinen Kontakt — und waere
 * damit in „Beziehungen" unsichtbar, obwohl sie in „Anfragen" steht. Zwei
 * Ansichten derselben Datenbank, die sich widersprechen, sind schlimmer als
 * eine fehlende Ansicht.
 *
 * ---------------------------------------------------------------------------
 * DIE DEDUPLIZIERUNG IST DER PUNKT
 * `ON CONFLICT (email_normalised) DO UPDATE` macht aus der dritten Anfrage
 * desselben Menschen keinen dritten Kontakt, sondern setzt seine letzte
 * Beruehrung neu. Genau dieser Fall ist in der Spezifikation als
 * Dublettenrisiko benannt.
 *
 * Die Beziehungsstufe wird dabei NICHT angefasst. Wer warm ist, bleibt warm,
 * auch wenn er ein Formular ausfuellt — eine Anfrage ist kein Rueckschritt.
 */
export async function linkLeadToCrm(
  sql: Sql,
  lead: { id: string; name: string; email: string; phone: string; business: string | null; createdAt: string },
): Promise<void> {
  const business = lead.business?.trim() ?? ""

  if (business !== "") {
    await sql.query(
      `INSERT INTO organisations (id, name, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1::text, now(), now())
       ON CONFLICT (lower(name)) DO NOTHING`,
      [business],
    )
  }

  await sql.query(
    `INSERT INTO contacts (id, organisation_id, name, email, email_normalised, phone,
                           relationship, last_interaction_at, created_at, updated_at)
     SELECT gen_random_uuid()::text,
            (SELECT id FROM organisations WHERE lower(name) = lower($5::text)),
            $1::text, $2::text, lower(btrim($2::text)), nullif(btrim($3::text), ''),
            'unbekannt', $4::timestamptz, now(), now()
     ON CONFLICT (email_normalised) DO UPDATE
       SET last_interaction_at = greatest(
             coalesce(contacts.last_interaction_at, to_timestamp(0)), excluded.last_interaction_at),
           organisation_id = coalesce(contacts.organisation_id, excluded.organisation_id),
           phone = coalesce(contacts.phone, excluded.phone),
           updated_at = now()`,
    [lead.name, lead.email, lead.phone, lead.createdAt, business],
  )

  await sql.query(
    `UPDATE leads l
        SET contact_id = c.id,
            organisation_id = (SELECT id FROM organisations WHERE lower(name) = lower($2::text))
       FROM contacts c
      WHERE l.id = $1 AND c.email_normalised = lower(btrim(l.email))`,
    [lead.id, business],
  )

  await sql.query(
    `INSERT INTO activities (id, subject_type, subject_id, kind, summary, created_at)
     SELECT 'act-in-' || l.id, 'lead', l.id, 'lead.received',
            'Anfrage eingegangen über ' || l.source, l.created_at
       FROM leads l
      WHERE l.id = $1
        AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.id = 'act-in-' || l.id)`,
    [lead.id],
  )
}

const clients = new Map<string, { sql: Sql; ready: () => Promise<void> }>()

/**
 * Ein Client je Verbindungszeichenfolge, ein Schema-Lauf je Prozess.
 *
 * Das Versprechen wird gemerkt, nicht das Ergebnis: Schlägt der Aufbau fehl,
 * schlägt auch die Abfrage fehl, die darauf wartet — und der Lesepfad meldet
 * „nicht erreichbar" statt „keine Daten".
 */
export function neonClient(connectionString: string): { sql: Sql; ready: () => Promise<void> } {
  const cached = clients.get(connectionString)
  if (cached) return cached

  const sql = neon(connectionString)
  let promise: Promise<void> | null = null

  const ready = (): Promise<void> => {
    if (!promise) {
      promise = (async () => {
        for (const stmt of SCHEMA) await sql.query(stmt)
        for (const stmt of BACKFILL) await sql.query(stmt)
      })().catch((error) => {
        promise = null
        throw error
      })
    }
    return promise
  }

  const entry = { sql, ready }
  clients.set(connectionString, entry)
  return entry
}
