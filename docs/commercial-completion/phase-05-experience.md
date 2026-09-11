# Phase 5 — Experience & Accessibility Completion

**Stand:** 11.09.2026

## 1 · Die `/leistungen`-Schuld — gemessen, nicht geschätzt

Phase 2 hat die Kauflogik auf `/leistungen` gebracht und die Seite dabei
verlängert. Diese Phase zahlt das zurück.

**Gemessen je Abschnitt** (`<main>`, Deutsch):

| Abschnitt | 1440 px | 390 px | Wörter |
|---|---:|---:|---:|
| Kopf | 896 | 1.073 | 88 |
| Fünf Ebenen | 1.943 | 2.737 | 176 |
| Managed Betrieb | 1.455 | 2.136 | 187 |
| Prozess | 1.307 | 2.244 | 172 |
| **Kaufwege (Phase 2)** | **2.961** | **5.092** | **617** |
| FAQ | 1.114 | 1.270 | 71 |
| **Pakete (G18)** | **2.334** | **4.404** | **487** |
| Abschluss | 399 | 596 | 38 |

Damit war die Schuld exakt lokalisiert: **Kaufwege war der längste Abschnitt
der Seite** — länger als die G18-gesperrte Preisleiter — und er war meiner.

## 2 · Was entfernt, was zusammengeführt, was verlinkt wurde

| Eingriff | Was | Warum |
|---|---|---|
| **Gelöscht** | „Was Sie bekommen" an allen sechs Angeboten (~170 Wörter) | Jedes Angebot beschreibt seinen Umfang an seinem Ziel: Website-Paket und Prüfung in der Preisleiter **derselben Seite**, laufende Betreuung im Abschnitt „Managed Betrieb" **darüber**, die übrigen drei an ihrem Link. D-25 gilt auch für die eigene Ergänzung |
| **Gelöscht** | Fit-Fall „Trifft keiner der fünf Treiber zu, reicht das Paket" | steht wortgleich in `openDriversNote` der Preisleiter |
| **Gelöscht** | „Alle Beträge netto. Die vollständige Preisleiter steht weiter unten." | steht in der Preisleiter selbst |
| **Zusammengeführt** | „Wann" + „Wie der Preis entsteht" → **ein Satz** je Kaufweg | Sie waren ohnehin einer; als zwei Spalten wurden daraus auf 390 px zwei gestapelte Blöcke |
| **Verflacht** | Pro Kaufweg ein Dreispalter + je Angebot ein zweiter Dreispalter → eine Zeile je Weg, eine Zeile je Angebot | 33 gestapelte Blöcke auf dem Telefon wurden zu 9 |
| **Behalten** | Die **Grenze** an jedem Angebot | Sie steht nirgends sonst und entscheidet später den Streit |

## 3 · Ergebnis

| | vorher | nachher | Δ |
|---|---:|---:|---:|
| Kaufwege · Wörter | 617 | **425** | **−31 %** |
| Kaufwege · Höhe 390 px | 5.092 px | **3.256 px** | **−36 %** |
| `/leistungen` gesamt · Wörter | 1.836 | **1.644** | −10 % |
| `/leistungen` gesamt · Höhe 390 px | 19.552 px | **17.716 px** | −9 % |
| `/leistungen` gesamt · Höhe 1440 px | 12.409 px | **11.495 px** | −7 % |

**Die Kauflogik ist vollständig erhalten** — maschinell geprüft: drei
Kaufwege, die 149-gegen-Individualanwendung-Unterscheidung, der Satz „keine
Betriebsstufe über der laufenden Betreuung", der Standardsoftware-Fall, die
Anbindung als eigener Fall, „kein Listenpreis und keine Spanne", sechs eigene
Aufrufe. Der Probelauf schlägt fehl, sobald einer davon verschwindet **oder**
der Abschnitt wieder über 470 Wörter wächst.

### Ehrliche Einschränkung

`/leistungen` bleibt mit 1.644 Wörtern die längste Seite. **487 davon (30 %)
und 4.404 px auf dem Telefon (25 %) stammen aus `components/sections/packages.tsx`
— G18-gesperrt, byte-identisch zu halten.** Was owner-unabhängig erreichbar war,
ist erreicht; der Rest hängt an der Entsperrung.

## 4 · Der Hero war 300 Millisekunden lang nicht da

Phase 1 hatte `opacity: 0` entfernt und den `<noscript>`-Fall geflickt. Das
war zu wenig: Der Regelfall ist nicht „kein JavaScript", sondern **„JavaScript
läuft gerade an"**.

