"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/ui/locale-link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { CaseStudyBody } from "@/components/sections/case-study-body";
import type { CaseStudy, Work } from "@/lib/site-data";

/**
 * Eine Kundenwerk-Seite (PHASE A · MP-C.3).
 *
 *  1. Belegtes: Name, Branche, Region, what, built, outcome, Kundenbild.
 *  2. Fallstudie nur bei `approved: true` — Kurzformat Projekt · Kategorie ·
 *     Leistungen, optional acht Tiefkapitel.
 */
export function ArbeitPageBody({
  work,
  study,
}: {
  work: Work;
  /** Freigegebene Fallbeschreibung zu diesem Werk — sonst null. */
  study: CaseStudy | null;
}) {
  const { t, locale } = useLocale();
  const copy = t.arbeitPage;

  return (
    <main>
      <PageHeader
        eyebrow={work.sector[locale]}
        title={work.name}
        lead={work.what[locale]}
        crumbs={[{ label: copy.breadcrumb, href: "/arbeiten" }]}
      >
        <div className="border-line mt-12 grid border-t sm:grid-cols-3">
          <div className="pt-7 sm:pr-8">
            <p className="eyebrow text-gold-text">{copy.kindLabel}</p>
            <p className="type-body text-foreground/85 mt-3">
              {work.kind === "Produkt" ? t.portfolio.kindProduct : t.portfolio.kindClientWork}
            </p>
          </div>
          <div className="border-line pt-7 sm:border-l sm:pl-8">
            <p className="eyebrow text-gold-text">{copy.sectorLabel}</p>
            <p className="type-body text-foreground/85 mt-3">{work.sector[locale]}</p>
          </div>
          {work.region && (
            <div className="border-line pt-7 sm:border-l sm:pl-8">
              <p className="eyebrow text-gold-text">{copy.regionLabel}</p>
              <p className="type-body text-foreground/85 mt-3">{work.region}</p>
            </div>
          )}
        </div>
      </PageHeader>

      {work.image && (
        <section aria-label={work.name} className="section-seam">
          <div className="section-shell">
            <Reveal>
              <div className="border-line bg-muted relative aspect-[16/10] overflow-hidden rounded-lg border">
                <Image
                  src={work.image}
                  alt={`${work.name} — ${work.what[locale]}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 80vw"
                  className="object-cover"
                  priority
                />
              </div>
              {work.imageProof === "customer-photo" && (
                <p className="text-muted-foreground text-meta mt-4 max-w-2xl text-pretty">
                  {t.portfolio.customerPhotoNote}
                </p>
              )}
            </Reveal>
          </div>
        </section>
      )}

      <section
        {...(work.built
          ? { "aria-labelledby": "arbeit-gebaut-title" }
          : { "aria-label": copy.builtLabel })}
        className="section-seam"
      >
        <div className="section-shell">
          <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
            {work.built && (
              <Reveal className="lg:col-span-7">
                <SectionEyebrow label={copy.builtLabel} />
                <h2
                  id="arbeit-gebaut-title"
                  className="type-h3 mt-7 max-w-2xl text-balance"
                >
                  {work.built[locale]}
                </h2>
              </Reveal>
            )}

            <Reveal
              delay={0.08}
              className={work.built ? "lg:col-span-5" : "lg:col-span-8"}
            >
              <div className="border-line border-t pt-7">
                <p className="eyebrow text-gold-text">{copy.whatLabel}</p>
                <p className="type-body text-foreground/85 mt-4 text-pretty">
                  {work.what[locale]}
                </p>
              </div>
              <div className="border-line mt-10 border-t pt-7">
                <p className="eyebrow text-gold-text">{copy.statusLabel}</p>
                <p className="type-body text-foreground/85 mt-4 text-pretty">
                  {work.outcome[locale]}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="arbeit-fall-title"
        className="section-seam"
      >
        <div className={study ? "section-shell" : "section-shell-tight"}>
          {study ? (
            <>
              <Reveal>
                <SectionEyebrow label={t.cases.eyebrow} />
                <h2
                  id="arbeit-fall-title"
                  className="type-h3 mt-7 max-w-2xl text-balance"
                >
                  {t.cases.title}
                </h2>
              </Reveal>

              <Reveal delay={0.08} className="mt-16">
                <CaseStudyBody study={study} />
              </Reveal>
            </>
          ) : (
            <Reveal>
              <h2 id="arbeit-fall-title" className="sr-only">
                {t.cases.eyebrow}
              </h2>
              <p className="type-body text-muted-foreground max-w-2xl text-pretty">
                {copy.caseGatedNote}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      <section
        aria-labelledby="arbeit-cta-title"
        className="section-seam"
      >
        <div className="section-shell-tight">
          <Reveal>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2
                  id="arbeit-cta-title"
                  className="type-h3 max-w-2xl text-balance"
                >
                  {copy.ctaTitle}
                </h2>
                <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
                  {copy.ctaBody}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton href="/termin">
                  {copy.ctaPrimary}
                </MagneticButton>
                <MagneticButton href="/arbeiten" variant="ghost">
                  {copy.ctaSecondary}
                </MagneticButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Link
              href="/arbeiten"
              className="text-muted-foreground hover:text-foreground mt-14 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
              {copy.backLabel}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
