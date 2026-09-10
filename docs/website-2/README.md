# creaDIG · Website 2.0 — Kontrollsystem

Dieser Ordner ist die **eine Wahrheit** über den Zustand der öffentlichen
Website und über alles, was daran noch geändert werden soll.

## Warum es ihn gibt

creaDIG hat ein wiederkehrendes Muster: Die Architektur wird stärker, viele
Einzelverbesserungen werden richtig — und das Gesamterlebnis wird trotzdem
schwerer verständlich. Zuletzt bei der Karriereseite: technisch vollständig,
als Produkt unbrauchbar, weil zehn gleich laute Abschnitte keine Hierarchie
ergeben.

Gate 00 ist die Antwort darauf. Es ändert nichts am Produkt. Es stellt fest,
**was ist**, damit spätere Gates ändern können, ohne sich zu verlaufen.

## Der Leitsatz für alle folgenden Gates

> **Interne Komplexität darf wachsen.
> Externe Komplexität darf nur wachsen, wenn der Nutzer etwas davon hat.**

Die fünf Ebenen bleiben ein starkes internes Ordnungsmodell. Ein Besucher
darf aber nie gezwungen sein, das Modell von creaDIG zu verstehen, bevor er
sein eigenes Problem, das erwartete Ergebnis, den Beleg, den Preis und den
nächsten Schritt versteht.

## Dateien

| Datei | Inhalt |
|---|---|
| `gate-00-baseline.md` | Der Messbericht: Routen, Höhen, Muster, Funnel, Technik |
| `acceptance-matrix.md` | **Zentral.** Jeder Befund mit ID, Wahrheitsstand, Priorität, Gate |
| `decision-log.md` | Entscheidungen, die spätere Gates nicht still umdrehen dürfen |
| `owner-decisions.md` | Höchstens fünf offene Fragen an den Owner |
| `claim-proof-matrix.md` | Jede öffentliche Behauptung gegen ihren Beleg |
| `pricing-inventory.md` | Jeder öffentliche Preis, ohne Änderung |
| `buyer-matrix.md` | Vier Kundengrößen — Vertrauen, Blocker, nötiger Beleg |
| `route-inventory.md` | Jede Route, ihre Sprachen, ihre Frage, ihr Haupt-CTA |
| **Gate 01** | |
| `gate-01-positioning-ia.md` | Der Gate-Bericht: was geändert wurde, gemessen, mit Rückweg |
| `positioning-system.md` | Kategorie, Reihenfolge der Argumente, Ergebnissatz, was nicht behauptet wird |
| `offer-architecture.md` | Fünf Ebenen × Einstieg: Art, Betrag, Route, Beleg |
| `information-architecture.md` | Hauptmenü, Produkte/Arbeiten, Insights, Startseiten-Reihenfolge |
| `page-contracts.md` | Je Route: eine Frage, ein nächster Schritt, was nicht draufgehört |
| `route-transition-plan.md` | Welcher Übergang wartet auf welche Bedingung, und wer sie herstellt |
| **Gate 02** | |
| `gate-02-proof-sales.md` | Der Gate-Bericht: Beleg-Architektur, was gezeigt wird und was bewusst nicht |

## Statuskanon

Drei getrennte Felder. Nie eines für drei Bedeutungen benutzen.

**Wahrheitsstand** (`current_truth`)
`CONFIRMED_CURRENT` · `LIVE_ONLY` · `FIXED_ON_BRANCH` · `NOT_REPRODUCED` ·
`OBSOLETE` · `OWNER_BLOCKED` · `EXTERNAL_BLOCKED` · `UNVERIFIED`

**Umsetzung** (`implementation_status`)
`OPEN` · `IN_PROGRESS` · `IMPLEMENTED` · `REMOVED` · `ACCEPTED_AS_IS`

**Prüfung** (`verification_status`)
`UNVERIFIED` · `PASS` · `FAIL` · `NOT_APPLICABLE`

## Priorität

| | |
|---|---|
| **P0** | Verhindert Nutzung, Wahrheit, Sicherheit oder eine zentrale Conversion |
| **P1** | Deutlicher Produkt-, Vertrauens-, Wahrheits- oder Verkaufsfehler |
| **P2** | Spürbare Qualitätsminderung |
| **P3** | Politur |

Geschmack ist kein P1. Wahrheitswidersprüche, erfundener Beleg, kaputte
Lokalisierung und Conversion-Blocker werden nicht leise abgestuft.

## Gates

| Gate | Inhalt | Stand |
|---|---|---|
| **G00** | Bestand, Wahrheit, Kontrollsystem | **CLOSED** |
| **G01** | Positionierung, Angebot, Informationsarchitektur | **CLOSED** |
| **G02** | Proof, Vertrauen, Verkaufsarchitektur | **BUILT 🟢 · ACCEPTED 🟢 · OPERATIONAL 🟡 OWNER-ASSET** |
| G03 | Content-System und vollständige Copy | NOT_STARTED |
| G04 | Visuelles System und Designqualität | NOT_STARTED |
| G05 | Seiten- und Produktumsetzung | NOT_STARTED |
| G06 | Werkzeuge, Formulare, Integrationen | NOT_STARTED |
| G07 | Barrierefreiheit, Mobile, Internationalisierung | NOT_STARTED |
| G08 | Technik, Performance, Sicherheit | NOT_STARTED |
| G09 | Unabhängiger Schluss-Audit und Release | NOT_STARTED |

## Regeln für spätere Gates

1. Kein Befund verschwindet. Ein erledigter bleibt mit Beleg stehen.
2. Jeder Befund hat **genau ein** besitzendes Gate.
3. Kein „behoben" ohne Beleg.
4. Produktion, Branch und Preview werden nie vermischt.
5. Neue Befunde bekommen eine neue ID, keine Wiederverwendung.
6. Wer einen Befund auf `FIXED_ON_BRANCH` setzt, legt im selben Zug den
   gemessenen Beleg **nach** der Änderung daneben — mit derselben Methode wie
   die Ausgangsmessung.
7. Nebenwirkungen auf fremde Befunde werden gemessen und benannt, auch wenn
   sie das eigene Ergebnis schlechter aussehen lassen.

## Maschinell gesicherte Entscheidungen

Was ein Kommentar nicht hält, prüft ein Gate im Postbuild.

| Skript | Sichert |
|---|---|
| `scripts/check-website2.mjs` | Die Acceptance-Matrix: IDs, Gates, Prioritäten, Wahrheitsstände, Zusammenfassung, Verteilung, Artefakt-Vollständigkeit |
| `scripts/check-einstiege.mjs` | Die Angebotsarchitektur und die Hauptnavigation (D-17, D-18, D-20) |
| `scripts/check-beleg.mjs` | Produktbelege: Quelle, Prüfdatum, Zugangslage — und dass kein zurückgehaltenes Bild gezeigt wird (D-21, D-22, D-23) |
| `npm run proof-drill` | Die Freigabewahrheit für Kundenbelege (älter als Gate 02, hier nur nachgeprüft) |
