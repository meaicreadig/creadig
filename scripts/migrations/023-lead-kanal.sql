-- ===========================================================================
-- 023 · ANFRAGEN — MARKETING-KANAL (von Hand gesetzt)
--
-- Lesbare Fassung. Angewendet wird das Schema aus `lib/neon-client.ts`.
-- Interne Einordnung durch den Betreiber (LinkedIn, Google, Empfehlung …),
-- kein vom Besucher erhobenes Datum. Ohne Spalte zeigt der Admin die
-- Kanal-Auswertung als „nicht gemessen“.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS channel text;
