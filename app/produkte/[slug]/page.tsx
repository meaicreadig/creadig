import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProduktPageBody } from "@/components/pages/produkt-page-body"
import { productScreens } from "@/lib/product-media"
import { productWorks } from "@/lib/site-data"
import { jsonLdScript } from "@/lib/json-ld"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

/**
 * Template-Route der Produkt-Welten (PHASE A).
 *
 * Alle vier Seiten entstehen zur Bauzeit; ein unbekannter Slug ist ein 404
 * und keine dünne Seite (`dynamicParams = false`).
 *
 * Zu den strukturierten Daten: `SoftwareApplication` trägt ausschließlich
 * Felder, die wir belegen können — Name, Beschreibung, Anbieter, Sprache. Kein
 * `aggregateRating`, kein `offers`, kein `datePublished`. Erfundene
 * Auszeichnungen in der Google-Suche sind nicht bloß unehrlich, sie sind ein
 * Richtlinienverstoß und kosten die Domain.
 */
function findProduct(slug: string) {
  return productWorks.find((p) => p.slug === slug)
}

export function generateStaticParams() {
  return productWorks.map((product) => ({ slug: product.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = findProduct(slug)
  if (!product) return {}

  const title = `${product.name} — ${product.sector}`
  return {
    title,
    description: product.what,
    alternates: { canonical: `/produkte/${product.slug}` },
    openGraph: {
      title: `${title} · creaDIG`,
      description: product.what,
      url: `/produkte/${product.slug}`,
      type: "website",
    },
  }
}

export default async function ProduktRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = findProduct(slug)
  if (!product) notFound()

  // Dateisystem-Prüfung zur Bauzeit — siehe lib/product-media.ts.
  const screens = productScreens(product.slug)

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Produkte", item: `${SITE_URL}/produkte` },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: `${SITE_URL}/produkte/${product.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: product.name,
      description: product.what,
      applicationCategory: "BusinessApplication",
      author: { "@type": "Organization", name: "creaDIG", url: SITE_URL },
      publisher: { "@type": "Organization", name: "creaDIG", url: SITE_URL },
      inLanguage: ["de", "tr"],
      url: product.href ?? `${SITE_URL}/produkte/${product.slug}`,
      /*
       * `screenshot` haengt sich nur an, wenn es echte Aufnahmen gibt —
       * dieselbe Bedingung wie fuer die Sektion auf der Seite. Ein
       * Screenshot-Feld, das auf ein Mockup zeigt, waere gegenueber
       * Suchmaschinen dieselbe Behauptung wie ein Deko-Laptop gegenueber
       * Besuchern.
       */
      ...(screens.length > 0
        ? { screenshot: screens.map((src) => `${SITE_URL}${src}`) }
        : {}),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ProduktPageBody product={product} screens={screens} />
    </>
  )
}
