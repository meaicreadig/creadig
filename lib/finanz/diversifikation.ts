import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { GESCHAEFTSFELDER, geschaeftsfeldSchluessel } from "@/lib/finanz/beleg-felder"

/**
 * Konzentrationsrisiko (Phase 3) — reine Ableitung aus fin_buchungen, keine
 * eigene Tabelle. Zeigt, wie abhängig der Owner von einer einzelnen Säule
 * ist. Rein monetär: Reichweite/Follower/Content-KPIs gehören bewusst NICHT
 * hierher (eigene, spätere "Marketing"-Seite).
 */
export type SaeulenAnteil = { key: string; label: string; einCent: number; anteil: number }

export type Diversifikation = {
  gesamtCent: number
  anteile: SaeulenAnteil[]
  aktiveSaeulen: number
  /** Ab 70 % Anteil einer einzigen Säule an mind. 2 aktiven Säulen — deutlich, nicht alarmistisch. */
  konzentriert: boolean
  hoechsteSaeule: SaeulenAnteil | null
}

const SCHWELLE = 0.7

export async function ladeDiversifikation(db: Abfrage, heute: string): Promise<Diversifikation> {
  const r = await db(
    `SELECT coalesce(geschaeftsfeld, 'offen') AS feld, sum(brutto_cent) AS s
       FROM fin_buchungen
      WHERE art = 'einnahme' AND status = 'gebucht' AND storniert_at IS NULL
        AND datum > ($1::date - interval '12 months') AND datum <= $1::date
      GROUP BY 1`,
    [heute],
  )
  const labels = new Map<string, string>([...GESCHAEFTSFELDER.map((g) => [g.key, g.label] as [string, string]), ["offen", "Noch nicht zugeordnet"]])
  /* geschaeftsfeldSchluessel() uebersetzt einen alten, GoBD-eingefrorenen Wert (siehe lib/finanz/felder.ts) — mehrere SQL-Gruppen koennen so in eine Saeule zusammenfallen. */
  const sums = new Map<string, number>()
  for (const x of r) sums.set(geschaeftsfeldSchluessel(String(x.feld)), (sums.get(geschaeftsfeldSchluessel(String(x.feld))) ?? 0) + Number(x.s))
  const gesamtCent = [...sums.values()].reduce((a, b) => a + b, 0)
  const anteile = [...sums.entries()]
    .map(([key, einCent]) => ({ key, label: labels.get(key) ?? key, einCent, anteil: gesamtCent > 0 ? einCent / gesamtCent : 0 }))
    .filter((a) => a.einCent > 0)
    .sort((a, b) => b.einCent - a.einCent)

  const hoechsteSaeule = anteile[0] ?? null
  return {
    gesamtCent,
    anteile,
    aktiveSaeulen: anteile.length,
    konzentriert: anteile.length >= 2 && (hoechsteSaeule?.anteil ?? 0) >= SCHWELLE,
    hoechsteSaeule,
  }
}
