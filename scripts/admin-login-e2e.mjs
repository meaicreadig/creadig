#!/usr/bin/env node
/**
 * ADM-02 · A02 — ANMELDUNG: FEHLERZUSTAENDE UND MESSUNG
 *
 * Startet den GEBAUTEN Server (`next start`, Produktionsmodus) mit
 * Probe-Zugangsdaten — kein Produktionsgeheimnis, keine Produktionsdaten —
 * und prueft im echten Chromium:
 *
 *   F1 falsches Passwort   F2 Zeitueberschreitung   F3 offline
 *   F4 429                 F5 5xx                   F6 Doppel-Absenden
 *   F7 Erfolg + Zustand „Angemeldet — Übersicht wird geladen“
 *   F8 abgelaufene Sitzung F9 Absenden vor der Hydration (kein Passwort in der URL)
 *
 * Danach die Messung (Vertrag: 30 warm / 10 kalt), je Probe die Stufen
 *   Klick → Auth-Antwort → Adresse /admin → erste Ueberschrift sichtbar
 *
 * Aufruf:  npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/admin-login-e2e.mjs
 *          [--nur-fehler] [--warm 30] [--kalt 10] [--json <datei>]
 */
import { spawn } from "node:child_process"
import { writeFileSync } from "node:fs"
import { chromium } from "playwright"

const PORT = Number(process.env.E2E_PORT ?? 4391)
const BASE = `http://127.0.0.1:${PORT}`
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i > 0 ? process.argv[i + 1] : fallback
}
const NUR_FEHLER = process.argv.includes("--nur-fehler")
const WARM = Number(arg("--warm", 30))
const KALT = Number(arg("--kalt", 10))
const JSON_ZIEL = arg("--json", null)

const ENV = {
  ...process.env,
  NODE_ENV: "production",
  ADMIN_PASSWORD: "probe-owner-nur-lokal",
  ADMIN_SESSION_SECRET: "probe-sitzung-nur-lokal-0123456789abcdef0123456789",
  LEAD_STORE: "",
  DATABASE_URL: "",
}
process.env.ADMIN_SESSION_SECRET = ENV.ADMIN_SESSION_SECRET
const S = await import("../lib/admin-session.ts")

let server = null
async function starte() {
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore", env: ENV })
  const t0 = Date.now()
  for (;;) {
    try {
      /* Eine statische Datei — waermt keine Route auf. */
      const r = await fetch(`${BASE}/robots.txt`)
      if (r.status < 500) return Date.now() - t0
    } catch { /* noch nicht da */ }
    if (Date.now() - t0 > 60_000) throw new Error("Server kam nicht hoch")
    await new Promise((r) => setTimeout(r, 150))
  }
}
async function stoppe() {
  if (!server) return
  const s = server
  server = null
  await new Promise((r) => { s.once("exit", r); s.kill("SIGTERM"); setTimeout(r, 3000) })
}

