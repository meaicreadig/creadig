import "server-only"

import { ladeArtikelListe, type Artikel } from "@/lib/artikel/store"
import { REDAKTIONSPLAN } from "@/lib/artikel/plan"
import { assistentDb, letzteLaeufe, type Lauf } from "@/lib/assistent/store"
import { aktuelleInhalte, type Inhalt } from "@/lib/inhalte"
import { neonAbfrage } from "@/lib/neon-abfrage"

/**
 * Die Redaktion auf einen Blick — Website und LinkedIn an EINER Stelle.
 *
 * Bis 22.10.2026 lag die Redaktionsarbeit auf fünf Seiten verteilt (Bulletin,
 * Assistent, Marketing, Veröffentlichungen, Webseite). Diese Lage liest nur;
 * sie besitzt keine eigenen Daten. Jede Zahl kommt aus der Tabelle, in der
 * die Arbeit ohnehin passiert.
 */

export type WartendeLinkedin = { id: string; titel: string; text: string; warum: string | null; zeit: string }
export type RegisterOffen = { id: string; was: string; kanal: string; zustand: string }
export type PlanStand = { code: string; arbeitstitel: string; zustand: "offen" | "entwurf" | "veroeffentlicht" | "verworfen"; slug: string | null }
export type NetzMeldung = { zeit: string; was: string; kanal: string }
export type Woche = { start: string; website: number; linkedin: number; andere: number }

export type RedaktionsLage = {
  webEntwuerfe: Artikel[]
  linkedinOffen: WartendeLinkedin[]
  registerOffen: RegisterOffen[]
  plan: PlanStand[]
  inhalte: Inhalt[]
  wochen: Woche[]
  laeufe: { agent: string; lauf: Lauf | null }[]
  netz: NetzMeldung[]
}

/** Die Agenten, die an der Redaktion arbeiten — in der Reihenfolge der Kette. */
export const REDAKTIONS_AGENTEN = ["bulletin", "webseite", "redaktion", "marketing"] as const

const iso = (v: unknown) => new Date(String(v)).toISOString()

export async function ladeRedaktion(): Promise<RedaktionsLage> {
  const q = neonAbfrage()
  const aq = await assistentDb().catch(() => null)

  const [webEntwuerfe, linkedin, register, planZeilen, inhalte, wochen, laeufe, netz] = await Promise.all([
    ladeArtikelListe("entwurf").catch(() => []),
    aq
      ? aq(
          `SELECT id, titel, inhalt, extra->>'warum' AS warum, created_at FROM assistent_freigaben
            WHERE art = 'linkedin' AND status = 'offen' ORDER BY created_at DESC LIMIT 20`,
          [],
        ).catch(() => [])
      : [],
    q
      ? q(
          `SELECT id, was, kanal, zustand FROM publications WHERE zustand IN ('entwurf', 'freigegeben')
            ORDER BY created_at DESC LIMIT 20`,
          [],
        ).catch(() => [])
      : [],
    q ? q(`SELECT bulletin_ref, zustand, slug FROM web_artikel WHERE bulletin_ref LIKE 'plan:%'`, []).catch(() => []) : [],
    aktuelleInhalte(30, 20).catch(() => []),
    q
      ? q(
          `SELECT to_char(w, 'YYYY-MM-DD') AS start,
                  count(p.id) FILTER (WHERE p.kanal = 'website')::int AS website,
                  count(p.id) FILTER (WHERE p.kanal = 'linkedin')::int AS linkedin,
                  count(p.id) FILTER (WHERE p.kanal NOT IN ('website', 'linkedin'))::int AS andere
             FROM generate_series(date_trunc('week', current_date) - interval '7 weeks', date_trunc('week', current_date), interval '1 week') w
             LEFT JOIN publications p
               ON p.veroeffentlicht_am >= w::date AND p.veroeffentlicht_am < (w + interval '1 week')::date
              AND coalesce(p.zustand, 'veroeffentlicht') = 'veroeffentlicht'
            GROUP BY w ORDER BY w`,
          [],
        ).catch(() => [])
      : [],
    letzteLaeufe().catch(() => ({}) as Record<string, Lauf>),
    q
      ? q(
          `SELECT created_at, daten->>'was' AS was, daten->>'kanal' AS kanal FROM motor_events
            WHERE typ = 'inhalt_veroeffentlicht' ORDER BY created_at DESC LIMIT 8`,
          [],
        ).catch(() => [])
      : [],
  ])

  const planNach = new Map(planZeilen.map((r) => [String(r.bulletin_ref), r]))
  return {
    webEntwuerfe,
    linkedinOffen: linkedin.map((r) => ({
      id: String(r.id),
      titel: String(r.titel),
      text: String(r.inhalt),
      warum: (r.warum as string | null) ?? null,
      zeit: iso(r.created_at),
    })),
    registerOffen: register.map((r) => ({ id: String(r.id), was: String(r.was), kanal: String(r.kanal), zustand: String(r.zustand) })),
    plan: REDAKTIONSPLAN.map((t) => {
      const r = planNach.get(`plan:${t.code}`)
      return {
        code: t.code,
        arbeitstitel: t.arbeitstitel,
        zustand: (r ? String(r.zustand) : "offen") as PlanStand["zustand"],
        slug: r ? String(r.slug) : null,
      }
    }),
    inhalte,
    wochen: wochen.map((r) => ({ start: String(r.start), website: Number(r.website), linkedin: Number(r.linkedin), andere: Number(r.andere) })),
    laeufe: REDAKTIONS_AGENTEN.map((agent) => ({ agent, lauf: laeufe[agent] ?? null })),
    netz: netz.map((r) => ({ zeit: iso(r.created_at), was: String(r.was ?? ""), kanal: String(r.kanal ?? "") })),
  }
}
