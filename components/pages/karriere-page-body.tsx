"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SystemBild } from "@/components/karriere/system-bild"
import { RollenStand } from "@/components/karriere/rollen-stand"
import { ROLLEN } from "@/lib/karriere"
import { kennenlernen, kopf, marken, platz, stand, system } from "@/lib/karriere-inhalt"

/**
 * /karriere — VIER KAPITEL, NICHT ZEHN ABSCHNITTE.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VORHER STAND — UND WARUM DER OWNER SICH VERLOREN HAT
 *
 * Gemessen bei 1440 px: zehn Abschnitte, achtzehn Eyebrow-Label, neun H2,
 * 1.035 Wörter, 9.340 Pixel. Jeder Abschnitt hatte dieselbe Form — Label,
 * Überschrift, Absatz, Raster — und damit dieselbe Lautstärke. Zehn gleich
 * laute Aussagen ergeben keine Hierarchie, sondern eine Liste; in einer
 * Liste sucht man sich die wichtige Stelle selbst, und genau das hat der
 * Owner getan und dabei aufgegeben.
 *
 * Dazu erzählte die Seite einen Standort statt einer Aufgabe. Wo ein Team
 * entstehen soll, war die Hauptfigur — obwohl gesucht werden MENSCHEN.
 *
 * Jetzt vier Kapitel. Jedes beantwortet eine Frage, jedes trägt eine
 * Kapitelnummer, und keines wiederholt ein anderes:
 *
 *   1 · DAS SYSTEM     Was baut creaDIG — und warum braucht das Menschen?
 *   2 · DEIN PLATZ     Wo könnte ich darin wirken?
 *   3 · KENNENLERNEN   Wie findet creaDIG heraus, ob wir zusammenpassen?
 *   4 · DER STAND      Was kann ich heute tun?
 *
 * Entfallen: die Standort-Brücke, die sieben Arbeitsschritte (in der
 * System-Grafik aufgegangen), die sechs Haltungspunkte (auf drei Regeln
 * verdichtet), die getrennte Auswahl-Sektion (mit dem Kennenlernen
 * zusammengelegt) und der eigene Abschluss-Block (Teil von Kapitel 4).
 */
