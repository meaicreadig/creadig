/*
 * ===========================================================================
 * ERLEBNIS-PROBELAUF — IST DER INHALT DA, BEVOR DIE BEWEGUNG BEGINNT?
 * ===========================================================================
 *
 * PHASE 5 · COMMERCIAL COMPLETION.
 *
 * Zwei Dinge lassen sich nicht am Quelltext ablesen und auch nicht an einem
 * Bildschirmfoto nach dem Laden:
 *
 *   1 · Ob die Kopfzeile im ERSTEN Moment dasteht — nicht nach einer
 *       Sekunde, sondern bei 0, 50 und 100 Millisekunden, und zwar bei
 *       jeder Art von Navigation. Gate 04 hat entschieden, dass Bewegung
 *       nie verbergen darf, dass Inhalt da ist (D-28). Der Hero hat diese
 *       Regel bis Phase 5 gebrochen, und niemand hat es gemerkt, weil jeder
 *       Test nach dem Laden gemessen hat.
 *
 *   2 · Ob die primaere Handlung auf einem kleinen Telefon ueberhaupt im
 *       ersten Fenster liegt.
 *
 * Dieser Lauf misst beides in einem echten Browser.
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.ERLEBNIS_PORT ?? 4335)
const BASE = `http://127.0.0.1:${PORT}`

let fehler = 0
let geprueft = 0
function pruefe(name, bedingung, detail = "") {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  FEHL  ${name}${detail ? `\n        ${detail}` : ""}`)
  }
}

async function warte() {
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) })
      if (r.ok) return
    } catch {
      /* noch nicht */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error("Server ist nicht hochgekommen.")
}

/*
 * Wie viel der Kopfzeile steht im Sichtfenster ihrer Maske? Gemessen wird
 * die schlechteste der drei Zeilen. 1 = ganz da, 0 = ganz weg.
 */
const SICHTBARKEIT = `(() => {
  const h1 = document.querySelector("#top h1"); if (!h1) return null;
  const zeilen = [...h1.querySelectorAll(":scope > span")];
  if (zeilen.length === 0) return null;
  const anteile = zeilen.map((maske) => {
    const inner = maske.querySelector("span"); if (!inner) return 1;
    const m = maske.getBoundingClientRect(), i = inner.getBoundingClientRect();
    const oben = Math.max(m.top, i.top), unten = Math.min(m.bottom, i.bottom);
    return i.height > 0 ? Math.max(0, unten - oben) / i.height : 0;
  });
  return Math.min(...anteile);
})()`

/** Der Anteil bei 0, 50, 100 und 200 Millisekunden. */
async function fruehesteSichtbarkeit(page) {
  const proben = []
  let vergangen = 0
  for (const ms of [0, 50, 100, 200]) {
    if (ms > vergangen) {
      await page.waitForTimeout(ms - vergangen)
      vergangen = ms
    }
    const wert = await page.evaluate(SICHTBARKEIT)
    proben.push({ ms, wert })
  }
  return proben
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
  env: { ...process.env, NODE_ENV: "production" },
})

