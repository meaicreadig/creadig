"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { briefingNeu, type BriefingSprache } from "@/lib/admin/morgen-briefing"
import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"

export async function briefingNeuEinschaetzen(sprache: BriefingSprache): Promise<{ ok: boolean }> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || zugang.rolle !== "owner") return { ok: false }
  await briefingNeu(sprache === "tr" ? "tr" : "de")
  revalidatePath("/admin")
  return { ok: true }
}
