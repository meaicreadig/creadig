"use client"

import { Suspense } from "react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Bewerbung } from "@/components/karriere/bewerbung"
import { bewerben } from "@/lib/karriere-inhalt"

/**
 * /karriere/bewerben.
 *
 * EIN Einstieg für beide Spuren, nicht zwei Formulare. Welche Spur gemeint
 * ist, entscheidet der erste Schritt — und der Link von einer Rollenseite
 * bringt die Antwort als `?spur=` schon mit.
 *
 * `Suspense` ist Pflicht und kein Zierrat: `useSearchParams()` zwingt den
 * Baum darunter sonst ins vollständige Client-Rendering, und das würde die
 * ganze Seite aus dem statischen Aufbau nehmen.
 */
export function KarriereBewerbenPageBody() {
  const { t, locale } = useLocale()

  return (
    <main>
      <PageHeader
        eyebrow={bewerben.eyebrow[locale]}
        title={bewerben.titel[locale]}
        crumbLabel={bewerben.eyebrow[locale]}
        crumbs={[{ label: t.nav.karriere, href: "/karriere" }]}
        lead={bewerben.lead[locale]}
      />

      <section className="section-gutter pt-4 pb-24 md:pb-32">
        <Suspense fallback={null}>
          <Bewerbung />
        </Suspense>
      </section>
    </main>
  )
}
