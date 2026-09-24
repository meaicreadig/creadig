# Admin / Owner OS 1.0 · Ledger

> **Maßgebliche Statusquelle** dieses Programms. Vertrag: `docs/admin-os/program.md`.
> Stand **23.09.2026** · Session 5 · Branch `feat/system-haus-site`
> Programmzustand: **PRODUCTION DEPLOYED · LIVE VERIFICATION OPEN** — DB-Ziel MATCH YES (Owner 24.09.2026: lokal cutover-host = Production Neon host `ep-summer-sky-b1eispp7-pooler…/neondb`). Safety-Stop aufgehoben. Offen: Production-Env `LEAD_TOKEN_SECRET`/`RESEND_API_KEY`/`LEAD_FROM`/`LEAD_TO` (nur Preview) → R9/`not_configured`. **nicht** LIVE 99 % ACCEPTED.
> Abnahmematrix: `docs/admin-os/abnahme.md` · Cutover-Paket: `docs/admin-os/cutover.md`.
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
| ADM-01 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` | Cutover mit H14-Hotfix bereits LIVE; Rest = Preview-Deploy dieses Tip (kein Production ohne 017) | Material-Beschriftungen BLOCKED_G18 |
| ADM-02 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` | Cutover: Deploy + `db-migrate` 015/016 in Produktion, danach Widerruf/Versuchsfenster/Login live messen | Produktionsautorität (Owner) | Cutover H1–H4 = Deploy + Migrationen 015/016 (Produktionsautorität) · `rechnung.faelligAm` BLOCKED_G18 |
| ADM-03 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` (lokal VERIFIED) | Cutover: Migration 017 **vor** Deploy; danach echte Anfrage im System (LIVE) | Produktionsautorität (Owner) |
| ADM-04 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` (lokal VERIFIED) | Cutover: mit dem ADM-01/02/03-Paket ausliefern; danach Prüfung gegen die echten Speicher | keiner — **keine CRITICAL-Fähigkeit wartet auf einen Anbieter** (A2) |
| ADM-05 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` (lokal VERIFIED) | Cutover mit Migration 018 | Beleg-Brücke zur öffentlichen Seite + Rechnung = **BLOCKED_G18** |
| ADM-06 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` (lokal VERIFIED) — Automation (A29), meAI (A30/B12), Drilldown (A25) | Cutover mit Migration 019 im selben Paket wie 015–018 | meAI-**Anbieter/Kosten = Owner** (A8·8, optional) — blockiert 99 % **nicht** |
| ADM-07 | 🟢 | 🔴 | 🔴 | 🔴 | `BUILT` (lokal VERIFIED) — A01–A32 + B01–B12 in `abnahme.md` | Cutover-Paket liegt vor (`cutover.md`): O1 Sicherung · O2 Migration · O3 Deploy · O4 Rauchtest | Produktionsautorität (Owner) — **B05/B08 live** und Löschfristen (B11) |

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
| **H18** | `check-cockpit` war seit der DE/TR-Migration blind: Es suchte die deutschen Zustandswörter im Quelltext der Komponente; die stehen seit ADM-01 im Wörterbuch. Das Gate meldete „kennt den Zustand nicht-erhoben nicht", obwohl die Seite alle drei zeigt — **rot committet in `457b236`**. Zweiter Befund derselben Ursache: `<LageRegister />` trägt seither eine Eigenschaft, das Muster verlangte die blanke Form. | reproduziert (Blindprobe) | mittel (Testhygiene) | ADM-04 | **VERIFIED** — prüft jetzt die drei Schlüssel UND beide Wörterbücher; Blindprobe rot, danach grün |
| **H19** | Bei nicht erreichbarem Sitzungsspeicher weist `middleware.ts` jede ändernde Anfrage mit 503 ab (H2, zur sicheren Seite). Im Browser stand davon nur „An unexpected response was received from the server" — der Admin sah aus, als nähme er Eingaben an. | Runtime gemessen (Lauf B, tote Datenbank) | mittel | ADM-04 | **VERIFIED** — `/admin/verbindungen` nennt die Schreibsperre und sperrt die Knöpfe (`aria-describedby`); E2E Lauf B |
| **H20** | Fünf Zustandswechsel der Betriebskette prüften ihre eigene Wirkung nicht: Die Bedingung stand im `UPDATE`, das Ergebnis las niemand. Ein zweiter Klick auf „Angebot senden“ änderte nichts, **meldete Erfolg und schrieb eine zweite Chronikzeile** — in dem Protokoll, das die einzige Quelle darüber ist. Betroffen: `sendOffer`, `acceptOffer`, `acceptDelivery`, `handOver`; `addProjectChange` schrieb ausserdem eine gelesene Liste ganz zurück (verlorener Schreibvorgang bei zwei Menschen, doppelter Eintrag bei einem Doppelklick) — und eine Projektänderung ist Geld. | reproduziert (`betriebskette-drill`, Blindprobe gegen den alten Stand: 14 Befunde) | **hoch** | ADM-05 | **VERIFIED** — Bedingung + `RETURNING`-Prüfung je Wechsel, Anhängen atomar in einer Anweisung; 34/34 |
| **H21** | Die Befunde und Mängel der Angebots- und Lieferkette entstanden als deutsche Sätze im Server (`lib/angebot.ts`, `lib/lieferung.ts`, Store) und wurden unübersetzt angezeigt — auch in der türkischen Oberfläche. Dasselbe galt für Reifekriterien, Projektzustände, Übergabestücke und die Markthypothesen. Das Sprach-Gate konnte es nicht sehen: Es zählt sichtbaren deutschen Text im JSX, nicht Text, der über eine Server Action ankommt. „ADM-01 · 0 offene Textstellen“ galt deshalb nur für die Oberfläche, nicht für alles, was ein Mensch liest. | Code + gerendert (`befund-sprache-e2e`) | mittel (A01) | ADM-05 | **VERIFIED** (17.09.2026) — Befund/Mangel sind Maschinenwerte, der Satz entsteht im Wörterbuch (`lib/admin-i18n/befund.ts`); Gate §3 prüft 61 Maschinenwerte + 6 Hypothesen in DE **und** TR, Blindprobe rot; bewusst deutsch bleiben Paketnamen und die Abschnittsüberschriften des Angebots — sie benennen ein Dokument, das der Kunde auf Deutsch bekommt |
| **H17** | `.env.local` enthält eine echte `DATABASE_URL`; Next füllt auch LEER gesetzte Variablen daraus → Prüfskripte mit `DATABASE_URL: ""` konnten eine echte DB erreichen (Rauchtest schickt Formularanfragen). Kein Vorfall (kein `LEAD_STORE` in `.env.local`). | Runtime gemessen | hoch (Risiko) | ADM-03 | **VERIFIED** — alle next-start-Skripte `LEAD_STORE=aus` + `.invalid`; Gate `check-pruefumgebung` |
| **H22** | Admin-Seitenleiste `lg:h-dvh` ohne Überlauf: Bei 1280×720 und acht Bereichen lag „Abmelden“ unterhalb des sichtbaren Rands — nicht erreichbar. Wächst mit jedem neuen Bereich. | gemessen (Kernschleifen-E2E, 1280×720) | mittel (Sicherheit: Abmelden) | ADM-06 | **VERIFIED** (22.09.2026) — `lg:overflow-y-auto`; EP „Abmelden, neu anmelden“ grün |
| **H23** | `primitives.tsx` importierte `adminTexte` → das **gesamte** Admin-Wörterbuch (DE+TR) lag im Browser-Paket der **Anmeldeseite**: für Unangemeldete lesbar (Art H11) und Erstpaket 144 → 156 kB gewachsen. | Build-Ausgabe + Code | mittel | ADM-06 | **VERIFIED** (22.09.2026) — wörterbuchgebundene Bausteine nach `components/admin/primitives-i18n.tsx`; `/admin/login` Erstpaket **113 kB** |
| **H24** | meAI „Nächster Schritt“: Ohne gewählte Angebotsart wurde die Reife als `[]` = „nichts offen“ übergeben → Vorschlag „Das Angebot schreiben — die Belege tragen es“ für einen Vorgang, an dem nichts geprüft war. Unbekannt als erfüllt gelesen — genau der Fehler, den A8·3 verbietet, nur vor dem Modell statt im Modell. | gerendert (E30-Screenshot) | mittel (A30) | ADM-06 | **VERIFIED** (22.09.2026) — fehlende Wahl ist selbst der offene Beleg (`angebotsart`); Eval-Fall `ohne-angebotsart`; E30 prüft es im Browser |
| **H25** | `kernschleife-drill` hatte „morgen“ als festes Datum `2026-09-18` → ab 18.09. rot (Zeitbombe), `db-drills` 12/13. | reproduziert 22.09.2026 | niedrig (Testhygiene) | ADM-06 | **VERIFIED** — relativ zum Berliner Geschäftstag (`plusTage(geschaeftsTag(), 1)`); db-drills 13/13 |
| **H26** | Übersicht: „Überfällig“ und „Heute fällig“ zählten Chancen **und** Anfragen (`count(*)`), führten aber auf `#heute-titel` — eine Liste mit höchstens zwölf Einträgen je Art. Bei mehr als zwölf widersprach die Liste der Zahl; eine vollständige Liste gab es für Anfragen gar nicht (kein Fälligkeitsfilter in der Inbox). | Code | mittel (A25) | ADM-06 | **VERIFIED** (22.09.2026) — Kachel zeigt Summe + zwei Wege (Chancen → `pipeline?bucket=…`, Anfragen → `anfragen?faellig=heute\|ueberfaellig`), Filter mit derselben Bedingung wie `summary()`; E25: Kachel = Zeilen dahinter für alle vier Kennzahlen, Filter bleibt bei der Suche |
| **H27** | `notFound()` stand in einem `try`, dessen `catch` „Datenbank nicht erreichbar“ antwortete. Eine erfundene Datensatz-Kennung ergab **200 mit Störungsmeldung** statt 404 — A21 verletzt und A19 gleich mit: Das Haus behauptete eine Störung, die es nicht gab. Betroffen: Chance, Kunde, Kontakt (die Anfrage hatte eine eigene Kopie der Regel). | gemessen (`abnahme-e2e` §A21) | hoch | ADM-07 | **VERIFIED** (22.09.2026) — `lib/navigationsfehler.ts`, eine Regel für alle vier |
| **H28** | Im Admin galt nur die kleine CSP; die vollständige lief als Bericht. Die Begründung dafür („statische Seite, keine fremden Eingaben“) trifft im Admin auf **keinen** der beiden Punkte zu. Ein zweiter `headers()`-Eintrag half nicht — die Konfiguration überschreibt die Middleware, gemessen. | gemessen (`abnahme-e2e` §B06) | mittel | ADM-07 | **VERIFIED** (22.09.2026) — `lib/csp.ts` über `ADMIN_RESPONSE_HEADERS`, allgemeine Regel nimmt `/admin` aus |
| **H29** | Ein abgestürzter Prüflauf liess seinen Server auf dem Port stehen (`npm exec` bekam SIGTERM, das Kind nicht). Der nächste Lauf mass die **alte** Fassung — drei „Befunde“ waren Gespenster. Eine Prüfung, die still am falschen Objekt misst, ist schlimmer als keine. | reproduziert 22.09.2026 | hoch (Testwahrheit) | ADM-07 | **VERIFIED** — Port wird vorher geprüft (lauter Abbruch), Prozessgruppe wird beendet |
| **H30** | Türkische Suche fand `Işık` nur bei exakt `Işık`: `ş`/`ı` sind eigene Buchstaben, `ILIKE` kennt sie nicht als Variante. Bei einer Nische, die ausdrücklich türkischsprachige Betriebe sind, ist das keine Suche. | gemessen (`abnahme-e2e` §A24) | mittel (A24) | ADM-07 | **VERIFIED** — `lib/tuerkisch.ts`, vier Suchpfade, Wort und Spalte auf denselben Nenner |
| **A28** | Ungespeicherte Eingaben verschwanden beim Klick auf einen anderen Bereich — ohne Nachfrage, ohne Spur. | Code + gemessen | mittel (A28) | ADM-07 | **VERIFIED** — `components/admin/ungespeichert-wache.tsx`, Filter-/Suchformulare ausdrücklich ausgenommen |
| **B11** | Eine Auskunft über eine Person gab es nicht — weder Weg noch Datei. Die Spuren eines Menschen liegen in fünf Tabellen; von Hand zusammengetragen fehlt beim dritten Mal eine. | Code | mittel (B11) | ADM-07 | **VERIFIED** — `lib/auskunft.ts` + Owner-Route + Vermerk ohne Inhalt; Löschung mit Fristenkonflikt bleibt Owner |

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
| Verbindung / Fähigkeit / Ereignis | **Code + Umgebung**, bewusst keine Tabelle (A9) | Inventar, 7 Zustände, drei Ebenen, Prüfprotokoll je Instanz | **gebaut in ADM-04** — eine Verbindung mit echtem Anbieter erst, wenn der Owner eine freigibt |
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

