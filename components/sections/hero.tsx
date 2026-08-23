"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { heroChips } from "@/lib/site-data"
import { ArchitecturalField } from "@/components/hero/architectural-field"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const { t } = useLocale()
  const reduce = usePrefersReducedMotion()

  const lines = [t.hero.headlineLine1, t.hero.headlineLine2, t.hero.headlineLine3]

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <ArchitecturalField />

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
              Einstiegs-Chips: vier Worte, die sagen, worum es geht — und
              zugleich vier Absprungpunkte in die neue Architektur. Ein Chip,
              der nur ein Wort waere, waere Dekoration.
            */}
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {heroChips.map((chip) => (
                <li key={chip.href}>
                  <Link
                    href={chip.href}
                    className="border-line-strong hover:border-gold hover:text-gold-text text-muted-foreground inline-flex items-center border px-4 py-2 text-sm tracking-wide transition-colors duration-500"
                  >
                    {chip.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-start gap-3 lg:col-span-5 lg:justify-end">
            <MagneticButton href="/kontakt">
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
