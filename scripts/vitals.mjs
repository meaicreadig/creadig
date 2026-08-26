#!/usr/bin/env node
/**
 * MP10-5 — die Messung statt der Behauptung.
 *
 * ---------------------------------------------------------------------------
 * WAS ER MISST UND WARUM ER NICHT „GRUEN" SAGT
 * Der Auftrag lautete „Core Web Vitals gruen". Gruen ist aber ein Urteil ueber
 * ECHTE Besuche (die Felddaten aus dem Chrome-Bericht) — die entstehen erst
 * nach dem Livegang, auf echten Geraeten, in echten Netzen. Was sich hier
 * messen laesst, ist das Labor: dieselbe Seite, dieselbe Maschine, kein
 * Wettbewerb um Bandbreite.
 *
 * Deshalb sagt dieser Test nicht „gruen", sondern nennt Zahlen und die
 * Schwellen daneben. Ein Laborwert unter der Schwelle heisst: Es liegt nicht
 * am Code. Ueber das Feld sagt er nichts, und er tut auch nicht so.
 *
 * Gemessen wird, was ohne echte Besucher messbar ist:
 *
 *   LCP   Wann das groesste sichtbare Element steht. Schwelle 2.500 ms.
 *   CLS   Wie viel nach dem Erscheinen noch springt. Schwelle 0,1.
 *   TTFB  Wann das erste Byte da ist — bei statischen Seiten die Untergrenze
 *         fuer alles Weitere.
 *   HTML  Wie gross das ausgelieferte Dokument ist.
 *
 * NICHT gemessen: INP. Der Wert entsteht aus echten Eingaben eines Menschen;
 * ein Skript, das ihn simuliert, misst seine eigene Klickgeschwindigkeit.
 *
 * ---------------------------------------------------------------------------
 * AUFRUF
 *   npm run build && npm run vitals
 *   npm run vitals -- --json
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.VITALS_PORT ?? 4324)
const BASE = `http://127.0.0.1:${PORT}`

/** Schwellen aus der Definition von Google. Nicht von uns gewaehlt. */
const LCP_LIMIT_MS = 2500
const CLS_LIMIT = 0.1

/**
 * Die Seiten, an denen es sich entscheidet: die Startseite (das grosse Bild),
 * die Werkschau (drei Aufnahmen ueber der Falz), die Preisseite (die laengste
 * Seite), der Assistent (die einzige Seite mit Zustand) und die beiden neuen
 * Seiten dieser Runde.
 */
const ROUTES = [
  { name: "startseite", path: "/" },
  { name: "startseite-tr", path: "/tr" },
  { name: "leistungen", path: "/leistungen" },
  { name: "arbeiten", path: "/arbeiten" },
  { name: "betrieb", path: "/betrieb" },
  { name: "systeme", path: "/systeme" },
  { name: "termin", path: "/termin" },
]

/**
 * Zwei Fenster, und das kleinere ist das wichtigere: Auf einem Telefon ist
 * dieselbe Aufnahme relativ zum Fenster groesser, das Netz langsamer und der
 * Prozessor schwaecher. Wer nur auf dem Schreibtisch misst, misst die
 * Bedingungen, unter denen es ohnehin gut geht.
 */
const VIEWPORTS = [
  { name: "mobil", width: 390, height: 844, scale: 3 },
  { name: "desktop", width: 1440, height: 900, scale: 2 },
]

