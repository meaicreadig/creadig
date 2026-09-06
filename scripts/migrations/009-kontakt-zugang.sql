-- ===========================================================================
-- 009 · Kontakt & Zugang
-- ===========================================================================
--
-- G11 braucht wenig Schema, und das ist ein gutes Zeichen: `contacts` gibt es
-- seit G07 (Name, Rolle, LinkedIn, Beziehung, E-Mail NULLABLE), `access` und
-- der Anlass liegen seit G10 auf dem Recherche-Vorgang.
--
-- Es fehlen genau drei Dinge:
--
--   1. WOHER kennen wir diese Person?
--      Ein Mensch ohne Fundstelle ist eine Vermutung. `contacts` hatte dafuer
--      kein Feld — Bestandskontakte kamen aus dem Kopf des Eigentuemers, und
--      das war in Ordnung, solange niemand recherchierte. Jetzt nicht mehr.
--
--   2. WELCHE Person gehoert zu diesem Recherche-Vorgang?
--      Ein Betrieb hat viele Menschen. Der Vorgang braucht den einen, um den
--      es geht.
--
--   3. WAS HAT DER MENSCH ENTSCHIEDEN?
--      Das ist der Kern des Gates. „bereit fuer Kontakt" ist ein Zustand des
--      WISSENS. Ansprechen ist eine ENTSCHEIDUNG. Zwischen beiden darf keine
--      Automatik stehen — also steht dort ein Feld, das nur ein Mensch fuellt.
--
-- Bewusst NICHT: keine Tabelle `contact_cases`, keine zweite Personenliste,
-- kein eigenes Aufgabensystem. Was es gibt, wird erweitert.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

-- 1 · Herkunft der Person
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source_kind text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source_note text;

-- 2 · Die relevante Person am Vorgang
ALTER TABLE research_cases
  ADD COLUMN IF NOT EXISTS contact_id text REFERENCES contacts (id) ON DELETE SET NULL;

-- 3 · Die menschliche Entscheidung
ALTER TABLE research_cases ADD COLUMN IF NOT EXISTS contact_decision text;
ALTER TABLE research_cases ADD COLUMN IF NOT EXISTS contact_decision_at timestamptz;
ALTER TABLE research_cases ADD COLUMN IF NOT EXISTS contact_decision_note text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'research_cases_decision_check') THEN
    ALTER TABLE research_cases ADD CONSTRAINT research_cases_decision_check
      CHECK (contact_decision IS NULL OR contact_decision IN
        ('vorbereiten','zurueckgestellt','mehr-information','nicht-verfolgen'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_source_kind_check') THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_source_kind_check
      CHECK (source_kind IS NULL OR source_kind IN
        ('website','impressum','stellenanzeige','handelsregister','presse',
         'ausschreibung','linkedin-unternehmensseite','empfehlung','bestand','eingehend'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS research_cases_contact_idx ON research_cases (contact_id);
