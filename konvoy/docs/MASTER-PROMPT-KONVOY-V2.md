# MASTER-PROMPT — KONVOY V2: Zwei Phasen · Autos auf der Straße · Doppelspur

> Paste in eine **Claude-Code-Sitzung (Web oder Terminal) im Repo `meaicreadig/creadig`**, Arbeitsordner **`konvoy/`**.
> Arbeite **lang, detailliert, autonom, im Hintergrund** — jede Behauptung MIT BEWEIS (Screenshots, Build-Log, Fetch der Live-Daten).
> Lies zuerst `konvoy/README.md`, `konvoy/public/app.js`, `konvoy/public/data/event.js`, `konvoy/lib/route-builder.js`.

## 0) OBERSTE REGELN (nicht verhandelbar)
1. **Nur `konvoy/` anfassen.** Die creaDIG-Seite im Repo-Root (index.html, termin.html, …) bleibt unberührt. FIBERO (`v0-nexora`) nur lesen, nie ändern.
2. **Kein Framework, kein Bundler, keine Accounts.** Reines HTML/CSS/JS, MapLibre GL 5 per CDN, Supabase nur per REST-Polling (kein Realtime-Broadcast: Fan-out-Quota). Kein zweites Vercel-Projekt.
3. **Sandbox-Netz ist gesperrt** für Photon, OSRM, CARTO, unpkg, jsdelivr, Google Fonts und `*.vercel.app`. Lokal testen mit `?style=blank`, MapLibre aus npm (`npm pack maplibre-gl@5` → `dist/`), synthetischer `route.json`. Die echte Route entsteht nur im Vercel-Build; prüfen über das Vercel-MCP-Tool `web_fetch_vercel_url`.
4. **Beweis-Pflicht:** Playwright-Screenshots 390×844 (Chromium unter `/opt/pw-browsers`, `playwright` global installiert) vor/nach jeder Aufgabe; keine Console-Errors außer 404 auf `/api/config` lokal; `node --check` für jede JS-Datei.
5. **Deploy nur so:** Commit + Push auf den Arbeitsbranch, dann Production-Deployment über Vercel-MCP `create_deployment` mit `gitSource {type: github, org: meaicreadig, repo: creadig, ref: <Branch>}`, `target: production`, `skipAutoDetectionConfirmation: 1`, Team `team_FqD4awCyGrguY68scIPaxKJx`, Projekt `konvoy`. Build-Log lesen (`list_deployment_events`).
6. **Keine Secrets im Repo.** Supabase-Werte ausschließlich als Vercel-Env `SUPABASE_URL` / `SUPABASE_ANON_KEY`.
7. **Bei unklarer Straßenführung nicht raten:** Wegpunkt überspringen, Warnung im Build-Log, im Bericht klar benennen. Owner-Fragen am Ende sammeln, nicht zwischendurch blockieren.

## 1) STAND (live, nicht neu bauen — darauf aufbauen)
- **Live:** https://konvoy-live.vercel.app und https://hochzeitskonvoi.vercel.app · Demo `?demo=1`. Vercel-Projekt `konvoy`: Root Directory `konvoy`, Framework „Other“, Build-Command `node scripts/build-route.mjs`, Output `public/`. Production wurde bisher vom Branch `claude/elegant-clarke-n91q4h` deployt.
- **Dateien:** `public/index.html`, `public/styles.css`, `public/app.js`, `public/geo.js` (Haversine, Projektion, Teilstrecken), `public/data/event.js` (**einzige Konfigurationsdatei**), `public/data/route.json` (im Build erzeugt, gitignored), `api/route.js` (Fallback + Werkzeug), `api/config.js` (Supabase-Werte aus Env), `lib/route-builder.js` (Photon-Geocoding + OSRM, dieselben Dienste wie FIBERO), `scripts/build-route.mjs`, `supabase/schema.sql`, `README.md`.
- **Verhalten heute:** eine Phase; geplante Route grau, gefahrener Teil blau; Stationen S / 1 / Ziel; Autos als HTML-Marker 26×46 px mit **gerader Interpolation** zwischen zwei Positionen (2–3 s) → **Autos schneiden Kurven und „springen von der Straße“**; Labels rechts neben dem Auto; „Ich fahre mit“ ist **ohne Supabase deaktiviert**; Supabase ist noch nicht angelegt; Kopfzeile zeigt Platzhalter-Namen.
- **Route in `event.js` ist die alte Einphasen-Version** (mit falsch aufgelöster „Natruper Straße“ im Westen) — wird durch Aufgabe 1 ersetzt.

