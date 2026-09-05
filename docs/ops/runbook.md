# creaDIG — Betriebshandbuch

> **Stand:** 04.09.2026 · Gate 01
> **Regel:** Jeder Befehl hier ist in diesem Verzeichnis ausgeführt worden.
> Was nicht geprüft wurde, steht als UNGEPRÜFT da — nicht als Anleitung.

---

## 1 · Täglich gebrauchte Befehle

```bash
npm run dev            # Entwicklung, Port 3000
npm run build          # Produktionsbau + vier Gates (Function-Size, Sterne, Parität, Bestand)
npm run smoke          # 29 Prüfungen gegen den gebauten Server
npm run a11y           # 112 Durchläufe axe, WCAG 2.1 AA
npx tsc --noEmit       # Typen
npx eslint .           # Lint
```

`npm run smoke` und `npm run a11y` starten selbst einen Server aus `.next`.
**Vorher bauen** — sonst scheitern sie mit „Server kam nicht hoch", und der
Grund steht nicht dabei. Beide brauchen ihre Ports frei (4322 / 4323).

---

## 2 · Was gesetzt sein muss

Der vollständige Vertrag steht in `.env.example` — dort mit Begründung je
Variable und mit dem Satz, was ohne sie passiert. Kurzfassung:

| | ohne den Wert |
|---|---|
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Das Control Center antwortet mit **404**. Absicht: keine Anmeldemaske für etwas, das es nicht gibt. |
| `RESEND_API_KEY`, `LEAD_FROM` | `/api/lead` antwortet **503**. Keine Anfrage kommt an. |
| `LEAD_TOKEN_SECRET` | Formular-Token nicht prüfbar. |
| `LEAD_STORE=neon` + `DATABASE_URL` | Ohne beides läuft alles wie vor MP-G: Anfragen gehen **nur** per Mail ins Postfach, Vertrieb und Kunden sind leer und sagen das auch. |
| `NEXT_PUBLIC_SITE_URL` | Fällt auf `https://creadig.de` zurück — kanonische Adressen, Sitemap und OG-Bilder hängen daran. |
| `SELFTEST_SECRET` | `/api/selftest` ist abgeschaltet; ein Zustellausfall fällt niemandem auf. |
| `ALERT_WEBHOOK_URL` | Alarme landen **nur im Serverprotokoll**. Siehe §7. |

**Nie im Betrieb:** `LEAD_STORE=file` oder `LEAD_STORE=memory`. Beide sind
Entwicklungs-Adapter; die Route warnt beim Start, aber sie hält nichts auf.

---

## 3 · Datenbank

Es gibt **zwei Wege zum selben Schema**, und sie sind nachweislich deckungsgleich:

1. Die Anwendung legt das Schema beim ersten Zugriff selbst an (`SCHEMA` in
   `lib/neon-client.ts`).
2. Die Dateien unter `scripts/migrations/` beschreiben denselben Stand.

**Gemessen am 04.09.2026** gegen PostgreSQL 17: beide Wege erzeugen 148
identische Zeilen an Spalten, Indizes und Bedingungen — Unterschied null.
Zweiter Lauf, gemischter Lauf und Aufstieg von `001` allein führen zum selben
Stand. Ein Rollback gibt es **nicht**: Die Migrationen sind additiv und
wiederholbar, aber sie können sich nicht selbst zurücknehmen.

### Schema prüfen

```bash
psql -f scripts/check-integrity.sql -d "<verbindung>"
```

Elf Fragen, richtige Antwort überall `0`. Die Datei ändert nichts — kein
`UPDATE`, kein `DELETE`. Sie ist gegen absichtlich kaputte Zeilen geprüft:
neun der elf Fragen haben angeschlagen, die beiden Dubletten-Fragen bleiben
`0`, weil die Datenbank Dubletten gar nicht erst zulässt
(`organisations_name_key` auf `lower(name)`, `contacts_email_key`).

### Was NICHT erzwungen ist

