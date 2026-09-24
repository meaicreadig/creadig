"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { getVertriebStore } from "@/lib/lead-store"
import {
  PUBLICATION_BEZUG_ARTEN,
  PUBLICATION_KANAELE,
  PUBLICATION_REAKTIONEN,
  type PublicationBezugArt,
  type PublicationKanal,
  type PublicationReaktion,
  type VertriebStore,
} from "@/lib/vertrieb"

/**
 * B-3 · ZWEI HANDLUNGEN, MEHR NICHT.
 *
 * ---------------------------------------------------------------------------
 * WARUM SO WENIG
 *
 * Der Engpass beim Veröffentlichen ist nicht die Verwaltung — es ist das
 * Veröffentlichen. Ein Register, das in dreissig Sekunden gefüllt ist, wird
 * geführt; ein Redaktionssystem mit Freigabekette, Entwürfen und Kalender
 * wird einmal eingerichtet und nie benutzt.
 *
 * Deshalb gibt es hier genau zwei Handlungen: eintragen, was hinausging —
 * und nachtragen, ob jemand geantwortet hat. Alles Weitere (Kampagnen,
 * Terminplanung, Kennzahlen) ist bewusst NICHT gebaut (MSA-05/MSA-17).
 */

async function requireOwnerStore(): Promise<VertriebStore> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/veroeffentlichungen")) {
    throw new Error("Nicht berechtigt")
  }
  const store = getVertriebStore({ kennung: zugang.rolle, herkunft: "HUMAN" })
  if (!store) throw new Error("Vertriebs-Speicher nicht verfügbar")
  return store
}

const istKanal = (v: unknown): v is PublicationKanal =>
  typeof v === "string" && (PUBLICATION_KANAELE as readonly string[]).includes(v)
const istReaktion = (v: unknown): v is PublicationReaktion =>
  typeof v === "string" && (PUBLICATION_REAKTIONEN as readonly string[]).includes(v)
const istBezugArt = (v: unknown): v is PublicationBezugArt =>
  typeof v === "string" && (PUBLICATION_BEZUG_ARTEN as readonly string[]).includes(v)

/** Eintragen, was hinausgegangen ist. */
export async function veroeffentlichungErfassen(formData: FormData): Promise<void> {
  const store = await requireOwnerStore()
  const was = String(formData.get("was") ?? "").trim()
  const kanal = formData.get("kanal")
  const am = String(formData.get("am") ?? "").trim()
  /* Ohne Satz, Kanal und Datum ist es kein Eintrag, sondern eine leere Zeile. */
  if (!was || !istKanal(kanal) || !/^\d{4}-\d{2}-\d{2}$/.test(am)) return

  await store.recordPublication({
    was,
    kanal,
    veroeffentlichtAm: am,
    url: String(formData.get("url") ?? "").trim() || null,
  })
  revalidatePath("/admin/veroeffentlichungen")
}

/**
 * Nachtragen, ob jemand geantwortet hat.
 *
 * Zeigt die Reaktion auf einen Datensatz, schreibt der Store zusätzlich eine
 * Chronikzeile AN DIESEM Datensatz — die Beziehungsgeschichte bleibt an einer
 * Stelle, und das Register wird kein zweites CRM.
 */
export async function reaktionEintragen(id: string, formData: FormData): Promise<void> {
  const store = await requireOwnerStore()
  const reaktion = formData.get("reaktion")
  if (!istReaktion(reaktion)) return

  const art = formData.get("bezugArt")
  const bezugId = String(formData.get("bezugId") ?? "").trim()
  const bezug = istBezugArt(art) && bezugId ? { art, id: bezugId } : null

  await store.setPublicationReaktion(
    id,
    reaktion,
    String(formData.get("notiz") ?? "").trim() || null,
    bezug,
  )
  revalidatePath("/admin/veroeffentlichungen")
}
