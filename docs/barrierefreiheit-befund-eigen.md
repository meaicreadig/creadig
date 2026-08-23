# Befund: creadig.de gegen das eigene Prüfraster

*Geprüft am 23.08.2026 · Raster: `docs/barrierefreiheit-pruefraster.md` (WCAG 2.1 AA)
· Branch `feat/system-haus-site` · Erstbefund vor BF-A3, Nachprüfung am Ende des Dokuments*

---

## Prüfumfang

| | |
|---|---|
| **Seiten** | Startseite · Leistungen (Übersicht) · Leistung-Detail (`/leistungen/webdesign`) · Produkte · Produkt-Detail (`/produkte/meai`) · Arbeiten · Unternehmen · Kontakt · Termin-Assistent (Schritt 1 **und** Schritt 3 mit dem Formular) · Datenschutz · Impressum · 404 |
| **Sprachen** | Deutsch und Türkisch (Startseite, Leistungen, Kontakt, Termin, 404) |
| **Fassungen** | hell **und** dunkel — ein Kontrastwert, der hell besteht, kann dunkel durchfallen |
| **Fenster** | 1440 × 900 (Desktop) und 390 × 844 (mobil) |
| **Automatisiert** | axe-core 4.13 über WCAG 2.1 A + AA, 68 Durchläufe (17 Routen × 2 Fenster × 2 Fassungen) — `npm run a11y` |
| **Von Hand** | Tastaturdurchlauf ohne Maus, Prüfung der zugänglichen Namen aller Bedienelemente und Formularfelder, Überschriften- und Landmark-Struktur, Fokus-Sichtbarkeit, Verhalten beim Schrittwechsel im Assistenten |

**Nicht geprüft** — und deshalb hier genannt, statt verschwiegen:

- Kein Durchlauf mit einem echten Screenreader durch einen blinden Nutzer.
  Geprüft wurde die *technische Voraussetzung* (zugänglicher Name, Rolle,
  Zustand, Live-Region), nicht die erlebte Verständlichkeit.
- Keine Prüfung mit Vergrößerungssoftware und keine Prüfung der Sprachsteuerung.
- Videos und Audio gibt es auf der Seite nicht; die zugehörigen Kriterien
  (1.2.x) entfallen mangels Gegenstand.
- Die rechtliche Bewertung (Anwendungsbereich BFSG, Ausnahmen, Formulierung
  einer Erklärung) ist **nicht Teil dieses Befunds**.

---

## Ergebnis in einem Satz

**8 Befunde, davon 7 „erheblich" und 1 „gering". Kein blockierender Befund** —
jede Funktion der Seite ist erreichbar, aber an sieben Stellen deutlich
erschwert. Sechs der sieben treffen dieselben zwei Ursachen: zwei Farbwerte und
eine Regel, die von einer Utility-Klasse überschrieben wird.

| Punkt | Befund | Schwere |
|---|---|---|
| 1 | Gold-Textfarbe unterschreitet 4,5 : 1 auf getönten Flächen | erheblich |
| 1 | `text-muted-foreground` mit Deckkraft 70 / 80 % | erheblich |
| 1 | Platzhalter in Formularfeldern mit Deckkraft 60 % | erheblich |
| 8 | Fokus auf drei Bedienelementen der Kopfleiste unsichtbar | erheblich |
| 9 | Keine Sprungmarke „Zum Inhalt" | erheblich |
| 11 | Kalendertage tragen nur die Zahl als Namen | erheblich |
| 10 | Monats-Schaltflächen bleiben auf `/tr` deutsch | erheblich |
| 6 | Schrittwechsel im Assistenten wird nicht angesagt, Fokus geht verloren | erheblich |
| 4 | — keine Funde | bestanden |

**Bestanden ohne Fund:** Punkt 3 (Alternativtexte), Punkt 4 (dekorative Bilder),
Punkt 5 (Formularbeschriftungen — **alle 16 Felder** in Kontakt und Assistent
haben einen zugänglichen Namen, auch Einwilligungs-Kontrollkästchen und
Auswahlfelder), Punkt 7 (Tastaturbedienbarkeit, keine Falle), Punkt 9 (Struktur:
genau eine `h1`, keine übersprungene Ebene, ein `main`, `header`, `nav`,
`footer`), Punkt 12 (Bewegung/Zoom — der Fehler dort wurde in einem früheren
Durchgang bereits behoben, siehe unten).

---

## Die Funde im Einzelnen

### F1 · Punkt 1 — Gold-Textfarbe unter 4,5 : 1
**WCAG 1.4.3 (AA) · erheblich · 5 Stellen**

`--gold-text: #8f6a33` erreicht auf der Standardfläche `#fbfbf9` genau 4,74 : 1
und besteht dort knapp. Auf jeder **getönten** Fläche fällt es durch:

