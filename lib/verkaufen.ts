import { neonAbfrage } from "@/lib/neon-abfrage"
import { geschaeftsTag } from "@/lib/geschaeftszeit"

/**
 * „Heute verkaufen“ — eine Seite, die jeden Morgen sagt, welcher Abschluss
 * jetzt Aufmerksamkeit braucht. Nur Lese-Abfragen auf opportunities,
 * organisations, contacts. Werte in estimated_value sind ganze Euro.
 */

export const MONATSZIEL_EUR = 10_000

export const OFFENE_STUFEN = ["new", "contacted", "qualified", "discovery", "audit", "proposal", "negotiation"] as const
export type OffeneStufe = (typeof OFFENE_STUFEN)[number]

/* Erfahrungswerte für eine kleine Agentur; bewusst vorsichtig. */
export const WAHRSCHEINLICHKEIT: Record<OffeneStufe, number> = {
  new: 0.05,
  contacted: 0.1,
  qualified: 0.2,
  discovery: 0.3,
  audit: 0.4,
  proposal: 0.5,
  negotiation: 0.7,
}

export type Warnung = "ohne-schritt" | "ueberfaellig" | "still" | "ohne-wert"

export type Deal = {
  id: string
  titel: string
  stufe: OffeneStufe
  firma: string | null
  person: string | null
  wert: number | null
  gewichtet: number
  naechsterSchritt: string | null
  faelligAm: string | null
  tageStill: number | null
  warnungen: Warnung[]
}

export type Faellig = { id: string; name: string; firma: string | null; was: string | null; am: string }

export type Verkaufslage = {
  deals: Deal[]
  faellig: Faellig[]
  pipelineGewichtet: number
  pipelineVoll: number
  gewonnenMonat: number
  gewonnenAnzahl: number
  neueWoche: number
  verfuegbar: boolean
}

const LEER: Verkaufslage = {
  deals: [],
  faellig: [],
  pipelineGewichtet: 0,
  pipelineVoll: 0,
  gewonnenMonat: 0,
  gewonnenAnzahl: 0,
  neueWoche: 0,
  verfuegbar: false,
}

const istOffen = (s: unknown): s is OffeneStufe => OFFENE_STUFEN.includes(s as OffeneStufe)
const datum = (v: unknown) => (v == null ? null : String(v instanceof Date ? v.toISOString() : v).slice(0, 10))

export async function ladeVerkaufslage(): Promise<Verkaufslage> {
  const q = neonAbfrage()
  if (!q) return LEER
  const heute = geschaeftsTag(new Date())

  try {
    const [opps, kontakte, gewonnen, neu] = await Promise.all([
      q(
        `SELECT o.id, o.title, o.status, o.estimated_value, o.next_action, o.next_action_at, o.last_contact_at,
                o.updated_at, org.name AS firma, c.name AS person
           FROM opportunities o
           LEFT JOIN organisations org ON org.id = o.organisation_id
           LEFT JOIN contacts c ON c.id = o.contact_id
          WHERE o.status NOT IN ('won','lost')`,
        [],
      ),
      q(
        `SELECT c.id, c.name, c.next_touch, c.next_touch_at, org.name AS firma
           FROM contacts c LEFT JOIN organisations org ON org.id = c.organisation_id
          WHERE c.next_touch_at IS NOT NULL AND c.next_touch_at <= $1::date
          ORDER BY c.next_touch_at ASC LIMIT 20`,
        [heute],
      ),
      q(
        `SELECT coalesce(sum(estimated_value),0) AS summe, count(*) AS anzahl FROM opportunities
          WHERE status = 'won' AND updated_at >= date_trunc('month', now() AT TIME ZONE 'Europe/Berlin')`,
        [],
      ),
      q(`SELECT count(*) AS anzahl FROM opportunities WHERE created_at >= now() - interval '7 days'`, []),
    ])

    const jetzt = Date.now()
    const deals: Deal[] = opps
      .filter((r) => istOffen(r.status))
      .map((r) => {
        const stufe = r.status as OffeneStufe
        const wert = r.estimated_value == null ? null : Number(r.estimated_value)
        const faelligAm = datum(r.next_action_at)
        const letzter = r.last_contact_at ?? r.updated_at
        const tageStill = letzter ? Math.floor((jetzt - new Date(String(letzter)).getTime()) / 86_400_000) : null
        const warnungen: Warnung[] = []
        if (!r.next_action) warnungen.push("ohne-schritt")
        else if (faelligAm && faelligAm < heute) warnungen.push("ueberfaellig")
        if (tageStill !== null && tageStill > 7) warnungen.push("still")
        if (wert === null) warnungen.push("ohne-wert")
        return {
          id: String(r.id),
          titel: String(r.title),
          stufe,
          firma: r.firma ? String(r.firma) : null,
          person: r.person ? String(r.person) : null,
          wert,
          gewichtet: Math.round((wert ?? 0) * WAHRSCHEINLICHKEIT[stufe]),
          naechsterSchritt: r.next_action ? String(r.next_action) : null,
          faelligAm,
          tageStill,
          warnungen,
        }
      })
      .sort((a, b) => b.warnungen.length - a.warnungen.length || b.gewichtet - a.gewichtet)

    return {
      deals,
      faellig: kontakte.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        firma: r.firma ? String(r.firma) : null,
        was: r.next_touch ? String(r.next_touch) : null,
        am: datum(r.next_touch_at) ?? heute,
      })),
      pipelineGewichtet: deals.reduce((s, d) => s + d.gewichtet, 0),
      pipelineVoll: deals.reduce((s, d) => s + (d.wert ?? 0), 0),
      gewonnenMonat: Number(gewonnen[0]?.summe ?? 0),
      gewonnenAnzahl: Number(gewonnen[0]?.anzahl ?? 0),
      neueWoche: Number(neu[0]?.anzahl ?? 0),
      verfuegbar: true,
    }
  } catch {
    return LEER
  }
}
