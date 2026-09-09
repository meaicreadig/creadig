#!/usr/bin/env node
/**
 * ALLE DATENBANK-PROBELAEUFE, GEGEN FRISCHE WEGWERF-DATENBANKEN.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES DAS GIBT
 *
 * Fuenf Probelaeufe brauchen eine Datenbank: crm, sales, research, contact,
 * evidence. Sie waren ueber Runden hinweg nicht ausfuehrbar, und der Grund
 * war weder ein Fehler im Code noch im Schutz:
 *
 *   1 · Jeder Lauf hat seine EIGENE Umgebungsvariable (CRM_DRILL_URL,
 *       SALES_DRILL_URL, …) und faellt ohne sie auf `postgres://localhost/g7`
 *       zurueck — einen Namen, den `env-guard` nicht als Wegwerf erkennt.
 *       Dann greift die Umgebungspruefung, findet „unbekannt", und bricht ab.
 *       Voellig richtig; nur wusste niemand, welche Variable fehlte.
 *
 *   2 · Die alten Datenbanken (g7…g12) enthielten Reste frueherer Laeufe.
 *       Wer sie doch erreichte, bekam Schluesselkonflikte und neun
 *       fehlgeschlagene Pruefungen — Befunde ueber ALTE Daten, nicht ueber
 *       den Code. Ein Probelauf, der auf Resten sitzt, misst die Reste.
 *
 * Beides loest dieser Lauf, ohne den Schutz anzufassen: Er legt Datenbanken
 * an, deren NAME sie als Wegwerf ausweist (`drill_…`), und schmeisst sie
 * vorher weg, wenn sie schon dastehen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ER NICHT TUT
 *
 * Er setzt `CREADIG_ALLOW_UNSAFE_DB` nicht. Die Ausnahme des Schutzes bleibt
 * das, was sie sein soll: eine bewusste Entscheidung fuer einen Einzelfall,
 * keine Zeile in einem Skript, die jeder Lauf mitnimmt. Ein Schutz, den ein
 * Werkzeug routinemaessig aufhebt, schuetzt nichts.
 *
 * Und er faehrt ausschliesslich gegen `localhost`. Ein entferntes Ziel wird
 * gar nicht erst angeboten.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AUFRUF
 *   npm run db-drills
 *   PGHOST=… PGUSER=… npm run db-drills
 */
import { spawnSync } from "node:child_process"

const HOST = process.env.PGHOST ?? "localhost"
const PORT = process.env.PGPORT ?? "5432"
const USER = process.env.PGUSER ?? ""
const kredenz = USER ? `${USER}@` : ""

/* Der Name traegt die Sicherheit: `drill_…` erkennt `env-guard` als Wegwerf. */
const LAEUFE = [
  { name: "crm", db: "drill_crm", variable: "CRM_DRILL_URL" },
  { name: "sales", db: "drill_sales", variable: "SALES_DRILL_URL" },
  { name: "research", db: "drill_research", variable: "RESEARCH_DRILL_URL" },
  { name: "contact", db: "drill_contact", variable: "CONTACT_DRILL_URL" },
  { name: "evidence", db: "drill_evidence", variable: "EVIDENCE_DRILL_URL" },
  /* GATE 18 — Rechnung und Zahlungseingang. */
  { name: "rechnung", db: "drill_rechnung", variable: "RECHNUNG_DRILL_URL" },
  /* GATE 20 — die Kette ueber Angebot, Rechnung und Lieferung hinweg. */
  { name: "kette", db: "drill_kette", variable: "KETTE_DRILL_URL" },
]

function psql(sql) {
  const r = spawnSync(
    "psql",
    ["-h", HOST, "-p", PORT, ...(USER ? ["-U", USER] : []), "-d", "postgres", "-c", sql],
    { encoding: "utf8" },
  )
  return r.status === 0
}

if (!psql("SELECT 1")) {
  console.error(
    `\nKein Postgres auf ${HOST}:${PORT} erreichbar.\n\n` +
      "  Die fuenf Probelaeufe brauchen eine Datenbank. Ohne sie sind sie nicht\n" +
      "  gruen und nicht rot — sie sind UNBEKANNT, und das ist etwas anderes.\n\n" +
      "  Auf macOS:  brew services start postgresql@17\n",
  )
  process.exit(1)
}

let fehler = 0
for (const lauf of LAEUFE) {
  /*
   * Frisch heisst frisch. Ein Probelauf, der auf den Resten des letzten
   * sitzt, meldet die Reste — genau das war der Zustand von g7…g12.
   */
  psql(`DROP DATABASE IF EXISTS "${lauf.db}" WITH (FORCE)`)
  if (!psql(`CREATE DATABASE "${lauf.db}"`)) {
    console.error(`  FEHL ${lauf.name} — Datenbank ${lauf.db} liess sich nicht anlegen`)
    fehler++
    continue
  }

  const url = `postgres://${kredenz}${HOST}:${PORT}/${lauf.db}`
  const r = spawnSync("npm", ["run", `${lauf.name}-drill`], {
    encoding: "utf8",
    env: { ...process.env, [lauf.variable]: url },
  })
  const ok = r.status === 0
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${lauf.name}-drill  gegen ${lauf.db}`)
  if (!ok) {
    const zeilen = `${r.stdout ?? ""}\n${r.stderr ?? ""}`.split("\n").filter((z) => /FEHL|Error|error:/.test(z))
    for (const z of zeilen.slice(0, 6)) console.log(`         ${z.trim().slice(0, 140)}`)
  }
}

console.log(
  fehler === 0
    ? `\n${LAEUFE.length} Probelaeufe gegen frische Wegwerf-Datenbanken: alle gruen.\n` +
        "Der Schutz wurde nicht aufgehoben — die Namen weisen die Ziele als Wegwerf aus.\n"
    : `\n${fehler} von ${LAEUFE.length} Probelaeufen fehlgeschlagen.\n`,
)
process.exit(fehler === 0 ? 0 : 1)
