# Admin / Owner OS 1.0 · Cutover-Paket

> **Stand 23.09.2026** · Erstellt am Ende von ADM-07.
> **Zustand des Programms: `OWNER-INDEPENDENT BUILD COMPLETE` + `CUTOVER READY`.**
> **NICHT `LIVE 99 % ACCEPTED`** — das wird es erst nach diesem Cutover und der
> Live-Abnahme unten. Bis dahin steht in jedem Dokument dieses Programms
> „lokal bewiesen", nie „live".
>
> Dieses Paket ist die **eine** Vorlage für die Owner-Entscheidung. Es nennt,
> was passiert, was schiefgehen kann, wie man zurückkommt — und die genaue
> Reihenfolge. Nichts davon wurde ausgeführt.

---

## 0 · Die drei Zustände, sauber getrennt

| Zustand | Bedeutung | heute |
|---|---|---|
| **OWNER-INDEPENDENT BUILD COMPLETE** | Alles, was ohne Owner-Entscheidung und ohne Produktion baubar und beweisbar war, ist gebaut und bewiesen. | **erreicht** (23.09.2026) |
| **CUTOVER READY** | Ein vollständiges Paket liegt vor: Migrationen, Reihenfolge, Preflight, Rückweg, Prüfplan. | **erreicht** (dieses Dokument) |
| **LIVE 99 % ACCEPTED** | In Produktion ausgeführt und dort nachgemessen — inkl. der Punkte, die lokal nicht messbar sind (B05, B08). | **offen** — braucht §4–§8 |

---

## 1 · Was ausgeliefert wird

| Punkt | Wert |
|---|---|
| Auszuliefernder Stand | **`76cbe67`** (ADM-07-Abnahme) auf `feat/system-haus-site`. Kommt danach noch ein Commit, gilt der neue HEAD — die Liste in §2 ändert sich dadurch nicht, die Zahl in der Zeile darunter schon. |
| Produktions-Basis heute | **`e1bc9ec`** · Deployment `dpl_7siNz9VcwZJnkjdAsRq5gbRx7U2w` · Aliase `creadig.de`, `www.creadig.de` |
| Commits seit der Basis | **22** (`git log --oneline e1bc9ec..HEAD`) — ADM-01 bis ADM-07 |
| Migrationen | **015, 016, 017, 018, 019** — in dieser Reihenfolge |
| Branch | `feat/system-haus-site` (kein Merge nach `main` in diesem Paket vorgesehen) |

**Nicht enthalten** (unberührtes Fremd-WIP, G18): `components/legal/legal-page.tsx`,
`components/sections/packages.tsx`, `lib/material-status.ts`, `lib/rechnung.ts`,
`lib/site-data.ts`, `scripts/rechnung-drill.mjs` sowie die Audit-`.md` im Wurzelverzeichnis.

---

## 2 · Die fünf Migrationen — Zweck, Delta, Code-Abhängigkeit

Angewendet wird **nicht** die `.sql`-Datei, sondern `SCHEMA` aus `lib/neon-client.ts`
über `npm run db-migrate`. Die Dateien unter `scripts/migrations/` sind die lesbare
Fassung derselben Anweisungen — eine zweite Liste wäre eine zweite Wahrheit.

