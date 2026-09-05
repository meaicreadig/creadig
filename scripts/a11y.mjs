#!/usr/bin/env node
/**
 * BF-A2 / BF-A12 — die automatisierte Hälfte der Barrierefreiheits-Prüfung.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESES SKRIPT IST UND WAS NICHT
 * Es fährt axe-core über die Hauptrouten in beiden Sprachen, beiden
 * Erscheinungsbildern und zwei Fenstergrößen. axe findet nach Angabe seiner
 * Entwickler ungefähr ein Drittel der Barrieren — alles, was maschinell
 * entscheidbar ist. Die anderen zwei Drittel (ist der Alternativtext
 * SINNVOLL? kommt man mit der Tastatur durch den Assistenten? sagt die
 * Fehlermeldung, was zu tun ist?) prüft ein Mensch nach
 * `docs/barrierefreiheit-pruefraster.md`.
 *
 * Deshalb heißt ein grüner Lauf hier NICHT „barrierefrei". Er heißt: keine
 * maschinell feststellbare Verletzung. Wer daraus mehr macht, verkauft
 * dasselbe Versprechen wie ein Overlay.
 *
 * ---------------------------------------------------------------------------
 * WARUM BEIDE ERSCHEINUNGSBILDER
 * Kontrast ist der häufigste Mangel, und ein Wert, der hell besteht, kann im
 * Dunkelmodus durchfallen. Eine Prüfung, die nur eine Fassung ansieht, prüft
 * die Hälfte.
 *
 * ---------------------------------------------------------------------------
 * WARUM DER ASSISTENT ZWEIMAL VORKOMMT
 * `/termin` ist ein Zustand, keine Route. Schritt 1 prüft sich anders als
 * Schritt 3 mit dem Formular — und genau dort sitzen die Feldbeschriftungen.
 *
 * Aufruf:  npm run build && npm run a11y
 *          npm run a11y -- --json   (Maschinenlesbar für den Befund)
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"
import AxeBuilder from "@axe-core/playwright"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.A11Y_PORT ?? 4323)
const BASE = `http://127.0.0.1:${PORT}`

/** WCAG 2.1 AA — genau der Umfang, den das Prüfraster festlegt. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]

/**
 * BF-A12 — die Beschriftungsprüfung, die axe nicht leisten kann.
 *
 * ---------------------------------------------------------------------------
 * GEGENGEPRÜFT, NICHT ANGENOMMEN
 * Die Abnahme verlangt, dass der Lauf fehlschlägt, wenn jemand ein `label`
 * entfernt. Also haben wir genau das getan: die Beschriftung des Adressfelds
 * im Kurz-Check gelöscht und den Lauf gestartet. Ergebnis: **kein Befund** —
 * weder über die WCAG-Marken noch mit dem vollen Regelsatz einschließlich
 * „best practice". Der Platzhalter gilt als zugänglicher Name, und damit ist
 * die Sache für ein automatisches Werkzeug erledigt.
 *
 * Für einen Menschen ist sie es nicht: Ein Name, der nur im Platzhalter
 * steht, verschwindet in dem Moment, in dem jemand zu tippen anfängt. Wer
 * beim vierten Feld nachsehen will, was oben verlangt war, findet nichts
 * mehr. Punkt 5 des Prüfrasters verlangt deshalb eine echte Verknüpfung von
 * `label` und `input` — und was das Raster verlangt, muss das Gate messen.
 *
 * Diese Prüfung läuft im Browser über jedes sichtbare Feld der Seite und
 * fragt genau eine Sache: Hat es einen Namen, der nicht der Platzhalter ist?
 * Sie läuft einmal je Route — ob ein Feld beschriftet ist, hängt weder vom
 * Fenster noch vom Erscheinungsbild ab.
 */
