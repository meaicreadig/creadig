# creaDIG Finanz — Zugangs- und Vollständigkeits-Analyse (ein ununterbrochener Durchlauf)

## Regel für diesen Durchlauf
Arbeite **ununterbrochen bis zum Ende**. Melde dich nicht mit „teilweise fertig" oder
„X fehlt noch" — entweder ein Punkt ist nach der unten stehenden Definition **fertig und
verifiziert**, oder du arbeitest weiter, bis er es ist. Die einzige zulässige Unterbrechung
ist eine **schreibende Änderung an der Produktions-Datenbank** (Phase 2, Owner-Passwort) —
die wird vorbereitet, aber NICHT ausgeführt ohne ausdrückliches „OK" vom Owner. Alles andere
wird bis zum Ende durchgezogen, inklusive Lesen/Diagnose gegen die echte Produktion.

## Ausgangslage — das Problem, das diesen Durchlauf auslöst
Der Owner (Emin) kommt **praktisch nicht auf `finanz.creadig.de`** hinein — er wartet schon
seit mehreren Versuchen. Der Code UND die Vercel-Produktionsumgebung wurden bereits einmal
von außen geprüft (nicht von dir, von einer vorherigen Analyse) mit folgendem Ergebnis —
**nicht neu suchen, nur verifizieren und weiterarbeiten**:

