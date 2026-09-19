# KONVOY — Hochzeitskonvoi · Live-Karte

Eine mobile One-Page-Seite für den Hochzeitskonvoi in **zwei Phasen**: erst vom Bräutigam **zur Braut** (Route **gold**),
dann als **Konvoi mit dem Brautpaar** zum Ziel (Route **schiefer**), gefahrener Weg **blau** darüber. Alle Linien liegen rechts
in Fahrtrichtung versetzt — wo Hin- und Rückweg dieselbe Straße nutzen, sieht man zwei Spuren nebeneinander.
Autos laufen live per GPS **auf der Straße** (Map-Matching entlang der Route, keine Abkürzungen durch Kurven).
Das Brautauto führt und meldet seinen Fortschritt; jedes Auto tippt oben „Ich fahre mit“ und gibt seinen Namen ein.

Technik wie bei FIBERO: **MapLibre GL + CARTO-Basemap**, Geocoding über **Photon**, Routing über **OSRM**.
Live-Positionen über eine kleine **Supabase**-Tabelle (Polling alle 3 s, keine Accounts). Kein Build-Schritt, reines HTML/CSS/JS.

## Dateien

| Datei | Zweck |
|---|---|
| `public/` (`index.html`, `styles.css`, `app.js`, `geo.js`) | Die Seite (mobil, Deutsch) |
| `public/data/event.js` | **Die einzige Datei, die pro Hochzeit angepasst wird**: Namen, Datum, Startzeit, PIN, Route |
| `public/data/route.json` | Eingefrorene Route (Geometrie + Stationen). Wird bei jedem Vercel-Build erzeugt |
| `api/route.js` | Geocodiert die Stationen aus `event.js` und holt die Straßenroute (Fallback + Werkzeug) |
| `api/config.js` | Gibt die öffentlichen Supabase-Zugangsdaten aus den Vercel-Umgebungsvariablen aus |
| `supabase/schema.sql` | Tabelle + Rechte für die Live-Positionen, einmal im SQL-Editor ausführen |

## Einrichtung (einmalig, ca. 5 Minuten)

1. **Supabase:** Neues Projekt anlegen (getrennt von FIBERO) → *SQL Editor* → Inhalt von `supabase/schema.sql` einfügen → *Run*.
2. **Zugangsdaten:** *Project Settings → API*: `Project URL` und `anon public` Key kopieren.
3. **Vercel:** Im Projekt `konvoy` die Umgebungsvariablen setzen und neu deployen:
   `SUPABASE_URL` = Project URL · `SUPABASE_ANON_KEY` = anon public Key.

Ohne diese Werte läuft die Seite trotzdem (Route, Stationen, Zeiten). „Ich fahre mit“ funktioniert dann nur lokal: man sieht
sein eigenes Auto, geteilt wird nichts. Sobald die Werte gesetzt sind, wird ohne Code-Änderung geteilt. Der Anon-Key ist per Design öffentlich.

Wer die Tabelle schon aus der ersten Version hat: `supabase/schema.sql` einfach noch einmal ausführen (ergänzt die Spalte `progress`).

## Anpassen

- **Namen, Datum, Startzeit, PIN, Stationen:** `public/data/event.js`. Nach dem Push berechnet der Vercel-Build die Route neu.
- **Wegpunkt-Typen:** `start` · `via` (nur durchfahren) · `stop` (Halt mit `dwell` Minuten) · `pickup` (Braut abholen = Grenze
  zwischen Phase 1 und 2, mit `dwell`) · `end`. Optional je Wegpunkt: `bbox` (eigener Suchraum fürs Geocoding) oder feste
  `lat`/`lng` (dann kein Geocoding).
- **Wende-Schleifen:** Liegt ein Wegpunkt hinter der Abbiege-Kreuzung oder in einer Sackgasse, fährt OSRM hin und zurück.
  Der Build meldet das als `! Wende-Schleife bei … m` — dann den Wegpunkt mit `lat`/`lng` auf den befahrenen Abschnitt pinnen.
- **Route prüfen:** `https://<domain>/api/route?fresh=1` zeigt die aktuell aufgelösten Stationen. Lokal: `node scripts/build-route.mjs`
  (zeigt Phasen, Streckenmeter je Station, Warnungen).
- **Demo ohne GPS:** `https://<domain>/?demo=1` zeigt einen simulierten Konvoi.

## Am Hochzeitstag

- Brautauto: „Ich fahre mit“ → Häkchen *Brautauto* → PIN. Handy in die Halterung, Seite offen lassen (Bildschirm bleibt an).
- Gäste: Link per WhatsApp, „Ich fahre mit“ → Name → Farbe. Wer nur schauen will, öffnet einfach den Link.
- Supabase pausiert kostenlose Projekte nach einer Woche ohne Nutzung: am Vortag einmal die Seite öffnen bzw. das Projekt im Dashboard prüfen.

## Danach

Live-Daten löschen: Supabase-Projekt löschen (oder `delete from public.konvoy_positions;`). Es wird nichts anderes gespeichert.
