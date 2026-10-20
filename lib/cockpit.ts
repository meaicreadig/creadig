import { neonAbfrage } from "@/lib/neon-abfrage"
import { ladeOffeneRechnungenSumme } from "@/lib/finanz/kurzlage"

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
  rechnungenOffenCent: number | null
  rechnungenOffen: number | null
  posts7: number | null
  wochen: { start: string; anzahl: number }[] | null
  stufen: { stufe: string; anzahl: number }[] | null
  quellen: { quelle: string; anzahl: number; gewonnen: number }[] | null
  termine: { start: string; name: string; kontaktId: string | null }[] | null
  linksOffen:
    | {
        token: string
        name: string
        kontaktId: string | null
        seit: string
        entwurf: { id: string; betreff: string; text: string; status: string } | null
      }[]
    | null
}

const LEER: CockpitDaten = {
  anfragen7: null,
  anfragenVor7: null,
  pipelineWert: null,
  pipelineOffen: null,
  rechnungenOffenCent: null,
  rechnungenOffen: null,
  posts7: null,
  wochen: null,
  stufen: null,
  quellen: null,
  termine: null,
  linksOffen: null,
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
  /* Offene Rechnungen kommen aus fin_dokumente (lib/finanz/kurzlage.ts) — `invoices`/`payments` tragen keine Zeilen. */
  const eins2 = async <T,>(lesen: () => Promise<T>): Promise<T | null> => lesen().catch(() => null)
  const zahl = (v: unknown) => Number(v ?? 0)

  const [anfragen, pipeline, rechnungen, posts, wochen, stufen, quellen, termine, linksOffen] = await Promise.all([
    eins(
      `SELECT count(*) FILTER (WHERE created_at >= now() - interval '7 days') AS jetzt,
              count(*) FILTER (WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days') AS vorher
         FROM leads`,
      (r) => ({ jetzt: zahl(r[0]?.jetzt), vorher: zahl(r[0]?.vorher) }),
    ),
    eins(
      `SELECT coalesce(sum(estimated_value), 0) AS wert, count(*) AS offen
         FROM opportunities WHERE status NOT IN ('won','lost') AND excluded_reason IS NULL`,
      (r) => ({ wert: zahl(r[0]?.wert), offen: zahl(r[0]?.offen) }),
    ),
    eins2(() => ladeOffeneRechnungenSumme(q)),
    eins(`SELECT count(*) AS n FROM publications WHERE veroeffentlicht_am >= current_date - 7`, (r) => zahl(r[0]?.n)),
    eins(
      `SELECT to_char(w, 'YYYY-MM-DD') AS start, count(l.id) AS anzahl
         FROM generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') AS w
         LEFT JOIN leads l ON l.created_at >= w AND l.created_at < w + interval '1 week'
        GROUP BY w ORDER BY w`,
      (r) => r.map((x) => ({ start: String(x.start), anzahl: zahl(x.anzahl) })),
    ),
    eins(`SELECT status AS stufe, count(*) AS anzahl FROM opportunities WHERE excluded_reason IS NULL GROUP BY status`, (r) =>
      r.map((x) => ({ stufe: String(x.stufe), anzahl: zahl(x.anzahl) })),
    ),
    eins(
      `SELECT coalesce(nullif(channel, ''), nullif(utm_source, ''), 'offen') AS quelle,
              count(*) AS anzahl,
              count(*) FILTER (WHERE sales_status = 'won') AS gewonnen
         FROM leads WHERE created_at >= now() - interval '90 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
      (r) => r.map((x) => ({ quelle: String(x.quelle), anzahl: zahl(x.anzahl), gewonnen: zahl(x.gewonnen) })),
    ),
    eins(
      `SELECT a.starts_at, a.guest_name, a.contact_id
         FROM appointments a
        WHERE a.status IN ('booked','confirmed','pending_calendar','rescheduled')
          AND a.starts_at >= now() AND a.starts_at < now() + interval '7 days'
        ORDER BY a.starts_at LIMIT 5`,
      (r) =>
        r.map((x) => ({
          start: new Date(x.starts_at as string).toISOString(),
          name: String(x.guest_name ?? ""),
          kontaktId: x.contact_id ? String(x.contact_id) : null,
        })),
    ),
    eins(
      `SELECT b.token, b.contact_id, b.created_at, coalesce(c.name, '') AS name, e.id AS entwurf_id, e.data AS entwurf
         FROM booking_links b
         LEFT JOIN contacts c ON c.id = b.contact_id
         LEFT JOIN LATERAL (
           SELECT a.id, a.data FROM activities a
            WHERE a.subject_type = 'contact' AND a.subject_id = b.contact_id
              AND a.kind = 'nachfass_entwurf' AND a.data->>'token' = b.token
            ORDER BY a.created_at DESC LIMIT 1) e ON true
        WHERE b.used_at IS NULL AND b.revoked_at IS NULL AND b.expires_at > now()
          AND b.created_at < now() - interval '3 days'
          AND coalesce(e.data->>'status', 'offen') = 'offen'
        ORDER BY b.created_at LIMIT 5`,
      (r) =>
        r.map((x) => {
          const d = x.entwurf as Record<string, string> | null
          return {
            token: String(x.token),
            name: String(x.name),
            kontaktId: x.contact_id ? String(x.contact_id) : null,
            seit: new Date(x.created_at as string).toISOString(),
            entwurf: x.entwurf_id && d ? { id: String(x.entwurf_id), betreff: d.betreff ?? "", text: d.text ?? "", status: d.status ?? "offen" } : null,
          }
        }),
    ),
  ])

  return {
    anfragen7: anfragen?.jetzt ?? null,
    anfragenVor7: anfragen?.vorher ?? null,
    pipelineWert: pipeline?.wert ?? null,
    pipelineOffen: pipeline?.offen ?? null,
    rechnungenOffenCent: rechnungen?.offenCent ?? null,
    rechnungenOffen: rechnungen?.anzahl ?? null,
    posts7: posts,
    wochen,
    stufen,
    quellen,
    termine,
    linksOffen,
  }
}
