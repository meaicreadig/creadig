# creaDIG — TERMINAL MASTER-PROMPT (Deep-Analyse → Umsetzung)

**Datum:** 2026-08-17 · **Branch:** `feat/system-haus-site` · **Build:** grün (verifiziert)

Diese Datei ist **der eine Master-Prompt** für die nächste Terminal-Session. Sie konsolidiert **vier unabhängige Code-Audits** (Typografie · Design-System · Funktion/Technik · Inhalt), eine **externe Cursor-Analyse** und die **Owner-Entscheidungen**. Sie **absorbiert `creadig-TERMINAL-BACKLOG-3.md`** (Icon-Fixes E12/E13) — Backlog-3 nicht separat abarbeiten.

**Start:** Lies zuerst DIESE Datei **+** `creadig-TERMINAL-MASTER.md` (Design-DNA) **+** `KIZILELMA-creaDIG.md` (Haltung). Spiegle den Plan in ~8 Bullets, dann arbeite **P0 → P1 → P2 → P3**, ein Commit pro Epic. Nach jedem P-Block: `npm run build` + kurze visuelle Verifikation (Screenshots). **Nicht** nach dokumentierten Dingen fragen. Am Ende: was erledigt / was Owner-offen. **Nicht** nach `main` pushen.

---

## 1. Audit-Ausgangslage (verifiziert)

| Achse | Score | Kern-Befund |
|---|---|---|
| **Typografie** | 5/10 | Kein Größen-Token-System (~30 Größen, H2 8× dupliziert); nur 2 Gewichte (700/400) → „zu dünn"; Sub-14px-Text flächig → „zu klein"; JetBrains-Mono ohne `latin-ext` → TR-Glyphen brechen in Labels |
| **Design-System** | 7/10 | Gold-als-Text fällt fast überall durch AA-Kontrast; Dark-Mode-Footer-Logo unsichtbar (Bug); „gelbliches Creme" existiert doch; Nav fluchtet nicht mit Sektionsraster; flach statt „tief" |
| **Inhalt** | 7/10 | Produkt-Disziplin vorbildlich, keine Fakes, Adresse konsistent — aber Impressum = Gerüst, E-Mail falsch, „2018" falsch, Datenschutz-Pflichtlücke |
| **Funktion/Technik** | 8/10 | `build` + `tsc` grün; i18n echt paritätisch (300/300); Consent korrekt; alle Routen/Anker/CTAs leben. Defekte: E-Mail in 4 Pfaden, Theme-FOUC, `lint` nicht verdrahtet |

`npm run build` = exit 0, 9 statische Routen, `/` = 196 kB First Load. `npx tsc --noEmit` = exit 0. DE/TR = 300/300 Blatt-Keys, volle Parität.

---

## 2. Gesperrte Entscheidungen (NICHT kippen)

- **Design:** Light + Gold-Akzent · Charcoal-Text · echtes Logo (`public/brand`) · **Poppins** · Dreiecks-/Signatur-Motiv. **KEIN** Schwarz-dominant.
- **KEIN Serif** — die weiche Serif wurde bewusst verworfen. „Zurück zur OMURGA-Serif" ist **falsch**, nicht umsetzen.
- **Nur DE + TR** — keine 5 Sprachen (EN/AR/RU), bewusst.
- **Eigene Produkte = NUR meAI · fibero · CASSAMEA · meahv.** PLANEX/NÛR/… sind **keine** eigenen Produkte.
- **Sitz = ICO InnovationsCentrum Osnabrück, Albert-Einstein-Straße 1, 49076 Osnabrück.** Keine Diepholz-Adresse öffentlich.
- **Gründungsjahr = 2017** (NICHT 2018).
- **Nur echte Nachweise** — keine erfundenen Zahlen/Testimonials/Kunden/Badges.
- **Nichts auf `main`/Produktion**, bis Owner „live" sagt. Kein Force-Push.

---

## 3. Owner-Entscheidungen (Default gesetzt — Owner kann kippen)

- **Gründungsjahr:** 2017 ✓ (entschieden).
- **WhatsApp `+41 76 504 58 79`:** bleibt (bewusst CH). Optional +49-Zeile im Impressum, falls Owner liefert.
- **KI-Assistent:** Default = **hinter Feature-Flag ausblenden** (NICHT löschen, rückholbar), bis echte Claude-API dran ist. Grund: Auf einer KI-Marke wirkt ein Regex-Bot schwächer als gar keiner.
- **Social IG/LI/YT:** Default = **tote Slots entfernen**, bis echte Profil-URLs geliefert werden.
- **„Für wen konkret"/Problem-Sektion** (Handwerk/Bäckerei/Praxis, aus der Legacy): Default = **neu bauen** (passt zur Nische Handwerk/TR-DE-KMU) — Inhalt aus bestehenden/Owner-bestätigten Texten, **keine erfundenen Fälle**.
- **PLANEX:** bleibt draußen (Produkt-Lock). **NÛR** bleibt als „Kundenwerk".

