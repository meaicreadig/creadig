-- ===========================================================================
-- 017 · ADMIN OS · ADM-03 — DIE KERNSCHLEIFE
--
-- Lesbare Fassung. Angewendet wird `SCHEMA` aus `lib/neon-client.ts`
-- (`npm run db-migrate`). REIHENFOLGE IM CUTOVER: erst migrieren, dann
-- ausliefern — die Laufzeit prueft diese Spalten als Pflicht.
--
-- WAS UND WARUM
--   leads.email/phone optional  Eine Anfrage am Telefon hat oft keine Mail.
--                               Pflichtfelder erzwangen erfundene Werte.
--   leads.responsible           Wer kuemmert sich (Rollen-Schluessel, nie ein Name).
--   leads.archive_reason        Archivieren heisst begruenden, nicht verschwinden lassen.
--   leads.duplicate_of          Dublette ausdruecklich markiert — nichts wird verschmolzen
--                               oder geloescht.
--   opportunities.responsible   wie bei leads
--   opportunities_from_lead_unique
--                               Zwei gleichzeitige Klicks auf „Chance anlegen“ ergaben
--                               zwei Chancen (erst SELECT, dann INSERT). Jetzt entscheidet
--                               die Datenbank. SCHEITERT diese Anweisung, gibt es bereits
--                               doppelte Chancen aus einer Anfrage — dann zuerst ansehen:
--                               SELECT from_lead_id, count(*) FROM opportunities
--                                WHERE from_lead_id IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
--   activities.actor/origin/data
--                               Wer (Rolle / website / system), welche Herkunft (HUMAN,
--                               SYSTEM, AUTOMATION, INTEGRATION) und maschinenlesbare Werte
--                               (z. B. von/nach). Alte Zeilen bleiben NULL: unbekannt ist
--                               nicht „System“.
--
-- Idempotent. Aendert keine bestehende Zeile.
-- ===========================================================================

ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

ALTER TABLE leads ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS responsible text;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS archive_reason text;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS duplicate_of text;

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS responsible text;

CREATE UNIQUE INDEX IF NOT EXISTS opportunities_from_lead_unique ON opportunities (from_lead_id) WHERE from_lead_id IS NOT NULL;

ALTER TABLE activities ADD COLUMN IF NOT EXISTS actor text;

ALTER TABLE activities ADD COLUMN IF NOT EXISTS origin text;

ALTER TABLE activities ADD COLUMN IF NOT EXISTS data jsonb;

CREATE INDEX IF NOT EXISTS leads_responsible_idx ON leads (responsible);

CREATE INDEX IF NOT EXISTS opportunities_responsible_idx ON opportunities (responsible);
