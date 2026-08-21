"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ownProducts, type Work } from "@/lib/site-data"

/**
 * Eine Produkt-Welt (PHASE A — Gerüst; die Tiefe folgt in PHASE B).
 *
 * Der Aufbau folgt der Reihenfolge, in der jemand ein fremdes Produkt liest:
 * Was ist das? (Name, Sektor, Einzeiler) → Läuft es? (Status, Markt, Live-Link)
 * → Was habt ihr daran gebaut? (`built`) → Zeig es mir (Interface).
 *
 * Der letzte Schritt ist gated und zwar hart: `screens` kommt aus dem
 * Dateisystem (lib/product-media.ts). Liegt nichts vor, steht hier ein Satz,
 * der sagt WARUM kein Bild da ist — kein Deko-Laptop, kein erfundenes
 * Interface, keine Mockup-Attrappe. Das ist die gesperrte Regel des Projekts,
 * und eine Produktseite ist genau die Stelle, an der sie sonst zuerst bricht.
 */
export function ProduktPageBody({
  product,
  screens,
}: {
  product: Work
  /** Echte Aufnahmen aus `public/works/products/<slug>/` — leer = keine da. */
  screens: string[]
}) {
  const { t } = useLocale()
  const copy = t.produktPage
  const logo = ownProducts.find((p) => p.name === product.name)

  return (
    <main>
      <PageHeader
        eyebrow={product.sector}
        title={product.name}
        lead={product.what}
        crumbs={[{ label: copy.breadcrumb, href: "/produkte" }]}
      >
        {/* Signal-Zeile: nur belegte Felder. `year` ist überall null und
            steht darum bewusst nirgends. */}
        <div className="border-line mt-12 grid gap-px border-t sm:grid-cols-3">
          <div className="pt-7 sm:pr-8">
            <p className="eyebrow text-gold-text">{copy.statusLabel}</p>
            <p className="type-body text-foreground/85 mt-3 text-pretty">{product.outcome}</p>
          </div>
          <div className="border-line pt-7 sm:border-l sm:pl-8">
            <p className="eyebrow text-gold-text">{copy.regionLabel}</p>
            <p className="type-body text-foreground/85 mt-3">{product.region}</p>
          </div>
          <div className="border-line pt-7 sm:border-l sm:pl-8">
            <p className="eyebrow text-gold-text">{copy.sectorLabel}</p>
            <p className="type-body text-foreground/85 mt-3">{product.sector}</p>
          </div>
        </div>

        {product.href && (
          <a
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-line-strong hover:border-gold hover:text-gold-text mt-10 inline-flex items-center gap-2.5 border px-7 py-3.5 text-sm tracking-wide transition-colors duration-500"
          >
            {copy.liveLabel}
            <ArrowUpRight className="size-4" strokeWidth={1.5} />
          </a>
        )}
      </PageHeader>

      <section aria-labelledby="gebaut-title" className="border-line border-b">
        <div className="section-shell">
          <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={copy.builtLabel} />
              <h2 id="gebaut-title" className="type-h3 mt-7 max-w-2xl text-balance">
                {product.built}
              </h2>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-5">
              <div className="border-line border-t pt-7">
                <p className="eyebrow text-gold-text">{copy.whatLabel}</p>
                <p className="type-body text-foreground/85 mt-4 text-pretty">{product.what}</p>
              </div>

              {/* Marken-Zeichen, wo eins vorliegt — sonst das Monogramm. Nie ein
                  kaputtes <img>. */}
              <div className="border-line mt-10 flex h-16 items-center border-t pt-7">
                {logo?.logoPath ? (
                  <img
                    src={logo.logoPath}
                    alt={`${product.name} — Logo`}
                    className="h-7 w-auto max-w-[9rem] opacity-80 dark:brightness-0 dark:invert"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="border-line-strong text-muted-foreground flex size-10 items-center justify-center border text-sm font-semibold tracking-tight"
                  >
                    {product.mark}
                  </span>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Interface — gated. Bilder nur, wenn echte Aufnahmen im Repo liegen.
          ------------------------------------------------------------------ */}
      {screens.length > 0 ? (
        <section aria-labelledby="interface-title" className="border-line border-b">
          <div className="section-shell">
            <Reveal>
              <SectionEyebrow label={copy.screensLabel} />
              <h2 id="interface-title" className="sr-only">
                {copy.screensLabel}
              </h2>
            </Reveal>
            <div className="mt-14 flex flex-col gap-8">
              {screens.map((src, i) => (
                <Reveal key={src} delay={0.06 * i}>
                  <div className="border-line bg-surface relative aspect-[16/10] w-full overflow-hidden border">
                    <Image
                      src={src}
                      alt={`${product.name} — Oberfläche aus dem laufenden System`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section aria-label={copy.screensLabel} className="border-line border-b">
          <div className="section-shell-tight">
            <Reveal>
              <p className="type-body text-muted-foreground max-w-2xl text-pretty">
                {copy.screensPending}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      <section aria-labelledby="produkt-cta-title" className="border-line border-b">
        <div className="section-shell-tight">
          <Reveal>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 id="produkt-cta-title" className="type-h3 max-w-2xl text-balance">
                  {copy.ctaTitle}
                </h2>
                <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
                  {copy.ctaBody}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton href="/kontakt">{copy.ctaPrimary}</MagneticButton>
                <MagneticButton href="/produkte" variant="ghost">
                  {copy.ctaSecondary}
                </MagneticButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Link
              href="/produkte"
              className="text-muted-foreground hover:text-foreground mt-14 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
              {copy.backLabel}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
