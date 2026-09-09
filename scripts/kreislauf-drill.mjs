#!/usr/bin/env node
/**
 * DER KREISLAUF-PROBELAUF — GATE 36
 *
 *   K1  Der Kreislauf zaehlt nicht, er fragt.
 *   K2  Eine Antwort aus dem Gate aendert die Antwort des Kreislaufs.
 *   K3  Jede Sperre nennt einen Menschen.
 *   K4  Aus tragenden Stationen folgt kein gelaufener Fall.
 *   K5  Die Lage ist stabil.
 *   K6  Faelschungen brechen den Build.
 *   K7  Die echte Lage.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const K = await import("../lib/kreislauf.ts")

let fehler = 0
const p = (ok, n, d = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`)
}

const angriff = (aenderung, skript = "scripts/check-kreislauf.mjs") => {
  const heim = mkdtempSync(path.join(tmpdir(), "kreislauf-"))
  try {
    for (const teil of ["lib", "scripts", "docs"]) cpSync(path.join(ROOT, teil), path.join(heim, teil), { recursive: true })
    for (const datei of ["package.json", "tsconfig.json"]) cpSync(path.join(ROOT, datei), path.join(heim, datei))
    symlinkSync(path.join(ROOT, "node_modules"), path.join(heim, "node_modules"))
    aenderung({
      lies: (rel) => readFileSync(path.join(heim, rel), "utf8"),
      schreib: (rel, inhalt) => writeFileSync(path.join(heim, rel), inhalt),
    })
    const lauf = spawnSync(process.execPath, ["--no-warnings", "--import", "./scripts/lib/alias-hook.mjs", skript], {
      cwd: heim,
      encoding: "utf8",
    })
    return { code: lauf.status, aus: `${lauf.stdout}${lauf.stderr}` }
  } finally {
    rmSync(heim, { recursive: true, force: true })
  }
}
const bricht = (name, ergebnis, muster, detail = "") => {
  p(ergebnis.code === 1, name, detail || (ergebnis.code === 1 ? "" : ergebnis.aus.slice(0, 200)))
  p(muster.test(ergebnis.aus), "  … mit dem richtigen Grund", muster.test(ergebnis.aus) ? "" : ergebnis.aus.slice(0, 250))
}

/* ── K1 · Der Kreislauf zaehlt nicht ────────────────────────────────────── */
console.log("\nK1 · Eine Kette ist so stark wie ihr schwaechstes Glied")
const k = K.kreislauf()
p(k.durchgaengig === (k.gesperrt.length === 0), "`durchgaengig` folgt aus den Sperren, nicht aus einer Zahl")
p(k.gesperrt.length === 0 || k.ersteSperre !== null, "und die erste Sperre wird benannt")
p(k.stationen.length === K.STATIONEN.length, "keine Station faellt unter den Tisch")
p(K.STATIONEN[0].key === "markt" && K.STATIONEN.at(-1).key === "owner-kontrolle",
  "vom Marktsignal bis zur Owner-Entscheidung", "genau die Spanne, die der Vertrag nennt")
p(new Set(K.STATIONEN.map((s) => s.key)).size === K.STATIONEN.length, "jede Station kommt einmal vor")

/* ── K2 · Der Kreislauf fragt wirklich die Gates ────────────────────────── */
console.log("\nK2 · Aendert das Gate seine Antwort, aendert der Kreislauf seine")

/*
 * Der einzige Beweis, der zaehlt: Wenn in der KOPIE der Umsatzsteuer-Status
 * entschieden ist, darf die Station „Rechnung" dort nicht mehr gesperrt
 * sein. Steht die Sperre trotzdem, hat dieses Modul sie hingeschrieben statt
 * gefragt — und wuerde sie auch dann noch melden, wenn G18 laengst geklaert
 * waere.
 */
const geklaert = angriff(({ lies, schreib }) => {
  const t = lies("lib/rechnung.ts")
  schreib(
    "lib/rechnung.ts",
    t.replace(
      "export function steuerlage(): Steuerlage {",
      "export function steuerlage(): Steuerlage {\n  return { art: 'kleinunternehmer', satz: 0, hinweis: null, entschieden: true }\n  // eslint-disable-next-line no-unreachable",
    ),
  )
})
p(geklaert.code === 0, "mit geklaerter Steuerfrage besteht die Pruefung weiter")
p(!/G18 Rechnung →/.test(geklaert.aus), "und die Rechnung ist nicht mehr gesperrt",
  "die Sperre kam aus G18, nicht aus einer Zeile in diesem Modul")
p(/G18 Rechnung →/.test(angriff(() => {}).aus), "unveraendert steht sie dagegen da")

const besetzt = angriff(({ lies, schreib }) => {
  const t = lies("scripts/check-kreislauf.mjs")
  schreib("scripts/check-kreislauf.mjs", `process.env.ADMIN_PASSWORD_VERTRIEB = "gesetzt"\n${t}`)
})
p(!/G33 Rollen und Vertretung →/.test(besetzt.aus), "eine besetzte Rolle loest die G33-Sperre",
  "die Antwort kommt aus der Umgebung ueber G33, nicht aus diesem Modul")

/* ── K3 · Jede Sperre nennt einen Menschen ──────────────────────────────── */
console.log("\nK3 · Eine Sperre ohne Adressaten wird als Systemfehler gelesen")
for (const s of k.stationen.filter((x) => x.ergebnis.zustand === "gesperrt")) {
  p(!!s.ergebnis.wer, `${s.gate} ${s.name} nennt ${s.ergebnis.wer}`)
  p(s.ergebnis.satz.length > 40, "  … und sagt, was genau fehlt")
}
p(k.wer.length > 0, `insgesamt ${k.wer.length} Adressat(en): ${k.wer.join(", ")}`)
p(k.stationen.filter((s) => s.ergebnis.zustand === "traegt").every((s) => s.ergebnis.wer === null),
  "eine tragende Station nennt niemanden")

