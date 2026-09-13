#!/usr/bin/env node
/**
 * SPRACH-DRILL — die Sprachweiche an echten Anfragen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DAS EIN DRILL IST UND KEIN GATE
 *
 * Ein Gate liest Quelltext. Diese Entscheidung faellt aber nicht im
 * Quelltext, sondern in der Middleware an einer echten Anfrage mit echten
 * Koepfen — und genau dort entstehen die Fehler, die man nicht sieht:
 * Endlosschleifen, eine ueberstimmte Nutzerwahl, ein Crawler, der auf eine
 * Umleitung laeuft.
 *
 * Deshalb startet dieser Drill den gebauten Server und STELLT ANFRAGEN.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE VIER SAETZE, DIE HIER GEPRUEFT WERDEN
 *
 *   1 · Die Wahl eines Menschen schlaegt jede Erkennung.
 *   2 · Eine ausdrueckliche Adresse (/ar, /tr, /en) wird nie umgeleitet.
 *   3 · Ohne Browsersprache wird nicht geraten.
 *   4 · Keine Umleitung zeigt auf sich selbst.
 *
 * Faellt einer davon, ist die Sprachweiche kaputt — unabhaengig davon, wie
 * huebsch die Laenderliste aussieht.
 */
import { spawn } from "node:child_process"

const PORT = Number(process.env.SPRACH_PORT ?? 4431)
const BASE = `http://127.0.0.1:${PORT}`

/** land, browsersprache, pfad, keks → erwartetes Ziel (null = keine Umleitung) */
const FAELLE = [
  /* ---- Der deutschsprachige Markt ------------------------------------- */
  ["Deutschland", "DE", "de-DE,de;q=0.9", "/", null, null],
  ["Oesterreich", "AT", "de-AT,de;q=0.9", "/", null, null],
  ["Liechtenstein", "LI", "de;q=0.9", "/", null, null],

  /* ---- Arabischsprachige Maerkte --------------------------------------- */
  ["Saudi-Arabien", "SA", "ar-SA,ar;q=0.9", "/", null, "/ar"],
  ["VAE", "AE", "ar,en;q=0.8", "/", null, "/ar"],
  ["Aegypten", "EG", "ar;q=0.9", "/", null, "/ar"],

  /* ---- Tuerkei ---------------------------------------------------------- */
  ["Tuerkei", "TR", "tr-TR,tr;q=0.9", "/", null, "/tr"],

  /* ---- Uebrige Welt ----------------------------------------------------- */
  ["USA", "US", "en-US,en;q=0.9", "/", null, "/en"],
  ["Japan", "JP", "ja-JP,ja;q=0.9", "/", null, "/en"],
  ["Frankreich", "FR", "fr-FR,fr;q=0.9", "/", null, "/en"],

  /* ---- Die Schweiz ist kein deutschsprachiges Land ---------------------- */
  ["Schweiz, deutscher Browser", "CH", "de-CH,de;q=0.9", "/", null, null],
  ["Schweiz, franzoesischer Browser", "CH", "fr-CH,fr;q=0.9", "/", null, "/en"],
  ["Schweiz, italienischer Browser", "CH", "it-CH,it;q=0.9", "/", null, "/en"],

  /* ---- Turksprachig ist nicht tuerkisch --------------------------------- */
  ["Aserbaidschan", "AZ", "az-AZ,az;q=0.9", "/", null, "/en"],
  ["Kasachstan", "KZ", "kk-KZ,kk;q=0.9", "/", null, "/en"],
  ["Usbekistan, tuerkischer Browser", "UZ", "tr;q=0.9", "/", null, "/tr"],

  /* ---- Die Browsersprache schlaegt die Herkunft ------------------------- */
  ["Deutscher in Dubai", "AE", "de-DE,de;q=0.9", "/", null, null],
  ["Tuerke in Frankfurt", "DE", "tr-TR,tr;q=0.9", "/", null, "/tr"],

  /* ---- Die Wahl des Menschen schlaegt alles ----------------------------- */
  ["Saudi waehlt Englisch", "SA", "ar-SA,ar;q=0.9", "/", "en", "/en"],
  ["Saudi waehlt Deutsch", "SA", "ar-SA,ar;q=0.9", "/", "de", null],
  ["US-Besucher waehlt Arabisch", "US", "en-US,en;q=0.9", "/", "ar", "/ar"],

  /* ---- Eine ausdrueckliche Adresse ist eine ausdrueckliche Absicht ------ */
  ["Deutschland oeffnet /ar", "DE", "de-DE,de;q=0.9", "/ar", null, null],
  ["Saudi-Arabien oeffnet /tr", "SA", "ar-SA,ar;q=0.9", "/tr", null, null],
  ["USA oeffnet /ar/kontakt", "US", "en-US,en;q=0.9", "/ar/kontakt", null, null],

  /* ---- Ohne Browsersprache wird nicht geraten --------------------------- */
  ["Werkzeug ohne Accept-Language", "SA", null, "/", null, null],

  /* ---- Tiefe Pfade ------------------------------------------------------ */
  ["Saudi-Arabien oeffnet /kontakt", "SA", "ar-SA,ar;q=0.9", "/kontakt", null, "/ar/kontakt"],
  ["USA oeffnet /leistungen", "US", "en-US,en;q=0.9", "/leistungen", null, "/en/leistungen"],
]

