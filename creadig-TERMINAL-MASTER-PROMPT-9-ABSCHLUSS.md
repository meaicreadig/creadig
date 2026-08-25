# creaDIG — Terminal-Master-Prompt 9 · V3: Abschluss, Politur & Wachstum

> **Grundlage:** KIZILELMA §10 + die 100-Punkte-Tiefen-Analyse (23.08.2026) + Stand nach V2.
> **Ehrliche Einordnung:** Der Code ist weitgehend fertig (Welle 1–3, v0-Review, BFSG, V2). Diese
> Runde ist **Abschluss + Politur**, KEIN Neubau. Der eigentliche Hebel liegt jetzt bei
> **Owner-Material** und **Livegang** — dieser Prompt baut nur die letzten Code-Gefäße und die Politur.
> **Ausführung: alle Stufen in EINEM Durchgang, ohne Zwischen-STOPP.** Commit + `npm run build` grün
> + alle Gates (Function/Sterne/Parität/a11y) pro Teilschritt. Owner-abhängiges läuft als „wartet auf
> Owner" durch. Nur finaler STOPP. **Nicht nach `main`, nicht live, kein Force-Push.**

## Gesperrte Entscheidungen (Black Lock — gilt weiter)
Ehrlichkeit (keine Fakes, keine erfundenen Zahlen/Referenzen/Zertifikate) · Marken-DNA bleibt · Markt DACH, alle Unternehmen · Deutsch Hauptsprache, TR bleibt · drei Marken-Sätze · Verb-Welt · keine Deko-Trends · §10 gilt vor §9.8.

## Owner-Entscheidungen, die DIESEN Lauf steuern (vor Start beantworten)
1. **CI/Motiv-Richtung:** **A** (ruhig editorial, kein Flächen-Muster) · **B** (Emblem-geführt) · **C** (System-map). → steuert Stufe 1. *Empfehlung: erst als Mockup zeigen, dann bauen.*
2. **Preise final?** Leiter 2.400 → 3.900 + 149/Mon · BFSG 1.500 / 2.000–4.000 / 149. Bestätigt oder ändern.
3. **SEO-Ziele:** welche Städte/Leistungen (z. B. „Webentwicklung Osnabrück", „Prozessautomatisierung", „KI für KMU", „Digitalisierung Handwerk")? → steuert Stufe 4.
4. **Livegang nach dieser Runde ja/nein?** → bestimmt, wie hart Stufe 6 auf Live-Reife prüft.

---

## STUFE 1 — Corporate Identity / Motiv (GATED: Owner-Richtung A/B/C)
- Die gewählte Richtung umsetzen. Muster/Motiv nur dort, wo es trägt (Hero/Footer), sonst raus; Gold nur als Akzent; echte Fotos + Produkt-UI als Textur statt Flächen-Grid. Interim-Reduktion (Dichte 0.30) ist Zwischenstand — je nach Richtung ersetzen.
- **Bis die Richtung feststeht: NICHT am Motiv bauen** — nur vorbereiten (Stellen sammeln, wo das Motiv sitzt).
- Acceptance: Owner-Richtung sichtbar umgesetzt, konsistent über alle Seiten, a11y grün.

## STUFE 2 — Design-System & Content-System (Konsistenz)
- **Design-System:** Spacing-Scale, Heading-Tokens (H1–H6), max. Zeilenlänge, Grid, Button/Card/Border/Hover/Focus in Tokens fassen — nichts mehr ad hoc im Markup. (Analyse §C)
- **Sektions-Rhythmus:** jeder Seite einen eigenen visuellen Charakter geben (Startseite ≠ Leistungen ≠ Produkte ≠ Arbeiten ≠ Unternehmen ≠ Insights) — kein „heading + paragraph + cards" auf jeder Seite. (Analyse §D)
- **Content-System:** Verb-Welt (bauen/verbinden/betreiben/strukturieren/automatisieren) durchsetzen; verbotene Wörter (Katalog) prüfen; DE/TR getrennt qualitätsgeprüft.
- Acceptance: ein Token-Satz, sichtbar unterschiedliche Seiten-Charaktere, Verb-Welt konsistent.

## STUFE 3 — Fehlende Seiten (deferred aus der Analyse)
- **Technologie/Systeme-Seite:** „Integration first" — mit welchen Systemen wir arbeiten (API/CRM/ERP/Cloud/DB/Payment), Betrieb (Monitoring/Logging/Backups/Security/Deployment). Nur Wahres. (Analyse §43)
- **Managed-Betrieb als eigene Seite:** die V2-Sektion zu einer vollen Seite ausbauen (Hosting/Monitoring/Updates/Security/Backups/Support/Weiterentwicklung + SLA-Rahmen). (Analyse §44)
- **Insights-Content-Maschine:** Kategorie-Struktur (Systems/Automation/AI/Products/Betrieb/Praxis) + Artikel-Slots; Inhalt owner-gegatet (erste zwei Titel als Gerüst, Text wartet).
- Acceptance: Seiten erreichbar, in Sitemap/Nav wo sinnvoll, DE/TR, leere Inhalte sauber gegatet.

## STUFE 4 — SEO-Landing-Architektur (GATED: Owner-Ziele)
- Für die gewählten Ziele je eine ehrliche Landing (Leistung + Ort), verbunden mit den echten Leistungen — **kein Keyword-Müll**, kein Doppelinhalt. `ProfessionalService`-Schema, lokale Signale, interne Verlinkung.
- Acceptance: je Ziel eine Seite, sauber verlinkt, Schema validiert, keine Duplicate-Content-Warnung.

## STUFE 5 — Mobile & Performance
- **Mobile-QA** an echten Breakpoints: Hero-Umbrüche, Produkt-Grid, 5-Ebenen, Arbeiten-Karten, FAQ, Footer, Booking-Kalender, Sprachumschalter, WhatsApp-CTA. (Analyse §48)
- **Performance:** Bilder AVIF/WebP + responsive + lazy, Font-Subsets, Hero-Priority, Animations-Zurückhaltung, Core Web Vitals messen. (Analyse §49)
- Acceptance: mobil sauber, CWV grün, keine Layout-Shifts.

## STUFE 6 — Endabnahme & Live-Vorbereitung
- Voller build + alle Gates + `npm run shots` (alle Seiten, hell/dunkel, mobil/desktop).
- `creadig-LIVE-CHECKLISTE.md` + `creadig-AUDIT-BACKLOG.md` aktualisieren.
- **Ein klarer Abschlussblock „Was fehlt jetzt NUR NOCH vom Owner"** (Material + Livegang), damit die unsichtbare Lücke sichtbar bleibt.
- **FINALER STOPP.**

## Owner liefert (Code wartet — nichts erfinden)
Case-Inhalte (NV SWISS + maqam) · echte Produkt-Screens · echte Zahlen · echte Fotos · Testimonials · Impressum/Steuerstatus/DE-Telefon · Vercel-/Resend-AVV · ENV · Domain.

## Nicht tun
Kein Neubau bestehender, funktionierender Teile · keine Fakes · keine Deko-Trends · Motiv nicht ohne Owner-Richtung umbauen · nichts nach `main` · nicht live.
