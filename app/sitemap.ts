import type { MetadataRoute } from "next"
import { publishedServicePages } from "@/lib/service-pages"

/**
 * Domain-ready wie die Canonicals: eine Variable steuert alles.
 * Rechtsseiten stehen bewusst mit niedriger Priorität drin — sie sollen
 * auffindbar, aber nicht prominent sein (robots-noindex bleibt bestehen).
 *
 * Die Leistungsseiten kommen aus derselben Quelle wie die Routen selbst:
 * Wird eine auf `published: false` gesetzt, verschwindet sie automatisch aus
 * Routing UND Sitemap — keine Sitemap, die auf 404 zeigt.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    ...publishedServicePages.map((page) => ({
      url: `${SITE_URL}/leistungen/${page.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/termin`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ]
}
