"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { StatusDot } from "@/components/ui/status-dot"
import { ownProducts, productWorks } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

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
  const { t, locale } = useLocale()

  return (
    <section
      id="unter-dem-dach"
      aria-labelledby="unter-dem-dach-title"
      className="section-seam"
    >
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={t.houseProducts.eyebrow} />
            <h2 id="unter-dem-dach-title" className="type-h2 mt-7 text-balance">
              {t.houseProducts.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {t.houseProducts.lead}
            </p>
            <Link
              href="/produkte"
              className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 self-start text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {t.home.products.cta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>

        {/* Vier gleichwertige Kacheln. Bis PHASE 2 war die Fuge die Linie
            (`bg-line` + `gap-px`); jetzt traegt jede Karte ihre eigene Kante
            und zwischen ihnen steht Luft — vier Dinge statt einem Block. */}
        <div className="mt-20 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {productWorks.map((product, i) => {
            const logo = ownProducts.find((p) => p.name === product.name)

            return (
              <Reveal key={product.slug} delay={0.06 * i} className="flex">
                {/* Seit PHASE A fuehrt jede Karte in die Produkt-Welt statt nach
                    draussen. Der Live-Link zu meai.run steht dort, wo er
                    hingehoert: auf der Produktseite selbst. */}
                <Link
                  href={`/produkte/${product.slug}`}
                  className="group tile bg-background hover:bg-surface relative flex w-full flex-col justify-between gap-8 p-7 transition-colors duration-[var(--dur-2)] lg:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
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
                          className="h-7 w-auto max-w-[7rem] opacity-70 grayscale transition-all duration-[var(--dur-2)] group-hover:opacity-100 group-hover:grayscale-0 dark:brightness-0 dark:invert dark:group-hover:brightness-100 dark:group-hover:invert-0"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="border-line-strong text-muted-foreground group-hover:border-gold group-hover:text-gold-text flex size-9 items-center justify-center rounded-sm border text-sm font-semibold tracking-tight transition-colors duration-[var(--dur-2)]"
                        >
                          {product.mark}
                        </span>
                      )}
                      <ArrowUpRight
                        className="text-gold size-4 shrink-0 transition-transform duration-[var(--dur-2)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={1.5}
                      />
                    </div>

                    <h3 className="type-h4 mt-6">{product.name}</h3>
                    <p className="type-small text-muted-foreground mt-4 text-pretty">
                      {product.what[locale]}
                    </p>
                  </div>

                  <div className="border-line border-t pt-5">
                    <p className="eyebrow text-muted-foreground">
                      {t.houseProducts.statusLabel}
                    </p>
                    <p className="type-small text-foreground/85 mt-2 flex items-baseline gap-2 text-pretty">
                      <StatusDot live={product.live} className="translate-y-[-0.15em]" />
                      {product.outcome[locale]}
                    </p>
                    <p className="text-meta text-muted-foreground mt-3">{product.region}</p>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
