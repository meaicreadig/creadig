import { NextResponse, type NextRequest } from "next/server"

import { veroeffentlicheGeplante } from "@/lib/assistent/redaktion-post"

export const dynamic = "force-dynamic"
export const maxDuration = 120

/** Morgen-Takt der Redaktion: freigegebene, geplante LinkedIn-Beiträge gehen um 7 Uhr (Berlin) raus. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const erlaubt = secret
    ? auth === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/")
  if (!erlaubt) return NextResponse.json({ ok: false }, { status: 401 })

  const veroeffentlicht = await veroeffentlicheGeplante()
  return NextResponse.json({ ok: true, veroeffentlicht })
}
