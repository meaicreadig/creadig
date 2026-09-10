"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { BelegKette } from "@/components/karriere/beleg-kette"
import { RollenStand } from "@/components/karriere/rollen-stand"
import { rolleFuer } from "@/lib/karriere"
import { auswahl, marken, spurA } from "@/lib/karriere-inhalt"
import { Sprachtafel } from "@/components/karriere/sprachtafel"

/**
 * /karriere/dach-business-development — das Rollendossier.
 *
 * Es ist bewusst KEINE Stellenanzeige mit „Ihr Profil / Wir bieten". Der
 * Unterschied zwischen dieser Rolle und einer Vertriebsstelle liegt nicht in
 * einer Anforderungsliste, sondern in der Arbeitsweise — deshalb trägt die
 * Seite in der Mitte ein Bild statt einer Aufzählung: die Kette vom
 * sichtbaren Signal bis zum bestätigten Bedarf.
 */
export function KarriereSpurABody() {
  const { t, locale } = useLocale()
  const rolle = rolleFuer("dach-business-development")

  return (
    <main>
      <PageHeader
        eyebrow={marken.spurA[locale]}
        title={rolle.titel[locale]}
        crumbLabel={rolle.titel[locale]}
        crumbs={[{ label: t.nav.karriere, href: "/karriere" }]}
        lead={spurA.lead[locale]}
      >
        <div className="mt-12 max-w-xl">
          <RollenStand rolle={rolle} />
        </div>
      </PageHeader>

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

      {/* ---- Was Sie tun / nicht tun ---------------------------------- */}
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

          {/*
            Die Grenze steht auf derselben Seite wie die Aufgabe — nicht im
            Kleingedruckten. Wer eine Rolle annimmt, muss vorher wissen, wo
            seine Unterschrift endet.
          */}
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

      {/* ---- Die ersten Monate ---------------------------------------- */}
      <section aria-labelledby="monate-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={spurA.entwicklung.eyebrow[locale]} />
            <h2 id="monate-titel" className="sr-only">
              {spurA.entwicklung.eyebrow[locale]}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px md:grid-cols-3">
            {spurA.entwicklung.stufen.map((stufe, i) => (
              <Reveal key={stufe.titel.de} delay={0.05 * i} y={12} className="flex">
                <div className="border-line flex w-full flex-col gap-4 border p-7">
                  <p className="eyebrow text-gold-text">{stufe.titel[locale]}</p>
                  <p className="type-body text-foreground/85 text-pretty">{stufe.text[locale]}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.14}>
            <p className="type-small text-muted-foreground mt-8 max-w-2xl text-pretty">
              {spurA.entwicklung.hinweis[locale]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- Auswahl -------------------------------------------------- */}
      <section aria-labelledby="a-auswahl-titel" className="section-dark">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={auswahl.eyebrow[locale]} />
            <h2 id="a-auswahl-titel" className="type-h2 mt-7 max-w-4xl text-balance">
              {auswahl.titel[locale]}
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-px md:grid-cols-5">
            {auswahl.schritte.map((schritt, i) => (
              <Reveal key={schritt.titel.de} as="li" delay={0.04 * i} y={12} className="flex">
                <div className="border-line flex w-full flex-col gap-3 border p-6">
                  <span className="text-meta text-gold-text">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-subhead text-base">{schritt.titel[locale]}</span>
                  <span className="type-small text-muted-foreground text-pretty">
                    {schritt.text[locale]}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.18}>
            <div className="mt-12 max-w-xl">
              <RollenStand rolle={rolle} variante="kompakt" />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
