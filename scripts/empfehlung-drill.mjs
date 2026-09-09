#!/usr/bin/env node
/**
 * DER EMPFEHLUNGS-PROBELAUF — GATE 31 ⬥
 *
 * Drei Schichten, und ihr Unterschied ist der ganze Punkt:
 *
 *   G28 liest · G29 schlaegt vor · G30 handelt in einer Vollmacht.
 *
 * Der Probelauf prueft nicht, dass die Module existieren. Er prueft, dass
 * man von der einen nicht in die naechste kommt:
 *
 *   E1  G28 liest und kann nicht handeln.
 *   E2  G29 schlaegt vor und fuehrt nicht aus.
 *   E3  G30 handelt nur, was benannt und gedeckt ist.
 *   E4  Verbotenes bleibt verboten — auch mit Vollmacht, auch umschrieben.
 *   E5  Fehlende Evidenz erzeugt keine Gewissheit.
 *   E6  Die menschlichen Tore stehen noch.
 *   E7  Eine Handlung traegt ihren Grund und ihre Vollmacht.
 *   E8  Die Pruefspur laesst sich nicht faelschen.
 *   E9  Die Schichtgrenze bricht den Build, wenn sie faellt.
 *   E10 Die echte Lage — was die Kette heute sagt.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const G = await import("../lib/gedaechtnis.ts")
const N = await import("../lib/navigator.ts")
const V = await import("../lib/vollmacht.ts")
const E = await import("../lib/ereignis.ts")
const O = await import("../lib/ownerlast.ts")

let fehler = 0
const p = (ok, n, d = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`)
}

const heute = new Date("2026-09-15")
const vollmacht = (extra = {}) => ({
  agent: "probe",
  imNamenVon: "owner",
  erteiltVon: "Owner",
  erteiltAm: "2026-09-01",
  gueltigBis: "2026-11-01",
  ereignisse: ["project.handover"],
  wirkungen: ["notieren"],
  ...extra,
})
const tun = (extra = {}) =>
  V.handeln({
    vollmacht: vollmacht(),
    ereignis: "project.handover",
    wirkung: "notieren",
    handlung: "chronik-notieren",
    dazu: "vier Stuecke, Projekt 1",
    an: "projekt-1",
    heute,
    ...extra,
  })

/* ── E1 · G28 liest ─────────────────────────────────────────────────────── */
console.log("\nE1 · Das Gedaechtnis liest und kann nicht handeln")
const a1 = JSON.stringify(G.kontext())
const a2 = JSON.stringify(G.kontext())
p(a1 === a2, "zweimal gefragt, zweimal dieselbe Antwort", "es haelt nichts fest, es rechnet")
p(G.FRAGEN.every((f) => G.auskunftTraegt(f.beantworte())), "jede Auskunft traegt ihre Belege")
p(
  !G.auskunftTraegt({ key: "x", frage: "F?", antwort: "Ja.", steht: true, belege: [] }),
  "eine Auskunft ohne Beleg gibt es nicht",
  "eine Behauptung mit Systemstimme ist gefaehrlicher als eine mit Menschenstimme",
)
p(
  Object.keys(G).every((k) => !/^(setze|schreibe|speichere|aendere|loesche)/i.test(k)),
  "G28 exportiert nichts, was etwas veraendert",
)
p(G.nichtErhoben().every((a) => a.steht === null), "nicht erhoben ist etwas Drittes, kein Nein")

/* ── E2 · G29 schlaegt vor ──────────────────────────────────────────────── */
console.log("\nE2 · Der Navigator schlaegt vor und fuehrt nichts aus")
const v1 = JSON.stringify(N.reihenfolge())
p(v1 === JSON.stringify(N.reihenfolge()), "zweimal gefragt, zweimal dasselbe")
p(
  Object.keys(N).every((k) => !/^(tue|fuehre|handle|starte|sende|ausfuehren)/i.test(k)),
  "er exportiert nichts, was ausfuehrt",
)
p(typeof N.NAVIGATOR_HANDELT_NICHT === "string", "und sagt es selbst")
p(
  N.reihenfolge().every((v) => !E.HANDLUNGEN.some((h) => h.key === v.key || h.was === v.handlung)),
  "kein Vorschlag passt in `handeln()`",
  "wer eine Empfehlung direkt ausfuehren kann, hat G29 und G30 zusammengelegt",
)
p(N.WER_LABELS.haus && !/automatisch/i.test(N.WER_LABELS.haus),
  "„haus“ verspricht keine Automatik", "es heisst „ein Mensch im Haus“, nicht „die Maschine“")

