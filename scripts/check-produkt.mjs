#!/usr/bin/env node
/**
 * G24 · PRODUKT-GATE — ein Portfolio, das gefuehrt wird.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE VIER FRAGEN
 *
 *   1 · Kennt das Portfolio jedes Produkt — und kennt es keins zu viel?
 *   2 · Hat jedes Produkt einen Eigentuemer und einen Rueckmeldeweg?
 *       Das sind SYSTEMpflichten: Wer ein Produkt betreibt, schuldet beides.
 *   3 · Widerspricht ein bestaetigter Stand dem abgeleiteten Status?
 *       Das ist die Pruefung, ohne die dieses Register gefaehrlich waere.
 *   4 · Wird der Reifegrad zweimal gefuehrt?
 *
 * WAS ES NICHT ABBRICHT: einen fehlenden Stand. Die Stufe weiss genau eine
 * Person, und ein Gate, das sie erzwingt, bekommt eine erfundene. Sie steht
 * als Owner-Punkt in der Ausgabe — sichtbar, gezaehlt, unerledigt.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  PORTFOLIO,
  REIFEGRADE,
  STAND_HAELT_MONATE,
  ohneEintrag,
  portfolioLuecken,
  standTraegt,
  veraltet,
  wegTraegt,
  widerspruch,
} from "../lib/produkt.ts"
import { productWorks } from "../lib/site-data.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []
const offen = []

/* ═══ 1 · Deckung in beide Richtungen ════════════════════════════════════ */

for (const w of ohneEintrag()) {
  fehler.push(
    `${w.name} steht in productWorks, aber nicht im Portfolio. ` +
      "Ein Produkt, das niemand fuehrt, hat auch keinen Eigentuemer und keinen Rueckmeldeweg.",
  )
}
for (const e of PORTFOLIO) {
  if (!productWorks.some((w) => w.slug === e.slug)) {
    fehler.push(`Das Portfolio fuehrt „${e.slug}", das es in productWorks nicht gibt.`)
  }
}

/* ═══ 2 · Systempflichten: Eigentuemer und Rueckmeldeweg ═════════════════ */

for (const l of portfolioLuecken()) {
  /*
   * Der Stand ist ein Owner-Punkt und bricht nichts. Alles andere ist eine
   * Pflicht des Hauses gegenueber jemandem, der das Produkt benutzt.
   */
  if (l.feld === "Stand") offen.push(l)
  else fehler.push(`${l.produkt} — ${l.feld}: ${l.satz}`)
}

/* ═══ 3 · Der Widerspruch ════════════════════════════════════════════════ */

for (const e of PORTFOLIO) {
  const w = productWorks.find((x) => x.slug === e.slug)
  if (!w) continue
  const satz = widerspruch(w, e)
  if (satz) fehler.push(satz)
}

/* ═══ 4 · Kein zweiter Reifegrad ═════════════════════════════════════════ */

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}

const daten = ohneKommentare(readFileSync(path.join(ROOT, "lib", "site-data.ts"), "utf8"))
/*
 * `ProductWorld.maturity` existiert noch — als Typ und als Feld auf allen
 * vier Welten, ueberall `null`. Das ist erlaubt, solange es LEER bleibt:
 * Sobald dort ein Wert steht, gibt es den Reifegrad zweimal, und die
 * Fassung ohne Wer und Wann gewinnt beim Lesen.
 */
const gesetzt = [...daten.matchAll(/maturity:\s*("[^"]+"|'[^']+')/g)]
if (gesetzt.length > 0) {
  fehler.push(
    `In lib/site-data.ts steht ${gesetzt.length}× ein gesetzter \`maturity\`-Wert. ` +
      "Der Reifegrad wird seit G24 im Portfolio gefuehrt — mit Wer, Wann und Woran. " +
      "Zwei Felder fuer dieselbe Stufe laufen auseinander, und das ohne Datum gewinnt.",
  )
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const mitStand = PORTFOLIO.filter((e) => standTraegt(e.stand))
const alt = PORTFOLIO.filter((e) => veraltet(e.stand))
const mitWeg = PORTFOLIO.filter((e) => wegTraegt(e.rueckmeldung))

console.log(
  `\nProdukt-Gate — ${PORTFOLIO.length} Produkt(e), ${Object.keys(REIFEGRADE).length} Reifegrade, ` +
    `Stand haelt ${STAND_HAELT_MONATE} Monate`,
)
console.log(
  `  Eigentuemer ${PORTFOLIO.filter((e) => e.eigentuemer?.trim()).length}/${PORTFOLIO.length} · ` +
    `Rueckmeldeweg ${mitWeg.length}/${PORTFOLIO.length} · ` +
    `bestaetigter Stand ${mitStand.length}/${PORTFOLIO.length}` +
    (alt.length ? ` · ${alt.length} veraltet` : ""),
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — jedes Produkt hat einen Eigentuemer und einen Rueckmeldeweg, kein Stand widerspricht den Daten.")

if (offen.length > 0) {
  console.log(
    `\n${offen.length} Owner-Punkt(e) — kein Mangel des Systems, sondern eine Angabe, die nur eine Person hat:`,
  )
  for (const o of offen) console.log(`  · ${o.produkt}: ${o.satz}`)
  /*
   * Ein einziger Owner-Satz je Produkt schliesst das. Es steht hier und
   * nicht in einem Ticket, weil ein Gate, das den Punkt bei jedem Build
   * ausspricht, schwerer zu vergessen ist als eine Liste.
   */
  console.log(
    `\n  Ein Stand braucht drei Angaben: die Stufe (${Object.keys(REIFEGRADE).join(" / ")}), ` +
      "wer sie bestaetigt, und woran man sie sieht.",
  )
}
