# Creative Direction · creaDIG

> Eine Richtung, keine Markenbibel (§37). Alles Visuelle leitet sich ab hier ab.
> Stand 13.09.2026 · gilt für alle vier Sprachen.

## Der Befund, von dem aus wir arbeiten

Das **Design-System** ist stark: Papier, warmes Anthrazit, Gold, runde Fett-Typo,
Haarlinien. Das **Creative-System** fehlt: kein Leitmotiv, kein Systembild, kein
Signature-Moment. Das System wird **erzählt**, nicht **gezeigt**.

Wir werfen nichts davon weg. Wir entwickeln das **eine Element**, das die Seite
bereits besitzt und bisher nur dekorativ benutzt: **die Haarlinie.**

---

## 1 · Visuelle These

> **Ein Betrieb ist eine Linie. Bei den meisten ist sie unterbrochen.**

Die Firma sagt es selbst, in zwei Sätzen, die es schon gibt:

> „Die Arbeit ist da. Das System dahinter fehlt."
>
> „Anfrage, Angebot, Termin, Auftrag, Dokumentation, Rechnung —
> sechs Schritte, meist sechs Werkzeuge."

Das ist die ganze Marke in einem Bild: **sechs Schritte, die eine Linie sein
sollten, aber fünf Lücken haben.** creaDIG baut nicht „Digitalisierung" — creaDIG
**schließt die Lücken zwischen den Schritten.**

Damit wird aus der Haarlinie ein Argument: Sie ist nicht mehr Trennstrich,
sondern **der Weg, den die Arbeit nimmt.**

---

## 1a · Die eine Regel

> **Die Linie ist semantisch. Nie dekorativ.**

Eine Linie aus dem Vokabular darf bedeuten: Fluss, Uebergabe, Verbindung,
Unterbrechung, Zustand, Weg, Fortschritt, Signal.

Sie darf **nicht** sein: ein Trennstrich, ein goldener Zierstrich, eine
Tapete. Dafuer gibt es `border-line` — die Trennlinie des Design-Systems, die
mit diesem Vokabular nichts zu tun hat.

**Wer eine Linie setzt, muss sagen koennen, was an ihr entlanglaeuft.**

Diese Regel hat in der Umsetzung zweimal eine Entscheidung umgedreht:

- Beim Ueberfahren einer Ebenenzeile lief ein goldener Strich von links nach
  rechts ein. Huebsch, ohne Bedeutung — ersetzt durch einen Knoten, der
  groesser wird: *diese* Ebene ist gerade aktiv.
- Die drei Wege waeren beinahe als Stationen auf einer Strecke gelandet. Das
  haette behauptet, Weg A komme vor Weg B — waehrend der Text daneben das
  Gegenteil sagt. Jetzt sind sie drei **Stellen, an denen man auf die Linie
  aufspringt**, und die Linie laeuft an beiden Enden weiter.

### Praezisierung aus Run B — was die Regel NICHT meint

Die Regel gilt fuer die **Systemlinie**: das Vokabular aus
`components/creative/system.tsx`, das eine Aussage ueber den Betrieb macht.

Sie gilt **nicht** fuer die Hover-Anzeige, die seit Langem in zehn
Komponenten liegt (`bg-gold ... w-0 group-hover:w-full`). Die sagt nichts
ueber den Betrieb; sie sagt „diese Zeile ist anklickbar". Das ist
Bedienrueckmeldung, kein Systembild.

In Run A habe ich sie bei den fuenf Ebenen entfernt und das mit der Regel
begruendet. Die Begruendung war zu weit gefasst — nach ihr haetten zehn
Komponenten ihre Rueckmeldung verloren, und die Seite waere unbedienbarer
geworden, nicht praeziser.

**Die Trennlinie, die tatsaechlich gilt:**

> Wo die Schiene liegt, aktiviert der Knoten.
> Wo keine Schiene liegt, bleibt die vorhandene Hover-Anzeige.

Bei den fuenf Ebenen war die Entfernung deshalb trotzdem richtig — dort gibt
es eine Schiene, und zwei Aktivierungsanzeigen nebeneinander waeren eine zu
viel. Auf `/produkte` gibt es keine, also bleibt die Anzeige.

## 1b · Das Vokabular — drei Bausteine

Umgesetzt in `components/creative/system.tsx`.

| Baustein | Bedeutung | Form |
|---|---|---|
| **SystemLine** | der Weg, den die Arbeit nimmt | Haarlinie; `ton: offen` oder `verbunden` |
| **SystemNode** | eine Station, ein Zustand, ein Einstieg | Punkt; gold = verbunden |
| **Die Luecke** | eine Uebergabe von Hand | die Linie hoert vor der Grenze auf |

Zwei Achsen: `fluss` (waagerecht ab `md`, senkrecht auf dem Telefon) und
`stapel` (immer senkrecht — ein Stapel, der waagerecht liegt, ist keiner).

Ein Vokabular mit vierzig Woertern ist kein Vokabular. Diese drei tragen alle
vier Stellen, an denen die Seite heute ein System zeigt: Systembild, fuenf
Ebenen, Das Haus, Hero.

## 2 · Signature-System · „Der Betriebsfluss"

Ein wiederkehrendes Bild, überall dieselbe Grammatik:

