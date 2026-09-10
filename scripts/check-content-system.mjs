#!/usr/bin/env node
/**
 * DAS CONTENT-GATE (G03)
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * Gate 03 hat eine einzige Hauptregel durchgesetzt:
 *
 *   EIN GEDANKE — EIN PRIMARY HOME.
 *
 * Andere Seiten duerfen einen Gedanken kurz referenzieren. Sie duerfen ihn
 * nicht noch einmal vollstaendig erklaeren.
 *
 * Diese Regel verfaellt leiser als jede andere in diesem Repository. Niemand
 * fuegt absichtlich eine Dublette ein; sie entsteht, weil eine Komponente
 * bequem eine gemeinsame Quelle rendert und niemand nachzaehlt, auf wie
 * vielen Seiten das Ergebnis landet. Genau so ist der Zustand entstanden, den
 * Gate 03 vorgefunden hat: Fuenf tragende Saetze der Ebene Digital standen
 * wortgleich auf fuenf Routen, und drei Leistungsseiten glichen einander zu
 * 25–30 Prozent.
 *
 * Deshalb zaehlt hier eine Maschine — am GEBAUTEN HTML, nicht am Quelltext.
 * Damit ist egal, ueber welchen Weg ein Satz auf eine Seite kommt.
 *
 * ---------------------------------------------------------------------------
 * WAS AUSDRUECKLICH NICHT GEPRUEFT WIRD
 * Keine Wortzahl als harte Grenze. Keine Seitenhoehe. Kein Stilurteil. Eine
 * lange Seite kann richtig sein (ein Artikel ist zum Lesen da), und eine
 * kurze kann falsch sein. Geprueft wird nur, was nachweisbar ist:
 * Wiederholung, Preisinvarianz und die Zusagen, die Gate 02 gesichert hat.
 *
 * Aufruf: `node scripts/check-content-system.mjs` (nach `next build`)
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, ".next", "server", "app")
const probleme = []
const hinweise = []

/* ── Die gebauten deutschen Seiten einlesen ─────────────────────────────── */
function htmlDateien(dir) {
  let e = []
  try { e = fs.readdirSync(dir, { withFileTypes: true }) } catch { return [] }
  const out = []
  for (const x of e) {
    const voll = path.join(dir, x.name)
    if (x.isDirectory()) out.push(...htmlDateien(voll))
    else if (x.name.endsWith(".html")) out.push(voll)
  }
  return out
}
const alle = htmlDateien(APP_DIR)
if (alle.length === 0) {
  console.log("\nContent-Gate: kein gebautes HTML gefunden — dieses Gate gehoert hinter `next build`.\n")
  process.exit(0)
}
/* Nur der deutsche Baum: die Uebersetzungen wiederholen dieselbe Struktur,
   und ein Befund dort waere derselbe Befund doppelt gezaehlt. */
const deutsch = alle.filter((d) => {
  const rel = path.relative(APP_DIR, d)
  return !/^(tr|en|ar)[\\/]/.test(rel)
})

