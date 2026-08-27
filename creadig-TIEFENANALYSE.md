# creaDIG — TIEFENANALYSE

> Auftrag: Master-Prompt 11. Eine vollständige Analyse von Corporate Identity über Motion,
> Struktur, Inhalt, Technik bis Positionierung. **Nur Analyse, kein Code.**
> Stand: 27.08.2026 · Zweig `feat/system-haus-site` · Arbeitsverzeichnis mit den
> uncommitteten Vorschau-Änderungen (Motiv global aus, `LivingField` im Hero).
> Alle Belege sind `Datei:Zeile` aus dem echten Code, alle Zahlen sind gezählt, nicht geschätzt.

---

## EXECUTIVE SUMMARY

**Das eine Kernproblem in einem Satz:**
Die visuelle Sprache tut das Gegenteil dessen, was die Marke sagt — sie **trennt** (251 Haarlinien,
34 fugenlose Raster, 2 px Radius), während die Omurga **verbindet** („das Unsichtbare in Systeme
verwandeln", ineinandergreifendes Logo) — und weil es keine generative Leitidee gibt, aus der Form
ableitbar wäre, war das nie eine Entscheidung, sondern ein Nebeneffekt.

**Was das konkret heißt.** Es gibt kein Identitäts-Problem im Sinne von „zu wenig Gestaltung".
Es gibt ein **Ableitungs**-Problem: 46 Sektionen, 251 Haarlinien, eine Typo-Skala mit neun
Ebenen, drei Elevation-Stufen — jede Einzelentscheidung ist sauber begründet, im Code
dokumentiert und in sich richtig. Aber **keine folgt aus einer anderen.** Genau das liest sich
als „premium Template": ein Regelwerk ohne Ursprung.

**Fünf Befunde, die das belegen:**

1. **Die Seite ist scharf, weil sie scharf ist.** 129 von 145 Komponenten haben *keinen einzigen*
   Radius-Wert; von 34 Vorkommen sind 14 `rounded-none` — also aktives Wegnehmen. Der wichtigste
   Knopf der Seite (`MagneticButton`) hat gar keinen. `button.tsx:7` protokolliert den
   Selbstverstärker im Klartext: 6 px Rundung „sahen aus wie ein Fremdkörper" neben den scharfen
   Karten. Die Schärfe hat sich selbst durchgesetzt.
2. **Das einzige Runde im System ist die Schrift.** `site-shell.tsx:50` — „Poppins,
   rund-geometrisch, passt zum Logo". Die Schrift folgt dem Logo, die Geometrie folgt nichts.
   Das ist die Form↔Botschaft-Spannung, messbar an genau einer Zeile.
3. **Das Motiv war nie Deko — es war Materialersatz.** `signature-motif.tsx:44` steht auf
   `return null`; das leert **14 Flächen** auf einmal, davon vier, die es nur gibt, *weil dort ein
   Bild fehlt* (`motif-placeholder`), und die Kopfzone **jeder** Unterseite (`page-header.tsx:57`).
   Der ruhige Hintergrund hat nicht das Muster entfernt, er hat die Leere freigelegt.
4. **Die Bühne ist nachweislich leer.** Drei Gating-Maschinen, drei leere Objekte:
   `PRODUCT_SCREENS = {}`, `CLIENT_LOGOS = {}`, `COMPANY_PHOTOS = {}`. Ein Haus mit vier eigenen
   Produkten zeigt **null** Aufnahmen davon. Das ist der größte visuelle Verlust der Seite — und
   der einzige, den Code nicht beheben kann.
5. **Bewegung existiert praktisch nicht, und sie ist auch nicht anwendbar.** 9 von 145 Dateien
   nutzen framer-motion, `whileInView` steht in **zwei** Dateien, es gibt genau **eine**
   Dauerbewegung (der Pfeil im Hero). Schwerer wiegt: `globals.css` hat Farb-, Typo-, Raster-,
   Elevation- und Motiv-Token — aber **kein einziges Motion-Token**. Die Marken-Kurve ist 54× als
   Zeichenkette kopiert. Eine Motion-DNA lässt sich heute nicht zentral einführen.

**Die Leitidee (Vorschlag):** **„Die Fuge trägt."** Eine Linie ist nie ein Rand, immer eine
Verbindung; Gold erscheint ausschließlich dort, wo etwas *zusammenkommt*; das Motiv ist kein
Zufallsraster, sondern die **fünf Ebenen als fünf Knoten**, deterministisch aus `site-data`
erzeugt, auf jeder Seite derselbe Bau mit einem anderen leuchtenden Knoten. Daraus folgen Radius,
Raster, Farbrolle und Motion — nicht nebeneinander, sondern auseinander.

**Reifegrad gesamt: ~25 %** (Owner-Schätzung 10 % ist zu hart — der Unterbau ist besser als sein
Ergebnis; es fehlt die oberste Schicht **und** das Material). Aufschlüsselung in §4.3.

**Was der Owner jetzt entscheiden muss:** Radius rund oder scharf (nur einer, siehe §4.5-1) ·
Fünf-Knoten-Motiv ja/nein · Poppins bleibt oder geht · wann welches Produktmaterial kommt.
Ohne Entscheidung 1 und 2 ist jeder weitere Design-Pass wieder eine Einzelentscheidung.

---

## 1 · WAS SCHON ANALYSIERT IST — UND WO DIE ECHTE LÜCKE LIEGT

Damit diese Runde nichts wiederkäut, zuerst die Grenze:

| Doku | Deckt ab | Deckt **nicht** ab |
|---|---|---|
| `KIZILELMA-creaDIG.md` §1–8 | Marke, Haltung, Haus-Struktur, Motto | jede Form-Frage |
| `KIZILELMA` §10 (V2) | Kategorie, Beweisarten, Case-System, Preislogik | Gestaltung |
| `KIZILELMA` §11 (V3) | Platzierung nach Käuferfragen, Skala A/B, `/status` als Fertig-Definition | Gestaltung |
| `ANALYSE-creaDIG.md` | 60+ technische/geschäftliche Befunde, Deploy, Recht, a11y | CI als System |
| `creadig-DESIGN-IDENTITAET.md` (29 Zeilen) | **die einzige Design-Doku** — Diagnose „Standard", Richtung Node-Linie/Klammer/Schichten/Grotesk/warmes Anthrazit | keine Belege, keine Ableitung, keine Messung, keine Radius-Frage |
| `AUDIT-BACKLOG` / `LIVE-CHECKLISTE` | Aufgaben und Freigaben | — |

**Die Lücke:** Es gibt 974 Zeilen technische Analyse und **29 Zeilen** Design-Analyse. Die
Design-Doku benennt eine Richtung, leitet aber nichts ab und misst nichts. Genau dort geht dieses
Dokument tiefer: **was im Code tatsächlich steht, was es bedeutet, und woraus es folgen müsste.**

Zwei Empfehlungen von damals sind zudem **bereits umgesetzt** und damit erledigt — das gehört
ehrlich benannt, sonst gilt sie weiter als offene Baustelle:

- „Warmes Anthrazit statt reinem Schwarz" → **erledigt.** `globals.css:62-64` (`#fbfbf9` /
  `#2a2723`) und `:119-125` (`#201e1b`). Kein reines Schwarz, kein reines Weiß, nirgends.
