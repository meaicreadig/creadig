import "server-only"

import { get } from "@vercel/blob"

import { ladeLinkedin, speichereLinkedin, type LinkedinKanal } from "./store"

/*
 * Zwei LinkedIn-Apps, weil LinkedIn die "Community Management API" (Firmenseite)
 * nur als EINZIGES Produkt einer App zulässt:
 *  - inhaber: Sign In with OpenID + Share on LinkedIn → postet als Person
 *  - firma:   Community Management API → postet als creaDIG-Firmenseite
 */
const APPS: Record<LinkedinKanal, { id?: string; secret?: string; scope: string }> = {
  inhaber: {
    id: process.env.LINKEDIN_CLIENT_ID,
    secret: process.env.LINKEDIN_CLIENT_SECRET,
    scope: "openid profile w_member_social",
  },
  firma: {
    id: process.env.LINKEDIN_ORG_CLIENT_ID,
    secret: process.env.LINKEDIN_ORG_CLIENT_SECRET,
    scope: "r_organization_social w_organization_social rw_organization_admin",
  },
}

export const istKanal = (k: unknown): k is LinkedinKanal => k === "inhaber" || k === "firma"

/** LinkedIn-REST verlangt eine Monatsversion; Versionen laufen nach ~1 Jahr ab, daher immer drei Monate zurück. */
function apiVersion(): string {
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() - 3)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

export const linkedinBereit = (kanal: LinkedinKanal = "inhaber") => Boolean(APPS[kanal].id && APPS[kanal].secret)

export const rueckrufUrl = (origin: string) => `${origin}/api/linkedin/callback`

export function anmeldeUrl(origin: string, state: string, kanal: LinkedinKanal): string {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: APPS[kanal].id ?? "",
    redirect_uri: rueckrufUrl(origin),
    state,
    scope: APPS[kanal].scope,
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${p}`
}

function kopf(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "LinkedIn-Version": apiVersion(),
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  }
}

async function firmaDesNutzers(token: string): Promise<{ urn: string; name: string | null }> {
  const res = await fetch(
    "https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
    { headers: kopf(token) },
  )
  if (!res.ok) throw new Error(`LinkedIn-Firmenseiten: ${res.status} ${(await res.text()).slice(0, 200)}`)
  const { elements = [] } = (await res.json()) as { elements?: { organization: string }[] }
  const urns = elements.map((e) => e.organization).filter(Boolean)
  if (!urns.length) throw new Error("Kein Admin-Zugang zu einer LinkedIn-Firmenseite")

  let gewaehlt = { urn: urns[0], name: null as string | null }
  for (const urn of urns) {
    const id = urn.split(":").pop()
    const o = await fetch(`https://api.linkedin.com/rest/organizations/${id}`, { headers: kopf(token) })
    if (!o.ok) continue
    const { localizedName } = (await o.json()) as { localizedName?: string }
    if (urn === urns[0]) gewaehlt = { urn, name: localizedName ?? null }
    if (localizedName && /creadig/i.test(localizedName)) return { urn, name: localizedName }
  }
  return gewaehlt
}

export async function verbindeMitCode(code: string, origin: string, kanal: LinkedinKanal): Promise<void> {
  const app = APPS[kanal]
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: rueckrufUrl(origin),
      client_id: app.id ?? "",
      client_secret: app.secret ?? "",
    }),
  })
  if (!res.ok) throw new Error(`LinkedIn-Token: ${res.status} ${(await res.text()).slice(0, 200)}`)
  const token = (await res.json()) as { access_token: string; expires_in: number }

  if (kanal === "firma") {
    const firma = await firmaDesNutzers(token.access_token)
    await speichereLinkedin({ kanal, accessToken: token.access_token, personUrn: firma.urn, name: firma.name, gueltigSek: token.expires_in })
    return
  }

  const ich = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!ich.ok) throw new Error(`LinkedIn-Profil: ${ich.status}`)
  const profil = (await ich.json()) as { sub: string; name?: string }
  await speichereLinkedin({
    kanal,
    accessToken: token.access_token,
    personUrn: `urn:li:person:${profil.sub}`,
    name: profil.name ?? null,
    gueltigSek: token.expires_in,
  })
}

/** LinkedIn "little text": diese Zeichen müssen maskiert werden, sonst wird der Post abgeschnitten. Hashtags bleiben. */
const maskiere = (t: string) => t.replace(/[\\|{}@[\]()<>*_~]/g, (z) => `\\${z}`)

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

export async function veroeffentliche(p: {
  text: string
  bildPfad: string | null
  alt?: string
  kanal: LinkedinKanal
}): Promise<string> {
  const v = await ladeLinkedin(p.kanal)
  if (!v) throw new Error(p.kanal === "firma" ? "Firmenseite ist nicht verbunden" : "LinkedIn ist nicht verbunden")
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
