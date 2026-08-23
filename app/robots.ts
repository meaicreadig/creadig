import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

/**
 * BF-5 — die internen Adressen stehen hier ausdruecklich drin.
 *
 * `/status` und `/api/selftest` antworten im Betrieb ohne Schluessel mit 404;
 * ein Crawler koennte sie also ohnehin nicht lesen. Der Eintrag ist trotzdem
 * richtig: Er haelt sie aus jedem Crawl-Budget heraus und dokumentiert, dass
 * es sie gibt — statt sich darauf zu verlassen, dass niemand raet.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/status", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
