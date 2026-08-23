import type { Metadata } from "next"
import { ProduktePageBody } from "@/components/pages/produkte-page-body"
import { dictionary } from "@/lib/dictionary"
import { productWorks } from "@/lib/site-data"
import { jsonLdScript } from "@/lib/json-ld"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"
const copy = dictionary.de.produktePage

/**
 * Übersicht der eigenen Produkte (PHASE A).
 *
 * Der stärkste Beweis des Hauses hat bis hierher keine eigene Adresse gehabt:
 * Die vier Produkte lagen als Kacheln und als Logos auf der Startseite, aber
 * niemand konnte sie verlinken, teilen oder in der Suche finden. Ab jetzt hat
 * jedes Produkt eine eigene Welt — diese Seite ist ihr Eingang.
 */
export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  alternates: { canonical: "/produkte" },
  openGraph: {
    title: `${copy.metaTitle} · creaDIG`,
    description: copy.metaDescription,
    url: "/produkte",
    type: "website",
  },
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Produkte", item: `${SITE_URL}/produkte` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.metaTitle,
    itemListElement: productWorks.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: product.name,
      url: `${SITE_URL}/produkte/${product.slug}`,
    })),
  },
]

export default function ProdukteRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ProduktePageBody />
    </>
  )
}
