# Informationsarchitektur · Gate 01

Welche Route welche Frage beantwortet, welche im Hauptmenü steht und warum.
Quelle im Code: `lib/navigation.ts`. Gesichert durch
`scripts/check-einstiege.mjs`.

Gemessen am 10.09.2026.

---

## 1 · Das Hauptmenü

**Vorher fünf Rubriken, jetzt drei.**

| Rubrik | Im Hauptmenü | Grund |
|---|:-:|---|
| Leistungen | ✓ | Beantwortet „Was kann ich kaufen?" |
| Produkte | ✓ | Kanonischer Ort der eigenen Produkte, einziger Beleg |
| Arbeiten | — | **WEB-0005** — zeigte dieselbe Sammlung wie Produkte |
| Unternehmen | ✓ | Beantwortet „Wem vertraue ich?" |
| Insights | — | **WEB-0018** — ein Beitrag trägt keinen Hauptmenüpunkt |

Beide zurückgestuften Rubriken bleiben **vollständig erreichbar**: Die Fußzeile
liest weiterhin `navLinks` und zeigt alle fünf. Sie bleiben in der Sitemap,
bleiben indexiert, bleiben verlinkt. Zurückgestuft heißt nicht gelöscht — das
prüft Regel 9 des Gates.

**Wo die Regel wohnt:** `lib/navigation.ts`, nicht `lib/site-data.ts`. Die
Stammdaten der Rubriken sind G18-gesperrt; die Auswahl, welche davon heute
beworben wird, ist eine Gate-01-Entscheidung. Die Datei liest `navLinks` nur.

---

## 2 · Produkte und Arbeiten — die Trennung

**WEB-0005:** *Beide Seiten zeigen dieselbe Sammlung.* Beleg aus Gate 00:
identische vier Ziel-Links auf beiden Seiten; `/arbeiten` hatte kein einziges
eigenes Ziel.

Ursache: `/arbeiten` rief `<Portfolio />` auf, und `Portfolio` liest
`productWorks` — dieselben vier eigenen Produkte, die `/produkte` zeigt.
`genannteClientWorks` ist leer, weil ohne schriftliche Freigabe kein Kunde
genannt wird.

**Die Trennung ab Gate 01:**

| Route | Gehört ihr | Heute |
|---|---|---|
| `/produkte` | Eigene Produkte, vollständig, mit Stand und Wirkung | Vier Produkte |
| `/arbeiten` | Kundenarbeit mit schriftlicher Freigabe | Leer, und sie sagt das |

`/arbeiten` zeigt keine eigenen Produkte mehr. Die H1 lautet „Für andere
gebaut." — der Satz nennt genau den Unterschied. Der Vorspann erklärt die
Lücke und verweist im ersten Blickfeld auf `/produkte`.

**Die Alternative, die verworfen wurde:** die eigenen Produkte stehen lassen
und die Überschrift „Arbeiten" behalten. Das ist WEB-0001, der erste Befund
des externen Audits: „Arbeiten" lässt Kundenarbeit erwarten und liefert
Eigenbau. Eine dünne wahre Seite ist besser als eine volle, die etwas anderes
verspricht, als sie hält.

**Was das kostet:** `/arbeiten` misst jetzt 1.940 px Desktop / 3.145 px mobil
bei 79 Wörtern (vorher 191 Wörter). Das ist bewusst — und es ist der Grund,
warum die Rubrik aus dem Hauptmenü ist. Sie kommt zurück mit der ersten
Freigabe: **OD-2**.

---

## 3 · Insights

**WEB-0018:** *Ein Artikel trägt einen Hauptnavigationspunkt.* Beleg: 1
veröffentlichter Beitrag, 6 definierte Fächer, Seite 2.413 px.

Zwei Änderungen:

1. **Schwelle statt Schalter.** `mainNavLinks` zeigte `/insights`, sobald
   *ein* Beitrag existierte. `lib/navigation.ts` setzt die Schwelle auf
   `INSIGHTS_NAV_SCHWELLE = 3` — die Zahl, ab der die Rubrik ihre eigene
   Anreißerfläche auf der Startseite füllt (`MAX_TEASERS`).
2. **Die Teaser-Kachel führt in den Beitrag.** Sie zeigte Thema, Titel,
   Anriss und Datum eines bestimmten Beitrags — und verlinkte auf die
   Übersicht. Wer auf einen Titel klickt und auf einer Liste landet, muss
   denselben Titel ein zweites Mal suchen. Jetzt: `/insights/${slug}`.

Das Gate prüft beide Richtungen: `/insights` darf nicht im Menü stehen,
solange die Schwelle nicht erreicht ist — und es **muss** zurück ins Menü,
sobald sie erreicht ist.

---

## 4 · Die Startseite als Verteiler

Reihenfolge nach Gate 01. Archetypen wie in `app/_routes/home.tsx`:
**A** editorial · **B** Raster · **C** Band.

| # | Sektion | Typ | Frage | Ziel |
|---|---|:-:|---|---|
| 1 | Hero | C | Was ist das, was ist danach anders? | `/termin`, `/produkte` |
| 2 | Problem und Haus | A | Warum geht mich das an? | `/unternehmen` |
| 3 | Eigene Produkte (Bildband) | C | Können die das? | `/produkte` |
| 4 | Die fünf Ebenen | B | Wie ist das geordnet? | `/leistungen` |
| 5 | Einstieg: drei Arten | A | Was kostet das? | `/leistungen#pakete` |
| 6 | Fundament-Band | C | Läuft das schon? | — |
| 7 | *(entfernt: „Vier eigene Produkte")* | — | — | — |
| 8 | Kundenfall | — | gated, rendert heute nichts | — |
| 9 | Das Unternehmen | A | Wer steht dahinter? | `/unternehmen` |
| 12 | Notizen aus dem Bau | B | Denken die gründlich? | `/insights/…` |
| 13 | Abschluss | C | Was jetzt? | `/termin` |

Gelesen: **C A C B A C — A B — C.** Keine zwei gleichen Archetypen
nebeneinander; der Takt aus VIS-2 bleibt erhalten.

**Sektion 7 ist gegangen**, weil sie dieselbe Quelle las wie Sektion 3.
Geblieben ist der Bildband — er trägt Bilder, also den Beweis, und er trägt
den Takt. Die vollständige Liste mit Stand, Region und Wirkung steht auf
`/produkte`, einen Klick entfernt und dort ohne Dublette.

**Messung:** Startseite mobil **13.449 px → 12.245 px** (−1.204 px), Wörter
642 → 663.

---

## 5 · Was Gate 01 ausdrücklich nicht angefasst hat

- Keine Route neu angelegt, umbenannt oder gelöscht. Die Sitemap zählt
  unverändert 108 öffentliche Einträge.
- Keine Pfadübersetzung geändert (`/barrierefreiheit` → `/erisilebilirlik`
  bleibt die einzige).
- Keine Indexierungsregel geändert. Ob `/arbeiten` in seinem heutigen Zustand
  indexiert bleiben soll, gehört zu G07.
- Keine der sechs G18-Dateien berührt.
