#!/usr/bin/env node
/**
 * ADM-07 · CUTOVER · STAGE 1 — DIE PRODUKTIONSDATENBANK ANSEHEN, OHNE SIE ANZUFASSEN.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES DIESE DATEI GIBT
 *
 * Vor einer Migration will man drei Dinge wissen, und alle drei nur durch
 * Lesen: Was steht heute da? Was von 015–019 ist schon angewendet? Und
 * scheitert eine der Anweisungen an den vorhandenen Daten?
 *
 * Der letzte Punkt ist der einzige, der diesen Cutover hart stoppen kann:
 * Migration 017 legt einen EINDEUTIGEN Index auf `opportunities.from_lead_id`.
 * Gibt es dort heute zwei Chancen aus derselben Anfrage, bricht die Migration
 * ab — und das ist richtig so. Entschieden wird dann vom Owner, nicht von
 * einem Skript: Welche Chance ist die echte? Automatisch zusammenzuführen
 * hiesse, echte Geschäftsdaten stillschweigend umzuschreiben.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER NICHT AUSGEGEBEN WIRD
 *
 * Keine Verbindungszeichenfolge, kein Passwort, kein Name, keine Adresse,
 * keine Nachricht. Nur Zahlen, Tabellennamen und Spaltennamen. Ein
 * Cutover-Protokoll wird weitergegeben; es darf nichts enthalten, was ein
 * Kunde nicht in fremden Händen sehen dürfte.
 *
 * Aufruf (die Zugangsdaten kommen aus der Datei, nicht aus der Zeile):
 *   node --env-file=.env.local scripts/cutover-preflight.mjs
 */
import pg from "pg"

const url = process.env.MIGRATE_URL || process.env.DATABASE_URL
if (!url || url.startsWith("[")) {
  console.error(
    "\nABGEBROCHEN — keine brauchbare DATABASE_URL.\n" +
    "Aufruf: node --env-file=.env.local scripts/cutover-preflight.mjs\n",
  )
  process.exit(2)
}

const client = new pg.Client({ connectionString: url, /* Neon verlangt TLS, ein lokales Postgres kennt es nicht — beides bedienen. */
  ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } })
await client.connect()
const q = async (text) => (await client.query(text)).rows

let stopp = 0
const sag = (name, wert) => console.log(`  ${name.padEnd(46)} ${wert}`)

console.log("\n══ STAGE 1 · Preflight (nur lesend) ══")

/* ── P2 · Was existiert heute? ─────────────────────────────────────────── */
const tabellen = (await q(
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1`,
)).map((r) => r.table_name)
const NEU = ["admin_session_revocations", "rate_limit_windows", "releases", "automation_runs", "automation_switches"]
const schonDa = NEU.filter((t) => tabellen.includes(t))
console.log("\nP2 · Tabellen")
sag("vorhanden", tabellen.length)
sag("aus 015-019 bereits angewendet", schonDa.length ? schonDa.join(", ") : "keine")

/* ── P3 · Bestand vorher (Vergleichswert fuer die Nachpruefung) ────────── */
const bestand = (await q(`SELECT
  (SELECT count(*) FROM leads)::int AS anfragen,
  (SELECT count(*) FROM organisations)::int AS organisationen,
  (SELECT count(*) FROM contacts)::int AS kontakte,
  (SELECT count(*) FROM opportunities)::int AS chancen,
  (SELECT count(*) FROM activities)::int AS chronik`))[0]
console.log("\nP3 · Bestand vorher — diese Zahlen gehoeren in die Nachpruefung")
for (const [k, v] of Object.entries(bestand)) sag(k, v)

/* ── P1 · Der einzige harte Stopper ────────────────────────────────────── */
console.log("\nP1 · 017 · Eindeutiger Index auf opportunities.from_lead_id")
const dubletten = await q(
  `SELECT from_lead_id, count(*)::int AS n FROM opportunities
    WHERE from_lead_id IS NOT NULL GROUP BY from_lead_id HAVING count(*) > 1`,
)
const betroffen = dubletten.reduce((s, r) => s + r.n, 0)
sag("Dublettengruppen", dubletten.length)
sag("betroffene Zeilen", betroffen)
if (dubletten.length) {
  stopp++
  console.log(
    "\n  STOPP — 017 wuerde an diesen Zeilen scheitern.\n" +
    "  Keine automatische Zusammenfuehrung: Welche Chance die echte ist,\n" +
    "  entscheidet der Owner. Kennungen stehen in der Datenbank, nicht hier.\n",
  )
}

/* ── P5 · Was 017 mitbringt — und was schon da ist ─────────────────────── */
console.log("\nP5 · Spalten aus 017")
const spalten = await q(
  `SELECT table_name||'.'||column_name AS ref, is_nullable FROM information_schema.columns WHERE table_schema='public'`,
)
const hat = (ref) => spalten.find((s) => s.ref === ref)
for (const ref of [
  "leads.responsible", "leads.archive_reason", "leads.duplicate_of",
  "opportunities.responsible", "activities.actor", "activities.origin", "activities.data",
]) sag(ref, hat(ref) ? "vorhanden" : "fehlt — kommt mit 017")
sag("leads.email erlaubt NULL", hat("leads.email")?.is_nullable ?? "?")
sag("leads.phone erlaubt NULL", hat("leads.phone")?.is_nullable ?? "?")
const indizes = (await q(`SELECT indexname FROM pg_indexes WHERE schemaname='public'`)).map((r) => r.indexname)
sag("opportunities_from_lead_unique", indizes.includes("opportunities_from_lead_unique") ? "vorhanden" : "fehlt — kommt mit 017")

/* ── P6/P7 · Annahmen der uebrigen Migrationen ─────────────────────────── */
console.log("\nP6 · 018 · releases verweist auf organisations")
sag("Organisationen vorhanden", (await q(`SELECT count(*)::int AS n FROM organisations`))[0].n)

console.log("\nP7 · Weitere Eindeutigkeiten, die beim Nachziehen scheitern koennten")
for (const [name, sql] of [
  ["contacts.email_normalised", `SELECT count(*)::int AS n FROM (SELECT email_normalised FROM contacts WHERE email_normalised IS NOT NULL GROUP BY 1 HAVING count(*)>1) x`],
  ["lower(organisations.name)", `SELECT count(*)::int AS n FROM (SELECT lower(name) FROM organisations GROUP BY 1 HAVING count(*)>1) x`],
]) {
  const n = (await q(sql))[0].n
  sag(name, `${n} Dublettengruppe(n)`)
  if (n > 0) stopp++
}

await client.end()

console.log(
  stopp === 0
    ? "\nPREFLIGHT GRUEN — die Migration kann nach Sicherung und Rueckspielprobe laufen.\n"
    : `\nPREFLIGHT ROT — ${stopp} Punkt(e). NICHT migrieren. Entscheidung beim Owner.\n`,
)
process.exit(stopp ? 1 : 0)