---

## 4. Epics

### P0 — BLOCKER (rechtlich/faktisch)

**E-M1 · E-Mail `hallo@` → `info@creadig.de`.** Einzige Quelle `lib/site-data.ts:310`; fließt in Kontaktformular (`contact.tsx:38`), Footer (`site-footer.tsx:130`), Impressum + Datenschutz (`legal-page.tsx:72`, `:133`). 1-Zeilen-Fix. Vorher verifizieren, dass `info@` provisioniert ist.

**E-G1 · Gründungsjahr 2018 → 2017 überall.** Stellen: `dictionary.ts:29` (Hero-Eyebrow), `:154` (about.body1), `:486` + `:611` (TR), `site-data.ts:196` (Impact-Signal) **und TODO `:195` entfernen**, `layout.tsx:62` (OG-Desc „seit 2017"), `layout.tsx:86` (**schema.org `foundingDate: "2017"`**). Akzeptanz: `grep -n 2018` im ausgelieferten Code = 0 Treffer.

**E-L1 · Impressum-Struktur vervollständigen.** In `site-data.ts` + `legal-page.tsx` echte Felder anlegen für **Rechtsform · USt-IdNr (§27a UStG) ODER §19-Kleinunternehmer-Hinweis · Verantwortlicher §18 Abs. 2 MStV** (+ optional Telefon). Werte liefert Owner (§7). Pending-Block (`legal-page.tsx:81-86`) erst entfernen, wenn Werte da sind.

**E-L2 · Datenschutz-Lücken.** (a) **Beschwerderecht bei einer Aufsichtsbehörde** (Art. 13 Abs. 2 lit. d / Art. 77) in die Rechte-Liste ergänzen (`dictionary.ts:390-391` DE + `:846-847` TR). (b) **Vercel/Drittland-Widerspruch** auflösen: `:382-383` behauptet „keine Drittländer", `:374-376` nennt Vercel (US) — EU-Region/DPF/SCC/AVV klarstellen. (c) Owner: anwaltliche Endprüfung (`dictionary.ts:394`).

### P1 — TYPOGRAFIE (5 → 8; killt „zu klein/dünn" direkt)

**E-T1 · Type-Scale tokenisieren.** In `globals.css` `@theme` ein geschlossenes Set (`--text-display/-h1/-h2/-h3/-lead/-body/-small/-label`) als `@utility`-Klassen mit je **einer** `clamp()`. Die **8× duplizierte H2** `clamp(2.25rem,6vw,5rem)` (`services:25, packages:20, about:21, contact:58, meai:33, certifications:39, impact:31, process:21`) → **eine** Klasse. Die **6 H3-clamps** (`services:68, about:48, portfolio:100, certifications:119, packages:68, location-parallax:109`) → **eine**. Ausreißer `1.0625rem` (`services:70`) + `0.8rem` (`sticky-whatsapp:35`) einsammeln.

**E-T2 · Boden anheben + Mid-Weight (Kern-Fix der Owner-Kritik).** Body-Minimum 16px, Lead 17–18px, 15px nur noch bewusstes „small". **Alle 9–10px-Labels → ≥ 11px** (`portfolio:63/69/78, packages:70, logo-wall:53, footer:153, meai:88, termin:400/435, cookie-consent:166/189`). **Poppins 600** als Sub-Head-Gewicht für H3/Card-Titel einführen (aktuell alles 700/400 → „flach"). **Gewicht 800 aus `layout.tsx:15` streichen** (nirgends benutzt, toter Payload).

**E-T3 · Eyebrow/Label vereinheitlichen.** Eine `.eyebrow`-Klasse, **ein** `letter-spacing` (statt 7). `hero.tsx:88` + `portfolio.tsx:113` + Badges darauf umstellen. **JetBrains Mono `latin-ext` in `layout.tsx:23` nachziehen** (sonst brechen ş/ğ/ı in genau den Labels) — oder Labels auf Poppins-Kapitälchen. `text-display-tight` line-height `0.95 → ~1.0` (`globals.css:194`, 3-zeilige DE-Headline). `text-balance` an der größten H2 (`portfolio.tsx:152`) ergänzen.

### P1 — DESIGN-POLITUR (7 → 9)

