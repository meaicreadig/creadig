"use server"

import { revalidatePath } from "next/cache"

import { SALES_STATES, getVertriebStore, type SalesStatus } from "@/lib/lead-store"
import { HANDLING_STATES, RELATIONSHIP_LEVELS } from "@/lib/vertrieb"
import type { HandlingStatus, RelationshipLevel } from "@/lib/vertrieb"

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

function requireStore() {
  const store = getVertriebStore()
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
  const lostReason = status === "lost" ? text(form.get("lostReason")) : null

  await requireStore().updateOpportunityStatus(id, status as SalesStatus, lostReason)
  refresh(`/admin/vertrieb/pipeline/${id}`, "/admin/vertrieb/pipeline")
}

export async function setOpportunityNextAction(id: string, form: FormData): Promise<void> {
  const action = text(form.get("nextAction"))
  /* Ein Datum ohne Aufgabe ist keine Aufgabe. */
  const at = action === null ? null : text(form.get("nextActionAt"))
  await requireStore().updateOpportunityNextAction(id, action, at)
  refresh(`/admin/vertrieb/pipeline/${id}`, "/admin/vertrieb/pipeline")
}

export async function setOpportunityNote(id: string, form: FormData): Promise<void> {
  await requireStore().updateOpportunityNote(id, text(form.get("note")))
  refresh(`/admin/vertrieb/pipeline/${id}`)
}

/* ── Anfrage ──────────────────────────────────────────────────────────────── */

export async function setEnquiryHandling(id: string, form: FormData): Promise<void> {
  const status = form.get("handling")
  if (typeof status !== "string" || !(HANDLING_STATES as readonly string[]).includes(status)) return
  await requireStore().setLeadHandling(id, status as HandlingStatus)
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen")
}

/**
 * Aus einer Anfrage einen Vorgang machen.
 *
 * Die Anfrage bleibt unverändert — sie ist der Beleg. Kontakt und
 * Organisation kommen aus ihrer Verknüpfung; fehlt eine, entsteht der
 * Vorgang trotzdem, nur eben ohne sie. Erfunden wird nichts.
 */
export async function createOpportunityFromEnquiry(id: string, form: FormData): Promise<void> {
  const store = requireStore()
  const enquiry = await store.getEnquiry(id)
  if (!enquiry) return

  const title = text(form.get("title")) ?? enquiry.business ?? enquiry.name
  await store.createOpportunity({
    title,
    organisationId: enquiry.organisationId,
    contactId: enquiry.contactId,
    source: enquiry.source,
    fromLeadId: enquiry.id,
  })
  refresh(`/admin/vertrieb/anfragen/${id}`, "/admin/vertrieb/anfragen", "/admin/vertrieb/pipeline")
}

/* ── Beziehung ────────────────────────────────────────────────────────────── */

export async function setRelationship(id: string, form: FormData): Promise<void> {
  const level = form.get("relationship")
  if (typeof level !== "string" || !(RELATIONSHIP_LEVELS as readonly string[]).includes(level)) return
  await requireStore().updateContactRelationship(id, level as RelationshipLevel)
  refresh(`/admin/vertrieb/beziehungen/${id}`, "/admin/vertrieb/beziehungen")
}

export async function setContactDetails(id: string, form: FormData): Promise<void> {
  const store = requireStore()
  const contact = await store.getContact(id)
  if (!contact) return
  await store.updateContactDetails(id, {
    name: contact.name,
    phone: contact.phone,
    linkedinUrl: text(form.get("linkedinUrl")),
    role: text(form.get("role")),
    note: text(form.get("note")),
  })
  refresh(`/admin/vertrieb/beziehungen/${id}`)
}

export async function setNextTouch(id: string, form: FormData): Promise<void> {
  const touch = text(form.get("nextTouch"))
  const at = touch === null ? null : text(form.get("nextTouchAt"))
  await requireStore().updateContactNextTouch(id, touch, at)
  refresh(`/admin/vertrieb/beziehungen/${id}`, "/admin/vertrieb/beziehungen")
}
