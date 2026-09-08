#!/usr/bin/env node
/**
 * G14 · AUFTRITT-GATE — die Haelfte, die ohne Browser entscheidbar ist.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE ARBEITSTEILUNG
 *
 * Der Auftritt hat zwei Sorten Wahrheit, und sie brauchen zwei Werkzeuge:
 *
 *   HIER   — was in Dateien steht: Wem gehoert eine Zeile der Sichtschuld?
 *            Wie gross ist die Logodatei WIRKLICH? Geht jedes Markenzeichen
 *            durch die eine Komponente, die die Regeln kennt?
 *
 *   DRILL  — was erst der Browser weiss: Welchen Radius hat der Knopf
 *            tatsaechlich? Ueberlappt bei 320 px etwas? Wie schnell laeuft
 *            der Streifen? (`npm run auftritt-drill`)
 *
 * Ein Gate, das die zweite Sorte aus dem Quelltext erraten wollte, wuerde
 * Klassennamen lesen und Wirkung behaupten. Es laeuft deshalb im postbuild
 * nur mit dem, was hier sicher entscheidbar ist — und sagt am Ende selbst,
 * dass die andere Haelfte woanders gemessen wird.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE MASSE NOCH EINMAL GELESEN WERDEN
 *
 * `lib/logo-masse.generated.ts` entsteht im prebuild. Eine generierte Datei,
 * die mitversioniert wird, kann veralten — jemand tauscht ein Logo und
 * committet die Datei nicht mit. Dann steht dort ein Verhaeltnis, das die
 * Datei nicht mehr hat, und die Oberflaeche rechnet eine Hoehe aus, die das
 * Bild verzerrt. Genau der Fehler, gegen den das Gate gebaut ist.
 *
 * Also wird gegen die ECHTEN Dateien geprueft, nicht gegen die Ableitung.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  MASSE_SPREIZUNG,
  OHNE_MASS,
  LOGO_MASSE,
  SICHTSCHULD,
  flaeche,
  herrenlos,
  ohneMessort,
  optischeHoehe,
  spreizung,
} from "../lib/auftritt.ts"
import { clientLogos, ownProducts } from "../lib/site-data.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const fehler = []
const hinweise = []

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · JEDE ZEILE DER SICHTSCHULD HAT EINEN EIGENTUEMER UND EIN MASS
 * ═══════════════════════════════════════════════════════════════════════════ */

