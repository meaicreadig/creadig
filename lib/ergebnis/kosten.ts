import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * KOSTEN GEGEN EINNAHMEN — 24.10.2026.
 *
 * Bis hierher wusste niemand, was die KI-Firma im Monat kostet. Die
 * KI-Kosten kommen direkt vom AI Gateway (Spend-Report, echte Beträge, keine
 * Schätzung); feste Kosten (Hosting, Datenbank, Mail, Domains) trägt Emin
 * einmal als FIXKOSTEN_EUR_MONAT ein. Dagegen steht, was bezahlt wurde.
 */

const USD_EUR = Number(process.env.USD_EUR_KURS) || 0.92
const tag = (d: Date) => d.toISOString().slice(0, 10)

export type KostenBild = {
  tage: number
  kiEur: number | null
  kiAnfragen: number | null
  fixEur: number | null
  bezahltEur: number
  /** Größte KI-Kostenposten nach Modell. */
  modelle: { model: string; eur: number }[]
}

export async function kostenBild(q: Abfrage, tage = 30): Promise<KostenBild> {
  const bis = new Date()
  const von = new Date(Date.now() - tage * 864e5)
  let kiEur: number | null = null
  let kiAnfragen: number | null = null
  let modelle: KostenBild["modelle"] = []
  try {
    const { gateway } = await import("ai")
    const r = await gateway.getSpendReport({ startDate: tag(von), endDate: tag(bis), groupBy: "model" })
    kiEur = Math.round(r.results.reduce((n, x) => n + x.totalCost, 0) * USD_EUR * 100) / 100
    kiAnfragen = r.results.reduce((n, x) => n + (x.requestCount ?? 0), 0)
    modelle = r.results
      .map((x) => ({ model: x.model ?? "?", eur: Math.round(x.totalCost * USD_EUR * 100) / 100 }))
      .sort((a, b) => b.eur - a.eur)
      .slice(0, 3)
  } catch (e) {
    console.error("[kosten] gateway", e instanceof Error ? e.message : e)
  }
  const fixMonat = Number(process.env.FIXKOSTEN_EUR_MONAT)
  const [b] = (await q(
    `SELECT coalesce(sum((summen->>'bruttoCent')::bigint), 0)::bigint AS cent FROM fin_dokumente
      WHERE art = 'rechnung' AND bezahlt_am >= $1::date`,
    [tag(von)],
  ).catch(() => [{ cent: 0 }])) as { cent: string | number }[]
  return {
    tage,
    kiEur,
    kiAnfragen,
    fixEur: Number.isFinite(fixMonat) && fixMonat > 0 ? Math.round((fixMonat * tage) / 30) : null,
    bezahltEur: Math.round(Number(b?.cent ?? 0)) / 100,
    modelle,
  }
}

export function kostenZeile(k: KostenBild): string {
  const eur = (n: number) => `${n.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €`
  const kosten = (k.kiEur ?? 0) + (k.fixEur ?? 0)
  return [
    `${k.tage} Tage: KI ${k.kiEur === null ? "nicht messbar" : `${eur(k.kiEur)} (${k.kiAnfragen ?? 0} Aufrufe)`}`,
    k.fixEur === null ? "Fixkosten nicht eingetragen (FIXKOSTEN_EUR_MONAT)" : `Fixkosten ${eur(k.fixEur)}`,
    `bezahlt ${eur(k.bezahltEur)}`,
    k.kiEur === null ? null : `Saldo ${eur(k.bezahltEur - kosten)}`,
  ]
    .filter(Boolean)
    .join(" · ")
}
