"use client"

import { ArrowUpRight, Check } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { packages, retainer, retainerPublished } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

export function Packages() {
  const { t, locale } = useLocale()

  return (
    <section id="pakete" aria-labelledby="pakete-title" className="border-line border-b">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={t.packages.eyebrow} />
            <h2 id="pakete-title" className="type-h2 mt-7 text-balance">
              {t.packages.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {t.packages.lead}
            </p>
          </Reveal>
        </div>

        {/* Preise sind der Moment, in dem Förderung zählt — deshalb hier der Hinweis. */}
        <Reveal delay={0.14}>
          <div className="border-gold/45 bg-muted mt-20 flex flex-col gap-4 border-l-2 py-5 pl-6 md:flex-row md:items-center md:justify-between md:gap-8 md:pr-7">
            <p className="type-body text-foreground/85 max-w-3xl text-pretty">
              {t.packages.funding}
            </p>
            <a
              href="/unternehmen#zertifizierungen"
              className="text-gold-text hover:text-foreground inline-flex shrink-0 items-center gap-2 text-sm tracking-wide transition-colors duration-500"
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
                className={`group border-line relative flex flex-col border-t p-8 transition-[background-color,box-shadow] duration-500 md:p-9 ${
                  // Das empfohlene Paket liegt eine Stufe hoeher — die einzige
                  // Karte der Seite, die den Grund verlaesst.
                  pkg.recommended
                    ? "bg-surface-raised elevation-2 relative z-10"
                    : "hover:bg-foreground/[0.02]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`bg-gold absolute top-0 left-0 h-px transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    pkg.recommended ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />

                <div className="flex items-start justify-between gap-4">
                  <p className="eyebrow text-muted-foreground">
                    {t.packages.tierLabel} {pkg.tier}
                  </p>
                  {pkg.recommended && (
                    <span className="border-gold text-gold-text eyebrow shrink-0 border px-2.5 py-1">
                      {t.packages.recommended}
                    </span>
                  )}
                </div>

                {/*
                  Feste Hoehe fuer den Namen: „Growth Partner" bricht auf zwei
                  Zeilen um, „Identity" nicht — ohne Reserve sassen die drei
                  Preise auf drei verschiedenen Hoehen und liessen sich nicht
                  mehr vergleichen. Genau das soll eine Preistabelle koennen.
                */}
                <h3 className="type-h3 mt-5 lg:min-h-[2.24em]">{copy.name}</h3>

                <div className="mt-6 flex items-baseline gap-2.5">
                  <span className="type-stat">{pkg.price}</span>
                  <span className="eyebrow text-muted-foreground">
                    {isMonthly ? t.packages.monthly : t.packages.once}
                  </span>
                </div>

                {/* „Für wen" — Zeile aus der bisherigen Live-Seite übernommen. */}
                <div className="border-line mt-8 border-t pt-6">
                  <p className="eyebrow text-muted-foreground group-hover:text-gold-text transition-colors duration-500">
                    {t.packages.forWhom}
                  </p>
                  {/* Zweizeilige Reserve, gleiche Begruendung wie beim Namen. */}
                  <p className="type-body text-foreground/85 mt-3 text-pretty lg:min-h-[3.4em]">
                    {copy.who}
                  </p>
                  <p className="type-body text-gold-text mt-4 flex gap-2 text-pretty">
                    <span aria-hidden="true">→</span>
                    <span>{copy.outcome}</span>
                  </p>
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-3.5">
                  {copy.includes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="text-gold mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                      <span className="type-small text-muted-foreground text-pretty">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-muted-foreground text-meta mt-8">
                  {copy.note}
                </p>

                {/* Führt wie auf der alten Seite in den Termin-Wizard. */}
                <a
                  href={`/termin?paket=${pkg.key}`}
                  className={
                    pkg.recommended
                      ? "from-gold-soft to-gold group/cta relative mt-7 inline-flex items-center justify-between gap-2 overflow-hidden bg-gradient-to-br px-5 py-3.5 text-sm tracking-wide text-[#201e1b]"
                      : "border-line-strong hover:border-gold hover:text-gold-text mt-7 inline-flex items-center justify-between gap-2 border px-5 py-3.5 text-sm tracking-wide transition-colors duration-500"
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

        {/*
          Laufende Betreuung (E-K6). Sie stand bisher als „Ops-Retainer" in
          einer Fusszeile der Werkschau — dabei ist sie das, was creaDIG von
          einer Agentur unterscheidet, die uebergibt und verschwindet.

          Erscheint erst, wenn Preis UND Leistungsumfang bestaetigt sind
          (lib/site-data.ts -> retainer). Einen Retainer zu bewerben, dessen
          Umfang niemand festgelegt hat, waere ein Versprechen ohne Substanz.
        */}
        {retainerPublished && retainer.description && (
          <Reveal delay={0.1}>
            <div className="border-gold/45 bg-muted mt-20 grid gap-10 border-l-2 px-7 py-9 md:px-10 md:py-11 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <p className="eyebrow text-gold-text">{t.packages.retainerEyebrow}</p>
                <h3 className="type-h3 mt-5 text-balance">{t.packages.retainerTitle}</h3>
                <p className="type-body text-foreground/85 mt-6 max-w-2xl text-pretty">
                  {retainer.description[locale]}
                </p>
                {retainer.includes && (
                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {retainer.includes[locale].map((item) => (
                      <li key={item} className="flex gap-3">
                        <Check className="text-gold mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                        <span className="type-small text-muted-foreground text-pretty">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col justify-end lg:col-span-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="eyebrow text-muted-foreground">
                    {t.packages.retainerFrom}
                  </span>
                  <span className="type-stat">{retainer.price}</span>
                  <span className="eyebrow text-muted-foreground">{t.packages.monthly}</span>
                </div>
                <a
                  href="/termin?paket=retainer"
                  className="border-line-strong hover:border-gold hover:text-gold-text mt-7 inline-flex items-center justify-between gap-2 self-start border px-6 py-3.5 text-sm tracking-wide transition-colors duration-500"
                >
                  {t.packages.retainerCta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
