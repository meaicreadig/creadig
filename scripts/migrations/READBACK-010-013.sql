-- ===========================================================================
-- READBACK 010–013 · was nach der Migration wahr sein muss
--
-- Diese Datei AENDERT NICHTS. Sie liest.
--
-- ---------------------------------------------------------------------------
-- WARUM SIE DEN GANZEN BEREICH ABDECKT UND NICHT NUR 013
--
-- G27 braucht nur `owner_load_samples` (013). Der einzige unterstuetzte Weg,
-- das Schema zu aendern, ist `npm run db-migrate` — und der wendet die
-- gesamte `SCHEMA`-Liste an. In Produktion fehlen deshalb nicht eine,
-- sondern fuenf Tabellen: 010 `offers`, 011 `projects`, 012 `invoices` und
-- `payments`, 013 `owner_load_samples`.
--
-- Wer nur 013 nachsieht, prueft ein Fuenftel dessen, was geschehen ist.
--
-- ---------------------------------------------------------------------------
-- WIE
--
-- Vor der Migration einmal laufen lassen, danach noch einmal, und die
-- Abschnitte 5 und 6 vergleichen. Abschnitt 6 ist der eigentliche Punkt: Die
-- Zeilenzahlen der bestehenden Register muessen IDENTISCH sein. Die
-- Migration legt fuenf leere Tabellen an; wenn sich dabei eine Lead-Zahl
-- aendert, war es nicht die Migration.
--
-- Abschnitt 7 zaehlt vorher, was die BACKFILL-Anweisungen anfassen wuerden.
-- Acht der neun sind gegen Wiederholung gesichert (`ON CONFLICT DO NOTHING`,
-- `NOT EXISTS`, `WHERE ... IS NULL`); der neunte setzt `handling_status` von
-- „neu" auf „bearbeitet", wo bereits ein Vorgang existiert. Steht dort
-- ueberall 0, aendert der Lauf keine bestehende Zeile.
--
-- VOR DER MIGRATION melden die Abschnitte 2–4 fehlende Objekte und
-- Abschnitt 5 einen Fehler — das ist der erwartete Zustand, kein Problem.
-- ===========================================================================

\echo '--- 1 · Zieldatenbank ---'
SELECT current_database() AS db, current_schema() AS schema,
       (SELECT count(*) FROM information_schema.tables WHERE table_schema='public') AS tabellen;

\echo '--- 2 · Die fuenf Tabellen (erwartet nachher: 5 Zeilen) ---'
SELECT table_name FROM information_schema.tables
 WHERE table_schema='public'
   AND table_name IN ('offers','projects','invoices','payments','owner_load_samples')
 ORDER BY table_name;

\echo '--- 3 · Spaltenzahl je Tabelle (erwartet: 14/10/13/7/6) ---'
SELECT table_name, count(*) AS spalten FROM information_schema.columns
 WHERE table_schema='public'
   AND table_name IN ('offers','projects','invoices','payments','owner_load_samples')
 GROUP BY table_name ORDER BY table_name;

\echo '--- 4 · Die neun Indizes (erwartet nachher: 9 Zeilen) ---'
SELECT indexname FROM pg_indexes WHERE schemaname='public'
   AND indexname IN ('offers_opportunity_idx','offers_state_idx','projects_offer_idx',
     'projects_opportunity_idx','invoices_number_idx','invoices_opportunity_idx',
     'invoices_state_idx','payments_invoice_idx','owner_load_samples_day_idx')
 ORDER BY indexname;

\echo '--- 5 · owner_load_samples: sales_measured NOT NULL ohne Default ---'
SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
 WHERE table_schema='public' AND table_name='owner_load_samples'
 ORDER BY ordinal_position;

\echo '--- 6 · BESTEHENDE REGISTER — vorher und nachher identisch? ---'
SELECT 'leads' t, count(*) n FROM leads
UNION ALL SELECT '  leads neu',       count(*) FROM leads WHERE handling_status='neu'
UNION ALL SELECT '  leads exkl.',     count(*) FROM leads WHERE excluded_reason IS NOT NULL
UNION ALL SELECT 'organisations',     count(*) FROM organisations
UNION ALL SELECT 'contacts',          count(*) FROM contacts
UNION ALL SELECT 'opportunities',     count(*) FROM opportunities
UNION ALL SELECT 'activities',        count(*) FROM activities
UNION ALL SELECT 'locations',         count(*) FROM locations
UNION ALL SELECT 'research_cases',    count(*) FROM research_cases
UNION ALL SELECT 'research_evidence', count(*) FROM research_evidence
UNION ALL SELECT 'import_log',        count(*) FROM import_log
ORDER BY t;

\echo '--- 7 · Was die BACKFILLs anfassen wuerden (erwartet ueberall 0) ---'
SELECT 'BF1 organisations INSERT' b, count(*) n FROM (
  SELECT btrim(l.business) nm FROM leads l
   WHERE l.business IS NOT NULL AND btrim(l.business) <> '' GROUP BY btrim(l.business)) x
 WHERE NOT EXISTS (SELECT 1 FROM organisations o WHERE lower(o.name)=lower(x.nm))
UNION ALL SELECT 'BF2 contacts INSERT', count(*) FROM (
  SELECT DISTINCT lower(btrim(l.email)) em FROM leads l
   WHERE l.email IS NOT NULL AND btrim(l.email) <> '') y
 WHERE NOT EXISTS (SELECT 1 FROM contacts c WHERE c.email_normalised=y.em)
UNION ALL SELECT 'BF3 leads.contact_id UPDATE', count(*) FROM leads l
  JOIN contacts c ON c.email_normalised=lower(btrim(l.email)) WHERE l.contact_id IS NULL
UNION ALL SELECT 'BF4 leads.organisation_id UPDATE', count(*) FROM leads l
  JOIN organisations o ON lower(o.name)=lower(btrim(l.business))
 WHERE l.organisation_id IS NULL AND l.business IS NOT NULL
UNION ALL SELECT 'BF5 opportunities INSERT', count(*) FROM leads l
 WHERE (l.sales_status <> 'new' OR l.next_action IS NOT NULL)
   AND NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.id='opp-'||l.id)
UNION ALL SELECT 'BF6 opp.from_lead_id UPDATE', count(*) FROM opportunities o
 WHERE o.from_lead_id IS NULL AND o.id LIKE 'opp-%'
   AND EXISTS (SELECT 1 FROM leads l WHERE l.id=substring(o.id from 5))
UNION ALL SELECT 'BF7 leads.handling_status UPDATE', count(*) FROM leads l
 WHERE l.handling_status='neu' AND EXISTS (SELECT 1 FROM opportunities o WHERE o.id='opp-'||l.id)
UNION ALL SELECT 'BF8 activities INSERT (lead)', count(*) FROM leads l
 WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.id='act-in-'||l.id)
UNION ALL SELECT 'BF9 activities INSERT (opp)', count(*) FROM opportunities o
 WHERE o.id LIKE 'opp-%' AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.id='act-opp-'||o.id);

\echo '--- 8 · T0: genau eine Messung, kein zweiter Eintrag am selben Tag ---'
SELECT count(*) AS messungen,
       count(DISTINCT measured_on) AS messtage,
       min(measured_on) AS erste,
       max(measured_on) AS letzte
  FROM owner_load_samples;

\echo '--- 9 · Die Baseline selbst ---'
SELECT id, measured_on, sales_measured, note, created_at, counts
  FROM owner_load_samples ORDER BY measured_on;
