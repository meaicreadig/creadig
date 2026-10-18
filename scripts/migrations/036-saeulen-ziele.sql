-- 036 · Säulen-Durchlauf (additiv, idempotent)
-- Geschäftsfelder neu geordnet ('it'/'software'/'ecommerce' → 'digitalprodukte',
-- 'beratung' und 'content' neu; 'glasfaser'/'privat'/'sonstiges' unverändert),
-- plus Ziel-Tracker für Säulen ohne echte Buchungen.
-- Spiegelt lib/finanz/belege.ts (BELEGE_SCHEMA), lib/finanz/auftraege/store.ts
-- (AUFTRAEGE_SCHEMA) und lib/finanz/ziele.ts (ZIELE_SCHEMA).
--
-- WICHTIG — fin_buchungen ist GoBD-festgeschrieben (030-gobd-festschreibung.sql):
-- eine bereits 'gebucht'e, nicht-fibero Zeile lässt sich nicht mehr per UPDATE
-- übersetzen (der Trigger wirft eine Exception). Die UPDATE unten übersetzt
-- deshalb nur, was der Trigger noch zulässt; eine schon gebuchte Alt-Zeile
-- bleibt bei ihrem Wert und wird beim Lesen übersetzt (geschaeftsfeldSchluessel()
-- in lib/finanz/beleg-felder.ts, angewendet in felder.ts/diversifikation.ts).

ALTER TABLE fin_buchungen ADD COLUMN IF NOT EXISTS geschaeftsfeld text;

UPDATE fin_buchungen SET geschaeftsfeld = 'digitalprodukte'
 WHERE geschaeftsfeld IN ('it','software','ecommerce') AND (status <> 'gebucht' OR quelle = 'fibero');

UPDATE fin_belege SET geschaeftsfeld = 'digitalprodukte'
 WHERE geschaeftsfeld IN ('it','software','ecommerce');

ALTER TABLE fin_leistungen ALTER COLUMN geschaeftsfeld SET DEFAULT 'digitalprodukte';
UPDATE fin_leistungen SET geschaeftsfeld = 'digitalprodukte'
 WHERE geschaeftsfeld IN ('it','software','ecommerce');

ALTER TABLE fin_dokumente ALTER COLUMN geschaeftsfeld SET DEFAULT 'digitalprodukte';
UPDATE fin_dokumente SET geschaeftsfeld = 'digitalprodukte'
 WHERE geschaeftsfeld IN ('it','software','ecommerce');

-- AI-UGC-Video (Phase 2, zweiphasig) — Phase A: interne Methode, inaktiv,
-- taucht deshalb in keinem Angebot auf. Phase B: Owner aktiviert, Geschäftsfeld
-- wechselt im selben Schritt auf 'digitalprodukte' (leistungUmschalten() in
-- app/(finanz)/finanz/auftraege/actions.ts).
INSERT INTO fin_leistungen (id, titel, beschreibung, einheit, preis_cent, ust_satz, geschaeftsfeld, aktiv) VALUES
  ('leistung-ai-ugc-video', 'AI-UGC-Video', 'Interne Methode (Phase A) -- noch nicht verkaufsfaehig. Aktivieren wechselt automatisch auf Digitalprodukte (Phase B).', 'Pauschal', 0, 19, 'content', false)
ON CONFLICT (id) DO NOTHING;

-- Ziel-Tracker (Phase 1) — der Fortschritt ist nie eine eigene Zahl, sondern
-- immer aus fin_buchungen derselben Säule seit Anlage des Ziels abgeleitet
-- (siehe ladeZiele() in lib/finanz/ziele.ts).
CREATE TABLE IF NOT EXISTS fin_ziele (
    id text PRIMARY KEY,
    saeule text NOT NULL CHECK (saeule IN ('digitalprodukte','beratung','content','glasfaser','privat','sonstiges')),
    titel text NOT NULL,
    zielbetrag_cent bigint NOT NULL CHECK (zielbetrag_cent >= 0),
    frist date NOT NULL,
    status text NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','erreicht','verworfen')),
    notiz text,
    created_at timestamptz NOT NULL DEFAULT now(),
    erreicht_at timestamptz);

CREATE INDEX IF NOT EXISTS fin_ziele_saeule_idx ON fin_ziele (saeule, frist);

-- Je ein Platzhalter (Betrag 0, klar benannt) für die drei Säulen mit
-- Umsatzziel, damit die Seite /finanz/ziele beim ersten Öffnen nicht leer
-- ist, aber niemand eine erfundene Zahl für eine echte hält.
INSERT INTO fin_ziele (id, saeule, titel, zielbetrag_cent, frist, notiz) VALUES
   ('ziel-platzhalter-digitalprodukte', 'digitalprodukte', 'Platzhalter – vom Owner zu ersetzen', 0, (date_trunc('year', now()) + interval '1 year' - interval '1 day')::date, 'Vom Owner zu ersetzen.'),
   ('ziel-platzhalter-beratung', 'beratung', 'Platzhalter – vom Owner zu ersetzen', 0, (date_trunc('year', now()) + interval '1 year' - interval '1 day')::date, 'Vom Owner zu ersetzen.'),
   ('ziel-platzhalter-content', 'content', 'Platzhalter – vom Owner zu ersetzen', 0, (date_trunc('year', now()) + interval '1 year' - interval '1 day')::date, 'Vom Owner zu ersetzen.')
ON CONFLICT (id) DO NOTHING;
