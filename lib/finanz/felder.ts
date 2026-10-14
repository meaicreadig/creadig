import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { GESCHAEFTSFELDER, belegeSchema } from "@/lib/finanz/belege"

/**
 * Ergebnis je Geschäftsfeld (netto, gebucht, nicht storniert). Das Feld eines
 * fibero-Belegs kommt live aus dem Eingangskorb (fin_belege), damit eine
 * Zuordnung dort sofort im Dashboard wirkt.
 */
export type FeldZeile = {
  key: string
  label: string
  einCent: number
  ausCent: number
  anzahl: number
}

export type FelderBild = {
  jahr: string
  felder: FeldZeile[]
  summe: { einCent: number; ausCent: number }
  offen: { anzahl: number; bruttoCent: number }
  quellen: { quelle: string; anzahl: number }[]
  monate: { schluessel: string; felder: Record<string, number> }[]
}

const NETTO = `CASE WHEN b.ust_satz > 0 THEN round(b.brutto_cent * 100.0 / (100 + b.ust_satz)) ELSE b.brutto_cent END`
const FELD = `COALESCE(b.geschaeftsfeld, fb.geschaeftsfeld, 'offen')`
const JOIN = `FROM fin_buchungen b
  LEFT JOIN fin_belege fb ON fb.quelle = 'fibero' AND b.id = 'fibero-exp-' || fb.extern_id`

export async function ladeFelder(db: Abfrage, jahr: string): Promise<FelderBild> {
  await belegeSchema(db)
  const p = [`${jahr}-01-01`, `${Number(jahr) + 1}-01-01`]
  const basis = `b.storniert_at IS NULL AND b.status = 'gebucht' AND b.datum >= $1 AND b.datum < $2`

  const [zeilen, offen, quellen, monate] = await Promise.all([
    db(`SELECT ${FELD} AS feld, b.art, sum(${NETTO}) AS netto, count(*) AS c ${JOIN} WHERE ${basis} GROUP BY 1, 2`, p),
    db(
      `SELECT count(*) AS c, coalesce(sum(b.brutto_cent),0) AS s FROM fin_buchungen b
        WHERE b.storniert_at IS NULL AND b.art = 'einnahme' AND b.bezahlt = false`,
      [],
    ),
    db(`SELECT b.quelle, count(*) AS c FROM fin_buchungen b WHERE ${basis} GROUP BY 1 ORDER BY 2 DESC`, p),
    db(
      `SELECT to_char(b.datum,'YYYY-MM') AS m, ${FELD} AS feld,
              sum(CASE WHEN b.art = 'einnahme' THEN ${NETTO} ELSE -${NETTO} END) AS netto
         ${JOIN} WHERE ${basis} GROUP BY 1, 2 ORDER BY 1`,
      p,
    ),
  ])

  const labels = new Map<string, string>([
    ...GESCHAEFTSFELDER.map((g) => [g.key, g.label] as [string, string]),
    ["offen", "Noch nicht zugeordnet"],
  ])
  const karte = new Map<string, FeldZeile>()
  for (const r of zeilen) {
    const key = String(r.feld)
    const z = karte.get(key) ?? { key, label: labels.get(key) ?? key, einCent: 0, ausCent: 0, anzahl: 0 }
    if (r.art === "einnahme") z.einCent += Number(r.netto)
    else z.ausCent += Number(r.netto)
    z.anzahl += Number(r.c)
    karte.set(key, z)
  }
  const felder = [...karte.values()].sort((a, b) => b.einCent - b.ausCent - (a.einCent - a.ausCent))

  const proMonat = new Map<string, Record<string, number>>()
  for (const r of monate) {
    const m = String(r.m)
    const eintrag = proMonat.get(m) ?? {}
    eintrag[String(r.feld)] = Number(r.netto)
    proMonat.set(m, eintrag)
  }

  return {
    jahr,
    felder,
    summe: felder.reduce((s, f) => ({ einCent: s.einCent + f.einCent, ausCent: s.ausCent + f.ausCent }), { einCent: 0, ausCent: 0 }),
    offen: { anzahl: Number(offen[0]?.c ?? 0), bruttoCent: Number(offen[0]?.s ?? 0) },
    quellen: quellen.map((r) => ({ quelle: String(r.quelle), anzahl: Number(r.c) })),
    monate: [...proMonat.entries()].map(([schluessel, f]) => ({ schluessel, felder: f })),
  }
}
