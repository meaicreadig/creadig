# fibero — Messplan

> **Proof Operations P1 · 11.09.2026**

## 1 · Was es gibt und was es nie geben wird

| | |
|---|---|
| **Historischer Vorher-Stand** | **existiert nicht — und kann nicht mehr entstehen** |
| Struktureller Beleg | vorhanden, öffentlich (9 Aussagen mit Fundstelle) |
| Sichere Aufnahme | vorhanden, freigegeben |
| Ausgangsstand *mit* fibero | **ab 11.09.2026 erhebbar** |
| Wert danach | frühestens 28 Tage später |

**Nachgesehen, nicht angenommen** (11.09.2026, fibero-Repository):
`lib/db/schema.ts` führt keine Aufwands-, Zeit- oder Schrittzahl aus der Zeit
davor. `work_objects.timeline` beginnt mit dem Datensatz, `audit_log` mit dem
System. `duration_s` gehört zum Routen-Zwischenspeicher.

**Der Zustand vor einem System lässt sich nicht nachträglich messen, sobald
das System läuft.** Das ist keine Lücke, die ein Lauf schließen könnte.

## 2 · Die fünf Kennzahlen

| Schlüssel | Art | Einheit | Quelle | Was gezählt wird |
|---|---|---|---|---|
| `fibero-durchlauf` | Aufwand | Tage | Systemzählung | Median von `timeline.created` bis `completed` |
| `fibero-ungeprueft` | Rückstand | % | Systemzählung | Anteil `reviewStatus = open` am Stichtag |
| `fibero-handeingabe` | Rückstand | % | Systemzählung | Anteil `sourceType = manual` |
| `fibero-belegautomatik` | Rückstand | % | Systemzählung | Anteil Belege ohne Postfach-Abgleich |
| `fibero-bearbeitungszeit` | Aufwand | Minuten | **Handaufschrieb** | Zeit am Vorgang bis zum geprüften Fakt |

Vier hängen an Feldern, die das System **heute schon führt** — sie sind auch
rückwirkend *innerhalb* von fibero ableitbar. Die fünfte verlangt, dass jemand
mitschreibt, und ist deshalb ausdrücklich als Handaufschrieb gekennzeichnet.

Jede Kennzahl trägt außerdem, **was nicht mitzählt** — Abbrüche ohne Abschluss,
Objekte jünger als sieben Tage, Kassenbons ohne Mailbeleg. Ohne diese Spalte
entsteht beim zweiten Mal eine andere Zahl.

## 3 · Was später gesagt werden darf

| Erlaubt, sobald zwei vergleichbare Proben vorliegen | Nie erlaubt |
|---|---|
| „Der Anteil ungeprüfter Fakten ist von X auf Y gefallen." | „Vor fibero dauerte es …" |
| „Die Handeingabe ist von X % auf Y % zurückgegangen." | „fibero spart X Stunden." |
| „Von Version A zu B: Durchlauf von X auf Y Tagen." | „X % effizienter" ohne beide Werte |

Die strukturellen Zahlen aus Phase 3 — **3** Datenherkünfte, **8**
Faktenfelder, **2** Prüfstände — bleiben struktureller Beleg und werden nie
mit einer Leistungszahl in dieselbe Tabelle geschrieben.

## 4 · Die erste Handlung

```bash
npm run messprobe -- --kennzahl fibero-ungeprueft --seite ausgang \
  --wert <zahl> --faelle <anzahl> --quelle system-zaehlung \
  --von "Emin" --schreiben
```

Sie dauert Minuten. Danach müssen **28 Tage** vergehen, bevor ein Vergleich
überhaupt etwas sagen darf — jeder Tag Verzögerung hängt eins zu eins hinten
dran. Deshalb steht sie im Beleg-Cockpit an erster Stelle, obwohl sie zwei
Schritte von öffentlich entfernt ist.
