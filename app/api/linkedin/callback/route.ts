import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { verbindeMitCode } from "@/lib/assistent/linkedin"

export async function GET(req: NextRequest) {
  const jar = await cookies()
  const z = await pruefeZugang(jar.get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") return new Response("Nicht berechtigt", { status: 403 })

  const ziel = new URL("/admin/assistent", req.nextUrl.origin)
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")
  if (!code || !state || state !== jar.get("li_state")?.value) {
    ziel.searchParams.set("linkedin", "abgebrochen")
  } else {
    try {
      await verbindeMitCode(code, req.nextUrl.origin)
      ziel.searchParams.set("linkedin", "verbunden")
    } catch (e) {
      console.error("[linkedin]", e)
      ziel.searchParams.set("linkedin", "fehler")
    }
  }
  const res = NextResponse.redirect(ziel)
  res.cookies.delete({ name: "li_state", path: "/api/linkedin" })
  return res
}
