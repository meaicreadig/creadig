import { neon } from "@neondatabase/serverless"

/**
 * ADM-02 — der schmale Neon-Zugang fuer Middleware und Routen.
 *
 * `lib/neon-client.ts` traegt das ganze Schema und den Bestand; in die
 * Middleware gehoert davon nichts. Hier steht nur: gibt es einen Speicher,
 * und wie fragt man ihn — in der Form `query(text, params)`, die auch der
 * `pg`-Adapter der Probelaeufe hat.
 */
export type Abfrage = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>

/** Die Abfragefunktion — oder `null`, wenn kein Speicher eingerichtet ist. */
export function neonAbfrage(): Abfrage | null {
  if (process.env.LEAD_STORE?.trim() !== "neon") return null
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return null
  try {
    const sql = neon(url)
    return (text, params) => sql.query(text, params) as Promise<Record<string, unknown>[]>
  } catch {
    return null
  }
}

/** Postgres `42P01 undefined_table` fuer genau diese Tabelle — ueber Neon-HTTP und `pg` gleich. */
export function tabelleFehlt(error: unknown, tabelle: string): boolean {
  if (!error || typeof error !== "object") return false
  const e = error as { code?: unknown; message?: unknown }
  if (e.code === "42P01") return true
  return typeof e.message === "string" && e.message.includes(`relation "${tabelle}" does not exist`)
}
