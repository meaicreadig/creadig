# creaDIG — Audit-Backlog (aus dem Vollaudit, 2026-08-22)

**So arbeiten wir das ab:** von oben nach unten. Welle 1 zuerst, dann 2, dann 3. Erledigtes abhaken `[x]`. Ein Punkt = ein Commit. Nach jeder Welle: `npm run build` + Screenshots + Freigabe, dann `git push origin feat/system-haus-site`. Nichts auf `main`, bis „live".

Score = (Wirkung × Dringlichkeit) ÷ Personentage. Reihenfolge folgt Wirkung/Aufwand, nicht nur Score.

---

## WELLE 1 — sofort (≈1 Tag): Deploy grün + sichtbar lebendig
- [x] **TECH-1** Deploy-Function schluckt Repo-Root (Score 100 · 0,25 PT) → in `next.config.ts` top-level `outputFileTracingExcludes: {"*":[".git/**",".next/cache/**","_legacy/**","design-mockup/**",".cursor/**",".claude/**",".video-analysis/**","**/*.pdf","**/*.zip"]}`. **Ohne das ist NICHTS auslieferbar.**
- [x] **VIS-1** „Dunkle" Bänder sind nicht dunkel (Score 25 · 1 PT) → `.section-dark` im Hellmodus echten dunklen Tokensatz geben (`--background:#201e1b; --foreground:#fbfbf9`). Wirkt auf Impact/meAI/Closing/Footer = echter Rhythmus. **Kernfix gegen „still/boutique".**
- [x] **VIS-3** Typo zu groß/fett (Score 32 · 0,5 PT) → `type-h2` clamp(1.875rem,4vw,3.25rem)/weight 600; `type-display` max 7rem; `type-h1` max 3rem.
- [x] **VIS-4** Gold zu schwach, klebt am Label (Score 24 · 0,5 PT) → Eyebrow-Linie 2px + `gold-text`; Abstände öffnen; zwei Inline-Varianten auf eine Komponente.
- [x] **SEC-6** Clickjacking/HSTS (Score 40 · 0,1 PT) → `X-Frame-Options: DENY` + HSTS `includeSubDomains; preload`.
- [x] **TECH-3** Fremddateien aus Deploy-Root (Score 36 · 0,25 PT) → `Archiv_creadig.zip`, PDFs, `_legacy/`, `design-mockup/` aus dem Root ziehen (Repo-Hygiene).

