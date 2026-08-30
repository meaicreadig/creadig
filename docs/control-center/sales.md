# Control Center · Sales (G.3)

> **Authority:** Spec · MP-G.3 · Stand 30.08.2026
> **Status: NICHT ausgeliefert.** `/admin/leads` existiert nicht — bewusst.
> Was existiert: das Modell, der Lesepfad, die Mutationen und die
> Doppel-Erkennung, geprüft gegen den Entwicklungs-Adapter.

---

## Warum keine Oberfläche

MP-G.3 §1 setzt vor jeden produktiven Bau eine Bedingung. Geprüft:

| Kriterium | Stand |
|---|---|
| Lead Store vorhanden | ✅ Abstraktion + Adapter-Vertrag |
| **Produktionsfähiger Adapter** | ❌ nur `memory`, ausdrücklich Entwicklung |
| `memory` nicht in Produktion aktiv | ✅ wird abgelehnt und gemeldet |
| Lead **vor** der Zustellung gespeichert | ✅ |
| Reference gespeichert | ✅ |
| API-Validierung unverändert | ✅ (Regressionstest unten) |
| Consent/Privacy unverändert | ✅ — der Datenschutzsatz für die Speicherung fehlt noch |
| **Reale Lead-Daten lesbar** | ❌ es gibt keinen realen Speicher |

Zwei Kriterien fehlen, beide aus demselben Grund: **Der Owner hat den
Anbieter noch nicht gewählt** (`docs/ops/lead-store.md`).

§1 sagt für diesen Fall: STOP, nur Adapter- und Lesefunktionen fertigstellen,
keine Fake-Daten für die Oberfläche. Genau das ist passiert.

Eine Lead-Liste ohne Leads wäre die leere Theaterkulisse, die MP-G §5 und §42
verbieten — und §45 definiert G.3 ohnehin erst dann als abgeschlossen, wenn
ein **real gespeicherter** Lead die Kette Website → API → Speicher → Liste →
Detail durchläuft. Das ist heute unmöglich, nicht schwierig.

---

## Sales State Machine

```
NEW → CONTACTED → QUALIFIED → DISCOVERY → AUDIT → PROPOSAL → NEGOTIATION → WON
                                                                            
        └──────────────── LOST (aus jedem aktiven Zustand) ────────────────┘
```

| Zustand | DE |
|---|---|
| `new` | Neu |
| `contacted` | Kontaktiert |
| `qualified` | Qualifiziert |
| `discovery` | Discovery |
| `audit` | Audit |
| `proposal` | Angebot |
| `negotiation` | Verhandlung |
| `won` | Gewonnen |
| `lost` | Verloren |

`won` und `lost` sind Endzustände (`TERMINAL_STATES`) — eine Rückkehr ist
möglich, aber eine bewusste Handlung, kein Versehen. **Kein Datensatz wird je
gelöscht**; `lost` ist ein Zustand, keine Entfernung.

**Diese Zustände sind Sales-Wahrheit.** Nie für Delivery (Onboarding, Build,
Go-Live) und nie für den Kunden-Lebenszyklus (Active, Managed, Paused). Drei
Maschinen, drei Felder — `docs/ops/crm-schema.md`.

**Kein automatisches `qualified`.** Ein eingegangenes Formular ist eine
Anfrage, keine Qualifikation. Auch ein hoher Betriebscheck-Score qualifiziert
nicht: Der Score gehört dem Besucher und beschreibt seinen Betrieb, nicht
seine Kaufabsicht.

---

## Datenmodell

`LeadRecord` in `lib/lead-store.ts` — die Felder aus `crm-schema.md`, ergänzt
um das, was G.3 operativ braucht:

| Neu in G.3 | Wofür |
|---|---|
| `submissionKey` | HMAC des Absende-Tokens — der Schlüssel gegen Doppeleinträge |
| `salesStatus` | die Maschine oben |
| `nextAction`, `nextActionAt` | der nächste Schritt und wann |
| `lostReason` | Freitext, nur bei `lost` |
| `updatedAt` | wann zuletzt angefasst |

### Bewusst NICHT im Modell

| Feld | Grund |
|---|---|
| `owner` | Es gibt einen Nutzer. Ein Zuweisungsfeld ohne zweite Person ist eine Auswahlliste mit einem Eintrag (§19). |
| `potentialValue` | Eine Zahl, die niemand bestätigt hat, ist eine Schätzung — und sieht drei Monate später wie eine Pipeline aus (§20). |
| `score` | Siehe oben: keine Sales-Qualifikation aus dem Betriebscheck (§15). |

Beide kommen, wenn es sie operativ braucht. Ein Feld für eine hübschere
Oberfläche ist kein Grund.

---

## Lesepfad und Mutationen

