# Legacy Production · Current State

> **Authority:** Current State · PHASE A.1 · Stand 30.08.2026  
> **Methode:** Git + HTTP-Header + HTML-Stichprobe. Keine Domain-Änderung.  
> **Kein Canon.**

---

## 1 · Wo läuft Legacy wirklich?

| Frage | Befund | Status |
|-------|--------|--------|
| Domain | `https://creadig.de/` → **HTTP 200** | VERIFIED |
| HTML | Title: `creaDIG — Digitalagentur & Business Architecture \| DACH` · `Digitalagentur` ja · `System-Haus` nein · **kein** `/_next` · `app-lang` ja | VERIFIED |
| Host | `server: Vercel` · `x-vercel-id: fra1::…` | VERIFIED |
| `www.creadig.de` | **HTTP 308** → `https://creadig.de/` · `server: cloudflare` · `cf-ray: …-LHR` · `x-vercel-id: lhr1` | VERIFIED 30.08.2026 |
| Proxy Detected | **erklärt** — siehe unten | VERIFIED 30.08.2026 |
| `creadig.vercel.app` | HTTP 200, **gleiche** `etag` / `last-modified` wie `creadig.de` (26.08.2026) | VERIFIED |
| `/admin` auf Production | **404** `x-vercel-error: NOT_FOUND` (statisches Vercel, nicht Next-Middleware) | VERIFIED |

**Schluss:** `creadig.de` zeigt auf den **Vanilla-Legacy-Stand**, nicht auf `feat/system-haus-site`.

### Warum „Proxy Detected" — die Asymmetrie zwischen Apex und www

Die beiden Namen laufen **verschiedene Wege**:

| | Apex `creadig.de` | `www.creadig.de` |
|--|--|--|
| `server` | **Vercel** | **cloudflare** |
| `cf-ray` | — | vorhanden (`…-LHR`) |
| Weg | direkt zu Vercel | **durch Cloudflare**, dann Vercel (`x-vercel-id: lhr1`) |

Genau das meldet Vercel als **Proxy Detected**: Der DNS-Eintrag für `www`
zeigt nicht direkt auf Vercel, sondern auf einen fremden Proxy. Die frühere
Meldung war also **kein Messfehler und kein veralteter Screenshot** — sie
beschreibt einen Zustand, der heute noch besteht.

**Warum das vor dem Cutover zählt:** Cloudflare hält einen eigenen Cache und
ein eigenes SSL-Verhalten. Wenn `creadig.de` auf die neue Seite umgestellt
wird, folgt `www` nicht automatisch mit derselben Geschwindigkeit — und im
schlechtesten Fall liefert der Proxy alte Inhalte weiter, während der Apex
schon neu ist. Zwei Wahrheiten unter einem Markennamen sind schlimmer als
eine alte. Gehört als eigener Punkt in die Cutover-Checkliste (Phase F).

---

## 2 · Git

| | |
|--|--|
| Remote | `https://github.com/meaicreadig/creadig.git` |
| **Legacy / Production-Code** | Branch **`main`** · Commit **`ae76ba626a3eb6c5e0d6616ee4380244ada4de9e`** · 16.08.2026 · Message: `docs: V0 Master-Prompt v0.2.0 — …` |
| Inhalt | `index.html` · `app-lang.js` · `termin.html` · `assets/` · kein App Router |

**Vercel Project (jetzt über die Vercel-API bestätigt, nicht nur aus der lokalen Link-Datei):**
Project `creadig` · `prj_EXWR97PCtGzzE7R7FlHxpn7CKjkP` · Team
`team_FqD4awCyGrguY68scIPaxKJx` (Plan hobby). Ein einziges Projekt zeigt auf
`meaicreadig/creadig` — es gibt **kein** zweites creaDIG-Projekt.

**Production-Deployment (VERIFIED 30.08.2026 — war zuvor OWNER ACTION):**

| | |
|--|--|
| Deployment | `dpl_7XsgY2peDVzXY76foS2VNTrs8Avx` |
| URL | `creadig-2mig6uudn-muhammed-emin-akyols-projects.vercel.app` |
| `target` | **production** |
| Branch | `main` |
| Commit | `ae76ba626a3eb6c5e0d6616ee4380244ada4de9e` |
| Region | `iad1` |
| Alias | `creadig.vercel.app` · `creadig-muhammed-emin-akyols-projects.vercel.app` · `creadig-git-main-…` |

**Das ist der Rollback-Punkt.** Er hat jetzt eine ID und muss nicht am
Cutover-Tag gesucht werden.

**Zwei Befunde, die vor dem Cutover geklärt gehören:**

