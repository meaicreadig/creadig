-- ===========================================================================
-- 014 · PROOF OPERATIONS P1 — DIE MESSREIHE
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`); hier steht, warum es so
-- aussieht.
--
-- ---------------------------------------------------------------------------
-- WARUM ES DIESE TABELLE GIBT
--
-- Phase 3 hat fuer fibero einen Betriebsbeleg veroeffentlicht und in jede
-- Zeile des Registers `gemessen: false` geschrieben. Das war richtig: Es gibt
-- keine Aufzeichnung des Zustands vor fibero, und ohne sie waere jede
-- Prozentzahl zurueckgerechnet.
--
-- Der Ausweg ist nicht, die Vergangenheit zu schaetzen. Der Ausweg ist, ab
-- heute zu messen. Dafuer braucht es einen Verlauf, und ein Verlauf ist das
-- Einzige in diesem Haus, das sich nicht ableiten laesst.
--
-- ---------------------------------------------------------------------------
-- `side` IST DER GANZE PUNKT
--
-- `ausgang` gegen `danach`. Ohne diese Spalte waere die Tabelle eine Kurve,
-- und aus einer Kurve laesst sich jede gewuenschte Verbesserung herauslesen,
-- indem man die Endpunkte waehlt.
--
-- `ausgang` heisst ausdruecklich NICHT `vorher`. Fuer fibero gibt es kein
-- Vorher; was heute erhoben wird, ist der Ausgangsstand MIT fibero. Er taugt
-- fuer kuenftige Vergleiche und nie als „vor fibero".
--
-- ---------------------------------------------------------------------------
-- (metric_key, side, measured_on) IST EINDEUTIG
--
-- Eine Kennzahl hat je Seite und Tag genau einen Wert. Zwei Werte fuer
-- denselben Tag waeren zwei Wahrheiten, und die spaeter geschriebene gewaenne,
-- ohne besser zu sein.
--
-- ---------------------------------------------------------------------------
-- `cases`, `source` UND `recorded_by` SIND NOT NULL
--
-- Ueber wie viele Faelle gemessen wurde, woher der Wert kommt und wer ihn
-- verantwortet, ist Teil der Messung und nicht ihre Randnotiz. Eine Zahl ohne
-- diese drei traegt nach `probeTraegt()` nichts — und was nichts traegt, soll
-- gar nicht erst in eine Form passen, die traegt aussieht.
--
-- ---------------------------------------------------------------------------
-- WAS HIER BEWUSST NICHT STEHT
--
-- Keine Spalte `improvement`, `trend` oder `percent`. Das Urteil faellt aus
-- zwei Proben und den Regeln in `lib/messreihe.ts` — und es faellt
-- ausdruecklich NICHT, wenn weniger als 28 Tage dazwischenliegen, weniger als
-- 20 Faelle dahinterstehen oder die Quellen sich unterscheiden.
--
-- Dieselbe Ueberlegung wie bei 013: Eine gespeicherte Trendzahl waere genau
-- das Automationstheater, das der Gate-Vertrag verbietet.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS measurement_samples (
  id text PRIMARY KEY,
  metric_key text NOT NULL,
  side text NOT NULL,
  measured_on date NOT NULL,
  value numeric NOT NULL,
  cases integer NOT NULL,
  source text NOT NULL,
  recorded_by text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS measurement_samples_key_idx
  ON measurement_samples (metric_key, side, measured_on);
