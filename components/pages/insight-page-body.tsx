"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { ClosingCta } from "@/components/sections/closing-cta"
import {
  ArticleEnding,
  ArticleEvidence,
  ArticleMetrics,
  ArticleNav,
  ArticleNavMobile,
  type Abschnitt,
} from "@/components/insight/article-parts"
import type { Insight } from "@/lib/insights"

/**
 * Der Körper einer System-Note.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VORHER STAND — UND WARUM DER OWNER ES ZURÜCKGEWIESEN HAT
 *
 * Ein `max-w-2xl`-Strang am linken Rand einer 1440-px-Seite: Überschrift,
 * Absatz, Überschrift, Absatz, bis zum Ende. Rechts daneben 55 Prozent
 * nichts. Der Text war gut, die Seite gab ihm nichts.
 *
 * Vier Bausteine kann der Typ `InsightBlock` — Überschrift, Absatz, Liste,
 * abgesetzter Satz —, und dabei bleibt es. Was sich ändert, ist alles
 * DRUMHERUM, und zwar ausschließlich aus Feldern, die es schon gab:
 *
 *   · `kennzahlen`  Der Befund in Zahlen, oben statt im dritten Absatz.
 *   · `body`        Die Überschriften tragen jetzt Anker und ergeben das
 *                   Inhaltsverzeichnis — links fest stehend, auf dem Telefon
 *                   zusammengeklappt.
 *   · `belege`      Drei Belege mit Art und Fundstelle, statt einer von Hand
 *                   gepflegten Linkliste.
 *   · `nachfrage`   Die Frage, die der Leser danach hat — als Schluss.
 *
 * Der Fließtext bleibt schmal (`max-w-[68ch]`). Die Seite wird breiter, die
 * ZEILE nicht: Eine Zeile über die halbe Bildschirmbreite ist nicht
 * großzügig, sondern unlesbar — das Auge verliert beim Rücksprung die Spur.
 */

/** Aus einem Überschriftentext eine Sprungmarke machen. */
function anker(text: string, i: number) {
  const roh = text
    .toLowerCase()
    .replace(/[·„""'']/g, "")
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c)
    /* Alles, was kein Buchstabe und keine Ziffer ist, wird zum Bindestrich —
       das deckt auch arabische und türkische Schrift ab, weil `\p{L}` nach
       Unicode fragt und nicht nach dem lateinischen Alphabet. */
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
  return roh ? `abschnitt-${roh.slice(0, 40)}` : `abschnitt-${i}`
}

