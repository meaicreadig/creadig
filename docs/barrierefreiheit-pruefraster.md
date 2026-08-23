# Prüfraster Barrierefreiheit — 12 Punkte

*Stand 23.08.2026 · Grundlage: WCAG 2.1 Stufe AA · gilt für creadig.de und für Kundenprüfungen*

---

## Wofür dieses Raster da ist

Eine Prüfung, die zweimal durchgeführt zwei Ergebnisse liefert, ist keine Prüfung,
sondern eine Meinung. Dieses Raster legt für zwölf Punkte fest: **welches Kriterium**
gilt, **wie** geprüft wird und **woran** man erkennt, dass der Punkt bestanden ist.
Zwei Personen, die es unabhängig anwenden, müssen zum selben Ergebnis kommen —
daran ist es zu messen.

Die Reihenfolge ist bindend. Sie folgt der Häufigkeit der Mängel, nicht der
Nummerierung der WCAG: **Kontrast, Alternativtexte, Formularbeschriftungen und
Tastaturbedienung** stehen vorn, weil dort in der Praxis die meisten und die
folgenreichsten Fehler sitzen.

## Was dieses Raster NICHT ist

- **Keine Rechtsprüfung.** Es stellt technische Konformität mit WCAG 2.1 AA fest.
  Ob eine Seite in den Anwendungsbereich des BFSG fällt, welche Ausnahmen greifen
  und wie eine Erklärung zur Barrierefreiheit rechtlich zu formulieren ist,
  beurteilt der Anwalt des Auftraggebers — nicht dieses Dokument und nicht wir.
- **Kein Overlay-Ersatz.** Overlays und Accessibility-Widgets werden weder
  eingesetzt noch empfohlen. Sie legen eine Schicht über das Problem, statt es zu
  beheben, und werden von Screenreader-Nutzern überwiegend abgelehnt. Ein Befund
  nach diesem Raster wird **im Code** behoben.
- **Kein Automatenergebnis.** Werkzeuge wie axe finden nach eigener Angabe
  etwa ein Drittel der Barrieren. Jeder Punkt unten, der ein Auge oder eine Hand
  braucht, wird von Hand geprüft. Ein Bericht, der nur einen Scanner
  wiedergibt, wird nicht geliefert.

## Prüfumfang festlegen (vor Punkt 1)

Geprüft wird nicht „die Website", sondern eine benannte Liste von Seiten. Als
Mindestumfang gilt:

1. Startseite
2. eine Übersichtsseite (Leistungen, Kategorie, Sortiment)
3. eine Detailseite (Produkt, Leistung, Artikel)
4. **jede Seite, auf der etwas abgeschickt wird** — Kontakt, Warenkorb,
   Buchungsstrecke, Anmeldung
5. eine Fehlerseite (404)
6. bei mehrsprachigen Seiten: dieselbe Auswahl je Sprache

Jeder Fund wird notiert als: **Route · Element · Punkt-Nummer · WCAG-Kriterium ·
was passiert · was passieren müsste.** Ohne Route und Element ist ein Fund nicht
nachvollziehbar und zählt nicht.

**Werkzeuge:** axe-core (automatisiert), Browser-Entwicklerwerkzeuge für
Kontrastwerte, Tastatur, VoiceOver (macOS) oder NVDA (Windows), Zoom 200 % und
Fenster 320 px Breite.

---

## 1 · Kontrast von Text

| | |
|---|---|
| **WCAG** | 1.4.3 Kontrast (Minimum), Stufe AA |
| **Prüfmethode** | Für jede Textfarbe auf jedem Hintergrund den Wert messen (Entwicklerwerkzeuge oder Kontrastmesser). **Beide Erscheinungsbilder prüfen**, hell und dunkel — ein Wert, der hell besteht, kann dunkel durchfallen. Besonders beachten: Text auf Bildern, Fußzeilen, Platzhalter in Feldern, deaktivierte Zustände, Text auf Farbverläufen. |
| **Bestanden** | Fließtext ≥ **4,5 : 1**. Großer Text (ab 24 px, oder ab 18,66 px bei fett) ≥ **3 : 1**. Kein Element darunter — auch nicht „nur" ein Hinweis oder eine Bildunterschrift. |
| **Häufigster Fehler** | Graue Sekundärtexte (`#8a8a8a` auf Weiß = 3,5 : 1) und Platzhaltertexte in Formularfeldern. |

