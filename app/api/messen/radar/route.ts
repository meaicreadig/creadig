import { NextResponse, type NextRequest } from "next/server"

import { radarRecherche } from "@/lib/messen-radar"
import { cronErlaubt } from "@/lib/cron-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 120

/** Wöchentliches Messe-Radar (Vercel Cron, montags). */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const ergebnis = await radarRecherche()
    return NextResponse.json({ ok: true, ...ergebnis })
  } catch (error) {
    console.error("[messen] radar", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
