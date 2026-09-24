/**
 * DIE TEXTDICHTE DER STARTSEITE — GEMESSEN, NICHT GESCHAETZT.
 *
 * Der Design-Befund vom 24.09.2026 lautete „zu textlastig". Das ist eine
 * Behauptung ueber eine Zahl, also wird die Zahl erhoben: Woerter, Hoehe,
 * Systemlinien und Bilder je Abschnitt. Ohne sie waere jede Kuerzung
 * Geschmack — und jede Nicht-Kuerzung Bequemlichkeit.
 *
 * Aufruf: node scripts/dichte.mjs [--pfad /leistungen]
 */
import { spawn } from "node:child_process"
import { chromium } from "playwright"
/* Diese Messung liest nur die oeffentliche Seite — kein Speicher, keine Datenbank. */
process.env.LEAD_STORE = "aus"
process.env.DATABASE_URL = "postgres://127.0.0.1:9/tot"

const PORT = 4395
const PFAD = process.argv.includes("--pfad") ? process.argv[process.argv.indexOf("--pfad") + 1] : "/"
const srv = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: ["ignore", "ignore", "pipe"], detached: true,
  /* Der Gate `check-pruefumgebung` verlangt beides ausdruecklich am Kindprozess. */
  env: { ...process.env, NODE_ENV: "production", LEAD_STORE: "aus",
    /* Nicht leer, sondern TOT: Eine leere Variable fuellt Next aus `.env.local` — genau der Weg,
       ueber den ein Pruefskript versehentlich die echte Datenbank erreicht (H17). */
    DATABASE_URL: "postgres://127.0.0.1:9/tot", ADMIN_PASSWORD: "x",
    ADMIN_SESSION_SECRET: "probe-sitzung-nur-lokal-0123456789abcdef0123456789",
    LEAD_TOKEN_SECRET: "t", RESEND_API_KEY: "re_x", LEAD_FROM: "a <a@b.invalid>", LEAD_TO: "a@b.invalid" },
})
for (let i = 0; ; i++) { try { if ((await fetch(`http://127.0.0.1:${PORT}/robots.txt`)).status < 500) break } catch {}
  if (i > 300) throw new Error("kein Server"); await new Promise(r => setTimeout(r, 150)) }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`http://127.0.0.1:${PORT}${PFAD}`, { waitUntil: "networkidle" })
const daten = await page.evaluate(() => {
  const out = []
  for (const s of document.querySelectorAll("main > section, main > div > section")) {
    const txt = (s.innerText || "").replace(/\s+/g, " ").trim()
    const woerter = txt ? txt.split(" ").length : 0
    const h = s.getBoundingClientRect().height
    out.push({ id: s.id || s.getAttribute("aria-labelledby") || "(ohne)", woerter, hoehe: Math.round(h),
      rails: s.querySelectorAll("[data-system-rail]").length, bilder: s.querySelectorAll("img, svg").length })
  }
  return { sektionen: out, gesamt: (document.querySelector("main").innerText || "").split(/\s+/).length,
    hoehe: Math.round(document.body.scrollHeight) }
})
console.log(`${PFAD} gesamt: ${daten.gesamt} Woerter, ${daten.hoehe} px hoch\n`)
console.log("Abschnitt".padEnd(34), "Woerter".padStart(8), "Hoehe".padStart(7), "Linien".padStart(7), "Bilder".padStart(7))
for (const s of daten.sektionen) console.log(String(s.id).slice(0,33).padEnd(34), String(s.woerter).padStart(8), String(s.hoehe).padStart(7), String(s.rails).padStart(7), String(s.bilder).padStart(7))
await browser.close(); try { process.kill(-srv.pid, "SIGTERM") } catch { srv.kill() }
