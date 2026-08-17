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
            <h2 id="pakete-title" className="type-h2 mt-7 text-balance">
              {t.packages.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="text-muted-foreground max-w-md text-base leading-relaxed text-pretty md:text-lg">
              {t.packages.lead}
            </p>
          </Reveal>
        </div>

        {/* Preise sind der Moment, in dem Förderung zählt — deshalb hier der Hinweis. */}
        <Reveal delay={0.14}>
          <div className="border-gold/45 bg-gold/[0.045] mt-14 flex flex-col gap-4 border-l-2 py-5 pl-6 md:flex-row md:items-center md:justify-between md:gap-8 md:pr-7">
            <p className="text-foreground/85 max-w-3xl text-[0.9375rem] leading-relaxed text-pretty">
              {t.packages.funding}
            </p>
            <a
              href="#zertifizierungen"
              className="text-gold hover:text-gold-deep inline-flex shrink-0 items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {t.packages.fundingLink}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </a>
          </div>
        </Reveal>

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
                  <h3 className="type-h3">{copy.name}</h3>
                  {pkg.recommended && (
                    <span className="border-gold text-gold shrink-0 border px-2.5 py-1 font-mono text-[0.5625rem] tracking-[0.14em] uppercase">
                      {t.packages.recommended}
                    </span>
                  )}
                </div>

                <div className="mt-8 flex items-baseline gap-2.5">
                  <span className="type-stat">{pkg.price}</span>
                  <span className="text-muted-foreground text-xs tracking-[0.1em] uppercase">
                    {isMonthly ? t.packages.monthly : t.packages.once}
                  </span>
                </div>

                {/* „Für wen" — Zeile aus der bisherigen Live-Seite übernommen. */}
                <div className="border-line mt-8 border-t pt-6">
                  <p className="eyebrow text-line-strong group-hover:text-gold transition-colors duration-500">
                    {t.packages.forWhom}
                  </p>
                  <p className="text-foreground/85 mt-3 text-[0.9375rem] leading-relaxed text-pretty">
                    {copy.who}
                  </p>
                  <p className="text-gold mt-4 flex gap-2 text-[0.9375rem] leading-relaxed text-pretty">
                    <span aria-hidden="true">→</span>
                    <span>{copy.outcome}</span>
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

                {/* Führt wie auf der alten Seite in den Termin-Wizard. */}
                <a
                  href={`/termin?paket=${pkg.key}`}
                  className={
                    pkg.recommended
                      ? "from-gold-soft to-gold group/cta relative mt-7 inline-flex items-center justify-between gap-2 overflow-hidden bg-gradient-to-br px-5 py-3.5 text-sm tracking-wide text-[#201e1b]"
                      : "border-line-strong hover:border-gold hover:text-gold mt-7 inline-flex items-center justify-between gap-2 border px-5 py-3.5 text-sm tracking-wide transition-colors duration-500"
                  }
                >
                  {pkg.recommended && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0"
                    />
                  )}
                  <span className="group-hover/cta:text-gold-soft relative z-10 flex w-full items-center justify-between gap-2 transition-colors duration-500">
                    {copy.cta}
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </span>
                </a>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
