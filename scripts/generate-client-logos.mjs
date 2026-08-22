#!/usr/bin/env node
/**
 * Kundenlogos einmal zur Bauzeit einlesen — nicht bei jedem Request.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESES SKRIPT EXISTIERT
 * Dieselbe Begruendung wie bei `generate-product-media.mjs` (TECH-2): Ein
 * `fs`-Zugriff zur Render-Zeit laesst den Datei-Tracer von Next im Zweifel
 * den halben Repo-Root in die Serverless-Function packen, und
 * `process.cwd()` zeigt dort ohnehin nicht auf das Repo.
 *
 * ---------------------------------------------------------------------------
 * FUER DEN OWNER
 * Logo nach `public/brand/clients/<slug>.svg` (oder .png/.webp/.avif/.jpg)
 * legen — der Dateiname ist der Slug aus `clientWorks`, also `nvswiss.svg`
 * bzw. `maqam.svg`. Naechster `npm run build`, fertig: Die Kachel tauscht das
 * Monogramm gegen das echte Logo. Kein Code-Eingriff.
 *
 * Solange nichts dort liegt, bleibt es beim Monogramm — nie ein kaputtes
 * <img>, nie ein fremdes Logo ohne Freigabe.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const LOGO_ROOT = ["public", "brand", "clients"]
const IMAGE_EXTENSIONS = new Set([".svg", ".png", ".webp", ".avif", ".jpg", ".jpeg"])

/**
 * Der Dateiname ist der Slug — aber Slugs tragen Bindestriche
 * (`nv-swiss`), Markendateien meistens nicht (`nvswiss.svg`). Beide Formen
 * werden akzeptiert, damit der Owner nicht raten muss.
 */
const ALIASES = { nvswiss: "nv-swiss" }

const OUT_FILE = path.join(ROOT, "lib", "client-logos.generated.ts")

function scan() {
  const base = path.join(ROOT, ...LOGO_ROOT)
  if (!existsSync(base)) return {}

  const map = {}
  for (const file of readdirSync(base).sort()) {
    const full = path.join(base, file)
    if (!statSync(full).isFile()) continue

    const ext = path.extname(file).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext)) continue

    const stem = path.basename(file, ext)
    const slug = ALIASES[stem] ?? stem
    // Erste passende Datei gewinnt (alphabetisch, also .avif vor .svg) —
    // ein Slug kann nicht zwei Logos haben.
    if (map[slug]) continue
    map[slug] = `/${LOGO_ROOT.slice(1).join("/")}/${file}`
  }
  return map
}

function render(map) {
  const slugs = Object.keys(map).sort()
  const body = slugs.map((slug) => `  ${JSON.stringify(slug)}: ${JSON.stringify(map[slug])},`).join("\n")

  return `/*
 * GENERIERT — nicht von Hand aendern.
 *
 * Quelle: public/brand/clients/<slug>.<svg|png|webp|avif|jpg>
 * Erzeugt von: scripts/generate-client-logos.mjs (npm-Hook \`prebuild\`)
 *
 * Logo ablegen, \`npm run build\` laufen lassen — diese Datei schreibt sich
 * dann selbst neu. Sie wird mitversioniert, damit ein Build auch ohne
 * vorherigen Skript-Lauf ein definiertes Ergebnis hat.
 */

/** Oeffentlicher Pfad des echten Logos je Kunden-Slug. */
export const CLIENT_LOGOS: Readonly<Record<string, string>> = {
${body}
}
`
}

const map = scan()
const next = render(map)
const previous = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : null

if (previous !== next) {
  mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, next, "utf8")
}

const slugs = Object.keys(map)
console.log(
  slugs.length
    ? `client-logos: ${slugs.length} Logo(s) gefunden — ${slugs.join(", ")}`
    : "client-logos: keine Logos gefunden — die Kacheln tragen Monogramme"
)
