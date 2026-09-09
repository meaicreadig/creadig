-- ===========================================================================
-- 012 · GATE 18 — DIE RECHNUNG, UND DAS GELD, DAS NICHT DASSELBE IST
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`); hier steht, warum es so
-- aussieht.
--
-- ---------------------------------------------------------------------------
-- DIE LUECKE, DIE DIESES GATE SCHLIESST
--
-- G17 hat das Angebot gebaut, G19 die Lieferung. Dazwischen fehlte das
-- Stueck, an dem Geld haengt — und die Master-Architektur sagt dazu einen
-- Satz, der wie eine Randnotiz aussieht und keiner ist:
--
--   „Eine Rechnung wird gebraucht, sobald der erste Abschluss steht —
--    nicht ein Quartal spaeter."
--
-- ---------------------------------------------------------------------------
-- KEINE SPALTE `bezahlt`
--
-- Der Zahlungsstand faellt aus den erfassten Eingaengen. Ein Haken daneben
-- waere eine zweite Wahrheit ueber Geld, und die falsche gewinnt so lange,
-- bis der Steuerberater sie findet.
--
-- Dieselbe Entscheidung wie bei der Einordnung in G10, der Freigabe in G13
-- und dem Livetermin in G19: abgeleitet, nicht gespeichert.
--
-- ---------------------------------------------------------------------------
-- `payments` IST EINE TABELLE, KEINE SPALTE
--
-- Ein Eingang hat einen eigenen Betrag, ein eigenes Wertstellungsdatum und
-- einen eigenen BELEG. `evidence` ist NOT NULL — dieselbe Fundstellenpflicht
-- wie bei der Person in G11 und der Freigabe in G13. Ein Haken ohne
-- Kontoauszugszeile ist eine Erinnerung, und Erinnerungen gehoeren nicht in
-- eine Buchhaltung.
--
-- Eine Teilzahlung ist damit kein Sonderfall, sondern zwei Zeilen. Ein
-- System mit einem Bezahlt-Haken haette sie auf- oder abgerundet.
--
-- ---------------------------------------------------------------------------
-- `number` ERST BEIM STELLEN — DESHALB NULLABLE
--
-- Eine Rechnungsnummer ist fortlaufend und darf keine Luecke haben. Wer sie
-- schon dem Entwurf gibt, reisst eine, sobald ein Entwurf verworfen wird.
-- Eindeutig ist sie trotzdem: der partielle Index greift nur, wo eine Nummer
-- steht.
--
-- ---------------------------------------------------------------------------
-- `tax_snapshot` FRIERT DIE STEUERLAGE EIN
--
-- Das Dokument ist raus. Setzt der Owner spaeter `smallBusiness`, aendert
-- das nichts an einer Rechnung, die der Kunde bereits im Ordner hat.
-- Dieselbe Ueberlegung wie `offers.sent_snapshot` in G17. Eine Rechnung, die
-- sich rueckwirkend neu berechnet, ist kein Beleg.
--
-- ---------------------------------------------------------------------------
-- `offer_id` NOT NULL, `ON DELETE RESTRICT`
--
-- Die Positionen kommen aus dem angenommenen Angebot und werden nicht
-- abgetippt. Wer sie abtippt, hat zwei Umfaenge, und der Kunde hat den
-- anderen. Dieselbe Regel wie beim Projekt in G19.
--
-- ---------------------------------------------------------------------------
-- DREI CHECKS, JEDER GEGEN EINEN SATZ, DEN EIN BETRIEB SICH SONST ERZAEHLT
--
--   invoices_issued_check   „gestellt" ohne Nummer, Datum und
--                           Steuer-Schnappschuss gibt es nicht.
--   invoices_draft_check    Ein Entwurf traegt keine Nummer.
--   payments_amount_check   Ein Eingang ueber 0 ist kein Eingang.
--
-- Alle drei zusaetzlich zu `lib/rechnung.ts`, nicht statt seiner: Die eine
-- Fassung haelt die Oberflaeche ehrlich, die andere jeden anderen Weg an die
-- Tabelle — ein Import, eine Konsole, ein spaeteres Skript.
--
-- ---------------------------------------------------------------------------
-- WAS DIESE MIGRATION NICHT KANN
--
-- Sie macht das Haus nicht rechnungsfaehig. `imprintDetails.taxStatusPending`
-- steht seit G04 auf `true`; solange laesst `stellbarkeit()` keine Rechnung
-- STELLEN. Entwuerfe bleiben erlaubt. Die Sperre steht genau dort, wo ein
-- Dokument nach draussen ginge — und nirgends sonst.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  opportunity_id text NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  offer_id text NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  number text,
  positions jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_term_days integer NOT NULL DEFAULT 14,
  state text NOT NULL DEFAULT 'entwurf'
    CHECK (state IN ('entwurf','gestellt','storniert')),
  issued_at date,
  tax_snapshot jsonb,
  cancelled_at date,
  replaced_by text REFERENCES invoices(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_opportunity_idx ON invoices (opportunity_id);
CREATE INDEX IF NOT EXISTS invoices_state_idx ON invoices (state);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_number_idx ON invoices (number) WHERE number IS NOT NULL;

CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  invoice_id text NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount_cent bigint NOT NULL,
  value_date date NOT NULL,
  evidence text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_invoice_idx ON payments (invoice_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_issued_check') THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_issued_check
      CHECK (state <> 'gestellt' OR (number IS NOT NULL AND issued_at IS NOT NULL AND tax_snapshot IS NOT NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_draft_check') THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_draft_check
      CHECK (state <> 'entwurf' OR number IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_amount_check') THEN
    ALTER TABLE payments ADD CONSTRAINT payments_amount_check
      CHECK (amount_cent > 0);
  END IF;
END $$;
