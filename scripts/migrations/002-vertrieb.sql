-- ===========================================================================
-- 002 · Vertrieb 1.0 — Anfrage, Kontakt, Organisation, Verkaufschance
--
-- ---------------------------------------------------------------------------
-- WAS SICH FACHLICH AENDERT
-- Bis hierher war "Lead" ein Sammelbegriff: derselbe Datensatz war Beleg
-- eines Formulareingangs UND Zeile in der Verkaufs-Pipeline. Das geht so
-- lange gut, wie beides dasselbe ist — und genau das ist es nicht:
--
--   Eine Anfrage ist ein historischer Eingang. Sie aendert sich nie.
--   Eine Verkaufschance ist ein laufender Vorgang. Sie aendert sich staendig.
--   Ein Kontakt ist ein Mensch. Er schickt vielleicht drei Anfragen.
--   Eine Beziehung ist unabhaengig davon, ob gerade etwas verkauft wird.
--
-- Diese Migration trennt sie, OHNE eine einzige bestehende Zeile zu verlieren.
--
-- ---------------------------------------------------------------------------
-- ADDITIV UND WIEDERHOLBAR
-- Nur CREATE ... IF NOT EXISTS und ADD COLUMN IF NOT EXISTS. Keine Spalte
-- wird entfernt, keine Zeile geloescht. `leads.sales_status` bleibt stehen,
-- obwohl die Pipeline umzieht — eine Spalte zu droppen, deren Inhalt gerade
-- erst kopiert wurde, ist ein Rueckweg weniger fuer nichts.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- ORGANISATION — das Unternehmen hinter Kontakten und Chancen
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organisations (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  website       text,
  city          text,
  linkedin_url  text,
  note          text,
  created_at    timestamptz NOT NULL,
  updated_at    timestamptz NOT NULL
);

-- Ein Betrieb, ein Datensatz. Der Name wird beim Vergleich kleingeschrieben,
-- damit "Kaya Elektro" und "kaya elektro" nicht zwei Firmen werden.
CREATE UNIQUE INDEX IF NOT EXISTS organisations_name_key
  ON organisations (lower(name));

-- ---------------------------------------------------------------------------
-- KONTAKT — die Person
--
-- `relationship` ist BEWUSST getrennt vom Pipeline-Status. Jemand kann warm
-- sein ohne Verkaufschance, und jemand Fremdes kann sofort eine haben. Wer
-- beides in eine Spalte legt, kann die eine Frage nicht mehr stellen, ohne
-- die andere zu beantworten.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id                  text PRIMARY KEY,
  organisation_id     text REFERENCES organisations (id) ON DELETE SET NULL,
  name                text NOT NULL,
  email               text NOT NULL,
  -- Kleingeschrieben und getrimmt. Die Deduplizierung haengt an dieser
  -- Spalte, nicht an `email` — sonst waeren Max@… und max@… zwei Menschen.
  email_normalised    text NOT NULL,
  phone               text,
  linkedin_url        text,
  role                text,
  relationship        text NOT NULL DEFAULT 'unbekannt'
                      CHECK (relationship IN ('unbekannt','bekannt','warm','eng')),
  last_interaction_at timestamptz,
  next_touch          text,
  next_touch_at       date,
  note                text,
  created_at          timestamptz NOT NULL,
  updated_at          timestamptz NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_key ON contacts (email_normalised);
CREATE INDEX IF NOT EXISTS contacts_organisation_idx ON contacts (organisation_id);
CREATE INDEX IF NOT EXISTS contacts_relationship_idx ON contacts (relationship);

-- ---------------------------------------------------------------------------
-- VERKAUFSCHANCE — ein konkreter moeglicher Auftrag
--
-- Die neun Zustaende sind dieselben wie bisher in `leads.sales_status`
-- (SALES_STATES). Sie ziehen nur um: von der Anfrage an den Vorgang.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunities (
  id               text PRIMARY KEY,
  organisation_id  text REFERENCES organisations (id) ON DELETE SET NULL,
  contact_id       text REFERENCES contacts (id) ON DELETE SET NULL,
  title            text NOT NULL,
  status           text NOT NULL DEFAULT 'new'
                   CHECK (status IN (
                     'new','contacted','qualified','discovery','audit',
                     'proposal','negotiation','won','lost'
                   )),
  source           text,
  next_action      text,
  next_action_at   date,
  last_contact_at  timestamptz,
  note             text,
  -- Ganze Euro, kein Cent. Optional und ohne Vorgabe: eine geschaetzte Zahl,
  -- die niemand eingetragen hat, darf nicht als 0 in einer Summe landen.
  estimated_value  integer,
  lost_reason      text,
  created_at       timestamptz NOT NULL,
  updated_at       timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS opportunities_status_idx ON opportunities (status);
CREATE INDEX IF NOT EXISTS opportunities_next_action_at_idx ON opportunities (next_action_at);
CREATE INDEX IF NOT EXISTS opportunities_organisation_idx ON opportunities (organisation_id);
CREATE INDEX IF NOT EXISTS opportunities_contact_idx ON opportunities (contact_id);

-- ---------------------------------------------------------------------------
-- AKTIVITAET — die Chronik
--
-- Kein Event Sourcing. Die Tabellen oben bleiben die Wahrheit ueber den
-- AKTUELLEN Zustand; hier steht, was passiert ist, damit ein Statuswechsel
-- nicht spurlos den vorherigen ueberschreibt.
--
-- `subject_type`/`subject_id` statt vier Fremdschluesseln: Ein Ereignis
-- gehoert immer zu genau einem Gegenstand, und die Alternative waeren vier
-- Spalten, von denen drei immer leer sind.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id           text PRIMARY KEY,
  subject_type text NOT NULL
               CHECK (subject_type IN ('lead','contact','organisation','opportunity')),
  subject_id   text NOT NULL,
  kind         text NOT NULL,
  summary      text NOT NULL,
  detail       text,
  created_at   timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS activities_subject_idx
  ON activities (subject_type, subject_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- ANFRAGE — die bestehende Tabelle bekommt ihre Verknuepfungen
--
-- `handling_status` ist der Bearbeitungszustand des EINGANGS, nicht der
-- Pipeline-Status. Eine Anfrage kann bearbeitet sein, ohne dass daraus je
-- eine Verkaufschance wird — genau dafuer gibt es diese Spalte.
-- ---------------------------------------------------------------------------
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_id text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS organisation_id text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS handling_status text NOT NULL DEFAULT 'neu';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_handling_status_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_handling_status_check
      CHECK (handling_status IN ('neu','gesehen','bearbeitet','archiviert'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS leads_handling_status_idx ON leads (handling_status);
CREATE INDEX IF NOT EXISTS leads_contact_idx ON leads (contact_id);
CREATE INDEX IF NOT EXISTS leads_organisation_idx ON leads (organisation_id);
