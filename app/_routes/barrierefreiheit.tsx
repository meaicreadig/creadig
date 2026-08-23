import type { Metadata } from "next"
import { AccessibilityPageBody } from "@/components/pages/accessibility-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { pageMetadata } from "@/lib/page-metadata"
import { localeUrl } from "@/lib/routes"

/**
 * BF-A4 — Erklärung zur Barrierefreiheit.
 *
 * Anders als Impressum und Datenschutz ist diese Seite `index, follow`: Sie
 * ist kein Pflichttext im Fußbereich, sondern ein Beleg. Wer nach
 * „Barrierefreiheit" und einer Agentur sucht, soll sie finden — und wer prüfen
 * will, ob wir liefern, was wir verkaufen, findet hier Zahlen statt Absichten.
 *
 * Der türkische Pfad heißt `/tr/erisilebilirlik`, nicht `/tr/barrierefreiheit`
 * — die einzige übersetzte Adresse des Projekts, begründet in `lib/routes.ts`.
 */
export function barrierefreiheitMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].accessibility
  return pageMetadata({
    locale,
    path: "/barrierefreiheit",
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
}

function jsonLd(locale: Locale) {
  const copy = dictionary[locale].accessibility
  return [
    breadcrumbList(locale, [{ name: copy.eyebrow, path: "/barrierefreiheit" }]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: copy.metaTitle,
      description: copy.metaDescription,
      inLanguage: locale,
      url: localeUrl("/barrierefreiheit", locale),
      dateModified: "2026-08-23",
    },
  ]
}

export function BarrierefreiheitRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <AccessibilityPageBody />
    </>
  )
}
