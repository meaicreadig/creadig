-- ===========================================================================
-- 034 · KONTOSTAND AUS BANK-IMPORT (nachgetragen, Teil des Professional-Passes)
--
-- Lesbare Fassung von zwei Spalten in FINANZ_SCHEMA (lib/finanz/store.ts).
--
-- Beim Import einer CSV- oder camt.053-Datei wird, sofern die Datei einen
-- Saldo mitliefert (Saldo-Spalte bzw. camt.053 ClsgBal/CLBD), dieser hier
-- abgelegt — als VORSCHLAG. fin_einstellungen.kontostand_cent/-_am ändert
-- sich dadurch NICHT automatisch; erst ein ausdrücklicher Klick
-- ("Übernehmen" in den Finanz-Einstellungen, kontostandAusBankUebernehmen())
-- schreibt ihn in den tatsächlichen Kontostand.
--
-- Idempotent. Additiv.
-- ===========================================================================

ALTER TABLE fin_einstellungen ADD COLUMN IF NOT EXISTS bank_saldo_cent bigint;
ALTER TABLE fin_einstellungen ADD COLUMN IF NOT EXISTS bank_saldo_am date;
