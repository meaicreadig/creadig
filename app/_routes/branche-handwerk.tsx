import type { Metadata } from "next"
import { HandwerkPageBody } from "@/components/pages/handwerk-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { handwerkCopy, HANDWERK_WORKFLOW } from "@/lib/branchen"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/**
 * MP-E · /branchen/handwerk.
 *
 * Der Pfad hat einen Plural im ersten Segment, obwohl es genau eine Branche
 * gibt. Das ist Absicht: Kommt eine zweite dazu, ist sie eine Datei daneben
 * und kein Umzug aller Adressen. Was NICHT kommt, ist eine Seite je Gewerk
 * und Stadt — dafuer gibt es `lib/seo-landings.ts`, und die ist leer, weil
 * der Owner keine Stadt bestaetigt hat.
 *
 * Kein `Service`-Schema: Diese Seite verkauft keine Leistung, sie stellt eine
 * Frage und fuehrt zum Betriebscheck. Ein Angebot in den strukturierten Daten,
 * das die Seite selbst nicht macht, waere eine Behauptung gegenueber Google.
 */
export function handwerkMetadata(locale: Locale): Metadata {
  return pageMetadata({
    locale,
    path: "/branchen/handwerk",
    title: handwerkCopy.metaTitle[locale],
    description: handwerkCopy.metaDescription[locale],
  })
}

function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  return [
    breadcrumbList(locale, [
      { name: t.nav.leistungen, path: "/leistungen" },
      { name: handwerkCopy.eyebrow[locale], path: "/branchen/handwerk" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: handwerkCopy.metaTitle[locale],
      description: handwerkCopy.metaDescription[locale],
      inLanguage: locale,
      url: localeUrl("/branchen/handwerk", locale),
      isPartOf: { "@type": "WebSite", name: "creaDIG", url: localeUrl("/", locale) },
      about: `${HANDWERK_WORKFLOW.length} Schritte im Auftragsdurchlauf`,
    },
  ]
}

export function HandwerkRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <HandwerkPageBody />
    </>
  )
}
