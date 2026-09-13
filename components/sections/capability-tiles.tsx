"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SystemRail } from "@/components/creative/system"
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
 * HIER STANDEN FUENF STUFEN-KLASSEN, UND SIE SIND GEGANGEN.
 *
 * Die Treppe (`ps-0`, `ps-[2%]`, `ps-[4%]` …) war die richtige Antwort auf
 * ein echtes Problem: Fuenf gleich breite Karten nebeneinander sagten „fuenf
 * Dienstleistungen", waehrend der Satz daneben sagt „jede Ebene traegt die
 * naechste". Der Einzug hat das repariert.
 *
 * Er war aber eine ZWEITE Bildsprache. Die Seite hat inzwischen eine erste:
 * Linie, Knoten, Luecke (`components/creative/system.tsx`). Zwei Metaphern
 * fuer dieselbe Aussage sind eine zu viel — ein Creative-System entsteht aus
 * Wiederkehr, nicht aus Vielfalt.
 *
 * Die Schiene sagt dasselbe wie die Treppe und sagt es im Vokabular des
 * Hauses: eine durchgehende Linie, fuenf Knoten. Die Ebenen gehoeren
 * zusammen, und jeder Knoten ist ein Einstieg.
 */

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
              <Reveal key={layer.key} as="li" delay={0.05 * i}>
                <Link
                  href={`/leistungen#ebene-${layer.key}`}
                  className="group hover:bg-surface flex items-stretch gap-5 transition-colors duration-[var(--dur-2)] md:gap-7"
                >
                  {/*
                    Die Schiene laeuft DURCH alle fuenf Zeilen — deshalb hat
                    die Zeile keinen eigenen Rahmen und keinen Innenabstand
                    oben: Eine Trennlinie zwischen den Ebenen wuerde genau die
                    Verbindung zerschneiden, die das Bild behauptet.
                  */}
                  <SystemRail
                    ton="verbunden"
                    achse="stapel"
                    erste={i === 0}
                    letzte={i === serviceLayers.length - 1}
                    aktivierbar
                    ausrichtung="kopf"
                  />

                  <span className="flex flex-1 flex-col gap-x-8 gap-y-2 py-6 md:flex-row md:items-baseline">
                    <span className="eyebrow text-gold-text md:w-12 md:shrink-0">{layer.level}</span>
                    <h3 className="type-h4 md:w-56 md:shrink-0">{layerCopy.name}</h3>
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
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