| # | Zweck | Schema-Delta | Code, der sie braucht | Ohne sie |
|---|---|---|---|---|
| **015** Sitzungswiderruf | Abmelden widerruft serverseitig (B05) | `admin_session_revocations` (sid PK, revoked_at, expires_at, reason) + Index auf `expires_at` | `lib/admin-widerruf.ts`, `middleware.ts`, `app/api/admin/session/route.ts` | Abmelden löscht nur das Cookie; eine Kopie gilt bis zu 8 h. Route antwortet ehrlich `revoked: "browser-only"` |
| **016** Versuchsfenster | Anmeldeversuche über Instanzen hinweg zählen (B08) | `rate_limit_windows` (bucket, window_start, hits) | `lib/rate-limit.ts` | Fenster gilt nur je Instanz (Arbeitsspeicher) — greift, aber nicht instanzübergreifend |
| **017** Kernschleife | Anfrage ohne Mail, Verantwortliche, Archiv, Dubletten, Chronik mit Akteur, Chance genau einmal (A03–A12) | `leads.email`/`leads.phone` → NULL erlaubt · `leads.responsible`, `leads.archive_reason`, `leads.duplicate_of` · `opportunities.responsible` · **UNIQUE INDEX `opportunities_from_lead_unique`** · `activities.actor`, `activities.origin`, `activities.data` · 2 Indizes | `lib/vertrieb-store-neon.ts` (fast die ganze Kernschleife), alle `/admin/vertrieb/*`-Seiten | Manuelle Anfragen, Archiv, Dublettenschutz, Chronik-Akteur und Doppelklick-Schutz fehlen → **dieses Release ergibt ohne 017 keinen Sinn** |
| **018** Freigaben | Erlaubnis und Widerruf für Belege (A13/A14) | `releases` (+ FK auf `organisations`, Index, UNIQUE über Organisation/Person/Form/Datum/Fundstelle) | `lib/vertrieb-store-neon.ts` (`recordRelease`, `withdrawRelease`, `listReleases`), `/admin/beleg`, `lib/auskunft.ts` | Belegseite kann keine Erlaubnis erfassen; Auskunft (B11) zeigt 0 Freigaben |
| **019** Automation | Ausführungsprotokoll und Schalter (A29) | `automation_runs` (+ UNIQUE `schluessel`, Index) · `automation_switches` | `lib/automation.ts`, `/admin/automationen` | Automationen rechnen, hinterlassen aber nichts; Geschäftshandlungen laufen weiter (bewusst so gebaut) |

**Was `db-migrate` ausserdem tut** (nicht nur Schema): Nach `SCHEMA` laufen
`BACKFILL`, `seedBestand()` und `applyExclusions()`. Das sind **Datenoperationen**
— sie legen Organisationen und Kontakte aus vorhandenen Anfragen an, spielen den
Bestand ein und markieren Ausschlüsse. Alle mit `ON CONFLICT DO NOTHING`, also
wiederholbar. In Produktion sind sie bereits einmal gelaufen; eine Wiederholung
darf nichts Neues erzeugen. **Diese Zahl steht im Protokoll des Befehls und
gehört in die Nachprüfung (§6).**

---

## 3 · Preflight — ein Befehl, nur lesend

```bash
npm run cutover-preflight
```

`scripts/cutover-preflight.mjs` stellt genau die Fragen, die vor einer
Migration zählen, und ändert nichts:

| Punkt | Frage | Bedeutung |
|---|---|---|
| **P1** | Gibt es zwei Chancen aus derselben Anfrage? | **Der einzige harte Stopper.** Der eindeutige Index aus 017 scheitert daran. Zusammengeführt wird nichts automatisch — welche Chance die echte ist, entscheidet der Owner. |
| P2 | Welche Tabellen stehen heute da? | Zeigt, ob 015–019 teilweise schon angewendet sind |
| P3 | Wie viele Anfragen, Organisationen, Kontakte, Chancen, Chronikzeilen? | Vergleichswerte für §6 — die Ausgabe nennt sie in der Form, die `--vorher` erwartet |
| P5 | Welche 017-Spalten fehlen noch? | Zeigt, was die Migration zu tun hat |
| P6/P7 | Halten die übrigen Annahmen (Fremdschlüssel, Eindeutigkeiten)? | Fängt Abbrüche vor der Mutation ab |

Die Ausgabe enthält **keine** Verbindungszeichenfolge, kein Passwort und
keine Personendaten — sie darf weitergegeben werden.

Gegen eine lokale Kopie am 23.09.2026 durchgespielt: grün.

## 4 · Sicherung — Pflicht, nicht Empfehlung

```bash
npm run cutover-sicherung
```

Ein Befehl, zwei Schritte, eine Regel: `pg_dump` der Produktion in ein
Verzeichnis ausserhalb des Arbeitsbaums (`~/creadig-backups`), danach
**Rückspielung derselben Datei** in eine frische lokale Wegwerf-Datenbank mit
Vergleich von Schema, Kerntabellen, Zeilenzahlen, Verknüpfungen und einer
echten Anwendungsabfrage. Scheitert der zweite Schritt, endet der Befehl mit
einem Fehlercode — **und dann wird nicht migriert.**