async function waitForServer(timeoutMs = 90_000) {
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

/*
 * Einwilligung vorab — wortgleich mit `screenshots.mjs` und `a11y.mjs`. Ohne
 * sie liegt das Banner ueber der Seite, und dann misst man das Banner: Es ist
 * gross, es erscheint spaet, und es verschiebt nichts. Beides waere ein
 * falsches Bild.
 *
 * Der erste Lauf hat genau das getan. Der Schluessel stand hier mit Bindestrich
 * (`creadig-consent`), die Anwendung liest ihn mit Unterstrich
 * (`creadig_consent`) — also griff die Voreinwilligung nie, das Banner stand
 * auf jeder Seite, und das groesste sichtbare Element war sein Text. Die
 * Zahlen waren nicht falsch; sie galten nur einer Seite, die so kein Besucher
 * mit getroffener Entscheidung je sieht.
 *
 * Auffallen konnte das nur, weil die Messung seit dieser Runde auch NENNT,
 * welches Element sie gemessen hat. Damit es nicht vom Hinsehen abhaengt,
 * prueft der Lauf unten zusaetzlich, ob das Banner wirklich weg ist.
 */
const CONSENT = `try{
  localStorage.setItem('creadig_consent', JSON.stringify({
    functional: true, statistics: false, version: 5, decidedAt: '2026-01-01T00:00:00.000Z'
  }));
}catch(e){}`

/*
 * Der Messfuehler, und warum er VOR der Seite laufen muss.
 *
 * Der erste Anlauf hat die Werte hinterher abgefragt — mit
 * `performance.getEntriesByType('largest-contentful-paint')`. Das gibt in
 * Chrome eine leere Liste zurueck: LCP und Layout-Verschiebungen landen nicht
 * im normalen Eintragspuffer, sie werden nur an einen `PerformanceObserver`
 * ausgeliefert. Ergebnis war eine Tabelle voller Striche, die der Schlusssatz
 * dann auch noch als „alles unter der Schwelle" gelesen hat. Ein Messgeraet,
 * das nichts misst und trotzdem Entwarnung gibt, ist schlimmer als keines.
 *
 * Deshalb haengt der Beobachter jetzt hier — als Init-Skript, also vor dem
 * ersten Byte der Seite — und `buffered: true` holt nach, was vor seiner
 * Registrierung schon passiert ist.
 */
const COLLECTOR = `(() => {
  const state = { lcp: null, cls: 0, observed: false, lcpElement: null, lcpEager: null };
  window.__vitals = state;
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) {
        const last = entries[entries.length - 1];
        state.lcp = last.startTime;
        /*
          Auch WELCHES Element es war. Ohne diese Zeile bleibt „Hero mit
          Priority" eine Behauptung: Man sieht eine Zahl, aber nicht, worauf
          sie sich bezieht. Ist das groesste Element ein Bild, steht hier
          zusaetzlich, ob es bevorzugt geladen wurde — genau das ist die
          Angabe, die man beim Nachbessern braucht.
        */
        const el = last.element;
        if (el) {
          const tag = el.tagName.toLowerCase();
          if (tag === 'img') {
            state.lcpElement = 'img ' + (el.getAttribute('src') || '').split('?')[0].split('/').pop();
            state.lcpEager = el.getAttribute('loading') !== 'lazy' && el.fetchPriority === 'high';
          } else {
            const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 32);
            state.lcpElement = tag + (text ? ' „' + text + '"' : '');
            state.lcpEager = null;
          }
        }
      }
      state.observed = true;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) state.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    state.error = String(e);
  }
})()`

const asJson = process.argv.includes("--json")
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
  env: { ...process.env, NODE_ENV: "production" },
})

let browser
const rows = []

try {
  await waitForServer()
  try {
    browser = await chromium.launch({ channel: "chrome" })
  } catch {
    if (!asJson) console.log("  (kein Chrome gefunden — Lauf mit dem mitgelieferten Chromium)")
    browser = await chromium.launch()
  }

  if (!asJson) console.log(`\nLabormessung gegen ${BASE}\n`)

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
      /*
        KEIN `reducedMotion: "reduce"` wie im Bildersatz: Dort war das noetig,
        damit ueberhaupt etwas auf dem Bild steht. Hier waere es falsch — die
        Einblendungen beim Scrollen sind genau die Bewegung, die zu CLS
        beitragen koennte. Wer sie abschaltet, misst eine Seite, die niemand
        bekommt.
      */
    })
    await context.addInitScript(CONSENT)
    await context.addInitScript(COLLECTOR)

    for (const route of ROUTES) {
      const page = await context.newPage()

      /*
        Die Groesse des Dokuments kommt aus dem Koerper, nicht aus dem Kopf:
        `next start` liefert die Seiten in Stuecken aus, und dann steht in
        `content-length` nichts. Der erste Anlauf hat genau das gelesen und
        ueberall einen Strich gezeigt.
      */
      const response = await page.goto(`${BASE}${route.path}`, { waitUntil: "load" })
      const htmlBytes = response ? (await response.body()).length : 0

      /*
        Der Bekaempfte prueft sich selbst: Liegt das Einwilligungs-Banner doch
        noch ueber der Seite, misst dieser Lauf das Banner statt der Seite —
        und das darf nicht als Ergebnis durchgehen. Ein Messgeraet, dessen
        Voraussetzung nicht gilt, muss stehenbleiben, nicht schaetzen.
      */
      if (await page.locator('[aria-labelledby="consent-title"]').count()) {
        throw new Error(
          `Das Einwilligungs-Banner steht auf ${route.path} noch da — die Voreinwilligung greift nicht ` +
            `(Schluessel oder Version aus lib/consent.ts geaendert?). Gemessen wuerde das Banner, nicht die Seite.`,
        )
      }

      /*
        Einmal durchscrollen: Der groesste sichtbare Bereich kann unter der
        Falz liegen, und die Einblendungen loesen erst beim Scrollen aus.
        Danach zurueck nach oben — LCP zaehlt bis zur ersten Eingabe, und
        Scrollen ist keine.
      */
      await page.evaluate(async () => {
        const step = window.innerHeight
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 120))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(500)

      const measured = await page.evaluate(() => {
        const state = window.__vitals ?? {}
        const nav = performance.getEntriesByType("navigation")[0]
        return {
          lcp: state.lcp ?? null,
          cls: state.cls ?? null,
          observed: state.observed === true,
          element: state.lcpElement ?? null,
          eager: state.lcpEager ?? null,
          ttfb: nav ? nav.responseStart : null,
        }
      })

      rows.push({
        fenster: viewport.name,
        route: route.name,
        lcp: measured.lcp,
        cls: measured.cls,
        observed: measured.observed,
        element: measured.element,
        eager: measured.eager,
        ttfb: measured.ttfb,
        html: htmlBytes,
      })
      await page.close()
    }

    await context.close()
  }
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}

