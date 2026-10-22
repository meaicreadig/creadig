import { NextResponse, type NextRequest } from "next/server"

import { fuehreFaelligeAus } from "@/lib/assistent/truppe"
import { cronErlaubt } from "@/lib/cron-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/** Täglicher Arbeitstakt der Agenten-Truppe (Vercel Cron). `?runde=chef`: Chief of Staff garantiert zuerst. */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  const gelaufen = await fuehreFaelligeAus({ chef: request.nextUrl.searchParams.get("runde") === "chef" })
  return NextResponse.json({ ok: true, gelaufen })
}