Vier Bezüge sind Fremdschlüssel: `contacts→organisations`,
`locations→organisations` (mit Kaskade), `opportunities→contacts`,
`opportunities→organisations`.

Vier weitere sind nur **angenommen**: `leads.contact_id`,
`leads.organisation_id`, `opportunities.from_lead_id` und — technisch
unvermeidbar, weil polymorph — `activities.subject_id`.

Die drei ersten gehören als Fremdschlüssel nachgetragen, **sobald
`check-integrity.sql` auf der echten Datenbank überall `0` liefert.** Vorher
nicht: Eine Bedingung auf Verdacht würde ab dann jede Änderung an genau den
Zeilen ablehnen, die man reparieren will.

---

## 4 · Wenn die Datenbank ausfällt

Was dann passiert — **gemessen**, nicht angenommen:

- Die öffentliche Website läuft weiter (`/`, `/kontakt`, `/betriebscheck` → 200).
- `/api/lead` antwortet weiter `ok:true`. **Das ist richtig:** Die Mail ist der
  Hauptweg, der Speicher die Ergänzung. Den Absender wegen eines
  Datenbankausfalls abzuweisen hiesse, ihn für unseren Fehler zahlen zu lassen.
- `storeLead` meldet `failed` und löst einen Alarm aus.
- **Die interne Anfrage-Mail beginnt dann mit
  `!! NICHT IM VERTRIEB GESPEICHERT !!`** und dem Hinweis, dass diese Anfrage
  nur in dieser Nachricht existiert. Von Hand nachtragen.
- Vertrieb und Kunden zeigen „braucht die Datenbank" statt einer leeren Liste.

**Zu tun:** Neon-Status prüfen, `DATABASE_URL` prüfen, danach die betroffenen
Anfragen aus dem Postfach nachtragen. Es gibt dafür keinen Automatismus.

## 5 · Wenn der Mailversand ausfällt

- `/api/lead` antwortet **502 `send_failed`** — der Absender sieht einen Fehler.
- Die Anfrage ist **trotzdem gespeichert** (gemessen: `CD-260904-39e7`).
  Gespeichert wird VOR dem Zustellversuch, ausdrücklich deshalb.
- Ein Alarm wird ausgelöst.

**Zu tun:** Resend-Status und Schlüssel prüfen. Die Anfragen stehen unter
`/admin/vertrieb/anfragen` — es geht nichts verloren.

## 6 · Wenn eine Migration scheitert

