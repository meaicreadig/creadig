# Proof Operations

Der Betrieb hinter dem Beleg. Nicht die Frage, ob die Website gut ist —
sondern wie aus realer Arbeit ein belastbarer, freigegebener, messbarer
Beweis wird.

| Dokument | Inhalt |
|---|---|
| [Beleg-Kanon](./proof-canon.md) | Sechs Zustände, fünf Belegarten, sieben Pflichtfragen, wo was liegt |
| [Mess-Kanon](./measurement-canon.md) | Ausgang gegen Danach, vier Quellen, die drei Weigerungen |
| [Freigabe-Kanon](./release-canon.md) | Die Kette, die granulare Erlaubnis, die Grenze zur Website |
| [fibero-Messplan](./fibero-messplan.md) | Warum es keinen Vorher-Stand gibt und was stattdessen beginnt |
| [Owner-Warteschlange](./owner-queue.md) | Acht Handlungen, nach Wirkung sortiert |
| [G18-Übergabe](./g18-uebergabe.md) | Was dort hängt und ab wann es blockiert |

**Cockpit:** `/admin/beleg` — beantwortet *„Was ist heute die wirksamste
nächste Handlung?"* mit genau einer Antwort.

**Erfassen:** `npm run messprobe -- …` (ohne `--schreiben` wird nichts
geschrieben).

**Gesichert durch:**

| Lauf | Umfang |
|---|---|
| `scripts/beleg-drill.mjs` | 116 Prüfungen — Freigabe, Messung, Material, Owner-Wahrheit, Ende-zu-Ende mit erfundenen Daten |
| `scripts/check-beleg-betrieb.mjs` | 8 Regeln am gebauten HTML — die Grenze zwischen innen und öffentlich |

## Der Stand heute

| | |
|---|---|
| Freigegebene Kundenfälle | **0** |
| fibero historischer Vorher-Stand | **existiert nicht** |
| fibero Messreihe | **definiert, 5 Kennzahlen, 0 Proben** |
| Gesperrte Produktaufnahmen | **2** (CASSAMEA, meahv) |
| Offene Owner-Tatsachen | **6** |

Das ist kein Versagen des Codes. Es ist die ehrliche Lage — und sie ist jetzt
zum ersten Mal an einer Stelle sichtbar, mit einem Adressaten je Zeile.