## WELLE 2 — diese Woche
- [ ] **SEC-1** Impressum-Pflichtangaben (Score 100 · OWNER) → Rechtsform · USt-IdNr **oder** §19 · §18-MStV-Verantwortlicher. **Einziger echter Go-Live-Rechtsblocker.**
- [x] **TECH-2** fs-Root-Cause dauerhaft (Score 50 · 0,5 PT) → `product-media.ts` Screens per `prebuild`-Skript in statische Map schreiben statt `readdirSync(process.cwd()…)`.
- [x] **TECH-4** Deploy-Gate (Score 32 · 0,5 PT) → `postbuild`-Skript: Function-Trace >200 MB → Exit 1.
- [x] **TECH-5** KI-Attrappe (Score 24 · 0,25 PT) → bis zur echten API ausblenden (kein totes „KI"-Widget auf einer KI-Marke).
- [x] **VIS-5** Riesen-Stats ohne Zahlen (Score 18 · 0,5 PT) → „A–Z"/„DE·CH" nicht als Stat; Doppelung Impact/CompanyTeaser auflösen.
- [x] **UX-2** Kontaktformular ohne Erfolgs-Zustand (Score 18 · 0,5 PT) → `window.open`-Rückgabe prüfen + Inline-Bestätigung.
- [x] **GROW-3** Preise positionieren als Agentur (Score 9 · 1 PT) → Pakete als „Einstieg", Architecture auf „ab"-Logik, Retainer sichtbar machen.
- [x] **UX-1** Startseite verankert keinen Beleg (Score 8 · 2 PT) → 1 echten Fall/echte Zahl auf die Startseite; leere gated Slots raus, bis Inhalt da.

## WELLE 3 — dieser Monat
- [x] **GROW-2** Keine Messung/Lead-Backup (Score 12,5 · 2 PT) → cookiefreies Analytics + Klick-Event + `app/api/lead`-Backup. *(greift mit Traffic)*
- [x] **TECH-6** Bilder ohne next/image (Score 12 · 0,5 PT) → Work-/Case-PNGs auf next/image bzw. WebP/AVIF.
- [x] **TECH-7** Observability/CSP → Speed Insights hinter derselben Einwilligung + `app/api/csp-report` als Berichtsziel. Das Umschalten report-only → scharf steht auf der Live-Checkliste (P4-h).
- [x] **VIS-2** Eine visuelle Frequenz (Score 6,7 · 3 PT) → 3 Sektions-Archetypen + Rhythmus + mehr als eine Mikro-Interaktion. *(eigentliche „Lebendigkeit"-Wurzel, teuer)*
- [x] **FEAT-1** Produkte ohne Nachfragepfad (Score 5,3 · 3 PT) → pro Produkt Warteliste/Demo + E-Mail-Erfassung. *(greift mit Traffic)*
- [x] **GROW-1** TR-Inhalte SEO-unsichtbar → `/tr/`-Routing, zwei Wurzel-Layouts, hreflang auf jeder Seite, zweisprachige Sitemap (36 URLs), eigenes TR-Vorschaubild. 54 statische Seiten statt 32 (P4-i).
- [x] **GROW-4** Social-Profile: Regel und Zustand festgeschrieben, Liste bleibt leer, Footer-Block erscheint nicht. Newsletter bewusst NICHT gebaut — /insights hat keinen Eintrag, ein Anmeldefeld verspräche Post, die es nicht gibt. Erst der Insight, dann die Anmeldung (P4-j).
- [x] **FEAT-3** KI-Assistent: Attrappe entfernt (TECH-5/P1-f). Eine echte Anbindung ist damit eine freie Entscheidung, kein Reparaturzwang mehr.
- [x] **SEC-7** JSON-LD-Escaping → `lib/json-ld.ts`, zehn Blöcke umgestellt (P4-c).
- [x] **SEC-3** CSP zweistufig: vier Direktiven sofort scharf, die volle Policy als Bericht (P4-d).
- [x] **SEC-5** Datenschutzerklärung korrigiert (sie beschrieb den Stand vor GROW-2/P3-d) + Speicherfristen, DE+TR (P4-e).
- [x] **SEC-4** Art.-49-Hinweis im Banner und in der Formular-Einwilligung; CONSENT_VERSION hochgezählt (P4-f).
- [x] **SEC-2** Auftragsverarbeiter als eine Liste aus einer Quelle; `dpaConfirmed` ist ein Owner-Feld — bis zur Bestätigung steht "offen" auf der Seite (P4-g).

## NEU GEFUNDEN (23.08.2026, kein Go-Live-Blocker)
- [x] **SEO-1 / T-1** Vorschaubild fehlte auf allen Unterseiten. Ursache bestätigt: Ein eigenes `openGraph`-Objekt der Seite ersetzt das der Ebene darüber, und das Bild aus der Dateikonvention fällt mit heraus; dessen Adresse trägt zwei Streuwerte. Gelöst über `app/og/de.png` + `app/og/tr.png` (feste Adresse, `force-static`) und einen gemeinsamen Kopfdaten-Helfer `lib/page-metadata.ts`, den alle elf Routen benutzen. 17 Adressen nachgemessen.

## OWNER LIEFERT (kein Code — macht die Seite „wahr")
- [ ] **SEC-1**: Rechtsform · USt-IdNr/§19 · §18 MStV
- [ ] **FEAT-2**: 2–3 Case-Freigaben · 3–5 Google-Reviews · 1 Insight
- [ ] **Produkt-Screens**: echte meAI-Oberflächen → `public/works/products/meai/`
- [x] **maqam** geklärt: echter Kunde (Owner 22.08.2026). Offen bleiben Screenshots, Region und Link.
- [ ] **Vercel-AVV UND Resend-AVV** im jeweiligen Dashboard bestätigen/ablegen, dann `processors[].dpaConfirmed: true` (lib/site-data.ts)
- [ ] **Türkische Projekttexte**: `work.what` und `work.sector` gibt es nur auf Deutsch — auf `/tr/arbeiten/…` steht der Projektsatz deutsch unter türkischer Oberfläche

---

## MASTER-PROMPT 6 — v0-REVIEW (23.08.2026)

Grundlage: die code-verifizierte Lücken-Analyse von v0. Ein Punkt = ein Commit,
`npm run build` grün + Function-Gate vor jedem Commit, nichts auf `main`.

### Stufe 1 — vor dem Livegang (Blocker)
- [x] **BF-1** Terminslots ehrlich (`bb4f209`) → Die hartkodierten Uhrzeit-Listen (`SLOTS_INITIAL`/`SLOTS_ARCHITECTURE`) waren mit nichts verbunden: kein Kalender, keine Belegung. Der Assistent fragt jetzt bis zu drei Wunschtage und drei Zeitfenster; „Das ist noch keine Buchung" steht vor dem Weiter-Knopf, in Schritt 4 und im Erfolgsschritt. Bestätigungsmail in zwei Fassungen, DE+TR. Echter Kalenderabgleich bleibt ein eigenes Projekt.
- [x] **BF-2 / R-2** Missbrauchsschutz Lead-Route (`bc4b346`) → signiertes Zeit-Token (HMAC, `GET /api/lead`, Mindestalter 2 s), IP-Fenster im Arbeitsspeicher (5/10 min, gespeichert wird der HMAC der Adresse), Honeypot bleibt. Konfigurationsprüfung steht jetzt VOR der Token-Prüfung. **Ehrliche Grenze:** Das IP-Fenster gilt pro Serverless-Instanz — ein belastbares Limit über alle Instanzen braucht einen geteilten Zähler (Upstash o. ä.). → *Owner-Punkt, siehe unten.*
- [x] **BF-3** 404- und Fehlerseiten, zweisprachig (`f444b5a`, `081c403`) → `not-found` je Sprachbaum, Catch-all-Routen, `error.tsx` je Baum, `global-error.tsx`, gemeinsamer Körper. Drei Wege zurück plus WhatsApp/E-Mail, weil die Lead-Route bei fehlendem ENV 503 liefert. Nebenbefund und mitbehoben: Beide Paket-CTAs waren nackte `<a>` und sprangen auf `/tr/…` in die deutsche Terminseite.
- [x] **R-1** Speed Insights als Verarbeiter (`1e0ae07`) → Gating nachgemessen (lädt ohne Einwilligung nicht). Was fehlte, war die Benennung: `Processor.services` führt Hosting & CDN, Web Analytics und Speed Insights einzeln auf, DE+TR.

### Stufe 2 — direkt nach dem Flip
- [x] **BF-8** Haltbare Reaktionszusage + Zustell-Selbsttest (`8ae9463`) → Die Zusage stand an vier Stellen in zwei Varianten („24 Stunden" / „nächster Werktag"). Jetzt überall **„innerhalb von zwei Werktagen" / „iki iş günü içinde"** (Owner-Entscheidung). Neu: `app/api/selftest` mit vier Prüfungen ohne Versand; Fehlschlag = HTTP 503. *Aktivierung ist Owner-Sache (siehe Live-Checkliste B3).* Unangetastet: „Rückruf am nächsten Werktag" im Betreuungspaket — das ist eine bezahlte Leistung, keine Marketing-Zusage.
- [x] **T-1 / SEO-1** OG-Bilder auf Unterseiten (`091c64b`) → siehe oben.
- [x] **BF-4** Minimal-CI (`2f09e87`) → `.github/workflows/ci.yml`: `tsc --noEmit`, `eslint`, `next build` mit Function-Gate, `scripts/smoke.mjs` mit 17 Prüfungen. Der Honeypot-Test fällt beweisbar, wenn der Schutz entfernt wird — gegengeprüft.
- [x] **BF-6** `aggregateRating` ohne Deckung (`bc5f5f2`) → Die Bedingung war korrekt; es fehlte die Festschreibung. `scripts/check-reviews.mjs` liest im `postbuild` das **gebaute HTML** und bricht ab, wenn ein `AggregateRating` ohne `Review` oder mit `reviewCount < 1` auftaucht. Gegenprobe: Vorgabewert 5,0/12 → Build bricht in 43 Dokumenten ab.

### Stufe 3 — macht die Seite wahr
- [x] **BF-9** Obere Preisöffnung (`054597e`) → „Größerer Umfang: auf Anfrage" unter dem Angebot, DE+TR, **ohne zweite Zahl** (Black Lock 5 bleibt). Zweiter Teil: Auf den Leistungs-Detailseiten standen Paketpreis und die Referenzen NV SWISS/maqam keine 300 Pixel nebeneinander. Der Preis steht jetzt an genau einer Stelle — im Angebot auf `/leistungen`, und diese Seite trägt keine Referenzen.
- [x] **V-1** Bestätigungsmail arbeiten lassen (`eb16992`) → drei Blöcke: was als Nächstes passiert (mit der Frist aus BF-8), was wir im Gespräch brauchen (Zugänge, Bestand, was hakt — mit „fehlt etwas: kein Problem" dahinter) und ein Beleg-Link auf meAI, auf `/tr` in die türkische Fassung. Kein Nachfass-Angebot, kein Rabatt.
- [ ] **C-1 / C-2 / S-1 — OWNER LIEFERT.** Nichts davon wurde erfunden. `/status` benennt jede Lücke einzeln.

### Stufe 4 — Feinschliff
- [x] **D-1** Automatisierter Bildersatz (`c19fdc8`, `6e5c1be`) → `npm run shots`, 56 Aufnahmen, 14 Seiten × hell/dunkel × mobil/Desktop, über den installierten Chrome, gegen den gebauten Server. Wache eingebaut: unsichtbar gebliebener Text lässt den Durchlauf fehlschlagen. Der Satz hat zwei Fehler gefunden, die keine Textprüfung gefunden hätte (doppelte Fußzeile auf der 404-Seite; „Bewegung reduzieren" ließ die halbe Seite verschwinden) und einen dritten in sich selbst (Chromium nimmt keine Textur über 16.384 px auf — das Bild war nicht abgeschnitten, sondern falsch zusammengesetzt).
- [x] **a11y (Nebenbefund, kein v0-Punkt)** `25cdaf2` → `useReducedMotion()` aus framer-motion 13.1.0 meldete `falsy`, obwohl `matchMedia` `true` sagte. Folge: `Reveal` rendert die bewegte Fassung, framer führt die Einblendung wegen derselben Systemvorliebe nicht aus, die Blöcke bleiben auf `opacity: 0`. Gemessen 7 unsichtbare Blöcke auf einer Leistungsseite, 33 auf `/leistungen`. Eigener Hook `lib/use-prefers-reduced-motion.ts`, sechs Stellen umgestellt.
- [x] **D-2** Beurteilung des ausgedünnten Zustands → eigener Abschnitt unten.
- [x] **BF-5** Owner-Sichtbarkeit für fehlendes Material (`7d1bdd2`) → `/status` leitet aus denselben Daten ab, was leer ist: 16 offene Punkte im jetzigen Stand, je mit dem, was solange nicht rendert, und wer liefern muss. Im Betrieb 404 ohne `?key=$SELFTEST_SECRET`; `robots.txt` sperrt `/status` und `/api/`.
- [x] **BF-7** CSP (`e451424`) → **Nonce bewusst nicht gebaut, mit Messung begründet:** 43 Inline-`<script>`-Blöcke auf `/leistungen`, davon 40 Streaming-Payloads von Next, die je Seite anders sind. Ein Nonce hieße: keine vorgerenderte Seite mehr, 53 statische Seiten werden 53 Funktionen — für einen Schutz gegen eingeschleustes Inline-JS, während es keine Stelle gibt, an der fremde Eingaben ins HTML gelangen. Stattdessen: `CSP_ENFORCE=1` stellt die vollständige Policy scharf. Mit Schalter gebaut und in Chrome geprüft: null Verstöße.
- [x] **T-2** Fehler-Alarm auf Lead- und CSP-Route (`7caffb7`) → `lib/alert.ts`, zwei Stufen (`[alarm]`-Zeile + optionaler Webhook), gedrosselt auf eine Meldung je Art und 15 Minuten. Gemeldet werden: Lead-Route nicht konfiguriert, Zustellung fehlgeschlagen, Eingangsbestätigung fehlgeschlagen, geblockter CSP-Verstoß (Browser-Erweiterungen gefiltert), fehlgeschlagener Selbsttest. Ende-zu-Ende gegen einen lokalen Webhook geprüft.
- [x] **S-2** Menüsprache geschärft (`10bc081`) → „Produkte" las sich wie ein Katalog. Jeder Hauptpunkt trägt jetzt einen beschreibenden Halbsatz (im Telefonmenü sichtbar, auf dem Desktop als `title`), `/produkte` heißt im Eyebrow **„Beweis, kein Katalog"** und sagt im ersten Satz „Diese Seite verkauft nichts davon". DE+TR.
- [ ] **V-2** Zusendung / Lead-Magnet — **wartet auf S-1.** Ein Anmeldefeld ohne Artikel verspricht Post, die es nicht gibt (dieselbe Regel wie bei GROW-4/Newsletter).

---

## D-2 — trägt die Startseite im ausgedünnten Zustand?

Beurteilt am Bildersatz vom 23.08.2026 (Startseite hell/dunkel, mobil und Desktop),
ohne Bewertungen, ohne Insights, ohne Kundenlogos.

**Ja, sie trägt — die Kette reißt nicht.** Hero → ein Satz, was creaDIG ist →
„Erst zeigen. Dann reden." → fünf Ebenen → Fundament (2017 · 4 Produkte · DE & CH)
→ vier eigene Produkte → Sitz im ICO → Unternehmen → *Nachweisbar* → Abschluss.
An keiner Stelle klafft ein Loch, an keiner steht ein „Demnächst". Die gated
Sektionen (Bewertungen, Insights, Logowand) rendern gar nicht — das ist der
Grund, warum die Seite trotz fehlenden Materials fertig aussieht.

**Was den Ausfall trotzdem trägt:** das Band *Nachweisbar* — BAFA-gelistet, iuk
Osnabrück, AVPQ präqualifiziert, Mitglied AGD. Vier Einträge, die man
nachschlagen kann. Für die Zielgruppe ist das näher an einer Referenz als jede
Bewertung, die man nicht prüfen kann.

**Drei Schwächen, alle mit Material lösbar — keine davon Code:**

1. **Das einzige Kundenwerk auf der Startseite hat kein Bild.** NV SWISS steht
   als Monogramm-Panel zwischen zwei bildstarken Produkt-Mockups. Ausgerechnet
   der Beleg „hat er das schon für jemanden gemacht?" ist das schwächste
   Element der Sektion. → C-2 plus ein Bild.
2. **Zwei von drei „ausgewählten Arbeiten" sind eigene Produkte.** Ehrlich
   ausgewiesen (Eyebrow „PRODUKT" gegen „KUNDENWERK"), aber der Beweis für
   Fremdarbeit steht auf einem Bein. Das löst sich erst mit dem dritten
   Kundenwerk — nicht mit Gestaltung.
3. **Drei von vier Produkten stehen auf „Im Aufbau".** Das ist ehrlich, steht
   aber in Spannung zu „Kein Konzept. Ein laufender Betrieb." zwei Bildschirme
   darüber. → Owner: Stimmen die Stände noch? Wenn ja, gehört der Satz präziser
   gefasst; wenn nein, gehören die Stände aktualisiert. Nichts davon darf
   geraten werden.

**Nicht gefunden:** keine leere Sektion, kein Platzhalter, keine erfundene Zahl,
keine Fake-UI. Die Mockups sind als „illustrative Mockups, keine Screenshots"
gekennzeichnet — die Zeile steht unter der Werkschau.

---

## MASTER-PROMPT 7 — Barrierefreiheit als Einstiegsleistung (23.08.2026)

Stufe 1 war vorher erledigt (Raster, Eigenbefund, Behebung, eigene Erklärung).
Stufen 2–4 in einem Durchgang, ein Commit je Teilschritt:

- [x] **BF-A5** Leistungsseite `barrierefreiheit-website` im Datenmodell — DE + TR,
      Sitemap, Einstiegs-Chip, eigener Canonical. Neu: `packageNote` (im Paket
      eingebaut / eigene Leistung für bestehende Seiten).
- [x] **BF-A6** „Was wir tun — und was nicht" als eigener Abschnitt. Die
      rechtliche Bewertung und die Freigabe der Erklärung liegen ausdrücklich
      beim Anwalt des Kunden; die Abgrenzung zum Overlay steht als Zusage da,
      nicht als Beiwerk. Im gebauten HTML beider Sprachen gegengeprüft.
- [x] **BF-A7** DE/TR-Parität als **Gate** (`scripts/check-parity.mjs`, läuft im
      `postbuild`): gleiche Abschnitte, gleiche Punkte, Textmenge 0,80–1,25.
      Gemessen 0,88–0,95. Gegenprobe gefahren.
- [x] **BF-A8** Kurz-Check mit einem zusätzlichen Pflichtfeld (Website-Adresse),
      derselbe Lead-Weg mit denselben drei Hürden. **Kein Scanner** — begründet
      im Code. Eigene Bestätigungsmail DE + TR. Rauchtest um vier Prüfungen
      erweitert.
- [x] **BF-A9** Erster Insight-Artikel überhaupt: „Wir haben unsere eigene Seite
      geprüft. Acht Mängel." Dazu das fehlende Gerüst — Detailseiten für
      Insights (DE + TR), vier Textbausteine, BlogPosting-Daten, Sitemap.
      `/insights` ist damit nicht mehr `noindex`.
- [x] **BF-A10** Preisleiter: genau ein Festpreis (Prüfung 1.500 €), Behebung
      2.000–4.000 € ausdrücklich als „Angebot nach der Prüfung", Betreuung
      149 €/Monat als laufende Position.
- [x] **BF-A11** Barrierefreiheit als benannte Zeile im Website-Paket und im
      Betreuungsumfang. Keine zweite Preiswelt.
- [x] **BF-A12** axe als CI-Schritt über 24 Routen (96 Durchläufe) — **plus eine
      eigene Regel**: Ein Formularfeld, dessen einziger Name der Platzhalter ist,
      gilt als Mangel. Gegengeprüft, dass axe genau diesen Fall NICHT meldet.

**Bewusst nicht getan** (steht so im Prompt): kein automatischer öffentlicher
Scanner, kein Overlay, keine Aussage über Bußgelder, Fristen oder Rechtsfolgen,
nichts zur Handelsvertretung auf dieser Website.

**Offen an `app/api/selftest/route.ts`:** unverändert. Der Selbsttest läuft in
einer Serverless-Route ohne Browser — eine axe-Prüfung ist dort technisch nicht
möglich. Sie gehört in die CI, und dort steht sie.

---

## OWNER LIEFERT (kein Code — macht die Seite „wahr")
- [ ] **SEC-1**: USt-IdNr **oder** § 19 · deutsche Rufnummer *(Rechtsform und § 18 MStV liegen vor)*
- [ ] **Copy-Freigabe Master-Prompt 7**: Leistungsseite, Kurz-Check, Bestätigungsmail
      und Insight-Artikel sind entworfen und gebaut, aber noch nicht gelesen
      (Liste in `creadig-LIVE-CHECKLISTE.md`, Abschnitt A6)
- [ ] **Kurz-Check-Kapazität**: Die Seite sagt „drei konkrete Punkte innerhalb von
      zwei Werktagen" zu. Das ist Handarbeit — die Zusage hält nur, solange die
      Menge dazu passt
- [ ] **C-1 · Produkt-Screens**: echte meAI-Oberflächen → `public/works/products/meai/`
- [ ] **C-2 · Referenzen**: NV SWISS und maqam — schriftliche Freigabe **und** je ein Satz Aufgabe/Ergebnis → `clientWorks[].approvalOnFile` / `.approvedSentence`
- [x] **S-1 · Insights**: erster Artikel steht (BF-A9, DE + TR). Ein zweiter fehlt,
      damit die Liste keine Ein-Zeilen-Liste ist — **V-2 ist nicht mehr blockiert**
- [ ] **Bewertungen**: 3–5 echte Google-Bewertungen → `reviews`
- [ ] **Vercel-AVV UND Resend-AVV** bestätigen/ablegen → `processors[].dpaConfirmed: true`
- [ ] **Türkische Projekttexte**: `work.what` und `work.sector` gibt es nur auf Deutsch
- [ ] **maqam**: Umfang, Jahr, Region, Link
- [ ] **Betrieb**: `SELFTEST_SECRET` setzen und einen Cron auf `/api/selftest` zeigen lassen (BF-8); optional `ALERT_WEBHOOK_URL` (T-2)
- [ ] **BF-2 offene Flanke**: geteiltes Rate-Limit über alle Instanzen (Upstash o. ä.), falls der Endpunkt wirklich unter Beschuss gerät. Heute deckt das Zeit-Token den Regelfall.
- [ ] **Produkt-Stände** prüfen (siehe D-2, Punkt 3)

---
*Quelle: Vollaudit (4 Lanes + Roter Agent), 2026-08-22 · v0-Review und Master-Prompt 6, 2026-08-23 · Master-Prompt 7 (Barrierefreiheit), 2026-08-23.*

