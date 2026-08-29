/*
 * Kein `server-only`-Wächter: Das Paket ist keine Abhängigkeit dieses
 * Projekts, und diese Datei wird ausschliesslich von `app/api/lead/route.ts`
 * importiert — also nie in ein Browser-Bündel gezogen.
 */

/**
 * BF-2 / R-2 — Missbrauchsschutz für den einzigen Weg, auf dem eine Anfrage
 * hereinkommt.
 *
 * ---------------------------------------------------------------------------
 * WAS OFFEN LAG
 * `app/api/lead/route.ts` hatte genau eine Hürde: ein verstecktes Feld. Wer
 * das Feld kennt (und ein Skript, das JSON schickt, kennt es nach einem Blick
 * in den Quelltext), konnte die Route beliebig oft aufrufen. Zwei Folgen, beide
 * teuer:
 *
 *   1. Jeder Aufruf löst ZWEI Mails über Resend aus. Ein Skript, das eine
 *      Nacht durchläuft, verbrennt das Kontingent und die Rechnung.
 *   2. Die zweite Mail geht an die Adresse aus dem Formular — an eine fremde
 *      Adresse also, in unserem Namen, ohne dass der Empfänger je etwas
 *      angefragt hätte. Das ist Backscatter: Der Fremde meldet uns als Spam,
 *      und die Zustellbarkeit der eigenen Domain ist danach beschädigt. Genau
 *      die Domain, über die alle Angebote rausgehen.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER STEHT — UND WAS BEWUSST NICHT
 * Kein Captcha (gesperrt, und es kostet mehr echte Anfragen als es Bots
 * abhält). Keine Datenbank, kein zweiter Dienst. Zwei Mittel, beide ohne neue
 * Infrastruktur:
 *
 *   A) SIGNIERTES ZEIT-TOKEN. Das Formular holt sich beim Aufbau ein Token
 *      (`GET /api/lead`). Es enthält nur den Ausstellungszeitpunkt und eine
 *      HMAC-Signatur darüber. Beim Absenden muss es mitkommen, gültig sein
 *      und mindestens `MIN_AGE_MS` alt: Ein Mensch braucht zum Ausfüllen
 *      länger als zwei Sekunden, ein Skript, das direkt POSTet, hat gar kein
 *      Token. Der Server merkt sich dabei nichts — die Signatur trägt die
 *      Information selbst.
 *
 *   B) IP-FENSTER IM ARBEITSSPEICHER. Ehrliche Einordnung: Das gilt pro
 *      laufender Serverless-Instanz und ist nach einem Kaltstart wieder leer.
 *      Gegen einen verteilten Angriff hilft es nicht — gegen das, was hier
 *      realistisch passiert (ein Skript, eine Adresse, in Serie), hilft es
 *      sofort und kostet nichts. Ein belastbares Limit über alle Instanzen
 *      braucht einen geteilten Zähler (Upstash o. ä.); das ist ein
 *      Owner-Punkt, keine Zeile Code hier.
 *
 * Gespeichert wird nicht die IP, sondern ihr HMAC — im Arbeitsspeicher, für
 * die Dauer des Fensters. Wer den Speicherauszug liest, hält keine
 * Besucherliste in der Hand.
 */

import { equal, sign } from "@/lib/hmac"

/** Ohne eigenes Geheimnis leiten wir es vom Resend-Schlüssel ab. */
function secret(): string | null {
  return process.env.LEAD_TOKEN_SECRET || process.env.RESEND_API_KEY || null
}

/** Schneller als ein Mensch tippt = kein Mensch. */
const MIN_AGE_MS = 2_000
/** Nach zwei Stunden ist das Formular kalt — dann holt der Browser ein neues. */
const MAX_AGE_MS = 2 * 60 * 60 * 1000

/*
 * MP-G — die HMAC-Grundlage liegt seit der Admin-Sitzung in `lib/hmac.ts`.
 * Sie stand hier, solange es einen Nutzer gab; jetzt gibt es zwei, und zwei
 * Krypto-Implementierungen desselben Verfahrens laufen auseinander.
 * Verhalten unverändert — es war ein Umzug, keine Neufassung.
 */

/**
 * Ein Token für ein frisch gerendertes Formular. `null`, wenn kein Geheimnis
 * vorliegt — dann ist die Route ohnehin nicht zustellfähig.
 */
export async function issueFormToken(now: number): Promise<string | null> {
  const value = secret()
  if (!value) return null
  const issuedAt = String(now)
  return `${issuedAt}.${await sign(issuedAt, value)}`
}

export type TokenVerdict = "ok" | "missing" | "invalid" | "too_fast" | "expired" | "unavailable"

export async function verifyFormToken(token: unknown, now: number): Promise<TokenVerdict> {
  const value = secret()
  if (!value) return "unavailable"
  if (typeof token !== "string" || token.length === 0) return "missing"
  if (token.length > 200) return "invalid"

  const separator = token.indexOf(".")
  if (separator <= 0) return "invalid"

  const issuedAt = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  if (!/^\d{1,15}$/.test(issuedAt)) return "invalid"
  if (!equal(signature, await sign(issuedAt, value))) return "invalid"

  /*
    Erst nach der Signatur prüfen, nie davor: Ein Angreifer soll aus der
    Antwort nicht ablesen können, ob sein Zeitstempel passt, solange die
    Signatur nicht stimmt.
  */
  const age = now - Number(issuedAt)
  if (age < MIN_AGE_MS) return "too_fast"
  if (age > MAX_AGE_MS) return "expired"
  return "ok"
}

/* ── IP-Fenster ──────────────────────────────────────────────────────────── */

const WINDOW_MS = 10 * 60 * 1000
/** Abgeschickte Anfragen je Adresse und Fenster. */
const MAX_SUBMITS = 5
/** Ausgestellte Token je Adresse und Fenster — großzügiger, kostet nichts. */
const MAX_TOKENS = 30
/** Notbremse gegen unbegrenztes Wachstum der Karte. */
const MAX_TRACKED = 5_000

const buckets = new Map<string, number[]>()

/**
 * Die Adresse des Aufrufers, so wie Vercel sie durchreicht. Ohne Kopfzeile
 * (lokaler Aufruf, unbekannter Proxy) gilt ein gemeinsamer Schlüssel — das
 * Limit greift dann für alle zusammen, was lokal richtig und im Betrieb
 * unerheblich ist.
 */
export function callerAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

export async function bucketKey(scope: string, address: string): Promise<string> {
  const value = secret()
  // Ohne Geheimnis kein Hash — dann steht die Adresse nur im Arbeitsspeicher
  // dieser einen Instanz, und die Route stellt ohnehin nichts zu.
  if (!value) return `${scope}:${address}`
  return `${scope}:${await sign(`${scope}:${address}`, value)}`
}

/** `true` = darf durch. Der Aufruf zählt selbst mit. */
export function withinLimit(key: string, limit: number, now: number): boolean {
  const recent = (buckets.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS)

  if (recent.length >= limit) {
    buckets.set(key, recent)
    return false
  }

  recent.push(now)
  buckets.set(key, recent)

  // Aufräumen, damit die Karte nicht mit der Laufzeit der Instanz wächst.
  if (buckets.size > MAX_TRACKED) {
    for (const [entry, stamps] of buckets) {
      if (stamps.every((stamp) => now - stamp >= WINDOW_MS)) buckets.delete(entry)
    }
  }

  return true
}

export const LIMITS_INFO = { MIN_AGE_MS, MAX_AGE_MS, WINDOW_MS, MAX_SUBMITS, MAX_TOKENS }
