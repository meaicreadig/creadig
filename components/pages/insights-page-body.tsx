"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { ClosingCta } from "@/components/sections/closing-cta"
import { publishedInsights } from "@/lib/insights"

/**
 * System-Notes (PHASE A — Gerüst).
 *
 * Zwei Zustände, beide ehrlich:
 *
 *   leer    — ein Satz, der sagt warum nichts dasteht, plus zwei Wege zu dem,
 *             was es wirklich gibt (Produkte, Werkschau). Keine
 *             „Demnächst"-Kacheln, keine Beispielartikel, keine grauen
 *             Platzhalter-Karten mit Blindtext.
 *   gefüllt — die Liste, neueste zuerst.
 *
 * Der leere Zustand ist der wahrscheinlichere und darum der sorgfältiger
 * gebaute: Er darf nicht wie ein Fehler aussehen, sondern wie eine
 * Entscheidung.
 */
export function InsightsPageBody() {
  const { t, locale } = useLocale()
  const copy = t.insightsPage
  const entries = publishedInsights

  return (
    <main>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title}
        crumbLabel={t.nav.insights} lead={copy.lead} />

      <section aria-labelledby="insights-title" className="border-line border-b">
        <div className="section-shell">
          {entries.length === 0 ? (
            <Reveal>
              <h2 id="insights-title" className="type-h3 max-w-2xl text-balance">
                {copy.emptyTitle}
              </h2>
              <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
                {copy.emptyBody}
              </p>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                <Link
                  href="/produkte"
                  className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
                >
                  {copy.emptyCtaProducts}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
                <Link
                  href="/arbeiten"
                  className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
                >
                  {copy.emptyCtaWorks}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </div>
            </Reveal>
          ) : (
            <>
              <h2 id="insights-title" className="sr-only">
                {copy.eyebrow}
              </h2>
              <ul className="flex flex-col">
                {entries.map((entry, i) => (
                  <Reveal key={entry.slug} as="li" delay={0.05 * i} className="group">
                    <article className="border-line relative border-t py-10 md:py-12">
                      <span
                        aria-hidden="true"
                        className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                      />
                      <div className="grid gap-x-10 gap-y-5 md:grid-cols-12 md:items-baseline">
                        <div className="md:col-span-3">
                          <p className="eyebrow text-gold-text">{entry.topic[locale]}</p>
                          <p className="text-meta text-muted-foreground mt-3">{entry.date}</p>
                        </div>
                        <div className="md:col-span-9">
                          <h3 className="type-h4">{entry.title[locale]}</h3>
                          <p className="type-body text-muted-foreground mt-4 max-w-2xl text-pretty">
                            {entry.teaser[locale]}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </ul>
              <div className="border-line border-t" />
            </>
          )}
        </div>
      </section>

      <ClosingCta />
    </main>
  )
}
