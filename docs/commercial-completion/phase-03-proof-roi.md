# Phase 3 — Proof & ROI Engine

**Stand:** 11.09.2026 · **Fall:** `/produkte/fibero` · **Rechner:** `/aufwandsrechner`

## Der Satz, um den es geht

Nicht: *„Wir sparen Ihnen Zeit."*

Sondern: **„Wir sagen, welcher Schritt sich verändert — und wie man seinen
Effekt misst."**

Alles in dieser Phase hängt an dem Unterschied.

---

# Teil 1 · Der fibero-Betriebsbeleg

## Was fibero ist — und was es nicht ist

fibero ist **creaDIGs eigener Glasfaser-Arm**: eigenes Team, Subunternehmer,
Aufträge an Adressen, Rechnungen in beide Richtungen, Belege, Steuerauswertung.
Es läuft im Tagesbetrieb.

Damit ist es ein **Betriebsbeleg**, kein Kundenfall. Diese Unterscheidung ist
keine Formalie:

- Ein **Kundenfall** beweist, dass jemand anderes creaDIG vertraut hat.
- Ein **Betriebsbeleg** beweist, dass creaDIG einen realen betrieblichen Ablauf
  verstanden und in ein System gebracht hat.

Das Zweite ist weniger als das Erste — und deutlich mehr als ein Screenshot.

Die Kennzeichnung steht an **drei** Stellen: in der Eyebrow („Eigener Betrieb,
kein Kundenfall"), im Vorspann („ist kein Kundenprojekt") und unter den
Grenzen. `scripts/check-angebotssystem.mjs` Teil 2 verbietet Kundensprache auf
dieser Seite — und schneidet dabei genau diese drei Verneinungssätze heraus,
damit das Gate nicht die Ehrlichkeit bestraft, die es durchsetzen soll.

## Quelle

Gelesen am **11.09.2026** im aktiven fibero-Repository (`~/Documents/fibero`):
`README.md`, `lib/db/schema.ts`, `app/api/*`. Keine Aussage stammt aus einer
Annahme darüber, was ein solches System „normalerweise" tut.

## Das Belegregister

`lib/fibero-beleg.ts`. Neun strukturelle Aussagen, jede mit Fundstelle:

| Aussage | Fundstelle | Zahl | Gemessen |
|---|---|---:|---|
| Ein Objekt ist der eine Datensatz | `schema.ts · work_objects` | — | **nein** |
| Drei Datenherkünfte, ein Datensatz | `work_objects.sourceType` | 3 | **nein** |
| Auftragsart als gezählte Felder | `work_objects (a,g,f,v,s,b,u,maw)` | 8 | **nein** |
| Prüfstand je importiertem Fakt | `work_objects.reviewStatus` | 2 | **nein** |
| Abrechnung aus denselben Fakten | `api/check-invoice · api/invoice-pdf` | — | **nein** |
| Belege automatisch eingesammelt | `api/belege-mail-sync · api/extract-receipt` | — | **nein** |
| Steuerberater-Paket und DATEV | `api/belege-steuerberater-pack` | — | **nein** |
| Prüfprotokoll | `schema.ts · audit_log` | — | **nein** |
| Fahrtenbuch mit Nachweisen | `api/fahrtenbuch-nachweise · fahrtenbuch-pdf` | — | **nein** |

**Null von neun sind gemessen.** Die Spalte existiert, damit sichtbar bleibt,
dass sie leer ist. `fiberoHatMessung` ist der Schalter, den erst eine echte
Erhebung umlegt.

## Jede veröffentlichte Zahl

| Zahl | Woher | Art | Sicher? |
|---|---|---|---|
| **3** Datenherkünfte | `sourceType: 'pdf_invoice' \| 'excel' \| 'manual'` | abgezählt aus dem Schema | ja |
| **8** Faktenfelder | Spalten `a,g,f,v,s,b,u,maw` | abgezählt aus dem Schema | ja |
| **2** Prüfstände | `reviewStatus: 'open' \| 'reviewed'` | abgezählt aus dem Schema | ja |

> ### KEINE HISTORISCHE LEISTUNGSZAHL ERFUNDEN.
>
> Es gibt **keine** Aufzeichnung darüber, wie lange dieselben Vorgänge vor
> fibero gedauert haben. Ohne Vorher-Messung wäre „früher zwölf Schritte, heute
> vier" zurückgerechnet — auch wenn es sich plausibel anfühlt. Es steht deshalb
> nirgends: keine Minute, kein Prozent, keine Stunde.

**Was stattdessen als Beleg dient:** die *Struktur*. Dass ein Datensatz einmal
entsteht und danach Abrechnung, Beleglauf und Steuerauswertung trägt, ist im
Schema nachlesbar und keine Geschmacksfrage.

## Warum „Reibung" und „Antwort" kein Vorher/Nachher sind