## ADM-04 · Verbindungen (BUILT + lokal VERIFIED 17.09.2026)

**Kein zweiter Wahrheitsspeicher, keine Migration.** Der Zustand jedes Kanals wird aus Code und Umgebung
dieser Instanz ABGELEITET (`lib/verbindungen.ts`) — eine eigene Verbindungstabelle hätte neben der
Umgebung gestanden und wäre auseinandergelaufen (A9). Gemessen wird getrennt und nur auf Auslösung
(`lib/verbindungen-pruefung.ts`); die Seite ruft beim Rendern kein fremdes System an (H1).

**Drei Ebenen je Kanal** — Fähigkeit · Autorisierung · Adresse. Ein Profillink wird nie als Verbindung
gezählt: Das Gate prüft strukturell, dass jede Karte mit Adresse den Zustand `LINK_ONLY` trägt.

| Fähigkeit | Einstufung | Zustand ohne Einrichtung | Zustand eingerichtet | prüfbar |
|---|---|---|---|:--:|
| Website-Anfrageformular | **CRITICAL** | `NOT_CONFIGURED` | `CONNECTED` | ja (liest eine Zeile) |
| Anfrage von Hand | **CRITICAL** | `NOT_CONFIGURED` | `CONNECTED` | ja (liest Kennzahlen) |
| E-Mail-Eingang | OPTIONAL | `NOT_CONFIGURED` (kein Adapter im Repo) | — | nein |
| E-Mail-Versand | OPTIONAL | `NOT_CONFIGURED` | `CONNECTED` | nur Einrichtung — **kein Testversand** |
| Terminseite · WhatsApp | OPTIONAL | `LINK_ONLY` | — | nein |
| LinkedIn · Meta/Instagram | OPTIONAL | `NOT_CONFIGURED` | — | nein |
| Prüfstand (Testanbieter) | OPTIONAL | nur mit `VERBINDUNG_FIXTURE=an`, nie in Produktion | — | — |

