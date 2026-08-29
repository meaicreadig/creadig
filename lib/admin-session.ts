import { equal, sign } from "@/lib/hmac"

/**
 * MP-G · Die Anmeldung am Control Center.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEINE AUTH-BIBLIOTHEK
 * Das Control Center hat heute genau einen Nutzer: den Owner. Eine
 * Auth-Bibliothek bringt Anbieter, Adapter, Sitzungstabellen und eine
 * Datenbank mit — und die gibt es hier nicht (G.0). Sie zu installieren, um
 * ein Passwort zu prüfen, wäre die Sorte Überbau, die MP-G §69 ausdrücklich
 * verbietet.
 *
 * Was hier steht, ist das Verfahren, das dieses Repo schon einmal richtig
 * gelöst hat: ein signierter, ablaufender Wert (`lib/lead-guard.ts`). Dieselbe
 * HMAC-Grundlage (`lib/hmac.ts`), derselbe zeitkonstante Vergleich, dieselbe
 * Regel „ohne Geheimnis kein Betrieb".
 *
 * ---------------------------------------------------------------------------
 * WAS DAS ABLÖST
 * `/status` wird heute mit `?key=<SELFTEST_SECRET>` geöffnet. Für eine reine
 * Leseansicht ist das vertretbar. Für eine Oberfläche, die später etwas
 * ÄNDERT, ist es das nicht: Ein Schlüssel in der Adresszeile steht im
 * Browserverlauf, in jedem `Referer`-Header und in jedem geteilten Link.
 *
 * ---------------------------------------------------------------------------
 * WAS DAS NICHT IST
 * Kein Rollensystem, kein Mehrbenutzerbetrieb, kein zweiter Faktor. MP-G §29
 * sagt: Architektur vorbereiten, Komplexität erst bei realem Bedarf. Der
 * Bedarf entsteht mit der zweiten Person — dann trägt das Sitzungsformat
 * unten einen Nutzernamen, und der Rest bleibt.
 */

/** Acht Stunden: ein Arbeitstag. Danach ist neu anzumelden. */
const SESSION_MS = 8 * 60 * 60 * 1000

export const ADMIN_COOKIE = "cd_admin"

/**
 * Beide Werte müssen gesetzt sein. Fehlt einer, ist das Control Center
 * **abgeschaltet** — nicht „offen mit Standardpasswort". Dieselbe Haltung wie
 * bei `/status`: lieber keine Innenansicht als eine ungesicherte.
 *
 * Kein Rückfall auf `RESEND_API_KEY` wie in `lead-guard`. Dort geht es um
 * Missbrauchsschutz eines öffentlichen Formulars; hier um Zugang zu allem.
 * Ein Geheimnis, das zwei Zwecken dient, ist beim Wechsel doppelt gefährlich.
 */
function config(): { password: string; secret: string } | null {
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!password || !secret) return null
  return { password, secret }
}

export function adminConfigured(): boolean {
  return config() !== null
}

/**
 * Prüft das eingegebene Passwort. Zeitkonstant — sonst verrät die Antwortzeit,
 * wie viele Zeichen stimmen.
 */
export function passwordMatches(input: unknown): boolean {
  const cfg = config()
  if (!cfg) return false
  if (typeof input !== "string" || input.length === 0) return false
  return equal(input, cfg.password)
}

/** `<ablaufZeitpunkt>.<signatur>` — dasselbe Format wie das Formular-Token. */
export async function issueSession(now = Date.now()): Promise<string | null> {
  const cfg = config()
  if (!cfg) return null
  const expiresAt = String(now + SESSION_MS)
  return `${expiresAt}.${await sign(expiresAt, cfg.secret)}`
}

export type SessionVerdict = "ok" | "missing" | "invalid" | "expired" | "unavailable"

export async function verifySession(
  value: unknown,
  now = Date.now(),
): Promise<SessionVerdict> {
  const cfg = config()
  if (!cfg) return "unavailable"
  if (typeof value !== "string" || value.length === 0) return "missing"
  /* Eine Obergrenze, damit ein langer Wert nicht erst signiert wird. */
  if (value.length > 200) return "invalid"

  const separator = value.indexOf(".")
  if (separator <= 0) return "invalid"

  const expiresAt = value.slice(0, separator)
  const signature = value.slice(separator + 1)
  if (!/^\d+$/.test(expiresAt)) return "invalid"

  /*
   * Erst die Signatur, dann die Zeit. Andersherum würde ein abgelaufener,
   * aber gefälschter Wert dieselbe Antwort bekommen wie ein abgelaufener
   * echter — und damit verraten, dass die Fälschung an der Zeit scheiterte.
   */
  if (!equal(signature, await sign(expiresAt, cfg.secret))) return "invalid"
  if (Number(expiresAt) < now) return "expired"
  return "ok"
}

/**
 * Die Attribute, mit denen das Cookie gesetzt wird.
 *
 *   HttpOnly  kein Zugriff aus JavaScript — ein XSS auf der Marketing-Seite
 *             soll keine Admin-Sitzung mitnehmen können.
 *   SameSite  `strict`: Das Cookie wird bei keiner fremden Verlinkung
 *             mitgeschickt. Für eine Oberfläche ohne externe Einstiege ist
 *             das die richtige Stufe; CSRF-Token erübrigen sich damit.
 *   Secure    im Betrieb immer. Lokal ohne TLS wäre es sonst nie gesetzt.
 *   Path      `/` und nicht `/admin`: Sonst kommt das Cookie beim
 *             Abmelde-Aufruf unter `/api/...` gar nicht an.
 */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  }
}

export const SESSION_SECONDS = SESSION_MS / 1000
