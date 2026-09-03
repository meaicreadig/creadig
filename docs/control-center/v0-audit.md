# creaDIG Control Center · v0-Prototyp — vollständige Prüfung

> **Autorität:** Faz B · Stand 03.09.2026
> **Gelesen:** `~/Downloads/crea-dig-control-center-v0`, vollständig
> (4.565 Zeilen, 6 Routen, 16 Komponenten, ein Datenmodell).
> **Vokabular:** dasselbe wie in `current-state.md` —
> KEEP · CONNECT · MISSING SOURCE · REMOVE.
> **Nicht getan:** v0 wurde nicht gestartet. Es hat kein Lockfile-kompatibles
> Setup in diesem Repo und keine eigene Datenquelle; gelesen wurde der Code.

---

## 0 · Der eine Satz

v0 ist ein **Formentwurf mit erfundenen Zahlen**, kein halbfertiges Produkt.
Sein Wert liegt in der Anordnung — welche Frage auf welcher Fläche beantwortet
wird — nicht in einer Zeile seines Codes. Übernommen wird die Anordnung;
übernommen wird kein Datenmodell, keine Bibliothek und keine Kennzahl.

---

## 1 · Woraus v0 besteht

| Fläche | Zeilen | Quelle der Zahlen |
|--------|-------:|-------------------|
| `/` Heute | 99 + 258 (Komponenten) | `demo-data.ts` |
| `/vertrieb` + `/vertrieb/[id]` | 49 + 790 | `demo-data.ts` |
| `/marketing` | 198 + 142 | `demo-data.ts` |
| `/kunden` | 182 | `demo-data.ts` |
| `/einstellungen` | 473 | fest verdrahtet |
| Hülle (Shell, Sidebar, Topbar, Palette) | 547 | — |
| `lib/demo-data.ts` | 676 | **alles erfunden** |

**Jede** Zahl in v0 stammt aus `demo-data.ts`. Es gibt keine Abfrage, keine
Umgebungsvariable, keinen Speicher. `lastUpdated = 'Heute, 09:41'` ist eine
Zeichenkette.

---

## 2 · Die Matrix

### 2.1 · Anordnung — was übernommen wird

| v0-Fläche | Befund | Klassifikation | Warum |
|-----------|--------|----------------|-------|
| Heute = **eine** Aufmerksamkeitsliste, nach Dringlichkeit | jede Zeile führt auf ihren Datensatz | **KEEP → gebaut** | `lib/attention.ts` + `/admin` (03.09.2026). Sieben Ränge statt v0s vier, weil es hier mehr echte Quellen gibt als v0 kannte. |
| „Reihenfolge folgt der nächsten Aktion, nicht dem Eingangsdatum." | Satz erklärt die Sortierung an Ort und Stelle | **KEEP** | Übernommen als Rangbegründung im Kopf von `attention.ts`. |
| Wert `null` heisst „nicht verbunden", nicht `0` | `StatStrip` zeigt `—` mit Grund | **KEEP → gebaut** | Deckt sich mit dem Haus-Prinzip. `salesMeasured: false` sagt genau das. |
| Nebenspalte trägt Vorrat, Hauptspalte trägt Fälligkeit | | **KEEP → gebaut** | Material ist am 03.09.2026 in die Nebenspalte gerückt. |
| Lead-Detail 2/3 Verlauf, 1/3 Stammdaten | | **KEEP** | Entspricht bereits `/admin/vertrieb/anfragen/[id]`. Kein Handlungsbedarf. |

### 2.2 · Flächen ohne Quelle in diesem Haus