**Die Frage oben:** „Kommt eine Anfrage an?" zählt ausschliesslich CRITICAL. Ein nicht eingerichteter
LinkedIn-Kanal löst keine Warnung aus — eine Warnung, die immer steht, wird nach dem dritten Mal Tapete.

**Prüfung behauptet nur, was sie getan hat.** Ergebnis trägt `reichweite`: `gemessen` (Gegenstelle hat
geantwortet, mit Dauer) oder `konfiguration` (nur Einrichtung, nichts gesendet). Zeitgrenze 8 s. Das
Protokoll liegt im Arbeitsspeicher der Instanz und sagt das auf der Seite — eine gespeicherte Messung von
vorgestern sähe aus wie ein Zustand.

**Rolle:** `/admin/verbindungen` ist Owner-only (`eigene-lage`). Sie nennt keinen Menschen, ist aber die
Landkarte der Zugänge; `vertrieb` braucht sie für keine Aufgabe, und sie löst Prüfungen gegen fremde
Systeme aus.

| Prüfung | Ergebnis | Art |
|---|---|---|
| `verbindung-drill` V0/V1/V1b · A15–A18 · V2 | PASS 58/58 — Inventar ehrlich · Zustand folgt Umgebung · Prüfstand nie in Produktion · verbinden/widerrufen idempotent · 10× gleichzeitig derselbe Schlüssel = 1 Wirkung · Widerruf lehnt ab · Anbieterfehler = `DEGRADED` mit erhaltener Erlaubnis · jeder Maschinenwert in DE **und** TR | rein, ohne Server |
| `check-verbindungen` (Gate, in `postbuild`) | PASS — Fläche angemeldet + Owner-only · Seite misst nicht beim Rendern · jede Action prüft selbst · Prüfstand in Produktion hart aus · Prüfpfad ohne `fetch`/Versand/Schreiben · eingefrorene Kritikalität | statisch |
| `verbindungen-e2e` — 3 Welten, 46 Prüfungen | **PASS** — A: nicht eingerichtet, Prüfung meldet es, Vertrieb kommt nicht hinein, kein Prüfstand · B: Schreibsperre benannt, Knopf gesperrt (H19) · C: echte Postgres, „Antwortet." in 4 ms, A15–A18 im Browser, TR ohne deutschen Rest, mobil 390 ohne Überlauf, axe 0 in drei Lagen | Chromium, `next start`, Postgres lokal |
| `admin-zustaende` mit neuer Route | **34/34** (vorher 32) | gerendert, 2 Lagen |
| build + alle Gates · `admin-e2e` · `admin-sprache-e2e` · smoke | PASS | lokal |

