#!/usr/bin/env node
/**
 * DAS GATE FUER DIE ANGEBOTSARCHITEKTUR UND DIE HAUPTNAVIGATION (G01)
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * Gate 01 hat drei Dinge entschieden, die alle drei leise verfallen koennen:
 *
 *   1. Jede der fuenf Ebenen hat einen benannten Einstieg (WEB-0004).
 *      Kommt eine sechste Ebene dazu und niemand traegt ihren Einstieg nach,
 *      steht auf `/leistungen` wieder eine Kategorie ohne Ziel — genau der
 *      Zustand, den das Audit als Befund notiert hat.
 *
 *   2. Kein Betrag wird zweimal getippt (WEB-0024).
 *      Die Betraege in `lib/einstiege.ts` MUESSEN aus `packages` und
 *      `retainer` stammen. Eine Zahl, die man an zwei Stellen pflegen muss,
 *      ist eine Zahl, die irgendwann an einer Stelle falsch ist.
 *
 *   3. Aus dem Hauptmenue genommene Rubriken haben einen Grund (WEB-0005,
 *      WEB-0018) — und bleiben in der Fusszeile erreichbar. Eine Route, die
 *      nirgends mehr verlinkt ist, ist geloescht, nicht zurueckgestuft.
 *
 * Keine dieser Regeln haelt ein Kommentar. Deshalb prueft sie hier eine
 * Maschine.
 *
 * ---------------------------------------------------------------------------
 * WAS AUSDRUECKLICH NICHT GEPRUEFT WIRD
 * Ob ein Einstieg gut formuliert ist, ob der Preis richtig ist, ob die Ebene
 * verkauft. Das sind Urteile. Geprueft wird nur, was nachweisbar ist:
 * Vollstaendigkeit, Herkunft der Zahlen, Erreichbarkeit der Ziele.
 *
 * Aufruf: `node --import ./scripts/lib/alias-hook.mjs scripts/check-einstiege.mjs`
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { serviceLayers, packages, retainer, productWorks } from "@/lib/site-data"
import { publishedServicePages } from "@/lib/service-pages"
import { publishedInsights } from "@/lib/insights"
import { ebenenEinstiege, ebenenOhneBetrag, ebenenOhneBeleg } from "@/lib/einstiege"
import { hauptNavLinks, navAusnahmen, INSIGHTS_NAV_SCHWELLE } from "@/lib/navigation"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const probleme = []

/* ── 1 · Jede Ebene genau einmal ────────────────────────────────────────── */
for (const layer of serviceLayers) {
  const treffer = ebenenEinstiege.filter((e) => e.layer === layer.key)
  if (treffer.length === 0) {
    probleme.push(
      `Ebene „${layer.key}" (${layer.level}) hat keinen Einstieg. Eine Ebene ohne ` +
        `Einstieg ist eine Kategorie — das war WEB-0004.`,
    )
  } else if (treffer.length > 1) {
    probleme.push(`Ebene „${layer.key}" hat ${treffer.length} Einstiege. Erlaubt ist genau einer.`)
  }
}
for (const e of ebenenEinstiege) {
  if (!serviceLayers.some((l) => l.key === e.layer)) {
    probleme.push(`Einstieg fuer „${e.layer}" zeigt auf eine Ebene, die es nicht gibt.`)
  }
}

/* ── 2 · Art und Betrag muessen zueinander passen ───────────────────────── */
for (const e of ebenenEinstiege) {
  if ((e.art === "festpreis" || e.art === "monatlich") && e.betrag === null) {
    probleme.push(
      `„${e.layer}" ist als ${e.art} ausgewiesen, traegt aber keinen Betrag. ` +
        `Ein Festpreis ohne Zahl ist ein Versprechen ohne Inhalt.`,
    )
  }
  if (e.art === "nach-analyse" && e.betrag !== null) {
    probleme.push(
      `„${e.layer}" sagt „Angebot nach Analyse" und nennt trotzdem ${e.betrag}. ` +
        `Eins von beidem stimmt nicht.`,
    )
  }
}

