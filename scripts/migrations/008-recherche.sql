-- ===========================================================================
-- 008 · Recherche
-- ===========================================================================
--
-- Recherche haengt an `organisations`. KEINE zweite Firmentabelle.
--
-- Der Grund ist eine Erfahrung aus Gate 07: Sobald ein Betrieb an zwei
-- Stellen gefuehrt wird, laufen die zwei Stellen auseinander — und die
-- falsche gewinnt. Ein recherchierter Betrieb ist derselbe Betrieb wie ein
-- Kunde; er ist nur frueher im Leben.
--
-- ZWEI TABELLEN, MEHR NICHT.
--
--   research_cases     der Vorgang je Organisation: warum entdeckt, wo
--                      gefunden, wie weit, was als Naechstes
--   research_evidence  die einzelnen Belege — je Beleg eine Quelle
--
-- Bewusst KEINE Spalte `classification`. Die Einordnung wird aus den
-- Belegen ABGELEITET (lib/market.ts), nicht gespeichert. Eine gespeicherte
-- Einordnung waere ab der ersten Regelaenderung still falsch — dieselbe
-- Ueberlegung wie bei der Angebotsreife in Gate 08.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS research_cases (
  id              text PRIMARY KEY,
  organisation_id text NOT NULL REFERENCES organisations (id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'entdeckt',
  -- Warum dieser Betrieb ueberhaupt in die Recherche kam. Pflicht:
  -- Ein Betrieb ohne Anlass ist eine Liste, keine Recherche.
  discovery_why   text NOT NULL,
  discovery_kind  text NOT NULL,
  discovery_url   text,
  -- Zugang und Bedienbarkeit sind EIGENE Achsen (Gate 09) und werden
  -- getrennt gefuehrt, damit sie die Passung nicht anstecken.
  access          text,
  serviceable     boolean,
  next_action     text,
  discovered_at   timestamptz NOT NULL DEFAULT now(),
  researched_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Ein Vorgang je Organisation. Die Sperre gegen Dubletten liegt hier,
-- nicht in der Oberflaeche.
CREATE UNIQUE INDEX IF NOT EXISTS research_cases_org_key
  ON research_cases (organisation_id);
CREATE INDEX IF NOT EXISTS research_cases_status_idx ON research_cases (status);

CREATE TABLE IF NOT EXISTS research_evidence (
  id          text PRIMARY KEY,
  case_id     text NOT NULL REFERENCES research_cases (id) ON DELETE CASCADE,
  -- fact = beobachtet · signal = stuetzt ein G09-Signal
  -- anlass = oeffentlicher Geschaeftsanlass · ausschluss = belegter Ausschluss
  kind        text NOT NULL,
  -- Bei kind='signal' der Schluessel aus SIGNALS; bei 'ausschluss' der
  -- Ausschlussschluessel. Sonst NULL.
  ref         text,
  -- Was BEOBACHTET wurde. Nicht, was es bedeutet.
  claim       text NOT NULL,
  -- Ohne Quelle zaehlt ein Beleg nicht (Gate-09-Regel, hier erzwungen).
  source_url  text NOT NULL,
  source_kind text NOT NULL,
  observed_at timestamptz NOT NULL DEFAULT now(),
  -- Widersprueche werden nicht ueberschrieben, sondern stillgelegt.
  superseded_by text REFERENCES research_evidence (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS research_evidence_case_idx ON research_evidence (case_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'research_cases_status_check') THEN
    ALTER TABLE research_cases ADD CONSTRAINT research_cases_status_check
      CHECK (status IN ('entdeckt','in-recherche','beleg-fehlt','eingeordnet',
                        'zurueckgestellt','ausgeschlossen','bereit-fuer-kontakt'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'research_cases_access_check') THEN
    ALTER TABLE research_cases ADD CONSTRAINT research_cases_access_check
      CHECK (access IS NULL OR access IN ('empfehlung','netzwerk','eingehend','bestandskunde','keiner'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'research_evidence_kind_check') THEN
    ALTER TABLE research_evidence ADD CONSTRAINT research_evidence_kind_check
      CHECK (kind IN ('fact','signal','anlass','ausschluss'));
  END IF;
END $$;
