-- ===========================================================================
-- 013 · READBACK — was nach der Migration wahr sein muss
--
-- Diese Datei AENDERT NICHTS. Sie liest.
--
-- ---------------------------------------------------------------------------
-- WARUM ES SIE GIBT
--
-- `npm run db-migrate -- --check` sagt nur, wie viele Spalten es gibt. Das
-- beantwortet die Frage nicht, die vor einer Produktionsmigration steht:
-- Was genau ist danach anders, und ist sonst nichts passiert?
--
-- Vor der Migration einmal laufen lassen, danach noch einmal. Abschnitt 7
-- ist der eigentliche Punkt: Die Zeilenzahlen der bestehenden Register
-- muessen identisch sein. Migration 013 legt eine leere Tabelle an — wenn
-- sich dabei eine Lead-Zahl aendert, war es nicht 013.
--
-- Abschnitt 8 steht da, weil `db-migrate` nicht nur 013 anwendet, sondern
-- das ganze SCHEMA und alle BACKFILL-Anweisungen. Acht der neun Backfills
-- sind gegen Wiederholung gesichert (`ON CONFLICT DO NOTHING`, `NOT
-- EXISTS`, `WHERE ... IS NULL`). Der neunte setzt `handling_status` von
-- „neu" auf „bearbeitet", wo bereits ein Vorgang existiert — hat jemand
-- eine Anfrage von Hand auf „neu" zurueckgestellt, waehrend ihr Vorgang
-- steht, stellt der Backfill sie zurueck. Abschnitt 8 zaehlt genau diese
-- Faelle VORHER. Steht dort 0, aendert die Migration keine einzige Zeile.
--
-- ---------------------------------------------------------------------------
-- VOR DER MIGRATION MELDEN 5 UND 6 EINEN FEHLER
--
--     ERROR:  relation "owner_load_samples" does not exist
--
-- Das ist der erwartete Zustand und kein Problem — die Tabelle gibt es ja
-- noch nicht. Er wird hier ABSICHTLICH nicht weggeschrieben: Ein Readback,
-- der auch dann schweigt, wenn nichts da ist, beantwortet die Frage nicht,
-- fuer die man ihn laufen laesst. Nach der Migration muessen beide Zeilen
-- Zahlen liefern.
-- ===========================================================================

-- G27 · Readback nach Migration 013 — NUR LESEN, aendert nichts.
-- Aufruf:  psql "$DATABASE_URL" -f scripts/migrations/013-readback.sql

\echo '--- 1 · Tabelle vorhanden? (erwartet: 1 Zeile) ---'
SELECT table_name FROM information_schema.tables
 WHERE table_schema='public' AND table_name='owner_load_samples';

\echo '--- 2 · Spalten exakt wie 013? (erwartet: 6 Zeilen, sales_measured NOT NULL ohne Default) ---'
SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
 WHERE table_schema='public' AND table_name='owner_load_samples'
 ORDER BY ordinal_position;

\echo '--- 3 · Tages-Eindeutigkeitsindex? (erwartet: owner_load_samples_day_idx, UNIQUE) ---'
SELECT indexname, indexdef FROM pg_indexes
 WHERE schemaname='public' AND tablename='owner_load_samples';

\echo '--- 4 · Keine gespeicherte Trend-Spalte? (erwartet: 0 Zeilen) ---'
SELECT column_name FROM information_schema.columns
 WHERE table_schema='public' AND table_name='owner_load_samples'
   AND column_name ~* '(trend|entlastung|prozent|delta|score)';

\echo '--- 5 · Messreihe (nach db-migrate erwartet: 0; nach Baseline: genau 1) ---'
SELECT count(*) AS messungen FROM owner_load_samples;

\echo '--- 6 · Die Baseline selbst (nach ownerlast-baseline) ---'
SELECT id, measured_on, sales_measured, created_at, counts
  FROM owner_load_samples ORDER BY measured_on;

\echo '--- 7 · Fremddaten unveraendert? Zeilenzahlen VOR und NACH vergleichen ---'
SELECT 'leads' t, count(*) n FROM leads
UNION ALL SELECT 'opportunities', count(*) FROM opportunities
UNION ALL SELECT 'organisations', count(*) FROM organisations
UNION ALL SELECT 'contacts',      count(*) FROM contacts
UNION ALL SELECT 'activities',    count(*) FROM activities
UNION ALL SELECT 'invoices',      count(*) FROM invoices
ORDER BY t;

\echo '--- 8 · Der einzige Backfill, der bestehende Daten aendern KANN (erwartet: 0) ---'
SELECT count(*) AS wuerden_umgestellt
  FROM leads l
 WHERE l.handling_status = 'neu'
   AND EXISTS (SELECT 1 FROM opportunities o WHERE o.id = 'opp-' || l.id);
