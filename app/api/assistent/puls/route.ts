import { NextResponse, type NextRequest } from "next/server"

import { pulsRunde } from "@/lib/zentrale/puls"
import { cronErlaubt } from "@/lib/cron-auth"

export const maxDuration = 300

/** Puls der KI-Firma zwischen den Morgen-Takten (Vercel Cron). */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  const r = await pulsRunde()
  return NextResponse.json({ ok: true, ...r })
}
