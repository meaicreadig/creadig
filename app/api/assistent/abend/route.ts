import { NextResponse, type NextRequest } from "next/server"

import { erstelleAbendRueckmeldung } from "@/lib/assistent/abend"
import { cronErlaubt } from "@/lib/cron-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 120

/** Tages-Rückmeldung am Abend (Vercel Cron, 18 UTC ≈ 20 Uhr Berlin). */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  const r = await erstelleAbendRueckmeldung()
  return NextResponse.json({ ok: true, quelle: r.quelle })
}
