import { NextResponse, type NextRequest } from "next/server"

import { veroeffentlicheGeplante } from "@/lib/assistent/redaktion-post"
import { cronErlaubt } from "@/lib/cron-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 120

/** Morgen-Takt der Redaktion: freigegebene, geplante LinkedIn-Beiträge gehen um 7 Uhr (Berlin) raus. */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  const veroeffentlicht = await veroeffentlicheGeplante()
  return NextResponse.json({ ok: true, veroeffentlicht })
}
