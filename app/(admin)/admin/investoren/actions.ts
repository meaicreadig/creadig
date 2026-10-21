"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { INVESTOR_SPRACHEN, legeInvestorLinkAn, widerrufeInvestorLink, type InvestorSprache } from "@/lib/investor/store"

const zurueck = (meldung: string): never => redirect(`/admin/investoren?meldung=${encodeURIComponent(meldung)}`)

async function nurInhaber() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") zurueck("Nur der Inhaber darf Investor-Links verwalten")
}

function text(v: FormDataEntryValue | null, max = 120): string | null {
  if (typeof v !== "string") return null
  const t = v.trim().slice(0, max)
  return t || null
}

export async function investorLinkAnlegen(form: FormData): Promise<void> {
  await nurInhaber()
  const name = text(form.get("name"))
  if (!name) zurueck("Bitte einen Namen eintragen")
  const sprache = String(form.get("sprache")) as InvestorSprache
  const tage = Math.min(180, Math.max(1, Number(form.get("tage")) || 30))
  const token = await legeInvestorLinkAn({
    name: name as string,
    firma: text(form.get("firma")),
    sprache: INVESTOR_SPRACHEN.includes(sprache) ? sprache : "en",
    zahlen: form.get("zahlen") === "ja",
    tage,
  })
  if (!token) zurueck("Speicher nicht erreichbar")
  revalidatePath("/admin/investoren")
  redirect(`/admin/investoren?neu=${token}&meldung=${encodeURIComponent("Link erstellt")}`)
}

export async function investorLinkWiderrufen(form: FormData): Promise<void> {
  await nurInhaber()
  const token = text(form.get("token"), 80)
  if (token) await widerrufeInvestorLink(token)
  revalidatePath("/admin/investoren")
  zurueck("Link zurückgezogen")
}
