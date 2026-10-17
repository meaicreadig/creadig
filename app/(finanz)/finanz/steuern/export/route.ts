import { cookies } from "next/headers"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzDb } from "@/lib/finanz/store"
import { erzeugeSteuerberaterPaket } from "@/lib/finanz/steuerberater-export"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/** Steuerberater-Paket als ZIP — nur owner, nie gecacht (enthält Beleg-Inhalte und Rechnungsdaten). */
export async function GET(req: Request) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: false })
  if (z.verdict !== "ok" || z.rolle !== "owner") return new Response("Nicht berechtigt", { status: 403 })
  const db = await finanzDb()
  if (!db) return new Response("Kein Speicher verbunden", { status: 503 })

  const jahr = new URL(req.url).searchParams.get("jahr") ?? String(new Date().getFullYear())
  if (!/^\d{4}$/.test(jahr)) return new Response("Ungültiges Jahr", { status: 400 })

  try {
    const zip = await erzeugeSteuerberaterPaket(db, jahr)
    return new Response(new Uint8Array(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="creaDIG-Finanz-${jahr}.zip"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (e) {
    console.error("[finanz] steuerberater-export", e instanceof Error ? e.message : e)
    return new Response("Export fehlgeschlagen — bitte erneut versuchen.", { status: 500 })
  }
}
