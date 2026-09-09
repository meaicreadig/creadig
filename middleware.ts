import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session"
import { ausweichZiel, darfBetreten } from "@/lib/rollen"

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

  const { verdict, rolle } = await verifySession(request.cookies.get(ADMIN_COOKIE)?.value)

  /*
   * GATE 32 — ZWEI FRAGEN, NICHT EINE.
   *
   * Hier stand nur: angemeldet oder nicht. Wer hereinkam, sah fuenfzehn
   * Flaechen — die Pipeline, die Recherche, jede Kundenakte.
   *
   * Jetzt entscheidet zusaetzlich `darfBetreten(rolle, pfad)`, und zwar
   * HIER, vor der Seite. Ein ausgeblendeter Menuepunkt waere keine Sperre:
   * die Adresse funktioniert weiter.
   *
   * Wer angemeldet ist, aber nicht darf, wird NICHT zur Anmeldung
   * geschickt — er ist ja angemeldet. Er landet auf der Flaeche, die seine
   * Rolle hat. Eine Anmeldemaske fuer jemanden, der schon angemeldet ist,
   * liest sich wie ein Fehler und laedt dazu ein, es mit einem anderen
   * Passwort zu versuchen.
   */
  if (verdict === "ok" && rolle) {
    if (darfBetreten(rolle, pathname)) return NextResponse.next()
    const ausweich = request.nextUrl.clone()
    ausweich.pathname = ausweichZiel(rolle)
    ausweich.search = ""
    ausweich.searchParams.set("gesperrt", "1")
    return NextResponse.redirect(ausweich)
  }

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
