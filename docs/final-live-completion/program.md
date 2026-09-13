# creaDIG 1.0 — Final Live Completion Program

> **Verfassung.** Sie ersetzt die Kette aus Gate- und Phase-Prompts.
> Ab hier lautet die einzige Ausführungsanweisung: **CONTINUE FINAL PROGRAM**.

## 1 · Der Lebenszyklus

Jedes Programm durchläuft vier Stufen. **Nur CLOSURE schließt ein Programm.**

| Stufe | Bedeutung | Was sie **nicht** beweist |
|---|---|---|
| **BUILD** | Die Fähigkeit existiert | dass sie im echten Betrieb wirkt |
| **CUTOVER** | Sie ist im echten Betrieb maßgeblich | dass sie benutzt wird |
| **LIVE EVOLUTION** | Sie wird mit echten Menschen, Daten und Zeit benutzt | dass das versprochene Ergebnis eintrat |
| **CLOSURE** | Das versprochene Geschäftsergebnis ist mit Live-Beleg eingetreten | — |

**Preview ist kein Cutover. Ein Push ist kein Cutover. Ein grüner Test ist kein Live-Beleg. Ein Owner-Blocker schließt nichts.**

## 2 · Erlaubte Zustände

`NOT_STARTED` · `BUILDING` · `BUILD_READY` · `WAITING_CUTOVER_AUTHORITY` ·
`CUTOVER_IN_PROGRESS` · `LIVE_EVOLUTION` · `WAITING_OWNER` ·
`WAITING_CUSTOMER` · `WAITING_REAL_WORLD` · `WAITING_TIME` ·
`BLOCKED_EXTERNAL` · `BLOCKED_G18` · `CLOSURE_REVIEW` · `CLOSED`

„PASS" allein ist kein Programmstatus. **PHASE PASS = CLOSURE PASS.**

## 3 · Warten ist kein Versagen

Kundenfreigaben, 28-Tage-Intervalle, echte Lieferzeiträume, Rechnungsläufe
brauchen Zeit. Ein Programm darf Wochen in `WAITING_*` stehen. **Es wird nicht
grün gemacht, weil anderswo gearbeitet wurde.**

## 4 · Beleg-Klassen

| Klasse | Beispiel | Reicht für Closure? |
|---|---|---|
| **CODE** | Commit, Test, Schema, Route | nur wo das Programm keine Live-Wirkung verspricht |
| **DEPLOYMENT** | Production-SHA, Migrationsstand, Laufzeit | nein, allein |
| **LIVE** | echtes Ereignis, echter Datensatz, echter Nutzer | ja, wo verlangt |
| **BUSINESS** | Verkauf, Lieferung, Freigabe, Messung, Rechnung, Veröffentlichung | ja, wo verlangt |

## 5 · Produktionsautorität

Diese Verfassung **autorisiert keine Produktionsänderung.** Deploy, Promote,
DB-Schreiben, Migration und echter Versand brauchen jeweils eine frische
Owner-Zustimmung in der laufenden Runde.

Fehlt sie bei fertigem Cutover: `WAITING_CUTOVER_AUTHORITY` —
mit Commit, Änderungen, Migration, Smoke-Plan und Rollback im Klartext.

## 6 · Die Closure-Verträge

