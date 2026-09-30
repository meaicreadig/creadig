"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { setzeHinweis } from "@/lib/admin-hinweis"
import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { istKanal } from "@/lib/kanal"
import { neonAbfrage } from "@/lib/neon-abfrage"
import { darfBetreten } from "@/lib/rollen"

export async function setzeKanal(id: string, form: FormData): Promise<void> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/vertrieb/anfragen")) return

  const roh = String(form.get("kanal") ?? "")
  const kanal = roh === "" ? null : istKanal(roh) ? roh : undefined
  if (kanal === undefined) return

  const q = neonAbfrage()
  if (!q) return
  try {
    await q(`UPDATE leads SET channel = $1, updated_at = now() WHERE id = $2`, [kanal, id])
  } catch {
    await setzeHinweis("nicht-gespeichert", id)
    return
  }
  revalidatePath(`/admin/vertrieb/anfragen/${id}`)
  revalidatePath("/admin")
}
