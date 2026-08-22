#!/usr/bin/env node
/**
 * Produkt-Aufnahmen einmal zur Bauzeit einlesen — statt bei jedem Request.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESES SKRIPT EXISTIERT (TECH-2)
 * `lib/product-media.ts` hat frueher `readdirSync(process.cwd(), …)` gerufen —
 * zur Render-Zeit, aus einer Server-Komponente heraus. Zwei Folgen:
 *
 *   1. Der Datei-Tracer von Next sieht einen `fs`-Zugriff auf `process.cwd()`
 *      und muss annehmen, dass die Function irgendetwas unterhalb des
 *      Repo-Roots braucht. Er packt im Zweifel zu viel mit ein. Das war die
 *      eigentliche Ursache der zu grossen Function; die Exclude-Liste in
 *      `next.config.ts` (TECH-1) behandelt nur das Symptom.
 *   2. `process.cwd()` ist im Serverless-Bundle nicht das Repo. Was lokal
 *      funktioniert, findet in der Cloud schlicht nichts.
 *
 * Die Regel selbst bleibt unangetastet: Es entscheidet weiterhin das
 * Dateisystem, ob eine Interface-Sektion rendert — nur eben einmal hier,
 * nicht tausendmal im Betrieb.
 *
 * ---------------------------------------------------------------------------
 * FUER DEN OWNER aendert sich nichts
 * Screenshots nach `public/works/products/<slug>/` legen, `npm run build`
 * laufen lassen. `prebuild` ruft dieses Skript automatisch auf.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/** Dieselbe Quelle wie zuvor — nur wird sie jetzt genau einmal gelesen. */
const MEDIA_ROOT = ["public", "works", "products"]

/** Was ein Browser sicher darstellt — alles andere wird ignoriert. */
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"])

const OUT_FILE = path.join(ROOT, "lib", "product-media.generated.ts")

/** Alle Produkt-Slugs mit echtem Material, alphabetisch. */
function scan() {
  const base = path.join(ROOT, ...MEDIA_ROOT)
  if (!existsSync(base)) return {}

  const map = {}
  for (const entry of readdirSync(base).sort()) {
    const dir = path.join(base, entry)
    if (!statSync(dir).isDirectory()) continue

    const files = readdirSync(dir)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort()

    // Ein leeres Verzeichnis ist kein Eintrag: Die Sektion soll sich
    // verstecken, nicht eine leere Galerie rendern.
    if (files.length === 0) continue

    map[entry] = files.map((file) => `/${MEDIA_ROOT.slice(1).join("/")}/${entry}/${file}`)
  }
  return map
}

function render(map) {
  const slugs = Object.keys(map)
  const body = slugs.length
    ? slugs
        .map(
          (slug) =>
            `  ${JSON.stringify(slug)}: [\n${map[slug]
              .map((src) => `    ${JSON.stringify(src)},`)
              .join("\n")}\n  ],`
        )
        .join("\n")
    : ""

  return `/*
 * GENERIERT — nicht von Hand aendern.
 *
 * Quelle: public/works/products/<slug>/
 * Erzeugt von: scripts/generate-product-media.mjs (npm-Hook \`prebuild\`)
 *
 * Neue Screenshots ablegen und \`npm run build\` laufen lassen; diese Datei
 * schreibt sich dann selbst neu. Sie wird mitversioniert, damit ein Build
 * auch ohne vorherigen Skript-Lauf ein definiertes Ergebnis hat.
 */

/** Oeffentliche Pfade der echten Aufnahmen je Produkt, alphabetisch. */
export const PRODUCT_SCREENS: Readonly<Record<string, readonly string[]>> = {
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

const total = Object.values(map).reduce((sum, list) => sum + list.length, 0)
const slugs = Object.keys(map)
console.log(
  slugs.length
    ? `product-media: ${total} Aufnahme(n) in ${slugs.length} Produkt(en) — ${slugs.join(", ")}`
    : "product-media: keine echten Aufnahmen gefunden — Interface-Sektionen bleiben verborgen"
)
