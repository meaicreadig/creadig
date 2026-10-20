-- 037 · Vertrieb → Finanz-Brücke (additiv, idempotent)
-- Spiegelt lib/finanz/auftraege/store.ts (AUFTRAEGE_SCHEMA). Alle Spalten nullable,
-- bestehende Zeilen bleiben gültig und werden nicht rückwirkend befüllt.
ALTER TABLE fin_kunden ADD COLUMN IF NOT EXISTS organisation_id text;
ALTER TABLE fin_kunden ADD COLUMN IF NOT EXISTS contact_id text;
ALTER TABLE fin_dokumente ADD COLUMN IF NOT EXISTS opportunity_id text;
CREATE INDEX IF NOT EXISTS fin_dokumente_opportunity_idx ON fin_dokumente (opportunity_id) WHERE opportunity_id IS NOT NULL;
