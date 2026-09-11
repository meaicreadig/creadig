"use client"

import { ArrowUpRight } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { fiberoGrenzen, fiberoMesspunkte, fiberoText } from "@/lib/fibero-beleg"

/**
 * DER BETRIEBSBELEG (PHASE 3 · Commercial Completion).
 *
 * ---------------------------------------------------------------------------
 * WAS DIESE SEKTION IST — UND WAS SIE NICHT SEIN DARF
 *
 * Sie ist der erste Fall auf dieser Website, der einen echten betrieblichen
 * Ablauf zeigt statt einer Oberflaeche. Sie ist NICHT der erste Kundenfall:
 * fibero ist creaDIGs eigener Glasfaser-Arm, und das steht in der Eyebrow,
 * im Vorspann und noch einmal unter den Grenzen.
 *
 * ---------------------------------------------------------------------------
 * WARUM „REIBUNG" UND „ANTWORT" NEBENEINANDER STEHEN — UND TROTZDEM KEIN
 * VORHER/NACHHER SIND
 *
 * Die naheliegende Darstellung waere zwei Spalten „vorher" und „nachher"
 * gewesen. Das waere gelogen: Es gibt keine Aufzeichnung des Zustands vor
 * fibero. Was nebeneinander steht, ist der VORGANG (was in diesem Geschaeft
 * ohnehin passiert) und die SYSTEMANTWORT (was das System daraus macht) —
 * und genau so sind die Spalten beschriftet. Der Hinweis darunter sagt es
 * noch einmal ausdruecklich, damit niemand die linke Spalte als gemessene
 * Vergangenheit liest.
 *
 * ---------------------------------------------------------------------------
 * DIE WICHTIGSTE FLAECHE IST DIE, DIE NICHTS BEHAUPTET
 *
 * „Was das belegt — und was nicht" traegt zwei gleich grosse Bloecke. Der
 * rechte sagt, dass es keine Zeitersparnis zu zeigen gibt, und schickt den
 * Leser stattdessen in den Rechner, wo er mit SEINEN Zahlen rechnet. Das ist
 * der ganze Unterschied zwischen einem Beleg und einer Anzeige.
 */
export function FiberoBetriebsbeleg() {
  const { locale } = useLocale()

  return (
    <section aria-labelledby="fibero-beleg-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={fiberoText.eyebrow[locale]} />
            <h2 id="fibero-beleg-title" className="type-h2 mt-7 text-balance">
              {fiberoText.title[locale]}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {fiberoText.lead[locale]}
            </p>
          </Reveal>
        </div>

        {/* Der Vorgang selbst, als ein Satz — bevor irgendetwas System heisst. */}
        <Reveal delay={0.14}>
          <p className="eyebrow text-gold-text border-line mt-16 border-t pt-10">
            {fiberoText.lageLabel[locale]}
          </p>
          <p className="type-statement mt-5 max-w-4xl text-balance">{fiberoText.lage[locale]}</p>
        </Reveal>

        {/* Vorgang ↔ Systemantwort. Zwei Spalten, ausdruecklich kein Zeitstrahl. */}
        <div className="border-line mt-16 grid gap-x-14 gap-y-12 border-t pt-10 lg:grid-cols-2">
          <Reveal delay={0.06}>
            <p className="eyebrow text-muted-foreground">{fiberoText.reibungLabel[locale]}</p>
            <ul className="mt-6 flex flex-col gap-5">
              {fiberoText.reibung.map((punkt) => (
                <li key={punkt.de} className="type-small text-foreground/85 text-pretty">
                  {punkt[locale]}
                </li>
              ))}
            </ul>
            <p className="text-meta text-muted-foreground border-line mt-7 border-t pt-4 text-pretty">
              {fiberoText.reibungNote[locale]}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="eyebrow text-gold-text">{fiberoText.antwortLabel[locale]}</p>
            <ul className="mt-6 flex flex-col gap-5">
              {fiberoText.antwort.map((punkt) => (
                <li key={punkt.de} className="type-small text-foreground/85 text-pretty">
                  {punkt[locale]}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/*
          MESSPUNKTE. Jede Zeile nennt links, was sich messen laesst, und
          rechts das Feld, aus dem es kommt — in Schreibmaschinenschrift, weil
          es ein Feldname ist und kein Werbewort.
        */}
        <Reveal delay={0.1} className="border-line mt-16 border-t pt-10">
          <p className="eyebrow text-gold-text">{fiberoText.messenLabel[locale]}</p>
          <ul className="mt-7 flex flex-col">
            {fiberoMesspunkte.map((m) => (
              <li
                key={m.key}
                className="border-line flex flex-col gap-1.5 border-b py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="type-small text-foreground/85 text-pretty">
                  {fiberoText.messpunkte[m.key]?.[locale]}
                </span>
                <span dir="ltr" className="text-meta text-muted-foreground shrink-0 font-mono">
                  {m.feld}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-meta text-muted-foreground mt-5 max-w-3xl text-pretty">
            {fiberoText.messenNote[locale]}
          </p>
        </Reveal>

        {/* Belegt / nicht belegt — gleich gross, und der rechte Block zaehlt. */}
        <Reveal delay={0.1} className="border-line mt-16 border-t pt-10">
          <p className="eyebrow text-gold-text">{fiberoText.wirkungLabel[locale]}</p>
          <div className="mt-7 grid gap-x-14 gap-y-8 lg:grid-cols-2">
            <p className="type-body text-foreground/85 border-gold/45 border-s-2 ps-5 text-pretty">
              {fiberoText.wirkungBelegt[locale]}
            </p>
            <div className="border-line border-s-2 ps-5">
              <p className="type-body text-muted-foreground text-pretty">
                {fiberoText.wirkungOffen[locale]}
              </p>
              <Link
                href="/aufwandsrechner"
                className="text-gold-text eyebrow mt-4 inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                {fiberoText.rechnerCta[locale]}
                <ArrowUpRight className="size-3" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Grenzen. Vier Saetze, die alle etwas wegnehmen. */}
        <Reveal delay={0.1} className="border-line mt-16 border-t pt-10">
          <p className="eyebrow text-muted-foreground">{fiberoText.grenzenLabel[locale]}</p>
          <ul className="mt-6 grid gap-x-14 gap-y-4 sm:grid-cols-2">
            {fiberoGrenzen.map((g) => (
              <li key={g} className="type-small text-muted-foreground text-pretty">
                {fiberoText.grenzen[g]?.[locale]}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="border-line mt-16 border-t pt-10">
          <p className="eyebrow text-gold-text">{fiberoText.warumLabel[locale]}</p>
          <p className="type-body text-foreground/85 mt-5 max-w-4xl text-pretty">
            {fiberoText.warum[locale]}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