**A2-Stand:** Keine CRITICAL-Fähigkeit hängt an einer Anbieterfreigabe. Der Eingang ist vollständig in
eigener Hand (Formular + Handerfassung); LinkedIn/Meta/Kalender/WhatsApp bleiben OPTIONAL und
`NOT_CONFIGURED`, ohne 99 % zu blockieren. **ADM-04 ist damit nicht `WAITING_EXTERNAL`.**

**Grenze, offen benannt:** Der Prüfstand beweist das MODELL (A15–A18), nicht einen Anbieter. Sobald der
Owner eine echte Integration freigibt, wird sie gegen dasselbe Modell gebaut — die Karte, die Zustände
und das Gate stehen schon.

---

## ADM-05 · Betrieb, Kommerz, Beleg (BUILT + lokal VERIFIED 17.09.2026)

### 1 · Die Betriebskette geschieht genau einmal (H20)

Angebot senden · zusagen · Material · Abnahme · Übergabe sind **Geschäftshandlungen**, keine
Speichervorgänge. Fünf von ihnen prüften ihre eigene Wirkung nicht: Die Bedingung stand im `UPDATE`,
das Ergebnis las niemand. Jeder Wechsel trägt jetzt seine Bedingung **und** eine `RETURNING`-Prüfung;
kam keine Zeile zurück, wird nichts behauptet, sondern gesagt, was der Fall ist. `addProjectChange`
hängt in **einer** Anweisung an (`changes || $2` mit `NOT changes @> $2`) — kein verlorener
Schreibvorgang, kein doppelter Eintrag.

### 2 · Erlaubnisse als Datensatz statt als Commit (A13/A14)

**Migration 018** (`scripts/migrations/018-freigaben.sql`): Tabelle `releases` — Person, Rolle, Firma,
Form, Datum, Umfänge, Fundstelle, Widerruf mit Grund, Akteur. Eindeutiger Index
(`Organisation, Mensch, Form, Datum, Fundstelle`) macht das Erfassen idempotent.

Bis heute stand die Zustimmung eines Kunden ausschliesslich als Code in `lib/site-data.ts`: Erfassen
hiess committen, **Widerrufen hiess committen und ausliefern**. Ein Kunde, der anruft, darf darauf
nicht warten.

Oberfläche unter `/admin/beleg` (Owner-only, DE/TR): Liste mit Zustand, Umfängen, Person, Form, Datum,
Fundstelle und Akteur · Erfassen mit feldgenauen Fehlern · **die Form begrenzt den Umfang sichtbar**
(eine öffentliche Bewertung trägt ein Zitat, kein Logo — `FORM_SCOPES`) · Zurückziehen mit Pflichtgrund,
**ohne die Zeile zu löschen**.

**Die Grenze steht VOR der Liste, nicht darunter:** Dieses Register hält die Erlaubnis fest und setzt
sie **nicht** durch. Die öffentliche Projektion liest weiterhin `lib/site-data.ts` (G18) — ein Widerruf
hier nimmt auf creadig.de nichts herunter. Wer das nicht sagt, baut eine Freigabeverwaltung, auf die
sich jemand verlässt.

