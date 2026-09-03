import { randomUUID } from "node:crypto"

import type { SalesStatus } from "@/lib/lead-store"
import { SALES_LABELS_DE, TERMINAL_STATES } from "@/lib/lead-store"
import { neonClient, type Sql } from "@/lib/neon-client"
import type {
  Activity,
  EnquiryRow,
  ActivitySubject,
  Contact,
  ContactQuery,
  ContactRow,
  HandlingStatus,
  Opportunity,
  OpportunityQuery,
  OpportunityRow,
  Organisation,
  RelationshipLevel,
  VertriebStore,
  VertriebSummary,
} from "@/lib/vertrieb"
import { RELATIONSHIP_LABELS } from "@/lib/vertrieb"

/**
 * Vertrieb 1.0 — die Datenbankseite.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER STEHT UND WAS NICHT
 * Abfragen und Verknüpfungen. Keine Geschäftsregeln: ob ein Verlustgrund zu
 * einem Status passt, wann eine Beziehung warm wird, was ein fälliger Schritt
 * ist — das entscheiden Modell und Oberfläche. Zwei Orte mit Regeln wären
 * zwei Orte, an denen sie auseinanderlaufen.
 *
 * Eine Ausnahme, bewusst: Die Chronik wird HIER geschrieben, im selben
 * Aufruf wie die Änderung. Ein Protokoll, das die Oberfläche schreiben muss,
 * fehlt an dem Tag, an dem jemand einen zweiten Weg zur selben Änderung baut.
 *
 * Alle Werte gehen als Parameter. Und alle Parameter, die in einer
 * `CASE`- oder `IS NULL`-Bedingung stehen, tragen eine ausdrückliche
 * Umwandlung — ohne die lehnt Postgres mit `42P08` ab, weil `IS NULL` über
 * den Typ nichts verrät. Das hat in diesem Projekt schon einmal eine
 * Mutation lautlos verschluckt.
 */

/* ── Zeilen aus der Datenbank ─────────────────────────────────────────────── */

type Ts = Date | string
const iso = (v: Ts): string => (v instanceof Date ? v.toISOString() : String(v))
const isoOrNull = (v: Ts | null): string | null => (v === null ? null : iso(v))
const day = (v: Ts | null): string | null => (v === null ? null : iso(v).slice(0, 10))

type OppRowDb = {
  id: string; organisation_id: string | null; contact_id: string | null
  title: string; status: string; source: string | null
  next_action: string | null; next_action_at: Ts | null; last_contact_at: Ts | null
  note: string | null; estimated_value: number | null; lost_reason: string | null
  created_at: Ts; updated_at: Ts
  organisation_name?: string | null; contact_name?: string | null
}

function toOpportunity(r: OppRowDb): OpportunityRow {
  return {
    id: r.id,
    organisationId: r.organisation_id,
    contactId: r.contact_id,
    title: r.title,
    status: r.status as SalesStatus,
    source: r.source,
    nextAction: r.next_action,
    nextActionAt: day(r.next_action_at),
    lastContactAt: isoOrNull(r.last_contact_at),
    note: r.note,
    estimatedValue: r.estimated_value,
    lostReason: r.lost_reason,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    organisationName: r.organisation_name ?? null,
    contactName: r.contact_name ?? null,
  }
}

type ContactRowDb = {
  id: string; organisation_id: string | null; name: string; email: string
  phone: string | null; linkedin_url: string | null; role: string | null
  relationship: string; last_interaction_at: Ts | null
  next_touch: string | null; next_touch_at: Ts | null; note: string | null
  created_at: Ts; updated_at: Ts
  organisation_name?: string | null; open_opportunities?: number
}

function toContact(r: ContactRowDb): ContactRow {
  return {
    id: r.id,
    organisationId: r.organisation_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    linkedinUrl: r.linkedin_url,
    role: r.role,
    relationship: r.relationship as RelationshipLevel,
    lastInteractionAt: isoOrNull(r.last_interaction_at),
    nextTouch: r.next_touch,
    nextTouchAt: day(r.next_touch_at),
    note: r.note,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    organisationName: r.organisation_name ?? null,
    openOpportunities: Number(r.open_opportunities ?? 0),
  }
}

