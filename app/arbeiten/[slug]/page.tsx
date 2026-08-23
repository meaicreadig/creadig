import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArbeitPageBody } from "@/components/pages/arbeit-page-body"
import { approvedCaseStudies, clientWorks } from "@/lib/site-data"
import { jsonLdScript } from "@/lib/json-ld"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

/**
 * Detailseiten des Kundenwerks (PHASE A).
 *
 * Bewusst NUR Kundenwerk: Die eigenen Produkte haben ihre eigene Welt unter
 * `/produkte/[slug]`. Zwei Adressen für dieselbe Sache wären zwei Wahrheiten
 * — und für Suchmaschinen doppelter Inhalt.
 *
 * Eine ausführliche Fallbeschreibung hängt sich an, sobald zu diesem Slug
 * eine Case-Study mit `approved: true` vorliegt. Ohne Freigabe rendert die
 * Seite den belegten Teil und nennt den Grund für den Rest.
 */
function findWork(slug: string) {
  return clientWorks.find((w) => w.slug === slug)
}

export function generateStaticParams() {
  return clientWorks.map((work) => ({ slug: work.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const work = findWork(slug)
  if (!work) return {}

  const title = `${work.name} — ${work.sector}`
  return {
    title,
    description: work.what,
    alternates: { canonical: `/arbeiten/${work.slug}` },
    openGraph: {
      title: `${title} · creaDIG`,
      description: work.what,
      url: `/arbeiten/${work.slug}`,
      type: "article",
    },
  }
}

export default async function ArbeitRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const work = findWork(slug)
  if (!work) notFound()

  const study = approvedCaseStudies.find((c) => c.slug === work.slug) ?? null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Arbeiten", item: `${SITE_URL}/arbeiten` },
      {
        "@type": "ListItem",
        position: 3,
        name: work.name,
        item: `${SITE_URL}/arbeiten/${work.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ArbeitPageBody work={work} study={study} />
    </>
  )
}
