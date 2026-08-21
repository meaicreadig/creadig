"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * „creaDIG in einem Satz" (PHASE A, Master-Prompt 4 §4.2).
 *
 * Die zweite Sektion der Verteiler-Startseite. Bewusst KEIN Karten-Raster und
 * bewusst nur Typografie: Nach der Headline im Hero braucht die Seite eine
 * ruhige Fläche, auf der genau eine Aussage steht. Ein Raster hier würde
 * denselben Ton weiterspielen wie alles darunter — und genau diese
 * Gleichlautstärke erzeugt das „irgendwie still"-Gefühl.
 *
 * Das System-Diagramm (Marke → Digital → Operations → Automatisierung → KI)
 * gehört an diese Stelle, kommt aber in PHASE C. Es hier vorab als Textzeile
 * zu simulieren wäre die schlechtere Zwischenlösung: Die Kacheln der
 * Capabilities weiter unten sagen dasselbe schon.
 */
export function HouseStatement() {
  const { t } = useLocale()
  const copy = t.home.statement

  return (
    <section id="haltung" aria-labelledby="haltung-title" className="border-line border-b">
      <div className="section-shell">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionEyebrow label={copy.eyebrow} />
          </Reveal>

          <div className="lg:col-span-8">
            <Reveal>
              <h2 id="haltung-title" className="type-h3 max-w-3xl text-balance">
                {copy.title}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">
                {copy.body}
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <Link
                href="/unternehmen"
                className="text-gold-text hover:text-foreground mt-10 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
              >
                {copy.cta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
