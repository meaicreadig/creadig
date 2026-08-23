"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, Check, ChevronRight, Minus } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { clientWorks, packages, productWorks } from "@/lib/site-data"
import { WHATSAPP_LINK } from "@/lib/dictionary"
import type { ServicePage } from "@/lib/service-pages"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { QuickCheck } from "@/components/service/quick-check"

/**
 * Körper einer Leistungsseite.
 *
 * Zweisprachig, deshalb Client-Komponente — Titel, Description und die
 * strukturierten Daten liefert die Server-Seite darüber.
 *
 * Alles hier zeigt bereits belegte Inhalte: die Ebenen-Beschreibung aus dem
 * Wörterbuch, die drei Prozessschritte, die Paketinhalte
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

      <div className="section-gutter relative pt-32 pb-24 md:pt-40 md:pb-32">
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
                href="/leistungen"
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
          <SectionEyebrow label={`${copy.layerLabel} · ${layer.name}`} />
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

            {/*
              BF-A6 — „Was wir tun, und was nicht."

              Zwei Spalten, gleich gross, gleich ausfuehrlich. Die rechte ist
              die wichtigere: Sie steht zwischen einem zufriedenen Kunden und
              einem, der glaubt, er habe Rechtssicherheit gekauft. Kein Satz
              hier verspricht ein rechtliches Ergebnis, und keiner droht mit
              einem.
            */}
            {page.boundary && (
              <Reveal delay={0.06} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.boundaryLabel}</p>
                <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                  <div>
                    <h2 className="text-subhead text-lg">{copy.boundaryWeLabel}</h2>
                    <ul className="mt-5 flex flex-col gap-4">
                      {page.boundary.we[locale].map((item) => (
                        <li key={item} className="flex gap-3.5">
                          <Check className="text-gold mt-1 size-4 shrink-0" strokeWidth={1.5} />
                          <span className="type-small text-foreground/85 text-pretty">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-subhead text-lg">{copy.boundaryNotWeLabel}</h2>
                    <ul className="mt-5 flex flex-col gap-4">
                      {page.boundary.notWe[locale].map((item) => (
                        <li key={item} className="flex gap-3.5">
                          {/* Kein Warn-Rot: Das hier ist keine Fehlermeldung,
                              sondern eine Zusage darueber, was nicht dazugehoert. */}
                          <Minus
                            aria-hidden="true"
                            className="text-muted-foreground mt-1 size-4 shrink-0"
                            strokeWidth={1.5}
                          />
                          <span className="type-small text-muted-foreground text-pretty">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="type-small text-muted-foreground border-line mt-8 border-t pt-6 text-pretty">
                  {page.boundary.note[locale]}
                </p>
              </Reveal>
            )}

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
                  href="/arbeiten"
                  className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
                >
                  {copy.worksCta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Reveal>
            )}
          </div>

          {/* Rechte Spalte: Für wen, Pakete */}
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

            {/*
              BF-9 — HIER STAND DER PREIS, UND DAS WAR DIE FALSCHE STELLE.

              Diese Spalte liegt auf demselben Bildschirm wie „Arbeiten dazu"
              in der Spalte daneben. Rechts €2.400, links NV SWISS und maqam —
              gemessen keine 300 Pixel auseinander. Wer beides zugleich sieht,
              liest die Zahl als den Preis dieser Arbeiten. Das entwertet die
              Referenzen und verankert uns auf einer Zahl, die fuer den Fall
              gar nicht gilt.

              Der Preis steht jetzt an genau EINER Stelle: im Angebot auf
              `/leistungen`. Diese Seite nennt das Paket beim Namen und
              verlinkt dorthin — und `/leistungen` traegt keine Referenzen.
              Damit koennen Referenz und Preis gar nicht mehr zusammentreffen,
              nicht nur zufaellig gerade nicht.
            */}
            <Reveal delay={0.08} className="border-line mt-14 border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.packagesLabel}</p>
              <ul className="mt-6 flex flex-col gap-px">
                {packages
                  .filter((pkg) => page.packageKeys.includes(pkg.key))
                  .map((pkg) => (
                    <li key={pkg.key} className="border-line border-t py-5">
                      <span className="text-subhead text-lg">
                        {t.packages.items[pkg.key].name}
                      </span>
                    </li>
                  ))}
              </ul>
              {/*
                BF-A11 — der Satz, der die zweite Preiswelt verhindert.

                Barrierefreiheit ist Einstieg, nicht Konkurrenzprodukt: im
                Paket eingebaut, wenn neu gebaut wird — eigene Leistung, wenn
                die Seite schon steht. Ohne diesen Satz stehen beide Angebote
                nebeneinander und der Leser muss raten, welches fuer ihn gilt.
              */}
              {page.packageNote && (
                <p className="type-small text-muted-foreground mt-5 text-pretty">
                  {page.packageNote[locale]}
                </p>
              )}
              <Link
                href="/leistungen#pakete"
                className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
              >
                {copy.packagesCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>

          </div>
        </div>

        {/*
          BF-A8 — der Beweis am Objekt des Kunden.

          Er steht NACH der Leistungsbeschreibung und VOR dem allgemeinen
          Abschluss: Wer bis hierher gelesen hat, will nicht noch ein
          Erstgespraech ueber Grundsaetzliches, sondern wissen, wie seine
          eigene Seite dasteht. Der allgemeine CTA bleibt darunter fuer alle
          anderen.
        */}
        {page.quickCheck && (
          <div className="mt-24">
            <QuickCheck />
          </div>
        )}

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
