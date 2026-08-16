# creaDIG — TERMINAL MASTER-PROMPT & BACKLOG
### Ein **Light + Gold** System-Haus aus zwei Quellen · jede CTA funktioniert · Deploy ins bestehende Vercel-Projekt

> **Für:** Claude Code (Terminal), Repo `creaDIG Solutions`.
> **Auftrag in einem Satz:** Ersetze die alte Vanilla-Seite durch **eine neue System-Haus-Seite**, die die **Struktur + Inhalte des V0-Builds** mit dem **Firma-/Paket-/Termin-Gefühl der alten Seite** verschmilzt — **hell, Gold-Akzent, echtes Logo, jede CTA lebt** — und deploye sie ins **bestehende Vercel-Projekt**, sodass `creadig.vercel.app` die neue Seite zeigt. `creadig.de` folgt später (nur DNS, kein Rebuild).

---

## 0 · CEO-Entscheidungen (GESPERRT — keine Debatte, keine Rückfrage)

- **Hell = Default** (`#FBFBF9` Hintergrund, Flächen `#F5F5F4`), Text **warm-anthrazit `#2A2723`** (kein reines Schwarz).
- **Gold-Akzent `#BE904E → #E4C378`.** Schwarz/Dunkel nur als **1–2 schmale Impact-Bänder** (z. B. meAI-Spotlight) — **niemals die ganze Seite dunkel.**
- **Schrift = Poppins** (rund-geometrisch, passt zum Logo). **NICHT Geist, keine Serif.**
- **Echtes Logo** in Nav + Footer (kein Text-Wortmark „creaDIG").
- **Jede CTA funktioniert:** kein `href="#"`, kein 404, keine Fake-Urgency, keine erfundenen Testimonials/Zahlen.
- **Eigene Produkte (nur 4):** **meAI · fibero · CASSAMEA · meahv.**
- **Kundenwerk / Dienstleistung (KEIN eigenes Produkt):** NÛR · Bir Damla Hayır · Rumi's Maison.
- **PLANEX gehört NICHT zu creaDIG → komplett weglassen.**
- **Ziel jetzt:** `creadig.vercel.app` (dasselbe Vercel-Projekt) **überschreiben**. `creadig.de` = später; Code aber **domain-ready** machen.

---

## 1 · Quellen (ZUERST lesen — Pflicht, „erst lesen, dann urteilen")

1. **Repo:** `/Users/muhammedeminakyol/Documents/creaDIG Solutions` (git → github.com/meaicreadig/creadig, Vercel verbunden).
2. **Seele / Haltung:** `KIZILELMA-creaDIG.md` + `OMURGA.md` — Positionierung, Portfolio-Wahrheit, DE+CH, „Wir bauen, was andere nicht sehen". **Die Seite muss diese Haltung tragen, nicht nur hübsch sein.**
3. **V0-Build (Struktur + Inhalt, DESIGN-Basis):** `~/Downloads/crea-dig-3.zip` — Next.js (App Router) + TS + Tailwind v4 + shadcn + framer-motion. Sektionen: Hero, Impact-Band, Logo-Wand, Portfolio, Leistungen, meAI-Spotlight, Prozess, Über uns, Pakete, Kontakt, AI-Chat, sticky WhatsApp, DE/TR-Dictionary.
4. **Alte Live-Seite (Firma-Gefühl + FUNKTIONIERENDE Flows, nur Inhalt/Funktion — NICHT Design):** `index.html`, `termin.html`, `termin.js`, `termin.css`, der WhatsApp-Kontaktform-Handler.
5. **Prompt-DNA (Ton/Look):** `creadig-v0-prompt.md` (v2).

---

## 2 · Echte Marken-Assets — VERWENDEN (keine Platzhalter, wo echt vorhanden)

> Das war der Hauptgrund für „generisch/seelenlos": das echte CI wurde nie benutzt. Jetzt schon.

| Asset | Quelle (auf Platte) | Zielort im Repo |
|---|---|---|
| **Logo GOLD** (verwenden) | `~/Documents/creadiglogo.svg` · `~/Documents/creadiglogo_new.png` | `public/brand/creadig-logo.svg` / `.png` |
| **Produkt-Logo FIBERO** | `~/Downloads/05_Design_Grafik/fibero-logo.svg` | `public/brand/products/fibero.svg` |
| **Produkt-Logo CASSAMEA** | `~/Downloads/05_Design_Grafik/cassamea_logo.ai` (→ nach SVG/PNG exportieren, z. B. `qlmanage`/`sips`) | `public/brand/products/cassamea.svg` |
| **Signatur-Motiv** (Marke!) | Dreiecks-/Pfeil-Mesh aus `~/Downloads/05_Design_Grafik/corporate_creadig.ai` + Flyer | als **dezentes SVG-Hintergrundmuster** nachbauen |

- **Farben:** Gold `#BE904E` / hell `#E4C378` / tief `#8F6A33` · Logo-Anthrazit `#3A3A3A` · Hell `#FBFBF9` / Text `#2A2723`.
- **Signatur-Motiv:** feines Dreiecks-/Pfeil-Raster, **hell + Gold-getönt, sehr leise** (Hero-Hintergrund + Impact-Band). Gibt der Seite **Gewicht + Wiedererkennung** (statt generischem Grid).
- **meAI / meahv:** noch kein echtes Logo → sauberes **Monogramm-Placeholder** (kein kaputtes `<img>`), `TODO`-Kommentar.
- **Schrift:** Poppins via `next/font/google`, weights `["400","500","600","700","800"]`, CSS-Var für Display + Body.

---

## 3 · Merge-Regel (was von wo — CEO, nicht verhandelbar)

| ✅ Vom **V0-Build** übernehmen | ✅ Von der **alten Seite** übernehmen | ❌ Von BEIDEN wegwerfen |
|---|---|---|
| Struktur/Reihenfolge (Hero → Impact → Logo-Wand → Portfolio → Leistungen → meAI → Prozess → Über uns → Pakete → Kontakt) · Light-Default · System-Haus-Inhalte · Logo-Wand · Portfolio-Galerie · DE/TR-Dictionary · sticky WhatsApp · AI-Chat-UI (Mock ok) · große Typo | Pakete-Texte „für wen" (Identity/Growth/Architecture) · **Termin-Wizard** (4 Schritte → WhatsApp) · echte WA-Nr **+41 76 504 58 79** · Form→WhatsApp-Logik · ehrlicher Ton (Beispielszenario/Problem) · OG-Meta-Ideen | Dominant-Dunkel/Schwarz · kaputte `#`-Links · Fake-Testimonials · Fake-Urgency („2 Plätze") · „Ein-Produkt-Landing"-Gefühl (alt) · „schön aber leer/seelenlos" (V0) · Geist-Schrift · generisches Grid |

