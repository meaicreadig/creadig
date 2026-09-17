# Admin / Owner OS 1.0 · Ledger

> **Maßgebliche Statusquelle** dieses Programms. Vertrag: `docs/admin-os/program.md`.
> Stand **16.09.2026** · Session 1 · Branch `feat/system-haus-site` @ `814a02f`
> Programmzustand: **IN_PROGRESS** — weder OWNER-INDEPENDENT BUILD COMPLETE noch LIVE 99 % ACCEPTED.
> Vorgänger-Dokumente (bleiben Beleg, nicht Status): `docs/control-center/*`, `docs/final-live-completion/state.md` (F12 Owner-Steuerung).

---

## Ausgangslage (A1, verifiziert 16.09.2026)

| Punkt | Wert | Evidenzart |
|---|---|---|
| HEAD / origin | `814a02f` = `origin/feat/system-haus-site` | Code (git) |
| Production | `814a02f`, `dpl_9LLmNHNvcsowYCWDSvqWGfQYbWCW` | Runtime (Vercel API) |
| Fremd-WIP (nicht anfassen) | 3 Audit-/Prompt-`.md` im Root · `screenshots 2/` · `scripts/.!12454!check-ownerlast.mjs` | git status |

### G18-Hashes (SHA-256, vor Arbeit — Dateien sind lokal modifiziert, uncommitted)

```
fed8b14560c83b4fd2a90c6468c75cc381bfc7ec4027f5b7ac589bb3eabf2e2d  components/legal/legal-page.tsx
519f89bac42371db75452c49dd9579f629af61fd76758d15874dd759e7d55d25  components/sections/packages.tsx
efe3695d7c4622e568b0c690798567bbfd2c9e75a4ad8ac86c2cf80ab9130170  lib/material-status.ts
d0a6a063e29996b7474446972ff204a153914f9fdb765e45a9981f9dac8fe442  lib/rechnung.ts
43c6f528f16dcd722fc04c2508a09ac3094280ea083fb654b912cf8468713488  lib/site-data.ts
dc3bdab1bd64ced536707528e48eed3dfa7913652cf1454e2f0b781af26293f6  scripts/rechnung-drill.mjs
```

---

## Wellen

| Welle | BUILD | CUTOVER | LIVE | CLOSURE | Status | Nächste konkrete Handlung | Blocker |
|---|:--:|:--:|:--:|:--:|---|---|---|
| ADM-00 | 🟢 | — | — | 🟢 | `VERIFIED` | — (eingefroren, siehe unten) | — |
| ADM-01 | 🟡 | 🔴 | 🔴 | 🔴 | `IN_PROGRESS` | Seiten migrieren (≥140 Textstellen, 20 Dateien) — zuerst Anfragen + Pipeline (werden in ADM-03 ohnehin umgebaut) | Material-Beschriftungen BLOCKED_G18 |
| ADM-02 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` | Cutover: Deploy + `db-migrate` 015/016 in Produktion, danach Widerruf/Versuchsfenster/Login live messen | Produktionsautorität (Owner) | Cutover H1–H4 = Deploy + Migrationen 015/016 (Produktionsautorität) · `rechnung.faelligAm` BLOCKED_G18 |
| ADM-03 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` (lokal VERIFIED) | Cutover: Migration 017 **vor** Deploy; danach echte Anfrage im System (LIVE) | Produktionsautorität (Owner) |
| ADM-04 | 🔴 | 🔴 | 🔴 | 🔴 | `NOT_STARTED` | — | Anbieterfreigaben (nach A2-Einstufung) |
| ADM-05 | 🔴 | 🔴 | 🔴 | 🔴 | `NOT_STARTED` | — | G18 für Rechnung (`lib/rechnung.ts`) |
| ADM-06 | 🔴 | 🔴 | 🔴 | 🔴 | `NOT_STARTED` | — | meAI-Anbieter/Kosten = Owner |
| ADM-07 | 🔴 | 🔴 | 🔴 | 🔴 | `NOT_STARTED` | — | Produktionsautorität |

**Bestand ist nicht leer** (Code-Evidenz): Anfragen, Organisationen, Kontakte, Standorte, Chancen, Aktivitäten, Recherche, Verlust, Angebote → Projekte (`lib/vertrieb.ts`), Beleg, Rollen (Owner/Vertrieb/Redaktion), Aufmerksamkeit (`lib/attention.ts`), Gedächtnis/Navigator (Cockpit), Migrationsbefehl mit Produktionssperre (`scripts/db-migrate.mjs`). Das Programm baut darauf auf.

---

## ADM-00 · Funde (erste Runde)

