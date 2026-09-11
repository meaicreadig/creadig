/*
 * ===========================================================================
 * KONVERSIONS-PROBELAUF — WIE VIEL ARBEIT VERLANGT DER WEG HINEIN?
 * ===========================================================================
 *
 * PHASE 4 · COMMERCIAL COMPLETION.
 *
 * Zwei Gespraeche, zwei Lasten. Ein kostenloses Zwanzig-Minuten-Gespraech
 * darf nicht dieselbe Qualifizierung verlangen wie ein Systemgespraech, aus
 * dem ein Festpreis entsteht — sonst qualifiziert die Seite Leute weg, die
 * nur reden wollten.
 *
 * Dieser Lauf zaehlt, was wirklich auf dem Bildschirm steht. Nicht, was im
 * Woerterbuch vorgesehen ist: gezaehlt werden sichtbare Felder, gesetzte
 * `required`-Marken und der Text der Fortschrittsanzeige.
 *
 * Er verschickt nichts. Der letzte Klick wird nie ausgefuehrt.
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.KONVERSION_PORT ?? 4331)
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
 * Der Einwilligungs-Banner liegt ueber der Seite und faengt jeden Klick ab.
 * Fuer den Lauf wird die datensparsame Wahl getroffen — „nur essenzielle" —
 * und damit genau die, die ein Mensch mit einem Klick auch treffen kann.
 */
async function bannerSchliessen(page) {
  const knopf = page.getByRole("button", {
    name: /Nur essenzielle|Yalnızca gerekli|essential only|الضرورية فقط/i,
  })
  try {
    if ((await knopf.count()) > 0) {
      await knopf.first().click({ timeout: 3000 })
      await page.waitForTimeout(250)
    }
  } catch {
    /* schon zu */
  }
}

/** Zaehlt, was auf dem aktuellen Schritt sichtbar ist. */
async function schrittZaehlen(page) {
  return page.evaluate(() => {
    const sichtbar = [...document.querySelectorAll("main input, main textarea, main select")].filter(
      (e) => e.offsetParent !== null && e.type !== "hidden",
    )
    const eingaben = sichtbar.filter((e) => e.type !== "checkbox" && e.type !== "radio")
    return {
      felder: eingaben.length,
      pflicht: eingaben.filter((e) => e.required).length,
      einwilligung: sichtbar.some((e) => e.type === "checkbox" && e.required),
      fortschritt: document.body.innerText.match(/schritt\s+\d+\s+von\s+\d+|\d+\s?%/i)?.[0] ?? "—",
    }
  })
}

/**
 * Fuehrt den Assistenten bis Schritt 3 (Angaben). Klickt NIE auf Senden.
 *
 * Bewusst Schritt fuer Schritt statt in einer Schleife: Schritt 1 waehlt eine
 * Gespraechsart, Schritt 2 einen Tag und ein Zeitfenster. Eine gemeinsame
 * Schleife klickte in beiden Schritten auf dieselben `aria-pressed`-Knoepfe
 * und hob dabei ihre eigene Auswahl wieder auf.
 */
async function bisAngaben(page, art) {
  const weiter = () => page.locator("main button").filter({ hasText: /^(Weiter|Devam|Next)$/ })
  /*
   * Die Gespraechskarten und die Kalendertage sind beide `aria-pressed`.
   * Unterschieden werden sie an der Dauer im Kartentext — sonst klickt der
   * Lauf beim vorgewaehlten Systemweg, der direkt in Schritt 2 startet, auf
   * einen vergangenen Kalendertag.
   */
  const typKarten = page
    .locator("main button[aria-pressed]")
    .filter({ hasText: /\d+\s*(Min|dakika|min|دقيقة)/i })

  if ((await typKarten.count()) >= 2) {
    await typKarten.nth(art === "system" ? 1 : 0).click()
    await weiter().first().click()
    await page.waitForTimeout(400)
  }

  /* Schritt 2 — ein waehlbarer Tag, dann ein Zeitfenster. */
  const tage = page.locator("main button[aria-pressed]:not([disabled])")
  if ((await tage.count()) > 0) {
    await tage.first().click()
    await tage.last().click()
    await weiter().first().click()
    await page.waitForTimeout(400)
  }

  return (await page.locator("main input[autocomplete='name']").count()) > 0
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
  env: { ...process.env, NODE_ENV: "production" },
})

