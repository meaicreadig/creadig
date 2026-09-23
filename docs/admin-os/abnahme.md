# Admin / Owner OS 1.0 · Abnahmematrix (ADM-07)

> Stand **22.09.2026** · HEAD zum Zeitpunkt des Laufs: siehe `state.md` §Session-Log.
> Diese Datei ist **Beleg**, nicht Status. Status steht in `docs/admin-os/state.md`.
>
> Gelesen wird sie so: Jede Zeile nennt das Szenario, den Beleg (ein Befehl, den
> man wiederholen kann) und den Stand. `LOKAL` heisst: gegen den gebauten Server
> und eine Wegwerf-Datenbank auf diesem Rechner bewiesen. `LIVE` heisst: in
> Produktion beobachtet — das kann vor dem Cutover niemand behaupten, und es
> steht hier auch bei keiner Zeile.

## Wie gemessen wurde

| Umgebung | Was |
|---|---|
| Server | `next start`, `NODE_ENV=production`, derselbe Build wie für Produktion |
| Datenbank | frisch angelegte Wegwerf-Postgres je Lauf (`drill_*`), Schema + Bestand wie `db-migrate` |
| Browser | Chromium (Playwright), Desktop 1280×720 und Mobil 390×844 |
| Produktion | **unberührt** — keine Migration, kein Deploy, keine echte Nachricht |

**Grenze, die keine Messung überschreitet:** Der serverseitige Sitzungswiderruf und
das dauerhafte Versuchsfenster hängen an `neonAbfrage()` — Neon über HTTP. Einen
Neon-HTTP-Endpunkt gibt es auf diesem Rechner nicht, und `pg` gehört nicht in die
Middleware (Edge). Beide sind deshalb auf **SQL-Ebene** gegen echtes Postgres
bewiesen (`sitzung-drill`, `versuch-drill`) und stehen als **LIVE-Prüfung** im
Cutover-Paket. Was lokal läuft, sagt die Route ehrlich: `revoked: "browser-only"`.

---

## A · Kritische Abnahmeszenarien

| # | Szenario | Beleg (wiederholbar) | Stand |
|---|---|---|---|
| A01 | Login + Sprache DE/TR | `npm run admin-sprache-e2e` · `automation-e2e` (TR-Durchlauf) | **LOKAL grün** |
| A02 | Login-Performance | `npm run admin-login-e2e` — 30 warm / 10 kalt; Rückmeldung p95 28 ms, Shell p95 49 ms | **LOKAL grün** |
| A03 | Neue Anfrage (Formular + von Hand) | `admin-kernschleife-e2e` E03/E03b · `kernschleife-drill` K1 | **LOKAL grün** |
| A04 | Kunde zuordnen | `admin-kernschleife-e2e` E04 | **LOKAL grün** |
| A05 | Kunde/Person anlegen | `admin-kernschleife-e2e` E05 | **LOKAL grün** |
| A06 | Dublettenschutz | `admin-kernschleife-e2e` E06 · `kernschleife-drill` | **LOKAL grün** |
| A07 | Nächster Schritt + Termin | `admin-kernschleife-e2e` E07 · Berliner Geschäftstag (A23) | **LOKAL grün** |
| A08 | Chance anlegen, Doppelklick = eine | `admin-kernschleife-e2e` E08 · `kernschleife-drill` K5 (10× gleichzeitig) | **LOKAL grün** |
| A09 | Stufenwechsel + Konflikt/Rollback | `admin-kernschleife-e2e` E09 (zwei Tabs) | **LOKAL grün** |
| A10 | Verlust mit Grund | `admin-kernschleife-e2e` E10 · `verlust-drill` | **LOKAL grün** |
| A11 | Gewinn → nächster Betriebsschritt | `admin-kernschleife-e2e` E11 · `betriebskette-drill` | **LOKAL grün** |
| A12 | Kundenakte | `admin-kernschleife-e2e` E12 | **LOKAL grün** |
| A13 | Beleg ohne Freigabe ist nicht öffentlich | `freigabe-drill` · `freigabe-e2e` | **LOKAL grün** |
| A14 | Widerruf einer Erlaubnis | `freigabe-drill` · `freigabe-e2e` | **LOKAL grün** |
| A15 | Verbindung prüfen | `verbindung-drill` · `verbindungen-e2e` | **LOKAL grün** |
| A16 | Verbindungs-Widerruf | `verbindung-drill` · `verbindungen-e2e` | **LOKAL grün** |
| A17 | Doppelter Webhook = eine Wirkung | `verbindung-drill` (Idempotenzschlüssel) | **LOKAL grün** |
| A18 | Anbieterfehler ehrlich benannt | `verbindung-drill` · `verbindungen-e2e` | **LOKAL grün** |
| A19 | DB-Ausfall ≠ „0 Kunden" | `npm run admin-zustaende` — 36 Flächen, 0 offen | **LOKAL grün** |
| A20 | Rollen (Owner/Vertrieb/Redaktion) | `rollen-drill` (im `postbuild`) · `abnahme-e2e` §A20 (fünf Owner-Bereiche gesperrt) | **LOKAL grün** |
| A21 | Datensatz-ID / IDOR | `abnahme-e2e` §A21 — erfundene, fremde und manipulierte Kennungen → 404, kein 500 (**H27**) | **LOKAL grün** |
| A22 | Sitzungsablauf | `abnahme-e2e` §A22 — abgelaufene und gefälschte Sitzung → Anmeldung | **LOKAL grün** |
| A23 | Europe/Berlin als Geschäftstag | `check-geschaeftszeit` (JS + SQL + Anzeige), im `postbuild` | **LOKAL grün** |
| A24 | Türkische Suche İ/I/ı/i, ş, ğ | `abnahme-e2e` §A24 — sechs Schreibweisen, Store **und** Oberfläche (**H30**) | **LOKAL grün** |
| A25 | Chart-/Kennzahl-Drilldown | `admin-kernschleife-e2e` E25 — Kachel = Zeilen dahinter, vier Kennzahlen (**H26**) | **LOKAL grün** |
| A26 | Mobil 390 | `admin-kernschleife-e2e` E26 · `npm run mobile` (6 Breiten × 16 Seiten) | **LOKAL grün** |
| A27 | Tastatur ohne Maus | `admin-kernschleife-e2e` E27 · `npm run a11y` (132 Durchläufe) | **LOKAL grün** |
| A28 | Ungespeichertes Formular | `abnahme-e2e` §A28 — frisch: keine Frage; getippt: Frage; abgelehnt: Text bleibt (**A28-Wache**) | **LOKAL grün** |
| A29 | Automation beobachtbar/umkehrbar | `automation-drill` 51/51 · `automation-e2e` 27/27 · `check-automation` | **LOKAL grün** |
| A30 | meAI-Evidenz / Degraded Mode | `meai-drill` M1–M8 (im `postbuild`) · `admin-kernschleife-e2e` E30 | **LOKAL grün** |
| A31 | Backup/Recovery | `db-backup` → `db-restore-drill`: 12 Schritte, Schema 366 Zeilen, 20 Kerntabellen, Zeilenzahlen gleich, Anwendungsabfrage läuft | **LOKAL grün** |
| A32 | Öffentliche Seite ohne Regression | `npm run smoke` 36/36 · `npm run a11y` · `npm run mobile` · `npm run vitals` 14/14 unter Schwelle · `check-website2` | **LOKAL grün** |

