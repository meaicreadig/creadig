"use server"

import { randomUUID } from "node:crypto"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { findeOderLegeFirma } from "@/lib/kundenfaden"
import { neonAbfrage } from "@/lib/neon-abfrage"
import { darfBetreten } from "@/lib/rollen"

function text(v: FormDataEntryValue | null, max = 200): string | null {
  if (typeof v !== "string") return null
  const t = v.trim().slice(0, max)
  return t.length === 0 ? null : t
}

const zurueck = (meldung: string): never => redirect(`/admin/kunden?meldung=${encodeURIComponent(meldung)}`)

async function zugang(nurInhaber: boolean) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || !z.rolle || !darfBetreten(z.rolle, "/admin/kunden")) zurueck("Keine Berechtigung")
  if (nurInhaber && z.rolle !== "owner") zurueck("Löschen darf nur der Inhaber")
}

export async function kundeAnlegen(form: FormData): Promise<void> {
  await zugang(false)
  const name = text(form.get("name"), 160)
  if (!name) zurueck("Name fehlt")
  let website = text(form.get("website"), 200)
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`
  const q = neonAbfrage()
  if (!q) zurueck("Speicher nicht verfügbar")
  const firma = await findeOderLegeFirma(q!, {
    name: name!,
    website,
    city: text(form.get("city"), 120),
    note: text(form.get("note"), 1000),
  })
  revalidatePath("/admin/kunden")
  redirect(`/admin/kunden/${firma.id}${firma.neu ? "" : `?meldung=${encodeURIComponent(`Gibt es schon als „${firma.name}“`)}`}`)
}

export async function kundeLoeschen(form: FormData): Promise<void> {
  await zugang(true)
  const id = text(form.get("id"), 80)
  if (!id) zurueck("Kunde fehlt")
  const q = neonAbfrage()
  if (!q) zurueck("Speicher nicht verfügbar")
  const gewonnen = await q!(`SELECT count(*)::int AS n FROM opportunities WHERE organisation_id = $1 AND status = 'won'`, [id])
  if (Number(gewonnen[0]?.n ?? 0) > 0) zurueck("Hat einen gewonnenen Auftrag — bleibt als Nachweis erhalten")
  try {
    // Komplett entfernen: Verlauf, Chancen, Kontakte, Termine – sonst bleiben Waisen auf anderen Seiten stehen.
    await q!(
      `DELETE FROM activities WHERE subject_id = $1
          OR subject_id IN (SELECT id FROM contacts WHERE organisation_id = $1)
          OR subject_id IN (SELECT id FROM opportunities WHERE organisation_id = $1)`,
      [id],
    )
    await q!(`DELETE FROM opportunities WHERE organisation_id = $1`, [id])
    await q!(`DELETE FROM appointments WHERE organisation_id = $1`, [id]).catch(() => undefined)
    await q!(`DELETE FROM booking_links WHERE organisation_id = $1`, [id]).catch(() => undefined)
    await q!(`DELETE FROM contacts WHERE organisation_id = $1`, [id])
    const weg = await q!(`DELETE FROM organisations WHERE id = $1 RETURNING name`, [id])
    if (weg.length === 0) zurueck("Kunde nicht gefunden")
    revalidatePath("/admin/kunden")
    zurueck(`„${weg[0].name as string}“ gelöscht`)
  } catch (e) {
    if (String((e as Error).message).includes("foreign key")) zurueck("Hat eine schriftliche Kundenfreigabe — bleibt als Nachweis erhalten")
    throw e
  }
}
