"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { MESSE_STATUS, radarRecherche, setzeStatus, type MesseStatus } from "@/lib/messen-radar"
import { darfBetreten } from "@/lib/rollen"

async function zugang(): Promise<boolean> {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  return z.verdict === "ok" && Boolean(z.rolle) && darfBetreten(z.rolle!, "/admin/messen")
}

export async function messeStatusSetzen(key: string, status: MesseStatus | null): Promise<{ ok: boolean }> {
  if (!(await zugang())) return { ok: false }
  if (!/^[a-z0-9-]{1,160}$/.test(key)) return { ok: false }
  if (status !== null && !MESSE_STATUS.includes(status)) return { ok: false }
  await setzeStatus(key, status)
  revalidatePath("/admin/messen")
  return { ok: true }
}

export async function radarJetzt(): Promise<{ ok: boolean; neu?: number }> {
  if (!(await zugang())) return { ok: false }
  try {
    const { neu } = await radarRecherche()
    revalidatePath("/admin/messen")
    return { ok: true, neu }
  } catch (error) {
    console.error("[messen] radar", error instanceof Error ? error.message : error)
    return { ok: false }
  }
}
