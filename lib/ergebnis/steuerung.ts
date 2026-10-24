import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

/**
 * AGENTEN-STEUERUNG (Katman 3, 24.10.2026).
 *
 * Bis hier wurde kein Agent je abgeschaltet – der Puls startete Stumme und
 * Gescheiterte nur neu. Jetzt kann ein Agent pausiert werden: Er läuft weder
 * im Morgen-Takt noch im Puls-Neustart. Pausieren ist umkehrbar (Code und
 * Verlauf bleiben), und es passiert nur auf Emins Klick an der wöchentlichen
 * Steuerungs-Karte des Ergebnis-Controllers oder auf /admin/leistung.
 */

let bereit: Promise<boolean> | null = null

async function db(): Promise<Abfrage | null> {
  const q = neonAbfrage()
  if (!q) return null
  bereit ??= q(
    `CREATE TABLE IF NOT EXISTS agent_steuerung (
       agent text PRIMARY KEY,
       status text NOT NULL CHECK (status IN ('aktiv','pausiert')),
       grund text,
       uebernimmt text,
       durch text NOT NULL,
       seit timestamptz NOT NULL DEFAULT now())`,
    [],
  )
    .then(() => true)
    .catch(() => {
      bereit = null
      return false
    })
  return (await bereit) ? q : null
}

export type Pause = { agent: string; grund: string | null; uebernimmt: string | null; durch: string; seit: string }

export async function ladePausen(): Promise<Pause[]> {
  const q = await db()
  if (!q) return []
  const r = (await q(`SELECT agent, grund, uebernimmt, durch, seit FROM agent_steuerung WHERE status = 'pausiert' ORDER BY seit DESC`, []).catch(
    () => [],
  )) as { agent: string; grund: string | null; uebernimmt: string | null; durch: string; seit: string | Date }[]
  return r.map((p) => ({ ...p, seit: new Date(p.seit).toISOString() }))
}

/** Menge der pausierten Agenten – leer, wenn die Datenbank fehlt (dann läuft alles wie bisher). */
export async function pausierteAgenten(): Promise<Set<string>> {
  return new Set((await ladePausen()).map((p) => p.agent))
}

export async function pausiere(agent: string, o: { grund: string; uebernimmt?: string | null; durch: string }): Promise<void> {
  const q = await db()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await q(
    `INSERT INTO agent_steuerung (agent, status, grund, uebernimmt, durch, seit) VALUES ($1, 'pausiert', $2, $3, $4, now())
     ON CONFLICT (agent) DO UPDATE SET status = 'pausiert', grund = EXCLUDED.grund, uebernimmt = EXCLUDED.uebernimmt, durch = EXCLUDED.durch, seit = now()`,
    [agent, o.grund.slice(0, 500), o.uebernimmt ?? null, o.durch],
  )
}

export async function aktiviere(agent: string, durch: string): Promise<void> {
  const q = await db()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await q(`UPDATE agent_steuerung SET status = 'aktiv', durch = $2, seit = now() WHERE agent = $1`, [agent, durch])
}
