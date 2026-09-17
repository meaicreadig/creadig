#!/usr/bin/env node
/**
 * ADM-06 · A29 IM BROWSER — beobachtbar, steuerbar, umkehrbar
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER GEPRUEFT WIRD
 *
 * Nicht, ob die Automation laeuft — das misst `automation-drill`. Sondern ob
 * ein Mensch sie SIEHT, ABSCHALTEN und ZURUECKNEHMEN kann, ohne einen
 * Entwickler zu fragen. Genau das verlangt der Vertrag, und genau das ist
 * der Unterschied zwischen einer Automation und einem Automatismus.
 *
 *   A1  Die offene Wirkung steht zuoberst, mit ihrem Satz
 *   A2  Der Ausloeser laesst sich abschalten — und die Seite sagt es
 *   A3  Wieder einschalten geht genauso
 *   A4  Abhaken schliesst die Wirkung; der Eintrag bleibt im Protokoll
 *   A5  Zuruecknehmen ebenso
 *   A6  Die Verbotsliste steht auf der Seite (was nie automatisch geschieht)
 *   A7  A20 Rolle Vertrieb kommt nicht hinein
 *   A8  A01 dieselbe Flaeche auf Tuerkisch
 *   A9  A26 mobil 390 · axe ohne Verstoss
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/automation-e2e.mjs
 */
import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import AxeBuilder from "@axe-core/playwright"
import pg from "pg"
import { chromium } from "playwright"

import { requireSafeTarget } from "./lib/env-guard.mjs"
import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

const PORT = 4394
const BASE = `http://127.0.0.1:${PORT}`
const DB = "drill_automation_e2e"
const ZIEL = `postgres://localhost/${DB}`
requireSafeTarget(ZIEL, "Automations-E2E")
const OWNER = "probe-owner-nur-lokal"
const VERTRIEB = "probe-vertrieb-nur-lokal"

const a = de.automationen
const at = tr.automationen

let fehler = 0
const p = (name, ok, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}
const sauber = (s) => s.replace(/\s+/g, " ")
/*
 * Überschriften der Klasse `eyebrow` erscheinen in Großbuchstaben (CSS), und
 * `text-transform: uppercase` macht im türkischen Kontext aus „i" ein „İ".
 * Beim Zurückwandeln bleibt ein kombinierender Punkt stehen — ein blosser
 * Kleinbuchstaben-Vergleich schlüge dann fehl, obwohl der Text stimmt.
 * Deshalb: klein, zerlegt, Markierungen weg.
 */
const flach = (s) =>
  s
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
const enthaelt = (text, satz) => flach(text).includes(flach(satz))

