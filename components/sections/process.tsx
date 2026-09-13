"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SystemRail } from "@/components/creative/system"
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

        {/*
          EIN ABLAUF IST EINE STRECKE — HIER WAR ER EIN RASTER.

          Verstehen, Bauen, Betreiben standen als drei Spalten nebeneinander,
          jede mit einem eigenen `border-t` darueber. Drei Striche
          nebeneinander sagen „drei Dinge". Der Text sagt aber etwas anderes:
          eines FUEHRT ZUM naechsten, und das dritte hoert nicht auf.

          Das ist genau die Aussage, fuer die es das Vokabular gibt. Deshalb
          ist dies die einzige Stelle auf `/leistungen`, an der die Schiene
          zwingend richtig ist: Ein Prozess IST ein Fluss.

          Die Zierlinie beim Ueberfahren faellt damit weg — nicht, weil sie
          haesslich waere, sondern weil hier jetzt eine Schiene liegt und der
          Knoten die Aktivierung traegt (siehe Praezisierung in der Creative
          Direction). Zwei Anzeigen fuer dieselbe Sache waeren eine zu viel.

          Die Strecke laeuft hinter dem letzten Knoten WEITER: „Betreiben"
          ist kein Ende, sondern der Zustand danach — derselbe Satz, den der
          Betriebs-Abschnitt darueber schon macht.
        */}
        <ol className="mt-12 flex flex-col md:mt-20 md:flex-row md:items-stretch">
          {processSteps.map((step, i) => {
            const copy = t.process.steps[step.key]
            return (
              <Reveal
                key={step.key}
                as="li"
                delay={0.08 * i}
                /*
                  DER INNENABSTAND DARF NICHT AN DER ZELLE HAENGEN.

                  Zuerst stand `md:pe-10` hier an der `li`. Im Bild gemessen
                  riss das die Strecke zwischen den Schritten auf: Zwischen
                  „Verstehen" und „Bauen" klaffte eine Luecke — und eine
                  Luecke bedeutet in diesem Vokabular genau eine Sache, eine
                  Uebergabe von Hand. Die Zeichnung behauptete damit das
                  Gegenteil des Textes ueber ihr.

                  Der Abstand gehoert an den INHALT, die Strecke laeuft
                  durch.
                */
                className="group flex flex-1 items-stretch gap-5 md:flex-col md:gap-0"
              >
                <SystemRail
                  ton="verbunden"
                  achse="fluss"
                  erste={i === 0}
                  aktivierbar
                />
                <span className="flex flex-1 flex-col pb-8 md:pt-6 md:pb-0 md:pe-10">
                  <span className="eyebrow text-gold-text">{step.step}</span>
                  <h3 className="type-h3 mt-4 md:mt-6">{copy.name}</h3>
                  <p className="type-body text-muted-foreground mt-3 max-w-sm text-pretty md:mt-5">
                    {copy.what}
                  </p>
                </span>
              </Reveal>
            )
          })}
        </ol>

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
