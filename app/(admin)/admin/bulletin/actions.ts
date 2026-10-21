"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { legeFreigabeAn } from "@/lib/assistent/store"
import { erstelleBulletin } from "@/lib/bulletin/agent"
import { ladeAusgabe } from "@/lib/bulletin/store"

const zurueck = (meldung: string, ausgabe?: string): never =>
  redirect(`/admin/bulletin?${ausgabe ? `ausgabe=${ausgabe}&` : ""}meldung=${encodeURIComponent(meldung)}`)

async function nurInhaber() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") zurueck("Nur der Inhaber")
}

export async function bulletinNeu(): Promise<void> {
  await nurInhaber()
  let meldung: string
  try {
    meldung = (await erstelleBulletin({ erzwingen: true })).ergebnis
  } catch {
    meldung = "Recherche gerade nicht erreichbar – bitte später erneut"
  }
  revalidatePath("/admin/bulletin")
  zurueck(meldung)
}

/** Artikelidee geht als interne Aufgabe an die Redaktion – der Chief of Staff verteilt sie. Veröffentlicht wird nichts ohne Freigabe. */
export async function artikelAnRedaktion(form: FormData): Promise<void> {
  await nurInhaber()
  const ausgabeId = String(form.get("ausgabe") ?? "")
  const nr = Number(form.get("nr"))
  const a = await ladeAusgabe(ausgabeId)
  const m = a?.meldungen.find((x) => x.nr === nr)
  if (!a || !m?.artikel) zurueck("Meldung nicht gefunden", ausgabeId)

  const id = await legeFreigabeAn({
    art: "aufgabe",
    titel: `Artikel schreiben: ${m!.artikel!.de}`,
    inhalt: `Anlass (Bulletin ${a!.id}): ${m!.titel.de}\n${m!.kurz.de}\n\nFür creaDIG: ${m!.fuerUns.de}\n\nQuelle: ${m!.quelle} – ${m!.url}\n\nAuftrag: Eigenen Fachartikel mit Haltung für die creaDIG-Webseite schreiben (suchmaschinenstark, keine Kopie der Quelle), danach Kurzfassung für LinkedIn. Erst nach Freigabe veröffentlichen.`,
    quelle: `bulletin:${a!.id}:${m!.nr}`,
    agent: "bulletin",
  })
  revalidatePath("/admin/bulletin")
  zurueck(id ? "An die Redaktion übergeben" : "Liegt bereits bei der Redaktion", ausgabeId)
}
