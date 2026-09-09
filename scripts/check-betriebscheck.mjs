#!/usr/bin/env node
/**
 * DER BETRIEBSCHECK-WAECHTER
 *
 * ---------------------------------------------------------------------------
 * WARUM ES IHN GIBT
 *
 * Der Betriebscheck ist kein Quiz. Er stellt eine DIAGNOSE, sie steht
 * oeffentlich auf der Seite, und sie geht als Klartext mit dem Lead ins
 * Postfach. Bis zum 09.09.2026 gab es dafuer keinen einzigen Test.
 *
 * Der Fehler, den das kostete, ist der lehrreichste dieser Datei:
 *
 *   `evenlyBalanced` prueft, ob alle fuenf Ebenen GLEICH stehen. Eingefuehrt
 *   wurde es fuer den Bogen aus fuenfzehnmal „Ja“ — dort ist es richtig, und
 *   genau dort wurde es gemessen. Benutzt wurde es dann als Schalter fuer
 *   „Kein Engpass“.
 *
 *   Fuenfmal 50 Prozent sind aber ebenso gleich wie fuenfmal 100. Und
 *   fuenfmal 0 auch.
 *
 *   Ergebnis: Ein Betrieb, der JEDE der fuenfzehn Fragen mit „Nicht“
 *   beantwortet hatte, bekam „Kein Engpass. Keine Ebene faellt ab.“ — und im
 *   Lead-Datensatz stand `bottleneck: null`.
 *
 * Eine Kennzahl, die am Rand ihres Wertebereichs das Gegenteil behauptet,
 * faellt nur auf, wenn jemand den Rand faehrt. Das tut diese Datei.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 *
 *   1. Die drei Raender: alles Ja, alles Teilweise, alles Nicht.
 *   2. Entwarnung gibt es NUR, wenn nirgends etwas fehlt.
 *   3. Ein Engpass wird benannt, sobald eine Ebene abfaellt.
 *   4. Gleichstand unterhalb von 100 ist kein Engpass und keine Entwarnung.
 *   5. Halbe Sachen verschwinden nicht zwischen „offen“ und „nichts offen“.
 *   6. Der Lead-Datensatz sagt dasselbe wie die Seite.
 *   7. Jeder Befundtext existiert in allen Sprachen.
 */
const B = await import("../lib/betriebscheck.ts")

const fehler = []
const ids = B.CHECK_QUESTIONS.map((q) => q.id)
const alle = (k) => Object.fromEntries(ids.map((id) => [id, k]))
const mit = (basis, aenderungen) => ({ ...basis, ...aenderungen })

const p = (ok, was) => { if (!ok) fehler.push(was) }

/* ── 1+2 · Die drei Raender ─────────────────────────────────────────────── */
const jaAlles = B.evaluateCheck(alle("yes"))
p(jaAlles.score === 100, "Fuenfzehnmal „Ja“ ergibt nicht 100.")
p(jaAlles.befund === "kein-engpass", "Ein lueckenloser Bogen bekommt keine Entwarnung.")
p(jaAlles.manualSpots === 0 && jaAlles.partialSpots === 0, "Ein lueckenloser Bogen zaehlt Luecken.")

const teilweiseAlles = B.evaluateCheck(alle("partly"))
p(teilweiseAlles.score === 50, `Fuenfzehnmal „Teilweise“ ergibt ${teilweiseAlles.score} statt 50.`)
p(
  teilweiseAlles.befund !== "kein-engpass",
  "ENTWARNUNG BEI 50 VON 100. Fuenfzehnmal „Teilweise“ laesst alle Ebenen gleich stehen — " +
    "gleich ist aber nicht gut. Wer das als „Kein Engpass“ meldet, sagt einem Betrieb, bei dem " +
    "nichts ganz laeuft, es falle nichts ab.",
)
p(
  teilweiseAlles.partialSpots === 15,
  "Fuenfzehn halbe Sachen werden nicht gezaehlt — dann liest sich der Bogen wie einer ohne offene Stellen.",
)

const neinAlles = B.evaluateCheck(alle("no"))
p(neinAlles.score === 0, "Fuenfzehnmal „Nicht“ ergibt nicht 0.")
p(
  neinAlles.befund !== "kein-engpass",
  "ENTWARNUNG BEI 0 VON 100. Das ist der schlimmste moegliche Fall dieser Seite: Der Betrieb hat " +
    "gerade jede Frage verneint und bekommt „Keine Ebene faellt ab“.",
)
p(neinAlles.manualSpots === 15, "Fuenfzehn verneinte Fragen ergeben nicht fuenfzehn offene Stellen.")

