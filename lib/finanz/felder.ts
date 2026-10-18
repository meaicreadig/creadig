import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { GESCHAEFTSFELDER, belegeSchema, geschaeftsfeldSchluessel } from "@/lib/finanz/belege"

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
  pruefung: { zuPruefen: number; unklar: number; fremdwaehrung: number; privat: number }
}

export const NETTO_ROH_SQL = `CASE WHEN b.ust_satz > 0 THEN b.brutto_cent * 100.0 / (100 + b.ust_satz) ELSE b.brutto_cent END`
/** Gewinnwirksam im Belegjahr: Anlagegut nur 1. AfA-Rate, sonst abzugsfähiger Anteil. Exportiert, weil lib/finanz/euer.ts dieselbe Rechnung braucht — eine Formel, nicht zwei. */
export const NETTO_SQL = `round(CASE WHEN b.afa_jahre > 0 THEN (${NETTO_ROH_SQL}) / b.afa_jahre
  ELSE (${NETTO_ROH_SQL}) * COALESCE(b.abzug_prozent, 100) / 100.0 END)`
const NETTO_ROH = NETTO_ROH_SQL
const NETTO = NETTO_SQL
const FELD = `COALESCE(b.geschaeftsfeld, fb.geschaeftsfeld, 'offen')`
const JOIN = `FROM fin_buchungen b
  LEFT JOIN fin_belege fb ON fb.quelle = 'fibero' AND b.id = 'fibero-exp-' || fb.extern_id`

export async function ladeFelder(db: Abfrage, jahr: string): Promise<FelderBild> {
  await belegeSchema(db)
  const p = [`${jahr}-01-01`, `${Number(jahr) + 1}-01-01`]
  const basis = `b.storniert_at IS NULL AND b.status = 'gebucht' AND b.datum >= $1 AND b.datum < $2
    AND b.kategorie <> 'Privatentnahme'`

  const [zeilen, offen, quellen, monate, afa, pruef] = await Promise.all([
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
    db(
      `SELECT ${FELD} AS feld, extract(year FROM b.datum)::int AS start, b.afa_jahre AS n, ${NETTO_ROH} AS netto
         ${JOIN} WHERE b.storniert_at IS NULL AND b.status = 'gebucht' AND b.afa_jahre > 0 AND b.datum < $1`,
      [p[0]],
    ),
    db(
      `SELECT count(*) FILTER (WHERE b.pruefung = 'zu_pruefen') AS zu_pruefen,
              count(*) FILTER (WHERE b.pruefung = 'unklar') AS unklar,
              count(*) FILTER (WHERE b.waehrung IS NOT NULL AND b.waehrung <> 'EUR') AS fremd,
              count(*) FILTER (WHERE b.kategorie = 'Privatentnahme') AS privat
         FROM fin_buchungen b WHERE ${basis.replace("AND b.kategorie <> 'Privatentnahme'", "")}`,
      p,
    ),
  ])

  for (const r of afa) {
    const n = Number(r.n)
    const netto = Number(r.netto)
    const proJahr = netto / n
    const rate = Math.round(Math.max(0, Math.min(proJahr, netto - (Number(jahr) - Number(r.start)) * proJahr)))
    if (rate > 0) zeilen.push({ feld: r.feld, art: "ausgabe", netto: rate, c: 0 })
  }

  const labels = new Map<string, string>([
    ...GESCHAEFTSFELDER.map((g) => [g.key, g.label] as [string, string]),
    ["offen", "Noch nicht zugeordnet"],
  ])
  /*
   * geschaeftsfeldSchluessel() uebersetzt auch einen alten, GoBD-
   * eingefrorenen Wert ('it'/'software'/'ecommerce') auf seine neue Saeule
   * — eine schon gebuchte Zeile kann die Spalte selbst nicht mehr aendern
   * (siehe BELEGE_SCHEMA), zaehlt hier aber trotzdem korrekt mit.
   */
  const karte = new Map<string, FeldZeile>()
  for (const r of zeilen) {
    const key = geschaeftsfeldSchluessel(String(r.feld))
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
    const key = geschaeftsfeldSchluessel(String(r.feld))
    const eintrag = proMonat.get(m) ?? {}
    eintrag[key] = (eintrag[key] ?? 0) + Number(r.netto)
    proMonat.set(m, eintrag)
  }

  return {
    jahr,
    felder,
    summe: felder.reduce((s, f) => ({ einCent: s.einCent + f.einCent, ausCent: s.ausCent + f.ausCent }), { einCent: 0, ausCent: 0 }),
    offen: { anzahl: Number(offen[0]?.c ?? 0), bruttoCent: Number(offen[0]?.s ?? 0) },
    quellen: quellen.map((r) => ({ quelle: String(r.quelle), anzahl: Number(r.c) })),
    monate: [...proMonat.entries()].map(([schluessel, f]) => ({ schluessel, felder: f })),
    pruefung: {
      zuPruefen: Number(pruef[0]?.zu_pruefen ?? 0),
      unklar: Number(pruef[0]?.unklar ?? 0),
      fremdwaehrung: Number(pruef[0]?.fremd ?? 0),
      privat: Number(pruef[0]?.privat ?? 0),
    },
  }
}
