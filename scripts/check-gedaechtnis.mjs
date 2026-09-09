#!/usr/bin/env node
/**
 * G28 · GEDAECHTNIS-GATE — Belegpflicht, und kein zweiter Speicher.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI FRAGEN
 *
 *   1 · Traegt JEDE Auskunft einen Beleg? Eine Auskunft ohne Fundstelle ist
 *       eine Behauptung mit Systemstimme — gefaehrlicher als eine mit
 *       Menschenstimme, weil ihr niemand widerspricht.
 *
 *   2 · Haelt das Gedaechtnis etwas FEST? Es darf nicht. Ein Gedaechtnis
 *       mit eigener Kopie ist die zweite Wahrheit, und zwar die
 *       gefaehrlichste Sorte: Sie fuehlt sich richtig an, weil sie einmal
 *       richtig war.
 *
 *   3 · Bleibt UNBEKANNT unbekannt? `steht: null` ist etwas Drittes, kein
 *       Nein. Wer beides zusammenwirft, macht aus „nicht erhoben" ein
 *       „nicht in Ordnung" — und behebt dann etwas, das nicht kaputt ist.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { FRAGEN, auskunftTraegt, frage, kontext, nichtErhoben, offen } from "../lib/gedaechtnis.ts"
import { PORTFOLIO, standTraegt } from "../lib/produkt.ts"
import { traegtDerPreis } from "../lib/wirtschaft.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

/* ═══ 1 · Belegpflicht ═══════════════════════════════════════════════════ */

for (const f of FRAGEN) {
  const a = f.beantworte()
  if (a.belege.length === 0) {
    fehler.push(`Die Auskunft „${f.key}“ traegt keinen Beleg.`)
    continue
  }
  for (const b of a.belege) {
    if (!b.woher?.trim() || !b.was?.trim()) {
      fehler.push(`Die Auskunft „${f.key}“ hat einen Beleg ohne Fundstelle oder Inhalt.`)
    }
  }
  if (!auskunftTraegt(a)) {
    fehler.push(`Die Auskunft „${f.key}“ traegt nicht — Frage, Antwort oder Beleg fehlt.`)
  }
  if (a.key !== f.key) {
    fehler.push(`Die Auskunft „${f.key}“ gibt sich als „${a.key}“ aus.`)
  }
}

/* Und der Abruf muss die Pflicht selbst durchsetzen, nicht erst das Gate. */
if (frage("gibt-es-nicht") !== null) {
  fehler.push("Eine unbekannte Frage bekommt eine Antwort. Das Gedaechtnis hat geraten.")
}

/* ═══ 2 · Kein zweiter Speicher ══════════════════════════════════════════ */

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const roh = readFileSync(path.join(ROOT, "lib", "gedaechtnis.ts"), "utf8")
const quelle = ohneKommentare(roh)

/*
 * Gesucht ist die WIRKUNG: ein veraenderbarer Zwischenspeicher auf
 * Modulebene. `const` mit einer Liste von FRAGEN ist keiner — die Fragen
 * werden bei jedem Aufruf neu gerechnet.
 */
if (/\b(let|var)\s+\w+\s*(:|=)/.test(quelle)) {
  fehler.push(
    "In `lib/gedaechtnis.ts` steht eine veraenderbare Modulvariable. Ein Gedaechtnis mit " +
      "eigener Kopie ist die zweite Wahrheit — und die gefaehrlichste, weil sie einmal richtig war.",
  )
}
for (const wort of ["cache", "zwischenspeicher", "memo", "snapshot"]) {
  if (new RegExp(`\\b${wort}\\b\\s*[(:=]`, "i").test(quelle)) {
    fehler.push(`\`lib/gedaechtnis.ts\` fuehrt einen ${wort}. Es rechnet, es speichert nicht.`)
  }
}
/* Zwei Aufrufe hintereinander muessen dasselbe ergeben — und frisch sein. */
const a1 = JSON.stringify(kontext())
const a2 = JSON.stringify(kontext())
if (a1 !== a2) {
  fehler.push("Zwei Abrufe ergeben Verschiedenes. Dann haengt die Auskunft an etwas Gespeichertem.")
}

