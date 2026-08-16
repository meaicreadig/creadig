"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { processSteps } from "@/lib/site-data"

export function Process() {
  const { t } = useLocale()

  return (
    <section id="prozess" aria-labelledby="prozess-title" className="border-line border-b">
      <div className="mx-auto w-full max-w-[100rem] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <Reveal className="flex items-center gap-4">
          <span aria-hidden="true" className="bg-gold h-px w-10" />
          <p className="eyebrow text-muted-foreground">{t.process.eyebrow}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2
            id="prozess-title"
            className="text-display mt-7 max-w-3xl text-[clamp(2.25rem,6vw,5rem)] text-balance"
          >
            {t.process.title}
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-px md:grid-cols-3">
          {processSteps.map((step, i) => {
            const copy = t.process.steps[step.key]
            return (
              <Reveal
                key={step.key}
                delay={0.08 * i}
                className="group border-line relative border-t pt-8 md:pr-10"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                />
                <span className="text-gold font-mono text-xs tracking-[0.16em]">{step.step}</span>
                <h3 className="text-display mt-6 text-[clamp(1.75rem,3.5vw,2.75rem)]">{copy.name}</h3>
                <p className="text-muted-foreground mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-pretty">
                  {copy.what}
                </p>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="text-display border-line mt-20 max-w-4xl border-t pt-12 text-[clamp(1.25rem,2.6vw,2.25rem)] text-balance">
            {t.process.bridge}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
