"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { istProjekt, trageStundenEin } from "@/lib/agenten/forschung"

/* F&E-Stunden sind Nachweis fuer die Forschungszulage — nur der Inhaber, auch wenn die Flaeche einmal weiter offen waere. */
async function nurInhaber() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") redirect("/admin/forschung?meldung=Nur%20der%20Inhaber")
}

export async function stundenEintragen(form: FormData): Promise<void> {
  await nurInhaber()

  const projekt = String(form.get("projekt") ?? "")
  const stunden = Number(String(form.get("stunden") ?? "").replace(",", "."))
  let meldung = "Stunden eingetragen"
  try {
    if (!istProjekt(projekt)) throw new Error("Unbekanntes Projekt")
    await trageStundenEin({
      tag: String(form.get("tag") ?? ""),
      projekt,
      stunden,
      taetigkeit: String(form.get("taetigkeit") ?? ""),
      unsicherheit: String(form.get("unsicherheit") ?? "") || null,
    })
  } catch (e) {
    console.error("[forschung] eintragen", e instanceof Error ? e.message : e)
    meldung = e instanceof Error ? e.message : "Eintrag fehlgeschlagen"
  }
  redirect(`/admin/forschung?meldung=${encodeURIComponent(meldung)}`)
}
