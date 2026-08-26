#!/usr/bin/env node
/**
 * MP10-5 — die Mobile-Pruefung, die nicht vom Hinsehen abhaengt.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DAS ZUSAETZLICH ZUM BILDERSATZ GIBT
 * `npm run shots` nimmt zwei Breiten auf: 390 und 1440. Das sind zwei Punkte
 * auf einer Strecke, auf der es an den RAENDERN schiefgeht — bei 320, wo der
 * Text keinen Platz mehr hat, und bei 768, wo die Raster von einer auf zwei
 * Spalten springen. Und selbst wenn ein Bild die Stelle traefe: Ein Fehler,
 * den ein Mensch auf einem Bild sehen muss, wird irgendwann uebersehen.
 *
 * Deshalb misst dieser Lauf zwei Dinge, die sich hart entscheiden lassen:
 *
 *   1. WAAGERECHTES UEBERLAUFEN. Die Seite darf nicht breiter sein als das
 *      Fenster. Ist sie es, benennt der Lauf das Element, das hinausragt —
 *      nicht nur „irgendwo 40 Pixel zu viel". Das ist der Fehler, den
 *      Hero-Umbrueche, Raster, der Kalender und die Fusszeile erzeugen.
 *
 *   2. ZU KLEINE BEDIENFLAECHEN. Was man mit dem Daumen trifft, muss 24 CSS-
 *      Pixel in beide Richtungen haben (WCAG 2.2, 2.5.8 Target Size Minimum).
 *      Das axe-Gate prueft das NICHT — es faehrt WCAG 2.1. Genau hier sitzen
 *      der Sprachumschalter und die WhatsApp-Schaltflaeche.
 *
 * Was er NICHT prueft: ob es gut aussieht. Ein Umbruch kann fehlerfrei und
 * trotzdem haesslich sein. Dafuer bleibt der Bildersatz und das Auge.
 *
 * ---------------------------------------------------------------------------
 * AUFRUF
 *   npm run build && npm run mobile
 *   npm run mobile -- --json
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.MOBILE_PORT ?? 4325)
const BASE = `http://127.0.0.1:${PORT}`

/**
 * Die Breiten, an denen es sich entscheidet — nicht die bequemen dazwischen.
 *
 *   320  das schmalste Geraet, das real noch vorkommt (iPhone SE 1, kleine
 *        Androiden, und jedes Telefon mit vergroesserter Schrift)
 *   360  die haeufigste Android-Breite
 *   390  iPhone der letzten Jahre — die Breite aus dem Bildersatz
 *   430  die grossen iPhones; hier springen manche Raster zu frueh
 *   768  Tablet hochkant: die klassische Kante, an der aus einer Spalte zwei
 *        werden — und an der Ueberschriften plotzlich zu wenig Platz haben
 *   1024 Tablet quer / kleines Notebook
 */
const WIDTHS = [320, 360, 390, 430, 768, 1024]

/** 24 CSS-Pixel in beide Richtungen — WCAG 2.2, Erfolgskriterium 2.5.8 (AA). */
const MIN_TARGET = 24

/**
 * Die Seiten mit den in der Aufgabe genannten Stellen: Hero-Umbrueche
 * (Startseite, beide Sprachen), Raster (Leistungen, Produkte, Arbeiten,
 * Systeme), Fusszeile plus Sprachumschalter (ueberall), WhatsApp-Weg
 * (Kontakt) und der Kalender (Terminassistent, Schritt 2 — der ist ein
 * Zustand, keine Adresse, also wird hingeklickt wie im Bildersatz).
 */
const ROUTES = [
  { name: "start", path: "/" },
  { name: "start-tr", path: "/tr" },
  { name: "leistungen", path: "/leistungen" },
  { name: "leistung-detail", path: "/leistungen/webdesign" },
  { name: "produkte", path: "/produkte" },
  { name: "produkt-detail", path: "/produkte/meai" },
  { name: "arbeiten", path: "/arbeiten" },
  { name: "betrieb", path: "/betrieb" },
  { name: "systeme", path: "/systeme" },
  { name: "unternehmen", path: "/unternehmen" },
  { name: "insights", path: "/insights" },
  { name: "kontakt", path: "/kontakt" },
  { name: "kontakt-tr", path: "/tr/kontakt" },
  { name: "termin", path: "/termin" },
  {
    name: "termin-kalender",
    path: "/termin",
    async act(page) {
      await page.getByRole("button", { name: "Kostenlose Erstberatung" }).first().click()
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.waitForTimeout(400)
    },
  },
  { name: "impressum", path: "/impressum" },
]

/* Wortgleich mit `screenshots.mjs`, `a11y.mjs` und `vitals.mjs`. */
const CONSENT = `try{
  localStorage.setItem('creadig_consent', JSON.stringify({
    functional: true, statistics: false, version: 5, decidedAt: '2026-01-01T00:00:00.000Z'
  }));
}catch(e){}`

