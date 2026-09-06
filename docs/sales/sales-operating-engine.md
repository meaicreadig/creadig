# creaDIG · Vertriebsmotor

> **Authority:** Kanon · Gate 08 · 06.09.2026
> Baut auf `offer-canon.md` (Gate 05), `qualification-canon.md` (Gate 06) und
> `crm-customer-core.md` (Gate 07). Was dort steht, wird hier nicht wiederholt.
>
> Gemessen mit `npm run sales-drill` gegen eine Wegwerf-Datenbank.

---

## 1 · Die Grenze, die alles trägt

Eine Verkaufschance entsteht **nur**, wenn ein Mensch entscheidet, dass es
eine gibt. Bewiesen (Probelauf §1):

| Vorgang | Erzeugt Verkaufschance? |
|---|---|
| Bestandsimport (24 Organisationen, **19 Kunden**) | **nein** |
| eine Anfrage geht ein | **nein** |
| Beziehung wird `warm` | **nein** |
| Organisation ist `kunde` | **nein** |

Es gibt genau **zwei** Wege zu einer Chance, beide durch einen Klick eines
Menschen:

1. `createOpportunityFromEnquiry` — aus einer Anfrage, mit `from_lead_id`.
2. `createOpportunityForOrganisation` — **neu in Gate 08**, ohne Anfrage.

**Warum der zweite nötig war:** Bis hierher konnte nur zur Chance werden, wer
ein Formular ausgefüllt hatte. Damit fielen ausgerechnet die naheliegendsten
Geschäfte heraus — ein Bestandskunde ruft an, ein warmer Kontakt sagt im
Gespräch zu. Der Owner hätte eine Anfrage erfinden müssen, die es nie gab.
`from_lead_id` bleibt hier leer: Nicht jeder Vorgang hat einen Beleg im
Posteingang, und einen zu erfinden wäre genau die Falschheit, gegen die
dieses Feld gebaut wurde.

Ein Vorgang ändert **nicht** den Lebenszyklus der Organisation. Aus einem
Prospect wird kein Kunde, weil jemand ihm etwas verkaufen will.

---

## 2 · Angebotsreife — zwei Logiken, nicht eine

Gate 06 hinterließ den Satz „angebotsreif heißt: Treiber bekannt, Umfang
zuschneidbar". Gate 07 korrigierte ihn im Dokument. Im **Code stand bis
Gate 08 gar nichts** — und das ist die gefährlichste Form einer Regel: Sie
klingt verbindlich und bindet nichts. Ein Verkäufer, der die Dokumente nicht
kennt, fragt einen Handwerksbetrieb nach fünf Systemtreibern, bevor er ihm
ein fertiges Festpreis-Paket anbietet. Der Betrieb legt auf.

`lib/offer-readiness.ts` macht die Regel ausführbar:

| Angebot | Preisform | Belege | Systemtreiber? |
|---|---|---|---|
| Website-Paket | Festpreis | Betrieb · Umfang passt · Material zusagbar | **nein** |
| Barrierefreiheits-Prüfung | Festpreis | Seite benannt · Betrieb | **nein** |
| Behebung | Spanne | Prüfbericht liegt vor · Code-Zugang geklärt | **nein** |
| Managed Betrieb | wiederkehrend | eigenes System · Grenze bekannt | **nein** |
| **Systemprojekt** | nach Zuschnitt | Problem · Abläufe · Rollen/Orte · Bestand · Ergebnis | **ja** |

**Beleg, nicht Punktzahl.** Es gibt keine Quote, keine Ampel, kein „4 von 5".
Die Oberfläche zeigt die **offenen Fragen im Klartext**. Ein Zähler lädt dazu
ein, Haken zu setzen, damit er steigt; eine offene Frage lädt dazu ein, sie
zu beantworten.

**Reife wird abgeleitet, nie gespeichert.** Es gibt bewusst keine Spalte
`is_ready`. Ändern sich die Anforderungen einer Angebotsart, ändert sich die
Anzeige mit — eine gespeicherte Reife wäre ab diesem Moment still falsch.

**Der Speicher filtert.** Wechselt die Angebotsart, sind die Belege der alten
gegenstandslos und werden verworfen. Ein Schlüssel, den es für diese Art
nicht gibt, käme über ein manipuliertes Formular herein und zählte nie —
stünde aber in der Zeile. Gemessen: 3 gespeichert, 1 wirksam.

---

## 3 · Abnahmedaten zählen nicht mit

`OPEN_CLAUSE` in `lib/vertrieb-store-neon.ts` definiert „offen" an **einer**
Stelle: `status NOT IN ('won','lost') AND excluded_reason IS NULL`. Jede
Zählung und jeder Filter liest sie.

`applyExclusions` vererbt den Ausschluss auf Vorgänge über **drei** Wege:
`from_lead_id`, `organisation_id`, `contact_id`.

**Korrektur eines früheren Befunds.** Im Gate-07-Bericht stand, die zwei
Produktions-Vorgänge („Runde2 Testbetrieb", „Yilmaz Dachtechnik") seien nie
ausgeschlossen worden. Das war falsch: Beide tragen `excluded_reason`, und
die operative Pipeline war schon damals **0**. Meine Abfrage hatte die Spalte
nicht mitgelesen.

Detailseiten filtern **absichtlich nicht**: Wer einem Verweis folgt, soll den
Datensatz sehen — samt Begründung. Unsichtbar machen und unauffindbar machen
sind zwei verschiedene Dinge.

Gemessen: 2 Vorgänge gesamt, **1 operativ**; Dr. Hüseyin Yilmaz bleibt aktiv.

---

## 4 · Nächster Schritt

Ein **laufender** Vorgang ohne nächsten Schritt ist Schuld und wird als
solche angezeigt. Ein **abgeschlossener** verlangt keinen — gemessen: 1
Schuld vor, 0 nach dem Abschluss.

Zeit allein schließt nichts. `lost` entsteht nur durch einen Menschen mit
einem Grund aus `LOST_REASONS`. Gemessen: nach dem gesamten Probelauf 0
verlorene Vorgänge.

---

## 5 · Geld

`estimated_value` bleibt `NULL`, solange kein Betrag belegt ist. **`NULL`
heißt „nicht geschätzt", nicht „null Euro".** Aus „will eine Website" folgt
nicht 3.900 € — der Umfang entscheidet, und der steht am Anfang nicht fest.
Keine Wahrscheinlichkeit, kein gewichteter Trichter, keine Prognose.
Gate 16 rechnet.

---

## 6 · Übergaben

| Gate | Bekommt | Baut hier **nicht** |
|---|---|---|
| 09 | Prospect unabhängig von Chance; Kontakt/Organisation ohne Geschäft anlegbar | Prospecting |
| 10 | Kontakte **ohne** Werbeeinwilligung | Kampagnen |
| 11 | `source` als Weg, **nicht** als Attribution | Attribution |
| 13 | `offer_kind` + Belege = „angebotsreif", Zahlungsmodell aus Gate 05 | Angebotsdokument |
| 14 | `won` mit Organisation, Kontakt, Angebotsart | Projektsteuerung |
| 16 | nur belegte Beträge, nie geschätzte | Buchhaltung |
| 19 | `OPEN_CLAUSE`, Überfälligkeit, Stufen, Gewonnen/Verloren, echt vs. Abnahme | Cockpit |
