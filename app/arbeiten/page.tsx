import type { Metadata } from "next"
import { ArbeitenPageBody } from "@/components/pages/arbeiten-page-body"
import { dictionary } from "@/lib/dictionary"
import { registryWorks, workHref } from "@/lib/site-data"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"
const copy = dictionary.de.arbeitenPage

/**
 * Werkschau (PHASE A).
 *
 * Bis hierher war „Arbeiten" ein Anker auf der Startseite. Jetzt ist es eine
 * Adresse — mit Karten- und Registeransicht, Kundenfällen (gated) und
 * Bewertungen (gated).
 */
export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  alternates: { canonical: "/arbeiten" },
  openGraph: {
    title: `${copy.metaTitle} · creaDIG`,
    description: copy.metaDescription,
    url: "/arbeiten",
    type: "website",
  },
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Arbeiten", item: `${SITE_URL}/arbeiten` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.metaTitle,
    itemListElement: registryWorks.map((work, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: work.name,
      url: `${SITE_URL}${workHref(work)}`,
    })),
  },
]

export default function ArbeitenRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArbeitenPageBody />
    </>
  )
}
