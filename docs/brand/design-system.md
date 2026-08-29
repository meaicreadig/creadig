# creaDIG · Design-System

> **Was das ist.** Der Auszug dessen, was in `app/globals.css` und
> `components/` tatsächlich steht — nicht, was es einmal werden soll. Jede
> Zeile hier ist im Code belegt.
>
> **Regel des Hauses:** eine Quelle je Rolle. Wer eine Farbe, eine Kurve, eine
> Kante oder einen Radius zum zweiten Mal von Hand schreibt, hat einen Fehler
> gemacht — nicht eine Variante gebaut.
>
> Stand: MP-A, 29.08.2026 · Quelle: `app/globals.css`

---

## 1 · Foundations

### Farbe

Warmes Papierweiß statt Weiß, warmes Anthrazit statt Schwarz. Gold ist die
Primärfarbe, nicht Schwarz.

| Token | Hell | Dunkel | Rolle |
|---|---|---|---|
| `--background` | `#fbfbf9` | `#201e1b` | Der Grund |
| `--foreground` | `#2a2723` | `#fbfbf9` | Text |
| `--surface` | `#f5f5f4` | `#2a2723` | Abgesetzte Fläche |
| `--surface-raised` | `#ffffff` | `#322e29` | System-Output (SIG-03) |
| `--line` | `#e6e4df` | `#35312c` | Struktur-Haarlinie |
| `--line-strong` | `#cbc7c0` | `#4a453e` | Stärkere Trennung, Formularkanten |
| `--gold` | `#be904e` | `#d3a763` | Flächen, Punkte, Dekor |
| `--gold-text` | `#87632f` | `#d3a763` | **Text und Umrisse** |

**Die wichtigste Regel dieser Tabelle:** `--gold` erreicht auf dem
Papierweiß nur 2,6 : 1. Für Text (WCAG 1.4.3, 4,5 : 1) und für den Umriss
eines Bedienelements (WCAG 1.4.11, 3 : 1) reicht das nicht. Dafür gibt es
`--gold-text` — geprüft auf allen fünf hellen Flächen der Seite, überall
mindestens 4,74 : 1.

Wer Gold auf Text oder eine Kante legt, nimmt `--gold-text`. Immer.

### Kanten-Grammatik — vier Rollen, sonst nichts

| Klasse | Bedeutung |
|---|---|
| `border-line` | Struktur. Die Haarlinie, aus der die Seite besteht. |
| `border-line-strong` | Stärkere Trennung, Formularkanten, Umrisse. |
| `border-gold` | **Aktiver Zustand** — Auswahl, „hier bist du". |
| `border-gold/45` | Akzent-Schiene an einem hervorgehobenen Block. |

### Radius (Owner-Entscheidung 27.08.2026: rund)

| Token | Wert | Rolle |
|---|---|---|
| `--radius-sm` | 8 px | Bedienelement — Knopf, Feld, Chip, Umschalter |
| `--radius-md` | 12 px | Kachel — Karte, Paket, Produktfläche |
| `--radius-lg` | 20 px | Große Fläche — Panel, Banner, Bildrahmen |

Vorher standen hier 2 / 4 / 6 px. Das war keine Rundung, sondern eine
entschärfte Ecke. **Ein Radius ist nur sichtbar, wenn um die Form herum Luft
steht** — deshalb gehört er untrennbar zur Raster-Regel unten.

**Ausnahmen, mit Grund:** Formularfelder bleiben Unterstrich-Felder
(`border-0 border-b`) — dort gibt es keine Ecke. Segmentierte Umschalter und
das Kalenderraster bleiben fugenlos — dort ist die geschlossene Reihe die
richtige Form.

### Raster und Luft

- **Zwischen Kacheln: `gap-2.5` (10 px).** Nicht `gap-px`.
- Bis Phase 2 baute die Seite ihre Karten aus einem Trick: `bg-line` am
  Raster, `gap-px` als Fuge — die Linie *war* die Naht. Folge: Die Kacheln
  berührten sich (vier Karten lasen sich als ein Block mit drei Strichen),
  und ein Radius war darin unmöglich.
- Jetzt trägt jede Kachel ihre eigene Kante: `@utility tile`.

### Motion — eine Kurve, drei Geschwindigkeiten

| Token | Wert | Wofür |
|---|---|---|
| `--ease-brand` | `cubic-bezier(0.22, 1, 0.36, 1)` | **Die** Kurve. Es gibt keine zweite. |
| `--dur-1` | 300 ms | Zustand direkt am Zeiger — Farbe, Kante, Deckkraft |
| `--dur-2` | 500 ms | Der Normalfall |
| `--dur-3` | 700 ms | Alles, was einen Weg zurücklegt |
| `--stagger` | 60 ms | Abstand zwischen Geschwistern derselben Reihe |

