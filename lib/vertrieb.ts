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
 * KUNDENHISTORIE
 * ========================================================================== */

/**
 * Die dritte Achse — und sie ist wirklich eine dritte.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT IN DIE BEZIEHUNG HINEIN
 * „Kunde" und „warm" klingen verwandt und sind unabhängig. Ein Betrieb, für
 * den wir vor drei Jahren eine Website gebaut haben und seither nichts, ist
 * belegter Kunde und trotzdem kalt. Ein Bekannter, der nie beauftragt hat,
 * ist warm und nie Kunde gewesen. Wer beides zusammenlegt, kann die Frage
 * „wen haben wir schon einmal überzeugt" nicht mehr stellen — und das ist
 * die wertvollste Liste, die ein Betrieb besitzt.
 *
 * ---------------------------------------------------------------------------
 * WARUM VIER UND NICHT DREI
 * Drei Zustände (nie / ist / war) reichen nicht für den Fall, in dem sich
 * fast der gesamte Bestand befindet: Die Geschäftsbeziehung ist belegt, ob
 * sie heute noch läuft, weiss niemand. Das ist weder „bestehend" noch
 * „ehemalig" — und es zu einem von beiden zu erklären, hiesse raten.
 *
 * `kunde` sagt deshalb genau so viel, wie belegt ist: Es gab eine
 * Geschäftsbeziehung. Über ihren heutigen Zustand sagt das Feld nichts, und
 * es gibt bewusst kein zweites Feld, das ihn behauptet.
 *
 * ---------------------------------------------------------------------------
 * PROSPECT IST KEINE VERKAUFSCHANCE
 * `prospect` heisst „war noch nie Kunde", sonst nichts. Es ist eine
 * Einordnung, kein Vorgang. Wer daraus eine Chance ableitet, hat eine
 * Pipeline voll Betriebe, die von nichts wissen.
 */
export const LIFECYCLE_STAGES = ["unbekannt", "prospect", "kunde", "ehemaliger-kunde"] as const
export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number]

export const LIFECYCLE_LABELS: Record<LifecycleStage, string> = {
  unbekannt: "Unbekannt",
  prospect: "Noch nie Kunde",
  kunde: "Kunde — belegt",
  "ehemaliger-kunde": "Ehemaliger Kunde",
}

/** Was die Stufe bedeutet, im Klartext. Steht auf der Detailseite. */
export const LIFECYCLE_NOTES: Record<LifecycleStage, string> = {
  unbekannt: "Zur Geschäftshistorie liegt nichts vor.",
  prospect: "Es gab bisher keine Geschäftsbeziehung. Das sagt nichts darüber, ob eine entstehen wird.",
  kunde: "Eine Geschäftsbeziehung ist belegt. Ob sie heute aktiv ist, sagt dieses Feld nicht.",
  "ehemaliger-kunde": "Die Geschäftsbeziehung ist belegt beendet.",
}

/* ========================================================================== *
 * DATENSÄTZE
 * ========================================================================== */

/**
 * Ein Betrieb, eine Einrichtung, ein Verein.
 *
 * Fast jedes Feld darf leer sein — und bleibt es auch. Ein Pflichtfeld
 * erzwingt keine Kenntnis, es erzwingt eine Eingabe; und die einzige Eingabe,
 * die jemand macht, der nichts weiss, ist eine erfundene. Leer ist eine
 * Aussage, „—" ist ehrlicher als ein geratener Ort.
 */
export type Organisation = {
  id: string
  name: string
  website: string | null
  email: string | null
  phone: string | null
  street: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  /** Branche oder Organisationsform, frei formuliert. Keine Klassifikation. */
  industry: string | null
  lifecycle: LifecycleStage
  linkedinUrl: string | null
  note: string | null
  /**
   * Stabiler Schlüssel eines eingespielten Bestandsdatensatzes.
   * `null` heisst: aus einer Anfrage entstanden, nicht importiert.
   */
  importKey: string | null
  /**
   * Warum dieser Datensatz NICHT zur operativen Arbeitsfläche gehört.
   * `null` = gehört dazu. Siehe `EXCLUSION_*` weiter unten.
   */
  excludedReason: string | null
  createdAt: string
  updatedAt: string
}

