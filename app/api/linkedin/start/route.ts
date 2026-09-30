import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { ADMIN_COOKIE, withAdminHeaders } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { autorisierungsUrl, LINKEDIN_STATE_COOKIE, neuerState } from "@/lib/linkedin"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/marketing")) {
    return withAdminHeaders(NextResponse.redirect(new URL("/admin/login", request.url)))
  }

  const state = neuerState()
  const ziel = autorisierungsUrl(state)
  if (!ziel) {
    return withAdminHeaders(NextResponse.redirect(new URL("/admin/marketing?linkedin=fehlt", request.url)))
  }

  const antwort = NextResponse.redirect(ziel)
  /* `lax`, weil LinkedIn per Weiterleitung zurueckkommt – ein `strict`-Cookie kaeme dort nicht an. */
  antwort.cookies.set(LINKEDIN_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/linkedin",
    maxAge: 600,
  })
  return withAdminHeaders(antwort)
}
