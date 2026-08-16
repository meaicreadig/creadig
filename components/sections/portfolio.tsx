"use client"

import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/components/locale-provider"
import { furtherProjects, works, type Work } from "@/lib/site-data"
import { cn } from "@/lib/utils"

function WorkCard({ work, wide, builtLabel }: { work: Work; wide: boolean; builtLabel: string }) {
  const isLink = Boolean(work.href)
  const Tag = isLink ? "a" : "article"

  return (
    <Tag
      {...(isLink ? { href: work.href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group relative flex flex-col overflow-hidden border border-line bg-surface",
        wide && "lg:col-span-7",
        !wide && "lg:col-span-5",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={work.image || "/placeholder.svg"}
          alt={`${work.name} — ${work.what}`}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-40"
        />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-none border-background/40 bg-background/80 px-2.5 py-1 text-[0.5625rem] tracking-[0.16em] uppercase backdrop-blur-sm"
          >
            {work.kind}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-none border-background/40 bg-background/80 px-2.5 py-1 text-[0.5625rem] tracking-[0.16em] text-muted-foreground uppercase backdrop-blur-sm"
          >
            {work.region}
          </Badge>
        </div>

        {work.live && (
          <Badge
            variant="outline"
            className="absolute top-4 right-4 gap-1.5 rounded-none border-background/40 bg-background/80 px-2.5 py-1 text-[0.5625rem] tracking-[0.16em] uppercase backdrop-blur-sm"
          >
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            live
          </Badge>
        )}

        {/* Hover-Reveal: was wir gebaut haben */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-background/95 p-5 backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
          <p className="eyebrow text-gold">{builtLabel}</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-foreground text-pretty">
            {work.built}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6 p-6 lg:p-8">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-display text-[clamp(1.5rem,2.4vw,2.25rem)] text-foreground">
              {work.name}
            </h3>
            {isLink && (
              <ArrowUpRight className="mt-1 size-4 shrink-0 text-gold transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            )}
          </div>
          <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground text-pretty">
            {work.what}
          </p>
        </div>
        <p className="text-[0.6875rem] tracking-[0.16em] text-muted-foreground/80 uppercase">
          {work.outcome}
        </p>
      </div>
    </Tag>
  )
}

export function Portfolio() {
  const { t } = useLocale()
  const featured = works.filter((w) => w.featured)

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
              <span className="h-px w-10 bg-gold" aria-hidden="true" />
              <p className="eyebrow text-muted-foreground">{t.portfolio.eyebrow}</p>
            </div>
            <h2
              id="arbeiten-title"
              className="text-display mt-6 text-[clamp(2.5rem,7vw,5.5rem)] text-foreground"
            >
              {t.portfolio.title}
            </h2>
          </div>
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-4 text-pretty">
            {t.portfolio.lead}
          </p>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-12 lg:gap-8">
        {featured.map((work, index) => (
          <Reveal
            key={work.slug}
            delay={(index % 2) * 0.1}
            className={cn("flex", index % 3 === 0 ? "lg:col-span-7" : "lg:col-span-5")}
          >
            <WorkCard work={work} wide={index % 3 === 0} builtLabel={t.portfolio.built} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-20">
        <div className="flex items-center gap-4">
          <p className="eyebrow text-foreground">{t.portfolio.more}</p>
          <Separator className="flex-1" />
        </div>
        <ul className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-3">
          {furtherProjects.map((project) => (
            <li
              key={project.name}
              className="group flex items-baseline justify-between gap-4 bg-surface px-6 py-7 transition-colors duration-500 hover:bg-surface-raised"
            >
              <span className="text-display text-xl text-foreground">{project.name}</span>
              <span className="text-[0.75rem] text-muted-foreground transition-colors duration-500 group-hover:text-gold">
                {project.what}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