Im Markup: `ease-brand` und `duration-[var(--dur-2)]`. Nie eine handgeschriebene
`cubic-bezier(...)` — die stand einmal 40× als Zeichenkette im Code.

**Motion-Regel (gesperrt): Maximal eine Bewegung pro Sektion, und sie muss
etwas erklären.** Bewegung, die nur schön ist, wird gelöscht.

### Elevation — drei Stufen, warmer Schatten

`--elevation-1/2/3`. Zweilagig: eine enge Kontaktkante, damit die Karte den
Grund berührt, und ein weiter Wurf, der die Höhe trägt. Der Schatten nimmt
den Textton auf (`#2a2723`) — reines Schwarz auf warmem Papierweiß sieht
schmutzig aus.

### Typografie

| Token | Schrift | Rolle |
|---|---|---|
| `--font-sans` | M PLUS Rounded 1c | Fließtext |
| `--font-display` | Poppins | Überschriften |
| `--font-mono` | JetBrains Mono | Eyebrow, Kapitelzahl, Meta |

Skala als Utilities, nicht als Tailwind-Größen im Markup:
`type-display` · `type-h1` · `type-h2` · `type-h3` · `type-h4` ·
`type-statement` · `type-lead` · `type-body` · `type-small` · `type-stat`
(mit `tabular-nums` — Zahlen wackeln nicht) · `eyebrow` · `text-meta`

→ Fonts geladen in `components/site-shell.tsx`

---

## 2 · Signaturen

| ID | Name | Regel | Status |
|---|---|---|---|
| **SIG-01** | Die tragende Fuge | Sektionsnaht = Schiene mit Goldanfang + Kapitelzahl. Der Zähler zählt CSS (`counter: seam`), nicht das Markup — gegatete Sektionen werden übersprungen und die Nummer stimmt trotzdem. | ✅ live |
| **SIG-02** | Das Zeichen | Zweimal gebaut (Knoten-Netz, Schienen-Treppe), zweimal vom Owner abgelehnt. **Aktuell aus.** Der Hero-Grund trägt nur noch Wärme und Verläufe. | ⏸ aus |
| **SIG-03** | Zwei Ebenen | Basis = Behauptung. `surface-raised` = was das **System** erzeugt hat (Messung, Status, Produktoberfläche). Nie dekorativ. | ⏳ wartet auf System-Output |

**Zu SIG-02, damit der dritte Anlauf nicht derselbe wird:** Ein Zeichen, dessen
Bedeutung nur im Quelltext-Kommentar steht und nirgends auf der Seite, ist
kein Zeichen für Besucher. Beide abgelehnten Fassungen waren datengetrieben
und logisch korrekt — und trotzdem falsch, weil die Auflösung fehlte.

---

## 3 · Components-Inventar

### Bedienelemente

| Utility / Komponente | Rolle |
|---|---|
| `@utility cta-outline` | **Hauptknopf.** Keine Füllung, die Kante trägt die Farbe. Eine Quelle, 12 Aufrufe. |
| `@utility cta-quiet` | **Nebenknopf.** Neutrale Kante in Ruhe, Gold beim Hover. Sammelte 19 handgeschriebene Kopien ein. |
| `components/ui/button.tsx` | shadcn-Basis. Wird auf der Marketing-Seite kaum gebraucht — die beiden Utilities darüber sind der Normalfall. |
| `components/ui/input.tsx` · `textarea.tsx` | Formularfelder shadcn-Seite. |
| Eigenbau-Felder | Unterstrich-Felder in `termin-wizard.tsx`, `quick-check.tsx`, `product-interest.tsx` — bewusst kein Kasten. |

### Struktur

| Utility | Rolle |
|---|---|
| `section-gutter` | Der linke Rand der Seite: 1,5 / 2,5 / 4 rem. Alles fluchtet darauf. |
| `section-shell` · `-band` · `-tight` | Sektions-Innenmaße. |
| `section-seam` | SIG-01. Ersetzt `border-line border-b` an Sektionsenden (55 Stellen). |
| `tile` | Die Kachel: Kante + `--radius-md` + Beschnitt für die Gold-Schiene. |
| `surface-raised` | Die zweite Ebene (SIG-03). |
| `elevation-1/2/3` | Höhe. |

### Bausteine

| Komponente | Rolle |
|---|---|
| `ui/disclosure.tsx` | **Aufklappblock.** Natives `<details>` — Tastatur, Screenreader und Strg+F funktionieren ohne JavaScript. Zwei Größen. Eine Quelle für FAQ, Einstiegs-Zeile und Leistungs-Tiefe. |
| `ui/reveal.tsx` | Einblenden beim Scrollen. Respektiert `prefers-reduced-motion` (rendert dann den Endzustand sofort). |
| `ui/section-eyebrow.tsx` | Die Zeile über jeder Überschrift. |
| `ui/status-dot.tsx` | Gefüllt = läuft, offen = im Aufbau. |
| `ui/page-header.tsx` | Kopfzone der Unterseiten. |
| `ui/locale-link.tsx` | Link, der die Sprache mitnimmt. |
| `ui/image-unveil.tsx` | Bild-Einblendung. |
| `ui/magnetic-button.tsx` | Der Hero-Hauptknopf. |

