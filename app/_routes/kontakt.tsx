import type { Metadata } from "next"
import { KontaktPageBody } from "@/components/pages/kontakt-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { address, contact } from "@/lib/site-data"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, localeAlternates, localeUrl, openGraphLocale } from "@/lib/routes"

/**
 * Kontaktseite (PHASE A · zweisprachig seit GROW-1).
 *
 * Bis PHASE A war „Kontakt" ein Anker auf das Formular am Ende der
 * Startseite. Wer den Link weitergeben wollte, gab die halbe Seite mit. Jetzt
 * gibt es eine Adresse — und vier Wege statt einem.
 */
export function kontaktMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].kontaktPage
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates("/kontakt", locale),
    openGraph: {
      title: `${copy.metaTitle} · creaDIG`,
      description: copy.metaDescription,
      url: localeUrl("/kontakt", locale),
      locale: openGraphLocale[locale],
      type: "website",
    },
  }
}

/*
 * `ContactPage` mit den Kontaktpunkten, die es wirklich gibt. Telefonnummer
 * ist die WhatsApp-Nummer — dieselbe, die auf der Seite steht; sie wird nicht
 * um eine erfundene Festnetznummer ergänzt.
 */
function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  const copy = t.kontaktPage
  return [
    breadcrumbList(locale, [{ name: t.nav.kontakt, path: "/kontakt" }]),
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: copy.metaTitle,
      description: copy.metaDescription,
      inLanguage: locale,
      url: localeUrl("/kontakt", locale),
      mainEntity: {
        "@type": "Organization",
        name: "creaDIG",
        url: SITE_URL,
        email: contact.email,
        telephone: "+41765045879",
        address: {
          "@type": "PostalAddress",
          streetAddress: `${address.venue}, ${address.street}`,
          postalCode: address.postalCode,
          addressLocality: address.city,
          addressCountry: address.countryCode,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: contact.email,
            telephone: "+41765045879",
            availableLanguage: ["de", "tr"],
            areaServed: ["DE", "CH"],
          },
        ],
      },
    },
  ]
}

export function KontaktRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <KontaktPageBody />
    </>
  )
}
