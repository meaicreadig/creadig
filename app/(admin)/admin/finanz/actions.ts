"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { KATEGORIEN, type Art } from "@/lib/finanz/rechnen"
import { finanzDb, protokolliere } from "@/lib/finanz/store"
import { berechneLage } from "@/lib/finanz/lage"
import { frageAssistent } from "@/lib/finanz/assistent"

const PFAD = "/admin/finanz"

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || !z.rolle || !darfBetreten(z.rolle, PFAD)) throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  return db
}

export type AssistentAntwort = { frage: string; antwort: string } | { fehler: string } | null

export async function assistentFragen(_prev: AssistentAntwort, form: FormData): Promise<AssistentAntwort> {
  const frage = feld(form, "frage", 1000)
  if (!frage) return { fehler: "Bitte eine Frage eingeben." }
  let db
  try {
    db = await zugang()
  } catch {
    return { fehler: "Nicht berechtigt." }
  }
  const lage = await berechneLage(db)
  const r = await frageAssistent(lage, frage)
  await protokolliere(db, "assistent_frage", { zeichen: frage.length, ok: "antwort" in r })
  return "antwort" in r ? { frage, antwort: r.antwort } : r
}

function feld(form: FormData, name: string, max = 200): string | null {
  const v = form.get(name)
  if (typeof v !== "string") return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

/** "1.234,56" oder "1234.56" → Cent. Ungültig → null. */
function cent(v: string | null): number | null {
  if (!v) return null
  const s = v.replace(/\s|€/g, "")
  const norm = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s
  const n = Number(norm)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100)
}

const ISO = /^\d{4}-\d{2}-\d{2}$/

export async function buchungAnlegen(form: FormData) {
  const db = await zugang()
  const art: Art = feld(form, "art") === "einnahme" ? "einnahme" : "ausgabe"
  const betrag = cent(feld(form, "betrag"))
  const datum = feld(form, "datum")
  const kategorie = feld(form, "kategorie")
  const ust = Number(feld(form, "ust") ?? 19)
  const status = feld(form, "status") === "geplant" ? "geplant" : "gebucht"
  const wiederholung = feld(form, "wiederholung") ?? "keine"

  if (!betrag || betrag <= 0 || betrag > 100_000_000_00) throw new Error("Betrag ungültig")
  if (!datum || !ISO.test(datum)) throw new Error("Datum ungültig")
  if (!kategorie || !KATEGORIEN[art].includes(kategorie)) throw new Error("Kategorie ungültig")
  if (![0, 7, 19].includes(ust)) throw new Error("USt-Satz ungültig")
  if (!["keine", "monatlich", "quartal", "jaehrlich"].includes(wiederholung)) throw new Error("Wiederholung ungültig")

  const id = crypto.randomUUID()
  await db(
    `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, gegenpartei, notiz, wiederholung)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, art, status, datum, betrag, kategorie === "Privatentnahme" ? 0 : ust, kategorie, feld(form, "gegenpartei", 120), feld(form, "notiz", 500), wiederholung],
  )
  await protokolliere(db, "buchung_angelegt", { id, art, betrag, datum, kategorie })
  revalidatePath(PFAD)
}

export async function buchungBestaetigen(form: FormData) {
  const db = await zugang()
  const id = feld(form, "id")
  if (!id) return
  await db(`UPDATE fin_buchungen SET status = 'gebucht' WHERE id = $1 AND storniert_at IS NULL`, [id])
  await protokolliere(db, "buchung_bestaetigt", { id })
  revalidatePath(PFAD)
}

export async function buchungStornieren(form: FormData) {
  const db = await zugang()
  const id = feld(form, "id")
  if (!id) return
  await db(`UPDATE fin_buchungen SET storniert_at = now() WHERE id = $1 AND storniert_at IS NULL`, [id])
  await protokolliere(db, "buchung_storniert", { id })
  revalidatePath(PFAD)
}

export async function fristErledigt(form: FormData) {
  const db = await zugang()
  const id = feld(form, "id")
  if (!id) return
  const betrag = cent(feld(form, "betrag"))
  const [f] = await db(
    `UPDATE fin_fristen SET erledigt_at = now(), betrag_cent = COALESCE($2, betrag_cent)
      WHERE id = $1 AND erledigt_at IS NULL
      RETURNING art, to_char(periode_ende,'YYYY-MM-DD') AS periode_ende`,
    [id, betrag && betrag > 0 ? betrag : null],
  )
  if (f?.art === "ust" && f.periode_ende) {
    await db(
      `UPDATE fin_einstellungen SET ust_bezahlt_bis = GREATEST(ust_bezahlt_bis, $1::date), updated_at = now() WHERE id = 'haupt'`,
      [f.periode_ende],
    )
  }
  await protokolliere(db, "frist_erledigt", { id, betrag })
  revalidatePath(PFAD)
}

export async function fristAnlegen(form: FormData) {
  const db = await zugang()
  const titel = feld(form, "titel", 120)
  const faellig = feld(form, "faellig")
  if (!titel || !faellig || !ISO.test(faellig)) throw new Error("Frist unvollständig")
  const id = `eigen-${crypto.randomUUID()}`
  await db(`INSERT INTO fin_fristen (id, titel, art, faellig, betrag_cent) VALUES ($1,$2,'sonstig',$3,$4)`, [
    id,
    titel,
    faellig,
    cent(feld(form, "betrag")),
  ])
  await protokolliere(db, "frist_angelegt", { id, titel, faellig })
  revalidatePath(PFAD)
}

export async function einstellungenSpeichern(form: FormData) {
  const db = await zugang()
  const stand = cent(feld(form, "kontostand"))
  const am = feld(form, "kontostand_am")
  const quote = Number(feld(form, "est_quote") ?? 30)
  if (stand === null || !am || !ISO.test(am)) throw new Error("Kontostand unvollständig")
  if (!Number.isInteger(quote) || quote < 0 || quote > 60) throw new Error("Quote ungültig")
  await db(
    `UPDATE fin_einstellungen SET kontostand_cent = $1, kontostand_am = $2, est_quote = $3,
            ust_pflichtig = $4, ust_rhythmus = $5, updated_at = now() WHERE id = 'haupt'`,
    [stand, am, quote, form.get("ust_pflichtig") === "on", feld(form, "ust_rhythmus") === "monatlich" ? "monatlich" : "quartal"],
  )
  await protokolliere(db, "einstellungen", { stand, am, quote })
  revalidatePath(PFAD)
}
