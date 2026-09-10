# Gate 04 · Visuelles System, Art Direction & Desirability

**Status: BUILT 🟢 · ACCEPTED 🟢 · OPERATIONAL 🟢 · CLOSED 🟡 (Owner-Asset + G18-Rest)**
Ausgangspunkt HEAD `2dc6f8306f19e3875408a5e25d66c7f7087bd6f2`, auf `origin`
verifiziert per `git ls-remote`. Gemessen am 11.09.2026.

Die Frage dieses Gates:

> Wirkt creaDIG nicht nur professionell, sondern begehrenswert, klar,
> eigenständig und systemisch?

---

## 1 · Der Fund, der alles andere in den Schatten stellt

Die Website war zu 50–80 Prozent **unsichtbar**, bis jemand scrollte.

`components/ui/reveal.tsx` startete jede Sektion mit `opacity: 0`, animierte
0,9 Sekunden lang und feuerte erst, wenn das Element **80 Pixel innerhalb**
des Blickfelds lag. Gemessen ohne Scrollen, 1,2 Sekunden nach dem Laden:

| Route | Dokument | davon unsichtbar | |
|---|---:|---:|---:|
| `/unternehmen` | 9.377 px | **7.526 px** | **80 %** |
| `/` | 8.912 px | **4.460 px** | **50 %** |
| `/leistungen/webdesign` | 2.803 px | 695 px | 25 % |

Das ist kein Effekt, das ist ein Zustand. Und es erklärt zwei Dinge auf
einmal:

1. **Warum die Seite „nicht fertig" wirkte.** Eine Website, die sich vor dem
   Leser aufbaut, sieht aus, als lade sie noch. Bei einem Haus, das Systeme
   baut, ist das die teuerste Wirkung von allen.
2. **Warum sie monoton wirkte.** Vierunddreißig identische Aufblendungen sind
   selbst die Gleichförmigkeit. Wenn jede Sektion auf dieselbe Art erscheint,
   sieht jede Sektion gleich aus — unabhängig davon, was in ihr steht.

**Jetzt:** Die Deckkraft wird nicht mehr animiert. Bewegt wird nur die Lage —
eine Sektion *setzt sich*, sie *erscheint* nicht. 0,9 s → 0,5 s, Auslöser beim
Eintreten statt 80 Pixel danach.

**Gemessen nach der Änderung: 0 px unsichtbar auf allen drei Routen.**

