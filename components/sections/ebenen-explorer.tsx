"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { formatPrice, productWorks, serviceLayers } from "@/lib/site-data"
import { publishedServicePages } from "@/lib/service-pages"
import { einstiegFuer } from "@/lib/einstiege"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type LayerKey = (typeof serviceLayers)[number]["key"]

/*
 * Die fuenf Ebenen als Kapitel, die man durchscrollt, statt als gestapelte
 * Tabellenzeilen. Links steht das Haus und baut sich mit: Die aktive Ebene
 * leuchtet, alles darunter traegt sie sichtbar mit. Problem, Loesung und
 * Ergebnis standen vorher hinter einer Klappe — hier sind sie der Kern jedes
 * Kapitels, weil genau dort steht, was ein Kunde wissen will.
 *
 * Die Anker `#ebene-<key>` bleiben erhalten: Die Kacheln der Startseite
 * springen weiterhin genau auf ihre Ebene.
 */

const BREITE = ["w-full", "w-[90%]", "w-[80%]", "w-[70%]", "w-[60%]"] as const

export function EbenenExplorer() {
  const { t, locale } = useLocale()
  const reduce = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const kapitel = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = Number((entry.target as HTMLElement).dataset.index)
            setActive(i)
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    kapitel.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  function springe(i: number) {
    kapitel.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }

  const belegLabel = (href: string, art: "produkt" | "eigenpruefung" | null) => {
    if (art === "eigenpruefung") return t.services.belegEigenpruefung
    if (art === "produkt") {
      const produkt = productWorks.find((w) => w.slug === href.split("/").pop())
      if (produkt) return produkt.name
    }
    return t.services.belegCta
  }

  const aktiveEbene = serviceLayers[active]
  const aktiverEinstieg = einstiegFuer(aktiveEbene.key)

  return (
    <section id="leistungen" aria-label={t.services.title} className="section-seam">
      <div className="section-shell">
        {/* Einstieg ueber die Suchwoerter, die Leute wirklich tippen. */}
        <div className="border-line flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-8">
          <p className="eyebrow text-gold-text">{t.services.entryLabel}</p>
          <ul className="flex flex-wrap gap-2.5">
            {publishedServicePages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/leistungen/${page.slug}`}
                  className="cta-quiet inline-flex items-center gap-2 px-4 py-2.5 text-sm tracking-wide"
                >
                  {page.chip[locale]}
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobil: eine Fortschrittsleiste statt des Hauses. */}
        <div className="bg-background/95 border-line sticky top-[4.5rem] z-20 -mx-6 mt-10 border-b px-6 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">
              <span className="eyebrow text-gold-text me-3">{aktiveEbene.level}</span>
              {t.services.layers[aktiveEbene.key].name}
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {serviceLayers.map((l, i) => (
                <span
                  key={l.key}
                  className={cn(
                    "h-1 w-5 rounded-full transition-colors duration-[var(--dur-2)]",
                    i <= active ? "bg-gold" : "bg-line-strong",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          {/* Das Haus — bleibt stehen, waehrend die Kapitel vorbeiziehen. */}
          <aside className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 flex flex-col gap-8">
              <HausDiagramm active={active} onSelect={springe} reduce={reduce} />

              <div className="border-line min-h-36 border-t pt-6" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={aktiveEbene.key}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="eyebrow text-muted-foreground">{t.services.angebotLabel}</p>
                    {aktiverEinstieg && (
                      <>
                        <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-gold-text text-sm tracking-wide">
                            {t.services.angebotArt[aktiverEinstieg.art]}
                          </span>
                          {aktiverEinstieg.betrag !== null && (
                            <span className="text-display text-4xl">
                              {formatPrice(aktiverEinstieg.betrag, locale)}
                              {aktiverEinstieg.art === "monatlich" && (
                                <span className="text-muted-foreground ms-2 text-base">
                                  {t.packages.monthly}
                                </span>
                              )}
                            </span>
                          )}
                        </p>
                        <Link
                          href={aktiverEinstieg.einstiegHref}
                          className="cta-outline mt-5 inline-flex items-center gap-2 px-5 py-3 text-sm tracking-wide"
                        >
                          {t.services.angebotCta}
                          <ArrowUpRight className="size-4" strokeWidth={1.5} />
                        </Link>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </aside>

          <div className="flex flex-col lg:col-span-7">
            {serviceLayers.map((layer, i) => (
              <Kapitel
                key={layer.key}
                index={i}
                layerKey={layer.key}
                level={layer.level}
                aktiv={i === active}
                reduce={reduce}
                belegLabel={belegLabel}
                refCallback={(el) => {
                  kapitel.current[i] = el
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HausDiagramm({
  active,
  onSelect,
  reduce,
}: {
  active: number
  onSelect: (i: number) => void
  reduce: boolean
}) {
  const { t } = useLocale()
  const anteil = (active + 1) / serviceLayers.length

  return (
    <nav aria-label={t.services.title} className="relative ps-8">
      {/* Der Strom: laeuft vom Fundament bis zur aktiven Ebene hinauf. */}
      <span aria-hidden="true" className="bg-line absolute start-2.5 top-0 bottom-0 w-px" />
      <motion.span
        aria-hidden="true"
        className="bg-gold absolute start-2.5 bottom-0 w-px origin-bottom"
        style={{ top: 0 }}
        animate={{ scaleY: anteil }}
        transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="bg-gold-soft absolute start-[0.4rem] size-2 rounded-full shadow-[0_0_14px_var(--gold)]"
          animate={{ bottom: ["0%", `${anteil * 100 - 2}%`], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
        />
      )}

      <ol className="flex flex-col-reverse items-start gap-2">
        {serviceLayers.map((layer, i) => {
          const istAktiv = i === active
          const getragen = i < active
          return (
            <li key={layer.key} className={cn(BREITE[i], "relative")}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={istAktiv ? "step" : undefined}
                className={cn(
                  "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border px-5 py-4 text-start transition-colors duration-[var(--dur-2)]",
                  istAktiv
                    ? "border-gold bg-gold/15 text-foreground"
                    : getragen
                      ? "border-gold/40 bg-gold/[0.05] text-foreground/85"
                      : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground",
                )}
              >
                {istAktiv && !reduce && (
                  <motion.span
                    aria-hidden="true"
                    className="via-gold/25 absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent to-transparent"
                    initial={{ left: "-35%" }}
                    animate={{ left: ["-35%", "105%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                  />
                )}
                <span className="relative flex items-baseline gap-4">
                  <span className={cn("eyebrow", istAktiv || getragen ? "text-gold-text" : "")}>
                    {layer.level}
                  </span>
                  <span className="text-subhead text-lg">{t.services.layers[layer.key].name}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative size-2 shrink-0 rounded-full transition-all duration-[var(--dur-2)]",
                    istAktiv ? "bg-gold shadow-[0_0_12px_var(--gold)]" : getragen ? "bg-gold/60" : "bg-line-strong",
                  )}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Kapitel({
  index,
  layerKey,
  level,
  aktiv,
  reduce,
  belegLabel,
  refCallback,
}: {
  index: number
  layerKey: LayerKey
  level: string
  aktiv: boolean
  reduce: boolean
  belegLabel: (href: string, art: "produkt" | "eigenpruefung" | null) => string
  refCallback: (el: HTMLElement | null) => void
}) {
  const { t, locale } = useLocale()
  const copy = t.services.layers[layerKey]
  const einstieg = einstiegFuer(layerKey)
  const innen = useRef<HTMLDivElement>(null)
  const gesehen = useInView(innen, { once: true, margin: "-20% 0px -20% 0px" })
  const zeigen = reduce || gesehen

  const schritte = [
    { label: t.services.problemLabel, body: copy.problem },
    { label: t.services.solutionLabel, body: copy.solution },
    { label: t.services.resultLabel, body: copy.result },
  ]

  return (
    <article
      ref={refCallback}
      id={`ebene-${layerKey}`}
      data-index={index}
      aria-labelledby={`ebene-${layerKey}-title`}
      className={cn(
        "border-line scroll-mt-32 border-t py-16 transition-opacity duration-[var(--dur-3)] lg:min-h-[85vh] lg:py-24",
        aktiv ? "opacity-100" : "lg:opacity-45",
      )}
    >
      <div ref={innen}>
        <p className="eyebrow text-gold-text">
          {level} <span className="text-muted-foreground mx-2">/</span>
          <span className="text-muted-foreground">05</span>
        </p>
        <h3 id={`ebene-${layerKey}-title`} className="type-h2 mt-5 text-balance">
          {copy.name}
        </h3>
        <p className="type-lead text-foreground/85 mt-6 max-w-2xl text-pretty">{copy.what}</p>
        <p className="type-small text-muted-foreground mt-5 max-w-xl text-pretty">
          <span className="eyebrow text-gold-text me-3">{t.services.forWhom}</span>
          {copy.who}
        </p>

        {/* Problem → Loesung → Ergebnis: eine Linie, die sich beim Lesen zieht. */}
        <ol className="relative mt-12 flex flex-col gap-9 ps-10">
          <span aria-hidden="true" className="bg-line absolute start-[0.6875rem] top-2 bottom-2 w-px" />
          <motion.span
            aria-hidden="true"
            className="bg-gold absolute start-[0.6875rem] top-2 bottom-2 w-px origin-top"
            initial={reduce ? false : { scaleY: 0 }}
            animate={{ scaleY: zeigen ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {schritte.map((schritt, s) => {
            const letzter = s === schritte.length - 1
            return (
              <motion.li
                key={schritt.label}
                className="relative"
                initial={reduce ? false : { opacity: 0, x: 14 }}
                animate={zeigen ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: reduce ? 0 : 0.25 + s * 0.3, duration: 0.5 }}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "border-gold bg-background absolute -start-10 top-0.5 flex size-6 items-center justify-center rounded-full border",
                    letzter && "bg-gold shadow-[0_0_16px_var(--gold)]",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", letzter ? "bg-background" : "bg-gold")} />
                </span>
                <p className={cn("eyebrow", letzter ? "text-gold-text" : "text-muted-foreground")}>
                  {schritt.label}
                </p>
                <p
                  className={cn(
                    "mt-2.5 max-w-xl text-pretty",
                    letzter ? "type-body text-foreground" : "type-small text-foreground/80",
                  )}
                >
                  {schritt.body}
                </p>
              </motion.li>
            )
          })}
        </ol>

        <div className="mt-12">
          <p className="eyebrow text-muted-foreground">{t.services.projectsLabel}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {copy.projects.map((project, p) => (
              <motion.li
                key={project}
                initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                animate={zeigen ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: reduce ? 0 : 1.1 + p * 0.06, duration: 0.35 }}
                className="border-line-strong text-foreground/85 hover:border-gold hover:text-foreground rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-[var(--dur-2)]"
              >
                {project}
              </motion.li>
            ))}
          </ul>
        </div>

        {einstieg && (
          <div className="border-line mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6">
            <span className="type-small text-foreground/85">
              <span className="eyebrow text-muted-foreground me-3">{t.services.angebotLabel}</span>
              <span className="text-gold-text">{t.services.angebotArt[einstieg.art]}</span>
              {einstieg.betrag !== null && (
                <span className="text-subhead ms-2">
                  {formatPrice(einstieg.betrag, locale)}
                  {einstieg.art === "monatlich" && (
                    <span className="text-muted-foreground"> {t.packages.monthly}</span>
                  )}
                </span>
              )}
            </span>
            <Link
              href={einstieg.einstiegHref}
              className="text-gold-text hover:text-foreground inline-flex items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {t.services.angebotCta}
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </Link>
            {einstieg.belegHref && (
              <Link
                href={einstieg.belegHref}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
              >
                {t.services.belegLabel}: {belegLabel(einstieg.belegHref, einstieg.belegArt)}
                <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
              </Link>
            )}
            {einstieg.bedingung && (
              <p className="text-meta text-muted-foreground w-full text-pretty">
                {t.services.angebotBedingung}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
