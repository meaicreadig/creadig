"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, Plus } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { packages } from "@/lib/site-data"

/**
 * MP10-2.1 / 2.2 — der Einstieg auf der Startseite.
 *
 * ---------------------------------------------------------------------------
 * WAS DAS HIER IST
 * Eine Zeile mit einer Zahl und die zwei Fragen, die im Erstgespräch immer
 * zuerst kommen. Mehr nicht — und das „mehr nicht" ist der Punkt.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DIE SEKTION GIBT
 * Die Startseite nannte keinen einzigen Preis. Als Haltung war das gemeint
 * („ein System-Haus ist keine Preisliste"), als Erlebnis war es eine
 * Auskunftsverweigerung: Wer wissen will, ob er in der richtigen Größenordnung
 * ist, und nichts findet, geht zu jemandem, der eine Zahl nennt. Der Preis
 * beantwortet keine Designfrage, sondern eine Angstfrage.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEIN PAKETBLOCK
 * Weil die Startseite dann eine Landingpage wäre. Die Leiter (Referenzpreis,
 * Regelpreis, laufende Betreuung, offenes oberes Ende) steht an genau EINER
 * Stelle: `/leistungen#pakete`. Hier steht der Einstiegspreis und ein
 * Verweis. Die Zahl selbst kommt aus `site-data.packages` — sie wird nicht
 * abgetippt, sonst gibt es zwei Wahrheiten, sobald jemand eine ändert.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE FRAGEN GESPIEGELT UND NICHT NEU GESCHRIEBEN SIND
 * Sie lesen `t.faq.items[0]` und `[1]` — dieselbe Quelle wie die FAQ auf
 * `/leistungen`. Zwei Fassungen derselben Antwort wären in vier Wochen zwei
 * Antworten, und die falsche steht dann auf der Startseite.
 */
export function EntryLine() {
  const { t, locale } = useLocale()
  const copy = t.home.entry
  const entry = packages[0]

  // Kein Angebot, keine Zeile. Ein Einstieg ohne Preis ist keine Aussage.
  if (!entry) return null

  const questions = t.faq.items.slice(0, 2)

  return (
    <section id="einstieg" aria-labelledby="einstieg-title" className="section-seam">
      <div className="section-shell-tight">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="einstieg-title" className="type-h3 mt-7 max-w-xl text-balance">
              <span className="text-muted-foreground">{copy.priceLead} </span>
              <span className="text-gold-text">{entry.price}</span>
              <span className="text-muted-foreground"> {copy.priceNote}</span>
            </h2>

            {/*
              MP10-2.3 — die Projektdauer neben dem Preis. Heute leer
              (`Package.duration === null`, Owner-gegatet): Ein Festpreis mit
              erfundenem Zeitrahmen ist schlechter als einer ohne.
            */}
            {entry.duration && (
              <p className="type-small text-muted-foreground mt-5">
                <span className="eyebrow text-gold-text">{t.packages.durationLabel}: </span>
                {entry.duration[locale]}
              </p>
            )}

            <Link
              href="/leistungen#pakete"
              className="text-gold-text hover:text-foreground mt-7 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.priceCta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>

          <div className="lg:col-span-6">
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
                  <details className="group border-line border-t">
                    <summary className="marker:content-none flex cursor-pointer list-none items-start justify-between gap-6 py-5">
                      <h3 className="text-subhead text-pretty">{item.q}</h3>
                      <Plus
                        aria-hidden="true"
                        className="text-muted-foreground group-open:text-gold-text mt-1 size-4 shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45"
                        strokeWidth={1.5}
                      />
                    </summary>
                    <p className="type-small text-muted-foreground pb-6 text-pretty">{item.a}</p>
                  </details>
                </Reveal>
              ))}
              <div className="border-line border-t" />
            </div>

            <Reveal delay={0.24}>
              <Link
                href="/leistungen#faq"
                className="text-gold-text hover:text-foreground mt-7 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
              >
                {copy.questionsCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
