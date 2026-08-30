import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SeoLandingRoute, seoLandingMetadata } from "@/app/_routes/seo-landing"
import { findSeoLanding, publishedSeoLandings } from "@/lib/seo-landings"

/**
 * BF-3 — das türkische Gegenstück: alles unter `/tr/…`, das es nicht gibt.
 *
 * MP10-5: Und dieselben SEO-Landings, in der türkischen Fassung. Sie haben
 * denselben Slug wie auf Deutsch — Slugs werden in diesem Projekt nicht
 * übersetzt (siehe `lib/routes.ts`), sonst wäre jeder Sprachwechsel eine
 * Tabelle, die jemand pflegen muss.
 */
export function generateStaticParams() {
  return publishedSeoLandings.map((landing) => ({ notfound: [landing.slug] }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ notfound?: string[] }>
}): Promise<Metadata> {
  const { notfound } = await params
  const landing = notfound?.length === 1 ? findSeoLanding(notfound[0]) : undefined
  if (!landing) return {}
  return seoLandingMetadata("tr", landing)
}

export default async function CatchAll({
  params,
}: {
  params: Promise<{ notfound?: string[] }>
}) {
  const { notfound } = await params
  const landing = notfound?.length === 1 ? findSeoLanding(notfound[0]) : undefined
  if (!landing) notFound()
  return <SeoLandingRoute locale="ar" landing={landing} />
}
