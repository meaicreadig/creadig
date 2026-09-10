"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { formatPrice, productWorks, serviceLayers } from "@/lib/site-data"
import { publishedServicePages } from "@/lib/service-pages"
import { einstiegFuer } from "@/lib/einstiege"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Disclosure } from "@/components/ui/disclosure"

/**
 * Fünf Ebenen als aufsteigende, bauliche Architektur.
 * Jede Ebene wird breiter und dunkler — Tiefe von unten nach oben.
 *
 * Zwei Einsatzorte, ein Bauteil (PHASE A):
 *   Startseite    — nicht mehr. Dort steht seit dem Umbau die kompakte
 *                   Verteiler-Kachel-Variante (`CapabilityTiles`).
 *   /leistungen   — hier, als Hauptinhalt der Uebersichtsseite. Die H1 traegt
 *                   dann der Seitenkopf, darum laesst `heading={false}` die
 *                   zweite Ueberschrift weg, statt sie zu doppeln.
 *
 * Jede Ebene traegt zusaetzlich einen Anker (`#ebene-<key>`), damit die
 * Kacheln der Startseite nicht nur „irgendwohin nach /leistungen" fuehren,
 * sondern genau auf die Ebene, auf die geklickt wurde.
 */
/*
 * Die Einrueckung je Ebene, von der Spitze (0) zur Basis (4).
 *
 * Tailwind erzeugt nur Literale — ein gerechnetes `mx-[${n}%]` entstuende
 * nie. Fuenf feste Paare sind ausserdem ehrlicher: Das Bauwerk hat genau
 * fuenf Stufen, und wer eine sechste ergaenzt, muss hier hinsehen.
 */
const EINRUECKUNG = [
  "mx-0",
  "mx-1 md:mx-[2%]",
  "mx-2 md:mx-[4%]",
  "mx-3 md:mx-[6%]",
  "mx-4 md:mx-[8%]",
] as const

