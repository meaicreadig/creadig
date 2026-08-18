"use client"

import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { ownProducts, productWorks } from "@/lib/site-data"

/**
 * Produkt-Uebersicht „Unter dem Dach" (B3).
 *
 * Vorher gab es die vier eigenen Produkte an zwei Stellen: als Logos in der
 * Marquee-Wand (schnell vorbei) und als Karten in der Werkschau (zwischen
 * Kundenwerk). Was fehlte, war die eine Ansicht, die sie als *Portfolio des
 * Hauses* zeigt — gleichwertig, auf einen Blick, direkt vor dem
 * meAI-Deep-Dive.
 *
 * Gleichwertig heisst hier woertlich: vier identische Hairline-Karten, kein
 * Hervorheben, keine „empfohlen"-Marke. meAI bekommt sein Gewicht durch das
 * Band darunter, nicht durch eine groessere Kachel hier.
 *
 * Quelle ist `productWorks` — dieselben vier Eintraege wie in der Werkschau.
 * Das Logo kommt aus `ownProducts`, wo eins vorliegt; sonst traegt das
 * Monogramm, nie ein kaputtes <img>.
 */
export function HouseProducts() {
  const { t } = useLocale()

  return (
    <section
      id="unter-dem-dach"
      aria-labelledby="unter-dem-dach-title"
      className="border-line border-b"
    >
      <div className="mx-auto w-full max-w-[100rem] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="bg-gold h-px w-10" />
              <p className="eyebrow text-muted-foreground">{t.houseProducts.eyebrow}</p>
            </div>
            <h2 id="unter-dem-dach-title" className="type-h2 mt-7 text-balance">
              {t.houseProducts.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {t.houseProducts.lead}
            </p>
          </Reveal>
        </div>

        {/* Vier gleichwertige Hairline-Karten. `gap-px` auf der Linienfarbe
            erzeugt das durchgehende Raster ohne doppelte Raender. */}
        <div className="bg-line border-line mt-20 grid gap-px border sm:grid-cols-2 lg:grid-cols-4">
          {productWorks.map((product, i) => {
            const logo = ownProducts.find((p) => p.name === product.name)
            const isLink = Boolean(product.href)
            const Tag = isLink ? "a" : "div"

            return (
              <Reveal key={product.slug} delay={0.06 * i} className="flex">
                <Tag
                  {...(isLink
                    ? { href: product.href, target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group bg-background hover:bg-surface relative flex w-full flex-col justify-between gap-8 p-7 transition-colors duration-500 lg:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />

                  <div>
                    <div className="flex h-9 items-center justify-between gap-3">
                      {logo?.logoPath ? (
                        <img
                          src={logo.logoPath}
                          alt=""
                          aria-hidden="true"
                          /*
                            Im Dunkeln stehen die Produktlogos (dunkle Artwork)
                            sonst unsichtbar auf dunklem Grund. In Ruhe darum
                            eine weisse Silhouette, beim Hover die echte
                            Markenfarbe — dieselbe Dramaturgie wie in Hell,
                            nur mit umgekehrtem Ausgangspunkt.
                          */
                          className="h-7 w-auto max-w-[7rem] opacity-70 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0 dark:brightness-0 dark:invert dark:group-hover:brightness-100 dark:group-hover:invert-0"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="border-line-strong text-muted-foreground group-hover:border-gold group-hover:text-gold-text flex size-9 items-center justify-center border text-sm font-semibold tracking-tight transition-colors duration-500"
                        >
                          {product.mark}
                        </span>
                      )}
                      {isLink && (
                        <ArrowUpRight
                          className="text-gold size-4 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>

                    <h3 className="type-h4 mt-6">{product.name}</h3>
                    <p className="type-small text-muted-foreground mt-4 text-pretty">
                      {product.what}
                    </p>
                  </div>

                  <div className="border-line border-t pt-5">
                    <p className="eyebrow text-muted-foreground">
                      {t.houseProducts.statusLabel}
                    </p>
                    <p className="type-small text-foreground/85 mt-2 text-pretty">
                      {product.outcome}
                    </p>
                    <p className="text-meta text-muted-foreground mt-3">{product.region}</p>
                  </div>
                </Tag>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
