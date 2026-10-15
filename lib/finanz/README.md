# Finanz — Landkarte „eine Firma"

Dieser Durchlauf (PROMPT-FINANZ-100-PROZENT.md, Phase 6) baut **keine**
Mandantenfähigkeit. Er dokumentiert nur, wo Finanz heute hart auf „eine
Firma" (creaDIG selbst) festgelegt ist — damit ein späterer
Mandantenfähigkeits-Durchlauf nicht neu suchen muss, welche Annahmen er
auflösen müsste.

Kein Code an den unten genannten Stellen wurde für dieses Dokument
geändert — nur die Landkarte.

## 1 · `fin_einstellungen.id = 'haupt'`

Es gibt genau EINE Zeile Einstellungen (Kontostand, ESt-Quote,
USt-Pflicht/-Rhythmus, Firmendaten). Jede Lese-/Schreib-Stelle spricht sie
über die feste ID `'haupt'` an, nicht über eine Mandanten-Kennung:

- `lib/finanz/store.ts:84` (`ladeAlles`)
- `lib/finanz/auftraege/store.ts:156` (`ladeFirma`)
- `lib/finanz/auftraege/store.ts:163` (`speichereFirma`)
- `app/(finanz)/finanz/actions.ts:116` (USt-Frist als bezahlt vermerken)
- `app/(finanz)/finanz/actions.ts:149` (`einstellungenSpeichern`)

Mandantenfähigkeit hieße hier: `id` wird zur Mandanten-ID, jede dieser
Abfragen bekommt sie als Parameter statt als Literal, und die Session weiß,
welcher Mandant gerade eingeloggt ist.

## 2 · `FIRMA = "firm-creadig"` in `lib/finanz/fibero-abgleich.ts`

Der Fibero-Abgleich liest ausschließlich die Zeilen, die in fibero unter
der festen `firm_id` `firm-creadig` stehen (`lade()`, Konstante `FIRMA` am
Dateianfang). Für eine zweite Firma bräuchte es entweder eine zweite
`firm_id` oder eine Zuordnung Mandant → fibero-`firm_id`.

## 3 · Der feste KI-Systemprompt in `lib/finanz/assistent.ts`

`SYSTEM` (oben in der Datei) nennt creaDIG, die Rechtsform
„Einzelunternehmen von Muhammed Emin Akyol, Osnabrück, Deutschland" und
spricht den Inhaber direkt als „Muhammed" an — wörtlich im Prompt-Text, nicht
aus einer Variable gelesen. Für eine zweite Firma bräuchte der Prompt
dieselben Firmendaten, die `ladeFirma()` ohnehin schon lädt (siehe Punkt 1),
statt sie ein zweites Mal hart zu hinterlegen.

## 4 · `GESCHAEFTSFELDER` in `lib/finanz/belege.ts`

Die Liste der Geschäftsfelder (`glasfaser`, `it`, `software`, `ecommerce`,
`privat`, `sonstiges`) ist eine feste, für creaDIGs eigenes Geschäft
geschnittene Aufzählung — Grundlage für Belege, Buchungen und die
Auswertung nach Geschäftsfeldern (`components/finanz/geschaeftsfelder.tsx`).
Eine andere Firma hätte andere Felder; die Liste müsste je Mandant
konfigurierbar werden, nicht eine zweite feste Aufzählung danaben.

## Was NICHT hart „eine Firma" ist

