#!/usr/bin/env node
/**
 * DAS GATE FUER DIE ACCEPTANCE-MATRIX
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * Eine Befundliste verfaellt leise. Ein Befund verliert sein Gate, zwei
 * bekommen dieselbe Nummer, ein P1 verschwindet beim Umformatieren — und
 * niemand merkt es, weil eine Markdown-Tabelle nichts prueft.
 *
 * Genau das ist der Grund, warum creaDIG diese Runde ueberhaupt braucht: Es
 * gab bereits Arbeit, die einzeln richtig und als Ganzes nicht mehr
 * kontrollierbar war. Die Matrix ist das Gegenmittel — also wird sie
 * geprueft.
 *
 * Regeln:
 *   1. Jede ID kommt genau einmal vor.
 *   2. Jeder Befund hat genau ein Gate.
 *   3. Jeder Befund hat eine gueltige Priorität.
 *   4. Jeder Befund hat einen gueltigen Wahrheitsstand.
 *   5. Kein Befund ohne Route/Bereich.
 *   6. Die Zusammenfassung stimmt mit den gezaehlten Zeilen ueberein.
 *   7. Jedes in der Verteilung genannte Gate existiert im Kanon.
 *
 * Aufruf: `node scripts/check-website2.mjs`
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const MATRIX = path.join(ROOT, "docs", "website-2", "acceptance-matrix.md")
/* Die Artefakte, ohne die das Kontrollsystem nicht vollstaendig ist. */
const PFLICHT = [
  "README.md", "gate-00-baseline.md", "acceptance-matrix.md", "decision-log.md",
  "owner-decisions.md", "claim-proof-matrix.md", "pricing-inventory.md",
  "buyer-matrix.md", "route-inventory.md",
  /* Gate 01 */
  "gate-01-positioning-ia.md", "positioning-system.md", "offer-architecture.md",
  "information-architecture.md", "page-contracts.md", "route-transition-plan.md",
  /* Gate 02 */
  "gate-02-proof-sales.md",
]

const GATES = ["G00", "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09"]
const PRIOS = ["P0", "P1", "P2", "P3"]
const STAENDE = [
  "CONFIRMED_CURRENT", "LIVE_ONLY", "FIXED_ON_BRANCH", "NOT_REPRODUCED",
  "OBSOLETE", "OWNER_BLOCKED", "EXTERNAL_BLOCKED", "UNVERIFIED",
]

const probleme = []

if (!fs.existsSync(MATRIX)) {
  console.error("\nAcceptance-Matrix fehlt:", MATRIX, "\n")
  process.exit(1)
}
const text = fs.readFileSync(MATRIX, "utf8")

for (const datei of PFLICHT) {
  if (!fs.existsSync(path.join(ROOT, "docs", "website-2", datei))) {
    probleme.push(`docs/website-2/${datei} fehlt — das Kontrollsystem ist unvollstaendig.`)
  }
}

/*
 * Die Prioritaet steht als Abschnittsueberschrift ueber ihren Zeilen, nicht in
 * jeder Zeile. Sie wird deshalb mitgefuehrt, waehrend die Datei gelesen wird —
 * so bleibt die Tabelle fuer einen Menschen lesbar und fuer das Gate pruefbar.
 */
