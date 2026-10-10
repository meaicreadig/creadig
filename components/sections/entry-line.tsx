"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
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

export function EntryLine() {
  const { t, locale } = useLocale()
  const copy = t.home.entry
  const pilot = findOffer("website-pilot")
  const analyse = findOffer("analyse")
  const analyseBetrag =
    analyse.published && analyse.amount !== null ? formatPrice(analyse.amount, locale) : null

  const questions = t.faq.items.slice(0, 2)
  const felder = ["fuerWen", "bekommen", "kosten", "dauer", "danach"] as const

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

            <ol className="border-line mt-10 flex flex-col border-t">
              {STUFEN.map(({ key, href }) => {
                const stufe = copy.stufen[key]
                return (
                  <li key={key} className="border-line border-b">
                    <article className="grid gap-x-8 gap-y-4 py-8 md:grid-cols-12">
                      <header className="md:col-span-4">
                        <p className="eyebrow text-gold-text">{stufe.stufe}</p>
                        <h3 className="text-subhead mt-2 text-lg text-balance">{stufe.name}</h3>
                        <Link
                          href={href}
                          className="text-gold-text hover:text-foreground mt-3 flex w-fit items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                        >
                          {stufe.cta}
                          <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                        </Link>
                      </header>
                      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr] md:col-span-8">
                        {felder.map((feld) => (
                          <div key={feld} className="contents">
                            <dt className="text-meta text-muted-foreground">{copy.labels[feld]}</dt>
                            <dd className="type-small text-foreground/85 text-pretty">
                              {stufe[feld]}
                              {feld === "kosten" && key === "analyse" && analyseBetrag && (
                                <span className="text-foreground mt-1 block">
                                  {copy.analysePreis}: {analyseBetrag}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {key === "einstieg" && pilot.published && pilot.condition && (
                        <p className="border-line text-meta text-muted-foreground rounded-lg border px-3 py-2 md:col-span-8 md:col-start-5">
                          {pilot.condition[locale]}
                        </p>
                      )}
                    </article>
                  </li>
                )
              })}
            </ol>

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
