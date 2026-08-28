"use client"

import { ArrowUpRight } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ClosingCta } from "@/components/sections/closing-cta"
import {
  connectedSystems,
  operationsPracticeKeys,
  siteProofKeys,
  systemCategoryKeys,
} from "@/lib/systems"

/**
 * MP10-4 — /systeme, „Integration first".
 *
 * ---------------------------------------------------------------------------
 * DIE REIHENFOLGE IST DAS ARGUMENT
 * Die Seite koennte mit „was wir koennen" anfangen. Sie faengt mit „was zu
 * klaeren ist" an, weil das die Frage ist, die der Leser mitbringt: Er hat
 * bereits Systeme, und seine Sorge ist nicht unsere Faehigkeit, sondern der
 * Anschluss an das, was bei ihm laeuft.
 *
 *   1  Womit ein System sprechen muss   — sieben Kategorien, je mit der
 *                                         Frage, die davor beantwortet wird.
 *   2  Angebunden                       — Owner-gegatet, heute leer.
 *   3  Wie wir betreiben                — die technische Seite von /betrieb.
 *   4  An dieser Seite nachpruefbar     — der eigentliche Beleg.
 *
 * Punkt 4 traegt die Seite. Alles davor ist Beschreibung; die sieben Punkte
 * darunter kann jeder pruefen, ohne uns zu fragen — und genau das ist der
 * Unterschied zu einer Wand aus fremden Technologie-Logos, die dieselbe
 * Flaeche haette fuellen koennen.
 */
export function SystemePageBody() {
  const { t, locale } = useLocale()
  const copy = t.systemePage

  return (
    <main>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        crumbLabel={copy.eyebrow}
        lead={copy.lead}
      />

      <section aria-labelledby="systeme-statement" className="section-seam">
        <div className="section-shell-tight">
          <Reveal>
            <h2 id="systeme-statement" className="type-statement max-w-4xl text-balance">
              {copy.statement}
            </h2>
          </Reveal>
        </div>
      </section>

      {/* 1 — die sieben Kategorien, je mit der Frage davor. */}
      <section aria-labelledby="systeme-kategorien" className="bg-surface section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={copy.categoriesEyebrow} />
              <h2 id="systeme-kategorien" className="type-h2 mt-7 max-w-2xl text-balance">
                {copy.categoriesLabel}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-small text-muted-foreground max-w-md text-pretty">
                {copy.categoriesNote}
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {systemCategoryKeys.map((key, i) => {
              const item = copy.categories[key]
              return (
                <Reveal
                  key={key}
                  delay={0.04 * i}
                  y={14}
                  className="group border-line relative flex flex-col border-t pt-6"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <h3 className="text-subhead text-lg">{item.name}</h3>
                  <p className="type-small text-muted-foreground mt-3 flex-1 text-pretty">
                    {item.body}
                  </p>
                  {/*
                    Die Frage steht unter dem Absatz und nicht darin: Sie ist
                    das, was der Leser mitnehmen soll — und das Einzige auf
                    dieser Kachel, das im ersten Gespraech wirklich vorkommt.
                  */}
                  <p className="border-line mt-5 border-t pt-4">
                    <span className="eyebrow text-gold-text block">
                      {copy.categoryQuestionLabel}
                    </span>
                    <span className="type-small text-foreground/85 mt-2 block text-pretty">
                      {item.question}
                    </span>
                  </p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/*
        2 — angebundene Systeme. Owner-gegatet: Die Liste ist die einzige
        Angabe auf dieser Seite, die ein Kunde im Gespraech ueberpruefen kann.
        Solange sie leer ist, rendert der Abschnitt nicht und die Luecke steht
        auf /status.
      */}
      {connectedSystems.length > 0 && (
        <section aria-labelledby="systeme-angebunden" className="section-seam">
          <div className="section-shell">
            <Reveal>
              <SectionEyebrow label={copy.connectedLabel} />
              <h2 id="systeme-angebunden" className="sr-only">
                {copy.connectedLabel}
              </h2>
            </Reveal>
            <ul className="mt-12 flex flex-col">
              {connectedSystems.map((system) => (
                <li
                  key={system.name}
                  className="border-line flex flex-col gap-2 border-t py-6 sm:flex-row sm:items-baseline sm:gap-10"
                >
                  <span className="text-display w-48 shrink-0 text-xl">{system.name}</span>
                  <span className="type-small text-muted-foreground text-pretty">
                    {system.what[locale]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 3 — wie betrieben wird. Die Leistung dazu steht auf /betrieb. */}
      <section aria-labelledby="systeme-betrieb" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={copy.operationsEyebrow} />
            <h2 id="systeme-betrieb" className="type-h2 mt-7 max-w-2xl text-balance">
              {copy.operationsLabel}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {operationsPracticeKeys.map((key, i) => {
              const item = copy.operations[key]
              return (
                <Reveal
                  key={key}
                  delay={0.04 * i}
                  y={14}
                  className="group border-line relative border-t pt-6"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <h3 className="text-subhead text-lg">{item.name}</h3>
                  <p className="type-small text-muted-foreground mt-3 text-pretty">{item.body}</p>
                </Reveal>
              )
            })}
          </div>

          <Reveal delay={0.12}>
            <div className="border-line mt-16 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="type-small text-muted-foreground max-w-2xl text-pretty">
                {copy.operationsNote}
              </p>
              <Link
                href="/betrieb"
                className="group text-gold-text hover:text-foreground inline-flex shrink-0 items-center gap-2 text-sm tracking-wide transition-colors duration-500"
              >
                {t.nav.betrieb}
                <ArrowUpRight
                  className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4 — der Beleg. Der Grund, warum es diese Seite gibt. */}
      <section aria-labelledby="systeme-beleg" className="section-dark relative overflow-hidden">
        <div className="section-shell relative">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={copy.proofEyebrow} />
              <h2 id="systeme-beleg" className="type-h2 mt-7 max-w-2xl text-balance">
                {copy.proofLabel}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-small text-muted-foreground max-w-md text-pretty">
                {copy.proofNote}
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {siteProofKeys.map((key, i) => {
              const item = copy.proofs[key]
              return (
                <Reveal
                  key={key}
                  delay={0.04 * i}
                  y={14}
                  className="group border-line relative border-t pt-6"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  />
                  <h3 className="text-subhead text-lg">{item.name}</h3>
                  <p className="type-small text-muted-foreground mt-3 text-pretty">{item.body}</p>
                </Reveal>
              )
            })}
          </div>

          {/* Der letzte Punkt nennt eine Seite — also fuehrt hier ein Weg hin. */}
          <Reveal delay={0.16}>
            <Link
              href="/barrierefreiheit"
              className="group text-gold-text hover:text-foreground border-line mt-16 inline-flex items-center gap-2 border-t pt-6 text-sm tracking-wide transition-colors duration-500"
            >
              {t.accessibility.eyebrow}
              <ArrowUpRight
                className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </Reveal>
        </div>
      </section>

      <ClosingCta />
    </main>
  )
}
