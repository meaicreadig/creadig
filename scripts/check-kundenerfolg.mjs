#!/usr/bin/env node
/**
 * G22 · KUNDENERFOLGS-GATE
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE VIER FRAGEN
 *
 *   1 · Gibt es irgendwo einen VERLAENGERUNGSTERMIN? Es darf keinen geben:
 *       Das FAQ sagt oeffentlich monatlich kuendbar, ohne Mindestlaufzeit.
 *       Ein Termin waere ein Widerspruch zur Zusage — und eine Frist, die
 *       das Haus selbst erfunden hat.
 *
 *   2 · Wird Gesundheit zu einer ZAHL verrechnet? Kein Score, keine Ampel,
 *       kein Prozentwert. Eine Zahl laedt dazu ein, die Zahl zu verbessern.
 *
 *   3 · Erzeugt die Empfehlungs-Schleife selbst Kontakte? Sie darf nicht:
 *       Ein genannter Name ist das Personendatum eines Dritten, und dafuer
 *       gibt es G11.
 *
 *   4 · Wird die Musterschwelle wieder selbst erklaert statt importiert?
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { EMPFEHLUNG_QUELLE, KEINE_VERLAENGERUNG, STILLE_TAGE, gesundheit } from "../lib/kundenerfolg.ts"
import { CONTACT_SOURCES } from "../lib/contact-access.ts"
import { dictionary } from "../lib/dictionary.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const roh = readFileSync(path.join(ROOT, "lib", "kundenerfolg.ts"), "utf8")
const quelle = ohneKommentare(roh)

/* ═══ 1 · Kein Verlaengerungstermin ══════════════════════════════════════ */

/*
 * GESUCHT IST DAS SYMBOL, NICHT DAS WORT.
 *
 * Der erste Lauf hat `KEINE_VERLAENGERUNG` gemeldet — die Konstante, deren
 * TEXT erklaert, warum es keinen Termin gibt. Kommentare hatte ich entfernt,
 * Zeichenketten nicht. Ein Waechter, der die Begruendung einer Regel als
 * Verstoss gegen sie liest, prueft Zeichenketten.
 *
 * Dieselbe Klasse Fehler wie in G19 und G17 — jetzt zum dritten Mal, und
 * jedes Mal an derselben Stelle: Prosa ueber eine Regel ist kein Bruch der
 * Regel. Gesucht wird deshalb eine Verwendung: Name, gefolgt von Klammer,
 * Doppelpunkt oder Zuweisung.
 */
if (/\b(verlaengerungstermin|renewalDate|vertragsende|laufzeitEnde)\s*[(:=]/i.test(quelle)) {
  fehler.push(
    "Es gibt einen Verlaengerungstermin. Das FAQ sagt oeffentlich: monatlich kuendbar, " +
      "ohne Mindestlaufzeit — ein Termin waere ein Widerspruch zur Zusage.",
  )
}
/* Und die Zusage muss auf der Seite auch noch stehen. */
const faq = JSON.stringify(dictionary.de.faq)
if (!/monatlich k(ü|ue)ndbar/i.test(faq)) {
  fehler.push(
    "Die Zusage monatlich kuendbar steht nicht mehr im FAQ. Dann traegt die Entscheidung " +
      "gegen einen Verlaengerungstermin nichts mehr.",
  )
}
if (!/Mindestlaufzeit/i.test(KEINE_VERLAENGERUNG)) {
  fehler.push("Die Begruendung gegen den Verlaengerungstermin nennt die Zusage nicht mehr.")
}

/* ═══ 2 · Gesundheit ist keine Zahl ══════════════════════════════════════ */

if (/\bscore\b|punktzahl|prozent|ampel/i.test(quelle)) {
  fehler.push(
    "In `lib/kundenerfolg.ts` steht ein Score, eine Punktzahl oder eine Ampel. " +
      "Eine Gesundheit als Zahl laedt dazu ein, die Zahl zu verbessern statt den Betrieb.",
  )
}
/* Und die Lage darf keine Gesamtnote zurueckgeben. */
const probe = gesundheit(
  {
    anliegen: [],
    offeneForderungCent: 0,
    forderungUeberfaelligTage: 0,
    letzterKontakt: new Date().toISOString().slice(0, 10),
    uebergeben: true,
  },
  new Date().toISOString().slice(0, 7),
)
for (const verbotenesFeld of ["score", "note", "gesamt", "punkte", "prozent"]) {
  if (verbotenesFeld in probe) {
    fehler.push(`Die Gesundheitslage traegt ein Feld \`${verbotenesFeld}\` — eine Gesamtnote.`)
  }
}
if (!Array.isArray(probe.achsen) || probe.achsen.length < 3) {
  fehler.push("Die Gesundheit hat weniger als drei Achsen. Dann ist sie doch wieder ein Urteil.")
}
for (const a of probe.achsen) {
  if (!a.grund || a.grund.length < 15) {
    fehler.push(`Die Achse ${a.label} nennt keinen Grund im Klartext.`)
  }
}

/* ═══ 3 · Die Schleife erzeugt keine Kontakte ════════════════════════════ */

if (/from\s+["']@\/lib\/vertrieb-store/.test(roh)) {
  fehler.push(
    "`lib/kundenerfolg.ts` greift auf den Vertriebsspeicher zu. Ein genannter Name ist das " +
      "Personendatum eines Dritten — er geht durch G11, nicht direkt in die Pipeline.",
  )
}
for (const ruf of ["createContact", "addContact", "upsertContact", "decideContact"]) {
  if (new RegExp(`\\b${ruf}\\s*\\(`).test(quelle)) {
    fehler.push(`\`lib/kundenerfolg.ts\` ruft \`${ruf}()\`. Die Empfehlung wird erbeten, nicht erzeugt.`)
  }
}
if (!CONTACT_SOURCES.includes(EMPFEHLUNG_QUELLE)) {
  fehler.push(
    `Die Quelle ${EMPFEHLUNG_QUELLE} gibt es in G11 nicht. Die Schleife endet dann im Leeren.`,
  )
}

/* ═══ 4 · Die Musterschwelle kommt aus G16 ═══════════════════════════════ */

if (/(export\s+)?const\s+MUSTER_AB\s*=/.test(quelle)) {
  fehler.push("`lib/kundenerfolg.ts` erklaert `MUSTER_AB` selbst. Die Schwelle gehoert G16.")
}
if (!/from\s+["']@\/lib\/verlust["']/.test(roh)) {
  fehler.push("Die Musterschwelle wird nicht aus G16 importiert.")
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

console.log(
  `\nKundenerfolgs-Gate — ${probe.achsen.length} Achsen ohne Gesamtnote, ` +
    `Stille faellt ab ${STILLE_TAGE} Tagen auf, Empfehlung geht ueber G11 (${EMPFEHLUNG_QUELLE})`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  "OK — kein Verlaengerungstermin, keine Gesamtnote, kein Kontakt an G11 vorbei.",
)
console.log(
  "Es gibt keine Verlaengerung, weil es keine Mindestlaufzeit gibt — die Frage lautet nicht " +
    "wann laeuft es aus, sondern woran wuerde man es vorher merken.",
)
