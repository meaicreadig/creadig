"use server"

import { cookies } from "next/headers"
import { setzeHinweis } from "@/lib/admin-hinweis"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { ROLLEN_KEYS, darfBetreten } from "@/lib/rollen"
import { LOST_REASONS } from "@/lib/sales-playbook"

import { SALES_STATES, getVertriebStore, type SalesStatus } from "@/lib/lead-store"
import { ARCHIV_GRUENDE, HANDLING_STATES, LIFECYCLE_STAGES, MANUELLE_QUELLEN, RELATIONSHIP_LEVELS } from "@/lib/vertrieb"
import type { ArchivGrund, HandlingStatus, LifecycleStage, LocationInput, ManuelleQuelle, RelationshipLevel } from "@/lib/vertrieb"
import { OFFER_KINDS, OFFERS, type OfferKind } from "@/lib/offer-readiness"
import { ABSCHNITTE, JA_FORMEN, KATALOG, KATALOG_LABEL, type Annahme, type Befund, type Position } from "@/lib/angebot"
import { UEBERGABE_STUECKE, type Mangel, type UebergabeEintrag, type UebergabeKey } from "@/lib/lieferung"
import { RESEARCH_STATES, SOURCES, type ResearchState, type SourceKind } from "@/lib/research"
import { CONTACT_SOURCES, DECISIONS, type ContactSource, type Decision } from "@/lib/contact-access"

const EVIDENCE_KINDS = ["fact", "signal", "anlass", "ausschluss"] as const
type EvidenceKind = (typeof EVIDENCE_KINDS)[number]
const ACCESS_VALUES = ["empfehlung", "netzwerk", "eingehend", "bestandskunde", "keiner"]

/**
 * Alle Änderungen im Vertrieb — an einer Stelle.
 *
 * ---------------------------------------------------------------------------
 * WARUM SERVER ACTIONS
 * `middleware.ts` bewacht `/admin/:path*`. Eine Server Action geht an die
 * Adresse der Seite, auf der sie steht, und liegt damit hinter derselben
 * Sitzungsprüfung. Eigene API-Routen lägen ausserhalb dieses Musters und
 * müssten ihre Absicherung getrennt mitbringen — zwei Wege zur selben
 * Änderung sind einer zu viel.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER GEPRÜFT WIRD
 * Alles aus einem Formular ist eine Behauptung des Browsers. Jeder Status
 * wird gegen seine Liste geprüft und nicht gecastet; ein unbekannter Wert
 * führt zu keiner Änderung statt zu einem kaputten Datensatz.
 *
 * Fehler werden NICHT verschluckt: Wirft der Speicher, schlägt die Action
 * fehl und die Oberfläche zeigt ihren Fehlerzustand. Eine Änderung, die
 * scheinbar durchging und nirgends ankam, wäre schlimmer als eine sichtbare
 * Störung.
 */

function text(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

/*
 * ADM-02 · H8 (17.09.2026) — DIE ACTION PRUEFT SELBST.
 *
 * Bis hierher verliess sich jede Action allein auf `middleware.ts`. Das
 * haelt nur, solange eine Action ausschliesslich ueber eine Admin-Adresse
 * erreichbar ist — eine Annahme ueber das Routing von Next, keine Regel
 * dieses Hauses. Der Admin-Vertrag verlangt Autorisierung serverseitig am
 * Schreibpunkt: Sitzung, Widerruf und Rolle werden deshalb HIER erneut
 * geprueft, bevor der Speicher auch nur geholt wird.
 */
async function requireStore() {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/vertrieb")) {
    throw new Error("Nicht berechtigt")
  }
  /* ADM-03 — die Instanz trägt die Rolle dieser Sitzung in jede Chronikzeile. */
  const store = getVertriebStore({ kennung: zugang.rolle, herkunft: "HUMAN" })
  if (!store) throw new Error("Vertriebs-Speicher nicht verfügbar")
  return store
}

function refresh(...paths: string[]): void {
  revalidatePath("/admin/vertrieb")
  for (const p of paths) revalidatePath(p)
}

/* ── Verkaufschance ───────────────────────────────────────────────────────── */

