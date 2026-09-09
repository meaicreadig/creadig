#!/usr/bin/env node
/**
 * G29 · NAVIGATOR-GATE — Empfehlung mit Beleg, Entscheidung beim Menschen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE VIER FRAGEN
 *
 *   1 · Traegt jeder Vorschlag seinen Beleg — also die Auskunft aus G28 mit
 *       deren Fundstellen? Ein Vorschlag ohne Beleg ist ein Bauchgefuehl
 *       mit Systemstimme, und dem widerspricht niemand.
 *
 *   2 · Wird aus einem NICHT ERHOBENEN eine Reparatur? Das darf nicht: Wer
 *       behebt, was niemand gemessen hat, haelt danach das Ergebnis fuer
 *       bestaetigt.
 *
 *   3 · HANDELT der Navigator? Er darf nicht. Kein Schreibzugriff, kein
 *       Speicher, kein Versand.
 *
 *   4 · Erfindet er eine zweite Qualifizierung? `qualification-canon.md`
 *       verbietet es ausdruecklich.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { NAVIGATOR_HANDELT_NICHT, reihenfolge, vorschlaege, vorschlagTraegt, zuBeheben, zuMessen } from "../lib/navigator.ts"
import { kontext } from "../lib/gedaechtnis.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const roh = readFileSync(path.join(ROOT, "lib", "navigator.ts"), "utf8")
const quelle = ohneKommentare(roh)

/* ═══ 1 · Belegpflicht ═══════════════════════════════════════════════════ */

const alle = vorschlaege()
for (const v of alle) {
  if (!vorschlagTraegt(v)) fehler.push(`Der Vorschlag „${v.key}“ traegt nicht.`)
  if (!v.quelle || v.quelle.belege.length === 0) {
    fehler.push(`Der Vorschlag „${v.key}“ hat keine belegte Quelle aus G28.`)
  }
  if (!/^[A-ZÄÖÜ]/.test(v.handlung) || v.handlung.length < 12) {
    fehler.push(`Der Vorschlag „${v.key}“ nennt keine Handlung.`)
  }
}

/* ═══ 2 · Nicht erhoben heisst messen ════════════════════════════════════ */

const lagen = kontext()
for (const v of alle) {
  const lage = lagen.find((a) => a.key === v.key)
  if (!lage) {
    fehler.push(`Der Vorschlag „${v.key}“ hat keine Lage im Gedaechtnis.`)
    continue
  }
  if (lage.steht === null && v.art !== "messen") {
    fehler.push(
      `„${v.key}“ ist nicht erhoben, der Vorschlag lautet aber „${v.art}“. ` +
        "Wer behebt, was niemand gemessen hat, haelt danach das Ergebnis fuer bestaetigt.",
    )
  }
  if (lage.steht === false && v.art !== "beheben") {
    fehler.push(`„${v.key}“ ist ein Befund, der Vorschlag lautet aber „${v.art}“.`)
  }
}
/* Und zu einer erledigten Lage darf es gar nichts geben. */
for (const a of lagen) {
  if (a.steht === true && alle.some((v) => v.key === a.key)) {
    fehler.push(
      `Zu „${a.key}“ gibt es einen Vorschlag, obwohl die Lage steht. ` +
        "Ein Navigator, der auch zu Erledigtem etwas sagt, fuellt den Blick mit Bestaetigung.",
    )
  }
}

/* ═══ 3 · Der Navigator handelt nicht ════════════════════════════════════ */

for (const muster of [
  /from\s+["']@\/lib\/vertrieb-store/,
  /from\s+["']@\/lib\/lead-store/,
  /from\s+["']@\/lib\/neon-client/,
]) {
  if (muster.test(roh)) {
    fehler.push(
      "`lib/navigator.ts` greift auf einen Speicher zu. Er schlaegt vor und fuehrt nicht aus — " +
        "eine Empfehlung, die sich selbst ausfuehrt, ist eine Anweisung ohne Absender.",
    )
  }
}
for (const ruf of ["fetch", "sendMail", "raiseAlert", "sql", "update", "insert"]) {
  if (new RegExp(`\\b${ruf}\\s*\\(`, "i").test(quelle)) {
    fehler.push(`\`lib/navigator.ts\` ruft \`${ruf}()\`. Der Navigator handelt nicht.`)
  }
}
if (!/Entscheidung gehoert einem Menschen/.test(NAVIGATOR_HANDELT_NICHT)) {
  fehler.push("Die Entscheidung, dass der Navigator nicht handelt, ist nicht mehr nachlesbar.")
}

/* ═══ 4 · Keine zweite Qualifizierung ════════════════════════════════════ */

const kanon = readFileSync(path.join(ROOT, "docs", "sales", "qualification-canon.md"), "utf8").replace(/\s+/g, " ")
if (!/erfindet keine zweite Qualifizierung/i.test(kanon)) {
  fehler.push("Der Kanon fuehrt die Regel gegen eine zweite Qualifizierung nicht mehr.")
}
for (const wort of ["qualifiziere", "einordnung", "classify", "score"]) {
  if (new RegExp(`\\b${wort}\\w*\\s*\\(`, "i").test(quelle)) {
    fehler.push(
      `\`lib/navigator.ts\` ruft \`${wort}\`. Der Navigator benutzt die Routen und Treiber, ` +
        "die es gibt — er erfindet keine zweite Qualifizierung.",
    )
  }
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const messen = zuMessen()
const beheben = zuBeheben()
const folge = reihenfolge()

console.log(
  `\nNavigator-Gate — ${alle.length} Vorschlaege aus ${lagen.length} Lagen ` +
    `(${messen.length} messen, ${beheben.length} beheben)`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — jeder Vorschlag traegt seinen Beleg, nichts Unerhobenes wird repariert, der Navigator handelt nicht.")
console.log("\nReihenfolge — erst messen, dann beheben:")
for (const v of folge) {
  console.log(`  ${v.art === "messen" ? "messen " : "beheben"} · ${v.wer.padEnd(5)} · ${v.handlung}`)
}
