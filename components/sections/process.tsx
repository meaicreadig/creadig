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
/*
 * MOBILE IST EINE EIGENE KOMPOSITION, KEIN UMBRUCH.
 *
 * Die senkrechten Abstaende hier waren fuer die Rasterfassung bemessen: drei
 * Spalten oben, fuenf unten. Auf dem Schreibtisch liegen die Luecken
 * ZWISCHEN den Spalten und kosten keine Hoehe. Gestapelt werden aus
 * denselben Werten lauter Zeilenabstaende.
 *
 * Gemessen am 09.09.2026 auf 390 Pixeln: 2.631 Pixel Abschnitt fuer 1.190
 * Pixel Text — 55 Prozent Luft. Zum Vergleich die Preis-Sektion derselben
 * Seite: 31 Prozent. Der Ablauf war der einzige Ausreisser.
 *
 * Geaendert sind nur die kleinen Breakpoints. Ab `md` steht jeder Wert
 * unveraendert; kein Wort ist fort, keine Zeile zusammengezogen.
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

        <div className="mt-12 grid gap-x-2.5 gap-y-8 md:mt-20 md:gap-y-12 md:grid-cols-3">
          {processSteps.map((step, i) => {
            const copy = t.process.steps[step.key]
            return (
              <Reveal
                key={step.key}
                delay={0.08 * i}
                className="group border-line relative border-t pt-6 md:pt-8 md:pr-10"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 start-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
                />
                <span className="eyebrow text-gold-text">{step.step}</span>
                <h3 className="type-h3 mt-4 md:mt-6">{copy.name}</h3>
                <p className="type-body text-muted-foreground mt-3 max-w-sm text-pretty md:mt-5">
                  {copy.what}
                </p>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="type-statement border-line mt-12 max-w-4xl border-t pt-8 text-balance md:mt-20 md:pt-12">
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
        <Reveal delay={0.24} className="mt-14 md:mt-24">
          <SectionEyebrow label={t.process.opsEyebrow} />
        </Reveal>

        {/* Fuenf Schritte seit V2-2 — die Spaltenzahl folgt der Liste, damit
            die letzte Spalte nicht leer bleibt (siehe Produkt-Bausteine). */}
        <div className="mt-8 grid gap-x-2.5 gap-y-7 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {opsSteps.map((step, i) => {
            const copy = t.process.opsSteps[step.key]
            return (
              <Reveal
                key={step.key}
                delay={0.06 * i}
                className="group border-line relative border-t pt-5 sm:pt-7 lg:pr-8"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 start-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
                />
                <span className="eyebrow text-gold-text">{step.step}</span>
                <h3 className="type-h4 mt-3 sm:mt-5">{copy.name}</h3>
                <p className="type-small text-muted-foreground mt-2.5 max-w-xs text-pretty sm:mt-4">
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