export async function setOpportunityStatus(id: string, form: FormData): Promise<void> {
  const status = form.get("status")
  if (typeof status !== "string" || !(SALES_STATES as readonly string[]).includes(status)) return

  /* Der Grund gehört ausschliesslich zu `lost`. Wechselt der Status, fällt er
     weg — sonst bliebe an einem gewonnenen Vorgang der Satz stehen, warum er
     verloren ging. */
  /*
   * GATE 16 — DER GRUND KOMMT AUS DEM VERZEICHNIS ODER GAR NICHT.
   *
   * Hier stand `text(form.get("lostReason"))` — und im Formular ein
   * `<input>` mit `<datalist>`. Eine Vorschlagsliste bindet nichts: Der
   * Platzhalter sagte selbst „Grund wählen ODER FREI FORMULIEREN". Damit
   * standen in der Spalte wieder fünfzig Formulierungen, und genau dagegen
   * war die Liste aus Gate 3 gebaut worden.
   *
   * Ein Freitext-Grund beantwortet die Frage „warum haben wir diesen einen
   * verloren" und keine einzige darüber hinaus. Er reist nicht zurück ins
   * Zielbild (G09) — er lässt sich nicht zählen und nicht gegen eine
   * Annahme halten. Das ist die Verlust-Schleife aus dem G16-Vertrag.
   *
   * Der Satz daneben ist damit nicht verschwunden: Er gehört in die Notiz
   * des Vorgangs, die es längst gibt (`setOpportunityNote`). Die Kategorie
   * sagt WO es gescheitert ist, die Notiz WAS los war — genau die Trennung,
   * die das Playbook beschreibt.
   *
   * Bestehende Zeilen bleiben unverändert. Sie werden weder umgedeutet noch
   * einer Kategorie zugeordnet; `marktRueckmeldung()` zählt sie getrennt als
   * Altbestand. Einen Grund nachträglich zu erfinden ist schlimmer, als
   * keinen zu haben.
   */
  /*
   * ALTBESTAND GEHT NICHT VERLOREN.
   *
   * Der erste Entwurf dieser Regel hat jeden Wert ausserhalb des
   * Verzeichnisses auf `null` gesetzt — und damit einen alten Freitext
   * gelöscht, sobald jemand den Status speichert, ohne das Feld anzufassen.
   * Eine Regel gegen Freitext darf Freitext nicht VERNICHTEN; sie darf ihn
   * nur nicht neu entstehen lassen.
   *
   * Deshalb wird der bestehende Wert gelesen und durchgelassen, wenn er
   * unverändert zurückkommt. Alles andere ausserhalb des Verzeichnisses
   * fällt weg — auch ein manipuliertes Feld, denn es müsste dem
   * gespeicherten Wert exakt entsprechen.
   */
  const gewaehlt = text(form.get("lostReason"))
  const store = (await requireStore())
  const bisher = status === "lost" ? (await store.getOpportunity(id))?.lostReason ?? null : null
  const ausVerzeichnis = gewaehlt !== null && (LOST_REASONS as readonly string[]).includes(gewaehlt)
  const altbestand = gewaehlt !== null && bisher !== null && gewaehlt === bisher
  const lostReason = status === "lost" && (ausVerzeichnis || altbestand) ? gewaehlt : null

  /*
   * ADM-03 · A09 — mit dem Stand, den die Seite beim Laden gesehen hat. Hat
   * inzwischen jemand anderes geändert, wird NICHTS überschrieben; die Seite
   * lädt neu und sagt es.
   */
  const stand = text(form.get("stand"))
  const ergebnis = stand
    ? await store.moveOpportunity(id, status as SalesStatus, lostReason, stand)
    : (await store.updateOpportunityStatus(id, status as SalesStatus, lostReason)) ? "ok" : "fehlt"
  /* Kein Umleiten — siehe `lib/admin-hinweis.ts`. */
  if (ergebnis === "konflikt" && process.env.EXPERIMENT_OHNE_COOKIE !== "1") await setzeHinweis("konflikt", id)
  refresh(`/admin/vertrieb/pipeline/${id}`, "/admin/vertrieb/pipeline")
}

export async function setOpportunityResponsible(id: string, form: FormData): Promise<void> {
  const wer = verantwortlicherAus(form)
  if (wer === undefined) return
  await (await requireStore()).setOpportunityResponsible(id, wer)
  refresh(`/admin/vertrieb/pipeline/${id}`, "/admin/vertrieb/pipeline")
}

export async function setOpportunityNextAction(id: string, form: FormData): Promise<void> {
  const action = text(form.get("nextAction"))
  /* Ein Datum ohne Aufgabe ist keine Aufgabe. */
  const at = action === null ? null : text(form.get("nextActionAt"))
  await (await requireStore()).updateOpportunityNextAction(id, action, at)
  refresh(`/admin/vertrieb/pipeline/${id}`, "/admin/vertrieb/pipeline")
}

export async function setOpportunityNote(id: string, form: FormData): Promise<void> {
  await (await requireStore()).updateOpportunityNote(id, text(form.get("note")))
  refresh(`/admin/vertrieb/pipeline/${id}`)
}

/* ── Anfrage ──────────────────────────────────────────────────────────────── */

