"use client"

import { useId, useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Disclosure } from "@/components/ui/disclosure"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { findOffer, formatPrice } from "@/lib/offers"

/**
 * DIE ANGEBOTSLEITER AUF DER STARTSEITE (Paket 2).
 *
 * Vier Stufen statt einer Preisliste: Einstieg → Analyse → Systemprojekt →
 * Betrieb. Jede Stufe beantwortet dieselben fuenf Fragen (fuer wen, was,
 * Kosten, Dauer, danach), damit niemand zwischen Kacheln vergleichen muss.
 *
 * Seit 11.10.: Stufen-Auswahl statt vier untereinander ausgeklappter Bloecke.
 * Die Leiter war ~2500 px hoch und las sich wie eine Tabelle. Jetzt zeigt
 * links der Weg alle vier Stufen auf einen Blick, rechts steht genau eine —
 * die Gold-Linie fuellt sich bis zur gewaehlten Stufe.
 *
 * Betraege kommen ausschliesslich ueber `{price:<key>}` aus `lib/offers.ts`.
 * Der Analysepreis erscheint erst, wenn der Owner ihn dort veroeffentlicht
 * (O3); bis dahin steht nur „Festpreis, anrechenbar".
 */

type StufeKey = "einstieg" | "analyse" | "projekt" | "betrieb"

const STUFEN: { key: StufeKey; href: string }[] = [
  { key: "einstieg", href: "/leistungen#pakete" },
  { key: "analyse", href: "/termin?art=systemgespraech" },
  { key: "projekt", href: "/systeme" },
  { key: "betrieb", href: "/betrieb" },
]

const FELDER = ["fuerWen", "bekommen", "kosten", "dauer", "danach"] as const

