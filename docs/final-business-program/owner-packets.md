# Owner-Handlungspakete

> Fünf Pakete, mehr nicht (§36). Jedes ist so geschnitten, dass es **in einer
> Sitzung ausführbar** ist. Keine Seite davon ist eine Strategie — jede ist
> eine Handlung.
>
> **Nichts hiervon wird ohne den Owner ausgeführt.** Kein Anruf, keine
> Nachricht, kein Versand, keine Produktionsänderung (§55, §56).

---

## 1 · MARKTKONTAKT — der erste Growth Block

`MARKET EVENT` · wartet auf **niemanden außer 90 Minuten**

Dies ist das **eine Ereignis**, das creaDIG heute am weitesten bewegt (§37).
Begründung: Es braucht keinen Steuerberater, keine Kundenantwort, keine
G18-Entscheidung und keinen Code. Es ist das einzige offene Ereignis, das
vollständig in der Hand des Owners liegt.

**Wo die Liste bereits liegt — es muss keine gebaut werden:**
`/admin/vertrieb/beziehungen` · sortiert fällige Beziehungspflege zuerst,
zeigt Beziehungsgrad, letzte Berührung, nächsten Schritt und Chance.
Bestand: 24 Organisationen, 16 mit Ort.

**Auswahl (§62):** fünf Kontakte nach Beziehungsstärke und natürlicher
Ansprechbarkeit — **nicht** nach Firmengröße. Der Owner wählt; hier stehen
bewusst keine Namen.

**Ziel:** lernen, nicht verkaufen (§13, §63).

**Einstieg — ein Satz:**
> „Ich melde mich ohne Anlass — ich wollte hören, wie es bei Ihnen gerade
> läuft und was sich seit unserer Zusammenarbeit verändert hat."

**Drei Fragen, mehr nicht (§57):**
1. Was läuft heute noch von Hand, obwohl es das nicht müsste?
2. Wo müssen Sie selbst eingreifen, damit etwas nicht liegen bleibt?
3. Was wird abends aus dem Gedächtnis rekonstruiert?

**Nach dem Gespräch eintragen** — in `/admin/vertrieb/beziehungen/[id]`:
- die Worte des Kunden, möglichst wörtlich (§64)
- bestätigtes Problem **oder** „keines genannt"
- nächster Schritt **mit Datum** — oder ausdrücklich „kein Anlass" (§6)

**Chance nur durch menschliche Entscheidung** — das System erzeugt keine (§B03).

**Was es freischaltet:** B01, B02 (erste Belege je Hypothese), B08, und
möglicherweise B06 — die Freigabe-Frage entsteht oft im Gespräch, nicht davor.

---

## 2 · OWNER-TATSACHE — Rechtsperson und Steuerstatus

`OWNER FACT` · `FINANCE EVENT` · eine E-Mail an den Steuerberater

**Warum jetzt:** Die Kette liefert vollständig und bricht an genau einer
Stelle — der Rechnung (`kette-drill` K13). Ein heute gewonnener Auftrag
könnte **nicht korrekt fakturiert werden**. Gleichzeitig steht auf dem
Live-Impressum „Umsatzsteuer-Status noch nicht freigegeben".

**Die exakten Fragen (§60) — nicht „bitte Steuerliches klären":**

