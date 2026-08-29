"use client"

import { Reveal } from "@/components/ui/reveal"
import { useLocale } from "@/components/locale-provider"
import { brands, clientLogos, ownProducts, type Region } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

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
  region: Region | null
  color: string
  logoPath: string | null
}) {
  return (
    <div
      className="group tile bg-surface-raised relative flex h-28 w-60 shrink-0 flex-col items-center justify-center gap-3 transition-all duration-[var(--dur-2)] hover:-translate-y-1.5 hover:elevation-2"
      style={{ ["--brand" as string]: color }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
        style={{ backgroundColor: "var(--brand)" }}
      />
      {logoPath ? (
        /*
          Bewusst ein rohes <img> und kein `next/image` (TECH-6):
          Wortmarken kommen als SVG, und die optimiert `next/image` nicht —
          es wuerde sie nur durchreichen und dafuer `dangerouslyAllowSVG`
          verlangen. Dazu haengt die Breite hier am Inhalt (`w-auto` bei
          fester Hoehe), was `next/image` ohne bekannte Masse nicht kann.
          Fuer eine Handvoll Kilobyte Vektorgrafik waere das Aufwand ohne
          Ertrag. Die grossen Rasterbilder laufen ueber `next/image`.
        */
        <img
          src={logoPath}
          alt={name}
          /*
            Dunkelmodus (P-V): fibero und CASSAMEA tragen dunkle Artwork und
            standen auf der dunklen Kachel praktisch unsichtbar. In Ruhe darum
            eine weisse Silhouette, beim Hover die echte Markenfarbe — dieselbe
            Dramaturgie wie in Hell, nur mit umgekehrtem Ausgangspunkt.
          */
          className="h-8 w-auto max-w-[9rem] opacity-70 grayscale transition-all duration-[var(--dur-2)] group-hover:opacity-100 group-hover:grayscale-0 dark:brightness-0 dark:invert dark:group-hover:brightness-100 dark:group-hover:invert-0"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="border-line-strong text-muted-foreground flex size-9 items-center justify-center type-small border font-semibold tracking-tight transition-all duration-[var(--dur-2)] group-hover:border-[var(--brand)] group-hover:text-[var(--brand)]"
          >
            {mark}
          </span>
          <span className="text-muted-foreground group-hover:text-foreground type-small text-center tracking-wide transition-colors duration-[var(--dur-2)]">
            {name}
          </span>
        </>
      )}
      {/* Ohne bestaetigte Region steht dort nichts — keine Vermutung. */}
      {region && (
        <span className="text-muted-foreground eyebrow absolute top-3 right-3 transition-colors duration-[var(--dur-2)] group-hover:text-[var(--brand)]">
          {region}
        </span>
      )}
    </div>
  )
}

type Row = { name: string; mark: string; region: Region | null; color: string; logoPath: string | null }

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
  // Echte Kunden — mit Freigabe, mit Logo sobald eins vorliegt (sonst Monogramm).
  const clientRow: Row[] = clientLogos.map(({ name, mark, region, color, logoPath }) => ({
    name,
    mark,
    region,
    color,
    logoPath,
  }))
  // Fremdmarken bewusst nur als neutrales Monogramm — ohne Freigabe kein fremdes Logo.
  // Heute leer: Ohne freigegebene Marke rendert die Reihe gar nicht, statt eine
  // Wand aus Monogrammen zu zeigen, die nichts belegt.
  const brandRow: Row[] = brands.map(({ name, mark, region, color }) => ({
    name,
    mark,
    region,
    color,
    logoPath: null,
  }))

  return (
    /*
      id war „produkte" — solange die Produkte ein Anker auf der Startseite
      waren, stimmte das. Seit PHASE A ist /produkte eine echte Route, und
      ein Anker mit demselben Namen wuerde auf etwas anderes zeigen als der
      Menuepunkt. Die Wand ist ohnehin nicht die Produktliste, sondern das
      Oekosystem: eigene Marken UND das Arbeitsumfeld.
    */
    <section id="oekosystem" aria-labelledby="oekosystem-title" className="section-seam">
      <div className="section-gutter pt-24 md:pt-32">
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionEyebrow label={t.logos.eyebrow} />
            <h2
              id="oekosystem-title"
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
        <div className="section-gutter mb-6 flex items-center gap-4">
          <p className="eyebrow text-foreground">{t.logos.ownProducts}</p>
          <span aria-hidden="true" className="bg-line h-px flex-1" />
        </div>
        <MarqueeRow items={productRow} direction="left" />
        <span className="sr-only">
          {t.logos.ownProducts}: {productRow.map((i) => i.name).join(", ")}
        </span>

        {clientRow.length > 0 && (
          <>
            <div className="section-gutter mt-14 mb-6 flex items-center gap-4">
              <p className="eyebrow text-foreground">{t.logos.clients}</p>
              <span aria-hidden="true" className="bg-line h-px flex-1" />
            </div>
            <MarqueeRow items={clientRow} direction="right" />
            <span className="sr-only">
              {t.logos.clients}: {clientRow.map((i) => i.name).join(", ")}
            </span>
          </>
        )}

        {brandRow.length > 0 && (
          <>
            <div className="section-gutter mt-14 mb-6 flex items-center gap-4">
              <p className="eyebrow text-foreground">{t.logos.brands}</p>
              <span aria-hidden="true" className="bg-line h-px flex-1" />
            </div>
            <MarqueeRow items={brandRow} direction="right" />
            <span className="sr-only">
              {t.logos.brands}: {brandRow.map((i) => i.name).join(", ")}
            </span>
          </>
        )}
      </div>
    </section>
  )
}
