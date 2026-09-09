#!/usr/bin/env node
/**
 * G26 · EREIGNIS-GATE — Wiederholung ja, Verantwortung nein.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE VIER FRAGEN
 *
 *   1 · Kennt das Register dieselben Ereignisse wie der Speicher? Ein
 *       Ereignis, das nur im Register steht, loest nie aus; eines, das nur
 *       im Speicher steht, ist ein blinder Fleck.
 *
 *   2 · Traegt jeder Ausloeser eine erlaubte Wirkung — und keine, die auf
 *       der Verbotsliste steht?
 *
 *   3 · Ist die Idempotenz ABGELEITET? Ein zufaelliger Schluessel ist
 *       keiner: Beim zweiten Lauf desselben Ereignisses entstuende ein
 *       neuer, und die Wirkung traete zweimal ein.
 *
 *   4 · Ist jeder Ausloeser abschaltbar und begrenzt?
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  AUSLOESER,
  EREIGNISSE,
  NIEMALS_AUTOMATISCH,
  WIRKUNGEN,
  ausloeserErlaubt,
  darfLaufen,
  idempotenzSchluessel,
} from "../lib/ereignis.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}

/* ═══ 1 · Register und Speicher kennen dieselben Ereignisse ══════════════ */

const store = ohneKommentare(readFileSync(path.join(ROOT, "lib", "vertrieb-store-neon.ts"), "utf8"))
const imSpeicher = new Set(
  [...store.matchAll(/"([a-z]+\.[a-z]+)"/g)]
    .map((m) => m[1])
    /* `note()` schreibt `kind` — andere Punkt-Zeichenketten sind keine Ereignisse. */
    .filter((k) => /^(lead|opportunity|offer|project|contact|organisation)\./.test(k)),
)

for (const e of EREIGNISSE) {
  if (!imSpeicher.has(e)) {
    fehler.push(
      `Das Register fuehrt „${e}", der Speicher schreibt es nicht. Ein Ereignis, das nie ` +
        "entsteht, loest nie aus — und niemand merkt es.",
    )
  }
}
for (const k of imSpeicher) {
  if (!EREIGNISSE.includes(k)) {
    fehler.push(
      `Der Speicher schreibt „${k}", das Register kennt es nicht. Ein blinder Fleck: ` +
        "Daran kann nichts haengen, auch wenn es sollte.",
    )
  }
}

/* ═══ 2 · Kein Ausloeser uebertritt die Grenze ═══════════════════════════ */

for (const a of AUSLOESER) {
  if (!WIRKUNGEN.includes(a.wirkung)) {
    fehler.push(`Der Ausloeser „${a.key}" hat die unbekannte Wirkung „${a.wirkung}".`)
  }
  if (!EREIGNISSE.includes(a.auf)) {
    fehler.push(`Der Ausloeser „${a.key}" haengt an einem Ereignis, das es nicht gibt.`)
  }
  const urteil = ausloeserErlaubt(a.was)
  if (!urteil.ja) {
    fehler.push(
      `Der Ausloeser „${a.key}" wuerde etwas tun, das nie automatisch geschehen darf ` +
        `(${urteil.gate}): ${urteil.weil}`,
    )
  }
  if (a.abschaltbar !== true) {
    fehler.push(`Der Ausloeser „${a.key}" ist nicht abschaltbar. Menschliche Uebersteuerung ist keine Option.`)
  }
  if (!Number.isInteger(a.versucheMax) || a.versucheMax < 1 || a.versucheMax > 5) {
    fehler.push(`Der Ausloeser „${a.key}" hat keine sinnvolle Versuchsgrenze (${a.versucheMax}).`)
  }
  if ((a.was?.trim().length ?? 0) < 20) {
    fehler.push(`Der Ausloeser „${a.key}" sagt nicht, was er tut.`)
  }
}

/* Die Verbotsliste muss ihre Gates nennen — sonst ist sie eine Meinung. */
for (const n of NIEMALS_AUTOMATISCH) {
  if (!/^G\d+$/.test(n.gate)) {
    fehler.push(`Der Eintrag „${n.was}" nennt kein Gate. Eine Verbotsliste ohne Herkunft ist eine Meinung.`)
  }
  if ((n.weil?.trim().length ?? 0) < 20) {
    fehler.push(`Der Eintrag „${n.was}" sagt nicht, warum.`)
  }
}

/* ═══ 3 · Idempotenz ist abgeleitet ══════════════════════════════════════ */

const quelle = ohneKommentare(readFileSync(path.join(ROOT, "lib", "ereignis.ts"), "utf8"))
for (const zufall of ["randomUUID", "Math.random", "Date.now"]) {
  if (new RegExp(zufall.replace(".", "\\.")).test(quelle)) {
    fehler.push(
      `\`lib/ereignis.ts\` benutzt ${zufall}. Ein zufaelliger Idempotenz-Schluessel ist keiner — ` +
        "beim zweiten Lauf desselben Ereignisses traete die Wirkung noch einmal ein.",
    )
  }
}
const s1 = idempotenzSchluessel("a", "offer.sent", "x")
const s2 = idempotenzSchluessel("a", "offer.sent", "x")
if (s1 !== s2) fehler.push("Derselbe Vorgang ergibt zwei Schluessel. Dann greift die Idempotenz nie.")
if (idempotenzSchluessel("a", "offer.sent", "x") === idempotenzSchluessel("a", "offer.sent", "y")) {
  fehler.push("Zwei Gegenstaende ergeben denselben Schluessel. Dann greift sie zu oft.")
}

/* ═══ 4 · Die Uebersteuerung schlaegt die Idempotenz ═════════════════════ */

const abgeschaltet = darfLaufen({
  ausloeser: AUSLOESER[0].key,
  ereignis: AUSLOESER[0].auf,
  gegenstand: "x",
  abgeschaltet: [AUSLOESER[0].key],
})
if (abgeschaltet.erlaubt) fehler.push("Ein abgeschalteter Ausloeser laeuft trotzdem.")
if (abgeschaltet.schluessel !== null) {
  fehler.push(
    "Ein abgeschalteter Ausloeser bekommt einen Idempotenz-Schluessel. Wer abschaltet, will, " +
      "dass nichts geschieht — nicht, dass es einmal noch geschieht.",
  )
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

console.log(
  `\nEreignis-Gate — ${EREIGNISSE.length} Ereignisse, ${AUSLOESER.length} Ausloeser ` +
    `(${WIRKUNGEN.join("/")}), ${NIEMALS_AUTOMATISCH.length} Handlungen nie automatisch`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  "OK — Register und Speicher kennen dieselben Ereignisse, kein Ausloeser entscheidet, " +
    "die Idempotenz ist abgeleitet.",
)
console.log(
  "\nG27 bleibt offen: Ob die Owner-Last sinkt, zeigen Messwerte ueber Zeit — nicht diese Schicht.",
)
