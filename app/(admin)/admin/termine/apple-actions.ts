"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { normalisiereIcsUrl, speichereAppleQuelle } from "@/lib/termine/apple"

export async function appleKalenderSpeichern(form: FormData): Promise<void> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/termine")) {
    redirect("/admin/termine?meldung=Keine%20Berechtigung")
  }
  const roh = form.get("ics_url")
  const leer = typeof roh !== "string" || roh.trim() === ""
  const url = leer ? null : normalisiereIcsUrl(roh as string)
  if (!leer && !url) redirect("/admin/termine?meldung=Link%20ung%C3%BCltig%20%E2%80%94%20bitte%20den%20iCloud-Link%20einf%C3%BCgen")
  await speichereAppleQuelle(url)
  revalidatePath("/admin/termine")
  redirect(`/admin/termine?meldung=${encodeURIComponent(url ? "Apple Kalender verbunden" : "Apple Kalender getrennt")}`)
}