**E-D1 · Gold-als-Text-Kontrast (A11y, jede Sektion).** Token `--gold-text` = `#8f6a33` (hell, ~4,8:1 = AA) / `#d3a763` (dunkel). Alle `text-gold`-**Texte** (Eyebrows/Labels/Ziffern: `impact:49, process:40, meai:27, about:47/54/68/76, packages, certifications, contact, hero:47`) → `text-gold-text`. Gold für **Hairlines/Verläufe/Embleme bleibt hell**. `text-line-strong` als **Ruhe-Textfarbe abschaffen** (`services:74, packages:85, meai:88, certifications:89` → `muted-foreground`).

**E-D2 · `.dark` × `.section-dark`-Kollision (Footer-Logo-Bug).** Im Dark-Mode zwingt `.section-dark` (`globals.css:122`) helles Creme, während `logo.tsx:23-35` per `dark:`-Variant das helle Logo-SVG (`#FBFBF9`) einsetzt → Kontrast ~1:1, **Wortmarke unsichtbar**. Fix: `.section-dark` als „force-light" kapseln **oder** Logo an `currentColor`/`--foreground` koppeln statt Datei-Tausch. Test: Footer im Dark-Mode → Wortmarke sichtbar.

**E-D3 · „Gelbliches Creme" entfernen (explizite Owner-Vorgabe).** Die blass-gelben `bg-gold/[0.045]`-Panels (`certifications:116, packages:33`) durch neutrale Fläche (`--surface`/`--muted`) oder Hairline-Karte ersetzen. **WICHTIG:** Die soliden **Gold-CTA-Verläufe** (`from-gold-soft to-gold`) BLEIBEN — das ist Marken-Gold, kein Creme. **Gold-Buttons NICHT „entgelben".**

