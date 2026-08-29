"use client"

import { ArrowUpRight, Star } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { aggregateRating, approvedReviews } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/** Sterne als Ziffer plus Grafik — die Ziffer trägt, die Grafik illustriert. */
function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true" className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= rating ? "fill-gold text-gold size-3.5" : "text-line-strong size-3.5"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}

/**
 * Echte Bewertungen — oder gar keine Sektion.
 *
 * Kein Karussell mit drei erfundenen Stimmen, wie es der Wettbewerber macht.
 * Solange `reviews` leer ist, existiert dieser Abschnitt auf der Seite nicht.
 *
 * Der Wortlaut steht in seiner Originalsprache, auch in der jeweils anderen
 * Sprachfassung — darum trägt jedes `<blockquote>` sein eigenes `lang`.
 * Übersetzt würde ein Zitat, das niemand so geschrieben hat.
 */
export function Reviews() {
  const { t, locale } = useLocale()

  if (approvedReviews.length === 0) return null

  const dateFormat = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "de-DE", {
    year: "numeric",
    month: "long",
  })

  return (
    <section id="bewertungen" aria-labelledby="bewertungen-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={t.reviews.eyebrow} />
            <h2 id="bewertungen-title" className="type-h2 mt-7 text-balance">
              {t.reviews.title}
            </h2>

            {/* Schnitt nur, wenn es echte Sterne gibt. */}
            {aggregateRating && (
              <div className="mt-8 flex items-baseline gap-4">
                <span className="type-stat">
                  {aggregateRating.value.toLocaleString(locale === "tr" ? "tr-TR" : "de-DE", {
                    minimumFractionDigits: 1,
                  })}
                </span>
                <span className="type-small text-muted-foreground">
                  {t.reviews.ofFive} ·{" "}
                  {`${aggregateRating.count} ${
                    aggregateRating.count === 1 ? t.reviews.countOne : t.reviews.countMany
                  }`}
                </span>
              </div>
            )}
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {t.reviews.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {approvedReviews.map((review, i) => (
            <Reveal
              key={review.id}
              delay={0.06 * i}
              className="group tile hover:bg-foreground/[0.02] relative flex flex-col p-7 transition-colors duration-[var(--dur-2)]"
            >
              <span
                aria-hidden="true"
                className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-[var(--dur-3)] group-hover:w-full"
              />

              {review.rating !== null && (
                <div className="flex items-center gap-3">
                  <Stars rating={review.rating} />
                  <span className="sr-only">
                    {review.rating} {t.reviews.ofFive}
                  </span>
                </div>
              )}

              <blockquote lang={review.lang} className="type-body text-foreground/85 mt-5 text-pretty">
                {review.text}
              </blockquote>

              <div className="border-line mt-auto flex flex-col gap-1 border-t pt-6">
                <p className="text-subhead text-base">{review.name}</p>
                {/*
                  V2-4c — Rolle und Firma, wo sie freigegeben sind.

                  „M. K." unter einem Zitat ist eine Behauptung; „Geschäfts-
                  führer, Firma X" ist eine Angabe, die jemand nachschlagen
                  kann. Beide Felder sind optional: Eine echte Google-
                  Bewertung traegt oft nur einen Namen, und sie deshalb nicht
                  zu zeigen waere die falsche Strenge.
                */}
                {(review.role || review.company) && (
                  <p className="type-small text-muted-foreground">
                    {[review.role?.[locale], review.company].filter(Boolean).join(" · ")}
                  </p>
                )}
                {review.project && (
                  <p className="text-meta text-gold-text">{t.reviews.projectLabel}: {review.project}</p>
                )}
                <p className="text-muted-foreground text-meta">
                  {dateFormat.format(new Date(review.date))} ·{" "}
                  {review.source === "google" ? t.reviews.sourceGoogle : t.reviews.sourceClient}
                </p>
                {review.sourceUrl && (
                  <a
                    href={review.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-gold-text type-small mt-2 inline-flex items-center gap-1.5 transition-colors duration-[var(--dur-2)]"
                  >
                    {t.reviews.verify}
                    <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
