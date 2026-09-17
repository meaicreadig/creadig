#!/usr/bin/env node
/**
 * ADM-02 · A19 — DATENZUSTAENDE JE ADMIN-FLAECHE
 *
 * Startet den gebauten Server zweimal mit Probe-Zugangsdaten:
 *   ohne      kein Speicher eingerichtet       → erwartet „nicht eingerichtet“
 *   gestoert  Speicher eingerichtet, tot       → erwartet „nicht erreichbar“
 * und ruft jede Admin-Flaeche als Owner auf. Gemeldet wird je Flaeche:
 * HTTP-Status, Ueberschrift, welche Zustandsworte erscheinen — und jede
 * „0 Kunden“-artige Zahl, die an dieser Stelle NICHT gemessen sein kann.
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/admin-zustaende.mjs
 */
import { spawn } from "node:child_process"
import { chromium } from "playwright"

const PORT = 4393
const BASE = `http://127.0.0.1:${PORT}`
const PASSWORT = "probe-owner-nur-lokal"
const ROUTEN = [
  "/admin", "/admin/cockpit", "/admin/material", "/admin/beleg",
  "/admin/kunden", "/admin/kunden/gibt-es-nicht",
  "/admin/vertrieb", "/admin/vertrieb/anfragen", "/admin/vertrieb/anfragen/gibt-es-nicht",
  "/admin/vertrieb/beziehungen", "/admin/vertrieb/beziehungen/gibt-es-nicht",
  "/admin/vertrieb/pipeline", "/admin/vertrieb/pipeline/gibt-es-nicht",
  "/admin/vertrieb/recherche", "/admin/vertrieb/recherche/gibt-es-nicht",
  "/admin/vertrieb/verlust",
]
const ZUSTANDSWORTE = [
  "nicht eingerichtet", "Nicht eingerichtet", "nicht erreichbar", "Nicht erreichbar",
  "nicht gemessen", "Etwas ist schiefgegangen", "Nicht gefunden", "keine Datenquelle",
]
/* Eine Null vor einem Geschaeftsobjekt ist eine Messung — ohne Speicher kann es keine sein. */
const NULL_MUSTER = /(?<![\d.,])0\s+(Kunden|Anfragen|Vorg\w*|Chancen|Verkaufschancen|Organisation\w*|Kontakt\w*|offen\w*|Eintr\w*|Treffer|Beziehung\w*|Recherche\w*|Verlust\w*|Punkte?|madde)/g


async function lauf(name, env) {
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "production", ADMIN_PASSWORD: PASSWORT,
      ADMIN_SESSION_SECRET: "probe-sitzung-nur-lokal-0123456789abcdef0123456789", ...env },
  })
  try {
    for (let i = 0; ; i++) {
      try { if ((await fetch(`${BASE}/robots.txt`)).status < 500) break } catch { /* */ }
      if (i > 200) throw new Error("Server kam nicht hoch")
      await new Promise((r) => setTimeout(r, 150))
    }
    const login = await fetch(`${BASE}/api/admin/session`, {
      method: "POST", headers: { "content-type": "application/json", origin: BASE },
      body: JSON.stringify({ password: PASSWORT }),
    })
    const cookie = login.headers.get("set-cookie")?.split(";")[0]
    if (!cookie) throw new Error(`Anmeldung fehlgeschlagen (${login.status})`)

    /* Gerendert, nicht roh: Seiten streamen ihren Inhalt hinter „Wird geladen …“ nach. */
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const [k, v] = cookie.split("=")
    await context.addCookies([{ name: k, value: v, url: BASE }])
    const page = await context.newPage()
    const zeilen = []
    for (const route of ROUTEN) {
      const r = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" })
      await page.waitForFunction(() => !document.body.innerText.includes("Wird geladen"), null, { timeout: 15_000 }).catch(() => {})
      const t = (await page.locator("main").first().innerText().catch(() => "")).replace(/\s+/g, " ")
      const h1 = ((await page.locator("h1").first().textContent().catch(() => "")) ?? "").trim()
      const worte = ZUSTANDSWORTE.filter((w) => t.includes(w))
      const nullen = [...t.matchAll(NULL_MUSTER)].map((m) => m[0])
      const laedt = t.includes("Wird geladen")
      zeilen.push({ lauf: name, route, status: r?.status() ?? 0, h1, worte: laedt ? [...worte, "LAEDT-NOCH"] : worte, nullen, text: t.slice(0, 400) })
    }
    await browser.close()
    return zeilen
  } finally {
    server.kill("SIGTERM")
    await new Promise((r) => setTimeout(r, 1500))
  }
}

const alle = [
  ...(await lauf("ohne", { LEAD_STORE: "", DATABASE_URL: "" })),
  ...(await lauf("gestoert", { LEAD_STORE: "neon", DATABASE_URL: "postgresql://nobody:nothing@127.0.0.1:9/tot" })),
]
let befunde = 0
for (const z of alle) {
  /* Der Zustand muss zum Lauf passen: ohne Speicher „nicht eingerichtet“, gestoert „nicht erreichbar“ — nie beides, nie keiner. */
  const soll = z.lauf === "ohne" ? /nicht eingerichtet/i : /nicht erreichbar/i
  const falsch = z.lauf === "ohne" ? /nicht erreichbar/i : /nicht eingerichtet/i
  const ausgenommen = z.route === "/admin/material" || z.route === "/admin/cockpit"
  const problem =
    z.status >= 500 || z.nullen.length > 0 || z.worte.includes("LAEDT-NOCH") ||
    z.worte.includes("Etwas ist schiefgegangen") ||
    (!ausgenommen && !z.worte.includes("Nicht gefunden") && (!z.worte.some((w) => soll.test(w)) || z.worte.some((w) => falsch.test(w))))
  if (problem) befunde++
  if (problem || process.argv.includes("--text")) console.log(`      ${z.text}`)
  console.log(`${problem ? "PRUEF" : "ok   "} ${z.lauf.padEnd(8)} ${String(z.status)} ${z.route.padEnd(42)} h1=${z.h1.slice(0, 28).padEnd(28)} ${z.worte.join("|")}${z.nullen.length ? `  NULLEN: ${z.nullen.join(", ")}` : ""}`)
}
console.log(`\n${befunde} Flaeche(n) zu pruefen von ${alle.length}.`)
process.exit(befunde ? 1 : 0)