for (const s of herrenlos()) {
  fehler.push(`Sichtschuld „${s.satz}" hat keinen Eigentuemer oder kein Mass.`)
}
for (const s of ohneMessort()) {
  fehler.push(
    `Sichtschuld „${s.satz}" gehoert dem System, nennt aber keinen Messort. ` +
      `Eine Systemzeile ohne Messung ist eine Zusage ohne Beleg.`,
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE MASSE STIMMEN MIT DEN ECHTEN DATEIEN UEBEREIN
 * ═══════════════════════════════════════════════════════════════════════════ */

/* Dieselben Leser wie im Generator — bewusst NICHT importiert: Ein Gate,
   das die Funktion des Erzeugers benutzt, prueft dessen Ergebnis mit dessen
   eigenem Werkzeug. Faellt der Leser falsch, faellt beides gleich falsch. */
function massAusDatei(datei) {
  const buf = readFileSync(datei)
  const ext = path.extname(datei).toLowerCase()
  if (ext === ".svg") {
    const text = buf.toString("utf8", 0, Math.min(buf.length, 8192))
    const box = text.match(/viewBox\s*=\s*["']\s*([-\d.eE]+)[,\s]+([-\d.eE]+)[,\s]+([-\d.eE]+)[,\s]+([-\d.eE]+)\s*["']/)
    if (box) return { breite: Number(box[3]), hoehe: Number(box[4]) }
    const w = text.match(/\bwidth\s*=\s*["']\s*([\d.]+)/)
    const h = text.match(/\bheight\s*=\s*["']\s*([\d.]+)/)
    if (w && h) return { breite: Number(w[1]), hoehe: Number(h[1]) }
    return null
  }
  if (ext === ".png") {
    if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null
    return { breite: buf.readUInt32BE(16), hoehe: buf.readUInt32BE(20) }
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    let i = 2
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue }
      const m = buf[i + 1]
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { breite: buf.readUInt16BE(i + 7), hoehe: buf.readUInt16BE(i + 5) }
      }
      i += 2 + buf.readUInt16BE(i + 2)
    }
    return null
  }
  return null
}

const BILD = new Set([".svg", ".png", ".webp", ".avif", ".jpg", ".jpeg"])
const marken = []
for (const teile of [["public", "brand"], ["public", "brand", "products"], ["public", "brand", "clients"]]) {
  const base = path.join(ROOT, ...teile)
  if (!existsSync(base)) continue
  for (const file of readdirSync(base).sort()) {
    const full = path.join(base, file)
    if (!statSync(full).isFile()) continue
    if (!BILD.has(path.extname(file).toLowerCase())) continue
    marken.push({ pfad: "/" + [...teile.slice(1), file].join("/"), datei: full })
  }
}

for (const m of marken) {
  const eintrag = LOGO_MASSE[m.pfad]
  const echt = massAusDatei(m.datei)
  if (!eintrag) {
    if (!OHNE_MASS.includes(m.pfad)) {
      fehler.push(
        `${m.pfad} liegt unter public/brand, steht aber nicht in LOGO_MASSE. ` +
          `Die generierte Datei ist veraltet — \`npm run build\` erzeugt sie neu.`,
      )
    }
    continue
  }
  if (!echt) continue /* Format, das dieses Gate nicht liest — der Generator kann mehr. */
  const abweichung = Math.abs(eintrag.breite / eintrag.hoehe - echt.breite / echt.hoehe)
  if (abweichung > 0.001) {
    fehler.push(
      `${m.pfad}: LOGO_MASSE sagt ${eintrag.breite}×${eintrag.hoehe} ` +
        `(${(eintrag.breite / eintrag.hoehe).toFixed(3)} : 1), die Datei ist ` +
        `${echt.breite}×${echt.hoehe} (${(echt.breite / echt.hoehe).toFixed(3)} : 1). ` +
        `Die Oberflaeche rechnet mit dem falschen Wert und verzerrt das Zeichen.`,
    )
  }
}

if (OHNE_MASS.length > 0) {
  fehler.push(
    `Ohne bekanntes Mass: ${OHNE_MASS.join(", ")}. ` +
      `Ein Markenzeichen ohne Verhaeltnis kann nur auf gleiche Hoehe gestellt ` +
      `werden — und genau das verzerrt die breiten.`,
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · JEDES ZEICHEN, DAS ERSCHEINEN KANN, IST VERMESSEN
 * ═══════════════════════════════════════════════════════════════════════════ */

const sichtbar = [
  ...ownProducts.map((p) => ({ name: p.name, pfad: p.logoPath, reihe: "eigene Produkte" })),
  ...clientLogos.map((c) => ({ name: c.name, pfad: c.logoPath, reihe: "Kundenmarken" })),
].filter((z) => z.pfad)

for (const z of sichtbar) {
  if (!LOGO_MASSE[z.pfad]) {
    fehler.push(`${z.name} zeigt ${z.pfad}, aber dafuer ist kein Mass hinterlegt.`)
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · OPTISCHE GROESSE — die Reihe traegt gleiche Flaechen
 * ═══════════════════════════════════════════════════════════════════════════ */

/* Die Basen der beiden Oberflaechen, so wie sie dort gesetzt sind. */
const REIHEN = [
  { name: "Logowand (/unternehmen)", basis: 46 },
  { name: "Logostreifen (Start, Telefon)", basis: 52 },
  { name: "Logostreifen (Start, Schirm)", basis: 60 },
]

const reihenBefund = []
for (const reihe of REIHEN) {
  const flaechen = sichtbar
    .map((z) => LOGO_MASSE[z.pfad])
    .filter(Boolean)
    .map((m) => flaeche(m.verhaeltnis, optischeHoehe(m.verhaeltnis, reihe.basis)))
  if (flaechen.length < 2) continue
  const f = spreizung(flaechen)
  reihenBefund.push({ ...reihe, spreizung: f, zeichen: flaechen.length })
  if (f > MASSE_SPREIZUNG) {
    fehler.push(
      `${reihe.name}: die Flaechen der Markenzeichen stehen ${f.toFixed(2)} : 1 ` +
        `auseinander (erlaubt ${MASSE_SPREIZUNG.toFixed(2)} : 1). ` +
        `Gleiche Hoehe ist rechnerisch, nicht optisch.`,
    )
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · DER ACHTE WEG — kein Markenzeichen an der Komponente vorbei
 *
 * Dieselbe Lehre wie in Gate 13: Eine Regel, die an einer Stelle steht und
 * an mehreren wirken muss, wirkt an keiner. Wer ein `<img src="/brand/…">`
 * von Hand setzt, umgeht Verhaeltnis, optische Groesse und Dunkelbehandlung
 * auf einmal — und niemand merkt es, weil das Bild ja erscheint.
 * ═══════════════════════════════════════════════════════════════════════════ */

const ERLAUBT_ROH = new Set([
  /* Die Komponente selbst — sie IST die Regel. */
  "components/brand/marken-zeichen.tsx",
  /* Die eigene Wortmarke: eine feste Hoehe, ein Zeichen, kein Vergleich in
     einer Reihe. Sie hat ihre eigene Komponente (`components/brand/logo.tsx`). */
  "components/brand/logo.tsx",
])

function tsxDateien(dir, treffer = []) {
  for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
    if (eintrag.name === "node_modules" || eintrag.name.startsWith(".")) continue
    const full = path.join(dir, eintrag.name)
    if (eintrag.isDirectory()) tsxDateien(full, treffer)
    else if (eintrag.name.endsWith(".tsx")) treffer.push(full)
  }
  return treffer
}

for (const datei of [...tsxDateien(path.join(ROOT, "components")), ...tsxDateien(path.join(ROOT, "app"))]) {
  const rel = path.relative(ROOT, datei)
  if (ERLAUBT_ROH.has(rel)) continue
  const text = readFileSync(datei, "utf8")
  /* Gesucht ist die Wirkung, nicht das Wort: ein <img>, dessen Quelle unter
     public/brand liegt — ob als Zeichenkette oder ueber `logoPath`. */
  const rohesBild = /<img[^>]*\bsrc=\{?["']?[^>]*\/brand\//s.test(text)
  const ueberLogoPfad = /<img[^>]*\bsrc=\{\s*logoPath\s*\}/s.test(text)
  if (rohesBild || ueberLogoPfad) {
    fehler.push(
      `${rel} rendert ein Markenzeichen mit eigenem <img>. ` +
        `Damit gelten Verhaeltnis, optische Groesse und Dunkelbehandlung dort nicht. ` +
        `\`MarkenZeichen\` aus components/brand/marken-zeichen.tsx benutzen.`,
    )
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * AUSGABE
 * ═══════════════════════════════════════════════════════════════════════════ */

const eigene = SICHTSCHULD.filter((s) => s.eigentuemer === "system").length
const beimOwner = SICHTSCHULD.filter((s) => s.eigentuemer === "owner")

console.log(
  `\nAuftritt-Gate — ${SICHTSCHULD.length} Zeile(n) Sichtschuld, ` +
    `${marken.length} Markenzeichen vermessen, ${sichtbar.length} davon sichtbar`,
)

for (const r of reihenBefund) {
  console.log(
    `  ${r.name.padEnd(32)} ${r.zeichen} Zeichen · Flaechen ${r.spreizung.toFixed(2)} : 1`,
  )
}

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  `OK — ${eigene} Zeile(n) gehoeren dem System und haben einen Messort, ` +
    `${beimOwner.length} dem Owner.`,
)
if (beimOwner.length > 0) {
  console.log(`Beim Owner: ${beimOwner.map((s) => s.satz).join(", ")} — zugeordnet, nicht erledigt.`)
}
console.log(
  "Radius, Kollision, Bewegung und Rhythmus entscheidet der Browser: `npm run auftritt-drill`.",
)
for (const h of hinweise) console.log(`  ${h}`)
