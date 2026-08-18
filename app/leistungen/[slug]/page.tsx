import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ServicePageBody } from "@/components/service/service-page-body"
import { findServicePage, publishedServicePages } from "@/lib/service-pages"
import { address } from "@/lib/site-data"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

/**
 * Template-Route für die granularen Leistungsseiten (E-K4).
 *
 * Alle Seiten werden zur Bauzeit statisch erzeugt; unveröffentlichte Slugs
 * existieren gar nicht erst (404 statt dünner Seite). Title, Description und
 * Canonical kommen je Seite aus `lib/service-pages.ts` — genau das, was die
 * Startseite mit ihrem einen Canonical nicht leisten kann.
 *
 * Sprache: Das Server-HTML ist deutsch (siehe layout.tsx), darum stehen die
 * deutschen Meta-Texte in den Kopfdaten. Die Oberfläche schaltet nach der
 * Hydration auf die gewählte Sprache um.
 */
export function generateStaticParams() {
  return publishedServicePages.map((page) => ({ slug: page.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = findServicePage(slug)
  if (!page) return {}

  return {
    title: page.metaTitle.de,
    description: page.metaDescription.de,
    alternates: { canonical: `/leistungen/${page.slug}` },
    openGraph: {
      title: `${page.metaTitle.de} · creaDIG`,
      description: page.metaDescription.de,
      url: `/leistungen/${page.slug}`,
      type: "article",
    },
  }
}

export default async function ServiceRoute({
  params,
}: {
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
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Leistungen", item: `${SITE_URL}/#leistungen` },
        {
          "@type": "ListItem",
          position: 3,
          name: page.metaTitle.de,
          item: `${SITE_URL}/leistungen/${page.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.metaTitle.de,
      description: page.metaDescription.de,
      serviceType: page.h1.de,
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
      url: `${SITE_URL}/leistungen/${page.slug}`,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicePageBody page={page} />
    </>
  )
}
