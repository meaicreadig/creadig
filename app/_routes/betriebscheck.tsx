import type { Metadata } from "next"
import { Betriebscheck } from "@/components/sales/betriebscheck"
import { ClosingCta } from "@/components/sections/closing-cta"
import { dictionary, type Locale } from "@/lib/dictionary"
import { checkCopy, CHECK_QUESTIONS } from "@/lib/betriebscheck"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/**
 * MP-D · /betriebscheck.
 *
 * Der erste Weg auf dieser Seite, der etwas GIBT, bevor er etwas verlangt.
 * Alles andere hier ist entweder Darstellung (Leistungen, Arbeiten) oder
 * Formular (Kontakt, Termin) — dies ist das erste Werkzeug.
 *
 * Kein `FAQPage`, kein `Quiz` und kein `HowTo` in den strukturierten Daten:
 * Es ist eine Selbsteinschaetzung, und keines dieser Schemata beschreibt das
 * ehrlich. `WebApplication` waere die naechste Versuchung — auch die nicht,
 * denn dahinter erwartet Google etwas Installierbares. Bleibt der Brotkrumen,
 * und der stimmt.
 */
export function betriebscheckMetadata(locale: Locale): Metadata {
  return pageMetadata({
    locale,
    path: "/betriebscheck",
    title: checkCopy.metaTitle[locale],
    description: checkCopy.metaDescription[locale],
  })
}

function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  return [
    breadcrumbList(locale, [
      { name: t.nav.leistungen, path: "/leistungen" },
      { name: checkCopy.eyebrow[locale], path: "/betriebscheck" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: checkCopy.metaTitle[locale],
      description: checkCopy.metaDescription[locale],
      inLanguage: locale,
      url: localeUrl("/betriebscheck", locale),
      isPartOf: { "@type": "WebSite", name: "creaDIG", url: localeUrl("/", locale) },
      /* Belegbar und nachzählbar — die Zahl kommt aus der Liste selbst. */
      about: `${CHECK_QUESTIONS.length} Fragen · 5 Ebenen`,
    },
  ]
}

export function BetriebscheckRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <main className="relative pt-32 md:pt-40">
        <Betriebscheck />
        <ClosingCta />
      </main>
    </>
  )
}
