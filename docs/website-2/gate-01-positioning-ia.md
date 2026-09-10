# Gate 01 · Positionierung, Angebotsarchitektur, Informationsarchitektur

**Status: PASS — PENDING COMMIT**
Ausgangspunkt HEAD `18bcf25071d1f6898f4f6f98fa48125517c3aeb4`, Branch
`feat/system-haus-site`. Gemessen und gebaut am 10.09.2026.

Gate 01 besitzt sechs Befunde: **WEB-0003, WEB-0004, WEB-0005, WEB-0011,
WEB-0018, WEB-0024.** Alle sechs sind umgesetzt und gemessen. WEB-0019
(besitzendes Gate G05) wurde beim Umbau des Insights-Teasers mit erledigt und
ist als solches vermerkt.

---

## 1 · Was Gate 01 entschieden hat

Sechs Entscheidungen, festgehalten als D-15 bis D-20 im Decision Log. Zwei
Gate-00-Entscheidungen sind damit aufgelöst: **D-04** (wie prominent das
Ebenenmodell außen erscheint) und **D-14** (Produkte und Arbeiten).

| # | Entscheidung | Löst |
|---|---|---|
| D-15 | Das Problem steht vor dem Modell | WEB-0003, WEB-0011 · löst D-04 auf |
| D-16 | `/produkte` kanonisch, `/arbeiten` für Kundenarbeit reserviert | WEB-0005 · löst D-14 auf |
| D-17 | Jede der fünf Ebenen trägt einen benannten Einstieg | WEB-0004 |
| D-18 | Kein Betrag entsteht außerhalb von `lib/site-data.ts` | WEB-0024 |
| D-19 | Die Startseite ankert nicht auf einem einzelnen Preis | WEB-0024 |
| D-20 | Ein Hauptmenüpunkt ist ein Versprechen auf Umfang | WEB-0005, WEB-0018 |

---

## 2 · Was tatsächlich im Produktcode geändert wurde

**Neu (2 Dateien, beide lesen nur):**

| Datei | Inhalt | Warum nicht in `site-data.ts` |
|---|---|---|
| `lib/navigation.ts` | Welche Rubriken heute im Hauptmenü stehen, mit Befund je Ausnahme | `site-data.ts` ist G18-gesperrt; die Auswahl ist eine G01-Entscheidung, keine Stammdatenfrage |
| `lib/einstiege.ts` | Fünf Ebenen × Einstieg: Art, Betrag, Route, Beleg | dito; liest `packages` und `retainer`, tippt keine Zahl |

**Geändert (7 Dateien):**

| Datei | Änderung | Befund |
|---|---|---|
| `lib/dictionary.ts` | Hero-Subline, Systemzeile, zweiter CTA; `home.statement`; `home.work`; `home.entry` vollständig; fünf neue `services`-Beschriftungen; `leistungenPage.lead`; `arbeitenPage` — **in allen vier Sprachen** | alle sechs |
| `app/_routes/home.tsx` | `HouseProducts` von der Startseite genommen; Takt-Dokumentation nachgezogen | WEB-0005 |
| `components/sections/hero.tsx` | Zweiter Knopf führt nach `/produkte` | WEB-0005 |
| `components/sections/selected-work.tsx` | Anker und Verweise nach `/produkte`; Hinweis „zwei von vier" | WEB-0005 |
| `components/sections/entry-line.tsx` | Vollständig neu: drei Einstiegsarten statt einer Preisüberschrift | WEB-0024 |
| `components/sections/services.tsx` | Sichtbare Einstiegszeile je Ebene | WEB-0004 |
| `components/sections/insights-teaser.tsx` | Kachel verlinkt den Beitrag | WEB-0018, WEB-0019 |
| `components/site-nav.tsx` | Liest `hauptNavLinks` statt `mainNavLinks` | WEB-0005, WEB-0018 |
| `components/pages/arbeiten-page-body.tsx` | Keine eigenen Produkte mehr; Verweis auf `/produkte` im Kopf | WEB-0005 |
| `scripts/check-einstiege.mjs` | **neu** — neun Regeln, im Postbuild | D-17, D-18, D-20 |
| `scripts/check-website2.mjs` | Zählt alle acht Wahrheitsstände; Prioritätsabschnitt endet an jeder Überschrift; sechs G01-Artefakte pflichtig | Selbstschutz |
| `package.json` | `check-einstiege.mjs` in die Postbuild-Kette | — |

**Nachgezogen in der Selbstprüfung (5 Dateien):** Fünf Stellen führten den
Leser weiterhin nach `/arbeiten` — auf eine Seite, die seit D-16 nichts mehr
zeigt. Das war kein Altbestand, sondern ein Schaden, den Gate 01 selbst
angerichtet hatte, und er wurde vor dem Abschluss behoben.

| Datei | Was dort stand | Was jetzt gilt |
|---|---|---|
| `components/sections/closing-cta.tsx` | Der zweite Weg unter **jedem** Abschluss führte nach `/arbeiten` | führt nach `/produkte`; Beschriftung in allen vier Sprachen mitgezogen |
| `components/service/service-page-body.tsx` | „Ganze Werkschau ansehen" → `/arbeiten`, obwohl die Liste darüber eigene Produkte zeigt | → `/produkte` |
| `components/pages/handwerk-page-body.tsx` | „Was wir gebaut haben" → `/arbeiten` | → `/produkte` |
| `components/pages/insights-page-body.tsx` | Leerzustand bot zwei Ziele, eines davon leer | nur noch `/produkte`; `emptyCtaWorks` bleibt für OD-2 im Wörterbuch |
| `components/pages/kontakt-page-body.tsx` | Vier Wege, der vierte auf eine leere Seite | drei Wege; `nav.hints.kontakt` und `kontaktPage.metaDescription` in vier Sprachen nachgezogen; Raster von vier auf drei Spalten |