async function unlabelledFields(page) {
  return page.evaluate(() => {
    const found = []
    const fields = document.querySelectorAll(
      "input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea",
    )
    for (const field of fields) {
      const labelled =
        (field.labels && field.labels.length > 0) ||
        field.hasAttribute("aria-label") ||
        field.hasAttribute("aria-labelledby")
      if (labelled) continue
      found.push(
        field.id
          ? `#${field.id}`
          : `${field.tagName.toLowerCase()}[name="${field.getAttribute("name") ?? "?"}"]`,
      )
    }
    return found
  })
}

const ROUTES = [
  { name: "startseite", path: "/" },
  { name: "startseite-tr", path: "/tr" },
  { name: "leistungen", path: "/leistungen" },
  { name: "leistungen-tr", path: "/tr/leistungen" },
  { name: "leistung-detail", path: "/leistungen/webdesign" },
  /* BF-A12 — die neue Einstiegsleistung steht im Lauf, und zwar in beiden
     Sprachen: Sie traegt das einzige zusaetzliche Formular der Seite
     (Kurz-Check) und damit genau die Mangelklasse, die am haeufigsten
     auftritt — Feldbeschriftungen. */
  { name: "barrierefreiheit-leistung", path: "/leistungen/barrierefreiheit-website" },
  { name: "barrierefreiheit-leistung-tr", path: "/tr/leistungen/barrierefreiheit-website" },
  { name: "insights", path: "/insights" },
  { name: "insight-detail", path: "/insights/eigene-seite-geprueft" },
  { name: "insight-detail-tr", path: "/tr/insights/eigene-seite-geprueft" },
  { name: "produkte", path: "/produkte" },
  { name: "produkt-detail", path: "/produkte/meai" },
  { name: "arbeiten", path: "/arbeiten" },
  { name: "unternehmen", path: "/unternehmen" },
  /* MP10-4 — beide neuen Seiten, DE und TR. */
  { name: "betrieb", path: "/betrieb" },
  { name: "betrieb-tr", path: "/tr/betrieb" },
  { name: "systeme", path: "/systeme" },
  { name: "systeme-tr", path: "/tr/systeme" },
  { name: "kontakt", path: "/kontakt" },
  { name: "kontakt-tr", path: "/tr/kontakt" },
  /*
   * GATE 01 — DER BETRIEBSCHECK FEHLTE IN DIESER LISTE.
   *
   * Achtundzwanzig Routen standen hier, und ausgerechnet die Flaeche mit den
   * meisten Bedienelementen des ganzen Hauses nicht: fuenfzehn Fragen mal
   * drei Antworten sind fuenfundvierzig Auswahlfelder, dazu ein Formular.
   * Sie ist zugleich der Hauptweg in den Vertrieb.
   *
   * Zwei Zustaende, weil es zwei Seiten sind: der Fragebogen, und das
   * Ergebnis mit dem Formular darunter. Letzteres erscheint erst nach
   * fuenfzehn Antworten — ein Lauf, der nur die erste Haelfte prueft, prueft
   * das Formular nie.
   */
  { name: "betriebscheck", path: "/betriebscheck" },
  { name: "betriebscheck-tr", path: "/tr/betriebscheck" },
  {
    name: "betriebscheck-ergebnis",
    path: "/betriebscheck",
    async act(page) {
      /* Jede Frage mit der mittleren Antwort beantworten, dann das Ergebnis
         zeigen lassen. Nativ geklickt: React haengt an den Ereignissen der
         Eingabefelder, und `check()` wartet auf einen Zustand, den erst das
         erneute Rendern setzt. */
      await page.evaluate(() => {
        const r = [...document.querySelectorAll('input[type=radio]')]
        for (let i = 1; i < r.length; i += 3) r[i].click()
      })
      await page.getByRole("button", { name: /Ergebnis/i }).click()
      await page.waitForTimeout(600)
    },
  },
  { name: "termin-schritt1", path: "/termin" },
  {
    name: "termin-schritt3",
    path: "/termin",
    async act(page) {
      await page.getByRole("button", { name: "Kostenlose Erstberatung" }).first().click()
      await page.getByRole("button", { name: "Weiter" }).click()
      // Erst ein Tag, dann ein Zeitfenster — sonst bleibt „Weiter" gesperrt.
      await page
        .locator("button:not([disabled])")
        .filter({ hasText: /^\d{1,2}$/ })
        .last()
        .click()
      await page.getByRole("button", { name: /^Vormittag/ }).click()
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.waitForTimeout(400)
    },
  },
  { name: "barrierefreiheit", path: "/barrierefreiheit" },
  { name: "barrierefreiheit-tr", path: "/tr/erisilebilirlik" },
  { name: "datenschutz", path: "/datenschutz" },
  { name: "impressum", path: "/impressum" },
  { name: "fehlerseite-404", path: "/diese-adresse-gibt-es-nicht" },
  { name: "fehlerseite-404-tr", path: "/tr/bu-adres-yok" },
]

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobil", width: 390, height: 844 },
]

