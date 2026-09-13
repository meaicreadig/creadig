# Programm-Hauptbuch

> **Maßgebliche Statusquelle.** Stand: 13.09.2026
> Production `35e1fa3` · Branch `feat/system-haus-site` @ `35e1fa3` · kein Drift

## Das Hauptbuch

| Programm | Geschäftsergebnis | BUILD | CUTOVER | LIVE | CLOSURE | Status | Nächstes Ereignis | Blocker |
|---|---|:--:|:--:|:--:|:--:|---|---|---|
| **F00** Programmwahrheit | Eine maßgebliche Sicht | 🟢 | 🟢 | 🟡 | 🔴 | `LIVE_EVOLUTION` | Erste echte Zustandsänderung im Hauptbuch geführt | — |
| **F01** Laufzeit/Daten | Sichere Systemänderung | 🟢 | 🟢 | 🟡 | 🔴 | `WAITING_CUTOVER_AUTHORITY` | Migration 014 nach Produktion | Owner-Autorität |
| **F02** Öffentliche Fläche | System-Haus sichtbar | 🟢 | 🟢 | 🟢 | 🟡 | `BLOCKED_G18` | G18-Entsperrung | G18 (`legal-page.tsx`) |
| **F03** Konversion | Richtiger Kaufweg | 🟢 | 🟢 | 🔴 | 🔴 | `WAITING_REAL_WORLD` | Ein echter Besucher durchläuft einen Einstieg | kein echtes Ereignis belegt |
| **F04** Vertrieb | Nachvollziehbarer Vorgang | 🟢 | 🟡 | 🔴 | 🔴 | `WAITING_OWNER` | Owner bestätigt, ob echte Vorgänge im System laufen | Nutzungswahrheit unbekannt |
| **F05** Lieferung | Kontrollierte Lieferung | 🟢 | 🟡 | 🔴 | 🔴 | `WAITING_OWNER` | Ein echter Lieferzyklus im System | Schattenprozess außerhalb des Systems |
| **F06** Beleg & Markt | Belegte Wirkung | 🟢 | 🟢 | 🔴 | 🔴 | `WAITING_OWNER` | Kundenfreigabe **und** erste Messprobe | Kunde · Migration · G18 |
| **F07** Marketing | Veröffentlichung wirkt zurück | 🔴 | 🔴 | 🔴 | 🔴 | `NOT_STARTED` | Owner entscheidet Umfang | kein System vorhanden |
| **F08** Finanzen | Wahre Zahlen | 🟡 | 🔴 | 🔴 | 🔴 | `BLOCKED_G18` | G18-Entsperrung | G18 (`rechnung.ts`) |
| **F09** Produkte | Wahre Reife | 🟡 | 🟡 | 🟡 | 🔴 | `WAITING_OWNER` | Sichere Aufnahmen · Reifeentscheidung | Owner-Material |
| **F10** Automatisierung | Sichere Entlastung | 🔴 | 🔴 | 🔴 | 🔴 | `NOT_STARTED` | Owner entscheidet Umfang | kein Automatisierungslauf vorhanden |
| **F11** Kapazität/Vertretung | Keine Ein-Personen-Blackbox | 🟢 | 🔴 | 🔴 | 🔴 | `WAITING_OWNER` | Zwei Owner-Tatsachen | Kapazität + Vertretung unbekannt |
| **F12** Owner-Steuerung | Firma aus dem System führbar | 🟡 | 🟡 | 🟡 | 🔴 | `LIVE_EVOLUTION` | Ein realer Arbeitszyklus aus dem Control Center | F04/F05-Lücken |

**Kein Programm ist CLOSED.** Das ist kein Rückschritt — es ist die erste
Trennung zwischen *gebaut* und *bewiesen*.

---

## Was die Prompt-Annahme korrigiert hat

