-- ===========================================================================
-- 010 · GATE 17 — DAS ANGEBOT ALS GEGENSTAND
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`); hier steht, warum es so
-- aussieht.
--
-- ---------------------------------------------------------------------------
-- WAS FEHLTE
--
-- Gate 08 hat `offer_kind` und `readiness_evidence` gebracht: WAS verkauft
-- wird, und ob eine Zahl genannt werden darf. Das Angebot selbst gab es
-- nicht — und damit auch das Ja nicht. `status = 'won'` ist ein Haken ohne
-- Wer, Wann und Worueber, genau wie `approved` vor Gate 13 und `published`
-- vor Gate 15.
--
-- ---------------------------------------------------------------------------
-- WARUM DIE ABSCHNITTE ALS JSONB UND NICHT ALS NEUN SPALTEN
--
-- Weil ihre Zahl eine REDAKTIONELLE Entscheidung ist, keine strukturelle.
-- `docs/sales/proposal-outline.md` fuehrt heute neun; kommt ein zehnter
-- dazu, waere das sonst eine Schema-Aenderung fuer einen Absatz.
--
-- Umgekehrt gilt: Was ein Angebot BINDET — Referenz, Art, Gueltigkeit,
-- Zustand, das Ja — steht als eigene Spalte, weil danach gefiltert und
-- geprueft wird.
--
-- ---------------------------------------------------------------------------
-- KEINE SPALTE `betrag`
--
-- Der Betrag einer Katalogposition wird AUFGELOEST (`lib/angebot.ts`). Ihn
-- zusaetzlich zu speichern hiesse, den Preis an zwei Stellen zu fuehren —
-- der Fehler, den Gate 05 beseitigt hat.
--
-- Was ein bereits GESENDETES Angebot zugesagt hat, bleibt trotzdem lesbar:
-- `sent_snapshot` friert die aufgeloesten Betraege im Moment des Sendens
-- ein. Das ist keine zweite Wahrheit, sondern ein Protokoll — es wird nie
-- wieder gerechnet, nur gelesen.
--
-- ---------------------------------------------------------------------------
-- DER CHECK, DER DAS GATE TRAEGT
--
-- `offers_acceptance_check`: ein angenommenes Angebot OHNE Annahme gibt es
-- nicht. Die Regel steht ausserdem in `lib/angebot.ts` — und beides ist
-- Absicht, nicht Doppelung: Die eine Fassung haelt die Oberflaeche ehrlich,
-- die andere jeden anderen Weg an die Tabelle. Ein Import, eine Konsole,
-- ein spaeteres Skript kennen `lib/angebot.ts` nicht.
--
-- Idempotent. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS offers (
  id text PRIMARY KEY,
  opportunity_id text NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  reference text NOT NULL,
  kind text NOT NULL
    CHECK (kind IN ('website','pruefung','behebung','systemprojekt','betrieb')),
  locale text NOT NULL DEFAULT 'de'
    CHECK (locale IN ('de','tr','en','ar')),
  valid_until date NOT NULL,
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  positions jsonb NOT NULL DEFAULT '[]'::jsonb,
  state text NOT NULL DEFAULT 'entwurf'
    CHECK (state IN ('entwurf','gesendet','angenommen','abgelehnt','abgelaufen')),
  acceptance jsonb,
  sent_snapshot jsonb,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offers_opportunity_idx ON offers (opportunity_id);
CREATE INDEX IF NOT EXISTS offers_state_idx ON offers (state);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'offers_acceptance_check') THEN
    ALTER TABLE offers ADD CONSTRAINT offers_acceptance_check
      CHECK (state <> 'angenommen' OR acceptance IS NOT NULL);
  END IF;
END $$;