- „Light-Mode als Default" (Owner-Vorschlag) → **erledigt.** `:root` ist hell
  (`globals.css:61`), `theme-provider.tsx:22` startet auf `light`, Dunkel ist ein bewusster
  Schalter. Diese Entscheidung ist also gefallen, nicht offen.

---

## 2 · CORPORATE IDENTITY / VISUELLE SPRACHE — DER KERN

### 2.1 Gibt es eine generative Leitidee? Nein — und das ist beweisbar

Eine generative Leitidee erkennt man daran, dass man **eine** Frage stellen kann und die Antwort
*alle* Formentscheidungen erklärt. Der Test am echten System:

| Frage | Antwort im Code | Folgt sie aus etwas? |
|---|---|---|
| Warum 2 px Radius? | `globals.css:102`, `button.tsx:7-9`: weil 6 px „wie ein Fremdkörper" neben scharfen Karten aussah | Nein — folgt aus *sich selbst* |
| Warum Haarlinien-Raster? | 251 `border-line`, 34 `gap-px` | Nein — nirgends begründet, historisch gewachsen |
| Warum Poppins? | `site-shell.tsx:50`: „rund-geometrisch, passt zum Logo" | **Ja** — folgt aus dem Logo. Die einzige abgeleitete Entscheidung |
| Warum Gold? | `globals.css:90-91`: „Gold ist die Primärfarbe — nicht Schwarz" | Gesetzt, nicht abgeleitet |
| Warum Dreiecke? | `signature-motif.tsx:4-6`: nachgebaut aus `corporate_creadig.ai` | Historie, keine Bedeutung |

**Eine von fünf.** Das ist keine Identität, das ist eine Sammlung. Und es erklärt exakt den
Owner-Satz „sieht trotzdem Standard aus": Standard ist nicht ein Aussehen, Standard ist das
Fehlen einer Ableitung. Jede sorgfältige Studio-Seite in Europa sieht so aus — warmes Weiß,
Haarlinien, ein Akzentton, große Display-Typo — nicht weil alle voneinander abschreiben, sondern
weil das der Zustand ist, in dem ein System landet, wenn jede Entscheidung *für sich* richtig
getroffen wird.

### 2.2 Token-Audit

**Farbe — 70 %, das Beste am System.**
Warm durchgehend, drei Flächenstufen, zwei Gold-Rollen sauber getrennt (`--gold` für Flächen,
`--gold-text` für alles Lesbare, `globals.css:18-27`), Kontrastwerte auf **fünf** hellen Flächen
gemessen (`:73-81`). `.section-dark` existiert zweimal (`:178`, `:219`) mit einer im Kommentar
dokumentierten Begründung — das ist Handwerk auf gutem Niveau.
*Der Mangel:* Gold hat keine **Rolle**, nur eine Definition. Es steht auf Eyebrow-Linien, auf
Knoten, auf Preisen, auf Hover-Zuständen, auf Ersatzflächen — überall. Eine Farbe, die überall
darf, signalisiert nichts.
*Ein echter Bruch:* Die Wortmarke im Logo ist `#3A3A3A` (`creadig-logo.svg`, `.st4`) — das steht
in **keinem** Token. Das Zeichen der Marke sitzt außerhalb der Palette der Marke.

**Typografie — 80 %, technisch vorbildlich.**
Genau ein `clamp()` pro Ebene, neun Ebenen, jede selbsttragend (`globals.css:328-473`). Die
Kalibrierung ist ehrlich dokumentiert: Hero von 9,5 rem auf 7 rem (`:346-349`), H2 von 5 rem/700
auf 3,25 rem/600 mit der richtigen Begründung — „Zwölf gleich laute Überschriften ergeben keine
Hierarchie, sondern Geschrei" (`:374-378`). Die wiederkehrende Owner-Kritik „Typo zu groß" ist an
dieser Stelle **abgearbeitet**.
*Der Mangel:* Poppins. Nicht weil die Schrift schlecht wäre — sondern weil sie das einzige runde
Element in einem scharfen System ist (§2.3).

**Radius — 15 %, hier liegt der Owner-Wunsch und der härteste Befund.**

```
globals.css:54-57   --radius-xs .0625rem (1px) · sm .125rem (2px) · md .25rem (4px) · lg .375rem (6px)
globals.css:102     --radius .125rem (2px)
```

Gezählt über `components/` und `app/` (145 `.tsx`-Dateien):

