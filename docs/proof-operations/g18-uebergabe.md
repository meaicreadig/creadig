# G18 — Übergabe

> **Proof Operations P1 · 11.09.2026** · Dieser Lauf hat G18 **nicht** berührt
> und ist **nicht** der Entsperr-Lauf.

## Die sechs gesperrten Dateien

| Datei | SHA-256 (unverändert) |
|---|---|
| `components/legal/legal-page.tsx` | `fed8b145…` |
| `components/sections/packages.tsx` | `519f89ba…` |
| `lib/material-status.ts` | `efe3695d…` |
| `lib/rechnung.ts` | `d0a6a063…` |
| `lib/site-data.ts` | `43c6f528…` |
| `scripts/rechnung-drill.mjs` | `dc3bdab1…` |

Alle sechs sind byte-identisch zum Laufbeginn und ungestaged.

## Was sie heute öffentlich verursachen

| Datei | Öffentliche Folge | Schwere |
|---|---|---|
| `components/legal/legal-page.tsx` | `/datenschutz` trägt **genau eine** Überschrift; alle Abschnittstitel sind Absätze. Auf der längsten Rechtsseite der Website hat ein Screenreader-Nutzer keine Struktur | **Echter Barrierefreiheits-Mangel** |
| `components/sections/packages.tsx` | `/leistungen` trägt daraus 487 Wörter und 4.404 px mobile Höhe — 30 % bzw. 25 % der Seite. Website-Phase 5 konnte die Seite nur um das kürzen, was ihr gehört | Längenschuld, nicht falsch |

## Welche Owner-Tatsachen dort noch hängen

| | |
|---|---|
| `lib/site-data.ts` · `processors[].dpaConfirmed` | Die drei AVV-Bestätigungen. `lib/owner-wahrheit.ts` führt sie **daneben**, ohne die gesperrte Datei zu ändern — sobald sie entsperrt ist, sollten beide zusammengeführt werden |
| `lib/site-data.ts` · `releases[]` | Die Kundenfreigaben. Ein Eintrag dort ist der einzige Weg, einen Fall öffentlich zu machen |
| `lib/material-status.ts` | Der Materialstand unter `/admin/material`. Der Beleg-Betrieb liegt bewusst **daneben** unter `/admin/beleg`, nicht darin |

## Hängt das Beleg-Programm davon ab?

**Zum Betrieb: nein.** Messreihe, Asset-Sicherheit, Owner-Wahrheit, Cockpit und
alle Sicherungen laufen ohne Entsperrung.

**Zur Veröffentlichung eines Kundenfalls: ja.** Die Freigabe muss in
`releases[]` in `lib/site-data.ts` eingetragen werden — und diese Datei ist
gesperrt. **Sobald die erste Kundenfreigabe vorliegt, ist die G18-Entsperrung
kein Nebenthema mehr, sondern der Blocker.**

## Kein neuer Master-Prompt

Dieser Lauf erzeugt keinen G18-Auftrag. Was ein solcher Lauf zu klären hätte,
steht oben.
