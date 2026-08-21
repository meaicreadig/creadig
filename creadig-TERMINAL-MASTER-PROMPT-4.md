# creaDIG — TERMINAL MASTER-PROMPT 4 · Systemhaus-Umbau (Architektur + Stil)

**Datum:** 2026-08-21 · **Branch:** `feat/system-haus-site` · **Der große Umbau.**

Dies ist der **definitive Umbau** von creaDIG: von einer „schönen Premium-**Landingpage**" zu einer **Firmen-/Systemhaus-Website mit Tiefe.** Grundlage: 4 Code-Audits + ChatGPT-Architektur-Analyse + Cursor-Hybrid-Urteil (R1-Basis) + Owner-Kritiken + die zwei Design-Richtungen unter `design-mockup/`. **Visuelle DNA bleibt — die Architektur UND der visuelle Rhythmus ändern sich.**

**Start:** Lies DIESE Datei + `creadig-TERMINAL-MASTER.md` (Design-DNA) + `KIZILELMA-creaDIG.md` (Haltung) + die Referenz-Entwürfe `design-mockup/Main.dc.html` (R1-Typografie/Ruhe = Basis) und `design-mockup/Home2.dc.html` (R2-Hero-Panel + Produkt-Farbkanten = Transfers). Spiegle den Plan in ~10 Bullets, dann arbeite **PHASE A → E**, ein Commit pro Route/Block, nach jeder Phase `npm run build` + Screenshot-Freigabe. **Nicht** nach `main` pushen.

---

## 1. Die Kern-Diagnose (warum dieser Umbau)

Die aktuelle Seite (und die bisherigen Entwürfe) erzählt eine **lineare Verkaufsgeschichte** auf einer Scroll-Schiene: Problem → Methode → Leistungen → Produkte → Vertrauen → Preise → FAQ → CTA. Das ist **Landingpage-Architektur.**

creaDIG ist aber ein **System-Haus mit eigenem Ökosystem** — eigene Produkte, eigene Systeme, mehrere Kompetenzen. Eine Firmen-Website muss das **strukturell zeigen**, nicht behaupten. Kernsätze (gesperrt als Leitplanke):
- **Startseite = Verteiler, KURZ.** Sie erklärt nicht alles selbst — sie zeigt Ausschnitte und führt tiefer. (Große Website ≠ lange Homepage.)
- **Echte Informations-Architektur** statt einer Storyline: der Nutzer muss abbiegen können (Unternehmen · Leistungen · Produkte · Arbeiten · Insights).
- **Produkte sind der stärkste Beweis** — keine Agentur baut eigene Software. Jedes Produkt eine **eigene Welt/Seite** mit echten Interfaces.
- **Visuelle Spannung** statt gleicher Lautstärke — das ist die Ursache des „irgendwas ist still"-Gefühls.
- **„Tiefe" kann man nicht stylen** — sie braucht echtes Material (gated).

---

## 2. GESPERRTE ENTSCHEIDUNGEN (Black Lock — nicht kippen)

