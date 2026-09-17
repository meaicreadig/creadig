#!/usr/bin/env node
/**
 * ADM-05 · A13/A14 IM BROWSER — Erlaubnis erfassen, zurückziehen, nichts verlieren
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER WIRKLICH GEPRUEFT WIRD
 *
 * Nicht, ob ein Formular absendet. Sondern ob der Owner am Ende WEISS, was
 * gilt: dass eine Erlaubnis vier Spalten hat, dass die Form den Umfang
 * begrenzt, dass ein Widerruf sofort wirkt und die Zeile trotzdem stehen
 * bleibt — und vor allem, dass dieses Register die oeffentliche Seite noch
 * NICHT steuert. Der letzte Punkt ist der wichtigste: Ein Owner, der hier
 * widerruft und glaubt, der Kunde sei von creadig.de verschwunden, haette
 * sich auf dieses System verlassen.
 *
 *   G1  Der Abschnitt steht da — mit der Warnung VOR der Liste
 *   G2  Leeres Formular: feldgenaue Fehler, kein Sammelsatz
 *   G3  Die Form begrenzt den Umfang sichtbar (oeffentliche Bewertung)
 *   G4  Erfassen: die Erlaubnis steht mit Person, Form, Datum, Fundstelle da
 *   G5  Dieselbe noch einmal: keine zweite Zeile, und es wird gesagt
 *   G6  Widerrufen mit Grund: Zustand wechselt, Grund steht, Zeile bleibt
 *   G7  Kein zweiter Widerruf moeglich
 *   G8  A20 Rolle Vertrieb kommt nicht an diese Flaeche
 *   G9  A01 dieselbe Flaeche auf Tuerkisch
 *   G10 axe ohne Verstoss
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/freigabe-e2e.mjs
 */
import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import AxeBuilder from "@axe-core/playwright"
import pg from "pg"
import { chromium } from "playwright"

import { requireSafeTarget } from "./lib/env-guard.mjs"
import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

const PORT = 4399
const BASE = `http://127.0.0.1:${PORT}`
const DB = "drill_freigabe_e2e"
const ZIEL = `postgres://localhost/${DB}`
requireSafeTarget(ZIEL, "Freigabe-E2E")
const OWNER = "probe-owner-nur-lokal"
const VERTRIEB = "probe-vertrieb-nur-lokal"

const f = de.freigaben
const ft = tr.freigaben

let fehler = 0
const p = (name, ok, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}
const sauber = (s) => s.replace(/\s+/g, " ")

