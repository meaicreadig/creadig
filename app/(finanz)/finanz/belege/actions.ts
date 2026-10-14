"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzDb } from "@/lib/finanz/store"
import { belegeSchema, istGeschaeftsfeld, ordneHaendlerZu, ordneZu } from "@/lib/finanz/belege"
import { fehlerErneut, starteLauf, weiter, type Schritt } from "@/lib/finanz/kopierlauf-fibero"

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  await belegeSchema(db)
  return db
}

export type LaufAntwort = Schritt | { phase: "fehler"; meldung: string }

export async function kopierlauf(modus: "start" | "weiter" | "fehler"): Promise<LaufAntwort> {
  try {
    const db = await zugang()
    const r = modus === "start" ? await starteLauf(db) : modus === "fehler" ? await fehlerErneut(db) : await weiter(db)
    if (r.phase === "fertig") revalidatePath("/finanz/belege")
    return r
  } catch (e) {
    return { phase: "fehler", meldung: e instanceof Error ? e.message : "Unbekannter Fehler" }
  }
}

export async function zuordnen(form: FormData): Promise<void> {
  const db = await zugang()
  const feld = String(form.get("feld") ?? "")
  const ids = form.getAll("id").map(String).filter(Boolean)
  const haendler = form.get("haendler")
  if (feld === "korb") await ordneZu(db, ids, null)
  else if (!istGeschaeftsfeld(feld)) return
  else if (typeof haendler === "string" && haendler) await ordneHaendlerZu(db, haendler, feld)
  else await ordneZu(db, ids, feld)
  revalidatePath("/finanz/belege")
}
