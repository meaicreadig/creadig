import type { Metadata } from "next"
import { ArbeitenPageBody } from "@/components/pages/arbeiten-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { genannteClientWorks, registryWorks, workHref } from "@/lib/site-data"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/**
 * Werkschau (PHASE A · zweisprachig seit GROW-1).
 *
 * Bis PHASE A war „Arbeiten" ein Anker auf der Startseite. Jetzt ist es eine
 * Adresse — mit Karten- und Registeransicht, Kundenfällen (gated) und
 * Bewertungen (gated).
 */
export function arbeitenMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].arbeitenPage
  /*
   * Auch der Suchtreffer haelt sich an die Freigabelage. „Eigene Produkte
   * UND Kundenwerk" in der Ergebnisliste ist dieselbe Zusage wie im
   * Vorspann — und wer ihr folgt, findet vier eigene Produkte.
   */
  const ohneKundenwerk = genannteClientWorks.length === 0
  return pageMetadata({
    locale,
    path: "/arbeiten",
    title: ohneKundenwerk ? copy.metaTitleOhneKundenwerk : copy.metaTitle,
    description: ohneKundenwerk ? copy.metaDescriptionOhneKundenwerk : copy.metaDescription,
  })
}

function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  return [
    breadcrumbList(locale, [{ name: t.nav.arbeiten, path: "/arbeiten" }]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t.arbeitenPage.metaTitle,
      itemListElement: registryWorks.map((work, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: work.name,
        url: localeUrl(workHref(work), locale),
      })),
    },
  ]
}

export function ArbeitenRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <ArbeitenPageBody />
    </>
  )
}
