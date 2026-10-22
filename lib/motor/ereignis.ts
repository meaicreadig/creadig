import "server-only"

import { randomUUID } from "node:crypto"

import { ABLAEUFE, type EreignisTyp } from "@/lib/motor/ablaeufe"
import { motorDb } from "@/lib/motor/db"
import type { Abfrage } from "@/lib/neon-abfrage"

export type EreignisEingabe = {
  /** Kontakt, falls bekannt — dann ist das Subjekt `contact:<id>`. */
  kontaktId?: string | null
  /** Subjekt ohne Kontakt, z. B. `lead:<id>` oder `termin:<id>`. */
  subjekt?: string
  /** Mailadresse der Person, falls bekannt — stoppt auch Abläufe ihrer Anfrage (lead), die noch keinem Kontakt gehört. */
  email?: string | null
  daten?: Record<string, unknown>
  /** Gleicher Schlüssel = gleiches Ereignis; Wiederholungen werden verschluckt. */
  schluessel?: string
}

/**
 * Wer bei welchem Ereignis sofort weiterarbeitet – ohne auf den Morgen-Takt zu warten.
 * Das ist das Zuspiel zwischen den Abteilungen: Auftrag erteilt → Projektleitung legt das
 * Projekt an, Finanz bereitet den Entwurf vor.
 */
export const REAKTIONEN: Partial<Record<EreignisTyp, string[]>> = {
  auftrag_erteilt: ["projekte", "finanz"],
}

/** Gleiche Person, anderes Subjekt: Abläufe der Anfrage (`lead:<id>`) gehören zum Kontakt bzw. zur Mailadresse. */
async function stoppeVerwandte(q: Abfrage, typ: EreignisTyp, zuStoppen: string[], kontaktId: string | null, email: string | null): Promise<void> {
  if (!kontaktId && !email) return
  await q(
    `UPDATE motor_runs SET status = 'gestoppt', gestoppt_durch = $4, lease_until = NULL, updated_at = now()
      WHERE status = 'aktiv' AND ablauf = ANY($1::text[])
        AND (($2::text IS NOT NULL AND kontakt_id = $2::text)
          OR subjekt IN (SELECT 'lead:' || l.id FROM leads l
                          WHERE ($2::text IS NOT NULL AND l.contact_id = $2::text)
                             OR ($3::text IS NOT NULL AND lower(l.email) = $3::text)))`,
    [zuStoppen, kontaktId, email?.trim().toLowerCase() || null, typ],
  ).catch((err) => console.error("[motor] verwandte Abläufe", typ, err instanceof Error ? err.message : err))
}

/** Folgeagenten nach der Antwort starten (Sperre verhindert Doppelläufe mit dem Takt). */
async function loeseReaktionAus(typ: EreignisTyp): Promise<void> {
  const agenten = REAKTIONEN[typ]
  if (!agenten?.length) return
  const lauf = async () => {
    const { fuehreAgentAus, AGENT_KEYS } = await import("@/lib/assistent/truppe")
    for (const key of agenten) {
      if ((AGENT_KEYS as readonly string[]).includes(key)) await fuehreAgentAus(key as (typeof AGENT_KEYS)[number])
    }
  }
  try {
    const { after } = await import("next/server")
    after(() => lauf().catch((err) => console.error("[motor] reaktion", typ, err instanceof Error ? err.message : err)))
  } catch {
    /* Außerhalb einer Anfrage (Skript, Drill): direkt ausführen. */
    await lauf().catch((err) => console.error("[motor] reaktion", typ, err instanceof Error ? err.message : err))
  }
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
      await stoppeVerwandte(q, typ, zuStoppen, kontaktId, e.email ?? null)
    }
    await loeseReaktionAus(typ)

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
