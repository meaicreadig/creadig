"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Das Unternehmen — kurz (PHASE A, Master-Prompt 4 §4.9).
 *
 * Die ausführliche „Über uns"-Sektion mit Gründer, Netzwerk, Schwerpunkten
 * und Ehrlichkeits-Satz lebt auf /unternehmen. Hier steht der Anriss: der
 * Titel, drei Sätze, ein Link.
 *
 * VIS-5 — hier standen bis eben dieselben vier Signale noch einmal, die das
 * Impact-Band zwei Sektionen weiter oben schon als Bühne zeigt. Zwei
 * Darstellungen derselben vier Aussagen auf einer Seite lesen sich nicht als
 * Betonung, sondern als Wiederholung: Beim zweiten Mal überspringt man sie,
 * und rückwirkend war auch das erste Mal nicht wichtig. Die Signale gehören
 * ins Fundament-Band — dort haben sie Platz und Kontext. Hier steht jetzt,
 * was nur hier steht.
 */
export function CompanyTeaser() {
  const { t } = useLocale()
  const copy = t.home.company

  return (
    <section id="unternehmen" aria-labelledby="unternehmen-title" className="border-line border-b">
      <div className="section-shell-tight">
        <div className="grid gap-x-14 gap-y-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-5">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="unternehmen-title" className="type-h3 mt-7 max-w-md text-balance">
              {copy.title}
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
            <p className="type-lead text-muted-foreground max-w-xl text-pretty">
              {copy.body}
            </p>
            <Link
              href="/unternehmen"
              className="text-gold-text hover:text-foreground mt-8 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.cta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
