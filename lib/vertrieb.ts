import type { SalesStatus } from "@/lib/lead-store"

/**
 * Vertrieb 1.0 — das Fachmodell.
 *
 * ---------------------------------------------------------------------------
 * WARUM VIER OBJEKTE STATT EINEM „LEAD"
 * Bis hierher war „Lead" ein Sammelbegriff für vier Dinge, die sich
 * unterschiedlich verhalten:
 *
 *   Anfrage          ein Eingang. Historisch. Ändert sich nie.
 *   Kontakt          ein Mensch. Schickt vielleicht drei Anfragen.
 *   Organisation     ein Betrieb. Hat mehrere Menschen.
 *   Verkaufschance   ein laufender Vorgang. Ändert sich ständig.
 *
 * Solange alles in einer Zeile stand, war jede zweite Frage nicht
 * beantwortbar: Wie oft hat dieser Betrieb angefragt? Ist diese Person warm,
 * obwohl gerade nichts läuft? Welcher Vorgang hängt seit drei Wochen?
 *
 * ---------------------------------------------------------------------------
 * DIE WICHTIGSTE TRENNUNG: BEZIEHUNG ≠ PIPELINE
 * `relationship` und `SalesStatus` sind zwei Achsen, nicht eine Skala. Jemand
 * kann eng sein ohne Verkaufschance (der Bekannte, bei dem gerade nichts
 * ansteht) und fremd mit einer laufenden (die kalte Anfrage von gestern).
 *
 * Wer beides in eine Spalte legt, kann die eine Frage nicht mehr stellen,
 * ohne die andere zu beantworten — und fängt an, Beziehungspflege als
 * Pipeline-Aktivität zu buchen. Das ist der Punkt, an dem ein CRM anfängt zu
 * lügen.
 */

/* ========================================================================== *
 * ANFRAGE — Bearbeitungszustand
 * ========================================================================== */

/**
 * Was mit dem EINGANG passiert ist — nicht, was im Vertrieb daraus wurde.
 *
 * Eine Anfrage kann bearbeitet sein, ohne dass je eine Verkaufschance
 * entsteht: „angesehen, passt nicht, beantwortet" ist ein vollständiger
 * Vorgang. Ohne diese Achse müsste man solche Anfragen entweder ewig als
 * „neu" führen oder eine Chance erfinden, die es nie gab.
 */
export const HANDLING_STATES = ["neu", "gesehen", "bearbeitet", "archiviert"] as const
export type HandlingStatus = (typeof HANDLING_STATES)[number]

export const HANDLING_LABELS: Record<HandlingStatus, string> = {
  neu: "Neu",
  gesehen: "Gesehen",
  bearbeitet: "Bearbeitet",
  archiviert: "Archiviert",
}

/* ========================================================================== *
 * BEZIEHUNG
 * ========================================================================== */

/**
 * Vier Stufen, mehr nicht.
 *
 * Eine feinere Skala („warm+", „sehr warm") klingt genauer und ist es nicht:
 * Niemand kann zwei benachbarte Stufen zuverlässig auseinanderhalten, und
 * eine Einstufung, die man nicht wiederholbar treffen kann, ist keine Daten.
 */
export const RELATIONSHIP_LEVELS = ["unbekannt", "bekannt", "warm", "eng"] as const
export type RelationshipLevel = (typeof RELATIONSHIP_LEVELS)[number]

export const RELATIONSHIP_LABELS: Record<RelationshipLevel, string> = {
  unbekannt: "Unbekannt",
  bekannt: "Bekannt",
  warm: "Warm",
  eng: "Eng",
}

/* ========================================================================== *
 * DATENSÄTZE
 * ========================================================================== */

