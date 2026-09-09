# creaDIG · Rechnung, Zahlung und die Kette

> **Authority:** Kanon · Gate 18 + Gate 20 · 09.09.2026
> Schliesst Etappe V (Abschluss, Geld & Lieferung) ab. Baut auf
> `offer-canon.md` (G17) und der Lieferung aus G19.
> Ausführbar in `lib/rechnung.ts`, geprüft mit `npm run rechnung-drill`
> (40 Prüfungen) und `npm run kette-drill` (27 Prüfungen).

---

## 1 · Die Lücke, die G18 geschlossen hat

Im Graphen stand G17 und G19, aber nicht G18. Die Master-Architektur sagt zu
diesem Gate einen Satz, der wie eine Randnotiz aussieht und keiner ist:

> „Eine Rechnung wird gebraucht, sobald der erste Abschluss steht — nicht ein
> Quartal später."

Gebaut war davon nichts. Kein Rechnungscode im ganzen Repository — das Haus
konnte ein Angebot schreiben und ein Projekt liefern, aber kein Geld
verlangen.

---

## 2 · Vier Sätze, die ein Betrieb sich sonst erzählt

### „Die Rechnung ist raus, also ist sie bezahlt."

**Es gibt keine Spalte `bezahlt`.** Der Zahlungsstand fällt aus den erfassten
Eingängen — dieselbe Entscheidung wie bei der Einordnung in G10, der Freigabe
in G13 und dem Livetermin in G19.

Bei Geld ist der Preis einer gespeicherten Ableitung höher als anderswo: Sie
fällt nicht beim Testen auf, sondern beim Steuerberater.

`payments` ist deshalb eine **Tabelle**, keine Spalte. Ein Eingang hat einen
eigenen Betrag, ein eigenes Wertstellungsdatum und einen eigenen **Beleg**
(`evidence NOT NULL`) — dieselbe Fundstellenpflicht wie bei der Person in G11
und der Freigabe in G13. Ein Haken ohne Kontoauszugszeile ist eine Erinnerung,
und Erinnerungen gehören nicht in eine Buchhaltung.

### „Da kam noch nichts."

Kein erfasster Eingang heisst **`offen`**, nicht „0 € eingegangen". Der Satz
der Oberfläche sagt es wörtlich: *Das heisst nicht „nichts bezahlt" — es
heisst, dass niemand nachgesehen hat.*

Unbekannt ist nicht null.

### „Das ist doch dieselbe Rechnung, ich ändere sie eben."

Der Kunde hat das Dokument. Wird es hier geändert, gibt es zwei Fassungen
derselben Nummer — und die im Ordner des Kunden gewinnt jede Diskussion.
Korrektur heisst **Storno und neue Rechnung**; beide bleiben in der Akte.

Ein Storno mit bereits eingegangenem Geld warnt ausdrücklich: Er hebt die
Forderung auf, **nicht den Geldeingang**. Die Rückzahlung ist ein eigener
Vorgang.

### „Überzahlt ist doch bezahlt."

Ist es nicht. Wer zu viel überweist, bekommt Geld zurück — das ist ein
Vorgang, keine Rundung. **`ueberzahlt` ist ein eigener Zustand.** Ein System,
das Überzahlung als „bezahlt" führt, verliert das Geld eines Kunden im
Rauschen.

---

## 3 · Die Sperre, die dieses Gate trägt

Der Kanon nennt die Grenze selbst: *„hängt am Umsatzsteuer-Status
(G04-Owner-Schuld)".*

Eine Rechnung **muss** sich festlegen: entweder weist sie Umsatzsteuer aus,
oder sie trägt den Hinweis nach § 19 UStG. Ein Drittes gibt es nicht. Solange
`imprintDetails.taxStatusPending` steht, weiss das Haus nicht, welches von
beiden gilt — und `stellbarkeit()` lässt deshalb keine Rechnung **stellen**.

**Entwürfe bleiben erlaubt.** Die Sperre steht genau an der Stelle, an der ein
Dokument nach draussen ginge, und nirgends sonst. Das ist der Unterschied
zwischen einer Sperre und einer Blockade.

Der Steuerstatus wird nicht abgetippt: `steuerlage()` liest `imprintDetails` —
dieselbe Quelle, aus der seit G04 die Preiszeile ihre Formulierung wählt. Zwei
Quellen für denselben Status wären zwei Wahrheiten, und die falsche stünde auf
der Rechnung.

**Keine Rechtsberatung.** Was als Pflichtangabe geführt wird, ist die Liste,
die § 14 UStG nennt. Ob sie im Einzelfall vollständig ist, entscheidet ein
Steuerberater.

---

## 4 · Was raus ist, rechnet sich nicht neu

`tax_snapshot` friert die Steuerlage beim Stellen ein. Setzt der Owner später
`smallBusiness`, ändert das nichts an einer Rechnung, die der Kunde bereits im
Ordner hat — dieselbe Überlegung wie `offers.sent_snapshot` in G17.

Eine Rechnung, die sich rückwirkend neu berechnet, ist kein Beleg.

---

## 5 · Cent, keine Kommazahl