const THEMES = ["hell", "dunkel"]

function seedScript(theme) {
  return `try{
    localStorage.setItem('creadig_consent', JSON.stringify({
      functional: true, statistics: false, version: 5, decidedAt: '2026-01-01T00:00:00.000Z'
    }));
    localStorage.setItem('creadig-theme', ${theme === "dunkel" ? "'dark'" : "'light'"});
  }catch(e){}`
}

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

const asJson = process.argv.includes("--json")

/**
 * BF-A12 — ein einzelner Name aus der Liste oben, fuer die Gegenprobe.
 *
 *   A11Y_ONLY=kontakt npm run a11y
 *
 * Gebaut fuer den Fall, in dem man WISSEN will, ob das Gate ueberhaupt
 * anschlaegt: ein `label` entfernen, den einen Lauf starten, Ergebnis lesen,
 * zuruecknehmen. Ohne das dauert jede Gegenprobe alle Routen lang — und eine
 * Gegenprobe, die zu lange dauert, macht niemand.
 */
const only = process.env.A11Y_ONLY?.trim()
const routes = only ? ROUTES.filter((route) => route.name === only) : ROUTES
if (only && routes.length === 0) {
  console.error(`Keine Route mit dem Namen "${only}".`)
  process.exit(2)
}
const findings = new Map()

function record(violation, where) {
  const key = `${violation.id}::${violation.nodes[0]?.target?.join(" ") ?? "?"}`
  const entry = findings.get(key) ?? {
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    wcag: violation.tags.filter((tag) => /^wcag\d/.test(tag)),
    selector: violation.nodes[0]?.target?.join(" ") ?? "?",
    beispiel: (violation.nodes[0]?.failureSummary ?? "").split("\n").slice(0, 3).join(" · "),
    orte: new Set(),
    knoten: 0,
  }
  entry.orte.add(where)
  entry.knoten += violation.nodes.length
  findings.set(key, entry)
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
  env: { ...process.env, NODE_ENV: "production" },
})

let browser
let checked = 0

