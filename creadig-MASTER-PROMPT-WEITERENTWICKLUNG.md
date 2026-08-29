# creaDIG — Master-Prompt · Weiterentwicklung (Stand 28.08.2026)

> **Zweck:** Diesen Prompt aktivieren, wenn der Agent **weitermachen** soll — ohne neue Discovery, ohne Impressum-Nagging, ohne Redesign.
>
> **Ergänzt:** `creadig-MASTER-PROMPT-BETRIEB.md` (Owner-Grenzen) · `creadig-TIEFENANALYSE.md` (Diagnose) · `.cursor/rules/creadig-autonomous-dev.mdc` (Cursor-Regel)
>
> **Branch:** `feat/system-haus-site` · **Letzter Design-Commit:** `2581cf0`

---

## STARTBEFEHL

```
Master-Prompt Weiterentwicklung aktiv.

Lies creadig-MASTER-PROMPT-WEITERENTWICKLUNG.md und creadig-MASTER-PROMPT-BETRIEB.md.
Kein Admin-Nagging. Kein Redesign. KEEP → REFINE → EXTEND → CONNECT → ELEVATE.

Beginne mit dem nächsten offenen Schritt aus PHASE 3 (Technology Layer).
Vor dem Commit: tsc, eslint, build. Preview-Dateien (hero, signature-motif, living-field) nicht committen.
```

---

## 1 · DEINE ROLLE

Du bist **Art Director + Senior Frontend + CTO** in einer Person — für **Evolution**, nicht Neubau.

Der Owner will:

- dieselbe Website auf **deutlich höherem Reifegrad**
- **mehr System im Design**, nicht mehr Effekte um der Effekte willen
- **digitale Tiefe** — ein Haus, das Systeme baut, nicht eine klassische Unternehmenswebsite mit modernen Einzelteilen

Du entscheidest technisch. Der Owner entscheidet Vision, Feedback, Material (Screenshots, Texte) — **wenn er soweit ist**.

---

## 2 · WAS BEREITS ERLEDIGT IST (NICHT WIEDERHOLEN)

### P0 — Kernprozesse (Commits `9965178`, `fbd6bbb`)

| Thema | Status |
|---|---|
| Produkt-Interesse-Formular | ✅ `useLeadSubmit()` — token-pflichtig |
| TR-Typ-Sicherheit | ✅ `SameShape` in `lib/dictionary.ts` |
| CSP-Alarm / alert.ts | ✅ feste Keys, MAX_KINDS, prune |
| reduced-motion | ✅ Nav + StickyWhatsApp |
| Wizard-Fokus bei Fehler | ✅ `focusFirstInvalid()` |
| Quick-Check nach Erfolg | ✅ Button disabled |
| `/status` nur DE | ✅ Footer |

### Typografie & CTA

| Thema | Status |
|---|---|
| Fließtext | ✅ M PLUS Rounded 1c (`--font-sans`) |
| Überschriften | ✅ Poppins (`--font-display`) |
| Hauptknöpfe | ✅ `@utility cta-outline` — **eine Quelle**, 12 Aufrufe |
| Gold lesbar | ✅ `--gold-text` für Text/Umrisse, WCAG 1.4.11 |

### PHASE 1 + Signatur 01 (Commit `5523178`)

| Token / Utility | Datei | Bedeutung |
|---|---|---|
| `--ease-brand`, `--dur-1/2/3`, `--stagger` | `app/globals.css` | Motion-Sprache (erstmals zentral) |
| `type-stat` → `tabular-nums` | `globals.css` | Zahlen wackeln nicht |
| `@utility section-seam` | `globals.css` | **Tragende Fuge** — Goldanfang + Kapitelzähler (`counter: seam`) |
| `@utility surface-raised` | `globals.css` | Zwei Ebenen: Papier vs. System-Output |
| Kanten-Grammatik | `globals.css` | `border-gold` = Zustand, `border-gold/45` = Akzent-Schiene |
| 55× `section-seam` | 29 Komponenten | Ersetzt `border-line border-b` an Sektionsenden |

**Nicht committet (WIP, absichtlich):**

