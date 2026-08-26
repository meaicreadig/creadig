import type { Metadata } from "next"
import { SeoLandingPageBody } from "@/components/pages/seo-landing-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"
import { areaServed } from "@/lib/site-data"
import { landingService, type SeoLanding } from "@/lib/seo-landings"

/**
 * MP10-5 — die Route einer SEO-Landing.
 *
 * Sie wird NICHT ueber eine eigene `[slug]`-Route ausgeliefert, sondern ueber
 * die bestehende Catch-all-Route: Eine `[slug]`-Route unter der Wurzel haette
 * der Catch-all den Vorrang genommen, und damit jede unbekannte Adresse ihre
 * gebaute 404-Seite gekostet. Begruendung ausfuehrlich in `lib/seo-landings.ts`.
 */
export function seoLandingMetadata(locale: Locale, landing: SeoLanding): Metadata {
  return pageMetadata({
    locale,
    path: `/${landing.slug}`,
    title: landing.metaTitle[locale],
    description: landing.metaDescription[locale],
  })
}

/*
 * `ProfessionalService` — mit `areaServed` aus der Landing, nicht aus einer
 * Wunschliste. Steht dort eine Stadt, arbeiten wir dort auch; steht dort
 * nichts, gilt der Markt des Hauses.
 */
function jsonLd(locale: Locale, landing: SeoLanding) {
  const t = dictionary[locale]
  const service = landingService(landing)

  return [
    breadcrumbList(locale, [
      { name: t.nav.leistungen, path: "/leistungen" },
      { name: landing.h1[locale], path: `/${landing.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: landing.metaTitle[locale],
      description: landing.metaDescription[locale],
      inLanguage: locale,
      url: localeUrl(`/${landing.slug}`, locale),
      areaServed: landing.city ? [landing.city] : [...areaServed],
      ...(service
        ? {
            makesOffer: {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: service.h1[locale],
                url: localeUrl(`/leistungen/${service.slug}`, locale),
              },
            },
          }
        : {}),
    },
  ]
}

export function SeoLandingRoute({
  locale,
  landing,
}: {
  locale: Locale
  landing: SeoLanding
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale, landing)) }}
      />
      <SeoLandingPageBody landing={landing} />
    </>
  )
}
