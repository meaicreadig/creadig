import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session"

/**
 * MP-G · Die Tür vor dem Control Center.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE PRÜFUNG HIER STEHT UND NICHT IN JEDER SEITE
 * Eine Zugangsprüfung, die in jeder Route noch einmal geschrieben wird, ist
 * eine Prüfung, die irgendwann eine Route vergisst — und die vergessene fällt
 * niemandem auf, weil sie funktioniert. Hier liegt sie einmal, vor allem, was
 * unter `/admin` liegt.
 *
 * ---------------------------------------------------------------------------
 * DREI FÄLLE, DREI ANTWORTEN
 *   nicht eingerichtet   404 — als gäbe es das Control Center nicht. Kein
 *                        Anmeldeformular, das verrät, dass hier etwas ist.
 *   nicht angemeldet     Umleitung auf `/admin/login`
 *   angemeldet           durchlassen
 *
 * Der erste Fall ist Absicht: Ohne `ADMIN_PASSWORD` und
 * `ADMIN_SESSION_SECRET` gibt es keinen Weg hinein, und die Existenz der
 * Oberfläche wird nicht angekündigt.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT PASSIERT
 * Keine Rollenprüfung (es gibt eine Rolle), kein Nachladen von Nutzerdaten
 * (es gibt keine Datenbank), keine Umleitung nach Sprache — das Control
 * Center ist einsprachig deutsch und liegt bewusst ausserhalb der
 * `(de)`/`(tr)`-Bäume.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const configured =
    Boolean(process.env.ADMIN_PASSWORD) && Boolean(process.env.ADMIN_SESSION_SECRET)
  if (!configured) {
    return new NextResponse(null, { status: 404 })
  }

  /* Die Anmeldeseite selbst darf nicht hinter der Anmeldung liegen. */
  if (pathname === "/admin/login") return NextResponse.next()

  const verdict = await verifySession(request.cookies.get(ADMIN_COOKIE)?.value)
  if (verdict === "ok") return NextResponse.next()

  const login = request.nextUrl.clone()
  login.pathname = "/admin/login"
  login.search = ""
  /*
   * Warum kein `?next=`: Ein Rücksprungziel aus der Adresszeile ist eine
   * offene Weiterleitung, wenn es nicht streng geprüft wird — und das Control
   * Center hat heute eine Seite. Nach dem Anmelden geht es auf `/admin`.
   */
  if (verdict === "expired") login.searchParams.set("abgelaufen", "1")
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ["/admin/:path*"],
}
