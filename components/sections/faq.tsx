"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, Plus } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Häufige Fragen — direkt vor dem Kontaktformular.
 *
 * Die sechs Fragen sind die, die im Erstgespräch ohnehin kommen; sie hier
 * vorwegzunehmen nimmt dem Formular die Hürde. Jede Antwort ist wörtlich
 * die, die auch am Telefon gegeben wird — die Texte stammen aus den bereits
 * belegten Angaben aus dem Woerterbuch, nichts ist dazuerfunden.
 *
 * Bewusst `<details>` statt eines React-Accordions: Tastatur, Screenreader
 * und die Seitensuche des Browsers (Strg+F findet auch zugeklappten Text)
 * funktionieren ohne eine Zeile JavaScript.
 */
export function Faq() {
  const { t } = useLocale()

  return (
    <section id="faq" aria-labelledby="faq-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={t.faq.eyebrow} />
            <h2 id="faq-title" className="type-h2 mt-7 max-w-3xl text-balance">
              {t.faq.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{t.faq.lead}</p>
          </Reveal>
        </div>

        <div className="mt-20 flex flex-col">
          {t.faq.items.map((item, i) => (
            <Reveal key={item.q} delay={0.04 * i}>
              <details className="group border-line border-t">
                <summary className="marker:content-none flex cursor-pointer list-none items-start justify-between gap-6 py-7">
                  <h3 className="text-subhead text-lg text-pretty md:text-xl">{item.q}</h3>
                  <Plus
                    aria-hidden="true"
                    className="text-muted-foreground group-open:text-gold-text mt-1 size-5 shrink-0 transition-transform duration-[var(--dur-2)] ease-brand group-open:rotate-45"
                    strokeWidth={1.5}
                  />
                </summary>
                <p className="type-body text-muted-foreground max-w-3xl pb-8 text-pretty">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
          <div className="border-line border-t" />
        </div>

        <Reveal delay={0.2}>
          <div className="mt-20 flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="type-body text-muted-foreground">{t.faq.more}</p>
            <Link
              href="/kontakt"
              className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {t.faq.moreCta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