| # | Programm | Geschäftsergebnis | CLOSURE verlangt |
|---|---|---|---|
| **F00** | Programmwahrheit | Eine maßgebliche Sicht auf Gebautes, Lebendes und Offenes | Alle Altprogramme abgebildet · kein widersprüchlicher Status · Production-Identität bekannt · jeder Blocker hat genau einen Eigentümer |
| **F01** | Laufzeit / Daten / Produktion | Das System lässt sich sicher ändern, ohne Daten oder Produktionswahrheit zu verlieren | Production-Identität belegt · kein Laufzeit-Migrationspfad · Schemastand ohne Drift · Rollback verstanden · kritische Pfade live geprüft |
| **F02** | Öffentliche Fläche | Das System-Haus zeigt sich konsistent in vier Sprachen und auf jedem Gerät | Live · 4-Sprachen-Parität · mobil und RTL nutzbar · kein material owner-unabhängiger Blocker · kein interner Status öffentlich |
| **F03** | Kommerzielle Umwandlung | Ein echter Interessent versteht, was er kauft, und geht den richtigen Weg | **Ein echtes** Konversionsereignis hat den vorgesehenen Weg durchlaufen und ist korrekt gelandet |
| **F04** | Vertriebsbetrieb | Ein echter Lead wird zu einem nachvollziehbaren kommerziellen Vorgang | **Ein echter Zyklus mit derselben Kennung**: Anfrage → Qualifizierung → Chance → Angebot → Ausgang (WON *oder* LOST) |
| **F05** | Lieferung & Betrieb | Ein gewonnener Kunde wird kontrolliert geliefert, abgenommen, übergeben | **Ein echter Lieferzyklus** mit Abnahme, Übergabe, Beleg- und Finanzanschluss |
| **F06** | Beleg & Markt-Beweis | Echte Arbeit wird gemessen, freigegeben, sicher öffentlich | **Beides**: ein öffentlicher Kundenbeleg **und** ein interner gemessener Beleg (≥28 Tage, vergleichbare Methode) |
| **F07** | Marketing | Inhalt entsteht, wird freigegeben, veröffentlicht und wirkt zurück ins Geschäft | **Eine echte Veröffentlichung** über den Betrieb, mit Beleg, und die korrekte Behandlung einer echten Reaktion |
| **F08** | Finanzen | Preis, Rechnung, Steuerlage und Sicht sind wahr — ohne juristisches Raten | G18 aufgelöst oder nachweislich nicht blockierend · Steuerlage bekannt · **ein echter Rechnungslebenszyklus** |
| **F09** | Produktportfolio | Jedes Produkt hat wahre Reife, sichere Darstellung, klare Entscheidung | Jedes Produkt entweder für seine Reife geschlossen **oder** förmlich pausiert, mit Grund und ohne stärkere öffentliche Aussage |
| **F10** | Automatisierung & Intelligenz | Wiederkehrende Arbeit läuft sicher automatisch; Intelligenz verbessert eine menschliche Entscheidung | **Eine echte** sichere Automatisierung **und** eine echte Empfehlung, die ein Mensch bewusst befolgt oder verwirft |
| **F11** | Kapazität / Vertretung | creaDIG ist keine undurchsichtige Ein-Personen-Abhängigkeit | Kapazitäts- und Vertretungswahrheit bekannt · **eine echte Übergabe- oder Abwesenheitsübung** |
| **F12** | Owner-Steuerung | Die Firma ist aus einer Steuerungsebene führbar | Owner führt **einen echten Arbeitszyklus** aus dem System · kein unerklärter Schattenprozess |

## 7 · Dauerhafte Nicht-Verhandelbare

Wahrheit vor Erscheinung · echte Nutzung vor Fixture · Ergebnis vor Artefakt ·
Cutover vor Preview · Beleg vor Behauptung · Erlaubnis vor Annahme ·
menschliche Autorität vor unsicherer Automatik · dieselbe Phase statt einer
Closure-Kette.

Keine erfundenen Kunden, Zitate, Logos, Kennzahlen, ROI-Werte, Vorher-Stände,
Kapazitäten, Vertretungen, AVV, SLA oder Adoption.

## 8 · Was diese Verfassung ablöst

`docs/website-2/`, `docs/commercial-completion/`, `docs/proof-operations/`,
`docs/control-center/`, `docs/sales/`, `docs/roadmap/` bleiben **historische
Belegquellen**. Ihre alten Statusetiketten sind **keine** aktuelle Autorität
mehr. Maßgeblich ist `state.md`.
