# Angebotsarchitektur · Gate 01

Was ein Besucher heute tatsächlich kaufen kann, je Ebene, mit Preis, Route und
Beleg. Quelle im Code: `lib/einstiege.ts`. Gesichert durch
`scripts/check-einstiege.mjs` (läuft im Postbuild).

Gemessen am 10.09.2026.

---

## Der Befund, der das ausgelöst hat

**WEB-0004** — *Operations und Intelligence sind Kategorien, kein kaufbarer
Einstieg.* Beleg aus Gate 00: für beide Ebenen kein Preis, keine Projektgröße,
kein Beispiel.

Die Ursache war strukturell, nicht redaktionell:

| Ebene | Leistungsseiten (vorher) |
|---|---:|
| Identity | 1 |
| Digital | 4 |
| Operations | **0** |
| Automation | 1 |
| Intelligence | **0** |

Die Einstiegs-Chips auf `/leistungen` zeigen `publishedServicePages`. Zwei
Ebenen kamen darin nicht vor — unter ihrer Überschrift stand nichts, woran
sich ein Käufer festhalten kann.

---

## Die Architektur

Fünf Ebenen, fünf Einstiege. Keine Ebene ohne, keine Ebene mit zweien.

| Ebene | Art | Betrag | Einstieg beginnt auf | Beleg |
|---|---|---:|---|---|
| 01 Identity | Angebot nach Analyse | — | `/leistungen/corporate-design` | — |
| 02 Digital | Festpreis ab | 2.400 € | `/leistungen#pakete` | `/barrierefreiheit` (eigene Prüfung) |
| 03 Operations | Monatlich | 149 € | `/betrieb` | `/produkte/fibero` |
| 04 Automation | Angebot nach Analyse | — | `/leistungen/ki-automatisierung` | — |
| 05 Intelligence | Angebot nach Analyse | — | `/termin?art=systemgespraech` | `/produkte/meai` |

**Wo die Beträge herkommen:** ausschließlich `packages` und `retainer` in
`lib/site-data.ts`. In `lib/einstiege.ts` wird keine Zahl getippt; das Gate
prüft, dass jeder angezeigte Betrag dort auch wirklich steht.

---

## Die drei Arten — und warum es genau drei sind

| Art | Bedeutung | Ebenen |
|---|---|---|
| `festpreis` | Vereinbarter Umfang, eine Zahl, kein Stundenzettel | Digital |
| `monatlich` | Laufender Betrieb eines Systems, das wir gebaut haben | Operations |
| `nach-analyse` | Kein Listenpreis; das Angebot entsteht nach dem Gespräch | Identity, Automation, Intelligence |

`nach-analyse` ist **keine Ausweichformel**. Es ist der Zustand, in dem sich
Systementwicklung heute befindet, und er steht so bereits in
`leistungenPage.pricingNote`. Der Unterschied zu vorher: Vorher stand dort
nichts, und ein Leser, der keine Auskunft findet, beantwortet die Frage selbst
— gegen uns.

---

## Die Bedingung, die vor dem Preis steht

Der Retainer (149 €/Monat) gilt nur für Systeme, die creaDIG gebaut hat
(`retainer.precondition`). Dieser Satz stand bisher auf `/betrieb`, also
**hinter** dem Klick. Wer den Preis vorher liest, hat ihn als sein Angebot
verstanden, bevor er die Bedingung kennt.

Er steht jetzt an drei Stellen vor dem Klick: an der Ebene auf `/leistungen`,
im Einstiegsblock der Startseite und unverändert ausführlich auf `/betrieb`.

---

## Was fehlt — und wem es gehört

| Lücke | Wer kann sie schließen | Vermerk |
|---|---|---|
| Kein bestätigter Betrag für Identity, Automation, Intelligence | Owner | **OD-6** |
| Kein zeigbarer Beleg für Identity und Automation | Gate 02 | WEB-0001 |
| Keine Projektdauer je Leistung | Owner | bestand schon vor G01 |

Für Intelligence wurde **keine Zahl erfunden**. Sie wäre die einzige Zahl auf
der Website, die niemand halten muss — und der teuerste Satz, den die Seite
haben kann.

---

## Was das Gate prüft

`scripts/check-einstiege.mjs`, neun Regeln:

1. Jede Ebene hat genau einen Einstieg.
2. Kein Einstieg zeigt auf eine Ebene, die es nicht gibt.
3. `festpreis`/`monatlich` ohne Betrag ist verboten.
4. `nach-analyse` **mit** Betrag ist verboten.
5. Jeder Betrag steht in `packages` oder `retainer`.
6. Eine Bedingung gibt es nur beim monatlichen Einstieg.
7. Ein Beleg darf nicht auf den Einstieg selbst zeigen.
8. Jede Route, auf die ein Einstieg oder Beleg zeigt, existiert.
9. Jede aus dem Hauptmenü genommene Rubrik nennt einen Befund, der in der
   Acceptance-Matrix steht, und bleibt in der Fußzeile verlinkt.
