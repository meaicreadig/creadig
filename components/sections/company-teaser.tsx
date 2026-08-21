"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { contact, impactSignals } from "@/lib/site-data"

/**
 * Das Unternehmen — kurz (PHASE A, Master-Prompt 4 §4.9).
 *
 * Die ausführliche „Über uns"-Sektion mit Gründer, Netzwerk, Schwerpunkten
 * und Ehrlichkeits-Satz lebt jetzt auf /unternehmen. Hier steht der Anriss:
 * drei Sätze, die Signale, ein Link. Direkt unter dem Standort-Band, sodass
 * Bild und Einordnung zusammen gelesen werden.
 *
 * Die Signale sind dieselben vier wie im Impact-Band — hier als schmale
 * Zeile, dort als Bühne. Zwei Darstellungen, eine Quelle
 * (`site-data.impactSignals`).
 */
export function CompanyTeaser() {
  const { t } = useLocale()
  const copy = t.home.company

  return (
    <section id="unternehmen" aria-labelledby="unternehmen-title" className="border-line border-b">
      <div className="section-shell-tight">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="unternehmen-title" className="type-h3 mt-7 max-w-xl text-balance">
              {copy.title}
            </h2>
            <p className="type-body text-muted-foreground mt-6 max-w-xl text-pretty">
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

          <Reveal delay={0.1} className="lg:col-span-5">
            <dl className="border-line grid grid-cols-2 gap-x-8 gap-y-7 border-t pt-8">
              {impactSignals.map((signal) => (
                <div key={signal.key}>
                  <dt className="eyebrow text-muted-foreground">
                    {t.impact.signals[signal.key].label}
                  </dt>
                  <dd className="text-subhead mt-2.5 text-xl">{signal.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-meta text-muted-foreground mt-8">
              {contact.locations} · {contact.markets}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