| | Anzahl | Bedeutung |
|---|---|---|
| Dateien **ohne jeden** Radius | **129 / 145** | 89 % der Seite ist absolut scharf |
| `rounded-none` | 14 | Rundung wird **aktiv weggenommen** |
| `rounded-full` | 7 | Punkte, Glühen, Avatare — keine Flächen |
| echte weiche Ecken | 13 | alle ≤ 4 px, alle in Formular-/Steuerelementen |

Und der wichtigste Fall: **`MagneticButton` hat keinen Radius.** `magnetic-button.tsx:43-51` —
das ist der primäre Handlungsknopf im Hero, auf `/termin`, in jedem Abschluss-Band. Der erste
Knopf, den ein Besucher sieht, ist ein exaktes Rechteck.

Der Kommentar in `button.tsx:7-9` ist der eigentliche Fund. Er sagt sinngemäß: *wir sind rund
gestartet und haben die Rundung entfernt, weil sie neben den scharfen Karten störte.* Das ist ein
System, das seine eigene Härte durchsetzt — nicht aus Haltung, sondern aus Kohärenzdruck. Genau
so entsteht eine Optik, die niemand entschieden hat.

**Spacing/Raster — 65 %.**
Vier Utilities (`globals.css:500-540`), sauber. *Der Mangel:* 46× `section-shell` gegen 5×
`-band` und 12× `-tight`. Die drei Archetypen aus `home.tsx:48-55` sind auf der **Startseite**
real; über die ganze Seite gerechnet laufen **46 von 63** Sektionen in derselben Form.

**Motiv — 5 %.** Siehe §2.4. Es ist derzeit buchstäblich abgeschaltet.

### 2.3 Form ↔ Botschaft: die messbare Spannung

Die Marke sagt (KIZILELMA §1, §5): *verbinden, ineinandergreifen, Herz, dem Menschen dienen,
Handwerk und türkischsprachige Betriebe.* Die Form sagt:

| Formsprache | Anzahl | Was sie signalisiert |
|---|---|---|
| `border-line` / `border-line-strong` | **251** | Trennung, Abgrenzung, Feld gegen Feld |
| `gap-px`-Raster (24 Dateien) | 34 | Zellen, lückenlos aneinandergelegt |
| Radius ≤ 4 px | 89 % der Dateien ohne jeden | Kante, Präzision, Distanz |
| Poppins (rund-geometrisch) | 1 Entscheidung | Nähe, Wärme, Mensch |

**Das Verhältnis ist 285 : 1.** Die Seite behauptet Verbindung und zeichnet Trennung. Sie
behauptet Nähe und setzt Kanten. Ein Haus, dessen Logo „ineinandergreifend" ist
(`logo.tsx:11`), baut seine Oberfläche aus lauter Linien, deren einzige Funktion es ist, Dinge
auseinanderzuhalten.

Das ist nicht „kalt vs. warm" als Geschmacksfrage. Es ist ein **Widerspruch zwischen Aussage und
Beweis** — und damit derselbe Fehler, den die Seite inhaltlich schon einmal korrigiert hat
(`home.tsx:141-151`: die unbelegte Nachweis-Zeile ist gegangen). Formal steht er noch.

**Bewertung der Owner-Hypothese „runder / wärmer": bestätigt, aber die Begründung ist eine
andere als vermutet.** Nicht „Rundung ist hübscher", sondern: *die Rundung ist die einzige
Formentscheidung, die aus der Marke ableitbar ist* — über das Logo, über Poppins, über die
Zielgruppe. Schärfe ist ableitbar aus nichts.

### 2.4 Das Motiv: warum es „ohne Logik" wirkt — die Antwort steht in Zeile 73

Der Owner-Satz lautet: das Motiv wirkt *„ohne Logik / unordentlich"*. Das ist keine Wahrnehmung,
das ist eine korrekte Beschreibung der Implementierung:

```
signature-motif.tsx:26-33   makeRandom()  — Lehmer-PRNG
signature-motif.tsx:51      const random = makeRandom(20180929)
signature-motif.tsx:72-73   const chance = density * gradient * gradient
                            if (random() > chance) continue
signature-motif.tsx:76-83   const roll = random()  → drei Tonwerte, zufällig verteilt
```

**Welches Dreieck gefüllt wird, entscheidet ein Zufallsgenerator.** Der Seed ist fest, damit
Server und Client dasselbe rendern — aber das macht das Ergebnis nur *reproduzierbar*, nicht
*geordnet*. Ein CI-Zeichen muss in der **Form** determiniert sein, nicht im Seed. Ein Muster,
dessen Aufbau niemand nachvollziehen kann, trägt keine Bedeutung, und der Betrachter merkt das
sofort — er kann nur nicht sagen, woran.

Dazu die Herkunftsfrage: `signature-motif.tsx:4-6` sagt offen, dass das Dreiecksraster aus
`corporate_creadig.ai` nachgebaut ist — dem **Agentur**-Erbe. Das Haus hat sich seither zum
System-Haus gewandelt (KIZILELMA §4b). Das Motiv ist also nicht nur bedeutungslos, es belegt die
*alte* Identität.

**Der wichtigste Befund dieser Runde:** Die Vorschau schaltet das Motiv global ab
(`signature-motif.tsx:44 return null`). Das trifft **14 Aufrufstellen**:

- **7× `motif-band`** — Fußzeile, Abschluss-Band, Impact-Band, meAI-Spotlight, Status-Seite,
  Insight-Seiten, Leistungsseiten **und `page-header.tsx:57`**: die Kopfzone **jeder** Unterseite.