Zwei Spalten stehen nebeneinander — aber sie heißen **„Woran das System
ansetzt"** und **„Was das System daraus macht"**, nicht „vorher" und
„nachher". Die linke Spalte beschreibt den Vorgang, der in diesem Geschäft
ohnehin passiert, nicht einen gemessenen früheren Zustand. Der Hinweis
darunter sagt es noch einmal ausdrücklich.

## Die Messpunkte

Nicht *„so viel wurde gespart"*, sondern: **Diese Felder führt das System
bereits, also lässt sich daran messen.**

| Was sich messen lässt | Feld |
|---|---|
| Wie viele Objekte in einem Zeitraum entstanden sind | `work_objects` |
| Wie viele davon aus PDF, Excel oder Handeingabe kamen | `work_objects.sourceType` |
| Wie viele Fakten noch ungeprüft sind | `work_objects.reviewStatus = open` |
| Wie lange ein Objekt von der Anlage bis zum Abschluss braucht | `work_objects.timeline` |
| Wie viele Belege automatisch hereinkamen | `email_import_log` |

Das ist der Unterschied zwischen einer **Methode** und einem Werbeversprechen.

## Die Grenzen

- Es wird nicht verkauft und hat keine Preisliste.
- Es hat keine öffentliche Adresse — es läuft im eigenen Betrieb.
- Es ist **kein Kundenprojekt** und kein Beleg für Kundenzufriedenheit.
- Es plant keine Einsätze; die Planung liegt in einem anderen System.

## Sichere Artefakte

Genau **eine** Aufnahme: `/works/fibero.jpg`, seit Gate 02 geprüft
(`lib/produkt-beleg.ts`, `imageProof: "product-photo"`). **Kein zweiter Screen
erfunden.** Der Fall trägt über den Prozessbeleg, nicht über Bildmenge.

**Keine Namen aus dem laufenden Betrieb.** Auftraggeber und Subunternehmer
stehen im fibero-Repository; keiner hat einer Nennung zugestimmt. Maschinell
gesichert (Regel 2.5) für die gesamte Website.

## Warum das überhaupt etwas beweist

> Ein Abbruch vor Ort, der kein Storno ist, steht in keinem Lastenheft.
> Er steht in diesem Schema.

Das ist der Kern: Nicht dass eine Oberfläche existiert, sondern dass die Fälle
abgebildet sind, die man erst im Betrieb bemerkt.

---

# Teil 2 · Der Aufwandsrechner

## Route und Begründung

**`/aufwandsrechner`** — eine eigene Adresse, in allen vier Sprachen.

Drei Orte kamen infrage. `/leistungen` ist die längste Seite der Website; ein
Rechner hätte sie weiter beschwert, obwohl Gate 03 sie gerade entlastet hat.
Der Betriebscheck wäre thematisch richtig, liegt aber hinter fünfzehn Fragen —
ein Geschäftsführer beantwortet die nicht vorher. Bleibt eine eigene Adresse:
Ein Rechner ist ein **Werkzeug**, und `/betriebscheck` hat dieselbe Rolle
bereits. Zwei Werkzeuge unter „Werkzeuge" sind eine Rubrik; eines ist eine
Ausnahme.

**Verlinkt von dort, wo die Frage entsteht:**

| Von | Warum |
|---|---|
| Betriebscheck-Ergebnis, unter den offenen Punkten | „Was kostet einer dieser Punkte im Monat?" — **ohne Formular, ohne Lead-Gate**; die Antworten werden bewusst *nicht* weitergereicht |
| fibero-Beleg, bei „nicht belegt ist eine Zeitersparnis" | Wir haben keine Zahl — rechnen Sie mit Ihrer |
| `/leistungen`, am Kaufweg „Der Umfang entsteht zuerst" | Genau dort denkt der Leser „und was kostet das?" |

## Die Eingaben

Fünf Felder, **alle leer**. Vier Pflicht, eines optional.

| Feld | Einheit |
|---|---|
| Wie oft kommt der Vorgang im Monat vor? | im Monat |
| Wie viele Minuten kostet er heute? | Minuten |
| Wie viele Minuten blieben übrig? | Minuten |
| Was kostet eine Arbeitsstunde intern? | € je Stunde |
| Was dürfte die Lösung einmalig kosten? *(optional)* | € einmalig |

Der Stundensatz heißt ausdrücklich **interner Kostenansatz, nicht Bruttolohn**
— „wer nur den Lohn einsetzt, rechnet zu niedrig".

## Die Formel — offen auf der Seite

```
Stunden heute     = Vorgänge × Minuten heute   ÷ 60
Stunden danach    = Vorgänge × Minuten danach  ÷ 60
Unterschied in €  = (Stunden heute − Stunden danach) × Kostenansatz
Gedeckt nach      = Investition ÷ Unterschied in €
```