**1 · `creadig.de` steht in keiner Alias-Liste, die die API zeigt.**
Weder in `project.domains` (nur die drei `vercel.app`-Namen) noch im
`alias`-Feld des Production-Deployments. Die Domain antwortet aber mit
`server: Vercel` · `x-vercel-id: fra1`. Wahrscheinlichste Erklärung: die
API-Sicht ist unvollständig. **Nicht bewiesen, also nicht behauptet** —
ein Blick auf *Project → Domains* im Dashboard klärt es in zehn Sekunden,
und die Antwort entscheidet, ob der Cutover ein Alias-Wechsel ist oder ein
Domain-Umzug zwischen Projekten.

**2 · Die letzten 40 Deployments sind ausnahmslos `target: null` (Preview).**
`project.live = false`. Auf `main` wurde seit dem 16.08.2026 nichts mehr
deployt — die gesamte Arbeit der letzten zwei Wochen liegt auf
`feat/system-haus-site` und hat **nie** Production berührt. Das ist der
Grund, warum `creadig.de` unverändert Legacy zeigt. Kein Fehler, aber der
Beleg dafür, dass der Cutover ein bewusster Schritt sein wird und nicht
versehentlich passieren kann.

---

## 3 · Sprachen (Legacy)

`origin/main:app-lang.js`:

```
VALID = ['de', 'en', 'tr', 'ar', 'ru']
```

Mechanismus: **`localStorage`** (`creadig_lang`) — **nicht** URL-Locale. AR setzt `dir: rtl` im Legacy-Switcher.

Klassifikation (R4):

| Lang | Live-Canon neu | Legacy |
|------|----------------|--------|
| DE | KEEP / rewrite als System-Haus | REFERENCE (alte Positionierung: Digitalagentur) |
| TR | neuer TR-Canon | REFERENCE |
| EN | neu aus DE Canon | REFERENCE, nicht copy-paste Positionierung |
| AR | neu + RTL | REFERENCE |
| RU | **ARCHIVE** | nicht migrieren |

---

## 4 · Routes / Assets (Legacy)

**HTML-Routen (Production-relevant):**

| URL | Datei | Notiz |
|-----|--------|--------|
| `/` | `index.html` | One-Pager: `#leistungen` `#pakete` `#meai` `#ueber-uns` `#referenzen` `#kontakt` |
| `/termin.html` | `termin.html` | Booking; Next hat Redirect → `/termin` |
| `/meai_intro.html` | `meai_intro.html` | MEAI Intro |

Sprache **nicht** in der URL. Switcher: DE EN TR AR RU via `localStorage` (`creadig_lang`). Canonical im HTML: `https://creadig.vercel.app/` — **Cutover-Risiko** (vercel.app als Canonical).

**Assets, die archiviert bleiben müssen:**

| Pfad | Rolle |
|------|--------|
| `assets/img/og.png` | OG |
| `assets/img/team.jpg` | Teamfoto (Legacy) |
| `assets/img/meai_icon_gold.svg` | meAI Icon |
| `design-system/creadig/assets/logo/*` | meAI Wortmarke / Symbol |
| `design-system/creadig/assets/fonts/vag-rounded-*.ttf` | Legacy-Schriften |
| `creadig-faz3.css` / `.js`, `creadig-hero.js`, `creadig-motion.js`, `app-lang.js` | Laufzeit |

**Kundenarbeiten auf Legacy:** kein separates `/arbeiten`-Routing. Referenzen-Sektion im One-Pager. Pixelgetreue Kunden-UI der neuen Site liegt unter `public/works/` auf `feat/system-haus-site` — **nicht** löschen; Legacy-`assets/` zusätzlich behalten.

**Nicht Production-HTML, aber auf `main`:** `.claude/`, Cursor-Skills, `creadig-v0-prompt.md` — Archive Git, nicht öffentliche Site.

---

## 5 · Archivierbar?

**JA**, als Snapshot — **nicht löschen**.

- Git: `main` @ `ae76ba6` bleibt Quelle.  
- Vercel: Production-Deployment vom 26.08.2026 (`last-modified`) notieren vor Cutover.  
- Risiko: Cutover ohne Redirect-Map verliert alte URLs / Sprach-Bookmarks (`?`/localStorage).

---

## 6 · Neue System-Haus-Version

| | |
|--|--|
| Branch | **`feat/system-haus-site`** |
| HEAD (diese Session) | **`ed9193623dc67e53cabf6be3b3480c1007ceab17`** · `feat(lead): add optional lead store after mail delivery` |
| GitHub Deployments | Environment **Preview** für `ed91936` (29.08.2026 21:27 UTC) |
| Preview SHA `ed91936` | `https://creadig-lfn1kipr8-muhammed-emin-akyols-projects.vercel.app/` |
| Branch-Alias | `https://creadig-git-feat-system-haus-site-muhammed-emin-akyols-projects.vercel.app/` |
| `/admin` Preview (dieser Agent) | **HTTP 302 → Vercel SSO** (Deployment Protection) — Login der App **nicht** von hier aus prüfbar |

Code-Beweis Admin: `app/(admin)/`, `middleware.ts`, `lib/admin-session.ts` — **auf diesem Branch vorhanden**.
