import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

import { rolleFuerPasswort } from "@/lib/admin-session"
import { neonClient } from "@/lib/neon-client"
import { istRolle, type Rolle } from "@/lib/rollen"

/**
 * Admin-Konten: Anmeldung mit E-Mail + Passwort.
 *
 * Erste Anmeldung (noch kein Konto): E-Mail + eine Rollen-Variable (z. B.
 * `ADMIN_PASSWORD`) legt das Konto mit dieser Rolle an. Ab dann gilt
 * E-Mail + eigenes Passwort. Die Rollen-Variable bleibt Notschlüssel — aber
 * nur zusammen mit der E-Mail eines bestehenden Kontos derselben Rolle, damit
 * niemand mit ihr ein zusätzliches Konto anlegen kann.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>
const KEYLEN = 64

export async function hashPasswort(passwort: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scrypt(passwort, salt, KEYLEN)
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`
}

async function passwortStimmt(passwort: string, gespeichert: string): Promise<boolean> {
  const [verfahren, saltHex, hashHex] = gespeichert.split("$")
  if (verfahren !== "scrypt" || !saltHex || !hashHex) return false
  const erwartet = Buffer.from(hashHex, "hex")
  const ist = await scrypt(passwort, Buffer.from(saltHex, "hex"), erwartet.length)
  return ist.length === erwartet.length && timingSafeEqual(ist, erwartet)
}

function db() {
  const url = process.env.DATABASE_URL
  return url ? neonClient(url).sql : null
}

export function normalisiereEmail(input: unknown): string | null {
  if (typeof input !== "string") return null
  const email = input.trim().toLowerCase()
  if (email.length < 5 || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

type KontoZeile = { email: string; rolle: string; password_hash: string }

/**
 * Gibt die Rolle zurück oder null. Eine Antwort für alle Fehlschläge —
 * unbekannte E-Mail und falsches Passwort sind von außen nicht zu unterscheiden.
 */
export async function anmeldenMitEmail(emailRoh: unknown, passwortRoh: unknown): Promise<Rolle | null> {
  const email = normalisiereEmail(emailRoh)
  if (!email || typeof passwortRoh !== "string" || passwortRoh.length === 0 || passwortRoh.length > 500) {
    return null
  }
  const passwort = passwortRoh
  const sql = db()
  if (!sql) return null

  const zeilen = (await sql.query(
    "SELECT email, rolle, password_hash FROM admin_users WHERE email = $1",
    [email],
  )) as KontoZeile[]
  const konto = zeilen[0]

  if (konto) {
    if (!istRolle(konto.rolle)) return null
    const ok =
      (await passwortStimmt(passwort, konto.password_hash)) || rolleFuerPasswort(passwort) === konto.rolle
    if (!ok) return null
    await sql.query("UPDATE admin_users SET last_login_at = now() WHERE email = $1", [email])
    return konto.rolle
  }

  /* Kein Konto mit dieser E-Mail: nur die allererste Anmeldung darf eines anlegen. */
  const anzahl = (await sql.query("SELECT count(*)::int AS n FROM admin_users")) as { n: number }[]
  if ((anzahl[0]?.n ?? 0) > 0) {
    await passwortStimmt(passwort, "scrypt$00$00").catch(() => false)
    return null
  }
  const rolle = rolleFuerPasswort(passwort)
  if (rolle !== "owner") return null
  await sql.query(
    "INSERT INTO admin_users (email, rolle, password_hash, last_login_at) VALUES ($1, $2, $3, now()) ON CONFLICT (email) DO NOTHING",
    [email, rolle, await hashPasswort(passwort)],
  )
  return rolle
}

export async function hatKonten(): Promise<boolean> {
  const sql = db()
  if (!sql) return false
  try {
    const r = (await sql.query("SELECT count(*)::int AS n FROM admin_users")) as { n: number }[]
    return (r[0]?.n ?? 0) > 0
  } catch {
    return false
  }
}
