import { randomUUID } from "node:crypto"

import { OFFERS } from "@/lib/offer-readiness"
import { KATALOG, fehltFuer, type Angebot, type Annahme, type Befund, type Position } from "@/lib/angebot"
import {
  UEBERGABE_STUECKE,
  fehltFuerZustand,
  type Aenderung,
  type Mangel,
  type Projekt,
  type UebergabeEintrag,
  type UebergabeKey,
} from "@/lib/lieferung"
import { sanitizeClaim, type EvidenceRow, type ResearchCase } from "@/lib/research"
import type { PersonRef } from "@/lib/contact-access"
import type { SalesStatus } from "@/lib/lead-store"
import { isTestEnquiry, sqlLeadOperational } from "@/lib/vertrieb-bestand"
import { SALES_LABELS_DE, TERMINAL_STATES } from "@/lib/lead-store"
import {
  linkLeadToCrm,
  markLeadExclusions,
  neonClient,
  readOwnerLoadSamples,
  readMeasurementSamples,
  writeMeasurementSample,
  writeOwnerLoadSample,
  type Sql,
} from "@/lib/neon-client"
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
  OwnerLoadSample,
  MeasurementSampleRow,
  Akteur,
  ArchivGrund,
  DublettenKandidat,
  Herkunft,
  ManuelleAnfrage,
  ReleaseEingabe,
  ReleaseRow,
  Schreibergebnis,
} from "@/lib/vertrieb"
import { AKTEUR_SYSTEM } from "@/lib/vertrieb"
import { createLeadIdentity } from "@/lib/lead-id"
import { LIFECYCLE_LABELS, RELATIONSHIP_LABELS } from "@/lib/vertrieb"
import { SQL_HEUTE } from "@/lib/geschaeftszeit"

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

/* ── GATE 17 · Angebotszeile ──────────────────────────────────────────────── */

type OfferRow = {
  id: string
  opportunity_id: string
  reference: string
  kind: string
  locale: string
  valid_until: Ts
  sections: unknown
  positions: unknown
  state: string
  acceptance: unknown
  sent_snapshot: unknown
  sent_at: Ts | null
  created_at: Ts
  updated_at: Ts
}

/** `valid_until` ist ein DATE — als ISO-Tag, nicht als Zeitpunkt mit Zone. */
const tag = (v: Ts): string => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10))

function toAngebot(r: OfferRow): Angebot {
  return {
    id: r.id,
    opportunityId: r.opportunity_id,
    referenz: r.reference,
    kind: r.kind as Angebot["kind"],
    sprache: r.locale as Angebot["sprache"],
    gueltigBis: tag(r.valid_until),
    abschnitte: (r.sections ?? {}) as Record<string, string>,
    positionen: (r.positions ?? []) as Position[],
    zustand: r.state as Angebot["zustand"],
    annahme: (r.acceptance ?? null) as Annahme | null,
    erstelltAm: iso(r.created_at),
  }
}


/* ── GATE 19 · Projektzeile ───────────────────────────────────────────────── */

type ProjectRow = {
  id: string
  opportunity_id: string
  offer_id: string
  material_received: Ts | null
  changes: unknown
  acceptance: unknown
  handover: unknown
  state: string
  created_at: Ts
  updated_at: Ts
}

function toProjekt(r: ProjectRow): Projekt {
  return {
    id: r.id,
    opportunityId: r.opportunity_id,
    offerId: r.offer_id,
    materialEingang: r.material_received === null ? null : tag(r.material_received),
    aenderungen: (r.changes ?? []) as Aenderung[],
    abnahme: (r.acceptance ?? null) as Projekt["abnahme"],
    uebergabe: (r.handover ?? {}) as Projekt["uebergabe"],
    zustand: r.state as Projekt["zustand"],
    erstelltAm: iso(r.created_at),
  }
}

/**
 * Der Betrag einer Katalogposition fuer den Schnappschuss.
 *
 * Bewusst hier und nicht in `lib/angebot.ts` importiert: Dort ist es eine
 * reine Funktion ueber dem Katalog; hier wird sie einmalig eingefroren.
 */
function katalogBetrag(p: Position): number | null {
  return p.art === "katalog" ? (KATALOG[p.quelle]?.() ?? null) : p.betrag
}

const isoOrNull = (v: Ts | null): string | null => (v === null ? null : iso(v))
const day = (v: Ts | null): string | null => (v === null ? null : iso(v).slice(0, 10))

type OppRowDb = {
  id: string; organisation_id: string | null; contact_id: string | null
  title: string; status: string; source: string | null
  next_action: string | null; next_action_at: Ts | null; last_contact_at: Ts | null
  note: string | null; estimated_value: number | null; lost_reason: string | null
  from_lead_id: string | null
  responsible: string | null
  offer_kind: string | null; readiness_evidence: string[] | null
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
    responsible: r.responsible ?? null,
    offerKind: (r.offer_kind as OpportunityRow["offerKind"]) ?? null,
    /* Postgres liefert `null` fuer eine nie gesetzte Spalte in alten Zeilen —
       leer ist hier die richtige Lesart, nicht „unbekannt". */
    readinessEvidence: r.readiness_evidence ?? [],
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
  strongest_relationship?: string | null
  last_activity_at?: Ts | null
  next_step?: string | null
  next_step_at?: Date | string | null
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
    /*
     * `unbekannt` faellt hier auf `null` zurueck: Der Wert ist die
     * Vorbelegung jedes neuen Kontakts und sagt nichts aus. Ihn als
     * Beziehungsgrad anzuzeigen hiesse, eine nicht getroffene Einschaetzung
     * als Einschaetzung auszugeben.
     */
    strongestRelationship:
      r.strongest_relationship && r.strongest_relationship !== "unbekannt"
        ? (r.strongest_relationship as RelationshipLevel)
        : null,
    lastActivityAt: isoOrNull(r.last_activity_at ?? null),
    nextStep: r.next_step ?? null,
    nextStepAt: day(r.next_step_at ?? null),
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
  name: string; email: string | null; phone: string | null
  business: string | null; message: string | null; site_url: string | null
  responsible: string | null; archive_reason: string | null; duplicate_of: string | null
  next_action: string | null; next_action_at: Ts | null
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null
  handling_status: string
  contact_id: string | null; contact_name: string | null
  organisation_id: string | null; organisation_name: string | null
  opportunity_id: string | null
  excluded_reason: string | null
  check_score: number | null
  check_bottleneck: string | null
  check_manual_spots: number | null
  created_at: Ts; updated_at: Ts
}

function toEnquiry(r: EnqRowDb): EnquiryRow {
  return {
    id: r.id, reference: r.reference, source: r.source, locale: r.locale,
    name: r.name, email: r.email, phone: r.phone,
    business: r.business, message: r.message, siteUrl: r.site_url,
    utmSource: r.utm_source, utmMedium: r.utm_medium, utmCampaign: r.utm_campaign,
    handlingStatus: r.handling_status as HandlingStatus,
    responsible: r.responsible,
    archiveReason: r.archive_reason,
    duplicateOf: r.duplicate_of,
    nextAction: r.next_action,
    nextActionAt: day(r.next_action_at),
    contactId: r.contact_id, contactName: r.contact_name,
    organisationId: r.organisation_id, organisationName: r.organisation_name,
    opportunityId: r.opportunity_id,
    excludedReason: r.excluded_reason,
    checkScore: r.check_score,
    checkBottleneck: r.check_bottleneck,
    checkManualSpots: r.check_manual_spots,
    createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
  }
}

