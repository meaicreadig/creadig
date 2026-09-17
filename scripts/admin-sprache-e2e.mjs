#!/usr/bin/env node
/**
 * ADM-01 · A01/A26/A27 — SPRACHE, KONTEXT, MOBIL, TASTATUR, A11Y DER ADMIN-HUELLE
 *
 * Gebauter Server, Probe-Zugangsdaten (Owner + Vertrieb), Chromium.
 *
 *   S1 Browser auf Tuerkisch → Anmeldung auf Tuerkisch, <html lang="tr">
 *   S2 Umschalten auf der Anmeldung: eingetipptes Passwort bleibt
 *   S3 Umschalten in der Huelle: Adresse inkl. Filter bleibt, Navigation uebersetzt
 *   S4 Zurueckschalten, Wahl ueberdauert Neuladen
 *   S5 Rolle Vertrieb sieht nur ihre Bereiche
 *   S6 Mobil 390 px: Menue eingeklappt, oeffnet per Tastatur, kein waagerechter Ueberlauf
 *   S7 Tastatur: erster Tab = Sprunglink zur Arbeitsflaeche
 *   S8 axe: Anmeldung + Uebersicht in DE und TR, Desktop und Mobil
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/admin-sprache-e2e.mjs
 */
import { spawn } from "node:child_process"
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"

const PORT = 4395
const BASE = `http://127.0.0.1:${PORT}`
const OWNER = "probe-owner-nur-lokal"
const VERTRIEB = "probe-vertrieb-nur-lokal"

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  env: {
    ...process.env, NODE_ENV: "production", LEAD_STORE: "aus", DATABASE_URL: "postgres://kein-speicher.invalid/pruefung",
    ADMIN_PASSWORD: OWNER, ADMIN_PASSWORD_VERTRIEB: VERTRIEB,
    ADMIN_SESSION_SECRET: "probe-sitzung-nur-lokal-0123456789abcdef0123456789",
  },
})

let fehler = 0
const p = (name, ok, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}
let adresse = 0
const kontext = (browser, opts = {}) =>
  browser.newContext({ ...opts, extraHTTPHeaders: { ...(opts.extraHTTPHeaders ?? {}), "x-forwarded-for": `198.19.0.${++adresse}` } })