| Element | Bedeutung | Form |
|---|---|---|
| **Die Spur** | der Weg der Arbeit durch den Betrieb | durchgehende Haarlinie |
| **Die Station** | einer der sechs Schritte | kleiner Punkt auf der Spur |
| **Die Lücke** | Bruchstelle zwischen zwei Werkzeugen | Unterbrechung der Linie |
| **Das Signal** | ein Vorgang, der läuft | goldener Punkt, der wandert |
| **Die Ebene** | eine der fünf Ebenen | horizontale Schicht **unter** der Spur |
| **Das Fundament** | Ebene 01 | die einzige starke Linie im Bild |

**Die Regel, die alles zusammenhält:** Die Ebenen liegen **unter** der Spur, nicht
daneben. Sie tragen sie. Fehlt eine Ebene, bricht die Spur darüber. Das ist
exakt der Satz „Jede Ebene trägt die nächste" — als Bild statt als Behauptung.

**Wo es wiederkehrt:** Startseite (These), fünf Ebenen (lebendig), Produkte
(Systemfenster), Betriebscheck-Ergebnis (persönliche Landkarte), später der
Kunden-Case (Vorher/Nachher derselben Spur).

**Was es NICHT ist:** kein Netzwerkgraph, kein Force-Graph, keine Partikel, kein
3D. Ein Diagramm, das nichts erklärt, ist Dekoration mit Systemstimme.

---

## 3 · Diagramm-Sprache

- **Zweidimensional.** Waagerecht = Zeit/Ablauf. Senkrecht = Tiefe/Ebene.
- **Eine Betonung pro Bild.** Entweder die Lücke oder das Signal — nie beides laut.
- **Gold ist knapp.** Gold markiert genau eine Sache: das, was gerade läuft, oder
  das Fundament. Alles andere ist Linie und Ton.
- **Jede Zeichnung liest ihre Quelle.** Kein SVG mit eingefrorenen Daten; die
  Bilder lesen `serviceLayers` und Wörterbuch, sonst driften sie weg.
- **Jedes Modell trägt sein Etikett.** Ein konzeptionelles Bild sagt, dass es
  ein Modell ist. Ein Bild ohne Etikett wird als Messung gelesen.

## 4 · Bewegungs-Sprache

> **Es bewegt sich nur das Signal.**

- Ein bewegtes Element je Abschnitt. Die Linie selbst bewegt sich nie.
- Bewegung erklärt **Richtung**: Arbeit läuft von links nach rechts durch den
  Betrieb, von unten nach oben durch die Ebenen.
- Keine Bewegung vor einer Handlung. Nichts verzögert eine Schaltfläche.
- `prefers-reduced-motion`: Endzustand sofort — durchgehende Spur, Signal in
  Ruhe. **Der Inhalt ist nie unsichtbar** (D-28 gilt weiter).

## 5 · Artefakt-Stil · „Das Systemfenster"

Echte Produktbilder stehen nicht frei, sondern **im Fluss**: Die Spur läuft in
den Rahmen hinein und auf der anderen Seite wieder heraus. Damit beweist ein
Screenshot nicht nur „es gibt eine Oberfläche", sondern „diese Oberfläche sitzt
an dieser Stelle des Betriebs".

Erlaubt: beschneiden, rahmen, hervorheben, beschriften.
Nicht erlaubt: die gezeigte Wahrheit ändern.

Jedes Artefakt beantwortet: **Was ist das? Was belegt es? Wann? Was belegt es nicht?**

## 6 · Bild-Stil

Rangfolge: **echtes System → echtes Produkt → echter Arbeitskontext → echte
Menschen → konzeptionelles Systembild → (erst dann) Dekoration.**

Die zwei vorhandenen Produkt-im-Einsatz-Fotos sind der stärkste reale Aktivposten
der Seite. Sie bleiben. Kein Stock, keine KI-Büromenschen, keine erfundenen
Dashboards, keine Geräte-Collagen.

## 7 · Editorialer Rhythmus

Der Default-Takt `eyebrow → H2 → Text → Karten` ist der Grund, warum die Seite
nach dem Hero aufhört zu überraschen. Ersetzt durch **fünf Modi**:

| Modus | Zweck |
|---|---|
| **Manifest** | ein Satz, viel Ruhe |
| **Systembild** | die Zeichnung trägt, Text erklärt sie nur |
| **Artefakt** | ein echtes Ding, groß, mit Bildunterschrift |
| **Entscheidung** | Wege, Preise, nächster Schritt |
| **Ruhe** | bewusst kurz — Pause zwischen zwei lauten Abschnitten |

**Regel:** Keine drei benachbarten Abschnitte im selben Modus.

## 8 · Mobile-Prinzip

> **Auf dem Telefon steht die Spur senkrecht.**

Nicht gestapeltes Desktop: dieselbe These, um 90° gedreht — und senkrecht ist
ohnehin die natürliche Leserichtung. Die Stationen werden zu Haltepunkten
untereinander, die Ebenen zu Bändern dahinter. Was auf 1440 nebeneinander
argumentiert, argumentiert auf 390 untereinander — mit demselben Bild.

Kein Hover als einziger Zugang. Alles Antippbare ist antippbar.

---

## Was diese Richtung ausdrücklich nicht tut

Sie macht creaDIG **nicht größer**. Sie erfindet keinen Kunden, keine Zahl,
keinen Beweis. Die leere Beweisfläche (`/arbeiten`) bleibt leer, bis eine echte
Freigabe vorliegt — das Creative-System **ersetzt den fehlenden Kundenbeleg
nicht** und darf nicht so tun.

Was sie tut: das **bereits Wahre** endlich zeigen statt behaupten.
