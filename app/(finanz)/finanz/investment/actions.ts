"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { KLASSEN, archiviereAnlage, bewerteAnlage, legeAnlageAn, type Klasse } from "@/lib/finanz/investment"
import { heuteBerlin } from "@/lib/finanz/rechnen"
import { finanzDb, protokolliere } from "@/lib/finanz/store"

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  return db
}

const cent = (v: FormDataEntryValue | null): number | null => {
  const t = String(v ?? "").replace(/\s|€/g, "")
  if (!t) return null
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null
}

export type AnlageAntwort = { ok: true } | { ok: false; fehler: string } | null

export async function anlageAnlegen(_prev: AnlageAntwort, form: FormData): Promise<AnlageAntwort> {
  const db = await zugang()
  const klasse = String(form.get("klasse")) as Klasse
  if (!(klasse in KLASSEN)) return { ok: false, fehler: "Klasse ungültig." }
  const einstand = cent(form.get("einstand"))
  if (einstand === null) return { ok: false, fehler: "Einstand fehlt (0 ist erlaubt)." }
  const r = await legeAnlageAn(
    db,
    {
      name: String(form.get("name") ?? ""),
      klasse,
      einstandCent: einstand,
      seit: String(form.get("seit") ?? ""),
      wertCent: cent(form.get("wert")),
      notiz: String(form.get("notiz") ?? "").trim().slice(0, 300) || null,
    },
    heuteBerlin(),
  )
  if (!r.ok) return r
  await protokolliere(db, "anlage_angelegt", { id: r.id, klasse })
  revalidatePath("/finanz", "layout")
  return { ok: true }
}

export async function anlageBewerten(form: FormData): Promise<void> {
  const db = await zugang()
  const id = String(form.get("id") ?? "")
  const wert = cent(form.get("wert"))
  if (!id || wert === null) return
  if (await bewerteAnlage(db, id, wert, heuteBerlin())) await protokolliere(db, "anlage_bewertet", { id, wertCent: wert })
  revalidatePath("/finanz", "layout")
}

export async function anlageArchivieren(form: FormData): Promise<void> {
  const db = await zugang()
  const id = String(form.get("id") ?? "")
  if (!id) return
  await archiviereAnlage(db, id)
  await protokolliere(db, "anlage_archiviert", { id })
  revalidatePath("/finanz", "layout")
}
