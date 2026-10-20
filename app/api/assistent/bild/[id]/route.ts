import { cookies } from "next/headers"
import { get } from "@vercel/blob"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { ladeFreigabe } from "@/lib/assistent/store"
import { darfBetreten } from "@/lib/rollen"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: false })
  if (z.verdict !== "ok" || !z.rolle || !darfBetreten(z.rolle, "/admin/assistent")) {
    return new Response("Nicht berechtigt", { status: 403 })
  }
  const f = await ladeFreigabe(decodeURIComponent((await params).id).slice(0, 80))
  if (!f?.bildPfad) return new Response("Nicht gefunden", { status: 404 })
  const blob = await get(f.bildPfad, { access: "private" })
  if (!blob?.stream) return new Response("Nicht gefunden", { status: 404 })
  return new Response(blob.stream, {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" },
  })
}