- `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `DATABASE_URL` sind **alle drei in Vercel
  Production gesetzt** (bestätigt über die Vercel-Projekt-API, Projekt `creadig`,
  `prj_EXWR97PCtGzzE7R7FlHxpn7CKjkP`). Ein fehlender Umgebungswert ist **ausgeschlossen**
  als Ursache — verschwende keine Zeit damit, das erneut zu prüfen, es sei denn, deine
  eigene Prüfung widerspricht dem explizit.
- Der Login-Mechanismus (`lib/admin-session.ts`, `lib/admin-konten.ts`,
  `app/api/admin/session/route.ts`) ist E-Mail+Passwort, nicht nur Passwort:
  - **Allererste Anmeldung** (Tabelle `admin_users` ist leer): E-Mail + exakter Wert von
    `ADMIN_PASSWORD` legt automatisch ein Konto mit Rolle `owner` an.
  - **Jede weitere Anmeldung**: entweder das seither selbst gesetzte Passwort dieser
    E-Mail, oder `ADMIN_PASSWORD` als Notschlüssel — aber NUR zusammen mit genau der
    E-Mail, die im bestehenden Konto steht.
  - Es gibt **keinen „Passwort vergessen"-Fluss** im Code. Ein Lockout ist nur über einen
    direkten, bewussten DB-Eingriff lösbar (siehe Phase 2).
  - `finanz.creadig.de` verlangt zusätzlich `rolle === "owner"` (Middleware,
    `finanzZugang()`) — andere Rollen kommen dort nicht hinein, das ist so gewollt.
  - Zehn Fehlversuche pro Adresse sperren für zehn Minuten (`lib/rate-limit.ts`,
    `MAX_ATTEMPTS = 10` in der Route).
- Lokal liegt eine Datei `.env.production.cutover` im Projektordner (Stand 24.09.2026,
  laut `.gitignore`-Kommentar „trägt dieselben Geheimnisse wie .env.local — nur ohne
  .local im Namen"). Diese Datei **wurde nicht gelesen** in der vorherigen Analyse — sie
  könnte bereits den aktuell gültigen `ADMIN_PASSWORD`-Wert enthalten, weil die Variable in
  Vercel seit August 2026 nicht mehr verändert wurde. Das ist der **erste, schnellste**
  Verdacht, den du prüfst.

## Sicherheits-Setup (zuerst, vor jeder Änderung)
1. `git fetch origin`
2. Neuer lokaler Branch **ab `origin/feat/system-haus-site`** (nicht `main`):
   `git checkout -b finanz-zugang-analyse origin/feat/system-haus-site`
3. **Nur lokal committen. Kein `git push`.** Dieser Durchlauf ist primär eine Diagnose,
   kein Feature-Bau — committe nur, wenn du tatsächlich einen Code-Fehler findest und
   behebst (siehe Phase 4). Reine Analyse-Ergebnisse gehören in deinen Abschlussbericht,
   nicht in einen Commit.
4. **Keine Geheimnisse ausgeben.** Niemals den Wert von `ADMIN_PASSWORD`,
   `ADMIN_SESSION_SECRET`, `DATABASE_URL` oder einen `password_hash` in deinen Bericht,
   in eine Commit-Message, in eine neue Datei oder ins Terminal-Echo schreiben. Du darfst
   bestätigen „ist gesetzt / stimmt überein / ist leer", aber nie den Wert selbst zeigen.

---

## Phase 0 — Der schnelle Verdacht zuerst
- Öffne (lies, ändere nichts) `.env.production.cutover` und `.env.local` im Projektordner.
  Vergleiche NUR strukturell: zeigen beide Dateien einen Wert für `ADMIN_PASSWORD`,
  `ADMIN_SESSION_SECRET` und `DATABASE_URL`? Zeigt `DATABASE_URL` in beiden Dateien
  denselben Host/dieselbe Neon-Projekt-Kennung (also: dieselbe Datenbank), oder weicht
  `.env.local` auf eine andere/lokale Datenbank ab?
- Wenn `.env.production.cutover` einen `ADMIN_PASSWORD`-Wert enthält: **das ist
  wahrscheinlich bereits die Antwort.** Sage dem Owner im Abschlussbericht ausdrücklich:
  „Öffne `.env.production.cutover` in deinem Projektordner selbst in einem Texteditor,
  suche die Zeile `ADMIN_PASSWORD=`, das ist dein Wert." Schreibe den Wert selbst NICHT
  in deinen Bericht.
- Diese Phase ersetzt nicht Phase 1–3 — mach trotzdem weiter, falls der Owner diese Datei
  nicht mehr hat, sie veraltet ist, oder der Wert nicht mehr stimmt (siehe Phase 1c).

## Phase 1 — Stimmt die Infrastruktur wirklich, Ende zu Ende?
Verifiziere **selbst, frisch**, auch wenn Phase „Ausgangslage" oben schon etwas behauptet —
das war eine andere Sitzung, keine Annahme von dir.

a) Vercel Production (per `vercel` CLI, falls eingeloggt/gelinkt, sonst Vercel-MCP/-API
   falls verfügbar — niemals Werte ausgeben, nur Namen/Ziel/Datum):
   `vercel env ls` (oder gleichwertig) für Projekt `creadig` — bestätige, dass
   `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` und `DATABASE_URL` für **Production** gesetzt
   sind, und notiere, wann sie zuletzt geändert wurden.

b) Lebt die Route wirklich? Sende (per `curl` oder `node`, read-only, mit einem
   offensichtlich falschen Test-Passwort wie `"___diagnose___"`) einen echten
   `POST https://finanz.creadig.de/api/admin/session` mit
   `{"email":"diagnose@creadig.de","password":"___diagnose___"}` und Header
   `Origin: https://finanz.creadig.de`. Erwartet: **nicht** `404` (das würde heißen,
   `adminConfigured()` ist falsch/aus), sondern `401 invalid` oder `429 rate_limited`.
   Jedes andere Ergebnis (404, 500, 503) ist ein echter Befund — dann weiter zu Phase 4.

c) Prüfe **produktionsnah**, ob die Datenbank erreichbar ist: ein read-only Skript (lokal,
   mit `DATABASE_URL` aus `.env.production.cutover` falls `.env.local` auf eine andere DB
   zeigt — vorher laut Phase 0 klären, welche Datei die echte Produktions-DB trägt) führt
   `SELECT 1` aus. Schlägt das fehl, ist das der eigentliche Befund — berichte exakt die
   Fehlermeldung (ohne den Connection-String zu zeigen).

