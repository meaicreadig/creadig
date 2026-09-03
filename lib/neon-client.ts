import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

import {
  AUSGESCHLOSSENE_MAIL_ENDUNG,
  AUSGESCHLOSSENE_NAMEN,
  AUSGESCHLOSSENE_REFERENZEN,
  BESTAND_KONTAKTE,
  BESTAND_ORGANISATIONEN,
} from "@/lib/vertrieb-bestand"
import { EXCLUSION_TESTDATA } from "@/lib/vertrieb"

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

  // ── 004 · Stammdaten, Standorte, Kundenhistorie, Ausschluss ─────────────
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS email text`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS phone text`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS street text`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS postal_code text`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS country text`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS industry text`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS lifecycle text NOT NULL DEFAULT 'unbekannt'`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS import_key text`,
  `ALTER TABLE organisations ADD COLUMN IF NOT EXISTS excluded_reason text`,
  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organisations_lifecycle_check') THEN
       ALTER TABLE organisations ADD CONSTRAINT organisations_lifecycle_check
         CHECK (lifecycle IN ('unbekannt','prospect','kunde','ehemaliger-kunde'));
     END IF;
   END $$`,
  `CREATE UNIQUE INDEX IF NOT EXISTS organisations_import_key ON organisations (import_key)`,
  `CREATE INDEX IF NOT EXISTS organisations_lifecycle_idx ON organisations (lifecycle)`,

  /*
   * Ein Mensch ohne E-Mail-Adresse ist ein Mensch, kein Fehler.
   *
   * Die Spalte war NOT NULL, weil bis hierher jeder Kontakt aus einem
   * Formular entstand — und da ist die Adresse Pflicht. Ein Kontakt, den
   * jemand von Hand anlegt oder der aus der Bestandsliste kommt, hat sie oft
   * nicht. Die Bedingung zu behalten hiesse, eine Adresse zu erfinden.
   *
   * Eine Bedingung zu lockern verliert keine Zeile. Der Eindeutigkeitsindex
   * bleibt und trägt weiter: Postgres lässt in einem UNIQUE-Index beliebig
   * viele NULL zu, aber keine zwei gleichen Adressen — genau das Verhalten,
   * das die Dublettensperre braucht.
   */
  `ALTER TABLE contacts ALTER COLUMN email DROP NOT NULL`,
  `ALTER TABLE contacts ALTER COLUMN email_normalised DROP NOT NULL`,
  `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS import_key text`,
  `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS excluded_reason text`,
  `CREATE UNIQUE INDEX IF NOT EXISTS contacts_import_key ON contacts (import_key)`,

  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS excluded_reason text`,
  `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS excluded_reason text`,

  /*
   * Der echte Rückbezug einer Chance auf ihre Anfrage.
   *
   * Vorher wurde er geraten: „gleicher Kontakt, danach angelegt". Das konnte
   * einer Anfrage den falschen Vorgang zuordnen — und die Sperre gegen ein
   * zweites „Verkaufschance anlegen" hing an derselben Vermutung. Eine
   * Dublettensperre, die auf einer Näherung steht, ist keine.
   */
  `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS from_lead_id text`,
  `CREATE INDEX IF NOT EXISTS opportunities_from_lead_idx ON opportunities (from_lead_id)`,

  `CREATE TABLE IF NOT EXISTS locations (
     id text PRIMARY KEY,
     organisation_id text NOT NULL REFERENCES organisations (id) ON DELETE CASCADE,
     label text NOT NULL,
     street text, postal_code text, city text, country text,
     phone text, email text, note text,
     import_key text,
     created_at timestamptz NOT NULL,
     updated_at timestamptz NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS locations_organisation_idx ON locations (organisation_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS locations_import_key ON locations (import_key)`,

  /*
   * Das Gedächtnis des Imports.
   *
   * Ohne diese Tabelle wäre der Bestandsimport eine Saatdatei, die bei jedem
   * Deploy erneut zuschlägt: Ein Datensatz, den der Eigentümer bewusst
   * gelöscht hat, wäre nach dem nächsten Kaltstart wieder da; ein Ausschluss,
   * den er aufgehoben hat, wieder gesetzt. Genau das ist als Fehlverhalten
   * benannt — Nachpflege darf ein zweiter Lauf nicht zerstören.
   *
   * Ein Schritt wird erst eingetragen, NACHDEM er durchgelaufen ist. Bricht
   * er ab, fehlt der Eintrag und der nächste Start versucht es erneut — und
   * weil jeder Schritt für sich schon wiederholbar ist, schadet das nicht.
   */
  `CREATE TABLE IF NOT EXISTS import_log (
     key text PRIMARY KEY,
     applied_at timestamptz NOT NULL
   )`,
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
                              from_lead_id, created_at, updated_at)
   SELECT 'opp-' || l.id, l.organisation_id, l.contact_id,
          coalesce(nullif(btrim(l.business), ''), l.name),
          l.sales_status, l.source, l.next_action, l.next_action_at,
          l.updated_at, l.lost_reason, l.id, l.created_at, l.updated_at
     FROM leads l
    WHERE (l.sales_status <> 'new' OR l.next_action IS NOT NULL)
   ON CONFLICT (id) DO NOTHING`,

  /* Datenbanken, die 003 vor 004 gesehen haben, haben die Spalte noch leer. */
  `UPDATE opportunities o SET from_lead_id = substring(o.id from 5)
    WHERE o.from_lead_id IS NULL AND o.id LIKE 'opp-%'
      AND EXISTS (SELECT 1 FROM leads l WHERE l.id = substring(o.id from 5))`,

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

/**
 * Einen Schritt genau einmal ausführen — über alle Instanzen und Deploys.
 *
 * Erst laufen lassen, dann eintragen. Bricht der Schritt ab, fehlt der
 * Eintrag und der nächste Start versucht es wieder; weil jeder Schritt für
 * sich wiederholbar ist, kostet das nichts. Andersherum — erst eintragen —
 * wäre ein halb eingespielter Bestand, den nie wieder jemand vervollständigt.
 */
async function once(sql: Sql, key: string, step: () => Promise<void>): Promise<void> {
  const done = (await sql.query(`SELECT 1 FROM import_log WHERE key = $1`, [key])) as unknown[]
  if (done.length > 0) return
  await step()
  await sql.query(
    `INSERT INTO import_log (key, applied_at) VALUES ($1, now()) ON CONFLICT (key) DO NOTHING`,
    [key],
  )
}

/**
 * 005 · Der reale Bestand.
 *
 * ---------------------------------------------------------------------------
 * NIEMALS ÜBERSCHREIBEN
 * Jedes Feld geht über `coalesce(vorhanden, neu)`: Was schon dasteht, bleibt
 * stehen. Trifft der Import auf eine Organisation, die bereits aus einer
 * Anfrage entstanden ist, ergänzt er sie und übernimmt sie — er ersetzt sie
 * nicht. Beim Namen ist das entscheidend: Zwei Zeilen für denselben Betrieb
 * wären genau die Dublette, die dieser Import verhindern soll.
 *
 * Die Kundenhistorie ist der eine Sonderfall: Sie wird nur gesetzt, wenn dort
 * noch `unbekannt` steht. Eine Einstufung, die ein Mensch vorgenommen hat,
 * ist besser als eine aus einer Liste.
 *
 * ---------------------------------------------------------------------------
 * KEINE EINZIGE VERKAUFSCHANCE
 * Der Import legt keine an, für keinen der 21 Datensätze. Eine Chance ist ein
 * laufendes Geschäft; aus „war einmal Kunde" folgt keines. Eine Pipeline, die
 * beim ersten Öffnen 19 Vorgänge zeigt, an denen niemand arbeitet, ist ab dem
 * ersten Tag unbrauchbar.
 */
async function seedBestand(sql: Sql): Promise<void> {
  for (const org of BESTAND_ORGANISATIONEN) {
    await once(sql, `org:${org.importKey}`, async () => {
      await sql.query(
        `INSERT INTO organisations
           (id, name, lifecycle, website, email, phone, street, postal_code, city,
            country, industry, note, import_key, created_at, updated_at)
         VALUES (gen_random_uuid()::text, $1::text, $2::text, $3::text, NULL, $4::text,
                 $5::text, $6::text, $7::text, $8::text, $9::text, $10::text, $11::text,
                 now(), now())
         ON CONFLICT (lower(name)) DO UPDATE SET
           import_key  = coalesce(organisations.import_key, excluded.import_key),
           lifecycle   = CASE WHEN organisations.lifecycle = 'unbekannt'
                              THEN excluded.lifecycle ELSE organisations.lifecycle END,
           website     = coalesce(organisations.website, excluded.website),
           phone       = coalesce(organisations.phone, excluded.phone),
           street      = coalesce(organisations.street, excluded.street),
           postal_code = coalesce(organisations.postal_code, excluded.postal_code),
           city        = coalesce(organisations.city, excluded.city),
           country     = coalesce(organisations.country, excluded.country),
           industry    = coalesce(organisations.industry, excluded.industry),
           note        = coalesce(organisations.note, excluded.note),
           updated_at  = now()`,
        [
          org.name, org.lifecycle, org.website ?? null, org.phone ?? null,
          org.street ?? null, org.postalCode ?? null, org.city ?? null,
          org.country ?? null, org.industry ?? null, org.note ?? null, org.importKey,
        ],
      )

      for (const loc of org.locations ?? []) {
        await sql.query(
          `INSERT INTO locations
             (id, organisation_id, label, street, postal_code, city, country,
              import_key, created_at, updated_at)
           SELECT gen_random_uuid()::text, o.id, $1::text, $2::text, $3::text,
                  $4::text, $5::text, $6::text, now(), now()
             FROM organisations o
            WHERE o.import_key = $7::text
           ON CONFLICT (import_key) DO NOTHING`,
          [
            loc.label, loc.street ?? null, loc.postalCode ?? null, loc.city ?? null,
            loc.country ?? null, loc.importKey, org.importKey,
          ],
        )
      }
    })
  }

  for (const person of BESTAND_KONTAKTE) {
    await once(sql, `contact:${person.importKey}`, async () => {
      await sql.query(
        `INSERT INTO contacts
           (id, organisation_id, name, relationship, role, note, import_key,
            created_at, updated_at)
         SELECT gen_random_uuid()::text,
                (SELECT id FROM organisations WHERE import_key = $1::text),
                $2::text, $3::text, $4::text, $5::text, $6::text, now(), now()
         ON CONFLICT (import_key) DO NOTHING`,
        [
          person.organisationKey, person.name, person.relationship,
          person.role ?? null, person.note ?? null, person.importKey,
        ],
      )
    })
  }
}

/**
 * 006 · Was nicht zur Arbeitsfläche gehört.
 *
 * ---------------------------------------------------------------------------
 * MARKIEREN, NICHT LÖSCHEN
 * `DELETE` gegen Namen ist unumkehrbar und protokolllos. Trifft es einmal
 * daneben — ein echter Kunde, der zufällig ähnlich heisst — merkt es niemand,
 * weil die Zeile weg ist. Ein Ausschlussgrund kostet eine Spalte, ist in
 * beide Richtungen umkehrbar und sagt ausserdem, WARUM.
 *
 * ---------------------------------------------------------------------------
 * EXAKT, NICHT UNSCHARF
 * Verglichen wird der ganze Name, kleingeschrieben und getrimmt. Kein
 * `ILIKE '%Yilmaz%'` — dieses Muster trifft eines Tages einen echten Kunden.
 * Die einzige Ausnahme ist `@beispiel.invalid`: eine per Norm für Tests
 * reservierte Endung, die keinem Menschen gehören kann.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEIN `once()` MEHR
 * Der Ausschluss lief früher hinter `import_log`. Das war falsch: Ein Lead,
 * der NACH dem ersten Lauf entsteht (Gate-4-Abnahme, V11-Fixtures), blieb
 * für immer unmarkiert — und die Listen filtern korrekt nach
 * `excluded_reason IS NULL`. Ergebnis: die operative Inbox zeigte Testzeilen,
 * obwohl die Spezifikation sie ausschliesst (gemessen Preview 03.09.2026).
 *
 * Jeder Start setzt denselben UPDATE erneut. `AND excluded_reason IS NULL`
 * macht ihn idempotent und lässt einen von Hand aufgehobenen Ausschluss
 * unangetastet — wer den Grund löscht, meint es.
 */
async function applyExclusions(sql: Sql): Promise<void> {
  for (const { name, reason } of AUSGESCHLOSSENE_NAMEN) {
    await sql.query(
      `UPDATE organisations SET excluded_reason = $2::text, updated_at = now()
        WHERE lower(btrim(name)) = lower(btrim($1::text)) AND excluded_reason IS NULL`,
      [name, reason],
    )
    await sql.query(
      `UPDATE contacts SET excluded_reason = $2::text, updated_at = now()
        WHERE lower(btrim(name)) = lower(btrim($1::text)) AND excluded_reason IS NULL`,
      [name, reason],
    )
    await sql.query(
      `UPDATE leads SET excluded_reason = $2::text
        WHERE excluded_reason IS NULL
          AND (lower(btrim(coalesce(business, ''))) = lower(btrim($1::text))
            OR lower(btrim(name)) = lower(btrim($1::text)))`,
      [name, reason],
    )
  }

  if (AUSGESCHLOSSENE_REFERENZEN.length > 0) {
    await sql.query(
      `UPDATE leads SET excluded_reason = $1::text
        WHERE excluded_reason IS NULL AND reference = ANY($2::text[])`,
      [EXCLUSION_TESTDATA, AUSGESCHLOSSENE_REFERENZEN],
    )
  }

  const like = `%${AUSGESCHLOSSENE_MAIL_ENDUNG}`
  const mailReason = `Abnahmedatensatz — ${AUSGESCHLOSSENE_MAIL_ENDUNG} ist für Tests reserviert`
  await sql.query(
    `UPDATE leads SET excluded_reason = $2::text
      WHERE lower(btrim(email)) LIKE $1::text AND excluded_reason IS NULL`,
    [like, mailReason],
  )
  await sql.query(
    `UPDATE contacts SET excluded_reason = $2::text, updated_at = now()
      WHERE lower(btrim(email)) LIKE $1::text AND excluded_reason IS NULL`,
    [like, mailReason],
  )

  /*
   * Abnahme-Fixtures per Prefix (V11 / Gate4 / Runde2).
   * Exakte Listen treffen Varianten (AR/EN/…) nicht immer; Prefix schon.
   * Kein `%Yilmaz%` — das träfe echte Prospects.
   */
  for (const prefix of ["v11 abnahme%", "gate4%", "runde2%"] as const) {
    await sql.query(
      `UPDATE leads SET excluded_reason = $1::text
        WHERE excluded_reason IS NULL
          AND (lower(btrim(coalesce(business, ''))) LIKE $2::text
            OR lower(btrim(name)) LIKE $2::text)`,
      [EXCLUSION_TESTDATA, prefix],
    )
    await sql.query(
      `UPDATE organisations SET excluded_reason = $1::text, updated_at = now()
        WHERE excluded_reason IS NULL AND lower(btrim(name)) LIKE $2::text`,
      [EXCLUSION_TESTDATA, prefix],
    )
    await sql.query(
      `UPDATE contacts SET excluded_reason = $1::text, updated_at = now()
        WHERE excluded_reason IS NULL AND lower(btrim(name)) LIKE $2::text`,
      [EXCLUSION_TESTDATA, prefix],
    )
  }

  /*
   * Vorgänge erben den Ausschluss ihrer Herkunft.
   *
   * Ohne diesen Schritt bliebe die Pipeline der einzige Ort, an dem die
   * Abnahmedatensätze weiterlaufen — und ausgerechnet die Pipeline ist die
   * Ansicht, in der eine erfundene Zeile am teuersten ist.
   *
   * Läuft bei jedem Start, nicht einmalig: Ein Vorgang, der später aus einer
   * ausgeschlossenen Anfrage entsteht, muss denselben Weg nehmen.
   */
  await sql.query(
    `UPDATE opportunities o SET excluded_reason = l.excluded_reason, updated_at = now()
       FROM leads l
      WHERE o.from_lead_id = l.id AND l.excluded_reason IS NOT NULL AND o.excluded_reason IS NULL`,
  )
  await sql.query(
    `UPDATE opportunities o SET excluded_reason = org.excluded_reason, updated_at = now()
       FROM organisations org
      WHERE o.organisation_id = org.id AND org.excluded_reason IS NOT NULL AND o.excluded_reason IS NULL`,
  )
  await sql.query(
    `UPDATE opportunities o SET excluded_reason = c.excluded_reason, updated_at = now()
       FROM contacts c
      WHERE o.contact_id = c.id AND c.excluded_reason IS NOT NULL AND o.excluded_reason IS NULL`,
  )
}

const clients = new Map<string, { sql: Sql; ready: () => Promise<void>; refreshExclusions: () => Promise<void> }>()

/**
 * Ein Client je Verbindungszeichenfolge, ein Schema-Lauf je Prozess.
 *
 * Das Versprechen wird gemerkt, nicht das Ergebnis: Schlägt der Aufbau fehl,
 * schlägt auch die Abfrage fehl, die darauf wartet — und der Lesepfad meldet
 * „nicht erreichbar" statt „keine Daten".
 */
export function neonClient(connectionString: string): {
  sql: Sql
  ready: () => Promise<void>
  refreshExclusions: () => Promise<void>
} {
  const cached = clients.get(connectionString)
  if (cached) return cached

  const sql = neon(connectionString)
  let promise: Promise<void> | null = null

  const ready = (): Promise<void> => {
    if (!promise) {
      promise = (async () => {
        for (const stmt of SCHEMA) await sql.query(stmt)
        for (const stmt of BACKFILL) await sql.query(stmt)
        await seedBestand(sql)
        await applyExclusions(sql)
      })().catch((error) => {
        promise = null
        throw error
      })
    }
    return promise
  }

  const refreshExclusions = async (): Promise<void> => {
    await ready()
    await applyExclusions(sql)
  }

  const entry = { sql, ready, refreshExclusions }
  clients.set(connectionString, entry)
  return entry
}
