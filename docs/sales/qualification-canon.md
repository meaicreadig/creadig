# creaDIG · Qualifizierungskanon

> **Authority:** Kanon · Gate 06 · 05.09.2026
> Eine Quelle für Einstiege, Fragen, Grenzen und die Übergabe an den Vertrieb.
> Wer später einen Betriebsnavigator, eine Automatisierung oder eine
> KI-Schicht baut, baut **kein zweites** Qualifizierungssystem — er liest dieses.

---

## 1 · Verkaufsschritt ≠ Angebot ≠ Verkaufschance

Drei Dinge, die leicht verwechselt werden:

| | Was es ist | Was es erzeugt |
|---|---|---|
| **Betriebscheck / Systemgespräch** | Weg hinein, kostenlos | Orientierung + eine Anfrage |
| **Anfrage** | ein Eingang, ein Beleg | eine Zeile in `leads` |
| **Verkaufschance** | eine konkrete Sache mit Absicht | entsteht **nur**, wenn ein Mensch einen nächsten Schritt setzt |

**Bewiesen, nicht behauptet:** Der Vorgangs-Aufbau in `lib/neon-client.ts`
trägt die Bedingung `WHERE (l.sales_status <> 'new' OR l.next_action IS NOT
NULL)`. Eine frische Anfrage erfüllt keine der beiden Hälften. An einer
Wegwerf-Datenbank gemessen: frische Anfrage → **0 Vorgänge**; sobald jemand
einen nächsten Schritt setzt → **1 Vorgang**.

Es gibt also keine stille Pipeline-Blähung, und sie kann auch nicht
versehentlich entstehen.

---

## 2 · Die Wege hinein

| Weg | Für wen | Herkunft | Nächster Schritt |
|---|---|---|---|
| `/termin` → Erstberatung | weiß ungefähr, was er will | `termin` | 20 Min., kostenlos |
| `/termin?art=systemgespraech` | Betriebsproblem, größerer Umfang | `termin` | 45 Min., **fünf Treiber vorab** |
| `/termin?paket=website` / `?paket=retainer` | weiß genau, was er will | `termin` | Erstberatung mit vorgewähltem Interesse |
| `/betriebscheck` | weiß nur, dass es klemmt | `betriebscheck` | Befund + Anfrage |
| Kurz-Check Barrierefreiheit | hat eine Seite, will sie prüfen lassen | `kurzcheck` | Prüfung |
| Produktseiten | Interesse an meAI / fibero / … | `produkt-<slug>` | Gespräch, **kein** Website-Paket |
| `/kontakt` | eine Frage, kein Vorhaben | `kontakt` | WhatsApp oder E-Mail, **ohne Formular** |

**`/kontakt` ist ein Router, kein Formular.** Es ist kein zweiter
Betriebscheck und kein zweites `/termin`. Wer nur eine Frage hat, soll nicht
qualifiziert werden.

---

## 3 · Die Herkunft ist eine geprüfte Menge

`source` war bis Gate 06 freier Text mit vierzig Zeichen. Wer die
Schnittstelle direkt ansprach, konnte beliebiges hineinschreiben — und der
Verkauf las es unter „Herkunft:" als Tatsache.

Jetzt gilt: `KNOWN_SOURCES` in `app/api/lead/route.ts` — vier feste Wege plus
`produkt-<slug>` je Produkt aus `productWorks`. Alles andere fällt auf
`kontakt` zurück.

**Wichtig:** Verworfen wird nicht die Anfrage, sondern die Behauptung
darüber, woher sie kam. Hinter einem manipulierten Feld kann ein echter
Mensch stehen.

Gemessen: `GEWONNEN-GROSSKUNDE` → gespeichert als `kontakt`.
`produkt-gibtsnicht` → `kontakt`. `produkt-meai` → bleibt.

---

## 4 · Die fünf Treiber — nur auf dem Systemweg

Gate 05 hat sie öffentlich gemacht; gefragt hat sie niemand. Jetzt stehen
sie in `termin.scope`, in Kundensprache, und erscheinen **ausschließlich**,
wenn Systemgespräch gewählt ist.

| Treiber (intern) | Frage (Kunde) |
|---|---|
| Abläufe | „Was klemmt bei Ihnen am meisten?" |
| Rollen | „Arbeiten mehrere Personen mit unterschiedlichen Aufgaben daran?" |
| Standorte | „An wie vielen Orten wird gearbeitet?" |
| Anbindungen / Altdaten | „Gibt es Programme oder Daten, die mitkommen müssen?" |
| Arbeit draußen | „Wird auch außerhalb des Büros gearbeitet — Baustelle, Montage, unterwegs?" |