Nicht jede feste ID in Finanz ist eine Mandanten-Annahme. `fin_dokumente`,
`fin_buchungen`, `fin_nummernkreis` usw. sind bereits so gebaut, dass eine
Mandanten-Spalte sauber ergänzt werden könnte (jede Zeile trägt schon ihre
eigenen fachlichen Schlüssel, keine impliziten Annahmen über „die eine
Firma" im Datenmodell selbst) — die Kopplung sitzt an den vier Stellen oben,
nicht im Kern der Tabellen.

## Betrieb — Schema, Drill, Cron (Stand: Phase 9 des 10-Phasen-Durchlaufs)

### Schema anwenden

Es gibt KEINEN manuellen Migrationsschritt. Jedes Modul legt sein Schema
beim ersten echten Zugriff selbst an (additiv, `CREATE TABLE IF NOT EXISTS` /
`ADD COLUMN IF NOT EXISTS`) — siehe `finanzDb()`, `auftraegeSchema()`,
`belegeSchema()`, `rateLimitSchema()` usw. Das gilt für JEDE Datenbank, gegen
die der laufende Prozess mit seiner `DATABASE_URL` spricht:

- **Produktion** (Hauptzweig) — legt sich beim ersten produktiven Request an.
- **v0-Preview-Zweig** `br-shiny-hall-b1k96ehg` — legt sich beim ersten
  Request GEGEN DIESEN ZWEIG genauso an, sobald dessen `DATABASE_URL` auf
  die Preview-Verbindung zeigt. Es gibt keinen Verbindungsstring für diesen
  Zweig in dieser Arbeitsumgebung — nicht geprüft, nur aus dem Code-Pfad
  hergeleitet (derselbe lazy-init-Mechanismus gilt dort identisch).

Die `scripts/migrations/0xx-*.sql`-Dateien sind die LESBARE Fassung
derselben SQL-Anweisungen, zum Nachlesen und für einen Steuerberater/
Entwickler ohne Repo-Kontext — nicht zum manuellen Ausführen gedacht.

| Datei | Tabellen/Spalten | Phase |
|---|---|---|
| `029-finanz.sql` | `fin_buchungen`, `fin_einstellungen`, `fin_fristen`, `fin_protokoll` | Basis |
| `012-rechnung.sql` | `fin_dokumente`, `fin_kunden`, `fin_nummernkreis`, `fin_dokument_verlauf`, `fin_leistungen` | Basis (Angebote/Rechnungen) |
| (kein File — siehe `lib/finanz/fibero-abgleich.ts`) | `fin_abgleich` | Basis — **bekannte Lücke, älter als dieser Durchlauf, nicht in diesem Durchlauf nachgetragen** |
| `030-gobd-festschreibung.sql` | GoBD-Trigger (`fin_*_festschreibung()`, `fin_nur_insert()`), `pruefeNummernkreis()` | 1 |
| `033-belege-erechnung.sql` | `fin_belege`, `fin_kopierlaeufe`, `erechnung_*`-Spalten — **nachgetragen in Phase 9**, lief seit Phase 2/3 bereits produktiv ohne lesbare Fassung | 2 + 3 |
| (keine Tabelle — reine Funktionen) | `lib/finanz/paragraph19.ts`, `lib/finanz/euer.ts`, `lib/finanz/datev.ts` | 4 + 5 |
| `031-zahlungen-bank.sql` | `fin_zahlungen`, `fin_bank_umsaetze` | 6 |
| (keine Tabelle — `lib/termine/mail.ts` wiederverwendet) | — | 7 |
| `032-rate-limits.sql` | `fin_rate_limits` | 8 |

### Drill

```
npm run finanz-drill
```

Läuft gegen eine Wegwerf-Postgres (`FINANZ_DRILL_URL`/`TEST_DATABASE_URL`,
Name muss mit `drill_`/`test_` beginnen — siehe `env-guard.mjs`) oder, ohne
gesetzte Variable, gegen eine eingebettete PGlite (keine Abhängigkeit nötig).
Räumt sich selbst per `TRUNCATE` auf, bei jedem Lauf, bevor er beginnt.
Abschnitte F–N prüfen je ein Gebiet einzeln, Abschnitt Z eine durchgehende
Geschichte (Angebot → Annahme → Anzahlungsrechnung → Teilzahlung →
Restzahlung per Bank-Import → Storno → Beleg → eingehende E-Rechnung → EÜR →
Steuerberater-Paket), jeder Betrag exakt auf den Cent geprüft.

### Cron (Vercel, `vercel.json`)

| Route | Zeitplan (UTC) | Zweck |
|---|---|---|
| `/api/finanz/abgleich` | 05:30 täglich | Fibero-Hauptbuch-Abgleich |
| `/api/finanz/morgenmail` | 06:15 täglich | Besitzer-Morgenbericht (Phase 7) |

Beide teilen sich dieselbe Absicherung: `CRON_SECRET` als Bearer-Token, sonst
Vercels `user-agent: vercel-cron/*` als Rückfalllösung.

### Optionale Module (Finanz läuft ohne sie, siehe `.env.example`)

| Fehlt | Betrifft | Verhalten ohne |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Beleg-Hand-Upload (Phase 2) | Upload-Route meldet "Datei-Speicher ist nicht eingerichtet" |
| `AI_GATEWAY_API_KEY` / echtes Vercel-Laufzeit-OIDC | KI-Vorschlag beim Beleg-Upload (Phase 2) | Upload funktioniert, nur ohne automatischen Vorschlag |
| `FIBERO_SUPABASE_URL` / `_SERVICE_ROLE_KEY` | Fibero-Abgleich | Abgleich-Cron liefert leeres Ergebnis, kein Fehler |
| `RESEND_API_KEY` + `MAIL_FROM`/`LEAD_FROM` | Alle Finanz-Mails (Kundenlink-Mails, Morgenmail) | Mail wird nicht verschickt, Grund wird zurückgegeben, nichts bricht |
| `LEAD_TO` | Morgenmail-Empfänger (Phase 7) | Morgenmail meldet "LEAD_TO fehlt", verschickt nichts |

In diesem Durchlauf lokal bestätigt fehlend: `BLOB_READ_WRITE_TOKEN`,
`AI_GATEWAY_API_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, `LEAD_TO` — jede
betroffene Phase wurde trotzdem fertig gebaut und per Drill geprüft, mit dem
fehlenden Zweig als eigene, benannte Prüfung (z. B. Drill M6/K-Abschnitte).