## 2 · Kontrast von Bedienelementen und Fokus

| | |
|---|---|
| **WCAG** | 1.4.11 Kontrast von Nicht-Text-Inhalten, Stufe AA |
| **Prüfmethode** | Ränder von Eingabefeldern, Umrisse von Schaltflächen, Icons mit Bedeutung, Zustandsanzeigen (aktiv/gewählt) und den **Fokusrahmen** messen — jeweils gegen den Hintergrund, auf dem sie liegen. |
| **Bestanden** | ≥ **3 : 1** gegen den angrenzenden Hintergrund. Der Fokusrahmen ebenfalls, in beiden Erscheinungsbildern. |
| **Häufigster Fehler** | Eine hauchdünne Linie unter dem Eingabefeld als einzige Feldbegrenzung — schön, aber unsichtbar für viele. |

## 3 · Alternativtexte für informative Bilder

| | |
|---|---|
| **WCAG** | 1.1.1 Nicht-Text-Inhalt, Stufe A |
| **Prüfmethode** | Jedes `<img>`, jede CSS-Hintergrundgrafik mit Aussage und jedes bedeutungstragende `<svg>` durchgehen. Frage: *Wenn dieses Bild fehlte — welche Information ginge verloren?* Genau die gehört in den Alternativtext. |
| **Bestanden** | Jedes informative Bild hat ein `alt`, das die **Information** wiedergibt, nicht das Motiv beschreibt. Kein „Bild", „Grafik", „Logo" als ganzer Text. Bedeutungstragende `<svg>` haben `role="img"` und `aria-label` oder `<title>`. |
| **Häufigster Fehler** | Dateiname als Alternativtext (`alt="IMG_2831.jpg"`) und Logos ohne Firmennamen. |

## 4 · Dekorative Bilder korrekt stummgeschaltet

| | |
|---|---|
| **WCAG** | 1.1.1 Nicht-Text-Inhalt, Stufe A |
| **Prüfmethode** | Alle rein gestalterischen Elemente sammeln: Muster, Verläufe, Zierlinien, Icons neben einem Text, der dasselbe schon sagt. |
| **Bestanden** | `alt=""` (leer, aber vorhanden) beziehungsweise `aria-hidden="true"`. **Kein** fehlendes `alt` — dann liest der Screenreader den Dateipfad vor. Ein Icon neben beschriftetem Text ist dekorativ und wird stummgeschaltet, nicht doppelt vorgelesen. |
| **Häufigster Fehler** | Dekoratives Muster mit `alt="Hintergrundmuster"` — technisch korrekt, praktisch Lärm. |

## 5 · Formularbeschriftung: `label` ↔ `input`

| | |
|---|---|
| **WCAG** | 1.3.1 Info und Beziehungen (A), 3.3.2 Beschriftungen oder Anweisungen (A), 4.1.2 Name, Rolle, Wert (A) |
| **Prüfmethode** | Für **jedes** Eingabeelement — auch Auswahlfelder, Textbereiche, Kontrollkästchen, Optionsfelder und Schalter: Ist eine Beschriftung programmatisch verknüpft? Prüfen über `label[for]` ↔ `input[id]`, umschließendes `<label>`, `aria-labelledby` oder `aria-label`. Gegenprobe im Screenreader: Beim Anspringen des Feldes muss der Name genannt werden. Zweite Gegenprobe: **Klick auf die Beschriftung** muss das Feld fokussieren. |
| **Bestanden** | Kein Eingabeelement ohne zugänglichen Namen. Pflichtfelder sind als solche **im Text** gekennzeichnet, nicht nur farblich oder durch ein Sternchen ohne Erklärung. Ein Platzhalter ist **keine** Beschriftung — er verschwindet beim Tippen. |
| **Häufigster Fehler** | Suchfeld und Einwilligungs-Kontrollkästchen. Beide werden regelmäßig vergessen. |

## 6 · Fehler und Statusmeldungen

