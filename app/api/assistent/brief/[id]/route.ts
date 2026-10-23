import { cookies } from "next/headers"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { ladeFreigabe } from "@/lib/assistent/store"
import { erzeugeBriefPdf } from "@/lib/brief/pdf"
import { darfBetreten } from "@/lib/rollen"

/** Vorschau: genau das PDF, das nach der Freigabe in den Druck geht. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: false })
  if (z.verdict !== "ok" || !z.rolle || !darfBetreten(z.rolle, "/admin/assistent")) return new Response("Nicht berechtigt", { status: 403 })
  const f = await ladeFreigabe(decodeURIComponent((await params).id).slice(0, 80))
  if (!f || f.art !== "brief" || !f.extra.anschrift) return new Response("Nicht gefunden", { status: 404 })
  const pdf = await erzeugeBriefPdf({ an: f.extra.anschrift, betreff: f.betreff || f.titel, text: f.inhalt })
  return new Response(Buffer.from(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="brief-${f.id}.pdf"`, "Cache-Control": "private, no-store" },
  })
}
