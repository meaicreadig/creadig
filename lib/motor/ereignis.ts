import "server-only"

import { randomUUID } from "node:crypto"

import { ABLAEUFE, type EreignisTyp } from "@/lib/motor/ablaeufe"
import { motorDb } from "@/lib/motor/db"

export type EreignisEingabe = {
  /** Kontakt, falls bekannt — dann ist das Subjekt `contact:<id>`. */
  kontaktId?: string | null
  /** Subjekt ohne Kontakt, z. B. `lead:<id>` oder `termin:<id>`. */
  subjekt?: string
  daten?: Record<string, unknown>
  /** Gleicher Schlüssel = gleiches Ereignis; Wiederholungen werden verschluckt. */
  schluessel?: string
}

/**
 * Ein Ereignis in den Strom schreiben, betroffene Abläufe stoppen und
 * passende starten. Wirft nie: der eigentliche Vorgang (Gespräch speichern,
 * Termin buchen …) darf am Motor nicht scheitern.
 */
export async function ereignis(typ: EreignisTyp, e: EreignisEingabe, optionen: { ohneTakt?: boolean } = {}): Promise<void> {
  try {
    const q = await motorDb()
    if (!q) return
    const kontaktId = e.kontaktId ?? null
    const subjekt = kontaktId ? `contact:${kontaktId}` : e.subjekt
    if (!subjekt) return
    const daten = e.daten ?? {}

    const neu = await q(
      `INSERT INTO motor_events (id, typ, subjekt, kontakt_id, daten, schluessel)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       ON CONFLICT (schluessel) DO NOTHING RETURNING id`,
      [`ev_${randomUUID()}`, typ, subjekt, kontaktId, JSON.stringify(daten), e.schluessel ?? null],
    )
    if (neu.length === 0) return

    const zuStoppen = ABLAEUFE.filter((a) => a.stopptBei.includes(typ)).map((a) => a.id)
    if (zuStoppen.length > 0) {
      await q(
        `UPDATE motor_runs SET status = 'gestoppt', gestoppt_durch = $3, lease_until = NULL, updated_at = now()
          WHERE status = 'aktiv' AND subjekt = $1 AND ablauf = ANY($2::text[])`,
        [subjekt, zuStoppen, typ],
      )
    }

    let sofort = false
    for (const ablauf of ABLAEUFE) {
      if (ablauf.ausloeser !== typ) continue
      if (ablauf.bedingung && !ablauf.bedingung(daten)) continue
      const erster = ablauf.schritte[0]
      if (!erster) continue
      const gestartet = await q(
        `INSERT INTO motor_runs (id, ablauf, subjekt, kontakt_id, next_at, ausgeloest_von)
         VALUES ($1, $2, $3, $4, now() + make_interval(hours => $5), $6)
         ON CONFLICT (ablauf, subjekt) WHERE status = 'aktiv' DO NOTHING RETURNING id`,
        [`run_${randomUUID()}`, ablauf.id, subjekt, kontaktId, erster.nachStunden, String(neu[0].id)],
      )
      if (gestartet.length > 0 && erster.nachStunden === 0) sofort = true
    }

    if (sofort && !optionen.ohneTakt) {
      const { takt } = await import("@/lib/motor/takt")
      await takt()
    }
  } catch (error) {
    console.error("[motor] ereignis", typ, error instanceof Error ? error.message : error)
  }
}