export type Organisation = {
  id: string
  name: string
  website: string | null
  city: string | null
  linkedinUrl: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export type Contact = {
  id: string
  organisationId: string | null
  name: string
  email: string
  phone: string | null
  linkedinUrl: string | null
  /** Funktion im Betrieb, soweit bekannt. Nicht geraten. */
  role: string | null
  relationship: RelationshipLevel
  /** Letzte belegte Berührung — aus Anfragen oder von Hand gesetzt. */
  lastInteractionAt: string | null
  /** Beziehungspflege, unabhängig von jeder Verkaufschance. */
  nextTouch: string | null
  nextTouchAt: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

/** Kontakt mit den Feldern, die die Liste ohne zweite Abfrage braucht. */
export type ContactRow = Contact & {
  organisationName: string | null
  openOpportunities: number
}

export type Opportunity = {
  id: string
  organisationId: string | null
  contactId: string | null
  title: string
  status: SalesStatus
  source: string | null
  nextAction: string | null
  nextActionAt: string | null
  lastContactAt: string | null
  note: string | null
  /** Ganze Euro. `null` heisst „nicht geschätzt" — nicht „null Euro". */
  estimatedValue: number | null
  lostReason: string | null
  createdAt: string
  updatedAt: string
}

export type OpportunityRow = Opportunity & {
  organisationName: string | null
  contactName: string | null
}

/* ========================================================================== *
 * CHRONIK
 * ========================================================================== */

export type ActivitySubject = "lead" | "contact" | "organisation" | "opportunity"

export type Activity = {
  id: string
  subjectType: ActivitySubject
  subjectId: string
  /** Maschinenlesbar, z. B. `opportunity.status`. Für Filter und Symbole. */
  kind: string
  summary: string
  detail: string | null
  createdAt: string
}

/* ========================================================================== *
 * ANFRAGE — angereichert für die Inbox
 * ========================================================================== */

/**
 * Eine Anfrage mit ihren Verknüpfungen.
 *
 * Bewusst NICHT `LeadRecord` erweitert: Der trägt den Schreibweg und wird
 * auch von den Entwicklungs-Adaptern erfüllt, die keine Kontakte kennen.
 * Diese Sicht entsteht aus Verbünden und gibt es nur mit Datenbank.
 */
export type EnquiryRow = {
  id: string
  reference: string
  source: string
  locale: string
  name: string
  email: string
  phone: string
  business: string | null
  message: string | null
  siteUrl: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  handlingStatus: HandlingStatus
  contactId: string | null
  contactName: string | null
  organisationId: string | null
  organisationName: string | null
  /** Die Chance, die aus dieser Anfrage entstanden ist — falls es eine gibt. */
  opportunityId: string | null
  createdAt: string
  updatedAt: string
}

export type EnquiryQuery = {
  search?: string
  handling?: HandlingStatus
  source?: string
  limit?: number
  offset?: number
}

/* ========================================================================== *
 * ABFRAGEN
 * ========================================================================== */

export type OpportunityQuery = {
  search?: string
  status?: SalesStatus
  /** `offen` = alles ausser gewonnen/verloren. */
  bucket?: "offen" | "faellig" | "ueberfaellig" | "ohne-schritt" | "abgeschlossen"
  limit?: number
  offset?: number
}

export type ContactQuery = {
  search?: string
  relationship?: RelationshipLevel
  bucket?: "mit-chance" | "ohne-chance" | "pflege-faellig"
  limit?: number
  offset?: number
}

/** Was die Übersicht braucht — alles gezählt, nichts geschätzt. */
export type VertriebSummary = {
  newEnquiries: number
  dueToday: number
  overdue: number
  openOpportunities: number
  withoutNextAction: number
  warmWithoutOpportunity: number
  recentlyClosed: OpportunityRow[]
  attention: OpportunityRow[]
}

/* ========================================================================== *
 * DIE SCHNITTSTELLE
 * ========================================================================== */

/**
 * Die zweite Facette desselben Speichers — nicht ein zweiter Speicher.
 *
 * ---------------------------------------------------------------------------
 * WARUM GETRENNT VON `LeadStore`
 * `LeadStore` beschreibt den Weg, den eine Website-Anfrage nimmt: schreiben,
 * nachschlagen, auflisten. Den erfüllen auch die Entwicklungs-Adapter
 * (Arbeitsspeicher, Datei), und das soll so bleiben — die Abnahme des
 * Formularwegs braucht keine Datenbank.
 *
 * Vertrieb braucht Verknüpfungen: Kontakt zu Organisation, Chance zu Kontakt,
 * Zählungen über beide. Das in einer JSON-Datei nachzubauen hiesse, einen
 * halben Datenbankkern zu schreiben, den niemand testet — und dessen
 * Verhalten dann NICHT dem entspricht, was in Produktion läuft. Genau diese
 * Art Attrappe hat in diesem Projekt schon einen Fehler versteckt
 * (`42P08`, siehe `lead-store-neon.ts`).
 *
 * Deshalb: Wer Vertrieb 1.0 will, braucht die echte Datenbank. Fehlt sie,
 * meldet die Oberfläche das — und erfindet nichts.
 */
export type VertriebStore = {
  summary(): Promise<VertriebSummary>

  listEnquiries(query: EnquiryQuery): Promise<{ rows: EnquiryRow[]; total: number }>
  getEnquiry(id: string): Promise<EnquiryRow | null>
  /** Die Quellen, die wirklich vorkommen — keine gepflegte Liste. */
  enquirySources(): Promise<string[]>

  listOpportunities(query: OpportunityQuery): Promise<{ rows: OpportunityRow[]; total: number }>
  getOpportunity(id: string): Promise<OpportunityRow | null>
  createOpportunity(input: {
    title: string
    organisationId: string | null
    contactId: string | null
    source: string | null
    fromLeadId?: string
  }): Promise<Opportunity>
  updateOpportunityStatus(id: string, status: SalesStatus, lostReason: string | null): Promise<boolean>
  updateOpportunityNextAction(id: string, action: string | null, at: string | null): Promise<boolean>
  updateOpportunityNote(id: string, note: string | null): Promise<boolean>

  listContacts(query: ContactQuery): Promise<{ rows: ContactRow[]; total: number }>
  getContact(id: string): Promise<ContactRow | null>
  updateContactRelationship(id: string, level: RelationshipLevel): Promise<boolean>
  updateContactDetails(
    id: string,
    input: { linkedinUrl: string | null; role: string | null; note: string | null },
  ): Promise<boolean>
  updateContactNextTouch(id: string, touch: string | null, at: string | null): Promise<boolean>

  getOrganisation(id: string): Promise<Organisation | null>

  /** Anfragen eines Kontakts / einer Chance — für die Detailseiten. */
  leadsForContact(contactId: string): Promise<{ id: string; reference: string; source: string; createdAt: string }[]>
  opportunitiesForContact(contactId: string): Promise<OpportunityRow[]>
  leadForOpportunity(opportunityId: string): Promise<{ id: string; reference: string } | null>

  setLeadHandling(leadId: string, status: HandlingStatus): Promise<boolean>

  activities(subjectType: ActivitySubject, subjectId: string, limit?: number): Promise<Activity[]>
}
