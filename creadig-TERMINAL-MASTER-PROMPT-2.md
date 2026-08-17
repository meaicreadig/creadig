# creaDIG — TERMINAL MASTER-PROMPT 2 · Ausbau (Rest-Design + Conversion-Maschine)

**Datum:** 2026-08-17 · **Branch:** `feat/system-haus-site` · **Fortsetzung von** `creadig-TERMINAL-MASTER-PROMPT.md` (v1)

Diese Datei ist die **Fortsetzung + Erweiterung**. Sie führt das laufende Design-Refactoring zu Ende **und** ergänzt eine komplette **Conversion-Maschine**, abgeleitet aus der Analyse eines erfolgreichen Wettbewerbers (coresection.ch) — aber strikt gefiltert durch creaDIGs **Ehrlichkeitsprinzip**. Kein Stil-Kopieren, nur bewährte Struktur.

**Start:** Lies DIESE Datei + v1 (`creadig-TERMINAL-MASTER-PROMPT.md`, dort die Detail-Specs der Design-Epics) + `creadig-TERMINAL-MASTER.md` (Design-DNA) + `KIZILELMA-creaDIG.md` (Haltung). Arbeite in der **Reihenfolge unten**, ein Commit pro Epic, nach jedem Block `npm run build` + visuelle Verifikation. **Nicht** nach `main` pushen.

---

## 1. Status

| Block | Stand |
|---|---|
| **P0 — Blocker** | ✅ done (E-M1 E-Mail `info@`, E-G1 Jahr 2017, E-L1 Impressum-Struktur, E-L2 Datenschutz) |
| **P1 — Typo** | ✅ done (E-T1/T2/T3 — 24→0 Größen im Markup, H2 8→1, H3 6→1, Boden 16px, Poppins 600 aktiv, 2 saubere Label-Klassen `eyebrow` + `text-meta`) |
| **P1 — Design** | ⏳ offen (E-D1–E-D7) — **E-D2 rescoped, siehe §2** |
| **P1 — Icons** | ⏳ offen (E12 WhatsApp, E13 Halbmond) |
| **P2 — Funktion/SEO** | ⏳ offen (E-F1–E-F7) |
| **Conversion-Maschine** | 🆕 neu (E-K1–E-K9, §5) |
| **P3 — Inhalt** | ⏳ offen (FAQ ist jetzt E-K5) |

---

## 2. Korrektur aus der Typo-Abnahme (wichtig)

**E-D2 ist größer als in v1 beschrieben.** Die `.dark` × `.section-dark`-Kollision bricht **nicht nur das Footer-Logo**, sondern **ganze Sektionsflächen** im Dunkelmodus (Nav dunkel, Sektion darunter creme-hell — der Dark-Mode bricht mitten in der Seite). Ursache dieselbe, Umfang größer. **Fix:** ALLE `.section-dark`-Bänder im Dark-Mode prüfen (Impact, meAI, Footer), nicht nur das Logo. Entweder `.section-dark` als „force-light" kapseln, sodass `dark:`-Utilities darin nicht greifen, oder die Bänder echt dark-mode-fähig machen. Danach: Screenshot jeder Sektion in beiden Modi.

**TR-Versal-Bug:** Die Schriftdatei ist gefixt (`latin-ext` liegt drin). Der verbleibende Fehler (`text-transform: uppercase` bildet türkisches `i → I` statt `İ`) löst sich mit **E-F2** (`<html lang>` locale-abhängig) — dort mitverifizieren.

---

## 3. Gesperrte Entscheidungen (unverändert + eine neue)

- Light + Gold-Akzent · echtes Logo · **Poppins** · Dreiecks-Motiv. **KEIN** Serif, **kein** Schwarz-dominant.
- Nur **DE + TR**. Eigene Produkte nur **meAI/fibero/CASSAMEA/meahv**. Sitz **ICO Osnabrück**. Gründung **2017**.
- **🆕 KEINE aufgeblasenen Zahlen.** Der Wettbewerber wirbt mit „+1500 Kunden / 200+ Projekte / +50 Bewertungen / 15+ Jahre" — untereinander widersprüchlich. **creaDIG macht das NICHT.** Reviews, Case-Studies, Kennzahlen **nur echt + freigegeben.** Ehrlichkeit ist creaDIGs Alleinstellung, nicht seine Schwäche.
- Nichts auf `main`/Produktion bis Owner „live" sagt. Kein Force-Push.