/** Organisation mit den Zahlen, die die Liste ohne zweite Abfrage braucht. */
export type OrganisationRow = Organisation & {
  contactCount: number
  locationCount: number
  openOpportunities: number
  /**
   * Der staerkste belegte Beziehungsgrad unter den Ansprechpartnern.
   *
   * -------------------------------------------------------------------------
   * WARUM „DER STAERKSTE" UND NICHT „DER DER ORGANISATION"
   * Ein Beziehungsgrad gehoert zu einem MENSCHEN, nicht zu einem Betrieb.
   * Eine Organisation hat keinen — sie hat Ansprechpartner, die je einen
   * haben. Was diese Spalte sagt, ist deshalb genau eines: wie weit die
   * belegt engste Verbindung in dieses Haus reicht. Ein Durchschnitt waere
   * eine erfundene Groesse, und „der des ersten Kontakts" waere Zufall.
   *
   * `null` heisst: kein Kontakt, oder keiner ueber `unbekannt` hinaus.
   */
  strongestRelationship: RelationshipLevel | null
  /**
   * Wann zuletzt etwas passiert ist — ueber alle Aktivitaeten dieser
   * Organisation, ihrer Kontakte und ihrer Vorgaenge hinweg.
   *
   * `null` heisst „nichts aufgezeichnet", nicht „nichts passiert". Der
   * Unterschied ist der ganze Punkt: Ein Telefonat, das niemand eingetragen
   * hat, ist hier unsichtbar — und die Spalte behauptet nicht das Gegenteil.
   */
  lastActivityAt: string | null
  /**
   * Der naechste faellige Schritt aus einem OFFENEN Vorgang dieser
   * Organisation — der frueheste, wenn es mehrere gibt.
   *
   * Kommt aus `opportunities.next_action`, nicht aus einer eigenen Aufgabe:
   * Es gibt kein Aufgabenverwaltungssystem in diesem Haus (§18), und es
   * entsteht hier auch keines.
   */
  nextStep: string | null
  /** ISO-Datum zu `nextStep`. */
  nextStepAt: string | null
}

/**
 * Ein Standort.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT VIER ORGANISATIONEN
 * Vegitat hat vier bekannte Adressen. Vier unabhängige Organisationen daraus
 * zu machen hiesse, aus einem Kunden vier zu machen — jede Zählung wäre ab
 * dem ersten Tag um den Faktor vier falsch, und die Frage „mit wem haben wir
 * gearbeitet" hätte vier Antworten, wo es eine gibt.
 *
 * ---------------------------------------------------------------------------
 * WARUM UMGEKEHRT AUCH NICHT ZUSAMMENGEFASST WIRD
 * Gleiche Marke ist kein Beleg für gleichen Betreiber. Zwei Shops derselben
 * Kette können zwei rechtlich unabhängige Unternehmen sein, und sie ohne
 * Beleg zu verschmelzen wäre dieselbe Erfindung in die andere Richtung.
 * Deshalb entsteht ein Standort nur dort, wo die gemeinsame Organisation
 * belegt ist — sonst steht der Betrieb für sich.
 */
export type Location = {
  id: string
  organisationId: string
  /** Wie der Standort im Alltag heisst — „Basel Klybeck", nicht „Filiale 3". */
  label: string
  street: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  phone: string | null
  email: string | null
  note: string | null
  importKey: string | null
  createdAt: string
  updatedAt: string
}

export type Contact = {
  id: string
  organisationId: string | null
  name: string
  /**
   * `null` bei einem Kontakt, der nicht aus einem Formular kam.
   *
   * Aus einer Anfrage ist die Adresse immer da — sie ist dort Pflichtfeld.
   * Ein Mensch aus der Bestandsliste hat oft keine hinterlegt, und eine zu
   * erfinden, damit die Spalte gefüllt aussieht, wäre die schlechteste
   * denkbare Art, ein Pflichtfeld zu erfüllen.
   */
  email: string | null
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
  /** Wie bei der Organisation: `null` = gehört zur operativen Arbeitsfläche. */
  excludedReason: string | null
  importKey: string | null
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
  /**
   * Die Anfrage, aus der dieser Vorgang entstanden ist.
   *
   * Ein echter Fremdschlüssel, keine Näherung. Vorher wurde er geraten
   * („derselbe Kontakt, danach angelegt") — das konnte den falschen Vorgang
   * an eine Anfrage hängen und, schlimmer, die Dublettensperre beim
   * zweiten „Verkaufschance anlegen" auf eine Vermutung stützen.
   */
  fromLeadId: string | null
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
  excludedReason: string | null
  /**
   * Der Betriebscheck-Befund, falls die Anfrage aus dem Fragebogen kam.
   *
   * `null` heisst „nicht erhoben", nicht „Score 0" — die meisten Anfragen
   * kommen ueber das Kontaktformular und haben keinen Befund. Die vollen
   * Antworten stehen im Klartext in `message`; hier stehen nur die drei
   * Werte, aus denen eine Entscheidung folgt.
   */
  checkScore: number | null
  /** Schluessel der schwaechsten Ebene (`CheckLayer`), z. B. `"digital"`. */
  checkBottleneck: string | null
  checkManualSpots: number | null
  createdAt: string
  updatedAt: string
}

export type EnquiryQuery = {
  search?: string
  handling?: HandlingStatus
  source?: string
  limit?: number
  offset?: number
  includeExcluded?: boolean
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
  bucket?: "mit-chance" | "ohne-chance" | "warm-ohne-chance" | "pflege-faellig"
  limit?: number
  offset?: number
  /** Standardmäßig `false` — Ausgeschlossene bleiben aus der Arbeitsfläche. */
  includeExcluded?: boolean
}

