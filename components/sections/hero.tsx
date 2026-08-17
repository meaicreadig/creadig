"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { ArchitecturalField } from "@/components/hero/architectural-field"
import { MagneticButton } from "@/components/ui/magnetic-button"

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const { t } = useLocale()
  const reduce = useReducedMotion()

  const lines = [t.hero.headlineLine1, t.hero.headlineLine2, t.hero.headlineLine3]

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <ArchitecturalField />

      <div className="relative z-10 mx-auto flex w-full max-w-[100rem] flex-1 flex-col justify-center px-6 pt-32 pb-14 md:px-10 lg:px-16">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4"
        >
          <span aria-hidden="true" className="bg-gold h-px w-10" />
          <p className="eyebrow text-muted-foreground">{t.hero.eyebrow}</p>
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
                  transition={{ duration: 1.15, delay: 0.15 + i * 0.1, ease: EASE }}
                >
                  {isLast && words.length > 1 ? (
                    <>
                      {words.slice(0, -1).join(" ")} <span className="text-gold">{words.at(-1)}</span>
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
          transition={{ duration: 1, delay: 0.7, ease: EASE }}
          className="border-line mt-14 grid gap-8 border-t pt-10 lg:grid-cols-12 lg:gap-12"
        >
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty lg:col-span-7 lg:text-xl">
            {t.hero.subline}
          </p>
          <div className="flex flex-wrap items-start gap-3 lg:col-span-5 lg:justify-end">
            <MagneticButton href="/#kontakt">
              {t.hero.ctaPrimary}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </MagneticButton>
            <MagneticButton href="/#arbeiten" variant="ghost">
              {t.hero.ctaSecondary}
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="border-line relative z-10 mx-auto flex w-full max-w-[100rem] items-center justify-between border-t px-6 py-5 md:px-10 lg:px-16"
      >
        <span className="eyebrow text-muted-foreground">{t.hero.location}</span>
        <a
          href="/#fundament"
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
        </a>
      </motion.div>
    </section>
  )
}
