"use client"

import Image from "next/image"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { ImageUnveil } from "@/components/ui/image-unveil"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { featuredWorks, workHref } from "@/lib/site-data"

/**
 * ARCHETYP C — das randlose Band. Ausgewählte Arbeiten (Master-Prompt 4 §4.3).
 *
 * ---------------------------------------------------------------------------
 * WAS SICH GEGENÜBER VORHER ÄNDERT UND WARUM (VIS-2)
 * Der Inhalt stimmte schon: Arbeit vor Erklärung, ein Werk pro Zeile, Bild und
 * Text abwechselnd. Die FORM war aber dieselbe wie überall — Kopf aus
 * `SectionEyebrow` + `type-h2` im 12-Spalten-Raster, Inhalt brav innerhalb des
 * Sektionsrands. Die wichtigste Sektion der Seite sah aus wie die
 * Ebenen-Kacheln darunter.
 *
 * Jetzt ist sie der dritte Archetyp:
 *
 *   randlos   Die Abbildungen laufen bis an den Rand der Seitenfläche — auf
 *             der Seite, auf der sie stehen. Nur der Text bleibt im Raster.
 *             Das ist der eine Ort, an dem die Seite ihren Rahmen verlässt,
 *             und dadurch bekommt der Beweis Gewicht, das eine Karte im
 *             Raster nicht erzeugen kann.
 *   Haarlinie Zeilen sind durch Linien getrennt statt durch Abstand. Das Band
 *             liest sich als zusammenhängende Fläche, nicht als drei Blöcke.
 *   Bewegung  Beim Eintritt fährt eine Maske vom Bild weg (`ImageUnveil`) —
 *             die dritte Mikro-Interaktion der Seite neben Haarlinie und
 *             magnetischem Knopf, und die einzige, die beim Scrollen wirkt.
 *
 * Gated: Die Sektion rendert nur, was in `featuredWorks` wirklich aufgelöst
 * werden konnte — und die Abbildungen tragen weiterhin den Hinweis, dass sie
 * illustrative Mockups sind und keine Screenshots.
 */
export function SelectedWork() {
  const { t, locale } = useLocale()
  const copy = t.home.work

  if (featuredWorks.length === 0) return null

  return (
    <section
      id="arbeiten"
      aria-labelledby="arbeiten-title"
      className="border-line bg-surface overflow-hidden border-b"
    >
      {/* Kopf bleibt im Raster — nur die Bilder brechen aus. */}
      <div className="section-gutter pt-24 md:pt-32">
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
              className="group text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.cta}
              <ArrowUpRight
                className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </Reveal>
        </div>
      </div>

      <ul className="mt-16 md:mt-24">
        {featuredWorks.map((work, i) => {
          // Gerade Zeilen: Bild links. Ungerade: Bild rechts. Der Wechsel ist
          // der Takt dieser Sektion — drei gleich ausgerichtete Zeilen wären
          // wieder ein Raster.
          const imageRight = i % 2 === 1

          return (
            <li key={work.slug} className="border-line border-t first:border-t-0">
              <Link
                href={workHref(work)}
                className="group grid items-center md:grid-cols-12"
              >
                <div
                  className={`relative aspect-[16/10] md:col-span-7 ${
                    imageRight ? "md:order-2" : ""
                  }`}
                >
                  <ImageUnveil className="absolute inset-0">
                    {work.image ? (
                      <Image
                        src={work.image}
                        alt={`${work.name} — ${work.what[locale]}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 58vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="bg-muted absolute inset-0 flex items-center justify-center">
                        <SignatureMotif
                          direction="center"
                          className="motif-placeholder pointer-events-none absolute inset-0 h-full w-full"
                        />
                        <span
                          aria-hidden="true"
                          className="border-gold-text/55 text-gold-text text-display flex size-20 items-center justify-center border text-2xl"
                        >
                          {work.mark}
                        </span>
                      </div>
                    )}
                  </ImageUnveil>
                  {/*
                    Die Trennkante zum Text — nur auf der Innenseite. Aussen
                    soll das Bild ohne Rahmen an den Seitenrand laufen.
                  */}
                  <span
                    aria-hidden="true"
                    className={`bg-line absolute inset-y-0 hidden w-px md:block ${
                      imageRight ? "left-0" : "right-0"
                    }`}
                  />
                </div>

                <div
                  className={`px-6 py-12 md:col-span-5 md:px-10 md:py-16 lg:px-16 ${
                    imageRight ? "md:order-1" : ""
                  }`}
                >
                  <p className="eyebrow text-muted-foreground">
                    {work.kind === "Produkt" ? t.portfolio.kindProduct : t.portfolio.kindClientWork} ·{" "}
                    {work.sector[locale]}
                  </p>
                  <h3 className="type-h3 mt-5">{work.name}</h3>
                  <p className="type-lead text-muted-foreground mt-6 max-w-md text-pretty">
                    {work.what[locale]}
                  </p>
                  {/* Ohne belegten Umfang keine leere Zeile mit Label. */}
                  {work.built && (
                    <p className="type-small text-foreground/85 border-line mt-8 max-w-md border-t pt-6 text-pretty">
                      <span className="text-gold-text">{t.portfolio.built}: </span>
                      {work.built[locale]}
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
            </li>
          )
        })}
      </ul>

      {/* Der Hinweis reist mit den Bildern mit — wo eine Abbildung steht,
          steht auch, was sie ist. */}
      <div className="section-gutter pb-20 md:pb-24">
        <Reveal delay={0.1}>
          {/*
            MP10-2.4 — der Verweis am Ende, nicht nur am Anfang.

            Oben steht er auch, und dort ist er fuer die falsche Person: Wer
            die Sektion noch nicht gelesen hat, klickt nicht auf „alle". Wer
            drei Arbeiten durchgescrollt hat, will genau das — und fand hier
            bisher nur die Fussnote ueber die Mockups und danach die naechste
            Sektion.
          */}
          <div className="border-line mt-16 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-muted-foreground text-meta max-w-2xl text-pretty">
              {t.portfolio.mockupNote}
            </p>
            <Link
              href="/arbeiten"
              className="group text-gold-text hover:text-foreground inline-flex shrink-0 items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.ctaEnd}
              <ArrowUpRight
                className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
