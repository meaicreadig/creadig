import { NextResponse, type NextRequest } from "next/server"

import { fuehreFaelligeAus } from "@/lib/assistent/truppe"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/** Täglicher Arbeitstakt der Agenten-Truppe (Vercel Cron). */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const erlaubt = secret
    ? auth === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/")
  if (!erlaubt) return NextResponse.json({ ok: false }, { status: 401 })

  const gelaufen = await fuehreFaelligeAus()
  return NextResponse.json({ ok: true, gelaufen })
}
