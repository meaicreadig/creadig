import type { Metadata } from "next"
import { LeistungenPageBody } from "@/components/pages/leistungen-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { publishedServicePages } from "@/lib/service-pages"
import { address, areaServed } from "@/lib/site-data"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, localeUrl } from "@/lib/routes"

/**
 * Übersichtsseite der Leistungen (PHASE A · zweisprachig seit GROW-1).
 *
 * Bisher gab es die granularen Seiten `/leistungen/[slug]`, aber keine Ebene
 * darüber — die Brotkrumen zeigten auf `/#leistungen`, also auf einen Anker
 * mitten in der Startseite. Damit war „Leistungen" keine Adresse, sondern eine
 * Sprungmarke. Diese Seite ist die fehlende Ebene: Sie trägt die fünf Ebenen,
 * den Ablauf, die Pakete und die Fragen — alles, was die Startseite künftig
 * nur noch anreißt.
 *
 * Sprache: Der Satz „Das Server-HTML ist deutsch, die Oberfläche schaltet nach
 * der Hydration um" stand hier bis GROW-1 — und war der Grund, warum es die
 * türkische Fassung für Suchmaschinen nie gab. Jetzt kommt die Sprache aus der
 * Route, und Titel, Beschreibung und strukturierte Daten kommen mit.
 */
export function leistungenMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].leistungenPage
  return pageMetadata({
    locale,
    path: "/leistungen",
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
}

/*
 * Vier strukturierte Datensätze — alle beschreiben ausschließlich, was auf
 * der Seite auch steht, und alle in der Sprache, in der es dort steht:
 *   BreadcrumbList — der Pfad Startseite > Leistungen
 *   ItemList       — die granularen Leistungsseiten als Unterseiten
 *   FAQPage        — mit der FAQ von der Startseite hierher gezogen
 *   Service        — die Leistung, der Anbieter, das Gebiet
 *
 * Die FAQ steht bewusst hier und nicht in der FAQ-Komponente: Die Sektion ist
 * eine Client-Komponente, die Daten gehören in den Server-Render.
 */
function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  const copy = t.leistungenPage
  return [
    breadcrumbList(locale, [{ name: t.nav.leistungen, path: "/leistungen" }]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: copy.metaTitle,
      itemListElement: publishedServicePages.map((page, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: page.metaTitle[locale],
        url: localeUrl(`/leistungen/${page.slug}`, locale),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: t.faq.items.map((item) => ({
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
      areaServed: [...areaServed],
      availableLanguage: ["de", "tr"],
      url: localeUrl("/leistungen", locale),
    },
  ]
}

export function LeistungenRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <LeistungenPageBody />
    </>
  )
}
