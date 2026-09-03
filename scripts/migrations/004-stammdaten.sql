-- ===========================================================================
-- 004 · Stammdaten, Standorte, Kundenhistorie, Ausschluss
-- ===========================================================================
--
-- LESBARE FASSUNG. Ausgeführt wird die Liste in `lib/neon-client.ts`; diese
-- Datei erklärt, was dort passiert, und ist der Ort, an dem man es nachliest,
-- ohne TypeScript zu lesen.
--
-- Alles hier ist additiv und wiederholbar. Keine Spalte wird entfernt, keine
-- umbenannt, keine Zeile gelöscht.
-- ===========================================================================


-- ── Organisation wird ein echter Stammdatensatz ────────────────────────────
--
-- Bis hierher entstand eine Organisation ausschliesslich aus dem Feld
-- `business` einer Anfrage: ein Name, sonst nichts. Für einen Bestandskunden,
-- der nie ein Formular ausgefüllt hat, reicht das nicht.

ALTER TABLE organisations ADD COLUMN IF NOT EXISTS email       text;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS phone       text;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS street      text;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS country     text;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS industry    text;

-- Die dritte Achse.
--
-- Weder Beziehungsgrad (der gehört zum Menschen) noch Pipeline-Status (der
-- gehört zum Vorgang). „kunde" heisst: Es gab eine Geschäftsbeziehung. Ob sie
-- heute läuft, sagt dieses Feld NICHT — und es gibt bewusst kein zweites Feld,
-- das es behauptet, weil es dafür keine Datengrundlage gäbe.
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS lifecycle text NOT NULL DEFAULT 'unbekannt';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organisations_lifecycle_check') THEN
    ALTER TABLE organisations ADD CONSTRAINT organisations_lifecycle_check
      CHECK (lifecycle IN ('unbekannt','prospect','kunde','ehemaliger-kunde'));
  END IF;
END $$;

-- Der stabile Schlüssel eines eingespielten Datensatzes.
--
-- Er ist der Grund, warum der Import wiederholbar ist: Nicht der Name
-- entscheidet über Identität (Namen ändern sich), sondern dieser Schlüssel.
-- `NULL` heisst „aus einer Anfrage entstanden" — und Postgres lässt in einem
-- UNIQUE-Index beliebig viele NULL zu, genau das gewünschte Verhalten.
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS import_key      text;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS excluded_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS organisations_import_key ON organisations (import_key);
CREATE INDEX        IF NOT EXISTS organisations_lifecycle_idx ON organisations (lifecycle);


-- ── Ein Mensch ohne E-Mail-Adresse ist ein Mensch, kein Fehler ─────────────
--
-- Die Spalte war NOT NULL, weil bisher jeder Kontakt aus einem Formular kam —
-- und dort ist die Adresse Pflicht. Ein Kontakt aus der Bestandsliste hat oft
-- keine, und eine zu erfinden wäre die schlechteste Art, ein Pflichtfeld zu
-- erfüllen.
--
-- Eine Bedingung zu lockern verliert keine Zeile. Der Eindeutigkeitsindex auf
-- `email_normalised` bleibt und trägt die Dublettensperre unverändert weiter.
ALTER TABLE contacts ALTER COLUMN email            DROP NOT NULL;
ALTER TABLE contacts ALTER COLUMN email_normalised DROP NOT NULL;

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS import_key      text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS excluded_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS contacts_import_key ON contacts (import_key);

ALTER TABLE leads         ADD COLUMN IF NOT EXISTS excluded_reason text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS excluded_reason text;


-- ── Der echte Rückbezug einer Chance auf ihre Anfrage ──────────────────────
--
-- Vorher wurde er GERATEN: „dieselbe Kontaktperson, nach der Anfrage
-- angelegt". Das konnte einer Anfrage den falschen Vorgang zuordnen — und
-- schlimmer: Die Sperre gegen ein zweites „Verkaufschance anlegen" hing an
-- derselben Vermutung. Eine Dublettensperre auf einer Näherung ist keine.
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS from_lead_id text;
CREATE INDEX IF NOT EXISTS opportunities_from_lead_idx ON opportunities (from_lead_id);


-- ── Standorte ──────────────────────────────────────────────────────────────
--
-- Vegitat hat vier bekannte Adressen und ist EIN Kunde. Vier Organisationen
-- daraus zu machen würde jede Zählung ab dem ersten Tag vervierfachen.
--
-- Umgekehrt gilt dasselbe: Gleiche Marke ist kein Beleg für gleichen
-- Betreiber. Zwei Shops einer Kette können zwei rechtlich unabhängige
-- Unternehmen sein — sie ohne Beleg zu verschmelzen wäre dieselbe Erfindung
-- in die andere Richtung. Deshalb bleiben die drei freenet-Datensätze
-- getrennt.
--
-- `ON DELETE CASCADE`: Ein Standort ohne Organisation ist eine Adresse ohne
-- Bedeutung. Es ist die einzige Kaskade im Schema — überall sonst steht
-- `SET NULL`, weil dort echte Vorgänge hängen.
CREATE TABLE IF NOT EXISTS locations (
  id              text PRIMARY KEY,
  organisation_id text NOT NULL REFERENCES organisations (id) ON DELETE CASCADE,
  label           text NOT NULL,
  street          text,
  postal_code     text,
  city            text,
  country         text,
  phone           text,
  email           text,
  note            text,
  import_key      text,
  created_at      timestamptz NOT NULL,
  updated_at      timestamptz NOT NULL
);

CREATE INDEX        IF NOT EXISTS locations_organisation_idx ON locations (organisation_id);
CREATE UNIQUE INDEX IF NOT EXISTS locations_import_key       ON locations (import_key);


-- ── Das Gedächtnis des Imports ─────────────────────────────────────────────
--
-- Ohne diese Tabelle wäre der Bestandsimport eine Saatdatei, die bei jedem
-- Deploy erneut zuschlägt: Ein Datensatz, den der Eigentümer bewusst gelöscht
-- hat, wäre nach dem nächsten Kaltstart wieder da; ein Ausschluss, den er
-- aufgehoben hat, wieder gesetzt. Nachpflege, die ein zweiter Lauf zerstört,
-- ist keine Pflege.
--
-- Ein Schritt wird eingetragen, NACHDEM er gelaufen ist. Bricht er ab, fehlt
-- der Eintrag und der nächste Start versucht es erneut — und weil jeder
-- Schritt für sich wiederholbar ist, kostet das nichts.
CREATE TABLE IF NOT EXISTS import_log (
  key        text PRIMARY KEY,
  applied_at timestamptz NOT NULL
);