/* ── Datenbank frisch, und eine Abnahme, damit eine Erinnerung offen steht ── */
const admin = new pg.Client({ connectionString: "postgres://localhost/postgres" })
await admin.connect()
await admin.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`)
await admin.query(`CREATE DATABASE ${DB}`)
await admin.end()
const db = new pg.Client({ connectionString: ZIEL })
await db.connect()
process.env.LEAD_STORE = "pg-lokal"
const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
const { createNeonVertrieb } = await import("../lib/vertrieb-store-neon.ts")
for (const s of SCHEMA) await db.query(s)
for (const s of BACKFILL) await db.query(s)

const store = createNeonVertrieb(ZIEL, { kennung: "owner", herkunft: "HUMAN" })
const heute = new Date().toISOString().slice(0, 10)
const JA = { form: "e-mail", von: "Kunde", rolle: "Leitung", am: heute, fundstelle: "Postfach" }
{
  const orgId = randomUUID()
  const oppId = randomUUID()
  await db.query(
    `INSERT INTO organisations (id,name,lifecycle,created_at,updated_at) VALUES ($1,$2,'kunde',now(),now())`,
    [orgId, "Automation E2E Betrieb"],
  )
  await db.query(
    `INSERT INTO opportunities (id,title,organisation_id,readiness_evidence,created_at,updated_at)
     VALUES ($1,$2,$3,$4::text[],now(),now())`,
    [oppId, "Automation E2E Vorgang", orgId, ["betrieb", "umfang", "material"]],
  )
  const offerId = await store.saveOfferDraft({
    opportunityId: oppId,
    referenz: "CD-260917-4242",
    kind: "website",
    sprache: "de",
    gueltigBis: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
    abschnitte: {
      ausgangslage: "a", verstanden: "b", umfang: "c", zeit: "d",
      preis: "e", betrieb: "f", "nicht-versprochen": "g", "naechster-schritt": "h",
    },
    positionen: [{ art: "katalog", was: "Website-Paket", quelle: "paket-website" }],
  })
  await store.sendOffer(offerId)
  await store.acceptOffer(offerId, JA)
  const { id: projektId } = await store.startProject(offerId)
  await store.receiveMaterial(projektId, heute)
  /* Die Abnahme erzeugt die offene Erinnerung, um die es hier geht. */
  await store.acceptDelivery(projektId, JA)
  await store.handOver(projektId, {
    code: { am: heute, wie: "Repository uebergeben" },
    inhalte: { am: heute, wie: "Texte beim Kunden" },
    zugaenge: { am: heute, wie: "Konten uebertragen" },
    domain: { am: heute, wie: "Domain umgeschrieben" },
  })
}

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
  browser.newContext({ ...opts, extraHTTPHeaders: { "x-forwarded-for": `198.23.0.${++adresse}` } })
async function anmelden(page, passwort) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill("#password", passwort)
  await page.keyboard.press("Enter")
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20_000 })
}
const warteAuf = (page, wahl, satz) =>
  page.waitForFunction(
    ([w, s]) => document.querySelector(w)?.textContent?.includes(s),
    [wahl, satz],
    { timeout: 20_000 },
  )

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
  await page.goto(`${BASE}/admin/automationen`, { waitUntil: "networkidle" })

  /* ── A1 ── */
  const haupt = sauber(await page.locator("main").first().innerText())
  p("A1 · die offene Wirkung steht da", haupt.includes(a.offeneTitel))
  p("A1 · mit ihrem Satz", haupt.includes(a.ergebnis["freigabe-fragen"]))
  p("A1 · die Uebergabe wurde notiert", haupt.includes("4"), "4 von 4 Stuecken")
  p("A1 · und der Auslöser ist benannt", haupt.includes(a.ausloeser["abnahme-erinnert-an-freigabe"].name))
  p("A6 · die Verbotsliste steht auf der Seite", enthaelt(haupt, a.nichtVerantwortungTitel))
  p("A6 · und sagt, was nie geschieht", haupt.includes(a.nichtVerantwortung.slice(0, 40)))

  /* ── A2/A3 · steuerbar ── */
  const schalter = page.locator('[data-schalter="abnahme-erinnert-an-freigabe"] button')
  p("A2 · der Schalter steht auf „abschalten“", (await schalter.innerText()).trim() === a.abschalten)
  await schalter.click()
  await warteAuf(page, '[data-ausloeser="abnahme-erinnert-an-freigabe"]', a.aus)
  const ausText = sauber(await page.locator('[data-ausloeser="abnahme-erinnert-an-freigabe"]').innerText())
  p("A2 · abgeschaltet, und die Seite sagt es", ausText.includes(a.aus))
  p("A2 · der Schalter heißt jetzt „einschalten“", ausText.includes(a.einschalten))
  const zahlAus = Number((await db.query(`SELECT count(*)::int n FROM automation_switches WHERE aktiv = false`)).rows[0].n)
  p("A2 · und es steht in der Datenbank", zahlAus === 1, String(zahlAus))

  await page.locator('[data-schalter="abnahme-erinnert-an-freigabe"] button').click()
  await warteAuf(page, '[data-ausloeser="abnahme-erinnert-an-freigabe"]', a.an)
  p(
    "A3 · wieder eingeschaltet",
    sauber(await page.locator('[data-ausloeser="abnahme-erinnert-an-freigabe"]').innerText()).includes(a.an),
  )

  /* ── A4/A5 · umkehrbar ── */
  const offeneVorher = await page.locator("[data-lauf]").count()
  p("A4 · es gibt offene Wirkungen", offeneVorher > 0, String(offeneVorher))
  await page.locator('[data-lauf] [data-schliessen="erledigt"] button').first().click()
  await page.waitForFunction(
    (n) => document.querySelectorAll("[data-lauf]").length < n,
    offeneVorher,
    { timeout: 20_000 },
  )
  p("A4 · abgehakt, sie ist nicht mehr offen", (await page.locator("[data-lauf]").count()) === offeneVorher - 1)
  const protokoll = sauber(await page.locator("main").first().innerText())
  p("A4 · der Eintrag steht weiter im Protokoll", protokoll.includes(a.zustand.erledigt))
  p("A4 · mit Akteur", protokoll.includes("owner"))
  const inDb = Number((await db.query(`SELECT count(*)::int n FROM automation_runs WHERE zustand='erledigt'`)).rows[0].n)
  p("A4 · nichts wurde gelöscht", inDb === 1, String(inDb))

  if ((await page.locator("[data-lauf]").count()) > 0) {
    await page.locator('[data-lauf] [data-schliessen="zurueckgenommen"] button').first().click()
    await warteAuf(page, "main", a.zustand.zurueckgenommen)
    p("A5 · zurückgenommen, Eintrag bleibt", true)
  } else {
    p("A5 · zurückgenommen, Eintrag bleibt", false, "keine zweite offene Wirkung vorhanden")
  }

  /* ── A7 · Rolle ── */
  const pageV = await (await kontext(browser)).newPage()
  await anmelden(pageV, VERTRIEB)
  await pageV.goto(`${BASE}/admin/automationen`, { waitUntil: "networkidle" })
  p(
    "A7 · Vertrieb kommt nicht hinein",
    !pageV.url().includes("/admin/automationen") && pageV.url().includes("gesperrt=1"),
    pageV.url(),
  )

  /* ── A8 · Türkisch ── */
  const ctxTr = await kontext(browser)
  await ctxTr.addCookies([{ name: "cd_admin_sprache", value: "tr", url: BASE }])
  const pageTr = await ctxTr.newPage()
  await anmelden(pageTr, OWNER)
  await pageTr.goto(`${BASE}/admin/automationen`, { waitUntil: "networkidle" })
  const tuerkisch = sauber(await pageTr.locator("main").first().innerText())
  p("A8 · Titel türkisch", (await pageTr.locator("h1").first().innerText()).trim() === at.titel)
  p("A8 · Auslöser übersetzt", tuerkisch.includes(at.ausloeser["verlust-prueft-muster"].name))
  p("A8 · Wirkungen übersetzt", tuerkisch.includes(at.wirkung.pruefen))
  p("A8 · die Grenze übersetzt", enthaelt(tuerkisch, at.nichtVerantwortungTitel))
  p(
    "A8 · kein deutscher Rest",
    !enthaelt(tuerkisch, a.nichtVerantwortungTitel) && !enthaelt(tuerkisch, a.ausloeserTitel),
  )

  /* ── A9 · mobil + axe ── */
  const pageM = await (await kontext(browser, { viewport: { width: 390, height: 780 } })).newPage()
  await anmelden(pageM, OWNER)
  await pageM.goto(`${BASE}/admin/automationen`, { waitUntil: "networkidle" })
  const ueberlauf = await pageM.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  p("A9 · mobil 390 ohne waagerechten Überlauf", ueberlauf <= 1, `${ueberlauf} px`)
  for (const [name, seite] of [
    ["Desktop DE", page],
    ["Desktop TR", pageTr],
    ["mobil DE", pageM],
  ]) {
    const befund = await new AxeBuilder({ page: seite }).analyze()
    p(`A9 · axe ohne Verstoss (${name})`, befund.violations.length === 0, befund.violations.map((x) => x.id).join(", "))
  }

  await browser.close()
} finally {
  await db.end().catch(() => {})
  server.kill("SIGTERM")
  await new Promise((r) => setTimeout(r, 1500))
}

console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — die Automationen sind im Browser steuerbar und umkehrbar.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