**Visuell final:** Light `#FBFBF9`/`#F5F5F4` + warm-anthrazit Text + **Gold-Akzent** (Buttons, Linien, Schlüsselwörter, Logo-Emblem) + Poppins + Dreiecks-Motiv. Dark-Toggle optional; Default hell.

---

## 4 · BACKLOG (Epics → Schritte, in Reihenfolge)

### E0 · Setup
- [ ] Branch `feat/system-haus-site` (main nicht direkt überschreiben).
- [ ] Vanilla-Bestand nach `_legacy/` verschieben & behalten: `index.html`, `termin.*`, `app-lang.js`, `creadig-*.js/css`, ggf. `assets/`.
- [ ] `crea-dig-3.zip` als Next-App an den Repo-Root bringen (`package.json`, `app/`, `components/`, `lib/`, `public/`, configs).
- [ ] `npm i` (oder pnpm) → `npm run build` **grün**. (Falls `sharp`/pnpm-Build-Check blockt: in `next.config` `images:{unoptimized:true}` bzw. Build-Approve.)

### E1 · Marke / CI anwenden (das „Seele"-Update)
- [ ] Assets aus §2 nach `public/brand/**` kopieren; CASSAMEA-`.ai` → SVG/PNG exportieren.
- [ ] `globals.css` Tokens auf **Gold-Palette** setzen (Hintergrund `#FBFBF9`, Text `#2A2723`, `--primary` = Gold, dunkle Bänder = warmes Anthrazit `#201E1B`, **kein `#0a0a0b`**).
- [ ] `layout.tsx`: Geist → **Poppins**; `--font-*` verdrahten.
- [ ] `site-nav.tsx` + Footer: Text-Wortmark → **echtes Logo** (`/brand/creadig-logo.svg`, `h-7`/`h-8`).
- [ ] Primär-Buttons (MagneticButton/Nav-CTA) auf **Gold** (Hover → Anthrazit-Invertierung).
- [ ] Dreiecks-Signatur-Motiv als dezenter SVG-Hintergrund in Hero + Impact.

