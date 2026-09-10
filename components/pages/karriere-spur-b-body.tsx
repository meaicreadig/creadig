"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { RollenStand } from "@/components/karriere/rollen-stand"
import { Sprachtafel } from "@/components/karriere/sprachtafel"
import { rolleFuer } from "@/lib/karriere"
import { marken, spurB } from "@/lib/karriere-inhalt"

/**
 * /karriere/founding-talent — jetzt „Produkt & Systeme".
 *
 * Seitenfrage: „Kann mein Handwerk Teil des creaDIG-Systems werden?"
 *
 * Der Pfad bleibt, damit bestehende Verweise nicht brechen; sichtbar ist
 * überall der neue Name. Der alte versprach zwei Dinge, die creaDIG nicht
 * halten kann — eine Gründerrolle und ein Gründungsereignis — und musste
 * deshalb im Text erst zurückgenommen werden. Ein Name, der erklärt werden
 * muss, ist keiner.
 */
export function KarriereSpurBBody() {
  const { t, locale } = useLocale()
  const rolle = rolleFuer("founding-talent")

  return (
    <main>
      <PageHeader
        eyebrow={t.nav.karriere}
        title={rolle.titel[locale]}
        crumbLabel={rolle.titel[locale]}
        crumbs={[{ label: t.nav.karriere, href: "/karriere" }]}
        lead={spurB.lead[locale]}
      />

      {/* ---- Handwerke ------------------------------------------------ */}
      <section aria-labelledby="handwerke-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={marken.disziplinen[locale]} />
            <h2 id="handwerke-titel" className="type-h2 mt-7 max-w-4xl text-balance">
              {spurB.gemeinsam.titel[locale]}
            </h2>
          </Reveal>
          {/*
            Fünf Handwerke als Zeile, nicht als fünf Stellenkarten. Es sind
            keine fünf Vakanzen — es ist ein Weg, unter dem fünf Handwerke
            Platz haben. Wer daraus fünf Kacheln macht, behauptet fünf
            offene Stellen.
          */}
          <ul className="border-line mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t pt-8">
            {rolle.disziplinen.map((disziplin, i) => (
              <Reveal key={disziplin.de} as="li" delay={0.04 * i} y={10}>
                <span className="type-h3">{disziplin[locale]}</span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.14}>
            <p className="eyebrow text-gold-text mt-14">{spurB.gemeinsam.eyebrow[locale]}</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {spurB.gemeinsam.punkte.map((punkt) => (
                <li key={punkt.de} className="flex gap-3.5">
                  <span aria-hidden="true" className="bg-gold mt-3 h-px w-5 shrink-0" />
                  <span className="type-body text-foreground/85 text-pretty">{punkt[locale]}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---- Der Unterschied ------------------------------------------ */}
      <section aria-labelledby="unterschied-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={spurB.wasEsIst.eyebrow[locale]} />
            <h2 id="unterschied-titel" className="sr-only">
              {spurB.wasEsIst.eyebrow[locale]}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px lg:grid-cols-2">
            <Reveal>
              <div className="border-gold/45 h-full border p-7 md:p-9">
                <p className="eyebrow text-gold-text">{marken.heisstEs[locale]}</p>
                <ul className="mt-6 flex flex-col gap-4">
                  {spurB.wasEsIst.ist.map((punkt) => (
                    <li key={punkt.de} className="flex gap-3.5">
                      <span aria-hidden="true" className="bg-gold mt-3 h-px w-5 shrink-0" />
                      <span className="type-body text-foreground/85 text-pretty">
                        {punkt[locale]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="border-line bg-muted h-full border p-7 md:p-9">
                <p className="eyebrow text-muted-foreground">{marken.heisstEsNicht[locale]}</p>
                <ul className="mt-6 flex flex-col gap-4">
                  {spurB.wasEsIst.istNicht.map((punkt) => (
                    <li key={punkt.de} className="flex gap-3.5">
                      <span aria-hidden="true" className="bg-line-strong mt-3 h-px w-5 shrink-0" />
                      <span className="type-body text-foreground/85 text-pretty">
                        {punkt[locale]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Nachweise ------------------------------------------------ */}
      <section aria-labelledby="nachweis-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <SectionEyebrow label={spurB.nachweise.eyebrow[locale]} />
              <h2 id="nachweis-titel" className="sr-only">
                {spurB.nachweise.eyebrow[locale]}
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-8">
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {spurB.nachweise.liste.map((n) => (
                  <li key={n.de} className="type-h4">
                    {n[locale]}
                  </li>
                ))}
              </ul>
              <p className="type-small text-muted-foreground border-line mt-10 max-w-2xl border-t pt-6 text-pretty">
                {spurB.nachweise.keinLebenslauf[locale]}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Sprache --------------------------------------------------- */}
      <Sprachtafel rolle={rolle} />

      {/* ---- Stand ----------------------------------------------------- */}
      <section aria-labelledby="b-stand-titel" className="section-dark">
        <div className="section-shell-tight">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-7">
              <h2 id="b-stand-titel" className="type-h3 text-balance">
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