Der Adapter-Vertrag hat **sechs** Methoden. Ausserhalb von `lib/lead-store.ts`
greift nichts auf den Speicher zu — es gibt keinen zweiten Datenpfad.

```ts
save(record)
findBySubmissionKey(key)
getById(id)
list({ search, status, source, locale, limit, offset })
updateSalesStatus(id, status, lostReason)
updateNextAction(id, action, at)
```

**Abfragen gehören in den Adapter, nicht in die Oberfläche.** `list()` nimmt
Suche, Filter und Seitenausschnitt entgegen und liefert `{ rows, total }` —
damit ist die Architektur nicht darauf festgelegt, alle Leads zu laden und im
Browser zu filtern (§7). Standardsortierung: `createdAt` absteigend.

### Fehlerverhalten — zwei verschiedene Regeln

| Richtung | Verhalten | Warum |
|---|---|---|
| **Schreiben** (`storeLead`) | schluckt jeden Fehler, meldet intern | Ein Speicherfehler darf niemals eine Besucher-Anfrage kosten |
| **Lesen** (`listLeads`, `getLead`) | **wirft** `LeadStoreUnavailable` | Eine leere Liste würde „keine Leads" behaupten, wo „Datenbank nicht erreichbar" gilt (§33) |

Das ist der wichtigste Unterschied in diesem Modul. Beide Regeln folgen
derselben Frage: *Wer sieht das Ergebnis, und was schliesst er daraus?*

---

## Doppel-Absenden

### Der Fall

Er entsteht durch unseren eigenen Ablauf:

```
Lead gespeichert  →  Zustellung schlägt fehl  →  502  →
Absender sieht Fehler  →  schickt erneut  →  zweiter Datensatz
```

### Was NICHT geht: Deduplizierung über die E-Mail-Adresse

Zwei echte Anfragen derselben Person — heute über das Kontaktformular,
nächste Woche über den Termin-Assistenten — würden verschwinden. Das wäre ein
**stiller** Datenverlust, um einen **sichtbaren** zu vermeiden. Der stille ist
der schlimmere.

### Was gewählt wurde: der Fingerabdruck des Absende-Tokens

Das Formular holt sein Token beim Aufbau **einmal** und benutzt es für alle
Versuche desselben Absendens — auch für den zweiten Klick nach einer
Fehlermeldung (`lib/use-lead.ts`). Ein neues Formular, ein Neuladen, eine
andere Seite: neues Token.

Damit trennt das Token genau das, was getrennt gehört:

| Vorgang | Token | Ergebnis |
|---|---|---|
| Zweiter Klick nach Fehler | dasselbe | **erkannt** → ein Datensatz |
| Neue Anfrage nach Neuladen | neues | zwei Datensätze, korrekt |
| Zwei Formulare derselben Person | verschiedene | zwei Datensätze, korrekt |

Gespeichert wird **nicht das Token**, sondern sein HMAC
(`formTokenFingerprint` in `lib/lead-guard.ts`): Der Speicher soll kein
wiederverwendbares Geheimnis enthalten.

### Was beim Wiedererkennen passiert

Der Vorgang behält `id`, `reference`, `createdAt` und seinen Sales-Zustand;
Inhalt und `updatedAt` werden aktualisiert. Wer nach einer Fehlermeldung eine
Zeile korrigiert und erneut sendet, verliert die Korrektur nicht.

**Die Vorgangsnummer wird vor dem Schreiben nachgeschlagen**, nicht erst
danach: Sonst stünde in der zweiten Bestätigungsmail eine andere Nummer als
im Speicher.

### Grenze

Ohne Speicher gibt es nichts nachzuschlagen — dann verhält sich die Route wie
vor MP-G und ein Doppel-Absenden erzeugt wie bisher zwei Mails. Das ist der
heutige Zustand.

---

## Persisted ≠ Delivered

Seit MP-G wird **vor** dem Zustellversuch gespeichert. Damit gibt es einen
Zustand, den es vorher nicht gab:

> Der Lead ist festgehalten, aber niemand hat ihn gesehen.

**Die HTTP-Antwort bleibt 502.** Bewusst, aus drei Gründen:

1. Der Absender erwartet, dass jemand seine Anfrage liest. „Angekommen" zu
   antworten, wenn sie nur in einer Datenbank liegt, die niemand ansieht,
   wäre die Sorte Halbwahrheit, die dieses Repo an anderen Stellen entfernt.
2. Solange es kein Control Center mit Lead-Liste gibt, ist die Mail der
   einzige Weg, auf dem eine Anfrage bemerkt wird.
3. Die Abnahme aus `docs/ops/conversion-acceptance.md` prüft dieses Verhalten.
   Es zu ändern, ohne die Kette neu abzunehmen, wäre eine unbelegte Änderung.

