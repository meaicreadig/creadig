import type { Metadata } from "next"
import { BetriebPageBody } from "@/components/pages/betrieb-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"
import { retainer, retainerPublished } from "@/lib/site-data"

/**
 * MP10-4 — /betrieb.
 *
 * Die Sektion „Managed Betrieb" auf /leistungen bleibt; diese Seite ist ihre
 * vollstaendige Fassung mit eigener Adresse. Begruendung im Seitenkoerper.
 */
export function betriebMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].betriebPage
  return pageMetadata({
    locale,
    path: "/betrieb",
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
}

/*
 * `Service` — und der Preis steht dort NUR, wenn er auch auf der Seite steht.
 *
 * Ein Angebot in den strukturierten Daten, das die Seite selbst nicht zeigt,
 * waere eine Behauptung gegenueber Google, die kein Besucher nachpruefen
 * kann. `retainerPublished` ist dasselbe Gatter wie im Markup.
 */
function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  const copy = t.betriebPage

  return [
    breadcrumbList(locale, [
      { name: t.nav.leistungen, path: "/leistungen" },
      { name: t.managed.title, path: "/betrieb" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: copy.metaTitle,
      description: copy.metaDescription,
      serviceType: t.managed.title,
      inLanguage: locale,
      url: localeUrl("/betrieb", locale),
      provider: { "@type": "Organization", name: "creaDIG" },
      ...(retainerPublished && retainer.amount
        ? {
            offers: {
              "@type": "Offer",
              price: retainer.amount,
              priceCurrency: "EUR",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: retainer.amount,
                priceCurrency: "EUR",
                unitCode: "MON",
              },
            },
          }
        : {}),
    },
  ]
}

export function BetriebRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <BetriebPageBody />
    </>
  )
}
