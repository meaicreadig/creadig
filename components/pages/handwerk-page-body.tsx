"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { ClosingCta } from "@/components/sections/closing-cta"
import { serviceLayers } from "@/lib/site-data"
import { HANDWERK_WORKFLOW, handwerkCopy } from "@/lib/branchen"

/**
 * MP-E · `/branchen/handwerk` — der vertikale Einstieg.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESE SEITE TUT
 * Sie verkauft nichts. Sie beschreibt einen Ablauf so, dass ein Betrieb sich
 * wiedererkennt, und bietet dann das einzige an, was ohne Gespräch geht: den
 * Betriebscheck. Der Weg ist Landing → Check → Lead, nicht Landing → Formular.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE ZWEI SPALTEN
 * „Wie es meistens läuft" gegen „Wie es laufen kann" ist keine Optik, sondern
 * die Struktur des Canon: Problem → System. Wer nur das Soll zeigt, verkauft
 * eine Vorstellung; wer nur das Ist zeigt, macht Angst. Nebeneinander ist es
 * eine Einordnung — und die darf der Leser ablehnen.
 *
 * ---------------------------------------------------------------------------
 * KEINE ZAHL AUF DIESER SEITE
 * Keine Prozente, keine Stundenersparnis, kein Handwerks-Kunde. creaDIG hat
 * heute keine veröffentlichte Handwerks-Referenz — und eine Landing, die das
 * verschweigt und trotzdem Vertrauen einsammelt, wäre Fake-Proof. Die einzige
 * Zahl auf dem Weg entsteht im Check, und sie kommt vom Besucher selbst.
 */
export function HandwerkPageBody() {
  const { t, locale } = useLocale()
  const copy = handwerkCopy

  return (
    <main id="inhalt" className="relative">
      {/* ── Kopf ── */}
      <section aria-labelledby="handwerk-title" className="section-seam">
        <div className="section-gutter relative pt-32 pb-20 md:pt-40 md:pb-24">
          <Reveal>
            <SectionEyebrow label={copy.eyebrow[locale]} />
            <h1 id="handwerk-title" className="type-h1 mt-7 max-w-4xl text-balance">
              {copy.title[locale]}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">
              {copy.lead[locale]}
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-12 flex flex-wrap gap-4">
              <MagneticButton href="/betriebscheck" trackLocation="handwerk-hero">
                {copy.checkCta[locale]}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </MagneticButton>
              <MagneticButton href="/termin" variant="ghost" trackLocation="handwerk-hero">
                {copy.talkCta[locale]}
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Der Bruch: sechs Schritte, Ist gegen Soll ── */}
      <section aria-labelledby="handwerk-workflow-title" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={copy.workflowEyebrow[locale]} />
              <h2 id="handwerk-workflow-title" className="type-h2 mt-7 max-w-2xl text-balance">
                {copy.workflowTitle[locale]}
              </h2>
            </Reveal>
          </div>

          <ol className="mt-16 flex flex-col gap-2.5">
            {HANDWERK_WORKFLOW.map((step, i) => {
              const layer = serviceLayers.find((entry) => entry.key === step.layer)
              return (
                <Reveal key={step.key} as="li" delay={0.05 * i}>
                  <div className="tile bg-background p-7 md:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <div className="flex items-baseline gap-4">
                        <span className="eyebrow text-gold-text">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="type-h4">{step.label[locale]}</h3>
                      </div>
                      {/*
                        Die Ebene steht dran, weil sie den Bogen zum Rest der
                        Seite schlägt: Der Check misst dieselben fünf.
                      */}
                      {layer && (
                        <span className="text-meta text-muted-foreground">
                          {copy.layerLabel[locale]} {layer.level} ·{" "}
                          {t.services.layers[layer.key].name}
                        </span>
                      )}
                    </div>

                    <div className="border-line mt-6 grid gap-x-10 gap-y-6 border-t pt-6 md:grid-cols-2">
                      <div>
                        <p className="eyebrow text-muted-foreground">{copy.istLabel[locale]}</p>
                        <p className="type-small text-muted-foreground mt-3 text-pretty">
                          {step.ist[locale]}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow text-gold-text">{copy.sollLabel[locale]}</p>
                        <p className="type-small text-foreground/85 mt-3 text-pretty">
                          {step.soll[locale]}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ── Die Brücke zum Check ── */}
      <section aria-labelledby="handwerk-bridge-title" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={copy.bridgeEyebrow[locale]} />
              <h2 id="handwerk-bridge-title" className="type-h2 mt-7 text-balance">
                {copy.bridgeTitle[locale]}
              </h2>
              <p className="type-body text-muted-foreground mt-7 max-w-xl text-pretty">
                {copy.bridgeBody[locale]}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <MagneticButton href="/betriebscheck" trackLocation="handwerk-bridge">
                  {copy.checkCta[locale]}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Was danach gebaut wird ── */}
      <section aria-labelledby="handwerk-build-title" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-6">
              <SectionEyebrow label={copy.buildEyebrow[locale]} />
              <h2 id="handwerk-build-title" className="type-h2 mt-7 text-balance">
                {copy.buildTitle[locale]}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-6">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {copy.buildBody[locale]}
              </p>
            </Reveal>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link
              href="/leistungen/website-handwerk"
              className="cta-quiet inline-flex items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide"
            >
              {copy.buildWebsite[locale]}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/leistungen"
              className="cta-quiet inline-flex items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide"
            >
              {copy.buildLayers[locale]}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/arbeiten"
              className="cta-quiet inline-flex items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide"
            >
              {copy.buildWorks[locale]}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      <ClosingCta />
    </main>
  )
}
