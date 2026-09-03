-- ===========================================================================
-- 006 · Der Betriebscheck-Befund als Feld
--
-- Spiegelt die Ergaenzung in `lib/neon-client.ts`. Wie 002 aendert diese
-- Migration keine Zeile und loescht nichts: Sie haengt drei nullable Spalten
-- an `leads`.
--
-- WARUM SIE NOETIG IST
-- Der Befund wird seit MP-D gespeichert — als formatierter Text in
-- `leads.message`. Lesbar, aber nicht auswertbar: Score, Engpass und die
-- Zahl der „Nicht"-Antworten sind Fliesstext.
--
-- WARUM DIE ANTWORTEN NICHT MITKOMMEN
-- Sie stehen bereits im Text. Ein zweites Mal als JSON gehalten waeren es
-- zwei Wahrheiten ueber dieselbe Einreichung, und die zweite zeigt niemand.
--
-- WARUM ALLE DREI NULLABLE SIND
-- Die meisten Anfragen kommen ueber das Kontaktformular und haben keinen
-- Befund. NULL heisst „nicht erhoben" — nicht „Score 0".
--
-- Idempotent: laesst sich mehrfach ausfuehren.
-- ===========================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS check_score        integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS check_bottleneck   text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS check_manual_spots integer;
