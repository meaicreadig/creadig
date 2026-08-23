import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { InsightPageBody } from "@/components/pages/insight-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { findInsight, readableInsights } from "@/lib/insights"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, localeUrl } from "@/lib/routes"

/**
 * BF-A9 — die Detailseite einer System-Note.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES SIE VORHER NICHT GAB
 * Die Liste unter `/insights` zeigte Titel und Anreißer, sonst nichts — sie
 * war für einen Bereich gebaut, in dem noch kein Text stand. Ein Befund über
 * acht eigene Mängel passt nicht in drei Zeilen Anreißer; entweder er hat
 * eine eigene Adresse, oder er wird zur Behauptung.
 *
 * Wie bei den Leistungsseiten: statisch zur Bauzeit, Slug in beiden Sprachen
 * gleich, `dynamicParams = false` — was nicht veröffentlicht ist, existiert
 * nicht und liefert 404 statt einer dünnen Seite.
 */
export function insightStaticParams() {
  return readableInsights.map((entry) => ({ slug: entry.slug }))
}

export async function insightMetadata(
  locale: Locale,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params
  const entry = findInsight(slug)
  if (!entry) return {}

  return pageMetadata({
    locale,
    path: `/insights/${entry.slug}`,
    title: entry.metaTitle[locale],
    description: entry.teaser[locale],
    type: "article",
  })
}

export async function InsightRoute({
  locale,
  params,
}: {
  locale: Locale
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = findInsight(slug)
  if (!entry) notFound()

  const t = dictionary[locale]

  /*
   * `BlogPosting` statt `Article`: Es ist eine datierte Notiz mit einem
   * Autor, kein Nachrichtenartikel. `dateModified` fehlt bewusst — es gäbe
   * kein Feld, aus dem es käme, und ein erfundenes Datum ist schlimmer als
   * gar keines.
   */
  const jsonLd = [
    breadcrumbList(locale, [
      { name: t.nav.insights, path: "/insights" },
      { name: entry.title[locale], path: `/insights/${entry.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: entry.title[locale],
      description: entry.teaser[locale],
      datePublished: entry.date,
      inLanguage: locale,
      url: localeUrl(`/insights/${entry.slug}`, locale),
      author: { "@type": "Person", name: "Muhammed Emin Akyol" },
      publisher: { "@type": "Organization", name: "creaDIG", url: SITE_URL },
      mainEntityOfPage: localeUrl(`/insights/${entry.slug}`, locale),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <InsightPageBody entry={entry} />
    </>
  )
}
