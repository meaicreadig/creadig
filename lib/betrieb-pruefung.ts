import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

/**
 * Ein kleines Prüfregister: WER hat WANN WAS geprüft — mit dem Ergebnis.
 *
 * Gleiche Form wie `fin_abgleich` (Quelle, Zeit, Ergebnis), aber für den
 * Betrieb statt für die Finanzen. Zwei Nutzer, keine zweite Struktur:
 *
 *   `beleg-gate`          der letzte Lauf von scripts/check-beleg.mjs (CI/postbuild)
 *   `verbindung:<id>`     die letzte Messung einer Verbindung (/admin/verbindungen)
 *
 * Vorher lag Letzteres in einer Map im Prozess: Nach jedem Kaltstart oder auf
 * der anderen Instanz stand dort „noch nie geprüft". Ohne Speicher bleibt das
 * Verhalten ehrlich leer — nie ein erfundener Befund.
 */

export const PRUEFUNG_SCHEMA = `CREATE TABLE IF NOT EXISTS betrieb_pruefung (
  quelle text PRIMARY KEY,
  lauf_at timestamptz NOT NULL DEFAULT now(),
  ergebnis jsonb NOT NULL DEFAULT '{}'::jsonb)`

export type GespeichertePruefung<T> = { quelle: string; laufAt: string; ergebnis: T }

let bereit: Promise<void> | null = null
async function schema(db: Abfrage) {
  bereit ??= db(PRUEFUNG_SCHEMA, []).then(
    () => undefined,
    (e) => {
      bereit = null
      throw e
    },
  )
  await bereit
}

/** Schreibt (ersetzt) den letzten Lauf einer Quelle. Gibt `false` zurück, wenn nichts gespeichert werden konnte. */
export async function schreibePruefung(quelle: string, ergebnis: unknown, db: Abfrage | null = neonAbfrage()): Promise<boolean> {
  if (!db) return false
  try {
    await schema(db)
    await db(
      `INSERT INTO betrieb_pruefung (quelle, lauf_at, ergebnis) VALUES ($1, now(), $2::jsonb)
       ON CONFLICT (quelle) DO UPDATE SET lauf_at = now(), ergebnis = EXCLUDED.ergebnis`,
      [quelle, JSON.stringify(ergebnis)],
    )
    return true
  } catch (e) {
    console.error("[betrieb-pruefung] nicht gespeichert:", (e as Error).message)
    return false
  }
}

export async function lesePruefung<T>(quelle: string, db: Abfrage | null = neonAbfrage()): Promise<GespeichertePruefung<T> | null> {
  if (!db) return null
  try {
    await schema(db)
    const [r] = await db(`SELECT quelle, lauf_at, ergebnis FROM betrieb_pruefung WHERE quelle = $1`, [quelle])
    return r ? { quelle, laufAt: new Date(String(r.lauf_at)).toISOString(), ergebnis: r.ergebnis as T } : null
  } catch {
    return null
  }
}

export async function lesePruefungen<T>(vorsatz: string, db: Abfrage | null = neonAbfrage()): Promise<GespeichertePruefung<T>[]> {
  if (!db) return []
  try {
    await schema(db)
    const rows = await db(`SELECT quelle, lauf_at, ergebnis FROM betrieb_pruefung WHERE quelle LIKE $1 ORDER BY lauf_at DESC`, [`${vorsatz.replace(/[%_\\]/g, "\\$&")}%`])
    return rows.map((r) => ({ quelle: String(r.quelle), laufAt: new Date(String(r.lauf_at)).toISOString(), ergebnis: r.ergebnis as T }))
  } catch {
    return []
  }
}