| Angenommen | Tatsächlich | Quelle |
|---|---|---|
| Production = `4fd521e` | **`35e1fa3`** | Vercel-Deployment `dpl_6zdnqA3y…`, target `production`, READY |
| Branch-Spitze = `a5cad70` | **`35e1fa3`** | `git rev-parse` · `ls-remote` |
| P2 **nicht** promoted | **promoted** — `a5cad70` um 00:15, `35e1fa3` um 00:20 | Vercel `action: promote` |
| F06 Cutover offen | **F06 Cutover erledigt** | ebenda |
| Marketing OS M0–M9 vorhanden | **nicht in diesem Repository** | keine Kampagnen-/Publikations-Module, keine Admin-Fläche |

### Was ich an meiner eigenen ersten Fassung korrigiert habe

Die erste Fassung dieses Hauptbuchs war an einer Stelle falsch — und zwar
**in beide Richtungen**. Ich hatte F05 nach Aktenlage geschätzt statt nachgesehen.

| Ich hatte geschrieben | Nachgeprüft | Beleg |
|---|---|---|
| F05 BUILD 🟡 „kein Projektbetrieb im System" | **🟢 — die Kette ist vollständig gebaut**: Angebot-Entwurf → Versand → Annahme → Projekt → Material → Änderung → Abnahme → Übergabe | `lib/vertrieb.ts` (`listOffers`, `sendOffer`, `acceptOffer`, `startProject`, `addProjectChange`, `listProjects`), Schema `projects.state ∈ {aufgesetzt, laeuft, abgenommen, uebergeben}` |
| F05 CUTOVER 🔴 „keine Oberfläche" | **🟡 — die Oberfläche existiert und ist ausgeliefert**: `AngebotMappe` und `LieferungMappe` auf `/admin/vertrieb/pipeline/[id]` | `app/(admin)/admin/vertrieb/pipeline/[id]/page.tsx` |
| F05 LIVE 🟡 | **🔴 — kein echter Lieferzyklus im System.** Die Vegitat-Arbeit läuft daneben | `kette-drill` K13 |

**Warum das keine Kosmetik ist.** Ich hatte F05 als *fehlende Fähigkeit*
geführt und als nächste eigenständige Arbeit „den Projektbetrieb bauen"
vorgeschlagen. Das hätte eine zweite Lieferkette neben die vorhandene
gestellt. Die Fähigkeit fehlt nicht — die **Benutzung** fehlt. Das eine ist
Code-Arbeit und wartet auf niemanden, das andere ist eine Owner-Entscheidung
über Vegitat. Ich hätte wochenlang das Falsche gebaut.


---

## Aktive Blocker, je einer mit Eigentümer

| Blocker | Trifft | Eigentümer | Auflösung |
|---|---|---|---|
| Migration 014 nicht in Produktion | F01, F06-B | **Owner** (Autorität) | Paket liegt fertig: [`cutover-014.md`](cutover-014.md) — Befehl, Smoke-Plan, Rollback |
| Kundenfreigabe NV SWISS fehlt | F06-A | **Kunde** | Owner gibt Kontaktaufnahme frei |
| G18 — sechs fremde WIP-Dateien | F02, F06-A, F08 | **Owner** (Entsperrung) | siehe `docs/proof-operations/g18-uebergabe.md` |
| Kapazität unbekannt | F11, F05, F08 | **Owner** | eine Zahl mit Zeitraum |
| Vertretung unbekannt | F11, F12 | **Owner** | reale Person/Funktion mit Zugang |
| CASSAMEA/meahv ohne sichere Aufnahme | F06, F09 | **Owner** | Demo-Instanz nach `demo-data-standard.md` |
| AVV Vercel/Resend/Neon | F02, F08 | **Owner** | Dashboard-Abschluss + Fundstelle |
| Drei Ebenen ohne bestätigten Betrag (OD-6) | F03 | **Owner** | identity, automation, intelligence zeigen „Angebot nach Analyse“ — wahr, aber kein Preis. Eine Zahl kommt vom Owner oder gar nicht |
| Zwei Ebenen ohne zeigbaren Beleg (WEB-0001) | F03, F06 | **Owner** | identity, automation — Gate 02 |
| Kein echtes Konversionsereignis belegt | F03, F04 | **Zeit/Markt** | erster echter Lead |
| Vegitat läuft außerhalb des Systems | F05, F12 | **Owner** (Entscheidung) | ins System holen oder als externe Ausnahme führen |

---

## Wartende Ereignisse

