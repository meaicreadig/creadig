"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { spurA } from "@/lib/karriere-inhalt"

/*
 * ===========================================================================
 * VOM SIGNAL ZUM VORGANG
 * ===========================================================================
 *
 * Dieses Bild erklaert die Rolle besser als jede Anforderungsliste: Es zeigt
 * fuenf Stufen und macht sichtbar, an welcher davon die meisten abkuerzen —
 * naemlich von der Beobachtung direkt zum Bedarf.
 *
 * Deshalb sind die Stufen NICHT gleich gezeichnet. Was belegt ist, steht auf
 * der gehobenen Flaeche (`surface-raised` — im Haus die Flaeche fuer alles,
 * was gemessen wurde). Die Vermutung steht auf Papier und traegt eine
 * gestrichelte Kante: Sie sieht anders aus, weil sie etwas anderes IST. Die
 * Frage traegt Gold, weil sie die Arbeit ist. Und der bestaetigte Bedarf ist
 * gedaempft, solange niemand mit dem Betrieb gesprochen hat.
 *
 * Ein gleichmaessiger Fuenf-Schritt-Pfeil haette genau die Aussage zerstoert,
 * um die es geht: Die Stufen sind nicht gleichwertig.
 */

const STIL: Record<string, { rahmen: string; ziffer: string; fuellung: string }> = {
  beleg: {
    rahmen: "border-line",
    ziffer: "text-foreground",
    fuellung: "surface-raised",
  },
  vermutung: {
    rahmen: "border-line-strong border-dashed",
    ziffer: "text-muted-foreground",
    fuellung: "",
  },
  frage: {
    rahmen: "border-gold/60",
    ziffer: "text-gold-text",
    fuellung: "",
  },
  "erst-danach": {
    rahmen: "border-line",
    ziffer: "text-muted-foreground",
    fuellung: "bg-muted",
  },
}

export function BelegKette() {
  const { locale } = useLocale()

  return (
    <section aria-labelledby="kette-titel" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={spurA.kette.eyebrow[locale]} />
            <h2 id="kette-titel" className="type-h2 mt-7 text-balance">
              {spurA.kette.titel[locale]}
            </h2>
          </Reveal>
        </div>

        <ol className="mt-14 flex flex-col">
          {spurA.kette.stufen.map((stufe, i) => {
            const stil = STIL[stufe.art] ?? STIL.beleg
            const letzte = i === spurA.kette.stufen.length - 1
            return (
              <Reveal key={stufe.stufe.de} as="li" delay={0.05 * i} y={12}>
                <div
                  className={`grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 border p-6 md:grid-cols-12 md:gap-x-8 md:p-7 ${stil.rahmen} ${stil.fuellung}`}
                >
                  <span
                    className={`text-display text-xl leading-none tabular-nums md:col-span-1 md:text-2xl ${stil.ziffer}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-subhead text-lg md:col-span-3">{stufe.stufe[locale]}</span>
                  <span className="type-body text-foreground/85 col-span-2 text-pretty md:col-span-8">
                    {stufe.text[locale]}
                  </span>
                </div>
                {/*
                  Die Verbindung zwischen zwei Stufen. Sie ist ein Strich und
                  kein Pfeil: Ein Pfeil behauptet Automatik, und genau die gibt
                  es hier nicht — zwischen Vermutung und Bedarf steht ein
                  Mensch, der fragt.
                */}
                {!letzte && (
                  <div aria-hidden="true" className="flex justify-center">
                    <span className="bg-line-strong h-6 w-px" />
                  </div>
                )}
              </Reveal>
            )
          })}
        </ol>

        <Reveal delay={0.2}>
          <p className="type-small text-muted-foreground border-line mt-12 max-w-3xl border-t pt-6 text-pretty">
            {spurA.kette.fussnote[locale]}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