Sie sind alle wiederholbar (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
Ein abgebrochener Lauf wird durch einen erneuten Start nachgeholt. **Es gibt
keinen Rückwärtsgang.** Wer etwas rückgängig machen muss, braucht eine
Wiederherstellung — siehe §8.

---

## 7 · Was man sieht, und was nicht

**Real vorhanden:**

- `/admin` „Heute" — offene Betriebspunkte, überfällige Schritte, neue Anfragen
- `/admin/material` — Umgebung und Material, gegen die Wirklichkeit gemessen
- `/api/selftest` — prüft **env, Token-Kette, Manipulationsschutz, Resend UND
  die Datenbank** mit einer echten Abfrage. Antwortet `state: ok | degraded |
  failed`; `degraded` nennt beim Namen, was fehlt (heute:
  `alert-destination`). 503 bei `failed` — die Sprache, die jeder
  Uptime-Wächter versteht. Braucht `SELFTEST_SECRET`.

```bash
curl -s "https://<host>/api/selftest?key=$SELFTEST_SECRET" | jq
```
- `raiseAlert()` → Serverprotokoll, zusätzlich Webhook wenn `ALERT_WEBHOOK_URL` gesetzt

**Der Zeitplan (Gate 01):** `vercel.json` ruft `/api/selftest` einmal täglich
(07:00 UTC). Hobby-Plan erlaubt nur einen Lauf pro Tag — darum nicht 07:00 und
19:00. Ohne Schlüssel in der Datei — Vercel schickt bei jedem
Cron-Aufruf `Authorization: Bearer $CRON_SECRET`, und die Route akzeptiert das
als zweiten Ausweis. Damit steht kein Geheimnis im Repo.

Aktiv wird er, sobald **`SELFTEST_SECRET` und `CRON_SECRET`** in Vercel
gesetzt sind. Vorher antwortet die Route 503 `selftest_disabled` — gemessen am
05.09.2026 an der Live-Adresse.

**Nicht vorhanden — und das ist der ehrliche Stand:**

- **Keine unabhängige Verfügbarkeitsüberwachung.** Der Cron läuft auf Vercel
  und ruft die eigene Anwendung. Ist die Anwendung ganz aus, schlägt der
  Aufruf fehl — aber es ist Vercel, das das merkt, nicht wir. Wer wissen will,
  ob die Seite nachts erreichbar war, braucht einen Wächter AUSSERHALB dieser
  Plattform. Das ist eine Konto-Entscheidung, kein Code.
- Kein Auflaufen von Fehlern über die Zeit. Ein Alarm ist ein Zeitpunkt, keine Kurve.
- **`ALERT_WEBHOOK_URL` ist nicht gesetzt.** Der Meldeweg ist gebaut und
  geprüft — Zustellung, Ablehnung (4xx/5xx wird protokolliert),
  Zeitüberschreitung nach 3 Sekunden, fehlendes Ziel. Was fehlt, ist die
  Adresse eines Empfängers. Solange sie fehlt, meldet `/api/selftest`
  `degraded: ["alert-destination"]` — nicht still gesund.

```bash
# Meldeweg prüfen, ohne dass ein echter Empfänger etwas bekommt:
node scripts/alert-sink.mjs --mode echo &          # zeigt die Nutzlast
node scripts/alert-sink.mjs --mode silent &        # antwortet nie → prüft die Frist
node scripts/alert-sink.mjs --mode 4xx &           # lehnt ab → muss protokolliert werden

ALERT_WEBHOOK_URL=http://127.0.0.1:4999/hook npm run dev
```

## 8 · Sicherung und Wiederherstellung

### Sichern

```bash
CREADIG_ENV=local node scripts/db-backup.mjs --url "postgresql://…" --out ~/creadig-backups
```

`pg_dump` im benutzerdefinierten Format. Zeitgestempelter Dateiname, kein
stilles Überschreiben, Prüfung der Datei durch `pg_restore --list`, und ein
Abbruch mit Fehlercode, wenn irgendetwas davon nicht stimmt. Sicherungen
liegen **ausserhalb** des Arbeitsbaums; `.gitignore` fängt den Fall ab, in dem
jemand `--out .` angibt.

Fehlercodes: `2` Schutz · `3` Datei existiert · `4` pg_dump fehlt · `6` zu
klein · `7` unlesbar.

### Rückspielen und prüfen — in einem Zug

```bash
CREADIG_ENV=local node scripts/db-restore-drill.mjs \
  --dump ~/creadig-backups/creadig-….dump \
  --source "postgresql://…"          # optional: Zeilenvergleich gegen die Quelle
```

Zwölf Schritte: Datei da → lesbar → leere Wegwerf-Datenbank → Rückspielung →
Schema (148 Zeilen) → alle Kerntabellen → Bestandsprüfung → Zeilenzahlen →
Verknüpfungen inhaltlich → **echte Anwendungs-Abfrage** (`ORG_COLUMNS` aus
`lib/vertrieb-store-neon.ts`) → aufräumen.

**Ein fehlgeschlagener Schritt beendet den Lauf mit Code 10.** Es gibt kein
„im Wesentlichen erfolgreich". Nachgemessen am 05.09.2026: mit absichtlich
verwaisten Zeilen bricht die Übung an der Bestandsprüfung ab.

Das Ziel ist **immer** eine Wegwerf-Datenbank (`--target`, Vorgabe `g1_drill`).
Der Schutz lässt nichts anderes zu.

### Was der Stand ist

| | |
|---|---|
| **Rückspiel-Mechanismus** | **ABGENOMMEN** — 12/12, gegen PostgreSQL 17 |
| **Sicherung durch creaDIG** | **GEBAUT** — läuft, prüft sich selbst, scheitert laut |
| **Anbieter-Sicherung (Neon)** | **UNGEPRÜFT** — aus dieser Ablage nicht belegbar |
| **Sicherung der echten Produktionsdaten** | **UNGEPRÜFT** — kein lesbarer Zugang |

### Was wiederherstellbar ist

**Kritisch:** Anfragen, Kontakte, Organisationen, Standorte, Vorgänge,
Beziehungen, Chronik.

**Ohne Datenbank rekonstruierbar:** jede Anfrage, die je eine Mail erzeugt
hat — aus dem Postfach, von Hand.

**Nicht rekonstruierbar:** Stufen, nächste Schritte, Beziehungsgrade,
Kundenhistorie, Standorte, Chronik. Alles, was im Control Center entstanden
ist.

**Wer spielt zurück:** der Inhaber. **Womit:** den zwei Befehlen oben.
**Was danach zu prüfen ist:** `check-integrity.sql` (elf Nullen),
`/api/selftest` (Datenbank erreichbar), `/admin/vertrieb` lädt.

**Zahlenwerte für RPO/RTO: OWNER DECISION.** Wie viel Datenverlust und wie
viel Ausfallzeit tragbar sind, ist eine Geschäftsentscheidung — hier wird
keine Zahl erfunden. Der technische Weg dorthin existiert und ist geprüft.

## 9 · Was gegen Production niemals getan wird

- Kein Testabsenden gegen die Live-Adresse.
- Kein `LEAD_STORE=file` im Betrieb.
- Keine Abnahmedatensätze in der Produktionsdatenbank.
- Kein zerstörendes Zurückspielen.
- Kein `CSP_ENFORCE=1` ohne neuen Bau und Kontrolle der Kopfzeilen.
- Keine Migration ohne vorherigen Lauf gegen eine Wegwerf-Datenbank.

## 10 · Sicher testen

### Der Schutz gegen Production

`scripts/lib/env-guard.mjs` sagt NEIN, bevor ein Werkzeug an ein Ziel geht,
das echt sein könnte. Geprüft werden Umgebung (`VERCEL_ENV`, `CREADIG_ENV`,
`NODE_ENV`, `CI`) **und** die Art der Datenbank (verwaltet / fremd / lokal /
Wegwerf / fehlend / unlesbar).

Eine Wegwerf-Datenbank erkennt er am Namen — `g1_…`, `probe…`, `test…`,
`tmp…`, `drill…`, `cc_…`, `abnahme…` auf `localhost`. Alles andere ist im
Zweifel echt, und im Zweifel lautet die Antwort nein.

Nachgemessen über elf Fälle: Wegwerf lokal wird auch mit
`VERCEL_ENV=production` erlaubt (dort kann nichts Echtes liegen), eine
Neon-Adresse wird auch in lokaler Umgebung abgelehnt, leere und unlesbare
Verbindungen ebenfalls.

Die bewusste Ausnahme ist keine Einstellung, sondern ein Satz:

```bash
CREADIG_ALLOW_UNSAFE_DB=ich-weiss-was-ich-tue
```

Sie wird protokolliert.



Abnahmeläufe laufen ausschliesslich so:

```bash
LEAD_STORE=file LEAD_STORE_FILE=/tmp/abnahme.json \
RESEND_API_KEY=lokal LEAD_FROM=test@example.com LEAD_TO=test@example.com \
NODE_OPTIONS="--import ./scripts/no-mail.mjs" \
npx next dev -p 3500
```

`no-mail.mjs` fängt jeden Aufruf an `api.resend.com` ab. **Ohne diese Zeile
geht echte Post raus.** Testadressen enden auf `@beispiel.invalid` — diese
Domäne ist im Ausschlussfilter hinterlegt und erscheint nie in einer
operativen Liste.
