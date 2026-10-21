"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { schreibeArtikel } from "@/lib/artikel/agent"
import { ladeArtikel, setzeZustand } from "@/lib/artikel/store"
import { legeFreigabeAn } from "@/lib/assistent/store"
import { bulletinImHintergrund } from "@/lib/bulletin/agent"
import { ladeAusgabe, ladeLauf } from "@/lib/bulletin/store"
import { SITE_URL } from "@/lib/routes"

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
  const slug = String(form.get("slug") ?? "")
  const art = await ladeArtikel(slug)
  if (!art || art.zustand !== "entwurf") zurueck("Artikel nicht gefunden")
  await setzeZustand(slug, "veroeffentlicht")
  revalidatePath("/insights")
  revalidatePath("/tr/insights")
  revalidatePath(`/insights/${slug}`)
  revalidatePath(`/tr/insights/${slug}`)
  revalidatePath("/sitemap.xml")

  /* Nach außen geht nur, was Emin freigibt: der LinkedIn-Beitrag wartet als Freigabe-Karte. */
  const url = `${SITE_URL}/insights/${slug}`
  if (art!.linkedin) {
    await legeFreigabeAn({
      art: "linkedin",
      titel: art!.titel.de,
      inhalt: `${art!.linkedin}\n\n${url}`,
      quelle: `artikel:${slug}`,
      agent: "redaktion",
      extra: { warum: `Neuer Artikel auf creadig.de: ${art!.titel.de}` },
    }).catch(() => null)
  }
  revalidatePath("/admin/assistent")
  zurueck(art!.linkedin ? "Veröffentlicht – LinkedIn-Beitrag liegt zur Freigabe bereit" : "Veröffentlicht")
}

export async function artikelVerwerfen(form: FormData): Promise<void> {
  await nurInhaber()
  await setzeZustand(String(form.get("slug") ?? ""), "verworfen")
  revalidatePath("/admin/bulletin")
  zurueck("Entwurf verworfen")
}