export function Services({ heading = true }: { heading?: boolean }) {
  const { t, locale } = useLocale()

  /*
   * GATE 01 · WEB-0004 — DER EINSTIEG STEHT AN DER EBENE.
   *
   * Der Befund: „Operations und Intelligence sind Kategorien, kein kaufbarer
   * Einstieg." Gemessen in Gate 00: fuer beide kein Preis, keine
   * Projektgroesse, kein Beispiel.
   *
   * Die Ursache war strukturell. Die Chips ueber der Pyramide zeigen
   * `publishedServicePages` — und die decken `identity`, `digital` und
   * `automation` ab. Fuer die zwei Ebenen ohne Leistungsseite stand unter der
   * Ueberschrift nichts, an dem sich ein Kaeufer festhalten kann; ihre Tiefe
   * lag hinter einer Klappe, und dort standen Kategorie-Saetze.
   *
   * Jetzt traegt jede der fuenf Ebenen eine sichtbare Zeile — nicht in der
   * Klappe, sondern im Kopf: die ART des Einstiegs, der Betrag, wenn es einen
   * bestaetigten gibt, die Route, an der er beginnt, und ein Beleg, wo es
   * einen gibt.
   *
   * Was hier NICHT passiert: Fuer Intelligence wird keine Zahl erfunden.
   * `nach-analyse` ohne Betrag ist der wahre Zustand und wird so gezeigt.
   */
  const belegLabel = (href: string, art: "produkt" | "eigenpruefung" | null) => {
    if (art === "eigenpruefung") return t.services.belegEigenpruefung
    if (art === "produkt") {
      const slug = href.split("/").pop()
      const produkt = productWorks.find((w) => w.slug === slug)
      if (produkt) return produkt.name
    }
    return t.services.belegCta
  }

  return (
    <section id="leistungen" aria-labelledby="leistungen-title" className="section-seam">
      <div className="section-shell">
        {heading && (
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={t.services.eyebrow} />
              <h2
                id="leistungen-title"
                className="type-h2 mt-7 text-balance"
              >
                {t.services.title}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {t.services.lead}
              </p>
            </Reveal>
          </div>
        )}

        {/*
          Einstiegs-Chips (Feinschliff).

          Die Ebenen darunter sind die Hausvokabel („Digital", „Operations").
          Gesucht wird aber nach „Webdesign". Die Chips stehen deshalb VOR der
          Pyramide: Wer mit einem konkreten Wort kommt, findet es sofort und
          landet auf der granularen Leistungsseite. Zugleich sind sie die
          internen Links, die diese Unterseiten ueberhaupt tragen — vorher
          standen sie als lange Meta-Titel ganz unten, wo sie kaum jemand sah.
        */}
        <Reveal delay={0.16}>
          <div
            className={`border-line flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-8 ${
              heading ? "mt-20" : ""
            }`}
          >
            <p className="eyebrow text-gold-text">{t.services.entryLabel}</p>
            <ul className="flex flex-wrap gap-2.5">
              {publishedServicePages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/leistungen/${page.slug}`}
                    className="cta-quiet inline-flex items-center gap-2 px-4 py-2.5 text-sm tracking-wide"
                  >
                    {page.chip[locale]}
                    <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Aufsteigende Ebenen — von 05 oben nach 01 unten gelesen als Bauwerk */}
        <div className="mt-20 flex flex-col-reverse gap-2">
          {serviceLayers.map((layer, i) => {
            const copy = t.services.layers[layer.key]
            /*
             * G-VISUAL — DIE PYRAMIDE STAND AUF DER SPITZE.
             *
             * Hier stand: „Ebene 01 = schmalste Basis, Ebene 05 = breiteste
             * Spitze." Genau so war es auch gebaut — und damit widersprach
             * das Bild dem Text, der in derselben Zeile steht: Identity ist
             * „das Fundament, auf dem alles steht". Gezeichnet war es als das
             * SCHMALSTE Element, ganz unten, am weitesten eingerueckt: ein
             * Bauwerk, das sich nach unten verjuengt und auf seiner Spitze
             * balanciert.
             *
             * Ein Leser muss so ein Bild nicht bewusst analysieren, damit es
             * wirkt — er sieht eine unsichere Konstruktion und liest daneben
             * „Fundament". Jetzt traegt 01 die volle Breite und 05 die
             * schmalste: breite Basis, schmale Spitze. Dieselben fuenf
             * Literale, in der richtigen Richtung gelesen.
             *
             * Die Einrueckung ist ab `md` prozentual — dort kostet sie nichts
             * und traegt das Bauwerk. Auf dem Telefon war sie es, die das
             * Bauwerk kaputtmachte: Gemessen am 09.09.2026 auf 390 Pixeln
             * blieben der untersten Ebene 287 Pixel, 74 Prozent des
             * Bildschirms — 55 Pixel gingen an den Rand, waehrend die Stufe
             * zwischen zwei Ebenen nur 6 Pixel betrug. Der Preis war
             * sichtbar, die Metapher nicht.
             *
             * Feste kleine Werte darunter: 0/4/8/12/16 Pixel je Seite. Der erste
             * Versuch nahm 0/8/16/24/32 — das sind bei 390 Pixeln fast genau
             * dieselben acht Prozent, also gar keine Aenderung. Gemessen
             * statt geschaetzt: 287 → 278 Pixel, es wurde sogar enger.
             */
            /* Betont wird die Basis, nicht die Spitze: 01 traegt die vier
               darueber. Vorher lag der Ton auf 05 — auf dem, was ohne die
               anderen vier gar nicht stehen kann. */
            const istFundament = i === 0

            return (
              <Reveal
                key={layer.key}
                delay={0.06 * i}
                y={16}
                className="group"
                as="div"
              >
                <div
                  id={`ebene-${layer.key}`}
                  /* scroll-mt: die feste Leiste (4,5rem) darf den Anker nicht verdecken. */
                  className={`tile relative scroll-mt-28 transition-colors duration-[var(--dur-2)] ${
                    EINRUECKUNG[i]
                  } ${istFundament ? "bg-foreground/[0.03]" : ""} hover:bg-foreground/[0.04]`}
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 start-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
                  />
                  <div className="grid items-baseline gap-x-8 gap-y-4 px-2 pt-9 pb-7 md:grid-cols-12 md:px-6">
                    <div className="flex items-baseline gap-4 md:col-span-4">
                      <span className="eyebrow text-gold-text">
                        {layer.level}
                      </span>
                      <h3 className="type-h3">{copy.name}</h3>
                    </div>
                    <p className="type-lead text-foreground/85 text-pretty md:col-span-5">
                      {copy.what}
                    </p>
                    <div className="md:col-span-3">
                      <p className="eyebrow text-muted-foreground group-hover:text-gold-text transition-colors duration-[var(--dur-2)]">
                        {t.services.forWhom}
                      </p>
                      <p className="type-small text-muted-foreground mt-2.5 text-pretty">
                        {copy.who}
                      </p>
                    </div>
                  </div>

                  {/*
                    GATE 01 · WEB-0004 — DIE EINSTIEGSZEILE.

                    Sie steht zwischen Kopf und Klappe und ist immer sichtbar.
                    Eine Ebene, deren Einstieg man aufklappen muss, hat keinen.

                    Bewusst EINE Zeile und kein drittes Raster: Der erste
                    Entwurf gab Einstieg, Verweis und Beleg je eine eigene
                    Spalte. Auf 390 Pixeln stapeln drei Spalten, und fuenf
                    gestapelte Bloecke haben die Seite um 997 Pixel wachsen
                    lassen — auf der laengsten Seite der Website (WEB-0013).
                    Als umbrechende Zeile kostet dieselbe Information einen
                    Bruchteil davon.
                  */}
                  {(() => {
                    const einstieg = einstiegFuer(layer.key)
                    if (!einstieg) return null
                    return (
                      <div className="border-line mx-2 border-t py-4 md:mx-6">
                        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                          <span className="eyebrow text-muted-foreground">
                            {t.services.angebotLabel}
                          </span>
                          <span className="type-small text-foreground/85">
                            <span className="text-gold-text">
                              {t.services.angebotArt[einstieg.art]}
                            </span>
                            {einstieg.betrag !== null && (
                              <>
                                {" "}
                                <span className="text-subhead">
                                  {formatPrice(einstieg.betrag, locale)}
                                </span>
                                {einstieg.art === "monatlich" && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    {t.packages.monthly}
                                  </span>
                                )}
                              </>
                            )}
                          </span>
                          <Link
                            href={einstieg.einstiegHref}
                            className="text-gold-text hover:text-foreground inline-flex items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                          >
                            {t.services.angebotCta}
                            <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                          </Link>
                          {/*
                            Der Beleg erscheint nur, wo es einen gibt. Fuer
                            `identity` und `automation` steht hier heute
                            nichts — ein zweiter Link auf dieselbe
                            Leistungsseite waere kein Beleg, sondern eine
                            Wiederholung mit anderer Beschriftung. Die Luecke
                            gehoert zu WEB-0001 und damit zu Gate 02.
                          */}
                          {einstieg.belegHref && (
                            <>
                              <span className="eyebrow text-muted-foreground">
                                {t.services.belegLabel}
                              </span>
                              <Link
                                href={einstieg.belegHref}
                                className="text-gold-text hover:text-foreground inline-flex items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                              >
                                {belegLabel(einstieg.belegHref, einstieg.belegArt)}
                                <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                              </Link>
                            </>
                          )}
                        </div>
                        {/*
                          Die Bedingung steht vor dem Klick und nicht auf der
                          Zielseite: Die laufende Betreuung gibt es nur fuer
                          Systeme, die wir gebaut haben (`retainer.precondition`).
                        */}
                        {einstieg.bedingung && (
                          <p className="text-meta text-muted-foreground mt-2 text-pretty">
                            {t.services.angebotBedingung}
                          </p>
                        )}
                      </div>
                    )
                  })()}
                  {/*
                    V2-2 — die Tiefe unter dem Kopf.

                    Die drei Zeilen darueber sind Kategorie-Sprache: Sie sagen,
                    in welche Schublade etwas gehoert. Was hier steht, sind die
                    zwei Fragen, mit denen jemand ankommt — ist das mein
                    Problem, und was habe ich hinterher. Immer dieselbe
                    Reihenfolge, damit die fuenf Ebenen vergleichbar bleiben.

                    Bewusst keine Ueberschriften, sondern Eyebrows: Der Kopf
                    oben traegt die H3 der Ebene: eine zweite Ueberschriftsebene
                    je Block wuerde die Gliederung der Seite zerlegen, ohne dass
                    ein Screenreader dadurch mehr faende.
                  */}
                  {/*
                    MP-A · Textdichte. Der Kopf oben sagt, WAS die Ebene ist —
                    Name, Satz, fuer wen. Was hier folgt, sagt, was sie im
                    Einzelfall bedeutet. Fuenfmal untereinander aufgeklappt war
                    das eine Seite von elftausend Pixeln, auf der niemand die
                    Ebene findet, die ihn betrifft.

                    Der Text ist NICHT weg: `<details>` haelt ihn im Dokument,
                    Strg+F findet ihn, Suchmaschinen lesen ihn. Er wartet nur,
                    bis jemand ihn will.
                  */}
                  <Disclosure
                    label={t.services.detailLabel}
                    size="sm"
                    className="px-2 md:px-6"
                  >
                  <div className="grid gap-x-8 gap-y-8 md:grid-cols-12">
                    {(
                      [
                        [t.services.problemLabel, copy.problem],
                        [t.services.solutionLabel, copy.solution],
                        [t.services.resultLabel, copy.result],
                      ] as const
                    ).map(([label, body]) => (
                      <div key={label} className="md:col-span-4">
                        <p className="eyebrow text-muted-foreground">{label}</p>
                        <p className="type-small text-foreground/85 mt-3 text-pretty">
                          {body}
                        </p>
                      </div>
                    ))}

                    {/*
                      Capability-Sprache. „Operations" sucht niemand — „CRM"
                      und „Auftragsmanagement" schon. Sie steht UNTER der
                      Markensprache und nicht statt ihr: Ein Haus, das mit
                      einer Vokabelliste aufmacht, ist ein Dienstleister mit
                      Katalog (KIZILELMA §10.3).
                    */}
                    <div className="border-line border-t pt-6 md:col-span-12">
                      <p className="eyebrow text-gold-text">{t.services.projectsLabel}</p>
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        {copy.projects.map((project) => (
                          <li
                            key={project}
                            className="type-small text-muted-foreground flex items-center gap-2.5"
                          >
                            <span aria-hidden="true" className="bg-gold h-px w-3.5 shrink-0" />
                            {project}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  </Disclosure>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