/* ── 3 · Jeder Betrag stammt aus site-data ──────────────────────────────── */
const erlaubteBetraege = new Set(
  [...packages.map((p) => p.amount), retainer.amount].filter((x) => typeof x === "number"),
)
for (const e of ebenenEinstiege) {
  if (e.betrag !== null && !erlaubteBetraege.has(e.betrag)) {
    probleme.push(
      `„${e.layer}" nennt ${e.betrag} — dieser Betrag steht in keinem Paket und in ` +
        `keinem Retainer. Preise gehoeren nach lib/site-data.ts und nirgends sonst.`,
    )
  }
}

/* ── 4 · Bedingung nur, wo der Retainer haengt ──────────────────────────── */
for (const e of ebenenEinstiege) {
  if (e.bedingung && e.art !== "monatlich") {
    probleme.push(
      `„${e.layer}" traegt eine Bedingung, ist aber kein monatlicher Einstieg. ` +
        `Die einzige Bedingung im Bestand ist retainer.precondition.`,
    )
  }
}

/* ── 5 · Belege muessen belegen ─────────────────────────────────────────── */
for (const e of ebenenEinstiege) {
  if (e.belegHref === null) {
    if (e.belegArt !== null) probleme.push(`„${e.layer}": belegArt ohne belegHref.`)
    continue
  }
  if (e.belegArt === null) {
    probleme.push(`„${e.layer}": belegHref ohne belegArt — die Beschriftung waere geraten.`)
  }
  if (e.belegHref === e.einstiegHref) {
    probleme.push(
      `„${e.layer}": der Beleg zeigt auf denselben Ort wie der Einstieg. Ein Beleg, ` +
        `der auf das Angebot zeigt, ist kein Beleg.`,
    )
  }
  if (e.belegArt === "produkt") {
    const slug = e.belegHref.split("/").pop()
    if (!productWorks.some((w) => w.slug === slug)) {
      probleme.push(`„${e.layer}": Beleg „${slug}" ist kein Eintrag in productWorks.`)
    }
  }
}

/* ── 6 · Ziele muessen existieren ───────────────────────────────────────── */
const BEKANNTE_ROUTEN = new Set([
  "/", "/leistungen", "/produkte", "/arbeiten", "/unternehmen", "/systeme", "/betrieb",
  "/betriebscheck", "/insights", "/termin", "/kontakt", "/karriere", "/branchen/handwerk",
  "/impressum", "/datenschutz", "/barrierefreiheit",
])
for (const page of publishedServicePages) BEKANNTE_ROUTEN.add(`/leistungen/${page.slug}`)
for (const work of productWorks) BEKANNTE_ROUTEN.add(`/produkte/${work.slug}`)

for (const e of ebenenEinstiege) {
  for (const [feld, href] of [["einstiegHref", e.einstiegHref], ["belegHref", e.belegHref]]) {
    if (!href) continue
    const pfad = href.split("?")[0].split("#")[0]
    if (!BEKANNTE_ROUTEN.has(pfad)) {
      probleme.push(`„${e.layer}".${feld} zeigt auf „${pfad}" — diese Route gibt es nicht.`)
    }
  }
}

/* ── 7 · Jede Ausnahme aus dem Hauptmenue hat einen Befund ──────────────── */
const MATRIX = path.join(ROOT, "docs", "website-2", "acceptance-matrix.md")
const matrixText = fs.existsSync(MATRIX) ? fs.readFileSync(MATRIX, "utf8") : ""
for (const a of navAusnahmen) {
  if (!a.befund || !/^WEB-\d{4}$/.test(a.befund)) {
    probleme.push(`Nav-Ausnahme fuer „${a.href}" ohne gueltige Befund-ID.`)
    continue
  }
  if (matrixText && !matrixText.includes(a.befund)) {
    probleme.push(
      `Nav-Ausnahme fuer „${a.href}" beruft sich auf ${a.befund} — dieser Befund steht ` +
        `nicht in der Acceptance-Matrix.`,
    )
  }
}

