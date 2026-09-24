# G18 · Ein Entscheidungspaket, eine Sitzung

> **Stand 24.09.2026** · Für den Owner. Kein Diff-Rauschen, keine Geheimnisse.
> Lesezeit ~5 Minuten, danach ist G18 entschieden.

## Worum es geht

Sechs Dateien tragen seit Wochen nicht committete Änderungen. Sie sind seither
gesperrt (G18) — kein Programm durfte sie anfassen. Dadurch hängen inzwischen
mehrere Abschlussarbeiten daran, unter anderem die öffentliche Freigabe-Brücke
und die Profillinks.

**Die Untersuchung dieser Sitzung ergibt: Die sechs Änderungen sind nicht sechs
Baustellen. Sie sind EINE Arbeit**, die an sechs Stellen dasselbe durchzieht:

> Der Steuerstatus ist eine **Entscheidung**, kein gesetztes Feld.

## Was die Arbeit tut

Vorher galt: Steht eine USt-IdNr. da, wird mit 19 % gerechnet. Steht
`smallBusiness`, greift § 19. Ob der Status überhaupt **freigegeben** war
(`taxStatusPending`), hat die Rechnung nicht gelesen.

Zwei Folgen, beide gemessen:

1. Eine Rechnung wäre stellbar gewesen, **während das Impressum noch schrieb,
   der Steuerstatus sei nicht freigegeben**.
2. Standen beide Angaben da — USt-IdNr. **und** Kleinunternehmer —, wurde das
   still zu „Kleinunternehmer" aufgelöst. Die Rechnung wäre mit dem
   § 19-Hinweis rausgegangen, obwohl eine USt-IdNr. hinterlegt ist.

Die Änderung macht daraus eine Bedingung an einer Stelle
(`steuerstatusFreigegeben()` / `steuerstatusWiderspruch()` in `lib/site-data.ts`)
und lässt alle anderen Stellen **dort fragen**, statt die Regel nachzubauen.

## Die sechs Dateien

| Datei | Was die Änderung tut | Empfehlung |
|---|---|---|
| `lib/site-data.ts` | Trägt die Regel: freigegeben **und** eindeutig; benennt den Widerspruch im Klartext | **KEEP** |
| `lib/rechnung.ts` | Fragt zuerst die Freigabe, dann die Art; gibt den Widerspruchsgrund mit aus | **KEEP** |
| `components/legal/legal-page.tsx` | Impressum zeigt die Steuerzeile nur bei freigegebenem Status, sonst „noch nicht freigegeben" | **KEEP** |
| `components/sections/packages.tsx` | Die Preiszeile fragt das Gate statt des Feldes — kein Preis beruft sich auf eine Entscheidung, die es nicht gibt | **KEEP** |
| `lib/material-status.ts` | Der Materialstand hakt den Punkt nicht mehr ab, während die Rechnung gesperrt ist (dieselbe Bedingung) | **KEEP** |
| `scripts/rechnung-drill.mjs` | Prüft genau diese Fälle: pending trotz Status, beide Angaben nebeneinander, Sperre mit Grund | **KEEP** |

**Kein Teilstück ist ohne die anderen sinnvoll.** `PARTIAL` wäre hier der
gefährlichste Ausgang: Eine Datei, die die alte Regel behält, während die
anderen die neue fragen, ergibt genau den Widerspruch, den die Arbeit behebt.

## Ist sie sicher?

Am 24.09.2026 mit dem WIP im Baum gemessen:

* `npm run build` **grün**, inklusive aller Gates (`check-rechnung`,
  `check-commercial-truth`, `check-angebotssystem`, …)
* `rechnung-drill` **grün**, inklusive der neuen Fälle
* Keine Änderung an Owner-Tatsachen: Die Arbeit **setzt keinen** Steuerstatus,
  keine Rechtsform, keine USt-IdNr. Sie sorgt nur dafür, dass ein nicht
  freigegebener Status auch nicht wie eine Entscheidung wirkt.

## Was passiert, wenn …

| Entscheidung | Folge |
|---|---|
| **KEEP** (empfohlen) | Die sechs Dateien werden committet, G18 fällt. Danach laufen sofort weiter: die Freigabe-Brücke zur öffentlichen Seite (B‑1) und die Profillinks (B‑2). Am Verhalten der Website ändert sich nichts, solange die Owner-Tatsachen offen sind — die Seite sagt dann weiter „Status noch nicht freigegeben". |
| **DISCARD** | Die Arbeit ist weg. Der Zustand von vorher kehrt zurück: Eine Rechnung wäre trotz offener Freigabe stellbar, und zwei widersprüchliche Angaben würden still aufgelöst. Beides ist ein Rechtsrisiko, kein Schönheitsfehler. |
| **PARTIAL** | Nicht empfohlen (siehe oben). |
| **Nichts entscheiden** | G18 bleibt gesperrt, B‑1 und B‑2 bleiben liegen, und die sechs Dateien bleiben ein unkommittierter Zustand, den jeder nächste Lauf umgehen muss. |

## Zwei Dinge, die KEEP **nicht** entscheidet

Sie bleiben danach offen und gehören in die Owner-Tatsachen (`corporate-truth.md`):

1. **Welcher Steuerstatus gilt** (USt-IdNr. oder § 19) — und ab wann.
2. **Wer der Vertragspartner ist** (Einzelunternehmen oder creaDIG solutions UG).

Die Arbeit hier sorgt nur dafür, dass beide Fragen **sichtbar offen** bleiben,
statt von einem gesetzten Feld beantwortet zu werden.

---

**Die Entscheidung in einem Satz:**
„G18 KEEP" → ich committe die sechs Dateien als eine Arbeit und mache mit den
beiden Brücken weiter. „G18 DISCARD" → ich verwerfe sie und halte den alten
Stand fest, inklusive des benannten Risikos.