| Ereignis | Programm | Frühestens |
|---|---|---|
| Erste Messprobe → +28 Tage bis Vergleich | F06-B | Uhr **nicht gestartet** |
| Kundenantwort NV SWISS | F06-A | nach Owner-Freigabe |
| Erster echter Lead über die Live-Seite | F03, F04 | unbestimmt |

---

## Owner-Warteschlange (5)

| # | Handlung | Warum jetzt | Schaltet frei | Zeitabhängig |
|---|---|---|---|---|
| **1** | **Migration 014 gegen Produktion freigeben** ([Paket](cutover-014.md)) | Ohne die Tabelle `measurement_samples` kann die fibero-Uhr nicht starten — jeder Tag verschiebt den ersten Wirkungsbeleg um einen Tag | F01-Closure, F06-B | **ja, startet Uhr** |
| **2** | **NV SWISS als ersten Fall bestätigen und Kontaktaufnahme freigeben** | Der erste öffentliche Kundenbeleg ist der einzige harte Blocker für Mittelstand und größer | F06-A, stärkt F03/F07 | nein |
| **3** | **G18 entsperren** | Blockiert drei Programme gleichzeitig — Barrierefreiheit auf `/datenschutz`, Finanzen, und den Veröffentlichungspfad für den ersten Kundenfall | F02, F06-A, F08 | nein |
| **4** | **Kapazität und Vertretung nennen** | Zwei Sätze, die vier Antworten liefern, die ein Mittelständler vor jedem Auftrag erwartet | F11, F05, F08, F12 | nein |
| **5** | **Entscheiden, wie Vegitat geführt wird** | Echte Kundenarbeit läuft derzeit neben dem System (Branch, Excel, Python) — genau der Schattenprozess, den F12 ausschließt | F05, F12 | nein |

---

## Nächste eigenständige Arbeit

Die erste Fassung nannte hier F05 und F12 als Bau-Lücken. **F05 war falsch** —
die Fähigkeit ist vollständig da (siehe Korrektur oben). Damit sieht die Lage
ehrlicher und unbequemer aus:

**Owner-unabhängige BUILD-Arbeit, die ein echtes Geschäftsergebnis
freischaltet, ist weitgehend erschöpft.** Was fehlt, sind Ereignisse: ein
echter Besucher, ein echter Lead, eine Kundenfreigabe, eine Owner-Tatsache,
28 Tage. Das ist kein Versäumnis — Verfassung §3 sagt ausdrücklich, dass
Warten kein Versagen ist. Es wird nur dann zum Versäumnis, wenn jemand die
Wartezeit mit Bauen füllt, das niemand bestellt hat.

Erledigt in dieser Runde, weil beides auf niemanden wartete:

| Arbeit | Warum sie ein Ergebnis schützt |
|---|---|
| **Schemastand-Gate (G36)** · `scripts/check-schemastand.mjs` | Seit dem 06.09.2026 migriert die Laufzeit nicht mehr selbst — sie kann einen Auseinanderlauf zwischen `SCHEMA[]` und den Migrationsdateien also auch nicht mehr ausgleichen. Bis heute hielt die Gleichheit **von Hand**. Jetzt hält sie ein Gate: 82 DDL-Anweisungen, beide Richtungen, und im Fehlerfall nennt es die abweichende Spalte statt nur die Tabelle. Die Kette steht auf **40** Prüfungen |
| **Cutover-Paket 014** · [`cutover-014.md`](cutover-014.md) | §5 verlangt es für jeden Status `WAITING_CUTOVER_AUTHORITY`. Es fehlte. Die Owner-Entscheidung war damit eine Recherche; jetzt ist sie eine Entscheidung — Befehl, Smoke-Plan und Rollback stehen im Klartext |

Was als Nächstes owner-unabhängig wäre, ist bewusst **nicht** begonnen: F07
(Marketing) und F10 (Automatisierung) stehen auf `NOT_STARTED`, weil ihr
**Umfang** eine Owner-Entscheidung ist. Sie ohne Auftrag zu bauen hieße, sich
den Auftrag selbst zu erteilen — und genau das trennt Arbeit von
Beschäftigung.