## B · Web-Sicherheitsfläche und Datenlebenszyklus

| # | Prüfung | Beleg | Stand |
|---|---|---|---|
| B01 | `noindex` auf **jeder** Admin-Antwort (Kopf + HTML, auch 404/JSON) | `abnahme-e2e` §B01 — 10 Flächen + JSON-Route | **LOKAL grün** |
| B02 | `no-store` auf allen sensiblen Antworten | `abnahme-e2e` §B02 — `private, no-store, max-age=0` | **LOKAL grün** |
| B03 | Cookie `HttpOnly`/`Secure`/`SameSite=Strict`/Ablauf | `abnahme-e2e` §B03 | **LOKAL grün** |
| B04 | Sitzungsrotation, keine Fixierung | `abnahme-e2e` §B04 — zweite Anmeldung = anderer Wert; mitgebrachter Wert wird ersetzt | **LOKAL grün** |
| B05 | Serverseitiger Widerruf (Kopie ungültig) | `sitzung-drill` (SQL gegen echtes Postgres) · `abnahme-e2e` §B05: Cookie gelöscht, Umfang ehrlich benannt | **LOKAL grün (SQL)** · **LIVE offen** → Cutover §7 |
| B06 | Sicherheitsköpfe + CSP im Admin | `abnahme-e2e` §B06 — volle Policy `default-src 'self'` … statt nur Bericht (**H28**) | **LOKAL grün** |
| B07 | Ursprung/CSRF auf Mutationen | `abnahme-e2e` §B07 — fremder Origin 403 ohne Cookie, fehlender Origin 403 · `check-admin-antwort` | **LOKAL grün** |
| B08 | Dauerhaftes Versuchsfenster | `versuch-drill` (SQL, über „Instanzen") · `abnahme-e2e` §B08 — 429, richtiges Passwort bleibt draussen, andere Adresse frei | **LOKAL grün (SQL)** · **LIVE offen** → Cutover §7 |
| B09 | Kein sensibler Cache nach dem Abmelden | `abnahme-e2e` §B09 — Zurück-Taste zeigt die Anmeldung | **LOKAL grün** |
| B10 | Archivieren statt Löschen | `crm-drill` · `admin-kernschleife-e2e` E06 (Archiv mit Grund, beide Datensätze bleiben) | **LOKAL grün** |
| B11 | Export/Berichtigung je Person | Berichtigung: `contact-drill` · **Auskunft**: `auskunft-drill` T1–T6 (zwei Personen in derselben Firma, Leckage-Test) · `abnahme-e2e` §B11 (Owner 200, Vertrieb 403, ohne Sitzung 401, Spur in der Akte) | **LOKAL grün** · Löschung mit Fristenkonflikt: **Owner** |
| B12 | meAI-Qualitätsvertrag | `meai-drill` M1–M8 gegen Fixtures, sechs Prüf-Anbieter | **LOKAL grün** (Punkt 8 Anbieter/Kosten = Owner) |

### B11 — was gebaut wurde und was beim Owner bleibt

`A7` verlangt **Export je Person (Auskunft)**, **Berichtigung** und **Löschung je
Person mit Kaskadenregel**, inklusive des Konflikts zwischen gesetzlicher
Aufbewahrung und Löschwunsch (*sperren statt löschen, begründet*).

**Gebaut (owner-unabhängig, also gebaut — nicht „später"):**
`lib/auskunft.ts` trägt alles zusammen, was dieses Haus über eine Person führt:
Person, Organisation, ihre Anfragen, ihre Vorgänge, die Chronik aus allen drei
Quellen (mit `zuOrt`, damit jede Zeile ihren Bezug nennt) und die Freigaben, die
**sie** erteilt hat. `GET /api/admin/auskunft?kontakt=…` liefert das als Datei —
nur für Owner, mit Admin-Köpfen, und jede Auskunft hinterlässt eine Zeile in der
Akte **ohne ihren Inhalt**. Die Grenzen stehen in der Datei selbst
(`nichtEnthalten`), statt verschwiegen zu werden.

**Beim Owner geblieben:** die **Löschung**. Ob und wie lange eine Anfrage
aufbewahrt werden *muss*, ist eine Rechts- und Owner-Tatsache
(`docs/ops/neon-decision-pack.md`). Eine Löschfunktion, die eine Frist
unterstellt, löscht entweder zu früh (Beweisnot) oder behauptet eine Sperre, die
niemand angeordnet hat. Deshalb: Archivieren gibt es (B10), Auskunft gibt es,
die Löschung wartet auf **eine** Owner-Angabe — sie steht im Cutover-Paket §10.

---

## Befunde dieser Welle

| # | Fund | Schwere | Stand |
|---|---|---|---|
| **H27** | `notFound()` stand in einem `try`, dessen `catch` „Datenbank nicht erreichbar" antwortete: erfundene Kennungen ergaben 200 statt 404 — und behaupteten nebenbei eine Störung, die es nicht gab (A19 + A21 in einem). | hoch | **VERIFIED** — `lib/navigationsfehler.ts`, alle vier Detailseiten |
| **H28** | Im Admin galt nur die kleine Policy; die vollständige lief als Bericht. Die Ausnahme dafür („Seite ist statisch und rendert keine fremden Eingaben") trifft im Admin auf keinen der beiden Punkte zu. Ein zweiter `headers()`-Eintrag half nicht: Die Konfiguration überschreibt die Middleware. | mittel | **VERIFIED** — `lib/csp.ts` über `ADMIN_RESPONSE_HEADERS`, allgemeine Regel nimmt `/admin` aus |
| **H29** | Ein abgestürzter Prüflauf hinterliess seinen Server auf dem Port (`npm exec` bekam SIGTERM, das Kind nicht). Der nächste Lauf mass die **alte** Fassung — drei „Befunde" waren Gespenster. | hoch (Testwahrheit) | **VERIFIED** — Port wird vorher geprüft, Prozessgruppe wird beendet |
| **H30** | Türkische Suche fand `Işık` nur bei exakt `Işık`: `ş`/`ı` sind eigene Buchstaben, `ILIKE` kennt sie nicht als Variante. In einem Haus, dessen Nische türkischsprachige Betriebe sind, ist das keine Suche. | mittel (A24) | **VERIFIED** — `lib/tuerkisch.ts`, vier Suchpfade, Wort und Spalte auf denselben Nenner |
| **A28** | Ungespeicherte Eingaben verschwanden beim Klick auf einen anderen Bereich — ohne Nachfrage. | mittel | **VERIFIED** — `components/admin/ungespeichert-wache.tsx` |
| **B11** | Eine Auskunft über eine Person gab es nicht — weder Weg noch Datei. Wer gefragt hätte, hätte eine handverlesene Antwort bekommen, und die ist beim dritten Mal unvollständig. | mittel | **VERIFIED** — `lib/auskunft.ts`, Owner-Route, Vermerk ohne Inhalt, `auskunft-drill` |
