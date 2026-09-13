# Closure-Belege

> Nur was für einen Closure-Vertrag zählt. Keine Bau-Chronik.
> Erhoben am 12.09.2026 · nachgeprüft und erweitert am 13.09.2026 (kein Drift)

## Deployment-Belege

| Frage | Beleg | Datum |
|---|---|---|
| Was läuft auf creadig.de? | Vercel `dpl_6zdnqA3y1HdoMUEwr6JSwBkLCvLy`, `target: production`, `state: READY`, Commit `35e1fa3` | 12.09.2026 |
| Stimmt Branch = Produktion? | `git rev-parse HEAD` = `ls-remote origin` = Deployment-SHA = `35e1fa3` | 13.09.2026 |
| Wurde P2 promoted? | `dpl_8GDzRXmz…` (`a5cad70`, `action: promote`) und `dpl_6zdnqA3y…` (`35e1fa3`, `action: promote`) | 12.09.2026 |
| Läuft die Seite? | `/`, `/leistungen`, `/produkte/fibero`, `/arbeiten`, `/aufwandsrechner`, `/kontakt`, `/termin` → alle 200 | 12.09.2026 |
| Rollback möglich? | `dpl_6zdnqA3y…` und `dpl_8GDzRXmz…` tragen `isRollbackCandidate: true` | 12.09.2026 |

## Code-Belege (Fähigkeit, nicht Wirkung)

| Fähigkeit | Beleg |
|---|---|
| Laufzeit migriert **nicht** | `lib/neon-client.ts` `ready()` prüft nur; der Unfall vom 06.09.2026 (Migration 007 ungefragt in Produktion) ist dort dokumentiert und behoben |
| Postbuild-Prüfungen grün | `npm run postbuild` am 13.09.2026 — **40 × OK, 0 × FEHL**, Exit 0. Sieben Owner-Punkte gemeldet, alle im Hauptbuch als Blocker geführt |
| Laufzeit und Migrationen beschreiben dieselbe DB | **Schemastand-Gate (G36)** — 82 DDL-Anweisungen beidseitig deckungsgleich, 15 Tabellen. Das Gate wurde gegen künstlichen Drift in **beiden** Richtungen geprüft und fiel beide Male (Exit 1) |
| Lieferkette trägt | `npm run kette-drill` — K13: Projekt vollständig lieferbar und abnehmbar; gesperrt ist allein die Rechnung, wegen des offenen Umsatzsteuer-Status |
| Freigabe-Logik | `lib/proof.ts` — fünf Umfänge, Form→Umfang-Matrix, Bedarf aus dem Inhalt abgeleitet |
| Beleg-Betrieb | `lib/beleg-betrieb.ts` + `/admin/beleg`; Reihenfolge nach P2: Markt-Beleg vor Eigenmessung |
| Messmodell | `lib/messreihe.ts` — 28 Tage, 20 Fälle, gleiche Quelle, sonst `nicht-vergleichbar` |
| Angriffstests | `npm run beleg-drill` — 116 Prüfungen |

## Live-Belege

| Frage | Stand |
|---|---|
| Echter Besucher auf einem Kaufweg | **kein Beleg** |
| Echter Lead im System | **unbekannt** — aus dieser Umgebung kein Lesezugriff auf die Produktionsdatenbank |
| Echter Vertriebszyklus mit einer Kennung | **kein Beleg** |
| Echte Lieferung im System | **kein Beleg** — Vegitat läuft auf Branch `claude/pensive-bardeen-arw5v6` mit Excel und Python, außerhalb des Betriebs |
| Echte Messprobe fibero | **0** — Tabelle `measurement_samples` liegt nicht in Produktion. Ob Migration 013 dort steht, ist aus dieser Umgebung **nicht feststellbar**; `db-migrate --check` beantwortet es gefahrlos |
| Öffentlicher Kundenbeleg | **0** — `approvedCaseStudies.length === 0`, `/arbeiten` steht auf `noindex, follow` |

## Business-Belege

| Frage | Stand |
|---|---|
| Echte Kundenarbeit vorhanden? | **ja** — Vegitat (Finanzboard Zürich/Luzern), belegt durch zwei Commits auf `claude/pensive-bardeen-arw5v6` |
| Diese Arbeit im System geführt? | **nein** |
| Rechnung, Zahlung, Abnahme belegt? | **nein** |
| Marktbeleg öffentlich? | **nein** |

## Was ausdrücklich nicht belegt ist

Der Unterschied zu allen früheren Berichten: Diese Zeile ist jetzt Teil des
Status. Gebaut ist viel. **Live bewiesen ist bisher: dass die öffentliche
Seite läuft.** Alles andere wartet auf ein echtes Ereignis oder eine
Owner-Tatsache.
