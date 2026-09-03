import { randomUUID } from "node:crypto"

import type { SalesStatus } from "@/lib/lead-store"
import { isTestEnquiry, sqlLeadOperational } from "@/lib/vertrieb-bestand"
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
  LifecycleStage,
  Location,
  OrganisationQuery,
  OrganisationRow,
  RelationshipLevel,
  VertriebStore,
  VertriebSummary,
} from "@/lib/vertrieb"
import { LIFECYCLE_LABELS, RELATIONSHIP_LABELS } from "@/lib/vertrieb"

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
  from_lead_id: string | null
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
    fromLeadId: r.from_lead_id,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    organisationName: r.organisation_name ?? null,
    contactName: r.contact_name ?? null,
  }
}

type ContactRowDb = {
  id: string; organisation_id: string | null; name: string; email: string | null
  phone: string | null; linkedin_url: string | null; role: string | null
  relationship: string; last_interaction_at: Ts | null
  next_touch: string | null; next_touch_at: Ts | null; note: string | null
  excluded_reason: string | null; import_key: string | null
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
    excludedReason: r.excluded_reason,
    importKey: r.import_key,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    organisationName: r.organisation_name ?? null,
    openOpportunities: Number(r.open_opportunities ?? 0),
  }
}

type OrgRowDb = {
  id: string; name: string; website: string | null; email: string | null
  phone: string | null; street: string | null; postal_code: string | null
  city: string | null; country: string | null; industry: string | null
  lifecycle: string; linkedin_url: string | null; note: string | null
  import_key: string | null; excluded_reason: string | null
  created_at: Ts; updated_at: Ts
  contact_count?: number; location_count?: number; open_opportunities?: number
}

function toOrganisation(r: OrgRowDb): OrganisationRow {
  return {
    id: r.id,
    name: r.name,
    website: r.website,
    email: r.email,
    phone: r.phone,
    street: r.street,
    postalCode: r.postal_code,
    city: r.city,
    country: r.country,
    industry: r.industry,
    lifecycle: r.lifecycle as LifecycleStage,
    linkedinUrl: r.linkedin_url,
    note: r.note,
    importKey: r.import_key,
    excludedReason: r.excluded_reason,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    contactCount: Number(r.contact_count ?? 0),
    locationCount: Number(r.location_count ?? 0),
    openOpportunities: Number(r.open_opportunities ?? 0),
  }
}

type LocRowDb = {
  id: string; organisation_id: string; label: string
  street: string | null; postal_code: string | null; city: string | null
  country: string | null; phone: string | null; email: string | null
  note: string | null; import_key: string | null
  created_at: Ts; updated_at: Ts
}

function toLocation(r: LocRowDb): Location {
  return {
    id: r.id,
    organisationId: r.organisation_id,
    label: r.label,
    street: r.street,
    postalCode: r.postal_code,
    city: r.city,
    country: r.country,
    phone: r.phone,
    email: r.email,
    note: r.note,
    importKey: r.import_key,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
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
  excluded_reason: string | null
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
    excludedReason: r.excluded_reason,
    createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
  }
}

const ENQ_COLUMNS = `
  l.id, l.reference, l.source, l.locale, l.name, l.email, l.phone,
  l.business, l.message, l.site_url,
  l.utm_source, l.utm_medium, l.utm_campaign,
  l.handling_status, l.contact_id, l.organisation_id, l.excluded_reason,
  c.name AS contact_name, org.name AS organisation_name,
  (SELECT o2.id FROM opportunities o2
    WHERE o2.from_lead_id = l.id
    ORDER BY o2.created_at ASC LIMIT 1) AS opportunity_id
`
const ENQ_FROM = `
  FROM leads l
  LEFT JOIN contacts c ON c.id = l.contact_id
  LEFT JOIN organisations org ON org.id = l.organisation_id
`

const OPP_COLUMNS = `
  o.id, o.organisation_id, o.contact_id, o.title, o.status, o.source,
  o.next_action, o.next_action_at, o.last_contact_at, o.note,
  o.estimated_value, o.lost_reason, o.from_lead_id, o.created_at, o.updated_at,
  org.name AS organisation_name, c.name AS contact_name
`
const ORG_COLUMNS = `
  org.id, org.name, org.website, org.email, org.phone, org.street, org.postal_code,
  org.city, org.country, org.industry, org.lifecycle, org.linkedin_url, org.note,
  org.import_key, org.excluded_reason, org.created_at, org.updated_at,
  (SELECT count(*) FROM contacts c2
    WHERE c2.organisation_id = org.id AND c2.excluded_reason IS NULL)::int AS contact_count,
  (SELECT count(*) FROM locations lo WHERE lo.organisation_id = org.id)::int AS location_count,
  (SELECT count(*) FROM opportunities o
    WHERE o.organisation_id = org.id AND o.status NOT IN ('won','lost')
      AND o.excluded_reason IS NULL)::int AS open_opportunities
`

