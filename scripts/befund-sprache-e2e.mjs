#!/usr/bin/env node
/**
 * ADM-05 · H21 IM BROWSER — was der Server findet, in der Sprache des Menschen
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE LUECKE, DIE DIESER LAUF SCHLIESST
 *
 * Das Sprach-Gate zaehlt sichtbaren deutschen Text im JSX. Die Befunde der
 * Angebots- und Lieferkette standen aber nicht im JSX: Sie entstanden als
 * fertige deutsche SAETZE im Server und kamen ueber eine Server Action in
 * die Oberflaeche — auch in die tuerkische. Kein Gate konnte das sehen, weil
 * an der Stelle, an der sie erscheinen, nur `{b.satz}` steht.
 *
 * Deshalb wird es hier GEMESSEN, an der laufenden Anwendung, auf Tuerkisch:
 *
 *   S1  Ein unvollstaendiges Angebot senden → die Befunde sind tuerkisch
 *   S2  Und ausdruecklich NICHT deutsch (der alte Satz kommt nicht mehr vor)
 *   S3  Die Reifekriterien sind tuerkisch
 *   S4  Die Abschnittsueberschriften des Angebots bleiben DEUTSCH — sie
 *       benennen ein Dokument, das der Kunde auf Deutsch bekommt
 *   S5  Dieselbe Stelle auf Deutsch zeigt die deutschen Saetze
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/befund-sprache-e2e.mjs
 */
import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import pg from "pg"
import { chromium } from "playwright"

import { requireSafeTarget } from "./lib/env-guard.mjs"
import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

const PORT = 4396
const BASE = `http://127.0.0.1:${PORT}`
const DB = "drill_befund_e2e"
const ZIEL = `postgres://localhost/${DB}`
requireSafeTarget(ZIEL, "Befund-Sprach-E2E")
const OWNER = "probe-owner-nur-lokal"

let fehler = 0
const p = (name, ok, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}
const sauber = (s) => s.replace(/\s+/g, " ")

/* ── Datenbank frisch, mit einem Vorgang ohne Belege ── */
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

const orgId = randomUUID()
const oppId = randomUUID()
await db.query(
  `INSERT INTO organisations (id,name,lifecycle,created_at,updated_at) VALUES ($1,$2,'prospect',now(),now())`,
  [orgId, "Befund Sprachprobe"],
)
/* Angebotsart gesetzt, ABER kein einziger Beleg — damit sind die Reifekriterien offen. */
await db.query(
  `INSERT INTO opportunities (id,title,organisation_id,offer_kind,created_at,updated_at)
   VALUES ($1,$2,$3,'website',now(),now())`,
  [oppId, "Befund Sprachprobe Vorgang", orgId],
)

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: ["ignore", "ignore", "pipe"],
  env: {
    ...process.env,
    NODE_ENV: "production",
    LEAD_STORE: "pg-lokal",
    DATABASE_URL: ZIEL,
    ADMIN_PASSWORD: OWNER,
    ADMIN_SESSION_SECRET: "probe-sitzung-nur-lokal-0123456789abcdef0123456789",
  },
})

let serverFehler = ""
server.stderr.on("data", (d) => { serverFehler += d })

let adresse = 0
async function seite(browser, sprache) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": `198.22.0.${++adresse}` } })
  await ctx.addCookies([{ name: "cd_admin_sprache", value: sprache, url: BASE }])
  const page = await ctx.newPage()
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill("#password", OWNER)
  await page.keyboard.press("Enter")
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20_000 })
  await page.goto(`${BASE}/admin/vertrieb/pipeline/${oppId}`, { waitUntil: "networkidle" })
  return page
}

/**
 * Entwurf anlegen und senden — der Entwurf ist absichtlich unvollstaendig.
 *
 * Gefuellt wird nur, was der ENTWURF braucht (ein Entwurf wird nicht
 * geprueft). Alles, was erst beim SENDEN verlangt wird — Pflichtabschnitte,
 * Positionen, Belege —, bleibt leer: Genau deren Befunde sind das Ziel
 * dieses Laufs.
 */
