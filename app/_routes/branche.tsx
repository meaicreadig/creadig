import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BranchePageBody } from "@/components/pages/branche-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { BRANCHEN, brancheVon } from "@/lib/branchen-weitere"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/** Weitere Branchen-Einstiege (lib/branchen-weitere.ts) – gleiche Regeln wie /branchen/handwerk. */
export const brancheParams = () => BRANCHEN.map((b) => ({ slug: b.slug }))

export function brancheMetadata(slug: string, locale: Locale): Metadata {
  const b = brancheVon(slug)
  if (!b) return {}
  return pageMetadata({ locale, path: `/branchen/${slug}`, title: b.metaTitle[locale], description: b.metaDescription[locale] })
}

export function BrancheRoute({ slug, locale }: { slug: string; locale: Locale }) {
  const b = brancheVon(slug)
  if (!b) notFound()
  const t = dictionary[locale]
  const ld = [
    breadcrumbList(locale, [
      { name: t.nav.leistungen, path: "/leistungen" },
      { name: b.eyebrow[locale], path: `/branchen/${slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: b.metaTitle[locale],
      description: b.metaDescription[locale],
      inLanguage: locale,
      url: localeUrl(`/branchen/${slug}`, locale),
      isPartOf: { "@type": "WebSite", name: "creaDIG", url: localeUrl("/", locale) },
    },
  ]
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <BranchePageBody slug={slug} />
    </>
  )
}