type EnqRowDb = {
  id: string; reference: string; source: string; locale: string
  name: string; email: string; phone: string
  business: string | null; message: string | null; site_url: string | null
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null
  handling_status: string
  contact_id: string | null; contact_name: string | null
  organisation_id: string | null; organisation_name: string | null
  opportunity_id: string | null
  created_at: Ts; updated_at: Ts
}

function toEnquiry(r: EnqRowDb): EnquiryRow {
  return {
    id: r.id, reference: r.reference, source: r.source, locale: r.locale,
    name: r.name, email: r.email, phone: r.phone,
    business: r.business, message: r.message, siteUrl: r.site_url,
    utmSource: r.utm_source, utmMedium: r.utm_medium, utmCampaign: r.utm_campaign,
    handlingStatus: r.handling_status as HandlingStatus,
    contactId: r.contact_id, contactName: r.contact_name,
    organisationId: r.organisation_id, organisationName: r.organisation_name,
    opportunityId: r.opportunity_id,
    createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
  }
}

const ENQ_COLUMNS = `
  l.id, l.reference, l.source, l.locale, l.name, l.email, l.phone,
  l.business, l.message, l.site_url,
  l.utm_source, l.utm_medium, l.utm_campaign,
  l.handling_status, l.contact_id, l.organisation_id,
  c.name AS contact_name, org.name AS organisation_name,
  (SELECT o2.id FROM opportunities o2
    WHERE o2.id = 'opp-' || l.id
       OR (o2.contact_id = l.contact_id AND o2.created_at >= l.created_at)
    ORDER BY (o2.id = 'opp-' || l.id) DESC, o2.created_at ASC
    LIMIT 1) AS opportunity_id
`
const ENQ_FROM = `
  FROM leads l
  LEFT JOIN contacts c ON c.id = l.contact_id
  LEFT JOIN organisations org ON org.id = l.organisation_id
`

const OPP_COLUMNS = `
  o.id, o.organisation_id, o.contact_id, o.title, o.status, o.source,
  o.next_action, o.next_action_at, o.last_contact_at, o.note,
  o.estimated_value, o.lost_reason, o.created_at, o.updated_at,
  org.name AS organisation_name, c.name AS contact_name
`
const OPP_FROM = `
  FROM opportunities o
  LEFT JOIN organisations org ON org.id = o.organisation_id
  LEFT JOIN contacts c ON c.id = o.contact_id
`

const OPEN_CLAUSE = `o.status NOT IN ('won','lost')`

