"use client";

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
 * Eine Kundenwerk-Seite (PHASE A — Gerüst; das tiefe Case-Format folgt in
 * PHASE D).
 *
 * Zwei Ebenen, klar getrennt:
 *
 *  1. Was belegt ist — Name, Branche, Region, `what`, `built`, `outcome` aus
 *     `site-data`. Das steht immer.
 *  2. Die ausführliche Fallbeschreibung (Ausgangslage → Lösung → Ergebnis).
 *     Sie erscheint NUR, wenn zu diesem Werk eine Case-Study mit
 *     `approved: true` vorliegt. Ohne Freigabe steht dort der Grund, warum
 *     nichts dasteht — nicht „demnächst", sondern die Haltung: Kundentexte
 *     ohne schriftliche Freigabe veröffentlichen wir nicht.
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
        <div className="border-line mt-12 grid gap-px border-t sm:grid-cols-3">
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
          {/* Ohne bestaetigte Region faellt die ganze Zelle weg — kein Label ins Leere. */}
          {work.region && (
            <div className="border-line pt-7 sm:border-l sm:pl-8">
              <p className="eyebrow text-gold-text">{copy.regionLabel}</p>
              <p className="type-body text-foreground/85 mt-3">{work.region}</p>
            </div>
          )}
        </div>
      </PageHeader>

      {/*
        Die Sektion traegt ihren Namen ueber die H2 — faellt die weg (kein
        belegter Umfang), muss der Name direkt an die Sektion, sonst zeigt
        `aria-labelledby` ins Leere.
      */}
      <section
        {...(work.built
          ? { "aria-labelledby": "arbeit-gebaut-title" }
          : { "aria-label": copy.builtLabel })}
        className="border-line border-b"
      >
        <div className="section-shell">
          <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
            {/*
              Der Umfang traegt hier die Ueberschrift. Liegt er nicht vor,
              faellt die Spalte weg und die belegten Angaben ruecken auf die
              volle Breite — statt einer leeren H2 ueber einer halben Seite.
            */}
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

      {/* ------------------------------------------------------------------
          Fallbeschreibung — gated auf die schriftliche Freigabe des Kunden.
          ------------------------------------------------------------------ */}
      <section
        aria-labelledby="arbeit-fall-title"
        className="border-line border-b"
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

              {/*
                Dieselben acht Kapitel wie auf /arbeiten, aus derselben
                Komponente. Zwei Fassungen desselben Falls waeren in vier
                Wochen zwei Faelle (V2-4).
              */}
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
        className="border-line border-b"
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
                <MagneticButton href="/kontakt">
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
              className="text-muted-foreground hover:text-foreground mt-14 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
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
