import { neonAbfrage } from "@/lib/neon-abfrage"

/**
 * Cockpit-Band der Admin-Startseite: nur Lese-Abfragen auf bestehende
 * Tabellen. Jede Kennzahl ist einzeln gemessen — scheitert eine Abfrage,
 * steht dort `null` („nicht gemessen“), nie eine erfundene Null.
 */
export type CockpitDaten = {
  anfragen7: number | null
  anfragenVor7: number | null
  pipelineWert: number | null
  pipelineOffen: number | null
  rechnungenGestellt: number | null
  posts7: number | null
  wochen: { start: string; anzahl: number }[] | null
  stufen: { stufe: string; anzahl: number }[] | null
  quellen: { quelle: string; anzahl: number }[] | null
}

const LEER: CockpitDaten = {
  anfragen7: null,
  anfragenVor7: null,
  pipelineWert: null,
  pipelineOffen: null,
  rechnungenGestellt: null,
  posts7: null,
  wochen: null,
  stufen: null,
  quellen: null,
}

export const STUFEN = ["new", "contacted", "qualified", "discovery", "audit", "proposal", "negotiation", "won", "lost"] as const

export async function ladeCockpit(): Promise<CockpitDaten> {
  const q = neonAbfrage()
  if (!q) return LEER

  const eins = async <T,>(text: string, lesen: (rows: Record<string, unknown>[]) => T): Promise<T | null> => {
    try {
      return lesen(await q(text, []))
    } catch {
      return null
    }
  }
  const zahl = (v: unknown) => Number(v ?? 0)

  const [anfragen, pipeline, rechnungen, posts, wochen, stufen, quellen] = await Promise.all([
    eins(
      `SELECT count(*) FILTER (WHERE created_at >= now() - interval '7 days') AS jetzt,
              count(*) FILTER (WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days') AS vorher
         FROM leads`,
      (r) => ({ jetzt: zahl(r[0]?.jetzt), vorher: zahl(r[0]?.vorher) }),
    ),
    eins(
      `SELECT coalesce(sum(estimated_value), 0) AS wert, count(*) AS offen
         FROM opportunities WHERE status NOT IN ('won','lost')`,
      (r) => ({ wert: zahl(r[0]?.wert), offen: zahl(r[0]?.offen) }),
    ),
    eins(`SELECT count(*) AS n FROM invoices WHERE state = 'gestellt'`, (r) => zahl(r[0]?.n)),
    eins(`SELECT count(*) AS n FROM publications WHERE veroeffentlicht_am >= current_date - 7`, (r) => zahl(r[0]?.n)),
    eins(
      `SELECT to_char(w, 'YYYY-MM-DD') AS start, count(l.id) AS anzahl
         FROM generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') AS w
         LEFT JOIN leads l ON l.created_at >= w AND l.created_at < w + interval '1 week'
        GROUP BY w ORDER BY w`,
      (r) => r.map((x) => ({ start: String(x.start), anzahl: zahl(x.anzahl) })),
    ),
    eins(`SELECT status AS stufe, count(*) AS anzahl FROM opportunities GROUP BY status`, (r) =>
      r.map((x) => ({ stufe: String(x.stufe), anzahl: zahl(x.anzahl) })),
    ),
    eins(
      `SELECT coalesce(nullif(utm_source, ''), source) AS quelle, count(*) AS anzahl
         FROM leads WHERE created_at >= now() - interval '90 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 5`,
      (r) => r.map((x) => ({ quelle: String(x.quelle), anzahl: zahl(x.anzahl) })),
    ),
  ])

  return {
    anfragen7: anfragen?.jetzt ?? null,
    anfragenVor7: anfragen?.vorher ?? null,
    pipelineWert: pipeline?.wert ?? null,
    pipelineOffen: pipeline?.offen ?? null,
    rechnungenGestellt: rechnungen,
    posts7: posts,
    wochen,
    stufen,
    quellen,
  }
}
