import "server-only"

import type { Insight, InsightBlock, InsightCategoryKey } from "@/lib/insights"
import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

export type Zwei = { de: string; tr: string }
export type ArtikelBlock =
  | { kind: "heading" | "text" | "note"; text: Zwei }
  | { kind: "list"; items: { de: string[]; tr: string[] } }

export type ArtikelZustand = "entwurf" | "veroeffentlicht" | "verworfen"

export type Artikel = {
  slug: string
  kategorie: InsightCategoryKey
  datum: string
  zustand: ArtikelZustand
  topic: Zwei
  titel: Zwei
  teaser: Zwei
  metaTitel: Zwei
  body: ArtikelBlock[]
  linkedin: string
  /** Fokus-Keyword für Google; ältere Artikel haben keins. */
  keyword: string | null
  metaBeschreibung: Zwei | null
  /** Titelbild im privaten Blob; öffentlich nur über /api/insights/bild/[slug]. */
  bildPfad: string | null
  bildAlt: Zwei | null
  quelleName: string | null
  quelleUrl: string | null
  bulletinRef: string | null
  erstelltAm: string
  veroeffentlichtAm: string | null
}

/** Nur diese beiden Sprachen bekommen KI-Artikel – EN/AR zeigen nur gepflegte Notizen. */
export const ARTIKEL_SPRACHEN = ["de", "tr"] as const

let bereit: Promise<void> | null = null

function schema(db: Abfrage): Promise<void> {
  bereit ??= db(
    `CREATE TABLE IF NOT EXISTS web_artikel (
      slug text PRIMARY KEY,
      kategorie text NOT NULL,
      datum date NOT NULL DEFAULT CURRENT_DATE,
      zustand text NOT NULL DEFAULT 'entwurf',
      daten jsonb NOT NULL,
      quelle_name text,
      quelle_url text,
      bulletin_ref text UNIQUE,
      erstellt_at timestamptz NOT NULL DEFAULT now(),
      veroeffentlicht_at timestamptz
    )`,
    [],
  )
    .then(() => undefined)
    .catch((e) => {
      bereit = null
      throw e
    })
  return bereit
}

async function db(): Promise<Abfrage | null> {
  const q = neonAbfrage()
  if (!q) return null
  await schema(q)
  return q
}

function zeile(r: Record<string, unknown>): Artikel {
  const d = r.daten as Pick<Artikel, "topic" | "titel" | "teaser" | "metaTitel" | "body" | "linkedin"> & Partial<Pick<Artikel, "bildPfad" | "bildAlt" | "keyword" | "metaBeschreibung">>
  return {
    slug: String(r.slug),
    kategorie: r.kategorie as InsightCategoryKey,
    datum: new Date(String(r.datum)).toISOString().slice(0, 10),
    zustand: r.zustand as ArtikelZustand,
    ...d,
    bildPfad: d.bildPfad ?? null,
    bildAlt: d.bildAlt ?? null,
    keyword: d.keyword ?? null,
    metaBeschreibung: d.metaBeschreibung ?? null,
    quelleName: (r.quelle_name as string) ?? null,
    quelleUrl: (r.quelle_url as string) ?? null,
    bulletinRef: (r.bulletin_ref as string) ?? null,
    erstelltAm: new Date(String(r.erstellt_at)).toISOString(),
    veroeffentlichtAm: r.veroeffentlicht_at ? new Date(String(r.veroeffentlicht_at)).toISOString() : null,
  }
}

export async function bulletinRefBekannt(ref: string): Promise<boolean> {
  const q = await db()
  if (!q) return false
  return (await q(`SELECT 1 FROM web_artikel WHERE bulletin_ref = $1`, [ref])).length > 0
}

