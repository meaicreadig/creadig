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
  /** Nächste offene Frist (Finanzamt); null = keine offen. `tage` < 0 = überfällig. */
  naechsteFrist: { titel: string; tage: number } | null
  /** Offene Rechnungen mit Fälligkeit vor heute (Anzahl). */
  ueberfaellig: number
}

export async function ladeFinanzKurzlage(db: Abfrage, heute: string): Promise<FinanzKurzlage> {
  await finanzSchema(db)
  const [offeneEinnahmen, offeneRechnungen, stand, pauschale, frist, ueber] = await Promise.all([
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
    /* Wartet das Finanzamt noch (lib/finanz/finanzamt.ts), ruhen ESt/USt-Fristen ohne Bescheid. */
    db(
      `SELECT titel, (faellig - $1::date) AS tage FROM fin_fristen
        WHERE erledigt_at IS NULL
          AND NOT (art IN ('est','ust') AND betrag_cent IS NULL AND coalesce(
            (SELECT daten->>'wartet' FROM fin_protokoll WHERE aktion = 'finanzamt_status' ORDER BY created_at DESC LIMIT 1), 'false') = 'true')
        ORDER BY faellig LIMIT 1`,
      [heute],
    ),
    db(
      `SELECT count(*) AS c FROM fin_dokumente fd
        WHERE fd.art = 'rechnung' AND fd.status IN ('versendet','teilbezahlt') AND fd.faellig_am < $1::date
          AND coalesce((fd.summen->>'bruttoCent')::bigint, 0) > coalesce((SELECT sum(z.cent) FROM fin_zahlungen z WHERE z.dokument_id = fd.id), 0)`,
      [heute],
    ),
  ])
  return {
    offeneEinnahmen,
    offeneRechnungen,
    abgleichAt: stand.laufAt,
    pauschaleErfasst: Number(pauschale[0]?.c ?? 0) > 0,
    naechsteFrist: frist[0] ? { titel: String(frist[0].titel), tage: Number(frist[0].tage) } : null,
    ueberfaellig: Number(ueber[0]?.c ?? 0),
  }
}
