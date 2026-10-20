import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { anmeldeUrl, linkedinBereit } from "@/lib/assistent/linkedin"

export async function GET(req: NextRequest) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") return new Response("Nicht berechtigt", { status: 403 })
  const kanal = req.nextUrl.searchParams.get("kanal") === "firma" ? "firma" : "inhaber"
  if (!linkedinBereit(kanal)) return new Response("LinkedIn-App fehlt", { status: 503 })

  const state = `${kanal}.${crypto.randomUUID()}`
  const res = NextResponse.redirect(anmeldeUrl(req.nextUrl.origin, state, kanal))
  res.cookies.set("li_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/api/linkedin" })
  return res
}