**Wann sich das ändern darf:** sobald `/admin/leads` existiert und der Owner
dort tatsächlich hineinsieht. Dann ist ein Zustellfehler eine interne
Störung, keine verlorene Anfrage — und `200` mit interner Warnung wird die
ehrlichere Antwort. Der Alarm trägt seit MP-G die Vorgangsnummer, damit der
Lead dann auffindbar ist.

**Nicht vorher ändern.**

---

## Was geprüft ist

Gegen den Entwicklungs-Adapter, direkt gegen das Modul (kompiliert und
ausgeführt, nicht simuliert):

| # | Prüfpunkt | Ergebnis |
|---|---|---|
| 1 | Anlegen | ✅ `created` |
| 2 | Doppel-Absenden erkannt | ✅ `updated`, Vorgangsnummer bleibt, Inhalt aktualisiert, **ein** Datensatz |
| 3 | Zweite echte Anfrage derselben Person | ✅ bleibt erhalten (keine Dedupe über E-Mail) |
| 4 | Liste, Sortierung, Suche | ✅ neueste zuerst · Suche über Betrieb **und** Vorgangsnummer |
| 5 | Filter Status / Herkunft | ✅ inklusive leerem Ergebnis |
| 6 | Statuswechsel + Lost-Grund | ✅ Grund nur bei `lost`, fällt beim Wechsel weg |
| 7 | Nächste Aktion setzen und löschen | ✅ |
| 8 | Seitenausschnitt | ✅ `{ rows, total }` |
| 9 | Unbekannte ID | ✅ `null` bzw. `false` — kein stiller Erfolg |
| 10 | Ohne Speicher | ✅ Lesen wirft, Schreiben überspringt |

**10 von 10.**

### Dabei gefunden und behoben

Der Entwicklungs-Adapter gab die gespeicherte Zeile **selbst** zurück statt
einer Kopie. Zwei Lesevorgänge lieferten dasselbe Objekt; eine spätere
Änderung war rückwirkend auch im zuerst gelesenen Wert sichtbar. Ein echter
Datenbank-Adapter kann das gar nicht — wer gegen den Entwicklungs-Adapter
baut, hätte sich an ein Verhalten gewöhnt, das später fehlt. Schlimmer:
Aufrufer hätten den Speicher ändern können, ohne zu speichern.

### Regression

| | |
|---|---|
| Lead-API ohne `LEAD_STORE` | ✅ unverändert: `token_invalid` (zu schnell / kaputt) · `privacy_required` · `invalid [name, message, email, phone]` · Honeypot `{ok:true}` · vollständig → `502/send_failed` · **nichts gespeichert** |
| `tsc` · `eslint` · `build` | ✅ |
| `npm run a11y` | ✅ 112 / 112 |

---

## Vorbereitet für Today (G.2)

Aus `listLeads()` sind ohne weitere Felder ableitbar:

- neue Leads eines Zeitraums (`status: "new"` + `createdAt`)
- Leads je Zustand (`status`)
- Leads mit fälliger nächster Aktion (`nextActionAt <= heute`)
- Leads **ohne** nächste Aktion (`nextAction === null`) — der eigentlich
  interessante Wert: was liegen bleibt

**Keine KPI-Karten gebaut** (§24): Datenfunktionen vorbereiten, Dashboard
nicht aufblasen.

---

## Offene Owner-Entscheidungen

| # | Entscheidung | Blockiert |
|---|---|---|
| 1 | **Speicher-Anbieter** (Empfehlung: Vercel-Postgres, `docs/ops/lead-store.md`) | alles Weitere |
| 2 | AVV + Verarbeiterliste | 1 |
| 3 | Datenschutzsatz + Löschfrist | 1 |
| 4 | `LEAD_STORE` setzen | 1–3 |

Danach: Adapter (eine Datei, sechs Methoden), dann `/admin/leads` und
`/admin/leads/[id]` — Liste, Suche, Filter, Detail, Betriebscheck-Ergebnis,
Statuswechsel, nächste Aktion.

---

## Bewusst nicht gebaut

Kanban (§37) · Notizen (§40) · Audit-Log (§39 — Spec siehe unten) · Owner-
Zuweisung · Potenzialwert · Sales-KPI-Karten · alles aus G.4.

### Audit-Log — Spec, nicht gebaut

Sobald mehr als eine Person Zustände ändert, braucht es eine Änderungsspur:
`actor · action · entity · entityId · timestamp · before · after`. Bei einem
Nutzer, der jede Änderung selbst auslöst, protokolliert sie nur, was er
gerade getan hat. Kein Event-Sourcing — eine Tabelle, wenn die zweite Person
kommt.
