"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { opsSteps, processSteps } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * ARCHETYP C auf der Leistungsseite — der Prozess als dunkles Band (VIS-2).
 *
 * /leistungen lief vorher in vier identischen Takten durch: Ebenen, Prozess,
 * Angebot, FAQ — viermal `section-shell`, viermal derselbe Kopf aus
 * Gold-Eyebrow und `type-h2`, viermal ein Hairline-Raster. Vier gleich laute
 * Kapitel hintereinander liest niemand als vier Kapitel; er liest sie als
 * eine lange Flaeche und hoert nach dem zweiten auf.
 *
 * Der Prozess ist die richtige Stelle zum Anhalten: Er ist der einzige Block
 * der Seite, der keine Liste ist, sondern eine Haltung — verstehen, bauen,
 * betreiben. Auf dunklem Grund wird daraus die Zaesur zwischen "was wir
 * koennen" und "was es kostet".
 *
 * `.section-dark` bringt den vollstaendigen dunklen Tokensatz mit (auch im
 * Hellmodus, siehe VIS-1 in globals.css) — es ist keine Farbe im Markup,
 * sondern derselbe benannte Zustand, den Fundament- und Abschlussband
 * benutzen.
 */
export function Process() {
  const { t } = useLocale()

  return (
    <section
      id="prozess"
      aria-labelledby="prozess-title"
      className="section-dark border-line relative overflow-hidden border-b"
    >
      <div className="section-shell-band relative">
        <Reveal>
          <SectionEyebrow label={t.process.eyebrow} />
        </Reveal>

        <Reveal delay={0.05}>
          <h2
            id="prozess-title"
            className="type-h2 mt-7 max-w-3xl text-balance"
          >
            {t.process.title}
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-x-2.5 gap-y-12 md:grid-cols-3">
          {processSteps.map((step, i) => {
            const copy = t.process.steps[step.key]
            return (
              <Reveal
                key={step.key}
                delay={0.08 * i}
                className="group border-line relative border-t pt-8 md:pr-10"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
                />
                <span className="eyebrow text-gold-text">{step.step}</span>
                <h3 className="type-h3 mt-6">{copy.name}</h3>
                <p className="type-body text-muted-foreground mt-5 max-w-sm text-pretty">
                  {copy.what}
                </p>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="type-statement border-line mt-20 max-w-4xl border-t pt-12 text-balance">
            {t.process.bridge}
          </p>
        </Reveal>

        {/*
          Vier operative Schritte (B4).

          Die drei Schritte oben sind Haltung — richtig, aber sie beantworten
          nicht die Frage, die jemand vor dem Absenden tatsaechlich hat:
          „Was passiert, wenn ich jetzt schreibe?" Das steht hier. Bewusst
          dieselbe Hairline-Sprache wie oben, nur vierspaltig und ohne zweite
          Headline: Es ist die Fortsetzung derselben Sektion, kein neuer Block.
        */}
        <Reveal delay={0.24} className="mt-24">
          <SectionEyebrow label={t.process.opsEyebrow} />
        </Reveal>

        {/* Fuenf Schritte seit V2-2 — die Spaltenzahl folgt der Liste, damit
            die letzte Spalte nicht leer bleibt (siehe Produkt-Bausteine). */}
        <div className="mt-10 grid gap-x-2.5 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {opsSteps.map((step, i) => {
            const copy = t.process.opsSteps[step.key]
            return (
              <Reveal
                key={step.key}
                delay={0.06 * i}
                className="group border-line relative border-t pt-7 lg:pr-8"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
                />
                <span className="eyebrow text-gold-text">{step.step}</span>
                <h3 className="type-h4 mt-5">{copy.name}</h3>
                <p className="type-small text-muted-foreground mt-4 max-w-xs text-pretty">
                  {copy.what}
                </p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
