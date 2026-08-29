"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ClosingCta } from "@/components/sections/closing-cta"
import type { Insight } from "@/lib/insights"

/**
 * BF-A9 — der Körper einer System-Note.
 *
 * Vier Bausteine, mehr kann der Typ nicht: Überschrift, Absatz, Liste und der
 * abgesetzte Satz, der eine Grenze zieht. Kein Markdown, keine eingebetteten
 * Bilder, keine Teilen-Knöpfe. Was hier fehlt, ist der Grund, warum der Text
 * in beiden Sprachen gleich aussieht.
 *
 * Die Belege am Ende sind keine Werbung: Wer über einen Befund liest, will
 * ihn nachschlagen können — die eigene Erklärung und die Leistungsseite sind
 * genau das, was er als Nächstes sucht.
 */
export function InsightPageBody({ entry }: { entry: Insight }) {
  const { t, locale } = useLocale()
  const copy = t.insightsPage

  return (
    <main className="relative">
      <SignatureMotif
        direction="down"
        className="motif-band pointer-events-none absolute inset-x-0 top-0 h-[34rem] w-full"
      />

      <article className="section-gutter relative pt-32 pb-24 md:pt-40 md:pb-32">
        <nav aria-label="Brotkrumen">
          <ol className="text-muted-foreground text-meta flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors duration-[var(--dur-1)]">
                {t.servicePage.breadcrumbHome}
              </Link>
            </li>
            <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            <li>
              <Link
                href="/insights"
                className="hover:text-foreground transition-colors duration-[var(--dur-1)]"
              >
                {t.nav.insights}
              </Link>
            </li>
            <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            <li aria-current="page" className="text-foreground">
              {entry.topic[locale]}
            </li>
          </ol>
        </nav>

        <Reveal className="mt-12">
          <SectionEyebrow label={entry.topic[locale]} />
          <h1 className="type-h1 mt-7 max-w-4xl text-balance">{entry.title[locale]}</h1>
          <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">
            {entry.teaser[locale]}
          </p>
          <p className="text-meta text-muted-foreground border-line mt-8 border-t pt-5">
            {copy.publishedLabel}: <time dateTime={entry.date}>{entry.date}</time>
          </p>
        </Reveal>

        {/* Der Text. Schmal gesetzt — Fliesstext liest sich nicht ueber die
            volle Breite eines Bildschirms. */}
        <div className="mt-16 max-w-2xl">
          {entry.body.map((block, i) => {
            if (block.kind === "heading") {
              return (
                <Reveal key={i} delay={0.02}>
                  <h2 className="type-h3 mt-14 first:mt-0 text-balance">{block.text[locale]}</h2>
                </Reveal>
              )
            }
            if (block.kind === "list") {
              return (
                <Reveal key={i} delay={0.02}>
                  <ul className="mt-7 flex flex-col gap-4">
                    {block.items[locale].map((item) => (
                      <li key={item} className="flex gap-3.5">
                        <span aria-hidden="true" className="bg-gold mt-3 h-px w-5 shrink-0" />
                        <span className="type-body text-foreground/85 text-pretty">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )
            }
            if (block.kind === "note") {
              return (
                <Reveal key={i} delay={0.02}>
                  <p className="border-gold/45 bg-muted type-body text-foreground/85 mt-10 border-l-2 py-5 pl-6 text-pretty">
                    {block.text[locale]}
                  </p>
                </Reveal>
              )
            }
            return (
              <Reveal key={i} delay={0.02}>
                <p className="type-body text-muted-foreground mt-7 text-pretty">
                  {block.text[locale]}
                </p>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="border-line mt-20 max-w-2xl border-t pt-8">
          <p className="eyebrow text-gold-text">{copy.sourcesLabel}</p>
          <div className="mt-6 flex flex-col gap-4">
            <Link
              href="/barrierefreiheit"
              className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {copy.sourceStatement}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/leistungen/barrierefreiheit-website"
              className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {copy.sourceService}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/insights"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {copy.backCta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </article>

      <ClosingCta />
    </main>
  )
}
