"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { publishedInsights } from "@/lib/insights"

/**
 * Insights-Anriss auf der Startseite (PHASE A, Master-Prompt 4 §4.10).
 *
 * Gated wie Kundenfälle und Bewertungen: Solange nichts veröffentlicht ist,
 * rendert die Sektion gar nichts. Kein „Demnächst", keine grauen
 * Platzhalter-Karten — eine leere Sektion auf der Startseite ist der
 * schnellste Weg, eine Seite unfertig aussehen zu lassen.
 *
 * Sobald die erste Notiz steht, erscheinen bis zu drei — ohne Code-Änderung.
 */
const MAX_TEASERS = 3

export function InsightsTeaser() {
  const { t, locale } = useLocale()
  const copy = t.home.insights
  const entries = publishedInsights.slice(0, MAX_TEASERS)

  if (entries.length === 0) return null

  return (
    <section id="insights" aria-labelledby="insights-teaser-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="insights-teaser-title" className="type-h3 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:pb-2 lg:text-right">
            <Link
              href="/insights"
              className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.cta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>

        <ul className="bg-line border-line mt-16 grid gap-px border md:grid-cols-3">
          {entries.map((entry, i) => (
            <Reveal key={entry.slug} as="li" delay={0.06 * i} className="flex">
              <Link
                href="/insights"
                className="group bg-background hover:bg-surface flex w-full flex-col gap-4 p-7 transition-colors duration-500"
              >
                <p className="eyebrow text-gold-text">{entry.topic[locale]}</p>
                <h3 className="type-h4">{entry.title[locale]}</h3>
                <p className="type-small text-muted-foreground text-pretty">
                  {entry.teaser[locale]}
                </p>
                <p className="text-meta text-muted-foreground mt-auto pt-4">{entry.date}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
