import type { Metadata } from "next"
import { UnternehmenPageBody } from "@/components/pages/unternehmen-page-body"
import { Location } from "@/components/sections/location"
import { dictionary } from "@/lib/dictionary"
import { address, certifications } from "@/lib/site-data"
import { jsonLdScript } from "@/lib/json-ld"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"
const copy = dictionary.de.unternehmenPage

/**
 * Unternehmensseite (PHASE A).
 *
 * „Über uns" war bisher eine Sektion unter vielen. Für ein System-Haus ist es
 * die Seite, die entscheidet: Wer eigene Produkte baut, muss zeigen können,
 * wer dahintersteht — Gründer, Netzwerk, Sitz, nachprüfbare Nachweise.
 *
 * Der Standort kommt als Server-Komponente herein, weil er zur Bauzeit prüft,
 * ob das ICO-Foto wirklich im Repo liegt (public/images/ico-osnabrueck.jpg).
 * Fehlt es, wird gar kein Bild-Request gestellt.
 */
export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  alternates: { canonical: "/unternehmen" },
  openGraph: {
    title: `${copy.metaTitle} · creaDIG`,
    description: copy.metaDescription,
    url: "/unternehmen",
    type: "website",
  },
}

/*
 * `AboutPage` verweist auf die Organisation aus dem Layout und trägt die
 * Nachweise als `hasCredential`. Alle fünf sind bei den genannten Stellen
 * überprüfbar — nichts Selbstvergebenes, nichts Gekauftes.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Unternehmen", item: `${SITE_URL}/unternehmen` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: copy.metaTitle,
    description: copy.metaDescription,
    url: `${SITE_URL}/unternehmen`,
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
      hasCredential: certifications.map((cert) => ({
        "@type": "EducationalOccupationalCredential",
        name: cert.name,
        url: cert.href,
      })),
    },
  },
]

export default function UnternehmenRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <UnternehmenPageBody location={<Location />} />
    </>
  )
}
