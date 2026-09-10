"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { RollenStand } from "@/components/karriere/rollen-stand"
import { Sprachtafel } from "@/components/karriere/sprachtafel"
import { rolleFuer } from "@/lib/karriere"
import { auswahl, marken, spurB } from "@/lib/karriere-inhalt"

/**
 * /karriere/founding-talent.
 *
 * Die Seite muss zwei Leser gleichzeitig überzeugen: eine starke
 * Zwanzigjährige, für die „Founding" nicht nach Praktikum klingen darf, und
 * jemanden mit sechs Jahren Erfahrung, für den es nicht nach Jugendmarketing
 * klingen darf. Deshalb steht früh und wörtlich, was „Founding" NICHT heißt —
 * keine Anteile, kein Gründertitel, kein „jeder macht alles".
 */
export function KarriereSpurBBody() {
  const { t, locale } = useLocale()
  const rolle = rolleFuer("founding-talent")

  return (
    <main>
      <PageHeader
        eyebrow={marken.spurB[locale]}
        title={rolle.titel[locale]}
        crumbLabel={rolle.titel[locale]}
        crumbs={[{ label: t.nav.karriere, href: "/karriere" }]}
        lead={spurB.lead[locale]}
      >
        <div className="mt-12 max-w-xl">
          <RollenStand rolle={rolle} />
        </div>
      </PageHeader>

      {/* ---- Handwerke ------------------------------------------------ */}
      <section aria-labelledby="handwerke-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={marken.disziplinen[locale]} />
            <h2 id="handwerke-titel" className="type-h2 mt-7 max-w-4xl text-balance">
              {t.karriere.spurenTitel}
            </h2>
          </Reveal>
          {/*
            Fünf Handwerke als Zeile, nicht als fünf Stellenkarten. Es sind
            keine fünf Vakanzen — es ist eine Spur, unter der fünf Handwerke
            Platz haben. Wer daraus fünf Kacheln macht, behauptet fünf offene
            Stellen.
          */}
          <ul className="border-line mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t pt-8">
            {rolle.disziplinen.map((disziplin, i) => (
              <Reveal key={disziplin.de} as="li" delay={0.04 * i} y={10}>
                <span className="type-h3">{disziplin[locale]}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Was Founding heißt / nicht heißt ------------------------- */}
      <section aria-labelledby="founding-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={spurB.wasFounding.eyebrow[locale]} />
            <h2 id="founding-titel" className="sr-only">
              {spurB.wasFounding.eyebrow[locale]}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px lg:grid-cols-2">
            <Reveal>
              <div className="border-gold/45 h-full border p-7 md:p-9">
                <p className="eyebrow text-gold-text">
                  {marken.heisstEs[locale]}
                </p>
                <ul className="mt-6 flex flex-col gap-4">
                  {spurB.wasFounding.ist.map((punkt) => (
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
                <p className="eyebrow text-muted-foreground">
                  {marken.heisstEsNicht[locale]}
                </p>
                <ul className="mt-6 flex flex-col gap-4">
                  {spurB.wasFounding.istNicht.map((punkt) => (
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

      {/* ---- Worauf wir sehen ---------------------------------------- */}
      <section aria-labelledby="worauf-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={spurB.worauf.eyebrow[locale]} />
              <h2 id="worauf-titel" className="type-h2 mt-7 text-balance">
                {spurB.worauf.titel[locale]}
              </h2>
            </Reveal>
          </div>

          {/* Die fünf Fragen — sie sind der eigentliche Inhalt der Spur. */}
          <ol className="border-line mt-14 border-t">
            {spurB.worauf.fragen.map((frage, i) => (
              <Reveal key={frage.de} as="li" delay={0.04 * i} y={10}>
                <div className="border-line flex items-baseline gap-6 border-b py-6">
                  <span className="text-meta text-gold-text shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="type-h4 text-pretty">{frage[locale]}</span>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.2}>
            <p className="eyebrow text-muted-foreground mt-14">
              {spurB.worauf.nachweisLabel[locale]}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {spurB.worauf.nachweise.map((n) => (
                <li key={n.de} className="type-body text-foreground/85">
                  {n[locale]}
                </li>
              ))}
            </ul>
            <p className="type-small text-muted-foreground border-line mt-8 max-w-2xl border-t pt-6 text-pretty">
              {spurB.worauf.keinLebenslauf[locale]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- KI -------------------------------------------------------- */}
      <section aria-labelledby="ki-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <SectionEyebrow label={spurB.ki.eyebrow[locale]} />
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-8">
              <h2 id="ki-titel" className="type-h3 text-balance">
                {spurB.ki.titel[locale]}
              </h2>
              <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
                {spurB.ki.text[locale]}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Sprache --------------------------------------------------- */}
      <Sprachtafel rolle={rolle} />

      {/* ---- Auswahl --------------------------------------------------- */}
      <section aria-labelledby="b-auswahl-titel" className="section-dark">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={auswahl.eyebrow[locale]} />
            <h2 id="b-auswahl-titel" className="type-h2 mt-7 max-w-4xl text-balance">
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