| | |
|---|---|
| **WCAG** | 3.3.1 Fehlererkennung (A), 3.3.3 Fehlerempfehlung (AA), 4.1.3 Statusmeldungen (AA) |
| **Prüfmethode** | Formular absichtlich falsch ausfüllen: leer abschicken, ungültige E-Mail, fehlende Einwilligung. Mit laufendem Screenreader beobachten, ob und wie die Meldung ankommt. Danach richtig abschicken und prüfen, ob der Erfolg angesagt wird. |
| **Bestanden** | Die Meldung wird **ohne Fokuswechsel** angesagt (`role="alert"` oder `aria-live="assertive"` für Fehler, `role="status"` oder `aria-live="polite"` für Erfolg). Sie sagt, **welches** Feld betroffen ist und **was** zu tun ist — nicht nur „Fehler". Das fehlerhafte Feld trägt `aria-invalid="true"` und ist über `aria-describedby` mit dem Meldungstext verbunden. Farbe ist nie das einzige Signal. |
| **Häufigster Fehler** | Rote Umrandung ohne Text und ohne Ansage — für einen blinden Nutzer passiert beim Absenden schlicht nichts. |

## 7 · Tastaturbedienbarkeit, ohne Falle

| | |
|---|---|
| **WCAG** | 2.1.1 Tastatur (A), 2.1.2 Keine Tastaturfalle (A) |
| **Prüfmethode** | Maus weglegen. Mit `Tab`, `Umschalt+Tab`, `Enter`, `Leertaste`, `Pfeiltasten` und `Esc` die **gesamte** Seite durchlaufen, jeden Weg zu Ende gehen: Menü öffnen und schließen, Formular ausfüllen und abschicken, Dialog öffnen und verlassen, mehrstufigen Assistenten von Schritt 1 bis zum Ende. |
| **Bestanden** | Jede Funktion, die mit der Maus erreichbar ist, ist auch mit der Tastatur erreichbar **und auslösbar**. Kein Bereich, aus dem man nicht wieder herauskommt. Dialoge und Schubladen fangen den Fokus, solange sie offen sind, geben ihn beim Schließen an das auslösende Element zurück und schließen auf `Esc`. Kein positiver `tabindex`. |
| **Häufigster Fehler** | Ein `<div onClick>` als Schaltfläche: mit der Maus bedienbar, mit der Tastatur unerreichbar. |

## 8 · Sichtbarer Fokus

| | |
|---|---|
| **WCAG** | 2.4.7 Fokus sichtbar (AA), 1.4.11 (AA) |
| **Prüfmethode** | Denselben Tastaturdurchlauf wie in Punkt 7, aber nur auf eine Frage hin: **Sehe ich jederzeit, wo ich bin?** In beiden Erscheinungsbildern, auch auf farbigen Flächen und Bildern. |
| **Bestanden** | Jedes fokussierbare Element zeigt einen deutlich sichtbaren Rahmen mit ≥ 3 : 1 Kontrast. Kein `outline: none` ohne gleichwertigen Ersatz. Der Fokus ist nicht durch feste Kopfleisten verdeckt. |
| **Häufigster Fehler** | Ein globales `*:focus { outline: none }` aus der Gestaltungsphase, das nie ersetzt wurde. |

## 9 · Reihenfolge, Sprungmarke, Landmarks

| | |
|---|---|
| **WCAG** | 2.4.1 Blöcke umgehen (A), 2.4.3 Fokus-Reihenfolge (A), 1.3.2 Bedeutungstragende Reihenfolge (A) |
| **Prüfmethode** | Erster `Tab`-Druck nach dem Laden: Erscheint ein Link „Zum Inhalt springen"? Danach: Entspricht die Tab-Reihenfolge der sichtbaren Anordnung? Struktur im Screenreader über die Landmark-Liste durchgehen. |
| **Bestanden** | Eine Sprungmarke am Anfang, sichtbar sobald sie den Fokus hat, und sie funktioniert. Genau ein `<main>`; `<header>`, `<nav>`, `<footer>` vorhanden; mehrere gleichartige Bereiche unterscheidbar benannt. Die Reihenfolge folgt dem Auge. |
| **Häufigster Fehler** | Sprungmarke vorhanden, aber ohne Ziel oder für die Tastatur unsichtbar. |

## 10 · Sprache