| Ort | Vorder-/Hintergrund | Wert |
|---|---|---|
| Impressum, Pending-Kasten | `#8f6a33` auf `#f0efec` | **4,26** |
| Arbeiten, Kennzeichnung | `#8f6a33` auf `#f5f0e8` | **4,33** |
| Leistung-Detail, Eyebrow „Arbeiten dazu" | `#94713c` auf `#fbfbf9` | **4,32** |
| Produkte, „Was wir gebaut haben" | `#95723d` auf `#fbfbf9` | **4,26** |
| Kontakt (DE + TR), Link „Arbeiten ansehen" | `#93703b` auf `#fafaf8` | **4,34** |

Betroffen ist durchweg kleiner Text (11–15 px), für den 4,5 : 1 gilt.

### F2 · Punkt 1 — `text-muted-foreground` mit Deckkraft
**WCAG 1.4.3 (AA) · erheblich · 4 Stellen**

Der Grundwert besteht (hell 5,18 : 1, dunkel 6,44 : 1). Die Deckkraft-Varianten
nicht:

| Variante | hell | dunkel |
|---|---|---|
| `/80` | **3,45** | 4,62 |
| `/70` | **2,85** | **3,86** |

Gefunden auf Datenschutz (`/80`, `/70`), Arbeiten (`/80`, hell und dunkel),
Startseite TR und Leistungen (dunkel, mobil). Sieben Stellen im Code.

### F3 · Punkt 1 — Platzhalter mit 60 % Deckkraft
**WCAG 1.4.3 (AA) · erheblich · 2 Stellen**

