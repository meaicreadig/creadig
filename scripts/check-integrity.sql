-- ===========================================================================
-- Bestandspruefung — deterministische Fragen an die Datenbank.
--
-- Sie AENDERT NICHTS. Kein UPDATE, kein DELETE, keine Migration. Sie stellt
-- neun Fragen, auf die es genau eine richtige Antwort gibt: null.
--
-- ---------------------------------------------------------------------------
-- WARUM ES DIESE DATEI GIBT
-- Vier Bezuege im Schema sind ERZWUNGEN (Fremdschluessel), vier weitere sind
-- nur ANGENOMMEN:
--
--   activities.subject_id     polymorph (subject_type + subject_id) — ein
--                             Fremdschluessel ist hier technisch nicht
--                             moeglich, das ist kein Mangel.
--   leads.contact_id          zeigt auf contacts, ohne Zusicherung.
--   leads.organisation_id     zeigt auf organisations, ohne Zusicherung.
--   opportunities.from_lead_id zeigt auf leads, ohne Zusicherung — und genau
--                             an dieser Spalte haengt die Herkunft eines
--                             Vorgangs.
--
-- Warum keine Fremdschluessel nachgetragen wurden: `ADD CONSTRAINT … NOT
-- VALID` liesse sich ohne Pruefung bestehender Zeilen anlegen, wuerde aber
-- ab dann jede AENDERUNG einer Zeile ablehnen, deren Bezug schon vorher ins
-- Leere zeigte. Ohne Blick auf die echten Daten waere das eine Sperre auf
-- Verdacht — sie koennte die Oberflaeche fuer genau die Datensaetze
-- unbrauchbar machen, die man reparieren will.
--
-- Deshalb zuerst messen. Die Fremdschluessel gehoeren nachgetragen, sobald
-- diese Pruefung auf der echten Datenbank null liefert.
--
-- Aufruf:  psql -f scripts/check-integrity.sql -d "<verbindung>"
-- ===========================================================================

\pset pager off

SELECT 'verwaiste Anfrage → Kontakt' AS pruefung, count(*) AS treffer
  FROM leads l WHERE l.contact_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM contacts c WHERE c.id = l.contact_id)
UNION ALL
SELECT 'verwaiste Anfrage → Organisation', count(*)
  FROM leads l WHERE l.organisation_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM organisations o WHERE o.id = l.organisation_id)
UNION ALL
SELECT 'Vorgang → Anfrage zeigt ins Leere', count(*)
  FROM opportunities o WHERE o.from_lead_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM leads l WHERE l.id = o.from_lead_id)
UNION ALL
SELECT 'Aktivitaet ohne Gegenstand', count(*)
  FROM activities a WHERE
      (a.subject_type='lead'         AND NOT EXISTS (SELECT 1 FROM leads x         WHERE x.id=a.subject_id))
   OR (a.subject_type='contact'      AND NOT EXISTS (SELECT 1 FROM contacts x      WHERE x.id=a.subject_id))
   OR (a.subject_type='organisation' AND NOT EXISTS (SELECT 1 FROM organisations x WHERE x.id=a.subject_id))
   OR (a.subject_type='opportunity'  AND NOT EXISTS (SELECT 1 FROM opportunities x WHERE x.id=a.subject_id))
UNION ALL
SELECT 'Vorgang ohne Kontakt UND ohne Organisation', count(*)
  FROM opportunities WHERE contact_id IS NULL AND organisation_id IS NULL
UNION ALL
-- Ein laufender Vorgang ohne naechsten Schritt faellt aus jeder Ansicht
-- heraus. Das ist kein Datenfehler, aber eine Arbeitsluecke — und sie steht
-- hier, weil sie sonst niemandem auffaellt.
SELECT 'laufender Vorgang ohne naechsten Schritt', count(*)
  FROM opportunities WHERE status NOT IN ('won','lost') AND excluded_reason IS NULL
   AND (next_action IS NULL OR btrim(next_action) = '')
UNION ALL
SELECT 'Verlorener Vorgang ohne Grund', count(*)
  FROM opportunities WHERE status='lost' AND (lost_reason IS NULL OR btrim(lost_reason)='')
UNION ALL
SELECT 'Anfrage mit Befund, aber ohne Betriebscheck-Quelle', count(*)
  FROM leads WHERE check_score IS NOT NULL AND source <> 'betriebscheck'
UNION ALL
SELECT 'Betriebscheck-Befund ausserhalb 0..100', count(*)
  FROM leads WHERE check_score IS NOT NULL AND (check_score < 0 OR check_score > 100)
UNION ALL
SELECT 'doppelte Organisation (gleicher Name)', count(*)
  FROM (SELECT lower(btrim(name)) n FROM organisations GROUP BY 1 HAVING count(*) > 1) d
UNION ALL
SELECT 'doppelter Kontakt (gleiche E-Mail)', count(*)
  FROM (SELECT lower(btrim(email_normalised)) e FROM contacts
         WHERE email_normalised IS NOT NULL AND btrim(email_normalised) <> ''
         GROUP BY 1 HAVING count(*) > 1) d
ORDER BY 1;
