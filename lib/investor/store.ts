import "server-only"

import { randomBytes } from "node:crypto"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

export const INVESTOR_SPRACHEN = ["en", "ar", "de"] as const
export type InvestorSprache = (typeof INVESTOR_SPRACHEN)[number]

export type InvestorLink = {
  token: string
  name: string
  firma: string | null
  sprache: InvestorSprache
  zahlen: boolean
  erstelltAm: string
  gueltigBis: string | null
  widerrufenAm: string | null
  aufrufe: number
  zuletztAm: string | null
}

let bereit: Promise<void> | null = null

/* Die Tabelle legt sich selbst an: die Prod-DATABASE_URL ist "Sensitive" und von außen nicht migrierbar. */
function schema(db: Abfrage): Promise<void> {
  bereit ??= (async () => {
    await db(
      `CREATE TABLE IF NOT EXISTS investor_links (
        token text PRIMARY KEY,
        name text NOT NULL,
        firma text,
        sprache text NOT NULL DEFAULT 'en',
        zahlen boolean NOT NULL DEFAULT true,
        erstellt_am timestamptz NOT NULL DEFAULT now(),
        gueltig_bis timestamptz,
        widerrufen_am timestamptz,
        aufrufe integer NOT NULL DEFAULT 0,
        zuletzt_am timestamptz
      )`,
      [],
    )
  })().catch((e) => {
    bereit = null
    throw e
  })
  return bereit
}

async function db(): Promise<Abfrage | null> {
  const a = neonAbfrage()
  if (!a) return null
  await schema(a)
  return a
}

const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : null)

function zeile(r: Record<string, unknown>): InvestorLink {
  const sprache = String(r.sprache) as InvestorSprache
  return {
    token: String(r.token),
    name: String(r.name),
    firma: r.firma ? String(r.firma) : null,
    sprache: INVESTOR_SPRACHEN.includes(sprache) ? sprache : "en",
    zahlen: Boolean(r.zahlen),
    erstelltAm: iso(r.erstellt_am) ?? new Date().toISOString(),
    gueltigBis: iso(r.gueltig_bis),
    widerrufenAm: iso(r.widerrufen_am),
    aufrufe: Number(r.aufrufe ?? 0),
    zuletztAm: iso(r.zuletzt_am),
  }
}

export function istGueltig(l: InvestorLink): boolean {
  if (l.widerrufenAm) return false
  return !l.gueltigBis || new Date(l.gueltigBis).getTime() > Date.now()
}

export async function legeInvestorLinkAn(e: {
  name: string
  firma: string | null
  sprache: InvestorSprache
  zahlen: boolean
  tage: number
}): Promise<string | null> {
  const a = await db()
  if (!a) return null
  const token = randomBytes(24).toString("base64url")
  await a(
    `INSERT INTO investor_links (token, name, firma, sprache, zahlen, gueltig_bis)
     VALUES ($1, $2, $3, $4, $5, now() + ($6 || ' days')::interval)`,
    [token, e.name, e.firma, e.sprache, e.zahlen, String(e.tage)],
  )
  return token
}

export async function ladeInvestorLinks(): Promise<InvestorLink[]> {
  const a = await db()
  if (!a) return []
  const rows = await a(`SELECT * FROM investor_links ORDER BY erstellt_am DESC LIMIT 200`, [])
  return rows.map(zeile)
}

export async function ladeInvestorLink(token: string): Promise<InvestorLink | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null
  const a = await db()
  if (!a) return null
  const rows = await a(`SELECT * FROM investor_links WHERE token = $1`, [token])
  return rows[0] ? zeile(rows[0]) : null
}

/** Zählt den Aufruf und meldet, ob es der allererste war. */
export async function zaehleAufruf(token: string): Promise<{ erster: boolean }> {
  const a = await db()
  if (!a) return { erster: false }
  const rows = await a(
    `UPDATE investor_links SET aufrufe = aufrufe + 1, zuletzt_am = now() WHERE token = $1 RETURNING aufrufe`,
    [token],
  )
  return { erster: Number(rows[0]?.aufrufe ?? 0) === 1 }
}

export async function widerrufeInvestorLink(token: string): Promise<void> {
  const a = await db()
  if (!a) return
  await a(`UPDATE investor_links SET widerrufen_am = now() WHERE token = $1 AND widerrufen_am IS NULL`, [token])
}
