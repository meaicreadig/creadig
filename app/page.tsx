import { Hero } from "@/components/sections/hero"
import { HouseStatement } from "@/components/sections/house-statement"
import { SelectedWork } from "@/components/sections/selected-work"
import { CapabilityTiles } from "@/components/sections/capability-tiles"
import { HouseProducts } from "@/components/sections/house-products"
import { CaseStudies } from "@/components/sections/case-studies"
import { ImpactBand } from "@/components/sections/impact-band"
import { ProofLine } from "@/components/sections/proof-line"
import { Location } from "@/components/sections/location"
import { CompanyTeaser } from "@/components/sections/company-teaser"
import { InsightsTeaser } from "@/components/sections/insights-teaser"
import { ClosingCta } from "@/components/sections/closing-cta"

/**
 * DIE STARTSEITE IST EIN VERTEILER (PHASE A, Master-Prompt 4 §4).
 *
 * ---------------------------------------------------------------------------
 * WAS SICH GEÄNDERT HAT UND WARUM
 * Vorher standen hier 17 Sektionen: Hero, Impact, Logo-Wand, Werkschau,
 * Kundenfälle, Leistungen, Produkte, meAI, Prozess, Zertifizierungen,
 * Bewertungen, Über uns, Standort, Pakete, FAQ, Kontakt, Abschluss. Das ist
 * Landingpage-Architektur: eine lineare Verkaufsgeschichte auf einer
 * Scroll-Schiene, die alles selbst erklärt.
 *
 * creaDIG ist aber ein System-Haus mit eigenem Ökosystem — und das muss die
 * Seite STRUKTURELL zeigen, nicht behaupten. Eine große Website ist nicht
 * dasselbe wie eine lange Homepage. Jede Sektion hier reißt an und führt
 * tiefer; die Ausführung steht auf der Unterseite, auf die verlinkt wird.
 *
 * ---------------------------------------------------------------------------
 * WOHIN DIE ALTEN SEKTIONEN GEZOGEN SIND — gestrichen wurde nichts
 *   Logo-Wand, Über uns, Zertifizierungen  → /unternehmen
 *   Werkschau, Register, Bewertungen       → /arbeiten
 *   Ebenen-Pyramide, Prozess, Pakete, FAQ  → /leistungen
 *   meAI-Deep-Dive                         → /produkte
 *   Kontaktformular                        → /kontakt
 *
 * ---------------------------------------------------------------------------
 * DIE REIHENFOLGE IST EIN ARGUMENT
 * Arbeit kommt VOR der Erklärung (Sektion 3, groß). Vorher musste sich jemand
 * durch drei Sektionen Behauptung lesen, bevor er sah, ob wir etwas können.
 * Produkte stehen direkt danach — sie sind der Punkt, an dem klar wird, dass
 * das hier keine Agentur ist. Preise stehen gar nicht mehr hier: Eine
 * Preistabelle auf der Startseite macht ein System-Haus zur produktisierten
 * Agentur.
 *
 * ---------------------------------------------------------------------------
 * ZWEI SEKTIONEN RENDERN HEUTE NICHTS
 * `CaseStudies` und `InsightsTeaser` sind gated und verschwinden spurlos,
 * solange keine Freigabe bzw. keine Notiz vorliegt. Sie stehen hier trotzdem:
 * Sobald der Owner liefert, sind sie an der richtigen Stelle — ohne dass
 * jemand die Reihenfolge neu erfinden muss.
 *
 * Das FAQ-Schema ist mit der FAQ nach /leistungen gezogen; hier stünde es
 * über Inhalten, die auf dieser Seite nicht mehr sichtbar sind — und
 * strukturierte Daten müssen beschreiben, was auf der Seite steht.
 */
export default function Page() {
  return (
    <main id="top">
      {/* 1 — Wer wir sind, in einer Headline und vier Absprungpunkten. */}
      <Hero />

      {/* 2 — creaDIG in einem Satz. Ruhige Fläche, keine Karten. */}
      <HouseStatement />

      {/* 3 — Arbeit vor Erklärung: drei Werke, groß. → /arbeiten */}
      <SelectedWork />

      {/* 4 — Die fünf Ebenen als Verteiler-Kacheln. → /leistungen */}
      <CapabilityTiles />

      {/* 5 — „We build our own." Der Aha-Moment. → /produkte */}
      <HouseProducts />

      {/* 6 — Ein tiefer Kundenfall (gated auf schriftliche Freigabe). */}
      <CaseStudies />

      {/* 7 — Zahlen und Nachweise: nur echte Signale, dann die Nachweis-Zeile. */}
      <ImpactBand />
      <ProofLine />

      {/* 8 — Wo wir sitzen und wer dahintersteht. → /unternehmen */}
      <Location />
      <CompanyTeaser />

      {/* 9 — Notizen aus dem Bau (gated, bis die erste steht). → /insights */}
      <InsightsTeaser />

      {/* 10 — Schlussstrich, souverän: sprechen oder erst weiterschauen. */}
      <ClosingCta />
    </main>
  )
}
