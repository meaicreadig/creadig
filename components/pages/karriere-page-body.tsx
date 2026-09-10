"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Betriebsbruecke } from "@/components/karriere/betriebsbruecke"
import { RollenStand } from "@/components/karriere/rollen-stand"
import { ROLLEN } from "@/lib/karriere"
import {
  abschluss,
  arbeitsweise,
  auswahl,
  fragen,
  haltung,
  kopf,
  marken,
  wasWirBauen,
} from "@/lib/karriere-inhalt"
import { serviceLayers } from "@/lib/site-data"

/**
 * /karriere — die Übersicht.
 *
 * ---------------------------------------------------------------------------
 * DIE REIHENFOLGE IST EIN ARGUMENT
 * Wer eine Karriereseite öffnet, hat zwei Fragen: „Was baut ihr?" und „Gibt
 * es hier wirklich etwas für mich?". Die zweite steht deshalb nicht am Ende,
 * sondern direkt unter dem Kopf — als Stand-Zeile, bevor jemand scrollt. Eine
 * Seite, die den Talent Pool erst im achten Abschnitt erwähnt, hat die Zeit
 * ihres Lesers ausgegeben, bevor sie ihm die Wahrheit gesagt hat.
 *
 * Danach erst: die Arbeit, das Betriebsmodell, die zwei Spuren, die Haltung,
 * die Auswahl, die Fragen, der Schritt.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER BEWUSST FEHLT
 * Kein Teamfoto, kein Bürobild, keine Mitarbeiterstimme, keine Zahl über
 * Bewerbungen. Nichts davon existiert — und eine Karriereseite, die mit
 * erfundenen Menschen wirbt, ist genau der Betrieb, den creaDIG bei Kunden
 * auseinandernimmt.
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
          Der Stand steht im Kopf, nicht weiter unten: Er ist die erste
          Information, die jemand braucht, bevor er Zeit investiert.
        */}
        {/*
          Auf dem Raster der Seite und nicht als schmale Spalte am linken
          Rand: Beschriftung links, Satz rechts, beide auf derselben
          Grundlinie wie Titel und Anreißer darüber.
        */}
        <div className="border-gold/45 mt-12 grid gap-x-10 gap-y-4 border-t pt-6 lg:grid-cols-12">
          <p className="eyebrow text-gold-text lg:col-span-3">{kopf.wahrheitLabel[locale]}</p>
          <p className="type-body text-foreground/85 text-pretty lg:col-span-9">
            {kopf.wahrheit[locale]}
          </p>
        </div>
      </PageHeader>

      {/* ---- Was hier gebaut wird ------------------------------------- */}
      <section aria-labelledby="bauen-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={wasWirBauen.eyebrow[locale]} />
              <h2 id="bauen-titel" className="type-h2 mt-7 text-balance">
                {wasWirBauen.titel[locale]}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {wasWirBauen.text[locale]}
              </p>
            </Reveal>
          </div>

          {/*
            Die fünf Ebenen stehen hier als ZEILE, nicht als sechster Aufguss
            des Tragwerks von /unternehmen. Auf einer Karriereseite ist die
            Ebene kein Diagramm, sondern eine Auskunft darüber, woran man
            arbeiten würde — deshalb nur Ziffer und Name.
          */}
          <Reveal delay={0.16}>
            <p className="eyebrow text-muted-foreground border-line mt-16 border-t pt-7">
              {wasWirBauen.ebenenLabel[locale]}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {serviceLayers.map((layer) => (
                <li key={layer.key} className="flex items-baseline gap-2.5">
                  <span className="text-meta text-gold-text">{layer.level}</span>
                  <span className="type-body">{t.services.layers[layer.key].name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---- Osnabrück ↕ Istanbul ------------------------------------- */}
      <Betriebsbruecke />

      {/* ---- Die zwei Spuren ------------------------------------------ */}
      <section id="spuren" aria-labelledby="spuren-titel" className="section-dark">
        <div className="section-shell">
          <Reveal>
            <p className="eyebrow text-gold-text">{marken.spurA[locale]} · {marken.spurB[locale]}</p>
            <h2 id="spuren-titel" className="type-h2 mt-7 max-w-4xl text-balance">
              {t.karriere.spurenTitel}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-px lg:grid-cols-2">
            {ROLLEN.map((rolle, i) => (
              <Reveal key={rolle.id} delay={0.06 * i} y={16}>
                <div className="border-line flex h-full flex-col border p-7 md:p-9">
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

      {/* ---- Wie wir arbeiten ----------------------------------------- */}
      <section aria-labelledby="arbeitsweise-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={arbeitsweise.eyebrow[locale]} />
            <h2 id="arbeitsweise-titel" className="type-h2 mt-7 max-w-4xl text-balance">
              {arbeitsweise.titel[locale]}
            </h2>
          </Reveal>
          {/*
            Sieben Schritte als Linie, nicht als sieben Karten: Es ist ein
            Ablauf, und ein Ablauf hat eine Richtung. Die Ziffern tragen die
            Reihenfolge, die Trennlinien den Takt.
          */}
          <ol className="border-line mt-14 border-t">
            {arbeitsweise.schritte.map((schritt, i) => (
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
        </div>
      </section>

      {/* ---- Haltung --------------------------------------------------- */}
      <section aria-labelledby="haltung-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={haltung.eyebrow[locale]} />
              <h2 id="haltung-titel" className="type-h2 mt-7 text-balance">
                {haltung.titel[locale]}
              </h2>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {haltung.punkte.map((punkt, i) => (
              <Reveal key={punkt.titel.de} delay={0.04 * i} y={12}>
                <div className="border-gold/45 border-s-2 ps-6">
                  <p className="text-subhead text-lg">{punkt.titel[locale]}</p>
                  <p className="type-body text-muted-foreground mt-3 text-pretty">
                    {punkt.text[locale]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Auswahl --------------------------------------------------- */}
      <section id="auswahl" aria-labelledby="auswahl-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={auswahl.eyebrow[locale]} />
            <h2 id="auswahl-titel" className="type-h2 mt-7 max-w-4xl text-balance">
              {auswahl.titel[locale]}
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-px md:grid-cols-5">
            {auswahl.schritte.map((schritt, i) => (
              <Reveal key={schritt.titel.de} as="li" delay={0.04 * i} y={12} className="flex">
                <div className="border-line flex w-full flex-col gap-3 border p-6">
                  <span className="text-meta text-gold-text">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-subhead text-base">{schritt.titel[locale]}</span>
                  <span className="type-small text-muted-foreground text-pretty">
                    {schritt.text[locale]}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.16}>
            <div className="bg-muted mt-10 p-7 md:p-9">
              <p className="eyebrow text-gold-text">{auswahl.aufgabeLabel[locale]}</p>
              <ul className="mt-6 flex flex-col gap-3.5">
                {auswahl.aufgabeRegeln.map((regel) => (
                  <li key={regel.de} className="flex gap-3.5">
                    <span aria-hidden="true" className="bg-gold mt-3 h-px w-5 shrink-0" />
                    <span className="type-body text-foreground/85 text-pretty">{regel[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Stand ----------------------------------------------------- */}
      <section id="stand" aria-labelledby="stand-titel" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={kopf.wahrheitLabel[locale]} />
            <h2 id="stand-titel" className="type-h2 mt-7 max-w-4xl text-balance">
              {t.karriere.standTitel}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px md:grid-cols-2">
            {ROLLEN.map((rolle, i) => (
              <Reveal key={rolle.id} delay={0.06 * i} y={12}>
                <div className="flex h-full flex-col gap-5">
                  <p className="text-subhead text-lg">{rolle.titel[locale]}</p>
                  <RollenStand rolle={rolle} variante="kompakt" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Fragen ---------------------------------------------------- */}
      <section aria-labelledby="fragen-titel" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <SectionEyebrow label={fragen.eyebrow[locale]} />
              <h2 id="fragen-titel" className="type-h2 mt-7 text-balance">
                {fragen.titel[locale]}
              </h2>
            </Reveal>
            <div className="lg:col-span-7">
              <dl className="border-line border-t">
                {/*
                  `Reveal` rendert selbst ein <div> — deshalb traegt es hier
                  die Klassen und enthaelt <dt>/<dd> DIREKT. Mit einem
                  zusaetzlichen <div> darin waeren die beiden Enkel des <dl>,
                  und axe meldete `dlitem` auf jeder Sprache und jedem
                  Fenster. Eine Beschreibungsliste darf verschachteln — aber
                  nur eine Ebene.
                */}
                {fragen.eintraege.map((eintrag, i) => (
                  <Reveal
                    key={eintrag.titel.de}
                    delay={0.03 * i}
                    y={10}
                    className="border-line block border-b py-7"
                  >
                    <dt className="text-subhead text-lg text-pretty">{eintrag.titel[locale]}</dt>
                    <dd className="type-body text-muted-foreground mt-3 text-pretty">
                      {eintrag.text[locale]}
                    </dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Abschluss ------------------------------------------------- */}
      <section className="section-dark">
        <div className="section-shell-tight">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={abschluss.eyebrow[locale]} />
              <h2 className="type-h2 mt-7 text-balance">{abschluss.titel[locale]}</h2>
              <p className="type-body text-muted-foreground mt-6 max-w-xl text-pretty">
                {abschluss.text[locale]}
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-5">
              <Link
                href="/karriere/bewerben"
                className="cta-outline inline-flex items-center gap-2.5 px-7 py-4 text-sm tracking-wide"
              >
                {t.karriere.bewerbenCta}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" strokeWidth={1.5} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
