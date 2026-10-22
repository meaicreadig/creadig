#!/usr/bin/env node
/**
 * ZEICHEN-GATE — kein Ersatzzeichen (U+FFFD) im Quelltext.
 *
 * Am 22.10.2026 standen 52 davon in app/ und lib/: „K��nye" als Titel des
 * türkischen Impressums, halbe arabische Wörter auf /ar/leistungen. Ein
 * Werkzeug hatte beim Speichern Mehrbyte-Buchstaben zerschnitten, und kein
 * Build hat es bemerkt — erst ein Blick auf die Live-Seite. Ab jetzt bricht
 * der Build, bevor so etwas ausgeliefert wird.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const ORDNER = ["app", "lib", "components"]
const treffer = []

function lauf(pfad) {
  for (const name of readdirSync(pfad)) {
    const voll = join(pfad, name)
    if (statSync(voll).isDirectory()) lauf(voll)
    else if (/\.(tsx?|mjs|json|md)$/.test(name)) {
      readFileSync(voll, "utf8")
        .split("\n")
        .forEach((zeile, i) => zeile.includes("�") && treffer.push(`${voll}:${i + 1}`))
    }
  }
}
ORDNER.forEach(lauf)

if (treffer.length) {
  console.error(`✗ check-zeichen: ${treffer.length} Ersatzzeichen (U+FFFD) — Buchstaben gingen verloren:\n  ${treffer.slice(0, 20).join("\n  ")}`)
  process.exit(1)
}
console.log("✓ check-zeichen: kein Ersatzzeichen im Quelltext")
