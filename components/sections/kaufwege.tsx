"use client"

import { ArrowUpRight } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { angeboteZu, angebotText, fitText, kaufwege, kaufwegeText } from "@/lib/kaufwege"
import { formatPrice } from "@/lib/site-data"

/**
 * WIE MAN HIER KAUFT (PHASE 2 · Commercial Completion).
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS EINE TABELLE IST UND KEIN KACHELRASTER
 *
 * Die naheliegende Umsetzung waere gewesen: drei Kaufwege, drei Karten,
 * darunter sechs Angebotskarten. Neun Kacheln fuer eine Auskunft, die aus
 * drei Zeilen besteht.
 *
 * Ein Kaeufer vergleicht hier. Vergleichen heisst: dieselbe Frage an
 * mehreren Stellen nebeneinander lesen — „wann gilt das", „wie entsteht der
 * Preis", „was bekomme ich", „was ist nicht drin". Das ist eine Tabelle,
 * auch wenn sie auf 390 Pixeln zu gestapelten Bloecken zerfaellt. Kacheln
 * haetten dieselben vier Fragen viermal in unterschiedlicher Reihenfolge
 * erzaehlt.
 *
 * ---------------------------------------------------------------------------
 * KEINE ZAHL ENTSTEHT HIER
 *
 * Jeder Betrag kommt aus `lib/kaufwege.ts` und dort aus `packages` bzw.
 * `retainer` in `lib/site-data.ts` (D-18). Diese Datei tippt keine Zahl und
 * rechnet keine aus. `scripts/check-kaufwege.mjs` weist das bei jedem Build
 * nach.
 *
 * ---------------------------------------------------------------------------
 * DIE FIT-FRAGE STEHT VORNE, NICHT HINTEN
 *
 * „Brauchen Sie dafuer ueberhaupt ein eigenes System?" koennte man ans Ende
 * stellen, hoeflich, nachdem alles verkauft ist. Sie steht bewusst als
 * erster Block: Wer zuerst liest, dass eine Standardsoftware die guenstigere
 * Antwort sein kann, liest alles danach anders — und wer sie nicht braucht,
 * hat seine Antwort, bevor er sich durch Preise arbeitet.
 */
