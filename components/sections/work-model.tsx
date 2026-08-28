"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { address, serviceLayers } from "@/lib/site-data"

/**
 * „So arbeiten wir" (V2-5 · KIZILELMA §10.6).
 *
 * ---------------------------------------------------------------------------
 * DIE GROESSTE LUECKE DER SEITE WAR „WER MACHT DAS?"
 * Ein Satz stand dazu da, mitten in „Ueber uns": „Wir arbeiten mit einem
 * spezialisierten Netzwerk … Das Team waechst." Wahr — und trotzdem keine
 * Antwort. Er sagt, dass es jemanden gibt, aber nicht, wer das Projekt fuehrt
 * und wer daran sitzt. Genau diese Frage stellt sich ein Interessent vor der
 * Beauftragung, und wenn die Seite sie nicht beantwortet, beantwortet er sie
 * selbst — meistens zu unseren Ungunsten.
 *
 * ---------------------------------------------------------------------------
 * KEINE SCHEIN-GROESSE, UND KEIN VERSTECKEN
 * Drei Bloecke: wer fuehrt, wer im Kern sitzt, wer dazukommt. Kein „unser
 * Team" ohne Zahl dahinter, keine Standorte, die es nicht gibt — aber auch
 * keine Entschuldigung. Founder-led ist im Premium ein Vorteil, wenn es als
 * bewusstes Modell dasteht: ein Verantwortlicher vom ersten Gespraech bis
 * zum Anruf um halb sieben.
 *
 * ---------------------------------------------------------------------------
 * DIE VERANTWORTUNGSFELDER KOMMEN AUS `serviceLayers`
 * Nicht aus einer eigenen Liste. Das ist keine Bequemlichkeit: Eine zweite
 * Liste waere eine Behauptung ueber Faehigkeiten („kann KI, kann Design"),
 * die niemand pruefen kann. Die Ebenen sind dagegen die Struktur des Hauses,
 * und in einem founder-led Haus liegen sie bei einer Person. Das ist eine
 * Angabe, keine Selbsteinschaetzung — und sie kann nicht veralten, weil sie
 * dieselbe Quelle liest wie /leistungen.
 */
export function WorkModel() {
  const { t } = useLocale()
  const copy = t.workModel
  const items = ["founder", "core", "network"] as const

  return (
    <section id="arbeitsmodell" aria-labelledby="arbeitsmodell-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="arbeitsmodell-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-px md:grid-cols-3">
          {items.map((key, i) => (
            <Reveal
              key={key}
              delay={0.08 * i}
              className="group border-line relative border-t pt-8 md:pr-10"
            >
              <span
                aria-hidden="true"
                className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
              />
              <span className="eyebrow text-gold-text">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="type-h3 mt-6">{copy.items[key].name}</h3>
              <p className="type-body text-muted-foreground mt-5 max-w-sm text-pretty">
                {copy.items[key].what}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Der Gründer mit Rolle und Verantwortungsfeldern. */}
        <Reveal delay={0.14}>
          <div className="border-gold/45 bg-muted mt-20 grid gap-10 border-l-2 px-7 py-9 md:px-10 md:py-11 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="eyebrow text-gold-text">{t.about.founderLabel}</p>
              <p className="type-statement mt-4">{t.about.founder}</p>
              <p className="type-small text-muted-foreground mt-4">{address.venue}</p>
            </div>
            <div className="lg:col-span-7">
              <p className="eyebrow text-gold-text">{copy.fieldsLabel}</p>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {serviceLayers.map((layer) => (
                  <li key={layer.key} className="flex items-baseline gap-3.5">
                    <span className="eyebrow text-muted-foreground shrink-0">{layer.level}</span>
                    <span className="type-body text-foreground/85">
                      {t.services.layers[layer.key].name}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="type-small text-muted-foreground mt-6 text-pretty">
                {copy.fieldsNote}
              </p>
            </div>
          </div>
        </Reveal>

        {/*
          Was wir nicht sagen, und warum. Der Satz steht am Ende und nicht als
          Fussnote: Er ist die Begruendung fuer alles darueber.
        */}
        <Reveal delay={0.18}>
          <p className="type-small text-muted-foreground border-line mt-16 border-t pt-6 text-pretty">
            {copy.honesty}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
