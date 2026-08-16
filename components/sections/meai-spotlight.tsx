"use client"

import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { meaiCapabilityKeys } from "@/lib/site-data"

/** Dunkle Vollbild-Sektion. Flagship-Drama für meAI. */
export function MeaiSpotlight() {
  const { t } = useLocale()

  return (
    <section id="meai" aria-labelledby="meai-title" className="section-dark relative overflow-hidden">
      <div aria-hidden="true" className="hairline-grid absolute inset-0 opacity-25" />
      <div
        aria-hidden="true"
        className="via-gold/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[100rem] px-6 py-28 md:px-10 md:py-36 lg:px-16">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Text */}
          <div className="lg:col-span-6">
            <Reveal className="flex items-center gap-4">
              <span aria-hidden="true" className="bg-gold h-px w-10" />
              <p className="eyebrow text-gold">{t.meai.eyebrow}</p>
            </Reveal>

            <Reveal delay={0.05}>
              <h2
                id="meai-title"
                className="text-display mt-8 text-[clamp(2.25rem,6vw,5rem)] text-balance"
              >
                {t.meai.title}
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-foreground/80 mt-8 max-w-xl text-base leading-relaxed text-pretty md:text-lg">
                {t.meai.lead}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="border-gold/40 mt-10 border-l pl-6">
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed text-pretty md:text-base">
                  {t.meai.dna}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10">
                <MagneticButton href="https://meai.run" target="_blank" variant="ghost">
                  {t.meai.cta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </MagneticButton>
              </div>
            </Reveal>
          </div>

          {/* Produkt-Andeutung: Dashboard-Rahmen */}
          <Reveal delay={0.12} className="lg:col-span-6">
            <div className="border-line bg-surface relative border">
              {/* Fensterleiste */}
              <div className="border-line flex items-center gap-2 border-b px-5 py-3.5">
                <span aria-hidden="true" className="bg-gold size-1.5 rounded-full" />
                <span aria-hidden="true" className="bg-line-strong size-1.5 rounded-full" />
                <span aria-hidden="true" className="bg-line-strong size-1.5 rounded-full" />
                <span className="text-muted-foreground ml-3 font-mono text-[0.6875rem] tracking-wider">
                  meai.run
                </span>
              </div>

              <div className="grid gap-px sm:grid-cols-2">
                {meaiCapabilityKeys.map((key, i) => {
                  const copy = t.meai.capabilities[key]
                  return (
                    <div
                      key={key}
                      className="group border-line hover:bg-surface-raised relative border-t border-r p-7 transition-colors duration-500 sm:last:border-r-0 sm:[&:nth-child(2)]:border-r-0"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                      />
                      <span className="text-line-strong group-hover:text-gold font-mono text-[0.625rem] tracking-[0.16em] transition-colors duration-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-display mt-4 text-xl">{copy.name}</h3>
                      <p className="text-muted-foreground mt-3 text-sm leading-relaxed text-pretty">
                        {copy.what}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