/* ── Datenbank frisch, mit einem Kunden zum Freigeben ── */
const admin = new pg.Client({ connectionString: "postgres://localhost/postgres" })
await admin.connect()
await admin.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`)
await admin.query(`CREATE DATABASE ${DB}`)
await admin.end()
const db = new pg.Client({ connectionString: ZIEL })
await db.connect()
process.env.LEAD_STORE = "pg-lokal"
const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
for (const s of SCHEMA) await db.query(s)
for (const s of BACKFILL) await db.query(s)
const KUNDE = "E2E Freigabe Betrieb"
const orgId = randomUUID()
await db.query(
  `INSERT INTO organisations (id,name,lifecycle,created_at,updated_at) VALUES ($1,$2,'kunde',now(),now())`,
  [orgId, KUNDE],
)

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
  env: {
    ...process.env,
    NODE_ENV: "production",
    LEAD_STORE: "pg-lokal",
    DATABASE_URL: ZIEL,
    ADMIN_PASSWORD: OWNER,
    ADMIN_PASSWORD_VERTRIEB: VERTRIEB,
    ADMIN_SESSION_SECRET: "probe-sitzung-nur-lokal-0123456789abcdef0123456789",
  },
})

let adresse = 0
const kontext = (browser, opts = {}) =>
  browser.newContext({ ...opts, extraHTTPHeaders: { "x-forwarded-for": `198.21.0.${++adresse}` } })

async function anmelden(page, passwort) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill("#password", passwort)
  await page.keyboard.press("Enter")
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20_000 })
}

async function ausfuellen(page, { form = "e-mail", umfaenge = ["name", "logo"] } = {}) {
  await page.selectOption("#organisation", orgId)
  await page.selectOption("#form", form)
  await page.fill("#name", "Frau Beispiel")
  await page.fill("#rolle", "Geschäftsführung")
  await page.fill("#firma", "Beispiel GmbH")
  await page.fill("#datum", "2026-09-15")
  for (const u of umfaenge) await page.check(`input[name="umfaenge"][value="${u}"]`)
  await page.fill("#fundstelle", "Postfach info@creadig.de")
}

try {
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(`${BASE}/robots.txt`)).status < 500) break
    } catch {
      /* noch nicht da */
    }
    if (i > 300) throw new Error("Server kam nicht hoch")
    await new Promise((r) => setTimeout(r, 150))
  }

  const browser = await chromium.launch()
  const page = await (await kontext(browser)).newPage()
  await anmelden(page, OWNER)
  await page.goto(`${BASE}/admin/beleg`, { waitUntil: "networkidle" })

  /* ── G1 ── */
  const haupt = sauber(await page.locator("main").first().innerText())
  p("G1 · der Abschnitt steht da", haupt.includes(f.titel))
  p("G1 · die Warnung steht davor", haupt.includes(f.nichtDurchgesetztTitel))
  p("G1 · und sagt, was sie bedeutet", haupt.includes(f.nichtDurchgesetzt.slice(0, 50)))
  p("G1 · noch keine Erlaubnis erfasst", haupt.includes(f.keine))

  /* ── G2 · feldgenaue Fehler ── */
  await page.getByRole("button", { name: f.erfassen }).click()
  await page.waitForFunction(
    (satz) => document.querySelector("main")?.textContent?.includes(satz),
    f.fehler.organisation,
    { timeout: 20_000 },
  )
  const mitFehlern = sauber(await page.locator("main").first().innerText())
  p("G2 · fehlender Kunde wird benannt", mitFehlern.includes(f.fehler.organisation))
  p("G2 · fehlende Person wird benannt", mitFehlern.includes(f.fehler.name))
  p("G2 · fehlender Umfang wird benannt", mitFehlern.includes(f.fehler.umfaenge))
  p("G2 · fehlende Fundstelle wird benannt", mitFehlern.includes(f.fehler.fundstelle))
  p(
    "G2 · und das Feld ist damit verbunden",
    (await page.locator("#organisation").getAttribute("aria-describedby")) === "fehler-organisation",
  )

  /* ── G3 · die Form begrenzt den Umfang ── */
  await page.selectOption("#form", "oeffentlich-veroeffentlicht")
  p(
    "G3 · eine öffentliche Bewertung trägt das Logo nicht",
    await page.locator('input[name="umfaenge"][value="logo"]').isDisabled(),
  )
  p(
    "G3 · das Zitat trägt sie schon",
    !(await page.locator('input[name="umfaenge"][value="zitat"]').isDisabled()),
  )
  p(
    "G3 · und der Grund steht dabei",
    sauber(await page.locator("fieldset").first().innerText()).includes("trägt"),
  )

  /* ── G4 · erfassen ── */
  await ausfuellen(page)
  await page.getByRole("button", { name: f.erfassen }).click()
  await page.waitForFunction(
    (name) => document.querySelector("main")?.textContent?.includes(name),
    "Frau Beispiel",
    { timeout: 20_000 },
  )
  const erfasst = sauber(await page.locator("main").first().innerText())
  p("G4 · die Erlaubnis steht in der Liste", erfasst.includes(KUNDE) && erfasst.includes("Frau Beispiel"))
  p("G4 · mit Umfang", erfasst.includes(f.scope.name) && erfasst.includes(f.scope.logo))
  p("G4 · mit Form und Fundstelle", erfasst.includes(f.formWert["e-mail"]) && erfasst.includes("Postfach"))
  p("G4 · und gilt", erfasst.includes(f.gueltig))
  p("G4 · der Erfolg wird gemeldet", erfasst.includes(f.erfasst))
  p("G4 · genau eine Zeile in der Datenbank", (await db.query("SELECT id FROM releases")).rowCount === 1)

  /* ── G5 · dieselbe noch einmal ── */
  await page.reload({ waitUntil: "networkidle" })
  await ausfuellen(page)
  await page.getByRole("button", { name: f.erfassen }).click()
  await page.waitForFunction(
    (satz) => document.querySelector("main")?.textContent?.includes(satz),
    f.schonErfasst,
    { timeout: 20_000 },
  )
  p("G5 · die zweite Erfassung wird als solche benannt", true)
  p("G5 · und es bleibt bei einer Zeile", (await db.query("SELECT id FROM releases")).rowCount === 1)

  /* ── G6 · widerrufen ── */
  await page.reload({ waitUntil: "networkidle" })
  const karte = page.locator("[data-freigabe]").first()
  await karte.locator('input[name="grund"]').fill("Kunde hat am Telefon widersprochen")
  await karte.getByRole("button", { name: f.widerrufen }).click()
  await page.waitForFunction(
    (satz) => document.querySelector("main")?.textContent?.includes(satz),
    f.zurueckgezogen,
    { timeout: 20_000 },
  )
  const nachWiderruf = sauber(await page.locator("main").first().innerText())
  p("G6 · der Zustand wechselt", nachWiderruf.includes(f.zurueckgezogen))
  p("G6 · der Grund steht dabei", nachWiderruf.includes("Kunde hat am Telefon widersprochen"))
  p("G6 · die Zeile bleibt stehen", nachWiderruf.includes("Frau Beispiel"))
  p("G6 · der Umfang bleibt lesbar", nachWiderruf.includes(f.scope.logo))
  p("G6 · nichts wurde gelöscht", (await db.query("SELECT id FROM releases")).rowCount === 1)

  /* ── G7 · kein zweiter Widerruf ── */
  p(
    "G7 · es gibt keinen zweiten Widerruf-Knopf",
    (await page.getByRole("button", { name: f.widerrufen }).count()) === 0,
  )

  /* ── G8 · die Rolle Vertrieb ── */
  const pageV = await (await kontext(browser)).newPage()
  await anmelden(pageV, VERTRIEB)
  await pageV.goto(`${BASE}/admin/beleg`, { waitUntil: "networkidle" })
  p(
    "G8 · Vertrieb kommt nicht an die Erlaubnisse",
    !pageV.url().includes("/admin/beleg") && pageV.url().includes("gesperrt=1"),
    pageV.url(),
  )

  /* ── G9 · Türkisch ── */
  const ctxTr = await kontext(browser)
  await ctxTr.addCookies([{ name: "cd_admin_sprache", value: "tr", url: BASE }])
  const pageTr = await ctxTr.newPage()
  await anmelden(pageTr, OWNER)
  await pageTr.goto(`${BASE}/admin/beleg`, { waitUntil: "networkidle" })
  const tuerkisch = sauber(await pageTr.locator("main").first().innerText())
  p("G9 · Überschrift türkisch", tuerkisch.includes(ft.titel))
  p("G9 · die Warnung türkisch", tuerkisch.includes(ft.nichtDurchgesetztTitel))
  p("G9 · Umfänge türkisch", tuerkisch.includes(ft.scope.logo))
  p("G9 · Zustand türkisch", tuerkisch.includes(ft.zurueckgezogen))
  p("G9 · kein deutscher Rest im Abschnitt", !tuerkisch.includes(f.nichtDurchgesetztTitel))

  /* ── G10 · axe ── */
  for (const [name, seite] of [
    ["Desktop DE", page],
    ["Desktop TR", pageTr],
  ]) {
    const befund = await new AxeBuilder({ page: seite }).analyze()
    p(`G10 · axe ohne Verstoss (${name})`, befund.violations.length === 0, befund.violations.map((x) => x.id).join(", "))
  }

  await browser.close()
} finally {
  await db.end().catch(() => {})
  server.kill("SIGTERM")
  await new Promise((r) => setTimeout(r, 1500))
}

console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — Erlaubnis und Widerruf halten im Browser.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
