#!/usr/bin/env node
/**
 * G19 · LIEFERUNGS-GATE — die Uebergabe und das Versprechen sagen dasselbe.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EINE FRAGE
 *
 * Die vier Stuecke, die dieses Haus bei der Uebergabe schuldet, stehen nicht
 * in einer internen Liste. Sie stehen im FAQ auf der oeffentlichen Seite:
 *
 *   „Danach bleibt alles bei Ihnen: CODE, INHALTE, ZUGAENGE UND DOMAIN —
 *    wir haendigen aus, was wir haben."
 *
 * Damit gibt es zwei Fassungen derselben Zusage, und sie koennen
 * auseinanderlaufen: Wer den Satz umschreibt und ein fuenftes Stueck
 * verspricht, hat eine Pflicht erzeugt, die kein Projekt kennt. Wer eines
 * streicht, bricht eine Zusage, die noch auf der Seite steht.
 *
 * Dieses Gate haelt beide gegeneinander. Es ist derselbe Gedanke wie beim
 * Angebots-Gate, das Schema und Modell vergleicht — nur dass die eine
 * Fassung hier fuer jeden lesbar im Netz steht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND DIE ZWEITE
 *
 * Steht der Livetermin irgendwo als FELD? Er darf nicht: „vier Wochen ab
 * Materialeingang" ist eine oeffentliche Zusage, und ein eingetragenes
 * Datum daneben waere eine zweite Wahrheit gegen sie. Die eingetragene
 * gewinnt immer die falsche.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { FRIST_TAGE, PROJEKT_ZUSTAENDE, UEBERGABE_STUECKE } from "../lib/lieferung.ts"
import { dictionary } from "../lib/dictionary.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

/* ═══ 1 · Die vier Stuecke stehen so auf der Seite ═══════════════════════ */

const faq = JSON.stringify(dictionary.de.faq)
for (const stueck of UEBERGABE_STUECKE) {
  if (!faq.includes(stueck.label)) {
    fehler.push(
      `Die Uebergabe fuehrt ${stueck.label}, das FAQ verspricht es nicht. ` +
        "Eine Pflicht, die niemand kennt, ist keine — und eine Zusage, die nur intern steht, auch nicht.",
    )
  }
  if (!stueck.was || stueck.was.trim().length < 20) {
    fehler.push(`${stueck.label} sagt nicht, was uebergeben wird.`)
  }
}

/*
 * Und umgekehrt: Verspricht der Satz etwas, das die Liste nicht kennt?
 *
 * Gesucht wird die Aufzaehlung selbst, nicht jedes Substantiv im FAQ — sonst
 * meldete das Gate jedes Wort, das jemals in einer Antwort steht.
 */
const satz = faq.match(/bleibt alles bei Ihnen:([^—]+)—/)
if (!satz) {
  fehler.push(
    "Der Uebergabe-Satz steht nicht mehr im FAQ (…bleibt alles bei Ihnen: … —). " +
      "Entweder ist die Zusage weg, oder sie ist umformuliert — beides gehoert hierher, nicht in einen Diff.",
  )
} else {
  const versprochen = satz[1]
    .split(/,| und /)
    .map((t) => t.trim())
    .filter((t) => t.length > 2)
  for (const wort of versprochen) {
    if (!UEBERGABE_STUECKE.some((s) => s.label.toLowerCase() === wort.toLowerCase())) {
      fehler.push(
        `Das FAQ verspricht ${wort}, die Uebergabe kennt es nicht. ` +
          "Ein versprochenes Stueck, das kein Projekt abhakt, wird nicht uebergeben.",
      )
    }
  }
}

/* ═══ 2 · Die Frist steht auf der Seite ══════════════════════════════════ */

const pakete = JSON.stringify(dictionary.de.packages)
if (!/vier Wochen ab Materialeingang/i.test(pakete)) {
  fehler.push(
    "Die Zusage: vier Wochen ab Materialeingang steht nicht mehr in den Paketen. " +
      `\`FRIST_TAGE = ${FRIST_TAGE}\` rechnet dann gegen nichts.`,
  )
}

/* ═══ 3 · Kein eingetragener Termin ══════════════════════════════════════ */

function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .map((z) => z.replace(/\/\/.*$/, ""))
    .join("\n")
}

