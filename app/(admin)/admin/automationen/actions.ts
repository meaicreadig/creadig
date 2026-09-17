"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { getVertriebStore } from "@/lib/lead-store"
import { AUSLOESER } from "@/lib/ereignis"
import type { VertriebStore } from "@/lib/vertrieb"

/**
 * ADM-06 · A29 — eine Automation ein- und ausschalten, eine Wirkung
 * abhaken oder zurücknehmen.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS ÜBERHAUPT HANDLUNGEN SIND
 *
 * Der Vertrag verlangt, dass Automationen **beobachtbar, steuerbar und
 * umkehrbar** sind. Beobachtbar ist das Protokoll; steuerbar und umkehrbar
 * sind diese zwei Handlungen. Eine Automation, die man nur im Code
 * abschalten kann, ist nicht steuerbar — sie ist verhandelbar, und zwar mit
 * einem Entwickler.
 *
 * ---------------------------------------------------------------------------
 * WAS ZURÜCKNEHMEN HEISST
 *
 * Nicht löschen. Der Eintrag bleibt stehen und trägt danach „zurückgenommen“
 * mit Rolle und Zeitpunkt. Eine Automation, deren Spur man entfernen kann,
 * ist nicht beobachtbar — und beim nächsten Streit darüber, was das System
 * getan hat, gäbe es nichts nachzusehen.
 *
 * Möglich ist es nur deshalb ohne Aufwand, weil eine Automation nie einen
 * Geschäftsdatensatz ändert (`lib/automation.ts`). Was nichts verändert hat,
 * lässt sich vollständig zurücknehmen.
 */

async function requireOwnerStore(): Promise<VertriebStore> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/automationen")) {
    throw new Error("Nicht berechtigt")
  }
  const store = getVertriebStore({ kennung: zugang.rolle, herkunft: "HUMAN" })
  if (!store) throw new Error("Vertriebs-Speicher nicht verfügbar")
  return store
}

/**
 * Ein- oder ausschalten.
 *
 * Der Auslöser muss im Register stehen (`lib/ereignis.ts`). Ein Schalter für
 * etwas, das es nicht gibt, wäre ein Versprechen ohne Gegenstück.
 */
export async function automationSchalten(form: FormData): Promise<void> {
  const store = await requireOwnerStore()
  const ausloeser = form.get("ausloeser")
  const aktiv = form.get("aktiv")
  if (typeof ausloeser !== "string" || !AUSLOESER.some((a) => a.key === ausloeser)) return
  if (aktiv !== "an" && aktiv !== "aus") return
  await store.setAutomationSwitch(ausloeser, aktiv === "an")
  revalidatePath("/admin/automationen")
}

/** Eine Wirkung abhaken oder zurücknehmen. Der Eintrag bleibt in beiden Fällen. */
export async function automationSchliessen(form: FormData): Promise<void> {
  const store = await requireOwnerStore()
  const id = form.get("id")
  const zustand = form.get("zustand")
  if (typeof id !== "string" || !id) return
  if (zustand !== "erledigt" && zustand !== "zurueckgenommen") return
  await store.closeAutomationRun(id, zustand)
  revalidatePath("/admin/automationen")
  revalidatePath("/admin")
}
