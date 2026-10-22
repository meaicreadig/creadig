"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"

const zurueck = (meldung: string): never => redirect(`/admin/webseite?meldung=${encodeURIComponent(meldung)}`)

async function nurInhaber() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") zurueck("Nur der Inhaber")
}

/** Startet eine Tiefenprüfung im Hintergrund — PageSpeed und Design-Blick brauchen 1–2 Minuten. */
export async function webseiteJetztPruefen(): Promise<void> {
  await nurInhaber()
  after(async () => {
    const { fuehreAgentAus } = await import("@/lib/assistent/truppe")
    await fuehreAgentAus("webseite", { manuell: true }).catch((e) => console.error("[webseite] Prüfung gescheitert", e))
  })
  zurueck("Prüfung gestartet – Bericht in etwa 2 Minuten")
}
