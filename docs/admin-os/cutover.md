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
| Aktueller HEAD | siehe `git rev-parse HEAD` auf `feat/system-haus-site` — Stand dieses Dokuments: **ADM-07-Commit** |
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

## 3 · Preflight — vor der ersten Anweisung

Alles hier ist **lesend**. Gegen die Produktionsdatenbank ausführen:

```sql
-- P1 · Der UNIQUE-Index aus 017 scheitert, wenn es schon Dubletten gibt.
--      Das ist der einzige Punkt, an dem eine Migration hart abbrechen kann.
SELECT from_lead_id, count(*) FROM opportunities
 WHERE from_lead_id IS NOT NULL GROUP BY from_lead_id HAVING count(*) > 1;
-- Erwartung: 0 Zeilen. Sonst: vor der Migration entscheiden, welche Chance bleibt.

-- P2 · Welche Tabellen existieren heute?
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1;
-- Erwartung: OHNE admin_session_revocations, rate_limit_windows, releases,
--            automation_runs, automation_switches.

-- P3 · Wie gross ist der Bestand vorher? (Vergleichswert für §6)
SELECT (SELECT count(*) FROM leads) AS anfragen,
       (SELECT count(*) FROM organisations) AS organisationen,
       (SELECT count(*) FROM contacts) AS kontakte,
       (SELECT count(*) FROM opportunities) AS chancen,
       (SELECT count(*) FROM activities) AS chronik;
```

```bash
# P4 · Was fehlt, ohne etwas zu ändern:
MIGRATE_URL="<produktion>" npm run db-migrate -- --check
```

---

## 4 · Sicherung — Pflicht, nicht Empfehlung

```bash
# S1 · Sicherung ziehen (schreibt NICHT in die Datenbank)
node scripts/db-backup.mjs --url "<produktion>" --out ~/creadig-backups

# S2 · Die Sicherung EINMAL zurückspielen, bevor sie gebraucht wird.
#      Eine Sicherung, die nie zurückgespielt wurde, ist eine Vermutung.
node scripts/db-restore-drill.mjs --dump ~/creadig-backups/<datei>.dump \
  --target g1_cutover --source "<produktion>"
```

Lokal am 22.09.2026 vollständig durchgespielt: 12 Schritte, Schema 366 Zeilen,
20 Kerntabellen, Zeilenzahlen identisch, Anwendungsabfrage läuft auf der
Rückspielung (`docs/admin-os/abnahme.md` §A31).

**Ohne erfolgreiches S2 wird nicht migriert.**

---

## 5 · Reihenfolge — Migration zuerst, dann Deploy

```
S1/S2 Sicherung + Rückspielprobe
  ↓
M     MIGRATE_URL="<produktion>" CREADIG_MIGRATE_PRODUCTION=ja-ich-migriere-produktion npm run db-migrate
  ↓
D     Deploy des aktuellen HEAD (Preview), danach Promote auf Produktion
  ↓
V     Nachprüfung (§6) → Rauchtest (§7) → Live-Abnahme (§8)
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

## 6 · Nachprüfung direkt nach der Migration (lesend)

```sql
-- N1 · Die fünf neuen Tabellen sind da
SELECT table_name FROM information_schema.tables
 WHERE table_schema='public'
   AND table_name IN ('admin_session_revocations','rate_limit_windows','releases',
                      'automation_runs','automation_switches') ORDER BY 1;   -- 5 Zeilen

-- N2 · 017 sitzt
SELECT column_name, is_nullable FROM information_schema.columns
 WHERE table_name='leads' AND column_name IN ('email','phone','responsible','archive_reason','duplicate_of');
SELECT indexname FROM pg_indexes WHERE indexname='opportunities_from_lead_unique';

-- N3 · Nichts ist verloren gegangen (gegen P3 halten)
SELECT (SELECT count(*) FROM leads) AS anfragen,
       (SELECT count(*) FROM organisations) AS organisationen,
       (SELECT count(*) FROM contacts) AS kontakte,
       (SELECT count(*) FROM opportunities) AS chancen,
       (SELECT count(*) FROM activities) AS chronik;
