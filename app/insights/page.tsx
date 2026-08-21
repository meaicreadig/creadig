import type { Metadata } from "next"
import { InsightsPageBody } from "@/components/pages/insights-page-body"
import { dictionary } from "@/lib/dictionary"
import { publishedInsights } from "@/lib/insights"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"
const copy = dictionary.de.insightsPage

/**
 * System-Notes (PHASE A — Gerüst, Inhalte folgen vom Owner).
 *
 * Zur Indexierung: Solange nichts veröffentlicht ist, nimmt sich die Route
 * selbst aus dem Suchindex (`noindex, follow`) und aus der Sitemap. Eine leere
 * Seite in den Index zu schieben ist dünner Inhalt — und der schadet nicht nur
 * dieser Seite, sondern der Bewertung der ganzen Domain. Sobald der erste
 * Eintrag steht, schaltet die Seite ohne Code-Änderung auf `index` um.
 */
export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  alternates: { canonical: "/insights" },
  robots: publishedInsights.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
  openGraph: {
    title: `${copy.metaTitle} · creaDIG`,
    description: copy.metaDescription,
    url: "/insights",
    type: "website",
  },
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/insights` },
    ],
  },
  // Die Liste selbst steht nur in den Daten, wenn es sie gibt.
  ...(publishedInsights.length > 0
    ? [
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: copy.metaTitle,
          itemListElement: publishedInsights.map((entry, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: entry.title.de,
          })),
        },
      ]
    : []),
]

export default function InsightsRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InsightsPageBody />
    </>
  )
}
