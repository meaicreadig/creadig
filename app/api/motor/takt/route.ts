import { NextResponse, type NextRequest } from "next/server"

import { takt } from "@/lib/motor/takt"
import { cronErlaubt } from "@/lib/cron-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Taktgeber für den Motor (Vercel Cron). Ist CRON_SECRET gesetzt, muss es
 * passen. Ohne Secret nur für den Vercel-Cron selbst; ein Takt arbeitet
 * ohnehin nur ab, was fällig ist, und kann nichts vorziehen.
 */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const { mitAgent } = await import("@/lib/lernen/kontext")
    const ergebnis = await mitAgent("motor", () => takt())
    /* Termin-Nachfass hängt nicht mehr an einem Seitenbesuch: unbenutzte Terminlinks bekommen hier täglich ihren Entwurf. */
    const { bereiteNachfassVor } = await import("@/lib/termine/nachfass")
    const nachfass = await bereiteNachfassVor().catch((e) => {
      console.error("[nachfass]", e instanceof Error ? e.message : e)
      return 0
    })
    return NextResponse.json({ ok: true, ...ergebnis, nachfass })
  } catch (error) {
    console.error("[motor] takt", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