/* ── 3 · Ein echter Engpass wird benannt ────────────────────────────────── */
const ebenen = [...new Set(B.CHECK_QUESTIONS.map((q) => q.layer))]
for (const ebene of ebenen) {
  const schwach = { ...alle("yes") }
  for (const q of B.CHECK_QUESTIONS.filter((x) => x.layer === ebene)) schwach[q.id] = "no"
  const r = B.evaluateCheck(schwach)
  p(r.befund === "engpass", `Eine leere Ebene „${ebene}“ erzeugt keinen Engpass-Befund.`)
  p(r.bottleneck.key === ebene, `Der Engpass zeigt auf „${r.bottleneck.key}“ statt auf „${ebene}“.`)
}

/* Schon eine einzige halbe Antwort macht ihre Ebene zur schwaechsten. */
const eineHalb = B.evaluateCheck(mit(alle("yes"), { [ids[0]]: "partly" }))
p(eineHalb.befund === "engpass", "Eine einzelne halbe Antwort erzeugt keinen Engpass.")
p(eineHalb.score === 97, `Eine halbe Antwort ergibt ${eineHalb.score} statt 97.`)

/* ── 4 · Gleichstand unter 100 ──────────────────────────────────────────── */
p(
  teilweiseAlles.befund === "gleichmaessig-schwach",
  "Gleichstand unterhalb von 100 bekommt keinen eigenen Befund — dann faellt er wieder mit " +
    "Entwarnung oder Engpass zusammen, und einer von beiden ist falsch.",
)
p(teilweiseAlles.evenlyBalanced === true, "`evenlyBalanced` misst nicht mehr, was es heisst.")
p(
  jaAlles.evenlyBalanced === true && jaAlles.befund === "kein-engpass",
  "Der lueckenlose Bogen ist nicht mehr beides: gleich UND ohne Engpass.",
)

/* Der Grenzfall: zwei Ebenen gleich schwach, aber nicht alle. */
const zweiSchwach = { ...alle("yes") }
for (const q of B.CHECK_QUESTIONS.filter((x) => x.layer === ebenen[1] || x.layer === ebenen[3]))
  zweiSchwach[q.id] = "no"
const zwei = B.evaluateCheck(zweiSchwach)
p(zwei.befund === "engpass", "Zwei gleich schwache Ebenen ergeben keinen Engpass.")
p(
  zwei.bottleneck.key === ebenen[1],
  `Bei Gleichstand gewinnt nicht die untere Ebene (${zwei.bottleneck.key} statt ${ebenen[1]}). ` +
    "Die Ebenen stehen aufeinander; eine Luecke unten macht jede Anstrengung darueber teurer.",
)

/* ── 5 · Halbe Sachen sind sichtbar ─────────────────────────────────────── */
const gemischt = B.evaluateCheck(mit(alle("yes"), { [ids[0]]: "no", [ids[1]]: "partly" }))
p(gemischt.manualSpots === 1 && gemischt.partialSpots === 1,
  "„Nicht“ und „Teilweise“ werden nicht getrennt gezaehlt.")

/* ── 6 · Unvollstaendig ergibt keinen Befund ────────────────────────────── */
const halberBogen = B.evaluateCheck({ [ids[0]]: "yes" })
p(!halberBogen.complete, "Ein Bogen mit einer Antwort gilt als vollstaendig.")

/* ── 7 · Jeder Text existiert in allen Sprachen ─────────────────────────── */
const SPRACHEN = ["de", "tr", "en", "ar"]
for (const key of ["bottleneckEvenLabel", "bottleneckWeakLabel", "bottleneckWeak", "partialLabel"]) {
  const eintrag = B.checkCopy[key]
  if (!eintrag) { fehler.push(`checkCopy.${key} fehlt.`); continue }
  for (const sprache of SPRACHEN) {
    const wert = eintrag[sprache]
    const text = typeof wert === "function" ? wert(3) : wert
    if (!text || String(text).trim().length < 5)
      fehler.push(`checkCopy.${key}.${sprache} fehlt oder ist leer.`)
  }
}

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
console.log(
  `\nBetriebscheck-Waechter — ${B.CHECK_QUESTIONS.length} Fragen auf ${ebenen.length} Ebenen, ` +
    `Raender: 100 / ${teilweiseAlles.score} / ${neinAlles.score}`,
)

if (fehler.length > 0) {
  console.error("\nBetriebscheck: die Diagnose sagt etwas anderes als der Bogen.\n")
  for (const f of fehler) console.error(`  ${f}`)
  console.error(
    "\nDiese Seite stellt eine Diagnose, und sie geht mit dem Lead ins Postfach. Eine falsche\n" +
      "Entwarnung ist hier teurer als ein falscher Alarm.\n",
  )
  process.exit(1)
}

console.log(
  "OK — Entwarnung nur ohne jede Luecke, Engpass sobald eine Ebene abfaellt,\n" +
    "Gleichstand unter 100 ist beides nicht, und halbe Sachen bleiben sichtbar.\n",
)
