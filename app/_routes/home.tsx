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
 * DIE REIHENFOLGE IST EIN ARGUMENT — UND EIN TAKT (VIS-2)
 * Arbeit kommt VOR der Erklärung (Sektion 3, groß). Vorher musste sich jemand
 * durch drei Sektionen Behauptung lesen, bevor er sah, ob wir etwas können.
 * Produkte stehen kurz danach — sie sind der Punkt, an dem klar wird, dass
 * das hier keine Agentur ist.
 *
 * Neu ist, dass die Reihenfolge auch den RHYTHMUS trägt. Jede Sektion gehört
 * zu einem von drei Archetypen:
 *
 *   A · Editorial   ruhige Fläche, ein Satz, kein Raster
 *   B · Raster      das Hairline-Gitter, dicht und zählbar
 *   C · Band        randlos, dunkel oder Bild, mit Bewegung
 *
 * Gelesen von oben: C A C B C B — C A — C. Keine zwei gleichen Archetypen
 * liegen nebeneinander. Vorher standen `CapabilityTiles` und `HouseProducts`
 * direkt hintereinander (zweimal B) und das dunkle Fundament-Band kam erst
 * danach; jetzt schiebt es sich dazwischen und bricht den Takt.
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
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE DATEI KEINE ROUTE IST (GROW-1)
 * Sie liegt in `app/_routes/`. Ordner mit Unterstrich nimmt Next vom Routing
 * aus — der Inhalt hier ist also kein Pfad, sondern die eine Quelle, aus der
 * `/` (deutsch) und `/tr` (türkisch) gerendert werden. Die beiden
 * `page.tsx`-Dateien enthalten nichts als ihre Sprache. So kann keine der
 * beiden Fassungen der anderen davonlaufen.
 *
 * Die Sektionen selbst brauchen nichts davon zu wissen: Sie lesen ihre Texte
 * ohnehin über `useLocale()`, und das Layout hat die Sprache bereits gesetzt.
 */
export function HomeRoute() {
  return (
    <main id="top">
      {/* 1 · C — Wer wir sind, in einer Headline und vier Absprungpunkten. */}
      <Hero />

      {/* 2 · A — creaDIG in einem Satz. Die erste Pause. */}
      <HouseStatement />

      {/* 3 · C — Arbeit vor Erklärung: randloses Band, drei Werke. → /arbeiten */}
      <SelectedWork />

      {/* 4 · B — Die fünf Ebenen als Verteiler-Kacheln. → /leistungen */}
      <CapabilityTiles />

      {/*
        5 · C — Das dunkle Fundament-Band.
        Es stand vorher HINTER den Produkt-Kacheln, also lagen zwei
        Raster-Sektionen unmittelbar hintereinander. Zwischen ihnen bricht
        das Band den Takt: Papier → Anthrazit → Papier.
      */}
      <ImpactBand />

      {/* 6 · B — „We build our own." Der Aha-Moment. → /produkte */}
      <HouseProducts />

      {/* 7 — Ein tiefer Kundenfall (gated auf schriftliche Freigabe). */}
      <CaseStudies />

      {/* 8 · C — Wo wir sitzen: Foto mit Parallaxe. */}
      <Location />

      {/* 9 · A — Wer dahintersteht. Die zweite Pause. → /unternehmen */}
      <CompanyTeaser />

      {/* 10 — Die Nachweis-Zeile, schmal, direkt vor dem Abschluss. */}
      <ProofLine />

      {/* 11 — Notizen aus dem Bau (gated, bis die erste steht). → /insights */}
      <InsightsTeaser />

      {/* 12 · C — Schlussstrich, souverän: sprechen oder erst weiterschauen. */}
      <ClosingCta />
    </main>
  )
}
