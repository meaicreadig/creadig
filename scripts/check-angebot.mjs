#!/usr/bin/env node
/**
 * G17 · ANGEBOTS-GATE — was in Dateien entscheidbar ist.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI FRAGEN
 *
 *   1 · Deckt das Modell das Schema? `docs/sales/proposal-outline.md` fuehrt
 *       neun Abschnitte. Faellt einer aus dem Code, faellt er aus jedem
 *       Angebot — und niemand merkt es, weil das Dokument weiter neun
 *       aufzaehlt.
 *
 *   2 · Kann irgendwo eine Zahl getippt werden? Der Satz ueber allem lautet:
 *       „Jede Zahl im Angebot steht in offers.md oder ist vom Owner
 *       freigegeben." Ein Formularfeld fuer einen freien Betrag waere die
 *       Einladung, ihn zu behaupten.
 *
 *   3 · Kann ein Zustand frei gesetzt werden? Ein `updateOfferState(id,
 *       state)` waere derselbe Haken wie `approved: true` (G13) und
 *       `published: true` (G15) — und dieses Gate ist gegen genau den gebaut.
 *
 * Was NICHT hier steht: ob ein konkretes Angebot vollstaendig ist. Das
 * entscheidet `fehltFuer()` zur Laufzeit, an echten Daten, und
 * `angebot-drill` prueft die Regel selbst.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { ABSCHNITTE, ANGEBOT_ZUSTAENDE, KATALOG, KATALOG_LABEL } from "../lib/angebot.ts"
import { OFFER_KINDS } from "../lib/offer-readiness.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

/* ═══ 1 · Das Schema und das Modell zaehlen dasselbe ═════════════════════ */