## 2) AUFGABE 1 — Route in zwei Phasen (`event.js` + Builder)
**Phase 1 „Zur Braut“ (gelin alma):** Start **Belmer Straße 18** (Haus des Bräutigams) → Schützenstraße → Tannenburgstraße → Heiligenweg → Schellenbergstraße → Narupstraße → **POCO, Hannoversche Straße 51** (`stop`, 5 Min, „hupen und feiern“) → Meller Straße → **Iburger Straße 46, 49082 Osnabrück-Schölerberg** (`pickup` = Haus der Braut; Notiz „Parken: Parkplatz Landesamt für Soziales, Iburger Straße 30“; Dauer ca. 20 Min als Platzhalter).
**Phase 2 „Konvoi mit Brautpaar“:** Miquelstraße → Meller Straße → Narupstraße → Schellenbergstraße → Mindener Straße → Buersche Straße → Wittekindstraße → Neumarkt → **Neuer Graben** (`end`, „Auflösung“).
1. Neuer Wegpunkt-Typ **`pickup`** = Phasengrenze (endet Phase 1, startet Phase 2). Builder behandelt ihn wie einen Pflicht-Halt.
2. Geocoding je Wegpunkt mit optionaler **`bbox`** (Osten: `[8.055, 52.25, 8.12, 52.295]` für Schellenberg-, Narup-, Meller-, Mindener-, Buersche Straße, damit nicht „Natruper Straße“ o. Ä. im Westen gefunden wird) und optional festen **`lat`/`lng`** (dann kein Geocoding — für exakte Kreuzungen).
3. **„Narupstraße“ ist Diktat-Schreibweise** (auch „Nahrup“ gehört). Mehrere Query-Varianten versuchen; findet Photon nichts im Suchraum: Via überspringen, Warnung ins Build-Log, im Bericht nennen. Wahrscheinlich liegt sie zwischen Schellenbergstraße (Schinkel) und Hannoversche Straße (Fledder).
4. OSRM-Wegpunkte in Straßenmitte erzeugen an Sackgassen **Wende-Schleifen** (so geschehen an der Schellenbergstraße). Nach dem Build die Geometrie prüfen; Schleifen mit fest gepinnten Kreuzungen (`lat`/`lng`) beseitigen.
5. Zeitplan: Start 12:00 Uhr, Fahrzeiten × `speedFactor` 1,5, Halte addieren (POCO 5, Braut 20).

## 3) AUFGABE 2 — Drei Farben + Legende
- Geplant Phase 1 **Gold `#C99A3C`**, Phase 2 **Schiefer `#5B6472`**, gefahren **Blau `#2457E6`** (liegt über beiden). Weiße Casing-Linie darunter, Richtungspfeile bleiben.
- Legende im Sheet-Peek (immer sichtbar): „Zur Braut · Konvoi mit Brautpaar · Gefahren“.
- Marker: Start grün „Start“ · POCO schwarz „1“ · Braut gold „♥ Braut“ · Ziel dunkel „Ziel“. Stationsliste im Sheet identisch, `pickup` mit „ca. 20 Min. bei der Braut“.

## 4) AUFGABE 3 — Doppelspur (hin und zurück)
- Alle Routen-Layer mit **`line-offset` nach rechts in Fahrtrichtung** (Rechtsverkehr), zoomabhängig, z. B. `['interpolate', ['linear'], ['zoom'], 12, 1.2, 15, 3, 17, 5]` px. So liegen Hin- und Rückweg auf denselben Straßen (Meller, Narup, Schellenberg) als **zwei parallele Spuren** nebeneinander, Gold neben Schiefer.
- Casing mit demselben Offset. Linie 5 px, Casing 9 px.
- **Autos auf ihre Spur:** Position ca. 4 m rechtwinklig rechts zur Fahrtrichtung versetzen (`Δlat = d·cos(θ+90°)/110540`, `Δlng = d·sin(θ+90°)/(111320·cos(lat))`).

## 5) AUFGABE 4 — Autos bleiben auf der Straße, hintereinander
1. **Map-Matching:** jede Position (Live und Demo) auf die Route projizieren (`project` in `geo.js`, mit Streckenfenster um den letzten Stand, weil Straßen zweimal befahren werden). Abstand ≤ 35 m → Auto **auf die Route snappen** (Streckenmeter `d`). Abstand > 60 m → Rohposition, halbtransparent, Label-Zusatz „abseits“.
2. **Animation entlang der Route statt gerader Linie:** von `d_alt` nach `d_neu` über ca. 2,6 s mit `pointAlong`; Heading = Segmentrichtung. Kein Kurvenschneiden mehr.
3. **Brautauto meldet seinen Fortschritt** (Streckenmeter `progress`) mit jeder Position; Zuschauer übernehmen ihn statt selbst zu projizieren (Spalte `progress real` in `schema.sql` + View `konvoy_live`). Fortschritt im Brautauto in localStorage sichern (Reload, 6 h gültig).
4. **Demo `?demo=1`:** Autos hintereinander mit 25–40 m Abstand, Updates alle 2 s, Bewegung entlang der Route; Halt bei POCO und bei der Braut simulieren; ganze Route in ca. 90 s.
5. **Kleinere Autos:** Mitfahrer **16×30 px**, Brautauto **22×40 px** (Goldschleife, Glow kleiner). Labels 10 px rechts vom Auto; unter Zoom 15 nur Brautauto + eigenes Auto beschriftet. Die Straße muss unter den Autos sichtbar bleiben.

