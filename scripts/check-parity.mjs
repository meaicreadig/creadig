#!/usr/bin/env node
/**
 * BF-A7 — das Paritaets-Gate fuer die Leistungsseiten.
 *
 * ---------------------------------------------------------------------------
 * WAS ES PRUEFT UND WARUM ES NOETIG IST
 * Die Abnahme fuer BF-A7 lautet: „Beide Seiten gleich lang, gleich
 * vollstaendig, gleiche Abschnitte." Das ist genau die Art Zusage, die man
 * beim Schreiben einhaelt und drei Aenderungen spaeter verliert — ein
 * Aufzaehlungspunkt kommt auf Deutsch dazu, auf Tuerkisch nicht, und niemand
 * merkt es, weil niemand beide Seiten nebeneinander liest.
 *
 * Deshalb ist es hier eine Messung, kein Vorsatz:
 *
 *   Abschnitte      Gleiche Zahl an Ueberschriften (h2/h3) im `main`.
 *   Vollstaendigkeit Gleiche Zahl an Aufzaehlungspunkten im `main`.
 *   Laenge          Textmenge im Verhaeltnis, Toleranz unten.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE LAENGE EINE TOLERANZ HAT — UND KEINE GROSSE
 * Eine Uebersetzung ist keine Wortersetzung; Tuerkisch baut denselben
 * Gedanken kuerzer oder laenger. Gemessen wurde ueber alle sechs Seiten ein
 * Verhaeltnis zwischen 0,88 und 0,95. Die Toleranz steht bei 0,80 bis 1,25:
 * eng genug, dass ein vergessener Absatz auffaellt, weit genug, dass eine
 * gute Uebersetzung nicht als Fehler gilt.
 *
 * Was das Gate NICHT kann: beurteilen, ob die Uebersetzung etwas taugt. Es
 * zaehlt Struktur. Ob der tuerkische Satz auch traegt, entscheidet weiter ein
 * Mensch — das steht hier, damit ein gruener Lauf nicht mehr behauptet, als
 * er geprueft hat.
 *
 * Aufruf: automatisch im `postbuild`, oder `node scripts/check-parity.mjs`
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP = path.join(ROOT, ".next", "server", "app")

/** Verhaeltnis tuerkische zu deutscher Textmenge. */
const MIN_RATIO = 0.8
const MAX_RATIO = 1.25

/**
 * Die Slugs kommen aus derselben Datei wie die Routen — eine neue
 * Leistungsseite ist damit automatisch im Gate, ohne dass jemand daran
 * denken muss. Gelesen wird mit einem Ausdruck statt mit dem TypeScript-Modul:
 * Dieses Skript laeuft nach dem Build in reinem Node.
 */
function slugs() {
  const source = fs.readFileSync(path.join(ROOT, "lib", "service-pages.ts"), "utf8")
  return [...source.matchAll(/^\s{4}slug: "([^"]+)",$/gm)].map((match) => match[1])
}

function html(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null
}

/** Nur der Seiteninhalt zaehlt — Kopf- und Fusszeile sind auf jeder Seite gleich. */
function main(source) {
  const start = source.indexOf("<main")
  const end = source.lastIndexOf("</main>")
  return start === -1 || end === -1 ? source : source.slice(start, end)
}

function measure(source) {
  const body = main(source)
  return {
    ueberschriften: (body.match(/<h[23][\s>]/g) ?? []).length,
    punkte: (body.match(/<li[\s>]/g) ?? []).length,
    zeichen: body
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;|&#\d+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim().length,
  }
}

const problems = []
const rows = []

for (const slug of slugs()) {
  const de = html(path.join(APP, "leistungen", `${slug}.html`))
  const tr = html(path.join(APP, "tr", "leistungen", `${slug}.html`))

  if (!de || !tr) {
    // Unveroeffentlichte Seiten werden gar nicht erst gebaut — kein Fehler.
    if (!de && !tr) continue
    problems.push(`${slug}: nur ${de ? "die deutsche" : "die tuerkische"} Fassung wurde gebaut`)
    continue
  }

  const a = measure(de)
  const b = measure(tr)
  const ratio = a.zeichen === 0 ? 0 : b.zeichen / a.zeichen

  rows.push({ slug, a, b, ratio })

  if (a.ueberschriften !== b.ueberschriften) {
    problems.push(
      `${slug}: ${a.ueberschriften} Abschnitte auf DE, ${b.ueberschriften} auf TR — ein Abschnitt fehlt`,
    )
  }
  if (a.punkte !== b.punkte) {
    problems.push(
      `${slug}: ${a.punkte} Aufzaehlungspunkte auf DE, ${b.punkte} auf TR — eine Zeile fehlt`,
    )
  }
  if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
    problems.push(
      `${slug}: Textmenge TR/DE = ${ratio.toFixed(2)} (erlaubt ${MIN_RATIO}–${MAX_RATIO}) — ` +
        `${b.zeichen} gegen ${a.zeichen} Zeichen`,
    )
  }
}

console.log(`\nParitaets-Gate — ${rows.length} Leistungsseite(n), DE gegen TR\n`)
for (const row of rows) {
  console.log(
    `  ${row.slug.padEnd(28)} Abschnitte ${String(row.a.ueberschriften).padStart(2)}` +
      ` · Punkte ${String(row.a.punkte).padStart(2)}` +
      ` · Text TR/DE ${row.ratio.toFixed(2)}`,
  )
}

if (problems.length > 0) {
  console.error(`\nFEHL — ${problems.length} Abweichung(en):`)
  for (const problem of problems) console.error(`  · ${problem}`)
  console.error("\nEine halb uebersetzte Seite geht nicht live.")
  process.exit(1)
}

console.log("\nOK — gleiche Abschnitte, gleiche Punkte, vergleichbare Laenge.")
console.log("Das heisst NICHT, dass die Uebersetzung gut ist — das prueft weiter ein Mensch.")
