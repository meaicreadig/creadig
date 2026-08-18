"use client"

import Link from "next/link"
import { ArrowUpRight, Check, ChevronRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { clientWorks, packages, productWorks } from "@/lib/site-data"
import { WHATSAPP_LINK } from "@/lib/dictionary"
import type { ServicePage } from "@/lib/service-pages"

/**
 * Körper einer Leistungsseite.
 *
 * Zweisprachig, deshalb Client-Komponente — Titel, Description und die
 * strukturierten Daten liefert die Server-Seite darüber.
 *
 * Alles hier zeigt bereits belegte Inhalte: die Ebenen-Beschreibung aus dem
 * Wörterbuch, die drei Prozessschritte, die Paketinhalte, den Förder-Hinweis
 * und echte Arbeiten. Die Seite bündelt sie für einen Suchbegriff, sie
 * erfindet nichts dazu.
 */
export function ServicePageBody({ page }: { page: ServicePage }) {
  const { t, locale } = useLocale()
  const layer = t.services.layers[page.layer]
  const copy = t.servicePage
  const allWorks = [...productWorks, ...clientWorks]
  const works = page.workSlugs
    .map((slug) => allWorks.find((w) => w.slug === slug))
    .filter((w): w is (typeof allWorks)[number] => Boolean(w))

  return (
    <main className="relative">
      <SignatureMotif
        direction="down"
        className="motif-band pointer-events-none absolute inset-x-0 top-0 h-[34rem] w-full"
      />

      <div className="relative mx-auto w-full max-w-[100rem] px-6 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32 lg:px-16">
        {/* Brotkrumen: der Weg zurück ins System, nicht nur ein Zurück-Pfeil. */}
        <nav aria-label="Brotkrumen">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-meta">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors duration-300">
                {copy.breadcrumbHome}
              </Link>
            </li>
            <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            <li>
              <Link
                href="/#leistungen"
                className="hover:text-foreground transition-colors duration-300"
              >
                {copy.breadcrumbServices}
              </Link>
            </li>
            <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            <li aria-current="page" className="text-foreground">
              {page.h1[locale]}
            </li>
          </ol>
        </nav>

        <Reveal className="mt-12">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="bg-gold h-px w-10" />
            <p className="eyebrow text-muted-foreground">
              {copy.layerLabel} · {layer.name}
            </p>
          </div>
          <h1 className="type-h1 mt-7 max-w-4xl text-balance">{page.h1[locale]}</h1>
          <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">
            {page.lead[locale]}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-x-12 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.includesLabel}</p>
              <ul className="mt-6 flex flex-col gap-4">
                {page.includes[locale].map((item) => (
                  <li key={item} className="flex gap-3.5">
                    <Check className="text-gold mt-1 size-4 shrink-0" strokeWidth={1.5} />
                    <span className="type-body text-foreground/85 text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Der Prozess ist derselbe wie auf der Startseite — bewusst. */}
            <Reveal delay={0.08} className="border-line mt-14 border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.processLabel}</p>
              <div className="mt-6 grid gap-8 sm:grid-cols-3">
                {(["understand", "build", "operate"] as const).map((key, i) => (
                  <div key={key}>
                    <span className="eyebrow text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-subhead mt-3 text-lg">{t.process.steps[key].name}</h2>
                    <p className="type-small text-muted-foreground mt-3 text-pretty">
                      {t.process.steps[key].what}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            {works.length > 0 && (
              <Reveal delay={0.12} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.worksLabel}</p>
                <ul className="border-line bg-line mt-6 grid gap-px border sm:grid-cols-2">
                  {works.map((work) => (
                    <li
                      key={work.slug}
                      className="bg-surface flex flex-col gap-2 px-6 py-6"
                    >
                      <span className="text-subhead text-lg">{work.name}</span>
                      <span className="type-small text-muted-foreground text-pretty">
                        {work.what}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/#arbeiten"
                  className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
                >
                  {copy.worksCta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Reveal>
            )}
          </div>

          {/* Rechte Spalte: Für wen, Pakete, Förderung */}
          <div className="lg:col-span-5">
            <Reveal className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.forWhomLabel}</p>
              <ul className="mt-6 flex flex-col gap-4">
                {page.forWhom[locale].map((item) => (
                  <li key={item} className="flex gap-3.5">
                    <span aria-hidden="true" className="bg-gold mt-2.5 h-px w-5 shrink-0" />
                    <span className="type-body text-foreground/85 text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="type-small text-muted-foreground mt-6 text-pretty">{layer.who}</p>
            </Reveal>

            <Reveal delay={0.08} className="border-line mt-14 border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.packagesLabel}</p>
              <ul className="mt-6 flex flex-col gap-px">
                {packages
                  .filter((pkg) => page.packageKeys.includes(pkg.key))
                  .map((pkg) => (
                    <li
                      key={pkg.key}
                      className="border-line flex items-baseline justify-between gap-4 border-t py-5"
                    >
                      <span className="text-subhead text-lg">
                        {t.packages.items[pkg.key].name}
                      </span>
                      <span className="type-body text-muted-foreground">
                        {pkg.price}
                        <span className="text-meta ml-1.5">
                          {pkg.period ? t.packages.monthly : t.packages.once}
                        </span>
                      </span>
                    </li>
                  ))}
              </ul>
              <Link
                href="/#pakete"
                className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
              >
                {copy.packagesCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="border-gold/45 bg-muted mt-14 border-l-2 py-6 pl-6">
                <p className="eyebrow text-gold-text">{copy.fundingLabel}</p>
                <p className="type-body text-foreground/85 mt-4 text-pretty">
                  {t.certs.funding.body}
                </p>
                <Link
                  href="/#zertifizierungen"
                  className="text-gold-text hover:text-foreground mt-5 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
                >
                  {t.packages.fundingLink}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Abschluss-CTA — dieselbe Zusage wie überall: kostenlos, unverbindlich. */}
        <Reveal delay={0.1}>
          <div className="border-line mt-24 flex flex-col gap-8 border-t pt-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="type-h3 max-w-2xl text-balance">{copy.ctaTitle}</h2>
              <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
                {copy.ctaBody}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/termin"
                className="group from-gold-soft to-gold relative inline-flex items-center gap-2.5 overflow-hidden bg-gradient-to-br px-7 py-3.5 text-sm tracking-wide text-[#201e1b]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                />
                <span className="group-hover:text-gold-soft relative z-10 flex items-center gap-2.5 transition-colors duration-500">
                  {copy.ctaPrimary}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </span>
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2.5 border px-7 py-3.5 text-sm tracking-wide transition-colors duration-500"
              >
                <WhatsAppIcon className="size-4" />
                {copy.ctaSecondary}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  )
}