export function InsightPageBody({ entry }: { entry: Insight }) {
  const { t, locale } = useLocale()
  const copy = t.insightsPage

  /* Das Inhaltsverzeichnis entsteht aus dem Text, nicht neben ihm. */
  const abschnitte: Abschnitt[] = entry.body
    .map((block, i) => ({ block, i }))
    .filter(({ block }) => block.kind === "heading")
    .map(({ block, i }) => {
      const text = block.kind === "heading" ? block.text[locale] : ""
      return { id: anker(text, i), text }
    })

  let ueberschrift = -1

  return (
    <main className="relative">
      <article className="pb-24 md:pb-32">
        {/* ---- Kopf: über die volle Breite, wie jede andere Unterseite --- */}
        <header className="border-line section-gutter border-b pt-32 pb-14 md:pt-40 md:pb-16">
          <nav aria-label="Brotkrumen">
            <ol className="text-muted-foreground text-meta flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors duration-[var(--dur-1)]">
                  {t.servicePage.breadcrumbHome}
                </Link>
              </li>
              <ChevronRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" strokeWidth={1.5} />
              <li>
                <Link
                  href="/insights"
                  className="hover:text-foreground transition-colors duration-[var(--dur-1)]"
                >
                  {t.nav.insights}
                </Link>
              </li>
              <ChevronRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" strokeWidth={1.5} />
              <li aria-current="page" className="text-foreground">
                {entry.topic[locale]}
              </li>
            </ol>
          </nav>

          {/*
            Titel links, Anreißer rechts — dieselbe zweispaltige Anlage wie
            `PageHeader` seit ec332ae. Vorher stand beides untereinander am
            linken Rand, und der Kopf war so breit wie ein Absatz.
          */}
          <div className="mt-12 grid gap-x-10 gap-y-8 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="eyebrow text-gold-text">{entry.topic[locale]}</span>
                <span aria-hidden="true" className="bg-line-strong h-3 w-px" />
                <span className="text-meta text-muted-foreground">{copy.categories[entry.category]}</span>
                <span aria-hidden="true" className="bg-line-strong h-3 w-px" />
                <time dateTime={entry.date} className="text-meta text-muted-foreground">
                  {entry.date}
                </time>
              </div>
              <h1 className="type-h1 mt-6 text-balance">{entry.title[locale]}</h1>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-2xl text-pretty">
                {entry.teaser[locale]}
              </p>
            </Reveal>
          </div>
        </header>

        <div className="section-gutter">
          {/* ---- Der Befund in Zahlen ---------------------------------- */}
          {entry.kennzahlen && entry.kennzahlen.length > 0 && (
            <Reveal>
              <ArticleMetrics kennzahlen={entry.kennzahlen} />
            </Reveal>
          )}

          <div className="mt-12 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,68ch)_1fr]">
            {/* ---- Inhaltsverzeichnis ---------------------------------- */}
            <div className="lg:order-2">
              <div className="hidden lg:block">
                <ArticleNav abschnitte={abschnitte} />
              </div>
              <div className="lg:hidden">
                <ArticleNavMobile abschnitte={abschnitte} />
              </div>
            </div>

            {/* ---- Der Text -------------------------------------------- */}
            <div className="lg:order-1">
              <div>
                {entry.body.map((block, i) => {
                  if (block.kind === "heading") {
                    ueberschrift += 1
                    const id = abschnitte[ueberschrift]?.id
                    return (
                      <Reveal key={i} delay={0.02}>
                        <h2
                          id={id}
                          /* scroll-mt: die feste Leiste darf den Anker nicht verdecken. */
                          className="type-h3 mt-16 scroll-mt-28 text-balance first:mt-0"
                        >
                          {block.text[locale]}
                        </h2>
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
                    /*
                      Der abgesetzte Satz ist der einzige Ort im Beitrag, an
                      dem eine Grenze gezogen wird („heisst nicht barrierefrei").
                      Er war ein grauer Kasten wie jeder andere; jetzt traegt er
                      das Gewicht, das der Satz hat — groesser gesetzt, mit der
                      Goldkante als einzigem Schmuck.
                    */
                    return (
                      <Reveal key={i} delay={0.02}>
                        <blockquote className="border-gold my-12 border-s-2 ps-7">
                          {/*
                            `type-h4` war zu laut: Der Satz ist sieben Zeilen
                            lang, und sieben Zeilen Ueberschrift sind keine
                            Betonung mehr, sondern ein zweiter Fliesstext in
                            fett. `type-lead` traegt ihn — die Goldkante macht
                            die Absetzung, nicht der Grad.
                          */}
                          <p className="type-lead text-foreground/90 text-pretty">
                            {block.text[locale]}
                          </p>
                        </blockquote>
                      </Reveal>
                    )
                  }
                  return (
                    <Reveal key={i} delay={0.02}>
                      <p className="type-body text-foreground/80 mt-7 text-pretty">
                        {block.text[locale]}
                      </p>
                    </Reveal>
                  )
                })}
              </div>

              {/* ---- Belege ------------------------------------------- */}
              <Reveal className="mt-20">
                <ArticleEvidence belege={entry.belege} />
              </Reveal>

              {/* ---- Die Frage danach --------------------------------- */}
              {entry.nachfrage && (
                <Reveal>
                  <ArticleEnding nachfrage={entry.nachfrage} />
                </Reveal>
              )}

              <Reveal className="mt-14">
                <Link
                  href="/insights"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                >
                  {copy.backCta}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" strokeWidth={1.5} />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </article>

      <ClosingCta />
    </main>
  )
}
