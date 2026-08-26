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
- [x] **Türkische Projekttexte** — erledigt (V2-1c, 25.08.2026). `what`, `sector`, `built` und `outcome` sind `Localized`; der Typ erzwingt beide Sprachen.

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
- [x] **Türkische Projekttexte** — erledigt (V2-1c, 25.08.2026)
- [ ] **maqam**: Umfang, Jahr, Region, Link
- [ ] **Betrieb**: `SELFTEST_SECRET` setzen und einen Cron auf `/api/selftest` zeigen lassen (BF-8); optional `ALERT_WEBHOOK_URL` (T-2)
- [ ] **BF-2 offene Flanke**: geteiltes Rate-Limit über alle Instanzen (Upstash o. ä.), falls der Endpunkt wirklich unter Beschuss gerät. Heute deckt das Zeit-Token den Regelfall.
- [ ] **Produkt-Stände** prüfen (siehe D-2, Punkt 3)

---

## MASTER-PROMPT 8 · V2 — Von der Behauptung zum Beweis (25.08.2026)

Grundlage: KIZILELMA §10 (externe Tiefen-Analyse, Gesamturteil 8,0/10 —
„Sehr gute Marken-Hülle, jetzt mit Unternehmens-Beweis füllen") plus die
Owner-Entscheidungen vom 23.08.2026. Stufen 1–6 in EINEM Durchgang, ein
Commit je Teilschritt, vor jedem Commit `npm run build` grün + Function-Gate
+ Sterne-Gate + Paritäts-Gate + a11y. Nichts auf `main`, nichts live.

**Die Leitfrage war nicht „was fehlt", sondern „was behaupten wir, ohne es zu
belegen".** Deshalb ist der größte Einzel-Commit dieser Runde eine Löschung.

### Stufe 1 — Positionierung & Sprache
- [x] **V2-1a** DACH statt „nur Deutschland". Sieben sichtbare Stellen trugen
      „Deutschland & Schweiz", zwei „für Handwerk und Mittelstand in
      Deutschland" — das erste seit der Owner-Entscheidung falsch, das zweite
      eine Grenze, wo eine Betonung gemeint war. DE + TR gleichzeitig.
      `areaServed` lag als `["DE","CH"]` an vier Stellen einzeln und ist jetzt
      eine Konstante neben `contact.markets`. **Nicht** geändert: Aussagen über
      bestehende Arbeit — in Österreich hat niemand unterschrieben, und
      nirgends steht, dass jemand es hätte.
- [x] **V2-1b** Kategorie-Satz „Kein klassisches IT-Systemhaus. Ein System-Haus
      für digitale Betriebe." im Kopf von /leistungen und /unternehmen — an
      genau zwei Stellen, sonst wäre er ein vierter Slogan. Nische sachlich
      benannt („Zwei Sprachen, ein Standard") ohne Herkunftsbild. Drei
      Marken-Sätze durchgesetzt: „Fünf Ebenen. Ein System." existierte in vier
      Fassungen nebeneinander, „Erfinden, bauen, betreiben." war eine fünfte
      Variante von „Verstehen. Bauen. Betreiben."
- [x] **V2-1c** Projekttexte zweisprachig. `Work.what`, `.sector`, `.built`,
      `.outcome` sind `Localized` — der Compiler verlangt beide Sprachen.
      Damit ist der letzte Punkt aus „OWNER LIEFERT" erledigt, der gar keine
      Owner-Sache war. Gegengeprüft im gebauten HTML: /tr/produkte und
      /tr/arbeiten enthalten kein deutsches Wort mehr.

### Stufe 2 — Leistungen tiefer
- [x] **V2-2** Je Ebene Ausgangslage → was wir bauen → was danach anders ist,
      dazu „Typische Projekte" in Such-/Kundensprache (CRM,
      Auftragsmanagement, Workflows, APIs, Dashboards, Individualsoftware …).
      Markensprache oben, Capability-Sprache darunter — nicht umgekehrt.
      Gerendert aus EINER Quelle auf /leistungen und auf allen sechs
      Leistungsseiten. Prozess um **„Umsetzung"** ergänzt: Der Ablauf sprang
      von „Angebot" direkt zu „Betrieb" und verschwieg damit seine längste
      Etappe.

### Stufe 3 — Betrieb produktisieren, Angebote ordnen
- [x] **V2-3a** **Managed Betrieb** als eigene, benannte Sektion mit sieben
      Bestandteilen (Hosting · Monitoring · Updates · Security · Backups ·
      Support · Weiterentwicklung). Er lag über drei Stellen verteilt und war
      als Fußnote unsichtbar — dabei trägt er den wiederkehrenden Umsatz. Der
      Retainer-Preis ist mitgezogen. Keine SLA-Zahl, kein „24/7": zugesagt ist
      der Rückruf am nächsten Werktag.
- [x] **V2-3b** Rubrik **„Einstiegsangebote"** mit zwei Einträgen
      (Website-Paket 2.400 € · Barrierefreiheits-Prüfung 1.500 €) und dem Satz,
      der sie einordnet: der Einstieg, nicht die Hauptarchitektur. Damit ist
      der Lock „EIN beworbenes Angebot" abgelöst (§10 vor §9.8) — **nicht**
      gelockert ist: eine Preisleiter je Angebot, kein Preis an zwei Stellen
      mit zwei Zahlen.

### Stufe 4 — Proof-Gefäße (Struktur jetzt, Inhalt Owner-gegatet)
- [x] **V2-4a** Case-Study-System mit **acht Kapiteln** statt drei Feldern:
      Ausgangslage → Problem → Ziel → unsere Rolle → System → Umsetzung →
      Ergebnis → Heute. Dazu Kennzahlen mit **Pflicht-Quelle** und eine
      Kundenstimme (Wortlaut wird nicht übersetzt). Gerüst für **NV SWISS** und
      **maqam** angelegt, `approved: false` — erscheint nirgends.
- [x] **V2-4b** Produkt-Detailseiten: problem · thesis · functions ·
      architecture · operations · learnings, alle Owner-gegatet und leer.
      **Status-Badge abgeleitet** aus `live` + öffentlicher Adresse, nicht
      gepflegt — ein drittes Feld neben `live` und `outcome` wäre die zweite
      Wahrheit.
- [x] **V2-4c** Zahlen-Band: drei Gefäße vorbereitet und leer (produktive
      Systeme, automatisierte Vorgänge, Jahre im Betrieb). Kundenstimmen um
      Firma, Rolle und Projekt erweitert — optional, weil eine echte
      Google-Bewertung oft nur einen Namen trägt.
- [x] **V2-4d** **Haus-Architektur-Diagramm** auf /unternehmen: Dach → fünf
      Ebenen → quer darunter der Betrieb → vier Produkte, jedes mit seiner
      Ebene. Keine Grafikdatei: Es liest `serviceLayers`, `productWorks` und
      `productWorlds` und kann deshalb von den Daten nicht abweichen. **Der
      einzige Beweis-Baustein dieser Runde, der heute schon vollständig ist.**

### Stufe 5 — Unternehmen & Trust-Wahrheit
- [x] **V2-5a** **Unbelegte Zertifikate und Mitgliedschaften entfernt** —
      BAFA (mit Berater-ID), iuk Osnabrück, AVPQ, AGD. Keiner der vier ist
      belegt (§9.9). Entfernt aus Daten, Sektion, Nachweis-Zeile der
      Startseite, Kopf- und Fußzeile, Wörterbuch, Meta-Beschreibung **und aus
      `hasCredential` in den strukturierten Daten**. Gegengeprüft: kein
      gebautes HTML-Dokument enthält noch einen der Begriffe.
      *Ein unbelegter Nachweis ist schlimmer als kein Nachweis.*
- [x] **V2-5b** Arbeitsmodell **„So arbeiten wir"**: geführt vom Gründer · ein
      kleines Kernteam · Spezialisten nach Bedarf. Founder als „Gründer &
      System Lead"; die Verantwortungsfelder lesen `serviceLayers` statt einer
      eigenen Fähigkeiten-Liste. Am Ende steht, was wir NICHT nennen und
      warum. **Foto-Slots** unter `public/images/unternehmen/` (buero · ico ·
      arbeitsplatz · whiteboard) mit eigenem Bauzeit-Skript, Beschriftungen
      und Alt-Texten in beiden Sprachen sowie einem README im Verzeichnis.

### Stufe 6 — Feinschliff & Abnahme
- [x] **V2-6a** Auswahl-Zustand im Terminassistenten: 7 % Gold-Tönung waren bei
      Tageslicht kaum sichtbar — jetzt Tönung, durchgehende Gold-Kante und
      Ring. Dazu ein Kontrast-Fehler, den axe in 96 Durchläufen **nicht**
      gemeldet hat: die Uhrzeit auf der gewählten goldenen Fläche lag bei
      `opacity-75` auf 3,81 : 1 (nachgerechnet mit den echten Tokens), jetzt
      4,98 : 1 hell und 6,24 : 1 dunkel. Zwei neue Bildersätze halten beide
      Zustände fest — ein Zustand, den kein Screenshot aufnimmt, fällt bei
      keiner Sichtprüfung auf.
- [x] **V2-6b** Endabnahme, Checkliste und dieses Backlog aktualisiert.

**Bewusst nicht getan** (steht so im Prompt): kein Redesign, keine erfundenen
Zahlen, keine erfundenen Referenzen oder Zertifikate, keine Deko-Trends, kein
Push nach `main`, kein Livegang.

**Nicht in dieser Runde gebaut, obwohl §10 es nennt:** §10.8 (Insights als
Thought-Leadership) — der erste Artikel steht seit BF-A9, weitere sind
Owner-Inhalt und keine Struktur. Die Gefäße dafür existieren.

---

## MASTER-PROMPT 10 · V3 — Inhalt, Platzierung, Tiefe & Abschluss (26.08.2026)

Grundprinzip dieser Runde: **nicht mehr behaupten, sondern platzieren und
messen.** Nichts Neues erfunden — das Vorhandene dorthin gebracht, wo die
Kauf-Fragen gestellt werden, und nachgeprüft, ob es hält.

### Stufe 1 — Leistungen-Tiefe
- [x] **MP10-1** Die vier Kauf-Fragen je Leistungsseite: Was kostet es, wie
      lange dauert es, was muss ich beitragen, was bekomme ich. Alle vier als
      **optionale Felder** (`duration`, `fromTo`, `clientEffort`, `process`) —
      fehlt eine Angabe, rendert der Abschnitt nicht und die Lücke steht auf
      `/status`. Eine geschätzte Projektdauer wäre erfunden.

### Stufe 2 — Platzierung nach Käufer-Fragen
- [x] **MP10-2.1** Eine Zahl auf die Startseite (`home.entry`), ein Satz, kein
      Paketblock.
- [x] **MP10-2.2/2.7/2.8/2.10** Eine Aufzählung statt vier gegen fünf Ebenen ·
      Fragen vor Preisen auf `/leistungen` · FAQ „Wem gehört das System?" ·
      `/status` dezent in die Fußzeile.
- [x] **MP10-2.3** Projektdauer neben jeden Preis — leer heißt gegatet.
- [x] **MP10-2.4/2.5** Verweis am Ende der Werkschau · Sitz-Erwähnungen von
      sechs auf zwei · ortsabhängiger Abschluss.
- [x] **MP10-2.6** `/termin` ist der Abschluss, `/kontakt` der direkte Weg.
      Kein zweites volles Formular. Dabei fiel auf: Der erklärende Halbsatz
      stand danach **zweimal wörtlich** auf `/kontakt` — einmal im Kopf, einmal
      in der E-Mail-Kachel. Der Kopf ist der schnelle Griff, die Kachel behält
      die Erklärung.
- [x] **MP10-2.9** Logo-Wand: Der Auftrag lautete „entfernen, solange nur
      unfreigegebene Fremdmarken". Sie ist nicht ausgebaut, sondern **an die
      Daten gehängt** — `CLIENT_LOGOS` ist leer, also rendert die Sektion
      nicht. Das Ergebnis ist dasselbe, der Unterschied zählt trotzdem: Kommt
      eine echte Freigabe, genügt eine Datei im Verzeichnis. Ausgebaut müsste
      man sie neu schreiben.

### Stufe 3 — Betriebsreife
- [x] **Nachgeprüft:** `aggregateRating` gelangt bei 0 Bewertungen nicht ins
      JSON-LD — das Sterne-Gate bestätigt es bei jedem Build (53 Dokumente,
      keins mit Sternen).
- [x] **Nachgeprüft:** BF-9 „größerer Umfang: auf Anfrage" steht sichtbar über
      der Preisleiter, ohne Zahl.
- [x] **BF-7** bleibt bei der gemessenen Entscheidung: **kein Nonce.** Im
      gebauten HTML stehen 43 Inline-Skripte, 40 davon gehören dem Framework
      (`self.__next_f.push`) und sind je Seite anders, also nicht hashbar. Ein
      Nonce müsste je Anfrage neu sein — damit würden 53 statische Seiten zu 53
      Funktionen, ohne CDN-Zwischenspeicher. Der Gegenwert wäre Schutz gegen
      eingeschleustes Inline-JavaScript; eine Stelle, an der fremde Eingaben
      ins HTML gelangen, gibt es hier nicht.
- [x] **BF-8** Reaktionszusage an **einer** Stelle: „innerhalb von zwei
      Werktagen". Vorher standen „nächster Werktag" und „24 Stunden"
      nebeneinander — beides für ein founder-led Haus an einem Freitagabend
      nicht haltbar. Die Bestätigung ist Owner-Sache und steht auf `/status`.

### Stufe 4 — Fehlende Seiten
- [x] **MP10-4** `/betrieb` — Managed Betrieb als eigene Seite statt als Block.
- [x] **MP10-4** `/systeme` — „Integration first". Beschreibt das WIE; die
      Liste der wirklich angebundenen Systeme ist leer und rendert nicht.
- [x] **MP10-4** Insights-Kategorien (sechs Fächer). Leere Fächer erscheinen
      **nicht** — kein „Demnächst".

### Stufe 5 — SEO, Mobile, Performance
- [x] **MP10-5** SEO-Landing-Architektur vorbereitet, Inhalt Owner-gegatet.
      Ohne die Owner-Liste (Städte/Leistungen) existiert keine einzige Adresse
      — ein ausgetauschter Stadtname in derselben Vorlage wäre Keyword-Müll.
- [x] **MP10-5** `npm run vitals` — Labormessung LCP/CLS/TTFB/Dokumentgröße.
      **Der erste Lauf war wertlos und meldete trotzdem Erfolg:** LCP und
      Layout-Verschiebungen mit `getEntriesByType` abgefragt (Chrome liefert
      beide nur an einen `PerformanceObserver`), Dokumentgröße aus einem leeren
      `content-length`, und die Voreinwilligung schrieb `creadig-consent` statt
      `creadig_consent` — gemessen wurde das Einwilligungs-Banner. Repariert,
      und „kein Wert" zählt jetzt als Fehlschlag statt als Erfolg.
- [x] **MP10-5** `npm run mobile` — 6 Breiten × 16 Seiten. **Auch hier zwei
      Anläufe:** 919 gemeldete Bedienflächen und 607 Überläufe waren fast alle
      falsch (unsichtbare Sprungmarke, Textlinks mit Luft ringsum, gekappte
      SVG-Gruppen). Die Abstands-Ausnahme aus WCAG 2.5.8 fehlte, und die Frage
      war falsch gestellt — nicht „ragt etwas hinaus", sondern „lässt sich die
      Seite schieben".
- [x] **MP10-5** Der eine echte Befund: Monatspfeile im Terminassistenten
      **20 × 20 px**. Das axe-Gate meldet das nicht — es fährt WCAG 2.1, die
      24-px-Regel steht in 2.2. Behoben mit `-m-3 p-3`: Fläche 44 px, Layout
      unverändert.
- [x] **Nachgeprüft:** Bilder laufen über `next/image` mit AVIF vor WebP, jedes
      `<Image>` trägt `sizes`, verzögertes Laden ist Vorgabe. Schriften kommen
      über `next/font` mit `latin` + `latin-ext` — die türkischen Zeichen
      hängen an `latin-ext`.

### Stufe 6 — Abschluss
- [x] **MP10-6** `/status` trägt jetzt auch Domain, Reaktionszusage und die
      beiden offenen Entscheidungen aus §11. Eine offene Entscheidung blockiert
      Arbeit genauso zuverlässig wie ein fehlendes Bild — nur fällt sie
      niemandem auf, weil sie nirgends als Lücke sichtbar wird.
- [x] **MP10-6** Live-Checkliste (A9 + Nachtrag) und dieses Backlog
      aktualisiert; der Abschluss-Prompt von Master-Prompt 9 ist gelöscht.

**Bewusst nicht getan:** Design-Identität „Der Schnitt" (separater Durchlauf),
keine erfundenen Zahlen, Referenzen oder Zertifikate, kein Push nach `main`,
kein Livegang.

**Offen und nur vom Owner zu schließen:** 40 Posten auf `/status` — darunter
Impressum, AVV, Umgebungsvariablen, Domain, die SEO-Ziele, die echten
Projektdauern, die Fallinhalte für NV SWISS und maqam, und die beiden
Entscheidungen (50k-Kunde, TR-Nische).

---

*Quelle: Vollaudit (4 Lanes + Roter Agent), 2026-08-22 · v0-Review und Master-Prompt 6, 2026-08-23 · Master-Prompt 7 (Barrierefreiheit), 2026-08-23 · KIZILELMA §10 / Master-Prompt 8 V2, 2026-08-25 · KIZILELMA §11 / Master-Prompt 10 V3, 2026-08-26.*
