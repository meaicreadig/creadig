#!/usr/bin/env node
/**
 * DAS FREIGABE-GATE — GATE 13
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 *
 * Ein Kundenname auf der eigenen Seite ist eine Aussage ueber ein fremdes
 * Unternehmen. Sie darf dort stehen, wenn der Kunde zugestimmt hat — und
 * sonst nicht. Das ist keine Geschmacksfrage.
 *
 * Bis zum 08.09.2026 erreichte `clientWorks` die Oeffentlichkeit ueber SIEBEN
 * Wege: Logowand, Logostreifen, Werkschau, Referenzregister, Detailseiten,
 * Portfolio, Leistungs- und Produktseiten, dazu die Sitemap. Keiner davon
 * fragte nach einer Freigabe. Einer behauptete im Kommentar, er tue es.
 *
 * Die Quellsperre (`genannteClientWorks`) schliesst diese sieben. Dieses Gate
 * schliesst den achten, den es noch nicht gibt: Es liest das GEBAUTE HTML.
 * Damit ist egal, ueber welchen Weg ein Name hineinkommt — auch ueber einen,
 * den erst naechstes Jahr jemand baut.
 *
 * Dieselbe Bauart wie das Sterne-Gate: nicht die Quelle pruefen, sondern das
 * Ergebnis.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 *
 *   1. QUELLE — jede veroeffentlichte Nennung, jedes Logo, jede Fallstudie
 *      und jede Stimme ist durch eine gueltige Freigabe gedeckt.
 *   2. KENNZAHLEN — jede Zahl einer veroeffentlichten Fallstudie traegt eine
 *      Messquelle, die diesen Namen verdient.
 *   3. HTML — kein Name eines nicht freigegebenen Kunden steht im Build.
 *
 * Punkt 3 ist der eigentliche Waechter. Die ersten beiden pruefen, dass die
 * Ableitung stimmt; der dritte prueft, dass niemand an ihr vorbeigelaufen ist.
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, ".next", "server", "app")

const {
  clientWorks,
  genannteClientWorks,
  clientLogos,
  caseStudies,
  approvedCaseStudies,
  reviews,
  approvedReviews,
  namensFreigabe,
  logoFreigabe,
  fallFreigabe,
  stimmeFreigabe,
} = await import("../lib/site-data.ts")
const { messquelleTraegt } = await import("../lib/proof.ts")

const probleme = []
const hinweise = []

/* ── 1 · Quelle ─────────────────────────────────────────────────────────── */

for (const work of genannteClientWorks) {
  const d = namensFreigabe(work)
  if (!d.gedeckt) probleme.push(`„${work.name}" wird genannt, ist aber nicht gedeckt: ${d.grund}`)
}
for (const logo of clientLogos) {
  const work = clientWorks.find((w) => w.name === logo.name)
  const d = work ? logoFreigabe(work) : { gedeckt: false, grund: "keine Quelle" }
  if (!d.gedeckt) probleme.push(`Logo „${logo.name}" erscheint, ist aber nicht gedeckt: ${d.grund}`)
}
for (const study of approvedCaseStudies) {
  const d = fallFreigabe(study)
  if (!d.gedeckt) probleme.push(`Fallstudie „${study.client}" erscheint, ist aber nicht gedeckt: ${d.grund}`)
}
for (const review of approvedReviews) {
  const d = stimmeFreigabe(review)
  if (!d.gedeckt) probleme.push(`Stimme von „${review.name}" erscheint, ist aber nicht gedeckt: ${d.grund}`)
}

/* ── 2 · Kennzahlen ─────────────────────────────────────────────────────── */

for (const study of approvedCaseStudies) {
  for (const m of study.metrics) {
    const quelle = typeof m.source === "string" ? m.source : (m.source?.de ?? "")
    if (!messquelleTraegt(quelle))
      probleme.push(
        `Kennzahl „${typeof m.label === "string" ? m.label : m.label?.de}" bei „${study.client}" ` +
          `hat keine tragfaehige Messquelle: „${quelle}". Eine Zahl ohne Quelle ist eine Behauptung mit Ziffern.`,
      )
  }
}

/* ── 3 · Das gebaute HTML ───────────────────────────────────────────────── */

function htmlDateien(dir) {
  const gefunden = []
  let eintraege
  try {
    eintraege = readdirSync(dir, { withFileTypes: true })
  } catch {
    return gefunden
  }
  for (const e of eintraege) {
    const voll = path.join(dir, e.name)
    if (e.isDirectory()) gefunden.push(...htmlDateien(voll))
    else if (e.name.endsWith(".html")) gefunden.push(voll)
  }
  return gefunden
}