const ergebnisse = []
const pruefe = (name, ok, detail = "") => {
  ergebnisse.push({ name, ok })
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

async function loginSeite(browser, opts = {}) {
  const context = await browser.newContext(opts)
  const page = await context.newPage()
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  return { context, page }
}
/* `form [role=alert]`: Next legt einen leeren Routen-Ansager mit role=alert in jede Seite. */
const alertText = (page) => page.locator('form [role="alert"]').first().textContent({ timeout: 15_000 })

async function fehlerzustaende(browser) {
  console.log("\nF · Fehlerzustaende der Anmeldung")

  {
    const { context, page } = await loginSeite(browser)
    await page.fill("#password", "falsch")
    await page.keyboard.press("Enter")
    const t = await alertText(page)
    pruefe("F1 falsches Passwort: allgemeine Meldung", t === "Anmeldung nicht möglich.", t)
    pruefe("F1 Feld geleert", (await page.inputValue("#password")) === "")
    await context.close()
  }
  {
    const { context, page } = await loginSeite(browser)
    await page.route("**/api/admin/session", async (route) => {
      await new Promise((r) => setTimeout(r, 11_500))
      await route.continue().catch(() => {})
    })
    await page.fill("#password", "irgendwas")
    const t0 = Date.now()
    await page.keyboard.press("Enter")
    const t = await alertText(page)
    const dauer = Date.now() - t0
    pruefe("F2 Zeitueberschreitung: eigene Meldung, nicht „falsches Passwort“", /rechtzeitig/.test(t ?? ""), t)
    pruefe("F2 endlich (≤ 11 s)", dauer <= 11_000, `${dauer} ms`)
    pruefe("F2 Passwort bleibt stehen", (await page.inputValue("#password")) === "irgendwas")
    pruefe("F2 Knopf wieder bedienbar", await page.locator('button[type="submit"]').isEnabled())
    await context.close()
  }
  {
    const { context, page } = await loginSeite(browser)
    await context.setOffline(true)
    await page.fill("#password", "irgendwas")
    await page.keyboard.press("Enter")
    const t = await alertText(page)
    pruefe("F3 offline: eigene Meldung", /Internetverbindung/.test(t ?? ""), t)
    await context.close()
  }
  for (const [status, muster, name] of [[429, /Zu viele/, "F4 429"], [500, /gestört/, "F5 500"], [502, /gestört/, "F5 502"]]) {
    const { context, page } = await loginSeite(browser)
    await page.route("**/api/admin/session", (route) => route.fulfill({ status, body: "{}" }))
    await page.fill("#password", "irgendwas")
    await page.keyboard.press("Enter")
    const t = await alertText(page)
    pruefe(`${name}: eigene Meldung`, muster.test(t ?? ""), t)
    await context.close()
  }
  {
    const { context, page } = await loginSeite(browser)
    let posts = 0
    await page.route("**/api/admin/session", async (route) => {
      posts++
      await new Promise((r) => setTimeout(r, 800))
      await route.continue()
    })
    await page.fill("#password", ENV.ADMIN_PASSWORD)
    await page.keyboard.press("Enter")
    await page.keyboard.press("Enter").catch(() => {})
    await page.locator('button[type="submit"]').click({ force: true, timeout: 1000 }).catch(() => {})
    await page.waitForURL((u) => u.pathname === "/admin", { timeout: 15_000 })
    pruefe("F6 Doppel-Absenden: genau EIN Anmeldeaufruf", posts === 1, `${posts} Aufrufe`)
    await context.close()
  }
  {
    const { context, page } = await loginSeite(browser)
    await page.route("**/api/admin/session", async (route) => {
      await route.continue()
    })
    await page.fill("#password", ENV.ADMIN_PASSWORD)
    /* Der Zustand „weiter“ lebt nur bis zum Seitenwechsel — mitschreiben statt abpassen. */
    await page.evaluate(() => {
      window.__phasen = []
      const form = document.querySelector("form")
      new MutationObserver(() => window.__phasen.push(form.dataset.phase)).observe(form, { attributes: true, attributeFilter: ["data-phase"] })
    })
    await page.keyboard.press("Enter")
    await page.waitForURL((u) => u.pathname === "/admin", { timeout: 15_000 })
    const phasen = await page.evaluate(() => window.__phasen ?? null).catch(() => null)
    const h1 = await page.locator("h1").first().textContent()
    pruefe("F7 Erfolg: Zustand wechselt von „pruefen“ zu „weiter“", Array.isArray(phasen) && phasen.includes("pruefen") && phasen.includes("weiter"), JSON.stringify(phasen))
    pruefe("F7 Erfolg: Uebersicht erreicht", h1 === "Übersicht", String(h1))
    await context.close()
  }
  {
    const alt = await S.issueSession("owner", Date.now() - 9 * 60 * 60 * 1000)
    const context = await browser.newContext()
    await context.addCookies([{ name: "cd_admin", value: alt, url: BASE }])
    const page = await context.newPage()
    await page.goto(`${BASE}/admin/vertrieb`)
    const url = new URL(page.url())
    pruefe("F8 abgelaufene Sitzung → Anmeldung mit Hinweis", url.pathname === "/admin/login" && url.searchParams.get("abgelaufen") === "1", url.pathname + url.search)
    pruefe("F8 kein geschuetzter Inhalt", !(await page.content()).includes("Pipeline"))
    await context.close()
  }
  {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`${BASE}/admin/login`)
    await page.fill("#password", "geheim-darf-nicht-in-die-url")
    await Promise.all([page.waitForLoadState("load"), page.locator('button[type="submit"]').click()])
    pruefe("F9 vor der Hydration: kein Passwort in der Adresse", !page.url().includes("geheim"), page.url())
    await context.close()
  }
}

