import { NextResponse, type NextRequest } from "next/server"

import { takt } from "@/lib/motor/takt"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Taktgeber für den Motor (Vercel Cron). Ist CRON_SECRET gesetzt, muss es
 * passen. Ohne Secret nur für den Vercel-Cron selbst; ein Takt arbeitet
 * ohnehin nur ab, was fällig ist, und kann nichts vorziehen.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const erlaubt = secret
    ? auth === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/")
  if (!erlaubt) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const ergebnis = await takt()
    return NextResponse.json({ ok: true, ...ergebnis })
  } catch (error) {
    console.error("[motor] takt", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
