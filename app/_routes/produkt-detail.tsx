import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProduktPageBody } from "@/components/pages/produkt-page-body"
import { productScreens } from "@/lib/product-media"
import { productWorks } from "@/lib/site-data"
import { belegZu } from "@/lib/produkt-beleg"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, localeUrl } from "@/lib/routes"

/**
 * Template-Route der Produkt-Welten (PHASE A · GROW-1).
 *
 * Alle vier Seiten entstehen zur Bauzeit; ein unbekannter Slug ist ein 404
 * und keine dünne Seite (`dynamicParams = false`).
 *
 * Zu den strukturierten Daten: `SoftwareApplication` trägt ausschließlich
 * Felder, die wir belegen können — Name, Beschreibung, Anbieter, Sprache. Kein
 * `aggregateRating`, kein `offers`, kein `datePublished`. Erfundene
 * Auszeichnungen in der Google-Suche sind nicht bloß unehrlich, sie sind ein
 * Richtlinienverstoß und kosten die Domain.
 *
 * Offen und bewusst so gelassen: `product.what` und `product.sector` liegen
 * nur auf Deutsch vor. Auf `/tr/produkte/…` ist deshalb die Oberfläche
 * türkisch und der Produktsatz deutsch. Das ist der ehrliche Zustand — eine
 * maschinell erfundene Übersetzung wäre eine Aussage, die niemand geprüft
 * hat. Die türkischen Produkttexte stehen auf der Owner-Liste (Phase 5).
 */
export function produktStaticParams() {
  return productWorks.map((product) => ({ slug: product.slug }))
}

function findProduct(slug: string) {
  return productWorks.find((p) => p.slug === slug)
}

export async function produktMetadata(
  locale: Locale,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params
  const product = findProduct(slug)
  if (!product) return {}

  const title = `${product.name} — ${product.sector[locale]}`
  return pageMetadata({
    locale,
    path: `/produkte/${product.slug}`,
    title,
    description: product.what[locale],
    type: "article",
  })
}

export async function ProduktRoute({
  locale,
  params,
}: {
  locale: Locale
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = findProduct(slug)
  if (!product) notFound()

  // Dateisystem-Prüfung zur Bauzeit — siehe lib/product-media.ts.
  const screens = productScreens(product.slug)

  const jsonLd = [
    breadcrumbList(locale, [
      { name: dictionary[locale].nav.produkte, path: "/produkte" },
      { name: product.name, path: `/produkte/${product.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: product.name,
      description: product.what[locale],
      applicationCategory: "BusinessApplication",
      author: { "@type": "Organization", name: "creaDIG", url: SITE_URL },
      publisher: { "@type": "Organization", name: "creaDIG", url: SITE_URL },
      inLanguage: ["de", "tr"],
      url: product.href ?? localeUrl(`/produkte/${product.slug}`, locale),
      /*
       * `screenshot` haengt sich nur an, wenn es echte Aufnahmen gibt —
       * dieselbe Bedingung wie fuer die Sektion auf der Seite. Ein
       * Screenshot-Feld, das auf ein Mockup zeigt, waere gegenueber
       * Suchmaschinen dieselbe Behauptung wie ein Deko-Laptop gegenueber
       * Besuchern.
       */
      ...(screens.length > 0
        ? { screenshot: screens.map((src) => `${SITE_URL}${src}`) }
        : {}),
    },
  ]

  /* Siehe Kommentar unten: kein zurueckgehaltener Bildpfad ueber die
     Client-Grenze. `image` wird von der Seite ohnehin nicht mehr gelesen. */
  const beleg = belegZu(product.slug)
  const sicheresProdukt = beleg?.situBild ? product : { ...product, image: null }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {/*
        ABSCHLUSSLAUF · ASSET-SICHERHEIT — DER ACHTE WEG.

        `ProduktPageBody` ist eine Client-Komponente und bekommt das ganze
        `Work`-Objekt als Prop. Next serialisiert es in den RSC-Payload der
        Seite — samt `image`. Fuer CASSAMEA und meahv heisst das: Die von
        Gate 02 ZURUECKGEHALTENEN Aufnahmen standen als Pfad im ausgelieferten
        Quelltext ihrer eigenen Produktseiten. Sichtbar war nichts; abrufbar
        war es trotzdem.

        Genau diese Klasse achter Weg beschreibt `docs/ops/proof-kinds.md`
        fuer `workSlugs`: „Sichtbar war nichts; ausgeliefert war es trotzdem."
        Gate 02 hatte den Befund gemeldet und als Owner-Punkt (OA-1) gefuehrt,
        weil die Quelle `lib/site-data.ts` G18-gesperrt ist.

        Sie muss aber gar nicht angefasst werden. Die Komponente liest `image`
        seit Gate 02 nicht mehr — sie nimmt das gepruefte Bild aus
        `lib/produkt-beleg.ts`. Also wird das Feld hier abgeschnitten, bevor
        es die Client-Grenze ueberquert: Wo Gate 02 kein Bild freigegeben hat,
        geht auch kein Pfad hinaus.

        Kein G18-Eingriff, keine Datei geloescht, keine Aussage geaendert.
      */}
      <ProduktPageBody product={sicheresProdukt} screens={screens} />
    </>
  )
}
