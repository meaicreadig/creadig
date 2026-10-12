"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { sendeNachfass, verwirfNachfass, type NachfassErgebnis } from "@/lib/termine/nachfass"

async function rolle(): Promise<string | null> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/termine")) return null
  return zugang.rolle
}

export async function nachfassSenden(id: string): Promise<NachfassErgebnis> {
  const von = await rolle()
  if (!von) return { ok: false, meldung: "Nicht berechtigt." }
  const r = await sendeNachfass(id, von)
  revalidatePath("/admin")
  return r
}

export async function nachfassVerwerfen(id: string): Promise<NachfassErgebnis> {
  if (!(await rolle())) return { ok: false, meldung: "Nicht berechtigt." }
  await verwirfNachfass(id)
  revalidatePath("/admin")
  return { ok: true, meldung: "Entwurf verworfen." }
}
