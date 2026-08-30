"use server"

import { revalidatePath } from "next/cache"

import {
  SALES_STATES,
  type SalesStatus,
  setNextAction,
  setSalesStatus,
} from "@/lib/lead-store"

/**
 * Die beiden Änderungen, die das Control Center heute erlaubt.
 *
 * ---------------------------------------------------------------------------
 * WARUM SERVER ACTIONS UND KEINE EIGENEN API-ROUTEN
 * `middleware.ts` bewacht `/admin/:path*`. Eine Server Action wird an die
 * Adresse der Seite geschickt, auf der sie steht — sie liegt damit hinter
 * derselben Sitzungsprüfung wie die Seite selbst. Eine eigene Route unter
 * `/api/...` läge ausserhalb dieses Musters und müsste ihre Absicherung
 * getrennt mitbringen. Zwei Wege zur selben Änderung sind ein Weg zu viel.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER GEPRÜFT WIRD
 * Alles, was aus dem Formular kommt, ist eine Behauptung des Browsers. Der
 * Status wird deshalb gegen `SALES_STATES` geprüft und nicht gecastet; ein
 * unbekannter Wert führt zu keiner Änderung statt zu einem kaputten Datensatz.
 *
 * Fehler werden nicht verschluckt: Wirft der Speicher (`LeadStoreUnavailable`
 * oder ein Anbieterfehler), schlägt die Action fehl und die Oberfläche zeigt
 * ihren Fehlerzustand. Eine Änderung, die scheinbar durchging und in
 * Wirklichkeit nirgends ankam, wäre schlimmer als eine sichtbare Störung.
 */

function isSalesStatus(value: unknown): value is SalesStatus {
  return typeof value === "string" && (SALES_STATES as readonly string[]).includes(value)
}

/** Leerer Text ist kein Wert, sondern das Löschen des Werts. */
function text(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

export async function updateStatus(id: string, form: FormData): Promise<void> {
  const status = form.get("status")
  if (!isSalesStatus(status)) return

  /*
    Der Grund gehört ausschliesslich zu `lost`. Wechselt der Status auf etwas
    anderes, fällt er weg — sonst bliebe an einer gewonnenen Anfrage der Satz
    stehen, warum sie verloren ging.
  */
  const lostReason = status === "lost" ? text(form.get("lostReason")) : null

  await setSalesStatus(id, status, lostReason)
  revalidatePath(`/admin/leads/${id}`)
  revalidatePath("/admin/leads")
}

export async function updateNextAction(id: string, form: FormData): Promise<void> {
  const action = text(form.get("nextAction"))

  /*
    Ein Datum ohne Aufgabe ist keine Aufgabe. Fällt der Text weg, fällt das
    Datum mit — sonst stünde in der Liste ein überfälliges Nichts.
  */
  const at = action === null ? null : text(form.get("nextActionAt"))

  await setNextAction(id, action, at)
  revalidatePath(`/admin/leads/${id}`)
  revalidatePath("/admin/leads")
}
