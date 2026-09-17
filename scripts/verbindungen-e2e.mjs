#!/usr/bin/env node
/**
 * ADM-04 · VERBINDUNGSVERZEICHNIS IM BROWSER — A15 bis A20, A26
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DREI LÄUFE UND NICHT EINER
 *
 * Ein Verbindungsverzeichnis, das nur mit heiler Umgebung geprüft wird, ist
 * genau das Verzeichnis, das im Ernstfall grün bleibt. Geprüft werden die
 * drei Welten, in denen dieses Haus wirklich vorkommt:
 *
 *   A · ohne      nichts eingerichtet      → „nicht eingerichtet“, Eingang gestört
 *   B · gestoert  eingerichtet, DB tot     → der Admin nimmt KEINE Änderung an
 *   C · lokal     echte Postgres           → hier wird gemessen und gehandelt
 *
 * Lauf B ist der, den dieser Probelauf gefunden hat (H19): Bei toter
 * Datenbank weist `middleware.ts` jede ändernde Anfrage mit 503 ab, weil der
 * Sitzungswiderruf nicht prüfbar ist (H2, absichtlich zur sicheren Seite).
 * Im Browser stand davon nur „An unexpected response was received from the
 * server“ — ein Knopf, der aussah, als täte er etwas. Jetzt sagt die Seite
 * es, und der Knopf ist gesperrt.
 *
 * Lauf C braucht eine erreichbare Datenbank, weil A15–A18 HANDLUNGEN sind:
 * Ohne Sitzungsspeicher käme keine davon durch — und ein Prüfstand, den man
 * nur in einer kaputten Welt bedienen kann, bewiese nichts.
 *
 *   V1  A · Eingang gestört, beide kritischen Wege benannt, optionale nicht
 *   V2  A · Prüfung meldet „nicht eingerichtet“, mit Akteur
 *   V3  B · abgeleitet „eingerichtet“, ausdrücklich ungeprüft
 *   V4  B · Schreibsperre benannt, Knöpfe gesperrt statt tot (H19, A18/A19)
 *   V5  C · Prüfung misst wirklich: „Antwortet.“ · gemessen · Dauer
 *   V6  C · A15 verbinden und widerrufen, ehrlicher Zustand
 *   V7  C · A16 derselbe Webhook zweimal → eine Wirkung, sichtbar
 *   V8  C · A16 Ereignis nach Widerruf → abgelehnt, keine Wirkung
 *   V9  C · A17 Anbieterfehler → gestört, Erlaubnis bleibt
 *   V10 C · A18 drei Ebenen stehen getrennt auf der Karte
 *   V11 A · A20 Rolle Vertrieb kommt nicht hinein und sieht den Punkt nicht
 *   V12 C · A01 dieselbe Seite auf Türkisch, ohne deutschen Rest
 *   V13 C · A26 mobil 390 px ohne waagerechten Überlauf
 *   V14 A · ohne Schalter kein Prüfstand
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/verbindungen-e2e.mjs
 */
import { spawn } from "node:child_process"
import AxeBuilder from "@axe-core/playwright"
import pg from "pg"
import { chromium } from "playwright"

import { requireSafeTarget } from "./lib/env-guard.mjs"
import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

const PORT = 4397
const BASE = `http://127.0.0.1:${PORT}`
const DB = "drill_verbindungen_e2e"
const ZIEL = `postgres://localhost/${DB}`
requireSafeTarget(ZIEL, "Verbindungen-E2E")
const OWNER = "probe-owner-nur-lokal"
const VERTRIEB = "probe-vertrieb-nur-lokal"
const GEHEIM = "probe-sitzung-nur-lokal-0123456789abcdef0123456789"

const v = de.verbindungen
const vt = tr.verbindungen

let fehler = 0
const p = (name, ok, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

/* Je Kontext eine eigene Absenderadresse — sonst greift das Versuchsfenster (H3). */
let adresse = 0
const kontext = (browser, opts = {}) =>
  browser.newContext({
    ...opts,
    extraHTTPHeaders: { ...(opts.extraHTTPHeaders ?? {}), "x-forwarded-for": `198.19.1.${++adresse}` },
  })

async function anmelden(page, passwort) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill("#password", passwort)
  await page.keyboard.press("Enter")
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20_000 })
}

