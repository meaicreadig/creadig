#!/usr/bin/env node
/**
 * G14 — die MASSE der Markenzeichen, einmal zur Bauzeit aus den echten
 * Dateien gelesen.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DAS GIBT
 * Die Logos standen bis hierher alle auf DIESELBE HOEHE gestellt:
 * `h-10 w-auto max-w-[11rem]`. Das sieht nach Ordnung aus und ist keine.
 *
 *   1 · VERHAELTNIS. `max-w` gegen ein festes `h-*` ist bei einem <img>
 *       kein Zuschnitt, sondern eine QUETSCHUNG: `object-fit` steht ohne
 *       Angabe auf `fill`, die Hoehe bleibt stehen, die Breite wird
 *       gekappt — und die Wortmarke wird schmal. Gemessen an der echten
 *       Datei traf das CASSAMEA (8,38 : 1) mit -46 % und MAQAM (5,85 : 1)
 *       mit -23 %. Ein Logo, das man verzerrt zeigt, zeigt man nicht.
 *
 *   2 · GROESSE. Gleiche Hoehe heisst nicht gleiche Wirkung. Auf gleicher
 *       Hoehe belegt eine breite Wortmarke ein Vielfaches der Flaeche eines
 *       quadratischen Zeichens — gemessen auf der Logowand: meahv 960 px²
 *       gegen CASSAMEA 4.608 px², Faktor 4,8. Das ist der Unterschied
 *       zwischen rechnerischer und OPTISCHER Groesse, den die Sichtschuld
 *       benennt.
 *
 * Beides laesst sich nur entscheiden, wenn das Seitenverhaeltnis der echten
 * Datei zur Renderzeit BEKANNT ist. Genau das steht hier drin.
 *
 * ---------------------------------------------------------------------------
 * WARUM ZUR BAUZEIT UND NICHT IM BROWSER
 * Der Browser kennt die Masse erst, wenn das Bild geladen ist — bis dahin
 * springt das Layout. Und derselbe Grund wie bei den Geschwistern
 * (`generate-client-logos.mjs`, TECH-2): ein `fs`-Zugriff zur Renderzeit
 * zieht den halben Repo-Root in die Serverless-Function.
 *
 * ---------------------------------------------------------------------------
 * WAS ES NICHT MISST
 * Farbe und Helligkeit. Ob ein Logo auf dunklem Grund als Silhouette
 * gezeigt werden muss oder in seiner echten Farbe stehen bleibt, ist eine
 * MARKENentscheidung, keine Ableitung aus einem Mittelwert — sie steht in
 * `lib/site-data.ts` (`dunkel`) und wird von `auftritt-drill.mjs` am
 * gerenderten Bild gegen WCAG 1.4.11 nachgemessen. Ein Generator, der
 * Markenfarbe raet, waere die naechste stille Verzerrung.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT_FILE = path.join(ROOT, "lib", "logo-masse.generated.ts")

/** Die Ordner, aus denen Markenzeichen kommen. */
const ORDNER = [
  ["public", "brand"],
  ["public", "brand", "products"],
  ["public", "brand", "clients"],
]

const BILD = new Set([".svg", ".png", ".webp", ".avif", ".jpg", ".jpeg"])

/* ==========================================================================
 * DIE LESER — je Format einer, alle ohne Abhaengigkeit.
 *
 * Eine Bibliothek fuer sieben Zahlen waere ein Paket mehr im Lockfile und
 * eine Stelle mehr, an der ein Build bricht. Die Kopfdaten dieser Formate
 * stehen seit Jahrzehnten fest; was sich nicht aendert, darf man lesen.
 * ========================================================================== */

