#!/usr/bin/env node
/**
 * ADM-03 · KERNSCHLEIFE IM BROWSER — A03–A12, A26, A27 mit echter Persistenz.
 *
 * Gebauter Server (`next start`) mit `LEAD_STORE=pg-lokal` gegen eine frisch
 * angelegte WEGWERF-Datenbank (Schema + Bestand wie `db-migrate`), Chromium.
 * Probe-Zugangsdaten; nichts davon berührt Produktion.
 *
 *   E03 Website-Formular + von Hand erfasst → beide in der Inbox, richtige Quelle
 *   E03b Validierung: Fehler feldgenau, Eingaben bleiben; Doppelklick = eine Anfrage
 *   E04 ausdrücklich einer bestehenden Organisation zuordnen → nach Neuladen da
 *   E05 neuer Betrieb → EINE Organisation, auch bei zweiter Anfrage
 *   E06 Dublette erkannt → ausdrücklich archiviert, beide bleiben
 *   E07 nächster Schritt + Datum + Verantwortlicher → Übersicht zeigt ihn
 *   E08 Chance anlegen, Doppelklick → EINE Chance
 *   E09 Stufe ändern → Chronik „Neu → Qualifiziert“; zwei Tabs → Konflikt, nichts überschrieben
 *   E10 Verloren mit Grund → Verlust-Schleife zählt ihn
 *   E11 Gewonnen → nächster Betriebsschritt sichtbar, nichts automatisch
 *   E12 Kundenakte zeigt Anfrage + Chance
 *   E25 Drilldown (A25): jede Kennzahl = Zeilen der Liste dahinter
 *   E30 meAI (A30): nächster Schritt aus Regeln, mit Belegen in Menschensprache
 *   EP  Abmelden, neu anmelden → alles noch da
 *   E26 Mobil 390: Anfrage erfassen + nächster Schritt
 *   E27 Tastatur: Anfrage erfassen ohne Maus
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/admin-kernschleife-e2e.mjs
 */
import { spawn } from "node:child_process"
import pg from "pg"
import { chromium } from "playwright"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const PORT = 4398
const BASE = `http://127.0.0.1:${PORT}`
const DB = "drill_admin_e2e"
const ZIEL = `postgres://localhost/${DB}`
requireSafeTarget(ZIEL, "Kernschleife-E2E")
const OWNER = "probe-owner-nur-lokal"
const VERTRIEB = "probe-vertrieb-nur-lokal"

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

