"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { serviceLayers } from "@/lib/site-data"

/**
 * Fünf Ebenen als aufsteigende, bauliche Architektur.
 * Jede Ebene wird breiter und dunkler — Tiefe von unten nach oben.
 */
export function Services() {
  const { t } = useLocale()

  return (
    <section id="leistungen" aria-labelledby="leistungen-title" className="border-line border-b">
      <div className="mx-auto w-full max-w-[100rem] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="bg-gold h-px w-10" />
              <p className="eyebrow text-muted-foreground">{t.services.eyebrow}</p>
            </div>
            <h2
              id="leistungen-title"
              className="type-h2 mt-7 text-balance"
            >
              {t.services.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="text-muted-foreground max-w-md text-base leading-relaxed text-pretty md:text-lg">
              {t.services.lead}
            </p>
          </Reveal>
        </div>

        {/* Aufsteigende Ebenen — von 05 oben nach 01 unten gelesen als Bauwerk */}
        <div className="mt-20 flex flex-col-reverse gap-px">
          {serviceLayers.map((layer, i) => {
            const copy = t.services.layers[layer.key]
            // Ebene 01 = schmalste Basis, Ebene 05 = breiteste Spitze der Wirkung
            const inset = (serviceLayers.length - 1 - i) * 2
            const isTop = i === serviceLayers.length - 1

            return (
              <Reveal
                key={layer.key}
                delay={0.06 * i}
                y={16}
                className="group"
                as="div"
              >
                <div
                  style={{ marginLeft: `${inset}%`, marginRight: `${inset}%` }}
                  className={`border-line relative border-t transition-colors duration-500 ${
                    isTop ? "bg-foreground/[0.03]" : ""
                  } hover:bg-foreground/[0.04]`}
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <div className="grid items-baseline gap-x-8 gap-y-4 px-2 py-9 md:grid-cols-12 md:px-6">
                    <div className="flex items-baseline gap-4 md:col-span-4">
                      <span className="text-gold font-mono text-xs tracking-[0.16em]">
                        {layer.level}
                      </span>
                      <h3 className="type-h3">{copy.name}</h3>
                    </div>
                    <p className="type-lead text-foreground/85 text-pretty md:col-span-5">
                      {copy.what}
                    </p>
                    <div className="md:col-span-3">
                      <p className="eyebrow text-line-strong group-hover:text-gold transition-colors duration-500">
                        {t.services.forWhom}
                      </p>
                      <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed text-pretty">
                        {copy.who}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
