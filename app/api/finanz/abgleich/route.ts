import { NextResponse, type NextRequest } from "next/server"

import { finanzDb } from "@/lib/finanz/store"
import { gleicheFiberoAb } from "@/lib/finanz/fibero-abgleich"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** Täglicher fibero-Abgleich (Vercel Cron). Gleiche Absicherung wie der Motor-Takt. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const erlaubt = secret
    ? auth === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/")
  if (!erlaubt) return NextResponse.json({ ok: false }, { status: 401 })

  const db = await finanzDb().catch(() => null)
  if (!db) return NextResponse.json({ ok: false, grund: "kein Speicher" }, { status: 503 })
  try {
    return NextResponse.json({ ok: true, ...(await gleicheFiberoAb(db)) })
  } catch (error) {
    console.error("[finanz] abgleich", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