/* ── Datenbank frisch ── */
const admin = new pg.Client({ connectionString: "postgres://localhost/postgres" })
await admin.connect()
await admin.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`)
await admin.query(`CREATE DATABASE ${DB}`)
await admin.end()
const db = new pg.Client({ connectionString: ZIEL })
await db.connect()
const q = async (t, params) => (await db.query(t, params ?? [])).rows
process.env.LEAD_STORE = "pg-lokal"
const { SCHEMA, BACKFILL, seedBestand, applyExclusions } = await import("../lib/neon-client.ts")
for (const s of SCHEMA) await q(s)
for (const s of BACKFILL) await q(s)
await seedBestand({ query: q })
await applyExclusions({ query: q })

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: ["ignore", "ignore", "pipe"],
  env: {
    ...process.env, NODE_ENV: "production", LEAD_STORE: "pg-lokal", DATABASE_URL: ZIEL,
    ADMIN_PASSWORD: OWNER, ADMIN_PASSWORD_VERTRIEB: VERTRIEB,
    ADMIN_SESSION_SECRET: "probe-sitzung-nur-lokal-0123456789abcdef0123456789",
    LEAD_TOKEN_SECRET: "probe-token-nur-lokal", RESEND_API_KEY: "re_probe_ungueltig",
    LEAD_FROM: "creaDIG <probe@example.invalid>", LEAD_TO: "probe@example.invalid",
  },
})
let serverFehler = ""
server.stderr.on("data", (d) => { serverFehler += d })

let adresse = 0
const kontext = (browser, opts = {}) =>
  browser.newContext({ ...opts, extraHTTPHeaders: { "x-forwarded-for": `198.20.0.${++adresse}` } })
async function anmelden(page, pw = OWNER) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill("#password", pw)
  await page.locator("#password").press("Enter")
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20_000 })
}
async function erfassen(page, felder) {
  await page.goto(`${BASE}/admin/vertrieb/anfragen/neu`, { waitUntil: "networkidle" })
  if (felder.quelle) await page.selectOption("#quelle", felder.quelle)
  for (const [id, wert] of Object.entries(felder)) if (id !== "quelle" && id !== "verantwortlich") await page.fill(`#${id}`, wert)
  if (felder.verantwortlich) await page.selectOption("#verantwortlich", felder.verantwortlich)
  await page.getByRole("button", { name: "Anfrage anlegen" }).click()
  try {
    await page.waitForURL((u) => /\/admin\/vertrieb\/anfragen\/[0-9a-f-]{36}$/.test(u.pathname), { timeout: 20_000 })
  } catch (e) {
    await page.screenshot({ path: `${process.env.E2E_SCREENSHOTS ?? "/tmp"}/erfassen-fehler.png`, fullPage: true }).catch(() => {})
    console.log("     Seite:", (await page.locator("main").innerText().catch(() => "")).replace(/\s+/g, " ").slice(0, 300))
    console.log("     Server:", serverFehler.slice(-1500))
    console.log("     DB:", JSON.stringify(await q(`SELECT name, created_at FROM leads WHERE name = $1`, [felder.name])))
    console.log("     URL:", page.url())
    throw e
  }
  return page.url().split("/").pop()
}
const zahl = async (sql, params) => Number((await q(sql, params))[0].n)
/** Wartet, bis eine Bedingung gilt (Server Actions laufen nach dem Klick weiter). */
async function bis(pruefung, ms = 10_000) {
  const ende = Date.now() + ms
  for (;;) {
    try { if (await pruefung()) return true } catch { /* noch nicht */ }
    if (Date.now() > ende) return false
    await new Promise((r) => setTimeout(r, 200))
  }
}

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${BASE}/robots.txt`)).status < 500) break } catch { /* */ }
    if (i > 300) throw new Error("Server kam nicht hoch")
    await new Promise((r) => setTimeout(r, 150))
  }
  const browser = await chromium.launch()
  const ctx = await kontext(browser)
  const page = await ctx.newPage()
  await anmelden(page)

  console.log("\nE03 · Eingang: Website und von Hand")
  const tok = await (await fetch(`${BASE}/api/lead`, { headers: { "x-forwarded-for": "198.20.9.1" } })).json()
  await new Promise((r) => setTimeout(r, 2200))
  const web = await fetch(`${BASE}/api/lead`, {
    method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "198.20.9.1" },
    body: JSON.stringify({ token: tok.token, name: "Web Probe", email: "web.probe@example.org", phone: "0441 555", business: "Web Probe Betrieb", message: "über das Formular", source: "kontakt", locale: "de", privacyOk: true }),
  })
  p((await zahl(`SELECT count(*) n FROM leads WHERE email = 'web.probe@example.org'`)) === 1, "Website-Anfrage gespeichert (auch wenn der Mailversand scheitert)", `HTTP ${web.status}`)
  const idHand = await erfassen(page, { quelle: "telefon", name: "Hand Probe", betrieb: "Hand Probe Werkstatt", telefon: "+49 441 777888", nachricht: "Rückruf erbeten", verantwortlich: "owner" })
  await page.goto(`${BASE}/admin/vertrieb/anfragen`, { waitUntil: "networkidle" })
  const inbox = await page.getByRole("table", { name: /Anfragen mit Nummer/ }).locator("tbody").innerText()
  p(inbox.includes("Web Probe") && inbox.includes("Kontaktformular"), "Website-Anfrage in der Inbox, Quelle Kontaktformular")
  p(inbox.includes("Hand Probe") && inbox.includes("Telefon"), "Hand-Anfrage in der Inbox, Quelle Telefon")

  console.log("\nE03b · Validierung und Doppelklick")
  await page.goto(`${BASE}/admin/vertrieb/anfragen/neu`, { waitUntil: "networkidle" })
  await page.fill("#betrieb", "Nur Betrieb")
  await page.getByRole("button", { name: "Anfrage anlegen" }).click()
  await page.locator("#name-fehler").waitFor({ timeout: 10_000 })
  p(await page.locator("#name-fehler").isVisible() && await page.locator("#kontakt-fehler").isVisible(), "Name und Kontakt als Fehler benannt")
  p((await page.getAttribute("#name", "aria-invalid")) === "true" && (await page.getAttribute("#name", "aria-describedby")) === "name-fehler", "Fehler am Feld verbunden (aria)")
  p((await page.inputValue("#betrieb")) === "Nur Betrieb", "Eingabe bleibt stehen")
  await page.fill("#name", "Doppel Probe")
  await page.fill("#telefon", "+49 441 101010")
  await page.getByRole("button", { name: "Anfrage anlegen" }).dblclick()
  await page.waitForURL((u) => /\/anfragen\/[0-9a-f-]{36}$/.test(u.pathname), { timeout: 20_000 })
  await new Promise((r) => setTimeout(r, 1000))
  p((await zahl(`SELECT count(*) n FROM leads WHERE name = 'Doppel Probe'`)) === 1, "Doppelklick = eine Anfrage")

  console.log("\nE04 · Organisation ausdrücklich zuordnen")
  const org = (await q(`SELECT id, name FROM organisations WHERE import_key IS NOT NULL AND excluded_reason IS NULL ORDER BY name LIMIT 1`))[0]
  await page.goto(`${BASE}/admin/vertrieb/anfragen/${idHand}`, { waitUntil: "networkidle" })
  await page.selectOption("#organisation", org.id)
  await page.locator("#organisation").locator("xpath=ancestor::form").getByRole("button").click()
  await page.waitForLoadState("networkidle")
  await page.reload({ waitUntil: "networkidle" })
  p((await page.inputValue("#organisation")) === org.id, `nach Neuladen zugeordnet: ${org.name}`)

  console.log("\nE05 · Neuer Betrieb nur einmal")
  await erfassen(page, { quelle: "email", name: "Neu Probe A", betrieb: "E2E Neuer Betrieb", email: "a@e2e-neu.example", verantwortlich: "vertrieb" })
  await erfassen(page, { quelle: "email", name: "Neu Probe B", betrieb: "e2e neuer betrieb", email: "b@e2e-neu.example" })
  p((await zahl(`SELECT count(*) n FROM organisations WHERE lower(name) = 'e2e neuer betrieb'`)) === 1, "eine Organisation für zwei Anfragen (Groß-/Kleinschreibung egal)")

  console.log("\nE06 · Dublette")
  const idDoppel = await erfassen(page, { quelle: "telefon", name: "Hand Probe", telefon: "+49 441 777888", nachricht: "ruft nochmal an" })
  const kandidat = page.locator("#dubletten-titel").locator("xpath=ancestor::section").getByRole("link", { name: /Hand Probe Werkstatt/ })
  p(await kandidat.first().waitFor({ timeout: 10_000 }).then(() => true).catch(() => false), "erste Anfrage als mögliche Dublette angezeigt")
  await page.getByRole("button", { name: "Diese Anfrage als Dublette hiervon archivieren" }).first().click()
  const archiviert = await bis(async () => (await q(`SELECT handling_status FROM leads WHERE id = $1`, [idDoppel]))[0].handling_status === "archiviert")
  const d = (await q(`SELECT handling_status, archive_reason, duplicate_of FROM leads WHERE id = $1`, [idDoppel]))[0]
  p(archiviert && d.archive_reason === "dublette" && d.duplicate_of === idHand, "archiviert mit Bezug", JSON.stringify({ ...d, erwartet: idHand }))
  p((await zahl(`SELECT count(*) n FROM leads WHERE id IN ($1,$2)`, [idHand, idDoppel])) === 2, "beide bestehen weiter")

  console.log("\nE07 · Nächster Schritt → Übersicht")
  await page.goto(`${BASE}/admin/vertrieb/anfragen/${idHand}`, { waitUntil: "networkidle" })
  await page.fill("#nextAction", "Rückruf Hand Probe")
  await page.fill("#nextActionAt", "2020-01-02")
  await page.locator("#nextAction").locator("xpath=ancestor::form").getByRole("button").click()
  await page.waitForLoadState("networkidle")
  await page.selectOption("#verantwortlich", "vertrieb")
  await page.locator("#verantwortlich").locator("xpath=ancestor::form").getByRole("button").click()
  await page.waitForLoadState("networkidle")
  /* OHNE Neuladen: Die Anzeige muss den gespeicherten Stand zeigen (verdeckte die loading.tsx-Regression). */
  p(await page.waitForFunction(() => document.querySelector("#schritt-titel")?.closest("section")?.querySelector("p")?.textContent?.includes("Rückruf Hand Probe"), null, { timeout: 8000 }).then(() => true).catch(() => false), "Anzeige ohne Neuladen aktualisiert")
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  const heute = await page.locator("#heute-titel").locator("xpath=ancestor::section").innerText()
  p(heute.includes("Rückruf Hand Probe") && heute.includes("Überfällig"), "Übersicht: überfälliger Schritt der Anfrage")
  const kachel = await page.locator("section[aria-label='Kennzahlen heute'] li").first().innerText()
  p(/Überfällig\s*\n?\s*[1-9]/.test(kachel), "Kennzahl Überfällig ≥ 1", kachel.replace(/\s+/g, " "))

  console.log("\nE08 · Chance anlegen, Doppelklick")
  await page.goto(`${BASE}/admin/vertrieb/anfragen/${idHand}`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Verkaufschance anlegen" }).dblclick()
  await page.waitForLoadState("networkidle")
  await new Promise((r) => setTimeout(r, 1500))
  p((await zahl(`SELECT count(*) n FROM opportunities WHERE from_lead_id = $1`, [idHand])) === 1, "eine Chance")
  const oppId = (await q(`SELECT id FROM opportunities WHERE from_lead_id = $1`, [idHand]))[0].id

  console.log("\nE09 · Stufe, Historie, Konflikt")
  const tab2 = await ctx.newPage()
  await page.goto(`${BASE}/admin/vertrieb/pipeline/${oppId}`, { waitUntil: "networkidle" })
  await tab2.goto(`${BASE}/admin/vertrieb/pipeline/${oppId}`, { waitUntil: "networkidle" })
  await page.selectOption("#status", "qualified")
  await page.getByRole("button", { name: "Status speichern" }).click()
  await bis(async () => (await q(`SELECT status FROM opportunities WHERE id = $1`, [oppId]))[0].status === "qualified")
  await page.reload({ waitUntil: "networkidle" })
  const chronik = await page.locator("#chronik-titel").locator("xpath=ancestor::section").innerText()
  if (!chronik.includes("Neu → Qualifiziert")) console.log("     Chronik:", chronik.replace(/\s+/g, " ").slice(0, 500))
  p(chronik.includes("Stufe geändert") && chronik.includes("Neu → Qualifiziert") && chronik.includes("Owner · Mensch"), "Chronik: Neu → Qualifiziert, Owner · Mensch")
  await tab2.selectOption("#status", "proposal")
  await tab2.getByRole("button", { name: "Status speichern" }).click()
  const konfliktSichtbar = await tab2.getByRole("alert").filter({ hasText: "inzwischen von jemand anderem geändert" }).waitFor({ timeout: 10_000 }).then(() => true).catch(() => false)
  if (!konfliktSichtbar) console.log("     Tab 2:", tab2.url(), (await tab2.locator("main").innerText().catch(() => "")).replace(/\s+/g, " ").slice(0, 400))
  p(konfliktSichtbar, "zweiter Tab: Konflikt angezeigt")
  p((await q(`SELECT status FROM opportunities WHERE id = $1`, [oppId]))[0].status === "qualified", "nichts überschrieben")

  console.log("\nE10 · Verloren mit Grund")
  const idVerlust = await erfassen(page, { quelle: "empfehlung", name: "Verlust Probe", betrieb: "Verlust Probe GmbH", email: "v@verlust.example" })
  await page.getByRole("button", { name: "Verkaufschance anlegen" }).click()
  await bis(async () => (await zahl(`SELECT count(*) n FROM opportunities WHERE from_lead_id = $1`, [idVerlust])) === 1)
  const verlustOpp = (await q(`SELECT id FROM opportunities WHERE from_lead_id = $1`, [idVerlust]))[0].id
  await page.goto(`${BASE}/admin/vertrieb/pipeline/${verlustOpp}`, { waitUntil: "networkidle" })
  await page.selectOption("#status", "lost")
  await page.selectOption("#lostReason", "Zeitpunkt passt nicht")
  await page.getByRole("button", { name: "Status speichern" }).click()
  p(await bis(async () => (await q(`SELECT status, lost_reason FROM opportunities WHERE id = $1`, [verlustOpp]))[0].lost_reason === "Zeitpunkt passt nicht"), "verloren mit Grund gespeichert")
  await page.goto(`${BASE}/admin/vertrieb/verlust`, { waitUntil: "networkidle" })
  p((await page.locator("main").innerText()).includes("Zeitpunkt passt nicht"), "Verlust-Schleife zeigt den Grund")

  console.log("\nE11 · Gewonnen")
  await page.goto(`${BASE}/admin/vertrieb/pipeline/${oppId}`, { waitUntil: "networkidle" })
  await page.selectOption("#status", "won")
  await page.getByRole("button", { name: "Status speichern" }).click()
  p(await bis(async () => (await q(`SELECT status FROM opportunities WHERE id = $1`, [oppId]))[0].status === "won"), "gewonnen gespeichert")
  await page.reload({ waitUntil: "networkidle" })
  const main = await page.locator("main").innerText()
  p(main.includes("Gewonnen — der nächste Schritt im Betrieb") && main.includes("Noch kein angenommenes Angebot"), "nächster Betriebsschritt sichtbar")
  p((await zahl(`SELECT count(*) n FROM projects WHERE opportunity_id = $1`, [oppId])) === 0, "kein Projekt automatisch angelegt")

  console.log("\nE30 · meAI: nächster Schritt mit Beleg, ohne KI (A30)")
  const meai = page.locator("[data-meai]")
  const meaiText = await meai.innerText().catch(() => "")
  p(meaiText.includes("aus Regeln") && meaiText.includes("keine KI eingerichtet") && meaiText.includes("Regelwerk") && !meaiText.includes("die Belege tragen es"), "Quelle sichtbar: aus Regeln, keine KI", meaiText.replace(/\s+/g, " ").slice(0, 160))
  const belege = await meai.locator("[data-belege] li").allInnerTexts()
  p(belege.length > 0, "der Vorschlag nennt seine Belege", belege.join(" | "))
  p(belege.every((b) => !/\b(true|false|won)\b/.test(b)) && belege.some((b) => b.includes("Angebotsart nicht gewählt")), "Belege in Menschensprache (H21); ohne Angebotsart ist die Reife offen, nicht erfüllt (H24)", belege.join(" | "))
  await meai.screenshot({ path: process.env.E2E_SHOT_DIR ? `${process.env.E2E_SHOT_DIR}/meai-a30.png` : "/dev/null" }).catch(() => {})

  console.log("\nE25 · Drilldown: jede Zahl führt zu genau den Zeilen, die sie zählt")
  {
    /* Fälligkeiten herstellen — je Art überfällig UND heute, damit keine Seite leer aufgeht. */
    const heute = (await q(`SELECT (now() AT TIME ZONE 'Europe/Berlin')::date::text AS d`))[0].d
    await q(`UPDATE leads SET next_action = 'Probe', next_action_at = $1::date - 3 WHERE id = $2`, [heute, idVerlust])
    /* nur das Datum — EP prüft den Schritttext später */
    await q(`UPDATE leads SET next_action_at = $1::date WHERE id = $2`, [heute, idHand])
    /* Drei offene Chancen über die Oberfläche: überfällig, heute, ohne Schritt. */
    const offen = []
    for (const name of ["Drill Eins", "Drill Zwei", "Drill Drei"]) {
      const lid = await erfassen(page, { quelle: "telefon", name, betrieb: `${name} GmbH`, telefon: "+49 441 424242" })
      await page.getByRole("button", { name: "Verkaufschance anlegen" }).click()
      await bis(async () => (await zahl(`SELECT count(*) n FROM opportunities WHERE from_lead_id = $1`, [lid])) === 1)
      offen.push((await q(`SELECT id FROM opportunities WHERE from_lead_id = $1`, [lid]))[0].id)
    }
    await q(`UPDATE opportunities SET next_action = 'Probe', next_action_at = $1::date - 2 WHERE id = $2`, [heute, offen[0]])
    await q(`UPDATE opportunities SET next_action = 'Probe', next_action_at = $1::date WHERE id = $2`, [heute, offen[1]])
    await q(`UPDATE opportunities SET next_action = NULL, next_action_at = NULL WHERE id = $1`, [offen[2]])

    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
    const kachel = async (key) => Number(await page.locator(`[data-kennzahl="${key}"]`).innerText())
    const teile = async (key) => page.locator(`[data-teil^="${key}-"]`).evaluateAll((els) => els.map((e) => e.getAttribute("href")))
    const zeilen = async (href) => {
      await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" })
      return page.locator("main table tbody tr").count()
    }
    for (const key of ["ueberfaellig", "heuteFaellig"]) {
      await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
      const n = await kachel(key)
      const wege = await teile(key)
      let summe = 0
      for (const w of wege) summe += await zeilen(w)
      p(wege.length === 2 && n === summe && n >= 2, `${key}: Kachel ${n} = Chancen + Anfragen dahinter`, `${wege.join(" + ")} = ${summe}`)
    }
    for (const [key, href] of [["neueAnfragen", "/admin/vertrieb/anfragen?status=neu"], ["ohneSchritt", "/admin/vertrieb/pipeline?bucket=ohne-schritt"]]) {
      await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
      const n = await kachel(key)
      const ziel = await page.locator(`[data-kennzahl="${key}"]`).locator("xpath=ancestor::a").getAttribute("href")
      const z = await zeilen(ziel)
      p(ziel === href && n === z && n > 0, `${key}: Kachel ${n} = ${z} Zeilen hinter ${ziel}`)
    }
    /* Der Filter bleibt beim Suchen stehen — sonst zeigt die zweite Seite eine andere Menge als die Zahl. */
    await page.goto(`${BASE}/admin/vertrieb/anfragen?faellig=ueberfaellig`, { waitUntil: "networkidle" })
    p(await page.locator('input[type="hidden"][name="faellig"]').count() === 1 && await page.locator("[data-filter-faellig]").isVisible(), "Fälligkeitsfilter sichtbar und bleibt bei der Suche erhalten")
  }

  console.log("\nE12 · Kundenakte")
  await page.goto(`${BASE}/admin/kunden/${org.id}`, { waitUntil: "networkidle" })
  const akte = await page.locator("main").innerText()
  const refHand = (await q(`SELECT reference FROM leads WHERE id = $1`, [idHand]))[0].reference
  p(akte.includes(refHand), "Anfrage in der Akte", refHand)
  p(akte.includes("Hand Probe Werkstatt") || akte.includes("Gewonnen"), "Chance in der Akte")

  console.log("\nEP · Abmelden, neu anmelden")
  await page.getByRole("button", { name: "Abmelden" }).first().click()
  await page.waitForURL((u) => u.pathname.startsWith("/admin/login"), { timeout: 15_000 })
  await anmelden(page, VERTRIEB)
  await page.goto(`${BASE}/admin/vertrieb/anfragen/${idHand}`, { waitUntil: "networkidle" })
  p((await page.inputValue("#nextAction")) === "Rückruf Hand Probe" && (await page.inputValue("#verantwortlich")) === "vertrieb", "Schritt und Verantwortlicher nach Neuanmeldung (andere Rolle)")
  p((await page.inputValue("#organisation")) === org.id, "Zuordnung nach Neuanmeldung")

  console.log("\nE26 · Mobil 390")
  const mob = await kontext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true })
  const m = await mob.newPage()
  await anmelden(m)
  const idMobil = await erfassen(m, { quelle: "persoenlich", name: "Mobil Probe", telefon: "+49 441 303030" })
  p((await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0, "Anfrage-Detail ohne waagerechten Überlauf")
  await m.fill("#nextAction", "Angebot schicken")
  await m.fill("#nextActionAt", "2030-01-01")
  await m.locator("#nextAction").locator("xpath=ancestor::form").getByRole("button").tap()
  p(await bis(async () => (await q(`SELECT next_action FROM leads WHERE id = $1`, [idMobil]))[0].next_action === "Angebot schicken"), "nächster Schritt mobil gespeichert")
  await m.goto(`${BASE}/admin/vertrieb/anfragen`, { waitUntil: "networkidle" })
  p((await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0, "Liste: Tabelle scrollt nur in ihrem Behälter")
  await mob.close()

  console.log("\nE27 · Tastatur")
  const kb = await kontext(browser)
  const k = await kb.newPage()
  await anmelden(k)
  await k.goto(`${BASE}/admin/vertrieb/anfragen/neu`, { waitUntil: "networkidle" })
  await k.focus("#quelle")
  await k.keyboard.press("Tab"); await k.keyboard.type("Tastatur Probe")
  await k.keyboard.press("Tab"); await k.keyboard.type("Tastatur GmbH")
  await k.keyboard.press("Tab"); await k.keyboard.type("tastatur@probe.example")
  await k.keyboard.press("Tab"); await k.keyboard.press("Tab"); await k.keyboard.type("per Tastatur erfasst")
  await k.keyboard.press("Tab"); await k.keyboard.press("Tab")
  const fokus = await k.evaluate(() => document.activeElement?.textContent)
  await k.keyboard.press("Enter")
  await k.waitForURL((u) => /\/anfragen\/[0-9a-f-]{36}$/.test(u.pathname), { timeout: 20_000 })
  p(fokus === "Anfrage anlegen", "Fokusreihenfolge endet auf „Anfrage anlegen“", String(fokus))
  p((await zahl(`SELECT count(*) n FROM leads WHERE name = 'Tastatur Probe' AND message = 'per Tastatur erfasst'`)) === 1, "ohne Maus erfasst")
  await kb.close()

  await browser.close()
} finally {
  server.kill("SIGTERM")
  await db.end()
}
if (/Error|FEHL/i.test(serverFehler) && !/re_probe|send_failed|Resend|alarm/i.test(serverFehler)) console.log(`\nServer-Protokoll:\n${serverFehler.slice(0, 1500)}`)
console.log(fehler ? `\n${fehler} Pruefung(en) fehlgeschlagen.\n` : "\nAlle Pruefungen bestanden — die Kernschleife haelt im Browser.\n")
process.exit(fehler ? 1 : 0)
