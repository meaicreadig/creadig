import { NextResponse, type NextRequest } from "next/server"

import { erstelleAbendRueckmeldung } from "@/lib/assistent/abend"

export const dynamic = "force-dynamic"
export const maxDuration = 120

/** Tages-Rückmeldung am Abend (Vercel Cron, 18 UTC ≈ 20 Uhr Berlin). */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const erlaubt = secret
    ? auth === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/")
  if (!erlaubt) return NextResponse.json({ ok: false }, { status: 401 })

  const r = await erstelleAbendRueckmeldung()
  return NextResponse.json({ ok: true, quelle: r.quelle })
}