## Phase 2 — Wer ist schon in `admin_users`, und was heißt das für den Owner?
Mit einem **read-only** Skript gegen die echte Produktions-Datenbank (Verbindung wie in
Phase 1c geklärt):

```sql
SELECT email, rolle, last_login_at, created_at FROM admin_users;
```
(KEIN `password_hash` in der Ausgabe — die Spalte gar nicht erst mit selectieren.)

- **0 Zeilen** → Bootstrap ist offen. Bericht an den Owner: „Nimm eine E-Mail-Adresse, die
  du dir merken willst (z. B. `info@creadig.de`), und den `ADMIN_PASSWORD`-Wert aus
  Vercel (Projekt → Settings → Environment Variables → `ADMIN_PASSWORD` → Reveal) oder aus
  `.env.production.cutover`. Mit dieser Kombination einmal auf `finanz.creadig.de`
  anmelden — das legt dein Konto automatisch an."
- **≥1 Zeile mit `rolle = 'owner'`** → Es existiert schon ein Konto. Nenne die E-Mail(s)
  im Bericht (das ist Emins eigene Angabe, kein Datenschutzproblem). Zwei Fälle:
  - Der Owner erkennt die E-Mail wieder → er muss SEIN damals gesetztes Passwort nutzen,
    oder `ADMIN_PASSWORD` **zusammen mit genau dieser E-Mail** als Notschlüssel.
  - Der Owner erkennt die E-Mail nicht wieder oder hat auch dieses Passwort vergessen →
    es gibt keinen Self-Service-Reset. Bereite (schreibe, aber führe NICHT aus) ein
    Node-Skript vor, das:
    1. einen vom Owner **frei gewählten neuen Wert** als Umgebungsvariable zur Laufzeit
       entgegennimmt (z. B. `NEW_FINANZ_PASSWORD=... node reset-owner-passwort.mjs`) —
       niemals als Kommandozeilen-Argument (landet in der Shell-History) und niemals
       hart in die Datei geschrieben,
    2. ihn mit genau demselben Verfahren hasht wie `lib/admin-konten.ts`
       (`scrypt`, 16-Byte-Salt, 64 Byte Länge, Format `scrypt$<saltHex>$<hashHex>`),
    3. `UPDATE admin_users SET password_hash = $1 WHERE email = $2` ausführt — für die
       EINE vom Owner bestätigte E-Mail, sonst nichts.
    **Stoppe hier und frage den Owner ausdrücklich**, ob er dieses Skript ausführen will,
    mit welcher E-Mail, und lass ihn das neue Passwort selbst eingeben (nicht dir
    diktieren, nicht in den Chat schreiben). Erst nach seinem „OK" ausführen.
- **≥1 Zeile, aber keine mit `rolle = 'owner'`** → das wäre inkonsistent mit der
  Middleware-Regel (`finanzZugang` verlangt `owner`); wenn du das vorfindest, ist das ein
  eigener, zu berichtender Befund, kein Grund stillschweigend weiterzumachen.

## Phase 3 — Ist er aktuell einfach ausgesperrt (Rate-Limit)?
Prüfe, ob eine Sperre aktiv sein könnte: `lib/rate-limit.ts` nutzt einen HMAC der Anfrage-
Adresse als Schlüssel, Fenster zehn Minuten, zehn Versuche. Ein direktes Nachschlagen nach
IP ist von außen nicht sauber möglich — berichte stattdessen: „Falls du in den letzten zehn
Minuten mehrfach falsch eingegeben hast, ist die Adresse zehn Minuten gesperrt (Antwort
`429`). Zehn Minuten warten und mit Sicherheit dem richtigen Passwort erneut versuchen."
Wenn dein Test aus Phase 1b bereits `429` zurückgab, sag das explizit — dann ist das
wahrscheinlich die ganze Erklärung.

