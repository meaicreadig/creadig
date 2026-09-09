#!/usr/bin/env node
/**
 * G30 · VOLLMACHT-GATE — lesen ≠ vorschlagen ≠ handeln.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE VIER FRAGEN
 *
 *   1 · Bleibt jede Vollmacht INNERHALB der G26-Grenze? Was nie automatisch
 *       geschehen darf, darf auch kein beauftragter Agent tun. Eine
 *       Vollmacht erweitert die Grenze nicht — sie liegt darin.
 *
 *   2 · Endet jede Vollmacht? Eine ohne Ablauf verlaengert sich durch
 *       Vergessen.
 *
 *   3 · Ist jede kleiner als die Rolle, die sie erteilt? Wer mehr kann als
 *       sein Auftraggeber, handelt fuer niemanden.
 *
 *   4 · Entsteht bei jeder Handlung eine vollstaendige Pruefspur?
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  AGENTEN,
  KEINE_AGENTEN,
  VOLLMACHT_MAX_TAGE,
  fehltAnVollmacht,
  handeln,
  spurTraegt,
} from "../lib/vollmacht.ts"
import { NIEMALS_AUTOMATISCH, WIRKUNGEN } from "../lib/ereignis.ts"
import { ROLLEN_KEYS } from "../lib/rollen.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const quelle = ohneKommentare(readFileSync(path.join(ROOT, "lib", "vollmacht.ts"), "utf8"))

/* ═══ 1 · Jede hinterlegte Vollmacht traegt ══════════════════════════════ */

for (const v of AGENTEN) {
  const m = fehltAnVollmacht(v)
  if (m.length > 0) {
    fehler.push(`Die Vollmacht fuer „${v.agent}" traegt nicht: ${m.map((x) => x.satz).join(" ")}`)
  }
}

/* ═══ 2 · Die G26-Grenze gilt auch fuer Agenten ══════════════════════════ */

/*
 * Die Pruefung faehrt die Verbotsliste selbst: Fuer jede verbotene Handlung
 * wird eine Vollmacht gebaut, die ALLES darf — und sie muss trotzdem
 * scheitern. Waere es anders, koennte eine grosszuegige Vollmacht die
 * Grenze aufheben.
 */
const allmacht = {
  agent: "probe",
  imNamenVon: "owner",
  erteiltVon: "Pruefung",
  erteiltAm: "2026-09-01",
  gueltigBis: "2026-11-01",
  ereignisse: ["offer.accepted"],
  wirkungen: [...WIRKUNGEN],
}
for (const n of NIEMALS_AUTOMATISCH) {
  const h = handeln({
    vollmacht: allmacht,
    ereignis: "offer.accepted",
    wirkung: "notieren",
    was: `Automatisch ${n.was}`,
    an: "vorgang-1",
    heute: new Date("2026-09-15"),
  })
  if (h.erlaubt) {
    fehler.push(
      `Eine Vollmacht kann „${n.was}" ausfuehren — das darf nie automatisch geschehen (${n.gate}). ` +
        "Eine Vollmacht erweitert die Grenze nicht.",
    )
  }
}

/* ═══ 3 · Jede Vollmacht endet, und nicht zu spaet ═══════════════════════ */

const ohneEnde = fehltAnVollmacht({ ...allmacht, gueltigBis: "" })
if (!ohneEnde.some((m) => /ohne Ablauf/.test(m.satz))) {
  fehler.push("Eine Vollmacht ohne Ende wird nicht beanstandet.")
}
const zuLang = fehltAnVollmacht({ ...allmacht, gueltigBis: "2027-09-01" })
if (!zuLang.some((m) => new RegExp(String(VOLLMACHT_MAX_TAGE)).test(m.satz))) {
  fehler.push(`Eine Vollmacht ueber mehr als ${VOLLMACHT_MAX_TAGE} Tage wird nicht beanstandet.`)
}
if (!/VOLLMACHT_MAX_TAGE/.test(quelle)) {
  fehler.push("Es gibt keine Hoechstdauer im Modul.")
}

/* ═══ 4 · Der Widerruf wirkt sofort ══════════════════════════════════════ */

const widerrufen = fehltAnVollmacht({ ...allmacht, widerrufenAm: "2026-09-10" }, new Date("2026-09-15"))
if (!widerrufen.some((m) => /widerrufen/i.test(m.satz))) {
  fehler.push("Ein Widerruf wird nicht beachtet. Er wirkt sofort, nicht zum naechsten Lauf.")
}

/* ═══ 5 · Ohne Spur keine Handlung ═══════════════════════════════════════ */

const ohneSpur = handeln({
  vollmacht: allmacht,
  ereignis: "offer.accepted",
  wirkung: "notieren",
  was: "kurz",
  an: "x",
  heute: new Date("2026-09-15"),
})
if (ohneSpur.erlaubt) {
  fehler.push("Eine Handlung ohne belastbare Spur ist erlaubt. Die Spur ist die Bedingung, kein Protokoll daneben.")
}
if (!spurTraegt({
  agent: "a",
  imNamenVon: "owner",
  wirkung: "notieren",
  was: "In die Chronik geschrieben",
  wegen: "offer.accepted",
  an: "x",
  wann: "2026-09-15T10:00:00.000Z",
})) {
  fehler.push("Eine vollstaendige Spur wird nicht anerkannt.")
}

/* ═══ 6 · Der Agent handelt im Namen einer echten Rolle ══════════════════ */

if (!fehltAnVollmacht({ ...allmacht, imNamenVon: "erfunden" }).some((m) => /Rolle/.test(m.feld))) {
  fehler.push("Eine erfundene Rolle wird nicht beanstandet.")
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

console.log(
  `\nVollmacht-Gate — ${AGENTEN.length} Agent(en), hoechstens ${VOLLMACHT_MAX_TAGE} Tage je Vollmacht, ` +
    `${ROLLEN_KEYS.length} Rollen, ${NIEMALS_AUTOMATISCH.length} Handlungen auch mit Vollmacht verboten`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — keine Vollmacht ueberschreitet die G26-Grenze, jede endet, ohne Spur geschieht nichts.")
if (AGENTEN.length === 0) console.log(KEINE_AGENTEN)
