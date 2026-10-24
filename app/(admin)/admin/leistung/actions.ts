"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { pulsRunde } from "@/lib/zentrale/puls"

async function nurInhaber() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") redirect("/admin/leistung?meldung=Nur%20der%20Inhaber")
}

export async function pulsJetzt(): Promise<void> {
  await nurInhaber()
  after(() => pulsRunde().catch(() => undefined))
  redirect(`/admin/leistung?meldung=${encodeURIComponent("Puls gestartet – Engpässe werden gelöst")}`)
}

/** Katman 3: Ein pausierter Agent läuft ab dem nächsten Takt wieder. */
export async function agentAktivieren(form: FormData): Promise<void> {
  await nurInhaber()
  const agent = String(form.get("agent") ?? "").slice(0, 40)
  if (!agent) return
  const { aktiviere } = await import("@/lib/ergebnis/steuerung")
  await aktiviere(agent, "owner")
  redirect(`/admin/leistung?meldung=${encodeURIComponent("Wieder aktiv – läuft ab dem nächsten Takt")}`)
}