```

Die Zahlen aus N3 dürfen gegenüber P3 **nicht kleiner** sein. Grösser dürfen
`organisationen`/`kontakte` nur werden, wenn der Backfill etwas gefunden hat,
das vorher fehlte — der Befehl sagt es in seiner Ausgabe (`Bestand: x → y`).

---

## 7 · Rauchtest nach dem Promote (nicht-destruktiv)

| # | Prüfung | Erwartung |
|---|---|---|
| R1 | `GET https://creadig.de/` | 200, Seite steht |
| R2 | `GET https://creadig.de/admin/login` | 200 · `Cache-Control: private, no-store` · `X-Robots-Tag: noindex` · **`Content-Security-Policy: default-src 'self'` …** (neu, H28) |
| R3 | Anmelden als Owner | Übersicht mit echten Zahlen, keine „0", kein Ladezustand |
| R4 | **B05 live**: Anmelden, Cookie kopieren, abmelden, Kopie benutzen | Antwort der Abmeldung `revoked: "server"` (**nicht** `browser-only`) · die Kopie landet auf `/admin/login` |
| R5 | **B08 live**: 11 Fehlversuche von einer Adresse | ab dem 11. `429` · `SELECT count(*) FROM rate_limit_windows` > 0 |
| R6 | Eine erfundene Kennung öffnen (`/admin/vertrieb/pipeline/<uuid>`) | „nicht gefunden" (404), **nicht** „Datenbank nicht erreichbar" (H27) |
| R7 | Türkische Suche in der Anfragenliste (`?q=isik` o. ä.) | findet den Betrieb mit `Işık` (H30) |
| R8 | `/admin/automationen` als Owner | Seite steht, Schalter sichtbar, Protokoll leer |
| R9 | Öffentliche Seite: Formular absenden (echte Testanfrage) | Anfrage erscheint in der Inbox mit Quelle `kontakt` |

R4 und R5 sind die zwei Punkte, die **lokal nicht** prüfbar waren. Sie sind der
eigentliche Grund, warum „LIVE 99 %" erst nach dem Cutover behauptet werden darf.

---

## 8 · Live-Abnahme (danach, mit echten Daten, in Ruhe)

1. **Eine echte Anfrage** von aussen durch die ganze Kette: Eingang → Kunde
   zuordnen → Chance → nächster Schritt → Angebot → gewonnen/verloren.
2. **Zwei Geräte**: dieselbe Anfrage am Telefon und am Rechner bearbeiten.
3. **Zweite Rolle**: Anmeldung als Vertrieb — `/admin/beleg`, `/admin/automationen`,
   `/admin/verbindungen`, `/admin/cockpit` müssen umleiten.
4. **Sprache**: Oberfläche auf Türkisch umschalten, dieselbe Kette einmal gehen.
5. **Automation**: Eine Abnahme eintragen → im Protokoll steht die Erinnerung,
   abhaken und zurücknehmen funktioniert, der Eintrag bleibt.
6. **Auskunft (B11)**: Für einen echten Kontakt die Auskunft herunterladen,
   Inhalt gegen die Akte halten, Vermerk in der Chronik prüfen.
7. Nach 7 Tagen Betrieb: `docs/admin-os/state.md` auf `LIVE 99 % ACCEPTED`
   setzen — oder die Lücke benennen, die es verhindert.

---

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

## 10 · Was der Owner tun muss — drei Handlungen

Der Vertrag erlaubt höchstens drei (`program.md` §1). Deshalb sind Sicherung,
Rückspielprobe und Migration **eine** Handlung: Sie gehören in eine Sitzung, in
dieser Reihenfolge, und keine davon ist ohne die vorherige sinnvoll.

| # | Handlung | Befehle | Warum nur der Owner |
|---|---|---|---|
| **O1** | **Sichern, Rückspielung proben, migrieren** (§3 P1–P4 → §4 S1/S2 → §5 M) | `npm run db-migrate -- --check` · `node scripts/db-backup.mjs --url …` · `node scripts/db-restore-drill.mjs --dump …` · `CREADIG_MIGRATE_PRODUCTION=ja-ich-migriere-produktion npm run db-migrate` | Zugriff auf die Produktionsdatenbank; eine Schema-Änderung dort ist eine Entscheidung, kein Nebeneffekt |
| **O2** | **Deploy + Promote** des aktuellen HEAD (§5 D) | Push, Preview-Deploy, Promote | Produktionsautorität (Push- und Deploy-Rechte liegen beim Owner) |
| **O3** | **Rauchtest R1–R9 abnehmen** (§7) und Ergebnis melden | Browser + zwei SQL-Abfragen | Nur mit echtem Zugang messbar — vor allem **R4** (Widerruf) und **R5** (Versuchsfenster), die zwei lokal unbeweisbaren Punkte |

Nach O3 gehört genau eine Zeile in `docs/admin-os/state.md`: was R1–R9 ergeben
haben. Erst danach ist die Live-Abnahme (§8) an der Reihe.

**Offene Owner-Entscheidungen, die den Cutover NICHT blockieren:**

| Frage | Wofür | Folge heute |
|---|---|---|
| meAI-Anbieter und Kostenrahmen | A8 · Punkt 8 | Antwort kommt aus Regeln, vollständig und belegt (A30 grün) |
| Aufbewahrungsfristen (`docs/ops/neon-decision-pack.md`) | B11 · Löschung je Person mit Sperre statt Löschen | Auskunft ist gebaut und grün; die **Löschung** mit Fristenkonflikt bleibt offen und nennt „unbekannt" statt einer erfundenen Frist |
| Dark Mode | A10 (OD-1) | POST-99, zählt nicht zu 99 % |
