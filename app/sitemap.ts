import type { MetadataRoute } from "next"
import { publishedInsights } from "@/lib/insights"
import { publishedServicePages } from "@/lib/service-pages"
import { clientWorks, productWorks } from "@/lib/site-data"

/**
 * Domain-ready wie die Canonicals: eine Variable steuert alles.
 *
 * Die Sitemap bildet seit PHASE A die ganze Informations-Architektur ab —
 * fünf Bereiche plus die Detailseiten. Alle Listen kommen aus derselben
 * Quelle wie die Routen selbst: Wird eine Leistungsseite auf
 * `published: false` gesetzt oder ein Produkt entfernt, verschwindet sie
 * automatisch aus Routing UND Sitemap. Keine Sitemap, die auf 404 zeigt.
 *
 * `/insights` steht nur drin, wenn dort etwas veröffentlicht ist — eine leere
 * Seite gehört nicht in den Index (siehe lib/insights.ts).
 *
 * Rechtsseiten stehen bewusst mit niedriger Priorität drin: auffindbar, aber
 * nicht prominent.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },

    // Die fünf Bereiche der Firmen-Navigation.
    { url: `${SITE_URL}/leistungen`, changeFrequency: "monthly", priority: 0.9 },
    ...publishedServicePages.map((page) => ({
      url: `${SITE_URL}/leistungen/${page.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    { url: `${SITE_URL}/produkte`, changeFrequency: "monthly", priority: 0.9 },
    ...productWorks.map((product) => ({
      url: `${SITE_URL}/produkte/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    { url: `${SITE_URL}/arbeiten`, changeFrequency: "monthly", priority: 0.8 },
    ...clientWorks.map((work) => ({
      url: `${SITE_URL}/arbeiten/${work.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    { url: `${SITE_URL}/unternehmen`, changeFrequency: "monthly", priority: 0.8 },
    ...(publishedInsights.length > 0
      ? [{ url: `${SITE_URL}/insights`, changeFrequency: "weekly" as const, priority: 0.6 }]
      : []),

    { url: `${SITE_URL}/kontakt`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/termin`, changeFrequency: "monthly", priority: 0.8 },

    { url: `${SITE_URL}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ]
}
