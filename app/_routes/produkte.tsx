import type { Metadata } from "next"
import { ProduktePageBody } from "@/components/pages/produkte-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { productWorks } from "@/lib/site-data"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/**
 * Übersicht der eigenen Produkte (PHASE A · zweisprachig seit GROW-1).
 *
 * Der stärkste Beweis des Hauses hat bis PHASE A keine eigene Adresse gehabt:
 * Die vier Produkte lagen als Kacheln und als Logos auf der Startseite, aber
 * niemand konnte sie verlinken, teilen oder in der Suche finden. Ab jetzt hat
 * jedes Produkt eine eigene Welt — diese Seite ist ihr Eingang, in beiden
 * Sprachen.
 */
export function produkteMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].produktePage
  return pageMetadata({
    locale,
    path: "/produkte",
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
}

function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  return [
    breadcrumbList(locale, [{ name: t.nav.produkte, path: "/produkte" }]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t.produktePage.metaTitle,
      itemListElement: productWorks.map((product, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: product.name,
        url: localeUrl(`/produkte/${product.slug}`, locale),
      })),
    },
  ]
}

export function ProdukteRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <ProduktePageBody />
    </>
  )
}