async function anmelden(page, passwort) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill("#password", passwort)
  await page.keyboard.press("Enter")
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 15_000 })
}
const lang = (page) => page.evaluate(() => document.documentElement.lang)

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${BASE}/robots.txt`)).status < 500) break } catch { /* */ }
    if (i > 300) throw new Error("Server kam nicht hoch")
    await new Promise((r) => setTimeout(r, 150))
  }
  const browser = await chromium.launch()

  console.log("\nS1–S4 · Sprache")
  {
    const ctx = await kontext(browser, { extraHTTPHeaders: { "accept-language": "tr-TR,tr;q=0.9" } })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
    p("S1 Anmeldung auf Tuerkisch", (await page.locator("h1").textContent()) === "Kontrol Merkezi")
    p("S1 <html lang=tr>", (await lang(page)) === "tr")
    p("S1 Knopf auf Tuerkisch", (await page.locator('button[type="submit"]').textContent()) === "Giriş yap")

    await page.fill("#password", OWNER)
    await page.getByRole("button", { name: "Deutsch" }).click()
    await page.waitForFunction(() => document.querySelector("h1")?.textContent === "Control Center", null, { timeout: 10_000 })
    p("S2 nach Umschalten Deutsch", (await lang(page)) === "de")
    p("S2 eingetipptes Passwort bleibt", (await page.inputValue("#password")) === OWNER)
    p("S2 Knopf auf Deutsch", (await page.locator('button[type="submit"]').textContent()) === "Anmelden")

    await page.locator("#password").press("Enter")
    await page.waitForURL((u) => u.pathname === "/admin", { timeout: 15_000 })
    await page.goto(`${BASE}/admin/vertrieb/anfragen?status=neu&q=probe`, { waitUntil: "networkidle" })
    const vorher = page.url()
    p("S3 Navigation Deutsch, „Anfragen“ aktiv", (await page.locator('nav a[aria-current="page"] span').first().textContent()) === "Anfragen")
    await page.locator("nav").getByRole("button", { name: "Türkçe" }).first().click()
    await page.waitForFunction(() => document.documentElement.lang === "tr" && document.querySelector('nav a[aria-current="page"] span')?.textContent === "Talepler", null, { timeout: 10_000 })
    p("S3 Adresse inkl. Filter unveraendert", page.url() === vorher, page.url())
    p("S3 Navigation uebersetzt", (await page.locator('nav a[href="/admin"] span').first().textContent()) === "Genel bakış")
    p("S3 Abmelden uebersetzt", (await page.getByRole("button", { name: "Çıkış yap" }).count()) > 0)

    await page.reload({ waitUntil: "networkidle" })
    p("S4 Wahl ueberdauert Neuladen", (await lang(page)) === "tr")
    await page.locator("nav").getByRole("button", { name: "Deutsch" }).first().click()
    await page.waitForFunction(() => document.documentElement.lang === "de", null, { timeout: 10_000 })
    p("S4 zurueck auf Deutsch", (await page.locator('nav a[href="/admin"] span').first().textContent()) === "Übersicht")
    await ctx.close()
  }

  console.log("\nS5 · Rollenbewusste Navigation")
  {
    const ctx = await kontext(browser)
    const page = await ctx.newPage()
    await anmelden(page, VERTRIEB)
    const hrefs = await page.locator("nav ul a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))
    p("S5 Vertrieb sieht Anfragen, Kunden, Vertrieb", ["/admin/vertrieb/anfragen", "/admin/kunden", "/admin/vertrieb"].every((h) => hrefs.includes(h)), hrefs.join(" "))
    p("S5 Vertrieb sieht System und Nachweise NICHT", !hrefs.includes("/admin/material") && !hrefs.includes("/admin/beleg"))
    await ctx.close()
  }

  console.log("\nS6/S7 · Mobil und Tastatur")
  {
    const ctx = await kontext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true })
    const page = await ctx.newPage()
    await anmelden(page, OWNER)
    p("S6 Menue eingeklappt", !(await page.locator("#admin-hauptnavigation").isVisible()))
    const knopf = page.getByRole("button", { name: "Menü öffnen" })
    await knopf.focus()
    await page.keyboard.press("Enter")
    p("S6 Menue per Tastatur geoeffnet", await page.locator("#admin-hauptnavigation").isVisible())
    p("S6 aria-expanded=true", (await page.getByRole("button", { name: "Menü schließen" }).getAttribute("aria-expanded")) === "true")
    const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    p("S6 kein waagerechter Ueberlauf", ueberlauf <= 0, `${ueberlauf}px`)
    const ziele = await page.locator("nav button, nav a").evaluateAll((els) =>
      els.filter((e) => e.offsetParent !== null).map((e) => e.getBoundingClientRect()).filter((r) => r.height < 36).length)
    p("S6 Bedienziele in der Navigation ≥ 36 px hoch", ziele === 0, `${ziele} zu klein`)

    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
    await page.keyboard.press("Tab")
    const erster = await page.evaluate(() => document.activeElement?.getAttribute("href"))
    p("S7 erster Tab = Sprunglink", erster === "#arbeitsflaeche", String(erster))
    await ctx.close()
  }

  console.log("\nS8 · axe (WCAG 2.1 AA)")
  for (const sprache of ["de", "tr"]) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const ctx = await kontext(browser, { viewport: vp })
      await ctx.addCookies([{ name: "cd_admin_sprache", value: sprache, url: BASE }])
      const page = await ctx.newPage()
      await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
      const a = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
      p(`S8 Anmeldung ${sprache} ${vp.width}px`, a.violations.length === 0, a.violations.map((v) => `${v.id}(${v.nodes.length})`).join(", "))
      await anmelden(page, OWNER)
      const b = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
      p(`S8 Uebersicht ${sprache} ${vp.width}px`, b.violations.length === 0, b.violations.map((v) => `${v.id}(${v.nodes.length})`).join(", "))
      await ctx.close()
    }
  }

  await browser.close()
} finally {
  server.kill("SIGTERM")
}
console.log(fehler ? `\n${fehler} Pruefung(en) fehlgeschlagen.\n` : "\nAlle Pruefungen bestanden.\n")
process.exit(fehler ? 1 : 0)
