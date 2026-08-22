"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { featuredWorks, workHref } from "@/lib/site-data"

/**
 * Ausgewählte Arbeiten — früh und groß (PHASE A, Master-Prompt 4 §4.3).
 *
 * Die wichtigste Umstellung der neuen Startseite: Arbeit kommt VOR der
 * Erklärung. Vorher stand die Werkschau hinter Impact-Band, Logo-Wand und
 * Leistungen — wer wissen wollte, ob wir etwas können, musste sich durch drei
 * Sektionen Behauptung lesen. Jetzt steht sie an dritter Stelle, groß, und
 * führt weiter auf /arbeiten.
 *
 * Groß heißt hier wörtlich: volle Breite, ein Werk pro Zeile, Bild und Text
 * abwechselnd. Kleine Karten hätten dieselben drei Arbeiten gezeigt und
 * nichts bewiesen.
 *
 * Gated: Die Sektion rendert nur, was in `featuredWorks` wirklich aufgelöst
 * werden konnte — und die Abbildungen tragen weiterhin den Hinweis, dass sie
 * illustrative Mockups sind und keine Screenshots.
 */
export function SelectedWork() {
  const { t } = useLocale()
  const copy = t.home.work

  if (featuredWorks.length === 0) return null

  return (
    <section id="arbeiten" aria-labelledby="arbeiten-title" className="border-line border-b">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="arbeiten-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:pb-3 lg:text-right">
            <Link
              href="/arbeiten"
              className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.cta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>

        <ul className="mt-20 flex flex-col gap-16 md:gap-24">
          {featuredWorks.map((work, i) => (
            <Reveal key={work.slug} as="li" delay={0.04 * i}>
              <Link
                href={workHref(work)}
                className="group grid gap-x-12 gap-y-8 md:grid-cols-12 md:items-center"
              >
                {/* Abwechselnde Seite: gerade Zeilen Bild links, ungerade rechts.
                    Der Wechsel ist der Rhythmus dieser Sektion — vier gleich
                    ausgerichtete Zeilen wären wieder ein Raster. */}
                <div
                  className={`relative aspect-[16/10] overflow-hidden md:col-span-7 ${
                    i % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  {work.image ? (
                    <Image
                      src={work.image}
                      alt={`${work.name} — ${work.what}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 58vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="bg-surface absolute inset-0 flex items-center justify-center">
                      <SignatureMotif
                        direction="center"
                        className="motif-placeholder pointer-events-none absolute inset-0 h-full w-full"
                      />
                      <span
                        aria-hidden="true"
                        className="border-gold/40 text-gold text-display flex size-20 items-center justify-center border text-2xl"
                      >
                        {work.mark}
                      </span>
                    </div>
                  )}
                  <span
                    aria-hidden="true"
                    className="border-line pointer-events-none absolute inset-0 border"
                  />
                </div>

                <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <p className="eyebrow text-muted-foreground">
                    {work.kind} · {work.sector}
                  </p>
                  <h3 className="type-h3 mt-5">{work.name}</h3>
                  <p className="type-lead text-muted-foreground mt-6 max-w-md text-pretty">
                    {work.what}
                  </p>
                  {/* Ohne belegten Umfang keine leere Zeile mit Label. */}
                  {work.built && (
                    <p className="type-small text-foreground/85 border-line mt-8 max-w-md border-t pt-6 text-pretty">
                      <span className="text-gold-text">{t.portfolio.built}: </span>
                      {work.built}
                    </p>
                  )}
                  <span className="text-gold-text mt-8 inline-flex items-center gap-2 text-sm tracking-wide">
                    {work.name}
                    <ArrowRight
                      className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>

        {/* Der Hinweis reist mit den Bildern mit — wo eine Abbildung steht,
            steht auch, was sie ist. */}
        <Reveal delay={0.1}>
          <p className="text-muted-foreground/80 text-meta border-line mt-20 border-t pt-6">
            {t.portfolio.mockupNote}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
