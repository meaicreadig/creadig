import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session"
import { ausweichZiel, darfBetreten } from "@/lib/rollen"
import { LOCALE_COOKIE, nenntSprache, spracheFuer } from "@/lib/locale-markt"
import { localePath } from "@/lib/routes"

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
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE SPRACHWEICHE — und warum sie so wenig tut wie moeglich
 *
 * Eine automatische Sprachumleitung ist der schnellste Weg, eine Seite
 * kaputtzumachen: Endlosschleifen, ein Suchindex voller Umleitungen, und
 * Besucher, die ihre eigene Wahl nicht behalten duerfen. Deshalb greift sie
 * hier nur in EINEM Fall — und laesst alles andere in Ruhe.
 *
 * SIE GREIFT NICHT, WENN:
 *
 *   · der Pfad schon eine Sprache nennt (`/tr`, `/en`, `/ar`).
 *     Eine ausdrueckliche Adresse ist eine ausdrueckliche Absicht. Wer aus
 *     Deutschland `/ar` oeffnet, will Arabisch — und bekommt Arabisch.
 *
 *   · ein Keks die Wahl des Menschen traegt. Einmal umgeschaltet, nie
 *     wieder umgeleitet.
 *
 *   · kein `Accept-Language` mitkommt ODER er nur `*` sagt. Das ist die
 *     ehrlichste Bot-Erkennung, die ohne Namensliste auskommt: Menschen
 *     nennen eine Sprache, Werkzeuge und Crawler schicken „egal". Ohne
 *     genannten Wunsch wird nicht geraten, und Deutsch bleibt stehen.
 *
 *   · die Entscheidung „Deutsch" lautet. Deutsch liegt an der Wurzel; es
 *     gaebe kein anderes Ziel.
 *
 * SIE UMLEITET TEMPORAER (307), NIE DAUERHAFT.
 * Eine 301 waere eine Aussage ueber die Adresse. Das hier ist eine Aussage
 * ueber den Besucher — und der naechste ist ein anderer.
 */
const SPRACHFREI = /^\/(admin|api|_next|.*\..*)/
const SCHON_UEBERSETZT = /^\/(tr|en|ar)(\/|$)/

function sprachweiche(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (SPRACHFREI.test(pathname) || SCHON_UEBERSETZT.test(pathname)) return null

  const gespeichert = request.cookies.get(LOCALE_COOKIE)?.value ?? null

  /*
    ZUERST STAND HIER `if (cookie) return null` — UND DAS WAR FALSCH HERUM.

    Damit wurde die gespeicherte Wahl nicht BEACHTET, sondern UEBERSPRUNGEN:
    Wer Englisch gewaehlt hatte und spaeter die blanke Adresse oeffnete,
    landete wieder auf Deutsch. Die Wahl soll aber gelten, nicht nur die
    Erkennung abschalten. Sie geht deshalb als oberste Stufe in die
    Entscheidung ein.

    Der Kopf `accept-language` bleibt Bedingung fuer das ERRATEN, nicht fuer
    das Erinnern: Ohne Wahl und ohne Browsersprache wird nichts geraten.
  */
  const browsersprache = request.headers.get("accept-language")
  if (!gespeichert && !nenntSprache(browsersprache)) return null

  const sprache = spracheFuer({
    gespeichert,
    browsersprache,
    land: request.headers.get("x-vercel-ip-country"),
  })
  if (sprache === "de") return null

  const ziel = request.nextUrl.clone()
  ziel.pathname = localePath(pathname, sprache)
  if (ziel.pathname === pathname) return null
  return NextResponse.redirect(ziel, 307)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /* Alles ausserhalb von /admin geht hoechstens durch die Sprachweiche. */
  if (!pathname.startsWith("/admin")) {
    return sprachweiche(request) ?? NextResponse.next()
  }

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
  /*
    Statische Dateien und Bilder bleiben aussen vor — eine Sprachweiche vor
    einem Logo kostet nur Zeit. `SPRACHFREI` faengt den Rest ab.
  */
  matcher: [
    /*
      Der Admin-Pfad bleibt woertlich stehen. Das Rollen-Gate prueft genau
      diesen Eintrag — und zu Recht: Eine Zugangspruefung, die nur noch aus
      einem Negativ-Muster folgt, ist eine, die beim naechsten Umbau
      unbemerkt aufgeht.
    */
    "/admin/:path*",
    /* Alles Oeffentliche fuer die Sprachweiche; Dateien und Bilder nicht. */
    "/((?!admin|_next/static|_next/image|favicon|.*\\..*).*)",
  ],
}
