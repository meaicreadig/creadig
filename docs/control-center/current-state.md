# creaDIG Control Center · Current State

> **Authority:** Current State · PHASE A.7 · Stand 30.08.2026  
> **Gelesen:** Code auf `feat/system-haus-site` @ `ed91936` + HTTP-Stichprobe.  
> **Nicht:** Live-Login (Vercel Deployment Protection).  
> **G.0 (29.08.2026)** behauptete „Es gibt keinen Admin.“ — das ist **veraltet**.

G.0 bleibt als **Archive-Notiz** nützlich für Persistence, Privacy-Satz und
fehlende Sales-Quellen. Die Zugangsvoraussetzung „kein Admin“ gilt nicht mehr.

---

## Klassifikation (A.7)

| Fläche | Klassifikation | Begründung |
|--------|----------------|------------|
| `/admin` Materialstand | **KEEP** | einzige Ansicht mit LIVE DATA aus `collect()` |
| `/admin/login` | **KEEP** | Passwort, eine Fehlermeldung, kein Nutzername |
| `POST/DELETE /api/admin/session` | **KEEP** | HMAC-Sitzung, Rate-Limit, Cookie-Flags |
| `middleware.ts` | **KEEP** | 404 ohne Env; Redirect ohne Sitzung |
| Navigation (nur Materialstand) | **KEEP** | keine Future-Menü-Kulisse |
| Admin-Typografie / Tokens | **KEEP** | dichter, gleiche DNA |
| `/status` (öffentlich, `?key=`) | **KEEP** bis Owner sagt sonst | gleiche Datenquelle, zweiter Zugang |
| Heute | **KEEP** (03.09.2026 verbunden) | Aufmerksamkeitsliste aus Vertrieb UND Materialstand (`lib/attention.ts`), sieben Ränge, jede Zeile führt auf ihren Datensatz; nicht erreichbarer Vertrieb wird als „nicht gemessen“ benannt, nicht als Null |
| `/admin/leads` + `[id]` | **KEEP** | echter Lesepfad; drei Zustände getrennt (nicht eingerichtet / nicht erreichbar / leer) |
| Marketing-Funnel im Admin | **MISSING SOURCE** | Analytics nur schreibend |
| Charts / KPI-Karten | **REMOVE** (existieren nicht — so lassen) | keine Quelle |
| Fake Owner / Intent / Pipeline € | **REMOVE** (nicht anlegen) | Truth Lock |
| LeadStore Abstraktion | **CONNECT** nach Privacy+Neon | Spec, kein Production-Adapter |
| Sales-Status / Next Action im Store | **KEEP** (Modell) | UI erst Phase D |

---

## Routen (Code)

| Route | Art | Zugang | Inhalt |
|-------|-----|--------|--------|
| `/admin` | RSC async, `force-dynamic` | Sitzung | **Heute** — Aufmerksamkeitsliste aus realen Quellen; Material als Vorrat in der Nebenspalte |
| `/admin/material` | RSC, `force-dynamic` | Sitzung | Materialstand, gruppiert (unverändert, neue Adresse) |
| `/admin/leads` | RSC, `force-dynamic` | Sitzung | Anfragen: Liste, Suche, Statusfilter |
| `/admin/leads/[id]` | RSC + Server Actions | Sitzung | Detail 2/3 + 1/3, Status- und Schritt-Mutation |
| `/admin/login` | RSC, `force-dynamic` | offen wenn Env | Passwort |
| `POST /api/admin/session` | Handler | Rate-Limit | setzt `cd_admin` |
| `DELETE /api/admin/session` | Handler | — | löscht Cookie |

**Der Materialstand ist umgezogen**, nicht verändert: gleiche Funktion
(`collect()`), gleiche Gruppierung, gleiche Zahlen — nur liegt unter
`/admin` jetzt „Heute". Die Datensemantik ist unangetastet.

**Navigation:** Heute · Materialstand · Vertrieb. Der dritte Punkt erscheint
nur, wenn `leadStoreConfigured()` wahr ist — die Navigation wächst mit den
Quellen, nicht mit den Absichten.

