"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { certifications } from "@/lib/site-data"

/**
 * Nachweis-Leiste (PHASE A, Master-Prompt 4 §4.8 · Motiv aus Entwurf R1).
 *
 * Die ausführliche Zertifizierungs-Sektion mit Kacheln und Quellenlinks lebt
 * jetzt auf /unternehmen. Auf der Verteiler-Startseite steht davon nur noch
 * die eine Zeile: die Namen, durch Punkte getrennt, ein Link zum
 * Nachschlagen. Wie viele es sind, entscheidet `certifications` — seit
 * go-digital dort raus ist, sind es vier.
 *
 * Warum überhaupt noch etwas: Es sind die einzigen Aussagen auf der ganzen
 * Seite, die jemand bei einer dritten Stelle überprüfen kann. Das ist zu viel
 * wert, um es hinter einen Klick zu legen — aber nicht so viel, dass es eine
 * eigene Sektion braucht.
 */
export function ProofLine() {
  const { t } = useLocale()
  const copy = t.home.proof

  return (
    <section aria-label={copy.label} className="border-line border-b">
      <Reveal className="section-gutter flex flex-wrap items-center gap-x-8 gap-y-4 py-7">
        <p className="eyebrow text-muted-foreground">{copy.label}</p>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {certifications.map((cert, i) => (
            <li key={cert.slug} className="flex items-center gap-5">
              {i > 0 && (
                <span aria-hidden="true" className="bg-line-strong size-1 rounded-full" />
              )}
              <span className="type-small text-foreground/85">{cert.short}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/unternehmen#zertifizierungen"
          className="text-gold-text hover:text-foreground ml-auto inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
        >
          {copy.cta}
          <ArrowUpRight className="size-4" strokeWidth={1.5} />
        </Link>
      </Reveal>
    </section>
  )
}