Am 22.09. (lokale Daten) und 23.09.2026 (über dieses Skript) je vollständig
durchgespielt: 12 Schritte, 0 fehlgeschlagen.

## 5 · Reihenfolge — Migration zuerst, dann Deploy

```
P     npm run cutover-preflight
  ↓
S     npm run cutover-sicherung        (Sicherung + Rueckspielprobe)
  ↓
M     npm run cutover-migration        (= db-migrate mit ausdruecklicher Zustimmung)
  ↓
D     Deploy des aktuellen HEAD (Preview), danach Promote auf Produktion
  ↓
N     npm run cutover-nachpruefung -- --vorher <Zahlen aus P3>
  ↓
D2    Promote der verifizierten Preview auf Produktion
  ↓
L     npm run cutover-live             (R1-R9 + Live-Abnahme, §7/§8)
```

**Warum in dieser Reihenfolge:** Alle fünf Migrationen sind **additiv** (neue
Tabellen, neue Spalten, gelockerte NOT-NULL-Bedingungen). Der heute laufende
Produktionscode kennt die neuen Spalten nicht und fasst sie nicht an — ihm
passiert durch die Migration nichts. Umgekehrt wäre es gefährlich: Der neue Code
ohne 017 fände `leads.responsible` nicht und liefe in Fehlerzustände.

**Idempotenz / Wiederholbarkeit:** Jede Anweisung trägt `IF NOT EXISTS`; die
Datenoperationen tragen `ON CONFLICT DO NOTHING`. Ein zweiter Lauf ist
folgenlos — das ist der geplante Weg bei Abbruch mitten im Lauf: **erneut
ausführen**, nicht von Hand nacharbeiten.

---

## 6 · Nachprüfung direkt nach der Migration — ein Befehl, nur lesend

```bash
npm run cutover-nachpruefung -- --vorher anfragen=…,organisationen=…,kontakte=…,chancen=…,chronik=…
```

Die Zahlen sind die aus P3. Geprüft wird:

* **N1** die fünf Tabellen aus 015–019 sind da
* **N2** jede 017-Spalte, beide gelockerten NOT-NULL-Bedingungen, die drei
  tragenden Indizes (`opportunities_from_lead_unique`,
  `automation_runs_schluessel_idx`, `releases_eindeutig`)
* **N3** **nichts ist verschwunden** — keine Zahl darf unter den Wert aus P3 fallen
* **N4** keine offensichtlichen Waisen (Anfrage → Kontakt, Chance → Organisation)

Rot heisst: **nicht deployen.**

## 7 · Rauchtest R1–R9 und Live-Abnahme — ein Befehl

```bash
npm run cutover-live
```

`scripts/cutover-live.mjs` fährt gegen `https://creadig.de`:

| # | Prüfung | Erwartung |
|---|---|---|
| R1 | Öffentliche Seite | 200 |
| R2 | `/admin/login` | `no-store` · `noindex` · **volle CSP `default-src 'self'`** (H28 live) |
| R3 | Anmelden, Übersicht | 200, echte Abschnitte, keine Störungsmeldung |
| **R4** | **Widerruf**: anmelden, Cookie kopieren, abmelden, Kopie benutzen | Antwort `revoked: "server"` · Kopie landet auf `/admin/login` — **lokal nicht beweisbar** |
| **R5** | **Versuchsfenster**: Fehlversuche in Serie | 429 · auch das richtige Passwort kommt nicht durch · Zeile in `rate_limit_windows` — **lokal nicht beweisbar** |
| R6 | Erfundene Kennungen (Chance, Kunde, Anfrage) | 404, kein 500 (H27 live) |
| R7 | Türkische Suche `sivgin` · `ŞIVGIN` · `isik` · `IŞIK` | findet dieselbe Probe (H30 live) |
| R8 | `/admin/automationen`, `/verbindungen`, `/beleg`, `/material` | je 200 |
| R9 | Anfrage über das **öffentliche Formular** | gespeichert; Versand getrennt beurteilt |
| B11 | Auskunft je Person | Owner 200 mit der richtigen Person · ohne Sitzung 401 |