/* ── E3 · G30 handelt nur benannt und gedeckt ───────────────────────────── */
console.log("\nE3 · Ein Agent handelt nur, was benannt und gedeckt ist")
p(tun().erlaubt, "eine benannte, gedeckte Handlung geht durch")
p(!tun({ handlung: "kunden-anrufen" }).erlaubt, "eine erfundene nicht",
  "unbekannt heisst nein, nicht „nicht verboten“")
p(!tun({ handlung: "" }).erlaubt, "eine namenlose nicht")
p(!tun({ wirkung: "pruefen" }).erlaubt, "eine nicht gedeckte Wirkung nicht")
p(!tun({ ereignis: "offer.sent" }).erlaubt, "ein nicht gedecktes Ereignis nicht")
p(!tun({ vollmacht: vollmacht({ gueltigBis: "2026-09-01" }) }).erlaubt, "eine abgelaufene Vollmacht nicht")
p(!tun({ vollmacht: V.widerrufen(vollmacht(), "2026-09-10") }).erlaubt, "eine widerrufene nicht")
p(!tun({ vollmacht: vollmacht({ gueltigBis: "" }) }).erlaubt, "eine ohne Ende nicht")
p(V.AGENTEN.length === 0, "und heute ist keine erteilt", V.KEINE_AGENTEN.slice(0, 60) + "…")

/* ── E4 · Verbotenes bleibt verboten ────────────────────────────────────── */
console.log("\nE4 · Auch mit Vollmacht bleibt verboten, was verboten ist")
const allmacht = vollmacht({ wirkungen: [...E.WIRKUNGEN], ereignisse: [...E.EREIGNISSE] })
for (const n of E.NIEMALS_AUTOMATISCH) {
  const h = V.handeln({
    vollmacht: allmacht,
    ereignis: "offer.accepted",
    wirkung: "notieren",
    handlung: "chronik-notieren",
    dazu: `Automatisch ${n.was}`,
    an: "x",
    heute,
  })
  p(!h.erlaubt && h.spur === null, `„${n.was}“ (${n.gate})`)
}

/*
 * DIE UMSCHREIBUNG — der Angriff, an dem die alte Fassung scheiterte.
 *
 * Bis zum 09.09.2026 entschied der frei gewaehlte Satz. „ein Angebot senden"
 * war verboten, „Das Angebot per Mail rausschicken" ging durch. Jetzt gibt
 * es keinen freien Satz mehr, der etwas entscheidet.
 */
for (const umschrieben of [
  "Das Angebot per Mail rausschicken",
  "Den Interessenten anrufen und nachfassen",
  "Nachricht an den Geschaeftsfuehrer schicken",
  "Die Rechnung rausschicken",
]) {
  const h = V.handeln({
    vollmacht: allmacht,
    ereignis: "offer.accepted",
    wirkung: "weiterreichen",
    handlung: umschrieben,
    dazu: umschrieben,
    an: "x",
    heute,
  })
  p(!h.erlaubt, `umschrieben: „${umschrieben}“`, "eine Grenze, die man umformuliert, ist keine")
}

/* ── E5 · Fehlende Evidenz ──────────────────────────────────────────────── */
console.log("\nE5 · Was niemand gemessen hat, ist nicht kaputt")
const ungemessen = N.reihenfolge().filter((v) => v.quelle.steht === null)
p(ungemessen.every((v) => v.art === "messen"), `zu ${ungemessen.length} ungemessenen Lagen heisst es messen`)
p(N.reihenfolge().every((v) => v.quelle.steht !== true), "zu einer stehenden Lage gibt es nichts",
  "ein Navigator, der auch Erledigtes meldet, fuellt den Blick mit Bestaetigung")
p(N.zuMessen().every((v) => v.art === "messen") && N.zuBeheben().every((v) => v.art === "beheben"),
  "messen und beheben bleiben getrennt")
