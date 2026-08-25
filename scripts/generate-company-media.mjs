#!/usr/bin/env node
/**
 * Echte Fotos aus dem Haus — einmal zur Bauzeit eingelesen (V2-5 · §10.6).
 *
 * ---------------------------------------------------------------------------
 * WOFUER
 * Die Tiefen-Analyse nennt „Menschen" als eine der fuenf fehlenden
 * Beweisarten und verlangt echte Fotos statt Stock: Buero, ICO, Bildschirme,
 * Whiteboard. Stock ist gesperrt, und ein Platzhalter-Bild ist es auch —
 * also entscheidet, wie ueberall in diesem Repo, das Dateisystem: Liegt ein
 * Foto da, erscheint es. Liegt keins da, erscheint die Sektion nicht.
 *
 * ---------------------------------------------------------------------------
 * FUER DEN OWNER
 * Foto nach `public/images/unternehmen/<slot>.jpg` legen. Erkannte Slots:
 *
 *   buero.jpg        der Arbeitsraum, wie er aussieht
 *   ico.jpg          das ICO InnovationsCentrum von aussen oder innen
 *   arbeitsplatz.jpg Bildschirme mit echter Arbeit darauf
 *   whiteboard.jpg   eine Skizze, die wirklich entstanden ist
 *
 * Erlaubt sind .jpg, .jpeg, .png, .webp und .avif. Dateien mit einem anderen
 * Namen werden ignoriert und beim Build genannt — lieber eine Meldung als
 * ein Foto, das niemand findet.
 *
 * Kein Code-Eingriff noetig: `prebuild` ruft dieses Skript auf, und die
 * Beschriftung je Slot steht zweisprachig im Woerterbuch.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT `fs` ZUR LAUFZEIT
 * Dieselbe Begruendung wie bei `generate-product-media.mjs` (TECH-2): Ein
 * `fs`-Zugriff zur Render-Zeit laesst den Datei-Tracer von Next im Zweifel
 * den halben Repo-Root in die Serverless-Function packen, und
 * `process.cwd()` zeigt dort ohnehin nicht auf das Repo.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const MEDIA_ROOT = ["public", "images", "unternehmen"]
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"])

/** Die vier Slots, in Anzeigereihenfolge. Ein fuenfter braucht einen Text. */
const SLOTS = ["buero", "ico", "arbeitsplatz", "whiteboard"]

const OUT_FILE = path.join(ROOT, "lib", "company-media.generated.ts")

function scan() {
  const base = path.join(ROOT, ...MEDIA_ROOT)
  if (!existsSync(base)) return { found: {}, ignored: [] }

  const found = {}
  const ignored = []
  for (const file of readdirSync(base).sort()) {
    const ext = path.extname(file).toLowerCase()
    const slot = path.basename(file, ext).toLowerCase()
    // Die Anleitung im Verzeichnis und Systemdateien sind kein Fehlversuch —
    // sie jeden Build als „ignoriert" zu melden, macht die Meldung wertlos.
    if (ext === ".md" || file.startsWith(".")) continue
    if (!IMAGE_EXTENSIONS.has(ext) || !SLOTS.includes(slot)) {
      ignored.push(file)
      continue
    }
    // Der erste Treffer je Slot gewinnt — zwei Dateien fuer denselben Slot
    // waeren zwei Wahrheiten, und alphabetisch ist die Regel nachvollziehbar.
    if (!found[slot]) found[slot] = `/${MEDIA_ROOT.slice(1).join("/")}/${file}`
  }
  return { found, ignored }
}

function render(found) {
  const body = SLOTS.filter((slot) => found[slot])
    .map((slot) => `  ${JSON.stringify(slot)}: ${JSON.stringify(found[slot])},`)
    .join("\n")

  return `/*
 * GENERIERT — nicht von Hand aendern.
 *
 * Quelle: public/images/unternehmen/<slot>.<jpg|png|webp|avif>
 * Erzeugt von: scripts/generate-company-media.mjs (npm-Hook \`prebuild\`)
 *
 * Foto ablegen und \`npm run build\` laufen lassen; diese Datei schreibt sich
 * dann selbst neu. Sie wird mitversioniert, damit ein Build auch ohne
 * vorherigen Skript-Lauf ein definiertes Ergebnis hat.
 */

/** Slots in Anzeigereihenfolge — die Beschriftung steht im Woerterbuch. */
export const COMPANY_PHOTO_SLOTS = ${JSON.stringify(SLOTS)} as const

export type CompanyPhotoSlot = (typeof COMPANY_PHOTO_SLOTS)[number]

/** Oeffentliche Pfade der vorhandenen Fotos. Fehlender Slot = kein Foto. */
export const COMPANY_PHOTOS: Readonly<Partial<Record<CompanyPhotoSlot, string>>> = {
${body}
}
`
}

const { found, ignored } = scan()
const next = render(found)
const previous = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : null

if (previous !== next) {
  mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, next, "utf8")
}

const names = Object.keys(found)
console.log(
  names.length
    ? `company-media: ${names.length} Foto(s) — ${names.join(", ")}`
    : "company-media: keine echten Fotos gefunden — die Sektion bleibt verborgen",
)
if (ignored.length > 0) {
  console.log(
    `company-media: ignoriert (unbekannter Slot oder Dateityp) — ${ignored.join(", ")}. ` +
      `Erlaubt: ${SLOTS.join(", ")}`,
  )
}
