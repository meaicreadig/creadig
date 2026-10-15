import { cookies } from "next/headers"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzDb } from "@/lib/finanz/store"
import { ladeDokument, ladeFirma } from "@/lib/finanz/auftraege/store"
import { erzeugeXRechnung } from "@/lib/finanz/auftraege/erechnung"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: false })
  if (z.verdict !== "ok" || z.rolle !== "owner") return new Response("Nicht berechtigt", { status: 401 })
  const db = await finanzDb()
  if (!db) return new Response("Kein Speicher verbunden", { status: 503 })

  const { id } = await params
  const d = await ladeDokument(db, id)
  if (!d) return new Response("Nicht gefunden", { status: 404 })
  const { firma, ustPflichtig } = await ladeFirma(db)
  const e = erzeugeXRechnung(d, firma, ustPflichtig)
  if (!e.ok) return new Response(`E-Rechnung nicht möglich:\n- ${e.fehlt.join("\n- ")}`, { status: 422, headers: { "Content-Type": "text/plain; charset=utf-8" } })

  return new Response(e.xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.dateiname}"`,
      "Cache-Control": "no-store",
    },
  })
}
