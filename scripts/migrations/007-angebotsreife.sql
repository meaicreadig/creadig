-- ===========================================================================
-- 007 · Angebotsreife am Vorgang
-- ===========================================================================
--
-- Bis hierher stand die Angebotsreife nur in zwei Markdown-Dateien. Eine
-- Regel, die nirgends im System steht, bindet niemanden: Ein Verkaeufer, der
-- die Dokumente nicht kennt, fragt einen Handwerksbetrieb nach fuenf
-- Systemtreibern, bevor er ihm ein fertiges Festpreis-Paket anbietet.
--
-- ZWEI SPALTEN, MEHR NICHT.
--
--   offer_kind          welche Angebotsart — entscheidet, WELCHE Belege gelten
--   readiness_evidence  welche Belege ein MENSCH bestaetigt hat
--
-- Bewusst KEINE Spalte `is_ready` und keine `readiness_score`. Reife ist
-- abgeleitet, nicht gespeichert: Sonst haette man zwei Wahrheiten, sobald
-- sich die Anforderungen einer Angebotsart aendern — und die gespeicherte
-- gewinnt immer die falsche.
--
-- Beide Spalten sind NULLABLE bzw. leer. Ein Vorgang ohne Angebotsart ist
-- kein Mangel: Am Anfang weiss niemand, was verkauft wird.
--
-- Idempotent. Aendert keine bestehende Zeile.
-- ===========================================================================

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS offer_kind text;
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS readiness_evidence text[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_offer_kind_check') THEN
    ALTER TABLE opportunities ADD CONSTRAINT opportunities_offer_kind_check
      CHECK (offer_kind IS NULL OR offer_kind IN
        ('website','pruefung','behebung','systemprojekt','betrieb'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS opportunities_offer_kind_idx ON opportunities (offer_kind);