---

## 4 · Informations-Hierarchie (drei Stufen)

Nicht jeder Text darf dieselbe Lautstärke haben. Accordion ist kein
Müllcontainer — nur Stufe 3.

| Stufe | Zweck | Zeit | Was hingehört | Was nicht |
|---|---|---|---|---|
| **1 · Scan** | Orientierung | 5–10 s | Überschrift, Ergebnis, Zahl, für-wen, CTA | lange Absätze, Listen |
| **2 · Understand** | Verstehen | 30–90 s | ein kurzer Body, ein Satz pro Idee | technische Tiefe, vier Unterblöcke |
| **3 · Deep Dive** | Vertiefen | bewusst | Disclosure, Tabs, Specs, Prozessdetails | der einzige Inhalt der Sektion |

**Regel:** Fehlt Stufe 1, hilft Stufe 3 nicht. Text von 1 nach 3 verschieben
ist erlaubt; Text nur um „%30 weniger“ in Disclosure zu stopfen — nicht.

Beispiel Leistungen: Nummer + Name + Satz + für-wen = Scan. Lead-Satz =
Understand. Ausgangslage / Was wir bauen / … = Deep Dive (`Disclosure`).

---

## 5 · Patterns

| Pattern | Wo | Regel |
|---|---|---|
| **Hero** | `sections/hero.tsx` + `hero/system-field.tsx` | Headline (Haltung) → Subline (Sache) → `systemLine` (Ordnung) → Chips (die fünf Ebenen). Der Grund ist still: Wärme + zwei Verläufe, kein Client-JS. |
| **Ebene / Leistung** | `sections/services.tsx` | Kopf immer sichtbar (Nummer, Name, Satz, für wen). Tiefe (Ausgangslage / Was wir bauen / Was danach anders ist / Typische Projekte) hinter `Disclosure`. |
| **Kachelraster** | `capability-tiles`, `house-products`, `kontakt` | `grid gap-2.5` + `tile` je Zelle. Nie `bg-line` + `gap-px`. |
| **Preis / Paket** | `sections/packages.tsx` | Preis als `type-stat`. Das empfohlene Paket ist die einzige Karte, die den Grund verlässt (`surface-raised` + `elevation-2`). |
| **Buchung** | `termin/termin-wizard.tsx` | Vier Schritte. Auswahl-Zustand braucht drei Signale (Tönung, Gold-Kante, Häkchen) — Farbe allein reicht nicht. |
| **Case** | `sections/case-study-body.tsx` | Rendert nur bei `approved: true`. Kein Material → die Sektion rendert gar nicht. |
| **Empty State** | überall | Fehlt etwas, steht das da. Es wird nicht überdeckt. |

---

## 6 · Image Bible

**Erlaubt**
- Echte Produkt-Oberflächen (meAI, fibero, CASSAMEA, meahv) — sobald der
  Owner sie liefert
- Echte Fotos aus dem eigenen Umfeld (ICO Osnabrück, eigene Räume)
- Echte Kundenlogos, mit Freigabe
- Diagramme, die aus echten Daten kommen

**Verboten**
- Stock-Laptops auf Holztischen mit Kaffeetasse
- Erfundene Dashboards, Fantasie-UI, „so könnte es aussehen"
- Fremde Logos ohne Freigabe
- Team-Fotos ohne den Hinweis, dass sie KI-generiert sind
- Bilder, die eine Größe suggerieren, die es nicht gibt

**Wenn das Bild fehlt:** ehrlicher Platzhalter mit Namen („folgt"), nicht
Tapete. Das ist keine Notlösung — es ist der Unterschied zwischen einer
Seite, der man glaubt, und einer, die man prüft.

→ Slots: `lib/product-media.generated.ts` · `lib/client-logos.generated.ts`
(heute weitgehend leer, siehe MP-C)

---

## 7 · Gates

Was jede Änderung passieren muss:

```
npx tsc --noEmit
npx eslint .
npm run build      → Function-Gate · Sterne-Gate · Paritäts-Gate DE/TR
npm run a11y       → 112 Durchläufe, 0 Verletzungen (WCAG 2.1 AA, maschinell)
```

`npm run shots` erzeugt 100 Aufnahmen in `screenshots/` — hell/dunkel,
Desktop/Mobil, DE/TR. Design wird daran beurteilt, nicht aus dem Gedächtnis.

**Bekannt:** `a11y` und `shots` verlieren gelegentlich ihren `next start`
mitten im Lauf (Exit 0, kein Log). Reproduziert auch ohne aktuelle Änderungen
— Backlog, nicht Regression.
