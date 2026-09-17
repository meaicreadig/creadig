import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  adminConfigured,
  issueSession,
  rolleFuerPasswort,
  sameOrigin,
  sessionCookieOptions,
  withAdminHeaders,
} from "@/lib/admin-session"
import { alleWiderrufen, pruefeZugang, widerrufSpeicher, widerrufen } from "@/lib/admin-widerruf"
import { bucketKey, callerAddress } from "@/lib/lead-guard"
import { durableWithinLimit } from "@/lib/rate-limit"

/**
 * MP-G · Anmelden und Abmelden am Control Center.
 *
 * ---------------------------------------------------------------------------
 * WARUM EINE ROUTE UND KEINE SERVER ACTION
 * Dieses Repo hat ein Muster für „Formular schickt etwas an den Server":
 * `POST /api/lead`. Eine Server Action wäre moderner und hier die erste ihrer
 * Art — ein zweites Muster für denselben Zweck, in der sicherheitskritischsten
 * Route des Projekts. Das ist der falsche Ort für eine Premiere.
 *
 * ---------------------------------------------------------------------------
 * DAS FENSTER GEGEN DAS DURCHPROBIEREN
 * Ein Passwort ohne Versuchsgrenze ist eine Frage der Zeit, nicht der Stärke.
 * Das Fenster kommt aus `lead-guard` — dieselbe Mechanik, die die
 * Formularroute schützt, mit derselben ehrlichen Einschränkung: Es liegt im
 * Arbeitsspeicher und gilt je Instanz. Gegen das, was hier realistisch
 * passiert (ein Skript, eine Adresse, in Serie), hilft es sofort.
 *
 * Gespeichert wird nicht die Adresse, sondern ihr HMAC.
 */

export const dynamic = "force-dynamic"

/** Zehn Versuche im Fenster von `lead-guard` (10 Minuten). */
const MAX_ATTEMPTS = 10

async function anmelden(request: Request): Promise<NextResponse> {
  if (!adminConfigured()) {
    /* Wie in der Middleware: Die Existenz wird nicht angekündigt. */
    return new NextResponse(null, { status: 404 })
  }

  const key = await bucketKey("admin-login", callerAddress(request))
  /* ADM-02 · H3 — ueber Instanzen hinweg (`lib/rate-limit.ts`). */
  if (!(await durableWithinLimit(key, MAX_ATTEMPTS)).erlaubt) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  let payload: { password?: unknown }
  try {
    payload = (await request.json()) as { password?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 })
  }

  /*
   * GATE 32 — WELCHE Rolle, nicht nur OB.
   *
   * `rolleFuerPasswort()` prueft jede gesetzte Rollen-Variable zeitkonstant
   * und gibt die Rolle zurueck. Ist keine gesetzt oder passt keine, ist die
   * Antwort dieselbe wie vorher: eine einzige, fuer alles.
   *
   * Eine Antwort für alles: falsches Passwort, leeres Feld, falscher Typ,
   * unbekannte Rolle. Wer unterscheidet, sagt einem Angreifer, wie weit er
   * ist — und mit Rollen waere die Auskunft doppelt wertvoll: Sie verriete
   * auch, WELCHES Passwort er fast getroffen hat.
   */
  const rolle = rolleFuerPasswort(payload.password)
  if (!rolle) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 })
  }

  const session = await issueSession(rolle)
  if (!session) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, session, sessionCookieOptions(SESSION_SECONDS))
  return response
}

/*
 * ADM-02 · H2 — Abmelden WIDERRUFT, statt nur zu vergessen.
 *
 * Mit Speicher wird die Sitzungs-ID gesperrt; eine Kopie des Cookies gilt ab
 * dann nirgends mehr. `?alle=1` (nur Owner) sperrt jede bis jetzt
 * ausgestellte Sitzung.
 *
 * Die Antwort sagt ehrlich, was passiert ist: `revoked: "server"` nur, wenn
 * der Eintrag geschrieben wurde. Ohne Speicher oder bei einem Fehler lautet
 * sie `revoked: "browser-only"` — das Cookie ist in DIESEM Browser weg, eine
 * Kopie gilt bis zum Ablauf. Das Cookie wird in jedem Fall geloescht.
 */
async function abmelden(request: Request): Promise<NextResponse> {
  const alle = new URL(request.url).searchParams.get("alle") === "1"
  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)cd_admin=([^;]*)/)?.[1]
  const speicher = widerrufSpeicher()
  const zugang = await pruefeZugang(cookie ? decodeURIComponent(cookie) : undefined, {
    aendernd: false,
    speicher,
  })

  if (alle && zugang.rolle !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  let revoked: "server" | "browser-only" = "browser-only"
  if (speicher && zugang.verdict === "ok" && zugang.sid && zugang.expiresAt) {
    try {
      if (alle) await alleWiderrufen(speicher)
      else await widerrufen(speicher, zugang.sid, zugang.expiresAt, "abmelden")
      revoked = "server"
    } catch (error) {
      console.warn("[admin] Widerruf nicht gespeichert:", error instanceof Error ? error.message : "unbekannt")
    }
  }

  const response = NextResponse.json({ ok: true, revoked, scope: alle ? "all" : "session" })
  /* Abmelden heisst: das Cookie sofort ungültig machen, nicht nur vergessen. */
  response.cookies.set(ADMIN_COOKIE, "", sessionCookieOptions(0))
  return response
}

/*
 * ADM-02 · H4 — jede Antwort dieser Route bekommt die Admin-Header, und
 * keine Mutation ohne Ursprung dieser Seite. Die 404 bei fehlender
 * Einrichtung bleibt VOR der Ursprungspruefung: Wer nicht eingerichtet ist,
 * verraet auch durch eine 403 nicht, dass es die Route gibt.
 */
export async function POST(request: Request) {
  if (adminConfigured() && !sameOrigin(request)) {
    return withAdminHeaders(NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }))
  }
  return withAdminHeaders(await anmelden(request))
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) {
    return withAdminHeaders(NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }))
  }
  return withAdminHeaders(await abmelden(request))
}
