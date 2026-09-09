-- ===========================================================================
-- 011 · GATE 19 — DAS PROJEKT, UND DIE ABNAHME, OHNE DIE EINE LIEFERUNG
--       KEINE IST
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`); hier steht, warum es so
-- aussieht.
--
-- ---------------------------------------------------------------------------
-- DIE REGELN STANDEN SCHON — AUF DER OEFFENTLICHEN SEITE
--
--   FAQ:     „Danach bleibt alles bei Ihnen: Code, Inhalte, Zugaenge und
--             Domain — wir haendigen aus, was wir haben."
--   Pakete:  „Fester Livetermin: vier Wochen ab Materialeingang.
--             50 % bei Start, 50 % bei Ihrer Freigabe."
--
-- Vier Stuecke, eine Frist, eine Zahlung an der Abnahme. Gebaut war davon
-- nichts.
--
-- ---------------------------------------------------------------------------
-- KEINE SPALTE `go_live`
--
-- Der Termin wird aus `material_received` GERECHNET (`lib/lieferung.ts`).
-- Ein eingetragenes Datum daneben waere eine zweite Wahrheit gegen eine
-- oeffentliche Zusage — und die eingetragene gewinnt immer die falsche.
--
-- `material_received` ist nullable, und das ist der Punkt: Ohne Material
-- laeuft keine Frist. `NULL` heisst hier nicht „steht noch nicht fest",
-- sondern „das Material ist nicht da".
--
-- ---------------------------------------------------------------------------
-- `offer_id` NOT NULL UND EINDEUTIG
--
-- Ein Projekt entsteht aus einem angenommenen Angebot, und der Umfang wird
-- nicht abgetippt: Wer ihn abtippt, hat in vier Wochen zwei Umfaenge, und
-- der Kunde hat den anderen. `ON DELETE RESTRICT`, weil ein Angebot, aus dem
-- ein Projekt geworden ist, nicht mehr verschwinden darf.
--
-- ---------------------------------------------------------------------------
-- ZWEI CHECKS
--
--   projects_acceptance_check  „abgenommen"/„uebergeben" ohne acceptance
--                              gibt es nicht. Eine Lieferung ohne Abnahme
--                              ist keine.
--   projects_material_check    Alles ausser „aufgesetzt" verlangt einen
--                              Materialeingang. Ohne ihn laeuft keine Frist.
--
-- Beide zusaetzlich zu `lib/lieferung.ts`, nicht statt seiner: Die eine
-- Fassung haelt die Oberflaeche ehrlich, die andere jeden anderen Weg an die
-- Tabelle — ein Import, eine Konsole, ein spaeteres Skript.
--
-- Idempotent. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  opportunity_id text NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  offer_id text NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  material_received date,
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  acceptance jsonb,
  handover jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL DEFAULT 'aufgesetzt'
    CHECK (state IN ('aufgesetzt','laeuft','abgenommen','uebergeben')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_opportunity_idx ON projects (opportunity_id);
CREATE UNIQUE INDEX IF NOT EXISTS projects_offer_idx ON projects (offer_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_acceptance_check') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_acceptance_check
      CHECK (state NOT IN ('abgenommen','uebergeben') OR acceptance IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_material_check') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_material_check
      CHECK (state = 'aufgesetzt' OR material_received IS NOT NULL);
  END IF;
END $$;
