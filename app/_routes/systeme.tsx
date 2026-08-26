import type { Metadata } from "next"
import { SystemePageBody } from "@/components/pages/systeme-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/**
 * MP10-4 — /systeme („Integration first").
 *
 * Warum die Seite keine Wand aus fremden Technologie-Logos ist, steht in
 * `lib/systems.ts`. Warum ihr letzter Abschnitt der eigentliche Grund fuer
 * sie ist, im Seitenkoerper.
 */
export function systemeMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].systemePage
  return pageMetadata({
    locale,
    path: "/systeme",
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
}

/*
 * Bewusst `WebPage` und NICHT `Service`: Diese Seite verkauft nichts, sie
 * beschreibt eine Arbeitsweise. Ein Service-Eintrag ohne Angebot waere ein
 * Etikett fuer Google, dem auf der Seite nichts entspricht.
 */
function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  const copy = t.systemePage
  return [
    breadcrumbList(locale, [{ name: copy.eyebrow, path: "/systeme" }]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: copy.metaTitle,
      description: copy.metaDescription,
      inLanguage: locale,
      url: localeUrl("/systeme", locale),
      isPartOf: { "@type": "WebSite", name: "creaDIG" },
    },
  ]
}

export function SystemeRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <SystemePageBody />
    </>
  )
}