export async function setEnquiryHandling(id: string, form: FormData): Promise<void> {
  const status = form.get("handling")
  if (typeof status !== "string" || !(HANDLING_STATES as readonly string[]).includes(status)) return
  await (await requireStore()).setLeadHandling(id, status as HandlingStatus)
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen")
}

/* ── ADM-03 · Anfrage: erfassen, zuständig, nächster Schritt, archivieren ─── */

/** `null` = niemand, `undefined` = ungültige Eingabe (keine Änderung). */
function verantwortlicherAus(form: FormData): string | null | undefined {
  const wert = form.get("verantwortlich")
  if (wert === "" || wert === null) return null
  return typeof wert === "string" && (ROLLEN_KEYS as readonly string[]).includes(wert) ? wert : undefined
}

export type ErfassenZustand = {
  fehler: ("name" | "kontakt" | "mail")[]
  werte: Record<string, string>
  /** Gesetzt nach Erfolg — die Komponente navigiert selbst dorthin. */
  angelegt?: string
}

/**
 * Eine Anfrage von Hand erfassen (A03).
 *
 * Validierung serverseitig; bei einem Fehler kommen die Eingaben zurück, nichts
 * geht verloren. Der Idempotenzschlüssel stammt aus dem Formular (beim Rendern
 * erzeugt): Doppelt absenden ergibt eine Anfrage.
 */
export async function anfrageErfassen(_vorher: ErfassenZustand, form: FormData): Promise<ErfassenZustand> {
  const werte = Object.fromEntries(
    ["quelle", "sprache", "name", "email", "telefon", "betrieb", "nachricht", "verantwortlich", "idempotenz"].map((k) => [k, String(form.get(k) ?? "")]),
  )
  const fehler: ErfassenZustand["fehler"] = []
  const name = text(form.get("name"))
  const email = text(form.get("email"))
  const telefon = text(form.get("telefon"))
  if (!name) fehler.push("name")
  if (!email && !telefon) fehler.push("kontakt")
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fehler.push("mail")
  const quelle = (MANUELLE_QUELLEN as readonly string[]).includes(werte.quelle) ? (werte.quelle as ManuelleQuelle) : "sonstiges"
  const idempotenz = /^[0-9a-f-]{36}$/.test(werte.idempotenz) ? werte.idempotenz : null
  const verantwortlich = verantwortlicherAus(form)
  if (fehler.length || !idempotenz || verantwortlich === undefined || !name) return { fehler, werte }

  const store = await requireStore()
  const { id } = await store.createEnquiry({
    idempotenz,
    quelle,
    sprache: ["de", "tr", "en", "ar"].includes(werte.sprache) ? werte.sprache : "de",
    name,
    email,
    telefon,
    betrieb: text(form.get("betrieb")),
    nachricht: text(form.get("nachricht")),
    verantwortlich,
  })
  /*
   * Kennung zurück, die Komponente navigiert (volle Navigation). Gemessen
   * 17.09.2026: Mit der damaligen `vertrieb/loading.tsx` kam weder `redirect()`
   * noch `router.push` nach dieser Action zuverlässig an — Anfrage gespeichert,
   * Formular blieb stehen. Ursache entfernt; der Weg bleibt robust.
   */
  return { fehler: [], werte: {}, angelegt: id }
}

export async function setEnquiryOrganisation(id: string, form: FormData): Promise<void> {
  const org = text(form.get("organisation"))
  const ok = await (await requireStore()).setLeadOrganisation(id, org)
  if (!ok) await setzeHinweis("nicht-gespeichert", id)
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen", "/admin/kunden")
}

export async function setEnquiryResponsible(id: string, form: FormData): Promise<void> {
  const wer = verantwortlicherAus(form)
  if (wer === undefined) return
  await (await requireStore()).setLeadResponsible(id, wer)
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen", "/admin")
}

export async function setEnquiryNextAction(id: string, form: FormData): Promise<void> {
  const action = text(form.get("nextAction"))
  const at = action === null ? null : text(form.get("nextActionAt"))
  if (at !== null && !/^\d{4}-\d{2}-\d{2}$/.test(at)) return
  await (await requireStore()).setLeadNextAction(id, action, at)
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen", "/admin")
}

export async function archiveEnquiry(id: string, form: FormData): Promise<void> {
  const grund = form.get("grund")
  if (typeof grund !== "string" || !(ARCHIV_GRUENDE as readonly string[]).includes(grund)) return
  const dubletteVon = text(form.get("dubletteVon"))
  const ok = await (await requireStore()).archiveLead(id, grund as ArchivGrund, grund === "dublette" ? dubletteVon : null)
  if (!ok) await setzeHinweis("nicht-gespeichert", id)
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen", "/admin")
}