| | |
|---|---|
| **WCAG** | 3.1.1 Sprache der Seite (A), 3.1.2 Sprache von Teilen (AA) |
| **Prüfmethode** | `<html lang>` auf **jeder** Seite jeder Sprachfassung im **Server-HTML** ansehen, nicht erst nach dem Laden der Skripte. Fremdsprachige Passagen im Fließtext suchen. |
| **Bestanden** | `lang` steht korrekt und passt zum Inhalt; jede Sprachfassung setzt ihren eigenen Wert. Anderssprachige Abschnitte tragen ein eigenes `lang`. |
| **Häufigster Fehler** | `lang="de"` über türkischem Text. Der Screenreader liest ihn dann mit deutscher Aussprache — unverständlich. Sichtbare Nebenwirkung: `text-transform: uppercase` macht aus dem türkischen `i` ein `I` statt `İ`. |

## 11 · Überschriften und Benennungen

| | |
|---|---|
| **WCAG** | 1.3.1 Info und Beziehungen (A), 2.4.6 Überschriften und Beschriftungen (AA), 2.4.4 Linkzweck (A) |
| **Prüfmethode** | Überschriftenliste im Screenreader oder in den Entwicklerwerkzeugen aufrufen. Danach die Linkliste: Ergibt jeder Linktext **für sich allein** Sinn? |
| **Bestanden** | Genau eine `<h1>` je Seite, keine übersprungene Ebene (h2 → h4), keine Überschrift, die nur zur Vergrößerung dient. Kein „hier klicken", kein „mehr" ohne Kontext; gleichlautende Links führen zum selben Ziel. Tabellen haben Kopfzellen. |
| **Häufigster Fehler** | Vier Karten mit je einem „Mehr erfahren" — in der Linkliste vier identische Einträge ohne Unterschied. |

## 12 · Bewegung, Zoom, Umbruch

| | |
|---|---|
| **WCAG** | 2.3.3 Animation aus Interaktionen (AAA, hier als Muss), 1.4.4 Textgröße ändern (AA), 1.4.10 Reflow (AA), 1.4.12 Textabstand (AA) |
| **Prüfmethode** | Systemeinstellung „Bewegung reduzieren" aktivieren und die Seite **vollständig durchsehen**. Danach auf 200 % zoomen und das Fenster auf 320 px Breite ziehen. |
| **Bestanden** | Mit reduzierter Bewegung ist **alles sichtbar und bedienbar** — keine Einblende-Animation, die nie ausgelöst wird und den Inhalt unsichtbar zurücklässt. Bei 200 % Zoom und 320 px Breite kein Informationsverlust und **kein waagerechtes Scrollen**. Nichts blinkt öfter als dreimal je Sekunde. |
| **Häufigster Fehler** | Genau der oben beschriebene: Abschnitte, die per Scroll-Animation eingeblendet werden, bleiben bei reduzierter Bewegung auf `opacity: 0` stehen. Die Seite ist dann für die Menschen leer, für die die Einstellung gemacht ist. |

---

## Ergebnis festhalten

Ein Befund nach diesem Raster enthält:

1. **Prüfumfang** — welche Seiten, welche Sprachen, welches Datum, welche Werkzeuge.
2. **Je Fund**: Punkt-Nummer · WCAG-Kriterium · Route · Element (Selektor oder
   eindeutige Beschreibung) · beobachtetes Verhalten · Sollzustand · Schwere.
3. **Schwere** in drei Stufen:
   - **blockierend** — eine Funktion ist für eine Nutzergruppe nicht erreichbar
     (Formular nicht absendbar, Inhalt unsichtbar, Tastaturfalle).
   - **erheblich** — Nutzung ist möglich, aber deutlich erschwert (fehlender
     Name, zu geringer Kontrast im Fließtext).
   - **gering** — Verstoß ohne praktische Hürde (dekoratives Icon nicht
     stummgeschaltet).
4. **Was nicht geprüft wurde** und warum. Eine Lücke, die im Bericht steht, ist
   eine Lücke; eine, die fehlt, ist eine Falschaussage.

Bestanden ist ein Punkt nur, wenn **kein** Fund der Schwere „blockierend" oder
„erheblich" offen ist. „Gering" wird notiert, nicht verschwiegen.
