#!/usr/bin/env node
/**
 * G23 · WIRTSCHAFTLICHKEITS-GATE
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI FRAGEN
 *
 *   1 · Wird irgendwo eine Marge GESCHAETZT? Es darf keine geben. Eine
 *       geschaetzte Marge beantwortet die G05-Frage nicht, sie uebertuencht
 *       sie — und wird nach zwei Wochen wie eine Zahl gelesen.
 *
 *   2 · Ist die Knappheit zaehlbar? `offers.md` verbietet ausdruecklich
 *       „Knappheit ohne Zustand". Der Pilotpreis haengt an einer Bedingung,
 *       und eine Bedingung, die niemand zaehlt, ist keine.
 *
 *   3 · Steht der Preis, um den es geht, noch dort, wo er stand?
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  KAPAZITAET,
  STUNDENSATZ_INTERN_CENT,
  auslastung,
  marge,
  pilotpreisLage,
  wiederkehrenderAnteil,
} from "../lib/wirtschaft.ts"
import { packages } from "../lib/site-data.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []
const offen = []

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const roh = readFileSync(path.join(ROOT, "lib", "wirtschaft.ts"), "utf8")
const quelle = ohneKommentare(roh)

/* ═══ 1 · Keine geschaetzte Marge ════════════════════════════════════════ */

/* Gesucht ist die VERWENDUNG, nicht das Wort — dieselbe Lehre wie in G17,
   G19 und G22, wo der Waechter dreimal die Prosa gefangen hat. */
if (/\b(schaetze|schaetzung|geschaetzt|ungefaehr|vorlaeufig)\s*[(:=]/i.test(quelle)) {
  fehler.push(
    "In `lib/wirtschaft.ts` wird eine Marge geschaetzt. Eine geschaetzte Marge beantwortet " +
      "die G05-Frage nicht — sie uebertuencht sie.",
  )
}
/* Und die Rueckgabe darf genau zwei Wege kennen. */
const leer = marge(240000, [], 8000)
if (leer.art !== "unbekannt") {
  fehler.push("Ohne erfassten Aufwand kommt eine Marge heraus. Sie waere geraten.")
}
if (leer.art === "unbekannt" && !leer.fehlt.some((f) => /G05/.test(f))) {
  fehler.push("Der Grund nennt die G05-Schuld nicht — dann weiss niemand, warum die Zahl fehlt.")
}
const ohneSatz = marge(240000, [{ projektId: "x", minuten: 600, wofuer: "Bau", am: "2026-09-01" }], null)
if (ohneSatz.art !== "unbekannt") {
  fehler.push("Ohne internen Stundensatz kommt eine Marge heraus.")
}

/* ═══ 2 · Die Knappheit ist zaehlbar ═════════════════════════════════════ */

const ungezaehlt = pilotpreisLage("Dachdecker", null)
if (ungezaehlt.gilt !== null) {
  fehler.push(
    "Ohne erfasste Gewerke sagt der Pilotpreis ja oder nein. Er muss `null` sagen: " +
      "Eine Bedingung, die niemand zaehlt, ist keine Bedingung.",
  )
}
/*
 * ZEILENUMBRUECHE SIND KEINE AUSSAGE.
 *
 * Der erste Lauf meldete, die Bedingung des Pilotpreises stehe nicht mehr
 * in `offers.md` — sie stand dort, nur ueber zwei Zeilen verteilt („der
 * erste Betrieb\n  in einem Gewerk"). Ein Waechter, der am Umbruch
 * scheitert, meldet eine geloeschte Regel, weil jemand den Absatz neu
 * formatiert hat.
 */
const angebote = readFileSync(path.join(ROOT, "docs", "sales", "offers.md"), "utf8").replace(/\s+/g, " ")
if (!/Knappheit ohne Zustand/i.test(angebote)) {
  fehler.push(
    "`offers.md` fuehrt „Knappheit ohne Zustand“ nicht mehr auf der Verbotsliste. " +
      "Dann steht die Pilotpreis-Zaehlung gegen nichts.",
  )
}
if (!/erste[nr]? Betrieb in einem Gewerk/i.test(angebote)) {
  fehler.push("Die Bedingung des Pilotpreises steht nicht mehr in `offers.md`.")
}

/* ═══ 3 · Der Preis steht noch dort ══════════════════════════════════════ */

const website = packages.find((p) => p.key === "website")
if (!website) {
  fehler.push("Das Website-Paket gibt es nicht mehr — die G05-Frage haengt an seinem Preis.")
} else if (website.amount !== 2400) {
  offen.push(
    `Der Pilotpreis ist jetzt ${website.amount} € (war 2.400 €). Die G05-Frage lautet damit anders.`,
  )
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const anteil = wiederkehrenderAnteil(null, null)
const last = auslastung(0)

console.log(
  `\nWirtschaftlichkeits-Gate — Stundensatz ${STUNDENSATZ_INTERN_CENT === null ? "nicht hinterlegt" : "hinterlegt"}, ` +
    `Kapazitaet ${KAPAZITAET.projekte === null ? "nicht hinterlegt" : KAPAZITAET.projekte}, ` +
    `wiederkehrender Anteil ${anteil.art}`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — keine geschaetzte Marge, die Knappheit ist zaehlbar, der Preis steht.")

/*
 * Die eigentliche Nachricht dieses Gates ist ein sauber begruendetes
 * UNBEKANNT. Es steht bei jedem Build da, damit die G05-Schuld nicht
 * dadurch verschwindet, dass niemand mehr danach fragt.
 */
console.log("\nDie G05-Frage ist heute NICHT beantwortbar, und zwar aus drei benannten Gruenden:")
for (const f of leer.art === "unbekannt" ? leer.fehlt : []) console.log(`  · ${f}`)
if (last.art === "unbekannt") console.log(`  · ${last.fehlt}`)
console.log(`  · ${ungezaehlt.grund}`)
for (const o of offen) console.log(`  · ${o}`)