Kein zweites Admin-Projekt. Layout: `app/(admin)/` eigene Wurzel, `lang="de"`, `noindex`.

---

## Komponenten

| Datei | Rolle |
|-------|--------|
| `components/admin/admin-shell.tsx` | Hülle, Skip-Link, Navigation je nach Quellenlage |
| `components/admin/admin-nav.tsx` | Client — nur wegen `aria-current` |
| `components/admin/primitives.tsx` | Surface · SectionHeader · Pill · DataValue · **Unknown** · **UnavailableNote** |
| `components/admin/leads-table.tsx` | dichte Tabelle, echtes `<table>`-Markup |
| `components/admin/admin-login-form.tsx` | Client-POST, `router.refresh()` |
| `components/admin/admin-logout.tsx` | `DELETE`, kein GET-Logout |

**Charts:** keine — es gibt keine Zeitreihe. **Fake-KPI:** keine.

Die Bausteine stammen aus dem v0-Prototyp, aber ohne Primer und ohne
styled-components: der Prototyp bezog seine Farben schon über eine eigene
Semantik-Schicht (`--cd-*`), die hier auf die bestehenden Token umgehängt
wurde. Kein zweites Design-System.

---

## Navigation

Genau ein Punkt: **Materialstand** → `/admin`.  
Langfrist-IA (Today, Sales, …) laut R4: nur reale Module. Heute korrekt leer.

---

## Datenquellen

| Quelle | Status | Was sie liefert |
|-------|--------|-----------------|
| `lib/material-status.ts` `collect()` | **LIVE DATA** | Lücken aus `site-data`, Insights, Screens, Env-Namen (nicht Werten) |
| `ITEM_GROUPS` | **LIVE DATA** | 10 Gruppen: Belege … Entscheidungen |
| Lead-Mails (Resend) | **LIVE DATA** außerhalb der App | Postfach, nicht Admin |
| `LeadStore` | **SPEC / DEV only** | `LEAD_STORE` unset → kein Schreiben; `memory` und `file` in Production abgelehnt |
| `file`-Adapter | **DEV only** (neu 30.08.) | JSON in `os.tmpdir()`; existiert, weil `memory` zwischen RSC- und Route-Handler-Schicht **nicht geteilt** wird |
| Vercel Analytics | schreibend | **keine** Lese-API in der App |
| Neon | **NOT RELEASED** | `docs/ops/provider-neon.md` |

---

## Auth (Code + G.1 Acceptance 29.08.)

Lokal/Build geprüft (Acceptance `docs/control-center/acceptance.md`, 11/11):

- Env fehlt → 404 auf `/admin`, `/admin/login`, `POST /api/admin/session`
- Login → HttpOnly, SameSite=Strict, Secure, 8 h
- Logout, expired, tampered cookie, Rate-Limit

**Diese Session (30.08.):** Der Preview wurde über einen Share-Link direkt
befragt. Ergebnis: Middleware greift, Zweig `!configured` — Login/Sitzung/
Logout ließen sich **deshalb** nicht prüfen, nicht wegen der SSO-Wand.
Die G.1-Acceptance oben bleibt gültig (lokaler Produktionsbuild).

Cookie-Name: `cd_admin`. Secrets: nur Server.

---

## Responsive / A11y (Acceptance, nicht dieser HTTP-Check)

G.1: Desktop 1440 + Mobil 390, Keyboard-Login, axe 0. Nav oben mobil, links desktop. Logout je einmal.

**Nicht erneut visuell geprüft** in PHASE A (SSO-Block).

---

## Platzhalter / Fake

| | |
|--|--|
| Fake-Leads | **keine** |
| Fake-KPIs | **keine** |
| Coming-Soon-Menü | **keine** |
| Materialstand-Zahlen | aus Repo, nicht erfunden |

---

## Live vs Preview (Visibility)

