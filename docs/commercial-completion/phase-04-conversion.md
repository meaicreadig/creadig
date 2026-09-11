# Phase 4 — Conversion Completion

**Stand:** 11.09.2026 · **Baseline:** `f808344`

## Die Frage

Nicht mehr *„versteht man creaDIG?"* — sondern: **Wie wenig unnötige Arbeit
muss jemand leisten, der interessiert ist?**

## 1 · Zwei Gespräche, zwei Lasten

Vorher verlangten beide Wege **dieselben acht Felder**. Ein kostenloses
Zwanzig-Minuten-Gespräch war damit genauso schwer zu bekommen wie ein
Systemgespräch, aus dem ein Festpreis entsteht.

Die Prüffrage je Feld war die aus Gate 07 („trägt es eine Entscheidung?"):

| Feld | 20 Min | 45 Min | Warum |
|---|---|---|---|
| Name | **Pflicht** | **Pflicht** | ohne Namen kein Gespräch |
| E-Mail | **Pflicht** | **Pflicht** | Eingangsbestätigung geht per E-Mail |
| Einwilligung | **Pflicht** | **Pflicht** | Art. 6 Abs. 1 lit. a DSGVO |
| Betrieb | optional | **Pflicht** | vor einem Erstgespräch trägt der Firmenname nichts; für die Angebotsreife eines Systemprojekts schon (`qualification-canon.md` §8) |
| Telefon | optional | optional | Gate 07 |
| Interesse | optional | optional | routet das Gespräch, ein Auswahlfeld |
| Sprache | optional | optional | |
| Notiz | optional | optional | |
| **Ort** | **entfällt** | optional | spielt bei einem Videogespräch keine Rolle |
| **Größe** | **entfällt** | optional | Qualifizierung; ändert an einer Erstberatung nichts |
| 5 Treiber | **entfällt** | optional | seit Gate 06 nur auf dem Systemweg |

**Gemessen im Browser** (`npm run konversion-drill`):

| | Felder | Pflicht |
|---|---:|---:|
| Kurzes Erstgespräch | **6** | **2** + Einwilligung |
| Systemgespräch | **13** | **3** + Einwilligung |

Was auf dem kurzen Weg nie gefragt wurde, erscheint auch **nicht als Strich
in der Zusammenfassung** und nicht in der WhatsApp-Nachricht — dieselbe Regel,
die Gate 06 für die fünf Treiber gesetzt hat: Ein nie gestelltes Feld liest
der Vertrieb sonst als verweigerte Antwort.

## 2 · Die 95 Prozent sind weg

```
vorher:   const progress = step === 5 ? 100 : [0, 25, 50, 75, 95][step]
```

Auf Schritt 4 — der letzten Maske, in der nur noch abgeschickt wird — zeigte
die Leiste **95 %**. Das ist keine Messung, sondern „fast geschafft, jetzt
nicht abbrechen". Zweimal falsch: Vier von vier Schritten sind nicht 95 %, und
eine Prozentzahl ohne Bezugsgröße beschreibt nichts.

```
jetzt:    SCHRITT 1 VON 4 → SCHRITT 2 VON 4 → SCHRITT 3 VON 4 → SCHRITT 4 VON 4
```

Die Leiste füllt sich mit `aktuellerSchritt / 4`. Maschinell gesichert: der
Probelauf schlägt fehl, sobald wieder ein `%` erscheint.

## 3 · Die Einwilligung ist jetzt auch im Markup Pflicht

Sie wurde in `validateForm()` geprüft und vom Server verlangt — trug aber kein
`required`. Für einen Screenreader war sie ein beliebiges Häkchen unter zwei
Pflichtfeldern. Betrifft Terminassistent und Produkt-Interesse.

## 4 · Die Kontaktseite hatte kein Systemgespräch

Der schwerste Befund dieser Phase, und er war eine Lücke, kein Fehler:
`/kontakt` bot „Termin vereinbaren" an und führte auf `/termin` — also in den
**kurzen** Weg. Das Systemgespräch kam im Fließtext als Nebensatz vor. Wer ein
Betriebsproblem hatte, landete zuverlässig in der falschen Erwartung.

**Vorher:** drei gleich große Kacheln (Projekt besprechen · Termin vereinbaren ·
Produkte ansehen) plus WhatsApp- und E-Mail-Kachel plus eine zweite
Termin-Kachel weiter unten. **Sechs gleichrangige Wege, davon zwei identisch.**

**Jetzt zwei Ränge:**

| Rang | Wege |
|---|---|
| **Gespräch** | Kurzes Erstgespräch (20 Min) → `/termin` · Systemgespräch (45 Min) → `/termin?art=systemgespraech` |
| **Ohne Termin** | Betriebscheck · Aufwandsrechner · Projekt besprechen · Produkte ansehen — als Zeile, nicht als Kacheln |

Die doppelte Termin-Kachel im unteren Block ist gegangen; dort stehen jetzt nur
noch die zwei Wege, die **ohne** Termin auskommen (WhatsApp, E-Mail).
„Drei Wege" heißt dort folgerichtig „Zwei Wege, ohne Termin" — in allen vier
Sprachen.

## 5 · Was unverändert blieb — und warum

| | |
|---|---|
| **Produkt-Interesse** | Bereits schlank: E-Mail, Name, Einwilligung. Kein Konto-, Kauf- oder Testzugangs-Versprechen für Produkte im Aufbau — maschinell geprüft |
| **Einwilligungstext** | `LEGAL_FACT` aus Phase 1. Er nennt Verarbeiter, Drittlandübermittlung, Rechtsgrundlage und Widerruf; kürzen wäre eine juristische Entscheidung |
| **Betriebscheck / Aufwandsrechner** | Kein Pflichtfeld vor der Nutzung — geprüft |
| **Zeitzone** | Regressionssperre: keine feste Abkürzung (MEZ/CET) auf der Terminseite |
| **Kein echter Versand** | Der Probelauf klickt nie auf Senden |

## Nachgewiesen durch

`npm run konversion-drill` — **22 Prüfungen** im echten Browser: Feld- und
Pflichtzählung beider Wege, Obergrenze für den kurzen Weg, Einwilligung auf
beiden, Fortschritt ohne Prozent, Zeitzone, Produkt-Interesse je Reifegrad,
kein Lead-Gate vor den Werkzeugen, Kontakt-Hierarchie mit beiden Gesprächen.
