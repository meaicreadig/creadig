"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { impactSignals } from "@/lib/site-data"

/** Dunkle Vollbild-Sektion. Größe ohne erfundene Zahlen. */
export function ImpactBand() {
  const { t } = useLocale()

  return (
    <section id="fundament" className="section-dark relative overflow-hidden">
      <div aria-hidden="true" className="hairline-grid absolute inset-0 opacity-30" />
      <div
        aria-hidden="true"
        className="via-gold/60 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[100rem] px-6 py-28 md:px-10 md:py-36 lg:px-16">
        <Reveal className="flex items-center gap-4">
          <span aria-hidden="true" className="bg-gold h-px w-10" />
          <p className="eyebrow text-muted-foreground">{t.impact.eyebrow}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="text-display mt-8 max-w-4xl text-[clamp(2.25rem,6vw,5rem)] text-balance">
            {t.impact.title}
          </h2>
        </Reveal>

        <div className="border-line mt-20 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
          {impactSignals.map((signal, i) => {
            const copy = t.impact.signals[signal.key]
            return (
              <Reveal
                key={signal.key}
                delay={0.08 * i}
                className="border-line group relative border-t pt-8 sm:pr-8 lg:border-r lg:last:border-r-0"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                />
                <p className="eyebrow text-gold">{copy.label}</p>
                <p className="text-display mt-5 text-[clamp(2.5rem,4.5vw,4rem)]">{signal.value}</p>
                <p className="text-muted-foreground mt-5 max-w-xs text-sm leading-relaxed text-pretty">
                  {copy.detail}
                </p>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="border-line text-muted-foreground mt-20 border-t pt-8 text-base md:text-lg">
            {t.impact.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