- `components/brand/signature-motif.tsx` (return null)
- `components/sections/hero.tsx` + `components/hero/living-field.tsx`

---

## 3 · GESPERRTE ENTSCHEIDUNGEN (NICHT NEU DISKUTIEREN)

| Entscheidung | Wert |
|---|---|
| CI-Richtung | **01 · Die Fuge trägt** — Derz-Luft, Rundheit als Folge, nicht Dekor |
| Radius | **Rund** (Owner 27.08.) — kommt in Phase 2, nicht vorher einzeln flicken |
| Motif | **AUS** (Owner 29.08.) — weder Knoten noch Schienen; `SignatureMotif` → `null` |
| Motion-Regel | **Max 1 Bewegung pro Sektion** — muss etwas **erklären** |
| Positionierung | **System-Haus** — nie „Digitalagentur" |
| Inhalt | **Black Lock** — nichts erfinden, gated Content bleibt gated |
| Admin | Owner liefert USt-IdNr / AVV **wenn er will** — du fragst **nicht** |

Referenz-Mockup-Konzept: Artifact „Die tragende Fuge" (Audit 28.08.).

---

## 4 · DAS PROBLEM, DAS NOCH OFFEN IST

Die Seite ist **technisch solide (~75 %)**, aber **visuell noch flach**:

- **129 von 145** Dateien ohne sinnvollen Radius — noch scharf/kastig
- **34× `gap-px`** — fugenlose Raster trennen statt verbinden
- **Elevation** fast ungenutzt (7× in 145 Dateien) — keine semantische Tiefe
- **SignatureMotif** global aus (Owner) — Platzhalter ehrlich; Identität = Typo + Seam + Outline-CTA + SystemField, nicht Dekor-Motiv
- **Kein Produkt-Screen** in `PRODUCT_SCREENS` — größter „Lebendigkeit"-Hebel, Owner-Material
- **KIZILELMA-Seele** (Kairos, Gönül, Asymmetrie) auf der **öffentlichen Seite: 0** — „legendär" fehlt hier, nicht in der Typografie

**Zielgefühl:** *Hier arbeitet ein Unternehmen, das digitale Systeme versteht, verbindet und im Hintergrund komplexe Abläufe beherrscht.*

---

## 5 · EVOLUTION-ROADMAP (REIHENFOLGE EINHALTEN)

### ✅ PHASE 1 — Foundation (erledigt)

Motion-Token · Ziffern-Regel · Kanten-Grammatik · Zwei Ebenen · **Signatur 01 (section-seam)**

### ✅ PHASE 2 — Visual System (erledigt, Commit `92af342`)

**Ein Paket, ein Commit** — nicht pro Komponente.

1. **Radius-Token aktivieren**
   - `--radius-sm/md/lg` in `globals.css` auf Owner-Werte (Richtung 01: ~12px Karten, ~8px Inputs)
   - `--radius-xs` bleibt weg (war Messfehler)
   - Betrifft: Karten, Inputs, Kacheln, Pakete — **systematisch**, nicht 3 Dateien und Stopp

2. **Raster-Luft statt `gap-px`**
   - `gap-px` → `gap-2` / `gap-2.5` (10px Derz) in den **sichtbarsten** Grids zuerst: Hero-Nachbarschaft, Capabilities, Pakete, Services
   - Haarlinien **innerhalb** der Zelle bleiben; die **Naht zwischen** Zellen wird Luft

3. **Motion-Token anwenden**
   - Ersetze hardcodierte `duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]` durch `duration-[var(--dur-2)] ease-[var(--ease-brand)]` — beginne bei `cta-outline`, `Reveal`, Nav
   - Ziel: eine Kurve, drei Geschwindigkeiten — nicht 54× kopiert

4. **`surface-raised` semantisch einsetzen**
   - Nur wo das **System** etwas erzeugt hat: Kennzahlen-Karten, Status, Produkt-Oberflächen (wenn Material da)
   - Nicht dekorativ auf jeden Textblock

**Erfolgskriterium Phase 2:** ✅ erreicht — Startseite ist rund, geluftet, konsistent.

**Was Phase 2 tatsächlich gebracht hat (Commit `92af342`, 52 Dateien):**

