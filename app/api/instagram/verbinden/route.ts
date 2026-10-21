import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { instagramAnmeldeUrl, instagramBereit } from "@/lib/assistent/instagram"

export async function GET(req: NextRequest) {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") return new Response("Nicht berechtigt", { status: 403 })
  if (!instagramBereit()) {
    return NextResponse.redirect(new URL("/admin/assistent?instagram=app-fehlt#redaktion", req.nextUrl.origin))
  }
  const state = crypto.randomUUID()
  const res = NextResponse.redirect(instagramAnmeldeUrl(req.nextUrl.origin, state))
  res.cookies.set("ig_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/api/instagram" })
  return res
}
