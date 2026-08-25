import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArbeitPageBody } from "@/components/pages/arbeit-page-body"
import { approvedCaseStudies, clientWorks } from "@/lib/site-data"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"

/**
 * Detailseiten des Kundenwerks (PHASE A · GROW-1).
 *
 * Bewusst NUR Kundenwerk: Die eigenen Produkte haben ihre eigene Welt unter
 * `/produkte/[slug]`. Zwei Adressen für dieselbe Sache wären zwei Wahrheiten
 * — und für Suchmaschinen doppelter Inhalt.
 *
 * Eine ausführliche Fallbeschreibung hängt sich an, sobald zu diesem Slug
 * eine Case-Study mit `approved: true` vorliegt. Ohne Freigabe rendert die
 * Seite den belegten Teil und nennt den Grund für den Rest.
 *
 * Wie bei den Produkten gilt: `work.what` und `work.sector` liegen nur auf
 * Deutsch vor. Auf `/tr/arbeiten/…` ist die Oberfläche türkisch, der
 * Projektsatz deutsch — der ehrliche Zustand, bis der Owner die türkischen
 * Fassungen liefert (Phase 5).
 */
export function arbeitStaticParams() {
  return clientWorks.map((work) => ({ slug: work.slug }))
}

function findWork(slug: string) {
  return clientWorks.find((w) => w.slug === slug)
}

export async function arbeitMetadata(
  locale: Locale,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params
  const work = findWork(slug)
  if (!work) return {}

  const title = `${work.name} — ${work.sector[locale]}`
  return pageMetadata({
    locale,
    path: `/arbeiten/${work.slug}`,
    title,
    description: work.what[locale],
    type: "article",
  })
}

export async function ArbeitRoute({
  locale,
  params,
}: {
  locale: Locale
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const work = findWork(slug)
  if (!work) notFound()

  const study = approvedCaseStudies.find((c) => c.slug === work.slug) ?? null

  const jsonLd = breadcrumbList(locale, [
    { name: dictionary[locale].nav.arbeiten, path: "/arbeiten" },
    { name: work.name, path: `/arbeiten/${work.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ArbeitPageBody work={work} study={study} />
    </>
  )
}
