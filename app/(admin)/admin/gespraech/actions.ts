"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import {
  ABSCHNITTE,
  INTERESSEN,
  legeKontaktAn,
  speichereGespraech,
  type Abschnitt,
  type Interesse,
} from "@/lib/gespraech"

const MAX_TEXT = 20000

async function rolle(): Promise<string> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/gespraech")) {
    throw new Error("Nicht berechtigt")
  }
  return zugang.rolle
}

function feld(wert: unknown, max = 300): string | null {
  if (typeof wert !== "string") return null
  const t = wert.trim()
  return t.length === 0 ? null : t.slice(0, max)
}

export async function kontaktAnlegen(form: FormData): Promise<void> {
  await rolle()
  const name = feld(form.get("name"), 160)
  if (!name) return
  const email = feld(form.get("email"), 200)
  const id = await legeKontaktAn({
    name,
    phone: feld(form.get("phone"), 60),
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    firma: feld(form.get("firma"), 160),
  })
  if (!id) throw new Error("Speicher nicht verfügbar")
  revalidatePath("/admin/gespraech")
  redirect(`/admin/gespraech?kontakt=${encodeURIComponent(id)}`)
}

export type SpeichernErgebnis = { ok: true; id: string } | { ok: false; fehler: string }

export async function gespraechSpeichern(eingabe: {
  kontaktId: string
  dauerSek: number
  abschnitte: Record<string, string>
  interessen: string[]
  folge: string
  folgeAm: string
  folgeUm: string
}): Promise<SpeichernErgebnis> {
  const wer = await rolle()

  const abschnitte: Partial<Record<Abschnitt, string>> = {}
  for (const a of ABSCHNITTE) {
    const t = feld(eingabe.abschnitte?.[a], MAX_TEXT)
    if (t) abschnitte[a] = t
  }
  const interessen = (eingabe.interessen ?? []).filter((i): i is Interesse =>
    (INTERESSEN as readonly string[]).includes(i),
  )
  const folge = feld(eingabe.folge, 300)
  const folgeAm = folge && /^\d{4}-\d{2}-\d{2}$/.test(eingabe.folgeAm) ? eingabe.folgeAm : null
  const folgeUm = folgeAm && /^\d{2}:\d{2}$/.test(eingabe.folgeUm) ? eingabe.folgeUm : null

  if (Object.keys(abschnitte).length === 0 && !folge) {
    return { ok: false, fehler: "leer" }
  }
  const dauerSek = Number.isFinite(eingabe.dauerSek) ? Math.min(Math.max(0, Math.round(eingabe.dauerSek)), 86400) : 0

  const ergebnis = await speichereGespraech(
    { kontaktId: eingabe.kontaktId, dauerSek, abschnitte, interessen, folge, folgeAm, folgeUm },
    wer,
  )
  if (!ergebnis) return { ok: false, fehler: "speicher" }

  revalidatePath("/admin/gespraech")
  revalidatePath(`/admin/vertrieb/beziehungen/${eingabe.kontaktId}`)
  return { ok: true, id: ergebnis.id }
}