## 6) AUFGABE 5 — Start beim Bräutigam, Phasenwechsel, Status
- Ohne Live-Brautauto steht ein **halbtransparentes Brautauto am Start** mit Label „♥ Bräutigam · Start“ (damat evinde bir araba gözüksün). Verschwindet, sobald das echte Brautauto sendet.
- Label des Brautautos: „♥ Bräutigam“ in Phase 1, **„♥ Brautpaar“ ab der Braut**.
- Status-Zeile: „Konvoi steht beim Bräutigam“ · „Auf dem Weg zur Braut · noch x km · Ankunft ca. hh:mm“ · „Bei der Braut · Gelin alma 💐“ · „Konvoi mit dem Brautpaar · noch x km“ · „Halt: POCO 🎉“ · „Ziel erreicht · der Konvoi löst sich auf 🎉“ · „Kein Signal vom Brautauto seit …“.
- Navigation-Button zeigt immer den **nächsten Halt** (POCO → Braut → Neuer Graben). Google-Maps-Gesamtroute höchstens 3 Zwischenziele (Handy-Limit).

## 7) AUFGABE 6 — „Ich fahre mit“ immer offen
- Button **immer aktiv**. Ohne Supabase: GPS lokal, eigenes Auto sichtbar, Hinweis im Dialog „Live-Teilen ist noch nicht eingeschaltet: Dein Auto siehst vorerst nur du selbst.“ Sobald `SUPABASE_URL`/`SUPABASE_ANON_KEY` gesetzt sind (`/api/config` liefert `configured: true`), wird geteilt — ohne Code-Änderung.
- Kopfzeile: **„Hidayet & Emine Akyol“**, „Start 12:00 Uhr“, Datum leer lassen (Countdown erst mit Datum). PIN bleibt konfigurierbar (Platzhalter `1234`, Owner nennt die echte).

## 8) IDEEN (optional — erst nach Freigabe des Owners bauen, im Bericht vorschlagen)
- **„Gelin alındı“-Moment:** beim Erreichen der Braut kurze Konfetti-Animation, Pin wird gold.
- **Konvoi-Meldung:** Brautauto sendet „Wir halten an / Weiter“ an alle (eine Zeile in der Tabelle, Banner oben).
- **QR-Seite `/qr`** für die Einladung + fertiger WhatsApp-Text.
- **Saal-Ansicht `?view=salon`:** nur „Konvoi kommt in x Min“ groß für die wartenden Gäste.
- **Reihenfolge:** jedes Auto bekommt eine Nummer („du bist Nr. 7“), Liste sortiert nach Position auf der Route.
- **Türkisch/Deutsch-Umschalter** (kurze TR-Texte: „Konvoya katıl“, „Gelin evi“, „Damat evi“).
- **Replay nach der Hochzeit** (Positionen behalten statt löschen) — Datenschutz, Owner entscheidet.

## 9) NICHT bauen
Kein Framework/Bundler · keine Accounts/Login · kein Realtime-Broadcast · kein zweites Vercel-Projekt · keine Änderung an FIBERO oder der creaDIG-Seite · keine Ideen aus §8 ohne Freigabe.

## 10) TEST + ABSCHLUSS
1. **Lokal:** Kopie nach Scratchpad, CDN-URLs auf lokale MapLibre ersetzen, Google-Fonts-Link entfernen, synthetische `route.json` mit `pickup`; Playwright 390×844: Start, Demo bei 10 s / 40 s / Ende, Sheet offen, Join-Dialog, PIN-Fehler, Fahrmodus. **Beweis:** Autos liegen sichtbar auf der Linie (auch in Kurven), Doppelspur auf der Rückstrecke sichtbar, Straße unter den Autos erkennbar.
2. **Deploy:** Commit + Push auf den Branch, Production-Deployment per Vercel-MCP (Regel 5), Build-Log prüfen (alle Stationen gefunden? Warnungen? Wende-Schleifen?), `https://konvoy-live.vercel.app/data/route.json` per `web_fetch_vercel_url` prüfen: 18 Stationen, 2 Phasen, Narupstraße im Osten.
3. **Bericht (Klartext):** was gefunden wurde (Narupstraße ja/nein, Schleifen, Distanz/Zeiten je Phase), Screenshots, Live-Links, offene Fragen an den Owner: Datum, PIN, Supabase-Werte, Dauer bei der Braut, Freigabe der Ideen.