| Ort | `/admin` |
|-----|----------|
| `https://creadig.de/admin` | **404** `NOT_FOUND` — Production = **Legacy HTML**, Next läuft dort nicht |
| Preview `…-lfn1kipr8-…vercel.app` (SHA `ed91936`) | **404, leerer Körper** — App läuft, Env fehlt (siehe unten) |
| Branch-Alias `creadig-git-feat-system-haus-site-…` | 302 SSO im Browser |

**Deployment Protection (verifiziert, Projekt `creadig`):**
`ssoProtection: enabled, all_except_custom_domains` · `passwordProtection: aus`
· `trustedIps: aus`. Das erklärt die 302 im Browser — und dass die
Custom-Domain **nicht** geschützt ist.

**A.6 teilweise erfüllt.** Bewiesen: die neue Seite läuft, die Middleware
greift, der Zugang ist dicht. **Nicht** bewiesen: Login, Sitzung, Logout —
dafür muss die Env erst wirksam sein. Das ist kein Agentenlimit mehr,
sondern ein realer Konfigurationsbefund.

---

## Admin Env (A.4)

> **Nachtrag 30.08.2026, 11:07 UTC — die zwei UNCLEAR sind aufgelöst.**
> Nicht über `vercel env ls` (die CLI blieb tot), sondern über das
> **Verhalten des laufenden Deployments**. Der Vercel-Connector kann die
> SSO-Wand mit einem Share-Link durchstoßen; damit ist die App direkt
> befragbar — **ohne je einen Secret-Wert zu lesen**.

`middleware.ts` unterscheidet zwei 404:

```ts
if (!configured) return new NextResponse(null, { status: 404 })   // LEER
```

Eine unbekannte Route liefert dagegen die **gerenderte** 404-Seite. Die
Körpergröße trennt die beiden Fälle sauber:

| Anfrage an Preview `ed91936` | Status | Körper | Bedeutung |
|---|---|---|---|
| `/` | 200 | 100 284 B, enthält „System-Haus" | **die neue Seite läuft** |
| `/gibtsnicht` | 404 | **27 123 B** | gerenderte 404-Seite |
| `/admin` | 404 | **0 B** | **Middleware, Zweig `!configured`** |
| `/admin/login` | 404 | **0 B** | derselbe Zweig |

| Name | Owner-Aussage (R4 §11) | Befund am laufenden Preview |
|------|------------------------|------------------------------|
| `ADMIN_PASSWORD` | gesetzt | **im Preview-Scope von `ed91936` nicht wirksam** |
| `ADMIN_SESSION_SECRET` | gesetzt | **im Preview-Scope von `ed91936` nicht wirksam** |

Werte: nicht gelesen, nicht ausgegeben, nicht angefordert.

Beide Aussagen können zugleich stimmen. Die Middleware liest die Variablen
**des Deployments**, nicht des Dashboards — ein Deployment trägt die Env,
die beim **Bau** galt. Zwei Erklärungen bleiben, und nur der Owner kann sie
unterscheiden:

1. Env wurde **nach** dem letzten Preview-Deploy gesetzt
   (`ed91936`, 29.08.2026 21:27 UTC) → **Redeploy Preview** genügt.
2. Env liegt nur im Scope **Production**, nicht **Preview** → erst Scope
   `Preview` ergänzen, **dann** redeployen.

**A.5:** In beiden Fällen ist ein Preview-Redeploy nötig. Ohne ihn bleibt
`/admin` bei 404 — korrekt, so gebaut, aber nicht das gewünschte Ergebnis.

Production-Env ändert `/admin` auf `creadig.de` **nicht**, solange Production Legacy ist.

---

## Was G.0 weiterhin richtig sagt

- Öffentlicher Datenschutzsatz: keine Datenbank.  
- Persistenz Production: kein Neon.  
- Sales-UI ohne Store: verboten.  
- Rate-Limit = In-Memory je Instanz.

---

## Bewusst nicht in PHASE A

Kein `/admin/leads`. Kein Neon-Adapter. Kein EN/AR. Kein Domain-Cutover. Kein zweites CRM.
