"use client"

import { ArrowUpRight, Check } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ClosingCta } from "@/components/sections/closing-cta"
import { managedOperations, retainer, retainerPublished } from "@/lib/site-data"

/**
 * MP10-4 — Managed Betrieb als eigene Seite.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE GEGENUEBER DER SEKTION AUF /leistungen HINZUFUEGT
 * Die Sektion beantwortet „was gehoert dazu". Diese Seite beantwortet die
 * beiden Fragen davor und danach, fuer die dort kein Platz war:
 *
 *   WARUM     Vier Gruende, warum ein System nach dem Livegang nicht fertig
 *             ist. Sie stehen VOR der Leistungsliste, weil niemand eine Liste
 *             liest, deren Anlass er nicht kennt.
 *   WEM       „Betrieb" klingt nach Abhaengigkeit, und das ist die
 *             unausgesprochene Sorge bei jedem Dauervertrag. Die Antwort
 *             steht hier ausdruecklich, nicht im Kleingedruckten.
 *
 * ---------------------------------------------------------------------------
 * KEINE ZWEITE WAHRHEIT
 * Die sieben Bestandteile kommen aus `t.managed.items` — dieselben Saetze wie
 * in der Sektion, nicht neu formuliert. Der Preis kommt aus `retainer` und
 * erscheint nur, wenn Preis UND Leistungsumfang gesetzt sind
 * (`retainerPublished`). Die Grenze der Zusage ist `t.managed.note`. Wer eine
 * dieser Stellen aendert, aendert Sektion und Seite zugleich.
 */
export function BetriebPageBody() {
  const { t, locale } = useLocale()
  const copy = t.betriebPage
  const managed = t.managed

  return (
    <main>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        crumbLabel={managed.title}
        lead={copy.lead}
        crumbs={[{ label: t.nav.leistungen, href: "/leistungen" }]}
      />

      {/* Der Satz, der die Haltung traegt — derselbe wie in der Sektion. */}
      <section aria-labelledby="betrieb-statement" className="border-line border-b">
        <div className="section-shell-tight">
          <Reveal>
            <h2 id="betrieb-statement" className="type-statement max-w-4xl text-balance">
              {managed.statement}
            </h2>
          </Reveal>
        </div>
      </section>

      {/* WARUM — vor der Liste, nicht dahinter. */}
      <section aria-labelledby="betrieb-warum" className="bg-surface border-line border-b">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={copy.whyLabel} />
            <h2 id="betrieb-warum" className="sr-only">
              {copy.whyLabel}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {copy.why.map((item, i) => (
              <Reveal
                key={item.name}
                delay={0.06 * i}
                y={14}
                className="group border-line relative border-t pt-7"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                />
                {/* Die Ziffer ordnet, sie zaehlt nichts — darum aria-hidden. */}
                <span aria-hidden="true" className="eyebrow text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h4 mt-4 text-balance">{item.name}</h3>
                <p className="type-body text-muted-foreground mt-4 max-w-xl text-pretty">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WAS — dieselben sieben wie in der Sektion. */}
      <section aria-labelledby="betrieb-umfang" className="border-line border-b">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={managed.itemsLabel} />
            <h2 id="betrieb-umfang" className="sr-only">
              {managed.itemsLabel}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {managedOperations.map((key, i) => {
              const item = managed.items[key]
              return (
                <Reveal
                  key={key}
                  delay={0.04 * i}
                  y={14}
                  className="group border-line relative border-t pt-6"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <h3 className="text-subhead text-lg">{item.name}</h3>
                  <p className="type-small text-muted-foreground mt-3 text-pretty">{item.what}</p>
                </Reveal>
              )
            })}
          </div>

          {/* Die Grenze der Zusage steht sichtbar, nicht im Kleingedruckten. */}
          <Reveal delay={0.16}>
            <p className="type-small text-muted-foreground border-line mt-16 border-t pt-6 max-w-3xl text-pretty">
              {managed.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* WEM ES GEHOERT — die Sorge, die bei jedem Dauervertrag mitliest. */}
      <section aria-labelledby="betrieb-eigentum" className="bg-surface border-line border-b">
        <div className="section-shell-tight">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <SectionEyebrow label={copy.ownershipLabel} />
              <h2 id="betrieb-eigentum" className="type-h3 mt-6 text-balance">
                {copy.ownershipTitle}
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-7">
              <p className="type-body text-foreground/85 max-w-2xl text-pretty">
                {copy.ownershipBody}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/*
        Der Preis. Gegatet wie in der Sektion: `retainerPublished` haengt an
        Preis UND Leistungsumfang. Eine Zahl ohne Umfang waere die falsche
        Reihenfolge.
      */}
      {retainerPublished && retainer.description && (
        <section aria-labelledby="betrieb-preis" className="border-line border-b">
          <div className="section-shell-tight">
            <Reveal>
              <div className="border-gold/45 bg-background grid gap-10 border-l-2 px-7 py-9 md:px-10 md:py-11 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-7">
                  <p className="eyebrow text-gold-text">{t.packages.retainerEyebrow}</p>
                  <h2 id="betrieb-preis" className="type-h3 mt-5 text-balance">
                    {t.packages.retainerTitle}
                  </h2>
                  <p className="type-body text-foreground/85 mt-6 max-w-2xl text-pretty">
                    {retainer.description[locale]}
                  </p>
                  {retainer.includes && (
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {retainer.includes[locale].map((item) => (
                        <li key={item} className="flex gap-3">
                          <Check className="text-gold mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                          <span className="type-small text-muted-foreground text-pretty">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col justify-end lg:col-span-5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="eyebrow text-muted-foreground">
                      {t.packages.retainerFrom}
                    </span>
                    <span className="type-stat">{retainer.price}</span>
                    <span className="eyebrow text-muted-foreground">{t.packages.monthly}</span>
                  </div>
                  <Link
                    href="/termin?paket=retainer"
                    className="border-line-strong hover:border-gold hover:text-gold-text mt-7 inline-flex items-center justify-between gap-2 self-start border px-6 py-3.5 text-sm tracking-wide transition-colors duration-500"
                  >
                    {t.packages.retainerCta}
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <ClosingCta variant="prices" />
    </main>
  )
}
