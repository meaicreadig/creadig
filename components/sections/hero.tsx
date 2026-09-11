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
  const { t, locale } = useLocale()
  const reduce = usePrefersReducedMotion()

  const lines = [t.hero.headlineLine1, t.hero.headlineLine2, t.hero.headlineLine3]
  /*
   * PHASE 1 · COMMERCIAL COMPLETION — DER HERO HIELT SICH SELBST VERBORGEN.
   *
   * Hier stand viermal `initial={{ opacity: 0 }}`: Eyebrow, Kopfzeile,
   * Unterzeile und die Fusszeile des Bildschirms starteten unsichtbar und
   * wurden erst von framer-motion eingeblendet. Das Server-HTML trug die
   * Null also mit aus — wer die Startseite aufrief oder im Browser dorthin
   * zurueck navigierte, sah bis zur Hydration eine leere Flaeche ueber die
   * volle Fensterhoehe.
   *
   * GATE 04 hat genau diese Entscheidung fuer `Reveal` schon getroffen:
   * Inhalt wird nie verborgen, Bewegung bewegt nur die Position. Der Hero
   * war die letzte Stelle, die es noch anders machte — ausgerechnet die
   * erste, die jemand sieht. Jetzt animiert er `y`, nicht Sichtbarkeit.
   *
   * Die Zeilenmaske bleibt, denn sie IST die Bewegung der Kopfzeile. Aber
   * sie hat dasselbe Problem, nur anders geschrieben: framer-motion schreibt
   * `initial` in das Server-HTML, gemessen am 11.09.2026 steht dort
   * `style="transform:translateY(112%)"` an jeder der drei Zeilen. Ohne
   * JavaScript bleibt die Ueberschrift damit dauerhaft aus der Maske
   * geschoben — die Seite haette keine sichtbare H1.
   *
   * Deshalb der `<noscript>`-Block unten: Laeuft kein JavaScript, faengt
   * auch keine Animation an, und dann ist der Startwert kein Startwert mehr,
   * sondern ein Fehler. Er wird genau dort zurueckgenommen.
   *
   * Die Zeilenmaske (`overflow-hidden`) schneidet die Enthuellung.
   * Arabisch: knappes em-Polster gegen Madda/Punkte — 0.22em hatte die
   * drei Hero-Zeilen sichtbar auseinandergezogen (Owner: „arası açılmış").
   */
  const linePad = locale === "ar" ? "py-[0.07em]" : "py-[0.35vw]"

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <SystemField />

      {/*
        Kein JavaScript, keine Animation — und damit kein Grund, warum die
        Kopfzeile 112 % unter ihrer Zeile stehen sollte. Greift nur im
        `noscript`-Fall; mit JavaScript ist dieser Block nicht im Dokument.
      */}
      <noscript>
        <style>{"#top h1 span[style]{transform:none!important}"}</style>
      </noscript>

      <div className="section-gutter relative z-10 flex flex-1 flex-col justify-center pt-32 pb-14">
        <motion.div
          initial={reduce ? undefined : { y: 12 }}
          animate={{ y: 0 }}
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
              <span key={line} className={`block overflow-hidden ${linePad}`}>
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
          initial={reduce ? undefined : { y: 24 }}
          animate={{ y: 0 }}
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
            <MagneticButton href="/termin" trackLocation="hero">
              {t.hero.ctaPrimary}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </MagneticButton>
            <MagneticButton href="/produkte" variant="ghost" trackLocation="hero">
              {t.hero.ctaSecondary}
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={reduce ? undefined : { y: [6, 0] }}
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
