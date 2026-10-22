"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzDb, protokolliere } from "@/lib/finanz/store"
import { setzePauschale, type PauschalArt } from "@/lib/finanz/pauschalen"
import { finanzBasis } from "@/lib/finanz/basis"

const heuteBerlin = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date())

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  return db
}

export async function pauschaleSpeichern(form: FormData): Promise<void> {
  const db = await zugang()

  const art = form.get("art") === "homeoffice" ? "homeoffice" : ("verpflegung" as PauschalArt)
  const monat = String(form.get("monat") ?? "")
  const tage = Number(String(form.get("tage") ?? "").trim() || "0")
  const r = await setzePauschale(db, art, monat, tage, heuteBerlin())
  if (r.ok) await protokolliere(db, "pauschale_gesetzt", { art, monat, tage: r.tage, gekappt: r.gekappt })

  revalidatePath("/finanz", "layout")
  const basis = await finanzBasis()
  const hinweis = !r.ok ? r.fehler : r.gekappt ? `Auf ${r.tage} Tage begrenzt (Höchstgrenze).` : "Gespeichert."
  redirect(`${basis}/pauschalen?jahr=${monat.slice(0, 4)}&hinweis=${encodeURIComponent(hinweis)}`)
}