function perzentil(werte, p) {
  const s = [...werte].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)]
}

let probeNr = 0
async function probe(browser) {
  /* Eigene Test-Adresse je Probe: Das Versuchsfenster (10 / 10 min je Adresse)
     soll die Messung nicht in 429 laufen lassen. Nur lokal, nur Probewerte. */
  probeNr++
  const { context, page } = await loginSeite(browser, {
    extraHTTPHeaders: { "x-forwarded-for": `198.18.${Math.floor(probeNr / 250)}.${probeNr % 250}` },
  })
  await page.fill("#password", ENV.ADMIN_PASSWORD)
  const t0 = await page.evaluate(() => performance.now())
  const antwort = page.waitForResponse((r) => r.url().endsWith("/api/admin/session"))
  const feedback = page.locator('form[data-phase="pruefen"], form[data-phase="weiter"]').waitFor({ timeout: 5000 })
    .then(() => page.evaluate(() => performance.now()))
  await page.locator('button[type="submit"]').click()
  const tFeedback = await feedback
  await antwort
  const tAuth = await page.evaluate(() => performance.now())
  await page.waitForURL((u) => u.pathname === "/admin", { timeout: 20_000 })
  const tNav = await page.evaluate(() => performance.now())
  await page.locator("h1").first().waitFor({ timeout: 20_000 })
  const tShell = await page.evaluate(() => performance.now())
  await context.close()
  return { feedback: tFeedback - t0, auth: tAuth - t0, navigation: tNav - t0, shell: tShell - t0 }
}

function zusammenfassen(name, proben) {
  const z = {}
  for (const stufe of ["feedback", "auth", "navigation", "shell"]) {
    const w = proben.map((p) => p[stufe])
    z[stufe] = { p50: Math.round(perzentil(w, 50)), p95: Math.round(perzentil(w, 95)), max: Math.round(Math.max(...w)) }
  }
  console.log(`\n  ${name} (n=${proben.length})`)
  for (const [stufe, v] of Object.entries(z)) console.log(`    ${stufe.padEnd(11)} p50 ${String(v.p50).padStart(5)} ms · p95 ${String(v.p95).padStart(5)} ms · max ${v.max} ms`)
  return z
}

const bericht = { umgebung: { modus: "next start (Produktions-Build)", browser: "Chromium (Playwright)", netz: "localhost, keine Drosselung", datenbank: "keine (LEAD_STORE leer) — Datenlatenz NICHT enthalten", datum: new Date().toISOString() } }
const browser = await chromium.launch()
try {
  await starte()
  await fehlerzustaende(browser)

  if (!NUR_FEHLER) {
    console.log("\nM · Messung")
    const warm = []
    await probe(browser) /* Aufwaermen, nicht gezaehlt */
    for (let i = 0; i < WARM; i++) warm.push(await probe(browser))
    bericht.warm = zusammenfassen("warm", warm)
    await stoppe()

    const kalt = []
    for (let i = 0; i < KALT; i++) {
      await starte()
      kalt.push(await probe(browser))
      await stoppe()
    }
    bericht.kalt = zusammenfassen("kalt (erster Aufruf nach Serverstart)", kalt)
    bericht.proben = { warm, kalt }
    pruefe("M Budget: Rueckmeldung ≤ 100 ms (p95 warm)", bericht.warm.feedback.p95 <= 100, `${bericht.warm.feedback.p95} ms`)
    pruefe("M Budget: Shell ≤ 2 s (p95 warm)", bericht.warm.shell.p95 <= 2000, `${bericht.warm.shell.p95} ms`)
  }
} finally {
  await browser.close()
  await stoppe()
}

bericht.fehlerzustaende = ergebnisse
if (JSON_ZIEL) writeFileSync(JSON_ZIEL, JSON.stringify(bericht, null, 2))
const fehl = ergebnisse.filter((e) => !e.ok)
console.log(fehl.length ? `\n${fehl.length} Pruefung(en) fehlgeschlagen.\n` : `\nAlle ${ergebnisse.length} Pruefungen bestanden.\n`)
process.exit(fehl.length ? 1 : 0)