let browser
const messwerte = {}
try {
  await warte()
  try {
    browser = await chromium.launch({ channel: "chrome" })
  } catch {
    browser = await chromium.launch()
  }

  /* ===================================================================== *
   * 1 · DIE BEIDEN WEGE, GEZAEHLT
   * ===================================================================== */
  for (const [name, url] of [
    ["kurz", "/termin"],
    ["system", "/termin?art=systemgespraech"],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(BASE + url, { waitUntil: "networkidle" })
    await bannerSchliessen(page)

    const erreicht = await bisAngaben(page, name)
    pruefe(`${name}: Angabenschritt erreicht`, erreicht)
    if (!erreicht) {
      await ctx.close()
      continue
    }
    messwerte[name] = await schrittZaehlen(page)
    console.log(
      `  ${name.padEnd(7)} Felder ${messwerte[name].felder}  Pflicht ${messwerte[name].pflicht}  ` +
        `Einwilligung ${messwerte[name].einwilligung ? "ja" : "nein"}  Fortschritt „${messwerte[name].fortschritt}"`,
    )
    await ctx.close()
  }

  if (messwerte.kurz && messwerte.system) {
    /* --- 1.1 Der kurze Weg MUSS leichter sein -------------------------- */
    pruefe(
      "kurzer Weg hat weniger Felder als der Systemweg",
      messwerte.kurz.felder < messwerte.system.felder,
      `kurz ${messwerte.kurz.felder}, system ${messwerte.system.felder}`,
    )
    pruefe(
      "kurzer Weg hat weniger Pflichtfelder",
      messwerte.kurz.pflicht < messwerte.system.pflicht,
      `kurz ${messwerte.kurz.pflicht}, system ${messwerte.system.pflicht}`,
    )
    /* --- 1.2 Obergrenze fuer den kurzen Weg ---------------------------- *
     * Vor einem kostenlosen Gespraech sind drei Pflichtangaben genug:
     * Name, E-Mail und die Einwilligung. Mehr waere Qualifizierung.      */
    pruefe(
      "kurzer Weg verlangt hoechstens zwei Pflichtfelder plus Einwilligung",
      messwerte.kurz.pflicht <= 2,
      `Pflichtfelder: ${messwerte.kurz.pflicht}`,
    )
    /* --- 1.3 Die Einwilligung bleibt auf beiden Wegen ------------------ */
    pruefe("Einwilligung auf dem kurzen Weg", messwerte.kurz.einwilligung)
    pruefe("Einwilligung auf dem Systemweg", messwerte.system.einwilligung)
  }

  /* ===================================================================== *
   * 2 · DER FORTSCHRITT LUEGT NICHT
   * ===================================================================== */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/termin`, { waitUntil: "networkidle" })
    await bannerSchliessen(page)
    const gesehen = []
    gesehen.push((await schrittZaehlen(page)).fortschritt)
    const weiter2 = () => page.locator("main button").filter({ hasText: /^(Weiter|Devam|Next)$/ })
    const typKarten2 = page
      .locator("main button[aria-pressed]")
      .filter({ hasText: /\d+\s*(Min|dakika|min|دقيقة)/i })
    await typKarten2.first().click()
    await weiter2().first().click()
    await page.waitForTimeout(400)
    gesehen.push((await schrittZaehlen(page)).fortschritt)
    const tage2 = page.locator("main button[aria-pressed]:not([disabled])")
    await tage2.first().click()
    await tage2.last().click()
    await weiter2().first().click()
    await page.waitForTimeout(400)
    gesehen.push((await schrittZaehlen(page)).fortschritt)
    console.log(`  Fortschritt gesehen: ${gesehen.join(" → ")}`)
    pruefe(
      "keine Prozentzahl in der Fortschrittsanzeige",
      !gesehen.some((g) => /%/.test(g)),
      gesehen.join(" | "),
    )
    pruefe(
      "keine 95-Prozent-Behauptung",
      !gesehen.some((g) => g.includes("95")),
      gesehen.join(" | "),
    )
    pruefe(
      "Schrittzaehlung in Worten",
      gesehen.some((g) => /schritt\s+\d+\s+von\s+\d+/i.test(g)),
      gesehen.join(" | "),
    )
    await ctx.close()
  }

  /* ===================================================================== *
   * 3 · ZEITZONE — KEINE SAISONALE ABKUERZUNG
   * ===================================================================== */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/termin?art=systemgespraech`, { waitUntil: "networkidle" })
    await bannerSchliessen(page)
    const text = await page.locator("main").innerText()
    pruefe("keine feste Zeitzonen-Abkuerzung", !/\b(MEZ|MESZ|CET|CEST)\b/.test(text))
    await ctx.close()
  }

  /* ===================================================================== *
   * 4 · PRODUKT-INTERESSE PASST ZUM REIFEGRAD
   * ===================================================================== */
  for (const slug of ["meai", "cassamea", "meahv"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/produkte/${slug}`, { waitUntil: "networkidle" })
    await bannerSchliessen(page)
    const info = await page.evaluate(() => {
      const felder = [...document.querySelectorAll("main input, main textarea, main select")].filter(
        (e) => e.offsetParent !== null && e.type !== "hidden" && e.type !== "checkbox",
      )
      return { felder: felder.length, text: document.querySelector("main").innerText }
    })
    /* Ein Produkt im Aufbau darf kein Konto, keinen Kauf und keinen Zugang anbieten. */
    pruefe(
      `${slug}: kein Konto-/Kaufversprechen`,
      !/jetzt (kaufen|registrieren)|Konto (eröffnen|anlegen)|create an account|kostenlos testen|Testzugang/i.test(
        info.text,
      ),
    )
    pruefe(
      `${slug}: Interessensformular bleibt schlank (max. 3 Felder)`,
      info.felder <= 3,
      `gefunden: ${info.felder}`,
    )
    await ctx.close()
  }

  /* ===================================================================== *
   * 5 · KEIN LEAD-GATE VOR DEN WERKZEUGEN
   * ===================================================================== */
  for (const [name, url] of [
    ["Betriebscheck", "/betriebscheck"],
    ["Aufwandsrechner", "/aufwandsrechner"],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(BASE + url, { waitUntil: "networkidle" })
    await bannerSchliessen(page)
    const pflicht = await page.evaluate(
      () =>
        [...document.querySelectorAll("main input, main select")].filter(
          (e) => e.offsetParent !== null && e.required && e.type !== "radio",
        ).length,
    )
    pruefe(`${name}: kein Pflichtfeld vor der Nutzung`, pflicht === 0, `Pflichtfelder: ${pflicht}`)
    await ctx.close()
  }

  /* ===================================================================== *
   * 6 · DIE KONTAKTSEITE HAT EINE REIHENFOLGE
   * ===================================================================== */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/kontakt`, { waitUntil: "networkidle" })
    await bannerSchliessen(page)
    const ziele = await page.evaluate(() =>
      [...document.querySelectorAll("main a[href]")].map((a) => a.getAttribute("href")),
    )
    pruefe(
      "Kontakt fuehrt zum kurzen Gespraech",
      ziele.some((h) => h === "/termin"),
    )
    pruefe(
      "Kontakt fuehrt zum Systemgespraech",
      ziele.some((h) => h && h.includes("art=systemgespraech")),
      "Das Systemgespraech fehlte hier komplett.",
    )
    pruefe(
      "Kontakt fuehrt zu den Werkzeugen",
      ziele.some((h) => h === "/betriebscheck") && ziele.some((h) => h === "/aufwandsrechner"),
    )
    await ctx.close()
  }
} finally {
  await browser?.close()
  server.kill()
}

console.log(`\nKonversions-Probelauf — ${geprueft} Pruefungen`)
if (fehler > 0) {
  console.error(`FEHL — ${fehler} Abweichung(en).\n`)
  process.exit(1)
}
console.log("OK — der kurze Weg ist kuerzer, der Fortschritt sagt die Wahrheit, kein Werkzeug verlangt Daten.\n")
