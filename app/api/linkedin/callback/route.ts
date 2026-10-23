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
  /*
    23.10.2026: Lehnte LinkedIn ab (Produkt nicht freigeschaltet, Redirect-URL
    fehlt), kam statt `code` ein `error` zurück — und hier stand nur
    „abgebrochen“, ohne Logzeile. Die Seite kennt die genauen Hinweise
    (`firma-nicht-freigeschaltet`, `firma-redirect`), bekam sie aber nie.
    Die Firmenseite war deshalb nie verbunden, ohne dass jemand sah, warum.
  */
  const fehler = req.nextUrl.searchParams.get("error")
  if (fehler) {
    const kanal = state?.startsWith("firma.") ? "firma" : "inhaber"
    const beschreibung = req.nextUrl.searchParams.get("error_description") ?? ""
    console.error("[linkedin] abgelehnt", kanal, fehler, beschreibung.slice(0, 300))
    ergebnis = /scope|unauthorized/i.test(`${fehler} ${beschreibung}`)
      ? `${kanal}-nicht-freigeschaltet`
      : /redirect/i.test(`${fehler} ${beschreibung}`)
        ? `${kanal}-redirect`
        : fehler === "user_cancelled_login" || fehler === "user_cancelled_authorize"
          ? "abgebrochen"
          : "fehler"
  } else if (code && state && erwartet && state === erwartet) {
    const kanal = state.startsWith("firma.") ? "firma" : "inhaber"
    try {
      await verbindeMitCode(code, req.nextUrl.origin, kanal)
      ergebnis = kanal === "firma" ? "firma-verbunden" : "verbunden"
    } catch (e) {
      console.error("[linkedin]", e)
      const m = e instanceof Error ? e.message : ""
      /* 403 auf organizationAcls = Community Management API fehlt; kein Admin = falsches Konto. */
      ergebnis = kanal === "firma" && /Firmenseiten: 403|ACCESS_DENIED/i.test(m) ? "firma-nicht-freigeschaltet" : kanal === "firma" && /Kein Admin-Zugang/.test(m) ? "firma-kein-admin" : "fehler"
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
