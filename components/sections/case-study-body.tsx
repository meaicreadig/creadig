"use client"

import Image from "next/image"

import { useLocale } from "@/components/locale-provider"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { filledChapters, type CaseStudy } from "@/lib/site-data"

/**
 * Ein Fall, ausgeschrieben (V2-4 · KIZILELMA §10.4).
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DIESE KOMPONENTE GIBT
 * Ein Fall erscheint an zwei Orten: gebuendelt auf `/arbeiten` und einzeln
 * auf der Seite des Werks. Beide rendern jetzt dieselben acht Kapitel, und
 * dieselbe Struktur zweimal im Markup zu halten heisst, sie in vier Wochen
 * zweimal unterschiedlich zu haben — genau der Fehler, den `PageHeader` und
 * die `section-*`-Utilities schon einmal geheilt haben.
 *
 * ---------------------------------------------------------------------------
 * LEERE KAPITEL RENDERN NICHT
 * `filledChapters` gibt nur zurueck, was Text traegt, in der festen
 * Leserichtung. Ein Fall, von dem der Owner heute nur die Ausgangslage
 * bestaetigen kann, zeigt die Ausgangslage — und nicht acht
 * Zwischenueberschriften ueber Leerraum. Die Kapitel bekommen ihre Nummer
 * aus der ANZEIGE, nicht aus dem Schema: „01, 02, 03" ueber drei sichtbaren
 * Kapiteln liest sich richtig, „01, 04, 08" liest sich wie ein Fehler.
 *
 * ---------------------------------------------------------------------------
 * DIE KENNZAHLEN TRAGEN IHRE QUELLE
 * Nicht als Fussnote, sondern in derselben Zelle. Eine Kennzahl ohne Quelle
 * ist eine Behauptung mit Ziffern, und Ziffern glaubt man schneller als
 * Saetze — deshalb steht der Beleg daneben und nicht darunter.
 *
 * ---------------------------------------------------------------------------
 * DAS ZITAT WIRD NICHT UEBERSETZT
 * Dieselbe Regel wie bei den Bewertungen: `lang` steht am `<blockquote>`,
 * der Wortlaut bleibt der des Menschen. Uebersetzt wird nur die Funktion
 * darunter — die ist eine Beschreibung, kein Zitat.
 */
export function CaseStudyBody({
  study,
  headingId,
}: {
  study: CaseStudy
  /** Die H2 darüber liegt beim Aufrufer — hier hängen nur die Kapitel dran. */
  headingId?: string
}) {
  const { t, locale } = useLocale()
  const copy = t.cases
  const chapters = filledChapters(study)

  return (
    <div id={headingId}>
      {/* Kunde, Einordnung, Bild bzw. Monogramm. */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h3 className="type-h3">{study.client}</h3>
          <p className="eyebrow text-gold-text mt-4">{study.context[locale]}</p>

          <div className="border-line bg-surface relative mt-8 aspect-[16/10] overflow-hidden rounded-lg border">
            {study.image ? (
              <Image
                src={study.image}
                alt={study.client}
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover"
              />
            ) : (
              <>
                <SignatureMotif role="placeholder" />
                <span
                  aria-hidden="true"
                  className="border-gold-text/55 text-gold-text text-display absolute inset-0 m-auto flex size-20 items-center justify-center border text-2xl"
                >
                  {study.mark}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {chapters.length > 0 && (
            <div className="grid gap-10 sm:grid-cols-2">
              {chapters.map((chapter, i) => (
                <div key={chapter.key} className="border-line border-t pt-6">
                  <div className="flex items-baseline gap-3">
                    <span className="eyebrow text-gold-text">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="eyebrow text-muted-foreground">
                      {copy.chapters[chapter.key]}
                    </p>
                  </div>
                  <p className="type-body text-foreground/85 mt-4 text-pretty">
                    {chapter.body[locale]}
                  </p>
                </div>
              ))}
            </div>
          )}

          {study.metrics.length > 0 && (
            <div className="border-line mt-12 border-t pt-7">
              <p className="eyebrow text-gold-text">{copy.metricsLabel}</p>
              <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {study.metrics.map((metric) => (
                  <div key={metric.value + metric.label.de}>
                    <p className="eyebrow text-muted-foreground">{metric.label[locale]}</p>
                    <p className="type-stat mt-3">{metric.value}</p>
                    <p className="text-meta text-muted-foreground mt-3">
                      {copy.sourceLabel}: {metric.source[locale]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {study.voice && (
            <figure className="border-gold/45 bg-muted mt-12 border-l-2 py-6 pl-6">
              <p className="eyebrow text-gold-text">{copy.voiceLabel}</p>
              <blockquote lang={study.voice.lang} className="type-lead text-foreground/90 mt-5 text-pretty">
                {study.voice.quote}
              </blockquote>
              <figcaption className="type-small text-muted-foreground mt-5">
                {study.voice.name} · {study.voice.role[locale]} · {study.voice.company}
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </div>
  )
}