const reihenfolge = N.reihenfolge()
const letzterMessen = reihenfolge.map((v) => v.art).lastIndexOf("messen")
const ersterBeheben = reihenfolge.map((v) => v.art).indexOf("beheben")
p(letzterMessen === -1 || ersterBeheben === -1 || letzterMessen < ersterBeheben,
  "erst messen, dann beheben")

/* ── E6 · Die menschlichen Tore ─────────────────────────────────────────── */
console.log("\nE6 · Die Tore, an denen ein Mensch steht")
for (const tor of O.ENTSCHEIDUNGSTORE) {
  const modul = await import(`../${tor.wo}`)
  const wert = modul[tor.suche]
  const da = tor.art === "funktion" ? typeof wert === "function" : Array.isArray(wert) && wert.length > 0
  p(da, `${tor.gate} ${tor.suche} steht`)
}
p(E.NIEMALS_AUTOMATISCH.every((n) => /^G\d+$/.test(n.gate)), "jedes Verbot nennt sein Gate",
  "eine Verbotsliste ohne Herkunft ist eine Meinung")

/* ── E7 · Grund und Vollmacht ───────────────────────────────────────────── */
console.log("\nE7 · Eine Handlung traegt ihren Grund und ihre Vollmacht")
const spur = tun().spur
p(spur.agent === "probe", "die Spur nennt den Agenten")
p(spur.imNamenVon === "owner", "und in wessen Namen")
p(spur.wegen === "project.handover", "und das Ereignis, das sie ausgeloest hat")
p(spur.an === "projekt-1", "und den Gegenstand")
p(!Number.isNaN(new Date(spur.wann).getTime()), "und wann")
p(V.spurTraegt(spur), "sie traegt vollstaendig")
p(!V.spurTraegt(null), "und keine Spur traegt nicht", "`spurTraegt(h.spur)` darf nicht werfen")

/* ── E8 · Die Spur laesst sich nicht faelschen ──────────────────────────── */
console.log("\nE8 · Der Kontrollierte schreibt die Pruefspur nicht")
const katalog = E.HANDLUNGEN.find((h) => h.key === "chronik-notieren")
p(spur.was === katalog.was, "der Handlungssatz kommt woertlich aus dem Katalog")
const gefaerbt = tun({ dazu: "Das Angebot per Mail rausschicken" })
p(gefaerbt.erlaubt, "ein Zusatz darf den Fall beschreiben")
p(gefaerbt.spur.was === katalog.was, "aendert aber nicht, was in der Spur als Handlung steht",
  "eine Pruefspur, deren Inhalt der Kontrollierte bestimmt, ist keine")
p(gefaerbt.spur.dazu === "Das Angebot per Mail rausschicken", "der Zusatz steht daneben, nicht davor")
p(!V.spurTraegt({ ...spur, was: "Den Kunden anrufen" }), "eine erfundene Handlung traegt keine Spur")
p(!V.spurTraegt({ ...spur, wirkung: "pruefen" }), "und eine Wirkung, die nicht dazugehoert, auch nicht")

/* ── E9 · Die Schichtgrenze bricht den Build ────────────────────────────── */
console.log("\nE9 · Faellt die Grenze, faellt der Build")

const angriff = (aenderung) => {
  const heim = mkdtempSync(path.join(tmpdir(), "empfehlung-"))
  try {
    for (const teil of ["lib", "scripts"]) cpSync(path.join(ROOT, teil), path.join(heim, teil), { recursive: true })
    for (const datei of ["package.json", "tsconfig.json"]) cpSync(path.join(ROOT, datei), path.join(heim, datei))
    symlinkSync(path.join(ROOT, "node_modules"), path.join(heim, "node_modules"))
    aenderung({
      lies: (rel) => readFileSync(path.join(heim, rel), "utf8"),
      schreib: (rel, inhalt) => writeFileSync(path.join(heim, rel), inhalt),
    })
    const lauf = spawnSync(
      process.execPath,
      ["--no-warnings", "--import", "./scripts/lib/alias-hook.mjs", "scripts/check-empfehlung.mjs"],
      { cwd: heim, encoding: "utf8" },
    )
    return { code: lauf.status, aus: `${lauf.stdout}${lauf.stderr}` }
  } finally {
    rmSync(heim, { recursive: true, force: true })
  }
}

