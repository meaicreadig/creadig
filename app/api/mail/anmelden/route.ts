import { NextResponse } from "next/server"

import { bucketKey, bucketKeyIsPseudonymous, callerAddress } from "@/lib/lead-guard"
import { meldeAn } from "@/lib/mailing/anmeldung"
import { durableWithinLimit } from "@/lib/rate-limit"

/** Newsletter-Anmeldung (Double-Opt-in, lib/mailing/anmeldung.ts). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; sprache?: unknown; quelle?: unknown; zustimmung?: unknown; website?: unknown } | null
  if (!body || typeof body.email !== "string") return NextResponse.json({ ok: false, grund: "ungueltig" }, { status: 400 })
  /* Honigtopf: Menschen sehen das Feld nicht. */
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true })
  if (body.zustimmung !== true) return NextResponse.json({ ok: false, grund: "zustimmung" }, { status: 400 })
  const adresse = callerAddress(request)
  if (!(await durableWithinLimit(await bucketKey("newsletter", adresse), 5)).erlaubt) {
    return NextResponse.json({ ok: false, grund: "zu_viele" }, { status: 429 })
  }
  const sprache = body.sprache === "tr" || body.sprache === "en" ? body.sprache : "de"
  const quelle = typeof body.quelle === "string" ? body.quelle : "website"
  const ipHmac = bucketKeyIsPseudonymous() ? await bucketKey("doi", adresse) : null
  const r = await meldeAn({ email: body.email, sprache, quelle, ipHmac })
  return NextResponse.json(r, { status: r.ok ? 200 : r.grund === "ungueltig" ? 400 : 503 })
}
