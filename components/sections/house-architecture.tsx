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
    /*
      GATE 04 · WEB-0037 — DIE EINE DUNKLE FLAECHE AUF DIESER SEITE.

      -----------------------------------------------------------------------
      DER BEFUND
      `/unternehmen` lief ueber SIEBEN Creme-Sektionen am Stueck, ehe der
      Abschluss dunkel wurde: C C C C C C C D, zusammen 9.415 Pixel auf dem
      Schreibtisch. Fuenf der acht Sektionen tragen dieselbe Grammatik
      (Eyebrow, H2, Vorspann daneben, Raster darunter). Das ist die
      Gleichfoermigkeit, ueber die der Owner klagt — nicht zu wenig Inhalt,
      sondern zu wenig Unterschied.

      -----------------------------------------------------------------------
      WARUM AUSGERECHNET HIER — UND NUR HIER
      Die Regel fuer dunkle Flaechen lautet: Sie muessen verdient sein, nicht
      im Wechsel verteilt. Ein Zebrastreifen aus Creme und Dunkel ist kein
      Rhythmus, sondern ein Muster.

      Diese Sektion ist die einzige der Seite, die das ganze Haus auf einmal
      zeigt: Dach, fuenf Ebenen, der Betrieb quer darunter, die vier Produkte
      an ihrer Ebene. Sie ist kein Textabschnitt, sie ist eine ZEICHNUNG — und
      eine Zeichnung liest sich auf dunklem Grund als Zeichnung, waehrend sie
      auf Creme wie ein weiterer Textblock mit Linien aussieht.

      Damit wird aus C C C C C C C D die Folge C D C C C C C D: der Wechsel
      faellt an der Stelle, an der die Seite ohnehin ihren Modus wechselt —
      von der Herkunft (der Weg) zur Ordnung (das Haus) und zurueck zu den
      Menschen (ueber uns).

      -----------------------------------------------------------------------
      WAS DAS NICHT IST
      Kein zusaetzlicher Inhalt, kein neues Diagramm, keine zweite dunkle
      Sektion. `section-dark` tauscht nur die Token-Werte des Teilbaums; jede
      Linie, jede Ziffer und jedes Gold darin rechnet sich selbst um. Es ist
      dieselbe Zeichnung auf anderem Grund.
    */
    <section id="haus" aria-labelledby="haus-title" className="section-dark">
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

        {/*
          ---------------------------------------------------------------
          DIE TRAGWERK-ANSICHT — WARUM DIE VORIGE FASSUNG FALSCH ARGUMENTIERT HAT

          Bis hierher war jede Ebene ein abgerundetes Kaestchen, und die
          Kaestchen wurden nach unten hin SCHMALER: 05 ueber die volle
          Breite, 01 am schmalsten, jede Stufe zusaetzlich weiter
          eingerueckt.

          Gemessen an der eigenen Aussage ist das genau verkehrt. Der Text
          derselben Zeile sagt ueber Identity: „das Fundament, auf dem alles
          steht." Das Bild sagt: Identity ist das Kleinste und Letzte. Ein
          Diagramm, das seiner eigenen Bildunterschrift widerspricht,
          erklaert nichts — es macht den Leser unsicher, und zwar an genau
          der Stelle, an der creaDIG seine Kompetenz behauptet.

          Jetzt ein Schichtenmodell, wie es ein Tragwerk zeichnet:

            · alle fuenf Ebenen ueber DIESELBE Breite — keine traegt weniger,
              sie tragen Verschiedenes
            · sie liegen ohne Fuge aufeinander, wie Lagen im Mauerwerk;
              die Fuge ist eine Linie, kein Abstand
            · nach unten nimmt das Gewicht ZU, nicht ab: 01 traegt die
              staerkste Grundlinie
            · die Ziffer ist gross und traegt die Ordnung, nicht ein Rahmen

          Und das Dach ist keine Karte mehr. „creaDIG" stand als
          1310 px breites, fast leeres Rechteck ueber dem Stapel, mit einem
          Haarstrich verbunden — ein sechstes Kaestchen, das so tat, als
          waere es eine sechste Ebene. creaDIG ist aber nicht das oberste
          Element, sondern die Klammer um alle: der Rahmen, der das Tragwerk
          zusammenhaelt. Deshalb steht der Name jetzt AM Rahmen.
        */}
        <figure className="mt-20">
          {/* ---- Der Rahmen: creaDIG haelt das Tragwerk ------------------ */}
          <Reveal>
            <div className="border-gold/50 border border-b-0 px-5 pt-5 pb-0 md:px-7 md:pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-5">
                <p className="eyebrow text-gold-text">{copy.roofLabel}</p>
                <p className="type-small text-muted-foreground">{copy.roofNote}</p>
              </div>
            </div>
          </Reveal>

          {/* ---- Fünf Ebenen, von oben gelesen, 01 zuletzt --------------- */}
          <ul className="border-gold/50 border-x">
            {layersTopDown.map((layer, i) => {
              const layerCopy = t.services.layers[layer.key]
              const fundament = i === layersTopDown.length - 1
              return (
                <Reveal key={layer.key} as="li" delay={0.05 * i} y={12}>
                  <div
                    className={`border-line grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 border-t px-5 py-6 md:grid-cols-12 md:gap-x-8 md:px-7 md:py-7 ${
                      fundament ? "bg-surface" : ""
                    }`}
                  >
                    {/*
                      Die Ziffer traegt die Ordnung. Sie steht in einer eigenen
                      Spalte, damit die drei Textspalten auf allen fuenf Zeilen
                      an derselben Kante beginnen — vorher war die rechte
                      Spalte auf jeder Zeile woanders, weil die Kaestchen
                      verschieden breit waren.
                    */}
                    {/*
                      `text-muted-foreground/50` stand hier und war mit
                      2,03 : 1 gemessen unter den 3 : 1, die grosse Schrift
                      braucht — eine Ziffer, die als Ordnungssystem gedacht
                      war und die man kaum lesen konnte. Volle Tonwertstufe:
                      dieselbe Zurueckhaltung, aber lesbar.

                      Kein `aria-hidden`: Die Liste ist ein <ul>, also traegt
                      NUR diese Ziffer die Ebene. Als <ol> haette sie von 1 bis
                      5 durchgezaehlt, waehrend daneben 05 bis 01 steht — zwei
                      Nummerierungen fuer dieselben fuenf Zeilen.
                    */}
                    <span
                      className={`text-display text-2xl leading-none tabular-nums md:col-span-1 md:text-[2rem] ${
                        fundament ? "text-gold-text" : "text-muted-foreground"
                      }`}
                    >
                      {layer.level}
                    </span>
                    <span className="text-subhead text-lg md:col-span-3 md:text-xl">
                      {layerCopy.name}
                    </span>
                    <span className="type-small text-muted-foreground col-span-2 text-pretty md:col-span-8">
                      {layerCopy.what}
                    </span>
                  </div>
                </Reveal>
              )
            })}
          </ul>

          {/*
            Die Grundlinie. Sie ist die einzige starke Linie im ganzen Bild
            und liegt unter 01 — das ist der Satz „das Fundament, auf dem
            alles steht" als Strich statt als Behauptung.
          */}
          <div aria-hidden="true" className="bg-gold h-[3px] w-full" />

          {/* ---- Quer darunter: der Betrieb ------------------------------ */}
          {/*
            Er steht unter der Grundlinie und ueber die volle Breite: Der
            Betrieb traegt nicht EINE Ebene, er laeuft unter allen fuenfen
            durch. Deshalb hat er auch keine Ziffer — er ist keine sechste
            Stufe (KIZILELMA §10.1).
          */}
          <Reveal delay={0.12}>
            <div className="bg-muted grid gap-x-8 gap-y-2 px-5 py-6 md:grid-cols-12 md:px-7">
              <p className="eyebrow text-gold-text md:col-span-4">
                {copy.operateLabel}
              </p>
              <div className="md:col-span-8">
                <p className="text-subhead text-lg">{t.managed.title}</p>
                <p className="type-small text-muted-foreground mt-2 text-pretty">
                  {copy.operateNote}
                </p>
              </div>
            </div>
          </Reveal>

          {/* ---- Vier eigene Produkte ------------------------------------ */}
          <Reveal delay={0.16}>
            <p className="eyebrow text-muted-foreground mt-16">{copy.productsLabel}</p>
          </Reveal>
          <ul className="border-line mt-5 grid border-t sm:grid-cols-2 lg:grid-cols-4">
            {productWorks.map((product, i) => {
              const world = productWorlds[product.slug]
              const layer = serviceLayers.find((entry) => entry.key === world?.layer)
              const layerCopy = world ? t.services.layers[world.layer] : null
              return (
                <Reveal key={product.slug} as="li" delay={0.05 * i} y={12} className="border-line flex sm:border-s sm:first:border-s-0">
                  {/*
                    Vier Kacheln mit Rahmen waren vier weitere Kaestchen in
                    einem Bild, das schon aus Kaestchen bestand. Jetzt trennen
                    Linien statt Rahmen — dieselbe Information, ein Element
                    weniger.
                  */}
                  <div className="border-line flex w-full flex-col gap-3 border-b py-7 pe-6 sm:ps-6">
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
