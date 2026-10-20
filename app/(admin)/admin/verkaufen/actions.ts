"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { neonAbfrage } from "@/lib/neon-abfrage"
import { darfBetreten } from "@/lib/rollen"
import { OFFENE_STUFEN, type OffeneStufe } from "@/lib/verkaufen"

function text(v: FormDataEntryValue | null, max = 200): string | null {
  if (typeof v !== "string") return null
  const t = v.trim().slice(0, max)
  return t.length === 0 ? null : t
}

export async function dealAnlegen(form: FormData): Promise<void> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/verkaufen")) {
    throw new Error("Nicht berechtigt")
  }
  const q = neonAbfrage()
  if (!q) throw new Error("Datenbank nicht verfügbar")

  const firma = text(form.get("firma"), 120)
  const titel = text(form.get("titel"), 160)
  if (!firma || !titel) throw new Error("Firma und Titel fehlen")

  const stufeRoh = text(form.get("stufe"))
  const stufe: OffeneStufe = OFFENE_STUFEN.includes(stufeRoh as OffeneStufe) ? (stufeRoh as OffeneStufe) : "qualified"
  const wertRoh = Number(text(form.get("wert")) ?? "")
  const wert = Number.isFinite(wertRoh) && wertRoh > 0 && wertRoh < 10_000_000 ? Math.round(wertRoh) : null
  const website = text(form.get("website"), 200)
  const schritt = text(form.get("schritt"), 200)
  const datumRoh = text(form.get("am"), 10)
  const am = schritt && datumRoh && /^\d{4}-\d{2}-\d{2}$/.test(datumRoh) ? datumRoh : null
  const notiz = text(form.get("notiz"), 2000)

  const org = await q(
    `INSERT INTO organisations (id, name, website, created_at, updated_at)
     VALUES ($1, $2, $3, now(), now())
     ON CONFLICT ((lower(name))) DO UPDATE SET website = coalesce(organisations.website, EXCLUDED.website), updated_at = now()
     RETURNING id`,
    [`org-${crypto.randomUUID()}`, firma, website],
  )
  await q(
    `INSERT INTO opportunities (id, organisation_id, title, status, source, next_action, next_action_at,
                                last_contact_at, note, estimated_value, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'manuell', $5, $6::date, now(), $7, $8, now(), now())`,
    [`opp-${crypto.randomUUID()}`, org[0]?.id, titel, stufe, schritt, am, notiz, wert],
  )
  revalidatePath("/admin/verkaufen")
  revalidatePath("/admin/vertrieb/pipeline")
}
