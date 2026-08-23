import type { Metadata } from "next"
import { KontaktPageBody } from "@/components/pages/kontakt-page-body"
import { dictionary } from "@/lib/dictionary"
import { address, contact } from "@/lib/site-data"
import { jsonLdScript } from "@/lib/json-ld"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"
const copy = dictionary.de.kontaktPage

/**
 * Kontaktseite (PHASE A).
 *
 * Bis hierher war „Kontakt" ein Anker auf das Formular am Ende der
 * Startseite. Wer den Link weitergeben wollte, gab die halbe Seite mit. Jetzt
 * gibt es eine Adresse — und vier Wege statt einem.
 */
export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  alternates: { canonical: "/kontakt" },
  openGraph: {
    title: `${copy.metaTitle} · creaDIG`,
    description: copy.metaDescription,
    url: "/kontakt",
    type: "website",
  },
}

/*
 * `ContactPage` mit den Kontaktpunkten, die es wirklich gibt. Telefonnummer
 * ist die WhatsApp-Nummer — dieselbe, die auf der Seite steht; sie wird nicht
 * um eine erfundene Festnetznummer ergänzt.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Kontakt", item: `${SITE_URL}/kontakt` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/kontakt`,
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

export default function KontaktRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <KontaktPageBody />
    </>
  )
}