Danach im Browser: **H14** (dreimal speichern, dreimal der neue Stand),
**A28** (ungespeicherter Text bleibt), **A25** (Kachel = Zeilen dahinter),
**A01** (türkische Oberfläche), **A26** (mobil 390 ohne Überlauf).

**Testdaten:** genau eine Anfrage, über den echten öffentlichen Weg, im Namen
und Betrieb mit `ZZ Cutover-Probe` markiert. Am Ende wird sie **archiviert,
nicht gelöscht**. An echten Kundendatensätzen ändert der Lauf nichts.

**R5 kostet, was es beweist:** Das Versuchsfenster gilt je Adresse — diese
Internetverbindung kann sich danach bis zu zehn Minuten nicht anmelden.
Deshalb läuft R5 zuletzt; `--ohne-r5` überspringt ihn, dann bleibt B08 live
unbewiesen.

## 8 · Live-Abnahme mit echten Vorgängen (danach, in Ruhe)

Was das Skript nicht ersetzt, weil es echte Arbeit ist:

1. Eine echte Anfrage von aussen durch die ganze Kette bis gewonnen/verloren.
2. Dieselbe Anfrage am Telefon und am Rechner bearbeiten.
3. Anmeldung als Vertrieb: `/admin/beleg`, `/admin/automationen`,
   `/admin/verbindungen`, `/admin/cockpit` müssen umleiten.
4. Eine Abnahme eintragen → Automationsprotokoll prüfen, abhaken, zurücknehmen.
5. Nach 7 Tagen Betrieb: `state.md` auf `LIVE 99 % ACCEPTED` — oder die Lücke benennen.

## 9 · Rückweg

| Fall | Weg | Datenverlust |
|---|---|---|
| Deploy ist schlecht, Schema ist in Ordnung | In Vercel das vorherige Deployment (`dpl_7siNz9VcwZJnkjdAsRq5gbRx7U2w`) promoten | keiner — die neuen Spalten stören den alten Code nicht |
| Migration bricht mitten im Lauf ab | Denselben Befehl erneut ausführen (idempotent). Hilft das nicht: Ursache lesen, P1 prüfen | keiner |
| Schema soll wirklich zurück | Neue Tabellen sind isoliert: `DROP TABLE automation_runs, automation_switches, releases, rate_limit_windows, admin_session_revocations;` · Die 017-Spalten bleiben (harmlos, nur `NULL`) | **die Inhalte dieser Tabellen** (Freigaben, Automationsprotokoll) |
| Daten sind beschädigt | Rückspielung aus §4 nach `db-restore-drill`-Muster in eine frische Datenbank, dann Verbindung umstellen | alles seit der Sicherung |

Ein `DROP` der 017-Spalten ist **nicht** vorgesehen: Sie tragen dann bereits echte
Verantwortliche, Archivgründe und Chronik-Akteure.

---

## 10 · Was der Owner tun muss — drei Befehle

Der Vertrag erlaubt höchstens drei Owner-Handlungen (`program.md` §1). Es sind
drei Befehle geworden, weil ein vierter Grund dazukam: **die
Produktionszugangsdaten sind für den ausführenden Agenten nicht lesbar** (§11).

Alle drei laufen im Projektverzeichnis. Die Zugangsdaten kommen aus
`.env.local` — sie stehen in keinem Befehl, in keiner Ausgabe, in keinem Log.

```bash
# 1 · Ansehen, nichts ändern. Rot heisst: hier aufhören.
npm run cutover-preflight

# 2 · Sichern, Rückspielung beweisen, dann migrieren.
npm run cutover-sicherung
npm run cutover-migration
npm run cutover-nachpruefung -- --vorher <die Zahlen aus Schritt 1>

# 3 · Nach dem Promote: Rauchtest und Live-Abnahme.
npm run cutover-live
```

