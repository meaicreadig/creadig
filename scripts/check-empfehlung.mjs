#!/usr/bin/env node
/**
 * DAS EMPFEHLUNGS-GATE — GATE 31 ⬥
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 *
 * Der Vertrag: „Empfehlungen tragen — nuetzlich und vertrauenswuerdig, an
 * echten Faellen." Dahinter stehen drei Gates, und ihr Unterschied ist der
 * ganze Punkt:
 *
 *   G28  Betriebsgedaechtnis    liest    · handelt nicht
 *   G29  Navigator              schlaegt vor · fuehrt nicht aus
 *   G30  Agenten unter Regeln   handelt  · nur innerhalb einer Vollmacht
 *
 * Wer die drei zusammenlegt, bekommt Stellvertretung statt Automation. Das
 * ist keine Stilfrage: Ein System, das aus dem, was es weiss, ableitet, was
 * zu tun ist, und es dann tut, hat den Menschen aus der Kette genommen —
 * und zwar an der Stelle, an der er hingehoert.
 *
 * Dieses Gate baut nichts. Es prueft, dass die Grenzen zwischen den drei
 * Schichten wirklich stehen — im Code, nicht im Vorsatz.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE ABHAENGIGKEITSRICHTUNG DIE HAERTESTE PRUEFUNG IST
 *
 * Eine Grenze zwischen Schichten haelt nicht, weil jemand sie einhaelt. Sie
 * haelt, wenn die untere Schicht die obere gar nicht ERREICHT. `gedaechtnis`
 * kann nicht handeln, wenn es nichts kennt, was handelt. Das ist pruefbar,
 * und zwar an den Importen — nicht an guten Absichten in Kommentaren.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 *
 *   1. Die Einbahnstrasse: G28 ← G29, und G30 steht daneben. Keine Rueckkante.
 *   2. G28 kennt keinen Schreibweg.
 *   3. G29 kennt keinen Handlungsweg.
 *   4. G30 kopiert die Grenze nicht, es benutzt sie.
 *   5. Jeder Vorschlag stammt aus einer echten Auskunft — mit Belegen.
 *   6. Nicht erhoben erzeugt keine Gewissheit: daraus folgt messen, nie beheben.
 *   7. Ein Vorschlag ist kein Auftrag — er passt in kein `handeln()`.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const lies = (rel) => readFileSync(path.join(ROOT, rel), "utf8")

const G = await import("../lib/gedaechtnis.ts")
const N = await import("../lib/navigator.ts")
const V = await import("../lib/vollmacht.ts")
const E = await import("../lib/ereignis.ts")

const fehler = []

/** Die `@/lib/…`-Module, die eine Datei importiert. */
const importe = (rel) =>
  [...lies(rel).matchAll(/^import\s[^"']*from\s+"@\/lib\/([\w-]+)"/gm)].map((m) => m[1])

/* ── 1 · Die Einbahnstrasse ─────────────────────────────────────────────── */

const gedaechtnisKennt = importe("lib/gedaechtnis.ts")
const navigatorKennt = importe("lib/navigator.ts")
const vollmachtKennt = importe("lib/vollmacht.ts")

for (const [wer, kennt, verboten, warum] of [
  [
    "G28 gedaechtnis",
    gedaechtnisKennt,
    ["navigator", "vollmacht"],
    "Ein Gedaechtnis, das den Navigator oder die Vollmacht kennt, kann aus dem, was es weiss, " +
      "ableiten, was zu tun ist — und es dann tun lassen.",
  ],
  [
    "G29 navigator",
    navigatorKennt,
    ["vollmacht", "ereignis"],
    "Ein Navigator, der die Vollmacht oder die Ausloeser kennt, kann seinen eigenen Vorschlag " +
      "ausfuehren. Dann ist es kein Vorschlag mehr.",
  ],
  [
    "G30 vollmacht",
    vollmachtKennt,
    ["navigator", "gedaechtnis"],
    "Ein Agent, der sich seine Auftraege selbst holt, handelt nicht im Namen eines Menschen.",
  ],
]) {
  for (const m of verboten) {
    if (kennt.includes(m))
      fehler.push(`${wer} importiert @/lib/${m}. ${warum}`)
  }
}

/* ── 2 · G28 kennt keinen Schreibweg ────────────────────────────────────── */

/*
 * Geprueft wird die ERREICHBARKEIT, nicht die Absicht. Ein Store ist der
 * einzige Weg, in diesem Haus etwas zu veraendern; wer ihn nicht importiert,
 * kann nichts veraendern — egal, was er vorhat.
 */
const SCHREIBWEGE = ["vertrieb-store-neon", "lead-store-neon", "neon-client", "lead-store"]
for (const [wer, kennt] of [
  ["G28 gedaechtnis", gedaechtnisKennt],
  ["G29 navigator", navigatorKennt],
]) {
  const treffer = kennt.filter((m) => SCHREIBWEGE.includes(m))
  if (treffer.length > 0)
    fehler.push(
      `${wer} importiert ${treffer.map((t) => `@/lib/${t}`).join(", ")} — einen Schreibweg. ` +
        "Lesen und Aendern duerfen nicht in derselben Schicht erreichbar sein.",
    )
}

/* Und keine seiner Auskuenfte darf etwas zurueckgeben, das aufgerufen wird. */
for (const f of G.FRAGEN) {
  const a = f.beantworte()
  if (!G.auskunftTraegt(a)) fehler.push(`G28: Die Auskunft „${f.key}" traegt ihre Belege nicht.`)
  if (typeof a.antwort !== "string")
    fehler.push(`G28: „${f.key}" antwortet nicht in einem Satz.`)
}

/* ── 3 · G29 kennt keinen Handlungsweg ──────────────────────────────────── */

if (typeof N.NAVIGATOR_HANDELT_NICHT !== "string" || N.NAVIGATOR_HANDELT_NICHT.length < 20)
  fehler.push("G29 sagt nicht mehr selbst, dass er nicht handelt.")

for (const name of Object.keys(N)) {
  if (/^(tue|fuehre|handle|handeln|ausfuehren|starte|sende)/i.test(name))
    fehler.push(`G29 exportiert „${name}" — das klingt nach Ausfuehrung, nicht nach Vorschlag.`)
}

/* ── 4 · G30 kopiert die Grenze nicht ───────────────────────────────────── */

if (!vollmachtKennt.includes("ereignis"))
  fehler.push(
    "G30 importiert die G26-Grenze nicht mehr. Eine zweite Verbotsliste ist eine zweite " +
      "Wahrheit, und die falsche gewinnt immer.",
  )
if (/NIEMALS_AUTOMATISCH\s*=/.test(lies("lib/vollmacht.ts")))
  fehler.push("G30 definiert NIEMALS_AUTOMATISCH selbst. Die Grenze steht in G26, einmal.")
if (E.HANDLUNGEN.length === 0)
  fehler.push("HANDLUNGEN ist leer. Dann ist jede Handlung unbekannt — oder bald wieder jede erlaubt.")
for (const h of E.HANDLUNGEN)
  if (!E.WIRKUNGEN.includes(h.wirkung))
    fehler.push(`Die Handlung „${h.key}" hat eine Wirkung, die es in G26 nicht gibt.`)

/* ── 5 · Jeder Vorschlag stammt aus einer echten Auskunft ───────────────── */

const fragen = new Set(G.FRAGEN.map((f) => f.key))
const vorschlaege = N.reihenfolge()
for (const v of vorschlaege) {
  if (!N.vorschlagTraegt(v))
    fehler.push(`G29: Der Vorschlag „${v.key}" traegt nicht — ohne Beleg, Handlung oder Adressat.`)
  if (!fragen.has(v.quelle.key))
    fehler.push(
      `G29: Der Vorschlag „${v.key}" beruft sich auf „${v.quelle.key}" — das ist keine der ` +
        "Fragen aus G28. Eine Empfehlung aus einer erfundenen Lage ist eine Behauptung.",
    )
}

/* ── 6 · Nicht erhoben erzeugt keine Gewissheit ─────────────────────────── */

for (const v of vorschlaege) {
  if (v.quelle.steht === null && v.art !== "messen")
    fehler.push(
      `G29: Zu „${v.quelle.key}" (nicht erhoben) steht ein Vorschlag der Art „${v.art}". ` +
        "Was niemand gemessen hat, ist nicht kaputt — es ist ungemessen. Daraus folgt messen.",
    )
  if (v.quelle.steht === true)
    fehler.push(
      `G29: Zu „${v.quelle.key}" steht ein Vorschlag, obwohl die Lage steht. Zu einer stehenden ` +
        "Lage gibt es nichts zu tun; ein Vorschlag dazu ist Beschaeftigung.",
    )
}

/* ── 7 · Ein Vorschlag ist kein Auftrag ─────────────────────────────────── */

/*
 * Die erste Fassung dieser Pruefung verlangte, dass jede Handlung mit
 * `wer: "haus"` in `HANDLUNGEN` (G26) steht. Das war falsch, und zwar auf
 * die gefaehrliche Art: Sie haette beim ersten echten Fall gebrochen —
 * „Zeilen ohne Eigentuemer zuordnen" ist Arbeit fuer einen Menschen im Haus,
 * nicht fuer einen Agenten — und der naechste Zug haette entweder die Regel
 * oder den Vorschlag geloescht.
 *
 * Der Fehler lag nicht in der Pruefung, sondern im Wort: `haus` konnte
 * „jemand im Haus" oder „das System" heissen. Jetzt sagt der Typ, was
 * gemeint ist, und die Oberflaeche schreibt es aus.
 *
 * Geprueft wird deshalb, was dauerhaft gilt: Kein Vorschlag laesst sich in
 * `handeln()` einspeisen. Wer eine Empfehlung direkt ausfuehren kann, hat
 * G29 und G30 zusammengelegt.
 */
for (const v of vorschlaege) {
  if (E.HANDLUNGEN.some((h) => h.key === v.key))
    fehler.push(
      `G29: Der Vorschlag „${v.key}" heisst wie eine Handlung aus HANDLUNGEN (G26). Damit liesse ` +
        "er sich unveraendert an `handeln()` uebergeben — ein Vorschlag waere ein Auftrag.",
    )
  if (E.HANDLUNGEN.some((h) => h.was === v.handlung))
    fehler.push(
      `G29: Die Handlung zu „${v.key}" ist woertlich eine G26-Handlung. Ein Vorschlag, der schon ` +
        "die Form eines Auftrags hat, wird als einer gelesen.",
    )
}

for (const wert of ["owner", "haus"]) {
  if (!N.WER_LABELS?.[wert]?.trim())
    fehler.push(
      `G29: Fuer „${wert}" gibt es keine Beschriftung. Ein roher Schluessel neben einer fertigen ` +
        "Handlung liest sich wie eine Zusage der Maschine.",
    )
}
if (/\bautomatisch\b/i.test(N.WER_LABELS?.haus ?? ""))
  fehler.push("Die Beschriftung fuer `haus` verspricht Automatik. G29 fuehrt nichts aus.")

/* ── Ausgabe ────────────────────────────────────────────────────────────── */

const owner = vorschlaege.filter((v) => v.wer === "owner").length
console.log(
  `\nEmpfehlungs-Gate — ${G.FRAGEN.length} Fragen (${G.offen().length} offen, ` +
    `${G.nichtErhoben().length} nicht erhoben), ${vorschlaege.length} Vorschlaege ` +
    `(${owner} Owner, ${vorschlaege.length - owner} Haus), ${V.AGENTEN.length} Agent(en), ` +
    `${E.HANDLUNGEN.length} erlaubte Handlungen`,
)

if (fehler.length > 0) {
  console.error("\nEmpfehlungs-Gate: die Schichten sind nicht mehr getrennt.\n")
  for (const f of fehler) console.error(`  ${f}`)
  console.error(
    "\nWer Lesen, Vorschlagen und Handeln zusammenlegt, bekommt Stellvertretung statt\n" +
      "Automation — und zwar an der Stelle, an der ein Mensch hingehoert.\n",
  )
  process.exit(1)
}

console.log(
  "OK — G28 liest ohne Schreibweg, G29 schlaegt ohne Handlungsweg vor, G30 handelt nur\n" +
    "innerhalb der G26-Grenze. Jeder Vorschlag steht auf einer belegten Auskunft.\n",
)
