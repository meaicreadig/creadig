"use client"

import { ArrowUpRight, Check } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { packages } from "@/lib/site-data"

export function Packages() {
  const { t } = useLocale()

  return (
    <section id="pakete" aria-labelledby="pakete-title" className="border-line border-b">
      <div className="mx-auto w-full max-w-[100rem] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="bg-gold h-px w-10" />
              <p className="eyebrow text-muted-foreground">{t.packages.eyebrow}</p>
            </div>
            <h2 id="pakete-title" className="text-display mt-7 text-[clamp(2.25rem,6vw,5rem)] text-balance">
              {t.packages.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="text-muted-foreground max-w-md text-base leading-relaxed text-pretty md:text-lg">
              {t.packages.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-px lg:grid-cols-3">
          {packages.map((pkg, i) => {
            const copy = t.packages.items[pkg.key]
            const isMonthly = pkg.key !== "identity"

            return (
              <Reveal
                key={pkg.key}
                delay={0.08 * i}
                className={`group border-line relative flex flex-col border-t p-8 transition-colors duration-500 md:p-9 ${
                  pkg.recommended ? "bg-foreground/[0.035]" : "hover:bg-foreground/[0.02]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`bg-gold absolute top-0 left-0 h-px transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    pkg.recommended ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />

                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-display text-[clamp(1.5rem,2.4vw,2rem)]">{copy.name}</h3>
                  {pkg.recommended && (
                    <span className="border-gold text-gold shrink-0 border px-2.5 py-1 font-mono text-[0.5625rem] tracking-[0.14em] uppercase">
                      {t.packages.recommended}
                    </span>
                  )}
                </div>

                <div className="mt-8 flex items-baseline gap-2.5">
                  <span className="text-display text-[clamp(2.5rem,4.5vw,3.5rem)]">{pkg.price}</span>
                  <span className="text-muted-foreground text-xs tracking-[0.1em] uppercase">
                    {isMonthly ? t.packages.monthly : t.packages.once}
                  </span>
                </div>

                <div className="border-line mt-8 border-t pt-6">
                  <p className="eyebrow text-line-strong group-hover:text-gold transition-colors duration-500">
                    {t.packages.forWhom}
                  </p>
                  <p className="text-foreground/85 mt-3 text-[0.9375rem] leading-relaxed text-pretty">
                    {copy.who}
                  </p>
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-3.5">
                  {copy.includes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="text-gold mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                      <span className="text-muted-foreground text-sm leading-relaxed text-pretty">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-muted-foreground mt-8 font-mono text-[0.6875rem] tracking-wide">
                  {copy.note}
                </p>

                <a
                  href="#kontakt"
                  className="border-line-strong hover:border-gold hover:text-gold mt-7 inline-flex items-center justify-between gap-2 border px-5 py-3.5 text-sm tracking-wide transition-colors duration-500"
                >
                  {t.packages.cta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </a>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