**Drei Regeln:**

1. **Nur auf diesem Weg.** Gemessen: Erstberatung und `?paket=website`
   zeigen 7 Eingabefelder und **0** Treiberfragen; Systemgespräch zeigt 12
   und **5** — auch bei 390 px Breite.
2. **Keine Pflicht.** Pflichtfelder bleiben in beiden Fällen **4**. Wer es
   nicht weiß, lässt es offen und kommt trotzdem durch — genau solche Leute
   rufen ja deswegen an.
3. **Tatsachen, keine Bewertung.** Keine Punktzahl, kein Reifegrad, keine
   Einstufung. Drei Standorte sind drei Standorte.

Leere Treiber erscheinen bei der Erstberatung **nicht** als fünf Striche in
der Zusammenfassung: Ein nie gestelltes Feld liest der Verkauf sonst als
„der Kunde wollte nicht antworten".

---

## 5 · Wo frei aufhört

Übernommen aus `offer-canon.md` §2 und hier verbindlich für die
Gesprächsführung:

| Frei | Nicht mehr frei |
|---|---|
| Zuhören, den Betrieb ansehen | Den Ablauf dokumentieren |
| Sagen, worin das Problem besteht | Sagen, wie es technisch gebaut wird |
| Den Umfang zuschneiden | Planen und schätzen lassen |
| Sagen, ob wir passen | Ein Konzept liefern, mit dem ein anderer bauen kann |

Ein kostenloses Gespräch endet mit einer **Entscheidung**, nicht mit einem
Ergebnis zum Mitnehmen.

---

## 6 · Was der Vertrieb bekommt (Vertrag für Gate 07)

Je Anfrage, aus dem laufenden System gemessen:

```
Vorgang       CD-260905-ec62
Herkunft      termin                    (geprüfte Menge, §3)
Stand         new                       (= keine Verkaufschance, §1)
Sprache       de
Gesprächsart  Systemgespräch
Wunschtage    7. September 2026
Zeitfenster   Vormittag (09–12 Uhr)
Name          …
Telefon       …
E-Mail        …
Unternehmen   …
Stadt         …
Interesse     …
Größe         …
── die fünf Treiber, nur auf dem Systemweg ──
klemmt        Anfragen und Aufträge gehen unter
Rollen        Ja, mehrere Bereiche
Orte          Mehr als drei
Programme     Ja
Draußen       Ja
Einwilligung  gesetzt (Pflicht, server-geprüft)
```

**Owner-Last, konkret.** Vorher musste der Owner aus „Terminwunsch, Name,
Stadt, ein Satz" selbst erschließen, ob das ein Paket oder ein Projekt ist.
Jetzt steht es da: mehrere Bereiche, mehr als drei Orte, Altsysteme,
Außendienst — das ist ein Systemprojekt, und zwar **vor** dem Gespräch.

Was der Vertrieb **nicht** bekommt: keine Punktzahl, keine Einstufung, keine
Wahrscheinlichkeit, keine Empfehlung. Nur Tatsachen und was der Kunde selbst
gesagt hat.

---

## 7 · Bestandskunde und Produktinteresse

**Bestandskunde:** wird nicht durch die Neukunden-Qualifizierung geschickt.
`/kontakt` bietet den direkten Weg (WhatsApp, E-Mail) ohne Formular und ohne
Betriebscheck. Ein eigener Support-Kanal ist Gate 15 — hier wird kein
Support-Portal behauptet, das es nicht gibt.

**Produktinteresse:** eigener Weg mit eigener Herkunft (`produkt-<slug>`).
Wer meAI ansehen will, landet **nicht** im Website-Paket. Produkte tragen
keine Preisliste (siehe `offer-canon.md` §11) — die Anfrage führt zu einem
Gespräch, nicht zu einem Kauf.

---

## 8 · Grenze zu späteren Gates

| Gate | Bekommt | Baut **nicht** hier |
|---|---|---|
| 07 | den Vertrag aus §6, Anfrage-/Kontakt-/Organisationsgrenze | CRM-Umbau |
| 08 | „angebotsreif" heißt: Treiber bekannt, Umfang zuschneidbar | Pipeline |
| 10 | Anfrage ≠ Werbeeinwilligung | Kampagnen |
| 11 | funktionale Herkunft ≠ Attribution | Attribution |
| 17 / 18 | deterministische Regeln, aus denen Automatisierung schöpfen kann | KI-Qualifizierung |

**Der künftige Betriebsnavigator** benutzt diese Routen und diese Treiber.
Er erfindet keine zweite Qualifizierung.
