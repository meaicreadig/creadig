#!/usr/bin/env node
/**
 * G25 · VERKAUFS-GATE — nichts wird verkauft, was die Schwelle nicht nimmt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI FRAGEN
 *
 *   1 · Steht irgendwo ein Produkt zum Verkauf, das die Schwelle nicht
 *       nimmt? Das ist die eigentliche Sicherung: Die Schwelle nuetzt
 *       nichts, wenn sie niemand fragt.
 *
 *   2 · Wird die Musterschwelle zweimal gefuehrt? `MUSTER_AB` gehoert G16.
 *       Eine zweite Zahl fuer dieselbe Regel laeuft auseinander.
 *
 *   3 · Traegt jeder Kandidat sein Muster — oder steht dort eine Idee mit
 *       einem Namen?
 *
 * WAS ES NICHT ABBRICHT: dass heute nichts verkaeuflich ist. Das ist keine
 * Panne, sondern das Ergebnis von sechs Bedingungen, von denen zwei beim
 * Owner liegen (Reifegrad, Steuerstatus). Es steht in der Ausgabe.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  KANDIDATEN,
  VERKAUFSLAGEN,
  VERKAUFSREIFE_AB,
  huerden,
  kandidatenlage,
  verkaeuflicheProdukte,
} from "../lib/verkauf.ts"
import { MUSTER_AB } from "../lib/verlust.ts"
import { OFFER_KINDS } from "../lib/offer-readiness.ts"
import { productWorks } from "../lib/site-data.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []
const offen = []

/* ═══ 1 · Nichts steht zum Verkauf, das die Schwelle nicht nimmt ═════════ */

for (const lage of VERKAUFSLAGEN) {
  const h = huerden(lage.slug)
  if (h.length > 0) {
    fehler.push(
      `${lage.slug} hat eine Verkaufslage, nimmt die Schwelle aber nicht: ` +
        h.map((x) => x.bedingung).join(", ") + ".",
    )
  }
}

/*
 * Und die andere Richtung, die man leichter vergisst: Steht ein Produkt als
 * ANGEBOTSART im Katalog (G17), obwohl es nicht verkaeuflich ist? Dann
 * koennte es in ein Angebot, und die Schwelle waere Dekoration.
 */
const verkaeuflich = new Set(verkaeuflicheProdukte())
for (const w of productWorks) {
  if (OFFER_KINDS.includes(w.slug) && !verkaeuflich.has(w.slug)) {
    fehler.push(
      `„${w.name}" steht in OFFER_KINDS, nimmt die Verkaufsschwelle aber nicht. ` +
        "Damit koennte es in ein Angebot — und die Schwelle waere Dekoration.",
    )
  }
}

/* ═══ 2 · Die Musterschwelle steht nur an einer Stelle ═══════════════════ */

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const verkauf = ohneKommentare(readFileSync(path.join(ROOT, "lib", "verkauf.ts"), "utf8"))
if (/(export\s+)?const\s+MUSTER_AB\s*=/.test(verkauf)) {
  fehler.push(
    "`lib/verkauf.ts` erklaert `MUSTER_AB` selbst. Die Schwelle gehoert G16 — " +
      "zwei Zahlen fuer dieselbe Regel laufen auseinander.",
  )
}
if (!/from\s+["']@\/lib\/verlust["']/.test(readFileSync(path.join(ROOT, "lib", "verkauf.ts"), "utf8"))) {
  fehler.push("`lib/verkauf.ts` importiert die Musterschwelle nicht aus G16.")
}

/* ═══ 3 · Jeder Kandidat traegt sein Muster ══════════════════════════════ */

for (const k of KANDIDATEN) {
  const l = kandidatenlage(k)
  if (!l.muster) {
    offen.push(`${k.key}: ${l.fehlt.join(" ")}`)
  }
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const alle = productWorks.map((w) => ({ slug: w.slug, name: w.name, h: huerden(w.slug) }))

console.log(
  `\nVerkaufs-Gate — ${productWorks.length} Produkt(e), ${verkaeuflich.size} verkaeuflich, ` +
    `${KANDIDATEN.length} Kandidat(en), Muster ab ${MUSTER_AB} Beobachtungen bei mind. 2 Betrieben`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  `OK — nichts steht zum Verkauf, das die Schwelle nicht nimmt; die Musterschwelle steht nur in G16.`,
)

if (verkaeuflich.size === 0) {
  /*
   * Der Satz steht bewusst bei jedem Build da. Sechs Bedingungen, und die
   * beiden haeufigsten Huerden gehoeren dem Owner — ein Gate, das das
   * ausspricht, ist schwerer zu vergessen als eine Liste.
   */
  const zaehler = new Map()
  for (const a of alle) for (const x of a.h) zaehler.set(x.bedingung, (zaehler.get(x.bedingung) ?? 0) + 1)
  console.log(
    `Kein Produkt ist heute verkaeuflich. Haeufigste Huerden: ` +
      [...zaehler.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n}×)`).join(" · "),
  )
  console.log(
    `Verkaeuflich ist ab Reifegrad ${VERKAUFSREIFE_AB.join(" / ")} — plus Preisquelle, Steuerlage und Betrieb danach.`,
  )
}
for (const o of offen) console.log(`  · Kandidat ohne Muster — ${o}`)
