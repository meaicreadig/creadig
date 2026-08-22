"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { StatusDot } from "@/components/ui/status-dot"
import { MeaiSpotlight } from "@/components/sections/meai-spotlight"
import { publishedServicePages } from "@/lib/service-pages"
import {
  furtherProjects,
  productNeighbours,
  productWorlds,
  serviceLayers,
  type Work,
} from "@/lib/site-data"

/**
 * Eine Produkt-Welt (PHASE B).
 *
 * ---------------------------------------------------------------------------
 * DIE REIHENFOLGE IST DAS ARGUMENT
 * Was ist das? (Name, Sektor, Einzeiler, Status) → Zeig es mir (Interface) →
 * Was habt ihr daran gebaut? (Bausteine) → Warum? (Story, gated) → Wo steht
 * es im Haus? (Ebene + passende Leistungen) → Weiter (nächstes Produkt).
 *
 * Das Interface steht bewusst GANZ OBEN, direkt unter dem Kopf. Es ist der
 * Beweis, und ein Beweis, den man erst nach drei Absätzen sieht, hat schon
 * verloren. Wo es keinen gibt, steht an derselben Stelle der Satz, der sagt
 * warum — nicht weiter unten versteckt.
 *
 * ---------------------------------------------------------------------------
 * DIE GATED-STELLEN
 * Zwei Sektionen hängen an Material, das der Owner liefert:
 *
 *   Interface  `screens` kommt aus dem Dateisystem (lib/product-media.ts).
 *              Nicht das Markup entscheidet, ob hier ein Interface erscheint,
 *              sondern ob eine echte Aufnahme im Repo liegt. Es gibt keinen
 *              dritten Zustand: kein Deko-Laptop, keine Mockup-Attrappe, kein
 *              Fenster-Rahmen um Text, der so tut, als sei er ein Screenshot.
 *   Story      `productWorlds[slug].story` ist überall `null` und rendert
 *              deshalb nicht. Warum ein Produkt gebaut wurde, weiß nur der
 *              Owner — und geraten wird es nicht.
 *
 * Alles andere auf dieser Seite stammt aus `site-data` und ist belegt.
 */