/** SVG: viewBox fuehrt, weil sie das Verhaeltnis traegt — width/height sind Vorschlaege. */
function svgMasse(buf) {
  const text = buf.toString("utf8", 0, Math.min(buf.length, 8192))
  const box = text.match(/viewBox\s*=\s*["']\s*([-\d.eE]+)[,\s]+([-\d.eE]+)[,\s]+([-\d.eE]+)[,\s]+([-\d.eE]+)\s*["']/)
  if (box) {
    const w = Number(box[3])
    const h = Number(box[4])
    if (w > 0 && h > 0) return { w, h }
  }
  const w = text.match(/\bwidth\s*=\s*["']\s*([\d.]+)/)
  const h = text.match(/\bheight\s*=\s*["']\s*([\d.]+)/)
  if (w && h && Number(w[1]) > 0 && Number(h[1]) > 0) return { w: Number(w[1]), h: Number(h[1]) }
  return null
}

/** PNG: IHDR steht immer an derselben Stelle. */
function pngMasse(buf) {
  if (buf.length < 24) return null
  if (buf.readUInt32BE(0) !== 0x89504e47) return null
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

/** JPEG: bis zum ersten SOF-Marker vorruecken. */
function jpegMasse(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++
      continue
    }
    const marker = buf[i + 1]
    /* SOF0..SOF15, ohne DHT (c4), DAC (c8) und RSTn (d0-d7). */
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) }
    }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

/** WebP: drei Unterformate, drei Kopfarten. */
function webpMasse(buf) {
  if (buf.length < 30 || buf.toString("ascii", 8, 12) !== "WEBP") return null
  const art = buf.toString("ascii", 12, 16)
  if (art === "VP8X") return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 }
  if (art === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff }
  if (art === "VP8L") {
    const bits = buf.readUInt32LE(21)
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }
  }
  return null
}

/** AVIF: ispe-Kasten im Meta-Baum. Grob gesucht, aber eindeutig. */
function avifMasse(buf) {
  const i = buf.indexOf("ispe", 0, "ascii")
  if (i < 0 || i + 16 > buf.length) return null
  return { w: buf.readUInt32BE(i + 8), h: buf.readUInt32BE(i + 12) }
}

function masse(datei) {
  const buf = readFileSync(datei)
  switch (path.extname(datei).toLowerCase()) {
    case ".svg":
      return svgMasse(buf)
    case ".png":
      return pngMasse(buf)
    case ".jpg":
    case ".jpeg":
      return jpegMasse(buf)
    case ".webp":
      return webpMasse(buf)
    case ".avif":
      return avifMasse(buf)
    default:
      return null
  }
}

/* ========================================================================== */

function scan() {
  const treffer = []
  for (const teile of ORDNER) {
    const base = path.join(ROOT, ...teile)
    if (!existsSync(base)) continue
    for (const file of readdirSync(base).sort()) {
      const full = path.join(base, file)
      if (!statSync(full).isFile()) continue
      if (!BILD.has(path.extname(file).toLowerCase())) continue
      const pfad = "/" + [...teile.slice(1), file].join("/")
      treffer.push({ pfad, masse: masse(full) })
    }
  }
  return treffer
}

function render(treffer) {
  const bekannt = treffer.filter((t) => t.masse)
  const zeilen = bekannt
    .map((t) => {
      const { w, h } = t.masse
      const v = w / h
      return `  ${JSON.stringify(t.pfad)}: { breite: ${w}, hoehe: ${h}, verhaeltnis: ${v.toFixed(4)} },`
    })
    .join("\n")

  const unbekannt = treffer.filter((t) => !t.masse).map((t) => t.pfad)
  const fehlt = unbekannt.length
    ? `\n/**\n * OHNE MASS — die Datei gibt ihre Groesse nicht preis.\n * Ein Logo ohne bekanntes Verhaeltnis darf nicht erscheinen; das\n * Auftritt-Gate bricht darauf ab, statt es stillschweigend zu verzerren.\n */\nexport const OHNE_MASS: readonly string[] = [\n${unbekannt.map((p) => `  ${JSON.stringify(p)},`).join("\n")}\n]\n`
    : `\n/** Kein Markenzeichen ohne bekanntes Mass. */\nexport const OHNE_MASS: readonly string[] = []\n`

  return `/*
 * GENERIERT — nicht von Hand aendern.
 *
 * Quelle:      public/brand/**.{svg,png,webp,avif,jpg}
 * Erzeugt von: scripts/generate-logo-masse.mjs (npm-Hook \`prebuild\`)
 * Geprueft in: scripts/check-auftritt.mjs (postbuild) gegen dieselben Dateien
 *
 * Warum es das gibt, steht im Kopf des Skripts. Kurz: Ohne das echte
 * Seitenverhaeltnis kann eine Oberflaeche ein Logo nur auf gleiche HOEHE
 * stellen — und das verzerrt die breiten und verkleinert die hohen.
 */

export type LogoMass = {
  /** Breite der Quelldatei in ihren eigenen Einheiten (px bzw. viewBox). */
  breite: number
  /** Hoehe der Quelldatei. */
  hoehe: number
  /** breite / hoehe — die einzige Zahl, die beim Rendern zaehlt. */
  verhaeltnis: number
}

/** Oeffentlicher Pfad → Mass der echten Datei. */
export const LOGO_MASSE: Readonly<Record<string, LogoMass>> = {
${zeilen}
}
${fehlt}`
}

const treffer = scan()
const next = render(treffer)
const previous = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : null
if (previous !== next) writeFileSync(OUT_FILE, next, "utf8")

const ohne = treffer.filter((t) => !t.masse).length
console.log(
  `logo-masse: ${treffer.length - ohne} von ${treffer.length} Markenzeichen vermessen` +
    (ohne ? ` — ${ohne} ohne Mass` : ""),
)
