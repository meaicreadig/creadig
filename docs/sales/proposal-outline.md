# creaDIG · Angebot — Inhaltsschema

> **Authority:** Spec · MP-D · Stand 29.08.2026
> **Scope:** Nur das Schema. Ein Kundenportal, in dem Angebote liegen, ist
> MP-F und hat dort ein eigenes Build-Gate — hier geht es darum, was drinsteht.

---

## Die Regel über allem

**Das Angebot wiederholt, was der Kunde gesagt hat, bevor es sagt, was wir
bauen.** Wer mit seiner eigenen Leistung anfängt, hat das Gespräch nicht
gebraucht.

Und: **Jede Zahl im Angebot steht in `docs/sales/offers.md` oder ist vom
Owner freigegeben.** Keine „ca."-Zahl, kein Korridor, kein Platzhalter, der
nachher zur Zahl wird.

---

## Aufbau

### 01 · Ausgangslage — in den Worten des Kunden

Zwei bis fünf Sätze, wörtlich aus dem Erstgespräch. Namen der Werkzeuge, die
genannt wurden. Der Dienstag aus Discovery-Frage 1.

*Prüfung:* Würde der Kunde diesen Absatz unterschreiben, ohne etwas zu
korrigieren? Wenn nein, war das Gespräch zu kurz.

### 02 · Was wir daraus verstanden haben

Die Verdichtung: Wo bricht es, und warum kostet das. Hier steht der
Engpass-Satz — dieselbe Logik wie im Betriebscheck (`Ebene X trägt nicht,
darum kostet jeder Schritt in Ebene Y mehr`).

Keine Schuldzuweisung. Ein Betrieb, der gewachsen ist, hat gute Gründe für
jedes Werkzeug, das er hat.

### 03 · Was wir bauen

Der Umfang, in Bausteinen. Jeder Baustein hat:
- was er ist (ein Satz, ohne Fachwort)
- was danach anders ist (ein Satz, messbar oder sichtbar)

**Abgrenzung gehört hierhin, nicht in die Fußnote:** Was ausdrücklich NICHT
Teil des Umfangs ist. Ein Angebot ohne diesen Absatz erzeugt die Nachforderung,
die es vermeiden sollte.

### 04 · Architektur

So viel, wie öffentlich sein darf, und so wenig, wie nötig: Welche Systeme
sprechen miteinander, wo liegen die Daten, was ersetzt was. Ein Bild, wenn es
hilft. Kein Tech-Stack als Imponierliste.

### 05 · Zeit

Abschnitte mit Zwischenständen, nicht ein Datum am Ende. Nach jedem Abschnitt
sieht der Kunde etwas — das ist die Zusage, keine Höflichkeit.

Was der Kunde liefern muss und bis wann, steht hier. Ein Angebot, das die
Mitwirkung nicht benennt, verschiebt später die Schuld für die Verspätung.

### 06 · Preis

Festpreis für den definierten Umfang. Eine Zahl, netto, mit Zahlungsschritten.
Herkunft: `docs/sales/offers.md`.

Steht daneben eine monatliche Zahl (Betrieb), dann getrennt und deutlich —
einmalig und laufend werden nie addiert dargestellt.

### 07 · Betrieb danach

Was nach dem Livegang passiert, und von wem. Das ist der Absatz, der creaDIG
von einer Agentur unterscheidet — er fehlt in keinem Angebot, auch nicht in
einem, das nur einen Auftritt enthält.

Wenn der Kunde den Betrieb nicht will: steht auch das drin, samt der Folge
(dann liegt die Verantwortung bei ihm, und was das praktisch heißt).

### 08 · Was wir nicht versprechen

Kurz, konkret, ohne Rechtssprache. Beispiele: keine Ranking-Garantie, kein
„barrierefrei" aus einem automatisierten Lauf, keine Verantwortung für Systeme
Dritter.

*Warum das drinsteht:* Prinzip 07 und Grundregel 2. Ein Angebot, das nichts
ausschließt, hat alles versprochen.

### 09 · Nächster Schritt

Genau einer. Mit Datum.

---

## Formales

| Punkt | Regel |
|---|---|
| Referenz | Die Lead-Referenz `CD-YYMMDD-####` steht auf jedem Angebot — dieselbe Nummer wie in der Eingangsbestätigung |
| Gültigkeit | Ein Datum. Ohne Verknappungssprache („nur noch heute") |
| Sprache | Die Sprache des Gesprächs. TR-Angebot ist eine Fassung, keine Übersetzung |
| Umfang | Wenn es länger als sechs Seiten wird, fehlt eine Entscheidung — nicht eine Seite |

---

## Was hier bewusst NICHT steht

- Ein Vertragstext oder AGB-Entwurf — Rechtsberatung ist nichts, was hier
  entsteht (Grundregel 1)
- Ein PDF-Generator oder Portal-Flow — MP-F, mit Build-Gate
- Musterpreise — `offers.md` ist die einzige Quelle
