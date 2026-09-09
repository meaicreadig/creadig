#!/usr/bin/env node
/**
 * DER VERTRETUNGS-PROBELAUF — GATE 33
 *
 * „Fuer EINEN Ablauf ersetzbar." Der Probelauf greift die Antwort aus beiden
 * Richtungen an:
 *
 *   T1  Die Owner-Bindung ueberstimmt alles.
 *   T2  Die Lage kommt aus der Umgebung, nicht aus dem Code.
 *   T3  Arbeit verschwindet nie stumm.
 *   T4  Kein Tor wird erfunden — und keines unterschlagen.
 *   T5  Ersetzbarkeit senkt die unabnehmbare Last nicht (G27).
 *   T6  Faelschungsversuche brechen den Build.
 *   T7  Die echte Lage.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const T = await import("../lib/vertretung.ts")
const R = await import("../lib/rollen.ts")
const O = await import("../lib/ownerlast.ts")

let fehler = 0
const p = (ok, n, d = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`)
}

const ALLE = Object.fromEntries(R.ROLLEN_KEYS.map((r) => [R.ROLLEN[r].variable, "gesetzt"]))

/* ── T1 · Die Owner-Bindung ueberstimmt alles ───────────────────────────── */
console.log("\nT1 · Ein gebundener Schritt bleibt gebunden, auch wenn alle Rollen besetzt sind")
for (const a of T.ABLAEUFE.filter((a) => a.schritte.some((s) => s.ownerGebundenDurch))) {
  const e = T.ersetzbarkeit(a, ALLE)
  p(e.lage === "owner-gebunden", `${a.key} bleibt owner-gebunden`,
    "sonst waere „alle Rollen besetzt“ ein Weg, eine Entscheidung wegzudelegieren")
  p(e.ownerSchritte.length > 0 && e.ownerSchritte.every((s) => T.istOwnerGate(s.gate)),
    `  … und nennt sein Gate (${e.ownerSchritte.map((s) => s.gate).join(", ")})`)
}
p(T.ersatzlage(ALLE).ownerGebunden.length === 3, "drei Ablaeufe sollen nie ersetzbar sein")

/* ── T2 · Die Lage kommt aus der Umgebung ───────────────────────────────── */
console.log("\nT2 · Die Antwort wird gelesen, nicht behauptet")
const leer = T.ersatzlage({})
const voll = T.ersatzlage(ALLE)
p(leer.ersetzbar.length === 0, "ohne besetzte Rolle ist nichts ersetzbar")
p(!leer.erfuellt, "und der Vertrag ist nicht erfuellt")
p(voll.ersetzbar.length >= 1, "mit besetzten Rollen mindestens einer")
p(voll.erfuellt, "und dann ist er erfuellt", "„fuer EINEN Ablauf ersetzbar“")
p(leer.satz !== voll.satz, "die beiden Saetze sind verschieden")
const nurVertrieb = T.ersatzlage({ ADMIN_PASSWORD_VERTRIEB: "x" })
p(nurVertrieb.ersetzbar.includes("anfrage-aufnehmen"), "eine besetzte Rolle traegt genau ihren Ablauf")
p(!nurVertrieb.ersetzbar.includes("inhalt-pflegen"), "und nicht den der anderen",
  "sonst wuerde eine Besetzung fuer alle gelten")
p(T.ersatzlage({ ADMIN_PASSWORD: "x" }).ersetzbar.length === 0,
  "der Owner selbst macht keinen Ablauf ersetzbar", "er ist die Person, um die es geht")

