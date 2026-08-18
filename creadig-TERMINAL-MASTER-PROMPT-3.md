# creaDIG — TERMINAL MASTER-PROMPT 3 · Block-Ausbau + Englisch + Feinschliff

**Datum:** 2026-08-17 · **Branch:** `feat/system-haus-site` · Fortsetzung nach 18 Commits (Design E-D, Icons, P2, Conversion E-K1–K8).

**Ausgangslage:** `build` + `tsc` + `lint` grün, DE/TR-Parität 415/415, `grep 2018` = 0. Case-Studies & Reviews sind gebaut, aber **gegatet & leer** (warten auf echte Inhalte). Dieser Prompt ist der **nächste große Lauf**: Info-Architektur-Blöcke aus der Wettbewerbs-Analyse — **in creaDIG-Sprache**, kein Stil-Import — plus Englisch, Märkte, AI-FAB-Fix und die offene Dunkelmodus-Verifikation.

**Start:** Lies DIESE Datei + `creadig-TERMINAL-MASTER-PROMPT-2.md` + `creadig-TERMINAL-BACKLOG-4.md` (EN/Märkte-Detail) + `creadig-TERMINAL-MASTER.md` (Design-DNA). Arbeite in der Reihenfolge §7, ein Commit pro Epic/Block, nach jedem Block `build` + Screenshots hell **und** dunkel. **Nicht** nach `main` pushen.

> ⚠️ **Voraussetzung:** Beim letzten Lauf hat macOS dem Terminal den Zugriff auf `~/Documents` entzogen. Vor Start: Systemeinstellungen → Datenschutz & Sicherheit → **Festplattenvollzugriff** fürs Terminal wieder erlauben, sonst kann git das Arbeitsverzeichnis nicht lesen.

---

## 1. creaDIG Stil-DNA (UNVERÄNDERLICH — Stil-Diskussion ist geschlossen)

Wettbewerber (coresection.ch) = **Struktur-/Info-Architektur-Referenz**. creaDIG = **eigene Stil-Sprache.** Nur „welche Blöcke" wird übernommen; Farbe, Font, Radius, CTA-Sprache, Motiv kommen **immer** aus unserem System:

| Token | Regel |
|---|---|
| Zemin | `#FBFBF9` · surface `#F5F5F4` · Text `#2A2723` |
| Akzent | Gold `#BE904E` (Flächen/Hairlines/Embleme) · **Text**: `--gold-text` (AA-konform) |
| Font | Poppins (Display + Body) · JetBrains Mono = eyebrow |
| Motiv | **ein** Motiv (SignatureMotif) · Gold-Hairline · drei benannte Opacity-Stufen |
| Sektion | eyebrow + 10px Gold-Linie + `type-h2` + `type-lead` |
| CTA | Gold-Gradient, hover **dunkelt** — **kein schwarzer Fill** |
| Band | `.section-dark` = warmes Creme `#F3F1EC` (hell) / echter dunkler Satz im `.dark` |

## 2. Gesperrte Entscheidungen
- Light + Gold · Poppins (**kein Serif**) · **DE / TR / EN** (EN neu) · Produkte nur **meAI/fibero/CASSAMEA/meahv** · Sitz **ICO Osnabrück** · Gründung **2017** · nur **echte** Nachweise, **keine** aufgeblasenen Zahlen · nichts auf `main` bis „live".

---

## 3. P-AI · AI-Assistent-FAB: Gold statt Schwarz
**Owner-Entscheidung:** Der FAB bleibt (Demo-Assistent nutzbar), aber **nicht mehr charcoal.**
- `components/ai-assistant.tsx:83`: `bg-foreground text-background` → **creaDIG-CTA-Stil**: Gold-Gradient (`from-gold-soft to-gold`), Text `#201e1b`, Hover dunkelt wie die anderen CTAs. `rounded-none` bleibt (Haus-Radius).
- Demo-Kennzeichnung bleibt. **Kein schwarzer Fill mehr** irgendwo unten (Sticky-WhatsApp bleibt grün, das ist Marken-Kanal).
- Test: FAB in hell + dunkel, offen + geschlossen.

## 4. P-B · Block-Adaption (Kern-Blöcke + Feinschliff)