- **4× `motif-placeholder`** — `location-parallax.tsx:36`, `case-study-body.tsx:74`,
  `portfolio.tsx:30`, `selected-work.tsx:108`. Diese vier existieren ausschließlich, **weil dort
  ein Bild fehlt** (`location-parallax.tsx:30`: „Ersatzfläche, solange das Foto fehlt").
- **2× `motif-feature`** — Hero (jetzt durch `LivingField` ersetzt) und Termin-Assistent
  (`termin-wizard.tsx:374` — dort ist die Fläche jetzt leer).

Daraus folgt der Satz, der diese ganze Runde zusammenfasst:

> **Das Muster war nicht Deko. Es war Materialersatz.**
> Es sah nach Gestaltung aus und war in Wahrheit die Tapete über vier fehlenden Bildern und
> zwölf leeren Bändern. „Ruhiger" hat nicht das Muster entfernt, sondern die Leere sichtbar
> gemacht — und das ist ein Fortschritt, kein Rückschritt, weil man jetzt sieht, was fehlt.

Der Owner hat mit dem Abschalten also nicht das Grid bewertet. Er hat, ohne es zu beabsichtigen,
den härtesten Ehrlichkeitstest der Seite gestartet.

### 2.5 Bewertung von `LivingField` (die Vorschau)

`components/hero/living-field.tsx` — 10 Knoten, 12 Kanten, 3 Signalrouten, reines CSS/SMIL, kein
Client-JS, `prefers-reduced-motion` sauber behandelt (`:59-62`), ein einziger Regler `intensity`
(`:22-26`).

**Technisch das Beste, was in dieser Preview-Runde entstanden ist.** Kein JS im kritischen Pfad,
deterministisch, ein Parameter statt zehn Zahlen im Markup.

**Konzeptionell noch nicht CI, sondern Atmosphäre.** Drei Gründe:
1. Die Knotenpositionen sind eine **handgesetzte Liste** (`:29-32`) — schöner als Zufall, aber
   ebenfalls ohne Bedeutung. Warum zehn Knoten? Warum diese zwölf Kanten?
2. Es lebt nur im Hero. Ein CI-Zeichen muss auf 14 Flächen funktionieren, sonst ersetzt es das
   alte Motiv nicht, sondern kommt dazu — und zwei Motive sind kein Motiv (die Lehre steht schon
   in `globals.css:544-548`).
3. Es ist nicht tokenisiert: die Intensität wohnt in der Datei, nicht im System.

**Empfehlung: behalten, aber die Knoten aus der Marke ableiten** (§4.2). Aus zehn beliebigen
Punkten werden die **fünf Ebenen** — dann ist es kein Hintergrund mehr, sondern eine Aussage.

---

## 3 · MOTION / „TECH-ENERGIE"

### 3.1 Ist-Zustand, gezählt

| Messgröße | Wert |
|---|---|
| Dateien mit `framer-motion` | **9 / 145** |
| Dateien mit `whileInView` | **2** (`reveal.tsx`, `image-unveil.tsx`) |
| Dateien mit Scroll-Kopplung (`useScroll`) | **2** (`architectural-field.tsx`, `location-parallax.tsx`) |
| Dauerbewegungen | **1** (Pfeil im Hero, `hero.tsx:126-127`) + 2 Marquee-Keyframes (`globals.css:595-619`) |
| `transition-colors` | **132** |
| `duration-500` | **131** |
| Marken-Kurve `cubic-bezier(0.22,1,0.36,1)` | **54×** (48× als Zeichenkette, 6× als Array) |

**Die Diagnose:** Die Seite hat keine tote Bewegung — sie hat **eine** Bewegung, 131 Mal
wiederholt: eine Farbe verblasst in einer halben Sekunde bei Hover. Dazu kommt `Reveal`
(`reveal.tsx:27-30`) mit immer denselben Werten (`y: 24`, `0.9 s`), rund 250 Mal eingesetzt.

Ein Effekt, überall gleich angewandt, ist keine Choreografie — er wird **Tapete**. Der Besucher
lernt ihn nach der zweiten Sektion und sieht ihn danach nicht mehr. Deshalb wirkt die Seite
„still", obwohl sich technisch dauernd etwas bewegt. Die Owner-Schätzung „gefühlt 3 %" ist
präzise; ich würde sie so korrigieren: **es bewegen sich ~15 % der Elemente, aber sie sagen
zusammen genau eine Sache.**

**Positiv, und wichtig für den nächsten Schritt:** Die Marken-Kurve ist bereits konsistent
(54× dieselbe), `prefers-reduced-motion` wird überall respektiert
(`lib/use-prefers-reduced-motion.ts`, `reveal.tsx:19-22`, `globals.css:627-634`). Die *Haltung*
zu Bewegung stimmt. Es fehlt das *Vokabular*.

### 3.2 Der blockierende Befund: es gibt keine Motion-Token

`globals.css` definiert Farbe (60 Zeilen), Typo (9 Ebenen), Raster (4 Utilities), Elevation
(3 Stufen), Motiv-Lautstärke (3 Stufen) — und **null** Motion-Token. Keine `--ease-brand`, keine
`--dur-fast/base/slow`, keine `--stagger`.

Konsequenz: Die Marken-Kurve steht als Zeichenkette 54× im Markup. Wer die Bewegungssprache der
Marke ändern will, ändert 54 Stellen. **Eine Motion-DNA ist heute nicht einführbar, sie ist nur
nachkopierbar.** Das ist die einzige echte Architektur-Lücke im sonst guten Token-System — und
sie steht ausgerechnet vor dem, was der Owner als Nächstes will.

### 3.3 Bewertung der Owner-Formel „85 % Ruhe / 15 % Bewegung"

**Als Mengenangabe unbrauchbar, als Haltung richtig — mit einer schärferen Fassung:**

Nicht *wie viel* sich bewegt entscheidet, sondern *wie viele verschiedene Dinge* Bewegung sagt.
Vorschlag als prüfbare Regel:

> **Pro Sektion höchstens eine Bewegung, und sie muss etwas erklären, das ohne sie unklar bliebe.**
> Bewegung, die nur „lebendig" sein will, ist Deko und fällt unter dieselbe Regel wie erfundene
> Referenzen: sie behauptet etwas, das nicht da ist.

### 3.4 Motion-DNA — drei Stufen, begründet

| Stufe | Wo | Was | Warum genau dort | Status |
|---|---|---|---|---|
| **1 · Atmosphäre** | nur Hero | dauerhaft, langsam, unter der Reizschwelle — `LivingField` | Der Hero ist der einzige Ort, an dem der Besucher wartet statt liest. Bewegung darf hier tragen. | prototypisiert |
| **2 · Choreografie** | Sektionsübergänge | **drei** benannte Reveals statt einem — je Archetyp einer: A editorial (Zeile steigt), B Raster (Zellen versetzt, entlang der Fuge), C Band (Fläche schiebt) | Der Takt A/B/C ist in `home.tsx:48-55` bereits gedacht, aber alle drei bewegen sich identisch. Die Bewegung ist die einzige Stelle, an der man den Archetyp *spürt*. | **fehlt** |
| **3 · Produktbeweis** | Produkt- & Case-Seiten | Bewegung ausschließlich an echtem Produkt-UI (Zustandswechsel zeigen, nicht Deko) | Hier ist Bewegung Argument: ein System, das arbeitet. | **blockiert — es gibt kein Material** (§4) |

**Vorbedingung für Stufe 2 und 3:** Motion-Token in `globals.css`. Ohne sie wird jede Stufe
wieder handkopiert.

Zur BNX-Referenz: als *Zielgefühl* („da passiert etwas, das Haus arbeitet") tauglich, als
*Vorbild* nicht — und der Grund ist nicht Geschmack, sondern die Zielgruppe. Handwerksbetriebe
und KMU lesen laute Bewegung als „teure Agentur", und das ist exakt die Zuschreibung, gegen die
`EntryLine` (`home.tsx:94-106`) inhaltlich anarbeitet. Die Seite darf sich nicht optisch
zurückholen, was sie textlich gerade abgeräumt hat.

---

## 4 · STRUKTUR · INHALT · TECHNIK · POSITIONIERUNG

### 4.1 Struktur / IA / Rhythmus — 65 %

**Gut.** Navigation fünf Punkte plus `/termin` (`site-data.ts:946-951`) — knapp, keine
Ausklapp-Menüs. Die Startseite ist ein Verteiler, kein Verkaufstrichter, und das ist im Code
begründet (`home.tsx:14-78`). Die Conversion-Hierarchie ist entschieden: `/termin` schließt ab,
`/kontakt` ist der direkte Weg (`hero.tsx:98-99`).

**Der Rhythmus-Befund.** Der Archetypen-Takt C-A-C-B-C-B / C-A / C ist auf der Startseite echt.
Über die ganze Seite hinweg aber:

- **46× `section-shell`** gegen 5× `-band` und 12× `-tight`
- **`SectionEyebrow` 53× in 39 Dateien** — Goldlinie + Versal-Mono-Label. **Jede
  Sektion der Seite öffnet mit exakt derselben Geste.**

Auf den Unterseiten — `/leistungen`, `/produkte`, `/unternehmen`, `/betrieb`, `/systeme` — gibt
es den Takt nicht. Dort läuft der Grundtakt (Eyebrow → H2 → Lead → Raster) zwölf-, vierzehn-,
zwanzigmal hintereinander (`produkt-page-body.tsx`: 20 `Reveal`;
`accessibility-page-body.tsx`: 14; `systeme-page-body.tsx`: 12).

**Bewertung:** Der Rhythmus ermüdet nicht auf der Startseite — er ermüdet **eine Ebene tiefer**,
und das ist die Ebene, auf der ein Kaufinteressent tatsächlich liest. Die Archetypen-Idee ist
richtig und nur zu 20 % ausgerollt.

### 4.2 Inhalt / Beweis — 10 %, und Code hilft hier nicht

Drei Gating-Maschinen, alle sauber gebaut, alle **leer**:

```
lib/product-media.generated.ts:14   PRODUCT_SCREENS = {}    → 0 Produkt-Aufnahmen
lib/client-logos.generated.ts       CLIENT_LOGOS    = {}    → 0 Kundenlogos
lib/company-media.generated.ts      COMPANY_PHOTOS  = {}    → 0 Firmenfotos (4 Slots definiert)
```

Der gesamte Bildbestand der Seite (`public/`, ohne READMEs):

| Datei | Anmerkung |
|---|---|
| `works/meai.png`, `fibero.png`, `cassamea.png` | eigene Produkte — je **eine** Ansicht |
| `works/rumis-maison.png`, `bir-damla-hayir.png` | Kundenwerk, **nicht freigegeben** (siehe `[[creadig-keine-designreferenzen]]`) |
| `images/ico-osnabrueck.jpg` | der Standort — das einzige Foto der Seite |
| `brand/*.svg,png`, `brand/products/*` | Logos |

**Das ist alles.** Eine Website eines Hauses, das für sich in Anspruch nimmt, Systeme zu bauen,
zeigt **ein** Foto und **drei** Produktbilder.

Und die schwerste Stelle: `product-media.ts:8-16` beschreibt exakt richtig, warum es die Sperre
gibt („kein erfundenes Material, keine Fake-UI, kein Deko-Laptop") — die Regel ist gut, die
Umsetzung ist gut, und sie steht seit Wochen auf `{}`. KIZILELMA §10.5 verlangt **4–8 echte
Screens je Produkt**. Vorhanden: 0.

> **Der unsichtbare Moat.** creaDIG hat etwas, das fast keine Agentur hat: vier selbst gebaute,
> selbst betriebene Systeme. Das ist der einzige Beweis, den kein Wettbewerber kopieren kann —
> und er ist auf der Seite **unsichtbar**. Kein Screen, kein Zustand, kein Zahlenbild. Die Seite
> *erzählt* vom Haus und *zeigt* eine Adresse in Osnabrück.

Das ist der größte visuelle Verlust — größer als Radius, größer als Motiv, größer als Motion.
Vier Screenshots aus meAI verändern die Wirkung der Seite stärker als jeder Design-Pass. Und
diese Analyse kann das nicht lösen: es ist eine **Owner-Lieferung**, keine Bauaufgabe.

Die Ehrlichkeits-Gates selbst bewerte ich als **richtig und beizubehalten**. Sie sind der Grund,
warum die Seite nicht lügt (`home.tsx:141-151`, `product-media.ts:8-16`). Der Preis ist eine
leere Bühne — das ist der korrekte Preis. Der Fehler wäre, ihn durch Muster zu kaschieren, und
genau das hat das Dreiecksraster getan (§2.4).

### 4.3 Technik / Frontend — 75 %, mit einer scharf benennbaren Lücke

**Wie leicht ist ein NEUES CI anwendbar?** Differenziert:

| Achse | Aufwand | Warum |
|---|---|---|
| **Farbe** | trivial | ein Tokensatz, dreimal gespiegelt (`:root`, `.dark`, `.section-dark`) |
| **Typografie** | trivial | eine Variable in `site-shell.tsx:51`, Skala bleibt |
| **Radius** | **Token einzeilig — Wirkung nicht** | `globals.css:54-57`+`:102` ändern reicht *nicht*: **34 `gap-px`-Raster setzen Schärfe voraus.** Runde Zellen lassen sich nicht fugenlos aneinanderlegen; die Fuge muss zu Luft werden. Der Radius ist also kein Oberflächenwert, er **zwingt die Komposition auseinander** — was fachlich genau richtig ist (§4.4), aber ehrlich beziffert werden muss: 24 Dateien, nicht eine Zeile. |
| **Motiv** | mittel | eine Komponente, 14 Aufrufe, drei Lautstärke-Klassen (`globals.css:556-568`) — gut gekapselt, aber **kein Slot**: die Fläche kann nicht pro Kontext eine andere Motiv-Variante bekommen, ohne alle 14 Stellen anzufassen |
| **Motion** | **gar nicht** | keine Token; 54× kopierte Kurve (§3.2) |

**Weiteres, das für das Visuelle zählt:**
- `logo.tsx:23-35` lädt **zwei** `<img>` und blendet eines per `dark:hidden` aus — beide werden
  geladen. Klein, aber es ist der Marken-Träger im kritischen Pfad.
- Die Vorschau (`return null` **vor** dem restlichen Funktionskörper, `signature-motif.tsx:44`)
  ist als Experiment sauber (ein Ort, rückholbar, dokumentiert) — als Dauerzustand nicht: der
  gesamte Generator bleibt im Bundle, und vier `motif-placeholder`-Flächen rendern jetzt eine
  leere graue Fläche mit einem Kartennadel-Kästchen (`location-parallax.tsx:38-42`).

### 4.4 Die Leitidee — Vorschlag, mit vollständiger Ableitung

> ## „Die Fuge trägt."
> Eine Linie ist bei creaDIG **nie ein Rand, immer eine Verbindung.**
> Was das Haus baut, ist nicht die Kiste — es ist das, was zwischen den Kisten liegt.

Warum diese und keine andere: Sie ist die einzige, die aus der Omurga *und* aus dem bestehenden
Code folgt. Die Seite besteht bereits fast vollständig aus Linien (251) und Fugen (34 Raster) —
sie behandelt sie nur als Trennung. Es braucht keinen neuen Formenapparat, sondern eine
**Umdeutung des vorhandenen**. Und sie löst alle drei Owner-Signale auf einmal:

**Ableitung 1 — Geometrie / Radius (löst „runder / wärmer").**
Wenn die Fuge trägt, darf sie nicht 0 sein. Aus `gap-px` (1 px, fugenlos) wird echte Luft, und
sobald Zellen Luft zwischen sich haben, brauchen sie Ecken — sonst schweben Rechtecke im Nichts.
Radius wird damit **nicht dekorativ, sondern notwendig**. Empfehlung: ein Flächen-Radius
(Karten, Kacheln, Knöpfe, Bilder) in der Größenordnung 10–12 px, ein Steuerelement-Radius bei
4–6 px, `--radius-xs` entfällt. Der Kohärenzdruck aus `button.tsx:7-9` kehrt sich um: dann ist
das *scharfe* Element der Fremdkörper.
*Ehrliche Kosten:* 24 Dateien mit `gap-px` müssen mit. Das ist der eigentliche Design-Pass, nicht
das Token.

**Ableitung 2 — Motiv (löst „Bedeutung + Ordnung").**
Das Motiv sind die **fünf Ebenen** (Identity → Digital → Operations → Automation → Intelligence)
als fünf Knoten, verbunden nach dem tatsächlichen Modell, **deterministisch aus `site-data`
erzeugt** — nicht aus einem PRNG. Eine Regel, drei Zustände:

- Startseite / Hero: alle fünf atmen, ein Signal läuft durch (das ist `LivingField`, nur mit
  bedeutungstragenden Knoten statt der handgesetzten Liste in `living-field.tsx:29-32`)
- Leistungsseite Ebene *n*: derselbe Bau, Knoten *n* leuchtet
- Bänder / Kopfzonen: derselbe Bau, stark reduziert, kein Signal

Damit ist das Motiv **überall dasselbe Zeichen** (Ordnung), es **sagt jedes Mal etwas anderes**
(Bedeutung), es ist **aus den eigenen Daten abgeleitet** (nicht erfunden) — und es funktioniert
hell wie dunkel, weil es Linie und Punkt ist, nicht Fläche (das war der Schwarz-auf-Schwarz-
Befund aus `creadig-DESIGN-IDENTITAET.md`).

**Ableitung 3 — Farbe.** Gold bekommt eine Rolle statt einer Erlaubnis: **Gold markiert
ausschließlich Verbindungen** — Knoten, Fugen, Übergänge, aktive Zustände. Nirgends sonst. Damit
wird aus einer Akzentfarbe ein Bedeutungsträger, und die Palette bleibt unverändert (§2.2).

**Ableitung 4 — Typografie: Poppins bleibt.**
Das ist eine **bewusste Abweichung** von `creadig-DESIGN-IDENTITAET.md` („Poppins ablösen →
charaktervoller Grotesk"). Begründung: Poppins ist heute die einzige Formentscheidung, die aus
der Marke abgeleitet ist (`site-shell.tsx:50`). Sie war nie das Problem — das Problem war, dass
sie allein stand. In dem Moment, in dem die Geometrie rund wird, ist Poppins **konsequent** statt
fremd. Eine charaktervolle Grotesk (Space Grotesk o. ä.) würde in die *scharfe* Richtung führen
— das wäre der andere kohärente Weg (siehe Entscheidung 1 in §4.5), aber er widerspricht dem
Owner-Signal „wärmer" und der Zielgruppe.

**Ableitung 5 — Bildsprache.** Nur eigenes Material: Produkt-Screens, echte Fotos, der ICO. Kein
Stock, keine Deko-Laptops (KIZILELMA §10.9). Solange das fehlt, trägt das Motiv die Fläche —
aber **als benannter Ersatz**, nicht als Tapete: es darf sichtbar sein, dass hier ein Bild
hingehört.

### 4.5 Reifegrad — ehrlich, je Dimension

| Dimension | Reife | Ampel | Begründung |
|---|---|---|---|
| Positionierung / Kategorie | **85 %** | 🟢 | entschieden, konsistent, trägt (KIZILELMA §10.1) |
| Typo-Skala | **80 %** | 🟢 | eine Quelle je Ebene, kalibriert |
| Token-/CSS-Architektur | **75 %** | 🟢 | vorbildlich — außer Motion |
| Farbe | **70 %** | 🟡 | warm, barrierefrei, aber Gold ohne Rolle |
| Struktur / IA | **65 %** | 🟡 | Startseite gut, Unterseiten monoton |
| Spacing / Raster | **65 %** | 🟡 | Utilities gut, 46/63 gleiche Form |
| **Motion** | **20 %** | 🔴 | ein Effekt, 131×; **keine Token** |
| **Geometrie / Radius** | **15 %** | 🔴 | entschieden — gegen die Marke |
| **Beweis / Material** | **10 %** | 🔴 | drei leere Maschinen, 0 Produkt-Screens |
| **Motiv / CI-Zeichen** | **5 %** | 🔴 | zufallsbasiert, agenturhistorisch, aktuell aus |
| **Gesamt-CI** | **~25 %** | 🔴 | |

Zur Owner-Schätzung von 10 %: zu hart, aber im Ergebnis richtig empfunden. Der **Unterbau** liegt
bei ~75 %, die **oberste Schicht** (Leitidee, Zeichen, Bewegung) bei ~10 %, das **Material** bei
10 %. Weil ein Besucher nur die oberste Schicht und das Material sieht, fühlt sich das Ganze wie
10 % an. Die gute Nachricht steckt in derselben Zahl: Es ist kein Neubau, es ist ein Dach.

### 4.6 Positionierung / Wettbewerb — als Input

Positionell ist die Arbeit getan: eigene Kategorie („kein klassisches IT-Systemhaus — ein
System-Haus für digitale Betriebe"), fünf Ebenen als IP, drei Markensätze, Verb-Welt. Der Code
trägt das (`dictionary.ts:465, 534-536, 560, 1063`).

**Visuell sitzt creaDIG heute im Feld „sorgfältiges Studio".** Ruhig, korrekt, hell, Haarlinien,
ein Akzentton. Das ist glaubwürdig und es ist **nicht das Problem** — das Problem ist, dass es
nichts **Spezifisches** signalisiert. Wer die Seite ohne Logo sähe, könnte sie jedem
mitteleuropäischen Design-Studio zuordnen.

Zu BNX: Der Owner liest dort „lebendig", und das stimmt — aber das übertragbare Element ist nicht
die Lautstärke, sondern dass **die Bewegung dort etwas über die Firma behauptet**. Genau das
fehlt hier: creaDIGs Bewegung sagt heute „Hover funktioniert". Sie müsste sagen: *durch dieses
Haus fließt etwas.* Das ist Stufe 1 der Motion-DNA — und `LivingField` ist bereits der richtige
Ansatz dafür.

**Wohin creaDIG optisch muss:** vom *sorgfältigen Studio* zum **System-Haus mit Substanz** — und
Substanz heißt an dieser Stelle wörtlich: Material. Ein Wettbewerber kann Haarlinien und warmes
Anthrazit in einer Woche kopieren. Vier eigene, laufende Systeme kann er nicht kopieren.

---

## 5 · SYNTHESE

### 5.1 Das eine Kernproblem

> **Die Form der Seite widerspricht der Aussage der Marke — 251 trennende Linien gegen ein
> Versprechen von Verbindung — und weil keine generative Leitidee existiert, aus der Form
> ableitbar wäre, war dieser Widerspruch nie eine Entscheidung, sondern das Ergebnis vieler
> einzeln richtiger.**

### 5.2 Warum „Die Fuge trägt" die Owner-Signale auflöst

| Owner-Signal | Auflösung |
|---|---|
| „runder / wärmer" | Rundung wird **notwendig**, sobald die Fuge Luft ist — nicht Geschmack, sondern Folge |
| „zu still" | Bewegung bekommt einen Ort: sie läuft **entlang der Fugen** (Signale zwischen Knoten). Sie erklärt etwas, statt zu dekorieren |
| „Motiv ohne Bedeutung/Ordnung" | Das Motiv sind die fünf Ebenen, deterministisch aus den eigenen Daten. Ordnung durch eine Regel, Bedeutung durch das Modell |
| „nicht premium / Standard" | Premium entsteht nicht durch mehr Gestaltung, sondern durch **Ableitbarkeit**. Eine Seite, deren Formen sichtbar auseinander folgen, liest sich als System |
| „BNX ist zu laut" | Bewegung bleibt an eine Bedingung geknüpft: sie muss etwas erklären. Damit ist Lautstärke ausgeschlossen |

### 5.3 Der priorisierte Weg

**A · Was der Owner ENTSCHEIDEN muss (blockiert alles Weitere)** → §5.4

**B · Was als Nächstes VISUELL gezeigt wird — nicht in dieser Runde bauen, nur empfehlen:**
**2–3 vollständige CI-Richtungen als Mockup**, je Hero + eine Rasterseite, hell und dunkel, ohne
Live-Code:

1. **„Die Fuge trägt"** — Empfehlung dieses Dokuments: runde Flächen, Luft statt `gap-px`, Gold
   nur an Verbindungen, Fünf-Knoten-Motiv, Poppins bleibt.
2. **„Der Schnitt"** — die kohärente Gegenrichtung: Schärfe wird zur Haltung, `gap-px` bleibt,
   dafür **Poppins raus** zugunsten einer charaktervollen Grotesk. Kalt, aber stimmig. (Diese
   Richtung entspricht `creadig-DESIGN-IDENTITAET.md`.)
3. **„Das Fenster"** — falls Material zuerst kommt: die Produkt-Screens tragen die Fläche, das
   Motiv wird zum Rahmen und tritt fast völlig zurück.

Der Owner reagiert am Bild, nicht am Text — das steht bereits in `creadig-DESIGN-IDENTITAET.md`
und ist der einzige Punkt, an dem diese Analyse-Kette bisher stecken geblieben ist.

**C · Was danach kommt, in dieser Reihenfolge:**
1. **Motion-Token** in `globals.css` (`--ease-brand`, drei Dauern, `--stagger`). Ohne sie wird
   jede Motion-Arbeit wieder 54× kopiert. Kleinster Aufwand, größter Hebel.
2. **Radius-Entscheidung** umsetzen — Token *und* die 24 `gap-px`-Dateien.
3. **Motiv als Slot** neu bauen (fünf Knoten aus `site-data`, drei Zustände).
4. **Drei Reveals statt einem**, an die Archetypen gebunden.
5. **Archetypen auf die Unterseiten** ausrollen (dort ermüdet der Takt, §4.1).

**D · Was NICHT als Design-Aufgabe zählt, aber alles überstrahlt:**
**Material.** Vier Produkt-Screens verändern die Seite mehr als die Punkte 1–5 zusammen. Solange
`PRODUCT_SCREENS = {}` gilt, ist Dimension „Beweis" bei 10 % gedeckelt — durch Arbeit an der
Seite nicht erreichbar (das ist Skala B aus KIZILELMA §11).

### 5.4 Offene Owner-Entscheidungen

1. **Radius: rund oder scharf?** Nur einer von beiden Wegen ist kohärent — „rund + Poppins"
   (Richtung 1) oder „scharf + Grotesk" (Richtung 2). Der heutige Zustand ist die Mischung aus
   beidem und deshalb charakterlos. *Empfehlung: rund* (folgt aus Marke, Logo, Zielgruppe und
   dem eigenen Signal „wärmer").
2. **Fünf-Knoten-Motiv als CI-Zeichen — ja oder nein?** Wenn nein: welche Bedeutung soll das
   Zeichen sonst tragen? Ein drittes bedeutungsloses Motiv ist der einzige Ausgang, der
   ausgeschlossen gehört.
3. **Poppins bleibt?** (Widerspricht `creadig-DESIGN-IDENTITAET.md` — bewusst, §4.4.)
4. **Bleibt das Motiv bis zur Entscheidung global aus?** Wenn ja, sollten die vier
   `motif-placeholder`-Flächen einen ehrlichen Leerzustand bekommen statt einer grauen Fläche.
5. **Material — was kommt wann?** Konkret: wie viele Screens je Produkt (meAI, fibero, CASSAMEA,
   meahv), welche der vier Firmenfoto-Slots (`buero`, `ico`, `arbeitsplatz`, `whiteboard`),
   welche Kundenlogos sind freigegeben. Ohne Datum bleibt §4.2 unverändert.
6. **Werden Mockups gebaut — und für welche der drei Richtungen?** (2 oder 3, nicht 1: eine
   Richtung allein ist keine Entscheidung.)
7. **Wird die Bewegungsregel „max. 1 Bewegung je Sektion, und sie muss etwas erklären"
   verbindlich?** Sie ist die Sperre gegen BNX-Lautstärke.

### 5.5 Was diese Analyse NICHT beantwortet

- **Wie es sich anfühlt.** Alle Aussagen sind aus dem Code abgeleitet, nicht aus einer laufenden
  Seite. Wahrnehmung entscheidet der Owner am Mockup.
- **Ob die Referenz-Lage die Bildsprache trägt.** Zwei der fünf Werkbilder sind nicht freigegeben
  — welche Werke gezeigt werden dürfen, ist eine Owner-Frage, keine Design-Frage.
- **Die Schriftwahl im Detail.** „Poppins bleibt" ist eine Systemaussage, kein Satzbild-Test.
- **Aufwände in Stunden.** Angegeben sind Reichweiten (Dateien, Stellen), nicht Schätzungen.

---

*Erstellt: 27.08.2026 · Master-Prompt 11 · nur Analyse, kein Code geändert.*
*Verwandte Notizen: `[[creadig-ci-motif-rethink]]`, `[[creadig-premium-loop]]`,
`[[creadig-keine-designreferenzen]]`, `[[creadig-portfolio-umbrella]]`.*
