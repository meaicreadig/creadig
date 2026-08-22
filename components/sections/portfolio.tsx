"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { Reveal } from "@/components/ui/reveal"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/components/locale-provider"
import { WorkRegistry } from "@/components/sections/work-registry"
import { clientWorks, furtherProjects, productWorks, workHref, type Work } from "@/lib/site-data"
import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/** Ersatzfläche für Cases ohne Mockup — statt eines leeren oder kaputten <img>. */
function MonogramPanel({ mark }: { mark: string }) {
  return (
    <div className="bg-surface absolute inset-0 flex items-center justify-center">
      <SignatureMotif
        direction="center"
        className="motif-placeholder pointer-events-none absolute inset-0 h-full w-full"
      />
      <span
        aria-hidden="true"
        className="border-gold/40 text-gold text-display flex size-20 items-center justify-center border text-2xl"
      >
        {mark}
      </span>
    </div>
  )
}

/*
 * Seit PHASE A fuehrt jede Karte nach INNEN — eigene Produkte auf ihre Welt
 * unter /produkte, Kundenwerk auf seine Seite unter /arbeiten. Vorher fuehrte
 * sie entweder nach draussen (meai.run) oder nirgendwohin; damit war die
 * Werkschau eine Sackgasse und der externe Link die einzige Tiefe.
 * Der Live-Hinweis bleibt als Marke sichtbar — verschachtelte Links waeren
 * ungueltiges Markup, den Live-Link traegt die Produktseite selbst.
 */
function WorkCard({
  work,
  builtLabel,
  compact = false,
}: {
  work: Work
  builtLabel: string
  compact?: boolean
}) {
  return (
    <Link
      href={workHref(work)}
      className="group border-line bg-surface elevation-1 hover:elevation-2 relative flex w-full flex-col overflow-hidden border transition-shadow duration-500"
    >
      <div className={cn("bg-muted relative overflow-hidden", compact ? "aspect-[16/9]" : "aspect-[16/10]")}>
        {work.image ? (
          <Image
            src={work.image}
            alt={`${work.name} — ${work.what}`}
            fill
            sizes={compact ? "(max-width: 1024px) 100vw, 33vw" : "(max-width: 1024px) 100vw, 50vw"}
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <MonogramPanel mark={work.mark} />
        )}
        <div
          aria-hidden="true"
          className="from-ink/55 via-ink/5 absolute inset-0 bg-gradient-to-t to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-40"
        />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-background/40 bg-background/80 eyebrow rounded-none px-2.5 py-1 backdrop-blur-sm"
          >
            {work.kind}
          </Badge>
          <Badge
            variant="outline"
            className="border-background/40 bg-background/80 text-muted-foreground eyebrow rounded-none px-2.5 py-1 backdrop-blur-sm"
          >
            {work.region}
          </Badge>
        </div>

        {work.live && (
          <Badge
            variant="outline"
            className="border-background/40 bg-background/80 eyebrow absolute top-4 right-4 gap-1.5 rounded-none px-2.5 py-1 backdrop-blur-sm"
          >
            <span className="bg-gold size-1.5 rounded-full" aria-hidden="true" />
            live
          </Badge>
        )}

        {/* Hover-Reveal: was wir gebaut haben */}
        <div className="bg-background/95 absolute inset-x-0 bottom-0 translate-y-full p-5 backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
          <p className="eyebrow text-gold-text">{builtLabel}</p>
          <p className="type-small text-foreground mt-2 text-pretty">
            {work.built}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6 p-6 lg:p-8">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3
              className={cn(
                "text-foreground",
                compact ? "type-h4" : "type-h3",
              )}
            >
              {work.name}
            </h3>
            <ArrowUpRight className="text-gold mt-1 size-4 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
          <p className="type-body text-muted-foreground mt-3 max-w-md text-pretty">
            {work.what}
          </p>
        </div>
        <p className="eyebrow text-muted-foreground/80">
          {work.outcome}
        </p>
      </div>
    </Link>
  )
}

