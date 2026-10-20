import type { Abfrage } from "@/lib/neon-abfrage"
import type { KnotenId } from "@/lib/zentrale/netz-karte"

/**
 * Echte Verbindungsereignisse der Zentrale: jede Zeile = „zwischen von und nach ist gerade
 * wirklich etwas passiert“. Die 3D-Zentrale zeichnet eine Linie nur, solange so eine Zeile frisch ist.
 */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS zentrale_faden_log (
    id bigserial PRIMARY KEY,
    von text NOT NULL,
    nach text NOT NULL,
    was text,
    erzeugt_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS zentrale_faden_log_paar_idx ON zentrale_faden_log (von, nach, erzeugt_at DESC)`,
]

let schemaBereit: Promise<void> | null = null
async function schema(db: Abfrage) {
  schemaBereit ??= (async () => {
    for (const s of SCHEMA) await db(s, [])
  })().catch((e) => {
    schemaBereit = null
    throw e
  })
  await schemaBereit
}

/** Schreibt ein Ereignis. Schlägt das Logging fehl, passiert nichts – die eigentliche Aktion bleibt unberührt. */
export async function protokolliereFaden(db: Abfrage | null, von: KnotenId, nach: KnotenId, was?: string): Promise<void> {
  if (!db) return
  try {
    await schema(db)
    await db(`INSERT INTO zentrale_faden_log (von, nach, was) VALUES ($1, $2, $3)`, [von, nach, was?.slice(0, 200) ?? null])
  } catch {
    // bewusst still
  }
}

/** Jüngstes Ereignis je (von, nach)-Paar, Schlüssel „von>nach“, Wert ISO-Zeit. */
export async function letzteFaeden(db: Abfrage | null): Promise<Record<string, string>> {
  if (!db) return {}
  try {
    await schema(db)
    const rows = (await db(
      `SELECT von, nach, max(erzeugt_at) AS zeit FROM zentrale_faden_log
       WHERE erzeugt_at > now() - interval '7 days' GROUP BY von, nach`,
      [],
    )) as { von: string; nach: string; zeit: string | Date }[]
    return Object.fromEntries(rows.map((r) => [`${r.von}>${r.nach}`, new Date(r.zeit).toISOString()]))
  } catch {
    return {}
  }
}
