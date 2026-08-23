"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"

/**
 * ARCHETYP A — die ruhige Fläche (VIS-2).
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DIESE KOMPONENTE GIBT
 * Die Startseite hatte genau EINE Sektionsform: `section-shell`, darin ein
 * 12-Spalten-Kopf aus `SectionEyebrow` + `type-h2`, darunter im Abstand
 * `mt-20` ein `gap-px`-Kachelraster. Acht von zehn Sektionen liefen exakt so.
 * Das ist der Grund für „still/boutique" — nicht die Farbe und nicht die
 * Schrift, sondern die gleichbleibende Taktung. Wer scrollt, bekommt achtmal
 * dieselbe Ansage in derselben Lautstärke, und Gleichlautstärke liest sich
 * als Gleichgültigkeit.
 *
 * Die Seite hat jetzt drei Archetypen. Dieser hier ist der ruhige:
 *
 *   A · Editorial (diese Datei)  wenig Elemente, viel Fläche, EIN Satz, der
 *                               trägt. Kein Raster, keine Kacheln.
 *   B · Raster / Beweis          das bestehende Hairline-Gitter — bleibt,
 *                               ist aber nicht mehr die Grundform.
 *   C · Band / immersiv          randlos, dunkel oder Bild, mit Bewegung.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESEN ARCHETYP MESSBAR UNTERSCHEIDET
 * Nicht nur Abstände — sonst wäre es dieselbe Sektion mit mehr Luft:
 *
 *   Schriftgrad  `type-statement` (max 2,25rem) statt `type-h2` (max 3,25rem).
 *                Die ruhige Fläche spricht LEISER als das Raster, nicht
 *                lauter. Genau das macht sie zur Pause.
 *   Marke        Nur das Mono-Label, ohne die Gold-Linie der `SectionEyebrow`.
 *                Die Linie ist das Signal des Raster-Archetyps.
 *   Höhe         `section-shell-band` statt `section-shell` — eine Stufe
 *                großzügiger, weil die Sektion die Seite anhalten soll.
 *   Aufbau       Aussage oben, dann eine Haarlinie über die volle Breite,
 *                darunter Erläuterung links und Weg rechts. Kein Kopf-Inhalt-
 *                Schema, sondern ein Kolophon.
 */
export function EditorialSection({
  id,
  eyebrow,
  title,
  body,
  cta,
  href,
}: {
  id: string
  eyebrow: string
  title: string
  body: string
  cta: string
  href: string
}) {
  const titleId = `${id}-title`

  return (
    <section id={id} aria-labelledby={titleId} className="border-line border-b">
      <div className="section-shell-band">
        <Reveal>
          <p className="eyebrow text-muted-foreground">{eyebrow}</p>
        </Reveal>

        <Reveal delay={0.06}>
          {/*
            `max-w-5xl` statt `max-w-3xl`: Der Satz darf über die halbe Seite
            laufen. Eine schmale Textsäule mitten in viel Weiß wirkt schmal,
            nicht ruhig — Ruhe entsteht aus Fläche, nicht aus Enge.
          */}
          <h2 id={titleId} className="type-statement mt-9 max-w-5xl text-balance">
            {title}
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="border-line mt-16 flex flex-col gap-8 border-t pt-9 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
            <p className="type-lead text-muted-foreground max-w-2xl text-pretty">{body}</p>
            <Link
              href={href}
              className="group text-gold-text hover:text-foreground inline-flex shrink-0 items-center gap-2 text-sm tracking-wide transition-colors duration-500"
            >
              {cta}
              <ArrowUpRight
                className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
