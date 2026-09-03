-- ===========================================================================
-- 003 · Vertrieb 1.0 — die bestehenden Anfragen aufteilen
--
-- ---------------------------------------------------------------------------
-- WAS HIER PASSIERT
-- Jede vorhandene Anfrage traegt heute vier Dinge in einer Zeile: den Eingang,
-- die Person, den Betrieb und den Vertriebsstand. Diese Migration zieht die
-- hinteren drei heraus und verknuepft sie zurueck. Die Anfrage selbst bleibt
-- unveraendert — sie ist der Beleg und darf sich nicht aendern.
--
-- ---------------------------------------------------------------------------
-- WIEDERHOLBAR
-- Jede Anweisung ist so gebaut, dass ein zweiter Lauf nichts tut:
--   Organisation/Kontakt  ON CONFLICT DO NOTHING auf dem Eindeutigkeitsindex
--   Verknuepfung          nur WHERE ... IS NULL
--   Verkaufschance        deterministische ID aus der Anfrage-ID
--   Chronik               NOT EXISTS auf denselben Eintrag
--
-- Das ist wichtiger als es klingt: Der Adapter fuehrt diese Datei beim ersten
-- Zugriff jedes Prozesses aus. Ein Backfill, der beim zweiten Mal Dubletten
-- baut, waere ein Datenleck mit Ansage.
--
-- ---------------------------------------------------------------------------
-- WAS NICHT PASSIERT
-- Nichts wird geloescht. `leads.sales_status` bleibt gefuellt stehen, auch
-- nachdem die Pipeline in `opportunities` umgezogen ist — die Spalte ist ab
-- jetzt Herkunftsnachweis, nicht mehr Arbeitsstand.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1 · Organisationen aus den Betriebsnamen
--
-- Nur wo ein Name wirklich steht. Ein leeres Feld wird keine Firma "Unbekannt"
-- — erfundene Organisationen waeren schlimmer als gar keine.
-- ---------------------------------------------------------------------------
INSERT INTO organisations (id, name, created_at, updated_at)
SELECT
  gen_random_uuid()::text,
  btrim(l.business),
  min(l.created_at),
  now()
FROM leads l
WHERE l.business IS NOT NULL AND btrim(l.business) <> ''
GROUP BY btrim(l.business)
ON CONFLICT (lower(name)) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2 · Kontakte aus den Absendern
--
-- Eine Person je normalisierter E-Mail. Wer dreimal geschrieben hat, wird
-- EIN Kontakt — genau der Fall, den die Spezifikation als Dublettenrisiko
-- benennt. Genommen werden die Angaben der JUENGSTEN Anfrage: ein Mensch
-- wechselt die Telefonnummer, nicht die Vergangenheit.
-- ---------------------------------------------------------------------------
INSERT INTO contacts (
  id, organisation_id, name, email, email_normalised, phone,
  relationship, last_interaction_at, created_at, updated_at
)
SELECT
  gen_random_uuid()::text,
  o.id,
  j.name,
  j.email,
  lower(btrim(j.email)),
  nullif(btrim(j.phone), ''),
  'unbekannt',
  j.last_seen,
  j.first_seen,
  now()
FROM (
  SELECT DISTINCT ON (lower(btrim(l.email)))
    l.email,
    l.name,
    l.phone,
    l.business,
    min(l.created_at) OVER (PARTITION BY lower(btrim(l.email))) AS first_seen,
    max(l.created_at) OVER (PARTITION BY lower(btrim(l.email))) AS last_seen
  FROM leads l
  WHERE l.email IS NOT NULL AND btrim(l.email) <> ''
  ORDER BY lower(btrim(l.email)), l.created_at DESC
) j
LEFT JOIN organisations o ON lower(o.name) = lower(btrim(j.business))
ON CONFLICT (email_normalised) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3 · Anfragen mit Kontakt und Organisation verknuepfen
-- ---------------------------------------------------------------------------
UPDATE leads l
   SET contact_id = c.id
  FROM contacts c
 WHERE l.contact_id IS NULL
   AND c.email_normalised = lower(btrim(l.email));

UPDATE leads l
   SET organisation_id = o.id
  FROM organisations o
 WHERE l.organisation_id IS NULL
   AND l.business IS NOT NULL
   AND lower(o.name) = lower(btrim(l.business));

-- ---------------------------------------------------------------------------
-- 4 · Verkaufschancen — nur wo wirklich gearbeitet wurde
--
-- Eine unangetastete Anfrage ist KEINE Verkaufschance. Sonst stuende am
-- ersten Tag eine Pipeline voll Vorgaenge, an denen nie jemand gearbeitet
-- hat, und die Zahl darueber waere ab Zeile eins falsch.
--
-- Gearbeitet heisst nachweisbar: der Status ist nicht mehr 'new', oder es
-- steht ein naechster Schritt. Beides kann nur ein Mensch gesetzt haben.
--
-- Die ID ist aus der Anfrage abgeleitet — damit legt ein zweiter Lauf keine
-- zweite Chance an.
-- ---------------------------------------------------------------------------
INSERT INTO opportunities (
  id, organisation_id, contact_id, title, status, source,
  next_action, next_action_at, last_contact_at, lost_reason,
  created_at, updated_at
)
SELECT
  'opp-' || l.id,
  l.organisation_id,
  l.contact_id,
  coalesce(nullif(btrim(l.business), ''), l.name),
  l.sales_status,
  l.source,
  l.next_action,
  l.next_action_at,
  l.updated_at,
  l.lost_reason,
  l.created_at,
  l.updated_at
FROM leads l
WHERE (l.sales_status <> 'new' OR l.next_action IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5 · Bearbeitungszustand der Anfragen
--
-- Wer eine Chance daraus gemacht hat, hat die Anfrage bearbeitet. Alles
-- andere bleibt 'neu' — und 'neu' ist hier eine Aussage ueber den Eingang,
-- nicht ueber den Vertrieb.
-- ---------------------------------------------------------------------------
UPDATE leads l
   SET handling_status = 'bearbeitet'
 WHERE l.handling_status = 'neu'
   AND EXISTS (SELECT 1 FROM opportunities o WHERE o.id = 'opp-' || l.id);

-- ---------------------------------------------------------------------------
-- 6 · Chronik-Startpunkte
--
-- Zwei Eintraege je Vorgang, beide aus belegten Daten:
--   der Eingang der Anfrage (Zeitpunkt: wann sie kam)
--   die Uebernahme in den Vertrieb (Zeitpunkt: letzte Aenderung)
--
-- Nichts davon ist erfunden. Was NICHT geschrieben wird, sind die
-- Statuswechsel VOR dieser Migration: die hat niemand protokolliert, und
-- eine nachtraeglich konstruierte Chronik waere eine Erzaehlung.
-- ---------------------------------------------------------------------------
INSERT INTO activities (id, subject_type, subject_id, kind, summary, created_at)
SELECT 'act-in-' || l.id, 'lead', l.id, 'lead.received',
       'Anfrage eingegangen über ' || l.source, l.created_at
FROM leads l
WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.id = 'act-in-' || l.id);

INSERT INTO activities (id, subject_type, subject_id, kind, summary, created_at)
SELECT 'act-opp-' || o.id, 'opportunity', o.id, 'opportunity.created',
       'Aus bestehender Anfrage übernommen (Migration 003)', o.created_at
FROM opportunities o
WHERE o.id LIKE 'opp-%'
  AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.id = 'act-opp-' || o.id);
