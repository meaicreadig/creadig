#!/usr/bin/env node
/**
 * Der Migrationsbefehl — der EINZIGE Weg, das Schema zu aendern.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES IHN GIBT
 * Bis zum 06.09.2026 fuehrte die Anwendung ihr Schema bei jedem Start selbst
 * aus: `ready()` lief `SCHEMA` durch, und `ready()` haengt an 33
 * Store-Methoden. Damit konnte jeder Blick in den Vertrieb eine
 * Schema-Aenderung ausloesen — auch ein rein lesender.
 *
 * Genau so wanderte Migration 007 nach Produktion, waehrend jemand nur die
 * Anmeldedauer messen wollte.
 *
 * ---------------------------------------------------------------------------
 * WAS ER ANDERS MACHT
 *   · Er wird AUFGERUFEN. Er passiert nicht.
 *   · Er nennt das Ziel, bevor er etwas tut.
 *   · Gegen ein Produktionsziel verlangt er eine ausdrueckliche Zustimmung —
 *     `CREADIG_MIGRATE_PRODUCTION=ja-ich-migriere-produktion`. Ein Tippfehler
 *     im Verbindungsstring reicht dann nicht mehr aus.
 *   · Er zeigt vorher, WAS fehlt (`--check`), ohne es anzuwenden.
 *   · Er ist idempotent — jede Anweisung traegt `IF NOT EXISTS`.
 *
 * Er benutzt dieselbe `SCHEMA`-Liste wie die Anwendung. Eine zweite Liste
 * waere eine zweite Wahrheit, und die falsche gewinnt immer.
 */
import pg from "pg"
import { readFileSync } from "node:fs"
import { databaseKind, environmentKind } from "./lib/env-guard.mjs"

const nurPruefen = process.argv.includes("--check")

const ZIEL =
  process.env.MIGRATE_URL ||
  process.env.DATABASE_URL ||
  (() => { try { return readFileSync("/tmp/creadig-prod-db.url", "utf8").trim() } catch { return "" } })()

if (!ZIEL) {
  console.error("Kein Ziel. MIGRATE_URL oder DATABASE_URL setzen.")
  process.exit(2)
}

const db = databaseKind(ZIEL)
const env = environmentKind()
console.log(`\n  Ziel:      ${db.host}/${db.db}`)
console.log(`  Art:       ${db.kind} · Umgebung: ${env.kind}`)
console.log(`  Modus:     ${nurPruefen ? "nur pruefen" : "anwenden"}\n`)

/*
 * Die Zustimmungssperre.
 *
 * Sie greift bei allem, was NICHT erkennbar auf dem eigenen Rechner liegt —
 * also bei `managed` (Neon, RDS, …) und bei `unknown`. Im Zweifel greift
 * sie: Eine unbekannte Adresse kann Produktion sein, und die Vorsicht in
 * die andere Richtung waere hier der teurere Fehler.
 *
 * Ein lokales Postgres bleibt frei. Waere es das nicht, wuerde jeder
 * Entwickler die Zustimmung reflexhaft mitschreiben — und dann schuetzt sie
 * nichts mehr. Eine Sperre, die staendig im Weg steht, wird zur Gewohnheit,
 * und Gewohnheiten sind keine Sperren.
 */
const OHNE_ZUSTIMMUNG = new Set(["disposable", "local"])
if (!nurPruefen && !OHNE_ZUSTIMMUNG.has(db.kind)) {
  const zustimmung = process.env.CREADIG_MIGRATE_PRODUCTION
  if (zustimmung !== "ja-ich-migriere-produktion") {
    console.error(
      `  ABGEBROCHEN. Dieses Ziel liegt nicht auf diesem Rechner (${db.kind}: ${db.host}).\n` +
      `  Eine Schema-Aenderung dort ist eine Entscheidung, kein Nebeneffekt.\n\n` +
      `  Wenn Sie sie wollen:\n` +
      `    CREADIG_MIGRATE_PRODUCTION=ja-ich-migriere-produktion npm run db-migrate\n\n` +
      `  Vorher ansehen, ohne etwas zu aendern:\n` +
      `    npm run db-migrate -- --check\n`,
    )
    process.exit(3)
  }
  console.log("  Zustimmung fuer ein Produktionsziel liegt vor.\n")
}

const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
const client = new pg.Client({ connectionString: ZIEL })
await client.connect()
const sql = { query: async (t, p) => (await client.query(t, p ?? [])).rows }

/* Was fehlt heute? Dieselbe Frage, die `verifySchema()` zur Laufzeit stellt. */
const vorher = await client.query(
  `SELECT table_name || '.' || column_name AS ref FROM information_schema.columns WHERE table_schema='public'`)
const vorherSet = new Set(vorher.rows.map(r => r.ref))

if (nurPruefen) {
  console.log(`  ${vorherSet.size} Spalten vorhanden. Es wurde NICHTS geaendert.`)
  console.log(`  Zum Anwenden ohne --check aufrufen.\n`)
  await client.end()
  process.exit(0)
}

let n = 0
for (const stmt of SCHEMA) { await sql.query(stmt); n++ }
for (const stmt of BACKFILL) { await sql.query(stmt); n++ }

const nachher = await client.query(
  `SELECT table_name || '.' || column_name AS ref FROM information_schema.columns WHERE table_schema='public'`)
const neu = nachher.rows.map(r => r.ref).filter(r => !vorherSet.has(r))

console.log(`  ${n} Anweisungen ausgefuehrt.`)
console.log(neu.length ? `  NEU: ${neu.join(", ")}\n` : `  Nichts Neues — das Schema war bereits vollstaendig.\n`)
await client.end()
