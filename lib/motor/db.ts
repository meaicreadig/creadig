import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

/**
 * Der Motor legt sein Schema selbst an (additiv, idempotent), weil die
 * Produktions-DATABASE_URL "Sensitive" ist und nicht von aussen migriert
 * werden kann. Gleicher Text liegt in scripts/migrations/028-motor.sql.
 */
export const MOTOR_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS motor_events (
    id text PRIMARY KEY,
    typ text NOT NULL,
    subjekt text NOT NULL,
    kontakt_id text,
    daten jsonb NOT NULL DEFAULT '{}'::jsonb,
    schluessel text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS motor_events_subjekt_idx ON motor_events (subjekt, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS motor_runs (
    id text PRIMARY KEY,
    ablauf text NOT NULL,
    subjekt text NOT NULL,
    kontakt_id text,
    schritt int NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','fertig','gestoppt','fehler')),
    next_at timestamptz NOT NULL,
    lease_until timestamptz,
    versuche int NOT NULL DEFAULT 0,
    letzter_fehler text,
    ausgeloest_von text,
    gestoppt_durch text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE UNIQUE INDEX IF NOT EXISTS motor_runs_aktiv_uq ON motor_runs (ablauf, subjekt) WHERE status = 'aktiv'`,
  `CREATE INDEX IF NOT EXISTS motor_runs_faellig_idx ON motor_runs (next_at) WHERE status = 'aktiv'`,
  `CREATE TABLE IF NOT EXISTS motor_vorschlaege (
    id text PRIMARY KEY,
    schluessel text NOT NULL UNIQUE,
    run_id text REFERENCES motor_runs (id) ON DELETE CASCADE,
    ablauf text NOT NULL,
    art text NOT NULL,
    subjekt text NOT NULL,
    kontakt_id text,
    status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','erledigt','verworfen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    erledigt_at timestamptz)`,
  `CREATE INDEX IF NOT EXISTS motor_vorschlaege_offen_idx ON motor_vorschlaege (created_at DESC) WHERE status = 'offen'`,
  `CREATE TABLE IF NOT EXISTS motor_takt (
    id text PRIMARY KEY,
    letzter_lauf timestamptz NOT NULL,
    ergebnis jsonb NOT NULL DEFAULT '{}'::jsonb)`,
]

let schemaBereit: Promise<void> | null = null

/** Abfrage mit fertigem Schema — oder `null`, wenn kein Speicher verbunden ist. */
export async function motorDb(): Promise<Abfrage | null> {
  const abfrage = neonAbfrage()
  if (!abfrage) return null
  if (!schemaBereit) {
    schemaBereit = (async () => {
      for (const ddl of MOTOR_SCHEMA) await abfrage(ddl, [])
    })().catch((e) => {
      schemaBereit = null
      throw e
    })
  }
  await schemaBereit
  return abfrage
}
