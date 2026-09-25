"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Disclosure } from "@/components/ui/disclosure"
import { findOffer, formatPrice, offerAmount } from "@/lib/offers"

/**
 * DIE ANGEBOTE AUF DER STARTSEITE (W1/W2 · §12).
 *
 * Vorher: „Drei Arten anzufangen" — Festpreis AB, Monatlich, Analyse — und die
 * 149 EUR standen an der Ebene „Operations", also als Preis fuer Systemarbeit.
 * Damit war die sichtbarste Zahl der Seite eine Website-Betreuung, und sie
 * stand an der falschen Stelle.
 *
 * Jetzt die Angebote in Kundensprache, aus `lib/offers.ts`:
 *
 *   Website          Festpreis — der Pilotplatz als eigener Kasten daran
 *   Systemanalyse    erscheint erst, wenn der Owner den Betrag nennt (O3)
 *   Systemprojekt    Angebot nach Analyse — keine Zahl, ein Weg
 *   Website-Betreuung monatlich, nur fuer Seiten, die wir gebaut haben
 *   BFSG-Pruefung    als Verweis fuer alle, deren Seite schon steht
 *
 * Kein Betrag wird hier getippt; kein „ab".
 */

type Zeile = {
  key: string
  name: string
  art: string
  betrag: number | null
  monatlich: boolean
  body: string
  cta: string
  href: string
  bedingung?: string
}

export function EntryLine() {
  const { t, locale } = useLocale()
  const copy = t.home.entry
  const website = findOffer("website")
  const pilot = findOffer("website-pilot")
  const analyse = findOffer("analyse")
  const betreuung = findOffer("betreuung")

  const zeilen: Zeile[] = [
    {
      key: "website",
      name: website.label[locale],
      art: copy.angebote.website.art,
      betrag: offerAmount("website"),
      monatlich: false,
      body: copy.angebote.website.body,
      cta: copy.angebote.website.cta,
      href: "/leistungen#pakete",
      bedingung: pilot.published ? pilot.condition?.[locale] : undefined,
    },
    ...(analyse.published && analyse.amount !== null
      ? [
          {
            key: "analyse",
            name: analyse.label[locale],
            art: copy.angebote.analyse.art,
            betrag: analyse.amount,
            monatlich: false,
            body: copy.angebote.analyse.body,
            cta: copy.angebote.analyse.cta,
            href: "/termin?art=systemgespraech",
          },
        ]
      : []),
    {
      key: "systemprojekt",
      name: copy.angebote.systemprojekt.name,
      art: copy.angebote.systemprojekt.art,
      betrag: null,
      monatlich: false,
      body: copy.angebote.systemprojekt.body,
      cta: copy.angebote.systemprojekt.cta,
      href: "/termin?art=systemgespraech",
    },
    {
      key: "betreuung",
      name: betreuung.label[locale],
      art: copy.angebote.betreuung.art,
      betrag: offerAmount("betreuung"),
      monatlich: true,
      body: copy.angebote.betreuung.body,
      cta: copy.angebote.betreuung.cta,
      href: "/betrieb",
    },
  ]

  const questions = t.faq.items.slice(0, 2)

  return (
    <section id="einstieg" aria-labelledby="einstieg-title" className="section-seam">
      <div className="section-shell-tight">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionEyebrow label={copy.eyebrow} />
              <h2 id="einstieg-title" className="type-h3 mt-7 max-w-xl text-balance">
                {copy.title}
              </h2>
              <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
                {copy.lead}
              </p>
            </Reveal>

            <ul className="border-line mt-10 flex flex-col border-t">
              {zeilen.map((zeile) => (
                <li key={zeile.key} className="border-line border-b">
                  <div className="grid gap-x-8 gap-y-3 py-7 md:grid-cols-12 md:items-baseline">
                    <p className="md:col-span-4">
                      <span className="text-subhead block text-lg">{zeile.name}</span>
                      <span className="eyebrow text-gold-text mt-2 block">{zeile.art}</span>
                      {zeile.betrag !== null && (
                        <span className="type-h4 mt-2.5 block">
                          {formatPrice(zeile.betrag, locale)}
                          {zeile.monatlich && (
                            <span className="type-small text-muted-foreground ms-1.5">
                              {t.packages.monthly}
                            </span>
                          )}
                        </span>
                      )}
                    </p>
                    <div className="md:col-span-8">
                      <p className="type-small text-foreground/85 max-w-md text-pretty">{zeile.body}</p>
                      {zeile.bedingung && (
                        <p className="border-line text-meta text-muted-foreground mt-3 inline-block rounded-lg border px-3 py-2">
                          {zeile.bedingung}
                        </p>
                      )}
                      <Link
                        href={zeile.href}
                        className="text-gold-text hover:text-foreground mt-3 flex w-fit items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                      >
                        {zeile.cta}
                        <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Reveal delay={0.2}>
              <p className="type-small text-muted-foreground mt-6">
                {copy.auditNote}{" "}
                <Link
                  href="/leistungen/barrierefreiheit-website"
                  className="text-gold-text hover:text-foreground underline-offset-4 hover:underline"
                >
                  {copy.auditCta}
                </Link>
              </p>
              <p className="text-meta text-muted-foreground mt-3">{copy.nettoNote}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
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
                  <Disclosure label={item.q} size="sm" heading>
                    <p className="type-small text-muted-foreground text-pretty">{item.a}</p>
                  </Disclosure>
                </Reveal>
              ))}
              <div className="border-line border-t" />
            </div>
            <Reveal delay={0.24}>
              <Link
                href="/leistungen#faq"
                className="text-gold-text hover:text-foreground mt-7 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
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
