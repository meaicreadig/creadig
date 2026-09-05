"use client"

import { ArrowUpRight, Check, Minus } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { formatPrice, managedOperations, retainer, retainerPublished } from "@/lib/site-data"

/**
 * Managed Betrieb (V2-3 · KIZILELMA §10.1 / §10.7).
 *
 * ---------------------------------------------------------------------------
 * WAS HIER ZUSAMMENKOMMT — UND WO ES VORHER LAG
 * „Betreiben" war ueber drei Stellen verteilt: als dritter Prozessschritt
 * (eine Haltung), als „Ops-Retainer" in einer Fusszeile der Werkschau und
 * als Preiskaestchen ganz unten in den Paketen. Das ist genau der Teil, der
 * ein Haus von einer Agentur unterscheidet, die uebergibt und verschwindet —
 * und der einzige, der wiederkehrenden Umsatz traegt. Als Fussnote gelesen
 * ist er nichts davon.
 *
 * Der Preis ist mitgezogen und steht jetzt HIER statt unter den Paketen. Das
 * ist kein zweiter Preis: Es ist derselbe Retainer aus `site-data`, nur an
 * der Stelle, an der beschrieben steht, wofuer er gilt. Vorher stand die
 * Zahl unter einer Paket-Kachel und las sich wie deren Zusatzoption.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE SEKTION EINE BREITE REIHE IST UND KEIN KACHELRASTER
 * Direkt darueber liegt die Ebenen-Pyramide: fuenf Bloecke, senkrecht
 * gestapelt. Der Betrieb ist nicht die sechste Ebene, sondern das Band, das
 * quer darunter liegt und jede beruehrt. Ein zweites Kachelraster haette ihn
 * optisch zu einer weiteren Ebene gemacht — die durchlaufende Reihe aus
 * sieben Hairline-Spalten sagt dasselbe wie der Text: eine Schicht, nicht
 * eine Stufe.
 *
 * ---------------------------------------------------------------------------
 * DAS PREIS-KAESTCHEN IST GEGATET
 * `retainerPublished` haengt an Preis UND Leistungsumfang in `site-data`.
 * Solange eines fehlt, erscheint die Zahl nicht — beschrieben wird der
 * Betrieb trotzdem. Umgekehrt waere es falsch herum: eine Zahl ohne Umfang.
 */
export function ManagedOperations() {
  const { t, locale } = useLocale()
  const copy = t.managed

  return (
    <section
      id="managed-betrieb"
      aria-labelledby="managed-title"
      className="bg-surface section-seam"
    >
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="managed-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        <Reveal delay={0.14}>
          <p className="type-statement border-line mt-16 max-w-4xl border-t pt-10 text-balance">
            {copy.statement}
          </p>
        </Reveal>

        {/* Sieben Spalten, eine Reihe: die Schicht unter den fuenf Ebenen. */}
        <Reveal delay={0.18} className="mt-16">
          <p className="eyebrow text-gold-text">{copy.itemsLabel}</p>
        </Reveal>
        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {managedOperations.map((key, i) => {
            const item = copy.items[key]
            return (
              <Reveal
                key={key}
                delay={0.04 * i}
                y={14}
                className="group border-line relative border-t pt-6"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 start-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
                />
                <h3 className="text-subhead text-lg">{item.name}</h3>
                <p className="type-small text-muted-foreground mt-3 text-pretty">{item.what}</p>
              </Reveal>
            )
          })}
        </div>

        {retainerPublished && retainer.amount !== null && retainer.description && (
          <Reveal delay={0.12}>
            <div className="border-gold/45 bg-background mt-20 grid gap-10 border-s-2 px-7 py-9 md:px-10 md:py-11 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <p className="eyebrow text-gold-text">{t.packages.retainerEyebrow}</p>
                <h3 className="type-h3 mt-5 text-balance">{t.packages.retainerTitle}</h3>
                <p className="type-body text-foreground/85 mt-6 max-w-2xl text-pretty">
                  {retainer.description[locale]}
                </p>
                {/*
                  GATE 05 — ENTHALTEN UND NICHT ENTHALTEN STEHEN NEBENEINANDER.

                  Vorher stand nur die linke Spalte. Eine Leistungsliste ohne
                  Gegenstueck liest sich als Anfang einer Aufzaehlung, nicht
                  als Umfang — und jeder ergaenzt still, was er braucht.
                  Beide Spalten zusammen sind erst die Antwort auf „was
                  bekomme ich fuer 149 EUR".
                */}
                {retainer.includes && (
                  <div className="mt-7 grid gap-7 sm:grid-cols-2">
                    <div>
                      <p className="eyebrow text-muted-foreground">
                        {t.packages.retainerIncludesLabel}
                      </p>
                      <ul className="mt-3 grid gap-3">
                        {retainer.includes[locale].map((item) => (
                          <li key={item} className="flex gap-3">
                            <Check className="text-gold mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                            <span className="type-small text-muted-foreground text-pretty">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="eyebrow text-muted-foreground">
                        {t.packages.retainerExcludesLabel}
                      </p>
                      <ul className="mt-3 grid gap-3">
                        {retainer.excludes[locale].map((item) => (
                          <li key={item} className="flex gap-3">
                            <Minus
                              className="text-muted-foreground/60 mt-0.5 size-4 shrink-0"
                              strokeWidth={1.5}
                            />
                            <span className="type-small text-muted-foreground text-pretty">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                <p className="type-small text-muted-foreground mt-7 max-w-2xl text-pretty">
                  {retainer.precondition[locale]}
                </p>
              </div>

              <div className="flex flex-col justify-end lg:col-span-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="eyebrow text-muted-foreground">{t.packages.retainerFixed}</span>
                  <span className="type-stat">{formatPrice(retainer.amount, locale)}</span>
                  <span className="eyebrow text-muted-foreground">{t.packages.monthly}</span>
                </div>
                <Link
                  href="/termin?paket=retainer"
                  className="cta-quiet mt-7 inline-flex items-center justify-between gap-2 self-start px-6 py-3.5 text-sm tracking-wide"
                >
                  {t.packages.retainerCta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {/*
          Die Grenze der Zusage, sichtbar und nicht im Kleingedruckten: keine
          Prozentzahl, keine Stundenfrist. Wer sie hier liest, misst uns
          spaeter an dem, was wir wirklich gesagt haben.
        */}
        {/*
          MP10-4 — die Sektion fasst zusammen, die Seite fuehrt aus.

          Der Verweis steht neben der Grenze der Zusage und nicht darueber:
          Wer bis hierher gelesen hat, hat die sieben Bestandteile gesehen
          und stellt jetzt die beiden Fragen, die hier keinen Platz haben —
          warum ueberhaupt Betrieb, und wem das System dann gehoert.
        */}
        <Reveal delay={0.16}>
          <div className="border-line mt-16 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="type-small text-muted-foreground max-w-2xl text-pretty">{copy.note}</p>
            <Link
              href="/betrieb"
              className="group text-gold-text hover:text-foreground inline-flex shrink-0 items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {t.nav.betrieb}
              <ArrowUpRight
                className="size-4 transition-transform duration-[var(--dur-2)] ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
