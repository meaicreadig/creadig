"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { productWorks, productWorlds, serviceLayers } from "@/lib/site-data"

/**
 * Das Haus in einer Ansicht (V2-4d · KIZILELMA §10.6).
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DIESES BILD BRAUCHT
 * Die Struktur des Hauses steht an vier Orten: fuenf Ebenen auf /leistungen,
 * vier Produkte auf /produkte, der Betrieb als eigene Sektion, das Dach in
 * Saetzen auf /unternehmen. Wer alle vier gelesen hat, versteht es. Wer eine
 * Seite ansieht, nicht — und genau das ist die Luecke, die die Tiefen-Analyse
 * meint, wenn sie „Haus-Architektur als EIN Bild" verlangt.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES KEINE GRAFIKDATEI IST
 * Ein SVG oder PNG waere schneller gebaut und in drei Wochen falsch: Es
 * kennt seine Quelle nicht. Kommt eine Ebene dazu oder wechselt ein Produkt
 * seine Ebene, aendert sich hier gar nichts — die Ansicht liest
 * `serviceLayers`, `productWorks` und `productWorlds` und kann deshalb nicht
 * von den Daten abweichen, aus denen der Rest der Seite gebaut wird.
 *
 * Dazu kommt: Text in einer Grafik ist nicht uebersetzbar, nicht markierbar,
 * nicht durchsuchbar und fuer einen Screenreader nicht vorhanden. Hier ist
 * jede Zeile echter Text in der Sprache der Seite; die „Zeichnung" besteht
 * aus Hairlines und Einrueckung — denselben Mitteln, mit denen die Ebenen-
 * Pyramide auf /leistungen gebaut ist.
 *
 * ---------------------------------------------------------------------------
 * ES BRAUCHT KEIN MATERIAL VOM OWNER
 * Der einzige Beweis-Baustein dieser Stufe, der heute schon vollstaendig
 * sein kann: Er zeigt nur, was ohnehin belegt in den Daten steht. Deshalb
 * steht er hier, waehrend Fotos, Screens und Fallbeschreibungen noch fehlen.
 */
export function HouseArchitecture() {
  const { t, locale } = useLocale()
  const copy = t.architecture

  /* Von oben nach unten gelesen: 05 zuerst, 01 zuletzt — dieselbe Richtung
     wie die Pyramide auf /leistungen, dort nur andersherum gestapelt. */
  const layersTopDown = [...serviceLayers].reverse()

  return (
    <section id="haus" aria-labelledby="haus-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="haus-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        <figure className="mt-20">
          {/* ---- Das Dach ------------------------------------------------ */}
          <Reveal>
            <div className="border-gold/45 bg-surface border px-7 py-8 text-center">
              <p className="eyebrow text-gold-text">{copy.roofLabel}</p>
              <p className="text-display mt-4 text-3xl tracking-tight md:text-4xl">creaDIG</p>
              <p className="type-small text-muted-foreground mt-3">{copy.roofNote}</p>
            </div>
          </Reveal>

          {/* Der Strang, der Dach und Ebenen verbindet. Rein dekorativ — die
              Zugehoerigkeit steht im Text, nicht in der Linie. */}
          <div aria-hidden="true" className="flex justify-center">
            <span className="bg-line-strong h-10 w-px" />
          </div>

          {/* ---- Fünf Ebenen -------------------------------------------- */}
          <Reveal delay={0.06}>
            <p className="eyebrow text-muted-foreground text-center">{copy.layersLabel}</p>
          </Reveal>
          <ul className="mt-5 flex flex-col gap-px">
            {layersTopDown.map((layer, i) => {
              const layerCopy = t.services.layers[layer.key]
              /* Oben breit, unten schmal: 05 traegt die groesste Wirkung,
                 01 die schmalste Basis — dieselbe Verjuengung wie in der
                 Pyramide, nur von oben gelesen. */
              const inset = i * 3
              return (
                <Reveal key={layer.key} as="li" delay={0.05 * i} y={12}>
                  <div
                    style={{ marginLeft: `${inset}%`, marginRight: `${inset}%` }}
                    className="border-line bg-background flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border px-6 py-5"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="eyebrow text-gold-text">{layer.level}</span>
                      <span className="text-subhead text-lg">{layerCopy.name}</span>
                    </span>
                    <span className="type-small text-muted-foreground max-w-md text-pretty">
                      {layerCopy.what}
                    </span>
                  </div>
                </Reveal>
              )
            })}
          </ul>

          {/* ---- Quer darunter: der Betrieb ------------------------------ */}
          <Reveal delay={0.12}>
            <div className="border-gold/45 bg-muted mt-6 border-l-2 px-6 py-5">
              <p className="eyebrow text-gold-text">{copy.operateLabel}</p>
              <p className="text-subhead mt-3 text-lg">{t.managed.title}</p>
              <p className="type-small text-muted-foreground mt-2 text-pretty">
                {copy.operateNote}
              </p>
            </div>
          </Reveal>

          <div aria-hidden="true" className="flex justify-center">
            <span className="bg-line-strong h-10 w-px" />
          </div>

          {/* ---- Vier eigene Produkte ------------------------------------ */}
          <Reveal delay={0.16}>
            <p className="eyebrow text-muted-foreground text-center">{copy.productsLabel}</p>
          </Reveal>
          <ul className="bg-line border-line mt-5 grid gap-px border sm:grid-cols-2 lg:grid-cols-4">
            {productWorks.map((product, i) => {
              const world = productWorlds[product.slug]
              const layer = serviceLayers.find((entry) => entry.key === world?.layer)
              const layerCopy = world ? t.services.layers[world.layer] : null
              return (
                <Reveal key={product.slug} as="li" delay={0.05 * i} y={12} className="flex">
                  <div className="bg-background flex w-full flex-col gap-3 px-6 py-7">
                    <span className="text-subhead text-lg">{product.name}</span>
                    <span className="type-small text-muted-foreground text-pretty">
                      {product.sector[locale]}
                    </span>
                    {/* Die Zuordnung ist keine Deko: Sie ist der Beleg, dass
                        jede Ebene, die wir anbieten, unter dem eigenen Dach
                        schon einmal gebaut wurde. */}
                    {layer && layerCopy && (
                      <span className="text-meta text-gold-text mt-auto">
                        {copy.onLayer} {layer.level} · {layerCopy.name}
                      </span>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </ul>

          <figcaption className="type-small text-muted-foreground border-line mt-12 border-t pt-6 text-pretty">
            {copy.caption}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