---

## 4. Reihenfolge

1. **Rest P1-Design:** E-D1 → **E-D2 (rescoped)** → E-D3 → E-D4 → E-D5 → E-D6 → E-D7  *(Detail-Specs in v1)*
2. **Icons:** E12 → E13  *(Detail-Specs in v1)*
3. **P2 Funktion/SEO:** E-F1 → E-F7  *(Detail-Specs in v1; E-F2 fixt auch den TR-Versal-Bug)*
4. **🆕 Conversion-Maschine:** E-K1 → E-K9  *(§5 — Struktur bauen, echte Inhalte gated)*
5. **P3 Optional-Inhalt**

> **Prinzip für die Conversion-Epics:** Baue **Struktur + Rendering + schema.org**, aber gate jeden echten Inhalt auf `approved: true` / vorhandene Werte — **genau wie bei E-L1 (Impressum).** Leer/versteckt, bis der Owner echte Inhalte liefert. **Nichts erfinden.**

---

## 5. Conversion-Maschine (neu, aus Wettbewerbs-Analyse)

Der Wettbewerber gewinnt Kunden über eine klare Conversion-Struktur, die creaDIG fehlt. Diese Bausteine übernehmen wir — **im creaDIG-Design, mit echten Inhalten.**

**E-K1 · Case-Study-Format „Problem → Lösung → Ergebnis".** Upgrade das Portfolio um eine Story-Struktur pro **echtem, freigegebenem** Kundenwerk: `caseStudies: [{ client, problem, solution, result, image, approved }]` in `lib/site-data.ts`. Rendert nur bei `approved: true`. Bis Freigaben da sind: bestehende Kacheln bleiben, Format-Gerüst vorbereitet. **Owner liefert Freigaben + Texte.**

**E-K2 · Echte-Bewertungen-Sektion.** Neue Sektion + `reviews: [{ name, date, text, source, approved }]`. Rendert nur echte, freigegebene Reviews (Google/Kunde). Leer/versteckt bis vorhanden. **KEINE erfundenen Testimonials.** `Review`/`AggregateRating` schema.org **erst**, wenn echte Reviews existieren. **Owner sammelt Reviews.**

**E-K3 · Preis-Tiers schärfen.** Die 3 Pakete zu einem klaren Tier-System mit **einem „beliebteste Wahl"-Anker** und transparenter Feature-Liste je Stufe. Bestehende Preise (€350/€500/€1500) behalten, außer Owner gibt neue. Ehrlich, keine Fake-Rabatte/Fake-Anker. **Owner bestätigt Preise/Struktur.**

**E-K4 · Granulare Leistungs-Seiten (SEO-Strategie).** Statt nur 5 Oberpunkte: eine **Template-Route** `/leistungen/[slug]` + eine **fokussierte Starter-Menge** für DEINE Nische (z. B. `webdesign`, `corporate-design`, `lokales-seo`, `website-handwerk`, `zweisprachig-de-tr`). Jede Seite: eigenes `title`/`description`/`canonical` + echter Inhalt. **Kein Wildwuchs aus 30 generischen Seiten** — nur die, die zur Nische passen. Ziel: über Google gefunden werden. **Owner/Terminal füllt echte Inhalte, nichts erfinden.**

**E-K5 · FAQ-Sektion (+ FAQPage schema.org).** Echte FAQ aus den vorhandenen `chat.answer*`-Texten (`dictionary.ts:456-465`) + Standardfragen (Was kostet…, Wie lange dauert…, Wie läuft die Zusammenarbeit…, go-digital-Förderung…). Als Sektion **und** `FAQPage`-schema (SEO-Bonus). DE/TR paritätisch.

**E-K6 · Retainer produktisieren.** Den Support-/Ops-Retainer als **sichtbares Angebot mit Preis** darstellen (wiederkehrender Umsatz), nicht versteckt im Fließtext. Ehrlich zum echten Leistungsumfang. **Owner bestätigt Retainer-Preis.**

