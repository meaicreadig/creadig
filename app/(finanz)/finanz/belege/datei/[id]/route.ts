import { cookies } from "next/headers"
import { get } from "@vercel/blob"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzDb } from "@/lib/finanz/store"
import { belegeSchema, dateiVon } from "@/lib/finanz/belege"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: false })
  if (z.verdict !== "ok" || z.rolle !== "owner") return new Response("Nicht berechtigt", { status: 403 })
  const db = await finanzDb()
  if (!db) return new Response("Kein Speicher", { status: 503 })
  await belegeSchema(db)

  const datei = await dateiVon(db, decodeURIComponent((await params).id))
  if (!datei) return new Response("Nicht gefunden", { status: 404 })
  const blob = await get(datei.pfad, { access: "private" })
  if (!blob || !blob.stream) return new Response("Nicht gefunden", { status: 404 })

  return new Response(blob.stream, {
    headers: {
      "Content-Type": datei.typ ?? blob.blob.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(datei.name)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
