import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ServicePageBody } from "@/components/service/service-page-body"
import { findServicePage, publishedServicePages } from "@/lib/service-pages"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { address } from "@/lib/site-data"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, localeUrl } from "@/lib/routes"

/**
 * Template-Route für die granularen Leistungsseiten (E-K4 · GROW-1).
 *
 * Alle Seiten werden zur Bauzeit statisch erzeugt; unveröffentlichte Slugs
 * existieren gar nicht erst (404 statt dünner Seite). Title, Description und
 * Canonical kommen je Seite aus `lib/service-pages.ts` — und zwar in der
 * Sprache der Route: `metaTitle.de` gegen `metaTitle.tr`. Die Übersetzungen
 * lagen dort seit dem ersten Tag; bis GROW-1 hat sie nur nie jemand gelesen,
 * weil das Server-HTML immer deutsch war.
 *
 * Der Slug bleibt in beiden Sprachen derselbe. Übersetzte Slugs wären
 * hübscher, aber sie machen aus jedem Sprachwechsel eine Übersetzungstabelle,
 * die jemand pflegen muss — und aus jedem vergessenen Eintrag einen 404.
 */
export function serviceStaticParams() {
  return publishedServicePages.map((page) => ({ slug: page.slug }))
}

export async function serviceMetadata(
  locale: Locale,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params
  const page = findServicePage(slug)
  if (!page) return {}

  return pageMetadata({
    locale,
    path: `/leistungen/${page.slug}`,
    title: page.metaTitle[locale],
    description: page.metaDescription[locale],
    type: "article",
  })
}

export async function ServiceRoute({
  locale,
  params,
}: {
  locale: Locale
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = findServicePage(slug)
  if (!page) notFound()

  /*
   * Zwei strukturierte Datensätze:
   *   BreadcrumbList — zeigt Google den Pfad Startseite > Leistungen > Seite
   *   Service        — beschreibt die Leistung, den Anbieter und das Gebiet
   * Beides beschreibt ausschließlich, was auf der Seite auch steht.
   */
  const jsonLd = [
    breadcrumbList(locale, [
      { name: dictionary[locale].nav.leistungen, path: "/leistungen" },
      { name: page.metaTitle[locale], path: `/leistungen/${page.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.metaTitle[locale],
      description: page.metaDescription[locale],
      serviceType: page.h1[locale],
      provider: {
        "@type": "Organization",
        name: "creaDIG",
        url: SITE_URL,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${address.venue}, ${address.street}`,
          postalCode: address.postalCode,
          addressLocality: address.city,
          addressCountry: address.countryCode,
        },
      },
      areaServed: ["DE", "CH"],
      availableLanguage: ["de", "tr"],
      url: localeUrl(`/leistungen/${page.slug}`, locale),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ServicePageBody page={page} />
    </>
  )
}
