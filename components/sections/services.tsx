"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { serviceLayers } from "@/lib/site-data"
import { publishedServicePages } from "@/lib/service-pages"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Fünf Ebenen als aufsteigende, bauliche Architektur.
 * Jede Ebene wird breiter und dunkler — Tiefe von unten nach oben.
 *
 * Zwei Einsatzorte, ein Bauteil (PHASE A):
 *   Startseite    — nicht mehr. Dort steht seit dem Umbau die kompakte
 *                   Verteiler-Kachel-Variante (`CapabilityTiles`).
 *   /leistungen   — hier, als Hauptinhalt der Uebersichtsseite. Die H1 traegt
 *                   dann der Seitenkopf, darum laesst `heading={false}` die
 *                   zweite Ueberschrift weg, statt sie zu doppeln.
 *
 * Jede Ebene traegt zusaetzlich einen Anker (`#ebene-<key>`), damit die
 * Kacheln der Startseite nicht nur „irgendwohin nach /leistungen" fuehren,
 * sondern genau auf die Ebene, auf die geklickt wurde.
 */
export function Services({ heading = true }: { heading?: boolean }) {
  const { t, locale } = useLocale()

  return (
    <section id="leistungen" aria-labelledby="leistungen-title" className="border-line border-b">
      <div className="section-shell">
        {heading && (
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={t.services.eyebrow} />
              <h2
                id="leistungen-title"
                className="type-h2 mt-7 text-balance"
              >
                {t.services.title}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {t.services.lead}
              </p>
            </Reveal>
          </div>
        )}

        {/*
          Einstiegs-Chips (Feinschliff).

          Die Ebenen darunter sind die Hausvokabel („Digital", „Operations").
          Gesucht wird aber nach „Webdesign". Die Chips stehen deshalb VOR der
          Pyramide: Wer mit einem konkreten Wort kommt, findet es sofort und
          landet auf der granularen Leistungsseite. Zugleich sind sie die
          internen Links, die diese Unterseiten ueberhaupt tragen — vorher
          standen sie als lange Meta-Titel ganz unten, wo sie kaum jemand sah.
        */}
        <Reveal delay={0.16}>
          <div
            className={`border-line flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-8 ${
              heading ? "mt-20" : ""
            }`}
          >
            <p className="eyebrow text-gold-text">{t.services.entryLabel}</p>
            <ul className="flex flex-wrap gap-2.5">
              {publishedServicePages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/leistungen/${page.slug}`}
                    className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2 border px-4 py-2.5 text-sm tracking-wide transition-colors duration-500"
                  >
                    {page.chip[locale]}
                    <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

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
                  id={`ebene-${layer.key}`}
                  style={{ marginLeft: `${inset}%`, marginRight: `${inset}%` }}
                  /* scroll-mt: die feste Leiste (4,5rem) darf den Anker nicht verdecken. */
                  className={`border-line relative scroll-mt-28 border-t transition-colors duration-500 ${
                    isTop ? "bg-foreground/[0.03]" : ""
                  } hover:bg-foreground/[0.04]`}
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <div className="grid items-baseline gap-x-8 gap-y-4 px-2 py-9 md:grid-cols-12 md:px-6">
                    <div className="flex items-baseline gap-4 md:col-span-4">
                      <span className="eyebrow text-gold-text">
                        {layer.level}
                      </span>
                      <h3 className="type-h3">{copy.name}</h3>
                    </div>
                    <p className="type-lead text-foreground/85 text-pretty md:col-span-5">
                      {copy.what}
                    </p>
                    <div className="md:col-span-3">
                      <p className="eyebrow text-muted-foreground group-hover:text-gold-text transition-colors duration-500">
                        {t.services.forWhom}
                      </p>
                      <p className="type-small text-muted-foreground mt-2.5 text-pretty">
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
