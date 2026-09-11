/*
 * ===========================================================================
 * RECHNER-PROBELAUF — DIE OBERFLAECHE, NICHT NUR DIE FORMEL
 * ===========================================================================
 *
 * PHASE 3 · COMMERCIAL COMPLETION.
 *
 * `wirtschaftlichkeit-drill.mjs` rechnet die Formel nach. Dieser Lauf prueft
 * das, was dazwischenliegt: ob die Zahl, die ein Mensch eintippt, auch als
 * die Zahl ankommt, die gemeint war — und ob das Ergebnis danach auf dem
 * Bildschirm steht.
 *
 * Vier Dinge gehen an genau dieser Stelle schief, und alle vier still:
 *
 *   1 · Ein deutsches Komma wird verschluckt. Aus „37,5" wird 37, und
 *       niemand sieht es, weil 37 auch plausibel aussieht.
 *   2 · Ein Mehraufwand erscheint als Null. Der Rechner schlaegt nur nach
 *       oben aus, und das faellt niemandem auf, der Ersparnis erwartet.
 *   3 · Beim Aufruf steht schon ein Ergebnis da — eine Zahl, die niemand
 *       eingegeben hat.
 *   4 · Auf Arabisch kippt das Minus oder das Euro-Zeichen auf die falsche
 *       Seite, weil der Satz von rechts nach links laeuft, die Zahl aber
 *       nicht.
 *
 * Geprueft wird mit echter Tastatureingabe in einem echten Browser, in vier
 * Sprachen und auf drei Breiten.
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.RECHNER_PORT ?? 4327)
const BASE = `http://127.0.0.1:${PORT}`

const PFADE = {
  de: "/aufwandsrechner",
  tr: "/tr/aufwandsrechner",
  en: "/en/aufwandsrechner",
  ar: "/ar/aufwandsrechner",
}
const BREITEN = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobil", width: 390, height: 844 },
]

let fehler = 0
let geprueft = 0
const konsolenfehler = []

function pruefe(name, bedingung, detail = "") {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  FEHL  ${name}${detail ? `\n        ${detail}` : ""}`)
  }
}

async function warteAufServer() {
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) })
      if (r.ok) return
    } catch {
      /* noch nicht da */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error("Server ist nicht hochgekommen.")
}

/** Die fuenf Felder in der Reihenfolge, in der sie im Formular stehen. */
async function felder(page) {
  return page.locator("input[inputmode='decimal']")
}

async function fuelle(page, werte) {
  const f = await felder(page)
  for (let i = 0; i < werte.length; i++) {
    await f.nth(i).fill("")
    if (werte[i] !== null) await f.nth(i).fill(werte[i])
  }
}

/** Der sichtbare Text des Ergebnisblocks. */
async function ergebnisText(page) {
  return (await page.locator("[aria-live='polite']").innerText()).replace(/\s+/g, " ")
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
  env: { ...process.env, NODE_ENV: "production" },
})

