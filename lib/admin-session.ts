import { equal, sign } from "@/lib/hmac"
import { ROLLEN, ROLLEN_KEYS, istRolle, type Rolle } from "@/lib/rollen"

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

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null
}

/*
 * GATE 32 — WELCHE ROLLE GEHOERT ZU DIESEM PASSWORT?
 *
 * Bis hierher gab es eine Frage: stimmt das Passwort. Es gab nur eins, und
 * wer es kannte, sah alles.
 *
 * Jetzt hat jede Rolle ihre EIGENE Umgebungsvariable. Diese Datei liest sie,
 * vergleicht zeitkonstant und gibt die Rolle zurueck — sie legt kein Konto
 * an, und ein Wert steht nirgends im Repository.
 *
 * ZEITKONSTANT UEBER ALLE: Es wird JEDE gesetzte Variable geprueft, auch
 * wenn die erste schon passt. Ein Abbruch beim ersten Treffer verriete ueber
 * die Antwortzeit, welche Rolle geraten wurde. Und `owner` steht zuerst in
 * `ROLLEN_KEYS`: Waeren zwei Variablen versehentlich gleich gesetzt,
 * bekaeme man sonst die schwaechere Rolle und wunderte sich, was fehlt.
 */
export function rolleFuerPasswort(input: unknown): Rolle | null {
  if (typeof input !== "string" || input.length === 0) return null
  let treffer: Rolle | null = null
  for (const rolle of ROLLEN_KEYS) {
    const wert = process.env[ROLLEN[rolle].variable]
    if (typeof wert !== "string" || wert.length === 0) continue
    if (equal(input, wert) && treffer === null) treffer = rolle
  }
  return treffer
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

/**
 * `<rolle>.<ablaufZeitpunkt>.<signatur>`
 *
 * GATE 32 — die Rolle steht IN der Sitzung und ist mitsigniert.
 *
 * Vorher lautete das Format `<ablauf>.<signatur>` und trug keine Identitaet:
 * `verifySession()` sagte „ok", nicht WER. Damit konnte die Middleware nur
 * eine Frage stellen — angemeldet oder nicht.
 *
 * Die Rolle darf nicht NEBEN der Signatur stehen, sondern muss UNTER ihr
 * liegen: Signiert wird `<rolle>.<ablauf>`. Sonst koennte jeder das erste
 * Feld auf `owner` aendern und behielte eine gueltige Signatur. Der
 * Probelauf faehrt genau diesen Angriff.
 *
 * Alte Sitzungen (zwei Felder) werden ungueltig. Das ist beabsichtigt, und
 * die Kosten sind eine Anmeldung: Einer Sitzung ohne Rolle koennte man nur
 * eine raten, und geraten wird hier nichts.
 */
export async function issueSession(rolle: Rolle, now = Date.now()): Promise<string | null> {
  const s = secret()
  if (!s) return null
  const expiresAt = String(now + SESSION_MS)
  const nutzlast = `${rolle}.${expiresAt}`
  return `${nutzlast}.${await sign(nutzlast, s)}`
}

export type SessionVerdict = "ok" | "missing" | "invalid" | "expired" | "unavailable"

export type SessionErgebnis = { verdict: SessionVerdict; rolle: Rolle | null }

export async function verifySession(
  value: unknown,
  now = Date.now(),
): Promise<SessionErgebnis> {
  const s = secret()
  if (!s) return { verdict: "unavailable", rolle: null }
  if (typeof value !== "string" || value.length === 0) return { verdict: "missing", rolle: null }
  /* Eine Obergrenze, damit ein langer Wert nicht erst signiert wird. */
  if (value.length > 200) return { verdict: "invalid", rolle: null }

  const teile = value.split(".")
  if (teile.length !== 3) return { verdict: "invalid", rolle: null }
  const [rolle, expiresAt, signature] = teile
  if (!istRolle(rolle)) return { verdict: "invalid", rolle: null }
  if (!/^\d+$/.test(expiresAt)) return { verdict: "invalid", rolle: null }

  /*
   * Erst die Signatur, dann die Zeit. Andersherum würde ein abgelaufener,
   * aber gefälschter Wert dieselbe Antwort bekommen wie ein abgelaufener
   * echter — und damit verraten, dass die Fälschung an der Zeit scheiterte.
   */
  if (!equal(signature, await sign(`${rolle}.${expiresAt}`, s))) {
    return { verdict: "invalid", rolle: null }
  }
  if (Number(expiresAt) < now) return { verdict: "expired", rolle: null }
  return { verdict: "ok", rolle }
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
