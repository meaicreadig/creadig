import type { Metadata } from "next"
import { Aufwandsrechner } from "@/components/rechner/aufwandsrechner"
import { ClosingCta } from "@/components/sections/closing-cta"
import { PageHeader } from "@/components/ui/page-header"
import { dictionary, type Locale } from "@/lib/dictionary"
import { rechnerText } from "@/lib/rechner-text"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/**
 * PHASE 3 · /aufwandsrechner — das zweite Werkzeug des Hauses.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS EINE EIGENE ROUTE IST UND KEIN ABSCHNITT
 *
 * Drei Orte kamen infrage. `/leistungen` ist mit Abstand die laengste Seite
 * der Website; ein Rechner haette sie weiter beschwert, obwohl Gate 03 sie
 * gerade entlastet hat. Der Betriebscheck waere thematisch richtig, liegt
 * aber hinter fuenfzehn Fragen — ein Geschaeftsfuehrer, der wissen will, was
 * ein Vorgang kostet, beantwortet die nicht vorher.
 *
 * Bleibt eine eigene Adresse. Sie ist auch die ehrlichere: Ein Rechner ist
 * ein Werkzeug, kein Absatz, und `/betriebscheck` hat dieselbe Rolle bereits.
 * Zwei Werkzeuge unter „Werkzeuge" sind eine Rubrik; eines ist eine Ausnahme.
 *
 * Verlinkt wird von dort, wo die Frage entsteht: aus dem Ergebnis des
 * Betriebschecks (wo ein offener Punkt benannt ist) und aus dem fibero-Beleg
 * (wo ausdruecklich steht, dass creaDIG keine eigene Ersparnis-Zahl hat).
 *
 * ---------------------------------------------------------------------------
 * KEIN SCHEMA UEBER DEM RECHNER
 *
 * `WebApplication` waere die Versuchung — dahinter erwartet Google etwas
 * Installierbares. `HowTo` beschreibt eine Anleitung, und das hier ist keine.
 * Bleibt der Brotkrumen und eine `WebPage`, und die stimmen. Dieselbe
 * Ueberlegung steht seit MP-D ueber `/betriebscheck`.
 */
export function aufwandsrechnerMetadata(locale: Locale): Metadata {
  return pageMetadata({
    locale,
    path: "/aufwandsrechner",
    title: rechnerText.metaTitle[locale],
    description: rechnerText.metaDescription[locale],
  })
}

function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  return [
    breadcrumbList(locale, [
      { name: t.nav.leistungen, path: "/leistungen" },
      { name: rechnerText.metaTitle[locale], path: "/aufwandsrechner" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: rechnerText.metaTitle[locale],
      description: rechnerText.metaDescription[locale],
      inLanguage: locale,
      url: localeUrl("/aufwandsrechner", locale),
      isPartOf: { "@type": "WebSite", name: "creaDIG", url: localeUrl("/", locale) },
    },
  ]
}

export function AufwandsrechnerRoute({ locale }: { locale: Locale }) {
  const t = dictionary[locale]
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <main>
        <PageHeader
          eyebrow={rechnerText.eyebrow[locale]}
          title={rechnerText.title[locale]}
          crumbLabel={t.nav.leistungen}
          lead={rechnerText.lead[locale]}
        />
        <Aufwandsrechner />
        <ClosingCta />
      </main>
    </>
  )
}
