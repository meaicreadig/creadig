"use client"

import { useLocale } from "@/components/locale-provider"
import { clientLogos, ownProducts, type Region } from "@/lib/site-data"

/**
 * Startseite · Logo-Streifen direkt unter dem Hero.
 *
 * Drei Reihen, Gegenlauf: links → rechts · rechts → links · links → rechts.
 * Hover pausiert (CSS, ohne Klick). Nur echte, freigegebene Marken —
 * eigene Produkte und Kunden mit Logo/Zustimmung. Keine erfundenen Namen.
 *
 * Die volle Wand mit Überschrift bleibt auf /unternehmen (`LogoWall`).
 * Hier reicht der Beweis: mit wem und wofür das Haus arbeitet.
 */

type Row = {
  name: string
  mark: string
  region: Region | null
  color: string
  logoPath: string | null
}

function LogoChip({ name, mark, color, logoPath }: Row) {
  return (
    <div
      className="group tile bg-surface-raised relative flex h-24 w-52 shrink-0 items-center justify-center px-4 transition-all duration-[var(--dur-2)] hover:-translate-y-1 hover:elevation-2 sm:h-28 sm:w-60 sm:px-5"
      style={{ ["--brand" as string]: color }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
        style={{ backgroundColor: "var(--brand)" }}
      />
      {logoPath ? (
        <img
          src={logoPath}
          alt={name}
          className="h-10 w-auto max-w-[11rem] opacity-70 grayscale transition-all duration-[var(--dur-2)] group-hover:opacity-100 group-hover:grayscale-0 sm:h-12 sm:max-w-[12rem] dark:brightness-0 dark:invert dark:group-hover:brightness-100 dark:group-hover:invert-0"
        />
      ) : (
        <span className="text-muted-foreground group-hover:text-foreground type-small tracking-wide transition-colors duration-[var(--dur-2)]">
          <span
            aria-hidden="true"
            className="border-line-strong me-2 inline-flex size-8 items-center justify-center border text-xs font-semibold group-hover:border-[var(--brand)] group-hover:text-[var(--brand)]"
          >
            {mark}
          </span>
          {name}
        </span>
      )}
    </div>
  )
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: Row[]
  direction: "left" | "right"
  duration: string
}) {
  /* Mindestens acht Slots, sonst wirkt die Bahn leer und der Loop ruckelt. */
  const base = items.length > 0 ? items : []
  const padded =
    base.length === 0
      ? []
      : Array.from({ length: Math.max(8, base.length * 2) }, (_, i) => base[i % base.length])

  if (padded.length === 0) return null

  return (
    <div className="marquee-track relative overflow-hidden py-2">
      <div
        aria-hidden="true"
        className={`flex w-max gap-3 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        style={{ animationDuration: duration }}
      >
        {[...padded, ...padded].map((item, i) => (
          <LogoChip key={`${item.name}-${i}`} {...item} />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="from-background pointer-events-none absolute inset-y-0 start-0 w-16 bg-gradient-to-r to-transparent sm:w-24"
      />
      <div
        aria-hidden="true"
        className="from-background pointer-events-none absolute inset-y-0 end-0 w-16 bg-gradient-to-l to-transparent sm:w-24"
      />
    </div>
  )
}

function rotate<T>(list: T[], offset: number): T[] {
  if (list.length === 0) return list
  const n = ((offset % list.length) + list.length) % list.length
  return [...list.slice(n), ...list.slice(0, n)]
}

export function LogoStrip() {
  const { t } = useLocale()

  const pool: Row[] = [
    ...ownProducts.map(({ name, mark, region, color, logoPath }) => ({
      name,
      mark,
      region,
      color,
      logoPath,
    })),
    ...clientLogos.map(({ name, mark, region, color, logoPath }) => ({
      name,
      mark,
      region,
      color,
      logoPath,
    })),
  ]

  if (pool.length === 0) return null

  const row1 = pool
  const row2 = rotate(pool, 2).reverse()
  const row3 = rotate(pool, 4)

  return (
    <section
      aria-label={t.logos.eyebrow}
      className="border-line border-b py-10 md:py-14"
    >
      <div className="section-gutter mb-6">
        <p className="eyebrow text-muted-foreground">{t.logos.eyebrow}</p>
      </div>

      <MarqueeRow items={row1} direction="left" duration="52s" />
      <MarqueeRow items={row2} direction="right" duration="60s" />
      <MarqueeRow items={row3} direction="left" duration="56s" />

      <span className="sr-only">
        {pool.map((i) => i.name).join(", ")}
      </span>
    </section>
  )
}
