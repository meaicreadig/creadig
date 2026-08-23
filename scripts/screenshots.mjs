#!/usr/bin/env node
/**
 * D-1 — der automatisierte Bildersatz.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DAS GIBT
 * Über die Seite wurde bisher aus dem Gedächtnis geurteilt: Man sieht beim
 * Bauen die eine Seite, an der man gerade arbeitet, im eigenen Erscheinungsbild,
 * auf dem eigenen Bildschirm. Wie die türkische Fassung im Dunkelmodus auf
 * einem Telefon aussieht, hat so nie jemand gesehen — und genau dort sitzen
 * die Fehler, die niemandem auffallen: eine Überschrift, die im Dunkeln zu
 * blass wird, ein Preisblock, der auf 390 Pixeln umbricht.
 *
 * Ein Satz Bilder, bei jeder Änderung neu erzeugt, macht daraus etwas
 * Vergleichbares.
 *
 * ---------------------------------------------------------------------------
 * WIE
 * Playwright startet den GEBAUTEN Server (`next start`) — nicht `next dev`,
 * damit die Bilder das zeigen, was ausgeliefert wird. Gefahren wird der
 * bereits installierte Google Chrome (`channel: "chrome"`); es wird kein
 * eigener Browser heruntergeladen.
 *
 * Drei Entscheidungen, die die Bilder erst brauchbar machen:
 *
 *   1. `reducedMotion: "reduce"`. Die Seite blendet ihre Abschnitte beim
 *      Scrollen ein (`components/ui/reveal.tsx`). Ohne diesen Schalter wären
 *      halbe Seiten unsichtbar — nicht weil sie fehlen, sondern weil die
 *      Animation nie ausgelöst wurde. Bei `reduce` rendert `Reveal` den
 *      Endzustand direkt; das Bild zeigt also die fertige Seite.
 *
 *   2. Einwilligung vorab gesetzt. Sonst liegt auf jedem Bild das
 *      Cookie-Banner. Gesetzt wird der Zustand eines Wiederkehrers, der
 *      Komfort erlaubt und Messung abgelehnt hat — und genau darüber läuft
 *      auch der Dunkelmodus, weil `creadig-theme` an der Komfort-Kategorie
 *      hängt (siehe lib/consent.ts).
 *
 *   3. Einmal durchscrollen vor der Aufnahme. `next/image` lädt verzögert;
 *      ohne den Durchlauf stehen im Bild leere Kästen statt Aufnahmen.
 *
 * ---------------------------------------------------------------------------
 * AUFRUF
 *   npm run build && npm run shots
 *   npm run shots -- --only=404,termin      (nur einzelne Seiten)
 */
import { spawn } from "node:child_process"
import { mkdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT = path.join(ROOT, "screenshots")
const PORT = Number(process.env.SHOTS_PORT ?? 4321)
const BASE = `http://127.0.0.1:${PORT}`

/** Die sieben Seiten aus D-1, dazu die beiden aus Stufe 1 (BF-1, BF-3). */
const PAGES = [
  { name: "01-start", path: "/" },
  { name: "02-start-tr", path: "/tr" },
  { name: "03-leistungen", path: "/leistungen" },
  { name: "04-produkte", path: "/produkte" },
  { name: "05-arbeiten", path: "/arbeiten" },
  { name: "06-kontakt", path: "/kontakt" },
  { name: "07-unternehmen", path: "/unternehmen" },
  { name: "08-termin", path: "/termin" },
  /*
   * BF-1 sitzt in Schritt 2, und den sieht man nicht, indem man die Adresse
   * aufruft — der Assistent ist ein Zustand, keine Route. Deshalb klickt der
   * Bildersatz sich hin: Gespraechsart waehlen, weiter. Ohne das zeigt der
   * Satz nie die Stelle, an der frueher erfundene Uhrzeiten standen.
   */
  {
    name: "08b-termin-schritt2",
    path: "/termin",
    async act(page) {
      await page.getByRole("button", { name: "Kostenlose Erstberatung" }).first().click()
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.waitForTimeout(400)
    },
  },
  { name: "09-termin-tr", path: "/tr/termin" },
  {
    name: "09b-termin-tr-adim2",
    path: "/tr/termin",
    async act(page) {
      await page.getByRole("button", { name: "Ücretsiz ön görüşme" }).first().click()
      await page.getByRole("button", { name: "Devam" }).click()
      await page.waitForTimeout(400)
    },
  },
  { name: "10-404", path: "/diese-adresse-gibt-es-nicht" },
  { name: "11-404-tr", path: "/tr/bu-adres-yok" },
]

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 2 },
  { name: "mobil", width: 390, height: 844, deviceScaleFactor: 2 },
]

const THEMES = ["hell", "dunkel"]

/**
 * Läuft VOR jedem Skript der Seite — also auch vor dem Boot-Skript im <head>,
 * das den Dunkelmodus setzt. Später gesetzt hätte die Seite bereits hell
 * gerendert und würde beim Umschalten blitzen.
 */
function seedScript(theme) {
  return `try{
    localStorage.setItem('creadig_consent', JSON.stringify({
      functional: true, statistics: false, version: 5, decidedAt: '2026-01-01T00:00:00.000Z'
    }));
    localStorage.setItem('creadig-theme', ${theme === "dunkel" ? "'dark'" : "'light'"});
  }catch(e){}`
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`, { redirect: "manual" })
      if (response.status < 500) return
    } catch {
      // noch nicht da
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
  throw new Error(`Server kam auf ${BASE} nicht hoch.`)
}

/** Bis ans Ende scrollen und zurück — laedt die verzoegerten Bilder. */
async function settle(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8)
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 90))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(500)
  await page.evaluate(() => document.fonts.ready)
}

async function main() {
  const only = process.argv
    .find((arg) => arg.startsWith("--only="))
    ?.slice("--only=".length)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

  const pages = only
    ? PAGES.filter((entry) => only.some((needle) => entry.name.includes(needle)))
    : PAGES

  if (pages.length === 0) throw new Error("Kein Treffer für --only.")

  await rm(OUT, { recursive: true, force: true })

  console.log(`Starte den gebauten Server auf ${BASE} …`)
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "production" },
  })

  let browser
  try {
    await waitForServer()
    browser = await chromium.launch({ channel: "chrome" })

    let written = 0
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const dir = path.join(OUT, `${viewport.name}-${theme}`)
        await mkdir(dir, { recursive: true })

        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: viewport.deviceScaleFactor,
          reducedMotion: "reduce",
          colorScheme: theme === "dunkel" ? "dark" : "light",
          locale: "de-DE",
        })
        await context.addInitScript(seedScript(theme))

        const page = await context.newPage()
        for (const entry of pages) {
          await page.goto(`${BASE}${entry.path}`, { waitUntil: "networkidle" })
          if (entry.act) await entry.act(page)
          await settle(page)
          const file = path.join(dir, `${entry.name}.png`)
          await page.screenshot({ path: file, fullPage: true })
          written++
          console.log(`  ${viewport.name}/${theme}  ${entry.name}`)
        }
        await context.close()
      }
    }

    console.log(`\n${written} Aufnahmen in ${path.relative(ROOT, OUT)}/`)
  } finally {
    if (browser) await browser.close()
    server.kill("SIGTERM")
  }
}

main().catch((error) => {
  console.error("\nBildersatz fehlgeschlagen:", error.message)
  process.exitCode = 1
})