const dateien = htmlDateien(APP_DIR)
const ungedeckt = clientWorks.filter((w) => !namensFreigabe(w).gedeckt)

if (dateien.length === 0) {
  hinweise.push("kein gebautes HTML gefunden — die dritte Pruefung wurde uebersprungen")
} else {
  for (const work of ungedeckt) {
    /*
     * Wortgrenzen, nicht Teilzeichenketten. „maqam" steckt in „meaqam", und
     * ein Gate, das den eigenen Projektnamen fuer eine Kundennennung haelt,
     * wird nach dem zweiten Fehlalarm abgeschaltet.
     */
    const muster = new RegExp(`(^|[^\\p{L}\\p{N}])${work.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}]|$)`, "iu")
    const treffer = dateien.filter((f) => muster.test(readFileSync(f, "utf8")))
    if (treffer.length > 0) {
      const kurz = treffer.slice(0, 3).map((f) => path.relative(ROOT, f))
      probleme.push(
        `„${work.name}" steht in ${treffer.length} gebauten Seite(n), ohne dass eine Freigabe vorliegt ` +
          `(u. a. ${kurz.join(", ")}). ${namensFreigabe(work).grund}`,
      )
    }
  }
}

/* ── 4 · Weiterleitung und Freigabelage muessen dasselbe sagen ──────────── */

/*
 * `next.config.ts` laeuft vor der Anwendung und kann `lib/site-data.ts` nicht
 * sinnvoll lesen. Die Liste der ausgesetzten Adressen steht deshalb dort von
 * Hand — und damit an einer ZWEITEN Stelle.
 *
 * Genau diese Konstellation war der Befund, mit dem Gate 13 angefangen hat:
 * eine Regel an zwei Stellen, von denen nur eine gepflegt wird. Der Fall, der
 * hier sicher kommt: Eine Freigabe trifft ein, `releases` wird gefuellt, die
 * Arbeit erscheint wieder — und die Weiterleitung schiebt jeden Besucher
 * weiterhin auf die Werkschau. Die Seite waere da und unerreichbar.
 *
 * Deshalb vergleicht das Gate beide Seiten und bricht bei Abweichung.
 */
const config = readFileSync(path.join(ROOT, "next.config.ts"), "utf8")
const regel = config.match(/\/arbeiten\/:slug\(([^)]*)\)/)
const umgeleitet = new Set(regel ? regel[1].split("|").filter(Boolean) : [])
const ohneFreigabe = new Set(ungedeckt.map((w) => w.slug))

for (const slug of umgeleitet)
  if (!ohneFreigabe.has(slug))
    probleme.push(
      `„${slug}" ist freigegeben, wird in next.config.ts aber weiterhin umgeleitet. ` +
        `Die Seite existiert und ist trotzdem nicht erreichbar — Regel dort entfernen.`,
    )

for (const slug of ohneFreigabe)
  if (!umgeleitet.has(slug))
    hinweise.push(
      `„${slug}" hat keine Freigabe und keine Weiterleitung — die alte Adresse laeuft ins Leere. ` +
        `Falls sie oeffentlich war, gehoert sie in die 307-Regel in next.config.ts.`,
    )

/* ── Ausgabe ────────────────────────────────────────────────────────────── */

console.log(
  `\nFreigabe-Gate — ${clientWorks.length} Kundenarbeit(en), ${caseStudies.length} Fallstudie(n), ` +
    `${reviews.length} Stimme(n), ${dateien.length} gebaute Seite(n)`,
)

if (probleme.length > 0) {
  console.error("\nFreigabe-Gate: es erscheint etwas, das niemand freigegeben hat.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nEine Freigabe ist schriftlich, hat einen Absender, ein Datum und eine Fundstelle.\n" +
      "Sie wird in `releases: []` am jeweiligen Datensatz hinterlegt — siehe `lib/proof.ts`.\n" +
      "Fehlt sie, ist die richtige Antwort weglassen, nicht schwaecher formulieren.\n",
  )
  process.exit(1)
}

for (const h of hinweise) console.log(`Hinweis: ${h}`)

const offen = ungedeckt.map((w) => w.name)
console.log(
  `OK — ${genannteClientWorks.length} von ${clientWorks.length} Kundenarbeiten freigegeben, ` +
    `${clientLogos.length} Logo(s), ${approvedCaseStudies.length} Fallstudie(n), ${approvedReviews.length} Stimme(n).`,
)
if (offen.length > 0)
  console.log(
    `Ohne Freigabe und deshalb nirgends sichtbar: ${offen.join(", ")}. ` +
      `Das ist der Owner-Punkt aus Gate 13, keine Panne.\n`,
  )
else console.log("")
