import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

import { verbindeInstagram } from "@/lib/assistent/instagram"

/* Wie bei LinkedIn: Das Strict-Admin-Cookie fehlt beim Rücksprung, die Berechtigung trägt `ig_state`. */
export async function GET(req: NextRequest) {
  const jar = await cookies()
  const code = req.nextUrl.searchParams.get("code")?.replace(/#_$/, "")
  const state = req.nextUrl.searchParams.get("state")
  const erwartet = jar.get("ig_state")?.value

  let ergebnis = "abgebrochen"
  if (code && state && erwartet && state === erwartet) {
    try {
      await verbindeInstagram(code, req.nextUrl.origin)
      ergebnis = "verbunden"
    } catch (e) {
      console.error("[instagram]", e)
      ergebnis = "fehler"
    }
  }

  const ziel = `/admin/assistent?instagram=${ergebnis}#redaktion`
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${ziel}"><title>Instagram</title></head><body style="font-family:system-ui;padding:2rem"><a href="${ziel}">Weiter zum Assistenten</a></body></html>`
  const res = new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } })
  res.headers.append("Set-Cookie", "ig_state=; Path=/api/instagram; Max-Age=0; HttpOnly; Secure; SameSite=Lax")
  return res
}
