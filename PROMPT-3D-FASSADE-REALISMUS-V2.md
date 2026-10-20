# Master-Prompt: 3D-Zentrale — echte Materialien, echte Fassade, echte Personen-Details

**Branch:** `3d-fassade-material` (liegt im Worktree `../creadig-3d-fassade`, bereits von `origin/feat/system-haus-site` HEAD `5a4fa3a` — inklusive PR #93 "hauptsitz-realistisch" — abgezweigt).

**Ununterbrochen bis zum Ende arbeiten.** Kein Zwischenstopp für Rückfragen, außer bei einer echten Mehrdeutigkeit, die den Kern der Aufgabe betrifft (siehe "Erlaubte Pause" unten). Alle Entscheidungen, die im Rahmen dieses Prompts fallen, triffst du selbst und dokumentierst sie am Ende.

## Sicherheits-Setup (zuerst, genau so)

```bash
cd "/Users/muhammedeminakyol/Documents/creadig-3d-fassade"
git fetch origin
git log -1 --format="%H %s"   # muss 5a4fa3a... "Merge pull request #93" zeigen, plus einen eigenen Commit "PBR-Fassadenmaterialien"
git status --short            # sollte sauber sein
```

Falls `git log -1` NICHT den PBR-Material-Commit zeigt: STOP, nichts weiter tun, das ist der falsche Checkout — melden statt weiterarbeiten.

Nur lokal committen. **Kein Push.** `@react-three/postprocessing` ist bereits installiert (`node_modules` vorhanden) — du hast kein Netz, also NICHT versuchen, weitere Pakete zu installieren oder `npm install`/`npm ci` neu laufen zu lassen; das würde nur fehlschlagen und Zeit kosten.

## Kontext — was hier wirklich passiert

`components/admin/zentrale/hauptsitz-3d.tsx` ist eine echte react-three-fiber-Szene (kein Spiel, kein Video) — das 3D-Hauptgebäude im Admin-Cockpit (`/admin`). Der Owner (Emin) hat das Ergebnis von PR #93 gesehen und war mit der visuellen Qualität nicht zufrieden: wirkt wie eine Animation/ein Spiel statt wie ein echtes Gebäude, Personen ohne Haare/echte Handbewegung, Fassade ist eine durchgehende Glasscheibe statt "Ecken massiv, Mitte Glas", beim Reinklicken in ein Stockwerk "bricht" die Darstellung sichtbar.

**Wichtige Leitplanke, die der Owner explizit gesetzt hat:** keine fotorealistischen externen 3D-Assets (keine Mixamo-Charaktere, keine gescannten Baumodelle) — das wurde geprüft und verworfen (Dateigröße/Komplexität nicht vertretbar für eine Web-Seite). Stattdessen: echte PBR-Texturen (bereits besorgt, siehe unten) + verbesserte prozedurale Geometrie + Post-Processing. Bitte NICHT von dieser Leitplanke abweichen, auch wenn es verlockend wirkt, doch ein externes Modell einzubinden.

## Was schon bereitliegt

- `public/3d/metal-plate/{diff,nor,arm}.jpg` — Alu/Stahl-Blech, CC0 (Poly Haven), 1k, gekachelt
- `public/3d/smooth-concrete/{diff,nor,arm}.jpg` — glatter Sichtbeton, CC0, 1k, gekachelt
- `public/3d/brushed-concrete/{diff,nor,arm}.jpg` — gebürsteter Beton, CC0, 1k, gekachelt
- `public/3d/README.md` — erklärt die Dateikonvention (`diff` = Albedo, `nor` = Normal Map in OpenGL-Konvention/passt direkt zu Three.js, `arm` = R:AO G:Roughness B:Metalness als ein Bild)
- `@react-three/postprocessing@3.2.1` in `node_modules`, einsatzbereit

Lade sie mit `useTexture` aus `@react-three/drei`. Beispiel für ein Material mit allen drei Maps:

```tsx
const [diff, nor, arm] = useTexture([
  "/3d/metal-plate/diff.jpg",
  "/3d/metal-plate/nor.jpg",
  "/3d/metal-plate/arm.jpg",
])
;[diff, nor, arm].forEach((t) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(sx, sy) // an Bauteilgröße anpassen, sonst wirkt's gestreckt/verschwommen
})
diff.colorSpace = THREE.SRGBColorSpace
```

```tsx
<meshStandardMaterial
  map={diff}
  normalMap={nor}
  aoMap={arm}
  roughnessMap={arm}
  metalnessMap={arm}
  metalness={1}
  roughness={1}
/>
```

`aoMap` braucht einen zweiten UV-Kanal (`uv2`) auf der Geometrie — bei `boxGeometry`/`RoundedBox` ist das nicht automatisch da; entweder `geometry.setAttribute("uv2", geometry.attributes.uv)` setzen oder, wenn das zu viel Aufwand macht, `aoMap` weglassen (AO kommt ohnehin großteils aus den echten Schatten/ContactShadows der Szene) und nur `normalMap` + `roughnessMap` + `metalnessMap` nutzen. Pragmatisch entscheiden, nicht an diesem Detail hängenbleiben.

## Phase 1 — Bug: Gehirn-Säule hängt in der Luft, wenn ein Stockwerk "angehoben" wird

**Datei:** `components/admin/zentrale/hauptsitz-3d.tsx`

Klickt man auf ein Stockwerk (`onEtage`), heben sich alle Stockwerke darüber um `ANHEBEN = 9` Meter an (`Geschoss`, Zeile ~394-400: `angehoben = fokus.etage !== null && etage.index > fokus.etage`). Die `Gehirn`-Säule (Zeile ~154-178) ist aber über die GESAMTE Gebäudehöhe fix positioniert und bewegt sich nicht mit — das erzeugt genau den "Bruch" / das freischwebende Teil, das der Owner in den Screenshots zu Recht als kaputt wahrgenommen hat.

Löse das so, dass die Säule immer durchgängig und plausibel wirkt, zum Beispiel (eigene, bessere Lösung ist erlaubt, Kernpunkt ist: **keine sichtbare Lücke/kein freischwebendes Teilstück mehr**):
- Segmentiere `Gehirn` in zwei Teile: ein unteres Segment von Boden bis zur Höhe des fokussierten Stockwerks (bleibt stehen) und ein oberes Segment für die angehobenen Stockwerke (bewegt sich mit `ANHEBEN`, exakt synchron zur `Geschoss`-Gruppe — gleiche `damp`-Parameter wie in `Geschoss`/`Dach` verwenden, sonst läuft's auseinander).
- Oder: die Säule blendet sich im angehobenen Zustand oberhalb der fokussierten Etage weich aus (Opacity-Fade), statt sichtbar zu klaffen.

## Phase 2 — Fassade: Ecken massiv, Mitte Glas (statt eine durchgehende Scheibe)

**Datei:** dieselbe, `Geschoss`-Funktion, die Fassaden-Meshes ab Zeile ~428 (Seiten-Pfosten/Riegel) und ~459-475 (die großen Glasflächen vorn/seitlich).

Aktuell: komplette Seiten- und Frontflächen sind eine einzige `Glas`-Fläche mit dünnen Pfosten/Riegeln drüber. Der Owner will stattdessen eine echte Lochfassade/Pfosten-Riegel-Modulation: an den Gebäudeecken und in regelmäßigen Abständen massive, opake Paneele (nutze `brushed-concrete` oder `metal-plate` Textur, je nachdem was stimmiger aussieht), dazwischen die Glasflächen (`Glas`-Komponente bleibt, ggf. Material leicht anpassen).

Konkret: ersetze die durchgehenden Glas-Boxen durch ein Raster aus Segmenten entlang `pfosten`/`seitenPfosten` (die Arrays existieren schon), wobei jedes zweite oder jedes äußerste Segment (Gebäudeecken) ein massives Paneel statt Glas ist. Richtwert: an beiden Enden jeder Fassadenreihe ein massives Eckpaneel, dazwischen abwechselnd oder mehrheitlich Glas — hier ist gestalterischer Spielraum, aber das Ergebnis muss klar erkennbar "Ecken zu, Mitte transparent" sein, nicht mehr eine einzige Scheibe.

Wende `metal-plate`-Textur auf die Pfosten/Riegel (`FARBE.anthrazit`-Meshes) an statt der reinen Farbe — das ist der größte Einzel-Hebel für "echt" statt "Textmarker-Farbe".

## Phase 3 — Boden/Decken/Dach: echte Beton-Textur statt Flatfarbe

Die `RoundedBox`-Geschossplatte (`FARBE.anthrazit`/`meshStandardMaterial`), die Geschossdecke (Zeile ~423-426, `#f1f1ef`) und das Dach (`Dach`-Funktion) bekommen `smooth-concrete` bzw. `brushed-concrete` als Material statt Flatfarbe. `RAUM_B`/`BREITE`/`TIEFE` als Basis für `repeat` nehmen, damit die Kachelung im richtigen Maßstab wirkt (grobe Richtgröße: 1 Texturkachel ≈ 2–3 Meter).

## Phase 4 — Person: Haare + echte Tipp-Bewegung statt starrer Figur

**Datei:** dieselbe, `Person`-Funktion (Zeile ~55-82).

Aktuell: Kugelkopf (reine Hautfarbe, keine Haare), zwei starre Arm-Kapseln ohne Animation. Zwei konkrete, machbare Verbesserungen (kein Rigging, kein Import nötig):

1. **Haare**: ein zusätzliches Mesh über dem Kopf — z. B. eine leicht abgeflachte/verkleinerte `sphereGeometry` (nur obere Hälfte sichtbar, `phiLength`/`thetaLength` einschränken, oder einfach eine kleinere Kugel knapp über der Kopfkugel) in einer Haarfarbe (dunkelbraun/schwarz/blond-Variation, 3–4 Töne durchmischen wie bei `KLEIDUNG`). Reicht als Silhouette, kein Anspruch auf Einzelhaare.
2. **Tipp-Bewegung**: die beiden Arm-Capsule-Meshes (Zeile ~74-79) bekommen `useRef` + `useFrame`, die die Rotation leicht oszillieren lassen (z. B. `rotation.x` sinusförmig zwischen zwei Werten, phasenverschoben zwischen linkem/rechtem Arm, niedrige Amplitude) — nur wenn `an` (Bildschirm aktiv/Agent frisch gelaufen) true ist, sonst bleiben die Arme ruhig in Grundhaltung. Das Pattern dafür existiert schon in `Arbeitsplatz`/`schirm` (Zeile ~181-185) — `an` muss dafür von `Arbeitsplatz` an `Person` durchgereicht werden (aktuell bekommt `Person` nur `farbe`, Prop `an` ergänzen).

## Phase 5 — Bäume: bessere Prozedur-Geometrie (kein externes Modell, siehe Leitplanke oben)

**Datei:** dieselbe, `Umgebung`-Funktion, die Baum-Gruppen (Zeile ~635-653).

Aktuell wirken die Baumkronen als klar erkennbare Kugelhaufen. Ohne externes Modell: mehr Kugeln pro Baum (6-8 statt 4) mit stärker variierender Größe/Position/leichtem Farb-Jitter (nicht nur 2 Töne im Wechsel, sondern pro Kugel eine kleine Zufallsvariation um 2-3 Basistöne), und die Kugeln nicht konzentrisch, sondern unregelmäßiger verteilt (kleine zufällige Offsets), damit die Silhouette weniger "drei Bälle übereinander" wirkt. Stammfarbe/-form kann bleiben.

## Phase 6 — Post-Processing für den "teuren" Gesamteindruck

`@react-three/postprocessing` ist installiert. In `Hauptsitz3D` (Ende der Datei, innerhalb `<Canvas>`) einen `<EffectComposer>` mit:
- `Bloom` (dezent, nur für die emissiven Flächen — Bildschirme, Gehirn-Puls, Statuslichter — `intensity` niedrig ansetzen, z. B. 0.3-0.6, sonst wirkt's kitschig)
- `N8AO` oder `SSAO` (Ambient Occlusion in den Raumecken/unter Möbeln — das ist der Effekt, der am meisten "echt" statt "CG-Demo" bewirkt)
- `ToneMapping` auf ACES Filmic (falls nicht schon über `gl`-Props auf dem `Canvas` gesetzt — prüfen, ob `THREE.ACESFilmicToneMapping` schon aktiv ist, bevor doppelt gesetzt wird)
- Optional, nur wenn Performance es hergibt: leichte `Vignette`

Nach dem Einbau: in `npm run dev` (lokal, siehe unten) kurz beobachten, ob die Framerate beim Drehen der Kamera (`OrbitControls`) spürbar einbricht — falls ja, `N8AO`/`SSAO`-Auflösung reduzieren statt den Effekt ganz zu entfernen.

## Verifikation (so weit wie ohne Netz möglich)

- `tsc`/Typecheck lokal laufen lassen (kein Netz nötig, nur node_modules, die schon da sind) — melden, was rot ist.
- Kein `npm run build` nötig von dir — das übernehme ich (ich habe Netz-Zugriff und prüfe den echten Build danach).
- Kurz beschreiben (Text, kein Screenshot nötig, du hast keinen Browser), welche Geometrie-Positionen/Maße du pro Phase gewählt hast, damit ich beim visuellen Review gezielt nachschauen kann.

## Golden Rule

Keine neue, parallele Fassaden-/Personen-/Material-Systematik aufbauen — alles baut auf den bestehenden Funktionen (`Geschoss`, `RaumModell`, `Arbeitsplatz`, `Person`, `Umgebung`, `Dach`) in dieser einen Datei auf. Keine zweite Textur-Lade-Logik erfinden, wenn `useTexture` reicht.

## Erlaubte Pause

Nur falls eine Phase objektiv nicht ohne Netz/ohne weitere externe Datei lösbar ist (z. B. falls `aoMap`/`uv2` zu Laufzeitfehlern führt, die du nicht lösen kannst) — dann diese eine Phase auslassen, dokumentieren warum, und mit den übrigen Phasen weitermachen. Nicht komplett stoppen.

## Definition of Done

- [ ] Phase 1-6 umgesetzt, lokal committet (kein Push)
- [ ] Typecheck ohne neue Fehler (abgesehen von ggf. bereits vorher roten, nicht von dir verursachten Stellen — die explizit benennen)
- [ ] Abschlussbericht: pro Phase 2-3 Sätze was gemacht wurde, plus git diff --stat gegen den Ausgangscommit dieser Session