async function warte(ms = 60_000) {
  const ende = Date.now() + ms
  while (Date.now() < ende) {
    try {
      const r = await fetch(`${BASE}/`, { headers: { "accept-language": "de" } })
      if (r.status < 500) return
    } catch {}
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error("Server kam nicht hoch")
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore" })
const probleme = []
let geprueft = 0

try {
  await warte()

  for (const [name, land, sprache, pfad, keks, erwartet] of FAELLE) {
    const headers = { "x-vercel-ip-country": land }
    if (sprache) headers["accept-language"] = sprache
    if (keks) headers["cookie"] = `creadig-locale=${keks}`

    const res = await fetch(`${BASE}${pfad}`, { headers, redirect: "manual" })
    geprueft++

    const ort = res.headers.get("location")
    const ziel = ort ? new URL(ort, BASE).pathname : null

    if (erwartet === null && ziel !== null) {
      probleme.push(`${name}: umgeleitet nach ${ziel}, erwartet war keine Umleitung`)
    } else if (erwartet !== null && ziel !== erwartet) {
      probleme.push(`${name}: ${ziel ?? "keine Umleitung"}, erwartet ${erwartet}`)
    }

    /* Satz 4: Keine Umleitung zeigt auf sich selbst. */
    if (ziel === pfad) probleme.push(`${name}: Umleitung auf sich selbst (${pfad})`)

    /* Und keine Umleitung fuehrt auf eine zweite Umleitung. */
    if (ziel) {
      const zweite = await fetch(`${BASE}${ziel}`, { headers, redirect: "manual" })
      const weiter = zweite.headers.get("location")
      if (weiter) probleme.push(`${name}: ${ziel} leitet erneut weiter auf ${weiter} — Schleifengefahr`)
    }
  }
} finally {
  server.kill()
}

console.log(`\nSprach-Drill — ${geprueft} Anfragen mit echten Koepfen`)

if (probleme.length > 0) {
  console.error("\nSprach-Drill: die Weiche entscheidet anders als angekuendigt.\n")
  for (const p of probleme) console.error(`  · ${p}`)
  console.error(
    "\nEine Sprachumleitung, die die Wahl eines Menschen ueberstimmt oder im Kreis\n" +
      "fuehrt, ist schlimmer als gar keine.\n",
  )
  process.exit(1)
}

console.log(
  "OK — die Wahl des Menschen schlaegt die Erkennung, eine ausdrueckliche Adresse\n" +
    "wird nie umgeleitet, ohne Browsersprache wird nicht geraten, und keine\n" +
    "Umleitung fuehrt auf eine zweite.\n",
)
