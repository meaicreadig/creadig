import "server-only"

import { get } from "@vercel/blob"

import { ladeLinkedin, speichereLinkedin } from "./store"

const SCOPE = "openid profile w_member_social"

/** LinkedIn-REST verlangt eine Monatsversion; Versionen laufen nach ~1 Jahr ab, daher immer drei Monate zurück. */
function apiVersion(): string {
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() - 3)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

export const linkedinBereit = () => Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)

export const rueckrufUrl = (origin: string) => `${origin}/api/linkedin/callback`

export function anmeldeUrl(origin: string, state: string): string {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
    redirect_uri: rueckrufUrl(origin),
    state,
    scope: SCOPE,
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${p}`
}

export async function verbindeMitCode(code: string, origin: string): Promise<void> {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: rueckrufUrl(origin),
      client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
      client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
    }),
  })
  if (!res.ok) throw new Error(`LinkedIn-Token: ${res.status} ${(await res.text()).slice(0, 200)}`)
  const token = (await res.json()) as { access_token: string; expires_in: number }

  const ich = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!ich.ok) throw new Error(`LinkedIn-Profil: ${ich.status}`)
  const profil = (await ich.json()) as { sub: string; name?: string }

  await speichereLinkedin({
    accessToken: token.access_token,
    personUrn: `urn:li:person:${profil.sub}`,
    name: profil.name ?? null,
    gueltigSek: token.expires_in,
  })
}

/** LinkedIn "little text": diese Zeichen müssen maskiert werden, sonst wird der Post abgeschnitten. Hashtags bleiben. */
const maskiere = (t: string) => t.replace(/[\\|{}@[\]()<>*_~]/g, (z) => `\\${z}`)

function kopf(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "LinkedIn-Version": apiVersion(),
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  }
}

async function ladeBildHoch(token: string, owner: string, bildPfad: string): Promise<string> {
  const init = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: kopf(token),
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
  })
  if (!init.ok) throw new Error(`Bild-Upload vorbereiten: ${init.status} ${(await init.text()).slice(0, 200)}`)
  const { value } = (await init.json()) as { value: { uploadUrl: string; image: string } }

  const blob = await get(bildPfad, { access: "private" })
  if (!blob?.stream) throw new Error("Bild nicht im Speicher")
  const bytes = await new Response(blob.stream).arrayBuffer()
  const put = await fetch(value.uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
    body: bytes,
  })
  if (!put.ok) throw new Error(`Bild-Upload: ${put.status}`)
  return value.image
}

export async function veroeffentliche(p: { text: string; bildPfad: string | null; alt?: string }): Promise<string> {
  const v = await ladeLinkedin()
  if (!v) throw new Error("LinkedIn ist nicht verbunden")
  const bild = p.bildPfad ? await ladeBildHoch(v.accessToken, v.personUrn, p.bildPfad) : null

  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: kopf(v.accessToken),
    body: JSON.stringify({
      author: v.personUrn,
      commentary: maskiere(p.text).slice(0, 2900),
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      ...(bild ? { content: { media: { id: bild, altText: (p.alt ?? "").slice(0, 300) } } } : {}),
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  })
  if (!res.ok) throw new Error(`Post: ${res.status} ${(await res.text()).slice(0, 200)}`)
  return res.headers.get("x-restli-id") ?? res.headers.get("x-linkedin-id") ?? "veröffentlicht"
}