export type OrganisationQuery = {
  search?: string
  lifecycle?: LifecycleStage
  bucket?: "mit-chance" | "ohne-chance" | "kunde-ohne-chance"
  limit?: number
  offset?: number
  includeExcluded?: boolean
}

/** Was die Übersicht braucht — alles gezählt, nichts geschätzt. */
export type VertriebSummary = {
  newEnquiries: number
  dueToday: number
  overdue: number
  openOpportunities: number
  withoutNextAction: number
  warmWithoutOpportunity: number
  /**
   * Belegte Kunden ohne offenen Vorgang — die Arbeitsmenge „Reaktivierung".
   *
   * Sie steht hier, weil daraus eine konkrete Handlung folgt: diese Liste
   * durchgehen und entscheiden. Eine Zahl, aus der keine Handlung folgt,
   * gehört nicht auf eine Übersicht, sondern in einen Bericht.
   */
  customersWithoutOpportunity: number
  recentlyClosed: OpportunityRow[]
  attention: OpportunityRow[]
}

export type LocationInput = {
  label: string
  street: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  phone: string | null
  email: string | null
  note: string | null
}

/* ========================================================================== *
 * AUSSCHLUSS STATT LÖSCHUNG
 * ========================================================================== */

/**
 * Warum Testdaten markiert und nicht entfernt werden.
 *
 * ---------------------------------------------------------------------------
 * LÖSCHEN IST DIE UNSICHERE OPERATION
 * Ein `DELETE` gegen unscharfe Namen ist genau die Art Befehl, die im besten
 * Fall das Richtige trifft und im schlechtesten still einen echten Kunden
 * mitnimmt, dessen Betrieb zufällig ähnlich heisst. Es gibt keinen Rückweg
 * und kein Protokoll darüber, was verschwand.
 *
 * Ein Ausschlussgrund kostet eine Spalte und ist in beide Richtungen
 * umkehrbar. Die Arbeitsfläche zeigt diese Datensätze nicht — die Datenbank
 * behält sie, samt der Begründung, warum sie nicht dazugehören.
 *
 * ---------------------------------------------------------------------------
 * ZWEI GRÜNDE, DIE NICHT DASSELBE SIND
 * Ein Abnahmedatensatz ist Ausschuss. Ein Arbeitskontakt aus einem anderen
 * Vorhaben ist ein echter Mensch mit einem echten Anliegen — er gehört nur
 * nicht in den creaDIG-Vertrieb. Beides zu „Testdaten" zu erklären wäre
 * bequem und in einem Fall falsch.
 */
export const EXCLUSION_TESTDATA = "Abnahmedatensatz — kein echter Vertriebsvorgang"
export const EXCLUSION_OTHER_CONTEXT = "Arbeitskontakt ausserhalb des creaDIG-Vertriebs"

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
    input: {
      name: string
      phone: string | null
      linkedinUrl: string | null
      role: string | null
      note: string | null
    },
  ): Promise<boolean>
  updateContactNextTouch(id: string, touch: string | null, at: string | null): Promise<boolean>

  listOrganisations(query: OrganisationQuery): Promise<{ rows: OrganisationRow[]; total: number }>
  getOrganisation(id: string): Promise<OrganisationRow | null>
  updateOrganisationDetails(
    id: string,
    input: {
      name: string
      website: string | null
      email: string | null
      phone: string | null
      street: string | null
      postalCode: string | null
      city: string | null
      country: string | null
      industry: string | null
      linkedinUrl: string | null
      note: string | null
    },
  ): Promise<boolean>
  updateOrganisationLifecycle(id: string, stage: LifecycleStage): Promise<boolean>

  listLocations(organisationId: string): Promise<Location[]>
  createLocation(organisationId: string, input: LocationInput): Promise<Location>
  updateLocation(id: string, input: LocationInput): Promise<boolean>
  deleteLocation(id: string): Promise<boolean>

  contactsForOrganisation(organisationId: string): Promise<ContactRow[]>
  opportunitiesForOrganisation(organisationId: string): Promise<OpportunityRow[]>
  leadsForOrganisation(
    organisationId: string,
  ): Promise<{ id: string; reference: string; source: string; createdAt: string }[]>

  /** Für die Zuordnung eines Kontakts — Name und Kennung, sonst nichts. */
  organisationChoices(): Promise<{ id: string; name: string }[]>
  updateContactOrganisation(contactId: string, organisationId: string | null): Promise<boolean>

  /** Anfragen eines Kontakts / einer Chance — für die Detailseiten. */
  leadsForContact(contactId: string): Promise<{ id: string; reference: string; source: string; createdAt: string }[]>
  opportunitiesForContact(contactId: string): Promise<OpportunityRow[]>
  leadForOpportunity(opportunityId: string): Promise<{ id: string; reference: string } | null>

  setLeadHandling(leadId: string, status: HandlingStatus): Promise<boolean>

  activities(subjectType: ActivitySubject, subjectId: string, limit?: number): Promise<Activity[]>
}