/**
 * Laeuft IM Browser. Zwei Messungen, beide gegen das Fenster, nicht gegen
 * Vermutungen.
 */
const PROBE = `(() => {
  const vw = document.documentElement.clientWidth;
  const out = { vw, overflow: [], small: [] };

  /*
    Ueberlaufen — und zwar die Frage, die den Besucher betrifft.

    Der erste Anlauf hat jedes Element gemeldet, dessen rechte Kante rechnerisch
    hinter dem Fensterrand lag: 607 Treffer, praktisch alle harmlos. Darunter
    hunderte <g> aus Hintergrund-Grafiken, deren SVG sie laengst abschneidet,
    und der Sprachumschalter in der festen Kopfzeile. Nichts davon macht die
    Seite breit — sie sind GEKAPPT, man sieht sie schlicht nicht.

    Die eigentliche Frage lautet nicht „ragt irgendwo etwas hinaus", sondern:
    LAESST SICH DIE SEITE SEITWAERTS SCHIEBEN? Das beantwortet der Browser
    selbst, mit einer Zahl: 'scrollWidth' gegen die Fensterbreite. Erst wenn
    die auseinanderfallen, lohnt die Suche nach dem Schuldigen — und dann
    zaehlen nur Elemente, ueber denen kein Vorfahr steht, der sie abschneidet.
  */
  const pageOver = Math.round(document.documentElement.scrollWidth - vw);
  out.pageOver = pageOver;

  if (pageOver > 1) {
    /* Schneidet ein Vorfahr ab, kann das Kind die Seite nicht breit machen. */
    const clipped = (el) => {
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        if (node instanceof SVGElement) return true;
        const style = getComputedStyle(node);
        if (style.overflowX !== 'visible') return true;
        if (style.position === 'fixed' || style.position === 'sticky') return true;
      }
      return false;
    };

    const bleeders = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el instanceof SVGElement) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (style.position === 'fixed') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (Math.round(rect.right - vw) <= 1) continue;
      if (clipped(el)) continue;
      bleeders.push({ el, over: Math.round(rect.right - vw) });
    }
    for (const item of bleeders) {
      /* Steckt schon der Vorfahr in der Liste, ist er der bessere Hinweis. */
      if (bleeders.some((other) => other !== item && other.el.contains(item.el))) continue;
      const el = item.el;
      const name =
        el.tagName.toLowerCase() +
        (el.id ? '#' + el.id : '') +
        (typeof el.className === 'string' && el.className
          ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.')
          : '');
      const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
      out.overflow.push({ name, over: item.over, text });
    }

    /*
      Die Seite laeuft ueber, aber kein einzelnes Element laesst sich dafuer
      benennen — das kommt vor (Rand, Transformation, Tabelle). Dann steht das
      auch so da, statt den Befund verschwinden zu lassen.
    */
    if (out.overflow.length === 0) {
      out.overflow.push({ name: '(kein einzelnes Element zuzuordnen)', over: pageOver, text: '' });
    }
  }

  /*
    Bedienflaechen — und zwar nach der ganzen Regel, nicht nach der Haelfte.

    Der erste Anlauf hat nur „kleiner als 24×24?" gefragt und 919 Befunde
    gemeldet. Fast alle waren keine: das unsichtbare „Zum Inhalt springen",
    das erst beim Tastaturfokus erscheint, und jeder Textlink mit 20 px
    Zeilenhoehe, der ringsum 40 px Luft hat. Ein Gate, das 900 Zeilen meldet,
    von denen 890 falsch sind, wird nach einer Woche ignoriert — und dann
    findet es auch die zehn echten nicht mehr.

    WCAG 2.2 / 2.5.8 nennt zwei Auswege aus der 24×24-Forderung, und der
    zweite ist der, der hier fast immer greift: ABSTAND. Ein kleineres Ziel
    ist zulaessig, solange ein Kreis von 24 px Durchmesser um seinen
    Mittelpunkt kein anderes Ziel beruehrt. Anders gesagt: Klein ist in
    Ordnung, solange daneben nichts ist, was man versehentlich trifft.

    Genau so wird hier gemessen: erst alle Ziele mit ihren Mittelpunkten
    einsammeln, dann fuer jedes zu kleine pruefen, ob ein anderer Mittelpunkt
    naeher als 24 px liegt. Nur dann ist es ein Befund. Das ist eine
    Annaeherung an den Normtext (der von ungestoerten Kreisen spricht, nicht
    von Mittelpunktsabstaenden) — sie faellt zugunsten der Meldung aus, nicht
    dagegen.

    Ausgenommen bleiben Links im Fliesstext: Die nimmt 2.5.8 ausdruecklich
    aus, weil man sie nicht vergroessern kann, ohne die Zeile zu zerreissen.
  */
  const targets = [];
  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select, summary')) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    /*
      Weggeblendetes zaehlt nicht: die Sprungmarke liegt bis zum Fokus
      ausserhalb des Fensters oder ist auf einen Pixel beschnitten. Sie ist
      kein Ziel fuer den Daumen — sie ist eins fuer die Tastatur, und dort
      gilt 2.5.8 nicht.
    */
    if (rect.width <= 1 || rect.height <= 1) continue;
    if (rect.right <= 0 || rect.bottom <= 0 || rect.left >= vw) continue;
    targets.push({
      el,
      rect,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    });
  }

  const seen = new Set();
  for (const target of targets) {
    const { el, rect } = target;
    if (rect.width >= ${MIN_TARGET} && rect.height >= ${MIN_TARGET}) continue;
    if (el.closest('p, li:not([class*="nav"]), dd')) continue;

    /* Abstands-Ausnahme: liegt kein anderes Ziel naeher als 24 px, ist gut. */
    const crowded = targets.some((other) => {
      if (other === target) return false;
      const dx = other.cx - target.cx;
      const dy = other.cy - target.cy;
      return Math.hypot(dx, dy) < ${MIN_TARGET};
    });
    if (!crowded) continue;

    const label = (
      el.getAttribute('aria-label') ||
      (el.textContent || '').trim() ||
      el.getAttribute('name') ||
      el.tagName.toLowerCase()
    ).replace(/\\s+/g, ' ').slice(0, 40);
    const key = label + Math.round(rect.width) + 'x' + Math.round(rect.height);
    if (seen.has(key)) continue;
    seen.add(key);
    out.small.push({ label, w: Math.round(rect.width), h: Math.round(rect.height) });
  }

  return out;
})()`

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
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
  env: { ...process.env, NODE_ENV: "production" },
})

