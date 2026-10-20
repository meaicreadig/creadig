import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { auftraegeSchema } from "@/lib/finanz/auftraege/store"
import { ladeOffeneRechnungenFuerAbgleich } from "@/lib/finanz/bank-abgleich"
import { abgleichStand } from "@/lib/finanz/fibero-abgleich"
import { ladeOffeneEinnahmen } from "@/lib/finanz/felder"
import { finanzSchema } from "@/lib/finanz/store"

/**
 * Die Finanz-Kurzlage für alles außerhalb von /finanz (Cockpit, Hauptsitz,
 * Morgenbriefing, Morgenmail): keine eigene Rechnung, nur die bestehenden
 * Abfragen der Finanzabteilung an einer Stelle gebündelt.
 */

export async function ladeOffeneRechnungenSumme(db: Abfrage): Promise<{ offenCent: number; anzahl: number }> {
  await finanzSchema(db)
  await auftraegeSchema(db)
  const offen = (await ladeOffeneRechnungenFuerAbgleich(db)).filter((r) => r.offenCent > 0)
  return { offenCent: offen.reduce((summe, r) => summe + r.offenCent, 0), anzahl: offen.length }
}

/** Ab diesem Tag des Monats erinnert die Morgenmail an fehlende Pauschalen — davor ist der Monat noch nicht abgeschlossen. */
export const PAUSCHALEN_ERINNERUNG_AB_TAG = 25

export type FinanzKurzlage = {
  offeneEinnahmen: { anzahl: number; bruttoCent: number }
  offeneRechnungen: { anzahl: number; offenCent: number }
  /** ISO-Zeitpunkt des letzten Fibero-Abgleichs, null = noch nie gelaufen. */
  abgleichAt: string | null
  /** Hat der laufende Monat schon eine Verpflegungs- oder Homeoffice-Pauschale? (Fahrt-Pauschalen kommen automatisch und zählen nicht.) */
  pauschaleErfasst: boolean
}

export async function ladeFinanzKurzlage(db: Abfrage, heute: string): Promise<FinanzKurzlage> {
  await finanzSchema(db)
  const [offeneEinnahmen, offeneRechnungen, stand, pauschale] = await Promise.all([
    ladeOffeneEinnahmen(db),
    ladeOffeneRechnungenSumme(db),
    abgleichStand(db),
    db(
      `SELECT count(*) AS c FROM fin_buchungen
        WHERE quelle = 'pauschale' AND storniert_at IS NULL
          AND kategorie IN ('Verpflegungspauschale','Homeoffice-Pauschale')
          AND to_char(datum,'YYYY-MM') = $1`,
      [heute.slice(0, 7)],
    ),
  ])
  return { offeneEinnahmen, offeneRechnungen, abgleichAt: stand.laufAt, pauschaleErfasst: Number(pauschale[0]?.c ?? 0) > 0 }
}
