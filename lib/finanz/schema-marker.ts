import { createHash } from "node:crypto"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Schema-Marker: das Anlegen der Tabellen läuft einmal je SQL-Stand, nicht bei
 * jedem Kaltstart.
 *
 * Vorher führte jede neue Serverless-Instanz ALLE Schema-Anweisungen aus
 * (über hundert nacheinander, jede ein Netzwerk-Rundlauf zur Datenbank) — das
 * war das „hakt, lädt nicht schnell“ beim ersten Klick auf eine Finanz-Seite.
 *
 * Jetzt: Hash über die Anweisungen. Steht er schon in `fin_schema_marker`, ist
 * der Aufruf EIN Rundlauf. Ändert sich der SQL-Text, ändert sich der Hash, und
 * es läuft einmal neu durch (alles ist idempotent). Mehrere Hashes dürfen
 * nebeneinander stehen (zwei Deployments gegen dieselbe Datenbank).
 */
export async function mitSchemaMarker(db: Abfrage, name: string, anweisungen: readonly string[]): Promise<void> {
  const hash = createHash("sha256").update(anweisungen.join("\n;;\n")).digest("hex").slice(0, 32)
  try {
    const da = await db(`SELECT 1 FROM fin_schema_marker WHERE name = $1 AND hash = $2`, [name, hash])
    if (da.length) return
  } catch {
    /* Tabelle fehlt noch (erster Lauf) — unten anlegen. */
  }
  for (const sql of anweisungen) await db(sql, [])
  await db(`CREATE TABLE IF NOT EXISTS fin_schema_marker (name text NOT NULL, hash text NOT NULL, at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (name, hash))`, [])
  await db(`INSERT INTO fin_schema_marker (name, hash) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [name, hash])
}
