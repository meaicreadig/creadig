import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  adminConfigured,
  issueSession,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/admin-session"
import { bucketKey, callerAddress, withinLimit } from "@/lib/lead-guard"

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

export async function POST(request: Request) {
  if (!adminConfigured()) {
    /* Wie in der Middleware: Die Existenz wird nicht angekündigt. */
    return new NextResponse(null, { status: 404 })
  }

  const key = await bucketKey("admin-login", callerAddress(request))
  if (!withinLimit(key, MAX_ATTEMPTS, Date.now())) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  let payload: { password?: unknown }
  try {
    payload = (await request.json()) as { password?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 })
  }

  if (!passwordMatches(payload.password)) {
    /*
     * Eine Antwort für alles: falsches Passwort, leeres Feld, falscher Typ.
     * Wer unterscheidet, sagt einem Angreifer, wie weit er ist.
     */
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 })
  }

  const session = await issueSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, session, sessionCookieOptions(SESSION_SECONDS))
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  /* Abmelden heisst: das Cookie sofort ungültig machen, nicht nur vergessen. */
  response.cookies.set(ADMIN_COOKIE, "", sessionCookieOptions(0))
  return response
}
