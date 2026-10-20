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

## 4 · `GESCHAEFTSFELDER` in `lib/finanz/beleg-felder.ts`

Die Liste der Geschäftsfelder (`digitalprodukte`, `beratung`, `content`,
`glasfaser`, `privat`, `sonstiges` — seit dem Säulen-Durchlauf, siehe
„Säulen, Ziele, Diversifikation, § 19-Projektion" unten) ist eine feste, für
creaDIGs eigene Einkommensarchitektur geschnittene Aufzählung — Grundlage
für Belege, Buchungen und die Auswertung nach Geschäftsfeldern
(`components/finanz/geschaeftsfelder.tsx`). Eine andere Firma hätte andere
Felder; die Liste müsste je Mandant konfigurierbar werden, nicht eine zweite
feste Aufzählung daneben.

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
| `034-bank-saldo.sql` | `fin_einstellungen.bank_saldo_cent`/`bank_saldo_am` — Vorschlag aus dem Bank-Import, Kontostand erst nach Klick übernommen | 9 (Professional-Pass) |
| `036-saeulen-ziele.sql` | `fin_ziele` (neu), `geschaeftsfeld`-Übersetzung auf `fin_buchungen`/`fin_belege`/`fin_leistungen`/`fin_dokumente` | Säulen-Durchlauf |

### Professional-Pass (nach Phase 9, auf eigenen Wunsch)

Eine Selbstprüfung nach Phase 9 fand mehrere Stellen, die `teilbezahlt`
(Phase 6) nicht kannten, und einen echten Zeitpunktfehler im Kernbuch: eine
Teilzahlung erzeugte keine eigene Buchung, sondern blieb bis zur komplett
bezahlten Rechnung unsichtbar für Kontostand (`kontostandHeute()`),
Liquiditätsprognose und EÜR — die ganze Summe sprang dann auf einmal, am Tag
der LETZTEN Rate, in die Vergangenheit der ersten Teilzahlung hinein. Behoben:
`erfasseZahlung()` bucht jetzt JEDE Zahlung sofort als eigene `gebucht`-Zeile
(`verbucheZahlungGebucht()`, je USt-Satz-Gruppe eine, der Reihe nach gefüllt),
die ursprüngliche `geplant`-Zeile schrumpft oder verschwindet entsprechend.
Zusätzlich behoben: Kunden-Dokumentseite kannte `teilbezahlt` nicht (zeigte
den vollen Betrag ohne Hinweis auf bereits Gezahltes), die Rechnungen-Liste
zählte `teilbezahlt` nirgends mit, der Bank-Abgleich hatte keine deterministische
Tie-Break-Regel bei mehreren Treffern, und es gab keinen manuellen
Zuordnungsweg, wenn der automatische Vorschlag fehlte oder falsch lag.

Danach zwei fachliche Nachträge auf ausdrücklichen Wunsch (nicht im
10-Phasen-Prompt, aber in dessen Geist — reale Finanz-Daten, keine
Spekulation):

- **AfA/Anlagevermögen aus Handeingabe**: Die Rechenlogik für mehrjährige
  Abschreibung (`aufwandImJahr()`, `NETTO_SQL`, `berechneEuer()`s
  Carry-forward über die Nutzungsdauer) war immer schon vollständig —
  aber nur über den Fibero-Abgleich erreichbar. `buchungAnlegen()` hat jetzt
  ein optionales „Nutzungsdauer (Jahre)"-Feld; die GWG-Grenze entscheidet
  weiterhin der Steuerberater.
- **Kompass-Wachstumssignale** (`lib/finanz/rechnen.ts`, `kompass()`):
  zwei neue, rein zahlengetriebene `Hinweis`e mit `schwere: "neutral"` —
  (1) wie viel freies Kapital über dem 6-Monats-Ziel-Puffer liegt, als
  konkreter Euro-Betrag statt eines Allgemeinplatzes, und (2) welches
  Geschäftsfeld dieses Jahr den größten Anteil des Gewinns trägt (ab 50 %
  bei mindestens zwei aktiven Feldern, nie bei Gesamtverlust). Beides sind
  Beobachtungen aus echten Zahlen, keine KI-Empfehlungen — die
  unternehmensweite „Empfehlungs-Gate" (G28/G29, `lib/gedaechtnis.ts` /
  `lib/navigator.ts`) ist ein strikt separates, regelbasiertes System ohne
  jede KI-Bewertung und liest heute keine Finanz-Daten; diese Signale laufen
  bewusst innerhalb von Finanz, nicht dort hinein. Werden zusätzlich in der
  Besitzer-Morgenmail unter „Wachstum & Kapital" angezeigt, auch an ruhigen
  Tagen ohne dringenden Anlass — gerade dann sind sie am nützlichsten.
