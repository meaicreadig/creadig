#!/usr/bin/env node
/**
 * Deploy-Gate: Wie gross wird die groesste Serverless-Function? (TECH-4)
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESES SKRIPT EXISTIERT
 * Die Function war schon einmal zu gross — und niemand hat es gemerkt, bis
 * der Deploy abgelehnt wurde. Ein gruener `next build` sagt darueber nichts:
 * Next traced die Dateien zwar, meldet aber keine Summe.
 *
 * TECH-1 (Exclude-Liste) und TECH-2 (kein `fs` mehr zur Laufzeit) haben die
 * Ursache beseitigt. Dieses Skript sorgt dafuer, dass sie beseitigt BLEIBT:
 * Ein Import, der versehentlich ein grosses Paket oder ein Verzeichnis
 * hereinzieht, faellt hier auf — lokal, vor dem Push, nicht im Deploy-Log.
 *
 * ---------------------------------------------------------------------------
 * WIE GEMESSEN WIRD
 * Next legt je Einstiegspunkt eine `*.nft.json` mit allen getracten Dateien
 * ab. Vercel bundelt pro Function genau diese Liste. Wir summieren sie also
 * je Datei einzeln (Duplikate innerhalb einer Function zaehlen nur einmal)
 * und nehmen den groessten Wert.
 *
 * Die harte Grenze der Plattform liegt bei 250 MB entpackt. Wir schlagen
 * schon bei 200 MB Alarm — ein Gate, das erst bei 249 MB greift, ist keins.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const NEXT_DIR = path.join(ROOT, ".next")

/** Plattform-Limit 250 MB — wir lassen 50 MB Luft, damit das Gate warnt statt zu bestaetigen. */
const LIMIT_BYTES = 200 * 1024 * 1024

/** Wie viele Functions in der Uebersicht auftauchen. */
const TOP_N = 8

const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(1).padStart(7) + " MB"

/** Alle *.nft.json unterhalb von .next — rekursiv, ohne Fremd-Abhaengigkeiten. */
function findTraces(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...findTraces(full))
    else if (entry.name.endsWith(".nft.json")) found.push(full)
  }
  return found
}

/** Summe der getracten Dateien einer Function; jede Datei zaehlt einmal. */
function traceSize(file) {
  const base = path.dirname(file)
  let list
  try {
    list = JSON.parse(readFileSync(file, "utf8")).files ?? []
  } catch {
    return { bytes: 0, missing: 0, unreadable: true }
  }

  const seen = new Set()
  let bytes = 0
  let missing = 0
  for (const rel of list) {
    const target = path.normalize(path.join(base, rel))
    if (seen.has(target)) continue
    seen.add(target)
    try {
      bytes += statSync(target).size
    } catch {
      // Eine Datei, die der Trace nennt, die es aber nicht gibt, ist kein
      // Groessenproblem — wir zaehlen sie nur mit, um es melden zu koennen.
      missing += 1
    }
  }
  return { bytes, missing, unreadable: false }
}

if (!existsSync(NEXT_DIR)) {
  console.error("Function-Gate: .next fehlt — erst `npm run build` laufen lassen.")
  process.exit(1)
}

const traces = findTraces(NEXT_DIR)
if (traces.length === 0) {
  console.error("Function-Gate: keine *.nft.json gefunden. Hat der Build den Trace-Schritt ausgefuehrt?")
  process.exit(1)
}

const measured = traces
  .map((file) => ({ file: path.relative(ROOT, file), ...traceSize(file) }))
  .sort((a, b) => b.bytes - a.bytes)

const largest = measured[0]
const missing = measured.reduce((sum, entry) => sum + entry.missing, 0)

console.log(`\nFunction-Gate — ${traces.length} Trace(s), Grenze ${mb(LIMIT_BYTES).trim()}\n`)
for (const entry of measured.slice(0, TOP_N)) {
  console.log(`  ${mb(entry.bytes)}  ${entry.file}`)
}
if (measured.length > TOP_N) {
  console.log(`  … und ${measured.length - TOP_N} weitere, alle kleiner`)
}
if (missing > 0) {
  console.log(`\n  Hinweis: ${missing} getracte Datei(en) nicht auffindbar — in der Summe nicht enthalten.`)
}

if (largest.bytes > LIMIT_BYTES) {
  console.error(
    [
      ``,
      `FEHLGESCHLAGEN — die groesste Function ist ${mb(largest.bytes).trim()}, erlaubt sind ${mb(LIMIT_BYTES).trim()}.`,
      `  Betroffen: ${largest.file}`,
      ``,
      `  Das wird der Deploy ablehnen. Zwei uebliche Ursachen:`,
      `    1. Ein neuer Import zieht ein grosses Paket in eine Server-Route.`,
      `    2. Ein Zugriff auf das Dateisystem laesst den Tracer den Repo-Root`,
      `       mitnehmen — siehe lib/product-media.ts, warum das dort nicht mehr passiert.`,
      ``,
      `  Notausgang: den Pfad in outputFileTracingExcludes (next.config.ts) aufnehmen.`,
      ``,
    ].join("\n")
  )
  process.exit(1)
}

console.log(
  `\nOK — groesste Function ${mb(largest.bytes).trim()}, ` +
    `${mb(LIMIT_BYTES - largest.bytes).trim()} Luft bis zur Grenze.\n`
)