const sauber = (s) => s.replace(/\s+/g, " ")
const text = (page, wahl) => page.locator(wahl).first().innerText().then(sauber)
const karte = (page, id) => page.locator(`[data-verbindung="${id}"]`)
/** Wartet, bis ein Satz in einem Ausschnitt steht — Server Actions rendern nach. */
const warteAuf = (page, wahl, satz, ms = 20_000) =>
  page.waitForFunction(
    ([w, s]) => document.querySelector(w)?.textContent?.includes(s),
    [wahl, satz],
    { timeout: ms },
  )

async function starte(env) {
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "ignore",
    env: {
      ...process.env,
      NODE_ENV: "production",
      ADMIN_PASSWORD: OWNER,
      ADMIN_PASSWORD_VERTRIEB: VERTRIEB,
      ADMIN_SESSION_SECRET: GEHEIM,
      ...env,
    },
  })
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(`${BASE}/robots.txt`)).status < 500) break
    } catch {
      /* Server noch nicht da */
    }
    if (i > 300) throw new Error("Server kam nicht hoch")
    await new Promise((r) => setTimeout(r, 150))
  }
  return async () => {
    server.kill("SIGTERM")
    await new Promise((r) => setTimeout(r, 1500))
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LAUF A — nichts eingerichtet
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nLauf A „ohne“ — kein Speicher eingerichtet")
let stoppe = await starte({ LEAD_STORE: "aus", DATABASE_URL: "postgres://kein-speicher.invalid/pruefung" })
try {
  const browser = await chromium.launch()
  const page = await (await kontext(browser)).newPage()
  await anmelden(page, OWNER)
  await page.goto(`${BASE}/admin/verbindungen`, { waitUntil: "networkidle" })

  const haupt = await text(page, "main")
  p("V1 · Eingang gestört", haupt.includes(v.eingangGestoert(2)))
  p("V1 · beide kritischen Wege benannt", haupt.includes(v.beleg.keinSpeicher) && haupt.includes(v.beleg.keinVertrieb))
  p("V1 · ungeprüft steht da, keine Behauptung", haupt.includes(v.nichtGeprueft))
  /* Genau ZWEI: LinkedIn ist auch nicht eingerichtet und zählt trotzdem nicht mit. */
  p("V1 · optionale Kanäle lösen keine Eingangswarnung aus", !haupt.includes(v.eingangGestoert(3)))
  p("V1 · und stehen trotzdem ehrlich in der Liste", haupt.includes(v.beleg.linkedinBeleg))
  p("V1 · keine Schreibsperre in dieser Lage", !haupt.includes(v.schreibsperreTitel))

  await karte(page, "website-anfrage").getByRole("button", { name: v.pruefen }).click()
  await warteAuf(page, '[data-verbindung="website-anfrage"]', v.befund["nicht-eingerichtet"])
  const nachPruefung = sauber(await karte(page, "website-anfrage").innerText())
  p("V2 · Prüfung meldet „nicht eingerichtet“", nachPruefung.includes(v.befund["nicht-eingerichtet"]))
  p("V2 · das Ergebnis nennt seinen Akteur", nachPruefung.includes("owner"))

  /* V11 — die Rolle Vertrieb. Kein Menüpunkt, und die Adresse trägt nicht. */
  const pageV = await (await kontext(browser)).newPage()
  await anmelden(pageV, VERTRIEB)
  p("V11 · Vertrieb sieht den Menüpunkt nicht", !(await text(pageV, "#admin-hauptnavigation")).includes(de.nav.verbindungen.label))
  await pageV.goto(`${BASE}/admin/verbindungen`, { waitUntil: "networkidle" })
  p(
    "V11 · Vertrieb wird nicht hineingelassen",
    !pageV.url().includes("/admin/verbindungen") && pageV.url().includes("gesperrt=1"),
    pageV.url(),
  )

  p("V14 · kein Prüfstand ohne Schalter", !haupt.includes(v.gruppe.pruefstand))

  await browser.close()
} finally {
  await stoppe()
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LAUF B — eingerichtet, Datenbank tot
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nLauf B „gestoert“ — eingerichtet, Datenbank tot")
stoppe = await starte({ LEAD_STORE: "neon", DATABASE_URL: "postgresql://nobody:nothing@127.0.0.1:9/tot" })
try {
  const browser = await chromium.launch()
  const page = await (await kontext(browser)).newPage()
  const meldungen = []
  page.on("console", (m) => meldungen.push(m.text()))
  await anmelden(page, OWNER)
  await page.goto(`${BASE}/admin/verbindungen`, { waitUntil: "networkidle" })

  const haupt = await text(page, "main")
  p("V3 · abgeleitet: Eingang offen", haupt.includes(v.eingangOk))
  p("V3 · aber ausdrücklich ungeprüft", haupt.includes(v.nichtGeprueft))
  p("V3 · der Instanz-Vorbehalt steht auf der Seite", haupt.includes(v.protokollHinweis.slice(0, 40)))

  /*
   * V4 · H19 — die Seite sagt, dass sie gerade nichts annimmt, statt einen
   * Knopf anzubieten, der in einer englischen Browsermeldung endet.
   */
  p("V4 · Schreibsperre wird benannt", haupt.includes(v.schreibsperreTitel) && haupt.includes(v.schreibsperre.slice(0, 40)))
  const knopf = karte(page, "manuelle-anfrage").getByRole("button", { name: v.pruefen })
  p("V4 · der Prüfknopf ist gesperrt", await knopf.isDisabled())
  p(
    "V4 · und nennt seinen Grund für Vorleseprogramme",
    (await knopf.getAttribute("aria-describedby")) === "schreibsperre-grund",
  )
  p("V4 · keine unerwartete Antwort im Browser", !meldungen.some((m) => /unexpected response/i.test(m)), meldungen.join(" | ").slice(0, 120))

  await browser.close()
} finally {
  await stoppe()
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LAUF C — echte Postgres auf diesem Rechner, Prüfstand an
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nLauf C „lokal“ — echte Datenbank, Prüfstand an")
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
await db.end()

stoppe = await starte({ LEAD_STORE: "pg-lokal", DATABASE_URL: ZIEL, VERBINDUNG_FIXTURE: "an" })
try {
  const browser = await chromium.launch()
  const page = await (await kontext(browser)).newPage()
  await anmelden(page, OWNER)
  await page.goto(`${BASE}/admin/verbindungen`, { waitUntil: "networkidle" })

  p("V5 · keine Schreibsperre bei erreichbarer Datenbank", !(await text(page, "main")).includes(v.schreibsperreTitel))

  await karte(page, "manuelle-anfrage").getByRole("button", { name: v.pruefen }).click()
  await warteAuf(page, '[data-verbindung="manuelle-anfrage"]', v.befund.erreichbar)
  const gemessen = sauber(await karte(page, "manuelle-anfrage").innerText())
  p("V5 · Prüfung misst wirklich: „Antwortet.“", gemessen.includes(v.befund.erreichbar))
  p("V5 · und sagt, dass gemessen wurde", gemessen.includes(v.reichweite.gemessen))
  p("V5 · mit Dauer in Millisekunden", /\d+ ms/.test(gemessen), gemessen.slice(-90))

  /* Der Versand behauptet ausdrücklich weniger — kein Testversand. */
  await karte(page, "email-ausgang").getByRole("button", { name: v.pruefen }).click()
  await warteAuf(page, '[data-verbindung="email-ausgang"]', v.reichweite.konfiguration)
  p(
    "V5 · Versand: nur Einrichtung geprüft, nichts gesendet",
    sauber(await karte(page, "email-ausgang").innerText()).includes(v.reichweite.konfiguration),
  )

  /* ── A18 · drei Ebenen ────────────────────────────────────────────────── */
  const kanalKarte = sauber(await karte(page, "whatsapp").innerText())
  p(
    "V10 · Fähigkeit, Autorisierung und Adresse getrennt",
    kanalKarte.includes(v.ebene.faehigkeit) && kanalKarte.includes(v.ebene.autorisierung) && kanalKarte.includes(v.ebene.profil),
  )
  p("V10 · eine Adresse heisst „nur Adresse“, nicht „eingerichtet“", kanalKarte.includes(v.zustand.LINK_ONLY))

  /* ── A15 · verbinden ──────────────────────────────────────────────────── */
  const knopf = (aktion) => page.locator(`[data-pruefstand="${aktion}"] button`)
  const pruefkarte = () => karte(page, "pruefanbieter").innerText().then(sauber)
  const protokoll = () => page.locator("[data-ereignisse]").innerText().then(sauber)

  await knopf("verbinden").click()
  await warteAuf(page, '[data-verbindung="pruefanbieter"]', v.zustand.CONNECTED)
  p("V6 · A15 verbunden", (await pruefkarte()).includes(v.zustand.CONNECTED))

  /* ── A16 · derselbe Webhook zweimal ───────────────────────────────────── */
  await knopf("ereignis").click()
  await warteAuf(page, "[data-ereignisse]", v.pruefstand.wirkung.angewendet)
  p("V7 · erstes Ereignis wirkt", (await text(page, "main")).includes(v.pruefstand.wirkungen(1)))

  await knopf("ereignis-gleich").click()
  await warteAuf(page, "[data-ereignisse]", v.pruefstand.wirkung.idempotent)
  p("V7 · derselbe Schlüssel erzeugt keine zweite Wirkung", (await text(page, "main")).includes(v.pruefstand.wirkungen(1)))
  p("V7 · das Protokoll sagt es ausdrücklich", (await protokoll()).includes(v.pruefstand.wirkung.idempotent))

  /* ── A17 · Anbieterfehler ─────────────────────────────────────────────── */
  await knopf("anbieterfehler").click()
  await warteAuf(page, '[data-verbindung="pruefanbieter"]', v.zustand.DEGRADED)
  const gestoert = await pruefkarte()
  p("V9 · Anbieterfehler → gestört", gestoert.includes(v.zustand.DEGRADED))
  p("V9 · die Erlaubnis bleibt bestehen", gestoert.includes(v.autorisierung.pruefanbieterAuth))
  p("V9 · die Fähigkeit ruht trotzdem", gestoert.includes(v.faehigkeit.pruefanbieterRuht))

  /* ── A15/A16 · Widerruf und was danach gilt ───────────────────────────── */
  await knopf("widerrufen").click()
  await warteAuf(page, '[data-verbindung="pruefanbieter"]', v.zustand.REVOKED)
  p("V6 · A15 widerrufen", (await pruefkarte()).includes(v.zustand.REVOKED))

  await knopf("ereignis").click()
  await warteAuf(page, "[data-ereignisse]", v.pruefstand.wirkung.abgelehnt)
  p("V8 · Ereignis nach Widerruf wird abgelehnt", (await protokoll()).includes(v.pruefstand.wirkung.abgelehnt))
  p("V8 · und erzeugt keine Wirkung", (await text(page, "main")).includes(v.pruefstand.wirkungen(1)))

  /* ── V12 · Türkisch ───────────────────────────────────────────────────── */
  const ctxTr = await kontext(browser)
  await ctxTr.addCookies([{ name: "cd_admin_sprache", value: "tr", url: BASE }])
  const pageTr = await ctxTr.newPage()
  await anmelden(pageTr, OWNER)
  await pageTr.goto(`${BASE}/admin/verbindungen`, { waitUntil: "networkidle" })
  const tuerkisch = sauber(await pageTr.locator("main").first().innerText())
  p("V12 · Titel auf Türkisch", (await pageTr.locator("h1").first().innerText()).trim() === vt.titel)
  p("V12 · Gruppen übersetzt", tuerkisch.includes(vt.gruppe.eingang) && tuerkisch.includes(vt.gruppe.kanal))
  p("V12 · Zustände übersetzt", tuerkisch.includes(vt.zustand.CONNECTED) && tuerkisch.includes(vt.zustand.LINK_ONLY))
  p("V12 · Prüfergebnis übersetzt", tuerkisch.includes(vt.befund.erreichbar) || tuerkisch.includes(vt.nichtGeprueft))
  p("V12 · kein deutscher Rest", !tuerkisch.includes(v.eingangTitel) && !tuerkisch.includes(v.pruefen))
  p("V12 · die Seite meldet sich als türkisch", (await pageTr.evaluate(() => document.documentElement.lang)) === "tr")

  /* ── V13 · mobil ──────────────────────────────────────────────────────── */
  const pageM = await (await kontext(browser, { viewport: { width: 390, height: 780 } })).newPage()
  await anmelden(pageM, OWNER)
  await pageM.goto(`${BASE}/admin/verbindungen`, { waitUntil: "networkidle" })
  const ueberlauf = await pageM.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  p("V13 · mobil 390 ohne waagerechten Überlauf", ueberlauf <= 1, `${ueberlauf} px`)
  p("V13 · die Karten sind da", (await pageM.locator("[data-verbindung]").count()) >= 8)

  /* ── V15 · axe, vier Lagen ────────────────────────────────────────────── */
  for (const [name, seite] of [
    ["Desktop DE", page],
    ["Desktop TR", pageTr],
    ["mobil DE", pageM],
  ]) {
    const befund = await new AxeBuilder({ page: seite }).analyze()
    p(`V15 · axe ohne Verstoss (${name})`, befund.violations.length === 0, befund.violations.map((x) => x.id).join(", "))
  }

  await browser.close()
} finally {
  await stoppe()
}

console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — Verbindungsverzeichnis haelt im Browser.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