/**
 * Aus einer Anfrage einen Vorgang machen.
 *
 * Die Anfrage bleibt unverändert — sie ist der Beleg. Kontakt und
 * Organisation kommen aus ihrer Verknüpfung; fehlt eine, entsteht der
 * Vorgang trotzdem, nur eben ohne sie. Erfunden wird nichts.
 */
export async function createOpportunityFromEnquiry(id: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const enquiry = await store.getEnquiry(id)
  if (!enquiry) return

  const title = text(form.get("title")) ?? enquiry.business ?? enquiry.name
  const opportunity = await store.createOpportunity({
    title,
    organisationId: enquiry.organisationId,
    contactId: enquiry.contactId,
    source: enquiry.source,
    fromLeadId: enquiry.id,
  })

  /*
   * Der erste Schritt gehoert zur Anlage, nicht zu einem spaeteren Besuch.
   *
   * Ohne ihn entstand der Vorgang mit leerem `nextAction` und stand ab der
   * ersten Sekunde unter „Ohne naechsten Schritt“ — ein Mangel, den derselbe
   * Mensch soeben selbst erzeugt hatte. Zwei Schreibvorgaenge und keine
   * Transaktion: Scheitert der zweite, existiert der Vorgang trotzdem, und
   * er faellt genau dort auf, wo fehlende Schritte ohnehin auffallen.
   *
   * Ohne Datum. Wann etwas faellig ist, weiss dieser Moment noch nicht, und
   * ein geraten gesetztes Datum waere sofort eine falsche Ueberfaelligkeit.
   */
  const firstAction = text(form.get("firstAction"))
  if (firstAction) {
    await store.updateOpportunityNextAction(opportunity.id, firstAction, null)
  }
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen", "/admin/vertrieb/pipeline")
}

/*
 * GATE 08 — WAS VERKAUFT WIRD, UND WAS DAFUER BELEGT IST.
 *
 * Die Angebotsart entscheidet, WELCHE Belege gelten. Deshalb kommen beide
 * aus einem Formular und gehen in einem Schreibvorgang hinaus: Wechselt die
 * Art, sind die Belege der alten Art gegenstandslos, und der Speicher wirft
 * sie weg.
 *
 * Beide Werte werden gegen ihre Liste geprueft, nicht gecastet — ein
 * unbekannter Wert aendert nichts, statt eine kaputte Zeile zu erzeugen.
 */
export async function setOpportunityOffer(id: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const raw = text(form.get("offerKind"))
  const offerKind: OfferKind | null =
    raw && (OFFER_KINDS as readonly string[]).includes(raw) ? (raw as OfferKind) : null

  /* Nur Schluessel, die es fuer GENAU diese Angebotsart gibt. */
  const erlaubt = offerKind ? new Set(OFFERS[offerKind].evidence.map((e) => e.key)) : new Set<string>()
  const evidence = form.getAll("evidence").filter(
    (v): v is string => typeof v === "string" && erlaubt.has(v),
  )

  await store.updateOpportunityOffer(id, offerKind, evidence)
  refresh(`/admin/vertrieb/pipeline/${id}`, "/admin/vertrieb/pipeline")
}

/*
 * GATE 08 — EIN VORGANG OHNE ANFRAGE.
 *
 * Bis hierher gab es genau einen Weg zu einer Verkaufschance:
 * `createOpportunityFromEnquiry`. Wer keine Anfrage geschickt hat, konnte
 * keine werden.
 *
 * Das trifft ausgerechnet die naheliegendsten Geschaefte. Ein Bestandskunde
 * ruft an und will etwas Neues — im System nicht abbildbar. Ein warmer
 * Kontakt sagt im Gespraech zu — nicht abbildbar. Der Owner haette den
 * Vorgang in einer Anfrage erfinden muessen, die es nie gab, oder ihn gar
 * nicht gefuehrt. Beides ist schlechter als eine Zeile mehr Code.
 *
 * `fromLeadId` bleibt hier bewusst leer. Nicht jeder Vorgang hat einen
 * Beleg im Posteingang, und einen zu erfinden waere genau die Falschheit,
 * gegen die dieses Feld gebaut wurde.
 *
 * Was NICHT passiert: Der Lebenszyklus der Organisation wird nicht
 * angefasst. Ein Vorgang macht aus einem Prospect keinen Kunden — das tut
 * erst ein gewonnener Abschluss, und auch dann durch einen Menschen.
 */
export async function createOpportunityForOrganisation(
  organisationId: string,
  form: FormData,
): Promise<void> {
  const store = (await requireStore())
  const organisation = await store.getOrganisation(organisationId)
  if (!organisation) return

  const title = text(form.get("title"))
  if (!title) return

  const opportunity = await store.createOpportunity({
    title,
    organisationId,
    contactId: text(form.get("contactId")),
    source: "vertrieb-intern",
    })

  const firstAction = text(form.get("firstAction"))
  if (firstAction) await store.updateOpportunityNextAction(opportunity.id, firstAction, null)

  refresh(`/admin/kunden/${organisationId}`, "/admin/vertrieb/pipeline")
}