async function sendenVersuchen(page, t) {
  await page.fill("#a-gueltig", "2026-12-31")
  /* Beim ersten Mal heisst der Knopf „anlegen", danach „speichern" — beide meinen dieselbe Handlung. */
  const entwurfKnopf = page.getByRole("button", { name: t.angebotMappe.entwurfAnlegen }).first()
  await ((await entwurfKnopf.count())
    ? entwurfKnopf
    : page.getByRole("button", { name: t.angebotMappe.entwurfSpeichern }).first()
  ).click()
  await page
    .waitForFunction(
      (satz) => document.querySelector("main")?.textContent?.includes(satz),
      t.angebotMappe.entwurfGespeichert,
      { timeout: 25_000 },
    )
    .catch(async () => {
      console.log("     DEBUG Seite:", sauber(await page.locator("main").first().innerText()).slice(0, 700))
      throw new Error("Entwurf wurde nicht gespeichert")
    })
  await page.getByRole("button", { name: t.angebotMappe.angebotSenden }).first().click()
  /* Gewartet wird auf EINEN bestimmten Befund — nicht auf eine Ueberschrift,
     deren Anfang sich in beiden Sprachen unterscheidet. */
  await page
    .waitForFunction(
      (satz) => document.querySelector("main")?.textContent?.includes(satz),
      t.befunde.code["keine-position"],
      { timeout: 25_000 },
    )
    .catch(async () => {
      console.log("     DEBUG Senden:", sauber(await page.locator("main").first().innerText()).slice(0, 900))
      throw new Error("Die Befunde kamen nicht an")
    })
  return sauber(await page.locator("main").first().innerText())
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

  /* ── Türkisch ── */
  const pageTr = await seite(browser, "tr")
  const vorher = sauber(await pageTr.locator("main").first().innerText())
  p("S3 · Reifekriterien türkisch", vorher.includes(tr.befunde.reife.betrieb.label), tr.befunde.reife.betrieb.label)
  p("S3 · mit ihrer Begründung", vorher.includes(tr.befunde.reife.material.warum.slice(0, 30)))
  p(
    "S3 · und nicht mehr deutsch",
    !vorher.includes(de.befunde.reife.betrieb.label),
    de.befunde.reife.betrieb.label,
  )

  const nachher = await sendenVersuchen(pageTr, tr)
  p("S1 · Befund „Pflichtabschnitt leer“ türkisch", nachher.includes(tr.befunde.code["abschnitt-leer"].slice(0, 20)))
  p("S1 · Befund „keine Position“ türkisch", nachher.includes(tr.befunde.code["keine-position"]))
  p("S1 · Reife-Befund türkisch", nachher.includes(tr.befunde.reife.betrieb.label))
  p("S2 · der alte deutsche Satz kommt nicht mehr vor", !nachher.includes(de.befunde.code["keine-position"]))
  p(
    "S2 · auch nicht der Abschnittssatz",
    !nachher.includes(de.befunde.abschnittRegel["naechster-schritt"]),
  )
  p("S4 · die Abschnittsüberschrift bleibt deutsch", nachher.includes("06 Preis"), "Dokument des Kunden")

  /* ── Deutsch, dieselbe Stelle ── */
  const pageDe = await seite(browser, "de")
  const deutsch = await sendenVersuchen(pageDe, de)
  p("S5 · auf Deutsch stehen die deutschen Sätze", deutsch.includes(de.befunde.code["keine-position"]))
  p("S5 · und nicht die türkischen", !deutsch.includes(tr.befunde.code["keine-position"]))

  await browser.close()
} finally {
  if (fehler || process.env.DEBUG) console.log("     SERVER:", serverFehler.slice(-1200))
  await db.end().catch(() => {})
  server.kill("SIGTERM")
  await new Promise((r) => setTimeout(r, 1500))
}

console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — die Befunde des Servers sprechen die Sprache des Menschen davor.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
