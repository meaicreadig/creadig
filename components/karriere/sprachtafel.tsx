"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { marken } from "@/lib/karriere-inhalt"
import type { RolleDefinition } from "@/lib/karriere"

/*
 * ===========================================================================
 * SPRACHE — GEMESSEN AN DER AUFGABE, NICHT AM PASS
 * ===========================================================================
 *
 * Die uebliche Stellenanzeige schreibt „Deutsch C1“ und meint damit oft etwas
 * anderes: einen Namen, einen Wohnort, einen Akzent. Diese Tafel nennt
 * deshalb zu jeder Sprache die AUFGABE, fuer die sie gebraucht wird — ein
 * Gespraech mit einer Inhaberin fuehren, Quelltext lesen, im Team arbeiten.
 *
 * Wer diese Aufgabe kann, erfuellt die Anforderung. Woher er kommt, steht
 * nicht zur Debatte, weil es mit der Arbeit nichts zu tun hat.
 */
export function Sprachtafel({ rolle }: { rolle: RolleDefinition }) {
  const { locale } = useLocale()

  return (
    <section aria-labelledby="sprache-titel" className="section-seam">
      <div className="section-shell">
        <Reveal>
          <SectionEyebrow label={marken.sprachen[locale]} />
          <h2 id="sprache-titel" className="sr-only">
            {marken.sprachen[locale]}
          </h2>
        </Reveal>
        <dl className="border-line mt-12 border-t">
          {/* <dt>/<dd> direkt unter dem Reveal-<div> — siehe Kommentar in
              `karriere-page-body.tsx`. */}
          {rolle.sprachen.map((eintrag, i) => (
            <Reveal
              key={eintrag.sprache.de}
              delay={0.04 * i}
              y={10}
              className="border-line grid gap-x-8 gap-y-2 border-b py-7 md:grid-cols-12"
            >
              <dt className="flex items-baseline gap-4 md:col-span-4">
                <span className="text-subhead text-lg">{eintrag.sprache[locale]}</span>
                <span className="text-meta text-gold-text">
                  {marken.sprachNiveau[eintrag.niveau][locale]}
                </span>
              </dt>
              <dd className="type-body text-muted-foreground text-pretty md:col-span-8">
                {eintrag.wofuer[locale]}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