/* ── Recherche (Gate 10) ──────────────────────────────────────────────────── */

/*
 * Ein Beleg besteht aus einer Beobachtung UND einer Fundstelle. Beides ist
 * Pflicht — ohne Quelle zaehlt eine Beobachtung nicht, und das soll nicht
 * von der Disziplin des Eintragenden abhaengen.
 *
 * Der Text wird im Speicher entschaerft (`sanitizeClaim`), bevor er in die
 * Datenbank geht: Er stammt von einer fremden Seite und wird spaeter von
 * einer KI gelesen. Er muss Daten bleiben.
 */
export async function addResearchEvidence(caseId: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const kind = text(form.get("kind"))
  const claim = text(form.get("claim"))
  const sourceUrl = text(form.get("sourceUrl"))
  const sourceKind = text(form.get("sourceKind"))
  if (!claim || !sourceUrl) return
  if (!EVIDENCE_KINDS.includes(kind as EvidenceKind)) return
  if (!(sourceKind && sourceKind in SOURCES)) return

  await store.addEvidence(caseId, {
    kind: kind as EvidenceKind,
    ref: text(form.get("ref")),
    claim,
    sourceUrl,
    sourceKind: sourceKind as SourceKind,
  })
  refresh(`/admin/vertrieb/recherche/${caseId}`, "/admin/vertrieb/recherche")
}

/*
 * Zustand, Zugang und Bedienbarkeit — drei Dinge, die der Mensch entscheidet.
 *
 * Der Zustand wird NICHT automatisch aus `abbruch()` gesetzt. Die Funktion
 * schlaegt vor (sie steht als Platzhalter im Feld „naechster Schritt"), aber
 * ein Betrieb wandert nicht von selbst nach „bereit fuer Kontakt" — das ist
 * die Grenze zwischen Recherche und Ansprache, und die ueberschreitet ein
 * Mensch.
 */
export async function setResearchCase(id: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const status = text(form.get("status"))
  const access = text(form.get("access"))
  const serviceable = text(form.get("serviceable"))

  await store.updateResearchCase(id, {
    status: RESEARCH_STATES.includes(status as ResearchState) ? (status as ResearchState) : undefined,
    access: ACCESS_VALUES.includes(access ?? "") ? (access as "empfehlung") : access === null ? null : undefined,
    serviceable: serviceable === "true" ? true : serviceable === "false" ? false : null,
    nextAction: text(form.get("nextAction")),
  })
  refresh(`/admin/vertrieb/recherche/${id}`, "/admin/vertrieb/recherche")
}

/* ── Kontakt & Zugang (Gate 11) ───────────────────────────────────────────── */

/*
 * Die Person am Vorgang — samt Fundstelle.
 *
 * Ohne Quelle wird der Name zwar gespeichert (jemand hat ihn gehoert), aber
 * er zaehlt nicht als belegt, und die Lage bleibt auf „person-unbelegt".
 * Das ist Absicht: Ein Name ohne Fundstelle ist eine Vermutung, und eine
 * Vermutung darf keinen Menschen erreichen.
 */
export async function setResearchPerson(caseId: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const contactId = text(form.get("contactId"))
  if (!contactId) {
    await store.linkResearchContact(caseId, null)
    refresh(`/admin/vertrieb/recherche/${caseId}`)
    return
  }
  await store.linkResearchContact(caseId, contactId)

  const kind = text(form.get("sourceKind"))
  await store.setContactSource(contactId, {
    url: text(form.get("sourceUrl")),
    kind: CONTACT_SOURCES.includes(kind as ContactSource) ? (kind as ContactSource) : null,
    note: text(form.get("sourceNote")),
  })
  refresh(`/admin/vertrieb/recherche/${caseId}`, "/admin/vertrieb/recherche")
}

/*
 * DAS ENTSCHEIDUNGSTOR.
 *
 * Das ist der einzige Weg, auf dem `contact_decision` einen Wert bekommt.
 * Es gibt keine Ableitung, keinen Automatismus und keinen zweiten Pfad —
 * auch dann nicht, wenn Passung, Person, Zugang und Anlass alle stehen.
 *
 * „Kontakt vorbereiten" heisst ausserdem NICHT „Nachricht verschickt". Die
 * Ansprache selbst ist ein eigener Schritt und gehoert nicht in dieses
 * Gate.
 */
