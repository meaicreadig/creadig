import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { timingSafeEqual } from "node:crypto"

import { withAdminHeaders } from "@/lib/admin-session"
import { codeEinloesen, LINKEDIN_STATE_COOKIE } from "@/lib/linkedin"

export const dynamic = "force-dynamic"

function gleich(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/*
 * Das Admin-Cookie ist `strict` und kommt nach der Weiterleitung von LinkedIn
 * nicht mit. Beweis, dass ein angemeldeter Admin den Vorgang gestartet hat,
 * ist deshalb der `state`: nur `/api/linkedin/start` setzt ihn, und nur nach
 * gepruefter Sitzung.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state") ?? ""
  const erwartet = (await cookies()).get(LINKEDIN_STATE_COOKIE)?.value ?? ""

  let ergebnis = "fehler"
  if (url.searchParams.get("error")) ergebnis = "abgebrochen"
  else if (code && erwartet && gleich(state, erwartet)) {
    ergebnis = (await codeEinloesen(code).catch(() => false)) ? "verbunden" : "fehler"
  }

  const antwort = NextResponse.redirect(new URL(`/admin/marketing?linkedin=${ergebnis}#werkstatt`, url.origin))
  antwort.cookies.delete({ name: LINKEDIN_STATE_COOKIE, path: "/api/linkedin" })
  return withAdminHeaders(antwort)
}