**Gemessen** — Anteil der H1, der im Sichtfenster ihrer Maske stand:

| Navigation | 0 ms | 50 ms | 100 ms | 200 ms | 350 ms |
|---|---:|---:|---:|---:|---:|
| harter Aufruf | — | **0 %** | **0 %** | **0 %** | 26 % |
| Client-Navigation | 0 % | **0 %** | **0 %** | **0 %** | 57 % |
| vor/zurück | 0 % | **0 %** | **0 %** | **0 %** | 60 % |
| neu laden | 0 % | **0 %** | **0 %** | **0 %** | 55 % |

**Ursache:** `initial={{ y: "112%" }}` in einem `overflow-hidden`. Die Zeile
stand vollständig **unter** ihrer eigenen Maske und wurde hereingefahren —
genau das, was D-28 seit Gate 04 verbietet. Der Hero war die letzte Stelle,
die es noch tat; ausgerechnet die erste, die jemand sieht.

**Behoben:** Die Zeile *setzt sich* (`y: 14 → 0`), statt enthüllt zu werden —
dieselbe Bewegung wie in `Reveal`, nur gestaffelt. Die Maske bleibt für den
Zeilenrhythmus, schneidet aber nichts mehr weg. Der `<noscript>`-Flicken ist
überflüssig geworden und entfernt.

**Nachher:** **92 % ab dem ersten Frame** bei allen vier Navigationsarten,
100 % nach 350 ms.

## 5 · Die primäre Handlung auf kleinen Telefonen

| | vorher | nachher | Fenster |
|---|---:|---:|---:|
| 390 × 844 | y = 811 | **y = 649** | 844 |
| 360 × 740 | y = 820 — **unter der Falz** | **y = 678** | 740 |

**Ursache:** Im Fluss standen Unterzeile → „Fünf Ebenen. Ein System." → fünf
Ebenen-Verweise → *dann erst* der Knopf. Auf 1440 px stehen die Ebenen links
und der Knopf rechts daneben; auf dem Telefon stapelte sich beides, und die
**Navigationstiefe schob die Handlung hinaus**.

**Behoben** durch Reihenfolge, nicht durch einen klebenden Knopf: Die
Unterzeile bleibt beim Titel — sie erklärt ihn —, die Handlung folgt, die
Ebenen rücken dahinter. Ab `lg` gilt wieder das zweispaltige Original
(nachgemessen: Unterzeile x=64, Knopf x=941, gleiche Zeile). Kein Text
geändert, kein Element entfernt.

## 6 · Visuelle Eintönigkeit — geprüft, nicht dekoriert

| Fläche | Befund | Klasse |
|---|---|---|
| Leistungs-Detailseiten | 214 Wörter, strukturiert in „Was dazugehört", „Für wen", „In diesen Paketen", „So läuft es" | **kein Mangel** — ein Diagramm wäre Dekoration |
| Insight-Artikel | 1.082 Wörter, **9 H2, 5 Listen, 1 Definitionsliste**, längster Absatz 95 Wörter | **kein Mangel** — keine Textwüste |
| Echte Fotos, Kundenoberflächen | fehlen | **OWNER_ASSET** |

Kein Stockfoto, kein KI-Büro, keine erfundene Oberfläche, kein Diagramm um
des Diagramms willen (MP §44).

## 7 · Barrierefreiheit und Ränder

| Prüfung | Ergebnis |
|---|---|
| `npm run a11y` | **132/132** (33 Routen × 2 Fenster × 2 Erscheinungsbilder) |
| Querlauf 768 / 390 / 360 / **320** px × 5 Routen | keiner |
| Zoom-Äquivalent (640 px, 2× Skalierung) × 4 Routen | kein Querlauf, **0 abgeschnittene Bedienelemente** |
| Arabisch RTL (`/ar/kontakt`, `/ar/termin`, `/ar/leistungen`) | `dir=rtl`, kein Querlauf, „الخطوة 1 من 4" korrekt |
| Tablet 768 | Hero gestapelt in richtiger Reihenfolge, Kaufwege einspaltig — kein halber Zweispalter |

## Nachgewiesen durch

`npm run erlebnis-drill` — **37 Prüfungen**: H1-Sichtbarkeit bei 0/50/100/200 ms
über vier Navigationsarten, kein Text unter 15 % Deckkraft beim Aufbau,
Handlungsposition auf 390 und 360, Querlauf auf vier Breiten × fünf Routen,
sechs Belege für erhaltene Kauflogik, Wortobergrenze für den Abschnitt.
