/**
 * Ersatz für `lib/neon-abfrage.ts` in Probeläufen: dieselbe Schnittstelle
 * `(text, params) => rows`, aber gegen eine Wegwerf-Postgres (NETZWERK_DRILL_URL)
 * statt Neon-HTTP. Nur über `pg-abfrage-hook.mjs` eingehängt — die Anwendung
 * selbst bleibt unverändert, die Drills prüfen denselben Anwendungscode.
 */
import pg from "pg"

import { requireSafeTarget } from "./env-guard.mjs"

let client = null

export function neonAbfrage() {
  const ziel = process.env.NETZWERK_DRILL_URL?.trim()
  if (!ziel) return null
  requireSafeTarget(ziel, { zweck: "Netzwerk-Probelauf" })
  return async (text, params) => {
    if (!client) {
      client = new pg.Client({ connectionString: ziel })
      await client.connect()
    }
    return (await client.query(text, params ?? [])).rows
  }
}

export function tabelleFehlt(error, tabelle) {
  if (!error || typeof error !== "object") return false
  if (error.code === "42P01") return true
  return typeof error.message === "string" && error.message.includes(`relation "${tabelle}" does not exist`)
}

export async function schliesse() {
  if (client) await client.end()
  client = null
}