| # | Fund | Evidenzart | Schwere | Welle | Status |
|---|---|---|---|---|---|
| **H1** | `neonClient().ready()` führte bei jedem Kaltstart vor der ersten Abfrage `seedBestand()` und `applyExclusions()` aus; `listEnquiries` zusätzlich bei **jedem** Aufruf (~60 UPDATEs) → **Lesen schrieb**. | Code `lib/neon-client.ts`, `lib/vertrieb-store-neon.ts` | hoch | ADM-02 | **VERIFIED** (16.09.2026) — siehe §H1 |
| **H2** | Sitzung zustandslos; Abmelden löschte nur das Cookie, eine Kopie galt bis zu 8 h weiter — **kein serverseitiger Widerruf** (B04/B05). | Code | hoch | ADM-02 | **BUILT + lokal VERIFIED** (17.09.2026) — Live-Widerruf erst mit Migration 015 in Produktion · siehe §H2 |
| **H3** | Rate-Limit nur im Arbeitsspeicher je Instanz (Admin-Anmeldung, Formular-Absendung) — nicht dauerhaft über Instanzen (B08). | Code | mittel | ADM-02 | **BUILT + lokal VERIFIED** (17.09.2026) — Live nach Migration 016 · siehe §H3 |
| **H4** | Admin-Antworten ohne `X-Robots-Tag`; Anmelde-Route ohne `no-store`; **Anmeldung mit fremdem `Origin` angenommen (200 + Cookie)**. | Runtime gemessen (`next start`) | mittel→hoch (Login-CSRF) | ADM-02 | **VERIFIED** (16.09.2026) — siehe §H4 |
| **H5** | Admin ist einsprachig: `app/(admin)/layout.tsx` `lang="de"`, keine TR-Wörterbuchschicht für Admin. | Code | hoch für 99 % | ADM-01 | offen |
| **H6** | Zwei Owner-Übersichten: `/admin` (Heute, `lib/attention.ts`) und `/admin/cockpit` (G34, Gedächtnis+Navigator). Überlappung → A4-Zusammenlegung. | Code | mittel | ADM-01 | **VERIFIED** (17.09.2026) |
| **H7** | Kein Dark Mode im Admin-Code (kein `dark:`/`prefers-color-scheme` in `components/admin`, `app/(admin)`). Ältere Acceptance nennt „Mobil 390 dunkel" — nicht reproduziert. | Code; Widerspruch zu `docs/control-center/acceptance.md` #11 | niedrig | A10 | Owner-Entscheidung |
| **H8** | Die 27 Server Actions (`app/(admin)/admin/vertrieb/actions.ts`) prüften weder Sitzung noch Rolle — nur die Middleware schützte sie (Annahme über Next-Routing). | Code | hoch (A20) | ADM-02 | **VERIFIED** (17.09.2026) — siehe §H2 |
| **H9** | `rollen-drill` war seit `157e1fa` rot (12 statt 13 Personendaten-Flächen), stand in keiner Kette. | reproduziert | niedrig (Testhygiene) | ADM-02 | **VERIFIED** — nachgezogen, jetzt in `postbuild` |
| **H10** | Geschäftstag in UTC: „heute“ 12× als `toISOString().slice(0,10)`, SQL `current_date` (7×), Datums-/Zeitanzeige ohne Zone → zwischen 00:00 und 01:00/02:00 Berlin war heute gestern (fällig/überfällig um einen Tag falsch). | Code + reproduziert (Gate §2) | hoch (A23) | ADM-02 | **VERIFIED** (17.09.2026) — siehe §A23 |
| **H11** | Login-Seite (ohne Anmeldung) enthielt im Seiten-Payload die komplette Admin-Navigation samt Bereichsbeschreibungen — über `not-found.tsx` → `AdminShell`. | Runtime gemessen (`curl /admin/login`) | niedrig (Info-Abfluss, keine Daten) | ADM-02 | **VERIFIED** (17.09.2026) |
| **H12** | Login-Formular: kein Zeitlimit (hängendes Netz = „Wird geprüft …“ für immer), Netz-/Serverfehler lasen sich wie falsches Passwort, nach Erfolg weiter „Wird geprüft …“ während der Navigation. | Code + E2E | mittel (A02) | ADM-02 | **VERIFIED** (17.09.2026) — siehe §A02 |
| **H13** | Datenzustände: Vertrieb/Kunden sagten in beiden Lagen „nicht eingerichtet oder nicht erreichbar“; Heute ohne Speicher verschwieg den fehlenden Vertrieb; Recherche/Verlust fielen bei Störung auf die Fehlerseite der ganzen Ansicht; Recherche-Detail ohne Speicher = „Nicht gefunden“; Beleg „Datenbank nicht gelesen“ ohne Lage. | Runtime (gerenderter Crawl, 32 Flächen × 2 Lagen) | mittel (A19) | ADM-02 | **VERIFIED** (17.09.2026) — siehe §A19 |
| **H14** | **Anzeige nach dem Speichern veraltet** — seit dem Einbau von `app/(admin)/admin/vertrieb/loading.tsx` übernahm der Browser die neu gerenderte Seite nach einer Server Action oft nicht: gespeichert war, gezeigt wurde der alte Stand (auch im PRODUKTIVEN Stand `91044de`: Notiz 8/20). Folge für den Owner: erneutes Speichern, Misstrauen in die Daten. | Runtime gemessen, Halbierung über 4 Stände + A/B | **hoch** | ADM-03 | **VERIFIED** (17.09.2026) — Datei entfernt, Gate `check-admin-antwort` §5; 20/20 + 20/20 |
| **H15** | Inbox-Filter `lower(btrim(email)) NOT LIKE …` ergab bei Anfragen ohne Mail NULL → telefonische Anfragen wären still aus der Inbox verschwunden. | Code + Drill | hoch | ADM-03 | **VERIFIED** — `coalesce` |
| **H16** | „Chance anlegen“: erst SELECT, dann INSERT, keine Eindeutigkeit → zwei gleichzeitige Klicks = zwei Chancen. | Code + Drill (10 parallel) | mittel | ADM-03 | **VERIFIED** — eindeutiger Index (017) + ON CONFLICT |
| **H17** | `.env.local` enthält eine echte `DATABASE_URL`; Next füllt auch LEER gesetzte Variablen daraus → Prüfskripte mit `DATABASE_URL: ""` konnten eine echte DB erreichen (Rauchtest schickt Formularanfragen). Kein Vorfall (kein `LEAD_STORE` in `.env.local`). | Runtime gemessen | hoch (Risiko) | ADM-03 | **VERIFIED** — alle next-start-Skripte `LEAD_STORE=aus` + `.invalid`; Gate `check-pruefumgebung` |

---

## Owner-Entscheidungen (verbindlich, 16.09.2026)

| # | Entscheidung | Wirkung |
|---|---|---|
| **OD-1** | **Dark Mode = POST-99 COMFORT.** Tokens themefähig bauen, kein zweites Theme im Programmbudget. | A10 geschlossen; kein 99 %-Kriterium |
| **OD-2** | **Kritikalität nach Geschäftsfähigkeit, nicht nach Anbieter.** CRITICAL INBOUND: Website-Formular · manuelle Anfrage · bestehender E-Mail-Anfrageweg *falls* ADM-00 belegt, dass er heute real genutzt wird **und** ein wiederverwendbarer Adapter existiert. NON-CRITICAL: LinkedIn · Meta/Instagram · WhatsApp · Kalender · weitere Anbieter — außer ADM-00 belegt harte Abhängigkeit eines eingefrorenen kritischen Ablaufs. Ein nicht-kritischer Anbieter darf `BLOCKED_EXTERNAL` bleiben, ohne 99 % zu verhindern. | A2 eingefroren (unten) |

---

## ADM-00 · Eingefroren (16.09.2026)

### Integrations-Kritikalität (A2 + OD-2)