export function ProduktPageBody({
  product,
  screens,
}: {
  product: Work
  /** Echte Aufnahmen aus `public/works/products/<slug>/` — leer = keine da. */
  screens: string[]
}) {
  const { t, locale } = useLocale()
  const copy = t.produktPage
  const world = productWorlds[product.slug]
  const neighbours = productNeighbours(product.slug)

  const layer = serviceLayers.find((entry) => entry.key === world?.layer)
  const layerCopy = world ? t.services.layers[world.layer] : null
  // Leistungsseiten, die dieses Produkt ausdrücklich als Arbeit führen.
  const relatedServices = publishedServicePages.filter((page) =>
    page.workSlugs.includes(product.slug),
  )
  /*
   * Was im selben Feld unter demselben Dach läuft. Der Name wird gegen
   * `furtherProjects` aufgelöst statt hier wiederholt: Ein Tippfehler oder
   * eine Umbenennung lässt den Block still verschwinden, statt eine Angabe
   * anzuzeigen, die es nicht mehr gibt.
   */
  const houseContext = world?.houseContext
    ? (furtherProjects.find((entry) => entry.name === world.houseContext) ?? null)
    : null

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
            {/* Gefuellt = laeuft, offen = im Aufbau. Der Unterschied ist die
                ehrlichste Angabe auf der Seite und darf nicht im Fliesstext
                verschwinden. */}
            <p className="type-body text-foreground/85 mt-3 flex items-baseline gap-2.5 text-pretty">
              <StatusDot live={product.live} className="translate-y-[-0.15em]" />
              {product.outcome}
            </p>
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

        {/*
          Hier stand bis zur Sichtpruefung zusaetzlich das Produktlogo. Die
          echten Logos (fibero, CASSAMEA) SIND Wortmarken — unter einer H1,
          die denselben Namen traegt, stand der Schriftzug damit zweimal auf
          demselben Bildschirm. Auf der Uebersicht traegt das Logo den Namen,
          hier traegt ihn die H1; beides zugleich ist eine Dublette.
        */}
        {product.href && (
          <div className="mt-10">
            <a
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2.5 border px-7 py-3.5 text-sm tracking-wide transition-colors duration-500"
            >
              {copy.liveLabel}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </a>
          </div>
        )}
      </PageHeader>

      {/* ------------------------------------------------------------------
          1 — Das Interface. Der Beweis steht oben, nicht unten.
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

            {/* Volle Breite, ein Bild pro Zeile: Ein Interface, das man
                zusammenkneifen muss, beweist nichts. */}
            <div className="mt-14 flex flex-col gap-10">
              {screens.map((src, i) => (
                <Reveal key={src} delay={0.06 * i}>
                  <figure>
                    <div className="border-line bg-surface elevation-1 relative aspect-[16/10] w-full overflow-hidden border">
                      <Image
                        src={src}
                        alt={`${product.name} — Oberfläche aus dem laufenden System`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 92vw"
                        className="object-cover object-top"
                        priority={i === 0}
                      />
                    </div>
                    <figcaption className="text-meta text-muted-foreground mt-4">
                      {product.name} · {String(i + 1).padStart(2, "0")}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section aria-label={copy.screensLabel} className="border-line border-b">
          <div className="section-shell-tight">
            <Reveal>
              <p className="type-statement text-foreground/85 max-w-3xl text-balance">
                {copy.screensPending}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------
          2 — Was gebaut ist, in Bausteinen statt als Komma-Kette.
          ------------------------------------------------------------------ */}
      {world && (
        <section aria-labelledby="gebaut-title" className="border-line border-b">
          <div className="section-shell">
            {/*
              Hier stand bis zur Sichtpruefung `product.built` als H2 — also
              exakt die Komma-Kette, die zwei Zeilen darunter als Bausteine
              aufgeloest wird. Derselbe Inhalt zweimal, einmal gross und
              einmal klein, ist keine Hierarchie; es sieht nur nach mehr aus.
              Die Ueberschrift traegt jetzt die Aussage, die Bausteine tragen
              den Inhalt. Die volle `built`-Zeile steht weiterhin auf der
              Produkt-Uebersicht.
            */}
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <Reveal className="lg:col-span-7">
                <SectionEyebrow label={copy.builtLabel} />
                <h2 id="gebaut-title" className="type-h2 mt-7 max-w-2xl text-balance">
                  {copy.blocksTitle}
                </h2>
              </Reveal>
              <Reveal delay={0.1} className="lg:col-span-5 lg:pb-3">
                <p className="eyebrow text-muted-foreground">{copy.blocksLabel}</p>
              </Reveal>
            </div>

            {/*
              Spaltenzahl folgt der Anzahl der Bausteine. Fest auf vier
              gestellt blieb bei drei Bausteinen (fibero, CASSAMEA, meahv)
              eine Spalte leer — und weil jeder Baustein seine eigene
              Oberkante traegt, brach die Trennlinie sichtbar vor dem rechten
              Rand ab. Das sah nach fehlendem Inhalt aus, nicht nach drei.
            */}
            <div
              className={`mt-16 grid gap-px sm:grid-cols-2 ${
                world.blocks.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
              }`}
            >
              {world.blocks.map((blockCopy, i) => (
                <Reveal
                  key={blockCopy.de}
                  delay={0.06 * i}
                  className="group border-line relative border-t pt-8 lg:pr-8"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <span className="eyebrow text-gold-text">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="type-h4 mt-5 text-pretty">{blockCopy[locale]}</h3>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------
          3 — Flaggschiff-Band: heute nur meAI, und nur mit belegten Texten.
          ------------------------------------------------------------------ */}
      {world?.flagship && <MeaiSpotlight />}

      {/* ------------------------------------------------------------------
          4 — Warum. Gated: `story` ist überall null, die Sektion rendert nicht.
          ------------------------------------------------------------------ */}
      {world?.story && (
        <section aria-labelledby="story-title" className="border-line border-b">
          <div className="section-shell">
            <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <SectionEyebrow label={copy.storyLabel} />
              </Reveal>
              <Reveal delay={0.08} className="lg:col-span-8">
                <h2 id="story-title" className="sr-only">
                  {copy.storyLabel}
                </h2>
                <p className="type-lead text-foreground/85 max-w-2xl text-pretty">
                  {world.story[locale]}
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------
          5 — Einordnung: Die Brücke vom eigenen Produkt zur Leistung.
          ------------------------------------------------------------------ */}
      {layer && layerCopy && (
        <section aria-labelledby="einordnung-title" className="border-line border-b">
          <div className="section-shell">
            <div className="grid gap-x-14 gap-y-12 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <SectionEyebrow label={copy.systemLabel} />
                <h2 id="einordnung-title" className="type-h3 mt-7 max-w-md text-balance">
                  {layerCopy.name}
                </h2>
                <p className="type-body text-muted-foreground mt-6 max-w-md text-pretty">
                  {copy.systemBody}
                </p>
                <Link
                  href={`/leistungen#ebene-${world.layer}`}
                  className="text-gold-text hover:text-foreground mt-8 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
                >
                  {copy.layerCta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Reveal>

              <div className="lg:col-span-7">
                <Reveal className="border-line border-t pt-7">
                  <p className="eyebrow text-gold-text">
                    {copy.layerLabel} {layer.level}
                  </p>
                  <p className="type-body text-foreground/85 mt-4 max-w-xl text-pretty">
                    {layerCopy.what}
                  </p>
                </Reveal>

                {/* Nur Leistungsseiten, die dieses Produkt wirklich als Arbeit
                    führen — keine erfundene Verwandtschaft. */}
                {relatedServices.length > 0 && (
                  <Reveal delay={0.08} className="border-line mt-10 border-t pt-7">
                    <p className="eyebrow text-gold-text">{copy.servicesLabel}</p>
                    <ul className="mt-5 flex flex-wrap gap-2.5">
                      {relatedServices.map((page) => (
                        <li key={page.slug}>
                          <Link
                            href={`/leistungen/${page.slug}`}
                            className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2 border px-4 py-2.5 text-sm tracking-wide transition-colors duration-500"
                          >
                            {page.chip[locale]}
                            <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}

                {/*
                  Nur wo etwas im selben Feld läuft — heute allein bei fibero.
                  Bei einem Operations-Produkt ist das die relevanteste Angabe
                  überhaupt: Wir kennen die Seite, für die wir bauen, aus dem
                  eigenen Tagesgeschäft.
                */}
                {houseContext && (
                  <Reveal delay={0.12} className="border-gold/45 bg-muted mt-10 border-l-2 py-6 pl-6">
                    <p className="eyebrow text-gold-text">{copy.houseContextLabel}</p>
                    <p className="text-subhead mt-4 text-xl">{houseContext.name}</p>
                    <p className="type-small text-muted-foreground mt-2">
                      {houseContext.what} · {houseContext.kind}
                    </p>
                    <p className="type-body text-foreground/85 mt-5 max-w-lg text-pretty">
                      {copy.houseContextNote}
                    </p>
                  </Reveal>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------
          6 — Weiter. Ein Ring, keine Sackgasse.
          ------------------------------------------------------------------ */}
      {neighbours && (
        <section aria-label={copy.nextLabel} className="border-line border-b">
          <div className="section-gutter grid gap-px sm:grid-cols-2">
            {(
              [
                [copy.prevLabel, neighbours.prev, "prev"],
                [copy.nextLabel, neighbours.next, "next"],
              ] as const
            ).map(([label, neighbour, direction]) => (
              <Link
                key={direction}
                href={`/produkte/${neighbour.slug}`}
                className={`group hover:bg-surface relative flex flex-col gap-3 py-10 transition-colors duration-500 ${
                  direction === "next" ? "sm:items-end sm:text-right" : ""
                }`}
              >
                <span className="eyebrow text-muted-foreground flex items-center gap-2">
                  {direction === "prev" && (
                    <ArrowLeft
                      className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1"
                      strokeWidth={1.5}
                    />
                  )}
                  {label}
                  {direction === "next" && (
                    <ArrowRight
                      className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  )}
                </span>
                <span className="type-h3 group-hover:text-gold-text transition-colors duration-500">
                  {neighbour.name}
                </span>
                <span className="type-small text-muted-foreground max-w-sm text-pretty">
                  {neighbour.what}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------
          7 — Abschluss.
          ------------------------------------------------------------------ */}
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