| Prüfung | Ergebnis | Art |
|---|---|---|
| `betriebskette-drill` B1–B7 | **34/34** — zweimal senden = einmal; 10× gleichzeitig = 1 Zusage; Projekt/Fristbeginn einmal; dieselbe Änderung zweimal = 1, zehn verschiedene gleichzeitig = 10; Abnahme und Übergabe je einmal und nur in der richtigen Reihenfolge; je genau **eine** Chronikzeile | Postgres lokal |
| Blindprobe gegen den alten Stand | **14 Befunde** — der Probelauf ist nicht dekorativ | Postgres lokal |
| `freigabe-drill` F1–F8 | **PASS** — erfassen mit Akteur und Chronik; 10× gleichzeitig = 1; ohne Erlaubnis deckt nichts (A13); Form begrenzt Umfang; Widerruf wirkt sofort, Zeile und Umfang bleiben lesbar (A14); zweiter Widerruf wirkt nicht erneut; **der Widerruf des Namens lässt die Fallstudie mitfallen**, eine neue Namensfreigabe trägt sie wieder | Postgres lokal |
| `freigabe-e2e` G1–G10 | **34/34** — Warnung vor der Liste; feldgenaue Fehler mit `aria-describedby`; gesperrte Umfänge mit Grund; erfassen, doppelt erfassen, widerrufen; Vertrieb kommt nicht hinein; TR ohne deutschen Rest; axe 0 in DE und TR | Chromium, `next start`, Postgres lokal |
| `db-drills` **12/12** · `admin-zustaende` 34/34 · build + alle Gates | PASS | lokal |

### 3 · Was in ADM-05 offen bleibt

| Punkt | Warum | Wer |
|---|---|---|
| Widerruf wirkt auf creadig.de | Die öffentliche Projektion liegt in `lib/site-data.ts` — **BLOCKED_G18** | Owner (G18-Entsperrung) |
| Rechnung/Zahlung im Betriebsablauf | `lib/rechnung.ts` — **BLOCKED_G18** | Owner |

### 4 · H21 · Was der Server findet, in der Sprache des Menschen davor

Befund und Mangel sind seit dem 17.09.2026 **Maschinenwerte** (`bereich`, `code`, `werte`); den Satz baut
`lib/admin-i18n/befund.ts` aus dem Wörterbuch. Dasselbe gilt für Reifekriterien, Pflichtabschnitts-Regeln,
Übergabestücke, Projektzustände und die Markthypothesen im Verlust-Register.

**Die Trennlinie, ausdrücklich gezogen:** Übersetzt wird, was eine **Regel dieses Hauses** ist. Nicht
übersetzt wird, was ein **Name in einem Kundendokument** ist — Paket- und Produktnamen, die
Abschnittsüberschriften des Angebots („06 Preis“), gespeicherte Verlustgründe. Wer auf Türkisch
„06 Fiyat“ liest und dann deutschen Text in einen Abschnitt tippt, der beim Kunden „06 Preis“ heißt,
arbeitet an einem Dokument, das er nicht sieht.

| Prüfung | Ergebnis |
|---|---|
| `check-admin-sprache` §3 (neu, in `postbuild`) | 61 Maschinenwerte + 6 Hypothesen in DE **und** TR · Gegenprobe: die Domänenmodule bauen keine fertigen Sätze mehr · **Blindprobe** (neuer Code ohne Text) → rot |
| `befund-sprache-e2e` S1–S5 | **11/11** — unvollständiges Angebot senden: Befunde türkisch, der alte deutsche Satz kommt nicht mehr vor; Reifekriterien türkisch; Abschnittsüberschrift bleibt deutsch; auf Deutsch stehen die deutschen Sätze |
| `admin-sprache-e2e` · `admin-e2e` 18/18 · `admin-kernschleife-e2e` 33/33 · `admin-zustaende` 34/34 · `db-drills` 12/12 | PASS |

---

## H14 · Produktions-Hotfix (LIVE 17.09.2026)

**Owner-Entscheidung 17.09.2026**: H14 sofort als isolierter Hotfix. Migrationen 015/016/017 **nicht** freigegeben (017 erst vor dem ersten Deploy, der sie braucht; vorher Cutover-Paket). Danach Programm ohne weitere Weichenstellung fortsetzen.

| Punkt | Stand |
|---|---|
| Branch / Commit | `hotfix/h14-admin-anzeige` @ **`e1bc9ec`**, abgezweigt von Produktion `814a02f` |
| Diff gegen Produktion (Git) | **1 Datei gelöscht**: `app/(admin)/admin/vertrieb/loading.tsx` — sonst nichts |
| Wirkung, gemessen auf Produktionsbasis | je Seitenaufruf ein Speichern, Chromium: **vorher 16/20, nachher 20/20** |
| Sauberer Stand (vor Push) | tsc ✓ · ESLint ✓ · build + Gates ✓ · smoke 36/36 ✓ · a11y 132/0 |
| Push | **OK** — `origin/hotfix/h14-admin-anzeige` = `e1bc9ec` |
| Preview (Ready) | `creadig-4697jyv42-…` · `dpl_735VNT8YTYXodjX9VxuXvEnHk82u` · Branch-Alias `creadig-git-hotfix-h14-adm-c64229-…` |
| **Production (promoted)** | **`dpl_7siNz9VcwZJnkjdAsRq5gbRx7U2w`** · URL `creadig-qxsfr8p2v-muhammed-emin-akyols-projects.vercel.app` · Status **Ready** · **Aliases: `creadig.de`, `www.creadig.de`, `creadig.vercel.app`** (+ Branch-Alias) |
| Produktions-SHA | **`e1bc9ec`** (CLI `inspect --json` liefert kein `meta`; belegt über Branch-Alias auf demselben Deployment + Git tip = `e1bc9ec`; Diff zu `814a02f` = nur `loading.tsx`) |
| Nicht-destruktive Rauchprüfung | `GET /` 200 · `GET /admin/login` 200 · `Cache-Control: private, no-store` auf Login · kein Schreiben auf echte Kunden-/Anfragedaten |
| Hinweis | Login-Payload kann weiterhin „Anfragen, Pipeline“ enthalten — das ist **H11** (Not-Found → Shell), nicht Teil dieses Hotfixes und nicht auf diesem Production-Stand behoben |

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
| `/admin/verbindungen` | **NEU** 17.09.2026 | — | — | ADM-04 · Verbindungsverzeichnis, Owner-only, in der Navigation zwischen Nachweisen und System |