export async function decideResearchContact(caseId: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const raw = text(form.get("decision"))
  const decision = DECISIONS.includes(raw as Decision) ? (raw as Decision) : null
  await store.decideContact(caseId, decision, text(form.get("note")))
  refresh(`/admin/vertrieb/recherche/${caseId}`, "/admin/vertrieb/recherche")
}

/* ── Beziehung ────────────────────────────────────────────────────────────── */

export async function setRelationship(id: string, form: FormData): Promise<void> {
  const level = form.get("relationship")
  if (typeof level !== "string" || !(RELATIONSHIP_LEVELS as readonly string[]).includes(level)) return
  await (await requireStore()).updateContactRelationship(id, level as RelationshipLevel)
  refresh(`/admin/vertrieb/beziehungen/${id}`, "/admin/vertrieb/beziehungen")
}

export async function setContactDetails(id: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const contact = await store.getContact(id)
  if (!contact) return

  /* Ein Kontakt ohne Namen waere kein bearbeiteter, sondern ein zerstoerter
     Datensatz. Leer abgeschickt bleibt deshalb der bisherige stehen. */
  await store.updateContactDetails(id, {
    name: text(form.get("name")) ?? contact.name,
    phone: text(form.get("phone")),
    linkedinUrl: text(form.get("linkedinUrl")),
    role: text(form.get("role")),
    note: text(form.get("note")),
  })
  refresh(`/admin/vertrieb/beziehungen/${id}`)
}

/**
 * Einen Menschen einem Betrieb zuordnen — oder die Zuordnung lösen.
 *
 * Der leere Wert ist eine gültige Antwort: Nicht jeder Kontakt gehört zu
 * einer Organisation, und eine Zuordnung, die nur besteht, weil das Feld
 * gefüllt sein wollte, ist eine falsche Aussage über den Betrieb.
 */
export async function setContactOrganisation(id: string, form: FormData): Promise<void> {
  const raw = form.get("organisationId")
  const organisationId = typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null
  await (await requireStore()).updateContactOrganisation(id, organisationId)
  refresh(`/admin/vertrieb/beziehungen/${id}`, "/admin/vertrieb/beziehungen")
}

export async function setNextTouch(id: string, form: FormData): Promise<void> {
  const touch = text(form.get("nextTouch"))
  const at = touch === null ? null : text(form.get("nextTouchAt"))
  await (await requireStore()).updateContactNextTouch(id, touch, at)
  refresh(`/admin/vertrieb/beziehungen/${id}`, "/admin/vertrieb/beziehungen")
}

/* ── Organisation ─────────────────────────────────────────────────────────── */

/**
 * Stammdaten eines Betriebs.
 *
 * Bis auf den Namen darf jedes Feld leer bleiben — und bleibt es auch. Ein
 * Pflichtfeld erzwingt keine Kenntnis, es erzwingt eine Eingabe; und wer
 * nichts weiss, gibt etwas Erfundenes ein. Genau das soll dieses Formular
 * nicht provozieren.
 */
export async function setOrganisationDetails(id: string, form: FormData): Promise<void> {
  const store = (await requireStore())
  const organisation = await store.getOrganisation(id)
  if (!organisation) return

  await store.updateOrganisationDetails(id, {
    name: text(form.get("name")) ?? organisation.name,
    website: text(form.get("website")),
    email: text(form.get("email")),
    phone: text(form.get("phone")),
    street: text(form.get("street")),
    postalCode: text(form.get("postalCode")),
    city: text(form.get("city")),
    country: text(form.get("country")),
    industry: text(form.get("industry")),
    linkedinUrl: text(form.get("linkedinUrl")),
    note: text(form.get("note")),
  })
  refresh(`/admin/kunden/${id}`, "/admin/kunden")
}

/**
 * Die Kundenhistorie — die dritte Achse.
 *
 * Sie hat mit dem Beziehungsgrad und mit der Pipeline nichts zu tun und wird
 * deshalb auch getrennt gespeichert. „Kunde" heisst: Es gab eine
 * Geschäftsbeziehung. Über heute sagt es nichts, und es gibt kein Feld, das
 * es behauptet.
 */
export async function setOrganisationLifecycle(id: string, form: FormData): Promise<void> {
  const stage = form.get("lifecycle")
  if (typeof stage !== "string" || !(LIFECYCLE_STAGES as readonly string[]).includes(stage)) return
  await (await requireStore()).updateOrganisationLifecycle(id, stage as LifecycleStage)
  refresh(`/admin/kunden/${id}`, "/admin/kunden")
}

/* ── Standorte ────────────────────────────────────────────────────────────── */

