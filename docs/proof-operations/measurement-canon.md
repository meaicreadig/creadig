# Mess-Kanon

> **Authority:** Kanon · Proof Operations P1 · 11.09.2026

## 1 · Die Definition steht vor der ersten Messung

Sonst wählt man hinterher die Definition, unter der die Zahl am besten
aussieht. Eine Kennzahl (`lib/messreihe.ts`) trägt deshalb **vorher**:

was gezählt wird · Einheit · Quelle · was **nicht** mitzählt · wer misst · ab wann.

## 2 · Ausgang und Danach — nicht „vorher"

| Seite | Bedeutung |
|---|---|
| `ausgang` | Der Stand zu Beginn der Beobachtung |
| `danach` | Der Stand nach einer Veränderung |

**`ausgang` heißt ausdrücklich nicht `vorher`.** Für ein laufendes System gibt
es kein Vorher mehr; was heute erhoben wird, ist der Stand *mit* dem System.
Er trägt Vergleiche wie „Version A gegen B" oder „Handgriff gegen Automatik" —
und nie „vor dem System".

## 3 · Vier Quellen, drei davon tragen

`system-zaehlung` · `handaufschrieb` · `zeitmessung` tragen eine öffentliche
Zahl. **`schaetzung` trägt nichts** — sie existiert im Modell nur, damit eine
Schätzung als Schätzung erfasst werden kann, statt sich als Zählung zu tarnen.

## 4 · Die drei Weigerungen

Der Vergleich fällt **kein** Urteil, wenn:

1. nur eine Seite existiert — ein Ausgangswert allein ist kein Fortschritt;
2. Quelle oder Methode sich unterscheiden — zwei Messungen sind kein Vergleich;
3. weniger als **28 Tage** Abstand oder weniger als **20 Fälle** je Seite
   vorliegen — das ist ein Zufall, kein Effekt.

Ergebnis ist dann `nicht-vergleichbar` mit dem Grund im Klartext. Nicht `0`,
nicht „unverändert".

## 5 · Weniger ist nicht immer besser

| Art | Weniger ist besser? |
|---|---|
| `aufwand` | ja |
| `fehler` | ja |
| `rueckstand` | ja |
| `menge` | **nein** — eine Veränderung ist Kontext, keine Verbesserung |

Weniger Vorgänge sind weder gut noch schlecht. Das Modell weigert sich, daraus
eine Verbesserung zu rechnen.

## 6 · Prozent nur mit Basis

Ein Prozentwert entsteht nur, wo weniger besser ist, der Ausgangswert größer
als null ist **und** der Vergleich trägt. Sonst `null`.

## 7 · Der Verlauf ist die einzige Ausnahme

Hausregel: nicht speichern, was sich ableiten lässt. Ein Verlauf lässt sich
nicht ableiten — der Wert von vorletztem Monat ist fort, sobald ihn niemand
aufgeschrieben hat.

`measurement_samples` (Migration 014) speichert deshalb Proben, aber **keinen
Trend, kein Prozent, keine Verbesserung**. Das Urteil fällt aus den Werten und
den Regeln. Eine gespeicherte Trendzahl wäre Automationstheater.

## 8 · Eine Probe, ein Tag, eine Seite

`(metric_key, side, measured_on)` ist eindeutig. Überschrieben wird nie: Wer
sich vermessen hat, misst an einem anderen Tag noch einmal — die falsche Zahl
bleibt sichtbar und damit erklärbar.

## 9 · Erfassen

```bash
npm run messprobe -- --kennzahl <key> --seite ausgang|danach \
  --wert <zahl> --faelle <anzahl> --quelle system-zaehlung \
  --von "<Name>" [--am YYYY-MM-DD] [--notiz "…"] --schreiben
```

Ohne `--schreiben` rechnet der Befehl nur vor. Das ist die Voreinstellung.
