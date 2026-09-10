# Seiten-Verträge · Gate 01

Für jede öffentliche Route: die eine Frage, die sie beantwortet, der eine
nächste Schritt, den sie anbietet, und was auf ihr **nicht** stehen darf.

Ein Seiten-Vertrag ist kein Wunsch. Er ist die Bedingung, an der spätere Gates
prüfen können, ob eine Änderung die Seite verbessert oder nur verlängert.

Gemessen am 10.09.2026. Höhen sind `document.scrollHeight` bei 1440 × 900 und
390 × 844, Wörter sind `main.innerText` — dieselbe Methode wie in Gate 00
(gegengeprüft an `/insights`: 2.413 px damals, 2.413 px heute).

---

| Route | Eine Frage | Ein nächster Schritt | Darf hier nicht stehen | 1440 | 390 | Wörter |
|---|---|---|---|---:|---:|---:|
| `/` | Was ist das, und was ist bei mir danach anders? | Projekt starten | Preisleiter, Ebenen-Tiefe, zweite Produktliste | 8.912 | 12.245 | 663 |
| `/leistungen` | Was kann ich kaufen, und wo steige ich ein? | Festpreis-Angebot | Kundenfälle, Produkt-Deep-Dives | 10.290 | 16.228 | 1.204 |
| `/leistungen/[slug]` | Löst das mein Problem? | Anfragen | Zweite Preiswelt neben `priceLadder` | — | — | — |
| `/produkte` | Kann creaDIG bauen? | Produkt ansehen | Kundenwerk als Hauptinhalt | 3.193 | 5.181 | 198 |
| `/produkte/[slug]` | Was ist dieses Produkt? | Interesse | Erfundener Reifegrad, erfundene Nutzerzahl | — | — | — |
| `/arbeiten` | Was haben wir **für andere** geliefert? | Zu den eigenen Produkten | Eigene Produkte, „Demnächst", Beispielfälle | 1.940 | 3.145 | 79 |
| `/unternehmen` | Wem vertraue ich? | Gespräch | Teamgröße, Umsatz, Zertifikate ohne Beleg | — | — | — |
| `/betrieb` | Was heißt „Betrieb" konkret, und was kostet er? | Betreuung anfragen | SLA in Prozent, 24/7, Reaktionszeit in Stunden | 5.134 | 8.423 | 578 |
| `/systeme` | Integriert creaDIG in das, was schon läuft? | Gespräch | Preise | — | — | — |
| `/branchen/handwerk` | Passt das zu meinem Gewerk? | Betriebscheck | Erfundene Referenz aus dem Gewerk | — | — | — |
| `/betriebscheck` | Wo klemmt es bei mir? | Ergebnis / Gespräch | Lead-Gate (D-12) | — | — | — |
| `/insights` | Denkt creaDIG gründlich? | Lesen | Leere Fächer als Versprechen | 2.413 | 3.931 | 138 |
| `/insights/[slug]` | Was ist der Gedanke? | Leistung ansehen | Verkaufsblock im Artikelkörper | — | — | — |
| `/termin` | Wie komme ich ins Gespräch? | Termin | Mehr Schritte als nötig (WEB-0008, G06) | — | — | — |
| `/kontakt` | Wie erreiche ich creaDIG? | drei Wege | Formular als einziger Weg | — | — | — |
| `/karriere` | Finde ich hier einen Platz? | Vorstellen | Offene Stelle, `JobPosting`, Standortgeschichte | — | — | — |
| `/impressum`, `/datenschutz`, `/barrierefreiheit` | Rechtspflicht | — | Marketing | — | — | — |

„—" heißt: in diesem Zug nicht gemessen. Gate 01 hat die sechs Routen
gemessen, die es verändert hat, plus `/betrieb` als Ziel eines neuen
Einstiegs.

---

## Die drei Verträge, die Gate 01 geändert hat

**`/` — von „was wir sind" zu „was bei Ihnen anders wird".**
Die Seite darf ab jetzt keine zweite Produktliste tragen und keine
Preisleiter. Sie nennt genau zwei Beträge, und zwar als zwei verschiedene
*Arten* anzufangen, nicht als Preisschild.

**`/leistungen` — jede Ebene trägt einen Einstieg.**
Die Seite darf keine Ebene mehr zeigen, die kein Ziel hat. Das ist maschinell
gesichert (`check-einstiege.mjs`, Regel 1).

**`/arbeiten` — für andere gebaut, oder leer.**
Die Seite darf keine eigenen Produkte zeigen. Solange keine Freigabe vorliegt,
ist sie dünn und sagt warum. Das ist der Vertrag, nicht sein Bruch.

---

## Der offene Konflikt, den Gate 01 an Gate 03 übergibt

`/leistungen` ist die längste Seite der Website (**WEB-0013**, P2, G03). Gate
01 hat sie länger gemacht:

| | Gate 00 | nach Gate 01 | Δ |
|---|---:|---:|---:|
| Desktop | 9.854 px | 10.290 px | **+436** |
| Mobil | 15.666 px | 16.228 px | **+562** |
| Wörter | 1.127 | 1.204 | +77 |
| Eyebrows | 61 | 69 | +8 |

Das ist der Preis für WEB-0004 (P1): fünf sichtbare Einstiegszeilen. Ein
erster Entwurf mit drei Spalten je Ebene kostete +997 px mobil; als
umbrechende Zeile sind es +562 px.

**Die Abwägung, ausgesprochen:** WEB-0004 ist P1, WEB-0013 ist P2. Eine Ebene
ohne Einstieg verkauft nichts; eine zu lange Seite verkauft schlechter. Gate
01 hat der höheren Priorität den Vorrang gegeben und übergibt die Länge mit
gemessener Zahl an Gate 03 — nicht als Bemerkung, sondern als Auftrag.
