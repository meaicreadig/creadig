"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { approvedCaseStudies } from "@/lib/site-data"
import { CaseStudyBody } from "@/components/sections/case-study-body"
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
  const { t } = useLocale()

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
              <CaseStudyBody study={study} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
