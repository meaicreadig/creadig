import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

import { neonAbfrage, tabelleFehlt } from "@/lib/neon-abfrage"

/* Nur diese Adresse ist in der LinkedIn-App hinterlegt. Die Verbindung klappt deshalb nur auf creadig.de. */
export const LINKEDIN_REDIRECT = "https://creadig.de/api/linkedin/callback"
export const LINKEDIN_STATE_COOKIE = "cd_li_state"
const SCOPE = "openid profile w_member_social"

export type LinkedinStatus =
  | { verbunden: false; konfiguriert: boolean }
  | { verbunden: true; konfiguriert: true; name: string; laeuftAb: string | null }

type Verbindung = { personUrn: string; name: string; token: string; laeuftAb: Date | null }

function clientDaten() {
  const id = process.env.LINKEDIN_CLIENT_ID?.trim()
  const secret = process.env.LINKEDIN_CLIENT_SECRET?.trim()
  return id && secret ? { id, secret } : null
}

function schluessel(): Buffer | null {
  const geheim = process.env.ADMIN_SESSION_SECRET?.trim()
  return geheim ? createHash("sha256").update(`linkedin:${geheim}`).digest() : null
}

function verschluesseln(klartext: string): string | null {
  const key = schluessel()
  if (!key) return null
  const iv = randomBytes(12)
  const c = createCipheriv("aes-256-gcm", key, iv)
  const daten = Buffer.concat([c.update(klartext, "utf8"), c.final()])
  return [iv, c.getAuthTag(), daten].map((b) => b.toString("base64url")).join(".")
}

function entschluesseln(paket: string): string | null {
  const key = schluessel()
  const [iv, tag, daten] = paket.split(".").map((t) => Buffer.from(t, "base64url"))
  if (!key || !iv || !tag || !daten) return null
  try {
    const d = createDecipheriv("aes-256-gcm", key, iv)
    d.setAuthTag(tag)
    return Buffer.concat([d.update(daten), d.final()]).toString("utf8")
  } catch {
    return null
  }
}

export function neuerState(): string {
  return randomBytes(24).toString("base64url")
}

export function autorisierungsUrl(state: string): string | null {
  const client = clientDaten()
  if (!client) return null
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization")
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", client.id)
  url.searchParams.set("redirect_uri", LINKEDIN_REDIRECT)
  url.searchParams.set("state", state)
  url.searchParams.set("scope", SCOPE)
  return url.toString()
}

export async function codeEinloesen(code: string): Promise<boolean> {
  const client = clientDaten()
  const q = neonAbfrage()
  if (!client || !q) return false

  const tokenAntwort = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: LINKEDIN_REDIRECT,
      client_id: client.id,
      client_secret: client.secret,
    }),
    cache: "no-store",
  })
  if (!tokenAntwort.ok) return false
  const token = (await tokenAntwort.json()) as { access_token?: string; expires_in?: number }
  if (!token.access_token) return false

  const profilAntwort = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  })
  if (!profilAntwort.ok) return false
  const profil = (await profilAntwort.json()) as { sub?: string; name?: string }
  if (!profil.sub) return false

  const verschluesselt = verschluesseln(token.access_token)
  if (!verschluesselt) return false
  const laeuftAb = token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null

  await q(
    `INSERT INTO linkedin_connection (id, person_urn, name, token_enc, expires_at, updated_at)
     VALUES (1, $1, $2, $3, $4, now())
     ON CONFLICT (id) DO UPDATE SET person_urn = EXCLUDED.person_urn, name = EXCLUDED.name,
       token_enc = EXCLUDED.token_enc, expires_at = EXCLUDED.expires_at, updated_at = now()`,
    [`urn:li:person:${profil.sub}`, profil.name ?? "LinkedIn", verschluesselt, laeuftAb],
  )
  return true
}

async function ladeVerbindung(): Promise<Verbindung | null> {
  const q = neonAbfrage()
  if (!q) return null
  try {
    const [zeile] = await q(`SELECT person_urn, name, token_enc, expires_at FROM linkedin_connection WHERE id = 1`, [])
    if (!zeile) return null
    const token = entschluesseln(String(zeile.token_enc))
    if (!token) return null
    const laeuftAb = zeile.expires_at ? new Date(String(zeile.expires_at)) : null
    if (laeuftAb && laeuftAb.getTime() < Date.now()) return null
    return { personUrn: String(zeile.person_urn), name: String(zeile.name), token, laeuftAb }
  } catch (error) {
    if (tabelleFehlt(error, "linkedin_connection")) return null
    throw error
  }
}

export async function linkedinStatus(): Promise<LinkedinStatus> {
  const konfiguriert = clientDaten() !== null
  const v = konfiguriert ? await ladeVerbindung().catch(() => null) : null
  if (!v) return { verbunden: false, konfiguriert }
  return { verbunden: true, konfiguriert: true, name: v.name, laeuftAb: v.laeuftAb?.toISOString() ?? null }
}

export async function verbindungTrennen(): Promise<void> {
  const q = neonAbfrage()
  if (q) await q(`DELETE FROM linkedin_connection WHERE id = 1`, [])
}

/* LinkedIn liest den Text als „little text“: diese Zeichen muessen maskiert werden, sonst bricht der Beitrag ab. */
function alsLittleText(text: string): string {
  return text
    .split(/(#[\p{L}\p{N}_]+)/u)
    .map((teil) =>
      /^#[\p{L}\p{N}_]+$/u.test(teil)
        ? `{hashtag|\\#|${teil.slice(1)}}`
        : teil.replace(/[\\|{}@[\]()<>#*_~]/g, (z) => `\\${z}`),
    )
    .join("")
}

/* Die REST-API verlangt eine Monatsversion; Versionen laufen nach etwa einem Jahr aus. */
function apiVersion(jetzt = new Date()): string {
  const d = new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth() - 2, 1))
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

export type VeroeffentlichungsErgebnis = { ok: true; url: string | null } | { ok: false; grund: "nicht-verbunden" | "abgelehnt" }

export async function aufLinkedinVeroeffentlichen(text: string): Promise<VeroeffentlichungsErgebnis> {
  const v = await ladeVerbindung()
  if (!v) return { ok: false, grund: "nicht-verbunden" }

  const antwort = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${v.token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": apiVersion(),
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: v.personUrn,
      commentary: alsLittleText(text),
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
    cache: "no-store",
  })

  if (antwort.status === 401) return { ok: false, grund: "nicht-verbunden" }
  if (!antwort.ok) {
    console.error("LinkedIn-Veroeffentlichung abgelehnt", antwort.status, (await antwort.text()).slice(0, 300))
    return { ok: false, grund: "abgelehnt" }
  }
  const urn = antwort.headers.get("x-restli-id")
  return { ok: true, url: urn ? `https://www.linkedin.com/feed/update/${urn}/` : null }
}
