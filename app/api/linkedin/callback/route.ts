import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

import { verbindeMitCode } from "@/lib/assistent/linkedin"

/*
 * Kein Admin-Cookie-Check hier: Das Admin-Cookie ist SameSite=Strict und wird
 * beim Rücksprung von linkedin.com (seitenübergreifend) NICHT mitgeschickt —
 * genau daher kam "Nicht berechtigt". Die Berechtigung trägt stattdessen
 * `li_state`: Nur ein angemeldeter Inhaber bekommt es in /api/linkedin/verbinden.
 */
export async function GET(req: NextRequest) {
  const jar = await cookies()
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")
  const erwartet = jar.get("li_state")?.value

  let ergebnis = "abgebrochen"
  if (code && state && erwartet && state === erwartet) {
    const kanal = state.startsWith("firma.") ? "firma" : "inhaber"
    try {
      await verbindeMitCode(code, req.nextUrl.origin, kanal)
      ergebnis = kanal === "firma" ? "firma-verbunden" : "verbunden"
    } catch (e) {
      console.error("[linkedin]", e)
      ergebnis = "fehler"
    }
  }

  /*
   * Weiter per Meta-Refresh statt 302: Eine von unserer eigenen Seite
   * ausgelöste Navigation gilt als same-site, dann kommt das Strict-Cookie
   * wieder mit und /admin/assistent leitet nicht auf den Login.
   */
  const ziel = `/admin/assistent?linkedin=${ergebnis}`
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${ziel}"><title>LinkedIn</title></head><body style="font-family:system-ui;padding:2rem"><a href="${ziel}">Weiter zum Assistenten</a></body></html>`
  const res = new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } })
  res.headers.append("Set-Cookie", "li_state=; Path=/api/linkedin; Max-Age=0; HttpOnly; Secure; SameSite=Lax")
  return res
}