1. Welche Rechtsperson schließt heute neue creaDIG-Kundenverträge?
   (Öffentlich steht „Einzelunternehmen · creaDIG — Muhammed Emin Akyol".)
2. Gilt für diese Rechtsperson die Kleinunternehmerregelung nach § 19 UStG,
   oder wird Umsatzsteuer ausgewiesen — und ab wann?
3. Falls ausgewiesen: wie lautet die USt-IdNr. nach § 27 a UStG?

**Wo die Antwort hingehört:** `imprintDetails` in `lib/site-data.ts`
→ **G18-gesperrt**, siehe Paket 3.

**Was es freischaltet:** B05 (Fakturierung), B00 (ein Platzhalter weniger),
und damit die letzte gesperrte Station der Kette.

---

## 3 · ENTSCHEIDUNG — G18 freigeben oder bewusst offen lassen

`TECHNICAL BLOCKER` · blockiert P0-Vertrauensarbeit

**Was G18 heute festhält** — sechs fremde WIP-Dateien, unverändert seit
Wochen, Hashes geprüft:

| Datei | Was darin geschäftlich hängt |
|---|---|
| `lib/site-data.ts` | Impressum, Rechtsform, Rufnummer, Social-Profile → **B00** |
| `lib/rechnung.ts` | Fakturierung → **B05** |
| `components/legal/legal-page.tsx` | Rechtsflächen → **B00** |
| `components/sections/packages.tsx`, `lib/material-status.ts`, `scripts/rechnung-drill.mjs` | Angebots- und Statusflächen |

**Die Entscheidung ist binär und gehört dem Owner:**

- **A · Freigeben** — dann können Steuerstatus, deutsche Rufnummer und
  Rechtsform eingetragen werden, sobald Paket 2 beantwortet ist.
- **B · Gesperrt lassen** — dann bleiben B00 und B05 auf `BLOCKED_G18`, und
  das ist ein **bewusster Zustand**, kein Versäumnis.

Ohne ausdrückliche Freigabe wird an diesen Dateien nichts geändert,
formatiert, gestaged oder umbenannt. Nicht drum herum gehackt.

---

## 4 · FREIGABE — erster öffentlicher Kundenbeleg

`PROOF EVENT` · wartet danach auf den **Kunden**, nicht auf uns

**Warum jetzt:** `/arbeiten` sagt heute öffentlich, dass kein Kunde genannt
werden darf. Ab etwa 10.000 € fragt jeder Käufer „Für wen haben Sie das schon
gemacht?".

**Kandidaten im Bestand:** NV SWISS · maqam · Bir Damla Hayır
(Owner-bestätigt 29.08.2026). Der Owner wählt **einen**.

**Was zuerst geklärt sein muss — vor jeder Nachricht:**
- Welche echte Arbeit liegt vor, und welcher Beleg existiert dafür?
- Welches Material ist **sicher** zeigbar? (Demo-Daten-Standard:
  „Verpixeln reicht nicht.")

**Die Freigabe bleibt körnig (§24, §B06).** Gefragt wird einzeln nach:
Name · Logo · Fallbeschreibung · Screenshot · Kennzahl · Zitat.
Keine Ableitung: Eine Zusage zum Namen ist **keine** Zusage zum Logo.

**Nicht als erstes fragen:** um ein Testimonial (§63).

**Wo die Antwort hingehört:** Freigabe-Umfänge nach `lib/proof.ts`;
`deckung()` entscheidet danach, was öffentlich darf.

---

## 5 · ZEIT STARTEN — Migration 014 und die erste Messprobe

`TIME EVENT` · **startet eine 28-Tage-Uhr**

**Warum jetzt und nicht später:** Jeder Tag Verzögerung verschiebt den ersten
messbaren Wirkungsbeleg um einen Tag. Für fibero existiert **kein**
historischer Vorher-Stand, und er wird nicht geschätzt — der einzige Weg ist,
ab jetzt zu messen.

**Das vollständige Paket liegt bereits vor:**
[`docs/final-live-completion/cutover-014.md`](../final-live-completion/cutover-014.md)
— Befehl, Smoke-Plan, Rollback im Klartext.

**Wichtig:** Es wird **keine Anwendung ausgeliefert.** Der Code läuft seit
dem 12.09. in Produktion; es fehlt allein die Tabelle. Additiv, idempotent,
kein Datenverlust möglich.

**Danach — die erste echte Probe (§59):**
- Kennzahl: eine der fünf aus `lib/fibero-messung.ts`
- Wert: aus dem laufenden Betrieb, **nicht geschätzt**
- Seite: `ausgang` (nie „vorher" — den gibt es nicht)
- Eingabe: `npm run messprobe` — **ohne** `--schreiben` prüft es nur
- Folge: die Uhr läuft ab der **ersten angenommenen Probe**, nicht ab dem
  Migrationsdatum

**Produktionsänderung braucht eine frische Zustimmung in der laufenden
Runde (§55).** Dieses Paket ist Vorbereitung, keine Erlaubnis.