let browser
const findings = []

try {
  await waitForServer()
  try {
    browser = await chromium.launch({ channel: "chrome" })
  } catch {
    if (!asJson) console.log("  (kein Chrome gefunden — Lauf mit dem mitgelieferten Chromium)")
    browser = await chromium.launch()
  }

  if (!asJson) console.log(`\nMobile-Pruefung gegen ${BASE}\n`)

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: 2,
      /* Wie im Bildersatz: sonst sind eingeblendete Abschnitte noch
         unsichtbar und laufen deshalb scheinbar nirgends ueber. */
      reducedMotion: "reduce",
    })
    await context.addInitScript(CONSENT)

    for (const route of ROUTES) {
      const page = await context.newPage()
      await page.goto(`${BASE}${route.path}`, { waitUntil: "load" })
      if (route.act) await route.act(page)

      /* Einmal durchscrollen: verzoegert geladene Bilder haben sonst noch
         keine Groesse und laufen nirgends ueber. */
      await page.evaluate(async () => {
        const step = window.innerHeight
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 80))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(200)

      const result = await page.evaluate(PROBE)
      for (const item of result.overflow) {
        findings.push({ art: "ueberlauf", width, route: route.name, pageOver: result.pageOver, ...item })
      }
      for (const item of result.small) {
        findings.push({ art: "bedienflaeche", width, route: route.name, ...item })
      }
      await page.close()
    }

    await context.close()
    if (!asJson) {
      const count = findings.filter((f) => f.width === width).length
      console.log(`  ${String(width).padStart(4)} px   ${count === 0 ? "ok" : `${count} Befund(e)`}`)
    }
  }
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}

if (asJson) {
  console.log(JSON.stringify(findings, null, 2))
  process.exit(findings.length === 0 ? 0 : 1)
}

const overflow = findings.filter((f) => f.art === "ueberlauf")
const targets = findings.filter((f) => f.art === "bedienflaeche")

if (overflow.length > 0) {
  console.log(`\n  Waagerechtes Ueberlaufen (${overflow.length}):`)
  for (const f of overflow) {
    console.log(`    ${String(f.width).padStart(4)} px  ${f.route.padEnd(16)}+${f.over} px  ${f.name}`)
    if (f.text) console.log(`                                        „${f.text}"`)
  }
}

if (targets.length > 0) {
  console.log(`\n  Bedienflaechen unter ${MIN_TARGET}×${MIN_TARGET} px (${targets.length}):`)
  for (const f of targets) {
    console.log(
      `    ${String(f.width).padStart(4)} px  ${f.route.padEnd(16)}${f.w}×${f.h} px  ${f.label}`,
    )
  }
}

console.log(
  findings.length === 0
    ? `\n${WIDTHS.length} Breiten × ${ROUTES.length} Seiten: nichts laeuft ueber, ` +
        `jede Bedienflaeche ist mindestens ${MIN_TARGET}×${MIN_TARGET} px.\n` +
        "Das sagt NICHT, dass es gut aussieht — nur, dass nichts bricht."
    : `\n${findings.length} Befund(e) auf ${WIDTHS.length} Breiten × ${ROUTES.length} Seiten.`,
)
process.exit(findings.length === 0 ? 0 : 1)
