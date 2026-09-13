# Website-Experience · Hauptbuch W00–W15

> Stand 13.09.2026 · Branch `feat/system-haus-site`
> **Kein Lane ist CLOSED.** Eine gebaute Komponente ist kein Closure; Closure
> verlangt die beabsichtigte Käufer-Erfahrung auf der **echten** Seite.

| Lane | BUILD | CUTOVER | LIVE | CLOSURE | Stand |
|---|:--:|:--:|:--:|:--:|---|
| **W00** Experience-Baseline | 🟢 | — | 🟢 | 🟢 | 48 Aufnahmen, 1440×900 und 390×844, hell und dunkel, vor der Änderung |
| **W01** Creative-System | 🟡 | 🔴 | 🔴 | 🔴 | Richtung steht, **eine** Umsetzung. Ein Motiv wird erst durch Wiederkehr ein System |
| **W02** Hero-These | 🔴 | 🔴 | 🔴 | 🔴 | unberührt — erste Ansicht trägt weiterhin keinen Beweis |
| **W03** Systemvisualisierung | 🟡 | 🔴 | 🔴 | 🔴 | Betriebsfluss steht; die fünf Ebenen und „Das Haus" sind noch Liste bzw. Tabelle |
| **W04** Content-Architektur | 🔴 | 🔴 | 🔴 | 🔴 | nicht begonnen |
| **W05** Leistungen | 🔴 | 🔴 | 🔴 | 🔴 | nicht begonnen |
| **W06** Produkte | 🔴 | 🔴 | 🔴 | 🔴 | nicht begonnen |
| **W07** Beweis / Arbeiten | 🔴 | 🔴 | 🔴 | 🔴 | **wartet auf echte Freigabe** — kein Code-Problem |
| **W08** Gravitas | 🔴 | 🔴 | 🔴 | 🔴 | nicht begonnen |
| **W09** Käufer-Routen | 🔴 | 🔴 | 🔴 | 🔴 | nicht begonnen |
| **W10** Bewegung | 🟡 | 🔴 | 🔴 | 🔴 | Bewegungs-Grammatik definiert und einmal umgesetzt (das Signal) |
| **W11** Mobile | 🟡 | 🔴 | 🔴 | 🔴 | Prinzip steht (Spur senkrecht) und gilt für eine Sektion |
| **W12** Wahrheits-Ton | 🔴 | 🔴 | 🔴 | 🔴 | nicht begonnen — die Entprominenzierung steht aus |
| **W13** Editorialer Rhythmus | 🟡 | 🔴 | 🔴 | 🔴 | ein Taktbruch gesetzt (dunkel → Zeichnung → Bildband) |
| **W14** Käufer-Audit | 🔴 | 🔴 | 🔴 | 🔴 | erst nach mehr Substanz sinnvoll |
| **W15** Live Evolution | 🔴 | 🔴 | 🔴 | 🔴 | nichts in Produktion |

---

## Was in dieser Runde entstanden ist

**Creative Direction** (`creative-direction.md`) — visuelle These,
Signature-System, Diagramm- und Bewegungssprache, Artefakt- und Bildstil,
editorialer Rhythmus, Mobile-Prinzip. Auf einer Seite, nicht als Markenbibel.

**Das Systembild** (`components/sections/betriebsfluss.tsx`) — der erste
Signature-Moment. Zwei Spuren derselben Strecke: sechs Stationen mit fünf
echten Lücken, darunter dieselbe Strecke als eine durchgehende Linie.

Die Entscheidung dahinter: **kein neues Formvokabular.** Die Seite besitzt die
Haarlinie bereits, benutzt sie aber dekorativ. Hier bekommt sie eine
Bedeutung — sie ist der Weg, den die Arbeit durch den Betrieb nimmt. Deshalb
sieht das Bild nach creaDIG aus und nicht nach einem Template mit Diagramm.

Die sechs Stationen sind **keine neue Behauptung**: Sie stehen wortgleich in
`lib/branchen.ts`. Das Bild sagt nichts, was die Firma nicht sagt — es sagt es
in zwei Sekunden statt in einem Absatz.

## Zwei Fehler, die erst das Bild gezeigt hat

Beide wären im Quelltext unsichtbar geblieben:

1. **Die gebrochene Spur war nicht gebrochen.** Erst gezeichnet als
   durchgehende graue Linie mit kurzen Querstrichen an den Übergaben — im
   Bild las sich das wie die Skala eines Lineals. Der einzige Satz, den die
   Zeichnung sagen soll, war nicht zu sehen. Jetzt hört die Linie vor jeder
   Übergabe auf: Zwischen zwei Stationen steht Papier.
2. **Auf dem Telefon lag jede Beschriftung eine Station über ihrem Punkt.**
   Die Beschriftung klebte oben an der Zelle, der Knoten sass in deren Mitte.
   `self-center` stellt beide auf dieselbe Achse.

## Geprüft

| Prüfung | Ergebnis |
|---|---|
| `tsc` | sauber |
| ESLint | keine Warnung |
| Gate-Kette | **40 × OK**, Exit 0 |
| a11y (axe, WCAG 2.1 AA) | **132/132**, Exit 0 |
| Vier-Sprachen-Parität | erzwungen zur Übersetzungszeit (`SameShape`) — DE, TR, EN, AR ergänzt |
| RTL | geprüft auf `/ar`: Spur läuft rechts → links, Lücken und Goldlinie gespiegelt, **kein Sonderfall im Code** |
| Bewegung | `prefers-reduced-motion` doppelt gesperrt — im Hook und in `globals.css` |
| G18 | sechs Hashes unverändert, unstaged |

## Was diese Runde ausdrücklich nicht getan hat

Sie hat **keinen Kundenbeleg ersetzt.** `/arbeiten` ist unverändert leer, und
das Systembild trägt die Kennzeichnung „Modell, kein Kundenergebnis" **am
Bild**, nicht im Kleingedruckten. Ein unbeschriftetes Vorher/Nachher würde als
Messung gelesen — und eine gemessene Ersparnis gibt es nicht.

Sie hat die Marke **nicht ausgetauscht**: keine neue Palette, keine neue
Typografie, keine neue Navigation, kein 3D, keine KI-Bilder, kein Stock.

## Nächste eigenständige Arbeit

In dieser Reihenfolge, alle ohne Owner:

1. **Die Grammatik wiederholen** — die fünf Ebenen und „Das Haus" tragen
   heute Liste und Tabelle. Erst die Wiederkehr macht aus einem Motiv ein
   System (W01/W03).
2. **Hero-These** (W02) — die erste Ansicht trägt weiterhin keinen Beweis.
3. **Wahrheits-Ton entprominenzieren** (W12) — Wahrheit bleibt, Reihenfolge
   ändert sich: was wir tun, dann der Beleg, dann die Grenze.

**Owner-abhängig und hier nicht lösbar:** der öffentliche Kundenbeleg (W07).
Das Creative-System kann ihn nicht ersetzen und tut es nicht.
