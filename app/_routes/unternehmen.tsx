import type { Metadata } from "next"
import { UnternehmenPageBody } from "@/components/pages/unternehmen-page-body"
import { Location } from "@/components/sections/location"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { address } from "@/lib/site-data"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, localeUrl } from "@/lib/routes"

/**
 * Unternehmensseite (PHASE A · zweisprachig seit GROW-1).
 *
 * „Über uns" war bisher eine Sektion unter vielen. Für ein System-Haus ist es
 * die Seite, die entscheidet: Wer eigene Produkte baut, muss zeigen können,
 * wer dahintersteht — Gründer, Netzwerk, Sitz, nachprüfbare Nachweise.
 *
 * Der Standort kommt als Server-Komponente herein, weil er zur Bauzeit prüft,
 * ob das ICO-Foto wirklich im Repo liegt (public/images/ico-osnabrueck.jpg).
 * Fehlt es, wird gar kein Bild-Request gestellt.
 */
export function unternehmenMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].unternehmenPage
  return pageMetadata({
    locale,
    path: "/unternehmen",
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
}

/*
 * `AboutPage` verweist auf die Organisation aus dem Layout.
 *
 * V2-5 — HIER STAND `hasCredential` MIT VIER EINTRAEGEN. BAFA, iuk, AVPQ und
 * AGD sind nicht belegt (KIZILELMA §9.9), und in strukturierten Daten war es
 * dieselbe Behauptung wie auf der Seite, nur unsichtbar und gegenueber
 * Google. Unsichtbar macht sie nicht harmloser: Ein Nachweis, den Google
 * fuehrt und niemand bestaetigen kann, ist genau die Sorte Angabe, die eine
 * Domain teuer zu stehen kommt.
 */
function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  const copy = t.unternehmenPage
  return [
    breadcrumbList(locale, [{ name: t.nav.unternehmen, path: "/unternehmen" }]),
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: copy.metaTitle,
      description: copy.metaDescription,
      inLanguage: locale,
      url: localeUrl("/unternehmen", locale),
      mainEntity: {
        "@type": "Organization",
        name: "creaDIG",
        url: SITE_URL,
        foundingDate: "2017",
        founder: { "@type": "Person", name: address.owner },
        address: {
          "@type": "PostalAddress",
          streetAddress: `${address.venue}, ${address.street}`,
          postalCode: address.postalCode,
          addressLocality: address.city,
          addressCountry: address.countryCode,
        },
      },
    },
  ]
}

export function UnternehmenRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <UnternehmenPageBody location={<Location />} />
    </>
  )
}