function textVon(datei) {
  let h = fs.readFileSync(datei, "utf8")
  const i = h.indexOf("<main")
  const j = h.indexOf("</main>")
  if (i < 0 || j < i) return ""
  let b = h.slice(i, j)
  b = b.replace(/<script[\s\S]*?<\/script>/g, "")
  b = b.replace(/<(p|li|h[1-6]|div|section|figcaption|span)[^>]*>/g, "\n")
  b = b.replace(/<[^>]+>/g, " ")
  return b
}
function entities(t) {
  return t
    .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;|&#160;/g, " ")
    .replace(/&[a-zA-Z#0-9]+;/g, " ")
}
const seiten = new Map()
/*
 * ZWEI KORPORA, UND DER UNTERSCHIED IST EIN ECHTER FEHLER GEWESEN.
 *
 * `seiten` haelt nur Saetze ab acht Woertern — sinnvoll fuer die Dublettensuche,
 * weil kurze Beschriftungen naturgemaess auf vielen Seiten stehen.
 *
 * Der erste Entwurf hat damit AUCH geprueft, ob ein Preis oder das
 * Demodaten-Label noch vorkommt. Ergebnis: vier Fehlalarme. „Echte Oberflaeche,
 * Demodaten." hat drei Woerter, „3.900 EUR" eines — beide fielen durch den
 * Filter, und das Gate meldete, Gate 02 sei zerstoert worden. Es war nur
 * blind.
 *
 * Deshalb daneben der Volltext: Was VORHANDEN sein muss, wird dort geprueft.
 */
const volltext = new Map()
for (const d of deutsch) {
  const rel = "/" + path.relative(APP_DIR, d).replace(/\.html$/, "").replace(/\\/g, "/")
  const route = rel === "/index" ? "/" : rel
  const saetze = []
  for (const zeile of entities(textVon(d)).split("\n")) {
    const z = zeile.replace(/\s+/g, " ").trim()
    for (const s of z.split(/(?<=[.!?])\s+/)) {
      const t = s.trim()
      if (t.split(" ").length >= 8) saetze.push(t)
    }
  }
  if (saetze.length > 0) seiten.set(route, saetze)
  volltext.set(route, entities(textVon(d)).replace(/\s+/g, " "))
}

/* ── 1 · Kein tragender Satz auf zu vielen Routen ───────────────────────── */
/*
 * Die Schwelle ist bewusst nicht 2. Ein global wiederholter Satz ist nicht
 * automatisch falsch: Der Abschluss-Aufruf und die Einwilligungserklaerung
 * stehen absichtlich auf vielen Seiten, und sie in fuenfzehn Fassungen zu
 * zerlegen waere schlechter als sie zu wiederholen (dieselbe Regel wie in
 * `docs/website-2/gate-03-content-system.md`). Gemeldet wird, was DARUEBER
 * hinausgeht — eine inhaltliche Erklaerung, die sich ueber die Seiten
 * ausgebreitet hat.
 */
const AUSNAHMEN = [
  /Datenschutzerkl/i,          // Einwilligung, rechtlich vorgegeben
  /Einwilligung/i,
  /Standardvertragsklauseln/i,
  /widerrufen/i,
  /Wir sehen uns den Betrieb an/i,   // der eine Abschluss-Aufruf
  /Newsletter/i,
]
const zaehler = new Map()
for (const [route, saetze] of seiten) {
  for (const s of new Set(saetze)) {
    if (AUSNAHMEN.some((r) => r.test(s))) continue
    if (!zaehler.has(s)) zaehler.set(s, new Set())
    zaehler.get(s).add(route)
  }
}
const GRENZE = 6
for (const [s, routen] of zaehler) {
  if (routen.size >= GRENZE) {
    probleme.push(
      `Ein tragender Satz steht auf ${routen.size} Routen — das ist eine Erklaerung, die sich ` +
        `ausgebreitet hat, kein Verweis:\n      „${s.slice(0, 110)}…"\n      ${[...routen].sort().join(", ")}`,
    )
  }
}
const knapp = [...zaehler.entries()].filter(([, r]) => r.size === GRENZE - 1).length
if (knapp > 0) hinweise.push(`${knapp} Satz/Saetze stehen auf ${GRENZE - 1} Routen — dicht an der Grenze.`)

/* ── 2 · Leistungsdetailseiten duerfen einander nicht gleichen ──────────── */
function shingles(saetze, n = 5) {
  const w = saetze.join(" ").toLowerCase().replace(/[^\wäöüß ]/g, " ").split(/\s+/).filter(Boolean)
  const out = new Set()
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "))
  return out
}
const details = [...seiten.keys()].filter((r) => /^\/leistungen\/[^/]+$/.test(r))
const AEHNLICH_MAX = 0.18
let schlimmste = 0
for (let i = 0; i < details.length; i++) {
  for (let j = i + 1; j < details.length; j++) {
    const a = shingles(seiten.get(details[i])), b = shingles(seiten.get(details[j]))
    if (a.size === 0 || b.size === 0) continue
    let schnitt = 0
    for (const x of a) if (b.has(x)) schnitt++
    const jac = schnitt / (a.size + b.size - schnitt)
    schlimmste = Math.max(schlimmste, jac)
    if (jac > AEHNLICH_MAX) {
      probleme.push(
        `${details[i]} und ${details[j]} gleichen einander zu ${(jac * 100).toFixed(1)} % ` +
          `(5-Gramm). Ueber ${(AEHNLICH_MAX * 100).toFixed(0)} % ist es dieselbe Seite mit anderer H1.`,
      )
    }
  }
}

/* ── 3 · Preis-Invariante ───────────────────────────────────────────────── */
/*
 * Gate 03 darf Kontext, Bezeichnung und Ort eines Preises aendern — nie den
 * Betrag. Geprueft wird gegen die Werte, die `docs/website-2/pricing-inventory.md`
 * als oeffentlichen Bestand fuehrt.
 */
const PREISE = ["2.400", "3.900", "1.500", "149"]
const preisText = [...volltext.values()].join(" ")
for (const p of PREISE) {
  if (!preisText.includes(p)) {
    probleme.push(
      `Der oeffentliche Betrag ${p} EUR kommt im gebauten HTML nicht mehr vor. Gate 03 darf ` +
        `Preise einordnen, nicht entfernen.`,
    )
  }
}

/* ── 4 · Was Gate 02 gesichert hat, bleibt gesichert ────────────────────── */
const produktSeiten = ["/produkte/fibero", "/produkte/meai"]
for (const r of produktSeiten) {
  const t = volltext.get(r) ?? ""
  if (!/Demodaten/.test(t)) {
    probleme.push(`${r}: das Demodaten-Label fehlt — Gate 02 hat es dort verankert.`)
  }
}
for (const r of ["/produkte/cassamea", "/produkte/meahv"]) {
  const kandidat = deutsch.find((d) => d.endsWith(path.basename(r) + ".html"))
  if (!kandidat) continue
  const roh = fs.readFileSync(kandidat, "utf8")
  const bild = "/works/" + path.basename(r) + ".jpg"
  if (roh.includes(encodeURIComponent(bild)) || new RegExp(`<img[^>]*${bild}`).test(roh)) {
    probleme.push(
      `${r}: die von Gate 02 zurueckgehaltene Aufnahme ${bild} wird wieder als Bild gezeigt.`,
    )
  }
}

/* ── 5 · Managed Betrieb: keine Route verspricht mehr als eine andere ───── */
const betrieb = volltext.get("/betrieb") ?? ""
if (betrieb && !/n(ä|ae)chsten Werktag/i.test(betrieb)) {
  probleme.push("/betrieb nennt die menschliche Reaktionszeit nicht mehr: naechster Werktag.")
}
for (const [route, t] of volltext) {
  /* Eine 24/7-Zusage darf nirgends stehen — als Verneinung ist sie erlaubt. */
  const m = t.match(/.{0,60}24\/7.{0,60}/g) ?? []
  for (const stelle of m) {
    if (!/kein|nicht|ohne/i.test(stelle)) {
      probleme.push(`${route}: „24/7" ohne Verneinung — ${stelle.trim().slice(0, 100)}`)
    }
  }
}

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
console.log(
  `\nContent-Gate — ${seiten.size} deutsche Seiten · ` +
    `${[...zaehler.values()].filter((r) => r.size >= 2).length} Saetze auf mehr als einer Route · ` +
    `Detailseiten-Aehnlichkeit max. ${(schlimmste * 100).toFixed(1)} %`,
)
for (const h of hinweise) console.log(`  ${h}`)

if (probleme.length > 0) {
  console.error("\nContent-Gate: ein Gedanke hat mehr als ein Zuhause.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nEine Erklaerung, die auf jeder Seite steht, wird nicht deutlicher — sie wird zur\n" +
      "Tapete. Genau davor soll dieses Gate schuetzen.\n",
  )
  process.exit(1)
}

console.log("OK — kein Gedanke mit zweitem Zuhause, kein Betrag verschoben, Gate-02-Belege intakt.\n")
