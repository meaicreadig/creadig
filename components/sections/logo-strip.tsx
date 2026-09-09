"use client"

import { useLocale } from "@/components/locale-provider"
import { clientLogos, ownProducts, type LogoDunkel, type Region } from "@/lib/site-data"
import { MarkenZeichen } from "@/components/brand/marken-zeichen"
import { cn } from "@/lib/utils"

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
  dunkel?: LogoDunkel
}

/*
 * `fuellend` = die Kachel richtet sich nach ihrer Zelle statt nach sich selbst.
 *
 * Im Laufband ist die feste Breite noetig: Eine Bahn aus unterschiedlich
 * breiten Kacheln laeuft unruhig. Im Raster ist sie ein Fehler — auf 390
 * Pixeln ist eine Spalte rund 171 Pixel breit, `w-52` sind 208, und
 * `shrink-0` schiebt den Rest aus dem Bild.
 */
function LogoChip({ name, mark, color, logoPath, dunkel, fuellend }: Row & { fuellend?: boolean }) {
  return (
    <div
      className={cn(
        "group tile bg-surface-raised relative flex h-24 items-center justify-center px-4 transition-all duration-[var(--dur-2)] hover:-translate-y-1 hover:elevation-2 [--zeichen-basis-streifen:52px] sm:h-28 sm:px-5 sm:[--zeichen-basis-streifen:60px]",
        fuellend ? "w-full" : "w-52 shrink-0 sm:w-60",
      )}
      style={{ ["--brand" as string]: color }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
        style={{ backgroundColor: "var(--brand)" }}
      />
      {logoPath ? (
        /*
          GATE 14 — eine Quelle fuer alle Markenzeichen, Begruendung in
          `components/brand/marken-zeichen.tsx`.

          Der Streifen traegt eine groessere Basis als die Wand: Er steht
          direkt unter dem Hero, wo die Kacheln groesser sind. Was sich NICHT
          unterscheidet, ist die Regel — nur die Basis.
        */
        <MarkenZeichen
          name={name}
          logoPath={logoPath}
          mark={mark}
          dunkel={dunkel}
          basis="var(--zeichen-basis-streifen)"
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
    ...ownProducts.map(({ name, mark, region, color, logoPath, dunkel }) => ({
      name,
      mark,
      region,
      color,
      logoPath,
      dunkel,
    })),
    ...clientLogos.map(({ name, mark, region, color, logoPath, dunkel }) => ({
      name,
      mark,
      region,
      color,
      logoPath,
      dunkel,
    })),
  ]

  if (pool.length === 0) return null

  const row1 = pool
  const row2 = rotate(pool, 2).reverse()
  const row3 = rotate(pool, 4)

  /*
   * EIN LAUFBAND ZEIGT, WAS NICHT HINPASST. VIER KACHELN PASSEN HIN.
   *
   * Diese Wand war fuer viele Marken gebaut: eigene Produkte UND
   * Kundenlogos, drei Bahnen in drei Tempi. Seit G13 nennt die Seite keinen
   * Kunden ohne schriftliche Freigabe, und `clientLogos` ist leer. Uebrig
   * blieben vier Produkte — die das Laufband dann dreimal nebeneinander
   * wiederholte.
   *
   * Gemessen am 09.09.2026: 48 Logo-Kacheln fuer 4 Produkte auf 538 Pixeln
   * Hoehe, dazu 40 Zeichen Text. Nach der vierten Kachel kam keine Angabe
   * mehr dazu; die Wiederholung sah aus wie eine Kundenwand und war keine.
   *
   * Deshalb entscheidet jetzt die Menge ueber die Form. Kommt die erste
   * Freigabe, waechst der Pool, und die drei Bahnen kehren von selbst
   * zurueck — der Entwurf war nicht falsch, nur leer.
   */
  const PASST_IN_EINE_ZEILE = 6
  const wenige = pool.length <= PASST_IN_EINE_ZEILE

  return (
    <section
      aria-label={t.logos.eyebrow}
      className="border-line border-b py-10 md:py-14"
    >
      <div className="section-gutter mb-6">
        <p className="eyebrow text-muted-foreground">{t.logos.eyebrow}</p>
      </div>

      {wenige ? (
        <div className="section-gutter">
          {/*
            Raster statt Umbruch. Beim ersten Versuch stand hier
            `flex flex-wrap`; auf 390 Pixeln stapelten sich die vier Kacheln
            dann EINSPALTIG — die rechte Haelfte blieb leer, und die Sektion
            wurde hoeher als das Laufband, das sie ersetzen sollte. Zwei
            Spalten auf dem Telefon, vier ab der kleinen Breite.
          */}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pool.map((item) => (
              <li key={item.name} className="min-w-0">
                <LogoChip {...item} fuellend />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <MarqueeRow items={row1} direction="left" duration="52s" />
          <MarqueeRow items={row2} direction="right" duration="60s" />
          <MarqueeRow items={row3} direction="left" duration="56s" />
        </>
      )}

      <span className="sr-only">
        {pool.map((i) => i.name).join(", ")}
      </span>
    </section>
  )
}