**E-D4 · Nav-Raster = Sektionsraster.** `site-nav.tsx:59`: `max-w-[88rem] → max-w-[100rem]`, `lg:px-10 → lg:px-16`. Dann fluchtet das Logo mit dem Seiteninhalt (behebt „Logo sitzt zu weit rechts").

**E-D5 · Motiv vereinheitlichen.** Auf **`SignatureMotif`** standardisieren, `.triangle-mesh` (`globals.css:210`, flaches Liniengitter) ersetzen. Festes **Opacity-Token-Set** (z. B. Band 0,10 / Placeholder 0,06 / Hero-Feature 0,16) statt ad-hoc 0,12/0,14/0,20/0,60.

**E-D6 · Tiefe schaffen.** Warmer **Elevation-Scale** (3 Stufen, Charcoal-Schatten `rgba(42,39,35,…)` statt reinem Schwarz) als Token; Flaggschiff-Karten (portfolio/packages/services) leichte Elevation. Bestehende Schwarz-Schatten (`logo-wall:26, sticky-whatsapp:32, ai-assistant:83/103, cookie-consent:113`) darauf umstellen.

**E-D7 · Feinschliff.** shadcn-Button-Radius (`rounded-md`, `button.tsx:8`) an das ~2px-System angleichen (oder bewusst runde Icon-Buttons). Hero-Choreografie beschleunigen (~3 s → ~1,5 s; `architectural-field.tsx:95`, Delays kürzen).

### P1 — ICONS (aus Backlog-3, hier absorbiert)

**E12 · WhatsApp-Glyph ohne Überschneidung.** Hörer via `fill-rule="evenodd"` **ausstanzen** (kein zweiter Pfad über dem ersten). FAB = weiß auf Grün, Nav = Gold. Test 16/20/24 px. Dateien: `whatsapp-icon.tsx`, `site-nav.tsx` (2×), `sticky-whatsapp.tsx`.

**E13 · Echter Halbmond.** Gefüllte Mondsichel als eigenes SVG (2 versetzte Kreise, `evenodd`), kein Stern/Vollkreis. `site-nav.tsx` Theme-Toggle.

### P2 — FUNKTION / SEO / A11y

**E-F1 · Theme-FOUC beheben.** Blockierendes Inline-Script in `layout.tsx`, das `.dark` **vor dem Paint** aus localStorage setzt (consent-konform). Behebt Hell→Dunkel-Flackern für Dark-Mode-Rückkehrer.

**E-F2 · `<html lang>` locale-abhängig.** `layout.tsx:108` ist fix `"de"`, auch bei TR. `lang` = aktive Locale; + `hreflang`-Alternates DE/TR.

**E-F3 · OG-Image + Twitter-Card + Favicon.** `app/opengraph-image.tsx` (1200×630, creaDIG-Gold/Logo), `metadata.twitter`, `app/icon.svg` + `favicon.ico`. Aktuell fehlt alles → leere Share-Vorschau + Default-Tab-Icon.

**E-F4 · Deploy-Variable.** `NEXT_PUBLIC_SITE_URL` auf die real live Domain; `metadataBase`/Canonical korrekt (`layout.tsx:34`, Default `creadig.de`).

**E-F5 · Lint reparieren.** Keine ESLint-Config → `npm run lint` = exit 1. Entweder `eslint-config-next` einrichten **oder** das Script entfernen, damit CI nicht rot läuft.

**E-F6 · Kontaktformular-DSGVO-Checkbox.** Pflicht-Checkbox „Datenschutz gelesen" vor dem WhatsApp/Mail-Handoff (`contact.tsx`).

**E-F7 · Nav-Reihenfolge = Seitenreihenfolge.** `navLinks` (`site-data.ts:184-191`) listet leistungen→produkte→arbeiten, auf der Seite kommen produkte/arbeiten aber **vor** leistungen. Angleichen, damit „Leistungen" nicht nach unten springt.

### P3 — INHALT / OPTIONAL

**E-C1 · KI-Assistent** hinter Feature-Flag ausblenden (Default), nicht löschen (`ai-assistant.tsx`).
**E-C2 · Social-Slots** entfernen bis echte URLs (`site-footer.tsx:147-158`).
**E-C3 · FAQ-Sektion** aus bestehenden `chat.answer*`-Texten (`dictionary.ts:456-465`) — echte Inhalte, kein Fake.
**E-C4 · „Für wen konkret"/Problem-Sektion** (Handwerk-Nische) — Inhalt Owner-bestätigt, keine erfundenen Fälle.

---

## 5. Acceptance Criteria (global)

- [ ] `npm run build` grün · `tsc --noEmit` grün · (`lint` grün nach E-F5)
- [ ] `grep 2018` im ausgelieferten Code = 0 · E-Mail überall `info@creadig.de`
- [ ] Kein `text-gold` als Fließtext unter AA · Footer-Logo im Dark-Mode sichtbar · kein gelbliches Creme-Panel
- [ ] Type-Scale: **eine** Quelle je H1/H2/H3 · kein Text < 11px · 600-Gewicht als Sub-Head sichtbar
- [ ] WhatsApp-Icon ohne Überschneidung bei 16/20/24 px · Halbmond eindeutig
- [ ] DE/TR-Parität bleibt **300/300** (keine neuen Keys ohne Gegenstück)
- [ ] OG-Bild + Favicon vorhanden · `<html lang>` folgt Locale
- [ ] Visuell verifiziert (Screenshots: Nav, Footer, Hero, Pakete — hell **und** dunkel — + Icons 16/20/24 px)

## 6. Nicht tun

- ❌ Serif einführen / „zurück zur OMURGA-Serif"
- ❌ 5 Sprachen / EN-AR-RU
- ❌ PLANEX als Produkt · erfundene Zahlen/Testimonials/Kunden
- ❌ Gold-CTA-Buttons „entgelben" (nur die blassen `bg-gold/[0.045]`-Panels raus)
- ❌ KI-Assistent oder Social **hart löschen** (nur ausblenden/rückholbar)
- ❌ Diepholz-Adresse · falsches 2018
- ❌ Force-push · Produktion ohne „live"

## 7. Owner liefert (Fakten/Assets — Terminal darf nicht erfinden)

1. **Impressum:** Rechtsform · USt-IdNr (§27a) ODER §19-Bestätigung · §18 Abs. 2 MStV-Verantwortlicher · (optional Telefon/+49)
2. **Badge-Logos** (go-digital, BAFA #190949, iuk, AVPQ, AGD) → `public/badges/`
3. **Produktlogos** meAI + meahv → `public/brand/products/`
4. **ICO-Standortfoto** → `public/images/ico-osnabrueck.jpg`
5. **meahv-Mockup** → `public/works/`
6. **OG-Bild-Motiv** (oder Terminal generiert aus Logo/Gold)
7. **Social-Profil-URLs** (IG/LI/YT) oder „weglassen"
8. Bestätigung: **5 Zertifizierungen aktuell gültig**
9. **Anwalts-Endprüfung** Impressum + Datenschutz

## 8. Reihenfolge & Start

Arbeite **P0 → P1 → P2 → P3**. Ein Commit pro Epic (`fix(E-M1): …`, `feat(E-T1): …`). Nach jedem P-Block: `build` + kurze visuelle Verifikation. Am Ende: Zusammenfassung (erledigt / Owner-offen). **Nicht** nach `main` pushen — Go-Live erst auf „live".

---

*Quelle: 4 unabhängige Code-Audits (Typografie · Design · Funktion · Inhalt) + Cursor-Analyse + Owner-Entscheidungen, 2026-08-17.*
