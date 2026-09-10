"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { system } from "@/lib/karriere-inhalt"
import { serviceLayers } from "@/lib/site-data"

/*
 * ===========================================================================
 * DAS SYSTEM — UND WO EIN MENSCH DARIN STEHT
 * ===========================================================================
 *
 * Es ersetzt die Standort-Bruecke der ersten Fassung.
 *
 * Die alte Grafik beantwortete „wo sitzt wer“. Das war die falsche Frage:
 * Der Owner sucht Menschen, nicht ein Buero, und wo jemand spaeter sitzt,
 * ist eine Folge der Einstellung — nicht ihr Grund.
 *
 * Diese hier beantwortet „wo greife ICH ein“. Sie liest sich von oben nach
 * unten wie ein Weg:
 *
 *   ein Betrieb, in dem etwas haengt
 *        ↓
 *   drei Arten von Beitrag — verstehen, bauen, betreiben
 *        ↓
 *   fuenf Ebenen, auf denen gebaut wird
 *
 * Unter jeder Saeule steht, welcher der beiden Wege dort arbeitet. Damit ist
 * Kapitel 2 beantwortet, bevor es anfaengt — und genau das war der Befund
 * des Owners: „Ich sehe kein System dahinter.“
 *
 * Kein Organigramm, keine Kopfzahl, kein Ort, keine Live-Daten. Es gibt
 * nichts zu messen; es gibt etwas zu erklaeren.
 */
export function SystemBild() {
  const { t, locale } = useLocale()

  return (
    <div className="mt-16">
      {/* ---- Ausgangspunkt ------------------------------------------- */}
      <Reveal>
        <div className="border-line border border-b-0 p-7 md:p-9">
          <p className="eyebrow text-muted-foreground">{system.bild.quelleLabel[locale]}</p>
          <p className="type-lead text-foreground/85 mt-4 max-w-3xl text-pretty">
            {system.bild.quelle[locale]}
          </p>
        </div>
      </Reveal>

      {/* Der Weg nach unten. Ein Strich, kein Pfeil: Automatik gibt es hier
          nicht — dazwischen steht jedes Mal ein Mensch. */}
      <div aria-hidden="true" className="border-line flex justify-center border-x">
        <span className="bg-line-strong h-8 w-px" />
      </div>

      {/* ---- Die drei Arten von Beitrag ------------------------------- */}
      <ul className="border-line grid border-x md:grid-cols-3">
        {system.bild.saeulen.map((saeule, i) => (
          <Reveal key={saeule.titel.de} as="li" delay={0.06 * i} y={14} className="flex">
            <div
              className={`flex w-full flex-col gap-4 p-7 md:p-9 ${
                i > 0 ? "border-line border-t md:border-t-0 md:border-s" : ""
              }`}
            >
              <p className="text-display text-2xl md:text-3xl">{saeule.titel[locale]}</p>
              <p className="type-body text-muted-foreground text-pretty">{saeule.text[locale]}</p>
              {/*
                Die Zuordnung ist der Punkt der ganzen Grafik: Sie sagt dem
                Leser, welcher der beiden Wege an dieser Saeule arbeitet.
              */}
              <p className="border-line mt-auto border-t pt-4">
                <span className="text-meta text-gold-text">{saeule.wer[locale]}</span>
              </p>
            </div>
          </Reveal>
        ))}
      </ul>

      <div aria-hidden="true" className="border-line flex justify-center border-x">
        <span className="bg-line-strong h-8 w-px" />
      </div>

      {/* ---- Die fünf Ebenen als Grundlinie --------------------------- */}
      <Reveal delay={0.16}>
        <div className="border-gold/50 bg-muted border-x border-b p-7 md:p-9">
          <p className="eyebrow text-gold-text">{system.bild.ebenenLabel[locale]}</p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {serviceLayers.map((layer) => (
              <li key={layer.key} className="flex items-baseline gap-2.5">
                <span className="text-meta text-muted-foreground">{layer.level}</span>
                <span className="type-body">{t.services.layers[layer.key].name}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  )
}