| v0-Fläche | Was sie zeigt | Klassifikation | Begründung |
|-----------|---------------|----------------|------------|
| `Meetings` — „Termine heute" | 3 erfundene Termine | **REMOVE** | Es gibt keinen Terminspeicher. v0 sagt selbst „Kalender-Datenquelle nicht verbunden" und zeigt trotzdem Termine. Das ist die Kulisse, die dieses Haus nicht baut. |
| `/marketing` — Funnel, Kanäle, Seitenleistung | Besuche `null`, Rest erfunden | **MISSING SOURCE** | Deckt sich mit `current-state.md`: Analytics ist hier nur schreibend. Ohne Lesezugang bleibt die ganze Fläche eine Behauptung. |
| `/marketing` — Outbound Prospecting | erfundene Zielliste | **REMOVE** | Kaltakquise ist eine der vier Geschäfts-Grundregeln — sie findet nicht statt. Eine Fläche dafür wäre falsch, nicht nur leer. |
| `/kunden` — Bestand + Kundenakte | 4 erfundene Kunden, 5 Systemzustände je Kunde | **MISSING SOURCE** | Der Gedanke ist richtig („ein Kunde wird über seine Systeme beschrieben"), aber es gibt keine Tabelle, die Betriebssysteme je Kunde führt. `Organisation` kennt Lifecycle, nicht Betrieb. |
| `Betriebscheck`-Panel — Reifegrad 0–100, fünf Ebenen | erfundener Score je Lead | **CONNECT ✅ 03.09.2026** | Der Befund IST gespeichert — als formatierter Text in `leads.message` (`checkSummary()`), und die Anfragen-Detailseite zeigt ihn. Was fehlt, ist die Struktur: Score, Engpass und Zahl der „Nicht“-Antworten stecken in einem Textblock und sind deshalb nicht sortierbar, nicht filterbar und nicht auf einen Blick lesbar. Nachgemessen 03.09.2026: längste Fassung 1.579 Zeichen gegen `LIMITS.message` = 4.000 — **nichts wird abgeschnitten**. |
| `/einstellungen` — Datenquellen, Zugriff, Systemverhalten | 473 Zeilen, alles fest verdrahtet | **REMOVE** | „Zugriff · 3 Personen" bei einem founder-led Haus mit einem Passwort ist eine Erfindung. Was echt ist (welche Quelle steht, welche nicht), steht schon in der Aufmerksamkeitsliste unter „Betrieb gestört". |
| `SystemNotes` — Systemhinweise | erfundene Meldungen | **REMOVE (Doppelung)** | Deckungsgleich mit den `betrieb`-Punkten des Materialstands, die jetzt oben in der Liste stehen. Zwei Wahrheiten über denselben Zustand. |
| `RecentActivity` — Aktivitätsverlauf über alle Leads | aus Lead-Timelines | **CONNECT (später)** | `Activity` existiert als Typ in `lib/vertrieb.ts`. Eine hausweite Ansicht ist möglich, beantwortet aber keine Frage, die heute drückt — sie zeigt Vergangenheit. Nach den Bereichen, nicht davor. |
| `command-palette` (⌘K) | springt zu Leads/Kunden | **CONNECT (später)** | Echt machbar über `listEnquiries`/`listOrganisations`. Nutzen wächst mit der Datenmenge; bei 24 Organisationen ist die Navigation schneller. |

### 2.3 · Technik — nichts davon wird übernommen

| v0 | Hier | Entscheidung |
|----|------|--------------|
| `@primer/react` + `styled-components` | Tailwind + eigene Primitive | **REMOVE.** GitHubs Designsprache ist nicht die von creaDIG, und `styled-components` bräuchte einen Registry-Umweg im RSC-Baum. |
| `@primer/octicons-react` | keine Icons im Admin | **REMOVE.** |
| Inline-`style`-Objekte | Utility-Klassen | **REMOVE.** |
| `'use client'` auf Übersichtsflächen | RSC, `force-dynamic` | **REMOVE.** v0 muss Client sein, weil es keinen Server hat. |
| `lib/demo-data.ts` | echte Speicher | **REMOVE.** Ersatzlos. |

---

## 3 · Die IA-Entscheidung

v0 schlägt fünf Bereiche vor: Heute · Vertrieb · Marketing · Kunden ·
Einstellungen. Übernommen werden **drei**, und die Reihenfolge folgt der
Quellenlage, nicht dem Prototyp:

```
Heute      — was jetzt Aufmerksamkeit braucht    ✅ gebaut 03.09.2026
Vertrieb   — Anfragen · Pipeline · Beziehungen   ✅ steht seit Vertrieb 1.0
Kunden     — Bestand · Standorte · Historie      ✅ eigener Bereich 03.09.2026
System     — Material · Betrieb · Entscheidungen ✅ steht
```

*(Nachtrag 03.09.2026: Das Kundenregister lag als Register im Vertrieb. Im
Closure Pass ist es ein eigener Bereich geworden — verschoben, nicht neu
gebaut. Begründung in `1.0-closure.md`.)*

**Marketing** und **Kunden** erscheinen nicht als leere Menüpunkte. Die
Navigation wächst mit den Quellen, nicht mit den Absichten — das ist bereits
die Regel in `navItems()`, wo „Vertrieb" nur bei vorhandenem Speicher steht.

**Einstellungen** entfällt dauerhaft. Ein Haus mit einem Passwort und einer
Umgebungsdatei braucht keine Einstellungsfläche; es braucht, dass fehlende
Konfiguration als Betriebsblocker sichtbar wird. Genau das tut sie jetzt.

---

## 4 · Was als Nächstes echten Ertrag bringt

Nach Ertrag geordnet, nicht nach Aufwand:

1. ~~**Betriebscheck-Befund strukturieren.**~~ **Erledigt 03.09.2026** —
   `check_score`, `check_bottleneck`, `check_manual_spots` an `leads`
   (Migration 006), serverseitig aus den Antworten gerechnet. Der Reifegrad
   steht in der Anfragen-Liste, der volle Befund auf der Detailseite; die
   Antworten bleiben unverändert als Beleg in der Nachricht.

   *(Korrektur 03.09.2026: Eine
   frühere Fassung dieses Dokuments behauptete, der Befund werde gar nicht
   gespeichert. Das war falsch — er steht als Text in `leads.message` und ist
   in der Anfragen-Detailseite lesbar.)*

   Was wirklich fehlt: Score, Engpass und „Nicht“-Zahl sind kein Feld,
   sondern Fliesstext. Wer eine Anfrage mit 28/100 von einer mit 82/100
   unterscheiden will, muss einen Block lesen. Drei Spalten an `leads`
   (Muster wie in `002-vertrieb.sql`: `ALTER TABLE … ADD COLUMN IF NOT
   EXISTS`), gefüllt beim Schreiben — und zwar SERVERSEITIG aus den
   Antworten über `evaluateCheck()`, nicht aus einem vom Formular
   mitgeschickten Score. Der Server besitzt die Rechnung, sonst ist der Wert
   eine Behauptung des Absenders.
2. **Aktivitätsverlauf hausweit.** `Activity` existiert; es fehlt eine Abfrage
   über alle Betreffs.
3. **Befehlspalette.** Erst sinnvoll, wenn Listen länger sind als ein Blick.

Nicht auf der Liste: Marketing-Kennzahlen. Solange Analytics nur schreibt,
wäre jede Zahl dort geraten.
