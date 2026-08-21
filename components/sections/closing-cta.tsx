"use client"

import { useLocale } from "@/components/locale-provider"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Abschluss-Band (B1) — der letzte Block vor dem Footer.
 *
 * Warum es das gibt: Die Startseite endete mitten im Kontaktformular. Wer das
 * Formular nicht ausfuellen wollte, fiel ohne Zwischenschritt in den Footer —
 * die Seite hatte keinen Schluss, nur ein Ende. Dieses Band fasst zusammen und
 * laesst genau zwei Wege offen: sprechen (Gold-CTA) oder erst weiterschauen
 * (Ghost-Link zur Werkschau).
 *
 * Bewusst schmal: kein weiteres Raster, keine dritte Aussage. Es ist ein
 * Schlussstrich, keine Sektion.
 *
 * Zur Lautstaerke des Motivs: Die Haus-Regel kennt genau drei benannte
 * Opacity-Stufen (globals.css) — eine vierte waere ein Sonderfall im Markup,
 * und genau die sollten die Stufen abschaffen. Das Band nimmt darum
 * `motif-band` und wird ueber die *Dichte* leiser, nicht ueber einen neuen
 * Opacity-Wert.
 */
export function ClosingCta() {
  const { t } = useLocale()

  return (
    <section
      id="abschluss"
      aria-labelledby="abschluss-title"
      // Untere Hairline: Band und Footer teilen sich denselben Token-Satz und
      // waeren sonst eine einzige Flaeche — der Schlussstrich braucht eine Kante.
      className="section-dark border-line relative overflow-hidden border-b"
    >
      <SignatureMotif
        direction="center"
        density={0.26}
        className="motif-band pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        aria-hidden="true"
        className="via-gold/60 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />

      <div className="section-shell-tight relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={t.closing.eyebrow} />
            <h2 id="abschluss-title" className="type-h3 mt-6 max-w-2xl text-balance">
              {t.closing.title}
            </h2>
            <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
              {t.closing.lead}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <MagneticButton href="/kontakt">{t.closing.ctaPrimary}</MagneticButton>
              <MagneticButton href="/arbeiten" variant="ghost">
                {t.closing.ctaSecondary}
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