/* ── 8 · Zurueckgestuft heisst erreichbar, nicht geloescht ──────────────── */
const FOOTER = path.join(ROOT, "components", "site-footer.tsx")
const footerText = fs.existsSync(FOOTER) ? fs.readFileSync(FOOTER, "utf8") : ""
const ausgeschlossen = navAusnahmen.filter((a) => !hauptNavLinks.some((l) => l.href === a.href))
for (const a of ausgeschlossen) {
  /*
   * Die Fusszeile rendert `navLinks` als Schleife, nennt die Pfade also nicht
   * woertlich. Geprueft wird deshalb, dass sie ueberhaupt aus derselben
   * Quelle liest — sonst waere eine zurueckgestufte Rubrik nirgends mehr
   * verlinkt, und das waere eine Loeschung mit anderem Namen.
   */
  if (!footerText.includes("navLinks")) {
    probleme.push(
      `„${a.href}" ist aus dem Hauptmenue genommen, aber die Fusszeile liest nicht mehr ` +
        `navLinks — die Rubrik waere damit nirgends mehr verlinkt.`,
    )
    break
  }
}

/* ── 9 · Die Insights-Schwelle muss zur Lage passen ─────────────────────── */
const insightsImMenue = hauptNavLinks.some((l) => l.href === "/insights")
if (insightsImMenue && publishedInsights.length < INSIGHTS_NAV_SCHWELLE) {
  probleme.push(
    `/insights steht im Hauptmenue, obwohl nur ${publishedInsights.length} Beitrag/Beitraege ` +
      `veroeffentlicht sind (Schwelle ${INSIGHTS_NAV_SCHWELLE}) — das war WEB-0018.`,
  )
}
if (!insightsImMenue && publishedInsights.length >= INSIGHTS_NAV_SCHWELLE) {
  probleme.push(
    `/insights traegt ${publishedInsights.length} Beitraege und gehoert damit zurueck ins ` +
      `Hauptmenue. Die Schwelle ist erreicht.`,
  )
}

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
console.log(
  `\nEinstiegs-Gate — ${ebenenEinstiege.length} Ebenen mit Einstieg · ` +
    `${ebenenEinstiege.length - ebenenOhneBetrag.length} mit Betrag · ` +
    `${ebenenEinstiege.length - ebenenOhneBeleg.length} mit Beleg · ` +
    `${hauptNavLinks.length} von ${hauptNavLinks.length + ausgeschlossen.length} Rubriken im Hauptmenue`,
)

if (probleme.length > 0) {
  console.error("\nEinstiegs-Gate: die Angebotsarchitektur ist nicht mehr geschlossen.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nEine Ebene ohne Einstieg ist eine Kategorie, und eine Kategorie verkauft nichts.\n" +
      "Genau davor soll dieses Gate schuetzen.\n",
  )
  process.exit(1)
}

if (ebenenOhneBetrag.length > 0) {
  console.log(
    `Owner-Punkt (OD-6): ${ebenenOhneBetrag.length} Ebene(n) ohne bestaetigten Betrag — ` +
      `${ebenenOhneBetrag.join(", ")}. Sie zeigen „Angebot nach Analyse". Das ist wahr,\n` +
      `aber es ist kein Preis. Eine Zahl kommt vom Owner oder gar nicht.`,
  )
}
if (ebenenOhneBeleg.length > 0) {
  console.log(
    `Offen (WEB-0001, Gate 02): ${ebenenOhneBeleg.length} Ebene(n) ohne zeigbaren Beleg — ` +
      `${ebenenOhneBeleg.join(", ")}.`,
  )
}

console.log("OK — jede Ebene hat einen Einstieg, jeder Betrag stammt aus site-data.\n")
