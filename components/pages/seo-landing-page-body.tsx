"use client"

import { ArrowUpRight, Check } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ClosingCta } from "@/components/sections/closing-cta"
import { landingService, type SeoLanding } from "@/lib/seo-landings"

/**
 * MP10-5 — der Koerper einer SEO-Landing.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE ZEIGT UND WORAUS
 * Nur zwei Quellen: den eigenen Text der Landing (`h1`, `lead`, `body`) und
 * die Leistungsseite dahinter (`includes`). Nichts wird hier zusaetzlich
 * behauptet — die Landing ist ein anderer Einstieg in dieselbe Leistung, kein
 * zweites Angebot mit eigenen Versprechen.
 *
 * Deshalb steht am Ende auch ein Weg auf die vollstaendige Leistungsseite und
 * nicht nur ein Formular: Wer ueber einen Suchbegriff hereinkommt, hat die
 * Frage „ist das dieselbe Firma, die auch den Rest macht" noch offen.
 */
export function SeoLandingPageBody({ landing }: { landing: SeoLanding }) {
  const { t, locale } = useLocale()
  const service = landingService(landing)
  const copy = t.servicePage

  return (
    <main>
      <PageHeader
        eyebrow={service ? service.chip[locale] : t.nav.leistungen}
        title={landing.h1[locale]}
        crumbLabel={landing.h1[locale]}
        lead={landing.lead[locale]}
        crumbs={[{ label: t.nav.leistungen, href: "/leistungen" }]}
      />

      <section aria-labelledby="landing-text" className="border-line border-b">
        <div className="section-shell">
          <h2 id="landing-text" className="sr-only">
            {landing.h1[locale]}
          </h2>
          <div className="flex max-w-3xl flex-col gap-7">
            {landing.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className="type-body text-muted-foreground text-pretty">{paragraph[locale]}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Was dazugehoert — dieselbe Liste wie auf der Leistungsseite. */}
      {service && (
        <section aria-labelledby="landing-umfang" className="bg-surface border-line border-b">
          <div className="section-shell">
            <Reveal>
              <SectionEyebrow label={copy.includesLabel} />
              <h2 id="landing-umfang" className="sr-only">
                {copy.includesLabel}
              </h2>
            </Reveal>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2">
              {service.includes[locale].map((item, i) => (
                <Reveal key={item} as="li" delay={0.03 * i} className="flex gap-3">
                  <Check className="text-gold mt-1 size-4 shrink-0" strokeWidth={1.5} />
                  <span className="type-body text-muted-foreground text-pretty">{item}</span>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.12}>
              <Link
                href={`/leistungen/${service.slug}`}
                className="group text-gold-text hover:text-foreground border-line mt-14 inline-flex items-center gap-2 border-t pt-6 text-sm tracking-wide transition-colors duration-500"
              >
                {service.h1[locale]}
                <ArrowUpRight
                  className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <ClosingCta variant="prices" />
    </main>
  )
}