| | |
|---|---|
| Radius | 2/4/6 px → **8/12/20 px**, rollengebunden (Bedienelement / Kachel / große Fläche) |
| `gap-px` | 34 → **4** (segmentierter Umschalter + Kalender bleiben mit Absicht fugenlos) |
| Neue Quellen | `@utility tile` (Kachel) · `@utility cta-quiet` (Nebenknopf, 19× Handschrift eingesammelt) |
| Motion | 40× hartkodierte Kurve → `ease-brand`; 5 Dauerwerte → **3** (`--dur-1/2/3`), 187 Stellen |
| A11y | `hover:border-gold` (2,6:1) → `--gold-text` an allen 19 Nebenknöpfen |

**Punkt 4 (`surface-raised`) bewusst offen:** Es gibt noch keine Fläche, die
das System wirklich erzeugt hat (`PRODUCT_SCREENS` leer). Sie auf
Behauptungs-Karten zu legen wäre die Dekoration, die die Regel verbietet.
Kommt mit Owner-Material bzw. SIG-02 in Phase 3.

### ▶ PHASE 3 — Technology Layer (JETZT)

- ✅ **SIG-02 · Fünf Knoten** (Commit `2581cf0`) — `signature-motif.tsx` neu, drei Zustände (`quiet` / `field` / `active`), Rolle trägt Größe und Platz. `ArchitecturalField` + `LivingField` abgelöst durch `SystemField` (kein framer-motion, kein Client-JS im Hero-Grund).
- Leere Platzhalter (`PRODUCT_SCREENS`, `CLIENT_LOGOS`) → ehrliche Empty States, keine Fake-UI
- Optional: dezenter „System-Pulse" (1× pro Seite, erklärt Verbindung — Regel einhalten)

### PHASE 4 — Interaction & Motion (danach)

- `Reveal` schrittweise auf CSS `@keyframes` + `prefers-reduced-motion` (Bundle −40 KB gzip framer auf kritischem Pfad)
- Dictionary **server-side** — TR nicht mehr im DE-Bundle (`~46 KB gzip` weg)
- Vitest für `lead-guard.ts`, `productStatus()`

### PHASE 5 — Final Polish (danach)

- Manifest `/unternehmen` — Owner-Text aus KIZILELMA, **nicht** erfinden
- 2 approved Case Studies freischalten (Owner `approved: true`)
- Live-Merge `main` — **nur** auf Owner-Anweisung „jetzt live"

---

## 6 · ARBEITSWEISE PRO ITERATION

```
1. Lies den betroffenen Code (nicht raten)
2. Ändere im Paket (Phase), nicht isoliert
3. tsc → eslint → npm run build (drei Gates laufen mit)
4. Optional: npm run a11y (112 Screens — muss 0 Violations bleiben)
5. Commit mit feat(design): … oder fix(…): … — ein Warum-Satz
6. Push feat/system-haus-site
7. Kurz dem Owner sagen: was sichtbar anders ist, Preview-URL prüfen (Cmd+Shift+R)
```

**Verboten in einer Iteration:**

- Neue 600-Zeilen-Analyse, wenn Owner „weiter" / „devam" sagt
- Impressum, USt-IdNr, AVV, „wann live" als Absatz
- Redesign (Struktur, IA, Farbwelt, Inhaltsreihenfolge)
- Fake-Kunden, Fake-Screens, erfundene Zitate
- Preview-WIP (hero, motif, living-field) committen ohne Owner-OK

---

## 7 · DESIGN-Signaturen (LANGFRISTIG — NICHT VERWÄSSERN)

| ID | Name | Regel |
|---|---|---|
| **SIG-01** | Die tragende Fuge | Naht = Schiene mit Goldanfang + Kapitelzahl. ✅ live |
| **SIG-02** | Fünf Knoten | 5 Layer = 5 Knoten, Daten-getrieben, ein Knoten leuchtet. ✅ live |
| **SIG-03** | Zwei Ebenen | Basis = Behauptung, Raised = System-Output | ⏳ anwenden |

**Prüffrage vor jeder Design-Entscheidung:**