let browser
try {
  await warte()
  try {
    browser = await chromium.launch({ channel: "chrome" })
  } catch {
    browser = await chromium.launch()
  }

  /* ===================================================================== *
   * 1 · DIE KOPFZEILE BEI VIER ARTEN VON NAVIGATION
   * ===================================================================== */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()

    const faelle = []

    await page.goto(`${BASE}/`, { waitUntil: "commit" })
    faelle.push(["harter Aufruf", await fruehesteSichtbarkeit(page)])

    await page.goto(`${BASE}/leistungen`, { waitUntil: "networkidle" })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.locator("header a[href='/']").first().click()
    faelle.push(["Client-Navigation", await fruehesteSichtbarkeit(page)])

    await page.goBack()
    await page.waitForTimeout(300)
    await page.goForward()
    faelle.push(["vor und zurueck", await fruehesteSichtbarkeit(page)])

    await page.reload({ waitUntil: "commit" })
    faelle.push(["neu laden", await fruehesteSichtbarkeit(page)])

    for (const [name, proben] of faelle) {
      const gemessen = proben.filter((p) => p.wert !== null)
      console.log(
        `  ${name.padEnd(20)} ` +
          proben.map((p) => `${p.ms}ms:${p.wert === null ? "—" : Math.round(p.wert * 100) + "%"}`).join("  "),
      )
      /*
       * Die Schwelle liegt bei 60 %: Eine Zeile, die zu mehr als einem
       * Drittel weggeschnitten ist, ist nicht lesbar. Verlangt wird nicht
       * 100 % — ein kurzes Setzen um wenige Pixel ist Bewegung, kein
       * Verbergen.
       */
      pruefe(
        `Kopfzeile sofort lesbar — ${name}`,
        gemessen.length > 0 && gemessen.every((p) => p.wert >= 0.6),
        gemessen.map((p) => `${p.ms}ms=${Math.round(p.wert * 100)}%`).join(" "),
      )
    }
    await ctx.close()
  }

  /* ===================================================================== *
   * 2 · KEIN WICHTIGER TEXT HAENGT AN DER DECKKRAFT (D-28)
   * ===================================================================== */
  for (const route of ["/", "/leistungen", "/produkte/fibero", "/aufwandsrechner"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(BASE + route, { waitUntil: "commit" })
    const versteckt = await page.evaluate(() => {
      const wichtig = [...document.querySelectorAll("main h1, main h2, main h3, main p")]
      return wichtig.filter((el) => {
        const s = getComputedStyle(el)
        if (s.visibility === "hidden" || s.display === "none") return false
        return Number(s.opacity) < 0.15 && (el.innerText || "").trim().length > 0
      }).length
    })
    pruefe(`${route}: kein Text unter 15 % Deckkraft beim Aufbau`, versteckt === 0, `${versteckt} Element(e)`)
    await ctx.close()
  }

  /* ===================================================================== *
   * 3 · DIE PRIMAERE HANDLUNG AUF KLEINEN TELEFONEN
   * ===================================================================== */
  for (const vp of [
    { name: "390x844", width: 390, height: 844 },
    { name: "360x740", width: 360, height: 740 },
  ]) {
    const ctx = await browser.newContext({ viewport: vp, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
    await page.waitForTimeout(900)
    const y = await page.evaluate(() => {
      const a = document.querySelector("#top a[href='/termin']")
      return a ? Math.round(a.getBoundingClientRect().top + window.scrollY) : null
    })
    console.log(`  Startseite ${vp.name}: primaere Handlung bei y=${y} (Fenster ${vp.height})`)
    pruefe(
      `${vp.name}: primaere Handlung im ersten Fenster`,
      y !== null && y < vp.height,
      `y=${y}, Fenster ${vp.height}`,
    )
    await ctx.close()
  }

  /* ===================================================================== *
   * 4 · KEIN QUERLAUF — AUCH NICHT AUF 320 PIXELN
   * ===================================================================== */
  for (const breite of [768, 390, 360, 320]) {
    for (const route of ["/", "/leistungen", "/aufwandsrechner", "/termin", "/produkte/fibero"]) {
      const ctx = await browser.newContext({ viewport: { width: breite, height: 800 }, locale: "de-DE" })
      const page = await ctx.newPage()
      await page.goto(BASE + route, { waitUntil: "networkidle" })
      const quer = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      )
      pruefe(`${route} @${breite}px: kein Querlauf`, !quer)
      await ctx.close()
    }
  }

  /* ===================================================================== *
   * 5 · DIE KAUFLOGIK IST NOCH DA (KEINE VEREINFACHUNG OHNE DECKUNG)
   * ===================================================================== */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/leistungen`, { waitUntil: "networkidle" })
    const text = await page.locator("main").innerText()
    const stellen = [
      ["drei Kaufwege", /Umfang steht vorher fest/i.test(text) && /Umfang entsteht zuerst/i.test(text) && /laufender Zustand/i.test(text)],
      ["149-Unterscheidung", /Individualanwendung/i.test(text)],
      ["keine Stufe darueber", /keine Betriebsstufe über der laufenden Betreuung/i.test(text)],
      ["Standardsoftware-Fall", /Standardsoftware/i.test(text)],
      ["Anbindung als eigener Fall", /Anbindung/i.test(text)],
      ["Systemprojekt ohne Listenpreis", /Kein Listenpreis und keine Spanne/i.test(text)],
    ]
    for (const [name, da] of stellen) pruefe(`Kauflogik erhalten: ${name}`, da)

    /* Und die Sektion darf nicht wieder wachsen. */
    const woerter = await page.evaluate(() => {
      const s = document.querySelector("#kaufwege")
      return s ? (s.innerText || "").trim().split(/\s+/).filter(Boolean).length : -1
    })
    console.log(`  /leistungen · Sektion „Kaufwege": ${woerter} Woerter`)
    pruefe("Kaufwege bleibt unter 470 Woertern", woerter > 0 && woerter < 470, `${woerter}`)
    await ctx.close()
  }
} finally {
  await browser?.close()
  server.kill()
}

console.log(`\nErlebnis-Probelauf — ${geprueft} Pruefungen`)
if (fehler > 0) {
  console.error(`FEHL — ${fehler} Abweichung(en).\n`)
  process.exit(1)
}
console.log("OK — der Inhalt steht da, bevor sich etwas bewegt, und die Handlung liegt im Blick.\n")