export function createNeonVertrieb(connectionString: string): VertriebStore {
  const client: { sql: Sql; ready: () => Promise<void> } = neonClient(connectionString)
  const { sql, ready } = client

  /** Chronik-Eintrag. Immer im selben Aufruf wie die Änderung. */
  async function note(
    subjectType: ActivitySubject,
    subjectId: string,
    kind: string,
    summary: string,
    detail: string | null = null,
  ): Promise<void> {
    await sql.query(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, created_at)
       VALUES ($1,$2,$3,$4,$5,$6, now())`,
      [randomUUID(), subjectType, subjectId, kind, summary, detail],
    )
  }

  return {
    /**
     * Die Übersicht — sieben Zahlen, jede eine Zählung über echte Zeilen.
     *
     * Bewusst in einer Abfrage: Sieben Rundgänge zur Datenbank für eine
     * Seite, die bei jedem Aufruf geladen wird, wären sieben Gelegenheiten,
     * dass eine davon langsam ist.
     */
    async summary(): Promise<VertriebSummary> {
      await ready()
      const [counts] = (await sql.query(
        `SELECT
           (SELECT count(*) FROM leads WHERE handling_status = 'neu')::int AS new_enquiries,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE}
              AND o.next_action_at = current_date)::int AS due_today,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE}
              AND o.next_action_at < current_date)::int AS overdue,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE})::int AS open_opportunities,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE}
              AND o.next_action IS NULL)::int AS without_next_action,
           (SELECT count(*) FROM contacts c WHERE c.relationship IN ('warm','eng')
              AND NOT EXISTS (SELECT 1 FROM opportunities o
                               WHERE o.contact_id = c.id AND ${OPEN_CLAUSE}))::int
             AS warm_without_opportunity`,
      )) as {
        new_enquiries: number; due_today: number; overdue: number
        open_opportunities: number; without_next_action: number
        warm_without_opportunity: number
      }[]

      /*
       * „Braucht Aufmerksamkeit" ist eine Sortierung, keine Bewertung:
       * überfällig vor heute fällig vor ohne Schritt. Kein Punktesystem —
       * es gäbe keine Daten, aus denen eine Punktzahl entstehen könnte.
       */
      const attention = (await sql.query(
        `SELECT ${OPP_COLUMNS} ${OPP_FROM}
          WHERE ${OPEN_CLAUSE}
            AND (o.next_action_at <= current_date OR o.next_action IS NULL)
          ORDER BY (o.next_action_at IS NULL), o.next_action_at ASC NULLS LAST, o.updated_at DESC
          LIMIT 12`,
      )) as OppRowDb[]

      const recentlyClosed = (await sql.query(
        `SELECT ${OPP_COLUMNS} ${OPP_FROM}
          WHERE o.status IN ('won','lost')
          ORDER BY o.updated_at DESC LIMIT 5`,
      )) as OppRowDb[]

      const c = counts ?? {
        new_enquiries: 0, due_today: 0, overdue: 0,
        open_opportunities: 0, without_next_action: 0, warm_without_opportunity: 0,
      }
      return {
        newEnquiries: c.new_enquiries,
        dueToday: c.due_today,
        overdue: c.overdue,
        openOpportunities: c.open_opportunities,
        withoutNextAction: c.without_next_action,
        warmWithoutOpportunity: c.warm_without_opportunity,
        attention: attention.map(toOpportunity),
        recentlyClosed: recentlyClosed.map(toOpportunity),
      }
    },

    /**
     * Die Anfrage-Inbox.
     *
     * `opportunity_id` kommt aus der abgeleiteten ID der Migration
     * (`opp-<lead-id>`) ODER aus einer Chance, die diesen Kontakt hat und
     * nach der Anfrage entstanden ist. Der zweite Fall ist eine begruendete
     * Naeherung, kein Fremdschluessel — und deshalb heisst die Spalte in der
     * Oberflaeche "Verkaufschance vorhanden" und nicht "gehoert zu".
     */
    async listEnquiries(query) {
      await ready()
      const where: string[] = []
      const params: unknown[] = []

      if (query.handling) { params.push(query.handling); where.push(`l.handling_status = ${params.length}`) }
      if (query.source) { params.push(query.source); where.push(`l.source = ${params.length}`) }
      if (query.search?.trim()) {
        params.push(`%${query.search.trim()}%`)
        const n = params.length
        where.push(`(l.reference ILIKE ${n} OR l.business ILIKE ${n} OR l.name ILIKE ${n} OR l.email ILIKE ${n})`)
      }
      const clause = where.length ? `WHERE ${where.join(" AND ")}` : ""

      const counted = (await sql.query(
        `SELECT count(*)::int AS total FROM leads l ${clause}`, params,
      )) as { total: number }[]

      const limit = query.limit ?? 50
      const offset = query.offset ?? 0
      const rows = (await sql.query(
        `SELECT ${ENQ_COLUMNS} ${ENQ_FROM} ${clause}
          ORDER BY l.created_at DESC
          LIMIT ${params.length + 1} OFFSET ${params.length + 2}`,
        [...params, limit, offset],
      )) as EnqRowDb[]

      return { rows: rows.map(toEnquiry), total: counted[0]?.total ?? 0 }
    },

    async getEnquiry(id: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT ${ENQ_COLUMNS} ${ENQ_FROM} WHERE l.id = $1 LIMIT 1`, [id],
      )) as EnqRowDb[]
      return rows.length ? toEnquiry(rows[0]) : null
    },

    /** Was wirklich vorkommt — keine gepflegte Liste, die veraltet. */
    async enquirySources(): Promise<string[]> {
      await ready()
      const rows = (await sql.query(
        `SELECT DISTINCT source FROM leads ORDER BY source`,
      )) as { source: string }[]
      return rows.map((r) => r.source)
    },

    async listOpportunities(query: OpportunityQuery) {
      await ready()
      const where: string[] = []
      const params: unknown[] = []

      if (query.status) { params.push(query.status); where.push(`o.status = $${params.length}`) }
      switch (query.bucket) {
        case "offen": where.push(OPEN_CLAUSE); break
        case "faellig": where.push(`${OPEN_CLAUSE} AND o.next_action_at = current_date`); break
        case "ueberfaellig": where.push(`${OPEN_CLAUSE} AND o.next_action_at < current_date`); break
        case "ohne-schritt": where.push(`${OPEN_CLAUSE} AND o.next_action IS NULL`); break
        case "abgeschlossen": where.push(`o.status IN ('won','lost')`); break
      }
      if (query.search?.trim()) {
        params.push(`%${query.search.trim()}%`)
        const n = params.length
        where.push(`(o.title ILIKE $${n} OR org.name ILIKE $${n} OR c.name ILIKE $${n})`)
      }
      const clause = where.length ? `WHERE ${where.join(" AND ")}` : ""

      const counted = (await sql.query(
        `SELECT count(*)::int AS total ${OPP_FROM} ${clause}`, params,
      )) as { total: number }[]

      const limit = query.limit ?? 50
      const offset = query.offset ?? 0
      const rows = (await sql.query(
        `SELECT ${OPP_COLUMNS} ${OPP_FROM} ${clause}
          ORDER BY (o.next_action_at IS NULL), o.next_action_at ASC NULLS LAST, o.updated_at DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      )) as OppRowDb[]

      return { rows: rows.map(toOpportunity), total: counted[0]?.total ?? 0 }
    },

    async getOpportunity(id: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT ${OPP_COLUMNS} ${OPP_FROM} WHERE o.id = $1 LIMIT 1`, [id],
      )) as OppRowDb[]
      return rows.length ? toOpportunity(rows[0]) : null
    },

    /**
     * Aus einer Anfrage wird ein Vorgang.
     *
     * Die Anfrage bleibt unangetastet — sie ist der Beleg. Was sich ändert,
     * ist ihr Bearbeitungszustand: Wer eine Chance daraus macht, hat sie
     * bearbeitet.
     */
    async createOpportunity(input): Promise<Opportunity> {
      await ready()
      const id = randomUUID()
      const rows = (await sql.query(
        `INSERT INTO opportunities
           (id, organisation_id, contact_id, title, status, source, created_at, updated_at)
         VALUES ($1,$2,$3,$4,'new',$5, now(), now())
         RETURNING id, organisation_id, contact_id, title, status, source,
                   next_action, next_action_at, last_contact_at, note,
                   estimated_value, lost_reason, created_at, updated_at`,
        [id, input.organisationId, input.contactId, input.title, input.source],
      )) as OppRowDb[]

      await note("opportunity", id, "opportunity.created", `Verkaufschance angelegt: ${input.title}`)

      if (input.fromLeadId) {
        await sql.query(
          `UPDATE leads SET handling_status = 'bearbeitet' WHERE id = $1 AND handling_status <> 'archiviert'`,
          [input.fromLeadId],
        )
        await note("lead", input.fromLeadId, "lead.converted", "Verkaufschance aus dieser Anfrage angelegt")
        await note("opportunity", id, "opportunity.fromLead", "Entstanden aus einer Website-Anfrage")
      }
      return toOpportunity(rows[0])
    },

    async updateOpportunityStatus(id, status: SalesStatus, lostReason) {
      await ready()
      const rows = (await sql.query(
        `UPDATE opportunities
            SET status      = $2::text,
                lost_reason = CASE WHEN $2::text = 'lost' THEN $3::text ELSE NULL END,
                last_contact_at = now(),
                updated_at  = now()
          WHERE id = $1
        RETURNING id`,
        [id, status, lostReason],
      )) as { id: string }[]
      if (!rows.length) return false

      const closing = TERMINAL_STATES.includes(status)
      await note(
        "opportunity", id,
        closing ? `opportunity.${status}` : "opportunity.status",
        `Status: ${SALES_LABELS_DE[status]}`,
        status === "lost" ? lostReason : null,
      )
      return true
    },

    async updateOpportunityNextAction(id, action, at) {
      await ready()
      const rows = (await sql.query(
        `UPDATE opportunities
            SET next_action    = $2::text,
                next_action_at = CASE WHEN $2::text IS NULL THEN NULL ELSE $3::date END,
                updated_at     = now()
          WHERE id = $1
        RETURNING id`,
        [id, action, at],
      )) as { id: string }[]
      if (!rows.length) return false
      await note(
        "opportunity", id, "opportunity.nextAction",
        action ? `Nächster Schritt: ${action}` : "Nächster Schritt entfernt",
        action && at ? `fällig ${at}` : null,
      )
      return true
    },

    async updateOpportunityNote(id, text) {
      await ready()
      const rows = (await sql.query(
        `UPDATE opportunities SET note = $2::text, updated_at = now() WHERE id = $1 RETURNING id`,
        [id, text],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("opportunity", id, "opportunity.note", text ? "Notiz geändert" : "Notiz entfernt")
      return true
    },

    async listContacts(query: ContactQuery) {
      await ready()
      const where: string[] = []
      const params: unknown[] = []

      if (query.relationship) {
        params.push(query.relationship)
        where.push(`c.relationship = $${params.length}`)
      }
      switch (query.bucket) {
        case "mit-chance":
          where.push(`EXISTS (SELECT 1 FROM opportunities o WHERE o.contact_id = c.id AND ${OPEN_CLAUSE})`)
          break
        case "ohne-chance":
          where.push(`NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.contact_id = c.id AND ${OPEN_CLAUSE})`)
          break
        case "pflege-faellig":
          where.push(`c.next_touch_at IS NOT NULL AND c.next_touch_at <= current_date`)
          break
      }
      if (query.search?.trim()) {
        params.push(`%${query.search.trim()}%`)
        const n = params.length
        where.push(`(c.name ILIKE $${n} OR c.email ILIKE $${n} OR org.name ILIKE $${n})`)
      }
      const clause = where.length ? `WHERE ${where.join(" AND ")}` : ""

      const counted = (await sql.query(
        `SELECT count(*)::int AS total FROM contacts c
         LEFT JOIN organisations org ON org.id = c.organisation_id ${clause}`, params,
      )) as { total: number }[]

      const limit = query.limit ?? 50
      const offset = query.offset ?? 0
      const rows = (await sql.query(
        `SELECT c.*, org.name AS organisation_name,
                (SELECT count(*) FROM opportunities o
                  WHERE o.contact_id = c.id AND ${OPEN_CLAUSE})::int AS open_opportunities
           FROM contacts c
           LEFT JOIN organisations org ON org.id = c.organisation_id
           ${clause}
          ORDER BY (c.next_touch_at IS NULL), c.next_touch_at ASC NULLS LAST,
                   c.last_interaction_at DESC NULLS LAST
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      )) as ContactRowDb[]

      return { rows: rows.map(toContact), total: counted[0]?.total ?? 0 }
    },

    async getContact(id: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT c.*, org.name AS organisation_name,
                (SELECT count(*) FROM opportunities o
                  WHERE o.contact_id = c.id AND ${OPEN_CLAUSE})::int AS open_opportunities
           FROM contacts c
           LEFT JOIN organisations org ON org.id = c.organisation_id
          WHERE c.id = $1 LIMIT 1`, [id],
      )) as ContactRowDb[]
      return rows.length ? toContact(rows[0]) : null
    },

    async updateContactRelationship(id: string, level: RelationshipLevel) {
      await ready()
      const rows = (await sql.query(
        `UPDATE contacts SET relationship = $2::text, updated_at = now() WHERE id = $1 RETURNING id`,
        [id, level],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("contact", id, "contact.relationship", `Beziehung: ${RELATIONSHIP_LABELS[level]}`)
      return true
    },

    async updateContactDetails(id, input) {
      await ready()
      const rows = (await sql.query(
        `UPDATE contacts
            SET linkedin_url = $2::text, role = $3::text, note = $4::text, updated_at = now()
          WHERE id = $1 RETURNING id`,
        [id, input.linkedinUrl, input.role, input.note],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("contact", id, "contact.details", "Angaben geändert")
      return true
    },

    async updateContactNextTouch(id, touch, at) {
      await ready()
      const rows = (await sql.query(
        `UPDATE contacts
            SET next_touch    = $2::text,
                next_touch_at = CASE WHEN $2::text IS NULL THEN NULL ELSE $3::date END,
                updated_at    = now()
          WHERE id = $1 RETURNING id`,
        [id, touch, at],
      )) as { id: string }[]
      if (!rows.length) return false
      await note(
        "contact", id, "contact.nextTouch",
        touch ? `Beziehungsschritt: ${touch}` : "Beziehungsschritt entfernt",
      )
      return true
    },

    async getOrganisation(id: string): Promise<Organisation | null> {
      await ready()
      const rows = (await sql.query(`SELECT * FROM organisations WHERE id = $1 LIMIT 1`, [id])) as {
        id: string; name: string; website: string | null; city: string | null
        linkedin_url: string | null; note: string | null; created_at: Ts; updated_at: Ts
      }[]
      if (!rows.length) return null
      const r = rows[0]
      return {
        id: r.id, name: r.name, website: r.website, city: r.city,
        linkedinUrl: r.linkedin_url, note: r.note,
        createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
      }
    },

    async leadsForContact(contactId: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT id, reference, source, created_at FROM leads
          WHERE contact_id = $1 ORDER BY created_at DESC LIMIT 50`, [contactId],
      )) as { id: string; reference: string; source: string; created_at: Ts }[]
      return rows.map((r) => ({ ...r, createdAt: iso(r.created_at) }))
    },

    async opportunitiesForContact(contactId: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT ${OPP_COLUMNS} ${OPP_FROM} WHERE o.contact_id = $1 ORDER BY o.updated_at DESC`,
        [contactId],
      )) as OppRowDb[]
      return rows.map(toOpportunity)
    },

    /**
     * Die Anfrage hinter einer Chance.
     *
     * Nur für Vorgänge aus der Migration verlässlich: deren ID ist
     * `opp-<lead-id>`. Für später von Hand angelegte Chancen gibt es keine
     * Verknüpfungstabelle — und eine zu erfinden, nur damit die Detailseite
     * eine Zeile mehr hat, wäre eine Beziehung, die es nicht gibt.
     */
    async leadForOpportunity(opportunityId: string) {
      await ready()
      if (!opportunityId.startsWith("opp-")) return null
      const leadId = opportunityId.slice(4)
      const rows = (await sql.query(
        `SELECT id, reference FROM leads WHERE id = $1 LIMIT 1`, [leadId],
      )) as { id: string; reference: string }[]
      return rows.length ? rows[0] : null
    },

    async setLeadHandling(leadId: string, status: HandlingStatus) {
      await ready()
      const rows = (await sql.query(
        `UPDATE leads SET handling_status = $2::text, updated_at = now() WHERE id = $1 RETURNING id`,
        [leadId, status],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("lead", leadId, "lead.handling", `Bearbeitung: ${status}`)
      return true
    },

    async activities(subjectType: ActivitySubject, subjectId: string, limit = 50): Promise<Activity[]> {
      await ready()
      const rows = (await sql.query(
        `SELECT id, subject_type, subject_id, kind, summary, detail, created_at
           FROM activities WHERE subject_type = $1 AND subject_id = $2
          ORDER BY created_at DESC LIMIT $3`,
        [subjectType, subjectId, limit],
      )) as {
        id: string; subject_type: string; subject_id: string
        kind: string; summary: string; detail: string | null; created_at: Ts
      }[]
      return rows.map((r) => ({
        id: r.id,
        subjectType: r.subject_type as ActivitySubject,
        subjectId: r.subject_id,
        kind: r.kind,
        summary: r.summary,
        detail: r.detail,
        createdAt: iso(r.created_at),
      }))
    },
  }
}

/** Nur damit `Contact` als Typ benutzt wird — die Liste liefert `ContactRow`. */
export type { Contact }
