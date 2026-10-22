"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { schreibeArtikel } from "@/lib/artikel/agent"
import { setzeZustand } from "@/lib/artikel/store"
import { veroeffentlicheArtikel } from "@/lib/artikel/veroeffentlichen"
import { bulletinImHintergrund } from "@/lib/bulletin/agent"
import { ladeAusgabe, ladeLauf } from "@/lib/bulletin/store"

const zurueck = (meldung: string, ausgabe?: string): never =>
  redirect(`/admin/bulletin?${ausgabe ? `ausgabe=${ausgabe}&` : ""}meldung=${encodeURIComponent(meldung)}`)

async function nurInhaber() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") zurueck("Nur der Inhaber")
}

/** Läuft im Hintergrund weiter – die Seite zeigt den Fortschritt und lädt sich selbst neu. */
export async function bulletinNeu(): Promise<void> {
  await nurInhaber()
  if ((await ladeLauf().catch(() => null))?.laeuft) zurueck("Recherche läuft bereits")
  after(() => bulletinImHintergrund())
  zurueck("Recherche gestartet – dauert etwa 1–2 Minuten")
}

export async function artikelSchreiben(form: FormData): Promise<void> {
  await nurInhaber()
  const ausgabeId = String(form.get("ausgabe") ?? "")
  const nr = Number(form.get("nr"))
  const a = await ladeAusgabe(ausgabeId)
  const m = a?.meldungen.find((x) => x.nr === nr)
  if (!a || !m) zurueck("Meldung nicht gefunden", ausgabeId)
  after(async () => {
    await schreibeArtikel(m!, a!.id).catch(() => undefined)
    revalidatePath("/admin/bulletin")
  })
  zurueck("Redaktion schreibt den Artikel – Entwurf erscheint unten in etwa einer Minute", ausgabeId)
}

export async function artikelVeroeffentlichen(form: FormData): Promise<void> {
  await nurInhaber()
  const r = await veroeffentlicheArtikel(String(form.get("slug") ?? ""))
  if (!r.ok) zurueck("Artikel nicht gefunden")
  zurueck(r.linkedin ? "Veröffentlicht – LinkedIn-Beitrag liegt zur Freigabe bereit" : "Veröffentlicht – die Redaktion schreibt den LinkedIn-Beitrag")
}

export async function artikelVerwerfen(form: FormData): Promise<void> {
  await nurInhaber()
  await setzeZustand(String(form.get("slug") ?? ""), "verworfen")
  revalidatePath("/admin/bulletin")
  zurueck("Entwurf verworfen")
}