/* ── K4 · Kein erfundener Durchlauf ─────────────────────────────────────── */
console.log("\nK4 · Aus tragenden Stationen folgt kein gelaufener Fall")
const d = K.durchlauf()
p(d.belegt === null, "`belegt` ist null")
p(d.belegt !== false, "und null ist nicht nein", "„nie gelaufen“ und „nicht erhoben“ sind verschieden")
p(/GEBAUT ist nicht GELAUFEN/.test(d.warum), "der Grund steht dabei")
p(/G20/.test(d.woNachzusehen), "und wo man es nachsieht")
p(K.SAGT_NICHTS_UEBER.length >= 4, `${K.SAGT_NICHTS_UEBER.length} Saetze zu dem, was der Kreislauf nicht sagt`)
p(K.SAGT_NICHTS_UEBER.some((s) => /Umsatz/i.test(s)), "darunter: ein durchgaengiger Kreislauf kann leer laufen")

/* ── K5 · Stabil ────────────────────────────────────────────────────────── */
console.log("\nK5 · Zweimal gefragt, zweimal dasselbe")
p(JSON.stringify(K.kreislauf()) === JSON.stringify(K.kreislauf()), "der ganze Kreislauf")
p(K.STATIONEN.every((s) => JSON.stringify(s.lage()) === JSON.stringify(s.lage())), "und jede Station einzeln")

/* ── K6 · Faelschungen ──────────────────────────────────────────────────── */
console.log("\nK6 · Wer den Kreislauf schoenrechnet, bricht den Build")
p(angriff(() => {}).code === 0, "das unveraenderte Haus besteht die Pruefung")

bricht(
  "ein behaupteter Durchlauf bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/kreislauf.ts")
    schreib("lib/kreislauf.ts", t.replace("    belegt: null,", "    belegt: true,"))
  }),
  /nicht `null`|GEBAUT ist nicht GELAUFEN|Wahrheitswert/,
  "der eine Schritt, gegen den „an echten Faellen“ geschrieben ist",
)

bricht(
  "ein hart gesetztes `durchgaengig` bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/kreislauf.ts")
    schreib("lib/kreislauf.ts", t.replace("    durchgaengig: sperren.length === 0,", "    durchgaengig: true,"))
  }),
  /stimmt nicht mit den Sperren/,
)

bricht(
  "eine erfundene Station bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/kreislauf.ts")
    schreib("lib/kreislauf.ts", t.replace('    gate: "G34",', '    gate: "G99",'))
  }),
  /G99/,
  "ein Kreislauf aus erfundenen Stationen misst Papier",
)

bricht(
  "eine Sperre ohne Adressaten bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/kreislauf.ts")
    schreib("lib/kreislauf.ts", t.replace(
      'const gesperrt = (satz: string, wer: string): Lage => ({ zustand: "gesperrt", satz, wer })',
      'const gesperrt = (satz: string, wer: string): Lage => ({ zustand: "gesperrt", satz, wer: wer ? null : null })',
    ))
  }),
  /nennt aber niemanden|ohne Adressaten/,
)

bricht(
  "ein eigener Rechenweg bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/kreislauf.ts")
    schreib("lib/kreislauf.ts", t.replace(
      "  const sperren = stationen.filter((s) => s.ergebnis.zustand === \"gesperrt\")",
      "  const sperren = stationen.filter((s) => s.ergebnis.zustand === \"gesperrt\")\n  void stationen.reduce((n, s) => n + (s.ergebnis.wer ? 1 : 0), 0)",
    ))
  }),
  /eine Summe/,
  "sonst wird G36 eine weitere Quelle der Wahrheit, und zwar die mit dem groessten Anspruch",
)

bricht(
  "ein direkter Griff in ein Register bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/kreislauf.ts")
    schreib("lib/kreislauf.ts", `import { SCHEMA } from "@/lib/neon-client"\nvoid SCHEMA\n${t}`)
  }),
  /importiert `lib\/neon-client` direkt|zweite Meinung/,
)

bricht(
  "eine vertauschte Reihenfolge bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/kreislauf.ts")
    schreib("lib/kreislauf.ts", t.replace("export const STATIONEN: readonly Station[] = [", "export const STATIONEN: readonly Station[] = [...[] as Station[],").replace(
      "export function kreislauf(): Kreislauf {",
      "STATIONEN.reverse?.()\nexport function kreislauf(): Kreislauf {",
    ))
  }),
  /beginnt nicht am Marktsignal|endet nicht bei der Owner-Entscheidung/,
  "der Vertrag nennt Anfang und Ende",
)

/* ── K7 · Die echte Lage ────────────────────────────────────────────────── */
console.log("\nK7 · Was heute wirklich gilt")
console.log(`       ${k.satz}`)
for (const s of k.stationen.filter((x) => x.ergebnis.zustand === "gesperrt"))
  console.log(`       ${s.gate} ${s.name} → ${s.ergebnis.wer}`)
p(!k.durchgaengig, "der Kreislauf ist heute NICHT durchgaengig")
p(k.wer.every((w) => /Owner|Steuerberater|Anwalt/.test(w)),
  "und jede Sperre wartet auf einen Menschen, nicht auf Code")
console.log("       Ob je ein echter Fall durchgelaufen ist: nicht erhoben.")

console.log(
  fehler === 0
    ? "\nKreislauf-Probelauf bestanden. Der Kreislauf fragt die Gates und erfindet keinen Fall.\n"
    : `\nKreislauf-Probelauf: ${fehler} Fehler.\n`,
)
process.exit(fehler === 0 ? 0 : 1)