### Vier neue Blöcke (Struktur vom Wettbewerber, Stil 100 % creaDIG)
- **B1 · Closing-CTA-Band** (neu, direkt vor dem Footer): schmales Band, `type-h3` + Gold-CTA + Ghost-Link „Arbeiten ansehen". `.section-dark` + Motiv-Opacity ~0,10. Schließt die Seite ab (aktuell endet sie abrupt mit Contact).
- **B2 · Referenzregister** (Portfolio, **Listen-Modus zusätzlich** zum Karten-Grid): links `01–10` Mono-Nummer, Mitte Name + Branche, rechts Jahr + Region; Hover = Gold-Top-Line. **Nur echte Projekte** (approved). Karten-Grid bleibt, die Liste ist die dichte Register-Ansicht.
- **B3 · Produkt-Triple „Unter dem Dach"** (Übersicht bei/über meAI-Spotlight): die eigenen Produkte als gleichwertige Hairline-Karten — **meAI · fibero · CASSAMEA · meahv** (alle vier; meahv als Karte ok, auch ohne Mockup). Das meAI-Band bleibt als Flaggschiff-Deep-Dive darunter.
- **B4 · 4-Ops-Schritte** (unter Process): die 3 Philosophie-Schritte bleiben; darunter ein **zweiter** Hairline-Grid mit 4 operativen Schritten — **Anfrage · Analyse · Angebot · Betrieb** — eigenes eyebrow, gleiche Hairline-Sprache.

### Feinschliff bestehender Blöcke (straffen, keine neuen Größen — Type-Scale steht)
- **Hero**, **ImpactBand**, **Packages**, **FAQ**, **Contact**: Padding/Rhythmus/Wiederholungen vereinheitlichen, Abstände auf das Sektions-Raster ziehen.
- **Services**: 3–4 **„Einstieg"-Chips** ergänzen (z. B. Webdesign · Identity · go-digital) als Hairline-Pills mit Gold-Hover, über der 5-Ebenen-Pyramide.

## 5. P-I · Englisch (EN) als 3. Sprache  *(Detail: Backlog-4 E-I1)*
Vollständiger EN-Zweig in `lib/dictionary.ts` (Parität **3×**, Typisierung `{de,tr,en}` erzwingt Vollständigkeit); `locale-provider` `"de"|"tr"|"en"`, **Default `de`**; Umschalter **DE/TR/EN**; `<html lang>` + `hreflang` für alle drei. **Impressum/Datenschutz bleiben maßgeblich DE** — EN nur als gekennzeichnete, nicht-rechtsverbindliche Übersetzung oder DE belassen.

## 6. P-M · Positionierung DE → CH → Europa  *(Detail: Backlog-4 E-M2)*
Regionstext „Deutschland & Schweiz" → **3-Stufen-Priorität DE → CH → Europa**, in allen 3 Sprachen; Sprachhinweis „auf Deutsch, Türkisch & Englisch". Sitz bleibt Osnabrück. Nische: Handwerk/TR-DE-KMU **europaweit**.

## 6b. P-V · Dunkelmodus-Verifikation (offene Lücke)
Der letzte Dunkelmodus-Durchgang fehlt (Sandbox brach ab). Prüfe in **beiden** Modi: FAQ, die **5 Leistungsseiten**, **Pakete-Tiers** — plus die neuen Blöcke **B1–B4**. Screenshots hell/dunkel paaren.

---

## 7. Reihenfolge & Start
**P-AI** (schnell) → **P-B** (B1→B4, dann Feinschliff) → **P-I** (EN) → **P-M** (Märkte) → **P-V** (Verifikation). Ein Commit pro Epic/Block. `build` + `tsc` + `lint` grün halten, Parität jetzt **3×**. Nach jedem Block Screenshots hell/dunkel. **Nicht** nach `main` pushen.

## 8. Nicht tun
- ❌ Wettbewerber-**Stil** kopieren (nur Struktur) · Serif · 5 Sprachen
- ❌ Fake-Zähler (+1500/200+/15+) · unfreigegebene Reviews/Case-Studies/Logos
- ❌ Ads-/Marketing-Preis-Tabs · `lokales-seo`-Slug · E-K9 (keine Lieferfähigkeit)
- ❌ CustomerCore-Klon (wir haben eigene Produkte)
- ❌ **Schwarzer Fill** an CTAs/Buttons · Force-push · Produktion ohne „live"

## 9. Owner liefert (Content — der eigentliche Engpass, läuft parallel)
Google-Reviews → `reviews` · Social-URLs → `socialProfiles` · Retainer-Preis+Umfang → `retainer` · Impressum-Werte (Rechtsform · USt/§19 · §18 MStV) · Badge-Logos · Case-Study-Freigaben. **Die Maschine ist gebaut und leer — sobald du lieferst, füllt sie sich ohne Code-Änderung.**

---
*Quelle: 4 Code-Audits + 2 Wettbewerbs-/Block-Analysen (coresection.ch) + Typo-/Design-Abnahmen + Owner-Entscheidungen (AI-FAB Gold, Kern-Blöcke), 2026-08-17.*