function locationInput(form: FormData): LocationInput | null {
  const label = text(form.get("label"))
  /* Ein Standort ohne Bezeichnung ist in der Liste nicht wiederzufinden. */
  if (label === null) return null
  return {
    label,
    street: text(form.get("street")),
    postalCode: text(form.get("postalCode")),
    city: text(form.get("city")),
    country: text(form.get("country")),
    phone: text(form.get("phone")),
    email: text(form.get("email")),
    note: text(form.get("note")),
  }
}

export async function addLocation(organisationId: string, form: FormData): Promise<void> {
  const input = locationInput(form)
  if (!input) return
  await (await requireStore()).createLocation(organisationId, input)
  refresh(`/admin/kunden/${organisationId}`)
}

export async function saveLocation(
  organisationId: string,
  locationId: string,
  form: FormData,
): Promise<void> {
  const input = locationInput(form)
  if (!input) return
  await (await requireStore()).updateLocation(locationId, input)
  refresh(`/admin/kunden/${organisationId}`)
}

/**
 * Der einzige echte Löschvorgang im Vertrieb.
 *
 * Vertretbar, weil an einem Standort nichts hängt: keine Anfrage, keine
 * Chance, keine Chronik. Bei Organisation, Kontakt oder Anfrage wäre dasselbe
 * unverantwortlich — dort wird ausgeschlossen statt gelöscht, und die Chronik
 * hält fest, dass es geschehen ist.
 */
export async function removeLocation(organisationId: string, locationId: string): Promise<void> {
  await (await requireStore()).deleteLocation(locationId)
  refresh(`/admin/kunden/${organisationId}`)
}

/* ── GATE 17 · Angebote ────────────────────────────────────────────────────
 *
 * Drei Aktionen, und zwei davon geben BEFUNDE zurück statt stillschweigend
 * nichts zu tun.
 *
 * Das ist der Unterschied zu allem darüber: Ein Status, der nicht gesetzt
 * wird, weil ein Wert nicht in seiner Liste steht, ist ein Tippfehler — da
 * genügt „keine Änderung". Ein Angebot, das nicht hinausgeht, weil ein
 * Pflichtabschnitt fehlt oder die Angebotsreife noch nicht steht, ist eine
 * ENTSCHEIDUNG. Wer sie schweigend trifft, lässt den Verkäufer dreimal auf
 * „Senden" drücken und dann das Formular für kaputt halten.
 *
 * Die Regel selbst steht in `lib/angebot.ts`. Hier wird sie nicht wiederholt
 * — die Aktion reicht durch, was der Speicher zurückgibt, und der ruft
 * dieselbe Funktion wie die Oberfläche und der Probelauf.
 */

export type AngebotAntwort = { ok: boolean; befunde: Befund[] }

export async function saveAngebotEntwurf(
  opportunityId: string,
  form: FormData,
): Promise<AngebotAntwort> {
  const store = (await requireStore())
  const kind = text(form.get("kind"))
  if (!kind || !(OFFER_KINDS as readonly string[]).includes(kind)) {
    return { ok: false, befunde: [{ bereich: "angebot", code: "keine-angebotsart" as const }] }
  }

  const abschnitte: Record<string, string> = {}
  for (const a of ABSCHNITTE) {
    const wert = text(form.get(`abschnitt_${a.key}`))
    if (wert) abschnitte[a.key] = wert
  }

  /*
   * Positionen kommen ausschliesslich als KATALOG-Verweis aus dem Formular.
   * Ein Zuschnitt mit eigenem Betrag verlangt eine Owner-Freigabe mit
   * Fundstelle — die entsteht nicht in einem Auswahlfeld, sondern in einem
   * Postfach. Wer sie hat, trägt sie über den Speicher ein; ein Feld dafür
   * im Formular wäre die Einladung, sie zu behaupten.
   */
  const positionen: Position[] = []
  for (const quelle of form.getAll("position")) {
    if (typeof quelle !== "string") continue
    if (!(quelle in KATALOG)) continue
    positionen.push({
      art: "katalog",
      was: KATALOG_LABEL[quelle as keyof typeof KATALOG],
      quelle: quelle as keyof typeof KATALOG,
      wiederkehrend: quelle === "betrieb-monatlich",
    })
  }

  const id = await store.saveOfferDraft({
    id: text(form.get("id")) ?? undefined,
    opportunityId,
    referenz: text(form.get("referenz")) ?? "",
    kind: kind as OfferKind,
    sprache: (text(form.get("sprache")) ?? "de") as "de" | "tr" | "en" | "ar",
    gueltigBis: text(form.get("gueltigBis")) ?? "",
    abschnitte,
    positionen,
  })

  if (!id) {
    return {
      ok: false,
      befunde: [
        {
          bereich: "angebot",
          code: "nicht-im-entwurf" as const,
        },
      ],
    }
  }
  refresh(`/admin/vertrieb/pipeline/${opportunityId}`)
  return { ok: true, befunde: [] }
}

