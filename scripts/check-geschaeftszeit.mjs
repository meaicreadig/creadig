#!/usr/bin/env node
/**
 * ADM-02 · A23 · GESCHAEFTSTAG-GATE — heute und ueberfaellig in Berlin.
 *
 * Faellt, wenn der Geschaeftstag an Mitternacht oder an den Sommerzeit-Grenzen
 * falsch kippt, oder wenn im Admin wieder ein UTC-„heute" auftaucht
 * (`toISOString().slice(0, 10)` fuer jetzt, `current_date`, Datumsanzeige
 * ohne Zone). Die SQL-Fassung (`SQL_HEUTE`) prueft `crm-drill` §11 gegen Postgres.
 *
 * Aufruf: `node --import ./scripts/lib/alias-hook.mjs scripts/check-geschaeftszeit.mjs`
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { datumAnzeige, geschaeftsTag, plusTage, wochentag } from "@/lib/geschaeftszeit"
import { naechsterWerktag } from "@/lib/betrieb"

let fehler = 0
const pruefe = (name, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
  if (!ok) fehler++
}

const GRENZEN = [
  ["Sommer, 23:59 Berlin", "2026-09-16T21:59:00Z", "2026-09-16"],
  ["Sommer, 00:00 Berlin", "2026-09-16T22:00:00Z", "2026-09-17"],
  ["Sommer, 01:30 Berlin (UTC noch Vortag)", "2026-09-16T23:30:00Z", "2026-09-17"],
  ["Winter, 23:59 Berlin", "2026-01-15T22:59:00Z", "2026-01-15"],
  ["Winter, 00:00 Berlin", "2026-01-15T23:00:00Z", "2026-01-16"],
  ["Sommerzeitbeginn, 01:59 MEZ", "2026-03-29T00:59:00Z", "2026-03-29"],
  ["Sommerzeitbeginn, 03:00 MESZ", "2026-03-29T01:00:00Z", "2026-03-29"],
  ["Vor Sommerzeitbeginn, 00:30 Berlin", "2026-03-28T23:30:00Z", "2026-03-29"],
  ["Sommerzeitende, 02:30 MESZ", "2026-10-25T00:30:00Z", "2026-10-25"],
  ["Sommerzeitende, 02:30 MEZ (zweites Mal)", "2026-10-25T01:30:00Z", "2026-10-25"],
  ["Nach Sommerzeitende, 23:30 Berlin", "2026-10-25T22:30:00Z", "2026-10-25"],
  ["Nach Sommerzeitende, 00:00 Berlin", "2026-10-25T23:00:00Z", "2026-10-26"],
  ["Silvester, 00:30 Berlin", "2026-12-31T23:30:00Z", "2027-01-01"],
]

console.log("\n1 · Geschaeftstag an Grenzen")
for (const [name, iso, soll] of GRENZEN) {
  const ist = geschaeftsTag(new Date(iso))
  pruefe(name, ist === soll, `${iso} → ${ist}`)
}
pruefe("reines Datum wird nie verschoben", geschaeftsTag("2026-10-25") === "2026-10-25")

console.log("\n2 · Heute / ueberfaellig (die Frage, die der Owner stellt)")
const jetzt = new Date("2026-09-16T22:30:00Z") /* Donnerstag 00:30 Berlin */
const heute = geschaeftsTag(jetzt)
pruefe("Schritt fuer den 17.09. ist um 00:30 Berlin HEUTE faellig", "2026-09-17" === heute)
pruefe("Schritt fuer den 16.09. ist um 00:30 Berlin UEBERFAELLIG", "2026-09-16" < heute)
pruefe("in UTC waere er es noch nicht (der alte Fehler)", !("2026-09-16" < jetzt.toISOString().slice(0, 10)))

console.log("\n3 · Werktage (Rueckruf-Zusage)")
pruefe("Montag 00:30 Berlin → Dienstag", naechsterWerktag("2026-09-20T22:30:00Z") === "2026-09-22", String(naechsterWerktag("2026-09-20T22:30:00Z")))
pruefe("Freitag 23:30 Berlin → Montag", naechsterWerktag("2026-09-18T21:30:00Z") === "2026-09-21")
pruefe("Samstag 00:30 Berlin → Montag", naechsterWerktag("2026-09-18T22:30:00Z") === "2026-09-21")
pruefe("plusTage ueber Sommerzeitende", plusTage("2026-10-24", 2) === "2026-10-26")
pruefe("wochentag zonenfrei", wochentag("2026-10-25") === 0)

console.log("\n4 · Anzeige")
pruefe("Zeitpunkt 00:30 Berlin zeigt den Berliner Tag", datumAnzeige("2026-09-16T22:30:00Z") === "17.09.26", datumAnzeige("2026-09-16T22:30:00Z"))
pruefe("reines Datum bleibt", datumAnzeige("2026-03-29") === "29.03.26")
pruefe("TR-Anzeige gleicher Tag", datumAnzeige("2026-09-16T22:30:00Z", "tr-TR", "lang") === "17.09.2026", datumAnzeige("2026-09-16T22:30:00Z", "tr-TR", "lang"))

console.log("\n5 · Kein UTC-heute im Admin")
const dateien = ["app/(admin)", "components/admin"]
  .flatMap((d) => readdirSync(d, { recursive: true }).map((f) => join(d, String(f))))
  .filter((f) => /\.(ts|tsx)$/.test(f))
  .concat(["lib/attention.ts", "lib/betrieb.ts", "lib/vollmacht.ts", "lib/ownerlast.ts", "lib/vertrieb-store-neon.ts"])
const code = (f) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")
for (const f of dateien) {
  const c = code(f)
  if (/new Date\(\)\.toISOString\(\)\.slice\(0, ?10\)/.test(c)) pruefe(`${f}: kein UTC-heute`, false)
  if (/\bcurrent_date\b/i.test(c)) pruefe(`${f}: kein current_date`, false)
  for (const m of c.matchAll(/toLocale(?:Date|Time)?String\("[a-z]{2}-[A-Z]{2}", \{([^}]*)\}/g)) {
    if (!/timeZone/.test(m[1])) pruefe(`${f}: Datumsanzeige mit Geschaeftszone`, false, m[0].slice(0, 60))
  }
}
pruefe(`${dateien.length} Dateien gescannt`, true)

console.log(fehler ? `\n✗ ${fehler} Befund(e)\n` : "\n✓ Geschaeftstag-Gate gruen\n")
process.exit(fehler ? 1 : 0)
