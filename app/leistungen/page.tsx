import type { Metadata } from "next"
import { LeistungenPageBody } from "@/components/pages/leistungen-page-body"
import { dictionary } from "@/lib/dictionary"
import { publishedServicePages } from "@/lib/service-pages"
import { address } from "@/lib/site-data"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"
const copy = dictionary.de.leistungenPage

/**
 * Übersichtsseite der Leistungen (PHASE A).
 *
 * Bisher gab es die granularen Seiten `/leistungen/[slug]`, aber keine Ebene
 * darüber — die Brotkrumen zeigten auf `/#leistungen`, also auf einen Anker
 * mitten in der Startseite. Damit war „Leistungen" keine Adresse, sondern eine
 * Sprungmarke. Diese Seite ist die fehlende Ebene: Sie trägt die fünf Ebenen,
 * den Ablauf, die Pakete und die Fragen — alles, was die Startseite künftig
 * nur noch anreißt.
 *
 * Sprache: Das Server-HTML ist deutsch (siehe layout.tsx), darum stehen die
 * deutschen Meta-Texte hier; die Oberfläche schaltet nach der Hydration um.
 */
export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  alternates: { canonical: "/leistungen" },
  openGraph: {
    title: `${copy.metaTitle} · creaDIG`,
    description: copy.metaDescription,
    url: "/leistungen",
    type: "website",
  },
}

/*
 * Zwei strukturierte Datensätze — beide beschreiben ausschließlich, was auf
 * der Seite auch steht:
 *   BreadcrumbList — der Pfad Startseite > Leistungen
 *   ItemList       — die granularen Leistungsseiten als Unterseiten
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Leistungen", item: `${SITE_URL}/leistungen` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.metaTitle,
    itemListElement: publishedServicePages.map((page, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: page.metaTitle.de,
      url: `${SITE_URL}/leistungen/${page.slug}`,
    })),
  },
  /*
   * FAQPage — mit der FAQ von der Startseite hierher gezogen. Strukturierte
   * Daten muessen beschreiben, was auf DIESER Seite steht; auf der Startseite
   * stuenden sie jetzt ueber Inhalten, die dort nicht mehr sichtbar sind.
   *
   * Bewusst hier und nicht in der FAQ-Komponente: Die Sektion ist eine
   * Client-Komponente, deren Sprache erst nach der Hydration feststeht. Ein
   * Crawler sieht das Server-HTML, und das ist deutsch.
   */
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dictionary.de.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: copy.metaTitle,
    description: copy.metaDescription,
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
    url: `${SITE_URL}/leistungen`,
  },
]

export default function LeistungenRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LeistungenPageBody />
    </>
  )
}
