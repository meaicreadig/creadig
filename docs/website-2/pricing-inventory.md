# Preis-Inventar

**In Gate 00 wurde kein Preis geändert. In Gate 01 auch nicht.** Diese Datei
stellt fest, was öffentlich steht.

Gate 01 hat die **Platzierung** geändert, nicht die Beträge (D-19). Was sich
verschoben hat, steht unten unter „Was Gate 01 an der Platzierung geändert
hat".

| Angebot | Preis | Art | Wo | Umfang | Rolle |
|---|---|---|---|---|---|
| Website-Paket (Pilot) | **2.400 € netto** | Festpreis einmalig | `/`, `/leistungen` | Website, Text, Karriere-Unterseite, Google-Profil, Formular, Barrierefreiheit; vier Wochen ab Material | Einstieg |
| Website-Paket (Regel) | **3.900 € netto** | Festpreis einmalig | `/`, `/leistungen` | wie oben, ohne Pilotrabatt | Regelpreis |
| Barrierefreiheitsprüfung | **1.500 € netto** | Festpreis einmalig | `/leistungen`, `/leistungen/barrierefreiheit-website` | Vollständige Prüfung nach 12-Punkte-Raster | Eigenständig |
| Behebung Barrierefreiheit | **2.000–4.000 €** | Rahmen | `/leistungen/barrierefreiheit-website` | Angebot erst nach Prüfung | Folgeauftrag |
| Managed Betrieb | **149 € netto/Monat** | Abo, monatlich kündbar | `/`, `/leistungen`, `/betrieb` | Hosting, Monitoring, Updates, Security, Backups, Support, Weiterentwicklung | Laufend |
| Größere Systeme | **auf Anfrage** | — | `/systeme`, `/leistungen` | keine Größenordnung genannt | Projekt |

## Steuerlage

Alle Preise „netto". Die Preiszeile trägt „zzgl. 19 % USt." als heutige
Annahme, während der Umsatzsteuer-Status intern noch offen ist (G18, eigener
Arbeitszug). **Nicht in dieser Matrix** — G18 gehört nicht zur Website 2.0.

## Die Spannung, ohne sie aufzulösen

Drei Größen werden heute vermischt:

1. **Einstiegspreis** — 2.400 € ist für einen Kleinbetrieb plausibel bis
   attraktiv und senkt das Risiko.
2. **Unternehmenspositionierung** — derselbe Preis steht auf der Startseite und
   ankert creaDIG als Website-Anbieter, nicht als System-Haus (WEB-0024).
3. **Betrieb für kritische Systeme** — 149 €/Monat ist für eine Website klar
   und günstig. Für einen Mittelständler, der ein geschäftskritisches System
   betreiben lassen will, signalisiert derselbe Betrag „kleine Betreuung".

**Das ist keine Aussage darüber, dass die Preise falsch sind.** Es ist die
Feststellung, dass ein Preis drei verschiedene Jobs gleichzeitig macht.

## Was Gate 01 an der Platzierung geändert hat

Kein Betrag wurde geändert, hinzugefügt oder entfernt. Geändert wurde, **wo**
und **wie** ein Betrag gelesen wird.

| | vorher | nach Gate 01 |
|---|---|---|
| Startseite, Überschrift | „Website-Paket ab **2.400 €** netto" | keine Zahl in einer Überschrift |
| Startseite, sichtbare Beträge | 2.400 € | 2.400 € **und** 149 €, als zwei verschiedene *Arten* anzufangen |
| `/leistungen`, je Ebene | kein Betrag an der Ebene | Betrag an der Ebene, wo einer bestätigt ist; sonst „Angebot nach Analyse" |
| Retainer-Bedingung | nur auf `/betrieb`, also hinter dem Klick | zusätzlich an der Ebene und im Startseiten-Einstieg, vor dem Klick |
| Preisleiter vollständig | `/leistungen#pakete` | unverändert `/leistungen#pakete` |

**Die Regel dahinter (D-18):** Kein Betrag entsteht außerhalb von
`lib/site-data.ts`. `lib/einstiege.ts` liest `packages` und `retainer` und
tippt keine Zahl; `scripts/check-einstiege.mjs` weist jeden angezeigten Betrag
gegen diese beiden Quellen nach.

**Was das an der oben beschriebenen Spannung ändert:** Punkt 2 ist entschärft
— derselbe Preis ankert die Startseite nicht mehr allein. Punkt 1 und Punkt 3
bleiben unverändert bestehen; sie sind Preisfragen und gehören dem Owner
(D-03, OD-6).

Was G01/G02 zu entscheiden haben: ob Einstiegsangebot, Systemprojekt und
Betriebsstufen getrennt sichtbar werden — und was auf der Startseite steht.
**Nicht** automatisch: Preise erhöhen.