## Phase 4 — Nur falls Phase 1–3 einen echten Code-Fehler zeigen
Nur wenn eine der obigen Prüfungen ein unerwartetes Ergebnis liefert (z. B. `sameOrigin()`
lehnt eine legitime Anfrage von `https://finanz.creadig.de` selbst ab, oder
`finanzZugang()`/`issueSession()`/`verifySession()` verhält sich nicht wie oben
beschrieben): finde die Ursache, behebe sie minimal, verifiziere erneut gegen die echte
Produktion (nicht nur lokal), und erst dann committen — mit kurzer Begründung, was falsch
war und warum der Fix korrekt ist.

## Phase 5 — Ist Finanz inhaltlich wirklich fertig? (der zweite Teil der Frage)
Der Owner zweifelt nicht nur am Zugang, sondern grundsätzlich, ob Finanz „fertig" ist. Die
Phasen aus den vorherigen Durchläufen (`finanz-vollstaendig`, PR #59; `finanz-saeulen`,
PR #61) sind bereits in `feat/system-haus-site` gemerged. Prüfe **frisch gegen die Live-
Produktion**, nicht nur gegen lokalen Code:
- `npm run finanz-drill` läuft lokal grün (voraussetzt: läuft es überhaupt noch fehlerfrei
  nach den seitherigen Merges? Falls nicht, das ist ein eigener Befund.)
- Stichprobenhaft: ruft `GET https://finanz.creadig.de/finanz/ziele`,
  `.../finanz/grundlagen` (nach erfolgreichem Login, sobald einer möglich ist — nutze dafür
  ggf. das in Phase 2 geklärte/angelegte Konto) tatsächlich ohne Serverfehler, mit den
  erwarteten Inhalten (Ziele-Fortschritt, Diversifikation, §19-Projektion)?
- Gibt es zwischen dem letzten Merge (`2b95620`) und `origin/feat/system-haus-site` heute
  neue Commits, die Finanz betreffen (z. B. ein paralleler v0-Branch wie
  `v0/steuer-pauschalen-und-buch-...`)? Falls ja, benenne sie — nicht einarbeiten, nur
  berichten, das entscheidet der Owner.

## Definition von „fertig" (alles muss zutreffen)
- [ ] Phase 0: `.env.production.cutover` geprüft, Owner weiß, ob/wo sein `ADMIN_PASSWORD`
      lokal bereits vorliegt.
- [ ] Phase 1: Produktions-Env (alle drei Variablen), Live-Route-Antwort und DB-
      Erreichbarkeit frisch verifiziert — mit Belegen (Statuscodes, Zeitstempel), nie mit
      Geheimwerten.
- [ ] Phase 2: `admin_users` ausgelesen, Lage klar benannt (0 Zeilen / bekannte E-Mail /
      unbekannte E-Mail), bei Bedarf Reset-Skript vorbereitet und NICHT ohne „OK"
      ausgeführt.
- [ ] Phase 3: Rate-Limit-Möglichkeit geprüft/benannt.
- [ ] Phase 4: jeder gefundene echte Code-Fehler behoben und gegen Live-Produktion erneut
      verifiziert (oder: keiner gefunden — explizit so sagen).
- [ ] Phase 5: Drill erneut grün, Live-Stichprobe der Finanz-Säulen-Seiten gemacht, Stand
      zu parallelen Branches benannt.
- [ ] Abschlussbericht an den Owner: in einfacher Sprache, **die eine konkrete nächste
      Handlung**, die er jetzt ausführen muss, um reinzukommen — nicht zehn Möglichkeiten,
      sondern die, die laut deiner Diagnose tatsächlich zutrifft.

Wenn ein Punkt aus technischen Gründen wirklich nicht lösbar ist (z. B. kein Zugriff auf die
Produktions-DB von diesem Rechner aus), sage das **explizit mit Grund und mit dem genauen
nächsten Schritt, den der Owner stattdessen selbst tun muss** (z. B. „bitte führe `vercel
env pull` selbst aus, ich habe dafür keine Berechtigung in dieser Umgebung").