## Schreibpfade (A5)

**Erhoben 17.09.2026** über alle 33 Server Actions (`app/(admin)/admin/vertrieb/actions.ts`, `app/(admin)/admin/verbindungen/actions.ts`) und die Methoden dahinter. Geprüft je Pfad: Doppel-Submit · veraltetes Schreiben · Race · Wirkung belegt · zweite Geschäftswirkung.

**Gemeinsame Grundlage aller Pfade:** Jede Action prüft am Schreibpunkt selbst Sitzung, Widerruf und Rolle (H8) — die Middleware ist nicht die einzige Sperre. Jede schreibende Anfrage wird abgewiesen, solange der Sitzungswiderruf nicht prüfbar ist (H2); die Oberfläche sagt das inzwischen auch (H19).

### 1 · Erzeugende Pfade — eine Wiederholung wäre ein zweiter Datensatz

| Pfad | Schutz | Beleg |
|---|---|---|
| Anfrage erfassen (`createEnquiry`) | Idempotenzschlüssel aus dem Formular | `kernschleife-drill` K1: 10× gleichzeitig = 1 |
| Chance anlegen (`createOpportunity`) | eindeutiger Index `opportunities_from_lead_unique` (017) + `ON CONFLICT` | K5: 10× gleichzeitig = 1 Chance, 1 Chronikzeile |
| Projekt aufsetzen (`startProject`) | `ON CONFLICT (offer_id) DO NOTHING` + Zeilenprüfung | `betriebskette-drill` B3 |
| Angebotsentwurf (`saveOfferDraft`) | `ON CONFLICT (id) DO UPDATE`; gesendet/angenommen wird nie überschrieben | G17 + B1 |
| Standort anlegen (`createLocation`) | **kein** Idempotenzschlüssel — ein Doppelklick legt zwei an | bewusst: sichtbar in derselben Liste, in einem Klick löschbar, keine Aussenwirkung |

### 2 · Zustandswechsel — eine Wiederholung wäre eine zweite Geschäftshandlung

Alle mit Bedingung im `UPDATE` **und** `RETURNING`-Prüfung: Kam keine Zeile zurück, geschieht nichts und wird nichts behauptet.

| Pfad | Bedingung | Chronik |
|---|---|---|
| Stufe wechseln / gewinnen / verlieren (`moveOpportunity`) | `updated_at` des gelesenen Stands → sonst `konflikt` | genau eine, mit `{von, nach, grund}` |
| Angebot senden (`sendOffer`) | `state = 'entwurf'` | genau eine (**H20**) |
| Zusage (`acceptOffer`) | `state = 'gesendet'`; Vorgang wird erst danach auf gewonnen gesetzt | genau eine (**H20**) |
| Materialeingang (`receiveMaterial`) | `state = 'aufgesetzt'` | genau eine — die Frist beginnt einmal |
| Abnahme (`acceptDelivery`) | `state = 'laeuft'` | genau eine (**H20**) |
| Übergabe (`handOver`) | `state = 'abgenommen'` | genau eine (**H20**) |
| Anfrage archivieren (`archiveLead`) | Zeilenprüfung, Dublette nur mit Bezug | genau eine |
| Bearbeitungsstand (`setLeadHandling`) | Zustandsliste geprüft, sonst keine Änderung | genau eine |

### 3 · Anhängende Pfade

| Pfad | Schutz | Beleg |
|---|---|---|
| Projektänderung (`addProjectChange`) | `changes \|\| $2` **und** `NOT (changes @> $2)` in EINER Anweisung — kein verlorener Schreibvorgang, kein doppelter Eintrag | B5: 10 verschiedene gleichzeitig = 10, dieselbe zweimal = 1 |
| Recherche-Beleg (`addEvidence`) | Belege werden nie ersetzt, nur abgelöst (`supersedeEvidence`) | G10/G11 |

### 4 · Feldsetzer — der letzte Schreibvorgang gilt

`setLeadResponsible` · `setLeadNextAction` · `setLeadOrganisation` · `setOpportunityResponsible` · `setOpportunityNextAction` · `setOpportunityNote` · `updateOpportunityOffer` · `updateContactRelationship` · `updateContactDetails` · `updateContactNextTouch` · `updateContactOrganisation` · `updateOrganisationDetails` · `updateOrganisationLifecycle` · `updateResearchCase` · `linkResearchContact` · `setContactSource` · `decideContact` · `updateLocation` · `deleteLocation`

