import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * EZB-Referenzkurse (über frankfurter.dev) → Euro. Kurse werden je Tag
 * dauerhaft in fin_kurse gespeichert, damit eine Buchung bei jedem Abgleich
 * denselben Betrag bekommt. An Tagen ohne Kurs (Wochenende, Feiertag) gilt
 * der letzte veröffentlichte Kurs davor.
 */
const SCHEMA = `CREATE TABLE IF NOT EXISTS fin_kurse (
  waehrung text NOT NULL,
  datum date NOT NULL,
  kurs numeric NOT NULL,
  PRIMARY KEY (waehrung, datum))`

export type Umrechner = (betrag: number, waehrung: string, datum: string) => { eur: number; kurs: number } | null

export async function ladeUmrechner(db: Abfrage, bedarf: { waehrung: string; datum: string }[]): Promise<Umrechner> {
  await db(SCHEMA, [])
  const fremd = bedarf.filter((b) => b.waehrung && b.waehrung !== "EUR")
  const proWaehrung = new Map<string, string[]>()
  for (const b of fremd) proWaehrung.set(b.waehrung, [...(proWaehrung.get(b.waehrung) ?? []), b.datum])

  const kurse = new Map<string, [string, number][]>()
  for (const [waehrung, daten] of proWaehrung) {
    daten.sort()
    const von = daten[0]
    const bis = daten[daten.length - 1]
    const vorrat = await db(
      `SELECT to_char(datum,'YYYY-MM-DD') AS d, kurs FROM fin_kurse WHERE waehrung = $1 AND datum >= ($2::date - 10) AND datum <= $3 ORDER BY datum`,
      [waehrung, von, bis],
    )
    const liste = vorrat.map((r) => [String(r.d), Number(r.kurs)] as [string, number])
    const fehlt = daten.some((d) => !liste.some(([k]) => k <= d && k >= vorTagen(d, 10)))
    if (fehlt) {
      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/${vorTagen(von, 10)}..${bis}?base=${encodeURIComponent(waehrung)}&symbols=EUR`,
          { cache: "no-store" },
        )
        if (res.ok) {
          const json = (await res.json()) as { rates?: Record<string, { EUR?: number }> }
          const neu = Object.entries(json.rates ?? {})
            .filter(([, r]) => typeof r.EUR === "number")
            .map(([d, r]) => ({ waehrung, datum: d, kurs: r.EUR as number }))
          if (neu.length) {
            await db(
              `INSERT INTO fin_kurse (waehrung, datum, kurs)
               SELECT x.waehrung, x.datum::date, x.kurs FROM jsonb_to_recordset($1::jsonb) AS x(waehrung text, datum text, kurs numeric)
               ON CONFLICT DO NOTHING`,
              [JSON.stringify(neu)],
            )
            for (const n of neu) if (!liste.some(([d]) => d === n.datum)) liste.push([n.datum, n.kurs])
            liste.sort((a, b) => a[0].localeCompare(b[0]))
          }
        }
      } catch {
        /* ohne Kurs bleibt die Buchung als "nicht umgerechnet" markiert */
      }
    }
    kurse.set(waehrung, liste)
  }

  return (betrag, waehrung, datum) => {
    if (!waehrung || waehrung === "EUR") return { eur: betrag, kurs: 1 }
    const liste = kurse.get(waehrung) ?? []
    let treffer: number | null = null
    for (const [d, k] of liste) {
      if (d > datum) break
      treffer = k
    }
    return treffer === null ? null : { eur: betrag * treffer, kurs: treffer }
  }
}

function vorTagen(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}