const schema = readFileSync(path.join(ROOT, "docs", "sales", "proposal-outline.md"), "utf8")
const imSchema = [...schema.matchAll(/^### (\d{2}) · (.+)$/gm)].map((m) => ({ nummer: m[1], titel: m[2].trim() }))

if (imSchema.length !== ABSCHNITTE.length) {
  fehler.push(
    `Das Schema fuehrt ${imSchema.length} Abschnitte, das Modell ${ABSCHNITTE.length}. ` +
      "Ein Abschnitt, den nur das Dokument kennt, steht in keinem Angebot.",
  )
}
for (const s of imSchema) {
  if (!ABSCHNITTE.some((a) => a.nummer === s.nummer)) {
    fehler.push(`Abschnitt ${s.nummer} („${s.titel}") steht im Schema, aber nicht in lib/angebot.ts.`)
  }
}
for (const a of ABSCHNITTE) {
  if (!a.regel || a.regel.trim().length < 20) {
    fehler.push(`Abschnitt ${a.nummer} sagt nicht, was ihn entscheidet.`)
  }
}

/* ═══ 2 · Keine getippte Zahl ════════════════════════════════════════════ */

const mappe = ohneKommentare(readFileSync(path.join(ROOT, "components", "admin", "angebot-mappe.tsx"), "utf8"))
/*
 * Gesucht ist die WIRKUNG: ein Eingabefeld, aus dem ein Betrag wird. Ein
 * Zahlenfeld ohne Namen waere harmlos; eines, das `betrag` heisst, ist der
 * Weg an der Regel vorbei.
 */
if (/name=["'](betrag|preis|amount|summe)["']/i.test(mappe)) {
  fehler.push(
    "Die Angebotsmappe traegt ein Feld fuer einen freien Betrag. " +
      "Jede Zahl kommt aus dem Katalog oder aus einer Owner-Freigabe mit Fundstelle — " +
      "und die entsteht in einem Postfach, nicht in einem Formular.",
  )
}

const aktionen = ohneKommentare(readFileSync(path.join(ROOT, "app", "(admin)", "admin", "vertrieb", "actions.ts"), "utf8"))
if (!/if \(!\(quelle in KATALOG\)\) continue/.test(aktionen)) {
  fehler.push(
    "Die Aktion prueft die Position nicht gegen den Katalog. " +
      "Ein Schluessel aus einem manipulierten Formular kaeme sonst als Position hinein.",
  )
}

/* Jede Katalogposition hat einen Namen — sonst steht im Angebot ein Schluessel. */
for (const key of Object.keys(KATALOG)) {
  if (!KATALOG_LABEL[key]) fehler.push(`Die Katalogposition „${key}" hat keinen Namen.`)
}

/* ═══ 3 · Kein frei setzbarer Zustand ════════════════════════════════════ */

/**
 * NUR DER CODE, NICHT DIE PROSA.
 *
 * Der erste Lauf dieses Gates hat sich selbst gefangen: In `lib/vertrieb.ts`
 * steht der Kommentar „Es gibt bewusst KEIN `updateOfferState(id, state)`" —
 * und die Suche nach dem Wort fand ihn. Ein Waechter, der die BEGRUENDUNG
 * fuer eine Regel als Verstoss gegen sie meldet, prueft Zeichenketten, nicht
 * Verhalten.
 *
 * Dieselbe Klasse Fehler wie im Schwesterprojekt, wo ein `accept="audio/*"`
 * als Blockkommentar gelesen wurde und siebzig Zeilen verschluckte. Also:
 * Kommentare raus, dann suchen.
 */
function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .map((z) => z.replace(/\/\/.*$/, ""))
    .join("\n")
}

const vertrag = ohneKommentare(readFileSync(path.join(ROOT, "lib", "vertrieb.ts"), "utf8"))
/* Eine Signatur, kein Wort: Name, Klammer, und irgendwo dahinter ein Promise. */
if (/\b(updateOfferState|setOfferState|updateOfferStatus)\s*\([^)]*\)\s*:/.test(vertrag)) {
  fehler.push(
    "Der Speichervertrag kennt eine Methode, die den Angebotszustand frei setzt. " +
      "Damit waeren Senden und Annehmen wieder ein Haken.",
  )
}

const store = ohneKommentare(readFileSync(path.join(ROOT, "lib", "vertrieb-store-neon.ts"), "utf8"))
if (!/fehltFuer\(/.test(store)) {
  fehler.push(
    "Der Speicher prueft ein Angebot nicht mit `fehltFuer()`. " +
      "Dann gilt die Regel nur in der Oberflaeche — und jeder andere Weg an die Tabelle umgeht sie.",
  )
}

/*
 * Und die Datenbank muss dieselbe Aussage tragen. Eine Regel, die nur im
 * Anwendungscode steht, gilt nicht fuer den naechsten Import und nicht fuer
 * die naechste Konsole.
 */
const schemaDatei = readFileSync(path.join(ROOT, "lib", "neon-client.ts"), "utf8")
if (!/offers_acceptance_check/.test(schemaDatei)) {
  fehler.push("Der Tabelle `offers` fehlt der CHECK, der ein Ja ohne Annahme verhindert.")
}
for (const zustand of Object.keys(ANGEBOT_ZUSTAENDE)) {
  if (!new RegExp(`'${zustand}'`).test(schemaDatei)) {
    fehler.push(`Der Zustand „${zustand}" fehlt im CHECK der Tabelle — die Datenbank kennt ihn nicht.`)
  }
}
for (const kind of OFFER_KINDS) {
  if (!new RegExp(`'${kind}'`).test(schemaDatei)) {
    fehler.push(`Die Angebotsart „${kind}" fehlt im CHECK der Tabelle.`)
  }
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

console.log(
  `\nAngebots-Gate — ${ABSCHNITTE.length} Abschnitte (Schema: ${imSchema.length}), ` +
    `${Object.keys(KATALOG).length} Katalogpositionen, ${Object.keys(ANGEBOT_ZUSTAENDE).length} Zustaende`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  "OK — das Modell deckt das Schema, keine Zahl laesst sich tippen, kein Zustand frei setzen.",
)
console.log(
  "Ob ein einzelnes Angebot vollstaendig ist, entscheidet `fehltFuer()` an echten Daten: `npm run angebot-drill`.",
)