/* ── T3 · Arbeit verschwindet nie stumm ─────────────────────────────────── */
console.log("\nT3 · Eine leere Rolle laesst die Arbeit nicht verschwinden")
for (const a of T.ABLAEUFE) {
  const e = T.ersetzbarkeit(a, {})
  if (e.lage !== "nicht-besetzt") continue
  p(!!e.eskalation, `${a.key} sagt, wohin die Arbeit faellt`)
  p(/Owner/.test(e.eskalation), "  … und zwar an den Owner")
  p(e.fehlendeRollen.length > 0 && /ADMIN_PASSWORD/.test(e.satz),
    "  … und was sie besetzen wuerde")
}
p(T.ABLAEUFE.every((a) => T.ersetzbarkeit(a, ALLE).lage !== "nicht-besetzt"),
  "mit allen Rollen ist keiner mehr unbesetzt")

/* ── T4 · Kein erfundenes, kein unterschlagenes Tor ─────────────────────── */
console.log("\nT4 · Die Owner-Tore stammen aus G26 und G27")
p(T.OWNER_GATES.length > 0, `${T.OWNER_GATES.length} Gates duerfen binden`)
p(!T.istOwnerGate("G99"), "ein erfundenes Gate bindet nichts")
p(!T.istOwnerGate(""), "und ein leeres auch nicht")
p(T.ABLAEUFE.every((a) => a.schritte.every((s) => s.ownerGebundenDurch === null || T.istOwnerGate(s.ownerGebundenDurch))),
  "jede Bindung nennt ein echtes Gate")
const gebunden = new Set(T.ABLAEUFE.flatMap((a) => a.schritte.map((s) => s.ownerGebundenDurch).filter(Boolean)))
for (const tor of O.ENTSCHEIDUNGSTORE.filter((t) => t.gate !== "G26"))
  p(gebunden.has(tor.gate), `${tor.gate} („${tor.was}“) kommt als Owner-Schritt vor`)
p(T.ABLAEUFE.every((a) => a.schritte.every((s) => s.ownerGebundenDurch === null || s.rollen.length === 0)),
  "kein gebundener Schritt traegt eine Rolle")
p(T.ABLAEUFE.every((a) => a.schritte.every((s) => s.ownerGebundenDurch !== null || s.rollen.length > 0)),
  "und kein delegierbarer steht ohne Traeger")
p(T.ABLAEUFE.every((a) => a.schritte.every((s) => !s.rollen.includes("owner"))),
  "„owner“ steht in keiner Traegerliste", "sonst saehe jeder Schritt besetzt aus")

/* ── T5 · G33 senkt die unabnehmbare Last nicht ─────────────────────────── */
console.log("\nT5 · Ersetzbarkeit ist keine abgeschaffte Entscheidung")
const ownerSchritteLeer = T.ABLAEUFE.flatMap((a) => T.ersetzbarkeit(a, {}).ownerSchritte).length
const ownerSchritteVoll = T.ABLAEUFE.flatMap((a) => T.ersetzbarkeit(a, ALLE).ownerSchritte).length
p(ownerSchritteLeer === ownerSchritteVoll,
  `${ownerSchritteVoll} gebundene Schritte, egal wie viele Rollen besetzt sind`,
  "eine Besetzung darf keine Entscheidung aufloesen")
p(O.UNABNEHMBAR.length > 0, "die unabnehmbare Klasse in G27 steht weiter")
p(T.SAGT_NICHTS_UEBER.length >= 3, `${T.SAGT_NICHTS_UEBER.length} Saetze zu dem, was der Befund nicht sagt`)
p(T.SAGT_NICHTS_UEBER.some((s) => /gelaufen|getan/i.test(s)),
  "darunter: eingerichtet ist nicht gelaufen")

/* ── T6 · Faelschungen brechen den Build ────────────────────────────────── */
console.log("\nT6 · Wer die Antwort faelscht, bricht den Build")

