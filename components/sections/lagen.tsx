"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SystemRail } from "@/components/creative/system"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

/**
 * DIE DREI LAGEN — der Einstieg nach Situation.
 *
 * HIESS BIS RUN B „DREI WEGE HINEIN", UND DAS WAR EIN FEHLER.
 * Die Seite benutzt das Wort „Wege" bereits fuenfmal — unter anderem auf
 * `/leistungen` fuer „Drei Wege zu einem Preis" und, zwei Abschnitte
 * weiter, fuer „Zwei Wege hinein — beide zum Festpreis". Zwei Ueberschriften
 * mit derselben Formel und verschiedener Bedeutung sind keine Fuehrung,
 * sondern eine Verwechslung. Der Begriff, den dieser Abschnitt wirklich
 * meint, stand ohnehin schon im Kommentar darunter: die LAGE.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DAS PROBLEM, DAS DIESE SEKTION LOEST
 *
 * Die Seite fuehrt mit ihrer eigenen Ordnung: fuenf Ebenen, ein Haus,
 * Identity bis Intelligence. Die Ordnung ist gut — aber sie gehoert dem
 * ANBIETER. Der Buyer-Audit misst genau dort die Luecke: Der Mittelstand
 * findet keinen Weg, der „reif/gross genug?" beantwortet, und der kleine
 * Betrieb muss erst die ganze Architektur entschluesseln, ehe er weiss, wo
 * er hingehoert.
 *
 * Drei Lagen, benannt nach der Situation, in der jemand steckt. Keine Etiketten
 * wie klein/mittel/gross: Die Groesse eines Betriebs sagt nicht, wo es
 * klemmt, und ein Etikett, das einen Kunden als „klein" einsortiert, ist
 * ohnehin eine schlechte Eroeffnung.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE LINIE HIER ANDERS BENUTZT WIRD ALS IM SYSTEMBILD
 *
 * Das ist die wichtigste Entscheidung in dieser Datei — und beinahe waere
 * sie falsch gefallen.
 *
 * Im Systembild bedeutet die Linie einen ABLAUF: Anfrage, dann Angebot,
 * dann Termin. Drei Einstiegswege sind aber kein Ablauf. Sie sind
 * Alternativen. Haette ich die Wege wie Stationen auf eine Strecke gesetzt,
 * haette das Bild behauptet, Weg A komme vor Weg B und C sei das Ziel —
 * und genau das Gegenteil steht im Text: „Kein Weg ist die Vorstufe eines
 * anderen."
 *
 * Eine Linie, die etwas anderes sagt als der Satz daneben, ist schlimmer
 * als keine Linie. Die Regel im Vokabular lautet: Wer eine Linie setzt,
 * muss sagen koennen, was an ihr entlanglaeuft.
 *
 * Hier laeuft daran der BETRIEB entlang — dieselbe Linie wie ueberall auf
 * dieser Seite. Die drei Wege sind nicht Abschnitte dieser Linie, sondern
 * drei STELLEN, an denen man auf sie aufspringt. Deshalb sitzt jeder Weg an
 * seinem eigenen Knoten, und die Linie laeuft vor dem ersten und hinter dem
 * letzten weiter: Der Betrieb lief vorher, und er laeuft nachher.
 */
export function Lagen() {
  const { t } = useLocale()
  const copy = t.home.lagen
  const reduce = usePrefersReducedMotion()

  return (
    <section id="lagen" aria-labelledby="lagen-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="lagen-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        <ol className="mt-14 flex flex-col md:flex-row md:items-stretch">
          {copy.routen.map((lage, i) => (
            <Reveal
              key={lage.key}
              as="li"
              delay={0.05 * i}
              className="flex flex-1 items-stretch gap-5 md:flex-col md:gap-0"
            >
              {/*
                Keine `erste`/`letzte`-Kappung: Die Linie laeuft an beiden
                Enden weiter. Der Betrieb faengt nicht bei Weg A an und hoert
                nicht bei Weg C auf — wir steigen nur irgendwo zu.
              */}
              <SystemRail ton="verbunden" achse="fluss" puls={!reduce} verzug={i} aktivierbar />

              <Link
                href={lage.href}
                className="group hover:bg-surface flex flex-1 flex-col py-6 transition-colors duration-[var(--dur-2)] md:mt-5 md:pe-8"
              >
                <span className="eyebrow text-gold-text">{lage.label}</span>
                <span className="type-h4 mt-3">{lage.title}</span>
                <span className="type-small text-muted-foreground mt-3 max-w-sm text-pretty">
                  {lage.wenn}
                </span>
                <span className="text-meta text-muted-foreground border-line mt-5 max-w-sm border-t pt-4">
                  {lage.start}
                </span>
                <span className="text-gold-text group-hover:text-foreground mt-5 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]">
                  {/*
                    Eigene Beschriftung statt „Alle Leistungen": Die drei
                    Verweise fuehren an DREI verschiedene Stellen. Dreimal
                    derselbe Text daneben haette behauptet, sie landeten am
                    selben Ort.
                  */}
                  {copy.cta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.2}>
          <p className="type-small text-muted-foreground mt-10 max-w-xl text-pretty">{copy.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