**Gegenprobe:** 17 Routen gecrawlt — `href="/arbeiten"` kommt in **keinem**
`<main>` mehr vor. Die Route bleibt über die Fußzeile und die Sitemap
erreichbar, wie D-20 es verlangt.

Keine der sechs G18-Dateien wurde berührt: SHA-1 aller sechs ist
bit-identisch zum Stand bei Zugbeginn.

---

## 3 · Die Messung

Methode wie Gate 00: `document.scrollHeight` bei 1440 × 900 und 390 × 844,
Wörter aus `main.innerText`. **Gegenprobe:** `/insights` maß in Gate 00
2.413 px und misst heute 2.413 px — die Methode reproduziert die Baseline.

| Route | Desktop | mobil | Wörter | Δ mobil |
|---|---:|---:|---:|---:|
| `/` | 8.912 | **12.245** | 663 | **−1.204** |
| `/leistungen` | 10.290 | **16.228** | 1.204 | **+562** |
| `/produkte` | 3.193 | 5.181 | 198 | unverändert |
| `/arbeiten` | 1.940 | 3.145 | **79** | Wörter 191 → 79 |
| `/insights` | 2.413 | 3.931 | 138 | unverändert |
| `/betrieb` | 5.134 | 8.423 | 578 | unverändert |

**Hauptmenü:** 3 Rubriken (vorher 5). **Fußzeile:** unverändert 5.
**Startseite, sichtbare Beträge:** 2.400 € und 149 €, keiner in einer
Überschrift.

---

## 4 · Was schlechter geworden ist

Diese Tabelle steht bewusst im Bericht und nicht in einer Fußnote.

| Befund | Gate | Wirkung |
|---|---|---|
| WEB-0013 · `/leistungen` Länge | G03 | 15.666 → 16.228 px mobil (**+562**), 61 → 69 Eyebrows |
| WEB-0037 · Extremwert Eyebrows | G04 | `/leistungen` 61 → 69 |

**Die Abwägung, ausgesprochen:** WEB-0004 ist P1, WEB-0013 und WEB-0037 sind
P2. Eine Ebene ohne Einstieg verkauft nichts; eine zu lange Seite verkauft
schlechter. Gate 01 hat der höheren Priorität den Vorrang gegeben.

Ein erster Entwurf der Einstiegszeile mit drei Spalten je Ebene kostete
+997 px mobil. Als umbrechende Zeile sind es +562 px. Weiter zu kürzen hieße,
Information wegzunehmen — das ist Gate 03s Arbeit, mit gemessener Zahl
übergeben.

---

## 5 · Was Gate 01 nicht getan hat

- **Keine Route angelegt, umbenannt, entfernt oder umgeleitet.** Sitemap
  unverändert 108 Einträge.
- **Keinen Preis geändert.** Nur die Platzierung (D-19).
- **Keine Zahl erfunden.** Drei Ebenen zeigen „Angebot nach Analyse", weil
  es dort keinen bestätigten Betrag gibt (OD-6).
- **Keinen Beleg erfunden.** Identity und Automation zeigen keinen — das ist
  WEB-0001 und gehört Gate 02.
- **Keine G18-Datei berührt**, keinen der vier Black-Lock-Pfade angefasst.
- **Nicht deployt, nicht promotet**, keine Produktionsdaten geschrieben.
- **Gate 02 nicht begonnen.**

---

## 6 · Zwei Owner-Fragen, ohne die gearbeitet wurde

Gate 01 musste liefern, obwohl OD-1 und OD-5 unbeantwortet sind. Beide wurden
**nach der in `owner-decisions.md` stehenden Empfehlung** umgesetzt, beide
sind umkehrbar, beide bleiben offen. Neu hinzugekommen ist **OD-6**
(Einstiegspreise für Identity, Automation, Intelligence).

---

## 7 · Prüfung

| Prüfung | Ergebnis |
|---|---|
| `npm run build` | grün, 132 statische Seiten |
| Postbuild-Gates | **32 von 32 grün** (31 bestehende + `check-einstiege.mjs`) |
| `npx tsc --noEmit` | ohne Befund |
| `npm run a11y` | **124 Durchläufe** (31 Routen × 2 Fenster × 2 Erscheinungsbilder), keine maschinell feststellbare Verletzung von WCAG 2.1 AA |
| Vier Sprachbäume | `/`, `/leistungen`, `/arbeiten` in DE, TR, EN, AR — alle 200, `lang`/`dir` korrekt, Hauptmenü überall identisch |
| G18-Sperre | SHA-1 aller sechs Dateien unverändert |

`npm run a11y` deckt weiterhin **keine arabische Route** ab. Das war schon in
Gate 00 so und ist WEB-0042 (G07); Gate 01 hat daran nichts geändert und
nichts verdeckt.

---

## 8 · Was das nächste Gate wissen muss

1. `scripts/check-einstiege.mjs` muss grün bleiben. Wer eine sechste Ebene
   anlegt, legt ihren Einstieg mit an.
2. Wer `navAusnahmen` ändert, ändert `information-architecture.md` mit.
3. `/leistungen` ist +562 px länger. Das ist Gate 03s Auftrag, nicht seine
   Überraschung.
4. `/arbeiten` ist dünn und soll es bleiben, bis OD-2 beantwortet ist. Sie mit
   Ersatzinhalt zu füllen, würde WEB-0005 zurückholen.
5. Ob `/arbeiten` in diesem Zustand indexiert bleiben soll, ist offen und
   gehört G07.
