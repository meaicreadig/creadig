"use client"

import { SignatureMotif } from "@/components/brand/signature-motif"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { impactFacts, publishedImpactFigures } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Dunkle Vollbild-Sektion. Größe ohne erfundene Zahlen.
 *
 * VIS-5 — hier standen vier gleich große Kennziffern nebeneinander: „2017",
 * „4", „DE / CH" und „A–Z". Die letzten beiden sind keine Zahlen. In
 * Ziffern-Größe gesetzt behaupteten sie eine Messbarkeit, die es nicht gibt,
 * und machten die zwei echten Zahlen wertlos — wenn alles eine Kennzahl ist,
 * ist keine mehr eine.
 *
 * Jetzt tragen die Zahlen die obere Reihe und die Aussagen die untere. Zwei
 * Ebenen, sichtbar unterschieden, aus derselben Quelle
 * (`site-data.impactFigures` / `impactFacts`).
 */
export function ImpactBand() {
  const { t } = useLocale()

  return (
    <section id="fundament" className="section-dark relative overflow-hidden">
      <SignatureMotif
        direction="up"
        density={0.5}
        className="motif-band pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        aria-hidden="true"
        className="via-gold/60 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />

      <div className="section-shell-band relative">
        <Reveal>
          <SectionEyebrow label={t.impact.eyebrow} />
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="type-h2 mt-7 max-w-4xl text-balance">
            {t.impact.title}
          </h2>
        </Reveal>

        {/*
          Ein Raster, zwei Ebenen. Die Zahlen stehen links und tragen die
          Kennziffern-Schrift; die Aussagen stehen rechts und lesen sich als
          Satz. Die Trennung entsteht durch den Schriftgrad, nicht durch zwei
          getrennte Bloecke — die Reihe soll eine Reihe bleiben.
        */}
        <div className="border-line mt-20 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
          {/*
            V2-4c — nur Kennziffern mit belegtem Wert. Drei weitere Gefaesse
            stehen in `site-data` bereit (produktive Systeme, automatisierte
            Vorgaenge, Jahre im Betrieb) und sind `null`; sie erscheinen,
            sobald der Owner echte Zahlen liefert, und bis dahin nicht.
          */}
          {publishedImpactFigures.map((figure, i) => {
            const copy = t.impact.figures[figure.key as keyof typeof t.impact.figures]
            return (
              <Reveal
                key={figure.key}
                delay={0.08 * i}
                className="border-line group relative border-t pt-8 lg:border-r lg:pr-8"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                />
                <p className="eyebrow text-gold-text">{copy.label}</p>
                {/* Gemeinsame Mindesthoehe mit den Aussagen, damit alle vier Detailzeilen auf einer Linie beginnen. */}
                <p className="type-stat mt-5 lg:min-h-[3rem]">{figure.value}</p>
                <p className="type-small text-muted-foreground mt-5 max-w-xs text-pretty">
                  {copy.detail}
                </p>
              </Reveal>
            )
          })}

          {impactFacts.map((key, i) => {
            const copy = t.impact.facts[key]
            return (
              <Reveal
                key={key}
                delay={0.08 * (i + publishedImpactFigures.length)}
                className="border-line group relative border-t pt-8 lg:border-r lg:pr-8 lg:last:border-r-0"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                />
                <p className="eyebrow text-muted-foreground">{copy.label}</p>
                <p className="text-subhead mt-5 max-w-[14ch] text-xl text-pretty lg:min-h-[3rem]">
                  {copy.value}
                </p>
                <p className="type-small text-muted-foreground mt-5 max-w-xs text-pretty">
                  {copy.detail}
                </p>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="type-lead border-line text-muted-foreground mt-20 border-t pt-8">
            {t.impact.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
