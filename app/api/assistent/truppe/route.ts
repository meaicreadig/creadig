import { NextResponse, type NextRequest } from "next/server"

import { fuehreFaelligeAus } from "@/lib/assistent/truppe"
import { cronErlaubt } from "@/lib/cron-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/** Täglicher Arbeitstakt der Agenten-Truppe (Vercel Cron). */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  const gelaufen = await fuehreFaelligeAus()
  return NextResponse.json({ ok: true, gelaufen })
}