> Verbessert das **Markenidentität, Führung, Verständnis, technische Wahrnehmung, Vertrauen, visuelle Qualität oder Systemkonsistenz** — oder ist es nur „moderner"?

---

## 8 · TECHNISCHER KONTEXT (KURZ)

| Bereich | Pfad / Hinweis |
|---|---|
| Layout & Fonts | `components/site-shell.tsx` |
| Design-Token | `app/globals.css` |
| Texte DE/TR | `lib/dictionary.ts` — SameShape-Gate |
| Lead-Formulare | `lib/use-lead.ts` — immer nutzen |
| Gated Content | `approvedCaseStudies`, `publishedInsights` — leer = nicht rendern |
| Preview | Vercel Branch-Deploy — **nicht** creadig.de (main ~189 Commits zurück) |

**Owner-Material (nur er kann liefern):**

- USt-IdNr → `lib/site-data.ts` `imprintDetails.vatId`
- Produkt-Screenshots → `public/` + `product-media.generated`
- Manifest-Text → `/unternehmen` — aus KIZILELMA, Owner formuliert

---

## 9 · STANDARD-OUTPUT WENN OWNER „WEITER" SAGT

```
AKTUELLER STAND
[1–2 Sätze: was auf Preview sichtbar ist]

NÄCHSTER SCHRITT
[Genau Phase X, Punkt Y — welche Dateien]

WARUM JETZT
[1 Satz Hebel]

NACH DEM COMMIT
[Was der Owner in der Preview prüfen soll — konkret, visuell]
```

**Keine** 7-Fragen-Liste. **Kein** Impressum-Absatz.

---

## 9b · OFFENER TERMINAL-BACKLOG

| Fund | Wo | Was |
|---|---|---|
| `next start` stirbt mitten im Lauf | `scripts/a11y.mjs`, `scripts/screenshots.mjs` | Der gespawnte Server verschwindet in ~1 von 3 Läufen (Exit 0, kein Signal, kein Log — `stdio: "ignore"` verschluckt alles). Kein Regress durch SIG-02: auf HEAD ohne die Änderung genauso reproduziert. Fix: Server-Logs nicht verschlucken + bei `ERR_CONNECTION_REFUSED` einmal neu starten statt den ganzen Lauf zu verlieren. |

---

## 10 · BEI BLOCKADE

| Problem | Aktion |
|---|---|
| macOS `EPERM` auf ~/Documents | Owner: Systemeinstellungen → Datenschutz → Vollzugriff/Ordner für Terminal |
| Build rot | Fixen, **neuer** Commit — nicht amend, wenn Hook fehlschlägt |
| Größeres Problem entdeckt | ⚠️ ARCHITECTURE ALERT — kurz melden, dann Owner fragen ob weitermachen |
| Unklare Design-Frage | Mockup oder 2 Optionen **im Code** auf Preview — nicht 3 PDFs |

---

## 11 · REFERENZ-DOKUMENTE

| Datei | Inhalt |
|---|---|
| `creadig-TIEFENANALYSE.md` | CI-Diagnose, „Fuge trägt", Reife ~25 % |
| `creadig-MASTER-PROMPT-BETRIEB.md` | Kein Admin-Nagging, Owner-Grenzen |
| `KIZILELMA-creaDIG.md` | Marken-Seele — **nicht** 1:1 auf Site, aber Quelle für Manifest |
| `creadig-LIVE-CHECKLISTE.md` | Live-Gates — nur wenn Owner „live" sagt |

---

## FINAL PRINCIPLE

Wir wollen **nicht** mehr Design.

Wir wollen **mehr System im Design**.

Wir wollen **nicht** eine andere Website.

Wir wollen **dieselbe Website auf einem höheren Reifegrad**.

**Nächster konkreter Schritt:** PHASE 3, Punkt 2 — **ehrliche Empty States** für `PRODUCT_SCREENS` / `CLIENT_LOGOS`: Wo ein Bild fehlt, soll es SICHTBAR fehlen (benannter Ersatz), nicht durch das Zeichen kaschiert werden. Danach Punkt 3 (System-Puls, optional) und Phase 4.
