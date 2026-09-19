# KONVOY — Hochzeitskonvoi · Live-Karte

Eine mobile One-Page-Seite für den Hochzeitskonvoi: feste Route auf der Karte, gefahrener Weg **blau**, Rest **grau**,
Ziel markiert, Autos live per GPS. Das Brautauto führt, jedes Auto tippt oben „Ich fahre mit“ und gibt seinen Namen ein.

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

Ohne diese Werte läuft die Seite trotzdem (Route, Stationen, Zeiten), nur ohne Live-Autos. Der Anon-Key ist per Design öffentlich.

## Anpassen

- **Namen, Datum, Startzeit, PIN, Stationen:** `public/data/event.js`. Nach dem Push berechnet der Vercel-Build die Route neu.
- **Route prüfen:** `https://<domain>/api/route?fresh=1` zeigt die aktuell aufgelösten Stationen. Lokal: `node scripts/build-route.mjs`.
- **Demo ohne GPS:** `https://<domain>/?demo=1` zeigt einen simulierten Konvoi.

## Am Hochzeitstag

- Brautauto: „Ich fahre mit“ → Häkchen *Brautauto* → PIN. Handy in die Halterung, Seite offen lassen (Bildschirm bleibt an).
- Gäste: Link per WhatsApp, „Ich fahre mit“ → Name → Farbe. Wer nur schauen will, öffnet einfach den Link.
- Supabase pausiert kostenlose Projekte nach einer Woche ohne Nutzung: am Vortag einmal die Seite öffnen bzw. das Projekt im Dashboard prüfen.

## Danach

Live-Daten löschen: Supabase-Projekt löschen (oder `delete from public.konvoy_positions;`). Es wird nichts anderes gespeichert.
