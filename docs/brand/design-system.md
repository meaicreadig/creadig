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

**Gemessen, nicht behauptet (G14).** `auftritt-drill` liest den gerenderten
`border-radius` jedes Bedienelements auf sieben Breiten und beiden Gründen.
Erlaubt sind 0 / 8 / 12 / 20 px und die volle Pille — sonst nichts. Dabei
fiel auf, was drei Runden lang niemand gesehen hatte: `MagneticButton` in
der Variante `ghost` — der Knopf **neben** dem Hauptknopf, an 13 Stellen —
trug überhaupt keine Rundungsangabe und stand mit scharfen Ecken neben einem
runden. Die Rezeptur `cta-quiet` gab es längst; diese eine Stelle stand
außerhalb, weil sie nicht im Markup lag, sondern in einer Komponente.

### Sichtrhythmus — die Taktskala

Die senkrechte Luft eines Abschnitts kommt aus
**2,5 / 3,5 / 5 / 6 / 7 / 8 / 9 / 10 rem** (`TAKT_SKALA_REM`). Das ist keine
Obergrenze für die Zahl der Werte: Drei Sektionsrollen ergeben in Paaren bis
zu sechs Summen, ohne dass etwas aus der Ordnung fällt. Ein Takt ist nicht
„wenige Werte", sondern: **jeder** Wert liegt auf dem Raster.

Gemessen am 09.09.2026 über alle sieben Breiten: 56 / 96 / 128 / 144 / 160 px
— fünf Rollen (Streifen, tight, shell, band, Seitenkopf), alle auf der Skala.

### Markenzeichen im Ökosystem

Eine Komponente, `components/brand/marken-zeichen.tsx`, und drei Regeln:

| Regel | Warum |
|---|---|
| Das Verhältnis der Quelldatei gilt (±2 %) | `h-10 max-w-[11rem]` an einem `<img>` ist keine Kappung, sondern eine **Quetschung**: `object-fit` steht ohne Angabe auf `fill`. CASSAMEA (8,38 : 1) verlor so 46 % seiner Breite. |
| Die Höhe kommt aus der **Fläche**, nicht aus der Zeile: `h = basis / √verhältnis` | Auf gleicher Höhe belegte meahv 960 px², CASSAMEA 4.608 px² — Faktor 4,8 auf derselben Wand. Nach der Umstellung: 1,04 : 1. |
| Die Dunkelbehandlung ist je Marke **deklariert** (`dunkel`) | `dark:brightness-0 dark:invert` galt für alle. Zwei Marken brauchten es, vier verloren dafür ihre Farbe — genau die Zeile „MAQAM-Q-Farbe originalgetreu". |

Dazu der vierte Befund, den erst das Messen zeigte: Die Farbe kam
ausschließlich beim **Hover** zurück. Auf einem Telefon gibt es kein Hover —
dort hatte noch nie jemand ein Logo dieses Hauses in seiner Farbe gesehen.
`pointer-coarse` beendet das.

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
npm run build           → Function · Sterne · Parität · Bestand · Freigabe · Auftritt · Redaktion · Herkunft · Angebot · Lieferung · Produkt · Verkauf · Rollen · Betrieb · Kundenerfolg
npm run a11y            → 112 Durchläufe, 0 Verletzungen (WCAG 2.1 AA, maschinell)
npm run mobile          → 6 Breiten: kein Überlauf, keine zu kleine Bedienfläche
npm run auftritt-drill  → 112 Messstellen: Radius · Kollision · Logotreue · Takt
npm run proof-drill     → 40 Prüfungen: ohne Freigabe erscheint nichts
npm run redaktion-drill → 47 Prüfungen: kein Satz ohne Herkunft
npm run verlust-drill   → 47 Prüfungen: die Erklärung ist der Schlüssel
npm run angebot-drill   → Regel + Weg durch die Datenbank (ANGEBOT_DRILL_URL)
npm run lieferung-drill → Frist, Änderung, Abnahme, Übergabe (ANGEBOT_DRILL_URL)
npm run produkt-drill   → Reifegrad mit Herkunft, Widerspruch, Rückmeldeweg
npm run verkauf-drill   → Verkaufsschwelle und die Muster-Schleife
npm run rollen-drill    → Rechte, Sitzungsfälschung, Übergabe (Sicherheits-Probelauf)
npm run betrieb-drill   → Werktagsfrist, Kontingent, die 149-€-Grenze
npm run kundenerfolg-drill → vier Achsen ohne Note, Ausbau, Empfehlungs-Moment
npm run db-drills       → crm · sales · research · contact · evidence, gegen frische Wegwerf-DBs
```

**Warum `auftritt-drill` und nicht noch ein Postbuild-Gate (G14):** Alle vier
Zeilen der Owner-Sichtschuld handeln von etwas, das im Quelltext nicht steht.
Ein Knopf hat keinen Radius, weil eine Klasse so heißt — er hat einen, weil
eine Kaskade am Ende eine Zahl ergibt. Zwei Elemente kollidieren nicht, weil
jemand es geschrieben hat, sondern weil ein Umbruch bei 320 px anders fällt.
Ein Gate, das das aus Klassennamen erschließt, prüft die **Absicht**. Der
Drill prüft das **Ergebnis**.

`npm run shots` erzeugt 100 Aufnahmen in `screenshots/` — hell/dunkel,
Desktop/Mobil, DE/TR. Design wird daran beurteilt, nicht aus dem Gedächtnis.

**Bekannt:** `a11y` und `shots` verlieren gelegentlich ihren `next start`
mitten im Lauf (Exit 0, kein Log). Reproduziert auch ohne aktuelle Änderungen
— Backlog, nicht Regression.