**Entschieden, nicht übersehen:** Diese Pfade haben keine Versionsprüfung. Ein zweiter Klick schreibt denselben Wert (keine zweite Wirkung); zwei Menschen auf demselben Feld überschreiben sich. In einem Haus mit drei Rollen ist das tragbar — **und es bleibt sichtbar**: Jeder dieser Pfade schreibt eine Chronikzeile mit Akteur, Herkunft und Zeitpunkt. Wer den Verantwortlichen überschrieben hat, steht danach in der Akte. Eine Versionsprüfung kommt dort hinzu, wo ein Feld Geld trägt — das sind heute genau die Pfade aus Abschnitt 2, und dort ist sie gebaut.

### 5 · Verbindungen (ADM-04)

| Pfad | Schutz |
|---|---|
| Verbindung prüfen | rein lesend; kein Versand, keine Zeile in einem fremden System; Zeitgrenze 8 s |
| Prüfstand verbinden/widerrufen | idempotent, zweiter Aufruf meldet „keine zweite Wirkung“ |
| Prüfstand-Ereignis | Idempotenzschlüssel aus dem Stand — zwei Klicks in derselben Sekunde ergeben eine Wirkung |

## Integrationen (A2/A9)

**Erhoben 17.09.2026** — Quelle: `lib/verbindungen.ts` (abgeleitet aus Code + Umgebung), sichtbar unter `/admin/verbindungen`.

| Fähigkeit | Einstufung | Adapter im Repo | Autorisierung | Reuse-Entscheidung (A9) |
|---|---|---|---|---|
| Website-Formular → `leads` | **CRITICAL** | ja (`app/api/lead/route.ts` → `storeLead`) | öffentlich + Token/Fingerprint | OWN, bleibt |
| Anfrage von Hand | **CRITICAL** | ja (ADM-03 `createEnquiry`) | Admin-Sitzung + Rolle | OWN |
| E-Mail-Versand (Resend) | OPTIONAL | ja (ausgehend) | `RESEND_API_KEY` | bestehend, kein zweiter Versandweg |
| E-Mail-Eingang | OPTIONAL | **nein** — echter Adapter nur im meAI-Altprodukt (andere DB) | — | **kein zweiter Mail-Speicher**; falls gebaut: `lib/meai/mail` wiederverwenden |
| Kalender | OPTIONAL | nein (nur `/termin`) | — | LINK, kein Sync |
| WhatsApp | OPTIONAL | nein (nur `wa.me`) | — | LINK |
| LinkedIn · Meta/Instagram | OPTIONAL | nein | kein OAuth | OBSERVE, ehrlich `NOT_CONFIGURED` |
| Prüfstand (Testanbieter) | — | Fixture, Arbeitsspeicher | Fixture-Token | nie Produktion (`VERBINDUNG_FIXTURE` + `VERCEL_ENV`-Sperre) |

**Folge für A2:** Keine CRITICAL-Fähigkeit hängt an einer fremden Freigabe. Das Programm ist deshalb wegen Integrationen **nicht** `WAITING_EXTERNAL`.

---

## Owner-Handlungen (max. 3)

**Drei offen — der Cutover, als drei Befehle.** Vollständig in `docs/admin-os/cutover.md` §10:

| # | Befehl | Blockiert |
|---|---|---|
| **O1** | `npm run cutover-preflight` (nur lesend) | alles Weitere |
| **O2** | `cutover-sicherung` → `cutover-migration` → `cutover-nachpruefung` | Betrieb mit dem neuen Stand |
| **O3** | nach dem Promote: `npm run cutover-live` | `LIVE 99 % VERIFIED` |

**Warum der Agent es nicht selbst tut** (gemessen 23.09.2026, `cutover.md` §11):
In seiner Umgebung sind alle Produktionszugangsdaten maskiert (`.env.local`
liefert `[SENSITIVE]`), `vercel env pull` ist gesperrt. Er erreicht die
Produktionsdatenbank nicht und kann sich am Live-Admin nicht anmelden. Das
Promote selbst könnte er (Vercel-Zugang besteht) — es kommt aber erst **nach**
der Migration, weil der neue Stand 017 braucht.

Nicht blockierend: meAI-Anbieter/Kosten (A8·8) · Aufbewahrungsfristen für die
Löschung je Person (B11) · Dark Mode (POST-99, OD-1).

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
| 17.09.2026 | 3 | **H14 LIVE** — Push OK · Promote Ready · Production `dpl_7siNz9VcwZJnkjdAsRq5gbRx7U2w` / `creadig-qxsfr8p2v` · Aliases `creadig.de` · SHA `e1bc9ec` · Rauchprüfung GET `/` + `/admin/login` 200 · Migrationen unberührt |