const schema = ohneKommentare(readFileSync(path.join(ROOT, "lib", "neon-client.ts"), "utf8"))
const projektBlock = schema.match(/CREATE TABLE IF NOT EXISTS projects \(([\s\S]*?)\)`/)
if (!projektBlock) {
  fehler.push("Die Tabelle `projects` fehlt im Schema.")
} else if (/go_live|live_date|liefertermin|termin/i.test(projektBlock[1])) {
  fehler.push(
    "Die Tabelle `projects` traegt ein Terminfeld. Der Livetermin wird gerechnet — " +
      "ein eingetragenes Datum waere eine zweite Wahrheit gegen die oeffentliche Zusage.",
  )
}

for (const zustand of Object.keys(PROJEKT_ZUSTAENDE)) {
  if (!new RegExp(`'${zustand}'`).test(schema)) {
    fehler.push(`Der Projektzustand ${zustand} fehlt im CHECK der Tabelle.`)
  }
}
if (!/projects_acceptance_check/.test(schema)) {
  fehler.push("Der Tabelle `projects` fehlt der CHECK gegen eine Abnahme ohne Menschen.")
}
if (!/projects_material_check/.test(schema)) {
  fehler.push("Der Tabelle `projects` fehlt der CHECK gegen eine laufende Frist ohne Material.")
}

/* ═══ 4 · Aus einer Abnahme folgt keine Freigabe ═════════════════════════ */

/*
 * GESUCHT IST DER ZUGRIFF, NICHT DAS WORT.
 *
 * Der erste Lauf dieser Pruefung hat `lib/lieferung.ts` gemeldet — und
 * gemeint war `BELEG_FRAGE`, der Satz, der einem Menschen ERKLAERT, dass
 * aus einer Abnahme keine Freigabe folgt. Ein Waechter, der die Erklaerung
 * einer Regel als Verstoss gegen sie liest, prueft Zeichenketten.
 *
 * Beim Angebots-Gate war es ein Kommentar, hier ein Text — deshalb reicht
 * `ohneKommentare()` nicht. Was zaehlt, ist der ZUGRIFF: ein Import aus
 * `lib/proof` oder ein Aufruf seiner Funktionen.
 */
const lieferung = ohneKommentare(readFileSync(path.join(ROOT, "lib", "lieferung.ts"), "utf8"))

/*
 * GESUCHT IST DER ZUGRIFF, NICHT DAS WORT — IN DREI ANLAEUFEN GELERNT.
 *
 * 1 · Der erste suchte nach „releases" und „Release" und meldete
 *     `BELEG_FRAGE` — den Satz, der einem Menschen ERKLAERT, dass aus einer
 *     Abnahme keine Freigabe folgt. Ein Waechter, der die Begruendung einer
 *     Regel als Verstoss gegen sie liest, prueft Zeichenketten.
 *
 * 2 · Der zweite entfernte deshalb alle Zeichenketten — und dabei den
 *     Import-Pfad gleich mit: aus `from "@/lib/proof"` wurde `from ""`. Die
 *     Blindprobe fand es: Der Import stand da, der Waechter schwieg.
 *
 * 3 · Der dritte trennte beide Fassungen — und die zweite Blindprobe fand,
 *     dass die Zeichenketten-Regel bei einer ungeraden Anfuehrung die GANZE
 *     Datei verschluckt. Danach traf gar nichts mehr, und der Lauf war
 *     gruen, weil er blind war.
 *
 * Also gar keine Zeichenketten-Akrobatik. Gesucht wird, was ein Zugriff
 * WIRKLICH braucht: den Import-Pfad, und einen Aufruf mit Klammer. Prosa
 * ueber eine Regel enthaelt weder das eine noch das andere.
 */
if (/from\s+["']@\/lib\/proof["']/.test(lieferung)) {
  fehler.push(
    "`lib/lieferung.ts` importiert aus `lib/proof`. " +
      "Aus einer Abnahme folgt KEINE Freigabe — ein System, das sie ableitet, hat eine Zustimmung erfunden.",
  )
}
for (const ruf of ["deckung", "gedeckteScopes", "benoetigtFuerFall", "benoetigtFuerLogo"]) {
  if (new RegExp(`\\b${ruf}\\s*\\(`).test(lieferung)) {
    fehler.push(`\`lib/lieferung.ts\` ruft \`${ruf}()\` aus Gate 13. Eine Abnahme erzeugt keine Freigabe.`)
  }
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

console.log(
  `\nLieferungs-Gate — ${UEBERGABE_STUECKE.length} Stueck(e) bei der Uebergabe, ` +
    `Frist ${FRIST_TAGE} Tage ab Materialeingang, ${Object.keys(PROJEKT_ZUSTAENDE).length} Zustaende`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  "OK — die Uebergabe enthaelt, was die Seite verspricht; der Termin wird gerechnet; " +
    "aus einer Abnahme folgt keine Freigabe.",
)
