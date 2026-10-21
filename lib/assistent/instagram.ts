import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

import { assistentDb } from "./store"

/*
 * Instagram API mit Instagram-Login (Meta). Braucht ein Business- oder
 * Creator-Konto und eine Meta-App mit dem Produkt „Instagram“.
 * Rechte: instagram_business_basic + instagram_business_content_publish.
 * Gespeichert in assistent_linkedin unter id 'instagram' (gleiche Spalten).
 */

const GRAPH = "https://graph.instagram.com/v23.0"
const ID = () => process.env.INSTAGRAM_APP_ID ?? ""
const SECRET = () => process.env.INSTAGRAM_APP_SECRET ?? ""

export const instagramBereit = () => Boolean(ID() && SECRET())
export const instagramRueckruf = (origin: string) => `${origin}/api/instagram/callback`

export function instagramAnmeldeUrl(origin: string, state: string): string {
  const p = new URLSearchParams({
    enable_fb_login: "0",
    force_authentication: "1",
    client_id: ID(),
    redirect_uri: instagramRueckruf(origin),
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_content_publish",
    state,
  })
  return `https://www.instagram.com/oauth/authorize?${p.toString()}`
}

export type InstagramVerbindung = { token: string; nutzerId: string; name: string | null; ablauf: Date }

async function speichere(v: { token: string; nutzerId: string; name: string | null; gueltigSek: number }) {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  await q(
    `INSERT INTO assistent_linkedin (id, access_token, person_urn, name, expires_at)
     VALUES ('instagram', $1, $2, $3, now() + make_interval(secs => $4))
     ON CONFLICT (id) DO UPDATE SET access_token = EXCLUDED.access_token, person_urn = EXCLUDED.person_urn,
       name = EXCLUDED.name, expires_at = EXCLUDED.expires_at, updated_at = now()`,
    [v.token, v.nutzerId, v.name, v.gueltigSek],
  )
}

/** Lädt die Verbindung und verlängert den 60-Tage-Schlüssel, wenn er in < 10 Tagen abläuft. */
export async function ladeInstagram(): Promise<InstagramVerbindung | null> {
  const q = await assistentDb()
  if (!q) return null
  const rows = (await q(
    `SELECT access_token, person_urn, name, expires_at FROM assistent_linkedin WHERE id = 'instagram' AND expires_at > now()`,
    [],
  )) as { access_token: string; person_urn: string; name: string | null; expires_at: string | Date }[]
  const r = rows[0]
  if (!r) return null
  const v: InstagramVerbindung = { token: r.access_token, nutzerId: r.person_urn, name: r.name, ablauf: new Date(r.expires_at) }
  if (v.ablauf.getTime() - Date.now() < 10 * 86_400_000) {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(v.token)}`,
      { signal: AbortSignal.timeout(8000) },
    ).catch(() => null)
    if (res?.ok) {
      const j = (await res.json()) as { access_token: string; expires_in: number }
      await speichere({ token: j.access_token, nutzerId: v.nutzerId, name: v.name, gueltigSek: j.expires_in })
      v.token = j.access_token
    }
  }
  return v
}

export async function verbindeInstagram(code: string, origin: string): Promise<void> {
  const kurz = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: ID(),
      client_secret: SECRET(),
      grant_type: "authorization_code",
      redirect_uri: instagramRueckruf(origin),
      code,
    }),
  })
  if (!kurz.ok) throw new Error(`Instagram Code-Tausch: ${kurz.status} ${(await kurz.text()).slice(0, 200)}`)
  const k = (await kurz.json()) as { access_token?: string; data?: { access_token: string }[] }
  const kurzToken = k.access_token ?? k.data?.[0]?.access_token
  if (!kurzToken) throw new Error("Instagram lieferte keinen Schlüssel")

  const lang = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(SECRET())}&access_token=${encodeURIComponent(kurzToken)}`,
  )
  if (!lang.ok) throw new Error(`Instagram Langzeit-Schlüssel: ${lang.status}`)
  const l = (await lang.json()) as { access_token: string; expires_in: number }

  const ich = await fetch(`${GRAPH}/me?fields=user_id,username&access_token=${encodeURIComponent(l.access_token)}`)
  if (!ich.ok) throw new Error(`Instagram Profil: ${ich.status}`)
  const p = (await ich.json()) as { user_id?: string; id?: string; username?: string }
  const nutzerId = p.user_id ?? p.id
  if (!nutzerId) throw new Error("Instagram-Konto ohne ID")
  await speichere({ token: l.access_token, nutzerId, name: p.username ? `@${p.username}` : null, gueltigSek: l.expires_in })
}

/* Instagram holt das Bild selbst ab – deshalb eine öffentliche, signierte Adresse statt des Admin-Bildes. */
const signatur = (id: string) =>
  createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? process.env.CRON_SECRET ?? "creadig").update(`ig:${id}`).digest("hex").slice(0, 32)

export const instagramBildUrl = (origin: string, id: string) =>
  `${origin}/api/instagram/bild/${encodeURIComponent(id)}?t=${signatur(id)}`

export function pruefeBildSignatur(id: string, t: string | null): boolean {
  if (!t) return false
  const a = Buffer.from(signatur(id))
  const b = Buffer.from(t)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function graph(pfad: string, token: string, felder: Record<string, string>) {
  const res = await fetch(`${GRAPH}/${pfad}`, {
    method: "POST",
    body: new URLSearchParams({ ...felder, access_token: token }),
  })
  const j = (await res.json().catch(() => ({}))) as { id?: string; error?: { message?: string } }
  if (!res.ok || !j.id) throw new Error(j.error?.message?.slice(0, 200) ?? `Instagram ${res.status}`)
  return j.id
}

/** Bild + Text als Beitrag. Rückgabe: Medien-ID und Link zum Beitrag. */
export async function veroeffentlicheInstagram(p: { freigabeId: string; text: string; origin: string }) {
  const v = await ladeInstagram()
  if (!v) throw new Error("Instagram ist nicht verbunden")
  const caption = p.text.replace(/\n{3,}/g, "\n\n").slice(0, 2200)
  const container = await graph(`${v.nutzerId}/media`, v.token, {
    image_url: instagramBildUrl(p.origin, p.freigabeId),
    caption,
  })

  for (let i = 0; i < 10; i++) {
    const s = await fetch(`${GRAPH}/${container}?fields=status_code&access_token=${encodeURIComponent(v.token)}`)
      .then((r) => r.json() as Promise<{ status_code?: string }>)
      .catch(() => ({ status_code: undefined }))
    if (s.status_code === "FINISHED") break
    if (s.status_code === "ERROR") throw new Error("Instagram konnte das Bild nicht verarbeiten")
    await new Promise((r) => setTimeout(r, 1500))
  }

  const medienId = await graph(`${v.nutzerId}/media_publish`, v.token, { creation_id: container })
  const link = await fetch(`${GRAPH}/${medienId}?fields=permalink&access_token=${encodeURIComponent(v.token)}`)
    .then((r) => r.json() as Promise<{ permalink?: string }>)
    .then((j) => j.permalink ?? null)
    .catch(() => null)
  return { medienId, link }
}