| Fähigkeit | Einstufung | Evidenz |
|---|---|---|
| Website-Formular → strukturierter `leads`-Datensatz | **CRITICAL** | Code: `app/api/lead/route.ts` → `storeLead()` **vor** dem Zustellversuch, Token-Fingerprint gegen Doppel-Submit. Vorhanden; E2E-Beweis in ADM-03 (A03). |
| Manuelle Anfrage | **CRITICAL** | Code: **fehlt** — kein `createEnquiry` im `VertriebStore`, keine Admin-Aktion. → ADM-03 baut. |
| E-Mail-Eingang | **NON-CRITICAL (Bedingung nicht erfüllt)** | Code: creaDIG-Repo hat nur **ausgehenden** Versand (Resend). Ein echter Gmail-OAuth/IMAP-Adapter existiert im **meAI-Altprodukt** (`~/Documents/meai/lib/meai/mail/`, Supabase-Tabelle `mail_oauth`, live laut `meai-v5/docs/BESTANDSAUFNAHME-LIVE.md` 15.09.2026) — andere Datenbank, anderes Identitätsmodell, **keine Verbindung** zum creaDIG-Admin; kein Beleg, dass creaDIG-Anfragen heute über ihn bearbeitet werden. Per E-Mail eingehende Anfragen werden bis dahin als **manuelle Anfrage mit Quelle `email`** erfasst. Umstufung nur mit Beleg (Owner-Tatsache: „Ich bearbeite Anfragen an info@ in meAI"). Falls gebaut: Reuse `lib/meai/mail` (A9), kein zweiter Mail-Speicher. |
| LinkedIn · Meta/Instagram · WhatsApp · Kalender | **NON-CRITICAL** | Code: 0 Adapter, 0 OAuth im Repo. Kein eingefrorener kritischer Ablauf hängt davon ab. Connection Center zeigt sie ehrlich als `NOT_CONFIGURED`. |

### Domänen-Entitätskarte (Code-Evidenz)

| Entität | Speicher | Vorhanden | Lücke für 99 % |
|---|---|---|---|
| Anfrage | `leads` | Quelle, Sprache, UTM, Nachricht, `sales_status`, `handling` (neu/gesehen/bearbeitet/archiviert), `excluded_reason`, Token-Fingerprint | **Verantwortlicher** fehlt · manuelles Anlegen fehlt · Dublettenhinweis Anfrage fehlt |
| Organisation | `organisations` | Stammdaten, `lifecycle` (unbekannt/prospect/kunde/ehemaliger-kunde), `lower(name)` eindeutig, Ausschluss | Archiv/Löschen/Export (A7) · Zusammenführen |
| Standort | `locations` | CRUD | — |
| Kontakt | `contacts` | `email_normalised`, `relationship` (4 Grade), `next_touch` | Kommunikationssprache · Zusammenführen · A7 |
| Verkaufschance | `opportunities` | 9 Stufen, `from_lead_id` (echter FK), `next_action`/`_at`, `estimated_value` (null ≠ 0), `lost_reason`, Angebotsreife | **Verantwortlicher** · Versionsprüfung (A5) · Stufen gegen reale Praxis bestätigen |
| Chronik | `activities` | `subject_type/id`, `kind` maschinenlesbar, `summary` | **Akteur + Herkunft** (HUMAN/SYSTEM/AUTOMATION/INTEGRATION) fehlen |
| Angebot → Projekt → Übergabe | `offers`, `projects` | vollständige Kette (`lib/vertrieb.ts`, `lib/angebot.ts`, `lib/lieferung.ts`) | Nutzung, nicht Fähigkeit (F05) |
| Rechnung/Zahlung | `invoices`, `payments` | Tabellen | Logik in `lib/rechnung.ts` → **BLOCKED_G18** |
| Recherche | `research_cases`, `research_evidence` | kontrolliert, Beförderung explizit | — |
| Beleg/Freigabe | **Code**, nicht DB (`lib/proof.ts` Typen; Einträge in `lib/site-data.ts`) | 5 Umfänge (name/logo/fallstudie/zahl/zitat), Formen, kein `approved: boolean` | Erfassen/Widerrufen in der UI unmöglich ohne Code-Commit; Einträge in G18-Datei → **Beleg-Brücke teilweise BLOCKED_G18** |
| Messung | `owner_load_samples`, `measurement_samples` | vorhanden | — |
| Sitzung | HMAC-Cookie, kein Speicher | Rollen Owner/Vertrieb/Redaktion über getrennte Passwörter | Widerruf (H2) · persönliche Identität |
| Audit-Log | — | **fehlt** | ADM-02/07 |
| Verbindung / Fähigkeit / Ereignis | — | **fehlt** | ADM-04 |
| Automation / Ausführung | — | **fehlt** (Regel-Module `alert`, `kreislauf`, `empfehlung` rechnen, führen nicht aus) | ADM-06 |

### OWN / CONNECT / LINK / OBSERVE

| Arbeitsfeld | Entscheidung | Grund |
|---|---|---|
| Anfragen, Kontakte, Organisationen, Chancen, Chronik | **OWN** | Kern; existiert in Neon |
| Angebot → Projekt → Übergabe | **OWN** (besteht) | Kette gebaut; kein Jira/Asana-Nachbau, kein Gantt/Kanban-Projektmodul |
| Rechnung / Buchhaltung | **OBSERVE** Status (offen/gestellt/bezahlt) · Steuer/Buchhaltung **CONNECT** extern | G18 + keine erfundene USt-Wahrheit |
| E-Mail | **LINK** (`mailto:`, Anfrage manuell mit Quelle `email`) · **CONNECT-LATER** über meAI-Adapter | OD-2 |
| Kalender | **LINK** (`/termin`) | NON-CRITICAL |
| Social (LinkedIn/Meta) | **OBSERVE** als Kanaleintrag im Connection Center, `NOT_CONFIGURED` | NON-CRITICAL, keine erfundene Fähigkeit |
| Dateien / Beleg-Assets | **OWN** Freigabestatus · Dateien **LINK** (bestehender Ablageort) | kein Upload-Dienst ohne Kostenfreigabe |
| Veröffentlichung | **OBSERVE** (`/arbeiten` liest nur freigegebene Projektion) | keine Auto-Veröffentlichung |
| Monitoring | **OBSERVE** (Vercel-Laufzeit, Systemdiagnose im Admin) | kein eigener APM |

### Eingefrorener Abnahmeumfang

Kritisch für OWNER-INDEPENDENT BUILD COMPLETE: **A01–A14, A19–A28, A31, A32** + **B01–B11** (A6/A7).
Mit eingefrorener Präzisierung:
- **A15/A16/A17/A18** gelten für das **Website-Formular** (Doppel-Submit = doppelter Webhook-Ersatz, Zustellfehler = Anbieterfehler) und für das Verbindungsmodell mit mindestens einem Testanbieter-Fixture. Echte LinkedIn/Meta-Verbindung = OPTIONAL.
- **A29/A30 + B12** gelten, weil ADM-06 im Scope ist; meAI-Anbieter/Kosten = Owner. Ohne Freigabe: regelbasierte Aufmerksamkeit (Degraded Mode) muss A30 trotzdem bestehen.
- **A13/A14** Beleg: DB-gestützte Freigabe im Admin wird gebaut; die öffentliche Projektion aus `lib/site-data.ts` bleibt bis G18-Entsperrung `BLOCKED_G18` und zählt dann als benannter Rest.
- **Chancen-Stufen:** bestehende 9 Stufen bleiben Maschinenwerte; ob `discovery`/`audit`/`negotiation` der realen Praxis entsprechen = Beobachtung in LIVE EVOLUTION, kein Umbau ohne Nutzungsbeleg.
- **Nicht im Umfang:** Dark Mode (OD-1), Kampagnen-/Content-Suite, Support-Desk, Buchhaltung, Projektmanagement-Ausbau.

**ADM-00 = `VERIFIED`** (Architektur + Umfang eingefroren). CLOSURE gilt mit Owner-Kenntnisnahme dieser Einstufung.

---

## H1 · Lesepfad schreibt nicht mehr (VERIFIED 16.09.2026)

**Änderung**
- `ready()` ruft nur noch `verifySchema()` (SELECT). Kein Seed, kein Ausschluss.
- `listEnquiries` markiert nicht mehr. Der Lesefilter `sqlLeadOperational` + `isTestEnquiry` hielt Abnahmedatensätze schon vorher unabhängig von der Markierung aus der Inbox — Verhalten für den Owner unverändert.
- **Schreibweg:** `LeadStore.save` → `markLeadExclusions()` (≤3 gezielte UPDATEs, nur wenn eine Regel greift). `createOpportunity` erbt `excluded_reason` im selben INSERT von Anfrage **oder** Organisation **oder** Kontakt (vorher nur Anfrage).
- **Eine Regel:** `exclusionReasonFor()` in `lib/vertrieb-bestand.ts`; `isTestEnquiry` baut darauf auf; `TEST_PREFIXES` jetzt auch Quelle der SQL-Prefixe (vorher zweimal hart codiert).
- **Explizite Wartung:** `npm run db-migrate` spielt nach SCHEMA/BACKFILL den Bestand ein und wendet die Ausschlüsse tabellenweit an; `--check` zeigt Bestand (x von 21) und Ausschlusszähler, **ohne** zu ändern. Produktionssperre unverändert.
- **Gate:** `scripts/check-ausschluss.mjs` (in `postbuild`) — Regel-Fälle inkl. „kein unscharfer Treffer", `ready()` ohne INSERT/UPDATE/DELETE/Seed, kein Markieren im Lesepfad, Schreibweg markiert, Wartung explizit.

**Evidenz**
| Prüfung | Ergebnis | Art |
|---|---|---|
| `tsc --noEmit` | PASS | lokal |
| ESLint geänderte Dateien | PASS | lokal |
| `check-ausschluss` | PASS 31/31 | lokal |
| `crm-drill` §10 gegen Wegwerf-Postgres | PASS — Schreibweg = tabellenweite SQL für Anfrage/Kontakt/Organisation; echte Anfrage unmarkiert; Chance erbt vom Kontakt sofort | reproduziert (DB lokal) |
| `db-drills` (7 Läufe) | PASS | reproduziert (DB lokal) |
| `npm run build` + komplette Gate-Kette | PASS (Exit 0) | Produktions-Build |
| `npm run smoke` (öffentliche Seite + Lead-Route) | PASS 36/36 | Runtime lokal (A32 für geteilten Code) |
| Admin-Seiten schreiben beim Rendern | 0 Treffer (Scan Lesemethoden + `app/(admin)` außer `actions.ts`) | Code |

**Grenzen / Cutover**
- Die §10-Chance nutzt die INSERT-Form von `createOpportunity` im Drill nach (der Store selbst spricht nur Neon-HTTP) — Nachbau, benannt.
- Produktion: erst nach Deploy wirksam (Produktionsautorität). Vorher `npm run db-migrate -- --check` gegen Produktion zeigt, ob der Bestand dort vollständig ist — bisher hat jeder Kaltstart ihn eingespielt, also erwartet 21/21; **nicht gemessen**.
- Wer künftig einen Namen zu `AUSGESCHLOSSENE_NAMEN` hinzufügt, muss `db-migrate` laufen lassen, damit **bestehende** Kontakte/Organisationen/Chancen markiert werden (Anfragen blendet der Lesefilter ohnehin aus). Steht im Kommentar an `markLeadExclusions`.

---

## H4 · Admin-Antworten und Ursprung (VERIFIED 16.09.2026)

**Gemessen vorher** (lokaler Produktions-Build, Test-Zugangsdaten, keine Produktionsgeheimnisse): Seiten `no-store` ✓ · Cookie `HttpOnly; Secure; SameSite=strict; Max-Age=28800` ✓ · `<meta robots noindex>` ✓ · **kein** `X-Robots-Tag` (Seiten, 307, API) · Session-API **ohne** `Cache-Control` · `POST /api/admin/session` mit `Origin: https://evil.example` + richtigem Passwort → **200 + Set-Cookie**.

**Änderung**: `ADMIN_RESPONSE_HEADERS` + `withAdminHeaders` + `sameOrigin` in `lib/admin-session.ts`; Middleware umhüllt jede `/admin*`-Antwort (auch 307/404); Session-Route: POST/DELETE ohne passenden `Origin` → 403, alle Antworten mit Admin-Headern. Gate `scripts/check-admin-antwort.mjs` (postbuild).

**Gemessen nachher**
| # | Anfrage | Ergebnis |
|---|---|---|
| 1 | GET `/admin/login` | 200 · `no-store` · `X-Robots-Tag` · CSP/XFO/Referrer/HSTS weiter vorhanden |
| 2–3 | GET `/admin`, `/admin/gibtsnicht` ohne Sitzung | 307 → Login · `no-store` · `X-Robots-Tag` |
| 4 | POST ohne `Origin` | **403** |
| 5 | POST fremder `Origin`, richtiges Passwort | **403**, kein Cookie |
| 6 | POST eigener `Origin`, falsch | 401 |
| 7 | POST eigener `Origin`, richtig | 200 · Cookie wie vorher |
| 8 | GET `/admin` mit Sitzung | 200 · `no-store` · `X-Robots-Tag` |
| 9 | DELETE fremder `Origin` | **403** |
| 10 | DELETE eigener `Origin` | 200 · Cookie gelöscht |
| 11 | GET `/` (öffentlich) | 200 · **kein** Admin-Header (keine Seiteneffekte auf die Website) |
| E2E | Chromium/Playwright: `/admin` → Login → Passwort + Enter → `/admin` (h1 „Heute") → Abmelden → `/admin` → Login | PASS |

**Offen daraus (nicht H4):** CSP im Admin ist nur die schmale erzwungene Stufe, die volle steht auf Report-Only (seitenweit, `next.config.ts` SEC-3) → B06 in ADM-07. Abmelden widerruft weiterhin nicht serverseitig → H2.

---

## H2 · Sitzungswiderruf + H8 Autorisierung am Schreibpunkt (17.09.2026)

**Änderung**
- Sitzungsformat `<rolle>.<ablauf>.<sid>.<signatur>` — `sid` 32 hex, zufällig je Anmeldung, **mitsigniert** (B04 Fixation). Alte 3-Feld-Sitzungen ungültig → einmal neu anmelden.
- `lib/admin-widerruf.ts`: Tabelle `admin_session_revocations` (Migration **015**, in `SCHEMA` + `.sql`, Schemastand-Gate grün). `sid` = eine Sitzung; `sid='*'` = Stichtag „überall abmelden". Aufräumen abgelaufener Einträge beim nächsten Widerruf.
- `pruefeZugang()` = Signatur + Ablauf + Widerruf — **eine** Prüfung für Middleware **und** Server Actions.
- Middleware: widerrufen → Cookie löschen, `/admin/login?widerrufen=1` (eigener Hinweis). Speicher gestört + ändernde Anfrage → **503**; lesend erlaubt (markiert ungeprüft).
- Tabelle fehlt (015 nicht angewandt) → wie „nicht eingerichtet": kein Widerruf kann übersehen werden → **Deploy vor Migration legt den Admin nicht lahm**.
- `DELETE /api/admin/session` widerruft serverseitig; `?alle=1` nur Owner. Antwort sagt ehrlich `revoked: "server"` oder `"browser-only"`.
- **H8:** `requireStore()` in `actions.ts` prüft `pruefeZugang(aendernd)` + `darfBetreten(rolle, "/admin/vertrieb")` vor jedem Speicherzugriff; alle 27 exportierten Actions laufen darüber (Gate zählt nach, und findet jede weitere `"use server"`-Datei).
- Gates: `check-rollen` verlangt jetzt die mitsignierte `sid`; `check-admin-antwort` §4; `rollen-drill` in `postbuild`.

**Evidenz**
| Prüfung | Ergebnis | Art |
|---|---|---|
| `sitzung-drill` gegen Wegwerf-Postgres (S1–S8) | PASS 19/19 — Kopie nach Abmelden beim Lesen **und** Ändern abgewiesen; andere Sitzung bleibt; neue Anmeldung = neue ID; überall abmelden trifft ältere, nicht neuere; Aufräumen; gestörter Speicher lesen ja/ändern nein; gefälschte `sid` ungültig; fehlende Tabelle legt nichts lahm | reproduziert (DB lokal) |
| `rollen-drill` | PASS (inkl. neue Fälschungsfälle „ohne Sitzungs-ID", „fünf Felder") | lokal |
| `db-drills` 8/8 · build + Gate-Kette · smoke 36/36 · tsc · ESLint | PASS | lokal |
| Laufzeit ohne Speicher | Abmelden → `revoked:"browser-only"`; Kopie gilt weiter (**erwartet und benannt**) | Runtime `next start` |
| Laufzeit Speicher eingerichtet, nicht erreichbar | GET `/admin` 200 · POST `/admin/vertrieb` **503** · Abmelden `browser-only` + Warnung im Log | Runtime `next start` |
| Browser-E2E Anmelden → Heute → Abmelden → Login | PASS; Hinweis `?widerrufen=1` wird angezeigt | Playwright |

**Grenzen / Cutover**
- **Der eigentliche Widerruf über Neon-HTTP ist lokal nicht laufzeitgeprüft** — die SQL ist gegen Postgres geprüft, der Neon-Treiber nur über den gestörten Pfad. Beweis: Preview/Produktion nach Migration 015 (Owner-Autorität): anmelden, Cookie kopieren, abmelden, Kopie → `/admin/login?widerrufen=1`.
- Ohne `LEAD_STORE=neon` bleibt Abmelden browser-lokal — die Systemdiagnose muss das zeigen (ADM-01 · System).
- Jede Admin-Anfrage macht eine zusätzliche Widerrufsabfrage (Actions: zwei). Latenz wird in der Login-/Dashboard-Messung mitgemessen.

---

## H3 · Versuchsfenster über Instanzen (17.09.2026)

**Änderung**: `lib/rate-limit.ts` `durableWithinLimit()` — feste 10-min-Fenster in `rate_limit_windows` (Migration **016**), atomarer Upsert `… RETURNING hits`. Eingesetzt für Admin-Anmeldung und Formular-**Absendung** (Token-Ausgabe bleibt im Arbeitsspeicher). `lib/neon-abfrage.ts` = gemeinsamer schmaler Neon-Zugang (auch von `admin-widerruf` genutzt).
**Datenschutz**: DB nur mit **signiertem** Schlüssel (`bucketKeyIsPseudonymous()`), zusätzlich SHA-256; ohne Geheimnis bleibt die Adresse im Arbeitsspeicher. Fenster > 1 Tag werden gelöscht. Keine IP, kein Name in der Tabelle.
**Degradation**: kein Speicher / Tabelle fehlt / Fehler → bisheriges Arbeitsspeicher-Fenster (Owner wird nicht ausgesperrt).

| Prüfung | Ergebnis | Art |
|---|---|---|
| `versuch-drill` V1–V7 | PASS 13/13 — 10 von 12 erlaubt; **20 getrennte Verbindungen gleichzeitig → genau 5 von 5 erlaubt** (atomar); neues Fenster frei; nur SHA-256-Hex gespeichert; Altfenster geräumt; ohne Geheimnis nichts in der DB; gestörter Speicher → Fallback | reproduziert (DB lokal) |
| `db-drills` 9/9 · build + Gates · smoke 36/36 (inkl. Formular-Ablehnungen) · tsc · ESLint | PASS | lokal |

**Grenze**: Neon-HTTP-Pfad nur über Fallback laufzeitgeprüft; Live-Beweis nach Migration 016 (11 Fehlversuche aus zwei Regionen/Instanzen → 429).
**Rechtlicher Hinweis (Owner, nicht blockierend)**: pseudonyme Missbrauchsabwehr ≤ 1 Tag — ob die Datenschutzerklärung das nennen soll, gehört zu `docs/ops/privacy-persistence-gate.md` (Datenschutztext = G18-gesperrt).

---

## A23 · Berliner Geschäftstag (VERIFIED 17.09.2026)

**Änderung**: `lib/geschaeftszeit.ts` — `GESCHAEFTS_ZEITZONE`, `geschaeftsTag()`, `SQL_HEUTE` = `(now() AT TIME ZONE 'Europe/Berlin')::date`, `datumAnzeige()`, zonenfreie `plusTage`/`wochentag`. Umgestellt: 9 Admin-Seiten (Anzeige + heute), `lib/attention.ts`, 7 SQL-Filter in `vertrieb-store-neon.ts` (fällig/überfällig/Pflege), `betrieb.naechsterWerktag`/`rueckrufOffen` (Eingangstag = Berliner Tag), `vollmacht.abgelaufen`, `ownerlast.messtag`, 8 Zeitpunkt-Anzeigen mit `timeZone`. Reine Datumsarithmetik (`lieferung.livetermin`, DATE-Spalten) bleibt bewusst zonenfrei.

| Prüfung | Ergebnis | Art |
|---|---|---|
| `check-geschaeftszeit` (postbuild) | PASS — 13 Grenzfälle (Mitternacht Sommer/Winter, Sommerzeitbeginn 29.03., -ende 25.10. inkl. doppelter 02:30, Silvester); „00:30 Berlin: gestern = überfällig, in UTC nicht“ (alter Fehler reproduziert); Werktage „Montag 00:30 → Dienstag“; Anzeige DE/TR; Scan: kein UTC-heute, kein `current_date`, keine Datumsanzeige ohne Zone in Admin | lokal |
| `crm-drill` §11 | PASS 9/9 — SQL-Geschäftstag = JS-Geschäftstag an 8 Grenzzeitpunkten gegen Postgres | reproduziert (DB lokal) |
| 24 zonenrelevante/abhängige Drills (betrieb, vollmacht, ownerlast, kundenerfolg, …) | alle Exit 0 | lokal |
| build + Gates · db-drills 9/9 · smoke 36/36 · tsc · ESLint | PASS | lokal |

**BLOCKED_G18**: `lib/rechnung.ts` `faelligAm()` rechnet mit `setDate` (Serverzone) + `toISOString` — Fälligkeit einer Rechnung kann an Mitternacht um einen Tag springen. Fix erst nach G18-Entsperrung (eine Zeile: `plusTage(geschaeftsTag(r.gestelltAm), r.zahlungszielTage)`).

---

## A02 · Anmeldung: Fehlerzustände und Messung (17.09.2026)

**Änderung**: `admin-login-form.tsx` — Zustände `bereit → pruefen → weiter`; 10-s-Zeitlimit (AbortController); eigene Texte für offline, Zeitüberschreitung, Serverstörung (5xx/403), zu viele Versuche, nicht eingerichtet; ein Text für alle Rateergebnisse bleibt; nur ein Rateergebnis leert das Feld; nach Erfolg „Angemeldet — Übersicht wird geladen …“. `not-found.tsx` ohne Navigation (H11). Werkzeug `scripts/admin-login-e2e.mjs` (`npm run admin-e2e`).

| Fehlerzustand (Chromium, `next start`) | Ergebnis |
|---|---|
| F1 falsches Passwort → allgemeine Meldung, Feld geleert | PASS |
| F2 Server antwortet 11,5 s nicht → „nicht rechtzeitig“ nach 10,4 s, Passwort bleibt, Knopf bedienbar | PASS |
| F3 offline → eigene Meldung | PASS |
| F4 429 · F5 500/502 → eigene Meldungen | PASS |
| F6 Enter + Enter + Klick → **genau 1** Anmeldeaufruf | PASS |
| F7 Erfolg: Zustände `pruefen → weiter`, Übersicht „Heute“ erreicht | PASS |
| F8 abgelaufene (korrekt signierte) Sitzung → `/admin/login?abgelaufen=1`, kein geschützter Inhalt | PASS |
| F9 Absenden vor Hydration (JS aus) → kein Passwort in der URL | PASS |

**Messung** — Umgebung: lokaler Produktions-Build (`next start`), Chromium/Playwright, localhost ohne Drosselung, **ohne Datenbank** (Datenlatenz nicht enthalten), Apple-Silicon-Mac, 17.09.2026. Probe = Klick bis Stufe; „kalt“ = erste Anmeldung nach Serverstart (Login-Seite zuvor geladen).

| Stufe | warm n=30 p50 / p95 | kalt n=10 p50 / p95 | Budget |
|---|---|---|---|
| Rückmeldung (Knopfzustand) | 23 / 25 ms | 23 / 23 ms | ≤ 100 ms ✓ |
| Auth-Antwort | 25 / 29 ms | 31 / 35 ms | Timeout 10 s ✓ |
| Adresse `/admin` | 42 / 46 ms | 58 / 62 ms | — |
| Shell nutzbar (h1) | 45 / 49 ms | 61 / 65 ms | ≤ 2 s ✓ |
| Fehler | 0 | 0 | — |

**Was diese Zahlen NICHT sind**: keine Produktionswahrheit. Es fehlen Netzlaufzeit, Vercel-Kaltstart, Neon-Latenz (Widerrufsprüfung + Daten). Produktionsmessung (gleiches Skript gegen Preview) braucht Push/Preview-Zugang → **WAITING_OWNER** (Deployment Protection). Datenbudgets (warm ≤ 3 s, kalt ≤ 5 s) sind lokal **NOT_RUN** (keine Neon-kompatible lokale DB).
**Geprüft statt angenommen**: `x-forwarded-for` ist auf Vercel nicht fälschbar (Vercel überschreibt den Header, Doku „Request headers“, 17.09.2026) — das Versuchsfenster ist nicht per Header umgehbar. Das Messskript setzt ihn nur lokal, damit 40 Proben nicht in 429 laufen.

---

## A19 · Datenzustände je Fläche (VERIFIED lokal 17.09.2026)

**Änderung**: `components/admin/speicher-hinweis.tsx` — `speicherGrund()` (eingerichtet + keine Daten ⇒ nicht erreichbar) und ein Hinweis je Lage; Störung mit „Erneut laden“. Vertriebs- und Kunden-Hülle nutzen ihn; Recherche (Liste + Detail) und Verlust fangen Speicherfehler selbst; Heute nennt „Vertrieb nicht eingerichtet“ bzw. „nicht erreichbar — nicht gemessen“; Beleg nennt die Lage der Messreihe. Werkzeug `scripts/admin-zustaende.mjs` (`npm run admin-zustaende`, Exit ≠ 0 bei Befund).

| Lauf | Flächen | Ergebnis |
|---|---|---|
| ohne Speicher | 16 (inkl. 5 Detailseiten mit unbekannter Kennung) | 16/16 — Zustand „nicht eingerichtet“, nie „erreichbar“, keine Null vor Geschäftsobjekten, kein 5xx, keine Fehlerseite |
| Speicher eingerichtet, tot | 16 | 16/16 — Zustand „nicht erreichbar“, nie „eingerichtet“, keine Null, keine Fehlerseite |

**Ausnahmen, benannt**: `/admin/material` (liest keinen Speicher). `/admin/cockpit` sagt bei gestörtem Speicher „nicht eingerichtet“ — wird mit Heute zusammengelegt (H6, ADM-01), dort neu geprüft.
**Grenze**: „Nicht gefunden“ bei erreichbarem Speicher + unbekannter Kennung ist lokal nicht laufzeitprüfbar (kein Neon) — Code-Pfad `notFound()` unverändert.

---

## ADM-02 · Abfragegrenzen (geprüft 17.09.2026, keine Änderung nötig)

Statische Prüfung aller 32 lesenden Methoden in `lib/vertrieb-store-neon.ts` + Indexliste aus `SCHEMA`:
- Alle **Listen mit Paginierung** (`listEnquiries`, `listOpportunities`, `listContacts`, `listOrganisations`, `listResearch`, `activities`, `summary`) tragen `LIMIT`; Verlust holt bewusst bis 500, Recherche bis 200 und nennt die Grenze.
- **Kein N+1**: keine Abfrage in Schleifen; Heute lädt 3 Abfragen parallel (`Promise.all`).
- **Indizes** auf jeder Filter-/Fremdschlüsselspalte (Status, `next_action_at`, `organisation_id`, `contact_id`, `from_lead_id`, `handling_status`, Aktivitäten `(subject_type, subject_id, created_at DESC)` …).
- **Ohne LIMIT, bewusst**: an einen Datensatz gebundene Beziehungen (`contactsForOrganisation`, `opportunitiesFor*`, `listOffers`, `listProjects`, `listLocations`) und kleine Stammlisten (`organisationChoices`, `enquirySources`; Bestand heute ≈ 21 Organisationen). Eine harte Kappung würde Einträge still verstecken — schlimmer als eine lange Liste. Neu prüfen, wenn Organisationen > 1.000.
- **Suche** `ILIKE '%…%'` ohne Trigramm-Index: bei heutigem Volumen unkritisch; `pg_trgm` erst mit Messung (Kostenfreiheit prüfen).

**ADM-02 = BUILT** (lokal verifiziert: H1–H4, H8, H10–H13, A02, A19, A23, Abfragegrenzen). CUTOVER offen: Deploy + Migrationen 015/016 (Produktionsautorität), Produktionsmessung Login/Daten (Preview-Zugang).

---

## ADM-01 · Sprachfundament + Hülle (17.09.2026)

**Gebaut**
- `lib/admin-i18n/` — `de.ts` (Quelle), `tr.ts` gegen den abgeleiteten Typ `AdminTexte` (fehlender Schlüssel = Build-Fehler, per Wegwerf-Probe belegt), `server.ts` (`adminSprachKontext`: Cookie `cd_admin_sprache` → `Accept-Language: tr` → DE). Admin-Sprache ≠ Kundenkommunikationssprache ≠ Geschäftszeitzone (steht im Code).
- `<html lang>` folgt der Wahl. `SprachUmschalter` auf Anmeldung und in der Hülle: Cookie + `router.refresh()` → Adresse, Filter, Formularinhalt bleiben.
- Hülle nach Ziel-IA: **Übersicht · Anfragen · Kunden & Kontakte · Vertrieb · Nachweise & Freigaben · System** — nur, was die Rolle betreten darf (Sichtbarkeit; Sperre bleibt serverseitig). Aktiv = längster passender Pfad. Mobil einklappbar (`aria-expanded`), 44-px-Ziele.
- Zweisprachig: Hülle, Navigation, Anmeldung (inkl. aller Fehlertexte), Abmelden, Datenbank-Hinweise, Nicht-gefunden, Fehlergrenze (über `<html lang>`).
- Gate `check-admin-sprache` (postbuild): Parität 47/47 Texte, migrierte Dateien dürfen nicht zurückfallen, offener Stand wird gezählt.

| Prüfung | Ergebnis | Art |
|---|---|---|
| `admin-sprache-e2e` S1–S8 | PASS 28/28 — TR per Browser; Umschalten auf Anmeldung behält eingetipptes Passwort; Umschalten in der Hülle behält `/admin/vertrieb/anfragen?status=neu&q=probe`; Wahl überdauert Neuladen; Vertrieb sieht System/Nachweise nicht; mobil 390 eingeklappt, per Tastatur offen, 0 px Überlauf, keine Ziele < 36 px; erster Tab = Sprunglink; **axe WCAG 2.1 AA 0 Verstöße** auf Anmeldung + Übersicht × DE/TR × 1440/390 | Chromium, `next start` |
| `admin-e2e --nur-fehler` 16/16 · `admin-zustaende` 32/32 · build + Gates · smoke 36/36 · öffentliche a11y-Suite | PASS | lokal |

**Offen (gezählt, nicht versteckt)**: 21 Dateien / **≥ 150** feste deutsche Textstellen in Seiten (Untergrenze — Texte in JS-Ausdrücken und Beschriftungen aus `lib/` wie Statusnamen und Aufmerksamkeitstexte zählt die Heuristik nicht). **BLOCKED_G18**: Beschriftungen der Material-/Systempunkte stammen aus `lib/material-status.ts` und bleiben in TR deutsch, bis G18 entsperrt ist.

---

## ADM-01 · Übersicht = Heute + Cockpit (VERIFIED lokal 17.09.2026)

**Gebaut**: `app/(admin)/admin/page.tsx` neu, zweisprachig. (1) Kennzahlen aus `summary()` (exakt, `count(*)`), jede ein Link in die gefilterte Liste; ohne Messung „—“ + „nicht gemessen“. (2) Heute zu tun — operative Punkte mit Rang, Fälligkeit (Berliner Tag, Sprach-Locale), Link auf den Datensatz; Hinweis, wenn die Liste gekürzt ist; ehrlicher Leerzustand mit nächstem Schritt. (3) Systemzustand + Materialvorrat als eine Zeile. (4) Ihre Entscheidungen (5 sichtbar, Rest unter System). `lib/attention.ts` liefert `kennzahlen` und strukturierte Anfragedaten statt eines deutschen Satzes. Cockpit-Register → `components/admin/lage-register.tsx` unter System (nur Owner), `/admin/cockpit` leitet um; `check-cockpit` prüft jetzt Komponente, Umleitung und Owner-Sicht.

**Visuelle Prüfung** (lokale Screenshots, nicht committet: TR 1440 px, DE 390 px) fand und behob zwei Fehler: „Heute zu tun · 0 Punkte“ trotz ungemessenem Vertrieb (**Scheinnull**) und interne Kennungen „(§10.6)“, „(BF-8)“, „(MP10-2.10)“ in Titeln (Anzeige-Filter; Quelle G18 unverändert). `admin-zustaende` erkennt „0 Punkte/madde“ jetzt selbst.

| Prüfung | Ergebnis |
|---|---|
| build + Gates (inkl. `check-cockpit` §5, `check-admin-sprache`) · `admin-zustaende` 32/32 · `admin-sprache-e2e` (axe 0 auf Übersicht DE/TR × Desktop/Mobil) · `admin-e2e` 16/16 · smoke 36/36 | PASS |

**Rest, benannt**: Detailtexte der Betriebs-/Entscheidungspunkte enthalten Umgebungsvariablen und Pfade und sind deutsch — Quelle `lib/material-status.ts` → **BLOCKED_G18**. Mit echter Datenbank (Kennzahlen > 0, Liste gefüllt) lokal nicht laufzeitprüfbar → Preview.

---

## ADM-03 · Kernschleife (BUILT + lokal VERIFIED 17.09.2026)

**Migration 017** (`scripts/migrations/017-kernschleife.sql`): Anfrage ohne Pflicht-Mail/-Telefon, `responsible`, `archive_reason`, `duplicate_of`; Chance `responsible` + `opportunities_from_lead_unique`; Chronik `actor`/`origin`/`data` (alt = NULL = unbekannt). **Cutover-Reihenfolge: erst `db-migrate` (017), dann ausliefern** — die Laufzeit prüft die Spalten als Pflicht. Scheitert der eindeutige Index an vorhandenen Doppel-Chancen, steht die Prüfabfrage in der .sql-Datei.

**Store**: `createEnquiry` (idempotent), `setLeadResponsible`, `setLeadNextAction`, `setLeadOrganisation`, `archiveLead` (Grund; Dublette nur mit Bezug, nichts verschmolzen), `possibleDuplicates`, `setOpportunityResponsible`, `moveOpportunity` (Versionsprüfung → `konflikt`, Historie `{von, nach, grund}`), `listEnquiries({faellig})`, `summary.enquiriesDueToday/Overdue`. Jede Action-Instanz trägt den Akteur (Rolle, `HUMAN`).
**Oberfläche (DE/TR)**: Anfragen-Liste (Hauptaktion „Anfrage erfassen“, Spalten Verantwortlich + nächster Schritt), Anfrage erfassen (feldgenaue Fehler, `aria-invalid/describedby`, Eingaben bleiben), Anfrage-Detail (Beleg, Einordnung, Qualifizieren = Chance anlegen ODER archivieren mit Grund, Dubletten mit „als Dublette archivieren“, rechte Spalte: nächster Schritt, Verantwortlich, Bearbeitung, Zuordnung zu Organisation), Chronik mit Akteur + Herkunft. Chance: Konflikthinweis, Verantwortlich, **Gewonnen → nächster Betriebsschritt** (nichts automatisch). Übersicht zählt fällige Anfrage-Schritte mit.
**Prüfbarkeit**: `LEAD_STORE=pg-lokal` — derselbe Store gegen Postgres auf diesem Rechner (nur localhost).

| Prüfung | Ergebnis | Art |
|---|---|---|
| `kernschleife-drill` K1–K8 (+K3b) | PASS 40/40 — 10× gleichzeitig erfassen = 1; ohne Mail in Inbox; fällig/überfällig; Zuordnung; Dubletten; 10× gleichzeitig Chance = 1; Konflikt überschreibt nichts; Historie; Verlust; Akteur/Herkunft | reproduziert (DB lokal) |
| `admin-kernschleife-e2e` E03–E12, EP, E26, E27 | **PASS, 3 Läufe in Folge + Schlusslauf** — Website- und Hand-Anfrage in Inbox; Validierung; Doppelklick = 1; Zuordnung nach Neuladen; neuer Betrieb = 1 Organisation; Dublette; nächster Schritt **ohne Neuladen sichtbar** + in Übersicht; Doppelklick Chance = 1; Stufe + Chronik „Neu → Qualifiziert · Owner · Mensch“; zwei Tabs → Konflikt, nichts überschrieben; Verlust in Verlust-Schleife; Gewonnen → nächster Betriebsschritt, kein Projekt automatisch; Kundenakte; Abmelden + andere Rolle anmelden → alles da; mobil 390; nur Tastatur | Chromium, `next start`, Postgres lokal |
| Konflikt-Schleife 15× · realistisches Speichern 20×/20× | 15/15 · 20/20 + 20/20 | Chromium |
| `db-drills` 10/10 · build + alle Gates · `admin-e2e` 16/16 · `admin-zustaende` 32/32 · `admin-sprache-e2e` · smoke 36/36 | PASS | lokal |

**Irrwege, offen benannt (damit niemand sie wiederholt)**: Die veraltete Anzeige (H14) habe ich zuerst den Middleware-Headern (H4), dann `router.push`/`redirect`, einer asynchronen Lade-Anzeige, dem Hinweis-Cookie und der Tab-Sichtbarkeit zugeschrieben — jedes Mal per Messung widerlegt, einmal nach einem zufällig grünen Lauf zu früh bestätigt und zurückgenommen. Entscheidend waren eine Baseline aus dem produktiven Stand und eine Halbierung über Git-Worktrees. Übrig geblieben: Erfassen navigiert voll (`location.assign`), Konflikt/Fehler per kurzlebigem Hinweis-Cookie statt Umleitung — beides robust und begründet, nicht mehr als Ursache behauptet.

**Grenzen**: Chance-Detail (Angebot/Lieferung/Stufenregeln), Kundenakte, Beziehungen, Recherche noch deutsch (gezählt: 17 Dateien / ≥123 Stellen). A04 „Kontakt ausdrücklich zuordnen“ nur über Kontaktseite (Organisation ja). Verlustgründe bleiben als gespeicherte deutsche Sätze Schlüssel (keine Datenmigration), Anzeige übersetzt.

---

## H14 · Produktions-Hotfix (vorbereitet 17.09.2026 — Owner-Freigabe im Zug erteilt)

**Owner-Entscheidung 17.09.2026**: H14 sofort als isolierter Hotfix. Migrationen 015/016/017 **nicht** freigegeben (017 erst vor dem ersten Deploy, der sie braucht; vorher Cutover-Paket). Danach Programm ohne weitere Weichenstellung fortsetzen.

| Punkt | Stand |
|---|---|
| Branch / Commit | `hotfix/h14-admin-anzeige` @ **`e1bc9ec`**, abgezweigt von Produktion `814a02f` |
| Diff gegen Produktion | **1 Datei gelöscht**: `app/(admin)/admin/vertrieb/loading.tsx` — sonst nichts (keine ADM-Arbeit, kein DE/TR, kein G18, keine Migration, kein Schema) |
| Wirkung, gemessen auf Produktionsbasis | je Seitenaufruf ein Speichern, Chromium: **vorher 16/20, nachher 20/20** (lokales Postgres, Testadapter nur uncommittet eingespielt und wieder entfernt) |
| Sauberer Stand | tsc ✓ · ESLint ✓ · `npm run build` + alle Gates ✓ · smoke 36/36 ✓ · a11y 132 Durchläufe, 0 Verletzungen ✓ |
| Push | **blockiert** — Berechtigungssystem hat `git push` abgelehnt; Owner führt aus |
| Preview / Promote / Produktions-SHA | offen |
| Nach Deploy | nicht-destruktive Rauchprüfung; kein Anfassen echter Kunden-/Anfragedaten |

---

## Routen-Karte (A4)

| Route | Heute | Schicksal | Ziel | Grund |
|---|---|---|---|---|
| `/admin/leads`, `/admin/leads/:id` | Redirect (307) | `REDIRECT` (besteht) | `/admin/vertrieb/anfragen[/:id]` | Bestand, `next.config.ts:243` |
| `/admin/vertrieb/organisationen[/:id]` | Redirect | `REDIRECT` (besteht) | `/admin/kunden[/:id]` | Bestand, `next.config.ts:290` |
| `/admin` (Heute) | Seite | **ERSETZT** 17.09.2026 | Übersicht (gleiche Adresse) | H6 — Kennzahlen, Heute zu tun, Systemzustand, Entscheidungen |
| `/admin/cockpit` | Seite | **REDIRECT** (serverseitig, 307) 17.09.2026 | `/admin/material#lage` | H6 — Lage-Register unter System, nur Owner; Owner-Freigabe greift vor der Umleitung |
| `/admin/material` | Seite | offen (ADM-01) | Einstellungen/System | Material dominiert nicht die Navigation |
| `/admin/vertrieb`, `/anfragen`, `/beziehungen`, `/pipeline`, `/recherche`, `/verlust` | Seiten | offen (ADM-00 IA) | — | Ziel-IA §Anfragen/Kunden/Vertrieb |
| `/admin/beleg` | Seite | offen | Nachweise & Freigaben | — |

## Schreibpfade (A5)

Noch nicht erhoben — ADM-03.

## Integrationen (A2/A9)

Noch nicht erhoben. Vorab bekannt: Website-Formular → `leads` (eigener Schreibpfad, OWN). meAI in eigenen Repos (`meai`, `meai-os`) — Reuse prüfen. LinkedIn/Instagram: Fähigkeit unbekannt, nicht angenommen.

---

## Owner-Handlungen (max. 3)

Keine offen. (OD-1/OD-2 entschieden 16.09.2026.)

## Session-Log

| Datum | Session | Ergebnis |
|---|---|---|
| 16.09.2026 | 1 | Vertrag + Addendum A1–A10 kanonisiert · Production-Spitze nachgeprüft · G18-Hashes erfasst · ADM-00 Funde H1–H7 |
| 16.09.2026 | 1 | OD-1/OD-2 eingetragen · ADM-00 VERIFIED (Kritikalität, Entitätskarte, OWN/CONNECT, Abnahmeumfang) · **H1 VERIFIED** (`c7619f1`) |
| 16.09.2026 | 1 | **H4 VERIFIED** — Admin-Header + Ursprungsprüfung, vorher/nachher gemessen, Browser-E2E |
| 17.09.2026 | 2 | **H2 BUILT/lokal VERIFIED** (Widerruf, Migration 015) · **H8 VERIFIED** (Actions autorisieren selbst) · H9 rollen-drill repariert |
| 17.09.2026 | 2 | **H3 BUILT/lokal VERIFIED** (Versuchsfenster, Migration 016) |
| 17.09.2026 | 2 | **A23 / H10 VERIFIED** (Berliner Geschäftstag JS + SQL + Anzeige) |
| 17.09.2026 | 2 | **A02 lokal VERIFIED** (9 Fehlerzustände, 30 warm / 10 kalt) · H11 Navigation aus Login-Payload · H12 Login endlich |
| 17.09.2026 | 2 | **A19 VERIFIED lokal** (32 Flächen × 2 Lagen) · H13 |
| 17.09.2026 | 2 | **ADM-01 Sprachfundament + Hülle VERIFIED** (DE/TR, Rolle, mobil, axe 0) |
| 17.09.2026 | 2 | **Übersicht = Heute + Cockpit VERIFIED lokal** (H6) · Scheinnull + Kennungen aus visueller Prüfung behoben |
| 17.09.2026 | 2 | **ADM-03 BUILT/lokal VERIFIED** — Kernschleife Store + UI + Browser-E2E; H14 (veraltete Anzeige, vorbestehend) gefunden und behoben; H15–H17 |
| 17.09.2026 | 3 | Owner: H14-Hotfix freigegeben, Migrationen nicht. Hotfix `e1bc9ec` isoliert gebaut und geprüft (16/20 → 20/20); Push vom Berechtigungssystem blockiert → Owner |

**Fortsetzungspunkt:** ADM-01-Rest parallel zu ADM-05: Chance-Detail/Angebot/Lieferung zweisprachig (größter offener Block), dann Kundenakte + Beziehungen + Recherche. Danach ADM-04 (Verbindungsmodell, ehrlich NOT_CONFIGURED) und ADM-05 (Beleg-Freigaben in DB statt Code — Projektion nach /arbeiten BLOCKED_G18).
