#!/usr/bin/env node
/**
 * G35 · JURISDIKTIONS-GATE
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI FRAGEN
 *
 *   1 · Erklaert das Modul irgendwo selbst eine Rechtslage? Es darf nicht.
 *       Umsatzsteuer, Reverse Charge, anwendbares Recht, Gerichtsstand sind
 *       Feststellungen von Fachleuten — Grundregel 1, und `offers.md` fuehrt
 *       Rechtsberatung auf der Verbotsliste.
 *
 *   2 · Wird die Steuerfrage ZWEITGEFUEHRT? Sie gehoert G18. Zwei Fassungen
 *       derselben Rechtsfrage sind in vier Wochen zwei verschiedene.
 *
 *   3 · Sagt das System Nein, solange nichts geklaert ist? Der Unterschied
 *       zwischen „wir liefern dort nicht" und „wir haben es nie geklaert"
 *       ist der ganze Punkt.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  HALB_DA,
  MAERKTE,
  MARKTLAGEN,
  PUNKTE,
  darfVerkaufenIn,
  geklaerteMaerkte,
  klaerungTraegt,
  luecken,
} from "../lib/jurisdiktion.ts"
import { clientWorks, productWorks } from "../lib/site-data.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const roh = readFileSync(path.join(ROOT, "lib", "jurisdiktion.ts"), "utf8")
const quelle = ohneKommentare(roh)

/* ═══ 1 · Keine erfundene Rechtsauskunft ═════════════════════════════════ */

/*
 * Ein `gilt`-Satz ist eine Rechtsaussage. Er darf nur dastehen, wenn ein
 * Mensch ihn festgestellt hat — genau das prueft `klaerungTraegt()`, und
 * hier wird geprueft, dass keine Klaerung an dieser Regel vorbeikommt.
 */
for (const lage of MARKTLAGEN) {
  for (const punkt of PUNKTE) {
    const k = lage.klaerungen[punkt]
    if (k.gilt && !klaerungTraegt(k)) {
      fehler.push(
        `${lage.markt}/${punkt}: Es steht ein Satz da, aber ohne Wer, Wann oder Fundstelle. ` +
          "Eine Meinung ueber Recht ist gefaehrlicher als gar keine.",
      )
    }
  }
}
/* Und das Modul selbst darf keine Rechtsbegriffe als Tatsache behaupten. */
for (const begriff of ["reverse charge", "steuerfrei", "umsatzsteuerbefreit", "nicht steuerbar"]) {
  if (new RegExp(begriff, "i").test(quelle)) {
    fehler.push(
      `\`lib/jurisdiktion.ts\` behauptet „${begriff}". Das ist eine Feststellung, die ein ` +
        "Steuerberater trifft — nicht ein Modul (Grundregel 1).",
    )
  }
}

/* ═══ 2 · Die Steuerfrage wird nicht zweitgefuehrt ═══════════════════════ */

if (!/from\s+["']@\/lib\/rechnung["']/.test(roh)) {
  fehler.push("Die Steuerlage wird nicht aus G18 gelesen. Zwei Fassungen laufen auseinander.")
}
if (/\bsmallBusiness\b|\bvatId\b/.test(quelle)) {
  fehler.push(
    "`lib/jurisdiktion.ts` liest den Steuerstatus direkt aus den Impressumsdaten. " +
      "Er gehoert G18 — dort steht die Regel, hier nur die Folge.",
  )
}

/* ═══ 3 · Nein, solange nichts geklaert ist ══════════════════════════════ */

for (const m of MAERKTE) {
  const urteil = darfVerkaufenIn(m)
  const offen = luecken(m)
  if (offen.length > 0 && urteil.ja) {
    fehler.push(`In ${m} darf verkauft werden, obwohl ${offen.length} Punkt(e) offen sind.`)
  }
  if (offen.length === 0 && !urteil.ja) {
    fehler.push(`${m} ist geklaert, aber es darf nicht verkauft werden.`)
  }
}
if (darfVerkaufenIn("US").ja) fehler.push("Ein nicht gefuehrter Markt darf beliefert werden.")

/* ═══ 4 · Die Lage stimmt mit dem Bestand ueberein ═══════════════════════ */

const chProdukte = productWorks.filter((w) => /CH/.test(String(w.region ?? "")))
const chKunden = clientWorks.filter((w) => /CH/.test(String(w.region ?? "")))
if ((chProdukte.length > 0 || chKunden.length > 0) && !/halb da/i.test(HALB_DA)) {
  fehler.push("Es gibt CH-Bezug im Bestand, aber der Lagesatz benennt ihn nicht.")
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const geklaert = geklaerteMaerkte()
console.log(
  `\nJurisdiktions-Gate — ${MAERKTE.length} Maerkte, ${PUNKTE.length} Punkte je Markt, ` +
    `${geklaert.length} geklaert · CH-Bezug: ${chProdukte.length} Produkt(e), ${chKunden.length} Kunde(n)`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — keine erfundene Rechtsauskunft, die Steuerfrage bleibt bei G18, ungeklaert heisst nein.")
if (geklaert.length === 0) {
  console.log(`\n${HALB_DA}`)
  for (const m of MAERKTE) {
    console.log(`  ${m}: offen — ${luecken(m).map((l) => l.punkt).join(", ")}`)
  }
}