**Die Gegenprobe** (kaufmännisch oft nützlicher als eine Ersparnis-Zahl):
*„Damit sich der Betrag in zwölf Monaten rechnet, müsste der Vorgang monatlich
X Stunden einsparen."*

## Drei Entscheidungen, die das Modell ehrlich halten

1. **Nur Zeit × Häufigkeit × interner Kostensatz.** Keine Umsatzwirkung, keine
   Fehlerkosten — nicht weil es die nicht gäbe, sondern weil sie ohne Messung
   geraten wären. Ein Modell, das drei geratene Größen multipliziert, liefert
   eine Zahl mit drei Stellen und null Aussage.
2. **Mehraufwand wird nicht auf null geklemmt.** Wer einen höheren Restaufwand
   eingibt, sieht ein Minus — und den Satz, dass das kein Fehler des Rechners
   ist. Ein Rechner, der nur nach oben ausschlagen kann, ist eine Anzeige.
3. **Amortisation nur, wenn sie existiert.** Ohne positiven Monatseffekt gibt
   es keine Amortisationsdauer — nicht „unendlich", nicht „0", sondern gar
   keine Zeile.

## Kein vorbelegtes Ergebnis

Ein Rechner, der beim Aufruf „2.800 € im Monat" zeigt, hat diese Zahl
erfunden — auch wenn die Felder daneben als Beispiel beschriftet sind. Jeder
liest die Zahl zuerst.

Deshalb: alle Felder leer, und solange die ersten vier es sind, steht im
Ergebnis ein **Satz** statt einer Zahl. Maschinell gesichert (Regel 3.1/3.2).

## Datenschutz

| | |
|---|---|
| Speicherung | **keine** — kein `localStorage`, kein `sessionStorage` (im Browser nachgemessen) |
| URL | **keine Werte** in Query oder History (nachgemessen) |
| Messung | **kein Ereignis** mit Vorgangszahlen, Zeiten oder Kostensätzen |
| Server | **keiner** — die Rechnung läuft vollständig im Browser |
| Einwilligung | **nicht nötig**, weil nichts den Browser verlässt |
| Lead-Gate | **keins** |

## Ein Testfall aus dem automatischen Lauf

> **TEST-FIXTURE — kein Kundenergebnis.**

| | |
|---|---|
| Vorgänge / Monat | 100 |
| Minuten heute | 10 |
| Minuten danach | 5 |
| Kostensatz | 30 €/h |
| Investition | 3.000 € |
| → Stunden heute | 16,67 |
| → Differenz | 8,33 h/Monat |
| → **Differenz in €** | **250 €/Monat** |
| → Amortisation | **12 Monate** |
| → Gegenprobe | 8,33 h/Monat |

## Nachgewiesen durch

| Lauf | Umfang |
|---|---|
| `npm run wirtschaftlichkeit-drill` | **45 Prüfungen** — Normalfall, keine Ersparnis, Mehraufwand, Investition, null Vorgänge, ungültige/negative/NaN/Infinity-Eingaben, Dezimaltrennzeichen (DE/EN/arabische Ziffern), sehr große Werte, sehr kleine Ersparnis, Investition ohne Effekt |
| `npm run rechner-drill` | **76 Prüfungen** im echten Browser — 4 Sprachen × 3 Breiten, Tastaturbedienung, kein vorbelegtes Ergebnis, deutsches Komma (313 € statt 308 €), Minus bei Mehraufwand, kein NaN/Infinity, kein Querlauf auf 390 px, arabisches RTL mit `dir="ltr"` an den Zahlen, nichts in URL/Speicher, keine Konsolenfehler |

## Was diese Rechnung nicht kann

Eine Modellrechnung auf Basis der Eingaben — keine Zusage, keine Prognose.
Nicht enthalten: Einführung und Umgewöhnung, Sonderfälle, laufende
Softwarekosten und alles, was sich im Betrieb erst zeigt.

## Vertrag für künftige Kundenfälle

Öffentliche Kundenfälle: **0**, und das bleibt so, bis folgendes vorliegt:

| Pflichtfeld | Bedeutung |
|---|---|
| Art | Kundenprojekt / Kundenergebnis / eigenes Produkt (`docs/ops/proof-kinds.md`) |
| Freigabe | schriftlich, mit Person, Rolle, Form, Datum, Umfang, Fundstelle |
| Ausgangslage | der Betrieb vor dem Projekt |
| Umfang | was gebaut wurde |
| Artefakt | sicher, nach `docs/ops/demo-data-standard.md` |
| Gemessen vorher / nachher | mit benanntem Messfenster |
| Grenze | was der Fall **nicht** beweist |

**Ohne Freigabe kein Fall — auch nicht anonymisiert.** Ein interner
Betriebsbeleg ist kein Ersatz und wird auch nicht als einer geführt.