- **KI-Mahnungsentwurf** (`entwerfeMahnung()` in `lib/finanz/assistent.ts`,
  Oberfläche: `components/finanz/auftraege/mahn-entwurf.tsx` auf
  `/finanz/vorgang/[id]`): ein ZWEITER, persönlicherer Weg neben der festen
  DE/EN/TR-Mahnstufen-Vorlage (`nachfassen()`) — für Einzelfälle, wo ein
  individueller Ton mehr bringt als die Vorlage (optionale Notiz, z. B.
  „Kunde bat um Aufschub"). Nutzt nur echte Rechnungsdaten (Nummer, offener
  Rest, Tage überfällig), erfindet nichts. Wird NIE automatisch verschickt —
  der Entwurf landet editierbar in der Oberfläche, Muhammed kopiert und
  verschickt ihn selbst. Braucht AI_GATEWAY_API_KEY (lokal nicht
  eingerichtet, siehe .env.example); ohne Zugang ein klarer Fehlertext statt
  eines Absturzes oder erfundenen Entwurfs (Drill-Abschnitt Q).

### Säulen, Ziele, Diversifikation, § 19-Projektion (Säulen-Durchlauf)

Der Owner führt sein Geschäft als drei grundverschiedene Einkommenssäulen
(Digitalprodukte & -dienstleistungen, internationale Beratung, Content &
eigene Marke) plus Glasfaser-Subunternehmertum als unveränderte vierte,
physische Altlast — keine der drei Säulen. `GESCHAEFTSFELDER`
(`lib/finanz/beleg-felder.ts`) spiegelt das: `digitalprodukte` (ersetzt die
früheren `it`/`software`/`ecommerce`), `beratung`, `content`, `glasfaser`,
`privat`, `sonstiges`.

- **Migration der alten Werte ist zweigeteilt**, weil die GoBD-Festschreibung
  (`trg_fin_buchungen_festschreibung`, 030) eine bereits `gebucht`e,
  nicht-fibero Zeile strikt vor jeder Spaltenänderung schützt — auch vor
  dieser Migration. `fin_belege`/`fin_leistungen`/`fin_dokumente` tragen
  keine solche Sperre und werden per `UPDATE` direkt übersetzt; eine schon
  gebuchte `fin_buchungen`-Zeile bleibt für immer bei ihrem damaligen Wert
  und wird stattdessen beim Lesen übersetzt (`geschaeftsfeldSchluessel()`,
  `lib/finanz/beleg-felder.ts`, angewendet in `lib/finanz/felder.ts` und
  `lib/finanz/diversifikation.ts`). Keine Buchung verliert ihre Zuordnung —
  die alte Zeile bleibt unangetastet, erscheint aber überall korrekt unter
  der neuen Säule.
- **Ziele** (`lib/finanz/ziele.ts`, Seite `/finanz/ziele`): ein Ziel-Tracker
  für Säulen ohne (noch) echte Buchungen. Der Fortschritt ist NIE eine
  eigene Zahl, sondern immer aus `fin_buchungen` derselben Säule seit Anlage
  des Ziels abgeleitet. Ein Platzhalter-Ziel (Betrag 0) erkennt sich am
  Titel-Präfix „Platzhalter –" (`istPlatzhalterZiel()`), nicht an einer
  eigenen Spalte.
- **Diversifikation** (`lib/finanz/diversifikation.ts`, Dashboard-Kachel):
  Anteil jeder Säule an den Einnahmen der letzten 12 Monate, rein aus
  `fin_buchungen` abgeleitet. Ab 70 % Anteil einer Säule bei mindestens zwei
  aktiven Säulen ein ruhiger Konzentrations-Hinweis; bei weniger als zwei
  aktiven Säulen eine eigene, zurückhaltende Formulierung statt einer
  Prozentzahl, die mehr Verteilung behauptet, als es gibt.