let browser
try {
  await warteAufServer()
  try {
    browser = await chromium.launch({ channel: "chrome" })
  } catch {
    browser = await chromium.launch()
  }

  /* ===================================================================== *
   * TEIL 1 · DIE RECHNUNG IN DER OBERFLAECHE (deutsch, Desktop)
   * ===================================================================== */
  {
    const ctx = await browser.newContext({ viewport: BREITEN[0], locale: "de-DE" })
    const page = await ctx.newPage()
    page.on("console", (m) => {
      if (m.type() === "error") konsolenfehler.push(`de · ${m.text().slice(0, 120)}`)
    })
    await page.goto(`${BASE}${PFADE.de}`, { waitUntil: "networkidle" })

    /* 1.1 — Beim Aufruf steht KEIN Ergebnis da. */
    const leer = await ergebnisText(page)
    pruefe("kein Ergebnis vor der Eingabe", !/€/.test(leer), `gefunden: „${leer.slice(0, 90)}…"`)

    /* 1.2 — Kein Feld ist vorbelegt. */
    const f = await felder(page)
    pruefe("fuenf Eingabefelder", (await f.count()) === 5, `gefunden: ${await f.count()}`)
    for (let i = 0; i < (await f.count()); i++) {
      pruefe(`Feld ${i + 1} ist leer`, (await f.nth(i).inputValue()) === "")
    }

    /* 1.3 — Der Normalfall: 100 · 10 · 5 · 30 → 250 € und 8,3 Stunden. */
    await fuelle(page, ["100", "10", "5", "30", null])
    let text = await ergebnisText(page)
    pruefe("Normalfall zeigt 250 €", /250\s*€/.test(text), text.slice(0, 200))
    pruefe("Normalfall zeigt 8,3 Stunden", /8,3/.test(text), text.slice(0, 200))

    /* 1.4 — Das deutsche Komma darf nicht verschluckt werden.
     *        100 · 10 · 5 · 37,5 → 8,333… h × 37,5 = 312,5 → gerundet 313 €.
     *        Mit verschlucktem Komma waeren es 37 × 8,333 = 308 €.          */
    await fuelle(page, ["100", "10", "5", "37,5", null])
    text = await ergebnisText(page)
    pruefe("Komma wird gelesen (313 €, nicht 308 €)", /313\s*€/.test(text), text.slice(0, 200))

    /* 1.5 — Mehraufwand erscheint als Minus, nicht als Null. */
    await fuelle(page, ["100", "10", "15", "30", null])
    text = await ergebnisText(page)
    pruefe("Mehraufwand zeigt ein Minus", /-\s?250\s*€|−\s?250\s*€/.test(text), text.slice(0, 200))
    pruefe(
      "Mehraufwand wird benannt",
      /mehr kosten als heute/i.test(text),
      text.slice(0, 200),
    )

    /* 1.6 — Kein Unterschied: klare Ansage statt einer stillen Null. */
    await fuelle(page, ["100", "10", "10", "30", null])
    text = await ergebnisText(page)
    pruefe("kein Unterschied wird benannt", /Kein Unterschied/i.test(text), text.slice(0, 200))

    /* 1.7 — Investition: Amortisation und Gegenprobe. */
    await fuelle(page, ["100", "10", "5", "30", "3000"])
    text = await ergebnisText(page)
    pruefe("Amortisation 12 Monate", /12 Monaten/.test(text), text.slice(0, 300))
    pruefe("Gegenprobe erscheint", /zwölf Monaten/i.test(text), text.slice(0, 300))

    /* 1.8 — Investition ohne Effekt: KEINE Amortisationszahl. */
    await fuelle(page, ["100", "10", "10", "30", "3000"])
    text = await ergebnisText(page)
    pruefe(
      "keine Amortisation ohne Effekt",
      !/Rechnerisch gedeckt nach/.test(text),
      text.slice(0, 300),
    )

    /* 1.9 — Unsinn erzeugt weder NaN noch Infinity. */
    await fuelle(page, ["viel", "10", "5", "30", null])
    text = await ergebnisText(page)
    pruefe("kein NaN", !/NaN/.test(text), text.slice(0, 200))
    pruefe("kein Infinity", !/Infinity|∞/.test(text), text.slice(0, 200))
    pruefe("unlesbares Feld ist markiert", (await f.nth(0).getAttribute("aria-invalid")) === "true")

    /* 1.10 — Negative Eingabe wird nicht als Ergebnis gelesen. */
    await fuelle(page, ["-100", "10", "5", "30", null])
    text = await ergebnisText(page)
    pruefe("negative Vorgangszahl ergibt kein Ergebnis", !/€/.test(text), text.slice(0, 200))

    /* 1.11 — Nichts landet in der URL. */
    await fuelle(page, ["100", "10", "5", "30", "3000"])
    pruefe("keine Werte in der Adresszeile", !/[?#]/.test(page.url()), page.url())

    /* 1.12 — Nichts landet im Browserspeicher. */
    const gespeichert = await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
    }))
    pruefe("nichts in localStorage", gespeichert.local === 0, JSON.stringify(gespeichert))
    pruefe("nichts in sessionStorage", gespeichert.session === 0, JSON.stringify(gespeichert))

    /* 1.13 — Nur mit der Tastatur bedienbar. */
    await page.reload({ waitUntil: "networkidle" })
    await f.nth(0).focus()
    await page.keyboard.type("50")
    await page.keyboard.press("Tab")
    await page.keyboard.type("20")
    await page.keyboard.press("Tab")
    await page.keyboard.type("10")
    await page.keyboard.press("Tab")
    await page.keyboard.type("60")
    text = await ergebnisText(page)
    pruefe("Tastatureingabe rechnet", /500\s*€/.test(text), text.slice(0, 200))

    await ctx.close()
  }

  /* ===================================================================== *
   * TEIL 2 · VIER SPRACHEN, DREI BREITEN
   * ===================================================================== */
  for (const [locale, pfad] of Object.entries(PFADE)) {
    for (const breite of BREITEN) {
      const ctx = await browser.newContext({ viewport: breite, locale })
      const page = await ctx.newPage()
      page.on("console", (m) => {
        if (m.type() === "error") konsolenfehler.push(`${locale} · ${m.text().slice(0, 120)}`)
      })
      await page.goto(`${BASE}${pfad}`, { waitUntil: "networkidle" })

      const f = await felder(page)
      pruefe(`${locale}/${breite.name}: fuenf Felder`, (await f.count()) === 5)

      await fuelle(page, ["100", "10", "5", "30", "3000"])
      const text = await ergebnisText(page)
      pruefe(`${locale}/${breite.name}: Ergebnis erscheint`, /250/.test(text), text.slice(0, 160))
      pruefe(`${locale}/${breite.name}: kein NaN`, !/NaN/.test(text))

      /* Kein waagerechtes Ueberlaufen — besonders auf 390 Pixeln. */
      const ueberlauf = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      )
      pruefe(`${locale}/${breite.name}: kein Querlauf`, !ueberlauf)

      await ctx.close()
    }
  }

  /* ===================================================================== *
   * TEIL 3 · ARABISCH — DIE ZAHL LAEUFT ANDERSHERUM ALS DER SATZ
   * ===================================================================== */
  {
    const ctx = await browser.newContext({ viewport: BREITEN[0], locale: "ar" })
    const page = await ctx.newPage()
    await page.goto(`${BASE}${PFADE.ar}`, { waitUntil: "networkidle" })
    pruefe("arabische Seite laeuft rechts nach links", (await page.locator("html").getAttribute("dir")) === "rtl")

    await fuelle(page, ["100", "10", "15", "30", null])
    /*
     * Der Mehraufwand ist der harte Fall: Ohne `dir="ltr"` an der Zahl
     * wandert das Minus im arabischen Fluss ans andere Ende und aus „-250 €"
     * wird „€ 250-".
     */
    const werte = await page.locator("[aria-live='polite'] dd").allInnerTexts()
    const geldzeile = werte.find((w) => w.includes("€")) ?? ""
    pruefe(
      "Minus steht vor der Zahl (AR)",
      /^-|^−/.test(geldzeile.trim()),
      `gefunden: „${geldzeile}"`,
    )
    const richtung = await page.locator("[aria-live='polite'] dd").first().getAttribute("dir")
    pruefe("Zahlen tragen dir=ltr", richtung === "ltr", `gefunden: ${richtung}`)
    await ctx.close()
  }

  pruefe(
    "keine Konsolenfehler",
    konsolenfehler.length === 0,
    konsolenfehler.slice(0, 4).join("\n        "),
  )
} finally {
  await browser?.close()
  server.kill()
}

console.log(`\nRechner-Probelauf — ${geprueft} Pruefungen in 4 Sprachen × 3 Breiten`)
if (fehler > 0) {
  console.error(`FEHL — ${fehler} Abweichung(en).\n`)
  process.exit(1)
}
console.log("OK — getippt, gerechnet, angezeigt: in jeder Sprache dieselbe Zahl.\n")
