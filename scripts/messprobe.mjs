/*
 * ===========================================================================
 * MESSPROBE ERFASSEN
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1.
 *
 * Der Weg, auf dem eine Zahl in die Messreihe kommt. Bewusst ein Befehl und
 * keine Eingabemaske:
 *
 *   · Eine Probe entsteht NEBEN der Arbeit, nicht in einem Verwaltungsfenster.
 *     Wer gerade eine Abfrage laufen laesst, tippt das Ergebnis in dieselbe
 *     Zeile, in der er die Abfrage getippt hat.
 *   · Jede Angabe ist hier Pflicht und wird vor dem Schreiben geprueft. Eine
 *     Maske haette drei optionale Felder, und drei optionale Felder sind in
 *     einem halben Jahr drei leere Spalten.
 *   · Es gibt keine Schaltflaeche, die man versehentlich trifft.
 *
 * AUFRUF
 *
 *   npm run messprobe -- \
 *     --kennzahl fibero-ungeprueft \
 *     --seite ausgang \
 *     --wert 18.4 \
 *     --faelle 240 \
 *     --quelle system-zaehlung \
 *     --von "Emin" \
 *     [--am 2026-09-11] \
 *     [--notiz "Abfrage X über Zeitraum Y"] \
 *     --schreiben
 *
 * Ohne `--schreiben` rechnet der Befehl nur vor und schreibt nichts. Das ist
 * die Voreinstellung, nicht die Ausnahme.
 */
import { fiberoKennzahlen } from "@/lib/fibero-messung"
import { probeTraegt, quelleTraegt } from "@/lib/messreihe"
import { getVertriebStore } from "@/lib/lead-store"

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? null : (process.argv[i + 1] ?? null)
}
const hat = (name) => process.argv.includes(`--${name}`)

function heute() {
  return new Date().toISOString().slice(0, 10)
}

const eingabe = {
  kennzahl: arg("kennzahl"),
  seite: arg("seite"),
  wert: arg("wert") === null ? null : Number(String(arg("wert")).replace(",", ".")),
  faelle: arg("faelle") === null ? null : Number(arg("faelle")),
  quelle: arg("quelle"),
  von: arg("von"),
  am: arg("am") ?? heute(),
  notiz: arg("notiz"),
}

const fehler = []

const kennzahl = fiberoKennzahlen.find((k) => k.key === eingabe.kennzahl)
if (!kennzahl) {
  fehler.push(
    `Unbekannte Kennzahl. Bekannt sind:\n        ${fiberoKennzahlen.map((k) => k.key).join("\n        ")}`,
  )
}
if (eingabe.seite !== "ausgang" && eingabe.seite !== "danach") {
  fehler.push("--seite muss `ausgang` oder `danach` sein. Es gibt kein `vorher`.")
}
if (eingabe.wert === null || !Number.isFinite(eingabe.wert) || eingabe.wert < 0) {
  fehler.push("--wert fehlt oder ist keine Zahl >= 0.")
}
if (eingabe.faelle === null || !Number.isInteger(eingabe.faelle) || eingabe.faelle < 0) {
  fehler.push("--faelle fehlt oder ist keine ganze Zahl >= 0.")
}
if (!eingabe.quelle || !quelleTraegt(eingabe.quelle)) {
  fehler.push(
    "--quelle muss eine tragende Quelle sein: system-zaehlung, handaufschrieb oder zeitmessung. " +
      "Eine Schätzung wird nicht in die Reihe geschrieben.",
  )
}
if (!eingabe.von || eingabe.von.trim().length < 2) {
  fehler.push("--von fehlt. Eine Zahl ohne Erheber verantwortet niemand.")
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(eingabe.am)) {
  fehler.push("--am muss YYYY-MM-DD sein.")
}

/* Weicht die Quelle von der Definition ab, ist die Probe nicht vergleichbar. */
if (kennzahl && eingabe.quelle && eingabe.quelle !== kennzahl.quelle) {
  fehler.push(
    `Die Kennzahl „${kennzahl.key}" ist als ${kennzahl.quelle} definiert, die Probe kommt aus ${eingabe.quelle}. ` +
      "Zwei Quellen sind zwei Messungen und kein Vergleich — entweder die Definition ändern oder anders erheben.",
  )
}

if (fehler.length > 0) {
  console.error("\nFEHL — die Probe wurde nicht geschrieben:")
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

const probe = {
  kennzahl: eingabe.kennzahl,
  seite: eingabe.seite,
  am: eingabe.am,
  wert: eingabe.wert,
  faelle: eingabe.faelle,
  quelle: eingabe.quelle,
  von: eingabe.von.trim(),
  notiz: eingabe.notiz,
}

const traegt = probeTraegt(probe)

console.log(`\nKennzahl    ${kennzahl.key} (${kennzahl.art}, ${kennzahl.einheit})`)
console.log(`Definition  ${kennzahl.definition}`)
console.log(`Seite       ${probe.seite}`)
console.log(`Wert        ${probe.wert} ${kennzahl.einheit} über ${probe.faelle} Fälle`)
console.log(`Erhoben     ${probe.am} von ${probe.von} (${probe.quelle})`)
console.log(`Öffentlich  ${traegt.traegt ? "ja" : "nein"} — ${traegt.grund}`)

if (!hat("schreiben")) {
  console.log("\nNichts geschrieben. Mit --schreiben festhalten.\n")
  process.exit(0)
}

const store = getVertriebStore()
if (!store) {
  console.error(
    "\nKeine Datenbank konfiguriert (LEAD_STORE=neon und DATABASE_URL). Nichts geschrieben.\n",
  )
  process.exit(1)
}

const ergebnis = await store.recordMeasurementSample(probe)
if (ergebnis === "neu") {
  console.log("\nFestgehalten.\n")
  process.exit(0)
}
if (ergebnis === "schon-erfasst") {
  console.error(
    `\nFür ${probe.kennzahl} · ${probe.seite} · ${probe.am} liegt bereits eine Probe vor. ` +
      "Überschrieben wird nie — an einem anderen Tag noch einmal messen.\n",
  )
  process.exit(1)
}
console.error("\nNicht möglich: Die Messreihe ist nicht erreichbar (Tabelle fehlt?).\n")
process.exit(1)
