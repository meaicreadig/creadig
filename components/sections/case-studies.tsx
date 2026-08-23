"use client"

import Image from "next/image"

import { useLocale } from "@/components/locale-provider"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { Reveal } from "@/components/ui/reveal"
import { approvedCaseStudies } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Kundenfälle im Format Problem → Lösung → Ergebnis.
 *
 * Die Sektion rendert NICHTS, solange keine freigegebene Case-Study
 * vorliegt — keine Platzhalter, keine „Demnächst"-Kachel, keine erfundenen
 * Beispiele. Eine leere Sektion ist ehrlicher als eine gefüllte, die nicht
 * stimmt; und sie verschwindet spurlos, bis der Owner Freigaben liefert
 * (siehe lib/site-data.ts → caseStudies).
 */
export function CaseStudies() {
  const { t, locale } = useLocale()

  if (approvedCaseStudies.length === 0) return null

  return (
    <section id="kundenfaelle" aria-labelledby="kundenfaelle-title" className="border-line border-b">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={t.cases.eyebrow} />
            <h2 id="kundenfaelle-title" className="type-h2 mt-7 text-balance">
              {t.cases.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {t.cases.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-20 flex flex-col gap-px">
          {approvedCaseStudies.map((study, i) => (
            <Reveal
              key={study.slug}
              delay={0.06 * i}
              className="group border-line relative border-t pt-10"
            >
              <span
                aria-hidden="true"
                className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
              />

              <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                {/* Kunde + Bild bzw. Monogramm */}
                <div className="lg:col-span-4">
                  <h3 className="type-h3">{study.client}</h3>
                  <p className="eyebrow text-gold-text mt-4">{study.context[locale]}</p>

                  <div className="border-line bg-surface relative mt-8 aspect-[16/10] overflow-hidden border">
                    {study.image ? (
                      /*
                        TECH-6 / A10-1: Hier stand ein rohes <img> — das
                        einzige im Projekt, das eine grosse Aufnahme aus
                        `public/works/` ausgeliefert hat, in voller Groesse
                        und in jedem Viewport dieselbe Datei. Ueber
                        `next/image` kommt sie jetzt in AVIF bzw. WebP, in der
                        Groesse, die das Layout wirklich braucht, und erst
                        wenn sie in Sichtweite ist.
                      */
                      <Image
                        src={study.image}
                        alt={study.client}
                        fill
                        sizes="(max-width: 1024px) 100vw, 30vw"
                        className="object-cover"
                      />
                    ) : (
                      <>
                        <SignatureMotif
                          direction="center"
                          className="motif-placeholder pointer-events-none absolute inset-0 h-full w-full"
                        />
                        <span
                          aria-hidden="true"
                          className="border-gold/40 text-gold text-display absolute inset-0 m-auto flex size-20 items-center justify-center border text-2xl"
                        >
                          {study.mark}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Die drei Schritte — immer in derselben Reihenfolge. */}
                <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
                  {(
                    [
                      [t.cases.problem, study.problem[locale]],
                      [t.cases.solution, study.solution[locale]],
                      [t.cases.result, study.result[locale]],
                    ] as const
                  ).map(([label, body], step) => (
                    <div key={label} className="border-line border-t pt-6">
                      <div className="flex items-baseline gap-3">
                        <span className="eyebrow text-gold-text">
                          {String(step + 1).padStart(2, "0")}
                        </span>
                        <p className="eyebrow text-muted-foreground">{label}</p>
                      </div>
                      <p className="type-body text-foreground/85 mt-4 text-pretty">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
