"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { heroChips } from "@/lib/site-data"
import { SystemField } from "@/components/hero/system-field"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const { t } = useLocale()
  const reduce = usePrefersReducedMotion()

  const lines = [t.hero.headlineLine1, t.hero.headlineLine2, t.hero.headlineLine3]

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <SystemField />

      <div className="section-gutter relative z-10 flex flex-1 flex-col justify-center pt-32 pb-14">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <SectionEyebrow label={t.hero.eyebrow} />
        </motion.div>

        {/* Headline als Bauwerk: bildschirmfüllend, kinetisch enthüllt */}
        <h1 className="type-display mt-10">
          {lines.map((line, i) => {
            const words = line.split(" ")
            const isLast = i === lines.length - 1
            return (
              <span key={line} className="block overflow-hidden py-[0.35vw]">
                <motion.span
                  className="block"
                  initial={reduce ? undefined : { y: "112%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, delay: 0.08 + i * 0.07, ease: EASE }}
                >
                  {isLast && words.length > 1 ? (
                    <>
                      {words.slice(0, -1).join(" ")} <span className="text-gold-text">{words.at(-1)}</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            )
          })}
        </h1>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
          className="border-line mt-14 grid gap-8 border-t pt-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-7">
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty lg:text-xl">
              {t.hero.subline}
            </p>

            {/*
              MP10-2.7 — die fuenf Ebenen als Einstieg, mit dem Satz darueber,
              der sie zusammenbindet.

              Hier standen vier Chips („Brand · Digital · KI · Produkte") und
              kein Satz. Vier Chips ueber einer Reihe von fuenf Kacheln ist
              der erste Widerspruch, den ein Leser findet — und ohne
              „Fünf Ebenen. Ein System." liest sich die Reihe als Liste von
              Dienstleistungen, nicht als Architektur. Beides ist jetzt hier;
              die Beschriftungen kommen aus derselben Quelle wie die Kacheln.
            */}
            <p className="type-body text-foreground/85 mt-8">{t.hero.systemLine}</p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {heroChips.map((chip) => (
                <li key={chip.href}>
                  <Link
                    href={chip.href}
                    className="cta-quiet text-muted-foreground inline-flex items-center px-4 py-2 text-sm tracking-wide"
                  >
                    {t.services.layers[chip.key].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-start gap-3 lg:col-span-5 lg:justify-end">
            {/* MP10-2.6 — der erste Knopf der Seite fuehrt an ihr Ende:
                /termin ist der Abschluss, /kontakt der direkte Weg. */}
            <MagneticButton href="/termin">
              {t.hero.ctaPrimary}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </MagneticButton>
            <MagneticButton href="/arbeiten" variant="ghost">
              {t.hero.ctaSecondary}
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="section-gutter border-line relative z-10 flex items-center justify-between border-t py-5"
      >
        <span className="eyebrow text-muted-foreground">{t.hero.location}</span>
        <Link
          href="#haltung"
          className="text-muted-foreground hover:text-foreground eyebrow flex items-center gap-2.5 transition-colors"
        >
          {t.hero.scroll}
          <motion.span
            aria-hidden="true"
            className="inline-flex"
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ArrowDown className="text-gold size-3.5" strokeWidth={1.5} />
          </motion.span>
        </Link>
      </motion.div>
    </section>
  )
}