`0.1 + 0.2` ist in JavaScript nicht `0.3`. Bei einer Anzeige fällt das
niemandem auf; bei 3.900 € mit drei Positionen fällt es dem Kunden auf, und
dann steht Aussage gegen Aussage. Jeder Betrag ist eine ganze Zahl in Cent.

---

## 6 · Überfällig wird angezeigt, nicht gemahnt

Es gibt keine Mahnstufe und keinen Automatismus. Eine Mahnung ist eine
Ansprache an einen Menschen, mit dem eine Geschäftsbeziehung läuft — dieselbe
Grenze wie das Kontakttor in G11: **Das System bereitet vor, der Mensch
entscheidet.**

Das Fälligkeitsdatum wird **gerechnet** (`gestelltAm + zahlungszielTage`), nie
eingetragen — dieselbe Entscheidung wie beim Livetermin in G19.

---

## 7 · Gate 20 · Die Lücke lag zwischen zwei Gates

G17 prüft das Angebot. G18 prüft die Rechnung. G19 prüft die Lieferung. Jedes
davon prüft **sich**. Gate 20 fragt, ob sie zusammen eine Kette sind:

```
Anfrage → Vorgang → Angebot → Ja → Rechnung → Geld
                           └→ Projekt → Abnahme → Übergabe → Beleg-Frage
```

**Eine Lücke zwischen zwei Gates liegt in keinem von beiden.** Kein
Einzel-Probelauf findet sie, weil keiner für sie zuständig ist.

Und genau so eine war da. Auf der Paketzeile steht seit langem:

> „50 % bei Start, 50 % bei Ihrer Freigabe."

G19 hat den Satz in seinem **eigenen** Kopfkommentar benannt — *„eine Zahlung,
die an der Abnahme hängt"* — und konnte ihn nicht bauen, weil es G18 damals
nicht gab. G18 hat die Rechnung gebaut und wusste nichts von Projekten. Beide
für sich richtig, das Versprechen dazwischen wirkungslos.

`ZAHLUNGSPLAN` und `raten()` machen es ausführbar:

| Rate | Anteil | Auslöser | Fällig, wenn |
|---|---|---|---|
| Start | 50 % | `aufgesetzt` | das Projekt existiert |
| Freigabe | 50 % | `abgenommen` | die Abnahme steht |

**Der Plan steht in `lib/rechnung.ts`, nicht in `lib/lieferung.ts`**, weil er
von Geld handelt. Er **liest** den Projektzustand, er ändert ihn nicht: Die
Lieferung bleibt die Wahrheit über den Fortschritt, die Rechnung die über das
Geld. Keines leitet das andere ab.

**Nur für das Website-Paket.** Der Satz steht genau einmal auf der Seite, an
genau einem Paket. Ihn auf Prüfung, Behebung, Systemprojekt oder Betrieb
auszudehnen hiesse, ein Versprechen zu erfinden, das nie jemand gegeben hat —
`raten()` gibt dort `null` zurück. Ein erfundener Plan wäre schlechter als
keiner.

**Die Rundung ist keine Nebensache.** Bei ungeradem Cent-Betrag trägt die
letzte Rate den Rest. Sonst fehlt am Ende ein Cent, und ein fehlender Cent ist
eine offene Forderung, die niemand versteht.

---

## 8 · Was die Kette nicht tut

Geprüft an den **Gelenken**, nicht an den Gates:

- Ein Ja ohne Person und Fundstelle trägt nicht — und ohne tragendes Ja gibt
  es kein Projekt.
- Projekt und Rechnung hängen am **selben** Angebot. Der Umfang wird nicht
  zweimal getippt; wer ihn abtippt, hat in vier Wochen zwei Umfänge, und der
  Kunde hat den anderen.
- Eine vollständige Zahlung **bewegt das Projekt nicht**.
- Eine Abnahme **erzeugt keinen Geldeingang**.
- Eine Abnahme erzeugt **keine Freigabe** — die Barriere aus G19 steht:
  `lib/lieferung.ts` importiert `lib/proof` nicht.
- Über die ganze Kette entsteht **genau ein** Vorgang: der, den ein Mensch
  angelegt hat.

---

## 9 · Der schärfste Befund

**creaDIG kann heute ein Projekt vollständig liefern und abnehmen lassen — und
dafür keine Rechnung stellen.**

Die Sperre ist richtig und steht an der einen Stelle, an der ein Dokument nach
draussen ginge. Aufgehoben wird sie **nicht mit Code**, sondern mit dem
Umsatzsteuer-Status. Das ist die G04-Owner-Schuld an der Stelle, an der sie
zum ersten Mal wirklich weh tut.

---

## 10 · Grenzen

G20 beweist **nicht**, dass ein echter Kunde diese Kette durchlaufen hat. Der
Gate-Vertrag verlangt „ein Projekt vollständig, mit einem echten Kunden"; das
ist Owner-Wahrheit und steht aus. Bewiesen ist, dass die Kette **trägt** — an
einem vollständig durchgespielten Vorgang gegen eine echte Datenbank, mit
allen Sperren scharf.

Nicht bewiesen: dass jemand bezahlt hat, dass ein Projekt abgenommen wurde,
dass Geld geflossen ist. Kein Beleg dieser Art existiert, und keiner wird
behauptet.
