import "server-only"

import { createSign } from "node:crypto"

/*
 * Google Search Console — nur lesend, über ein Dienstkonto (kein Login-Fenster nötig).
 * Env: GOOGLE_SERVICE_ACCOUNT_JSON = kompletter Inhalt der JSON-Schlüsseldatei.
 * Optional GSC_SITE (z. B. "sc-domain:creadig.de"); sonst wird die erste bestätigte Property genommen.
 */

type Dienstkonto = { client_email: string; private_key: string }

export type SeoZeile = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }
export type SeoSumme = { klicks: number; impressionen: number; ctr: number; position: number }

export type SeoBericht =
  | { status: "nicht_verbunden" }
  | { status: "fehler"; meldung: string; dienstkonto?: string }
  | {
      status: "ok"
      site: string
      bis: string
      jetzt: SeoSumme
      vorher: SeoSumme
      tage: { datum: string; klicks: number; impressionen: number }[]
      suchanfragen: SeoZeile[]
      seiten: SeoZeile[]
      geraete: SeoZeile[]
      laender: SeoZeile[]
      chancen: SeoZeile[]
    }

function dienstkonto(): Dienstkonto | null {
  const roh = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!roh) return null
  try {
    const j = JSON.parse(roh) as Partial<Dienstkonto>
    if (!j.client_email || !j.private_key) return null
    return { client_email: j.client_email, private_key: j.private_key.replace(/\\n/g, "\n") }
  } catch {
    return null
  }
}

export function seoVerbunden(): boolean {
  return dienstkonto() !== null
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url")

let token: { wert: string; bis: number } | null = null

async function zugriffstoken(k: Dienstkonto): Promise<string> {
  if (token && token.bis > Date.now() + 60_000) return token.wert
  const jetzt = Math.floor(Date.now() / 1000)
  const kopf = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const inhalt = b64(
    JSON.stringify({
      iss: k.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: jetzt,
      exp: jetzt + 3600,
    }),
  )
  const signatur = createSign("RSA-SHA256").update(`${kopf}.${inhalt}`).sign(k.private_key)
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${kopf}.${inhalt}.${b64(signatur)}`,
    }),
    cache: "no-store",
  })
  const j = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string }
  if (!res.ok || !j.access_token) throw new Error(j.error_description || `Google-Anmeldung fehlgeschlagen (${res.status})`)
  token = { wert: j.access_token, bis: Date.now() + (j.expires_in ?? 3600) * 1000 }
  return j.access_token
}

async function googleGet<T>(pfad: string, t: string): Promise<T> {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3${pfad}`, {
    headers: { authorization: `Bearer ${t}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Search Console ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json() as Promise<T>
}

async function abfrage(t: string, site: string, body: Record<string, unknown>): Promise<SeoZeile[]> {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${t}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Search Console ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const j = (await res.json()) as { rows?: SeoZeile[] }
  return j.rows ?? []
}

const tag = (d: Date) => d.toISOString().slice(0, 10)
function vorTagen(n: number, ab = new Date()) {
  const d = new Date(ab)
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

function summe(zeilen: SeoZeile[]): SeoSumme {
  const z = zeilen[0]
  return z
    ? { klicks: z.clicks, impressionen: z.impressions, ctr: z.ctr, position: z.position }
    : { klicks: 0, impressionen: 0, ctr: 0, position: 0 }
}

export async function ladeSeoBericht(): Promise<SeoBericht> {
  const k = dienstkonto()
  if (!k) return { status: "nicht_verbunden" }
  try {
    const t = await zugriffstoken(k)
    let site = process.env.GSC_SITE
    if (!site) {
      const liste = await googleGet<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>("/sites", t)
      const eintraege = (liste.siteEntry ?? []).filter((s) => s.permissionLevel !== "siteUnverifiedUser")
      site = (eintraege.find((s) => s.siteUrl.includes("creadig")) ?? eintraege[0])?.siteUrl
    }
    if (!site) {
      return {
        status: "fehler",
        meldung: "Das Dienstkonto sieht noch keine Property. Füge es in der Search Console als Nutzer hinzu.",
        dienstkonto: k.client_email,
      }
    }

    // Google liefert Daten mit ~2 Tagen Verzug.
    const bis = vorTagen(2)
    const von = vorTagen(27, bis)
    const vorherBis = vorTagen(1, von)
    const vorherVon = vorTagen(27, vorherBis)
    const zeitraum = { startDate: tag(von), endDate: tag(bis) }

    const [jetzt, vorher, tage, suchanfragen, seiten, geraete, laender] = await Promise.all([
      abfrage(t, site, zeitraum),
      abfrage(t, site, { startDate: tag(vorherVon), endDate: tag(vorherBis) }),
      abfrage(t, site, { startDate: tag(vorTagen(89, bis)), endDate: tag(bis), dimensions: ["date"], rowLimit: 100 }),
      abfrage(t, site, { ...zeitraum, dimensions: ["query"], rowLimit: 250 }),
      abfrage(t, site, { ...zeitraum, dimensions: ["page"], rowLimit: 20 }),
      abfrage(t, site, { ...zeitraum, dimensions: ["device"] }),
      abfrage(t, site, { ...zeitraum, dimensions: ["country"], rowLimit: 8 }),
    ])

    // Chancen: Google zeigt uns schon (Impressionen), aber knapp hinter Platz 1–3 oder kaum geklickt.
    const chancen = suchanfragen
      .filter((z) => z.impressions >= 15 && z.position >= 4 && z.position <= 20)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 8)

    return {
      status: "ok",
      site,
      bis: tag(bis),
      jetzt: summe(jetzt),
      vorher: summe(vorher),
      tage: tage.map((z) => ({ datum: z.keys[0], klicks: z.clicks, impressionen: z.impressions })),
      suchanfragen: suchanfragen.slice(0, 15),
      seiten,
      geraete,
      laender,
      chancen,
    }
  } catch (e) {
    return { status: "fehler", meldung: e instanceof Error ? e.message : String(e), dienstkonto: k.client_email }
  }
}
