import { NextResponse, type NextRequest } from "next/server"

import { pulsRunde } from "@/lib/zentrale/puls"

export const maxDuration = 300

/** Puls der KI-Firma zwischen den Morgen-Takten (Vercel Cron). */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const erlaubt = secret
    ? auth === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/")
  if (!erlaubt) return NextResponse.json({ ok: false }, { status: 401 })

  const r = await pulsRunde()
  return NextResponse.json({ ok: true, ...r })
}
