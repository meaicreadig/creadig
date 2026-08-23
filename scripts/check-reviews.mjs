#!/usr/bin/env node
/**
 * BF-6 — das Sterne-Gate.
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * `lib/site-data.ts` liefert `aggregateRating` nur, wenn es bewertete
 * Bewertungen gibt — sonst `null`, und dann haengt sich der Block nicht an die
 * Organisations-Daten. Das ist heute richtig. Die Frage ist, ob es das in
 * einem halben Jahr noch ist: Ein Default wie „5,0 (0 Bewertungen)", ein
 * schnell eingetragener Beispielwert, ein `?? { value: 5, count: 12 }` beim
 * Ausprobieren — und niemand sieht es, weil JSON-LD unsichtbar ist.
 *
 * Erfundene Sterne sind nicht bloss unehrlich. Google wertet sie als
 * Richtlinienverstoss und bestraft die ganze Domain dafuer — ausgerechnet die
 * Domain, ueber die alle Angebote laufen.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 * Das GEBAUTE HTML, nicht die Quelle. Nur so ist es egal, ueber welchen Weg
 * jemand die Sterne hineinbekommt.
 *
 *   1. Ein `AggregateRating` ohne ein einziges `Review` im selben Dokument
 *      ist ein erfundener Durchschnitt.
 *   2. Ein `AggregateRating` mit `reviewCount` 0 oder ohne Zahl ebenso.
 *
 * Beides bricht den Build. Sobald es echte Bewertungen gibt, laeuft das Gate
 * unveraendert weiter — es verbietet keine Sterne, es verlangt Deckung.
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, ".next", "server", "app")

function htmlFiles(dir) {
  const found = []
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...htmlFiles(full))
    else if (entry.name.endsWith(".html")) found.push(full)
  }
  return found
}

const files = htmlFiles(APP_DIR)
if (files.length === 0) {
  console.error("Sterne-Gate: kein gebautes HTML gefunden — lief `next build`?")
  process.exit(1)
}

const problems = []
let withRating = 0

for (const file of files) {
  const html = readFileSync(file, "utf8")
  if (!html.includes("AggregateRating")) continue
  withRating++

  const name = path.relative(ROOT, file)
  const hasReview = /"@type"\s*:\s*"Review"/.test(html)
  const count = html.match(/"reviewCount"\s*:\s*(\d+)/)

  if (!hasReview) {
    problems.push(`${name}: AggregateRating ohne ein einziges Review im Dokument`)
  }
  if (!count) {
    problems.push(`${name}: AggregateRating ohne reviewCount`)
  } else if (Number(count[1]) < 1) {
    problems.push(`${name}: AggregateRating mit reviewCount ${count[1]}`)
  }
}

console.log(`\nSterne-Gate — ${files.length} Dokument(e), ${withRating} mit AggregateRating`)

if (problems.length > 0) {
  console.error("\nOhne Deckung — der Build bricht ab:")
  for (const problem of problems) console.error(`  ${problem}`)
  console.error(
    "\nEntweder es gibt echte, freigegebene Bewertungen (lib/site-data.ts `reviews`),\n" +
      "oder es steht kein AggregateRating in den strukturierten Daten. Ein Mittelwert\n" +
      "ohne Bewertungen ist eine erfundene Auszeichnung — Google straft die Domain\n" +
      "dafuer ab.",
  )
  process.exit(1)
}

console.log(
  withRating === 0
    ? "OK — keine Sterne behauptet, solange es keine gibt.\n"
    : "OK — jeder Durchschnitt ist durch Bewertungen im selben Dokument gedeckt.\n",
)
