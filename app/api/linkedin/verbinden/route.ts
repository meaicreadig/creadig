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
  const ziel = anmeldeUrl(req.nextUrl.origin, state, kanal)

  // LinkedIn zeigt bei nicht genehmigten Produkten nur "Bummer, something went wrong" – vorher prüfen und klar melden.
  const probe = await fetch(ziel, { redirect: "manual", signal: AbortSignal.timeout(5000) })
    .then(async (r) => (r.status === 200 ? await r.text() : ""))
    .catch(() => "")
  const zurueck = (m: string) => NextResponse.redirect(new URL(`/admin/assistent?linkedin=${m}#redaktion`, req.nextUrl.origin))
  if (probe.includes("error__interstitial")) return zurueck(`${kanal}-nicht-freigeschaltet`)
  if (probe.includes("redirect_uri does not match")) return zurueck(`${kanal}-redirect`)

  const res = NextResponse.redirect(ziel)
  res.cookies.set("li_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/api/linkedin" })
  return res
}