const OPP_FROM = `
  FROM opportunities o
  LEFT JOIN organisations org ON org.id = o.organisation_id
  LEFT JOIN contacts c ON c.id = o.contact_id
`

/*
 * „Offen" heisst hier zweierlei, und das ist Absicht: nicht abgeschlossen UND
 * nicht ausgeschlossen. Die Klausel steht in jeder Zählung der Übersicht und
 * in jedem Filter — sie an einer Stelle zu definieren ist der einzige Weg,
 * bei dem ein Abnahmedatensatz nicht doch in einer der Zahlen auftaucht.
 */
const OPEN_CLAUSE = `o.status NOT IN ('won','lost') AND o.excluded_reason IS NULL`

/**
 * Was zur operativen Arbeitsfläche gehört.
 *
 * Listen und Zählungen filtern danach, Detailseiten NICHT: Wer einem Verweis
 * auf einen ausgeschlossenen Datensatz folgt, soll ihn sehen — samt der
 * Begründung. Unsichtbar machen und unauffindbar machen sind zwei
 * verschiedene Dinge, und nur das erste ist hier gewollt.
 */
const live = (alias: string, include: boolean | undefined): string =>
  include ? "" : `${alias}.excluded_reason IS NULL`

export function createNeonVertrieb(connectionString: string): VertriebStore {
  const client: {
    sql: Sql
    ready: () => Promise<void>
    refreshExclusions: () => Promise<void>
  } = neonClient(connectionString)
  const { sql, ready, refreshExclusions } = client

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
           (SELECT count(*) FROM leads
             WHERE handling_status = 'neu' AND ${sqlLeadOperational("leads")})::int AS new_enquiries,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE}
              AND o.next_action_at = current_date)::int AS due_today,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE}
              AND o.next_action_at < current_date)::int AS overdue,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE})::int AS open_opportunities,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE}
              AND o.next_action IS NULL)::int AS without_next_action,
           (SELECT count(*) FROM contacts c
             WHERE c.relationship IN ('warm','eng') AND c.excluded_reason IS NULL
               AND NOT EXISTS (SELECT 1 FROM opportunities o
                                WHERE o.contact_id = c.id AND ${OPEN_CLAUSE}))::int
             AS warm_without_opportunity,
           /*
            * Die Reaktivierungsmenge.
            *
            * Sie steht hier, weil daraus eine Handlung folgt: Liste öffnen,
            * durchgehen, entscheiden. Was hier NICHT steht, ist eine
            * Abschlussquote oder ein Pipeline-Wert — beides bräuchte
            * historische Statuswechsel und gepflegte Beträge, und beides
            * gibt es nicht.
            */
           (SELECT count(*) FROM organisations og
             WHERE og.lifecycle IN ('kunde','ehemaliger-kunde') AND og.excluded_reason IS NULL
               AND NOT EXISTS (SELECT 1 FROM opportunities o
                                WHERE o.organisation_id = og.id AND ${OPEN_CLAUSE}))::int
             AS customers_without_opportunity`,
      )) as {
        new_enquiries: number; due_today: number; overdue: number
        open_opportunities: number; without_next_action: number
        warm_without_opportunity: number; customers_without_opportunity: number
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
          WHERE o.status IN ('won','lost') AND o.excluded_reason IS NULL
          ORDER BY o.updated_at DESC LIMIT 5`,
      )) as OppRowDb[]

      const c = counts ?? {
        new_enquiries: 0, due_today: 0, overdue: 0,
        open_opportunities: 0, without_next_action: 0, warm_without_opportunity: 0,
        customers_without_opportunity: 0,
      }
      return {
        newEnquiries: c.new_enquiries,
        dueToday: c.due_today,
        overdue: c.overdue,
        openOpportunities: c.open_opportunities,
        withoutNextAction: c.without_next_action,
        warmWithoutOpportunity: c.warm_without_opportunity,
        customersWithoutOpportunity: c.customers_without_opportunity,
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
      await refreshExclusions()
      const where: string[] = [sqlLeadOperational("l", query.includeExcluded)]
      const params: unknown[] = []

      /*
       * Jede Bedingung schreibt `$` vor ihre Nummer.
       *
       * Ohne das Zeichen ist `$1` die Zahl 1 — Postgres vergleicht dann Text
       * mit einer Ganzzahl und lehnt ab, und `LIMIT 1 OFFSET 2` wird zu einer
       * stillen Falschantwort statt zu einem Fehler. Genau dieser Tippfehler
       * stand hier und liess die gesamte Anfrageliste gegen die echte
       * Datenbank in den Fehlerzustand laufen; lokal fiel er nicht auf, weil
       * es lokal keine Datenbank gibt.
       */
      if (query.handling) { params.push(query.handling); where.push(`l.handling_status = $${params.length}`) }
      if (query.source) { params.push(query.source); where.push(`l.source = $${params.length}`) }
      if (query.search?.trim()) {
        params.push(`%${query.search.trim()}%`)
        const n = params.length
        where.push(`(l.reference ILIKE $${n} OR l.business ILIKE $${n} OR l.name ILIKE $${n} OR l.email ILIKE $${n})`)
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
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      )) as EnqRowDb[]

      const mapped = rows.map(toEnquiry)
      /* JS-Netz: dieselbe Regel wie SQL — Preview 03.09. zeigte Testzeilen trotz Filter. */
      const visible = query.includeExcluded ? mapped : mapped.filter((row) => !isTestEnquiry(row))
      const total = query.includeExcluded
        ? (counted[0]?.total ?? 0)
        : Math.max(0, (counted[0]?.total ?? 0) - (mapped.length - visible.length))
      return { rows: visible, total }
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
        `SELECT DISTINCT source FROM leads WHERE ${sqlLeadOperational("leads")} ORDER BY source`,
      )) as { source: string }[]
      return rows.map((r) => r.source)
    },

    async listOpportunities(query: OpportunityQuery) {
      await ready()
      const where: string[] = [live("o", false)].filter(Boolean)
      const params: unknown[] = []

      if (query.status) { params.push(query.status); where.push(`o.status = $${params.length}`) }
      switch (query.bucket) {
        case "offen": where.push(OPEN_CLAUSE); break
        case "faellig": where.push(`${OPEN_CLAUSE} AND o.next_action_at = current_date`); break
        case "ueberfaellig": where.push(`${OPEN_CLAUSE} AND o.next_action_at < current_date`); break
        case "ohne-schritt": where.push(`${OPEN_CLAUSE} AND o.next_action IS NULL`); break
        case "abgeschlossen": where.push(`o.status IN ('won','lost')`); break
        default: break
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

      /*
       * Zweimal auf denselben Knopf ergibt einen Vorgang, nicht zwei.
       *
       * Die Sperre steht auf `from_lead_id`, einem echten Fremdschlüssel.
       * Vorher hing sie an einer Näherung („gleicher Kontakt, danach
       * angelegt"), die den falschen Vorgang finden und deshalb auch den
       * richtigen übersehen konnte — eine Dublettensperre auf einer Vermutung
       * ist keine.
       *
       * Ohne Anfrage gibt es nichts zu sperren: Wer von Hand zwei Vorgänge
       * für dieselbe Organisation anlegt, meint in aller Regel zwei
       * Geschäfte. Das zu verhindern hiesse, eine Regel zu erfinden.
       */
      if (input.fromLeadId) {
        const existing = (await sql.query(
          `SELECT ${OPP_COLUMNS} ${OPP_FROM} WHERE o.from_lead_id = $1 ORDER BY o.created_at ASC LIMIT 1`,
          [input.fromLeadId],
        )) as OppRowDb[]
        if (existing.length) return toOpportunity(existing[0])
      }

      /*
       * Der Ausschluss wird HIER vererbt, nicht erst beim naechsten Start.
       *
       * `applyExclusions()` laeuft beim Hochfahren eines Prozesses. Ein
       * Vorgang, den jemand danach aus einer ausgeschlossenen Anfrage anlegt,
       * stuende bis zum naechsten Kaltstart in der Pipeline — ausgerechnet
       * dort, wo eine erfundene Zeile am teuersten ist.
       *
       * Ein Unterausdruck statt einer zweiten Abfrage: Waere es ein eigener
       * Schritt, gaebe es einen Moment, in dem der Vorgang existiert und noch
       * nicht markiert ist. Kurz, aber genau der Moment, in dem jemand die
       * Pipeline oeffnet.
       */
      const id = randomUUID()
      const rows = (await sql.query(
        `INSERT INTO opportunities
           (id, organisation_id, contact_id, title, status, source, from_lead_id,
            excluded_reason, created_at, updated_at)
         VALUES ($1,$2,$3,$4,'new',$5,$6,
                 (SELECT l.excluded_reason FROM leads l WHERE l.id = $6::text),
                 now(), now())
         RETURNING id, organisation_id, contact_id, title, status, source,
                   next_action, next_action_at, last_contact_at, note,
                   estimated_value, lost_reason, from_lead_id, created_at, updated_at`,
        [id, input.organisationId, input.contactId, input.title, input.source, input.fromLeadId ?? null],
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
      const where: string[] = [live("c", query.includeExcluded)].filter(Boolean)
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
        /* Deckungsgleich mit der Zahl „Warm ohne Chance" auf der Übersicht.
           Vorher führte die Kachel auf „ohne-chance" — eine deutlich grössere
           Menge als die, die sie zählte. Eine Zahl, die auf eine andere Liste
           zeigt, ist schlimmer als keine Verknüpfung. */
        case "warm-ohne-chance":
          where.push(`c.relationship IN ('warm','eng')`)
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
            SET name         = $2::text,
                phone        = $3::text,
                linkedin_url = $4::text,
                role         = $5::text,
                note         = $6::text,
                updated_at   = now()
          WHERE id = $1 RETURNING id`,
        [id, input.name, input.phone, input.linkedinUrl, input.role, input.note],
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

    async listOrganisations(query: OrganisationQuery) {
      await ready()
      const where: string[] = [live("org", query.includeExcluded)].filter(Boolean)
      const params: unknown[] = []

      if (query.lifecycle) {
        params.push(query.lifecycle)
        where.push(`org.lifecycle = $${params.length}`)
      }
      switch (query.bucket) {
        case "mit-chance":
          where.push(`EXISTS (SELECT 1 FROM opportunities o WHERE o.organisation_id = org.id AND ${OPEN_CLAUSE})`)
          break
        case "ohne-chance":
          where.push(`NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.organisation_id = org.id AND ${OPEN_CLAUSE})`)
          break
        /* Deckungsgleich mit der Kachel „Kunden ohne offene Chance". */
        case "kunde-ohne-chance":
          where.push(`org.lifecycle IN ('kunde','ehemaliger-kunde')`)
          where.push(`NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.organisation_id = org.id AND ${OPEN_CLAUSE})`)
          break
        default: break
      }
      if (query.search?.trim()) {
        params.push(`%${query.search.trim()}%`)
        const n = params.length
        where.push(`(org.name ILIKE $${n} OR org.city ILIKE $${n} OR org.industry ILIKE $${n})`)
      }
      const clause = where.length ? `WHERE ${where.join(" AND ")}` : ""

      const counted = (await sql.query(
        `SELECT count(*)::int AS total FROM organisations org ${clause}`, params,
      )) as { total: number }[]

      const limit = query.limit ?? 100
      const offset = query.offset ?? 0
      const rows = (await sql.query(
        `SELECT ${ORG_COLUMNS} FROM organisations org ${clause}
          ORDER BY org.name ASC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      )) as OrgRowDb[]

      return { rows: rows.map(toOrganisation), total: counted[0]?.total ?? 0 }
    },

    async getOrganisation(id: string): Promise<OrganisationRow | null> {
      await ready()
      const rows = (await sql.query(
        `SELECT ${ORG_COLUMNS} FROM organisations org WHERE org.id = $1 LIMIT 1`, [id],
      )) as OrgRowDb[]
      return rows.length ? toOrganisation(rows[0]) : null
    },

    async updateOrganisationDetails(id, input) {
      await ready()
      const rows = (await sql.query(
        `UPDATE organisations
            SET name        = $2::text,
                website     = $3::text,
                email       = $4::text,
                phone       = $5::text,
                street      = $6::text,
                postal_code = $7::text,
                city        = $8::text,
                country     = $9::text,
                industry    = $10::text,
                linkedin_url = $11::text,
                note        = $12::text,
                updated_at  = now()
          WHERE id = $1 RETURNING id`,
        [
          id, input.name, input.website, input.email, input.phone, input.street,
          input.postalCode, input.city, input.country, input.industry,
          input.linkedinUrl, input.note,
        ],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("organisation", id, "organisation.details", "Stammdaten geändert")
      return true
    },

    async updateOrganisationLifecycle(id, stage) {
      await ready()
      const rows = (await sql.query(
        `UPDATE organisations SET lifecycle = $2::text, updated_at = now()
          WHERE id = $1 RETURNING id`,
        [id, stage],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("organisation", id, "organisation.lifecycle", `Kundenhistorie: ${LIFECYCLE_LABELS[stage]}`)
      return true
    },

    async listLocations(organisationId: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT * FROM locations WHERE organisation_id = $1 ORDER BY label ASC`,
        [organisationId],
      )) as LocRowDb[]
      return rows.map(toLocation)
    },

    async createLocation(organisationId, input): Promise<Location> {
      await ready()
      const id = randomUUID()
      const rows = (await sql.query(
        `INSERT INTO locations
           (id, organisation_id, label, street, postal_code, city, country,
            phone, email, note, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now())
         RETURNING *`,
        [
          id, organisationId, input.label, input.street, input.postalCode,
          input.city, input.country, input.phone, input.email, input.note,
        ],
      )) as LocRowDb[]
      await note("organisation", organisationId, "organisation.location", `Standort angelegt: ${input.label}`)
      return toLocation(rows[0])
    },

    async updateLocation(id, input) {
      await ready()
      const rows = (await sql.query(
        `UPDATE locations
            SET label = $2::text, street = $3::text, postal_code = $4::text,
                city = $5::text, country = $6::text, phone = $7::text,
                email = $8::text, note = $9::text, updated_at = now()
          WHERE id = $1
        RETURNING organisation_id`,
        [
          id, input.label, input.street, input.postalCode, input.city,
          input.country, input.phone, input.email, input.note,
        ],
      )) as { organisation_id: string }[]
      if (!rows.length) return false
      await note("organisation", rows[0].organisation_id, "organisation.location", `Standort geändert: ${input.label}`)
      return true
    },

    /**
     * Der einzige echte Löschvorgang im Vertrieb.
     *
     * Er ist vertretbar, weil ein Standort nichts trägt: keine Anfrage, keine
     * Chance, keine Chronik hängt an ihm. Bei Organisation, Kontakt und
     * Anfrage wäre dasselbe unverantwortlich — dort wird ausgeschlossen, nicht
     * gelöscht, und die Chronik hält fest, dass es passiert ist.
     */
    async deleteLocation(id: string) {
      await ready()
      const rows = (await sql.query(
        `DELETE FROM locations WHERE id = $1 RETURNING organisation_id, label`,
        [id],
      )) as { organisation_id: string; label: string }[]
      if (!rows.length) return false
      await note("organisation", rows[0].organisation_id, "organisation.location", `Standort entfernt: ${rows[0].label}`)
      return true
    },

    async contactsForOrganisation(organisationId: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT c.*, org.name AS organisation_name,
                (SELECT count(*) FROM opportunities o
                  WHERE o.contact_id = c.id AND ${OPEN_CLAUSE})::int AS open_opportunities
           FROM contacts c
           LEFT JOIN organisations org ON org.id = c.organisation_id
          WHERE c.organisation_id = $1
          ORDER BY c.name ASC`,
        [organisationId],
      )) as ContactRowDb[]
      return rows.map(toContact)
    },

    async opportunitiesForOrganisation(organisationId: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT ${OPP_COLUMNS} ${OPP_FROM} WHERE o.organisation_id = $1 ORDER BY o.updated_at DESC`,
        [organisationId],
      )) as OppRowDb[]
      return rows.map(toOpportunity)
    },

    async leadsForOrganisation(organisationId: string) {
      await ready()
      const rows = (await sql.query(
        `SELECT id, reference, source, created_at FROM leads
          WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [organisationId],
      )) as { id: string; reference: string; source: string; created_at: Ts }[]
      return rows.map((r) => ({ ...r, createdAt: iso(r.created_at) }))
    },

    async organisationChoices() {
      await ready()
      const rows = (await sql.query(
        `SELECT id, name FROM organisations WHERE excluded_reason IS NULL ORDER BY name ASC`,
      )) as { id: string; name: string }[]
      return rows
    },

    async updateContactOrganisation(contactId: string, organisationId: string | null) {
      await ready()
      const rows = (await sql.query(
        `UPDATE contacts SET organisation_id = $2::text, updated_at = now()
          WHERE id = $1 RETURNING id`,
        [contactId, organisationId],
      )) as { id: string }[]
      if (!rows.length) return false
      await note(
        "contact", contactId, "contact.organisation",
        organisationId ? "Organisation zugeordnet" : "Organisationszuordnung entfernt",
      )
      return true
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
      const rows = (await sql.query(
        `SELECT l.id, l.reference FROM leads l
           JOIN opportunities o ON o.from_lead_id = l.id
          WHERE o.id = $1 LIMIT 1`,
        [opportunityId],
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
