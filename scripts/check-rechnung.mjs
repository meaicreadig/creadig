#!/usr/bin/env node
/**
 * DAS RECHNUNGS-GATE — GATE 18
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 *
 * Das Schema steht an ZWEI Stellen: ausgefuehrt wird `SCHEMA` in
 * `lib/neon-client.ts`, gelesen wird `scripts/migrations/012-rechnung.sql`.
 * Genau diese Konstellation hat in Gate 13 den teuersten Befund erzeugt —
 * eine Regel an zwei Stellen, von denen nur eine gepflegt wird.
 *
 * Bei einer Rechnung ist der Preis dafuer hoeher als anderswo: Wer die
 * lesbare Fassung pflegt und die ausgefuehrte vergisst, glaubt an einen
 * Schutz, den die Datenbank nicht hat — und merkt es an der ersten Rechnung,
 * die ohne Nummer rausgeht.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 *
 *   1. Beide Fassungen kennen dieselben drei CHECKs.
 *   2. `invoices` hat keine Spalte, die einen Bezahlt-Zustand behauptet.
 *   3. `payments.evidence` ist NOT NULL — ein Eingang ohne Beleg ist eine
 *      Erinnerung.
 *   4. Der Steuersatz steht an genau EINER Stelle in `lib/rechnung.ts`.
 *
 * Punkt 4 ist der stillste: Ein zweites `19` im Rechnungsweg ueberlebt jede
 * Aenderung des Steuerstatus, und niemand sieht es — bis eine Rechnung einen
 * Satz ausweist, den das Impressum nicht deckt.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const lies = (rel) => readFileSync(path.join(ROOT, rel), "utf8")

const schema = lies("lib/neon-client.ts")
const migration = lies("scripts/migrations/012-rechnung.sql")
const modul = lies("lib/rechnung.ts")

const probleme = []

/* ── 1 · Beide Fassungen, dieselben CHECKs ──────────────────────────────── */
const CHECKS = ["invoices_issued_check", "invoices_draft_check", "payments_amount_check"]
for (const name of CHECKS) {
  if (!schema.includes(name)) probleme.push(`\`${name}\` fehlt in lib/neon-client.ts — die AUSGEFUEHRTE Fassung.`)
  if (!migration.includes(name)) probleme.push(`\`${name}\` fehlt in 012-rechnung.sql — die LESBARE Fassung.`)
}

/* ── 2 · Kein Bezahlt-Zustand als Spalte ────────────────────────────────── */
const invoicesBlock = schema.slice(schema.indexOf("CREATE TABLE IF NOT EXISTS invoices"), schema.indexOf("CREATE TABLE IF NOT EXISTS payments"))
if (/\b(paid|bezahlt|is_paid|payment_state)\b/i.test(invoicesBlock))
  probleme.push(
    "`invoices` traegt eine Spalte, die einen Bezahlt-Zustand behauptet. " +
      "Der Zahlungsstand faellt aus `payments` — eine zweite Wahrheit ueber Geld gewinnt immer die falsche.",
  )

/* ── 3 · Ein Eingang braucht einen Beleg ────────────────────────────────── */
if (!/evidence\s+text\s+NOT NULL/i.test(schema))
  probleme.push("`payments.evidence` ist nicht NOT NULL. Ein Eingang ohne Beleg ist eine Erinnerung, keine Buchung.")
if (!/amount_cent\s+bigint/i.test(schema))
  probleme.push("`payments.amount_cent` ist nicht `bigint`. Geld rechnet in ganzen Cent, nie in Kommazahlen.")

/* ── 4 · Der Steuersatz steht an einer Stelle ───────────────────────────── */
const satzZeilen = modul
  .split("\n")
  .map((z, i) => ({ z, nr: i + 1 }))
  .filter(({ z }) => /satz:\s*\d/.test(z))
const ausserhalb = satzZeilen.filter(({ nr }) => {
  const bis = modul.split("\n").slice(0, nr).join("\n")
  const start = bis.lastIndexOf("export function ")
  return !bis.slice(start).startsWith("export function steuerlage")
})
if (ausserhalb.length > 0)
  probleme.push(
    `Ein Steuersatz steht ausserhalb von \`steuerlage()\` (Zeile ${ausserhalb.map((x) => x.nr).join(", ")}). ` +
      "Ein zweiter Satz im Rechnungsweg ueberlebt jede Aenderung des Steuerstatus.",
  )

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
console.log(`\nRechnungs-Gate — ${CHECKS.length} CHECKs, zwei Schema-Fassungen, ${satzZeilen.length} Steuersatz-Stelle(n)`)

if (probleme.length > 0) {
  console.error("\nRechnungs-Gate: das Schema und seine lesbare Fassung sagen nicht dasselbe.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nBei Geld ist eine zweite Wahrheit teurer als anderswo: Sie faellt nicht beim Testen auf,\n" +
      "sondern beim Steuerberater — oder beim Kunden, der die Rechnung zurueckschickt.\n",
  )
  process.exit(1)
}

console.log("OK — beide Fassungen decken sich, kein Bezahlt-Flag, jeder Eingang braucht einen Beleg.\n")
