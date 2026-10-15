import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Missbrauchsschutz für /dokument/[token] (Phase 8) — anders als
 * lib/lead-guard.ts (Arbeitsspeicher, eine Instanz) über die Datenbank, weil
 * mehrere Server-Instanzen denselben Kundenlink gleichzeitig bedienen können
 * und das Limit über alle hinweg gelten soll, nicht nur pro Instanz.
 */
export const RATE_LIMIT_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_rate_limits (
    id bigserial PRIMARY KEY,
    schluessel text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS fin_rate_limits_schluessel_idx ON fin_rate_limits (schluessel, created_at)`,
]

let bereit: Promise<void> | null = null
async function rateLimitSchema(db: Abfrage): Promise<void> {
  if (!bereit) {
    bereit = (async () => {
      for (const s of RATE_LIMIT_SCHEMA) await db(s, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
}

/** Die Adresse des Aufrufers, so wie Vercel sie durchreicht (siehe lib/lead-guard.ts, derselbe Gedanke). */
export function callerAdresse(h: Headers): string {
  const forwarded = h.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return h.get("x-real-ip")?.trim() || "unbekannt"
}

/**
 * `true` = darf durch, der Aufruf zählt selbst mit. Räumt bei Gelegenheit
 * (2 % der Aufrufe) Zeilen älter als 24 Stunden weg — kein eigener Cron nötig
 * für eine Tabelle, die ohnehin nur ein enges Zeitfenster betrachtet.
 */
export async function pruefeRateLimit(db: Abfrage, schluessel: string, limit: number, fensterMinuten: number): Promise<boolean> {
  await rateLimitSchema(db)
  const [r] = await db(
    `SELECT count(*)::int AS n FROM fin_rate_limits WHERE schluessel = $1 AND created_at > now() - ($2 || ' minutes')::interval`,
    [schluessel, String(fensterMinuten)],
  )
  if (Number(r?.n ?? 0) >= limit) return false
  await db(`INSERT INTO fin_rate_limits (schluessel) VALUES ($1)`, [schluessel])
  if (Math.random() < 0.02) await db(`DELETE FROM fin_rate_limits WHERE created_at < now() - interval '1 day'`, [])
  return true
}
