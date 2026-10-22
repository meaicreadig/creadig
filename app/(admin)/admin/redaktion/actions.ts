"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { schreibeNaechstenPlanArtikel } from "@/lib/artikel/plan"
import { setzeZustand } from "@/lib/artikel/store"
import { veroeffentlicheArtikel } from "@/lib/artikel/veroeffentlichen"
import { darfBetreten } from "@/lib/rollen"

const zurueck = (meldung: string): never => redirect(`/admin/redaktion?meldung=${encodeURIComponent(meldung)}`)

async function nurInhaber() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || !z.rolle || !darfBetreten(z.rolle, "/admin/redaktion")) zurueck("Nur der Inhaber")
}

export async function redaktionArtikelVeroeffentlichen(form: FormData): Promise<void> {
  await nurInhaber()
  const r = await veroeffentlicheArtikel(String(form.get("slug") ?? ""))
  if (!r.ok) zurueck("Artikel nicht gefunden")
  zurueck(r.linkedin ? "Veröffentlicht – LinkedIn-Beitrag liegt zur Freigabe bereit" : "Veröffentlicht – die Redaktion schreibt den LinkedIn-Beitrag")
}

export async function redaktionArtikelVerwerfen(form: FormData): Promise<void> {
  await nurInhaber()
  await setzeZustand(String(form.get("slug") ?? ""), "verworfen")
  revalidatePath("/admin/redaktion")
  zurueck("Entwurf verworfen – das Thema kommt nicht wieder")
}

/** Den nächsten Artikel aus dem Redaktionsplan schreiben lassen (dauert etwa eine Minute). */
export async function planArtikelSchreiben(): Promise<void> {
  await nurInhaber()
  after(async () => {
    await schreibeNaechstenPlanArtikel().catch((e) => console.error("[redaktion] plan", e instanceof Error ? e.message : e))
    revalidatePath("/admin/redaktion")
  })
  zurueck("Die Redaktion schreibt – der Entwurf erscheint hier in etwa einer Minute")
}

/** Die LinkedIn-Redaktion jetzt laufen lassen statt auf den Morgen-Takt zu warten. */
export async function linkedinAnstossen(): Promise<void> {
  await nurInhaber()
  after(async () => {
    const { fuehreAgentAus } = await import("@/lib/assistent/truppe")
    await fuehreAgentAus("redaktion").catch((e) => console.error("[redaktion] linkedin", e instanceof Error ? e.message : e))
    revalidatePath("/admin/redaktion")
  })
  zurueck("Die LinkedIn-Redaktion schreibt – der Beitrag erscheint hier zur Freigabe")
}