export async function sendAngebot(opportunityId: string, form: FormData): Promise<AngebotAntwort> {
  const id = text(form.get("id"))
  if (!id) return { ok: false, befunde: [{ bereich: "angebot", code: "kein-angebot-angegeben" as const }] }
  const befunde = await (await requireStore()).sendOffer(id)
  refresh(`/admin/vertrieb/pipeline/${opportunityId}`, "/admin/vertrieb/pipeline")
  return { ok: befunde.length === 0, befunde }
}

export async function acceptAngebot(opportunityId: string, form: FormData): Promise<AngebotAntwort> {
  const id = text(form.get("id"))
  if (!id) return { ok: false, befunde: [{ bereich: "angebot", code: "kein-angebot-angegeben" as const }] }

  const form_ = text(form.get("form"))
  const annahme: Annahme = {
    von: text(form.get("von")) ?? "",
    rolle: text(form.get("rolle")) ?? "",
    form: (JA_FORMEN as readonly string[]).includes(form_ ?? "") ? (form_ as Annahme["form"]) : "muendlich",
    am: text(form.get("am")) ?? "",
    fundstelle: text(form.get("fundstelle")) ?? "",
  }
  const befunde = await (await requireStore()).acceptOffer(id, annahme)
  refresh(`/admin/vertrieb/pipeline/${opportunityId}`, "/admin/vertrieb/pipeline")
  return { ok: befunde.length === 0, befunde }
}

/* ── GATE 19 · Lieferung ───────────────────────────────────────────────────
 *
 * Wie bei den Angeboten: Jede Aktion gibt MÄNGEL zurück, wenn es nicht geht.
 * Eine Abnahme, die stillschweigend nicht gespeichert wird, ist schlimmer
 * als eine, die sagt, was ihr fehlt — sie sieht aus wie eine Abnahme.
 */

export type LieferAntwort = { ok: boolean; maengel: Mangel[] }

export async function projektStarten(opportunityId: string, form: FormData): Promise<LieferAntwort> {
  const offerId = text(form.get("offerId"))
  if (!offerId) return { ok: false, maengel: [{ bereich: "grundlage", code: "kein-angebot-angegeben" as const }] }
  const { maengel } = await (await requireStore()).startProject(offerId)
  refresh(`/admin/vertrieb/pipeline/${opportunityId}`)
  return { ok: maengel.length === 0, maengel }
}

export async function materialEingetroffen(
  opportunityId: string,
  form: FormData,
): Promise<LieferAntwort> {
  const id = text(form.get("id"))
  const am = text(form.get("am"))
  if (!id || !am) {
    return { ok: false, maengel: [{ bereich: "material", code: "kein-projekt-angegeben" as const }] }
  }
  const maengel = await (await requireStore()).receiveMaterial(id, am)
  refresh(`/admin/vertrieb/pipeline/${opportunityId}`)
  return { ok: maengel.length === 0, maengel }
}

export async function abnahmeEintragen(opportunityId: string, form: FormData): Promise<LieferAntwort> {
  const id = text(form.get("id"))
  if (!id) return { ok: false, maengel: [{ bereich: "abnahme", code: "kein-projekt-angegeben" as const }] }
  const gewaehlt = text(form.get("form"))
  const abnahme: Annahme = {
    von: text(form.get("von")) ?? "",
    rolle: text(form.get("rolle")) ?? "",
    form: (JA_FORMEN as readonly string[]).includes(gewaehlt ?? "")
      ? (gewaehlt as Annahme["form"])
      : "muendlich",
    am: text(form.get("am")) ?? "",
    fundstelle: text(form.get("fundstelle")) ?? "",
  }
  const maengel = await (await requireStore()).acceptDelivery(id, abnahme)
  refresh(`/admin/vertrieb/pipeline/${opportunityId}`, "/admin/vertrieb/pipeline")
  return { ok: maengel.length === 0, maengel }
}

export async function uebergabeEintragen(opportunityId: string, form: FormData): Promise<LieferAntwort> {
  const id = text(form.get("id"))
  if (!id) return { ok: false, maengel: [{ bereich: "uebergabe", code: "kein-projekt-angegeben" as const }] }
  const stuecke: Partial<Record<UebergabeKey, UebergabeEintrag>> = {}
  for (const stueck of UEBERGABE_STUECKE) {
    const am = text(form.get(`am_${stueck.key}`))
    const wie = text(form.get(`wie_${stueck.key}`))
    if (am && wie) stuecke[stueck.key] = { am, wie }
  }
  const maengel = await (await requireStore()).handOver(id, stuecke)
  refresh(`/admin/vertrieb/pipeline/${opportunityId}`)
  return { ok: maengel.length === 0, maengel }
}
