"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { serviceLayers } from "@/lib/site-data"
import { publishedServicePages } from "@/lib/service-pages"

/**
 * Capabilities als Verteiler-Kacheln (PHASE A, Master-Prompt 4 §4.4).
 *
 * Die ausführliche Ebenen-Pyramide lebt jetzt auf /leistungen. Hier steht die
 * Kurzfassung: fünf Kacheln, jede ein Absprung. Das ist der Unterschied
 * zwischen einer Verteiler-Startseite und einer Landingpage — die Startseite
 * zeigt, DASS es fünf Ebenen gibt, die Unterseite erklärt sie.
 *
 * Jede Kachel führt auf ihren Ankerabschnitt in /leistungen. Wo es zu einer
 * Ebene zusätzlich eine granulare Leistungsseite gibt (die Vokabel, nach der
 * tatsächlich gesucht wird — „Webdesign", nicht „Digital"), steht die als
 * zweite Zeile darunter und verlinkt direkt dorthin. Nicht jede Ebene hat
 * eine: Operations und Intelligence haben heute keine, und dann steht dort
 * eben nichts. Eine Seite zu erfinden, damit die Kachel voller aussieht, wäre
 * genau die Sorte Fassade, die das Projekt ausschließt.
 */
export function CapabilityTiles() {
  const { t, locale } = useLocale()
  const copy = t.home.capabilities

  return (
    <section id="leistungen" aria-labelledby="capabilities-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="capabilities-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-3">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
            <Link
              href="/leistungen"
              className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.cta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>

        <div className="bg-line border-line mt-20 grid gap-px border sm:grid-cols-2 lg:grid-cols-5">
          {serviceLayers.map((layer, i) => {
            const layerCopy = t.services.layers[layer.key]
            const pages = publishedServicePages.filter((page) => page.layer === layer.key)

            return (
              <Reveal key={layer.key} delay={0.05 * i} className="flex">
                <Link
                  href={`/leistungen#ebene-${layer.key}`}
                  className="group bg-background hover:bg-surface relative flex w-full flex-col gap-6 p-7 transition-colors duration-500"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <div>
                    <span className="eyebrow text-gold-text">{layer.level}</span>
                    <h3 className="type-h4 mt-5">{layerCopy.name}</h3>
                    <p className="type-small text-muted-foreground mt-4 text-pretty">
                      {layerCopy.what}
                    </p>
                  </div>

                  {pages.length > 0 && (
                    <ul className="border-line mt-auto flex flex-col gap-2 border-t pt-5">
                      {pages.map((page) => (
                        <li key={page.slug}>
                          <span className="text-meta text-muted-foreground group-hover:text-gold-text transition-colors duration-500">
                            {page.chip[locale]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