const angriff = (aenderung) => {
  const heim = mkdtempSync(path.join(tmpdir(), "vertretung-"))
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
      ["--no-warnings", "--import", "./scripts/lib/alias-hook.mjs", "scripts/check-vertretung.mjs"],
      { cwd: heim, encoding: "utf8" },
    )
    return { code: lauf.status, aus: `${lauf.stdout}${lauf.stderr}` }
  } finally {
    rmSync(heim, { recursive: true, force: true })
  }
}
const bricht = (name, ergebnis, muster, detail = "") => {
  p(ergebnis.code === 1, name, detail || (ergebnis.code === 1 ? "" : ergebnis.aus.slice(0, 200)))
  p(muster.test(ergebnis.aus), "  … mit dem richtigen Grund", muster.test(ergebnis.aus) ? "" : ergebnis.aus.slice(0, 250))
}

p(angriff(() => {}).code === 0, "das unveraenderte Haus besteht die Pruefung")

bricht(
  "eine delegierte Entscheidung bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/vertretung.ts")
    schreib("lib/vertretung.ts", t.replace(
      '        rollen: [],\n        ownerGebundenDurch: "G18",',
      '        rollen: ["vertrieb"],\n        ownerGebundenDurch: "G18",',
    ))
  }),
  /gebunden UND an|delegierte Entscheidung/,
  "die billige Art, „ersetzbar“ zu melden",
)

bricht(
  "eine still entfernte Owner-Bindung bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/vertretung.ts")
    schreib("lib/vertretung.ts", t.replace('ownerGebundenDurch: "G18",', "ownerGebundenDurch: null,"))
  }),
  /G18.*kommt in keinem Ablauf|stillschweigend delegiert/s,
)

bricht(
  "ein erfundenes Owner-Tor bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/vertretung.ts")
    schreib("lib/vertretung.ts", t.replace(
      '        rollen: ["vertrieb"],\n        ownerGebundenDurch: null,\n        weil: "Zusammenstellen ist Rechnen, kein Fordern.",',
      '        rollen: [],\n        ownerGebundenDurch: "G99",\n        weil: "Das mache immer ich.",',
    ))
  }),
  /G99/,
  "„nur ich kann das“ ist keine Regel, sondern eine Gewohnheit",
)

bricht(
  "ein delegierbarer Schritt ohne Traeger bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/vertretung.ts")
    schreib("lib/vertretung.ts", t.replace(
      '        was: "Anfrage sichten und den Bearbeitungsstand setzen",\n        rollen: ["vertrieb"],',
      '        was: "Anfrage sichten und den Bearbeitungsstand setzen",\n        rollen: [],',
    ))
  }),
  /keiner Rolle zugeordnet|haengt still am Owner/,
)

bricht(
  "eine behauptete statt gelesene Lage bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/vertretung.ts")
    schreib("lib/vertretung.ts", t.replace(
      "  const fehlendeRollen = gebraucht.filter((r) => !vergeben.includes(r))",
      "  const fehlendeRollen = []",
    ))
  }),
  /liest es die Umgebung nicht|behauptet eine Einrichtung/,
)

/* ── T7 · Die echte Lage ────────────────────────────────────────────────── */
console.log("\nT7 · Was heute wirklich gilt")
const jetzt = T.ersatzlage()
console.log(`       ${jetzt.satz}`)
p(R.vergebeneRollen().length <= 1, `${R.vergebeneRollen().length} Rolle(n) vergeben`,
  "echte Menschen erfindet kein Gate")
p(!jetzt.erfuellt, "der Vertrag ist heute NICHT erfuellt",
  "und das ist kein Codefehler — es fehlt eine Umgebungsvariable, also ein Mensch")
console.log("       Zu tun hat das ein Mensch: ADMIN_PASSWORD_VERTRIEB oder ADMIN_PASSWORD_REDAKTION setzen.")

console.log(
  fehler === 0
    ? "\nVertretungs-Probelauf bestanden. Ersetzbarkeit ist nicht faelschbar — in keine Richtung.\n"
    : `\nVertretungs-Probelauf: ${fehler} Fehler.\n`,
)
process.exit(fehler === 0 ? 0 : 1)