if (asJson) {
  console.log(JSON.stringify(rows, null, 2))
  process.exit(0)
}

const ms = (value) => (value === null || value === undefined ? "—" : `${Math.round(value)} ms`)
const kb = (value) => (value ? `${Math.round(value / 1024)} kB` : "—")
const clsText = (value) => (value === null || value === undefined ? "—" : value.toFixed(3))

/**
 * Drei Zustaende, nicht zwei. „Kein Wert" ist NICHT „in Ordnung": Genau diese
 * Verwechslung hat der erste Lauf gemacht — jede Zeile ohne Messwert stand als
 * Strich da, und der Schlusssatz hat trotzdem Entwarnung gegeben.
 */
function verdict(row) {
  if (!row.observed || row.lcp === null || row.cls === null) return "?   "
  if (row.lcp > LCP_LIMIT_MS || row.cls > CLS_LIMIT) return "HOCH"
  return "ok  "
}

for (const viewport of VIEWPORTS) {
  console.log(`  ${viewport.name} (${viewport.width}×${viewport.height})`)
  for (const row of rows.filter((entry) => entry.fenster === viewport.name)) {
    console.log(
      `    ${verdict(row)}  ${row.route.padEnd(16)}` +
        `LCP ${ms(row.lcp).padStart(8)}   CLS ${clsText(row.cls).padStart(6)}` +
        `   TTFB ${ms(row.ttfb).padStart(7)}   HTML ${kb(row.html).padStart(7)}`,
    )
    /*
      Das groesste Element in einer zweiten, eingerueckten Zeile — es ist die
      Antwort auf „warum diese Zahl", und bei einem Bild steht dahinter, ob es
      bevorzugt geladen wurde.
    */
    if (row.element) {
      const bild = row.eager === null ? "" : row.eager ? "   (priority)" : "   (OHNE priority)"
      console.log(`          groesstes Element: ${row.element}${bild}`)
    }
  }
  console.log("")
}

const blind = rows.filter((row) => verdict(row) === "?   ")
const over = rows.filter((row) => verdict(row) === "HOCH")

if (blind.length > 0) {
  console.log(
    `${blind.length} Messung(en) ohne Wert: ` +
      blind.map((row) => `${row.fenster}/${row.route}`).join(", ") +
      "\nDas ist kein gutes Ergebnis, sondern gar keines — der Beobachter hat nichts geliefert.",
  )
} else if (over.length > 0) {
  console.log(
    `${over.length} Messung(en) ueber der Schwelle: ` +
      over.map((row) => `${row.fenster}/${row.route}`).join(", "),
  )
} else {
  console.log(
    `Alle ${rows.length} Messungen unter den Schwellen (LCP ${LCP_LIMIT_MS} ms, CLS ${CLS_LIMIT}).\n` +
      "Das ist das Labor auf dieser Maschine — kein Urteil ueber echte Besuche.\n" +
      "Die entstehen erst nach dem Livegang und stehen dann in der Search Console.",
  )
}
process.exit(blind.length === 0 && over.length === 0 ? 0 : 1)