### E2 · Struktur / Inhalt verschmelzen
- [ ] `lib/site-data.ts`: **eigene Produkte = meAI · fibero · CASSAMEA · meahv**; NÛR/Bir Damla Hayır/Rumi's Maison in **separate Liste „Kundenwerk"**; **PLANEX entfernen**.
- [ ] Portfolio: eigene Produkte als große Cases + „Kundenwerk"-Reihe getrennt.
- [ ] Logo-Wand: Produktlogos (echt/Monogramm) + Partner-Logos mit `approved:false` → neutrale Beschriftung, **keine Behauptung „unser Kunde"** ohne Freigabe.
- [ ] Pakete-Sektion: „für wen"-Zeilen aus der alten Seite übernehmen.
- [ ] Ehrlicher Ton (keine erfundenen Zahlen/Zitate).

### E3 · Funktionierende Systeme (Pflicht — kein „totes" Gefühl)
- [ ] **WhatsApp:** sticky + Kontakt-Deeplink `https://wa.me/41765045879`.
- [ ] **Termin:** alten `termin.html`-Flow als Next-Route `/termin` nachbauen (gleiche 4-Schritt-UX → WhatsApp-Versand).
- [ ] **Kontaktformular:** Validierung + WhatsApp-Nachricht (alte `ct_*`-Logik).
- [ ] **Impressum + Datenschutz:** echte Routen `/impressum`, `/datenschutz` + Footer-Links (Platzhaltertext „Firmendaten folgen" ok — aber **kein `#`, kein 404**).
- [ ] **AI-Chat:** UI + Mock-Antworten + `// TODO: API`; blockiert die Seite nicht.
- [ ] Alle Nav-CTAs (Pakete/Arbeiten/Kontakt/Termin) scrollen/routen wirklich.

### E4 · i18n
- [ ] DE primär, TR-Dictionary vollständig (Toggle funktioniert).

### E5 · Deploy → `creadig.vercel.app` überschreiben + domain-ready
- [ ] Dasselbe Vercel-Projekt (bestehendes `.vercel`/Repo). Framework **Next.js** (nicht mehr statisch).
- [ ] `git push` + Production-Deploy. Verifizieren: `https://creadig.vercel.app` = **neue Light-System-Haus-Seite** (keine dunkle Vanilla-Landing mehr).
- [ ] `metadataBase` / canonical über `NEXT_PUBLIC_SITE_URL` (Default `https://creadig.de`) — **domain-ready, aber KEINE DNS-Änderung** (macht der Owner später im Registrar).
- [ ] Redirects: `/termin.html` → `/termin`.

### E6 · Aufräumen
- [ ] Legacy in `_legacy/` archiviert.
- [ ] Kurze `README`: local run · deploy · „creadig.de anbinden"-Schritte.

---

## 5 · Acceptance Criteria (am Ende prüfen)
- [ ] `npm run build` erfolgreich.
- [ ] `creadig.vercel.app` zeigt die **helle** System-Haus-Seite (Gold-Akzent, echtes Logo, Poppins) — **keine** dunkle Vanilla-Landing.
- [ ] Sektionen sichtbar: Hero (Dreiecks-Motiv), Impact, **Logo-Wand**, **Portfolio** (4 Produkte + Kundenwerk getrennt), Leistungen, meAI, Pakete, Kontakt.
- [ ] **Schwarz nur** in 1–2 schmalen Bändern, sonst hell.
- [ ] WhatsApp + `/termin` + Kontaktform funktionieren; Impressum/Datenschutz ≠ 404.
- [ ] Kein `#`-Link, keine Fake-Testimonials, keine Fake-Urgency, kein PLANEX.
- [ ] Legacy in `_legacy/`; README vorhanden.

## 6 · NICHT tun
- ❌ Farb-Debatte (Blau vs Gold) — **Gold-Akzent + Light ist gesperrt.**
- ❌ Endlose Hero-Redesigns / Partikel-Experimente.
- ❌ Erfundene Kundenzitate / Metriken · Selsebil-Inhalte · PLANEX.
- ❌ Force-push auf `main` ohne PR/klaren Commit.
- ❌ Geist-Schrift, reines Schwarz als Grundfläche, generisches Grid.

## 7 · Start
1. Repo-Status + `crea-dig-3.zip` prüfen, `KIZILELMA-creaDIG.md` + `OMURGA.md` lesen.
2. Plan in 5 Bullets zurückspiegeln.
3. E0 → E6 abarbeiten, pro Epic committen.
4. Am Ende: local-URL + Deploy-URL + „was portiert / was TODO" zusammenfassen.

**Commit-Vorlage:** `feat: replace vanilla landing with Light System-Haus Next site (V0+legacy merge, working contact/termin, real CI)`
