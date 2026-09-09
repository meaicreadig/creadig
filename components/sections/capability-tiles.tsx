"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { serviceLayers } from "@/lib/site-data"
import { publishedServicePages } from "@/lib/service-pages"

/**
 * Die fünf Ebenen als STUFEN — der Verteiler auf der Startseite.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER STAND UND WARUM ES DEM SATZ WIDERSPRACH
 *
 * Bis zum 09.09.2026 waren das fünf gleich breite Karten nebeneinander
 * (`lg:grid-cols-5`). Direkt daneben steht der Satz, der das Modell trägt:
 *
 *     „Jede Ebene trägt die nächste. Sie können auf jeder einsteigen —
 *      und auf jeder aufhören."
 *
 * Fünf gleich große, getrennte, parallele Kästen sagen das Gegenteil: Da
 * trägt nichts irgendetwas. Sie sagen „fünf Dienstleistungen", und genau
 * das ist creaDIG nicht — die Ebenen sind ein Modell, um zu lesen, wo ein
 * Betrieb systemisch steht.
 *
 * Dazu kam ein sichtbarer Nebeneffekt: Nur drei der fünf Ebenen haben heute
 * granulare Leistungsseiten. In einem Kartenraster mit gleicher Höhe standen
 * die anderen beiden mit rund 200 Pixeln Leere darunter — was aussah wie
 * fehlender Inhalt, nicht wie eine Entscheidung.
 *
 * ---------------------------------------------------------------------------
 * WARUM STUFEN UND NICHTS NEU ERFUNDENES
 *
 * Die Bildsprache dafür GAB es schon: `Services` auf /leistungen zeichnet
 * die Ebenen als gestaffelte Architektur, jede breiter als die darunter.
 * Sie stand nur auf der Unterseite, während die erste Begegnung mit der
 * Marke ein Kartenraster zeigte.
 *
 * Hier steht jetzt dieselbe Grammatik in kompakt: fünf Zeilen, jede um eine
 * Stufe weiter eingerückt als die darüber, verbunden durch eine
 * durchlaufende Haarlinie. Der Blick liest einen Aufbau statt einer Reihe.
 * Es ist kein zweites Modell — es ist dasselbe, eine Ebene früher.
 *
 * Die Einrückung nutzt logische Abstände (`margin-inline-start`), damit die
 * Treppe im Arabischen von rechts läuft und nicht bricht.
 *
 * Auf schmalen Geräten ist die Stufe kleiner und fest statt prozentual: Bei
 * 342 Pixeln Inhaltsbreite waeren acht Prozent kaum 27 Pixel und wuerden mit
 * jeder Zeile anders ausfallen. Feste 8/16/24/32 Pixel bleiben als Treppe
 * lesbar und kosten hoechstens ein Wort je Zeile. Die Bildsprache darf auf
 * dem Telefon nicht verschwinden — sie darf nur leiser werden.
 *
 * ---------------------------------------------------------------------------
 * WAS UNVERÄNDERT BLEIBT
 *
 * Jede Zeile führt auf ihren Ankerabschnitt in /leistungen. Wo es zu einer
 * Ebene eine granulare Leistungsseite gibt (die Vokabel, nach der wirklich
 * gesucht wird — „Webdesign", nicht „Digital"), steht sie daneben. Nicht
 * jede Ebene hat eine; dann steht dort nichts. Eine Seite zu erfinden, damit
 * eine Zeile voller aussieht, wäre genau die Sorte Fassade, die das Projekt
 * ausschließt — in einer Zeile fällt das Fehlen jetzt aber auch nicht mehr
 * als Loch auf.
 */
/*
 * Die Stufen als feste Klassen.
 *
 * Tailwind erzeugt nur, was es woertlich im Quelltext findet — ein
 * gerechnetes `md:ps-[${i * 2}%]` entstuende nie. Fuenf Literale sind
 * ausserdem ehrlicher: Die Treppe hat genau fuenf Stufen, und wer eine
 * sechste Ebene ergaenzt, muss hier hinsehen.
 *
 * `ps-` ist logisch (padding-inline-start) — im Arabischen laeuft die Treppe
 * damit von rechts.
 */
const STUFE = [
  "ps-0 md:ps-0",
  "ps-2 md:ps-[2%]",
  "ps-4 md:ps-[4%]",
  "ps-6 md:ps-[6%]",
  "ps-8 md:ps-[8%]",
] as const

export function CapabilityTiles() {
  const { t, locale } = useLocale()
  const copy = t.home.capabilities

  return (
    <section id="leistungen" aria-labelledby="capabilities-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="capabilities-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-3">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
            <Link
              href="/leistungen"
              className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {copy.cta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>

        <ol className="mt-16 flex flex-col">
          {serviceLayers.map((layer, i) => {
            const layerCopy = t.services.layers[layer.key]
            const pages = publishedServicePages.filter((page) => page.layer === layer.key)

            return (
              <Reveal key={layer.key} as="li" delay={0.05 * i} className="group border-line border-t last:border-b">
                <div>
                  <Link
                    href={`/leistungen#ebene-${layer.key}`}
                    className={`hover:bg-surface relative flex flex-col gap-x-8 gap-y-3 py-7 transition-colors duration-[var(--dur-2)] md:flex-row md:items-baseline ${STUFE[i]}`}
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gold absolute top-0 start-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
                    />
                    <span className="eyebrow text-gold-text md:w-12 md:shrink-0">
                      {layer.level}
                    </span>
                    <h3 className="type-h4 md:w-56 md:shrink-0">{layerCopy.name}</h3>
                    {/*
                      Beschreibung und granulare Seiten stehen in EINER
                      Spalte, nicht in zweien.

                      Der erste Versuch gab den Seiten eine eigene schmale
                      Spalte rechts. Bei „Digital" sind es vier — sie
                      stapelten dort untereinander und machten die Zeile
                      doppelt so hoch wie „Identity" mit einer. Gemessen: der
                      Abschnitt wuchs von 880 auf 1.081 Pixel, also genau in
                      die falsche Richtung.

                      Als Zeile unter der Beschreibung kostet dieselbe
                      Information eine Zeile statt vier.
                    */}
                    <span className="flex-1">
                      <span className="type-small text-muted-foreground block max-w-md text-pretty">
                        {layerCopy.what}
                      </span>
                      {pages.length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          {pages.map((page, k) => (
                            <span
                              key={page.slug}
                              className="text-meta text-muted-foreground group-hover:text-gold-text transition-colors duration-[var(--dur-2)]"
                            >
                              {k > 0 && <span aria-hidden="true" className="me-3">·</span>}
                              {page.chip[locale]}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
