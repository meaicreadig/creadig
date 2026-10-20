# creaDIG · 360° PRODUCT / WEBSITE / ADMIN AUDIT — FINAL (READ-ONLY)

> An v0: Du erhältst als ZIP den aktuellen vollständigen Stand von creaDIG (öffentliche Website + Admin/Owner OS).
> Dies ist ein **READ-ONLY DEEP AUDIT**. Keine Code-Änderung. Ergebnis = eine einzige belastbare Diagnose, aus der der Owner **einen** großen finalen Build beauftragen kann — nicht 30 Reparaturrunden.
> **Berichtssprache: Deutsch.** Jeder wichtige Befund trägt einen **Beleg-Ort** (Datei/Route) und ein Label: `OBSERVED · MEASURED · INFERRED · OWNER-TRUTH-REQUIRED · EXTERNAL-BLOCKED`.

---

## 0 · GROUND TRUTH & NON-NEGOTIABLES (zuerst lesen — aber NICHT als „erledigt" glauben)

Dieser Block ist **kein Produktbeschrieb, dem du zustimmst**. Er dient nur dazu, dass (a) deine **Empfehlungen** keine bereits gesperrten Entscheidungen verletzen, (b) du nichts **erneut vorschlägst, was schon verworfen wurde**, (c) du **OWNER-TRUTH-Lücken** richtig markierst. **Diagnostiziere das Produkt trotzdem mit frischen Augen (§1).** Nichts hier gilt als bewiesen — prüfe es gegen das echte Produkt.

**Firma & Positionierung (Ist-Stand, gesperrt):**
- „System-Haus für digitale Betriebe" (kein klassisches IT-Systemhaus). Fünf Ebenen: Identity → Digital → Operations → Automation → Intelligence · meAI.
- Gegr. 2017, Sitz ICO Osnabrück, **founder-led** (Muhammed Emin Akyol) + kleines Kernteam + DACH-Netzwerk. Mitarbeiter-/Umsatzzahl bewusst nicht genannt = OWNER-TRUTH-REQUIRED, nicht „erfinden".
- **Markt-Priorität: 1. Deutschland, 2. Schweiz, 3. Europa.** Sprache **Deutsch primär**, **TR-Nische** = türkischsprachige Betriebe im DACH-Raum (deutscher Standard). **Nicht** international-Enterprise-first optimieren.

**Wahrheits-Disziplin (BLACK LOCK — Kern der Marke, Empfehlungen dürfen sie nie brechen):**
- Keine erfundenen Zahlen, Referenzen, Reviews, Zertifikate. Fehlt Material → Sektion/Feld rendert **null** (bewusst leer, nicht Platzhalter). „zeigen statt behaupten."
- **0 freigegebene Kunden-Cases** heute → `/arbeiten` ist **absichtlich leer** (keine schriftliche Freigabe). Echte Referenzen existieren (NV SWISS, maqam), sind aber **nicht freigegeben**. → Empfehlung ist der **Freigabe-/Release-Weg**, NICHT „Cases erfinden/annehmen".

**Tech-Wahrheit (nicht raten):**
- Next.js 15 App Router (SSG/Server Components), TypeScript, Tailwind v4, **Neon (Postgres) + Drizzle/`pg`** — **NICHT Supabase**. Vercel Hosting. Resend = nur **ausgehende** Mail.
- Admin-Auth = `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` (Cookie `cd_admin`, signiert, 8 h). Rollen: `owner` (alles), `vertrieb`, `redaktion`. Middleware erzwingt, `lib/rollen.ts` ist die Quelle.
- Produkte: **meAI** (live unter meai.run, geschlossenes System, DE&CH), **fibero** (im Tagesbetrieb, DE), **CASSAMEA** (im Aufbau, CH), **meahv** (im Aufbau, DE). Produktbilder = **echte Oberfläche mit Demodaten**, keine Mockups.
- `LEAD_STORE` ist **in Produktion gesetzt** (Website-Formular → `leads`), lokal ggf. nicht → CRM/Register wirken leer, weil **noch keine echten Anfragen/Kunden** existieren, nicht weil die Anzeige defekt ist. Prüfe, ob die Leere ehrlich kommuniziert wird.