export function EntryLine() {
  const { t, locale } = useLocale()
  const copy = t.home.entry
  const pilot = findOffer("website-pilot")
  const analyse = findOffer("analyse")
  const analyseBetrag =
    analyse.published && analyse.amount !== null ? formatPrice(analyse.amount, locale) : null
  const questions = t.faq.items.slice(0, 2)

  const reduce = usePrefersReducedMotion()
  const [aktiv, setAktiv] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  const { key: aktivKey, href: aktivHref } = STUFEN[aktiv]
  const stufe = copy.stufen[aktivKey]

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? (aktiv + 1) % STUFEN.length
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? (aktiv - 1 + STUFEN.length) % STUFEN.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? STUFEN.length - 1
              : null
    if (next === null) return
    event.preventDefault()
    setAktiv(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="einstieg" aria-labelledby="einstieg-title" className="section-seam">
      <div className="section-shell-tight">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <SectionEyebrow label={copy.eyebrow} />
              <h2 id="einstieg-title" className="type-h3 mt-7 max-w-xl text-balance">
                {copy.title}
              </h2>
              <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">{copy.lead}</p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="border-line mt-10 grid overflow-hidden rounded-2xl border md:grid-cols-12">
                <div
                  role="tablist"
                  aria-orientation="vertical"
                  aria-label={copy.title}
                  onKeyDown={onKeyDown}
                  className="border-line relative flex flex-col border-b p-3 md:col-span-5 md:border-e md:border-b-0"
                >
                  <span aria-hidden="true" className="bg-line absolute start-[27px] top-9 bottom-9 w-px" />
                  <motion.span
                    aria-hidden="true"
                    className="bg-gold absolute start-[27px] top-9 w-px origin-top"
                    initial={false}
                    animate={{ height: `calc((100% - 4.5rem) * ${aktiv / (STUFEN.length - 1)})` }}
                    transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {STUFEN.map(({ key }, i) => {
                    const s = copy.stufen[key]
                    const selected = i === aktiv
                    const erreicht = i <= aktiv
                    return (
                      <button
                        key={key}
                        ref={(el) => {
                          tabRefs.current[i] = el
                        }}
                        type="button"
                        role="tab"
                        id={`${baseId}-tab-${key}`}
                        aria-selected={selected}
                        aria-controls={`${baseId}-panel`}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setAktiv(i)}
                        className={`relative flex items-start gap-4 rounded-xl px-3 py-4 text-start transition-colors duration-[var(--dur-2)] focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          selected ? "bg-surface" : "hover:bg-surface/60"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`relative z-10 mt-0.5 flex size-[17px] shrink-0 items-center justify-center rounded-full border transition-colors duration-[var(--dur-2)] ${
                            erreicht ? "border-gold bg-background" : "border-line bg-background"
                          }`}
                        >
                          <span
                            className={`block size-[7px] rounded-full transition-all duration-[var(--dur-2)] ${
                              selected ? "bg-gold scale-125" : erreicht ? "bg-gold/70" : "bg-line"
                            }`}
                          />
                        </span>
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className={`eyebrow ${selected ? "text-gold-text" : "text-muted-foreground"}`}>
                            {s.stufe}
                          </span>
                          <span
                            className={`text-subhead text-base text-balance ${
                              selected ? "text-foreground" : "text-foreground/75"
                            }`}
                          >
                            {s.name}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div
                  role="tabpanel"
                  id={`${baseId}-panel`}
                  aria-labelledby={`${baseId}-tab-${aktivKey}`}
                  className="relative p-6 md:col-span-7 md:p-8"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.article
                      key={aktivKey}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col gap-6"
                    >
                      <header className="flex flex-col gap-2">
                        <p className="eyebrow text-gold-text">{stufe.stufe}</p>
                        <h3 className="type-h4 text-balance">{stufe.name}</h3>
                      </header>

                      <dl className="flex flex-col gap-4">
                        {FELDER.map((feld) => (
                          <div
                            key={feld}
                            className={
                              feld === "kosten"
                                ? "border-gold/40 bg-surface flex flex-col gap-1 rounded-xl border px-4 py-3"
                                : "flex flex-col gap-1"
                            }
                          >
                            <dt className="text-meta text-muted-foreground">{copy.labels[feld]}</dt>
                            <dd
                              className={`text-pretty ${
                                feld === "kosten" ? "text-foreground type-body" : "type-small text-foreground/85"
                              }`}
                            >
                              {stufe[feld]}
                              {feld === "kosten" && aktivKey === "analyse" && analyseBetrag && (
                                <span className="text-foreground mt-1 block">
                                  {copy.analysePreis}: {analyseBetrag}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {aktivKey === "einstieg" && pilot.published && pilot.condition && (
                        <p className="border-line text-meta text-muted-foreground rounded-lg border px-3 py-2">
                          {pilot.condition[locale]}
                        </p>
                      )}

                      <Link
                        href={aktivHref}
                        className="text-gold-text hover:text-foreground flex w-fit items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                      >
                        {stufe.cta}
                        <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                      </Link>
                    </motion.article>
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <MagneticButton href="/termin?art=systemgespraech" trackLocation="angebotsleiter">
                  {copy.primaryCta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </MagneticButton>
                <p className="type-small text-muted-foreground">{copy.primaryNote}</p>
              </div>
              <p className="text-meta text-muted-foreground mt-4">{copy.nettoNote}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.08}>
              <p className="eyebrow text-gold-text">{copy.questionsLabel}</p>
            </Reveal>
            {/*
              Dieselbe Mechanik wie in der FAQ: `<details>` statt eines
              React-Accordions, damit Tastatur, Screenreader und die
              Seitensuche des Browsers ohne eine Zeile JavaScript funktionieren.
            */}
            <div className="mt-6 flex flex-col">
              {questions.map((item, i) => (
                <Reveal key={item.q} delay={0.12 + 0.06 * i}>
                  <Disclosure label={item.q} size="sm" heading>
                    <p className="type-small text-muted-foreground text-pretty">{item.a}</p>
                  </Disclosure>
                </Reveal>
              ))}
              <div className="border-line border-t" />
            </div>
            <Reveal delay={0.24}>
              <Link
                href="/leistungen#faq"
                className="text-gold-text hover:text-foreground mt-7 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
              >
                {copy.questionsCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
