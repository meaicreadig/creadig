#!/usr/bin/env node
/**
 * Logische Sicherung der creaDIG-Datenbank.
 *
 * ===========================================================================
 * WARUM ES DIESE DATEI GIBT
 * Bis hierher stand unter „Sicherung" ein Satz ueber Neon. Ein Anbieter, der
 * normalerweise sichert, ist keine Sicherung — es ist eine Annahme ueber
 * jemand anderen. Und selbst wenn sie zutrifft: Eine Wiederherstellung, die
 * ausschliesslich im Konto eines Anbieters existiert, kann man nicht
 * ausprobieren, nicht mitnehmen und nicht pruefen.
 *
 * Diese Datei erzeugt eine Sicherung, die creaDIG selbst besitzt.
 *
 * ---------------------------------------------------------------------------
 * WARUM pg_dump UND KEIN EIGENES FORMAT
 * Ein eigenes Format waere ein zweites Datenmodell, das niemand pflegt und
 * das genau dann versagt, wenn man es braucht. `pg_dump` liegt auf jedem
 * Rechner mit PostgreSQL, kennt das Schema besser als wir und wird von
 * `pg_restore` gelesen, ohne dass jemand etwas dazwischenschreibt.
 *
 * Gewaehlt ist das benutzerdefinierte Format (`-Fc`): komprimiert, selektiv
 * rueckspielbar, und `pg_restore --list` sagt ohne Rueckspielung, was drin
 * ist. Eine reine SQL-Datei koennte man zwar lesen, aber nicht pruefen.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT PASSIERT
 * Keine Zugangsdaten im Dateinamen, keine im Protokoll, keine im Repo. Der
 * Ablageort liegt ausserhalb des Arbeitsbaums, und `.gitignore` faengt den
 * Fall ab, in dem doch jemand hineinschreibt.
 *
 * Aufruf:
 *   node scripts/db-backup.mjs --url "postgresql://…" [--out <verzeichnis>]
 *   node scripts/db-backup.mjs                        (nimmt DATABASE_URL)
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, statSync } from "node:fs"
import path from "node:path"
import { databaseKind, environmentKind, requireSafeTarget } from "./lib/env-guard.mjs"

const args = process.argv.slice(2)
const arg = (name, fallback = null) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const url = arg("--url", process.env.DATABASE_URL ?? "")
const outDir = path.resolve(arg("--out", process.env.CREADIG_BACKUP_DIR ?? path.join(process.env.HOME ?? ".", "creadig-backups")))

/*
 * Lesen ist harmloser als Schreiben — aber nicht harmlos: Eine Sicherung
 * zieht JEDE personenbezogene Zeile auf eine Festplatte. Deshalb gilt
 * derselbe Schutz, nur mit weiterem Rahmen: verwaltete Ziele sind erlaubt,
 * weil genau sie gesichert werden muessen; eine unbestimmte Umgebung ist es
 * nicht.
 */
try {
  requireSafeTarget(url, {
    zweck: "eine Sicherung",
    erlaubt: ["disposable", "local", "managed"],
  })
} catch (error) {
  console.error(error.message)
  process.exit(2)
}

const db = databaseKind(url)
const env = environmentKind()

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const stempel = new Date().toISOString().replace(/[:.]/g, "-")
const ziel = path.join(outDir, `creadig-${db.db}-${stempel}.dump`)

/* Kein stilles Ueberschreiben: Der Zeitstempel macht jeden Namen einmalig,
   und falls doch — abbrechen statt ueberschreiben. */
if (existsSync(ziel)) {
  console.error(`ABGEBROCHEN — ${ziel} existiert bereits. Es wird nichts ueberschrieben.`)
  process.exit(3)
}

console.log(`Sicherung  ${db.host}/${db.db}  (${db.kind}, Umgebung ${env.kind})`)
console.log(`Ziel       ${ziel}`)

/* Die Verbindungszeichenfolge geht als Argument an pg_dump und NICHT durch
   eine Shell — kein Zitieren, kein Verlauf, kein Prozesslisten-Leck ueber
   eine Kommandozeile, die wir selbst zusammenbauen. */
const lauf = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--no-privileges", "--file", ziel, url], {
  stdio: ["ignore", "inherit", "inherit"],
})

if (lauf.error) {
  console.error(`ABGEBROCHEN — pg_dump nicht ausfuehrbar: ${lauf.error.message}`)
  process.exit(4)
}
if (lauf.status !== 0) {
  console.error(`ABGEBROCHEN — pg_dump endete mit ${lauf.status}. Keine brauchbare Sicherung.`)
  process.exit(lauf.status ?? 5)
}

const groesse = statSync(ziel).size
if (groesse < 1024) {
  console.error(`ABGEBROCHEN — Sicherung ist nur ${groesse} Byte gross. Das ist keine.`)
  process.exit(6)
}

/* Gegenprobe ohne Rueckspielung: Kann pg_restore die Datei ueberhaupt lesen? */
const inhalt = spawnSync("pg_restore", ["--list", ziel], { encoding: "utf8" })
if (inhalt.status !== 0) {
  console.error("ABGEBROCHEN — die Datei ist geschrieben, aber pg_restore kann sie nicht lesen.")
  process.exit(7)
}
const eintraege = inhalt.stdout.split("\n").filter((z) => z && !z.startsWith(";")).length

console.log(`OK         ${(groesse / 1024).toFixed(1)} kB · ${eintraege} Eintraege lesbar`)
console.log(ziel)
