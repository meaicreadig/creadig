-- ===========================================================================
-- 005 · Der reale Bestand · 006 · Ausschluss der Abnahmedatensätze
-- ===========================================================================
--
-- LESBARE FASSUNG. Ausgeführt wird `seedBestand()` und `applyExclusions()` in
-- `lib/neon-client.ts`, gespeist aus `lib/vertrieb-bestand.ts`.
--
-- Warum die Daten in TypeScript stehen und nicht hier: Sie werden geprüft.
-- `scripts/check-bestand.mjs` bricht den Build, wenn ein Schlüssel doppelt
-- ist, ein Kontakt auf eine unbekannte Organisation zeigt oder jemand einen
-- Betrag einträgt. Eine SQL-Datei kann das nicht — sie fällt erst gegen die
-- echte Datenbank auf, und dann steht die Dublette schon drin.
-- ===========================================================================


-- ── 005 · Was der Import tut ───────────────────────────────────────────────
--
-- Für jede Organisation aus `BESTAND_ORGANISATIONEN`, einmalig je
-- `import_log`-Schlüssel:

/*
INSERT INTO organisations
  (id, name, lifecycle, website, phone, street, postal_code, city,
   country, industry, note, import_key, created_at, updated_at)
VALUES (gen_random_uuid()::text, $1, $2, …, now(), now())
ON CONFLICT (lower(name)) DO UPDATE SET
  import_key  = coalesce(organisations.import_key, excluded.import_key),
  lifecycle   = CASE WHEN organisations.lifecycle = 'unbekannt'
                     THEN excluded.lifecycle ELSE organisations.lifecycle END,
  website     = coalesce(organisations.website,     excluded.website),
  phone       = coalesce(organisations.phone,       excluded.phone),
  street      = coalesce(organisations.street,      excluded.street),
  postal_code = coalesce(organisations.postal_code, excluded.postal_code),
  city        = coalesce(organisations.city,        excluded.city),
  country     = coalesce(organisations.country,     excluded.country),
  industry    = coalesce(organisations.industry,    excluded.industry),
  note        = coalesce(organisations.note,        excluded.note),
  updated_at  = now();
*/

-- NIEMALS ÜBERSCHREIBEN.
--
-- Jedes Feld geht über `coalesce(vorhanden, neu)`: Was dasteht, bleibt stehen.
-- Trifft der Import auf eine Organisation, die schon aus einer Anfrage
-- entstanden ist, ERGÄNZT er sie und übernimmt sie — er ersetzt sie nicht.
-- Beim Namen ist das entscheidend: zwei Zeilen für denselben Betrieb wären
-- genau die Dublette, die dieser Import verhindern soll.
--
-- Die Kundenhistorie ist der einzige Sonderfall: Sie wird nur gesetzt, wenn
-- dort noch `unbekannt` steht. Eine Einstufung, die ein Mensch vorgenommen
-- hat, ist besser als eine aus einer Liste.
--
-- Standorte laufen über `ON CONFLICT (import_key) DO NOTHING` — die vier
-- Vegitat-Adressen entstehen einmal und bleiben vier Zeilen an EINER
-- Organisation.
--
-- KEINE EINZIGE VERKAUFSCHANCE.
-- Für keinen der Datensätze. Eine Chance ist ein laufendes Geschäft; aus „war
-- einmal Kunde" folgt keines. Eine Pipeline, die beim ersten Öffnen zwanzig
-- Vorgänge zeigt, an denen niemand arbeitet, ist ab dem ersten Tag unbrauchbar.
--
-- KEINE ERFUNDENEN STAMMDATEN.
-- Wo unten nichts steht, steht auch in der Datenbank nichts. Bei
-- „Allrein-ofra", „MAS Küchenoutlet", „IKV Lohne" und „Bergkamen
-- Bildungsakademie" ist die Organisation nicht eindeutig identifizierbar; bei
-- ARAG, freenet und dem Integrationsrat wäre die naheliegende Zuordnung
-- fachlich unwahr (eine Agentur ist nicht ihr Konzern, ein Shop nicht seine
-- Kette, ein kommunales Gremium keine GmbH). Diese Fälle tragen ihre offene
-- Frage im Feld `note`.


-- ── 006 · Was NICHT auf die Arbeitsfläche gehört ───────────────────────────
--
-- MARKIEREN, NICHT LÖSCHEN.
--
-- `DELETE` gegen Namen ist unumkehrbar und protokolllos. Trifft es einmal
-- daneben — ein echter Kunde, der zufällig ähnlich heisst — merkt es niemand,
-- weil die Zeile weg ist. Ein Ausschlussgrund kostet eine Spalte, ist in beide
-- Richtungen umkehrbar und sagt ausserdem, WARUM.

/*
UPDATE organisations SET excluded_reason = $2, updated_at = now()
 WHERE lower(btrim(name)) = lower(btrim($1)) AND excluded_reason IS NULL;
*/

-- EXAKT, NICHT UNSCHARF.
--
-- Verglichen wird der ganze Name, kleingeschrieben und getrimmt. Kein
-- `ILIKE '%Yilmaz%'` — dieses Muster würde „Yilmaz Dachtechnik"
-- (Abnahmedatensatz) UND „Dr. Hüseyin Yilmaz" (echter Prospect) treffen, und
-- der Prospect verschwände lautlos. Genau davor schützt der exakte Vergleich,
-- und `scripts/check-bestand.mjs` bewacht, dass die beiden Listen sich nie
-- überschneiden.
--
-- Die einzige Ausnahme ist `@beispiel.invalid`: eine nach RFC 2606 für Tests
-- reservierte Endung, die keinem Menschen gehören kann.
--
-- `AND excluded_reason IS NULL` sorgt dafür, dass ein von Hand aufgehobener
-- Ausschluss nicht wiederkommt — zusammen mit dem Einmal-Gedächtnis in
-- `import_log`.


-- ── Vorgänge erben den Ausschluss ihrer Herkunft ───────────────────────────
--
-- Ohne diesen Schritt bliebe die Pipeline der einzige Ort, an dem die
-- Abnahmedatensätze weiterlaufen — und ausgerechnet dort ist eine erfundene
-- Zeile am teuersten.
--
-- Läuft bei JEDEM Start, nicht einmalig: Ein Vorgang, der später aus einer
-- ausgeschlossenen Anfrage entsteht, muss denselben Weg nehmen.

/*
UPDATE opportunities o SET excluded_reason = l.excluded_reason, updated_at = now()
  FROM leads l
 WHERE o.from_lead_id = l.id
   AND l.excluded_reason IS NOT NULL AND o.excluded_reason IS NULL;
*/


-- ── Was der Ausschluss NICHT tut ───────────────────────────────────────────
--
-- Er macht Datensätze unsichtbar, nicht unauffindbar. Listen und Zählungen
-- filtern sie heraus; wer einem Verweis auf einen ausgeschlossenen Datensatz
-- folgt, sieht ihn samt Begründung. Unsichtbar machen und unauffindbar machen
-- sind zwei verschiedene Dinge, und nur das erste ist hier gewollt.
