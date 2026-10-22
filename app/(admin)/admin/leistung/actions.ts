"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { pulsRunde } from "@/lib/zentrale/puls"

export async function pulsJetzt(): Promise<void> {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") redirect("/admin/leistung?meldung=Nur%20der%20Inhaber")
  after(() => pulsRunde().catch(() => undefined))
  redirect(`/admin/leistung?meldung=${encodeURIComponent("Puls gestartet – Engpässe werden gelöst")}`)
}
