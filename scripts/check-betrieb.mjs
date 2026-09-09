#!/usr/bin/env node
/**
 * G21 · BETRIEBS-GATE — der Leistungsumfang und die Seite sagen dasselbe.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE FRAGE
 *
 * Fuer 149 € im Monat verspricht `retainer.includes` fuenf Dinge, zwei davon
 * mit einer Zahl bzw. einer Frist. Diese Zusagen stehen an ZWEI Stellen: im
 * Woerterbuch (oeffentlich) und in `lib/betrieb.ts` (wirksam).
 *
 * Zwei Fassungen derselben Zusage koennen auseinanderlaufen. Wer den Satz
 * auf der Seite umschreibt und die Liste vergisst, verspricht etwas, das
 * kein Vorgang kennt; wer die Liste aendert und den Satz vergisst, haelt
 * etwas, das niemand gelesen hat.
 *
 * Dasselbe Muster wie beim Uebergabe-Gate (G19) und beim Angebots-Gate
 * (G17). Und es hat dort schon einmal einen echten Fehler gefunden.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { ANLIEGEN_ARTEN, INHALT_JE_MONAT, UMFANG, betriebAngeboten } from "../lib/betrieb.ts"
import { retainer } from "../lib/site-data.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

/* ═══ 1 · Beide Fassungen decken sich ════════════════════════════════════ */

const oeffentlich = retainer.includes?.de ?? []

if (oeffentlich.length !== UMFANG.length) {
  fehler.push(
    `Die Seite verspricht ${oeffentlich.length} Punkte, der Leistungsumfang fuehrt ${UMFANG.length}. ` +
      "Eine Zusage, die nur an einer der beiden Stellen steht, ist keine.",
  )
}
for (const zusage of oeffentlich) {
  if (!UMFANG.some((u) => u.zusage === zusage)) {
    fehler.push(
      `Die Seite verspricht „${zusage}“, der Leistungsumfang kennt es nicht. ` +
        "Kein Vorgang wird das je abhaken.",
    )
  }
}
for (const u of UMFANG) {
  if (!oeffentlich.includes(u.zusage)) {
    fehler.push(
      `Der Leistungsumfang fuehrt „${u.zusage}“, die Seite verspricht es nicht. ` +
        "Eine Pflicht, die niemand kennt, ist keine.",
    )
  }
}

/* ═══ 2 · Das Kontingent steht so im oeffentlichen Satz ══════════════════ */

const kontingentSatz = oeffentlich.find((z) => /Inhalts(ä|ae)nderung/i.test(z))
if (!kontingentSatz) {
  fehler.push("Auf der Seite steht keine Zusage zu Inhaltsaenderungen mehr — das Kontingent rechnet gegen nichts.")
} else {
  const zahl = kontingentSatz.match(/\b(\d+)\b/)
  if (!zahl) {
    fehler.push(`Der Satz „${kontingentSatz}" nennt keine Zahl. Ein Kontingent ohne Zahl ist keins.`)
  } else if (Number(zahl[1]) !== INHALT_JE_MONAT) {
    fehler.push(
      `Die Seite verspricht ${zahl[1]} Inhaltsaenderungen, gerechnet wird mit ${INHALT_JE_MONAT}. ` +
        "Die Zahl, die der Kunde gelesen hat, gilt.",
    )
  }
}

/* ═══ 3 · Eine Stoerung zaehlt nicht gegen das Kontingent ════════════════ */

if (ANLIEGEN_ARTEN.stoerung?.gegenKontingent !== false) {
  fehler.push(
    "Eine Stoerung zaehlt gegen das Kontingent. Damit haette ein Kunde nach zwei Ausfaellen " +
      "sein Monatskontingent aufgebraucht und muesste fuer die Behebung eines Fehlers zahlen, " +
      "den er nicht verursacht hat.",
  )
}
if (ANLIEGEN_ARTEN.wartung?.gegenKontingent !== false) {
  fehler.push("Wartung zaehlt gegen das Kontingent — sie laeuft mit, sie wird nicht abgerufen.")
}
if (ANLIEGEN_ARTEN.inhaltsaenderung?.gegenKontingent !== true) {
  fehler.push("Eine Inhaltsaenderung zaehlt NICHT gegen das Kontingent — dann gibt es keins.")
}

/* ═══ 4 · Die Frist wird gerechnet, nicht eingetragen ════════════════════ */

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const betrieb = ohneKommentare(readFileSync(path.join(ROOT, "lib", "betrieb.ts"), "utf8"))
if (/\bfrist(Datum)?\s*:\s*string/.test(betrieb) && !/function rueckrufFrist/.test(betrieb)) {
  fehler.push("Die Rueckruf-Frist steht als Feld statt als Rechnung.")
}
if (!/function naechsterWerktag/.test(betrieb)) {
  fehler.push("`naechsterWerktag()` fehlt — die Werktags-Zusage waere dann eine Redewendung.")
}
/*
 * Und der Feiertags-Vorbehalt muss dastehen. Er ist keine Kosmetik: Wer ihn
 * spaeter entfernt, hat entweder einen Kalender gebaut (dann muss er
 * laenderscharf sein) oder die Einschraenkung stillschweigend fallen lassen.
 */
const roh = readFileSync(path.join(ROOT, "lib", "betrieb.ts"), "utf8")
if (!/Feiertag/i.test(roh)) {
  fehler.push(
    "Der Feiertags-Vorbehalt fehlt. Feiertage sind Laendersache — ein Kalender im Code waere " +
      "fuer den Sitz richtig und fuer den naechsten Kunden falsch.",
  )
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const kontingente = UMFANG.filter((u) => u.art === "kontingent").length
const fristen = UMFANG.filter((u) => u.art === "frist").length

console.log(
  `\nBetriebs-Gate — ${UMFANG.length} Zusage(n) fuer ${retainer.amount ?? "—"} € im Monat ` +
    `(${kontingente} Kontingent, ${fristen} Frist, ${UMFANG.length - kontingente - fristen} laufend), ` +
    `${Object.keys(ANLIEGEN_ARTEN).length} Anliegen-Arten`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  `OK — beide Fassungen decken sich, das Kontingent ist ${INHALT_JE_MONAT} wie auf der Seite, ` +
    "eine Stoerung zaehlt nicht dagegen.",
)
if (!betriebAngeboten()) {
  console.log("Hinweis: Der Betriebs-Block erscheint nicht — `retainer.amount` ist nicht gesetzt.")
}
