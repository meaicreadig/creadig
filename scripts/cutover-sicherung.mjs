#!/usr/bin/env node
/**
 * ADM-07 · CUTOVER · STAGE 2 — SICHERN UND DIE SICHERUNG BEWEISEN.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * EIN BEFEHL, ZWEI SCHRITTE, EINE REGEL
 *
 * Eine Sicherung, die nie zurueckgespielt wurde, ist eine Vermutung mit
 * Dateiendung. Deshalb macht diese Datei beides hintereinander und bricht ab,
 * wenn der zweite Schritt nicht gelingt:
 *
 *   1 · `db-backup.mjs`      — pg_dump der Produktion in ein Verzeichnis
 *                              AUSSERHALB des Arbeitsbaums
 *   2 · `db-restore-drill.mjs` — dieselbe Datei in eine FRISCHE lokale
 *                              Wegwerf-Datenbank, dann Schema, Tabellen,
 *                              Zeilenzahlen und eine Anwendungsabfrage
 *                              vergleichen
 *
 * Die Verbindungszeichenfolge wird als Argument an das Kindprogramm gereicht
 * und nirgends ausgegeben. Was hier steht, darf weitergegeben werden.
 *
 * Aufruf:
 *   node --env-file=.env.local scripts/cutover-sicherung.mjs
 * Optional:
 *   --out <verzeichnis>   (Standard: ~/creadig-backups)
 *   --target <dbname>     (Standard: g1_cutover — lokal, wird geloescht)
 */
import { spawnSync } from "node:child_process"

const args = process.argv.slice(2)
const arg = (n, f) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : f }

const url = process.env.MIGRATE_URL || process.env.DATABASE_URL
if (!url || url.startsWith("[")) {
  console.error("\nABGEBROCHEN — keine brauchbare DATABASE_URL.\nAufruf: node --env-file=.env.local scripts/cutover-sicherung.mjs\n")
  process.exit(2)
}
const out = arg("--out", `${process.env.HOME}/creadig-backups`)
const ziel = arg("--target", "g1_cutover")

/*
 * Dieser Befehl IST die bewusste Produktions-Sicherung des Cutover.
 * env-guard sperrt managed+production ohne Ausnahme — hier setzen wir sie
 * einmal, sichtbar, und nur fuer die Kindprozesse dieses Laufs.
 */
process.env.CREADIG_ALLOW_UNSAFE_DB = "ich-weiss-was-ich-tue"
console.log("\n══ STAGE 2 · Sicherung ══")
console.log("(Cutover-Ausnahme: CREADIG_ALLOW_UNSAFE_DB gesetzt — bewusst)\n")
const sicherung = spawnSync("node", ["scripts/db-backup.mjs", "--url", url, "--out", out], {
  encoding: "utf8",
  env: process.env,
})
process.stdout.write(sicherung.stdout ?? "")
if (sicherung.status !== 0) {
  process.stderr.write(sicherung.stderr ?? "")
  console.error("\nABGEBROCHEN — keine brauchbare Sicherung. NICHT migrieren.\n")
  process.exit(3)
}

/* Der Pfad steht als letzte Zeile der Ausgabe — so gibt `db-backup` ihn aus. */
const datei = (sicherung.stdout ?? "").trim().split("\n").pop().trim()
if (!datei.endsWith(".dump")) {
  console.error(`\nABGEBROCHEN — Pfad der Sicherung nicht erkannt: ${datei}\n`)
  process.exit(3)
}

console.log("\n══ STAGE 3 · Rueckspielprobe (lokal, Wegwerf-Datenbank) ══\n")
const probe = spawnSync(
  "node",
  ["scripts/db-restore-drill.mjs", "--dump", datei, "--target", ziel, "--source", url],
  { encoding: "utf8" },
)
process.stdout.write(probe.stdout ?? "")
if (probe.status !== 0) {
  process.stderr.write(probe.stderr ?? "")
  console.error("\nABGEBROCHEN — die Sicherung liess sich nicht beweisen. NICHT migrieren.\n")
  process.exit(4)
}

console.log(`\nSICHERUNG ABGENOMMEN.\n  Datei: ${datei}\n  Rueckspielung: geprueft und wieder aufgeraeumt.\n`)
