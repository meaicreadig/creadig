"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SystemRail } from "@/components/creative/system"

/**
 * DIE BELEGLAGE — die Rangfolge des Beweises, mit der leeren Stufe oben.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DAS PROBLEM
 *
 * `/arbeiten` war eine ehrliche Sackgasse: 82 Woerter, ein Verweis, sonst
 * nichts. Gemessen ist das die duennste Seite des Hauses — und ausgerechnet
 * die, die ein Kaeufer ab etwa zehntausend Euro als Erstes oeffnet.
 *
 * Ehrlich war richtig. Sackgasse nicht. Denn Beleg GIBT es; er steht nur
 * nicht auf der obersten Stufe.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE LEERE STUFE OBEN STEHT UND NICHT VERSCHWIEGEN WIRD
 *
 * Die Rangfolge ist nicht erfunden, sie ist die Ordnung, nach der ein
 * Dritter Belege gewichtet:
 *
 *     freigegebene Kundenarbeit  >  eigenes Produkt im Betrieb
 *                                >  Pruefung am eigenen Haus
 *                                >  Werkzeug zum Selbstbedienen
 *
 * Die wertvollste Stufe ist die, die fehlt. Sie nach unten zu schieben oder
 * wegzulassen waere genau die Umkehrung, die die Beleg-Ordnung verbietet:
 * Was weniger traegt, darf nicht so aussehen, als truege es mehr.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE LINIE HIER RICHTIG IST
 *
 * Die Stufen stehen aufeinander wie die fuenf Ebenen: Was darunter liegt,
 * traegt. Die oberste ist noch nicht angeschlossen — deshalb hat sie den
 * Ton `offen`, und die Linie hoert vor ihr auf. Das ist dieselbe Luecke wie
 * im Systembild und bedeutet dasselbe: Hier ist etwas noch nicht verbunden.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DIESE SEKTION NICHT TUT
 *
 * Sie behauptet nicht, es gebe viele Faelle, die man nur nicht zeigen duerfe.
 * Ueber die Freigabe spricht bereits der Seitenkopf; hier wuerde derselbe
 * Satz ein zweites Mal stehen. Und sie ersetzt den fehlenden Kundenbeleg
 * nicht — sie sagt ausdruecklich, dass keine der drei belegten Stufen ihn
 * ersetzen kann.
 */
export function Beleglage() {
  const { t } = useLocale()
  const copy = t.beleglage

  return (
    <section id="beleglage" aria-labelledby="beleglage-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="beleglage-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        <ol className="mt-14 flex flex-col">
          {copy.stufen.map((stufe, i) => {
            const offen = stufe.href === ""
            const letzte = i === copy.stufen.length - 1

            const inhalt = (
              <>
                <SystemRail
                  ton={offen ? "offen" : "verbunden"}
                  achse="stapel"
                  erste={i === 0}
                  letzte={letzte}
                  ausrichtung="kopf"
                  aktivierbar={!offen}
                />

                <span className="flex flex-1 flex-col gap-x-8 gap-y-2 py-6 md:flex-row md:items-baseline">
                  <span
                    className={`eyebrow md:w-12 md:shrink-0 ${offen ? "text-muted-foreground" : "text-gold-text"}`}
                  >
                    {stufe.rang}
                  </span>

                  <span className="md:w-64 md:shrink-0">
                    <span className="type-h4 block">{stufe.name}</span>
                    {/*
                      Die Kennzeichnung steht AM Rang, nicht in einer Fussnote.
                      Wer die Liste ueberfliegt, muss sehen, welche Stufe traegt
                      und welche aussteht — ohne einen zweiten Satz zu lesen.
                    */}
                    <span
                      className={`text-meta mt-2 inline-block ${
                        offen ? "text-muted-foreground" : "text-gold-text"
                      }`}
                    >
                      {offen ? copy.offenLabel : copy.belegtLabel}
                    </span>
                  </span>

                  <span className="flex-1">
                    <span className="type-small text-muted-foreground block max-w-lg text-pretty">
                      {stufe.was}
                    </span>
                  </span>
                </span>
              </>
            )

            return (
              <Reveal key={stufe.key} as="li" delay={0.05 * i}>
                {offen ? (
                  /* Kein Verweis: Es gibt nichts, worauf er zeigen koennte. */
                  <div className="flex items-stretch gap-5 md:gap-7">{inhalt}</div>
                ) : (
                  <Link
                    href={stufe.href}
                    className="group hover:bg-surface flex items-stretch gap-5 transition-colors duration-[var(--dur-2)] md:gap-7"
                  >
                    {inhalt}
                    <span className="text-gold-text group-hover:text-foreground flex items-center pe-2 transition-colors duration-[var(--dur-2)]">
                      <ArrowUpRight className="size-4" strokeWidth={1.5} />
                    </span>
                  </Link>
                )}
              </Reveal>
            )
          })}
        </ol>

        <Reveal delay={0.2}>
          <p className="text-meta text-muted-foreground border-line mt-10 max-w-xl border-t pt-4">
            {copy.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
