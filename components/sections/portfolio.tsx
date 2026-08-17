"use client"

import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { Reveal } from "@/components/ui/reveal"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/components/locale-provider"
import { clientWorks, furtherProjects, productWorks, type Work } from "@/lib/site-data"
import { cn } from "@/lib/utils"

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

function WorkCard({
  work,
  builtLabel,
  compact = false,
}: {
  work: Work
  builtLabel: string
  compact?: boolean
}) {
  const isLink = Boolean(work.href)
  const Tag = isLink ? "a" : "article"

  return (
    <Tag
      {...(isLink ? { href: work.href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group border-line bg-surface relative flex w-full flex-col overflow-hidden border"
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
            {isLink && (
              <ArrowUpRight className="text-gold mt-1 size-4 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            )}
          </div>
          <p className="type-body text-muted-foreground mt-3 max-w-md text-pretty">
            {work.what}
          </p>
        </div>
        <p className="eyebrow text-muted-foreground/80">
          {work.outcome}
        </p>
      </div>
    </Tag>
  )
}

/** Abschnitts-Überschrift innerhalb der Werkschau. */
function GroupHeading({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <div className="flex items-center gap-4">
        <p className="eyebrow text-foreground">{label}</p>
        <span aria-hidden="true" className="bg-gold h-px w-10" />
      </div>
      <p className="type-small text-muted-foreground">{note}</p>
    </div>
  )
}

export function Portfolio() {
  const { t } = useLocale()

  return (
    <section
      id="arbeiten"
      aria-labelledby="arbeiten-title"
      className="border-line mx-auto max-w-[100rem] border-b px-6 py-24 md:px-10 md:py-32 lg:px-16"
    >
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="bg-gold h-px w-10" aria-hidden="true" />
              <p className="eyebrow text-muted-foreground">{t.portfolio.eyebrow}</p>
            </div>
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
        <p className="text-muted-foreground/80 text-meta mt-6">
          {t.portfolio.mockupNote}
        </p>
      </Reveal>
    </section>
  )
}
