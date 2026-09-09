"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Portfolio } from "@/components/sections/portfolio"
import { CaseStudies } from "@/components/sections/case-studies"
import { Reviews } from "@/components/sections/reviews"
import { ClosingCta } from "@/components/sections/closing-cta"
import { genannteClientWorks } from "@/lib/site-data"

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
        crumbLabel={t.nav.arbeiten}
        /*
          Der Vorspann folgt der Freigabelage, nicht dem Wunsch.

          Er versprach „Kundenwerk … getrennt ausgewiesen"; darunter standen
          vier eigene Produkte und kein Kunde, weil G13 ohne schriftliche
          Freigabe keinen nennt. Die zweite Fassung erklaert die Luecke,
          statt sie zu verschweigen — und verschwindet von selbst, sobald
          die erste Freigabe vorliegt.
        */
        lead={
          genannteClientWorks.length === 0
            ? t.arbeitenPage.leadOhneKundenwerk
            : t.arbeitenPage.lead
        }
      />
      {/* Die H1 steht im Kopf — die Werkschau kommt ohne zweite Überschrift. */}
      <Portfolio heading={false} />
      <CaseStudies />
      <Reviews />
      {/* MP10-2 (Zusatz) — nach der Werkschau knuepft der Abschluss an das
          Gesehene an, statt allgemein zum Start aufzurufen. */}
      <ClosingCta variant="work" />
    </main>
  )
}
