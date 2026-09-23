#!/usr/bin/env node
/**
 * ADM-07 · CUTOVER · STAGE 4 — NACH DER MIGRATION, VOR DEM DEPLOY.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ZWEI FRAGEN, IN DIESER REIHENFOLGE
 *
 *   1 · Ist alles da, was der neue Stand braucht? (Tabellen, Spalten, Indizes)
 *   2 · Ist nichts verschwunden? (Zeilenzahlen gegen den Stand von vorher)
 *
 * Die zweite ist die wichtigere. Eine Migration, die eine Tabelle anlegt und
 * dabei eine andere leert, meldet sich nicht von selbst — sie meldet Erfolg.
 * Deshalb werden die Zahlen aus dem Preflight uebergeben und verglichen:
 *
 *   node --env-file=.env.local scripts/cutover-nachpruefung.mjs \
 *     --vorher anfragen=19,organisationen=25,kontakte=4,chancen=0,chronik=2
 *
 * Ohne `--vorher` werden die Zahlen nur ausgegeben, nicht beurteilt — und das
 * sagt die Ausgabe dann auch.
 */
import pg from "pg"

const args = process.argv.slice(2)
const arg = (n, f = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : f }

const url = process.env.MIGRATE_URL || process.env.DATABASE_URL
if (!url || url.startsWith("[")) {
  console.error("\nABGEBROCHEN — keine brauchbare DATABASE_URL.\n")
  process.exit(2)
}

const vorher = Object.fromEntries(
  (arg("--vorher") ?? "").split(",").filter(Boolean).map((p) => {
    const [k, v] = p.split("=")
    return [k.trim(), Number(v)]
  }),
)

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const client = new pg.Client({ connectionString: url, /* Neon verlangt TLS, ein lokales Postgres kennt es nicht — beides bedienen. */
  ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } })
await client.connect()
const q = async (text) => (await client.query(text)).rows

console.log("\n══ STAGE 4 · Nachpruefung (nur lesend) ══")

console.log("\nN1 · Die fuenf Tabellen aus 015-019")
const tabellen = (await q(
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`,
)).map((r) => r.table_name)
for (const t of ["admin_session_revocations", "rate_limit_windows", "releases", "automation_runs", "automation_switches"]) {
  p(tabellen.includes(t), t)
}

console.log("\nN2 · 017 sitzt")
const spalten = await q(
  `SELECT table_name||'.'||column_name AS ref, is_nullable FROM information_schema.columns WHERE table_schema='public'`,
)
const hat = (ref) => spalten.find((s) => s.ref === ref)
for (const ref of [
  "leads.responsible", "leads.archive_reason", "leads.duplicate_of",
  "opportunities.responsible", "activities.actor", "activities.origin", "activities.data",
]) p(Boolean(hat(ref)), ref)
p(hat("leads.email")?.is_nullable === "YES", "leads.email erlaubt NULL (Anfrage ohne Mail)")
p(hat("leads.phone")?.is_nullable === "YES", "leads.phone erlaubt NULL")
const indizes = (await q(`SELECT indexname FROM pg_indexes WHERE schemaname='public'`)).map((r) => r.indexname)
p(indizes.includes("opportunities_from_lead_unique"), "opportunities_from_lead_unique (Doppelklick = eine Chance)")
p(indizes.includes("automation_runs_schluessel_idx"), "automation_runs_schluessel_idx (Automation genau einmal)")
p(indizes.includes("releases_eindeutig"), "releases_eindeutig (Erlaubnis nicht doppelt)")

console.log("\nN3 · Nichts verloren")
const jetzt = (await q(`SELECT
  (SELECT count(*) FROM leads)::int AS anfragen,
  (SELECT count(*) FROM organisations)::int AS organisationen,
  (SELECT count(*) FROM contacts)::int AS kontakte,
  (SELECT count(*) FROM opportunities)::int AS chancen,
  (SELECT count(*) FROM activities)::int AS chronik`))[0]
for (const [k, v] of Object.entries(jetzt)) {
  if (k in vorher) {
    p(v >= vorher[k], `${k}: ${vorher[k]} → ${v}`, v > vorher[k] ? "gewachsen (Backfill oder Betrieb)" : "")
  } else {
    console.log(`  ----  ${k}: ${v} (kein Vergleichswert uebergeben)`)
  }
}
if (!Object.keys(vorher).length) {
  console.log("\n  HINWEIS: ohne --vorher ist N3 nur eine Aufnahme, keine Pruefung.")
}

console.log("\nN4 · Keine offensichtlichen Waisen")
p((await q(`SELECT count(*)::int AS n FROM leads l WHERE l.contact_id IS NOT NULL
             AND NOT EXISTS (SELECT 1 FROM contacts c WHERE c.id = l.contact_id)`))[0].n === 0,
  "jede Anfrage mit Kontakt zeigt auf einen vorhandenen Kontakt")
p((await q(`SELECT count(*)::int AS n FROM opportunities o WHERE o.organisation_id IS NOT NULL
             AND NOT EXISTS (SELECT 1 FROM organisations g WHERE g.id = o.organisation_id)`))[0].n === 0,
  "jede Chance mit Organisation zeigt auf eine vorhandene Organisation")

await client.end()
console.log(
  fehler === 0
    ? "\nNACHPRUEFUNG GRUEN — der Stand darf ausgeliefert werden.\n"
    : `\nNACHPRUEFUNG ROT — ${fehler} Befund(e). NICHT deployen.\n`,
)
process.exit(fehler ? 1 : 0)
