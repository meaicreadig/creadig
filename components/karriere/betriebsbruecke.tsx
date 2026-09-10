"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { bruecke } from "@/lib/karriere-inhalt"

/*
 * ===========================================================================
 * OSNABRÜCK ↕ ISTANBUL
 * ===========================================================================
 *
 * Das einzige neue Strukturbild dieser Runde, und es beantwortet genau eine
 * Frage, die ein Bewerber wirklich hat: Was mache ICH, und was macht die
 * andere Seite?
 *
 * ---------------------------------------------------------------------------
 * WARUM ZWEI SPALTEN UND EIN BAND DAZWISCHEN
 * Zwei Spalten nebeneinander wuerden „hier die einen, dort die anderen“
 * sagen — also genau das Bild, das creaDIG nicht meint. Deshalb liegt
 * zwischen ihnen ein durchgehendes Band mit dem, was beide teilen: dieselbe
 * Methode, dieselben Belege, dieselben Qualitaetsregeln. Die Aufteilung ist
 * eine Arbeitsteilung, keine Rangordnung.
 *
 * Die Reihenfolge ist bewusst NICHT „Deutschland oben, Istanbul unten“: Auf
 * dem Telefon stehen beide Bloecke gleich breit untereinander, und die
 * gemeinsame Mitte bleibt zwischen ihnen. Ein herunterskaliertes
 * Zweispalten-Diagramm haette daraus eine Rangfolge gemacht.
 *
 * Keine Zahlen, keine Pfeile im Kreis, keine Live-Daten. Es gibt nichts zu
 * messen — es gibt etwas zu erklaeren.
 */
export function Betriebsbruecke() {
  const { locale } = useLocale()

  return (
    <section id="bruecke" aria-labelledby="bruecke-titel" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={bruecke.eyebrow[locale]} />
            <h2 id="bruecke-titel" className="type-h2 mt-7 text-balance">
              {bruecke.titel[locale]}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {bruecke.lead[locale]}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px lg:grid-cols-2">
          {bruecke.seiten.map((seite, i) => (
            <Reveal key={seite.ort.de} delay={0.06 * i} y={16}>
              <div className="border-line h-full border p-7 md:p-9">
                <p className="text-display text-2xl md:text-3xl">{seite.ort[locale]}</p>
                <p className="eyebrow text-gold-text mt-3">{seite.rolle[locale]}</p>
                <ul className="mt-8 flex flex-col gap-3.5">
                  {seite.punkte.map((punkt) => (
                    <li key={punkt.de} className="flex gap-3.5">
                      <span aria-hidden="true" className="bg-gold mt-3 h-px w-5 shrink-0" />
                      <span className="type-body text-foreground/85 text-pretty">
                        {punkt[locale]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/*
          Das gemeinsame Band. Es liegt UNTER beiden Spalten und laeuft ueber
          die volle Breite — das ist die Aussage: Was hier steht, gilt an
          beiden Orten gleich, und keiner der beiden erfindet seine eigene
          Version davon.
        */}
        <Reveal delay={0.14}>
          <div className="border-gold/50 bg-muted mt-px flex flex-col gap-6 border-x border-b p-7 md:flex-row md:items-center md:gap-12 md:p-9">
            <p className="eyebrow text-gold-text shrink-0">{bruecke.mitteLabel[locale]}</p>
            <ul className="flex flex-wrap gap-x-10 gap-y-3">
              {bruecke.mitte.map((punkt) => (
                <li key={punkt.de} className="type-body text-foreground/85">
                  {punkt[locale]}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="type-small text-muted-foreground mt-8 max-w-3xl text-pretty">
            {bruecke.fussnote[locale]}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