**Corporate-Design — gesperrte Entscheidungen (nicht neu erfinden):**
- Geometrie **rund**; Display-Schrift **M PLUS Rounded 1c** (fett); Palette **Papierweiß `#fbfbf9` · warmes Anthrazit `#1b1916` · Gold `#be904e` / lesbar `#87632f`**.
- Bewegungsregel: **max. 1 Bewegung pro Sektion**, „~85 % Ruhe / ~15 % präzise, bedeutungstragende Bewegung".
- **Dekoratives Motiv (Dreieck/Node-Muster) wurde dreimal verworfen** → **NICHT** als CI-Deko wiedervorschlagen. Gewünscht ist eine **semantische System-Visualisierung** (getrennte Linien → verbundene Linien = Chaos→Struktur), die etwas BEWEIST (Prozess/Datenfluss/Übergabe/Ebene) — siehe §9.
- **Higgsfield/AI nur** als klar abstrakte Metapher/Atmosphäre — **nie** als Fake-Beleg (Screens, Menschen, Kunden, Büro, Cases) — siehe §12/§13.

**OWNER-TRUTH-REQUIRED (kann v0 nicht aus dem ZIP verifizieren — als solche markieren):**
Impressum-Pflichtangaben/Steuerstatus · echte Impact-Zahlen · Team-/Kapazitäts-/Vertretungsangaben · Reaktionszeit-Zusage (heute „zwei Werktage") · Vercel-/Resend-AVV.

**Nicht anfassen / respektieren:** die Admin-OS-Canon (`docs/admin-os/`), die G18-Datei-Sperre (`components/legal/legal-page.tsx`, `components/sections/packages.tsx`, `lib/material-status.ts`, `lib/rechnung.ts`, `lib/site-data.ts`, `scripts/rechnung-drill.mjs`), die Wahrheits-Disziplin.

**Ziel des Audits:** EIN großer finaler Build danach — keine Feature-Spirale.

---

## 1 · ARBEITSWEISE

Arbeite vom realen Produkt aus. Nicht zuerst die internen Master-Prompts lesen und daraus urteilen.

Reihenfolge:
1. Repository / ZIP inventarisieren.
2. Projekt lokal zum Laufen bringen (siehe §1b — vieles ist ggf. EXTERNAL-BLOCKED).
3. Öffentliche Seite tatsächlich benutzen.
4. Admin tatsächlich benutzen (soweit möglich; sonst aus Code + mitgelieferten Screenshots).
5. Mobile und Desktop prüfen.
6. Erst danach vorhandene Dokumentation / Canon / Audits lesen (inkl. §0 gegenprüfen).
7. Dokumentation gegen das tatsächliche Produkt prüfen.

Berichte niemals etwas nur deshalb als erledigt, weil es in einer Markdown-Datei steht.

`BUILD ≠ LIVE · CODE EXISTS ≠ USABLE · BUTTON EXISTS ≠ WORKFLOW WORKS · CONFIGURED ≠ VERIFIED · TEXT EXISTS ≠ UNDERSTANDABLE · PRETTY ≠ CONVINCING`

Jeden wichtigen Befund kennzeichnen als: `OBSERVED · MEASURED · INFERRED · OWNER-TRUTH-REQUIRED · EXTERNAL-BLOCKED` — **und mit Beleg-Ort (Datei/Route)**. Keine Annahmen als Fakten formulieren.

### 1b · RUN & ACCESS REALITY (wichtig — ehrlich handhaben)
- **Secrets liegen NICHT im ZIP.** Erwarte keine echte `.env`. Ohne `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` antwortet alles unter `/admin` mit **404**; ohne Neon-`DATABASE_URL` liefern datengetriebene Seiten Fehler-/Leerzustände.
- **Folge:** Du kannst den **Admin in einer Sandbox sehr wahrscheinlich weder live starten noch dich einloggen.** Dann: Admin **aus dem Code + den mitgelieferten Admin-Screenshots** (Owner-real, echte Daten) analysieren, betroffene Live-Punkte als **EXTERNAL-BLOCKED** markieren, und **niemals behaupten**, einen Workflow ausgeführt zu haben, den du nicht ausführen konntest.
- Öffentliche Seite: lokal starten, wenn `npm install` + Build gelingen; sonst aus Code + mitgelieferten öffentlichen Screenshots.
- Tests/Messungen (Lighthouse, LCP/CLS/INP): wenn nicht ausführbar → `EXTERNAL-BLOCKED` + Einschätzung aus dem Code (Bundle, Bilder, Video), keine erfundenen Zahlen.
- **Nur isolierte Testdaten.** Keine echten Kundendaten verändern. Keine Mutation/kein Deploy/keine Veröffentlichung.

---

## 2 · KEINE ÄNDERUNGEN
In dieser Runde: KEIN Refactor · KEIN Redesign · KEINE Migration · KEIN Deploy · KEINE Production-Mutation · KEINE Datenänderung · KEINE Veröffentlichung · KEINE neue Integration. Nur analysieren, messen, dokumentieren. Wenn Tests sichere lokale Daten benötigen: isolierte Testdaten. Keine echten Kundendaten verändern.

## 3 · DIE ZENTRALE FRAGE DER ÖFFENTLICHEN WEBSITE
Prüfe die Website aus Sicht eines echten potentiellen Kunden, nicht des Entwicklers. Ein Besucher soll in Sekunden beantworten können: Was ist creaDIG? Was macht es für meinen Betrieb? Welches Problem löst es? Warum anders als Agentur / IT-Dienstleister / einzelne SaaS-Tools? Warum sollte ich es glauben? Was kann ich konkret kaufen? Was kostet es? Was passiert als Nächstes? Warum jetzt Kontakt?
Bewerte besonders den Unterschied: „Ich verstehe, was sie sagen." vs. „Ich erkenne mein eigenes Problem und will mit ihnen sprechen." — das ist die wichtigste kommerzielle Frage.

## 4 · POSITIONIERUNG
Analysiere die komplette Message-Hierarchie: „System-Haus für digitale Betriebe" · „Wir bauen das System hinter Ihrem Betrieb." · „Wir bauen, was andere nicht sehen." · Five Levels (Identity → Digital → Operations → Automation → Intelligence).
Prüfe: verständlich? merkbar? kaufbar? zu abstrakt? Erkennt sich ein kleiner/mittlerer Unternehmer darin? Ist die H1 stärker als die Erklärung darunter? Zu viel über creaDIG, zu wenig über das Kundenproblem? Widersprüchliche Zielgruppen? Ist Handwerk zu dominant oder sinnvoll? Ist DACH/international glaubwürdig? Ist die Breite Stärke oder diffus? Keine neue Positionierung erfinden, bevor die aktuelle vollständig verstanden ist.

## 5 · KOMMERZIELLE KLARHEIT / PREISE
Prüfe jede Stelle mit Preisen/Paketen/Leistungen/laufenden Gebühren. Erstelle EINE Tabelle: Angebot · Preis · einmalig/monatlich · enthalten · NICHT enthalten · optionale Erweiterung · für wen · nächster Schritt · Widersprüche auf anderen Seiten.
Prüfe u. a.: Website-Pilot · reguläres Website-Paket · Website Care · Operations · Barrierefreiheit/Audit · KI/Automation · Corporate Design · individuelle Systeme · laufender Betrieb.
Fragen: Versteht der Kunde, was er für den Preis bekommt? Kann er versehentlich glauben, Automation/KI sei im Websitepreis enthalten? Ist Website Care klar von echtem Systembetrieb getrennt? Ist „nach Analyse" verständlich oder wirkt es wie Preisverstecken? Widersprüchliche Preise/MwSt.-Aussagen? Sind Festpreis, Discovery und Angebot logisch erklärt? Klar, wann das kostenlose Gespräch endet und ein bezahltes Projekt beginnt? Wirken die Preise billig/teuer/plausibel zur Positionierung? — begründen, nicht nur Bauchgefühl.
**Cross-Check:** gerenderter Preis vs. Quelle (`lib/site-data.ts`, `lib/dictionary.ts` — G18-gesperrt, nur lesen). Keine Steuer-/Rechtsberatung erfinden; unbelegte Firmen-/Steuerwahrheit = OWNER-TRUTH-REQUIRED.

## 6 · INHALTLICHE QUALITÄT
Prüfe JEDE zentrale öffentliche Seite (nicht nur Rechtschreibung): Informationswert · Verständlichkeit · Kürze · Wiederholungen · Abstraktionsgrad · Kaufrelevanz · Glaubwürdigkeit · CTA · Beweis · Informationshierarchie.
Besonders: Startseite · Leistungen · Pakete · Systeme · Betrieb · Produkte · meAI · fibero · CASSAMEA · meahv · Arbeiten · Unternehmen · Betriebscheck · Aufwandsrechner · Kontakt · Termin · Handwerk/Branchen · Insights · Impressum · Datenschutz.
Finde: lange Textblöcke · mehrfach erklärte Aussagen · interne Audit-/Disclaimer-Sprache · unnötige Fachbegriffe · generische Agentursprache · starke originale creaDIG-Sprache. Sag ausdrücklich: KEEP · SHORTEN · MOVE TO DETAIL · REWRITE · REMOVE.

## 7 · DE / TR / EN / AR
Nicht nur ob Keys existieren — redaktionell prüfen (DE, TR, EN, AR/RTL), insbesondere DE/TR detailliert. Suche: wörtliche Übersetzungen · deutsche Reste · falsche Preisformulierungen · unterschiedliche Bedeutungen · unterschiedliche Textlänge · teilweise untranslated Navigation · unnatürliches Türkisch · RTL-Probleme. Keine automatische „i18n fertig"-Behauptung nur wegen vollständiger Keys. (Admin-i18n: DE/TR über Wörterbücher/Maschinenwerte — prüfe auch server-erzeugte Texte, nicht nur JSX.)

## 8 · DESIGN / OPTIK
Bewerte die Seite visuell als echtes Produkt. Owner-Eindruck (prüfen, nicht bestätigen): sauber/warm/professionell, aber zu flach/zu ruhig/zu textlastig/zu wenig visuelle Argumentation. Messen und ansehen.
Analysiere: Hero · Typografie · Rhythmus · Whitespace · Sektionen · Kontrast · Karten · Buttons · Navigation · Footer · Farben · Bildwelt · Motion · Produktdarstellung · Proof-Darstellung · Diagramme · Mobile. Frage bei jeder großen Sektion: **Was soll diese Sektion BEWEISEN?** Wenn sie nur eine weitere Erklärung ist — sagen.

## 9 · VISUAL ARGUMENT
Möglicher Markenansatz: fragmentierte/getrennte Linien → verbinden sich → werden zu einem geordneten System (chaotische Werkzeuge/Übergaben → ein zusammenhängender Betriebsfluss). Prüfe, ob die Seite dieses Prinzip schon gut nutzt. Ja → nicht neu bauen. Teilweise → sagen, was fehlt. Nein → bewerten, wo es sinnvoll wäre. Die Linie darf **nie bloße Dekoration** sein — sie muss etwas darstellen: Prozess · Datenfluss · Verantwortung · Übergabe · Systemebene · Verbindung. Mögliche Stellen: Woran es liegt · Five Levels · Verstehen→Bauen→Betreiben · Kundenfall vorher/nachher · Automation · Owner Intelligence. Aber NICHT automatisch überall Diagramme.

## 10 · DIAGRAMM-AUDIT
Für jede wichtige Sektion: Ist Text die beste Form? Oder besser: Prozessdiagramm · Before/After · Systemarchitektur · Flow · Layer-Diagramm · Timeline · Datenansicht · echter Screenshot · Foto · Video · Animation. Später eine Matrix: Seite/Sektion · aktuelle Form · Problem · beste Darstellungsform · warum · Priorität. Kein schönes Diagramm ohne Informationsfunktion.

## 11 · FOTOS
Prüfe, wo reale Fotografie Vertrauen verbessert: Founder · Arbeitssituation · echte Produkte · echte Hardware · Projektumgebung · reale Arbeitsprozesse. Aber: keine Stock-Handshakes, keine Fake-Kunden/-Mitarbeiter/-Büros. Sag konkret je Stelle: echtes Foto fehlt / Foto unnötig / Screenshot besser / abstrakte Grafik besser.

## 12 · HIGGSFIELD / AI VISUALS
Kritisch, nicht begeistert. Bei jeder möglichen Stelle: Bringt das wirklich mehr Wirkung, oder nur mehr Spektakel? AI-Medien NUR zulässig als: klar abstrakte Metapher · Atmosphäre · Licht · Textur · abstrakter Daten-/Linienfluss · cinematischer Markenmoment. NICHT zulässig: Fake Dashboard/Kunde/Büro/Team/Founder/Projekt/Produkt/Baustelle/Case Study/Zertifikat/Erfolg. Grundregel: Kann ein normaler Besucher glauben, das AI-Bild dokumentiere etwas Reales? Wenn JA → nicht verwenden.

## 13 · HIGGSFIELD-EMPFEHLUNG
Am Ende konkrete Entscheidung: `HIGGSFIELD NOT NEEDED` **oder** `HIGGSFIELD USEFUL IN X LOCATIONS`. Falls sinnvoll: **max. 1–2 Video-Momente auf der Startseite**. Je Asset: Ort · Zweck · Botschaft · Format · Dauer · Desktop/Mobile · Poster · Reduced Motion · LCP-Risiko · warum Video statt SVG/CSS · warum es nicht als Fake-Proof verstanden wird. Wenn SVG/CSS besser ist: klar sagen. (Hinweis: die **präzise** Linien-/Ebenen-Visualisierung gehört eher in Code/SVG — Kontrolle, Schärfe, Token-Treue, a11y; Higgsfield eher für die atmosphärische Schicht.)

## 14 · REAL PRODUCT PROOF
Untersuche vorhandene echte Oberflächen: Admin · meAI · fibero · CASSAMEA · andere eigene Systeme. Welche realen Screens könnten öffentlich Kompetenz zeigen? Dabei PII/Secrets/Kundendaten entfernen, Demo klar von Kundenbeleg unterscheiden. Kein Fake-Screenshot bauen. Wenn ein echtes Produkt visuell stärker ist als ein AI-Video → echtes Produkt priorisieren. (Neon-DB/Produktion nur lesen; keine echten Daten in Screenshots.)

## 15 · /ARBEITEN / PROOF
Wie wirkt `/arbeiten` heute (0 freigegebene Fälle — siehe §0)? Was passiert bei 0 / 1 / mehreren Fällen? Ist klar, warum ggf. nichts gezeigt wird — ehrlich oder leer? Kann ein echter freigegebener Case stark präsentiert werden? Bewerte die Case-Struktur: Ausgangslage · Problem · Systemänderung · Lieferung · aktueller Zustand · Evidence · Metric · Screenshot · Zitat. Nur tatsächliche Belege. (Empfehlung = **Release-Weg** über den Admin-Beleg, nicht „Case erfinden".)

## 16 · CONVERSION / FUNNEL
Gehe als Kunde durch: Home → Leistung → Produkt/System → Proof → Betriebscheck/Rechner → Kontakt/Termin. Prüfe: Wo verliere ich Orientierung/Interesse? Wo fehlen Beweise/klare nächste Schritte? Wo wird zu früh verkauft / zu viel erklärt? Wo konkurrieren CTAs? Prüfe beide Käufer: A kleiner inhabergeführter Betrieb · B Mittelstand. Enterprise nicht künstlich optimieren, wenn das Produkt dort aktuell nicht kaufbereit ist.

## 17 · BENUTZERFREUNDLICHKEIT WEBSITE
Teste: Navigation · Zurück · Sprachwechsel · Formulare · Validierungen · Betriebscheck · Rechner · Termin · Kontakt · mobile Navigation · CTA · Fehlerzustände · Ladezustände · Keyboard · Touch. Ziel: Der Nutzer braucht keine Erklärung, wie die Website funktioniert.

## 18 · ADMIN / OWNER OS
Admin als echtes Arbeitswerkzeug prüfen (nicht nach Funktionsanzahl). Zentralfrage: Kann der Owner seinen Betrieb damit führen, ohne Entwicklerwissen? Der Admin muss in ~10 Sekunden beantworten: Was muss ich heute tun? Was ist überfällig? Wer wartet auf mich? Welche Entscheidung blockiert Umsatz/Vertrauen? Was hat das System bereits erledigt? (Beachte §1b: ggf. nur aus Code + Screenshots.)

## 19 · ADMIN WORKFLOWS
Soweit sicher möglich durch die UX gehen (nicht nur ansehen): Login · Übersicht · Anfragen · Anfrage neu · Anfrage Detail · Organisation · Kontakt · Beziehung · next touch · Opportunity · Pipeline · Stage change · next action · Offer · Proof/Freigabe · Veröffentlichungen · Verbindungen · Automationen · meAI suggestion · System. Was nicht ausführbar ist → EXTERNAL-BLOCKED, ehrlich benennen.

## 20 · ADMIN UX
Sind Hauptaktionen offensichtlich? Zu viele Texte/Statusbegriffe/Tabs/technische Sprache/Dokumentation in der Oberfläche/Owner-Entscheidungen? Finden Nutzer Funktionen, wo sie sie erwarten? Sind Empty States handlungsorientiert? Ist Mobile wirklich nutzbar? Tabellen auf schmalen Screens sinnvoll? Filter zu dominant? Save-Aktionen verständlich? Feedback nach Save klar? Markiere: friction · confusion · dead end · unnecessary click · technical leakage · duplicate information.

## 21 · ADMIN INFORMATION ARCHITECTURE
Nicht automatisch redesignen. Prüfen, ob die heutige Struktur logisch ist. Grobes Zielbild: Heute/Übersicht · CRM & Vertrieb · Kunden & Kontakte · Proof/Freigaben · Veröffentlichungen · Automationen · Verbindungen · System/Einstellungen. Änderung nur empfehlen, wenn die tatsächliche Nutzung echten Grund liefert. Keine neue Admin-Version erfinden.

## 22 · MARKETING IM ADMIN
Was kann der Admin heute wirklich? Unterscheide: LINK · CONFIGURED · AUTHORIZED · VERIFIED · OPERATIONAL · FAILED. Prüfe Veröffentlichungs-/Verbindungsregister. Keine Empfehlung für LinkedIn/Meta-API, Newsletter, Campaign Suite, Lead Scoring ohne realen wiederkehrenden Bedarf.

## 23 · SALES
Prüfe: Anfrage → Kontakt/Organisation → Beziehung → Opportunity → next action → Angebot → Entscheidung. Verständlich? Kann ein Inhaber den Flow ohne Sales-Ops-Wissen bedienen? Prüfe: Timing · Entscheider · Follow-up · Lost reason · next action · due date. Keine BANT-Bürokratie erfinden.

## 24 · TRUST
Analysiere alle Vertrauenssignale: Impressum · Telefon · Vertragspartner · Preisangaben · Proof · Owner · Produkte · echte Interfaces · Ownership-Versprechen · Betrieb danach · Datenschutz · AVV-Hinweise · Kapazitätsaussagen. Suche aktiv nach Widersprüchen. OWNER-TRUTH niemals erfinden (Impressum/Steuer/AVV/Kapazität = OWNER-TRUTH-REQUIRED).

## 25 · TECHNISCHE UX
Ohne vollständigen Security-Pentest prüfen: Ladezeiten · LCP · CLS · INP · Bundle · Bilder · Video · Mobile · JS-Kosten · 404 · 500 · Form-Fehler · Offline/DB-unavailable-States · Caching. Wenn nicht messbar → EXTERNAL-BLOCKED + Code-Einschätzung. Keine visuelle Verbesserung empfehlen, die Performance sichtbar zerstört.

## 26 · ACCESSIBILITY
Prüfe: Keyboard · Focus · Kontrast · Labels · Headings · Dialoge · Formulare · Motion · prefers-reduced-motion · SVG-Semantik · Screenreader-Grundstruktur. Gerade weil creaDIG Accessibility **verkauft** — hier strenger prüfen (die eigene Seite muss vorbildlich sein).

## 27 · WAS MUSS ERHALTEN BLEIBEN? (KEEP-Liste)
Explizite KEEP-Liste: starke Sprache · starke Komponenten · gutes Motion-System · gute Produkt-Screens · gute Formulare · gute Sales-Regeln · gute Admin-Flows · starke Wahrheits-Disziplin. Was NICHT angefasst werden soll.

## 28 · WAS MUSS WEG? (KILL-Liste)
Mit konkreter Begründung: redundante Texte · unnötige Sektionen · Marketing-Floskeln · technische Erklärungen im Owner-UI · fake-ähnliche Visuals · übertriebene Disclaimer · leere Feature-Flächen · unbegründete Animation · unnötige Navigation.

## 29 · KEIN FEATURE-SPIRAL
Wenn das Problem durch Text kürzen · Hierarchie verbessern · bestehendes Diagramm nutzen · bestehenden Screen zeigen · Navigation umbenennen · einen Flow schließen lösbar ist → **kein neues System bauen.**

## 30 · PRIORISIERUNG
Jeden Befund: `P0` kritischer Defekt / Daten-/Sicherheitsrisiko · `P1` verhindert gute Bedienung/Verkauf/Vertrauen · `P2` deutlich relevante UX-/Content-/Design-Lücke · `P3` Polish. Zusätzlich BUSINESS IMPACT (LOW/MED/HIGH) + EFFORT (LOW/MED/HIGH).

## 31 · KEINE PROZENTZAHL AUS DEM BAUCH
Nicht „87 % fertig", außer es existiert ein belastbares Modell. Besser je Bereich: READY · NEEDS FIX · OWNER BLOCKED · CUSTOMER BLOCKED · OPTIONAL.

---

## 32 · ERGEBNIS 1 — EXECUTIVE VERDICT (max. 1 Seite)
Beginne mit „CREADIG IN EINEM SATZ". Dann: Was ist stark? Was verhindert heute Premium-Wirkung? Was verhindert Benutzerfreundlichkeit? Was verhindert Conversion? Was verhindert Vertrauen? Was verhindert echten täglichen Admin-Einsatz?

## 33 · ERGEBNIS 2 — PUBLIC WEBSITE PAGE MATRIX
Je wichtige Route: Route · Ziel · versteht der Nutzer das Ziel? · Content · UX · Visual · Proof · CTA · Preis/Commercial · Mobile · Problem · Priorität · konkrete Empfehlung.

## 34 · ERGEBNIS 3 — ADMIN MATRIX
Je Hauptfläche: Route · Nutzerziel · primäre Aktion · Verständlichkeit · Reibung · technische Sprache · Mobile · Status-/Fehlerklarheit · Workflow geschlossen? · Empfehlung.

## 35 · ERGEBNIS 4 — PRICE & OFFER AUDIT
Vollständige kommerzielle Wahrheitstabelle. Widersprüche explizit markieren. Keine erfundene Steuerwahrheit.

## 36 · ERGEBNIS 5 — CONTENT AUDIT
Top 20 Content-Probleme, je: Original/Bereich · Problem · warum es stört · KEEP/SHORTEN/REWRITE/DELETE · Beispielrichtung. Nicht die ganze Seite neu texten.

## 37 · ERGEBNIS 6 — VISUAL OPPORTUNITY MAP
Je große Sektion eines von: TEXT · DIAGRAM · PHOTO · REAL UI · VIDEO · AI ABSTRACT · NO VISUAL NEEDED — mit Begründung.

## 38 · ERGEBNIS 7 — HIGGSFIELD PLAN
0 bis max. 3 Kandidaten. Je Kandidat: Seite · Position · Zweck · Video/Image · Dauer · Format · Desktop · Mobile · Prompt-Idee · Fallback · Performance-Risiko · Truth-Risiko. Wenn unnötig: sag es.

## 39 · ERGEBNIS 8 — DIAGRAM SYSTEM
Falls nötig, definiere EIN System (nicht 15 Stile): Linien · Nodes · Flow · Layer · Before/After · Motion · Mobile · Reduced Motion · Farben (Token aus §0) · Semantik. Und welche existierenden Komponenten wiederverwendbar sind.

## 40 · ERGEBNIS 9 — TOP 15 FIXES
Keine 120-Punkte-Liste als Hauptantwort. Top 15, sortiert nach BUSINESS/UX IMPACT / COMPLEXITY. Zusätzlich TOP 5 HIGH IMPACT / LOW EFFORT.

## 41 · ERGEBNIS 10 — FINAL BUILD PLAN (noch NICHT implementieren)
Ein einziger späterer Build-Plan: PHASE A Content/Commercial Truth · B UX/Usability · C Visual Argument/Diagramme · D Real Proof/Photography/Product Surfaces · E Optional Higgsfield/Motion · F Admin UX Fixes · G Final Live Acceptance. Keine neuen Phasen erfinden, wenn nicht erforderlich.

## 42 · DIE WICHTIGSTE REGEL
Nicht „Wir könnten noch …". Sondern: WAS FEHLT WIRKLICH? WAS IST SCHON GUT? WAS MUSS NICHT MEHR GEBAUT WERDEN? WAS WÜRDE EIN ECHTER KUNDE NICHT VERSTEHEN? WAS WÜRDE IHN VOM KONTAKT ABHALTEN? WAS WÜRDE DEN OWNER IM ADMIN NERVEN/VERLANGSAMEN? UND: WIE KOMMEN WIR MIT WENIGEN GROSSEN SCHRITTEN ZU EINEM WIRKLICH ABGESCHLOSSENEN PRODUKT?

## 43 · STOP CONDITION
Beende den Audit erst, wenn du Website + Admin als **ein zusammenhängendes Produkt** verstanden hast. Nicht nach der Homepage zurückkehren. Keine Implementierung. Am Ende soll der Owner anhand deines Berichts **einen einzigen großen finalen Build-Run** beauftragen können. Das ist das Ziel.

**BEGIN FULL creaDIG 360° AUDIT.**