**E-K7 · Echte Social-Profile.** Tote IG/LI/YT-Slots (`site-footer.tsx:147-158`) durch **echte Links** ersetzen (Owner liefert URLs) **oder entfernen**. (Absorbiert E-C2.)

**E-K8 · „Kostenlose Erstberatung" als Lead-Magnet.** Den Termin/Haupt-CTA als niedrigschwelliges **Wert-Angebot** framen („Kostenlose Erstberatung / Digital-Analyse"), klarer Einstieg vor dem Verkauf. Nur Wording/Framing + Termin-Flow, kein neuer Backend-Zwang.

**E-K9 · (Strategisch, Owner-gated) Marketing/Wachstum als Leistung.** Die eigentliche Kunden-Lücke: creaDIG bietet „Marke/Web/KI", aber **nicht** Sichtbarkeit/Leads/Werbung — genau das, was Kunden bringt. Sobald der Owner das wirklich liefern kann, eine „Wachstum/Sichtbarkeit"-Leistung ergänzen. **NUR anbieten, was wirklich geliefert wird — kein Versprechen ohne Substanz.** Standardmäßig **nicht** bauen, bis Owner „ja, jetzt" sagt.

---

## 6. Acceptance Criteria (zusätzlich zu v1)

- [ ] Dunkelmodus bricht **keine** Sektionsfläche mehr (jede `.section-dark` in beiden Modi sauber)
- [ ] `grep 2018` = 0 (unverändert) · E-Mail `info@` überall (unverändert)
- [ ] Kein `text-gold` als Fließtext unter AA · kein gelbliches Creme-Panel · Nav fluchtet mit Sektionsraster
- [ ] Icons ohne Überschneidung 16/20/24px · Halbmond eindeutig
- [ ] Conversion-Sektionen rendern **nur echte, freigegebene** Inhalte; leer/versteckt statt Fake
- [ ] Neue Seiten/Sektionen DE/TR paritätisch · FAQPage-schema valide
- [ ] `npm run build` + `tsc` grün · (lint grün nach E-F5)
- [ ] Visuell verifiziert (Screenshots hell **und** dunkel)

## 7. Nicht tun
- ❌ Erfundene Zahlen/Reviews/Case-Studies/Prozente (die Wettbewerber-Masche — genau NICHT)
- ❌ Serif · 5 Sprachen · PLANEX als Produkt · Diepholz · falsches 2018
- ❌ Gold-CTA-Buttons „entgelben" (nur die blassen `bg-gold/[0.045]`-Panels)
- ❌ KI-Assistent/Social hart löschen (ausblenden/rückholbar)
- ❌ 30 generische SEO-Seiten (nur nischen-relevante) · Marketing-Leistung ohne echte Lieferfähigkeit
- ❌ Force-push · Produktion ohne „live"

## 8. Owner liefert (erweitert)
**Recht/Assets (aus v1):** Impressum-Werte (Rechtsform · USt/§19 · §18 MStV) · Badge-Logos · Produktlogos meAI+meahv · ICO-Foto · OG-Bild · meahv-Mockup · Anwalts-Check.
**Neu für die Conversion-Maschine:**
- **Case-Study-Freigaben + Texte** (echte Kunden: Problem/Lösung/Ergebnis)
- **Echte Google-Reviews** (Name/Datum/Text/Freigabe)
- **Preis-Bestätigung** für Tiers + Retainer
- **Social-Profil-URLs** (IG/LI/YT) oder „weglassen"
- Entscheidung E-K9 (Marketing-Leistung ja/wann)

## 9. Start
Bestätige, dass P1-Typo trägt, dann E-D1 → … in Reihenfolge §4. Ein Commit pro Epic. Struktur bauen, echte Inhalte gaten, nichts erfinden. Am Ende: erledigt / Owner-offen. **Nicht** nach `main` pushen.

---
*Quelle: 4 Code-Audits + Typo-Abnahme + Wettbewerbs-Analyse coresection.ch + Owner-Entscheidungen, 2026-08-17.*