export function KarrierePageBody() {
  const { t, locale } = useLocale()

  return (
    <main>
      <PageHeader
        eyebrow={kopf.eyebrow[locale]}
        title={kopf.titel[locale]}
        crumbLabel={t.nav.karriere}
        lead={kopf.lead[locale]}
      >
        {/*
          Die Wahrheit steht über der Falz — aber als ruhige Zeile neben dem
          Weg nach vorn, nicht als Absage.

          Die erste Fassung stellte „Keine offene Stelle" als eigenen
          Gold-Block direkt unter die H1. Wahr war das, und trotzdem falsch
          gewichtet: Der Besucher las eine Ablehnung, bevor er verstanden
          hatte, worum es geht. Jetzt eine Zeile, ein Verweis nach Kapitel 4,
          und daneben die Handlung, die tatsächlich möglich ist.
        */}
        <div className="border-line mt-12 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-small text-muted-foreground max-w-xl text-pretty">
            {kopf.standKurz[locale]}
          </p>
          <a
            href="#platz"
            className="text-gold-text hover:text-foreground group inline-flex shrink-0 items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
          >
            {kopf.standCta[locale]}
            <ArrowUpRight
              className="size-4 transition-transform duration-[var(--dur-2)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100"
              strokeWidth={1.5}
            />
          </a>
        </div>
      </PageHeader>

      {/* ═══ KAPITEL 1 · DAS SYSTEM ═══════════════════════════════════ */}
      <section id="system" aria-labelledby="system-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={system.eyebrow[locale]} />
              <h2 id="system-titel" className="type-h2 mt-7 text-balance">
                {system.titel[locale]}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {system.text[locale]}
              </p>
            </Reveal>
          </div>

          <SystemBild />
        </div>
      </section>

      {/* ═══ KAPITEL 2 · DEIN PLATZ ═══════════════════════════════════ */}
      {/*
        Die Entscheidungsfläche der Seite — deshalb dunkel: Sie ist die
        einzige Stelle, an der der Leser etwas wählt, und sie darf sich vom
        Rest abheben.
      */}
      <section id="platz" aria-labelledby="platz-titel" className="section-dark scroll-mt-20">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={platz.eyebrow[locale]} />
              <h2 id="platz-titel" className="type-h2 mt-7 text-balance">
                {platz.titel[locale]}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {platz.lead[locale]}
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-px lg:grid-cols-2">
            {ROLLEN.map((rolle, i) => (
              <Reveal key={rolle.id} delay={0.06 * i} y={16} className="flex">
                <div className="border-line flex w-full flex-col border p-7 md:p-9">
                  <p className="type-h3 text-balance">{rolle.titel[locale]}</p>
                  <p className="type-body text-muted-foreground mt-5 text-pretty">
                    {rolle.unterschied[locale]}
                  </p>

                  <dl className="border-line mt-8 flex flex-col gap-4 border-t pt-6">
                    <div className="flex flex-wrap gap-x-3">
                      <dt className="text-meta text-muted-foreground">{marken.sprachen[locale]}</dt>
                      <dd className="type-small">
                        {rolle.sprachen
                          .filter((s) => s.niveau === "kern")
                          .map((s) => s.sprache[locale])
                          .join(" · ")}
                      </dd>
                    </div>
                    {rolle.disziplinen.length > 0 && (
                      <div className="flex flex-wrap gap-x-3">
                        <dt className="text-meta text-muted-foreground">
                          {marken.disziplinen[locale]}
                        </dt>
                        <dd className="type-small">
                          {rolle.disziplinen.map((d) => d[locale]).join(" · ")}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-auto pt-8">
                    <Link
                      href={rolle.pfad}
                      className="text-subhead hover:text-gold-text group inline-flex items-baseline gap-3 text-lg transition-colors duration-[var(--dur-2)]"
                    >
                      {marken.mehr[locale]}
                      <ArrowUpRight
                        className="size-4 shrink-0 transition-transform duration-[var(--dur-2)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ KAPITEL 3 · KENNENLERNEN ═════════════════════════════════ */}
      <section id="kennenlernen" aria-labelledby="kennenlernen-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={kennenlernen.eyebrow[locale]} />
              <h2 id="kennenlernen-titel" className="type-h2 mt-7 text-balance">
                {kennenlernen.titel[locale]}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {kennenlernen.lead[locale]}
              </p>
            </Reveal>
          </div>

          {/* Vier Schritte als Linie — ein Ablauf hat eine Richtung. */}
          <ol className="border-line mt-14 border-t">
            {kennenlernen.schritte.map((schritt, i) => (
              <Reveal key={schritt.titel.de} as="li" delay={0.04 * i} y={12}>
                <div className="border-line grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 border-b py-7 md:grid-cols-12 md:gap-x-8">
                  <span className="text-display text-muted-foreground text-xl leading-none tabular-nums md:col-span-1 md:text-2xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-subhead text-lg md:col-span-3">
                    {schritt.titel[locale]}
                  </span>
                  <span className="type-body text-muted-foreground col-span-2 text-pretty md:col-span-8">
                    {schritt.text[locale]}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>

          {/* Drei Regeln — vorher sechs Haltungspunkte und eine eigene
              Aufgaben-Sektion. Dieselbe Aussage, ein Drittel der Fläche. */}
          <Reveal delay={0.16}>
            <p className="eyebrow text-gold-text mt-16">{kennenlernen.regelnLabel[locale]}</p>
          </Reveal>
          <div className="mt-8 grid gap-x-16 gap-y-10 md:grid-cols-3">
            {kennenlernen.regeln.map((regel, i) => (
              <Reveal key={regel.titel.de} delay={0.04 * i} y={12}>
                <div className="border-gold/45 border-s-2 ps-6">
                  <p className="text-subhead text-lg">{regel.titel[locale]}</p>
                  <p className="type-body text-muted-foreground mt-3 text-pretty">
                    {regel.text[locale]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <p className="type-small text-muted-foreground border-line mt-12 max-w-3xl border-t pt-6 text-pretty">
              {kennenlernen.nichtBewertet[locale]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ KAPITEL 4 · DER STAND ════════════════════════════════════ */}
      <section id="stand" aria-labelledby="stand-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={stand.eyebrow[locale]} />
              <h2 id="stand-titel" className="type-h2 mt-7 text-balance">
                {stand.titel[locale]}
              </h2>
              <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">
                {stand.text[locale]}
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-5">
              {/* Der Stand steht EINMAL, als Baustein — nicht als wiederholte
                  Warnung über die ganze Seite verteilt. */}
              <RollenStand rolle={ROLLEN[0]} variante="kompakt" neutral />
            </Reveal>
          </div>

          <div className="border-line mt-16 grid gap-x-16 border-t pt-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-muted-foreground">{t.faq.eyebrow}</p>
            </Reveal>
            <div className="lg:col-span-8">
              <dl>
                {stand.fragen.map((frage, i) => (
                  <Reveal
                    key={frage.titel.de}
                    delay={0.03 * i}
                    y={10}
                    className="border-line block border-b py-7 first:pt-0"
                  >
                    <dt className="text-subhead text-lg text-pretty">{frage.titel[locale]}</dt>
                    <dd className="type-body text-muted-foreground mt-3 text-pretty">
                      {frage.text[locale]}
                    </dd>
                  </Reveal>
                ))}
              </dl>

              <Reveal delay={0.16}>
                <Link
                  href="/karriere/bewerben"
                  className="cta-outline mt-10 inline-flex items-center gap-2.5 px-7 py-4 text-sm tracking-wide"
                >
                  {t.karriere.bewerbenCta}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" strokeWidth={1.5} />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