- **Visuelle DNA bleibt:** Light + Gold-Akzent (`--gold #be904e`, Text-Gold `#8f6a33`), Charcoal `#2a2723`, warmes Creme `#f1ece3`, **Poppins**, Signatur-/Dreiecksmotiv **nur dosiert**. **KEIN Serif, KEIN Schwarz-dominant.** Gold ist **Akzent, keine Bühne** (kein Vollgold-Band, kein schwarzer Primary-CTA — CTAs = Gold-Fläche oder Outline).
- **Ehrlichkeit (härtester Lock):** nur **echte** Daten, Screenshots, Zahlen. Alles Owner-Material ist **gated** — vorhanden → rendert, fehlt → Sektion versteckt sich (kein Platzhalter-Fake, kein Deko-Laptop, kein erfundener KPI). Reviews/Case-Studies bleiben leer bis `approved`.
- **Eigene Produkte = meAI · fibero · CASSAMEA · meahv.** Weitere echte Projekte (z. B. maqam, ViSec) NUR aufnehmen, wenn der Owner sie ausdrücklich bestätigt — bis dahin **nicht erfinden, nicht annehmen.**
- **Sitz:** ICO Osnabrück, Albert-Einstein-Str. 1. **Gründung 2017.** **Märkte DE · CH · Europa.** **Sprachen DE · TR · EN** (Default DE).
- **Preise NICHT prominent auf der Startseite** — eigene Ebene (macht creaDIG sonst kleiner = „produktisierte Agentur").
- **Bestehendes bleibt erhalten:** die gated-Maschine (Reviews/Cases/Retainer/Social), Consent, i18n, Legal, RUN-A-Fixes (Gold-Kontrast, Dark-Mode, Icons). Nichts davon zurückbauen.
- Nichts auf `main`/Produktion bis Owner „live" sagt. Kein Force-Push.

---

## 3. Neue Informations-Architektur (Sitemap)

| Route | Zweck |
|---|---|
| `/` | **Verteiler-Startseite** (kurz, §4) |
| `/unternehmen` | Über creaDIG · Haltung · Gründer · Standort (ICO + Parallax) · Netzwerk · Nachweise/Zertifikate |
| `/leistungen` + `/leistungen/[slug]` | Capabilities als eigene Seiten: Marke · Digital · Operations · Automatisierung · KI |
| `/produkte` + `/produkte/[slug]` | **Produkt-Welten** — je Produkt eigene Seite (meAI, fibero, CASSAMEA, meahv), §5 |
| `/arbeiten` + `/arbeiten/[slug]` | Referenzen-Übersicht + **tiefe Case-Studies** (gated auf `approved`) |
| `/insights` | System-Notes/Artikel — Gerüst jetzt, Inhalte später (gated) |
| `/kontakt` | Echte Kontaktseite (mehrere Wege, nicht nur „Termin in 20 Min") |
| `/impressum` `/datenschutz` `/termin` | bestehend, behalten |

**Nav:** Leistungen · Produkte · Arbeiten · Unternehmen · Insights — rechts: **Projekt starten** + DE/TR/EN. Die Nav muss **beweisen, dass hinter der Startseite eine Welt existiert.**

---

## 4. Startseite als VERTEILER (kurz — jede Sektion führt tiefer)

Reihenfolge (an ChatGPTs Architektur, mit echten creaDIG-Daten):
1. **Hero** — „Wir bauen, was andere nicht sehen." + **glasklare Subline**: „creaDIG entwickelt Marken, digitale Systeme, Automatisierung und eigene Softwareprodukte." Darunter Chips: `Brand · Digital · KI · Produkte`. CTAs: *Unsere Arbeit* / *Projekt starten* (Gold, nicht Schwarz).
2. **creaDIG in einem Satz** — eine große Aussage + **System-Diagramm** (Marke → Digital → Operations → Automatisierung → KI). Kein Karten-Raster.
3. **Selected Work — FRÜH & GROSS** — echte Arbeiten editorial, groß (nicht kleine Cards). Führt zu `/arbeiten`. (Gated auf echte Werke.)
4. **Capabilities** — 5 Ebenen als Verteiler-Kacheln, jede verlinkt auf `/leistungen/[slug]`.
5. **Produkte — „We build our own."** — die vier groß, mit Marken-Farbkante + Status, jede verlinkt in ihre **Welt** `/produkte/[slug]`. Das ist der Aha-Moment „das ist keine Agentur".
6. **System-Architektur** — die 5 Ebenen als **visuelles/interaktives** Modell (nicht nur Text+Linie+Nummer).
7. **Eine starke Case-Study** — verlinkt tief (gated; wenn keine approved → Sektion aus).
8. **Zahlen/Proof** — nur echte Kennzahlen (gated) + Zertifikate-Leiste (go-digital/BAFA/iuk/AVPQ/AGD).
9. **creaDIG als Unternehmen** — Standort ICO (+ Parallax), Gründer, kurz — verlinkt `/unternehmen`.
10. **Insights** — 3 Teaser (gated) → `/insights`.
11. **CTA — souverän**, kein Funnel-Geschrei: „Was sollen wir für Sie bauen?" + *Projekt starten*.

**Wichtig:** kürzer als heute. Wo eine Sektion „alles erklärt", stattdessen anreißen + auf die Unterseite führen.

---

## 5. Produkt-Welten (der Kern-Beweis) — `/produkte/[slug]`

Template pro Produkt (meAI zuerst — live):
- **Hero:** Produktname groß + Einzeiler (aus `site-data`) + Status (Im Aufbau/Live) + ggf. `meai.run ↗` (SVG-Icon).
- **Echtes Interface — GROSS, als Beweis.** Gated: Owner legt echte Screenshots nach `public/works/products/<slug>/…`. **Solange keine Screens: sauberer typografischer Hero + „was gebaut"-Text — KEIN Deko-Laptop, kein Fake-UI.**
- **„Was wir gebaut haben"** (aus `site-data.built`), **Wofür** (`what`), Sektor.
- **Story/Positionierung** (Owner-Text, gated).
- eigene `title`/`description`/`canonical` + `SoftwareApplication`/`Product` schema.org (nur mit echten Feldern).
Vier Welten: meAI (KI-Business-OS), fibero (Glasfaser-Operations), CASSAMEA (Gastro-Kasse CH), meahv (Hausverwaltung). Datenquelle bleibt `lib/site-data.ts` (`productWorks`).

---

## 6. Visuelle Spannung — Stil-Elevation (der „auch Stil ändern"-Teil)

DNA bleibt, aber **Rhythmus rein** — nicht mehr Farbe, sondern **Kontrast der Komposition**. Regeln:
- **Wechsel** über die Seite: riesig ↔ klein · vollflächig ↔ Weißraum · Text ↔ **echtes Interface** · statisch ↔ Bewegung · hell ↔ **dunkles Vollband (charcoal, sparsam gesetzt)** · Behauptung ↔ Beweis.
- **Nicht** alles auf gleicher visueller Lautstärke (das erzeugt das „still/flach nach 10 Sektionen"-Gefühl).
- **Hero-Presence** aus R2 übernehmen: asymmetrisch + Signal-Panel (2017 · 4 · DE·CH·Europa · go-digital), aber in **R1-Typografie-Ruhe** (leichte Gewichte, kein Gold-Schrei).
- **Produktkarten** mit dünner Marken-Farbkante oben (aus R2).
- Motiv/Muster **nur an 2–3 gezielten Stellen**, sonst clean (bleibt Lock).
- **Bilder = Beweise**, nicht Deko. Interfaces full-width, mit echten Datenpunkten daneben (gated).

---

## 7. Preise & Kontakt (Kategorie-Korrektur)

- **Preistabelle (€350/€500/€1.500) runter von der Startseite** → eigene Ebene (`/leistungen` oder `/preise`). Auf der Startseite höchstens ein dezenter Hinweis. Framing: **Standard-Produkte transparent · Systementwicklung individuell.**
- **`/kontakt`** als echte Seite mit mehreren Intentionen: *Projekt besprechen · Produkte ansehen · Case-Studies · Termin* — nicht nur „Termin in 20 Min" (das bleibt als *ein* Weg).

---

## 8. Owner liefert (macht die Seite WAHR — gated, blockiert den Bau NICHT)

1. **Echte Produkt-Screenshots/Interfaces** → `public/works/products/<slug>/` (meAI zuerst).
2. **Echte Zahlen** (Systeme in Betrieb, Deployments, Jahre — nur echt) → `site-data` Proof.
3. **maqam / ViSec / weitere echte Projekte** — Klärung: eigenes Produkt? Kundenwerk? Venture? → dann als Welt/Case aufnehmen.
4. **ICO-Foto** → `public/images/ico-osnabrueck.jpg` (Parallax-Code steht).
5. **Case-Study-Freigaben** + **Google-Reviews** (bestehende gated-Slots).
6. **Impressum-Werte** (Rechtsform · USt/§19 · §18 MStV) · **Badge-Logos**.

---

## 9. Reihenfolge (Phasen mit Freigabe-Stopp)

- **PHASE A — IA-Gerüst:** neue Routen (`/unternehmen`, `/produkte/[slug]`, `/leistungen/[slug]`, `/arbeiten/[slug]`, `/kontakt`, `/insights`) + Nav-Umbau + **Startseite auf Verteiler kürzen**. → build + Screenshots (Start + je 1 neue Route, hell/dunkel). **STOPP: Freigabe.**
- **PHASE B — Produkt-Welten:** Template + 4 Produkte (gated Screens). → Screenshots. **STOPP.**
- **PHASE C — Visuelle Spannung:** Hero-Panel, dunkle Vollbänder dosiert, System-Diagramm, Interface-full-width, Rhythmus. → Screenshots hell/dunkel. **STOPP.**
- **PHASE D — Tiefe:** Case-Study-Template, Referenzen-Seite, Zahlen/Proof (gated), Preise verschieben, Insights-Gerüst.
- **PHASE E — i18n & Politur:** EN als 3. Sprache (Parität 3×) + Märkte-Text DE→CH→Europa (siehe Backlog-4) + Feinschliff (Kontraste, ≥13px, Termin-Footer-Einordnung).

Ein Commit pro Route/Block. `build`+`tsc`+`lint` grün halten. **Nicht** nach `main` pushen; am Ende jeder Phase `git push origin feat/system-haus-site` für Preview.

## 10. Nicht tun
- ❌ Erfundene Screenshots/Zahlen/Reviews/Cases · Deko-Laptops · Fake-UI.
- ❌ maqam/ViSec o. a. ohne Owner-Bestätigung aufnehmen · 5. Produkt erfinden.
- ❌ Schwarzer Primary-CTA · Vollgold-Band · Gold als Fläche · Serif · Schwarz-dominant.
- ❌ Preistabelle prominent auf der Startseite.
- ❌ Startseite wieder zur Alles-Erklär-Landingpage aufblähen.
- ❌ Force-push · Produktion ohne „live".

## 11. Acceptance
- [ ] Neue Routen existieren, Nav bildet die Firma ab, Startseite ist **kürzer** + führt tiefer.
- [ ] Vier Produkt-Welten mit eigener Seite; ohne Screens sauber-typografisch, nie Fake-UI.
- [ ] Sichtbarer visueller Rhythmus (hell/dunkel, groß/klein, Text/Interface) — kein „flach nach 10 Sektionen".
- [ ] Preise nicht mehr prominent auf der Startseite.
- [ ] DNA gehalten (Gold-Akzent, kein Schwarz-dominant, Poppins, Motiv dosiert).
- [ ] Alles Owner-Material gated; nichts erfunden. `build`/`tsc`/`lint` grün; DE/TR(/EN) paritätisch.
- [ ] Nach jeder Phase Screenshots hell+dunkel.

---
*Quelle: 4 Code-Audits + ChatGPT-Architektur-Analyse + Cursor-Hybrid-Urteil + zwei Design-Richtungen (`design-mockup/`) + Owner-Entscheidungen, 2026-08-21.*
