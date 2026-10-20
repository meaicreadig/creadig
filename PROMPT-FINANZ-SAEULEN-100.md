# creaDIG Finanz — Einkommenssäulen-Durchlauf (ein ununterbrochener Durchlauf)

## Regel für diesen Durchlauf
Arbeite **ununterbrochen bis zum Ende**. Melde dich nicht mit „teilweise fertig" oder
„X fehlt noch". Jeder Punkt unten hat eine **konkrete Definition von fertig** — entweder
er ist erfüllt und verifiziert, oder du arbeitest weiter, bis er es ist. Die einzige
zulässige Pause ist in Phase 0 beschrieben (Zusammenführen mit v0-Arbeit) — danach keine
weitere Rückfrage. Am Ende steht ein Bericht, kein Zwischenstand.

## Sicherheits-Setup (zuerst, vor jeder Änderung)
1. `git fetch origin`
2. **Prüfe, ob `origin/v0/steuer-pauschalen-und-buch-*` (oder ein ähnlicher v0-Branch, der
   `lib/finanz/*` anfasst) existiert und noch nicht in `origin/feat/system-haus-site`
   gemerged ist.** Falls ja: lies seinen Diff. Er erweitert vermutlich Buchungsfelder
   (Archivierung u. ä.) — baue DARAUF auf, verwirf nichts davon, dupliziere keine Felder,
   die er schon anlegt. Falls er mit dieser Arbeit kollidiert (gleiche Tabelle, gleiches
   Feld anders benannt): löse es zugunsten von Konsistenz, dokumentiere die Entscheidung
   im ersten Commit.
3. Neuer lokaler Branch **ab dem aktuellen `origin/feat/system-haus-site`**:
   `git checkout -b finanz-saeulen origin/feat/system-haus-site`
4. **Nur lokal committen. Kein `git push`.** v0 arbeitet parallel auf
   `feat/system-haus-site` — dieser Branch darf damit nicht kollidieren.
5. Am Ende: Zusammenfassung + `git diff --stat` gegen den Startpunkt. Kein Merge, kein
   Push — das entscheidet der Owner.

## Kontext — die reale Einkommensarchitektur des Owners
Der Owner betreibt sein Geschäft nicht als eine Sache, sondern als **drei grundverschiedene
Säulen plus eine vierte, unveränderte Altlast:**

1. **Digitalprodukte & -dienstleistungen** (heute stärkste, belegte Säule): creaDIG als
   Systemhaus, abonnementbasierte Software, die ein echtes Branchenproblem löst (meAI,
   FIBERO, CASSAMEA, Stammo), E-Commerce (maqam). Gemeinsamer Nenner: **Produkt/Dienstleistung
   gegen wiederkehrendes Geld.**
2. **Internationale Beratung** (im Aufbau, noch kein Umsatz): EINE Positionierung, nicht
   fünf Angebote — *„KI-gestützte Wachstums- und Automatisierungsberatung"* mit den
   Facetten No-Code-Automatisierung, KI-SEO, KI-Ads, Growth/GTM, Vibe-Coding-Methodik.
   Zielmarkt bewusst außerhalb Deutschlands (USA, Dubai, Schweiz) — dort, wo für dieselbe
   Expertise mehr gezahlt wird. Es ist dieselbe Expertise wie creaDIG, nur exportiert.
3. **Content & eigene Marke** (bei null, kein Vorwissen): Faceless-Content-Produktion.
   Verdient heute kein Geld — baut Reichweite auf, die später Säule 1 und 2 Nachfrage
   zuführt. **AI-UGC-Video ist Teil davon, aber zweiphasig**: Phase A = Methode für den
   eigenen Content (kostet nichts, verkauft nichts). Phase B = dieselbe Methode wird zu
   einem Produkt, das an Marken verkauft wird — und wandert dann architektonisch in Säule 1.