`placeholder:text-muted-foreground/60` im Termin-Assistenten und im
Produkt-Interesse-Formular: hell **2,40 : 1**, dunkel **3,20 : 1**. Von axe nicht
gemeldet, weil Platzhalter nur im leeren Feld sichtbar sind — von Hand gefunden.
Die Platzhalter tragen hier Information („für den Rückruf", „Kurz in eigenen
Worten"), also gilt 4,5 : 1.

### F4 · Punkt 8 — Fokus unsichtbar
**WCAG 2.4.7 (AA) · erheblich · 3 Bedienelemente auf jeder Seite**

Tastaturdurchlauf über die Kopfleiste, gemessener `outline-style` beim
fokussierten Element:

| Element | outline | box-shadow |
|---|---|---|
| Sprachumschalter DE/TR | `2px **none**` | transparent |
| Erscheinungsbild wechseln | `3px **none**` | transparent |
| WhatsApp-Link | `3px **none**` | transparent |

Ursache: Die Basisklassen aus `components/ui/button.tsx` und `toggle.tsx` setzen
`outline-none` und ersetzen den Umriss durch einen Ring, der in dieser Palette
nicht gezeichnet wird. Die globale Regel `:focus-visible { outline: 2px solid }`
steht in `@layer base` und verliert gegen die Utility-Klasse. Alle übrigen
Bedienelemente zeigen den Umriss korrekt — es sind genau diese drei, und sie
stehen auf **jeder** Seite.

### F5 · Punkt 9 — keine Sprungmarke
**WCAG 2.4.1 (A) · erheblich · alle Seiten**

Der erste Tastendruck landet auf dem Logo, danach folgen vier Menüpunkte, der
Sprachumschalter, der Erscheinungsbild-Schalter, WhatsApp und der Haupt-Knopf.
Wer nur mit der Tastatur arbeitet, durchquert diese acht Stationen **auf jeder
Seite erneut**, bevor er im Inhalt ankommt.

### F6 · Punkt 11 — Kalendertage ohne aussagekräftigen Namen
**WCAG 4.1.2 (A), 2.4.6 (AA) · erheblich · Termin-Assistent, Schritt 2**

Die 31 Tages-Schaltflächen tragen als zugänglichen Namen nur die Zahl. Ein
Screenreader sagt „31, Schaltfläche" — ohne Monat, ohne Wochentag und ohne den
Zustand „gewählt". Die Markierung der bevorzugten Gesprächstage ist ein
`aria-hidden`-Punkt und damit ausschließlich visuell.

### F7 · Punkt 10 — deutsche Beschriftung in der türkischen Fassung
**WCAG 3.1.2 (AA), 4.1.2 (A) · erheblich · `/tr/termin`**

Auf der türkischen Terminseite melden die Monats-Schaltflächen `aria-label`
`"Vorheriger Monat"` und `"Nächster Monat"` — hart im Markup, nicht aus dem
Wörterbuch. Alle übrigen Beschriftungen der Seite sind übersetzt. Ein türkischer
Screenreader liest die beiden Wörter mit türkischer Aussprache vor; das Ergebnis
ist unverständlich.

### F8 · Punkt 6 — Schrittwechsel ohne Ansage, Fokus verloren
**WCAG 4.1.3 (AA), 2.4.3 (A) · erheblich · Termin-Assistent**

Nach „Weiter" tauscht der Assistent den Inhalt aus, scrollt nach oben — und
setzt den Fokus **nicht**. Gemessen: `document.activeElement` ist danach
`<body>`. Für einen Tastaturnutzer heißt das, wieder ganz vorn anzufangen; für
einen Screenreader-Nutzer passiert **gar nichts** — es gibt auf der Seite keine
einzige Live-Region (`aria-live` / `role="status"`), die den neuen Schritt
ansagen würde. Man drückt „Weiter" und hört Stille.

*(Die Fehlermeldungen im Assistenten und im Kontaktformular haben `role="alert"`
und werden korrekt angesagt — geprüft. Der Fund betrifft nur den Schrittwechsel.)*

### Gering: dekorativer Punkt in der Kalenderlegende
**Punkt 4 · gering** — Der goldene Punkt vor „bevorzugt" ist korrekt
`aria-hidden`, die Legende erklärt ihn im Text. Kein Handlungsbedarf, hier nur
der Vollständigkeit halber notiert.

---

## Was vor dieser Prüfung schon behoben war

Punkt 12 des Rasters (Bewegung) hatte in diesem Projekt den schwersten Fund
überhaupt — er wurde im Durchgang davor gefunden und behoben (Commit `25cdaf2`):
Mit aktivierter Systemeinstellung „Bewegung reduzieren" blieben eingeblendete
Abschnitte auf `opacity: 0` stehen. Gemessen 7 unsichtbare Blöcke auf einer
Leistungsseite, **33 auf `/leistungen`**. Die Seite war für genau die Gruppe
leer, für die die Einstellung gemacht ist.

Er steht hier, weil ein Befund, der die eigene Vorgeschichte verschweigt,
weniger wert ist. Nachgemessen nach der Behebung: alle Blöcke sofort sichtbar.

---

## Nachprüfung nach der Behebung (23.08.2026, BF-A3)

Behoben **im Code**, kein Overlay, kein Plugin, kein Widget.

| Fund | Behebung | Nachgemessen |
|---|---|---|
| F1 | `--gold-text` von `#8f6a33` auf `#87632f` | ≥ 4,74 : 1 auf allen fünf hellen Flächen |
| F2 | Deckkraft 70/80 % auf Text entfernt (7 Stellen) | hell 5,18 : 1, dunkel 6,44 : 1 |
| F3 | Platzhalter ohne Deckkraft | dieselben Werte wie F2 |
| F4 | `:focus-visible` steht jetzt **außerhalb jeder Kaskadenschicht** | Sprachumschalter `2px solid`, Erscheinungsbild `3px solid`, WhatsApp `3px solid` — alle drei sichtbar |
| F5 | Sprungmarke in `SiteShell`, Ziel `#inhalt` mit `tabIndex={-1}` | Erste Tab-Station, sichtbar, `Enter` setzt den Fokus auf `#inhalt` |
| F6 | `aria-label` je Kalendertag aus Wochentag, Datum, Zustand | „Montag, 31. August 2026" |
| F7 | Monats-Schaltflächen aus dem Wörterbuch | DE „Vorheriger Monat / Nächster Monat", TR „Önceki ay / Sonraki ay", Tag „Pazartesi, 31. Ağustos 2026" |
| F8 | Fokus wandert auf die Überschrift des neuen Schritts, dazu eine höflich vorlesende Region | Fokus `H2 · Wann passt es Ihnen?`, Ansage „Schritt 2 von 4: Wann passt es Ihnen?" |

**Automatisierter Lauf danach:** 68 Durchläufe, **keine** maschinell
feststellbare Verletzung von WCAG 2.1 AA (vorher 11 Stellen).

### Eine Korrektur an der Messung selbst

Nach der Behebung meldete axe noch zwei Kontrastwerte — beide auf Seiten, deren
deutsche Zwillingsseite bei identischem Markup bestand. Ursache war nicht die
Seite, sondern die Messung: axe traf die eingeblendeten Abschnitte **mitten in
der 0,9-Sekunden-Animation** und maß eine halb durchsichtige Fläche. Der Lauf
misst jetzt mit „Bewegung reduzieren" — also den Endzustand, den ein Mensch
sieht. Das ist im Skript begründet.

Es wäre bequem gewesen, die zwei Werte als „Ausreißer" abzuhaken. Ein Befund,
der Messfehler als Ergebnis ausgibt, ist genauso falsch wie einer, der Funde
verschweigt.

### Was weiterhin offen ist

Unverändert die Punkte aus „Nicht geprüft" oben: kein Durchlauf mit einem
blinden Nutzer, keine Vergrößerungssoftware, keine Sprachsteuerung. Der Befund
sagt: **technisch konform nach WCAG 2.1 AA, soweit prüfbar** — er sagt nicht
„barrierefrei", und er ersetzt keine rechtliche Bewertung.

**Bildnachweis Tastaturpfad:** `screenshots/tastaturpfad/` (`npm run shots`) —
Sprungmarke, Fokus in der Kopfleiste, fokussierter Kalendertag, Fokus nach
„Weiter".