const ENQ_COLUMNS = `
  l.id, l.reference, l.source, l.locale, l.name, l.email, l.phone,
  l.business, l.message, l.site_url,
  l.utm_source, l.utm_medium, l.utm_campaign,
  l.handling_status, l.contact_id, l.organisation_id, l.excluded_reason,
  l.responsible, l.archive_reason, l.duplicate_of, l.next_action, l.next_action_at,
  l.check_score, l.check_bottleneck, l.check_manual_spots,
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
  o.estimated_value, o.lost_reason, o.from_lead_id, o.responsible, o.offer_kind, o.readiness_evidence,
  o.created_at, o.updated_at,
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
      AND o.excluded_reason IS NULL)::int AS open_opportunities,

  /*
   * Der staerkste belegte Beziehungsgrad unter den Ansprechpartnern.
   *
   * Die Rangfolge steht als CASE hier und nicht als Sortierung auf dem Text:
   * Alphabetisch waere „warm" > „unbekannt" > „eng" > „bekannt", also genau
   * die falsche Reihenfolge. Ausgeschlossene Kontakte zaehlen nicht mit —
   * ein Abnahmedatensatz darf keine Beziehung behaupten.
   */
  (SELECT c3.relationship FROM contacts c3
     WHERE c3.organisation_id = org.id AND c3.excluded_reason IS NULL
     ORDER BY CASE c3.relationship
                WHEN 'eng' THEN 3 WHEN 'warm' THEN 2 WHEN 'bekannt' THEN 1 ELSE 0
              END DESC
     LIMIT 1) AS strongest_relationship,

  /*
   * Wann zuletzt etwas aufgezeichnet wurde — ueber die Organisation selbst,
   * ihre Kontakte und ihre Vorgaenge. Anfragen bleiben aussen vor: Sie
   * erzeugen beim Eingang ohnehin eine Aktivitaet, und ein zweiter Weg
   * dorthin wuerde dieselbe Sache doppelt zaehlen.
   */
  (SELECT max(a.created_at) FROM activities a
     WHERE (a.subject_type = 'organisation' AND a.subject_id = org.id)
        OR (a.subject_type = 'contact' AND a.subject_id IN (
              SELECT c4.id FROM contacts c4 WHERE c4.organisation_id = org.id))
        OR (a.subject_type = 'opportunity' AND a.subject_id IN (
              SELECT o4.id FROM opportunities o4 WHERE o4.organisation_id = org.id))
  ) AS last_activity_at,

  /*
   * Der naechste faellige Schritt aus einem offenen Vorgang. next_action_at
   * kann fehlen, waehrend next_action steht — dann hat der Schritt kein
   * Datum, und NULLS LAST schiebt ihn hinter die datierten. Ein Schritt
   * ohne Termin ist nicht dringender als einer mit.
   */
  (SELECT o5.next_action FROM opportunities o5
     WHERE o5.organisation_id = org.id AND o5.status NOT IN ('won','lost')
       AND o5.excluded_reason IS NULL AND o5.next_action IS NOT NULL
     ORDER BY o5.next_action_at ASC NULLS LAST LIMIT 1) AS next_step,
  (SELECT o6.next_action_at FROM opportunities o6
     WHERE o6.organisation_id = org.id AND o6.status NOT IN ('won','lost')
       AND o6.excluded_reason IS NULL AND o6.next_action IS NOT NULL
     ORDER BY o6.next_action_at ASC NULLS LAST LIMIT 1) AS next_step_at
`

/*
 * GATE 10 — Zeilen zu Recherche-Objekten. Getrennt gehalten, weil die
 * Belege in einem eigenen Zug geladen werden (kein N+1) und dann zugeordnet.
 */
function toEvidence(r: Record<string, unknown>): EvidenceRow {
  return {
    id: String(r.id),
    kind: r.kind as EvidenceRow["kind"],
    ref: (r.ref as string | null) ?? null,
    claim: String(r.claim),
    sourceUrl: String(r.source_url),
    sourceKind: r.source_kind as EvidenceRow["sourceKind"],
    observedAt: iso(r.observed_at as Ts),
    supersededBy: (r.superseded_by as string | null) ?? null,
  }
}

function toResearchCase(r: Record<string, unknown>, evidence: EvidenceRow[]): ResearchCase {
  return {
    id: String(r.id),
    organisationId: String(r.organisation_id),
    organisationName: String(r.organisation_name),
    status: r.status as ResearchCase["status"],
    discoveryWhy: String(r.discovery_why),
    discoveryKind: r.discovery_kind as ResearchCase["discoveryKind"],
    discoveryUrl: (r.discovery_url as string | null) ?? null,
    access: (r.access as ResearchCase["access"]) ?? null,
    serviceable: (r.serviceable as boolean | null) ?? null,
    nextAction: (r.next_action as string | null) ?? null,
    discoveredAt: iso(r.discovered_at as Ts),
    researchedAt: r.researched_at ? iso(r.researched_at as Ts) : null,
    evidence,
    contactId: (r.contact_id as string | null) ?? null,
    contactDecision: (r.contact_decision as ResearchCase["contactDecision"]) ?? null,
    contactDecisionAt: r.contact_decision_at ? iso(r.contact_decision_at as Ts) : null,
    contactDecisionNote: (r.contact_decision_note as string | null) ?? null,
  }
}

