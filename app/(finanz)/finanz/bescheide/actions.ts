"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { BESCHEID_ARTEN, STEUERARTEN, legeBescheidAn, storniereBescheid, type BescheidArt, type Steuerart } from "@/lib/finanz/bescheide"
import { finanzDb, protokolliere } from "@/lib/finanz/store"

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  return db
}

const text = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max) || null
const cent = (v: string | null) => {
  if (!v) return null
  const t = v.replace(/\s|€/g, "")
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null
}

export type BescheidAntwort = { ok: true; meldung: string } | { ok: false; fehler: string } | null

export async function bescheidAnlegen(_prev: BescheidAntwort, form: FormData): Promise<BescheidAntwort> {
  const db = await zugang()
  const art = String(form.get("art")) as BescheidArt
  const steuerart = String(form.get("steuerart")) as Steuerart
  if (!(art in BESCHEID_ARTEN) || !(steuerart in STEUERARTEN)) return { ok: false, fehler: "Art oder Steuerart ungültig." }
  const r = await legeBescheidAn(db, {
    art,
    steuerart,
    jahr: Number(form.get("jahr")),
    datum: String(form.get("datum") ?? ""),
    betragCent: cent(text(form, "betrag", 30)),
    gueltigAb: text(form, "gueltigAb", 10),
    aktenzeichen: text(form, "aktenzeichen", 60),
    ablageort: text(form, "ablageort", 160),
    notiz: text(form, "notiz", 500),
  })
  if (!r.ok) return r
  await protokolliere(db, "bescheid_angelegt", { id: r.id, art, steuerart, fristen: r.fristen })
  revalidatePath("/finanz", "layout")
  return { ok: true, meldung: r.fristen ? `Gespeichert — ${r.fristen} Frist(en) angepasst bzw. angelegt.` : "Gespeichert." }
}

export async function bescheidStornieren(form: FormData): Promise<void> {
  const db = await zugang()
  const id = String(form.get("id") ?? "")
  if (id && (await storniereBescheid(db, id))) await protokolliere(db, "bescheid_storniert", { id })
  revalidatePath("/finanz", "layout")
}
