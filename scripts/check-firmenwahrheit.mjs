#!/usr/bin/env node
/**
 * FIRMENWAHRHEIT-GATE — kein Prompt beschreibt creaDIG an der Quelle vorbei.
 *
 * Bis 22.10.2026 stand die Firma in fünfzehn Prompts, jedes Mal anders:
 * Golfstaaten als Markt, Türkei als Markt, kein BFSG, keine Umsatzsteuer.
 * Seitdem lesen alle Agenten `firmenText()` aus lib/firmenwahrheit.ts. Dieses
 * Gate hält das so: Wer wieder „creaDIG Solutions (Einzelunternehmen …“ in
 * einen Prompt schreibt oder Märkte von Hand aufzählt, bricht den Build.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const ERLAUBT = new Set(["lib/firmenwahrheit.ts"])
const MUSTER = [
  { re: /creaDIG(?: Solutions)? \((?:Einzelunternehmen|System-Haus|Inhaber|Germany)/, warum: "Firmenbeschreibung von Hand — firmenText() benutzen" },
  { re: /Märkte:?\s[^`\n]{0,80}(Golf|Türkei)/, warum: "Märkte von Hand — MAERKTE aus der Firmenwahrheit benutzen" },
  { re: /Expansion in die Golfstaaten/, warum: "widerspricht MAERKTE.nicht" },
]

const treffer = []
function lauf(pfad) {
  for (const name of readdirSync(pfad)) {
    const voll = join(pfad, name)
    if (statSync(voll).isDirectory()) lauf(voll)
    else if (/\.tsx?$/.test(name) && !ERLAUBT.has(voll)) {
      readFileSync(voll, "utf8")
        .split("\n")
        .forEach((zeile, i) => {
          if (/^\s*(\*|\/\/)/.test(zeile)) return
          /* Ressort-Name des Bulletins (Nachrichtenthema), keine Aussage über Zielmärkte. */
          if (zeile.includes('id: "maerkte"')) return
          for (const m of MUSTER) if (m.re.test(zeile)) treffer.push(`${voll}:${i + 1} — ${m.warum}`)
        })
    }
  }
}
lauf("lib")
lauf("app")

if (treffer.length) {
  console.error(`✗ check-firmenwahrheit: ${treffer.length} Stelle(n) beschreiben die Firma an der Quelle vorbei:\n  ${treffer.join("\n  ")}`)
  process.exit(1)
}
console.log("✓ check-firmenwahrheit: alle Agenten lesen die Firma aus lib/firmenwahrheit.ts")