let prio = null
const befunde = []
for (const zeile of text.split("\n")) {
  const kopf = zeile.match(/^##\s+(P[0-3])\s/)
  if (kopf) { prio = kopf[1]; continue }
  /*
   * Jede andere Ueberschrift beendet den Prioritaetsabschnitt.
   *
   * Ohne diese Zeile lief `prio` bis zum Dateiende weiter — und die
   * Gate-01-Belegtabelle im Anhang wurde als elf zusaetzliche Befunde
   * gezaehlt. Das Gate hat es gemeldet (die Verteilung zaehlte 43, die Matrix
   * 54), aber erst nachdem der Fehler schon in der Datei stand. Jetzt faellt
   * er sofort auf: Eine Befundzeile ausserhalb ihres Abschnitts hat keine
   * Prioritaet mehr und wird als solche gemeldet.
   */
  if (/^##\s/.test(zeile)) { prio = null; continue }
  if (!zeile.startsWith("| WEB-")) continue
  const spalten = zeile.split("|").map((s) => s.trim())
  const [, id, quelle, stand, route, , , gate] = spalten
  befunde.push({ id, quelle, stand, route, gate, prio, zeile })
}

if (befunde.length === 0) probleme.push("Keine Befundzeile gefunden — liest das Gate die richtige Datei?")

/* 1 · IDs eindeutig */
const gesehen = new Map()
for (const b of befunde) {
  if (gesehen.has(b.id)) probleme.push(`${b.id} kommt mehrfach vor.`)
  gesehen.set(b.id, b)
}

/* 2–5 · Pflichtfelder */
for (const b of befunde) {
  if (!b.prio) probleme.push(`${b.id} steht unter keiner Prioritaets-Ueberschrift.`)
  else if (!PRIOS.includes(b.prio)) probleme.push(`${b.id} hat unbekannte Prioritaet „${b.prio}".`)
  if (!b.gate) probleme.push(`${b.id} hat kein Gate — heimatlose Befunde sind verboten.`)
  else if (!GATES.includes(b.gate)) probleme.push(`${b.id} nennt unbekanntes Gate „${b.gate}".`)
  if (!b.stand) probleme.push(`${b.id} hat keinen Wahrheitsstand.`)
  else if (!STAENDE.includes(b.stand)) probleme.push(`${b.id} hat unbekannten Stand „${b.stand}".`)
  if (!b.route) probleme.push(`${b.id} nennt keine Route und keinen Bereich.`)
  if (!b.quelle) probleme.push(`${b.id} nennt keine Quelle.`)
}

/* 6 · Zusammenfassung gegen die gezaehlten Zeilen */
const behauptet = (feld) => {
  const m = text.match(new RegExp(`\\|\\s*${feld}\\s*\\|\\s*(\\d+)\\s*\\|`))
  return m ? Number(m[1]) : null
}
const zaehl = {
  "Befunde gesamt": befunde.length,
  P0: befunde.filter((b) => b.prio === "P0").length,
  P1: befunde.filter((b) => b.prio === "P1").length,
  P2: befunde.filter((b) => b.prio === "P2").length,
  P3: befunde.filter((b) => b.prio === "P3").length,
  /*
   * Alle acht Wahrheitsstaende, nicht nur die vier, die in Gate 00 vorkamen.
   * Gate 01 hat sieben Befunde auf FIXED_ON_BRANCH gesetzt; eine
   * Zusammenfassung, die diesen Stand nicht zaehlt, kann ihn auch nicht
   * falsch zaehlen — und genau das ist die stille Drift, gegen die dieses
   * Gate gebaut ist.
   */
  ...Object.fromEntries(
    STAENDE.map((stand) => [stand, befunde.filter((b) => b.stand === stand).length]),
  ),
}
for (const [feld, ist] of Object.entries(zaehl)) {
  const soll = behauptet(feld)
  if (soll !== null && soll !== ist) {
    probleme.push(`Zusammenfassung sagt ${feld} = ${soll}, gezaehlt wurden ${ist}.`)
  }
}

/*
 * 7 · Die Verteilungstabelle muss zu den Befunden passen.
 *
 * Genau hier ist beim Erstellen ein Fehler passiert: elf IDs standen in einer
 * Zeile, die Zahl daneben sagte zehn. Eine Verteilung, die anders zaehlt als
 * die Liste, ist genau die stille Drift, gegen die dieses Gate gebaut ist.
 */
const vertIdx = text.indexOf("## Verteilung auf die Gates")
if (vertIdx === -1) probleme.push("Die Verteilungstabelle fehlt.")
else {
  const vert = text.slice(vertIdx)
  let summe = 0
  for (const m of vert.matchAll(/^\| (G0\d)[^|]*\|\s*(\d+)\s*\|\s*([^|]*)\|/gm)) {
    const [, gate, zahl, idListe] = m
    const genannt = [...idListe.matchAll(/\b0(\d{3})\b/g)].map((x) => `WEB-0${x[1]}`)
    summe += Number(zahl)
    if (genannt.length !== Number(zahl)) {
      probleme.push(`Verteilung ${gate}: Zahl sagt ${zahl}, aufgezaehlt sind ${genannt.length} IDs.`)
    }
    for (const id of genannt) {
      const b = gesehen.get(id)
      if (!b) probleme.push(`Verteilung ${gate} nennt ${id} — den Befund gibt es nicht.`)
      else if (b.gate !== gate) probleme.push(`${id} steht in der Verteilung unter ${gate}, in der Matrix unter ${b.gate}.`)
    }
  }
  if (summe !== befunde.length) {
    probleme.push(`Verteilung zaehlt ${summe} Befunde, die Matrix hat ${befunde.length}.`)
  }
}

/* 8 · Kein P0/P1 ohne Beleg */
for (const b of befunde.filter((x) => x.prio === "P0" || x.prio === "P1")) {
  const spalten = b.zeile.split("|").map((s) => s.trim())
  const beleg = spalten[6] ?? ""
  if (beleg.length < 20) {
    probleme.push(`${b.id} ist ${b.prio}, traegt aber keinen belastbaren Beleg.`)
  }
}

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
console.log(
  `\nWebsite-2-Gate — ${befunde.length} Befunde · ` +
    `P0 ${zaehl.P0} · P1 ${zaehl.P1} · P2 ${zaehl.P2} · P3 ${zaehl.P3} · ` +
    `${new Set(befunde.map((b) => b.gate)).size} Gates belegt`,
)

if (probleme.length > 0) {
  console.error("\nWebsite-2-Gate: die Matrix ist nicht mehr kontrollierbar.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nEine Befundliste, die ihre eigenen Regeln nicht mehr einhaelt, ist eine\n" +
      "Wunschliste. Genau davor soll dieses Gate schuetzen.\n",
  )
  process.exit(1)
}

console.log("OK — jede ID einmal, jeder Befund mit Gate, Prioritaet, Stand und Beleg.\n")
