-- Sprache der Terminbuchung: Link und Termin tragen sie, Seite und Mails richten sich danach.
ALTER TABLE booking_links ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'de';
ALTER TABLE appointments  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'de';

-- Der Code liest/schreibt window_from/window_to (Wochenfenster eines Links); 026 legt sie nicht an.
-- Idempotent nachgezogen, damit frische Datenbanken (Drill, Staging) dieselbe Form haben wie Produktion.
ALTER TABLE booking_links ADD COLUMN IF NOT EXISTS window_from date;
ALTER TABLE booking_links ADD COLUMN IF NOT EXISTS window_to date;
