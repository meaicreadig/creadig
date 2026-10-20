import { NextResponse } from "next/server"

/**
 * Alter Einstieg der Werkstatt (/admin/marketing). Es gibt nur noch EINE
 * Verbindung und EINEN Rückruf — dieser Weg führt dorthin (Kanal „inhaber"),
 * statt einen zweiten Ablauf mit eigenem Cookie zu pflegen.
 */
export const dynamic = "force-dynamic"

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/api/linkedin/verbinden?kanal=inhaber", request.url))
}
