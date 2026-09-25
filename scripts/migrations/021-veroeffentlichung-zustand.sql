-- ===========================================================================
-- 021 · §18 — DER FREIGABE-SCHUTZ DES VEROEFFENTLICHUNGSREGISTERS
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`); Produktion nur mit
-- ausdruecklicher Owner-Freigabe (O7).
--
-- WARUM
--   idee → entwurf → freigegeben → veroeffentlicht (→ Reaktion)
-- Ein Entwurf — von Hand oder spaeter von meAI vorgeschlagen — geht nie
-- direkt hinaus. Die Freigabe ist ein eigener Zustand mit Wer und Wann.
--
-- BESTAND
-- Jede vorhandene Zeile bekommt `veroeffentlicht` (DEFAULT) und hat ihr
-- Datum schon — sie erfuellt die neue Bedingung ohne Nacharbeit.
--
-- IDEMPOTENT
-- Jede Anweisung darf zweimal laufen: `IF NOT EXISTS`, `DROP … IF EXISTS`
-- vor dem `ADD CONSTRAINT`, `DROP NOT NULL` ist ohne Wirkung, wenn schon frei.
-- ===========================================================================

ALTER TABLE publications ADD COLUMN IF NOT EXISTS zustand text NOT NULL DEFAULT 'veroeffentlicht' CHECK (zustand IN ('entwurf','freigegeben','veroeffentlicht'));

ALTER TABLE publications ADD COLUMN IF NOT EXISTS quelle_art text CHECK (quelle_art IN ('lieferung','einwand','beleg','build'));

ALTER TABLE publications ADD COLUMN IF NOT EXISTS quelle_id text;

ALTER TABLE publications ADD COLUMN IF NOT EXISTS freigegeben_von text;

ALTER TABLE publications ADD COLUMN IF NOT EXISTS freigegeben_am timestamptz;

ALTER TABLE publications ALTER COLUMN veroeffentlicht_am DROP NOT NULL;

ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_datum_bei_veroeff;

ALTER TABLE publications ADD CONSTRAINT publications_datum_bei_veroeff CHECK (zustand <> 'veroeffentlicht' OR veroeffentlicht_am IS NOT NULL);