4. **Glasfaser-Subunternehmertum** (bereits vorhanden, über `fibero-abgleich.ts` abgeglichen):
   gehört zu KEINER der drei Säulen — es ist eine physische Dienstleistung, kein digitales
   Geschäft. Bleibt als eigene, vierte, unveränderte Kategorie bestehen. Erfinde keine
   Verbindung zu den drei Säulen, wo keine ist.

**Außerhalb des Scopes (bewusst, wird eine eigene „Marketing"-Seite, nicht Teil von Finanz):**
Reichweite, Follower, Views, Kampagnen, Content-Kalender, Kanalperformance. Finanz bildet
NUR die monetäre Seite ab — ob und wie viel Geld eine Säule bringt oder bringen soll.
Baue hier keine nicht-monetären Wachstums-KPIs, auch wenn sie thematisch naheliegen.
Baue auch keine Marketing-Seite — nur Finanz.

---

## Phase 0 — Geschäftsfelder neu ordnen (nicht neu erfinden)
Heute: `GESCHAEFTSFELDER` in `lib/finanz/belege.ts` = `glasfaser, it, software, ecommerce,
privat, sonstiges` — passt nicht zur realen Struktur des Owners.

- Ordne neu, ohne bestehende Daten zu verlieren:
  `digitalprodukte` (ersetzt/fasst `it`, `software`, `ecommerce` sinnvoll zusammen — prüfe
  anhand bereits gebuchter Zeilen, was wohin gehört, und biete eine klare 1:1- oder
  dokumentierte Zuordnungsregel; keine Buchung verliert ihre Zuordnung), `beratung` (neu),
  `content` (neu), `glasfaser` (bleibt exakt wie heute, unverändert), `privat` (bleibt),
  `sonstiges` (bleibt).
- Jede Stelle, die `GESCHAEFTSFELDER` konsumiert (`felder.ts`, `components/finanz/
  geschaeftsfelder.tsx`, Dashboard, Belege-UI, `fibero-abgleich.ts`'s hartkodiertes
  Geschäftsfeld-Mapping, falls vorhanden) entsprechend anpassen.
- Eine Migration, additiv, die bestehende `fin_buchungen.geschaeftsfeld`- und
  `fin_belege.geschaeftsfeld`-Werte korrekt auf die neuen Schlüssel übersetzt (kein
  Datenverlust, keine Zeile verliert ihre Historie).
- Drill-Ergänzung: alte Werte werden korrekt migriert, neue Werte sind genau diese sechs,
  nicht mehr und nicht weniger.

## Phase 1 — Ziele/Pipeline-Modul (für Säulen ohne heutigen Umsatz)
Säule 2 (Beratung) und die Frühphase von Säule 3 (Content) haben noch keine echten
Buchungen. Eine Buchhaltung kann das nicht abbilden — das braucht ein **Ziel-Tracker**,
getrennt von, aber verbunden mit der echten Buchhaltung.

- Neue Tabelle `fin_ziele` (additiv, legt sich selbst an wie die übrigen `fin_*`-Tabellen):
  `id, saeule text CHECK (saeule IN ('digitalprodukte','beratung','content','glasfaser',
  'privat','sonstiges')), titel text, zielbetrag_cent bigint, frist date, status text
  DEFAULT 'aktiv' CHECK (status IN ('aktiv','erreicht','verworfen')), notiz text,
  created_at timestamptz, erreicht_at timestamptz`.
- **Der „aktuelle Stand" eines Ziels wird NICHT separat eingetragen, sondern aus den echten
  Buchungen derselben Säule im selben Zeitraum abgeleitet** (Summe `fin_buchungen` wo
  `art='einnahme'` und `geschaeftsfeld = saeule`, im relevanten Zeitraum). Kein
  Doppel-Erfassen von Zahlen, eine Quelle der Wahrheit.
- Neue Seite `/finanz/ziele`: Liste der Ziele je Säule, Fortschrittsbalken (abgeleiteter
  Stand gegen Zielbetrag), Frist, Status. Formular zum Anlegen/Bearbeiten/Verwerfen —
  nur `owner`-Rolle, exakt das bestehende Zugangsmuster aus `app/(finanz)/finanz/
  actions.ts` übernehmen.
- Kachel auf dem Hauptdashboard (`finanz/page.tsx`): aktive Ziele mit Fortschritt, sortiert
  nach Frist.
- **Lege für jede der drei neuen Säulen GENAU EIN Beispiel-Ziel mit klar als Platzhalter
  gekennzeichnetem Titel an** (z. B. „Platzhalter – vom Owner zu ersetzen", Betrag 0),
  NICHT mit erfundenen echten Zielbeträgen — damit die Seite beim ersten Öffnen nicht leer
  ist, aber niemand eine erfundene Zahl für eine echte hält. Der Owner ersetzt sie nach
  diesem Durchlauf selbst über die UI.
- Drill: Ziel anlegen, Buchung in derselben Säule erzeugen, Fortschritt stimmt exakt;
  Zielerreichung setzt Status korrekt; Platzhalter-Ziele sind eindeutig als solche markiert
  (z. B. ein geprüftes Namensmuster oder ein `ist_platzhalter`-Flag).

## Phase 2 — AI-UGC-Video: zweiphasiges Modell über Bestehendes
Kein neues Schema nötig — `fin_leistungen.aktiv` (existiert bereits) trägt das schon.

- Lege (falls noch nicht vorhanden) in `fin_leistungen` einen Eintrag „AI-UGC-Video" an:
  `geschaeftsfeld = 'content'`, `aktiv = false` (Phase A: interne Methode, nicht
  verkaufsfähig, erscheint deshalb nicht in Angeboten).
- Dokumentiere im UI der Leistungen-Seite (`/finanz/leistungen`) sichtbar, was `aktiv`
  bedeutet, falls das heute nicht klar ist — und ergänze einen kurzen Hinweistext/Zustand
  „Intern — noch nicht verkaufsfähig" für inaktive Leistungen, damit der Übergang zu
  Phase B (Owner setzt `aktiv = true`, ändert `geschaeftsfeld` auf `digitalprodukte`,
  sobald er es an Marken verkauft) ein bewusster Ein-Klick-Schritt ist, kein Rätsel.
- Drill: eine inaktive Leistung erscheint nicht im Angebots-Editor; nach Aktivierung
  erscheint sie; Geschäftsfeld-Wechsel wird korrekt übernommen.

## Phase 3 — Diversifikation & Konzentrationsrisiko
Eine wirklich vorausschauende Finanzsicht zeigt, wie abhängig der Owner von einer
einzelnen Säule ist — das gibt es heute nirgends.

- Neue Berechnung (`lib/finanz/diversifikation.ts` o. ä.): Anteil jeder Säule am
  Gesamteinnahmen der letzten 12 Monate (aus `fin_buchungen`, `art='einnahme'`), reine
  Ableitung, keine neue Tabelle.
- Dashboard-Kachel: Balken/Anteile je Säule. Deutliche, aber nicht alarmistische
  Formulierung ab einer Konzentration von 70 % auf eine einzige Säule (z. B. „70 % deines
  Einkommens kommt aus einer Quelle — eine zweite trägt noch wenig").
- Wenn weniger als 2 Säulen überhaupt Umsatz haben: eigener, ruhiger Hinweis statt
  Prozentangabe („noch zu wenig Verteilung für eine Aussage").
- Drill: Berechnung stimmt exakt bei 1, 2 und 3+ aktiven Säulen; Schwellenwert-Text
  erscheint korrekt.

## Phase 4 — Vorausschauende § 19-Warnung (Projektion, klar getrennt von der echten Lage)
Internationale Beratungseinnahmen (USD/CHF, teils Reverse-Charge außerhalb Deutschlands)
können die § 19-Grenze schnell erreichen — heute warnt das System nur anhand bereits
gebuchter Einnahmen, nicht anhand realistischer Ziele.

- Erweitere `paragraph19.ts` um eine ZWEITE, klar als Projektion gekennzeichnete Kennzahl:
  realer laufender Jahresumsatz (wie heute, das ist die rechtlich verbindliche Zahl) PLUS
  die Summe aktiver, nicht als Platzhalter markierter `fin_ziele` mit Frist im laufenden
  Jahr für Säule `beratung`.
- Im UI (`Paragraph19Ampel` in `kompass.tsx`): die echte Zahl bleibt die Hauptanzeige
  (unverändert in ihrer rechtlichen Bedeutung). Die Projektion erscheint als separate,
  klar beschriftete Zeile („Falls deine Beratungs-Ziele eintreffen: ~X € — Grenze wäre
  dann in Reichweite"), NIEMALS vermischt mit der echten, rechtlich verbindlichen Zahl,
  und löst KEINE der echten § 19-Umstellungs-Aktionen aus (die bleiben ausschließlich an
  die reale Zahl gebunden).
- Drill: Projektion ändert nie das Ergebnis der echten `Paragraph19Status`-Berechnung;
  Projektion erscheint nur, wenn mindestens ein nicht-Platzhalter-Ziel in `beratung` mit
  Frist im laufenden Jahr existiert.

## Phase 5 — Gesamtverifikation
- `scripts/finanz-drill.mjs` um alle oben verlangten Prüfungen erweitern (nicht
  ersetzen — die bestehenden ~130 Prüfungen bleiben grün).
- `npx tsc --noEmit` ohne Fehler.
- `npm run finanz-drill`, `npm run rechnung-drill`, `npm run kette-drill` alle grün.
- `.env.example` und `lib/finanz/README.md` um die neuen Konzepte ergänzen (Säulen, Ziele,
  Diversifikation, Projektion) — kurz, auf dem Niveau der bestehenden Dokumentation.

## Definition von „fertig" (alles muss zutreffen)
- [ ] Phase 0: v0-Parallelarbeit eingearbeitet, keine verlorenen Felder, keine Dopplung.
- [ ] Phase 0: sechs Geschäftsfelder exakt wie oben, keine Buchung verliert ihre Zuordnung.
- [ ] Phase 1: `/finanz/ziele` funktioniert, Fortschritt ist abgeleitet (nicht doppelt
      erfasst), Platzhalter-Ziele sind eindeutig als Platzhalter erkennbar.
- [ ] Phase 2: AI-UGC-Video-Leistung existiert, inaktiv, Übergang zu Phase B ist ein
      dokumentierter Ein-Klick-Schritt.
- [ ] Phase 3: Diversifikationskachel zeigt korrekte Anteile und Hinweise.
- [ ] Phase 4: Projektion sichtbar getrennt von der echten § 19-Zahl, beeinflusst sie nie.
- [ ] Phase 5: alle genannten Drills + bestehende Drills grün, `tsc` sauber.
- [ ] Nirgends eine erfundene echte Zielzahl, erfundener Kundenname oder erfundener
      Umsatz — nur klar markierte Platzhalter.
- [ ] Keine Marketing-/Reichweiten-/Follower-Funktion gebaut — das bleibt eine eigene,
      spätere Seite.
- [ ] Glasfaser/fibero unverändert — keine neue Verbindung zu den drei Säulen erfunden.
- [ ] Abschlussbericht: geänderte/neue Dateien, `git diff --stat`, welche Platzhalter der
      Owner noch mit echten Zahlen füllen muss (konkrete Liste: wo genau, welche Seite).

Wenn ein einzelner Punkt aus einem echten technischen Grund nicht lösbar ist, sage das am
Ende explizit mit Begründung — das ist der einzige akzeptable Fall von „nicht fertig".
Alles andere wird bis zum Ende durchgezogen, ohne Zwischenmeldung.
