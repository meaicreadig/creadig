import { neonAbfrage } from "@/lib/neon-abfrage"

/**
 * Marketing-Band: nur Lese-Abfragen auf `publications` und `leads`.
 * Scheitert eine Abfrage, steht dort `null` („nicht gemessen“), nie eine erfundene Null.
 */
export type MarketingDaten = {
  posts30: number | null
  mitReaktion30: number | null
  anfragenAusPosts90: number | null
  linkedinLeads90: number | null
  wochen: { start: string; anzahl: number }[] | null
  kanaele: { kanal: string; anzahl: number }[] | null
  reaktionen: { reaktion: string; anzahl: number }[] | null
  letzte: { was: string; kanal: string; datum: string; reaktion: string; url: string | null }[] | null
  woche: { tag: string; posts: { was: string; kanal: string }[] }[] | null
  pipeline: { entwurf: number; freigegeben: number } | null
}

export async function ladeMarketing(): Promise<MarketingDaten> {
  const q = neonAbfrage()
  const leer: MarketingDaten = {
    posts30: null, mitReaktion30: null, anfragenAusPosts90: null, linkedinLeads90: null,
    wochen: null, kanaele: null, reaktionen: null, letzte: null, woche: null, pipeline: null,
  }
  if (!q) return leer

  const eins = async <T,>(text: string, lesen: (rows: Record<string, unknown>[]) => T): Promise<T | null> => {
    try {
      return lesen(await q(text, []))
    } catch {
      return null
    }
  }
  const zahl = (v: unknown) => Number(v ?? 0)

  const [summe, anfragen, linkedin, wochen, kanaele, reaktionen, letzte, woche, pipeline] = await Promise.all([
    eins(
      `SELECT count(*) AS posts, count(*) FILTER (WHERE reaktion <> 'keine') AS reaktion
         FROM publications WHERE veroeffentlicht_am >= current_date - 30 AND veroeffentlicht_am <= current_date`,
      (r) => ({ posts: zahl(r[0]?.posts), reaktion: zahl(r[0]?.reaktion) }),
    ),
    eins(
      `SELECT count(*) AS n FROM publications WHERE reaktion = 'anfrage' AND veroeffentlicht_am >= current_date - 90`,
      (r) => zahl(r[0]?.n),
    ),
    eins(
      `SELECT count(*) AS n FROM leads
        WHERE created_at >= now() - interval '90 days'
          AND (coalesce(utm_source, '') ILIKE '%linkedin%' OR coalesce(source, '') ILIKE '%linkedin%')`,
      (r) => zahl(r[0]?.n),
    ),
    eins(
      `SELECT to_char(w, 'YYYY-MM-DD') AS start, count(p.id) AS anzahl
         FROM generate_series(date_trunc('week', current_date) - interval '7 weeks', date_trunc('week', current_date), interval '1 week') AS w
         LEFT JOIN publications p ON p.veroeffentlicht_am >= w::date AND p.veroeffentlicht_am < (w + interval '1 week')::date
        GROUP BY w ORDER BY w`,
      (r) => r.map((x) => ({ start: String(x.start), anzahl: zahl(x.anzahl) })),
    ),
    eins(
      `SELECT kanal, count(*) AS anzahl FROM publications
        WHERE veroeffentlicht_am >= current_date - 90 GROUP BY kanal ORDER BY 2 DESC`,
      (r) => r.map((x) => ({ kanal: String(x.kanal), anzahl: zahl(x.anzahl) })),
    ),
    eins(
      `SELECT reaktion, count(*) AS anzahl FROM publications
        WHERE veroeffentlicht_am >= current_date - 90 AND reaktion <> 'keine' GROUP BY reaktion ORDER BY 2 DESC`,
      (r) => r.map((x) => ({ reaktion: String(x.reaktion), anzahl: zahl(x.anzahl) })),
    ),
    eins(
      `SELECT was, kanal, to_char(veroeffentlicht_am, 'YYYY-MM-DD') AS datum, reaktion, url
         FROM publications WHERE veroeffentlicht_am <= current_date
        ORDER BY veroeffentlicht_am DESC, created_at DESC LIMIT 5`,
      (r) =>
        r.map((x) => ({
          was: String(x.was), kanal: String(x.kanal), datum: String(x.datum),
          reaktion: String(x.reaktion), url: x.url ? String(x.url) : null,
        })),
    ),
    eins(
      `SELECT to_char(d, 'YYYY-MM-DD') AS tag,
              coalesce(json_agg(json_build_object('was', p.was, 'kanal', p.kanal)) FILTER (WHERE p.id IS NOT NULL), '[]') AS posts
         FROM generate_series(date_trunc('week', current_date), date_trunc('week', current_date) + interval '6 days', interval '1 day') AS d
         LEFT JOIN publications p ON p.veroeffentlicht_am = d::date
        GROUP BY d ORDER BY d`,
      (r) =>
        r.map((x) => ({
          tag: String(x.tag),
          posts: (Array.isArray(x.posts) ? x.posts : []).map((p: { was: unknown; kanal: unknown }) => ({
            was: String(p.was), kanal: String(p.kanal),
          })),
        })),
    ),
    eins(
      `SELECT count(*) FILTER (WHERE zustand = 'entwurf') AS entwurf,
              count(*) FILTER (WHERE zustand = 'freigegeben') AS freigegeben
         FROM publications`,
      (r) => ({ entwurf: zahl(r[0]?.entwurf), freigegeben: zahl(r[0]?.freigegeben) }),
    ),
  ])

  return {
    posts30: summe?.posts ?? null,
    mitReaktion30: summe?.reaktion ?? null,
    anfragenAusPosts90: anfragen,
    linkedinLeads90: linkedin,
    wochen,
    kanaele,
    reaktionen,
    letzte,
    woche,
    pipeline,
  }
}
