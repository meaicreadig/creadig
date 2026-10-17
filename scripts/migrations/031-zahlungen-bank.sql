-- ===========================================================================
-- 031 · TEILZAHLUNGEN UND BANK-IMPORT (Phase 6)
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- lib/finanz/auftraege/store.ts (AUFTRAEGE_SCHEMA).
--
-- fin_zahlungen: eine Teilzahlung ist kein Sonderfall, sondern eine eigene
-- Zeile — dieselbe Entscheidung wie bei `payments` im Gate-18-Schema
-- (scripts/migrations/012-rechnung.sql). Append-only (derselbe
-- fin_nur_insert()-Trigger wie fin_dokument_verlauf/fin_protokoll aus
-- Phase 1): ein falscher Zahlungseingang wird durch einen Gegeneintrag
-- storniert, nicht geloescht oder korrigiert.
--
-- fin_bank_umsaetze: importierte Kontoumsaetze (CSV oder camt.053), jeder
-- genau einmal — die Bankreferenz (oder eine Pruefsumme aus Datum/Betrag/
-- Verwendungszweck, wenn keine Referenz vorliegt) ist der Primaerschluessel.
-- Nicht zugeordnete Umsaetze bleiben sichtbar offen, bis ein Mensch sie
-- bestaetigt oder als nicht relevant markiert.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS fin_zahlungen (
  id text PRIMARY KEY,
  dokument_id text NOT NULL,
  datum date NOT NULL,
  cent bigint NOT NULL,
  quelle text NOT NULL DEFAULT 'manuell' CHECK (quelle IN ('manuell','bank')),
  ref text,
  erstellt_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fin_zahlungen_dokument_idx ON fin_zahlungen (dokument_id);

DROP TRIGGER IF EXISTS trg_fin_zahlungen_nur_insert ON fin_zahlungen;
CREATE TRIGGER trg_fin_zahlungen_nur_insert BEFORE UPDATE OR DELETE ON fin_zahlungen
  FOR EACH ROW EXECUTE FUNCTION fin_nur_insert();

CREATE TABLE IF NOT EXISTS fin_bank_umsaetze (
  id text PRIMARY KEY,
  datum date NOT NULL,
  betrag_cent bigint NOT NULL,
  verwendungszweck text NOT NULL DEFAULT '',
  gegenpartei text,
  quelle text NOT NULL CHECK (quelle IN ('csv','camt053')),
  status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','zugeordnet','ignoriert')),
  zugeordnet_dokument_id text,
  rohdaten jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fin_bank_umsaetze_status_idx ON fin_bank_umsaetze (status, datum DESC);
