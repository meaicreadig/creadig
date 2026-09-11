# Phase 0 Rest — Live-Reaudit, reproduziert und eingeordnet

**Stand:** 11.09.2026 · **Quelle der Wahrheit:** `https://creadig.de` (der aktuell
promotete Live-Stand) · **HEAD:** `ce43ec7` auf `feat/system-haus-site`

Keine Live-gegen-Preview-Abgleichung. Der Live-Stand IST das Produkt; er wurde
abgerufen, in Text verwandelt und gegen das Repository gelesen. Wo Live und Code
sich decken, steht das dabei, aber es war nicht die Aufgabe.

**Frischeprüfung, einmal und kurz:** `/arbeiten` liefert live den nach Gate 01
geleerten Zustand aus („Heute liegt keine solche Freigabe vor, deshalb steht hier
niemand"). Der Live-Stand trägt also die Arbeit bis `ce43ec7`. Damit sind
Abweichungen zwischen Befund und Code echte Befunde und keine Deploy-Lücke.

## Klassen

| Klasse | Bedeutung |
|---|---|
| `FIXABLE_CODE` | im Code lösbar, ohne Owner, ohne Jurist, ohne G18-Bruch |
| `OWNER_FACT` | hängt an einer Tatsache, die nur der Inhaber kennt oder herstellen kann |
| `LEGAL_FACT` | hängt an einer juristischen Bewertung — nicht zu raten |
| `G18_BLOCKED` | der Fix liegt in einer gesperrten Datei |
| `EXTERNAL_SEARCH_CACHE` | außerhalb der Seite, in einem fremden Index |
| `PRODUCTION_ONLY` | nur im Produktionsbetrieb sichtbar |
| `NOT_REPRODUCED` | am Live-Stand nicht auffindbar, oder der Befund trifft nicht zu |

## Matrix

| # | Befund | Reproduziert? | Ursache im Code | Klasse |
|---|---|---|---|---|
| **A** | `/datenschutz` zeigt „Bestätigung durch den Inhaber offen" | **Ja, und schärfer als gemeldet** | Die Seite **behauptet und dementiert gleichzeitig**: `lib/dictionary.ts` sagt im Fließtext „Mit Vercel besteht ein Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO", die Tabelle darunter (`components/legal/legal-page.tsx` + `processors` in `lib/site-data.ts`, `dpaConfirmed: false`) sagt das Gegenteil | Marker-Widerspruch: `FIXABLE_CODE` · echte AVV-Lage: `OWNER_FACT` / `LEGAL_FACT` |
| **B** | 149 €/Monat liest sich als allgemeiner Betrieb | Ja | `einstiege`-Kachel „Monatlich 149 € — Der laufende Betrieb … Gilt für: Operations"; der Leistungsumfang in `retainer.includes` ist dagegen website-spezifisch | `FIXABLE_CODE` |
| **C** | `/produkte` unterstellt Betrieb aller vier | Ja | H1 „Vier Produkte, die wir selbst betreiben." über vier Karten, von denen drei „Im Aufbau" tragen | `FIXABLE_CODE` |
| **D** | `/arbeiten` zeigt 0 Fälle, JSON-LD listet Produkte | Ja | `app/_routes/arbeiten.tsx` gab die `ItemList` unbedingt aus; die Metadaten daneben hielten sich längst an die Freigabelage | `FIXABLE_CODE` |
| **E** | Alte Kundennamen (NV SWISS, maqam, Bir Damla Hayır) | **Nein** — in keiner ausgelieferten Seite, in keiner Quelldatei; nur in alten Arbeitsdokumenten (`creadig-MASTER-PROMPT-*.md`) | — | `NOT_REPRODUCED` (Seite) · `EXTERNAL_SEARCH_CACHE` (Index; Entfernungsantrag ist untersagt) |
| **F** | 20/45-Minuten-Logik widersprüchlich | **Nein** — 20 Min. = Erstberatung, 45 Min. = Systemgespräch, durchgängig in allen vier Sprachen und im Assistenten | — | `NOT_REPRODUCED` |
| **G** | Termin zeigt „MEZ" im September | Ja | `lib/dictionary.ts` `termin.step2.timeLead` | `FIXABLE_CODE` |
| **H** | Hero kurz leer | **Ja, und schärfer als gemeldet** | `components/sections/hero.tsx` liefert `opacity:0` an vier Blöcken **und** `translateY(112%)` an jeder H1-Zeile ins Server-HTML aus — ohne JavaScript hat die Startseite keine sichtbare Überschrift | `FIXABLE_CODE` |
| **I** | Website-Paket verspricht Anfragen als Ergebnis | Ja | `packages.items.website.outcome`: „In vier Wochen online — mit Anfragen und Bewerbungen" | `FIXABLE_CODE` |
| **J** | Barrierefreiheits-Anspruch vs. Sprachstand | **Ja, doppelt** | Die Seite nennt „68 Durchläufe (17 Seiten)" und „in beiden Sprachfassungen"; der Lauf deckt 124 Durchläufe über 31 Routen ab — und die Seite hat vier Sprachfassungen, von denen Englisch und Arabisch **nicht** im Lauf stehen | `FIXABLE_CODE` |
| **K** | 0 freigegebene Kundenfälle | Ja | Tatsache, nicht Fehler. `/arbeiten` benennt sie ausdrücklich. Nebenbefund: die Meta-Beschreibung warb mit „echte Kunden" | Nebenbefund `FIXABLE_CODE` · Sache selbst `OWNER_FACT` |
| **L** | ROI nur qualitativ | **Nein** — die Seite verspricht ausdrücklich keine Zahlen („Keine Verfügbarkeit in Prozent, keine Reaktionszeit in Stunden") | — | `NOT_REPRODUCED` · Messung selbst `OWNER_FACT` |
| **M** | CASSAMEA/meahv ohne sichere Ansichten | Ja, und bewusst so | `lib/produkt-beleg.ts` hält beide Aufnahmen zurück (`demodaten-nicht-belegt`); Gate 02 hat das entschieden | `OWNER_FACT` |
| **N** | Vertretung/Kapazität unbelegt | **Nein** als Überanspruch — `/unternehmen` benennt die Lücke wörtlich („eine Kapazitätsgrenze und eine Vertretungsregel … keine davon ist heute belegt") | — | `NOT_REPRODUCED` · Regel selbst `OWNER_FACT` |
| **O** | `/datenschutz` ohne Überschriftenstruktur | **Ja** — die ganze Seite trägt genau **eine** Überschrift (`h1 Datenschutz`); alle Abschnittstitel sind `<p class="eyebrow">` | `components/legal/legal-page.tsx` | **`G18_BLOCKED`** |
| **P** | Produkt-Interesse-Einwilligung lang | Ja, 68 Wörter | `contact.privacyConsentSuffix`. Der Text ist lang, weil er Verarbeiter, Drittlandübermittlung, Rechtsgrundlage und Widerruf benennt — kürzen hieße die Einwilligung schwächen | `LEGAL_FACT` (der enthaltene SVK-Überanspruch wurde als Teil von **A** behoben) |

## Was Phase 0 zusätzlich gefunden hat

Zwei Dinge, die im Reaudit nicht standen, aber derselben Klasse angehören:

1. **Der Cookie-Banner behauptete denselben Vertrag.** `consent.thirdCountry` sagte
   „zusätzlich zu den EU-Standardvertragsklauseln, **die wir mit Vercel geschlossen
   haben**" — dieselbe Behauptung wie auf `/datenschutz`, nur an der Stelle, an der
   jemand gerade auf „Alle akzeptieren" drückt.
2. **„Deutsch und Türkisch haben eigene URLs"** auf `/systeme` — geschrieben, als die
   Seite zweisprachig war. Sie hat heute vier Sprachfassungen.

## Was nicht geprüft wurde, und warum

Kein Produktions-Deploy, kein Promote, keine Datenbank, keine Migration, kein
Entfernungs- oder Neuindexierungsantrag bei der Search Console, kein echter
Formularversand, kein Kundenkontakt. Befund **E** bleibt deshalb im Suchindex
stehen, bis er dort von selbst altert.
