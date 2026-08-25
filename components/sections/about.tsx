"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { contact } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

export function About() {
  const { t } = useLocale()

  return (
    <section id="ueber-uns" aria-labelledby="ueber-title" className="border-line border-b">
      <div className="section-shell">
        <Reveal>
          <SectionEyebrow label={t.about.eyebrow} />
        </Reveal>

        <div className="mt-7 grid gap-x-12 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 id="ueber-title" className="type-h2 text-balance">
                {t.about.title}
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-10 flex flex-col gap-6">
                <p className="type-lead text-foreground/85 max-w-2xl text-pretty">
                  {t.about.body1}
                </p>
                <p className="text-muted-foreground max-w-2xl text-base leading-relaxed text-pretty">
                  {t.about.body2}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="type-small border-line text-muted-foreground mt-12 border-t pt-6 text-pretty">
                {t.about.honesty}
              </p>
            </Reveal>
          </div>

          {/* Faktenspalte: Gründer, Schwerpunkte, Sitz */}
          <div className="flex flex-col gap-px lg:col-span-5">
            <Reveal delay={0.06} className="border-line border-t pt-7">
              <p className="eyebrow text-gold-text">{t.about.founderLabel}</p>
              <p className="type-statement mt-4">
                {t.about.founder}
              </p>
            </Reveal>

            <Reveal delay={0.12} className="border-line mt-10 border-t pt-7">
              <p className="eyebrow text-gold-text">{t.about.nicheLabel}</p>
              <ul className="mt-5 flex flex-col gap-4">
                {t.about.niches.map((niche) => (
                  <li key={niche} className="flex gap-3.5">
                    <span aria-hidden="true" className="bg-gold mt-2.5 h-px w-5 shrink-0" />
                    <span className="type-body text-foreground/85 text-pretty">
                      {niche}
                    </span>
                  </li>
                ))}
              </ul>
              {/*
                Schwerpunkte sind keine Zulassungsbedingung — ohne diesen Satz
                liest die Liste sich fuer jeden vierten Betrieb wie eine Absage.
              */}
              <p className="type-small text-muted-foreground mt-6 text-pretty">
                {t.about.nicheOpen}
              </p>
            </Reveal>

            {/*
              KIZILELMA §10.10 — die Nische professionell besitzen.

              Hier stand bisher gar nichts: Zweisprachigkeit war eine
              Nebenbemerkung in `nicheOpen` („auf Deutsch und auf Tuerkisch")
              und damit eine Fussnote. Sie ist aber das eine Merkmal, das
              sonst niemand im Markt hat, der auch deutschen Standard liefert.
              Bewusst OHNE Herkunftsbild: kein „tuerkisch-deutscher
              Mittelstand", keine Community-Ansprache. Der Satz redet ueber
              Standard und Sprache, nicht ueber Menschen.
            */}
            <Reveal delay={0.16} className="border-line mt-10 border-t pt-7">
              <p className="eyebrow text-gold-text">{t.about.standardLabel}</p>
              <p className="type-body text-foreground/85 mt-4 text-pretty">
                {t.about.standardBody}
              </p>
            </Reveal>

            <Reveal delay={0.22} className="border-line mt-10 border-t pt-7">
              <p className="eyebrow text-gold-text">{t.about.locationsLabel}</p>
              <address className="type-small text-foreground/85 mt-4 not-italic">
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="eyebrow text-gold-text mt-7">{t.about.marketsLabel}</p>
              <p className="type-small text-foreground/85 mt-3">{contact.markets}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
