"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { INTERVALLE, legeAboAn, setzeAboAktiv, type Intervall } from "@/lib/finanz/abos"
import { ladeKunden } from "@/lib/finanz/auftraege/store"
import { finanzDb, protokolliere } from "@/lib/finanz/store"

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  return db
}

export const kundenSchluessel = (k: { email: string; firma: string; name: string }) => (k.email.trim() || `${k.firma}|${k.name}`).toLowerCase().trim()

export type AboAntwort = { ok: true } | { ok: false; fehler: string } | null

export async function aboAnlegen(_prev: AboAntwort, form: FormData): Promise<AboAntwort> {
  const db = await zugang()
  const schluessel = String(form.get("kunde") ?? "")
  const kunde = (await ladeKunden(db)).find((k) => kundenSchluessel(k) === schluessel)
  if (!kunde) return { ok: false, fehler: "Kunde nicht gefunden — zuerst in Rechnungen anlegen." }
  const intervall = String(form.get("intervall")) as Intervall
  if (!(intervall in INTERVALLE)) return { ok: false, fehler: "Intervall ungültig." }
  const t = String(form.get("netto") ?? "").replace(/\s|€/g, "")
  const netto = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  const satz = Number(form.get("ustSatz"))
  const r = await legeAboAn(db, {
    titel: String(form.get("titel") ?? ""),
    kunde,
    beschreibung: String(form.get("beschreibung") ?? "").slice(0, 300),
    nettoCent: Number.isFinite(netto) ? Math.round(netto * 100) : 0,
    ustSatz: [0, 7, 19].includes(satz) ? satz : 19,
    intervall,
    start: String(form.get("start") ?? ""),
    geschaeftsfeld: String(form.get("geschaeftsfeld") ?? "digitalprodukte").slice(0, 40),
  })
  if (!r.ok) return r
  await protokolliere(db, "abo_angelegt", { id: r.id, intervall })
  revalidatePath("/finanz", "layout")
  return { ok: true }
}

export async function aboUmschalten(form: FormData): Promise<void> {
  const db = await zugang()
  const id = String(form.get("id") ?? "")
  const aktiv = form.get("aktiv") === "1"
  if (!id) return
  await setzeAboAktiv(db, id, aktiv)
  await protokolliere(db, aktiv ? "abo_fortgesetzt" : "abo_pausiert", { id })
  revalidatePath("/finanz", "layout")
}