/* ═══ 3 · Unbekannt bleibt unbekannt ═════════════════════════════════════ */

const alle = kontext()
for (const a of alle) {
  if (a.steht === null && /^(nein|ja)\b/i.test(a.antwort.trim())) {
    fehler.push(
      `Die Auskunft „${a.key}“ ist nicht erhoben, antwortet aber mit ja oder nein. ` +
        "Nicht erhoben ist etwas Drittes.",
    )
  }
}
/*
 * UND DIE GEFAEHRLICHERE RICHTUNG — von der Blindprobe gefunden.
 *
 * Der erste Anlauf prueft nur, ob ein `null` sich als ja/nein AUSGIBT. Die
 * Probe machte das Gegenteil: Sie liess ein nicht erhobenes Feld als hartes
 * `false` melden — und der Waechter schwieg.
 *
 * Das ist die schlimmere Richtung. Aus „nicht erhoben" wird „nicht in
 * Ordnung", und dann behebt jemand etwas, das nicht kaputt ist — oder
 * schlimmer: Er haelt eine offene Owner-Frage fuer einen Systemfehler und
 * wartet darauf, dass sie sich von selbst loest.
 *
 * Ein Waechter kann das nicht am Text erkennen. Er muss die Auskunft gegen
 * die QUELLE halten, aus der sie stammt — und genau dafuer gibt es die
 * Belegpflicht. Zwei Fragen tragen heute ein Unbekanntes; beide werden
 * nachgeschlagen.
 */
const produktstand = alle.find((a) => a.key === "produktstand")
if (produktstand && PORTFOLIO.filter((e) => standTraegt(e.stand)).length === 0 && produktstand.steht !== null) {
  fehler.push(
    "Kein Produkt hat einen bestaetigten Reifegrad, die Auskunft meldet aber nicht `null`. " +
      "Aus nicht erhoben wird so nicht in Ordnung — und jemand behebt etwas, das nicht kaputt ist.",
  )
}
const wirtschaft = alle.find((a) => a.key === "wirtschaftlichkeit")
if (wirtschaft && traegtDerPreis("website", []).art === "unbekannt" && wirtschaft.steht !== null) {
  fehler.push(
    "Die Marge ist unbekannt, die Auskunft meldet aber ja oder nein. Die G05-Frage waere damit " +
      "scheinbar beantwortet.",
  )
}

if (alle.length !== FRAGEN.length) {
  fehler.push(
    `${FRAGEN.length} Fragen, aber nur ${alle.length} Auskuenfte im Kontext. ` +
      "Eine Frage, die durch die Belegpflicht faellt, verschwindet stillschweigend.",
  )
}

/* ═══ 4 · Keine Empfehlung ═══════════════════════════════════════════════ */

for (const wort of ["empfehlung", "vorschlag", "solltest", "empfiehlt"]) {
  if (new RegExp(`\\b${wort}\\w*\\s*[(:=]`, "i").test(quelle)) {
    fehler.push(
      `\`lib/gedaechtnis.ts\` gibt eine ${wort}. Dieses Modul sagt, WIE ES STEHT — ` +
        "was zu tun ist, wohnt in G29. Ein Gedaechtnis, das mitentscheidet, ist keins mehr.",
    )
  }
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const belegeGesamt = alle.reduce((n, a) => n + a.belege.length, 0)
const unbekannt = nichtErhoben()
const nichtOk = offen()

console.log(
  `\nGedaechtnis-Gate — ${FRAGEN.length} Fragen, ${belegeGesamt} Belege, ` +
    `${nichtOk.length} offen, ${unbekannt.length} nicht erhoben`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — jede Auskunft traegt ihren Beleg, nichts ist gespeichert, unbekannt bleibt unbekannt.")
if (unbekannt.length > 0) {
  console.log("\nNicht erhoben — und das ist etwas anderes als „nicht in Ordnung“:")
  for (const a of unbekannt) console.log(`  · ${a.frage} → ${a.antwort}`)
}
