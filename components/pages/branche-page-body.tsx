"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { ClosingCta } from "@/components/sections/closing-cta"
import { genannteClientWorks, productWorks, serviceLayers, workHref } from "@/lib/site-data"
import { handwerkCopy } from "@/lib/branchen"
import { BRANCHEN, brancheText, type Branche } from "@/lib/branchen-weitere"

/**
 * Branchen-Einstieg nach dem Muster von /branchen/handwerk (HandwerkPageBody):
 * Ist gegen Soll, keine Zahl, Referenzen nur mit Namensfreigabe. Ohne eigene
 * Referenz in der Branche fällt der Block weg – kein Lückenfüller.
 */
export function BranchePageBody({ slug }: { slug: string }) {
  const { t, locale } = useLocale()
  const b = BRANCHEN.find((x) => x.slug === slug) as Branche
  const c = handwerkCopy
  const freigegeben = [...genannteClientWorks, ...productWorks]
  const werke = b.works.map((s) => freigegeben.find((w) => w.slug === s)).filter((w) => w !== undefined)
  const andere = [{ slug: "handwerk", eyebrow: c.eyebrow }, ...BRANCHEN.filter((x) => x.slug !== slug)]

  return (
    <main id="inhalt" className="relative">
      <section aria-labelledby="branche-title" className="section-seam">
        <div className="section-gutter relative pt-32 pb-20 md:pt-40 md:pb-24">
          <Reveal>
            <SectionEyebrow label={b.eyebrow[locale]} />
            <h1 id="branche-title" className="type-h1 mt-7 max-w-4xl text-balance">
              {b.title[locale]}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">{b.lead[locale]}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-12 flex flex-wrap gap-4">
              <MagneticButton href="/termin" trackLocation={`branche-${slug}-hero`}>
                {c.talkCta[locale]}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </MagneticButton>
              <MagneticButton href="/betriebscheck" variant="ghost" trackLocation={`branche-${slug}-hero`}>
                {c.checkCta[locale]}
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="branche-workflow-title" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={b.workflowEyebrow[locale]} />
            <h2 id="branche-workflow-title" className="type-h2 mt-7 max-w-2xl text-balance">
              {b.workflowTitle[locale]}
            </h2>
          </Reveal>
          <ol className="mt-16 flex flex-col gap-2.5">
            {b.workflow.map((step, i) => {
              const layer = serviceLayers.find((entry) => entry.key === step.layer)
              return (
                <Reveal key={step.key} as="li" delay={0.05 * i}>
                  <div className="tile bg-background p-7 md:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <div className="flex items-baseline gap-4">
                        <span className="eyebrow text-gold-text">{String(i + 1).padStart(2, "0")}</span>
                        <h3 className="type-h4">{step.label[locale]}</h3>
                      </div>
                      {layer && (
                        <span className="text-meta text-muted-foreground">
                          {c.layerLabel[locale]} {layer.level} · {t.services.layers[layer.key].name}
                        </span>
                      )}
                    </div>
                    <div className="border-line mt-6 grid gap-x-10 gap-y-6 border-t pt-6 md:grid-cols-2">
                      <div>
                        <p className="eyebrow text-muted-foreground">{c.istLabel[locale]}</p>
                        <p className="type-small text-muted-foreground mt-3 text-pretty">{step.ist[locale]}</p>
                      </div>
                      <div>
                        <p className="eyebrow text-gold-text">{c.sollLabel[locale]}</p>
                        <p className="type-small text-foreground/85 mt-3 text-pretty">{step.soll[locale]}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </section>

      <section aria-labelledby="branche-build-title" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-6">
              <SectionEyebrow label={c.buildEyebrow[locale]} />
              <h2 id="branche-build-title" className="type-h2 mt-7 text-balance">
                {b.buildTitle[locale]}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-6">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">{b.buildBody[locale]}</p>
            </Reveal>
          </div>

          {werke.length > 0 && (
            <div className="mt-14">
              <p className="eyebrow text-gold-text">{brancheText.referenzen[locale]}</p>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {werke.map((w) => (
                  <li key={w.slug}>
                    <Link href={workHref(w)} className="tile bg-background group flex h-full flex-col gap-2 p-6">
                      <span className="text-meta text-muted-foreground">
                        {w.eigen ? `${brancheText.eigen[locale]} · ` : ""}
                        {w.sector[locale]}
                      </span>
                      <span className="type-h4 inline-flex items-center gap-2">
                        {w.name}
                        <ArrowUpRight className="size-4 opacity-60 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-14 flex flex-wrap gap-4">
            {b.leistung && (
              <Link href={b.leistung.path} className="cta-quiet inline-flex items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide">
                {b.leistung.label[locale]}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            )}
            <Link href="/leistungen" className="cta-quiet inline-flex items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide">
              {c.buildLayers[locale]}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="border-line mt-16 border-t pt-8">
            <p className="eyebrow text-muted-foreground">{brancheText.alleBranchen[locale]}</p>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {andere.map((x) => (
                <li key={x.slug}>
                  <Link href={`/branchen/${x.slug}`} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {x.eyebrow[locale].replace(/^[^·]*·\s*/, "")}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="type-small text-muted-foreground mt-6 max-w-2xl text-pretty">{brancheText.offen[locale]}</p>
          </div>
        </div>
      </section>

      <ClosingCta variant="sector" />
    </main>
  )
}