- **§ 19-Projektion** (`paragraph19Projektion()` in `lib/finanz/
  paragraph19.ts`): eine zweite, klar als Projektion beschriftete Kennzahl
  neben der echten, rechtlich verbindlichen § 19-Zahl — echter laufender
  Jahresumsatz PLUS offene, nicht-Platzhalter Beratungs-Ziele mit Frist im
  laufenden Jahr. Ändert nie das Ergebnis von `paragraph19Status()` und löst
  keine der echten § 19-Umstellungs-Aktionen aus.

Bewusst NICHT gebaut: Reichweite/Follower/Content-KPIs — Finanz bildet nur
die monetäre Seite ab, eine „Marketing"-Seite ist ein eigenes, späteres
Thema.

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
Steuerberater-Paket), jeder Betrag exakt auf den Cent geprüft. Abschnitte
S–W (Säulen-Durchlauf): S Geschäftsfelder-Rename inkl. GoBD-Grenzfall, T
Ziele, U AI-UGC-Video (Phase A/B), V Diversifikation, W § 19-Projektion.

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

## Nachtrag: Liquidität, USt-VA, Bescheide, Investment, Kundenbezug

| Modul | Zweck |
|---|---|
| `rechnen.ts` (`kuenftigeBewegungen`) | Liquidität mit geschätztem Steuerabfluss; Szenarien vorsichtig / erwartet / optimistisch (`?szenario=`); überfällige Forderungen nach 21 Tagen, Pipeline gewichtet. Kompass und Warnungen nutzen immer „vorsichtig“. |
| `ustva.ts` + `/finanz/steuern/ustva` | USt-Voranmeldung (Kz 81/86/66/83), Ist-Versteuerung; Zahllast je Frist in die Liquidität; Übernahme in die Frist ist ein Owner-Klick. Keine ELSTER-Übermittlung — nur Ausfüllhilfe. |
| `bescheide.ts` + `/finanz/bescheide` | Tabelle `fin_bescheide`; Vorauszahlung/Nachzahlung/Erstattung wirken auf Fristen. Nur Metadaten, kein Datei-Upload. |
| `investment.ts` + `/finanz/investment` | Tabellen `fin_anlagen`, `fin_anlagen_staende`; investierbar = frei − 6 Monatsausgaben; Was-wäre-wenn; Werte manuell mit Stichtag, keine Live-Kurse, keine Anlageberatung. |
| `kunden-bezug.ts` | Geld je Organisation (eingenommen, offen, überfällig, Zahlungsdauer) aus `fin_dokumente`/`fin_zahlungen` — speist Kundenkarte und Kundenlage; Beträge nur für den Inhaber. |
| `kurzlage.ts` | zusätzlich nächste Frist und überfällige Rechnungen → Finanz-Signal der Zentrale springt auf „Achtung“. |

Migration (lesbare Kopie): `scripts/migrations/039-finanz-bescheide-anlagen.sql`.

### Automatisierung (alles vorbereiten, nie von allein senden)

| Was | Wie |
|---|---|
| `abos.ts` + `/finanz/abos` | Tabelle `fin_abos`; 5 Tage vor dem Termin entsteht ein Rechnungs-ENTWURF, der Termin rückt bedingt vor (kein Doppellauf). Pausieren statt löschen. |
| `agent.ts` (Truppe-Agent „finanz“, täglich) | erzeugt Abo-Entwürfe und legt je überfälliger Rechnung und Mahnstufe EINEN Vorschlag in die Freigabe-Liste (`mahnung:<id>:<stufe>`). Versand bleibt dein Klick in `/finanz/vorgang/<id>`. |
| Heute-Seite | vier Kennzahlen auf einen Blick: investierbar, überfällig, planbarer Jahresumsatz, Entwürfe warten. |

Bewusst offen: Kontoabruf (PSD2), Eingangsmail `belege@` (braucht Resend-Empfang + `BLOB_READ_WRITE_TOKEN`, lokal nicht testbar),
Finanz-Dashboard-Mail im Wochenrhythmus. Der §19-Hinweis erscheint nur, wenn `ust_pflichtig` in den Grundlagen AUS ist — für ein
USt-pflichtiges Unternehmen also nie. Das alte `lib/rechnung.ts` mit `invoices`/`payments` ist ein ungenutztes Zweitmodell (nur
`steuerlage` wird gelesen) und wird nicht mehr für Kundenzahlen herangezogen.
