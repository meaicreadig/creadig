import type { Metadata } from "next"
import { InsightsPageBody } from "@/components/pages/insights-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { publishedInsights } from "@/lib/insights"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeAlternates, localeUrl, openGraphLocale } from "@/lib/routes"

/**
 * System-Notes (PHASE A — Gerüst, Inhalte folgen vom Owner · GROW-1).
 *
 * Zur Indexierung: Solange nichts veröffentlicht ist, nimmt sich die Route
 * selbst aus dem Suchindex (`noindex, follow`) und aus der Sitemap. Eine leere
 * Seite in den Index zu schieben ist dünner Inhalt — und der schadet nicht nur
 * dieser Seite, sondern der Bewertung der ganzen Domain. Sobald der erste
 * Eintrag steht, schaltet die Seite ohne Code-Änderung auf `index` um; das
 * gilt für beide Sprachfassungen zugleich.
 */
export function insightsMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].insightsPage
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates("/insights", locale),
    robots:
      publishedInsights.length > 0
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title: `${copy.metaTitle} · creaDIG`,
      description: copy.metaDescription,
      url: localeUrl("/insights", locale),
      locale: openGraphLocale[locale],
      type: "website",
    },
  }
}

function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  return [
    breadcrumbList(locale, [{ name: t.nav.insights, path: "/insights" }]),
    // Die Liste selbst steht nur in den Daten, wenn es sie gibt.
    ...(publishedInsights.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t.insightsPage.metaTitle,
            itemListElement: publishedInsights.map((entry, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: entry.title[locale],
            })),
          },
        ]
      : []),
  ]
}

export function InsightsRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <InsightsPageBody />
    </>
  )
}
