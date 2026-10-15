"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzDb } from "@/lib/finanz/store"
import { belegeSchema, istGeschaeftsfeld, ladeBelegHoch, ordneHaendlerZu, ordneZu, type HochladenErgebnis } from "@/lib/finanz/belege"
import { leseBelegAus, type BelegVorschlag } from "@/lib/finanz/beleg-ki"
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

const ISO = /^\d{4}-\d{2}-\d{2}$/
const UST_SAETZE = [0, 7, 19] as const

function cent(v: FormDataEntryValue | null): number {
  const t = String(v ?? "").replace(/\s|€/g, "")
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

export async function hochladen(_prev: HochladenErgebnis | null, form: FormData): Promise<HochladenErgebnis> {
  const db = await zugang()
  const datei = form.get("datei")
  if (!(datei instanceof Blob) || datei.size === 0) return { ok: false, fehler: "Bitte eine Datei auswählen." }

  const satzRoh = Number(form.get("ustSatz"))
  const satz = (UST_SAETZE as readonly number[]).includes(satzRoh) ? (satzRoh as 0 | 7 | 19) : 19
  const datum = form.get("datum")
  const feld = String(form.get("geschaeftsfeld") ?? "")

  const r = await ladeBelegHoch(db, datei, {
    datum: typeof datum === "string" && ISO.test(datum) ? datum : null,
    haendler: String(form.get("haendler") ?? "").trim().slice(0, 160),
    bruttoCent: cent(form.get("betrag")),
    ustSatz: satz,
    kategorie: String(form.get("kategorie") ?? "").trim().slice(0, 120),
    geschaeftsfeld: istGeschaeftsfeld(feld) ? feld : null,
    notiz: String(form.get("notiz") ?? "").trim().slice(0, 1000),
  })
  if (r.ok) revalidatePath("/finanz/belege")
  return r
}

export type AuslesenErgebnis = { ok: true; vorschlag: BelegVorschlag } | { ok: false; fehler: string }

/** Nur lesen, nichts speichern — der Mensch bestaetigt im Formular, bevor "hochladen" aufgerufen wird. */
export async function auslesen(form: FormData): Promise<AuslesenErgebnis> {
  await zugang()
  const datei = form.get("datei")
  if (!(datei instanceof Blob) || datei.size === 0) return { ok: false, fehler: "Keine Datei." }
  const bytes = Buffer.from(await datei.arrayBuffer())
  const vorschlag = await leseBelegAus(bytes, datei.type)
  if (!vorschlag) return { ok: false, fehler: "Automatisches Auslesen gerade nicht verfügbar — bitte von Hand ausfüllen." }
  return { ok: true, vorschlag }
}