| 17.09.2026 | 4 | **ADM-01 DE/TR CLOSED lokal** — Gate 34 migriert / 0 offen / 823 Texte; Chance/Angebot/Lieferung + Listen + Detail + Beleg/Material/Lage/Error/Primitives (Material-Labels BLOCKED_G18) |
| 17.09.2026 | 4 | **ADM-04 BUILT/lokal VERIFIED** — Verbindungsverzeichnis `/admin/verbindungen` (DE/TR, Owner-only), Fähigkeit ≠ Autorisierung ≠ Adresse, Prüfung getrennt von Ableitung, Prüfstand für A15–A18; Gate + Drill in `postbuild`; H18 (blindes Cockpit-Gate) und H19 (stille Schreibsperre) gefunden und behoben |
| 17.09.2026 | 4 | **ADM-05 BUILT/lokal VERIFIED** — Betriebskette H20 (jeder Zustandswechsel genau einmal, Blindprobe 14 Befunde) · §Schreibpfade (A5) erhoben · Migration 018 + Erlaubnisse mit Widerruf unter `/admin/beleg` (A13/A14), DE/TR, axe 0 · **H21** behoben: Serverbefunde sind Maschinenwerte, Gate §3 sieht sie |
| 17.09.2026 | 4 | **ADM-06/1 Automation BUILT/lokal VERIFIED** (`dec4bb1`) — Migration 019 (`automation_runs`, `automation_switches`), `/admin/automationen` Owner-only DE/TR; eine Automation ändert **keinen** Geschäftsdatensatz; automation-drill 51/51, automation-e2e 27/27, axe 0 (**A29**) |
| 22.09.2026 | 5 | **ADM-06/2 meAI BUILT/lokal VERIFIED** — Qualitätsvertrag A8 in `lib/meai.ts` + Fixture-Eval `lib/meai-eval.ts` (10 Fälle, 6 Prüf-Anbieter: brav/halluziniert/leckt/erfindet/rät/kaputt); `meai-drill` M1–M8 grün im `postbuild` (**B12** ohne Anbieter); Chance-Detail zeigt „Nächster Schritt“ mit Belegen in DE/TR, Quelle „aus Regeln“ (**A30** Degraded Mode, E30 im Browser) · H22–H25 behoben · build + alle Gates, db-drills 13/13, Kernschleifen-E2E grün |

| 22.09.2026 | 5 | **ADM-06/3 Drilldown (A25) VERIFIED lokal** — H26; E25 im Browser (2 = 1+1, 2 = 1+1, 4 = 4, 1 = 1) · admin-sprache-e2e + admin-zustaende 36/36 + db-drills 13/13 grün · **ADM-06 BUILT** |
| 23.09.2026 | 5 | **ADM-07 BUILT/lokal VERIFIED — OWNER-INDEPENDENT BUILD COMPLETE + CUTOVER READY.** Abnahmematrix A01–A32 + B01–B12 erhoben und gefahren (`docs/admin-os/abnahme.md`); neuer `abnahme-e2e` (B01–B09, A21/A22/A24/A28, B11) · **B11 gebaut** (`lib/auskunft.ts`, `auskunft-drill`) · H27–H30 + A28 behoben · A31 Sicherung→Rückspielung vollständig durchgespielt (12 Schritte) · db-drills 14/14 · smoke 36/36 · a11y 132 · mobile 6×16 · vitals 14/14 · alle Admin-E2E grün · **Cutover-Paket** `docs/admin-os/cutover.md` mit 4 Owner-Handlungen |
| 23.09.2026 | 6 | **Cutover vorbereitet und generalprobt, nicht ausgeführt.** (historisch — Agent-Maskierung) Vier Cutover-Befehle gebaut und lokal generalprobt. |
| 23.09.2026 | 6 | **CUTOVER O1–O2 ausgeführt.** Preflight grün (0 Dubletten) · Sicherung+Rückspielprobe 12/12 · Migration 015–019 · Nachprüfung grün (7/32/15/2/14) · Promote `dpl_6oQPnEwd8muy5DELveVzfQVYRVoj` → `creadig.de` READY · Fixback `14b4460` · Live: R1–R4/R6/R8 + A01/A25/A26 grün; **R4 `revoked:server`** · R5 liefert 429, aber `rate_limit_windows`=0 weil Production kein `LEAD_TOKEN_SECRET`/`RESEND_API_KEY` → Arbeitsspeicher-Fallback · R9 `not_configured` (+ `LEAD_FROM`) · G18 unberührt · H14 absent |
| 24.09.2026 | 6 | **DB-Ziel Safety-Stop CLEARED — MATCH YES.** Owner bestätigt: lokal cutover-Ziel = Production Neon (`ep-summer-sky-b1eispp7-pooler.c-5.eu-central-1.aws.neon.tech/neondb`, LOCAL_FP `55675b35c64cb347`). `VERCEL_ENV=preview` in `.env.local` war nur Datei-Etikett (env-guard), nicht Neon-Branch. CLI kann Sensitive Production-`DATABASE_URL` nicht lesen — Vergleich über Owner/Dashboard-Host. Migration 015–019 damit als Production-Schema bestätigt. |

**Fortsetzungspunkt:** Owner kopiert Preview→Production Env (`LEAD_TOKEN_SECRET`, `RESEND_API_KEY`, `LEAD_FROM`, `LEAD_TO`) unter https://vercel.com/muhammed-emin-akyols-projects/creadig/settings/environment-variables — danach Agent `npm run cutover-live` erneut. Dann erst `LIVE 99 % VERIFIED · READY FOR OWNER ACCEPTANCE`.
