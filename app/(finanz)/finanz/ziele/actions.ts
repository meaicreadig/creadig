"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzDb } from "@/lib/finanz/store"
import { istGeschaeftsfeld } from "@/lib/finanz/belege"
import { zielAnlegen, zielAktualisieren, zielVerwerfen, type ZielEingabe } from "@/lib/finanz/ziele"

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  return db
}

const PFAD = "/finanz/ziele"
const ISO = /^\d{4}-\d{2}-\d{2}$/
const s = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

function cent(v: FormDataEntryValue | null): number {
  const t = String(v ?? "").replace(/\s|€/g, "")
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0
}

function eingabeAus(form: FormData): ZielEingabe | null {
  const feld = s(form.get("saeule"), 30)
  if (!istGeschaeftsfeld(feld)) return null
  const titel = s(form.get("titel"), 160)
  const frist = s(form.get("frist"), 10)
  if (!titel || !ISO.test(frist)) return null
  return { saeule: feld, titel, zielbetragCent: cent(form.get("zielbetrag")), frist, notiz: s(form.get("notiz"), 500) || null }
}

export async function zielSpeichern(form: FormData): Promise<void> {
  const db = await zugang()
  const eingabe = eingabeAus(form)
  if (!eingabe) return
  const id = s(form.get("id"), 64)
  if (id) await zielAktualisieren(db, id, eingabe)
  else await zielAnlegen(db, eingabe)
  revalidatePath(PFAD, "layout")
}

export async function zielVerwerfenAction(form: FormData): Promise<void> {
  const db = await zugang()
  const id = s(form.get("id"), 64)
  if (!id) return
  await zielVerwerfen(db, id)
  revalidatePath(PFAD, "layout")
}
