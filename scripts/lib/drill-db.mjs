/**
 * Eine Wegwerf-Datenbank fuer Drills — ohne dass dafuer lokales Postgres
 * installiert sein muss.
 *
 * Ist eine der bekannten *_DRILL_URL-Variablen gesetzt, laeuft der Drill wie
 * bisher gegen echtes Postgres (`requireSafeTarget` bleibt die Huerde gegen
 * Produktion). Ohne sie startet PGlite — ein eingebettetes, in-memory
 * Postgres (WASM) — fuer die Dauer des Prozesses. Beides spricht dieselbe
 * `query(text, params)`-Schnittstelle, der Rest des Drills merkt den
 * Unterschied nicht.
 *
 * PGlite ist dabei kein Ersatz-Postgres mit eigenen Regeln: Migrationen,
 * CHECK-Constraints und Trigger laufen als dasselbe SQL, das Neon auch
 * ausfuehrt (siehe lib/neon-client.ts). Was hier gruen ist, haette gegen
 * echtes Postgres denselben Befund — nur ohne lokale Installation.
 */
import pg from "pg"
import { requireSafeTarget } from "./env-guard.mjs"

/**
 * Zielwahl: die drillspezifische Variable (z. B. FINANZ_DRILL_URL) zuerst,
 * damit ein bestehendes Setup unveraendert weiterlaeuft; sonst die
 * allgemeine TEST_DATABASE_URL; ohne beides PGlite.
 *
 * @param {{ envVar: string, zweck: string }} optionen
 * @returns {Promise<{ query: (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>, close: () => Promise<void>, backend: "postgres" | "pglite" }>}
 */
export async function oeffneDrillDb({ envVar, zweck }) {
  const ziel = process.env[envVar]?.trim() || process.env.TEST_DATABASE_URL?.trim()

  if (ziel) {
    requireSafeTarget(ziel, { zweck })
    const c = new pg.Client({ connectionString: ziel })
    await c.connect()
    return {
      query: async (text, params) => (await c.query(text, params ?? [])).rows,
      close: () => c.end(),
      backend: "postgres",
    }
  }

  const { PGlite } = await import("@electric-sql/pglite")
  const db = new PGlite()
  return {
    query: async (text, params) => (await db.query(text, params ?? [])).rows,
    close: () => db.close(),
    backend: "pglite",
  }
}
