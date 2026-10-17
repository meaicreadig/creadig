-- 035 · Finanz-Sicherheit (additiv, idempotent)
-- Ein Bankumsatz kann nur EINE Zahlung sein (schützt gegen doppeltes Bestätigen),
-- Zahlungen sind nur anhängbar (nie ändern, nie löschen).
-- Spiegelt den Eintrag in lib/finanz/auftraege/store.ts (*_SCHEMA).
-- Auf BEIDEN Neon-Branches ausführen: Produktion und v0-preview (br-shiny-hall-b1k96ehg).

CREATE UNIQUE INDEX IF NOT EXISTS fin_zahlungen_bank_ref_uidx
  ON fin_zahlungen (ref) WHERE quelle = 'bank' AND ref IS NOT NULL;

DROP TRIGGER IF EXISTS trg_fin_zahlungen_nur_insert ON fin_zahlungen;
CREATE TRIGGER trg_fin_zahlungen_nur_insert BEFORE UPDATE OR DELETE ON fin_zahlungen
  FOR EACH ROW EXECUTE FUNCTION fin_nur_insert();
