"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Portfolio } from "@/components/sections/portfolio"
import { CaseStudies } from "@/components/sections/case-studies"
import { Reviews } from "@/components/sections/reviews"
import { ClosingCta } from "@/components/sections/closing-cta"

/**
 * Werkschau als eigene Route (PHASE A).
 *
 * Die Sektion lag bisher mitten auf der Startseite — mit Karten, Register und
 * beiden Werkgruppen. Das ist zu viel für einen Verteiler und zu wenig für
 * eine Referenzenseite. Hier hat sie den Platz, den sie braucht; die
 * Startseite reißt nur noch drei Arbeiten an.
 *
 * Case-Studies und Bewertungen bleiben gated: Beide Sektionen rendern gar
 * nichts, solange keine schriftliche Freigabe vorliegt — kein „Demnächst",
 * keine Beispielfälle.
 */
export function ArbeitenPageBody() {
  const { t } = useLocale()

  return (
    <main>
      <PageHeader
        eyebrow={t.arbeitenPage.eyebrow}
        title={t.arbeitenPage.title}
        lead={t.arbeitenPage.lead}
      />
      {/* Die H1 steht im Kopf — die Werkschau kommt ohne zweite Überschrift. */}
      <Portfolio heading={false} />
      <CaseStudies />
      <Reviews />
      <ClosingCta />
    </main>
  )
}