const bricht = (name, ergebnis, muster, detail = "") => {
  p(ergebnis.code === 1, name, detail || (ergebnis.code === 1 ? "" : ergebnis.aus.slice(0, 200)))
  p(muster.test(ergebnis.aus), `  … mit dem richtigen Grund`, muster.test(ergebnis.aus) ? "" : ergebnis.aus.slice(0, 250))
}

p(angriff(() => {}).code === 0, "das unveraenderte Haus besteht die Pruefung")

bricht(
  "G28, das die Vollmacht kennt, bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/gedaechtnis.ts")
    schreib("lib/gedaechtnis.ts", `import { AGENTEN } from "@/lib/vollmacht"\nvoid AGENTEN\n${t}`)
  }),
  /gedaechtnis importiert @\/lib\/vollmacht/,
  "ein Gedaechtnis, das handeln kennt, kann handeln lassen",
)

bricht(
  "G29, das die Vollmacht kennt, bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/navigator.ts")
    schreib("lib/navigator.ts", `import { AGENTEN } from "@/lib/vollmacht"\nvoid AGENTEN\n${t}`)
  }),
  /navigator importiert @\/lib\/vollmacht/,
)

bricht(
  "ein Schreibweg im Gedaechtnis bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/gedaechtnis.ts")
    schreib("lib/gedaechtnis.ts", `import { SCHEMA } from "@/lib/neon-client"\nvoid SCHEMA\n${t}`)
  }),
  /Schreibweg/,
)

bricht(
  "eine zweite Verbotsliste in G30 bricht den Build",
  angriff(({ lies, schreib }) => {
    /* Die Grenze wird nicht entfernt, sondern KOPIERT — der stille Fehler. */
    const t = lies("lib/vollmacht.ts")
    schreib(
      "lib/vollmacht.ts",
      t.replace("  NIEMALS_AUTOMATISCH,\n", "") +
        '\nconst NIEMALS_AUTOMATISCH = [{ was: "nichts", weil: "Kopie", gate: "G00" }]\nvoid NIEMALS_AUTOMATISCH\n',
    )
  }),
  /zweite Wahrheit|definiert NIEMALS_AUTOMATISCH selbst/,
)

bricht(
  "ein leerer Handlungskatalog bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/ereignis.ts")
    schreib("lib/ereignis.ts", t.replace("export const HANDLUNGEN = [", "const HANDLUNGEN_ALT = [") + "\nexport const HANDLUNGEN = []\n")
  }),
  /HANDLUNGEN ist leer/,
)

bricht(
  "ein Vorschlag in der Form eines Auftrags bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/navigator.ts")
    schreib(
      "lib/navigator.ts",
      t.replace(
        'handlung: "Zeilen ohne Eigentuemer zuordnen oder streichen.",',
        'handlung: "In die Chronik schreiben, was geschehen ist",',
      ).replace("if (a.steht === true) continue", "if (a.steht === true && a.key !== \"sichtschuld\") continue"),
    )
  }),
  /Form eines Auftrags|heisst wie eine Handlung/,
  "ein Vorschlag, der schon wie ein Auftrag aussieht, wird als einer gelesen",
)

/* ── E10 · Die echte Lage ───────────────────────────────────────────────── */
console.log("\nE10 · Was die Kette heute wirklich sagt")
const lage = N.reihenfolge()
p(lage.length > 0, `${lage.length} Vorschlaege aus ${G.FRAGEN.length} Fragen`)
p(lage.every((v) => v.quelle.belege.length > 0), "jeder steht auf mindestens einem Beleg")
p(lage.every((v) => N.vorschlagTraegt(v)), "und jeder traegt nach den eigenen Regeln")
console.log(`       ${G.offen().length} offen · ${G.nichtErhoben().length} nicht erhoben · ${V.AGENTEN.length} Agent(en)`)
console.log("       Was hier NICHT bewiesen ist: dass ein Mensch diesen Vorschlaegen gefolgt ist.")
console.log("       „An echten Faellen" + '"' + " verlangt echte Faelle — die hat nur der Owner.")

console.log(
  fehler === 0
    ? "\nEmpfehlungs-Probelauf bestanden. Lesen, Vorschlagen und Handeln sind getrennt.\n"
    : `\nEmpfehlungs-Probelauf: ${fehler} Fehler.\n`,
)
process.exit(fehler === 0 ? 0 : 1)