export async function speichereEntwurf(a: Omit<Artikel, "zustand" | "erstelltAm" | "veroeffentlichtAm" | "datum" | "bildPfad" | "bildAlt">): Promise<string> {
  const q = await db()
  if (!q) throw new Error("Keine Datenbank")
  let slug = a.slug
  for (let i = 2; (await q(`SELECT 1 FROM web_artikel WHERE slug = $1`, [slug])).length > 0; i++) slug = `${a.slug}-${i}`
  const daten = { topic: a.topic, titel: a.titel, teaser: a.teaser, metaTitel: a.metaTitel, body: a.body, linkedin: a.linkedin, keyword: a.keyword, metaBeschreibung: a.metaBeschreibung }
  await q(
    `INSERT INTO web_artikel (slug, kategorie, daten, quelle_name, quelle_url, bulletin_ref) VALUES ($1, $2, $3::jsonb, $4, $5, $6)`,
    [slug, a.kategorie, JSON.stringify(daten), a.quelleName, a.quelleUrl, a.bulletinRef],
  )
  return slug
}

export async function ladeArtikelListe(zustand?: ArtikelZustand): Promise<Artikel[]> {
  const q = await db().catch(() => null)
  if (!q) return []
  const rows = zustand
    ? await q(`SELECT * FROM web_artikel WHERE zustand = $1 ORDER BY erstellt_at DESC LIMIT 100`, [zustand])
    : await q(`SELECT * FROM web_artikel WHERE zustand <> 'verworfen' ORDER BY erstellt_at DESC LIMIT 100`, [])
  return rows.map(zeile)
}

export async function ladeArtikel(slug: string): Promise<Artikel | null> {
  const q = await db().catch(() => null)
  if (!q) return null
  const rows = await q(`SELECT * FROM web_artikel WHERE slug = $1`, [slug])
  return rows[0] ? zeile(rows[0]) : null
}

export async function setzeBild(slug: string, bildPfad: string, bildAlt: Zwei): Promise<void> {
  const q = await db()
  if (!q) throw new Error("Keine Datenbank")
  await q(`UPDATE web_artikel SET daten = daten || $2::jsonb WHERE slug = $1`, [slug, JSON.stringify({ bildPfad, bildAlt })])
}

/** Veröffentlichte Artikel ohne Titelbild — die ältesten zuerst. */
export async function artikelOhneBild(n: number): Promise<Artikel[]> {
  const q = await db().catch(() => null)
  if (!q) return []
  const rows = await q(
    `SELECT * FROM web_artikel WHERE zustand <> 'verworfen' AND coalesce(daten->>'bildPfad', '') = '' ORDER BY erstellt_at LIMIT $1`,
    [n],
  )
  return rows.map(zeile)
}

export async function setzeZustand(slug: string, zustand: ArtikelZustand): Promise<void> {
  const q = await db()
  if (!q) throw new Error("Keine Datenbank")
  await q(
    `UPDATE web_artikel SET zustand = $2,
       veroeffentlicht_at = CASE WHEN $2 = 'veroeffentlicht' THEN now() ELSE veroeffentlicht_at END,
       datum = CASE WHEN $2 = 'veroeffentlicht' THEN CURRENT_DATE ELSE datum END
     WHERE slug = $1`,
    [slug, zustand],
  )
}

const voll = (z: Zwei) => ({ de: z.de, tr: z.tr, en: z.de, ar: z.de })

/** Bringt einen DB-Artikel in die Form der gepflegten Insights, damit dieselbe Seite ihn zeigt. */
export function alsInsight(a: Artikel): Insight {
  const body: InsightBlock[] = a.body.map((b) =>
    b.kind === "list"
      ? { kind: "list", items: { de: b.items.de, tr: b.items.tr, en: b.items.de, ar: b.items.de } }
      : { kind: b.kind, text: voll(b.text) },
  )
  return {
    slug: a.slug,
    category: a.kategorie,
    date: a.datum,
    topic: voll(a.topic),
    title: voll(a.titel),
    teaser: voll(a.teaser),
    metaTitle: voll(a.metaTitel),
    body,
    ...(a.metaBeschreibung ? { metaDescription: voll(a.metaBeschreibung) } : {}),
    ...(a.keyword ? { keyword: a.keyword } : {}),
    ...(a.bildPfad ? { bild: { src: `/api/insights/bild/${a.slug}`, alt: voll(a.bildAlt ?? a.titel) } } : {}),
    zustand: "veroeffentlicht",
    belege: [],
    nachfrage: null,
  }
}

export async function veroeffentlichteInsights(): Promise<Insight[]> {
  return (await ladeArtikelListe("veroeffentlicht")).map(alsInsight)
}
