"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { contact } from "@/lib/site-data"

export function About() {
  const { t } = useLocale()

  return (
    <section id="ueber-uns" aria-labelledby="ueber-title" className="border-line border-b">
      <div className="mx-auto w-full max-w-[100rem] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <Reveal className="flex items-center gap-4">
          <span aria-hidden="true" className="bg-gold h-px w-10" />
          <p className="eyebrow text-muted-foreground">{t.about.eyebrow}</p>
        </Reveal>

        <div className="mt-7 grid gap-x-12 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 id="ueber-title" className="type-h2 text-balance">
                {t.about.title}
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-10 flex flex-col gap-6">
                <p className="type-lead text-foreground/85 max-w-2xl text-pretty">
                  {t.about.body1}
                </p>
                <p className="text-muted-foreground max-w-2xl text-base leading-relaxed text-pretty">
                  {t.about.body2}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="type-small border-line text-muted-foreground mt-12 border-t pt-6 text-pretty">
                {t.about.honesty}
              </p>
            </Reveal>
          </div>

          {/* Faktenspalte: Gründer, Schwerpunkte, Sitz */}
          <div className="flex flex-col gap-px lg:col-span-5">
            <Reveal delay={0.06} className="border-line border-t pt-7">
              <p className="eyebrow text-gold-text">{t.about.founderLabel}</p>
              <p className="type-statement mt-4">
                {t.about.founder}
              </p>
            </Reveal>

            <Reveal delay={0.12} className="border-line mt-10 border-t pt-7">
              <p className="eyebrow text-gold-text">{t.about.nicheLabel}</p>
              <ul className="mt-5 flex flex-col gap-4">
                {t.about.niches.map((niche) => (
                  <li key={niche} className="flex gap-3.5">
                    <span aria-hidden="true" className="bg-gold mt-2.5 h-px w-5 shrink-0" />
                    <span className="type-body text-foreground/85 text-pretty">
                      {niche}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.18} className="border-line mt-10 border-t pt-7">
              <p className="eyebrow text-gold-text">{t.about.locationsLabel}</p>
              <address className="type-small text-foreground/85 mt-4 not-italic">
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="eyebrow text-gold-text mt-7">{t.about.marketsLabel}</p>
              <p className="type-small text-foreground/85 mt-3">{contact.markets}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