function toPerson(r: Record<string, unknown>): PersonRef {
  return {
    id: String(r.id), name: String(r.name),
    role: (r.role as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    linkedinUrl: (r.linkedin_url as string | null) ?? null,
    relationship: r.relationship as PersonRef["relationship"],
    sourceUrl: (r.source_url as string | null) ?? null,
    sourceKind: (r.source_kind as PersonRef["sourceKind"]) ?? null,
    sourceNote: (r.source_note as string | null) ?? null,
  }
}

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

/**
 * ADM-03 — `akteur` steht in jeder Chronikzeile, die diese Instanz schreibt.
 * Eine Action holt sich eine eigene Instanz mit ihrer Rolle (die Verbindung
 * ist je Adresse gecacht, die Instanz kostet nur eine Closure). Ohne Angabe
 * schreibt die Instanz `system`/`SYSTEM` — z. B. für Prüfläufe.
 */
export function createNeonVertrieb(connectionString: string, akteur: Akteur = AKTEUR_SYSTEM): VertriebStore {
  const client: {
    sql: Sql
    ready: () => Promise<void>
  } = neonClient(connectionString)
  const { sql, ready } = client

  /** Chronik-Eintrag. Immer im selben Aufruf wie die Änderung — mit Akteur und Herkunft (ADM-03). */
  async function note(
    subjectType: ActivitySubject,
    subjectId: string,
    kind: string,
    summary: string,
    detail: string | null = null,
    data: Record<string, unknown> | null = null,
  ): Promise<void> {
    await sql.query(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, data, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb, now())`,
      [randomUUID(), subjectType, subjectId, kind, summary, detail, akteur.kennung, akteur.herkunft, data === null ? null : JSON.stringify(data)],
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
              AND o.next_action_at = ${SQL_HEUTE})::int AS due_today,
           (SELECT count(*) FROM opportunities o WHERE ${OPEN_CLAUSE}
              AND o.next_action_at < ${SQL_HEUTE})::int AS overdue,
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
             AS customers_without_opportunity,
           (SELECT count(*) FROM leads l WHERE l.handling_status <> 'archiviert'
              AND l.next_action_at = ${SQL_HEUTE} AND ${sqlLeadOperational("l")})::int AS enquiries_due_today,
           (SELECT count(*) FROM leads l WHERE l.handling_status <> 'archiviert'
              AND l.next_action_at < ${SQL_HEUTE} AND ${sqlLeadOperational("l")})::int AS enquiries_overdue`,
      )) as {
        new_enquiries: number; due_today: number; overdue: number
        open_opportunities: number; without_next_action: number
        warm_without_opportunity: number; customers_without_opportunity: number
        enquiries_due_today: number; enquiries_overdue: number
      }[]

      /*
       * „Braucht Aufmerksamkeit" ist eine Sortierung, keine Bewertung:
       * überfällig vor heute fällig vor ohne Termin vor ohne Schritt. Kein
       * Punktesystem — es gäbe keine Daten, aus denen eine Punktzahl
       * entstehen könnte.
       *
       * -----------------------------------------------------------------
       * DIE BEDINGUNG HING BIS 03.09.2026 AM SCHRITT STATT AM DATUM
       * Sie lautete `next_action_at <= current_date OR next_action IS NULL`.
       * Ein Vorgang mit Schritt ABER OHNE TERMIN erfüllte beides nicht: Der
       * Vergleich mit NULL ist nicht wahr, und der Schritt war ja gesetzt.
       * Solche Vorgänge fielen aus JEDER Aufmerksamkeitsansicht heraus —
       * nicht auffällig, weil sie nirgends als fehlend erschienen.
       *
       * Nachgemessen am 03.09.2026 gegen ein lokales Postgres 17 mit vier
       * Vorgängen: „Ohne Termin" (Schritt gesetzt, Datum leer) kam in
       * keiner Zeile zurück; die Abfrage lieferte null Zeilen, obwohl ein
       * offener Vorgang einen ungeplanten Schritt trug.
       *
       * Jetzt hängt sie am Datum. Das deckt beide Fälle ab: kein Schritt
       * heisst auch kein Termin, und ein Schritt ohne Termin ist genau der
       * Fall, der vorher verschwand. Eingeordnet wird in `lib/attention.ts`.
       */
      const attention = (await sql.query(
        `SELECT ${OPP_COLUMNS} ${OPP_FROM}
          WHERE ${OPEN_CLAUSE}
            AND (o.next_action_at IS NULL OR o.next_action_at <= ${SQL_HEUTE})
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
        customers_without_opportunity: 0, enquiries_due_today: 0, enquiries_overdue: 0,
      }
      return {
        newEnquiries: c.new_enquiries,
        dueToday: c.due_today,
        overdue: c.overdue,
        enquiriesDueToday: c.enquiries_due_today,
        enquiriesOverdue: c.enquiries_overdue,
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
      /*
       * ADM-02 · H1 — hier stand der tabellenweite Ausschluss: jedes Öffnen der
       * Inbox schrieb ~60 UPDATEs. Markiert wird jetzt beim Speichern der
       * Anfrage (`markLeadExclusions`). Lesen liest.
       */
      await ready()
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
      if (query.faellig) where.push(`l.handling_status <> 'archiviert' AND l.next_action_at IS NOT NULL AND l.next_action_at <= ${SQL_HEUTE}`)
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

    /* ── Recherche (Gate 10) ────────────────────────────────────────── *
     * Ein Vorgang je Organisation; die Belege haengen daran. Die
     * Einordnung wird NICHT gespeichert — sie faellt in `lib/research.ts`
     * aus den gueltigen Belegen, damit eine Regelaenderung nicht eine
     * Datenbank voller falscher Urteile hinterlaesst.
     * ---------------------------------------------------------------- */
    async listResearch(query): Promise<ResearchCase[]> {
      await ready()
      const werte: unknown[] = []
      const wo: string[] = ["o.excluded_reason IS NULL"]
      if (query?.status) { werte.push(query.status); wo.push(`rc.status = $${werte.length}`) }
      werte.push(Math.min(query?.limit ?? 100, 300))
      /* Ein Zug fuer Vorgaenge, ein Zug fuer Belege — kein N+1. */
      const faelle = await sql.query(
        `SELECT rc.*, o.name AS organisation_name
           FROM research_cases rc JOIN organisations o ON o.id = rc.organisation_id
          WHERE ${wo.join(" AND ")}
          ORDER BY rc.updated_at DESC LIMIT $${werte.length}`, werte)
      if (!faelle.length) return []
      const belege = await sql.query(
        `SELECT * FROM research_evidence WHERE case_id = ANY($1::text[]) ORDER BY observed_at`,
        [faelle.map((f) => String(f.id))])
      const nachFall = new Map<string, EvidenceRow[]>()
      for (const b of belege) {
        const k = String(b.case_id)
        nachFall.set(k, [...(nachFall.get(k) ?? []), toEvidence(b)])
      }
      return faelle.map((f) => toResearchCase(f, nachFall.get(String(f.id)) ?? []))
    },

    async getResearch(id): Promise<ResearchCase | null> {
      await ready()
      const rows = await sql.query(
        `SELECT rc.*, o.name AS organisation_name
           FROM research_cases rc JOIN organisations o ON o.id = rc.organisation_id
          WHERE rc.id = $1`, [id])
      if (!rows.length) return null
      const belege = await sql.query(
        `SELECT * FROM research_evidence WHERE case_id = $1 ORDER BY observed_at`, [id])
      return toResearchCase(rows[0]!, belege.map(toEvidence))
    },

    async addEvidence(caseId, input): Promise<boolean> {
      await ready()
      /* Fremder Text wird entschaerft, BEVOR er die Datenbank sieht. */
      const rows = await sql.query(
        `INSERT INTO research_evidence
           (id, case_id, kind, ref, claim, source_url, source_kind, observed_at, created_at)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, now(), now())
         RETURNING id`,
        [caseId, input.kind, input.ref, sanitizeClaim(input.claim), input.sourceUrl, input.sourceKind])
      if (rows.length) {
        await sql.query(
          `UPDATE research_cases SET researched_at = now(), updated_at = now() WHERE id = $1`, [caseId])
      }
      return rows.length > 0
    },

    async supersedeEvidence(oldId, newId): Promise<boolean> {
      await ready()
      const rows = await sql.query(
        `UPDATE research_evidence SET superseded_by = $2 WHERE id = $1 RETURNING id`, [oldId, newId])
      return rows.length > 0
    },

    /* ── Kontakt & Zugang (Gate 11) ─────────────────────────────────── */

    async getResearchPerson(caseId): Promise<PersonRef | null> {
      await ready()
      const rows = await sql.query(
        `SELECT c.* FROM research_cases rc JOIN contacts c ON c.id = rc.contact_id
          WHERE rc.id = $1 AND c.excluded_reason IS NULL`, [caseId])
      return rows.length ? toPerson(rows[0]!) : null
    },

    async listOrganisationContacts(organisationId): Promise<PersonRef[]> {
      await ready()
      const rows = await sql.query(
        `SELECT * FROM contacts WHERE organisation_id = $1 AND excluded_reason IS NULL ORDER BY name`,
        [organisationId])
      return rows.map(toPerson)
    },

    async linkResearchContact(caseId, contactId): Promise<boolean> {
      await ready()
      const rows = await sql.query(
        `UPDATE research_cases SET contact_id = $2, updated_at = now() WHERE id = $1 RETURNING id`,
        [caseId, contactId])
      return rows.length > 0
    },

    /*
     * Die Fundstelle zur Person. Sie ueberschreibt nichts, was ein Mensch
     * schon eingetragen hat — nur leere Felder werden gefuellt, dieselbe
     * `coalesce`-Regel wie im Bestandsimport (Gate 07).
     */
    async setContactSource(contactId, source): Promise<boolean> {
      await ready()
      const rows = await sql.query(
        `UPDATE contacts
            SET source_url  = coalesce($2::text, source_url),
                source_kind = coalesce($3::text, source_kind),
                source_note = coalesce($4::text, source_note),
                updated_at  = now()
          WHERE id = $1 RETURNING id`,
        [contactId, source.url, source.kind, source.note])
      return rows.length > 0
    },

    /*
     * Die Entscheidung. Sie kommt AUSSCHLIESSLICH von hier — kein anderer
     * Pfad schreibt `contact_decision`, und es gibt keine Ableitung, die
     * sie setzen koennte. Das ist die Grenze zwischen „wir wissen genug"
     * und „wir sprechen an".
     */
    async decideContact(caseId, decision, note): Promise<boolean> {
      await ready()
      const rows = await sql.query(
        `UPDATE research_cases
            SET contact_decision = $2::text,
                contact_decision_at = CASE WHEN $2::text IS NULL THEN NULL ELSE now() END,
                contact_decision_note = $3::text,
                updated_at = now()
          WHERE id = $1 RETURNING id`,
        [caseId, decision, note])
      return rows.length > 0
    },

    async updateResearchCase(id, patch): Promise<boolean> {
      await ready()
      const setzt: string[] = ["updated_at = now()"]
      const werte: unknown[] = [id]
      const feld = (spalte: string, wert: unknown) => { werte.push(wert); setzt.push(`${spalte} = $${werte.length}`) }
      if (patch.status !== undefined) feld("status", patch.status)
      if (patch.access !== undefined) feld("access", patch.access)
      if (patch.serviceable !== undefined) feld("serviceable", patch.serviceable)
      if (patch.nextAction !== undefined) feld("next_action", patch.nextAction)
      const rows = await sql.query(
        `UPDATE research_cases SET ${setzt.join(", ")} WHERE id = $1 RETURNING id`, werte)
      return rows.length > 0
    },

    async listOpportunities(query: OpportunityQuery) {
      await ready()
      const where: string[] = [live("o", false)].filter(Boolean)
      const params: unknown[] = []

      if (query.status) { params.push(query.status); where.push(`o.status = $${params.length}`) }
      switch (query.bucket) {
        case "offen": where.push(OPEN_CLAUSE); break
        case "faellig": where.push(`${OPEN_CLAUSE} AND o.next_action_at = ${SQL_HEUTE}`); break
        case "ueberfaellig": where.push(`${OPEN_CLAUSE} AND o.next_action_at < ${SQL_HEUTE}`); break
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
                 coalesce(
                   (SELECT l.excluded_reason FROM leads l WHERE l.id = $6::text),
                   (SELECT org.excluded_reason FROM organisations org WHERE org.id = $2::text),
                   (SELECT c.excluded_reason FROM contacts c WHERE c.id = $3::text)),
                 now(), now())
         ON CONFLICT (from_lead_id) WHERE from_lead_id IS NOT NULL DO NOTHING
         RETURNING id, organisation_id, contact_id, title, status, source,
                   next_action, next_action_at, last_contact_at, note,
                   estimated_value, lost_reason, from_lead_id, responsible, created_at, updated_at`,
        [id, input.organisationId, input.contactId, input.title, input.source, input.fromLeadId ?? null],
      )) as OppRowDb[]

      /*
       * ADM-03 · A08 — der zweite gleichzeitige Klick.
       * Die Prüfung oben (SELECT) sehen beide leer; die Datenbank lässt nur
       * einen einfügen (`opportunities_from_lead_unique`, Migration 017). Der
       * andere bekommt hier die bestehende Chance — ohne zweiten Chronikeintrag.
       */
      if (!rows.length && input.fromLeadId) {
        const bestehend = (await sql.query(
          `SELECT ${OPP_COLUMNS} ${OPP_FROM} WHERE o.from_lead_id = $1 LIMIT 1`,
          [input.fromLeadId],
        )) as OppRowDb[]
        return toOpportunity(bestehend[0])
      }

      await note("opportunity", id, "opportunity.created", `Verkaufschance angelegt: ${input.title}`)

      if (input.fromLeadId) {
        await sql.query(
          `UPDATE leads SET handling_status = 'bearbeitet' WHERE id = $1 AND handling_status <> 'archiviert'`,
          [input.fromLeadId],
        )
        await note("lead", input.fromLeadId, "lead.converted", "Verkaufschance aus dieser Anfrage angelegt")
        await note("opportunity", id, "opportunity.fromLead", "Entstanden aus einer Anfrage", null, { anfrage: input.fromLeadId })
      }
      return toOpportunity(rows[0])
    },

    async updateOpportunityStatus(id, status: SalesStatus, lostReason) {
      await ready()
      const vorher = (await sql.query(`SELECT status, updated_at FROM opportunities WHERE id = $1`, [id])) as { status: string; updated_at: Ts }[]
      if (!vorher.length) return false
      return (await this.moveOpportunity(id, status, lostReason, iso(vorher[0].updated_at))) === "ok"
    },

    /**
     * ADM-03 · A09 — Stufenwechsel mit Versionsprüfung und Historie.
     *
     * `stand` ist `updatedAt`, das die Oberfläche beim Laden gesehen hat. Hat
     * seitdem jemand anderes geändert, schreibt dieser Aufruf NICHT und meldet
     * `konflikt` — sonst überschreibt der zweite still den ersten. Die Chronik
     * erhält `{ von, nach }` als Daten, nicht als deutschen Satz.
     */
    async moveOpportunity(id, status: SalesStatus, lostReason, stand): Promise<Schreibergebnis> {
      await ready()
      const alt = (await sql.query(
        `SELECT status FROM opportunities WHERE id = $1`, [id],
      )) as { status: string }[]
      if (!alt.length) return "fehlt"
      const rows = (await sql.query(
        `UPDATE opportunities
            SET status      = $2::text,
                lost_reason = CASE WHEN $2::text = 'lost' THEN $3::text ELSE NULL END,
                last_contact_at = now(),
                updated_at  = now()
          WHERE id = $1 AND date_trunc('milliseconds', updated_at) = date_trunc('milliseconds', $4::timestamptz)
        RETURNING id`,
        [id, status, lostReason, stand],
      )) as { id: string }[]
      if (!rows.length) return "konflikt"
      const closing = TERMINAL_STATES.includes(status)
      await note(
        "opportunity",
        id,
        closing ? `opportunity.${status}` : "opportunity.status",
        `Status: ${SALES_LABELS_DE[status]}`,
        status === "lost" ? lostReason : null,
        { von: alt[0].status, nach: status, ...(status === "lost" ? { grund: lostReason } : {}) },
      )
      return "ok"
    },

    async setOpportunityResponsible(id, verantwortlich) {
      await ready()
      const rows = (await sql.query(
        `UPDATE opportunities SET responsible = $2::text, updated_at = now() WHERE id = $1 RETURNING id`,
        [id, verantwortlich],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("opportunity", id, "opportunity.responsible", "Verantwortlich geändert", null, { nach: verantwortlich })
      return true
    },

    /**
     * ADM-03 · A03 — eine Anfrage von Hand erfassen.
     *
     * Idempotent über `submission_key = manuell:<idempotenz>`: Das Formular
     * trägt einen beim Rendern erzeugten Schlüssel. Doppelklick, Zurück +
     * erneut absenden, zwei Tabs — eine Anfrage. Kontakt/Organisation entstehen
     * über denselben Weg wie bei der Website (`linkLeadToCrm`), Ausschlüsse
     * ebenso (`markLeadExclusions`).
     */
    async createEnquiry(input: ManuelleAnfrage) {
      await ready()
      const schluessel = `manuell:${input.idempotenz}`
      const { id, reference } = createLeadIdentity()
      const jetzt = new Date().toISOString()
      const eingefuegt = (await sql.query(
        `INSERT INTO leads (id, reference, submission_key, source, locale, name, email, phone, business, message,
                            sales_status, handling_status, responsible, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'new','neu',$11,$12,$12)
         ON CONFLICT (submission_key) DO NOTHING
         RETURNING id`,
        [id, reference, schluessel, input.quelle, input.sprache, input.name, input.email, input.telefon,
         input.betrieb, input.nachricht, input.verantwortlich, jetzt],
      )) as { id: string }[]
      if (!eingefuegt.length) {
        const vorhanden = (await sql.query(`SELECT id FROM leads WHERE submission_key = $1`, [schluessel])) as { id: string }[]
        return { id: vorhanden[0].id, neu: false }
      }
      await linkLeadToCrm(sql, { id, name: input.name, email: input.email, phone: input.telefon, business: input.betrieb, createdAt: jetzt }, akteur)
      await markLeadExclusions(sql, { id, name: input.name, business: input.betrieb, email: input.email, reference })
      await note("lead", id, "lead.created", "Anfrage von Hand erfasst", null, { quelle: input.quelle, verantwortlich: input.verantwortlich })
      return { id, neu: true }
    },

    async setLeadOrganisation(leadId, organisationId) {
      await ready()
      const rows = (await sql.query(
        `UPDATE leads SET organisation_id = $2::text, updated_at = now()
          WHERE id = $1 AND ($2::text IS NULL OR EXISTS (SELECT 1 FROM organisations o WHERE o.id = $2::text))
        RETURNING id`,
        [leadId, organisationId],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("lead", leadId, "lead.organisation", "Organisation zugeordnet", null, { nach: organisationId })
      return true
    },

    async setLeadResponsible(leadId, verantwortlich) {
      await ready()
      const rows = (await sql.query(
        `UPDATE leads SET responsible = $2::text, updated_at = now() WHERE id = $1 RETURNING id`,
        [leadId, verantwortlich],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("lead", leadId, "lead.responsible", "Verantwortlich geändert", null, { nach: verantwortlich })
      return true
    },

    async setLeadNextAction(leadId, action, at) {
      await ready()
      const rows = (await sql.query(
        `UPDATE leads
            SET next_action    = $2::text,
                next_action_at = CASE WHEN $2::text IS NULL THEN NULL ELSE $3::date END,
                updated_at     = now()
          WHERE id = $1
        RETURNING id`,
        [leadId, action, at],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("lead", leadId, "lead.nextAction", "Nächster Schritt gesetzt", action, { schritt: action, am: action ? at : null })
      return true
    },

    async archiveLead(leadId, grund: ArchivGrund, dubletteVon) {
      await ready()
      if (grund === "dublette" && (!dubletteVon || dubletteVon === leadId)) return false
      const rows = (await sql.query(
        `UPDATE leads
            SET handling_status = 'archiviert', archive_reason = $2::text,
                duplicate_of = CASE WHEN $2::text = 'dublette' THEN $3::text ELSE NULL END,
                updated_at = now()
          WHERE id = $1 AND ($2::text <> 'dublette' OR EXISTS (SELECT 1 FROM leads d WHERE d.id = $3::text))
        RETURNING id`,
        [leadId, grund, dubletteVon],
      )) as { id: string }[]
      if (!rows.length) return false
      await note("lead", leadId, "lead.archived", "Anfrage archiviert", null, { grund, dubletteVon: grund === "dublette" ? dubletteVon : null })
      return true
    },

    /**
     * ADM-03 · A06 — mögliche Dubletten, NUR als Hinweis.
     * Gleiche Mail, gleiche Telefonziffern, gleicher Betrieb, gleicher Name.
     * Nichts wird zusammengeführt; die Entscheidung trifft ein Mensch.
     */
    async possibleDuplicates(leadId): Promise<DublettenKandidat[]> {
      await ready()
      const rows = (await sql.query(
        `WITH a AS (
           SELECT id, lower(btrim(coalesce(email, ''))) AS mail,
                  regexp_replace(coalesce(phone, ''), '\\D', '', 'g') AS tel,
                  lower(btrim(coalesce(business, ''))) AS firma,
                  lower(btrim(name)) AS person, contact_id, organisation_id
             FROM leads WHERE id = $1)
         SELECT 'anfrage' AS art, l.id, coalesce(l.business, l.name) || ' · ' || l.reference AS titel,
                CASE WHEN a.mail <> '' AND lower(btrim(coalesce(l.email,''))) = a.mail THEN 'gleiche-email'
                     WHEN length(a.tel) >= 6 AND regexp_replace(coalesce(l.phone,''), '\\D', '', 'g') = a.tel THEN 'gleiches-telefon'
                     WHEN a.firma <> '' AND lower(btrim(coalesce(l.business,''))) = a.firma THEN 'gleicher-betrieb'
                     ELSE 'gleicher-name' END AS grund,
                l.created_at AS am
           FROM leads l, a
          WHERE l.id <> a.id AND l.excluded_reason IS NULL
            AND ((a.mail <> '' AND lower(btrim(coalesce(l.email,''))) = a.mail)
              OR (length(a.tel) >= 6 AND regexp_replace(coalesce(l.phone,''), '\\D', '', 'g') = a.tel)
              OR (a.firma <> '' AND lower(btrim(coalesce(l.business,''))) = a.firma)
              OR (lower(btrim(l.name)) = a.person))
         UNION ALL
         SELECT 'kontakt', c.id, c.name, CASE WHEN a.mail <> '' AND c.email_normalised = a.mail THEN 'gleiche-email' ELSE 'gleicher-name' END, c.created_at
           FROM contacts c, a
          WHERE c.excluded_reason IS NULL AND c.id IS DISTINCT FROM a.contact_id
            AND ((a.mail <> '' AND c.email_normalised = a.mail) OR lower(btrim(c.name)) = a.person)
         UNION ALL
         SELECT 'organisation', o.id, o.name, 'gleicher-betrieb', o.created_at
           FROM organisations o, a
          WHERE o.excluded_reason IS NULL AND a.firma <> '' AND o.id IS DISTINCT FROM a.organisation_id
            AND lower(o.name) = a.firma
         ORDER BY 5 DESC NULLS LAST
         LIMIT 20`,
        [leadId],
      )) as { art: DublettenKandidat["art"]; id: string; titel: string; grund: DublettenKandidat["grund"]; am: Ts | null }[]
      return rows.map((r) => ({ art: r.art, id: r.id, titel: r.titel, grund: r.grund, am: isoOrNull(r.am) }))
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

    /*
     * GATE 08 — Angebotsart und Belege.
     *
     * Beides in EINEM Schreibvorgang: Wechselt die Angebotsart, gelten
     * andere Belege, und die alten duerfen nicht stehen bleiben. Wer von
     * „Systemprojekt" auf „Website-Paket" wechselt, hat sonst plötzlich
     * Häkchen an Fragen, die für das Paket nie gestellt wurden — und die
     * Reife entstünde aus Belegen für ein anderes Angebot.
     *
     * Die Belege werden gegen die Definition GEFILTERT, nicht bloss
     * uebernommen: Ein Schluessel, den es fuer diese Angebotsart nicht gibt,
     * kaeme sonst ueber ein manipuliertes Formular hinein und zaehlte nie —
     * stuende aber in der Zeile.
     */
    async updateOpportunityOffer(id, offerKind, evidence): Promise<boolean> {
      await ready()
      const erlaubt = offerKind
        ? new Set(OFFERS[offerKind].evidence.map((e) => e.key))
        : new Set<string>()
      const sauber = [...new Set(evidence.filter((k) => erlaubt.has(k)))]
      const rows = await sql.query(
        `UPDATE opportunities
            SET offer_kind = $2::text,
                readiness_evidence = $3::text[],
                updated_at = now()
          WHERE id = $1::text
        RETURNING id`,
        [id, offerKind, sauber],
      )
      return rows.length > 0
    },

    /* ══ GATE 17 · ANGEBOTE ═════════════════════════════════════════════
     *
     * Es gibt hier bewusst KEIN `updateOfferState(id, state)`. Ein Zustand,
     * den man frei setzen kann, ist wieder der Haken, gegen den dieses Gate
     * gebaut ist — dasselbe `approved: true` (G13), dasselbe
     * `published: true` (G15). `sendOffer` und `acceptOffer` heissen so,
     * weil sie etwas VERLANGEN, und sie geben die Befunde zurueck, wenn es
     * nicht geht.
     *
     * Die Regel dafuer steht in `lib/angebot.ts` und wird von der
     * Oberflaeche, vom Gate und von hier mit derselben Funktion gerufen.
     * Eine zweite Fassung im Speicher waere in vier Wochen eine andere.
     */
    async listOffers(opportunityId: string): Promise<Angebot[]> {
      await ready()
      const rows = (await sql.query(
        `SELECT * FROM offers WHERE opportunity_id = $1::text ORDER BY created_at DESC`,
        [opportunityId],
      )) as OfferRow[]
      return rows.map(toAngebot)
    },

    async getOffer(id: string): Promise<Angebot | null> {
      await ready()
      const rows = (await sql.query(`SELECT * FROM offers WHERE id = $1::text`, [id])) as OfferRow[]
      return rows.length ? toAngebot(rows[0]) : null
    },

    async saveOfferDraft(input): Promise<string | null> {
      await ready()
      const id = input.id ?? randomUUID()
      /*
       * Ein Entwurf wird NICHT geprueft — das ist der Sinn eines Entwurfs.
       * Geprueft wird beim Senden. Wer hier schon verlangt, dass alles
       * steht, bekommt Angebote, die in einem Textprogramm entstehen und
       * fertig hereinkopiert werden; dann prueft niemand mehr etwas.
       *
       * Ein GESENDETES oder angenommenes Angebot laesst sich allerdings
       * nicht mehr als Entwurf ueberschreiben: Was beim Kunden liegt, wird
       * nicht rueckwirkend umgeschrieben.
       */
      const bestand = (await sql.query(`SELECT state FROM offers WHERE id = $1::text`, [id])) as {
        state: string
      }[]
      if (bestand.length && bestand[0].state !== "entwurf") return null

      const rows = await sql.query(
        `INSERT INTO offers (id, opportunity_id, reference, kind, locale, valid_until,
                             sections, positions, state, created_at, updated_at)
         VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::date,
                 $7::jsonb, $8::jsonb, 'entwurf', now(), now())
         ON CONFLICT (id) DO UPDATE
            SET reference = EXCLUDED.reference,
                kind = EXCLUDED.kind,
                locale = EXCLUDED.locale,
                valid_until = EXCLUDED.valid_until,
                sections = EXCLUDED.sections,
                positions = EXCLUDED.positions,
                updated_at = now()
         RETURNING id`,
        [
          id,
          input.opportunityId,
          input.referenz,
          input.kind,
          input.sprache,
          input.gueltigBis,
          JSON.stringify(input.abschnitte),
          JSON.stringify(input.positionen),
        ],
      )
      return rows.length ? id : null
    },

    async sendOffer(id: string): Promise<Befund[]> {
      await ready()
      const angebot = await this.getOffer(id)
      if (!angebot) return [{ abschnitt: "Angebot", satz: "Es gibt kein Angebot mit dieser Kennung." }]

      const opp = await this.getOpportunity(angebot.opportunityId)
      if (!opp) {
        return [{ abschnitt: "Angebot", satz: "Der Vorgang zu diesem Angebot existiert nicht mehr." }]
      }

      const fehlt = fehltFuer(angebot, "gesendet", opp.readinessEvidence)
      if (fehlt.length > 0) return fehlt

      /*
       * `sent_snapshot` friert die AUFGELOESTEN Betraege ein. Der Katalog
       * darf sich danach aendern — was der Kunde bekommen hat, bleibt
       * lesbar. Das ist keine zweite Wahrheit, sondern ein Protokoll: Es
       * wird nie wieder gerechnet.
       */
      const snapshot = angebot.positionen.map((p) => ({
        was: p.was,
        betrag: p.art === "katalog" ? katalogBetrag(p) : p.betrag,
        wiederkehrend: p.wiederkehrend === true,
      }))

      /*
       * ADM-05 · H20 — DIE WIRKUNG WIRD GEPRUEFT, NICHT ANGENOMMEN.
       *
       * Die Bedingung `state = 'entwurf'` stand hier schon; das Ergebnis las
       * niemand. Ein zweiter Klick aenderte deshalb nichts, meldete aber
       * Erfolg UND schrieb eine zweite Chronikzeile „Angebot gesendet“.
       * Der Owner las danach, er habe zweimal gesendet — in einem Protokoll,
       * das er nicht nachpruefen kann, weil es SELBST die Quelle ist.
       *
       * `RETURNING id` macht aus der Annahme eine Messung: Kam keine Zeile
       * zurueck, ist nichts geschehen, und es wird nichts behauptet.
       */
      const gesendet = await sql.query(
        `UPDATE offers SET state = 'gesendet', sent_at = now(),
                           sent_snapshot = $2::jsonb, updated_at = now()
          WHERE id = $1::text AND state = 'entwurf'
        RETURNING id`,
        [id, JSON.stringify(snapshot)],
      )
      if (!gesendet.length) {
        return [
          {
            abschnitt: "Angebot",
            satz:
              "Dieses Angebot ist nicht mehr im Entwurf — es wurde inzwischen gesendet. " +
              "Es geht nicht ein zweites Mal hinaus.",
          },
        ]
      }
      await note("opportunity", angebot.opportunityId, "offer.sent",
        `Angebot ${angebot.referenz} gesendet`, null)
      return []
    },

    async acceptOffer(id: string, annahme: Annahme): Promise<Befund[]> {
      await ready()
      const angebot = await this.getOffer(id)
      if (!angebot) return [{ abschnitt: "Angebot", satz: "Es gibt kein Angebot mit dieser Kennung." }]
      if (angebot.zustand !== "gesendet") {
        return [
          {
            abschnitt: "Annahme",
            satz: "Nur ein gesendetes Angebot kann angenommen werden. Was nie beim Kunden lag, kann er nicht zusagen.",
          },
        ]
      }

      const opp = await this.getOpportunity(angebot.opportunityId)
      const fehlt = fehltFuer({ ...angebot, annahme }, "angenommen", opp?.readinessEvidence ?? [])
      if (fehlt.length > 0) return fehlt

      /*
       * ADM-05 · H20 — erst die Zustandsaenderung, dann ihre Folgen.
       *
       * Die Pruefung oben liest den Zustand und schreibt danach; zwischen
       * beidem liegt ein Fenster. Zwei gleichzeitige Zusagen kamen beide
       * durch die Pruefung, und beide setzten anschliessend den Vorgang auf
       * „gewonnen“ und schrieben eine Chronikzeile — zwei Annahmen fuer
       * ein Angebot. Die Bedingung im UPDATE laesst nur eine durch;
       * `RETURNING` sagt, welche es war. Alles Weitere haengt jetzt daran.
       */
      const angenommen = await sql.query(
        `UPDATE offers SET state = 'angenommen', acceptance = $2::jsonb, updated_at = now()
          WHERE id = $1::text AND state = 'gesendet'
        RETURNING id`,
        [id, JSON.stringify(annahme)],
      )
      if (!angenommen.length) {
        return [
          {
            abschnitt: "Annahme",
            satz:
              "Dieses Angebot ist inzwischen nicht mehr im Zustand „gesendet“. " +
              "Die Zusage wurde nicht erneut festgehalten.",
          },
        ]
      }
      /*
       * Das Ja aendert den Vorgang mit — sonst stuende ein angenommenes
       * Angebot neben einer Verkaufschance in „Verhandlung", und die
       * Pipeline waere wieder eine zweite Wahrheit.
       */
      await sql.query(
        `UPDATE opportunities SET status = 'won', lost_reason = NULL,
                                  last_contact_at = now(), updated_at = now()
          WHERE id = $1::text`,
        [angebot.opportunityId],
      )
      await note("opportunity", angebot.opportunityId, "offer.accepted",
        `Angebot ${angebot.referenz} angenommen`,
        `${annahme.von} (${annahme.rolle}), ${annahme.form}, ${annahme.am}`)
      return []
    },

    /* ══ GATE 19 · LIEFERUNG ════════════════════════════════════════════ */

    async listProjects(opportunityId: string): Promise<Projekt[]> {
      await ready()
      const rows = (await sql.query(
        `SELECT * FROM projects WHERE opportunity_id = $1::text ORDER BY created_at DESC`,
        [opportunityId],
      )) as ProjectRow[]
      return rows.map(toProjekt)
    },

    async startProject(offerId: string): Promise<{ id: string | null; maengel: Mangel[] }> {
      await ready()
      /*
       * Ein Projekt entsteht aus einem ANGENOMMENEN Angebot — nicht aus
       * einem gesendeten und nicht aus einem Vorgang. Das ist die erste
       * Regel des Gates: Der Umfang kommt aus dem Ja, nicht aus einem Feld.
       */
      const rows = (await sql.query(
        `SELECT id, opportunity_id, state FROM offers WHERE id = $1::text`,
        [offerId],
      )) as { id: string; opportunity_id: string; state: string }[]
      if (!rows.length) {
        return { id: null, maengel: [{ bereich: "Grundlage", satz: "Es gibt kein Angebot mit dieser Kennung." }] }
      }
      if (rows[0].state !== "angenommen") {
        return {
          id: null,
          maengel: [
            {
              bereich: "Grundlage",
              satz:
                "Dieses Angebot ist nicht angenommen. Ein Projekt ohne Ja ist eine Absichtserklaerung, " +
                "und sein Umfang waere das, was zuletzt jemand gesagt hat.",
            },
          ],
        }
      }

      const id = randomUUID()
      const ergebnis = await sql.query(
        `INSERT INTO projects (id, opportunity_id, offer_id, created_at, updated_at)
         VALUES ($1::text, $2::text, $3::text, now(), now())
         ON CONFLICT (offer_id) DO NOTHING
         RETURNING id`,
        [id, rows[0].opportunity_id, offerId],
      )
      if (!ergebnis.length) {
        return {
          id: null,
          maengel: [{ bereich: "Grundlage", satz: "Zu diesem Angebot laeuft bereits ein Projekt." }],
        }
      }
      await note("opportunity", rows[0].opportunity_id, "project.started", "Projekt aufgesetzt", null)
      return { id, maengel: [] }
    },

    async receiveMaterial(projectId: string, am: string): Promise<Mangel[]> {
      await ready()
      if (!/^\d{4}-\d{2}-\d{2}$/.test(am)) {
        return [{ bereich: "Material", satz: "Kein gueltiges Datum (YYYY-MM-DD)." }]
      }
      const rows = await sql.query(
        `UPDATE projects SET material_received = $2::date, state = 'laeuft', updated_at = now()
          WHERE id = $1::text AND state = 'aufgesetzt'
        RETURNING opportunity_id`,
        [projectId, am],
      )
      if (!rows.length) {
        return [{ bereich: "Material", satz: "Das Projekt ist nicht im Zustand „aufgesetzt“." }]
      }
      /*
       * Die Frist beginnt hier — und deshalb steht sie in der Chronik. Wer
       * spaeter fragt, warum der Termin so liegt, findet den Tag, an dem
       * das Material kam, und nicht eine Erinnerung.
       */
      await note("opportunity", (rows[0] as { opportunity_id: string }).opportunity_id,
        "project.material", `Materialeingang ${am} — die Frist laeuft`, null)
      return []
    },

    async addProjectChange(projectId: string, aenderung: Aenderung): Promise<Mangel[]> {
      await ready()
      const rows = (await sql.query(`SELECT * FROM projects WHERE id = $1::text`, [projectId])) as ProjectRow[]
      if (!rows.length) return [{ bereich: "Aenderung", satz: "Es gibt kein Projekt mit dieser Kennung." }]
      const projekt = toProjekt(rows[0])
      if (projekt.zustand === "uebergeben") {
        return [{ bereich: "Aenderung", satz: "Ein uebergebenes Projekt aendert sich nicht mehr." }]
      }
      const naechste = [...projekt.aenderungen, aenderung]
      const maengel = fehltFuerZustand({ ...projekt, aenderungen: naechste }, "laeuft")
        .filter((m) => m.bereich === "Aenderung")
      if (maengel.length > 0) return maengel

      /*
       * ADM-05 · H20 — ANHAENGEN IN EINER ANWEISUNG, NICHT IN ZWEIEN.
       *
       * Vorher wurde die Liste gelesen, im Speicher ergaenzt und ganz
       * zurueckgeschrieben. Zwei Menschen am selben Projekt loeschten sich
       * damit gegenseitig die Aenderung (beide lasen dieselbe Liste); ein
       * doppelter Klick trug dieselbe Aenderung zweimal ein — und eine
       * Aenderung ist Geld.
       *
       * Jetzt haengt Postgres an (`||`) und lehnt dieselbe Aenderung ab
       * (`NOT changes @> …`). Beides in EINER Anweisung: Zwischen Pruefen
       * und Schreiben liegt kein Fenster mehr.
       */
      const eintrag = JSON.stringify([aenderung])
      const ergaenzt = await sql.query(
        `UPDATE projects
            SET changes = changes || $2::jsonb, updated_at = now()
          WHERE id = $1::text
            AND state <> 'uebergeben'
            AND NOT (changes @> $2::jsonb)
        RETURNING id`,
        [projectId, eintrag],
      )
      if (!ergaenzt.length) {
        return [
          {
            bereich: "Aenderung",
            satz: "Diese Aenderung steht bereits am Projekt. Sie wurde kein zweites Mal eingetragen.",
          },
        ]
      }
      await note("opportunity", projekt.opportunityId, "project.change",
        `Aenderung: ${aenderung.was}`,
        aenderung.zugestimmt ? `zugestimmt von ${aenderung.zugestimmt.von}` : "noch ohne Zustimmung")
      return []
    },

    async acceptDelivery(projectId: string, abnahme: Annahme): Promise<Mangel[]> {
      await ready()
      const rows = (await sql.query(`SELECT * FROM projects WHERE id = $1::text`, [projectId])) as ProjectRow[]
      if (!rows.length) return [{ bereich: "Abnahme", satz: "Es gibt kein Projekt mit dieser Kennung." }]
      const projekt = toProjekt(rows[0])
      const maengel = fehltFuerZustand({ ...projekt, abnahme }, "abgenommen")
      if (maengel.length > 0) return maengel

      /* ADM-05 · H20 — nur aus „laeuft“ heraus, und nur einmal. */
      const abgenommen = await sql.query(
        `UPDATE projects SET acceptance = $2::jsonb, state = 'abgenommen', updated_at = now()
          WHERE id = $1::text AND state = 'laeuft'
        RETURNING id`,
        [projectId, JSON.stringify(abnahme)],
      )
      if (!abgenommen.length) {
        return [
          {
            bereich: "Abnahme",
            satz:
              "Das Projekt ist nicht (mehr) im Zustand „laeuft“. Eine Abnahme wird nicht zweimal " +
              "erteilt — was bereits abgenommen ist, bleibt es.",
          },
        ]
      }
      await note("opportunity", projekt.opportunityId, "project.accepted",
        "Abnahme erteilt",
        `${abnahme.von} (${abnahme.rolle}), ${abnahme.form}, ${abnahme.am}`)
      return []
    },

    async handOver(projectId: string, stuecke): Promise<Mangel[]> {
      await ready()
      const rows = (await sql.query(`SELECT * FROM projects WHERE id = $1::text`, [projectId])) as ProjectRow[]
      if (!rows.length) return [{ bereich: "Uebergabe", satz: "Es gibt kein Projekt mit dieser Kennung." }]
      const projekt = toProjekt(rows[0])

      /* Nur bekannte Stuecke — ein Schluessel aus einem manipulierten
         Formular waere sonst eine Uebergabe, die niemand versprochen hat. */
      const erlaubt = new Set(UEBERGABE_STUECKE.map((s) => s.key as string))
      const zusammen: Partial<Record<UebergabeKey, UebergabeEintrag>> = { ...projekt.uebergabe }
      for (const [k, v] of Object.entries(stuecke ?? {})) {
        if (erlaubt.has(k) && v) zusammen[k as UebergabeKey] = v
      }

      const maengel = fehltFuerZustand({ ...projekt, uebergabe: zusammen }, "uebergeben")
      if (maengel.length > 0) return maengel

      /* ADM-05 · H20 — die Uebergabe ist ein Abschluss, kein wiederholbarer Klick. */
      const uebergeben = await sql.query(
        `UPDATE projects SET handover = $2::jsonb, state = 'uebergeben', updated_at = now()
          WHERE id = $1::text AND state = 'abgenommen'
        RETURNING id`,
        [projectId, JSON.stringify(zusammen)],
      )
      if (!uebergeben.length) {
        return [
          {
            bereich: "Uebergabe",
            satz: "Das Projekt ist nicht im Zustand „abgenommen“. Eine Uebergabe geschieht einmal.",
          },
        ]
      }
      await note("opportunity", projekt.opportunityId, "project.handover",
        "Uebergabe vollstaendig",
        UEBERGABE_STUECKE.map((s) => s.label).join(", "))
      return []
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
          where.push(`c.next_touch_at IS NOT NULL AND c.next_touch_at <= ${SQL_HEUTE}`)
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
        `SELECT id, subject_type, subject_id, kind, summary, detail, actor, origin, data, created_at
           FROM activities WHERE subject_type = $1 AND subject_id = $2
          ORDER BY created_at DESC LIMIT $3`,
        [subjectType, subjectId, limit],
      )) as {
        id: string; subject_type: string; subject_id: string
        kind: string; summary: string; detail: string | null
        actor: string | null; origin: string | null; data: Record<string, unknown> | string | null; created_at: Ts
      }[]
      return rows.map((r) => ({
        id: r.id,
        subjectType: r.subject_type as ActivitySubject,
        subjectId: r.subject_id,
        kind: r.kind,
        summary: r.summary,
        detail: r.detail,
        actor: r.actor,
        origin: (r.origin as Herkunft | null) ?? null,
        data: typeof r.data === "string" ? (JSON.parse(r.data) as Record<string, unknown>) : r.data,
        createdAt: iso(r.created_at),
      }))
    },

    /* ── GATE 27 · Die Messreihe ──────────────────────────────────────────
     *
     * Beide Methoden fangen den Fehler ab und melden „nicht lesbar" bzw.
     * „nicht moeglich" — statt zu werfen. Das ist hier kein Verschlucken:
     * Die Messreihe steht ABSICHTLICH nicht in `REQUIRED_TABLES`. Sie ist
     * ein Messinstrument, kein Betriebsteil; ihr Fehlen darf das Haus nicht
     * anhalten. Es darf nur nicht als Null durchgehen — und dafuer gibt es
     * die beiden getrennten Rueckgaben.
     */

    async ownerLoadSamples(limit = 400): Promise<OwnerLoadSample[] | null> {
      try {
        await ready()
        return await readOwnerLoadSamples(sql, limit)
      } catch {
        /* Kein `[]`. Eine Reihe, die niemand lesen konnte, ist keine leere Reihe. */
        return null
      }
    },

    async recordOwnerLoadSample(
      input: OwnerLoadSample,
    ): Promise<"neu" | "schon-gemessen" | "nicht-moeglich"> {
      try {
        await ready()
        return (await writeOwnerLoadSample(sql, input)) ? "neu" : "schon-gemessen"
      } catch {
        return "nicht-moeglich"
      }
    },

    /* ── PROOF OPERATIONS P1 · die Messreihe zu beliebigen Kennzahlen ────
     *
     * Dieselbe Bauart wie Gate 27 daruber, aus demselben Grund: Die Tabelle
     * steht absichtlich nicht in `REQUIRED_TABLES`. Ihr Fehlen darf das Haus
     * nicht anhalten — es darf nur nicht als „nichts gemessen" durchgehen.
     */

    /* ══ ADM-05 · A13/A14 · FREIGABEN ═══════════════════════════════════
     *
     * Die Erlaubnis, einen Kunden zu zeigen, war bis heute Code in
     * `lib/site-data.ts`: erfassbar nur mit einem Commit, widerrufbar nur
     * mit einem Deploy. Ein Kunde, der anruft und sagt „nehmen Sie das
     * bitte raus", darf darauf nicht warten.
     *
     * Was diese drei Methoden NICHT tun: die oeffentliche Seite steuern.
     * Sie HALTEN die Erlaubnis fest. Die Bruecke zur Projektion ist G18
     * gesperrt, und die Oberflaeche sagt das dort, wo es zaehlt.
     */

    async listReleases(organisationId?: string): Promise<ReleaseRow[] | null> {
      try {
        await ready()
        const params: unknown[] = []
        let where = ""
        if (organisationId) {
          params.push(organisationId)
          where = `WHERE r.organisation_id = $1::text`
        }
        const rows = (await sql.query(
          `SELECT r.*, org.name AS organisation_name
             FROM releases r
             JOIN organisations org ON org.id = r.organisation_id
             ${where}
            ORDER BY r.granted_on DESC, r.created_at DESC`,
          params,
        )) as Record<string, unknown>[]
        return rows.map((r) => ({
          id: String(r.id),
          organisationId: String(r.organisation_id),
          organisationName: String(r.organisation_name),
          by: { name: String(r.by_name), role: String(r.by_role), company: String(r.by_company) },
          form: String(r.form),
          grantedOn: tag(r.granted_on as Ts),
          scopes: (r.scopes as string[] | null) ?? [],
          reference: String(r.reference),
          withdrawnAt: r.withdrawn_at ? new Date(r.withdrawn_at as string).toISOString() : null,
          withdrawnReason: (r.withdrawn_reason as string | null) ?? null,
          actor: (r.actor as string | null) ?? null,
          createdAt: new Date(r.created_at as string).toISOString(),
        }))
      } catch {
        /*
         * Kein `[]`. Eine Freigabereihe, die niemand lesen konnte, ist nicht
         * „keine Erlaubnis" — und der Unterschied entscheidet, ob ein Beleg
         * still von der Seite faellt oder ohne Ja darauf steht.
         */
        return null
      }
    },

    async recordRelease(input: ReleaseEingabe): Promise<{ id: string; neu: boolean } | null> {
      await ready()
      const id = randomUUID()
      /*
       * Idempotent ueber den eindeutigen Index (018): dieselbe Organisation,
       * derselbe Mensch, dieselbe Form, dasselbe Datum, dieselbe Fundstelle
       * = EINE Erlaubnis. Zwei Klicks erzeugen keine zweite.
       */
      const rows = (await sql.query(
        `INSERT INTO releases (id, organisation_id, by_name, by_role, by_company,
                               form, granted_on, scopes, reference, actor,
                               created_at, updated_at)
         VALUES ($1::text, $2::text, $3::text, $4::text, $5::text,
                 $6::text, $7::date, $8::text[], $9::text, $10::text, now(), now())
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          id,
          input.organisationId,
          input.name,
          input.role,
          input.company,
          input.form,
          input.grantedOn,
          input.scopes,
          input.reference,
          akteur.kennung,
        ],
      )) as { id: string }[]
      if (!rows.length) {
        const vorhanden = (await sql.query(
          `SELECT id FROM releases
            WHERE organisation_id = $1::text
              AND lower(btrim(by_name)) = lower(btrim($2::text))
              AND form = $3::text
              AND granted_on = $4::date
              AND lower(btrim(reference)) = lower(btrim($5::text))`,
          [input.organisationId, input.name, input.form, input.grantedOn, input.reference],
        )) as { id: string }[]
        return vorhanden.length ? { id: vorhanden[0].id, neu: false } : null
      }
      await note(
        "organisation",
        input.organisationId,
        "release.granted",
        `Freigabe erfasst: ${input.scopes.join(", ")}`,
        `${input.name} (${input.role}), ${input.form}, ${input.grantedOn} — ${input.reference}`,
        { scopes: input.scopes, form: input.form },
      )
      return { id, neu: true }
    },

    async withdrawRelease(id: string, grund: string): Promise<"ok" | "schon-widerrufen" | "fehlt"> {
      await ready()
      const bestand = (await sql.query(
        `SELECT organisation_id, withdrawn_at FROM releases WHERE id = $1::text`,
        [id],
      )) as { organisation_id: string; withdrawn_at: string | null }[]
      if (!bestand.length) return "fehlt"
      /*
       * Bedingung im UPDATE, nicht nur im Kopf (H20): Ein zweiter Widerruf
       * darf weder das Datum des ersten ueberschreiben noch eine zweite
       * Chronikzeile schreiben — sonst stuende in der Akte, der Kunde habe
       * zweimal widersprochen.
       */
      const rows = (await sql.query(
        `UPDATE releases
            SET withdrawn_at = now(), withdrawn_reason = $2::text, updated_at = now()
          WHERE id = $1::text AND withdrawn_at IS NULL
        RETURNING organisation_id`,
        [id, grund],
      )) as { organisation_id: string }[]
      if (!rows.length) return "schon-widerrufen"
      await note(
        "organisation",
        rows[0].organisation_id,
        "release.withdrawn",
        "Freigabe zurueckgezogen",
        grund,
        { grund },
      )
      return "ok"
    },

    async measurementSamples(limit = 2000): Promise<MeasurementSampleRow[] | null> {
      try {
        await ready()
        return await readMeasurementSamples(sql, limit)
      } catch {
        /* Kein `[]`. Eine Reihe, die niemand lesen konnte, ist keine leere Reihe. */
        return null
      }
    },

    async recordMeasurementSample(
      input: MeasurementSampleRow,
    ): Promise<"neu" | "schon-erfasst" | "nicht-moeglich"> {
      try {
        await ready()
        return (await writeMeasurementSample(sql, input)) ? "neu" : "schon-erfasst"
      } catch {
        return "nicht-moeglich"
      }
    },
  }
}

/** Nur damit `Contact` als Typ benutzt wird — die Liste liefert `ContactRow`. */
export type { Contact }
