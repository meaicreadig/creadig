"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { BelegKette } from "@/components/karriere/beleg-kette"
import { RollenStand } from "@/components/karriere/rollen-stand"
import { Sprachtafel } from "@/components/karriere/sprachtafel"
import { rolleFuer } from "@/lib/karriere"
import { spurA } from "@/lib/karriere-inhalt"

/**
 * /karriere/dach-business-development.
 *
 * Seitenfrage: „Ist diese Art von kommerzieller Systemarbeit meine Stärke?"
 *
 * Gegenüber der ersten Fassung entfallen: die eigene Auswahl-Sektion (steht
 * jetzt einmal auf der Übersicht) und die 30/60/90-Tafel. Letztere las sich
 * wie ein Einarbeitungsplan für eine Stelle, die es nicht gibt — konkrete
 * Zukunft ohne Zusage ist genau die Sorte Versprechen, die diese Seite
 * sonst vermeidet.
 *
 * Geblieben ist das Stärkste: die Kette vom Signal bis zum bestätigten
 * Bedarf. Sie erklärt die Rolle besser als jede Anforderungsliste.
 */
export function KarriereSpurABody() {
  const { t, locale } = useLocale()
  const rolle = rolleFuer("dach-business-development")

  return (
    <main>
      <PageHeader
        eyebrow={t.nav.karriere}
        title={rolle.titel[locale]}
        crumbLabel={rolle.titel[locale]}
        crumbs={[{ label: t.nav.karriere, href: "/karriere" }]}
        lead={spurA.lead[locale]}
      />

      {/* ---- Warum es die Rolle gibt ---------------------------------- */}
      <section aria-labelledby="warum-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <SectionEyebrow label={spurA.warumEsGibt.eyebrow[locale]} />
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-8">
              <h2 id="warum-titel" className="type-statement text-balance">
                {spurA.warumEsGibt.text[locale]}
              </h2>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Was Sie tun / und was nicht ------------------------------ */}
      <section aria-labelledby="tun-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={spurA.tut.eyebrow[locale]} />
            <h2 id="tun-titel" className="sr-only">
              {spurA.tut.eyebrow[locale]}
            </h2>
          </Reveal>
          <ol className="border-line mt-12 border-t">
            {spurA.tut.punkte.map((punkt, i) => (
              <Reveal key={punkt.titel.de} as="li" delay={0.04 * i} y={12}>
                <div className="border-line grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 border-b py-7 md:grid-cols-12 md:gap-x-8">
                  <span className="text-display text-muted-foreground text-xl leading-none tabular-nums md:col-span-1 md:text-2xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-subhead text-lg md:col-span-3">{punkt.titel[locale]}</span>
                  <span className="type-body text-muted-foreground col-span-2 text-pretty md:col-span-8">
                    {punkt.text[locale]}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>

          {/* Die Grenze steht auf derselben Seite wie die Aufgabe — wer eine
              Rolle annimmt, muss vorher wissen, wo seine Unterschrift endet. */}
          <Reveal delay={0.16}>
            <div className="bg-muted mt-12 p-7 md:p-9">
              <p className="eyebrow text-gold-text">{spurA.tutNicht.eyebrow[locale]}</p>
              <ul className="mt-6 grid gap-3.5 md:grid-cols-2">
                {spurA.tutNicht.punkte.map((punkt) => (
                  <li key={punkt.de} className="flex gap-3.5">
                    <span aria-hidden="true" className="bg-line-strong mt-3 h-px w-5 shrink-0" />
                    <span className="type-body text-foreground/85 text-pretty">{punkt[locale]}</span>
                  </li>
                ))}
              </ul>
              <p className="type-small text-muted-foreground border-line mt-8 border-t pt-6 text-pretty">
                {spurA.tutNicht.grenze[locale]}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Die Kette ------------------------------------------------ */}
      <BelegKette />

      {/* ---- Sprache -------------------------------------------------- */}
      <Sprachtafel rolle={rolle} />

      {/* ---- Stand + Weg ---------------------------------------------- */}
      <section aria-labelledby="a-stand-titel" className="section-dark">
        <div className="section-shell-tight">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-7">
              <h2 id="a-stand-titel" className="type-h3 text-balance">
                {t.karriere.standTitel}
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-5">
              <RollenStand rolle={rolle} variante="kompakt" />
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