Der Gate-00-Befund WEB-0026 („Erste Ansicht kurz blass/leer") stand auf
`NOT_REPRODUCED` — gemessen wurde damals **above the fold**, und dort war
nichts. Das Phänomen lag darunter.

---

## 2 · Die visuelle Grammatik

Kein neues Designsystem. Die vorhandene DNA — Creme, Dunkel, Gold, Haarlinien,
editoriale Typografie — bleibt unangetastet. Was Gate 04 festhält, sind die
**Rollen**, die eine Fläche haben kann:

| Rolle | Woran man sie erkennt | Wo |
|---|---|---|
| **Statement** | Ein Satz, viel Fläche, keine Raster | `#haltung`, `#betrieb-statement` |
| **System** | Eine Zeichnung, dunkler Grund | `#haus` |
| **Evidence** | Das Artefakt dominiert, Text darunter | Produktseiten, `/barrierefreiheit` |
| **Decision** | Vergleichbare Zeilen, Preis und Weg je Zeile | `#leistungen` (fünf Ebenen) |
| **Process** | Eine Sequenz über die volle Breite | Leistungsdetail „So läuft es" |
| **Detail** | Zweispaltig, Fakten neben Fakten | Leistungsdetail oben |
| **Action** | Dunkel, schmal, ein Schritt | `#abschluss` |

**Die Regel für dunkle Flächen:** Sie müssen verdient sein, nicht im Wechsel
verteilt. Ein Zebrastreifen aus Creme und Dunkel ist kein Rhythmus, sondern
ein Muster.

---

## 3 · Was geändert wurde — und was das gemessen bewirkt

| Änderung | Wirkung |
|---|---|
| **Reveal** ohne Deckkraft-Animation, 0,5 s, früherer Auslöser | 7.526 px → **0 px** unsichtbar (`/unternehmen`) |
| **Microcopy 11 px → 12 px** (`eyebrow`, `text-meta`; Arabisch 13 px) | 309 Eyebrows plus jede Bildunterschrift, Zugangslage und Fußzeile |
| **Footer: 4 Spalten → 2 ab 0 px** | mobil 1.887 → **1.545 px** — auf *jeder* Seite |
| **Mobilmenü −16 px** in drei großzügigen Abständen | 859 → **844 px**, scrollt nicht mehr |
| **Leistungsdetail-Kopf zweispaltig** | 2.817 → **2.544 px** Desktop; die leeren 45 % rechts sind weg |
| **„So läuft es" über die volle Breite, vier Spalten** | Das Loch in der rechten Spalte ist weg; die Sequenz sieht aus wie eine |
| **`#haus` auf dunklem Grund** | `/unternehmen` C C C C C C C D → **C D C C C C C D** |

### Seitenhöhen (mobil, 390 px)

| Route | vorher | nachher | Δ |
|---|---:|---:|---:|
| `/` | 12.245 | **11.971** | −274 |
| `/leistungen` | 16.280 | **15.978** | −302 |
| `/unternehmen` | 13.819 | **13.484** | −335 |
| `/leistungen/webdesign` | 4.761 | **4.424** | −337 |
| `/leistungen/barrierefreiheit-website` | 10.155 | **9.828** | −327 |
| `/produkte` | 5.295 | **4.945** | −350 |
| `/produkte/fibero` | 7.300 | **6.951** | −349 |
| `/produkte/meai` | 9.152 | **8.806** | −346 |
| `/systeme` | 9.754 | **9.394** | −360 |
| `/betrieb` | 8.475 | **8.134** | −341 |
| `/arbeiten` | 3.118 | **2.743** | −375 |
| `/kontakt` | 5.280 | **4.909** | −371 |
| `/insights` | 3.931 | **3.560** | −371 |
| `/karriere` | 9.826 | **9.467** | −359 |

**Alle siebzehn geprüften Routen sind auf dem Telefon kürzer geworden**, ohne
dass ein einziges Wort entfernt wurde (Gate 03 bleibt unberührt).

---

## 4 · Was bewusst **nicht** passiert ist

Der Owner hat vor genau einem Muster gewarnt: *„mehr visuelle Qualität" darf
nicht heißen, dass drei weitere Diagramme, fünf Cards und zwei dunkle
Sektionen dazukommen.*

| | Zahl |
|---|---:|
| Neue Diagramme | **0** |
| Neue Karten-Raster | **0** |
| Neue dunkle Sektionen | **1** (`#haus`, semantisch begründet) |
| Neue Bilder oder Assets | **0** |
| Neue Wörter | **0** |
| Geänderte Preise | **0** |

Nicht angefasst: Logo, Farbwelt, Grundtypografie, die fünf Ebenen auf
`/leistungen` (die Sektion trägt — Zahl, Name, Satz, „für wen", Einstieg mit
Preis, Klappe), `/arbeiten`, `/insights`, Careers, alle sechs G18-Dateien.

---

## 5 · `/leistungen` — der G18-Rest bleibt ein G18-Rest

Gate 03 hat gemessen: **27 % der Seitenhöhe** liegen in
`components/sections/packages.tsx`, einer der sechs gesperrten Dateien.

Gate 04 hat diese Höhe **nicht** durch Spacing-Kompression kaschiert. Die
Seite ist um 302 px kürzer geworden — durch den Footer, nicht durch die
Preistabelle. `/leistungen` steht bei 15.978 px mobil, und der gesperrte
Anteil steht unverändert darin.

Das ist die richtige Antwort: Ein Content-Problem in fremdem Arbeitszug wird
dokumentiert, nicht weggestylt.

---

## 6 · Was offen bleibt — und warum es nicht an G04 liegt

| Befund | Stand | Grund |
|---|---|---|
| **WEB-0016** · 0 Bilder auf sechs Leistungsdetailseiten | **PARTIAL — Owner-Asset** | Es gibt kein sicheres Bildmaterial für Leistungen. §70 verbietet erfundene Assets. Kompositorisch behoben (Kopf, Sequenz), bildlich nicht |
| **WEB-0020** · Insights-Artikel ohne Bilder | **OWNER-ASSET** | Dasselbe. Ein Artikel über eine Prüfung braucht Belegbilder, die es nicht gibt |
| **WEB-0037** · visuelle Wiederholung | **PARTIAL** | Größe behoben (11 → 12 px), ein verdienter Bruch gesetzt. Die Zahl gleichartiger Sektionsköpfe ist unverändert — sie ist auf `/leistungen` **Vergleichbarkeit** (Gate 03) und anderswo eine echte Restschuld |
| **WEB-0038** · mobile Serialisierung | **PARTIAL** | Absolute Höhe auf allen 17 Routen gesunken. Der *Faktor* bleibt 1,2–1,9, weil auch der Desktop kürzer wurde |
| **WEB-0043** · Arabisch trägt dieselbe Länge | **PARTIAL** | Arabisch ist in Sperrschritt besser geworden; `/ar/leistungen` ist mit 15.105 px jetzt **kürzer** als Deutsch (15.978 px) |
| **WEB-0033** · Footer | **PARTIAL** | Mobil 1.887 → 1.545 px. Desktop 968 → 975 px (+7 durch die größere Microcopy) — bewusst in Kauf genommen |
| **WEB-0039** · `/arbeiten` 25 Labels bei 191 Wörtern | **CLOSED** | Beleg veraltet: heute **2 Eyebrows bei 82 Wörtern**. Von Gate 01 und Gate 03 erledigt |

---

## 7 · Prüfung

| Prüfung | Ergebnis |
|---|---|
| `npm run build` | grün, 34 von 34 Postbuild-Gates |
| `npx tsc --noEmit` · `npx eslint .` | ohne Befund |
| `npm run a11y` | **124 Durchläufe**, keine maschinell feststellbare Verletzung — auch nach dem dunklen `#haus` |
| Interne Links | **625 Links, 33 Zielseiten**, kein toter Link, kein fehlender Anker |
| Überlauf | 17 Routen × 3 Viewports (1440/768/390): **keiner** |
| Arabisch | `dir=rtl`, Eyebrows 13 px, kein Überlauf, `/ar/leistungen` kürzer als DE |
| `proof-drill` · `produkt-drill` · `betrieb-drill` · `redaktion-drill` | 40 · 42 · 44 · 51 Prüfungen, alle exit 0 |
| `check-content-system` · `check-beleg` · `check-einstiege` · `check-website2` | exit 0 |
| Preise | 2.400 / 3.900 / 1.500 / 149 unverändert (maschinell) |
| G18 | SHA-256 aller sechs Dateien unverändert |

---

## 8 · Der Canon, der bleibt

> Gleiche Marke. Verschiedene Seitenaufgabe.
> Konsistenz ist nicht Gleichheit.
> Das Artefakt vor der Erklärung.
> Eine dunkle Fläche muss verdient sein.
> Mobil ist eine Komposition, kein Stapel.
> Ein Eyebrow ist Orientierung, keine Dekoration.
> Ein Diagramm nur, wenn eine Beziehung dadurch klarer wird.
> **Bewegung darf niemals verbergen, dass Inhalt da ist.**
> Premium ist nicht Distanz.
> Systemisch ist nicht kompliziert.
