import "server-only"

import { randomUUID } from "node:crypto"

import { findeAblauf } from "@/lib/motor/ablaeufe"
import { motorDb } from "@/lib/motor/db"
import { ereignis } from "@/lib/motor/ereignis"
import { tabelleFehlt, type Abfrage } from "@/lib/neon-abfrage"

const PRO_TAKT = 25
const MAX_VERSUCHE = 5

export type TaktErgebnis = { abgearbeitet: number; fehler: number; zeitEreignisse: number }

/**
 * Ein Takt: fällige Schritte ausführen. Ausfallsicher durch
 * - Lease (lease_until): ein abgestürzter Lauf wird nach 5 Min wieder frei,
 * - SKIP LOCKED: zwei gleichzeitige Takte nehmen sich nichts weg,
 * - idempotente Schritte (Vorschlag mit Schlüssel run:schritt),
 * - Backoff 2^n Minuten, nach 5 Fehlversuchen Status 'fehler'.
 * Beliebig oft aufrufbar — Cron, Admin-Aufruf, direkt nach einem Ereignis.
 */
export async function takt(): Promise<TaktErgebnis> {
  const ergebnis: TaktErgebnis = { abgearbeitet: 0, fehler: 0, zeitEreignisse: 0 }
  const q = await motorDb()
  if (!q) return ergebnis

  ergebnis.zeitEreignisse = await zeitEreignisse(q)

  const faellig = await q(
    `UPDATE motor_runs SET lease_until = now() + interval '5 minutes', versuche = versuche + 1, updated_at = now()
      WHERE id IN (
        SELECT id FROM motor_runs
         WHERE status = 'aktiv' AND next_at <= now() AND (lease_until IS NULL OR lease_until < now())
         ORDER BY next_at LIMIT ${PRO_TAKT}
         FOR UPDATE SKIP LOCKED)
      RETURNING id, ablauf, subjekt, kontakt_id, schritt, versuche`,
    [],
  )

  for (const run of faellig) {
    const id = String(run.id)
    const schrittNr = Number(run.schritt)
    try {
      const ablauf = findeAblauf(String(run.ablauf))
      if (!ablauf) throw new Error(`Ablauf ${String(run.ablauf)} unbekannt`)
      const schritt = ablauf.schritte[schrittNr]

      if (schritt) {
        await q(
          `INSERT INTO motor_vorschlaege (id, schluessel, run_id, ablauf, art, subjekt, kontakt_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (schluessel) DO NOTHING`,
          [`vs_${randomUUID()}`, `${id}:${schrittNr}`, id, ablauf.id, schritt.art, String(run.subjekt), run.kontakt_id ?? null],
        )
      }

      const naechster = ablauf.schritte[schrittNr + 1]
      await q(
        `UPDATE motor_runs
            SET schritt = schritt + 1, versuche = 0, lease_until = NULL, letzter_fehler = NULL, updated_at = now(),
                status = CASE WHEN $3::boolean THEN 'aktiv' ELSE 'fertig' END,
                next_at = now() + make_interval(hours => $4)
          WHERE id = $1 AND schritt = $2 AND status = 'aktiv'`,
        [id, schrittNr, Boolean(naechster), naechster?.nachStunden ?? 0],
      )
      ergebnis.abgearbeitet++
    } catch (error) {
      ergebnis.fehler++
      const meldung = (error instanceof Error ? error.message : String(error)).slice(0, 500)
      const versuche = Number(run.versuche)
      await q(
        `UPDATE motor_runs
            SET lease_until = NULL, letzter_fehler = $2, updated_at = now(),
                status = CASE WHEN $3::boolean THEN 'fehler' ELSE status END,
                next_at = now() + make_interval(mins => $4)
          WHERE id = $1`,
        [id, meldung, versuche >= MAX_VERSUCHE, 2 ** Math.min(versuche, 10)],
      ).catch(() => {})
    }
  }

  await q(
    `INSERT INTO motor_takt (id, letzter_lauf, ergebnis) VALUES ('takt', now(), $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET letzter_lauf = now(), ergebnis = EXCLUDED.ergebnis`,
    [JSON.stringify(ergebnis)],
  ).catch(() => {})

  return ergebnis
}

/** Ereignisse, die nur durch Zeit entstehen — z. B. "Termin ist vorbei". */
async function zeitEreignisse(q: Abfrage): Promise<number> {
  try {
    const vorbei = await q(
      `SELECT a.id, a.contact_id FROM appointments a
        WHERE a.ends_at < now() AND a.ends_at > now() - interval '7 days'
          AND a.status IN ('booked','confirmed','completed')
          AND NOT EXISTS (SELECT 1 FROM motor_events e WHERE e.schluessel = 'termin_vorbei:' || a.id)
        LIMIT 50`,
      [],
    )
    for (const t of vorbei) {
      await ereignis(
        "termin_vorbei",
        { kontaktId: (t.contact_id as string | null) ?? null, subjekt: `termin:${String(t.id)}`, schluessel: `termin_vorbei:${String(t.id)}` },
        { ohneTakt: true },
      )
    }
    return vorbei.length
  } catch (error) {
    if (tabelleFehlt(error, "appointments")) return 0
    throw error
  }
}

export type MotorStand = {
  aktiv: number
  fehler: number
  offeneVorschlaege: number
  letzterTakt: string | null
}

export async function motorStand(): Promise<MotorStand | null> {
  try {
    const q = await motorDb()
    if (!q) return null
    const [r] = await q(
      `SELECT
         (SELECT count(*) FROM motor_runs WHERE status = 'aktiv')::int AS aktiv,
         (SELECT count(*) FROM motor_runs WHERE status = 'fehler')::int AS fehler,
         (SELECT count(*) FROM motor_vorschlaege WHERE status = 'offen')::int AS offen,
         (SELECT letzter_lauf FROM motor_takt WHERE id = 'takt') AS letzter`,
      [],
    )
    return {
      aktiv: Number(r.aktiv),
      fehler: Number(r.fehler),
      offeneVorschlaege: Number(r.offen),
      letzterTakt: r.letzter ? new Date(r.letzter as string).toISOString() : null,
    }
  } catch {
    return null
  }
}