/** Abschnitts-Überschrift innerhalb der Werkschau. */
function GroupHeading({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <SectionEyebrow label={label} />
      <p className="type-small text-muted-foreground">{note}</p>
    </div>
  )
}

export function Portfolio({ heading = true }: { heading?: boolean }) {
  const { t } = useLocale()
  /*
   * Zwei Ansichten auf dieselbe Liste (B2). Karten sind der Default: Sie
   * zeigen, wie etwas aussieht. Das Register zeigt, wie viel es ist — und
   * beantwortet damit die Frage, die das Grid offen laesst.
   */
  const [view, setView] = useState<"cards" | "registry">("cards")

  return (
    <section
      id="arbeiten"
      aria-labelledby="arbeiten-title"
      className="border-line section-shell border-b"
    >
      {heading && (
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionEyebrow label={t.portfolio.eyebrow} />
              <h2
                id="arbeiten-title"
                className="type-h2 text-foreground mt-6 text-balance"
              >
                {t.portfolio.title}
              </h2>
            </div>
            <p className="type-lead text-muted-foreground max-w-md text-pretty lg:col-span-5 lg:pb-4">
              {t.portfolio.lead}
            </p>
          </div>
        </Reveal>
      )}

      {/* Ansichtswechsel — Hairline-Pills in der Sprache des Hauses. */}
      <Reveal
        delay={0.08}
        className={cn(
          "border-line flex flex-wrap items-center gap-4 border-t pt-6",
          heading && "mt-12",
        )}
      >
        <p className="eyebrow text-muted-foreground">{t.portfolio.viewLabel}</p>
        <div role="group" aria-label={t.portfolio.viewLabel} className="flex gap-px">
          {(
            [
              ["cards", t.portfolio.viewCards],
              ["registry", t.portfolio.viewRegistry],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              className={cn(
                "eyebrow border px-4 py-2.5 transition-colors duration-500",
                view === key
                  ? "border-gold bg-gold/10 text-gold-text"
                  : "border-line-strong text-muted-foreground hover:border-gold hover:text-gold-text",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      {view === "registry" ? (
        <div className="mt-14">
          <WorkRegistry />
        </div>
      ) : (
        <>
          {/* Eigene Produkte — die großen Cases */}
          <Reveal className="mt-20">
            <GroupHeading label={t.portfolio.products} note={t.portfolio.productsNote} />
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {productWorks.map((work, index) => (
              <Reveal key={work.slug} delay={(index % 2) * 0.08} className="flex">
                <WorkCard work={work} builtLabel={t.portfolio.built} />
              </Reveal>
            ))}
          </div>

          {/* Kundenwerk — ausdrücklich getrennt, kein eigenes Produkt */}
          <Reveal className="mt-24">
            <GroupHeading label={t.portfolio.clientWork} note={t.portfolio.clientWorkNote} />
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3 lg:gap-8">
            {clientWorks.map((work, index) => (
              <Reveal key={work.slug} delay={index * 0.08} className="flex">
                <WorkCard work={work} builtLabel={t.portfolio.built} compact />
              </Reveal>
            ))}
          </div>
        </>
      )}

      <Reveal className="mt-24">
        <div className="flex items-center gap-4">
          <p className="eyebrow text-foreground">{t.portfolio.more}</p>
          <Separator className="flex-1" />
        </div>
        <ul className="border-line bg-line mt-6 grid gap-px border sm:grid-cols-2">
          {furtherProjects.map((project) => (
            <li
              key={project.name}
              className="group bg-surface hover:bg-surface-raised flex items-baseline justify-between gap-4 px-6 py-7 transition-colors duration-500"
            >
              <span className="text-subhead text-foreground text-xl">{project.name}</span>
              <span className="text-muted-foreground group-hover:text-gold-text text-right text-[0.75rem] transition-colors duration-500">
                {project.what}
              </span>
            </li>
          ))}
        </ul>
        {/* Gilt nur fuer die Karten — das Register zeigt keine Abbildungen. */}
        {view === "cards" && (
          <p className="text-muted-foreground/80 text-meta mt-6">
            {t.portfolio.mockupNote}
          </p>
        )}
      </Reveal>
    </section>
  )
}