**Dazwischen gehört das Promote** — das kann der Agent übernehmen, sobald
Schritt 2 grün gemeldet ist: Die Preview zum auszuliefernden Stand ist gebaut
und `READY` (`dpl_BSnKQFit8hcoKVfSUow3t2sAcXWz`), das Promote braucht keine
Datenbankzugangsdaten.

| # | Handlung | Warum nur der Owner |
|---|---|---|
| **O1** | Preflight ansehen | Zugriff auf die Produktionsdatenbank |
| **O2** | Sichern → Rückspielprobe → migrieren → nachprüfen | dieselbe Zugriffsgrenze; die Migration ist ausserdem eine Entscheidung |
| **O3** | Nach dem Promote `cutover-live` laufen lassen | braucht das Admin-Passwort und eine echte Verbindung |

## 11 · Warum der Agent den Cutover nicht selbst ausführen konnte

Gemessen am 23.09.2026: In der Umgebung, in der der Agent arbeitet, werden
Geheimnisse **maskiert**. Jeder Zugangswert in `.env.local` — `DATABASE_URL`,
`ADMIN_PASSWORD`, alle `DATABASE_PG*` — kommt beim Lesen als `[SENSITIVE]`
zurück (geprüft: 13 Zeichen statt der echten Länge; ein selbst geschriebener
Vergleichswert kam unverändert zurück). `vercel env pull` ist in dieser
Umgebung gesperrt.

Damit gilt:

* Der Agent kann die Produktionsdatenbank **nicht** erreichen — weder lesend
  (Preflight) noch schreibend (Migration).
* Er kann sich am Produktions-Admin **nicht** anmelden (R3–R9).
* Er kann die Preview **promoten** (Vercel-Zugang besteht) — tut es aber
  nicht, weil der neue Stand Migration 017 braucht. Code vor Schema zu
  promoten hiesse, den Admin in Fehlerzustände zu schicken.

Das ist kein Fehler des Programms und kein offener Punkt der Abnahme, sondern
eine Grenze der Werkstatt. Die Arbeit, die sie ersetzt, ist erledigt: Jeder
Schritt ist ein einziger Befehl, jeder Befehl ist gegen eine lokale Kopie
durchgespielt, jede Ausgabe ist ohne Geheimnisse weitergebbar.

**Offene Owner-Entscheidungen, die den Cutover NICHT blockieren:**

| Frage | Wofür | Folge heute |
|---|---|---|
| meAI-Anbieter und Kostenrahmen | A8 · Punkt 8 | Antwort kommt aus Regeln, vollständig und belegt (A30 grün) |
| Aufbewahrungsfristen (`docs/ops/neon-decision-pack.md`) | B11 · Löschung je Person | Auskunft ist gebaut und grün; die Löschung nennt „unbekannt" statt einer erfundenen Frist |
| Dark Mode | A10 (OD-1) | POST-99, zählt nicht zu 99 % |

---

## 12 · DB-Ziel Safety-Stop — CLEARED (24.09.2026)

Zwischen Sicherung und der Bewertung „Production-Migration" bestand ein
Widerspruch: `cutover-sicherung` meldete `Umgebung preview` (weil
`.env.local` `VERCEL_ENV=preview` trägt — Datei-Etikett aus einem früheren
`vercel env pull`, **nicht** der Neon-Branch). Sensitive Production-
`DATABASE_URL` ist per CLI/`env pull` **nicht** lesbar (`[SENSITIVE]`).

**Owner-Bestätigung 24.09.2026: MATCH YES** — Host/DB des lokalen
Cutover-Ziels ist derselbe wie Production Neon:
`ep-summer-sky-b1eispp7-pooler.c-5.eu-central-1.aws.neon.tech/neondb`
(LOCAL_FP `55675b35c64cb347`). Damit sind Preflight, Sicherung, Migration
015–019 und Nachprüfung gegen **Production** belegt. Safety-Stop aufgehoben.

**Noch offen für LIVE 99 %:** ~~Production-Env ohne Formular-Geheimnisse~~ — **erledigt 24.09.2026** (Owner; Redeploy). `cutover-live` **LIVE GRUEN** inkl. R4/R5-DB. Status: **LIVE 99 % VERIFIED · READY FOR OWNER ACCEPTANCE**.
