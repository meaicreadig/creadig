"use client"

import { Reveal } from "@/components/ui/reveal"
import { useLocale } from "@/components/locale-provider"
import { brands, ownProducts, type Region } from "@/lib/site-data"

/**
 * Logo-Slot: echtes Logo, wo eins vorliegt (grayscale → Farbe bei Hover),
 * sonst sauberes Monogramm — nie ein kaputtes <img>.
 */
function LogoSlot({
  name,
  mark,
  region,
  color,
  logoPath,
}: {
  name: string
  mark: string
  region: Region
  color: string
  logoPath: string | null
}) {
  return (
    <div
      className="group border-line bg-surface-raised relative flex h-28 w-60 shrink-0 flex-col items-center justify-center gap-3 border transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_18px_44px_-24px_rgba(0,0,0,0.35)]"
      style={{ ["--brand" as string]: color }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px w-0 transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
        style={{ backgroundColor: "var(--brand)" }}
      />
      {logoPath ? (
        <img
          src={logoPath}
          alt={name}
          className="h-8 w-auto max-w-[9rem] opacity-70 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="border-line-strong text-muted-foreground flex size-9 items-center justify-center type-small border font-semibold tracking-tight transition-all duration-500 group-hover:border-[var(--brand)] group-hover:text-[var(--brand)]"
          >
            {mark}
          </span>
          <span className="text-muted-foreground group-hover:text-foreground type-small text-center tracking-wide transition-colors duration-500">
            {name}
          </span>
        </>
      )}
      <span className="text-line-strong eyebrow absolute top-3 right-3 transition-colors duration-500 group-hover:text-[var(--brand)]">
        {region}
      </span>
    </div>
  )
}

type Row = { name: string; mark: string; region: Region; color: string; logoPath: string | null }

function MarqueeRow({ items, direction }: { items: Row[]; direction: "left" | "right" }) {
  return (
    <div className="marquee-track relative overflow-hidden py-3">
      <div
        aria-hidden="true"
        className={`flex w-max gap-4 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
      >
        {[...items, ...items].map((item, i) => (
          <LogoSlot key={`${item.name}-${i}`} {...item} />
        ))}
      </div>
      {/* Weiche Kanten links/rechts */}
      <div
        aria-hidden="true"
        className="from-background pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent"
      />
      <div
        aria-hidden="true"
        className="from-background pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l to-transparent"
      />
    </div>
  )
}

export function LogoWall() {
  const { t } = useLocale()

  const productRow: Row[] = ownProducts.map(({ name, mark, region, color, logoPath }) => ({
    name,
    mark,
    region,
    color,
    logoPath,
  }))
  // Fremdmarken bewusst nur als neutrales Monogramm — ohne Freigabe kein fremdes Logo.
  const brandRow: Row[] = brands.map(({ name, mark, region, color }) => ({
    name,
    mark,
    region,
    color,
    logoPath: null,
  }))

  return (
    <section id="produkte" aria-labelledby="produkte-title" className="border-line border-b">
      <div className="mx-auto w-full max-w-[100rem] px-6 pt-24 md:px-10 md:pt-32 lg:px-16">
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="bg-gold h-px w-10" />
              <p className="eyebrow text-muted-foreground">{t.logos.eyebrow}</p>
            </div>
            <h2
              id="produkte-title"
              className="type-h2 mt-7 max-w-2xl text-balance"
            >
              {t.logos.title}
            </h2>
          </div>
          <p className="type-lead text-muted-foreground max-w-sm text-pretty">
            {t.logos.note}
          </p>
        </Reveal>
      </div>

      <div className="mt-16 pb-24 md:pb-32">
        <div className="mx-auto mb-6 flex w-full max-w-[100rem] items-center gap-4 px-6 md:px-10 lg:px-16">
          <p className="eyebrow text-foreground">{t.logos.ownProducts}</p>
          <span aria-hidden="true" className="bg-line h-px flex-1" />
        </div>
        <MarqueeRow items={productRow} direction="left" />
        <span className="sr-only">
          {t.logos.ownProducts}: {productRow.map((i) => i.name).join(", ")}
        </span>

        <div className="mx-auto mt-14 mb-6 flex w-full max-w-[100rem] items-center gap-4 px-6 md:px-10 lg:px-16">
          <p className="eyebrow text-foreground">{t.logos.brands}</p>
          <span aria-hidden="true" className="bg-line h-px flex-1" />
        </div>
        <MarqueeRow items={brandRow} direction="right" />
        <span className="sr-only">
          {t.logos.brands}: {brandRow.map((i) => i.name).join(", ")}
        </span>
      </div>
    </section>
  )
}
