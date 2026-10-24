import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { protokolliere } from "@/lib/finanz/store"

/**
 * Wartet creaDIG noch auf das Finanzamt (Erfassung, erster Bescheid)?
 *
 * 24.10.2026, Owner: „Finanzamt olayı henüz beklemede." Bis dahin sind die
 * vom System angelegten ESt- und USt-Fristen ohne Betrag Wartepunkte, keine
 * Versäumnisse — die Morgenmail meldete sie als „44 Tage überfällig".
 * Gespeichert im Finanzprotokoll (letzter Eintrag gilt), ohne neue Spalte.
 */
export async function finanzamtWartet(db: Abfrage): Promise<{ wartet: boolean; seit: string | null }> {
  const [r] = (await db(
    `SELECT daten->>'wartet' AS wartet, created_at::date::text AS seit FROM fin_protokoll WHERE aktion = 'finanzamt_status' ORDER BY created_at DESC LIMIT 1`,
    [],
  ).catch(() => [])) as { wartet?: string; seit?: string }[]
  return { wartet: r?.wartet === "true", seit: r?.seit ?? null }
}

export async function setzeFinanzamtWartet(db: Abfrage, wartet: boolean): Promise<void> {
  await protokolliere(db, "finanzamt_status", { wartet })
}

/** Ruht diese Frist, solange das Finanzamt aussteht? Nur Steuerfristen ohne Betrag aus einem Bescheid. */
export const ruhtBeimAmt = (f: { art: string; betragCent: number | null }) => (f.art === "est" || f.art === "ust") && f.betragCent === null
