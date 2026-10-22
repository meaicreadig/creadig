import { NextResponse, type NextRequest } from "next/server"

import { finanzDb } from "@/lib/finanz/store"
import { gleicheFiberoAb } from "@/lib/finanz/fibero-abgleich"
import { cronErlaubt } from "@/lib/cron-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** Täglicher fibero-Abgleich (Vercel Cron). Gleiche Absicherung wie der Motor-Takt. */
export async function GET(request: NextRequest) {
  if (!cronErlaubt(request)) return NextResponse.json({ ok: false }, { status: 401 })

  const db = await finanzDb().catch(() => null)
  if (!db) return NextResponse.json({ ok: false, grund: "kein Speicher" }, { status: 503 })
  try {
    return NextResponse.json({ ok: true, ...(await gleicheFiberoAb(db)) })
  } catch (error) {
    console.error("[finanz] abgleich", error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