try {
  await waitForServer()
  /*
   * BF-A12 — dasselbe Skript laeuft auf dem Rechner des Bauenden und im CI.
   *
   * Lokal ist der installierte Chrome der richtige Browser: Er rendert, was
   * ein Besucher sieht. Auf einem CI-Laeufer gibt es ihn nicht — dort steht
   * das mitgelieferte Chromium bereit. Der Rueckfall wird angesagt und nicht
   * verschwiegen: Es ist ein anderer Browser, auch wenn axe darin dieselben
   * Regeln prueft.
   */
  try {
    browser = await chromium.launch({ channel: "chrome" })
  } catch {
    if (!asJson) console.log("  (kein Chrome gefunden — Lauf mit dem mitgelieferten Chromium)")
    browser = await chromium.launch()
  }

  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      /*
       * `reducedMotion: "reduce"` ist hier eine MESSENTSCHEIDUNG, keine
       * Bequemlichkeit: Die Seite blendet Abschnitte beim Scrollen ein
       * (0,9 s). Ohne den Schalter misst axe mitten in der Animation und
       * meldet Kontrastwerte einer halb durchsichtigen Flaeche — Werte, die
       * es im fertigen Zustand nie gibt. Genau das ist passiert: Dieselbe
       * Ueberschrift fiel auf /tr durch und auf / nicht, bei identischem
       * Markup.
       *
       * Mit reduzierter Bewegung rendert `Reveal` den Endzustand sofort
       * (siehe lib/use-prefers-reduced-motion.ts) — gemessen wird also, was
       * ein Mensch sieht.
       */
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme === "dunkel" ? "dark" : "light",
        reducedMotion: "reduce",
        locale: "de-DE",
      })
      await context.addInitScript(seedScript(theme))
      const page = await context.newPage()

      for (const route of routes) {
        await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" })
        if (route.act) await route.act(page)
        // Einblendungen aufloesen, sonst prueft axe unsichtbare Bloecke nicht.
        await page.evaluate(async () => {
          const step = Math.round(window.innerHeight * 0.8)
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y)
            await new Promise((resolve) => setTimeout(resolve, 60))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForTimeout(400)

        const result = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        checked++
        const violations = [...result.violations]

        /*
         * Die eigene Beschriftungsregel nur einmal je Route: Ob ein Feld
         * beschriftet ist, haengt weder vom Fenster noch vom Erscheinungsbild
         * ab. Sie viermal zu fahren kostet Laufzeit und beweist dreimal
         * dasselbe.
         */
        if (viewport.name === "desktop" && theme === "hell") {
          for (const selector of await unlabelledFields(page)) {
            violations.push({
              id: "eigene-regel-feldbeschriftung",
              impact: "serious",
              help: "Formularfeld ohne Beschriftung — ein Platzhalter ist kein Name",
              tags: ["wcag2a", "wcag412", "raster-punkt-5"],
              nodes: [
                {
                  target: [selector],
                  failureSummary:
                    "Das Feld hat weder ein verknuepftes label noch aria-label oder " +
                    "aria-labelledby. Ein Platzhalter verschwindet beim Tippen.",
                },
              ],
            })
          }
        }

        for (const violation of violations) {
          record(violation, `${route.name} · ${viewport.name}/${theme}`)
        }
        if (!asJson) {
          const count = violations.length
          console.log(
            `  ${count === 0 ? "ok  " : "FEHL"}  ${viewport.name}/${theme}  ${route.name}` +
              (count ? `  — ${count} Regel(n)` : ""),
          )
        }
      }
      await context.close()
    }
  }
} finally {
  if (browser) await browser.close()
  server.kill("SIGTERM")
}

const list = [...findings.values()].sort((a, b) => b.knoten - a.knoten)

if (asJson) {
  console.log(
    JSON.stringify(
      list.map((entry) => ({ ...entry, orte: [...entry.orte] })),
      null,
      2,
    ),
  )
} else {
  console.log(`\n${checked} Durchläufe (${routes.length} Routen × 2 Fenster × 2 Erscheinungsbilder)`)
  if (list.length === 0) {
    console.log("Keine maschinell feststellbare Verletzung von WCAG 2.1 AA,")
    console.log("und jedes Formularfeld traegt eine echte Beschriftung.")
    console.log("Das heisst NICHT barrierefrei — die Handpruefung nach dem Raster bleibt.")
  } else {
    console.log(`\n${list.length} verschiedene Befunde:\n`)
    for (const entry of list) {
      console.log(`  [${entry.impact}] ${entry.id} — ${entry.help}`)
      console.log(`      WCAG:      ${entry.wcag.join(", ") || "—"}`)
      console.log(`      Element:   ${entry.selector}`)
      console.log(`      Knoten:    ${entry.knoten}`)
      console.log(`      Orte:      ${[...entry.orte].slice(0, 4).join(" | ")}${entry.orte.size > 4 ? ` … (+${entry.orte.size - 4})` : ""}`)
      if (entry.beispiel) console.log(`      Meldung:   ${entry.beispiel}`)
      console.log()
    }
  }
}

process.exitCode = list.length > 0 ? 1 : 0