export function Kaufwege() {
  const { locale } = useLocale()

  return (
    <section id="kaufwege" aria-labelledby="kaufwege-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={kaufwegeText.eyebrow[locale]} />
            <h2 id="kaufwege-title" className="type-h2 mt-7 text-balance">
              {kaufwegeText.title[locale]}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {kaufwegeText.lead[locale]}
            </p>
          </Reveal>
        </div>

        {/*
          DIE FIT-FRAGE. Vier Saetze, von denen drei vom Systemprojekt
          wegfuehren. Als nummerierte Liste und nicht als Karten: Es ist eine
          Abfolge von Faellen, keine Auswahl von Produkten.
        */}
        <Reveal delay={0.14} className="border-line mt-16 border-t pt-10">
          <h3 className="type-h3 max-w-3xl text-balance">{fitText.title[locale]}</h3>
          <p className="type-body text-muted-foreground mt-4 max-w-2xl text-pretty">
            {fitText.lead[locale]}
          </p>
          <ul className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {fitText.faelle.map((fall, i) => (
              <li key={fall.de} className="border-line flex gap-4 border-t pt-4">
                <span className="text-meta text-gold-text shrink-0 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="type-small text-foreground/85 text-pretty">{fall[locale]}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        {/*
          DIE DREI WEGE. Je Weg: wann er gilt, wie der Preis entsteht, und
          darunter die Angebote, die zu ihm gehoeren.
        */}
        <div className="mt-20 flex flex-col gap-14">
          {kaufwege.map((weg, wi) => {
            const wegText = kaufwegeText.wege[weg]
            const liste = angeboteZu(weg)
            return (
              <Reveal key={weg} delay={0.06 * wi}>
                <div className="border-line border-t pt-8">
                  <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-5">
                      <p className="text-meta text-gold-text font-mono">
                        {String(wi + 1).padStart(2, "0")}
                      </p>
                      <h3 className="type-h3 mt-3 text-balance">{wegText.name[locale]}</h3>
                    </div>
                    <div className="lg:col-span-4">
                      <p className="eyebrow text-muted-foreground">
                        {kaufwegeText.wannLabel[locale]}
                      </p>
                      <p className="type-small text-foreground/85 mt-2.5 text-pretty">
                        {wegText.wann[locale]}
                      </p>
                    </div>
                    <div className="lg:col-span-3">
                      <p className="eyebrow text-muted-foreground">
                        {kaufwegeText.preisLabel[locale]}
                      </p>
                      <p className="type-small text-foreground/85 mt-2.5 text-pretty">
                        {wegText.preis[locale]}
                      </p>
                      {weg === "umfang-zuerst" && (
                        <>
                          <p className="type-small text-muted-foreground mt-3 text-pretty">
                            {kaufwegeText.rechnerHinweis[locale]}
                          </p>
                          <Link
                            href="/aufwandsrechner"
                            className="text-gold-text eyebrow mt-2.5 inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                          >
                            {kaufwegeText.rechnerCta[locale]}
                            <ArrowUpRight className="size-3" strokeWidth={1.5} />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="mt-9 flex flex-col">
                    {liste.map((angebot) => {
                      const text = angebotText[angebot.key]
                      if (!text) return null
                      return (
                        <li
                          key={angebot.key}
                          className="border-line grid gap-5 border-t py-6 lg:grid-cols-12 lg:gap-10"
                        >
                          <div className="lg:col-span-5">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                              <p className="text-foreground text-base font-semibold">
                                {text.name[locale]}
                              </p>
                              {/*
                                Der Betrag steht als Tatsache neben dem Namen,
                                nicht als Auszeichnung darunter. „nach
                                Zuschnitt" ist an dieser Stelle genauso eine
                                Antwort wie eine Zahl — und die haeufigere.
                              */}
                              {angebot.betrag !== null ? (
                                <span className="text-gold-text type-small font-mono">
                                  {formatPrice(angebot.betrag, locale)}
                                  {angebot.betragArt === "monatlich"
                                    ? ` ${kaufwegeText.betragArt.monatlich[locale]}`
                                    : ""}
                                </span>
                              ) : (
                                <span className="text-muted-foreground type-small font-mono">
                                  {kaufwegeText.betragArt["nach-zuschnitt"][locale]}
                                </span>
                              )}
                              {angebot.betragBis !== null && (
                                <span className="text-muted-foreground text-meta font-mono">
                                  {kaufwegeText.regulaerLabel[locale]}{" "}
                                  {formatPrice(angebot.betragBis, locale)}
                                </span>
                              )}
                            </div>
                            <Link
                              href={angebot.href}
                              className="text-gold-text eyebrow mt-3.5 inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                            >
                              {text.cta[locale]}
                              <ArrowUpRight className="size-3" strokeWidth={1.5} />
                            </Link>
                          </div>
                          <div className="lg:col-span-4">
                            <p className="eyebrow text-muted-foreground">
                              {kaufwegeText.ergebnisLabel[locale]}
                            </p>
                            <p className="type-small text-foreground/85 mt-2.5 text-pretty">
                              {text.ergebnis[locale]}
                            </p>
                          </div>
                          {/*
                            Die Grenze steht gleichwertig neben dem Ergebnis
                            und nicht kleiner darunter. Im Streitfall gilt das
                            groessere Versprechen — deshalb muss das kleinere
                            genauso gut lesbar sein.
                          */}
                          <div className="lg:col-span-3">
                            <p className="eyebrow text-muted-foreground">
                              {kaufwegeText.grenzeLabel[locale]}
                            </p>
                            <p className="type-small text-muted-foreground mt-2.5 text-pretty">
                              {text.grenze[locale]}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="text-meta text-muted-foreground border-line mt-12 border-t pt-5">
            {kaufwegeText.nettoHinweis[locale]}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
