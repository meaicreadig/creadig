"use client"

import { ArrowUpRight } from "lucide-react"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { meaiCapabilityKeys } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/** Dunkle Vollbild-Sektion. Flagship-Drama für meAI. */
export function MeaiSpotlight() {
  const { t } = useLocale()

  return (
    <section id="meai" aria-labelledby="meai-title" className="section-dark relative overflow-hidden">
      <SignatureMotif />
      <div
        aria-hidden="true"
        className="via-gold/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />

      <div className="section-shell-band relative">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Text */}
          <div className="lg:col-span-6">
            <Reveal>
          <SectionEyebrow label={t.meai.eyebrow} />
        </Reveal>

            <Reveal delay={0.05}>
              <h2
                id="meai-title"
                className="type-h2 mt-8 text-balance"
              >
                {t.meai.title}
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="type-lead text-foreground/80 mt-8 max-w-xl text-pretty">
                {t.meai.lead}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="border-gold/45 mt-10 border-l pl-6">
                <p className="type-body text-muted-foreground max-w-xl text-pretty">
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

          {/*
            Was das System kann — als Liste, nicht als Fenster.

            Hier stand bis PHASE B ein Browser-Rahmen: drei Punkte, daneben
            „meai.run", darin diese vier Texte. Das las sich wie ein
            Screenshot der Anwendung und war keiner. Genau diese Sorte
            Andeutung schliesst die Ehrlichkeits-Regel des Projekts aus — und
            eine Produktseite, deren Interface-Sektion hart gated ist, darf
            zwei Bildschirmhoehen weiter unten keinen Fensterrahmen um
            Fliesstext legen. Die Faehigkeiten stehen jetzt als das da, was
            sie sind: vier belegte Saetze.
          */}
          <Reveal delay={0.12} className="lg:col-span-6">
            <div className="border-line bg-surface relative border-t">
              <div className="grid sm:grid-cols-2">
                {meaiCapabilityKeys.map((key, i) => {
                  const copy = t.meai.capabilities[key]
                  return (
                    <div
                      key={key}
                      className="group border-line hover:bg-surface-raised relative border-b p-7 transition-colors duration-[var(--dur-2)] sm:border-r sm:last:border-r-0 sm:[&:nth-child(2)]:border-r-0"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-[var(--dur-3)] group-hover:w-full"
                      />
                      <span className="text-muted-foreground group-hover:text-gold-text text-meta transition-colors duration-[var(--dur-2)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-subhead mt-4 text-xl">{copy.name}</h3>
                      <p className="type-small text-muted-foreground mt-3 text-pretty">
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
