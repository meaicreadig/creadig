import "server-only"

import type { Locale } from "@/lib/dictionary"
import { findInsight, publishedInsights, type Insight } from "@/lib/insights"

import { ARTIKEL_SPRACHEN, alsInsight, ladeArtikel, veroeffentlichteInsights } from "./store"

const mitArtikeln = (locale: Locale) => (ARTIKEL_SPRACHEN as readonly string[]).includes(locale)

/** Gepflegte Notizen + freigegebene Redaktionsartikel, neueste zuerst. EN/AR bekommen nur die gepflegten. */
export async function alleInsights(locale: Locale): Promise<Insight[]> {
  if (!mitArtikeln(locale)) return publishedInsights
  const db = await veroeffentlichteInsights().catch(() => [])
  const bekannt = new Set(publishedInsights.map((e) => e.slug))
  return [...publishedInsights, ...db.filter((e) => !bekannt.has(e.slug))].sort((a, b) => b.date.localeCompare(a.date))
}

export async function findeInsight(slug: string, locale: Locale): Promise<Insight | null> {
  const fest = findInsight(slug)
  if (fest) return fest
  if (!mitArtikeln(locale)) return null
  const a = await ladeArtikel(slug).catch(() => null)
  if (!a || a.zustand !== "veroeffentlicht") return null
  return alsInsight(a)
}
