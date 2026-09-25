import { Hero } from "@/components/sections/hero"
import { Betriebsfluss } from "@/components/sections/betriebsfluss"
import { HouseArchitecture } from "@/components/sections/house-architecture"
import { SelectedWork } from "@/components/sections/selected-work"
import { EntryLine } from "@/components/sections/entry-line"
import { CaseStudies } from "@/components/sections/case-studies"
import { Beleglage } from "@/components/sections/beleglage"
import { oeffentlicheFaelle } from "@/lib/freigabe-oeffentlich"
import { CompanyTeaser } from "@/components/sections/company-teaser"
import { InsightsTeaser } from "@/components/sections/insights-teaser"
import { ClosingCta } from "@/components/sections/closing-cta"

/**
 * DIE STARTSEITE — ACHT SEKTIONEN, EINE ERZAEHLUNG (W2).
 *
 * Problem → Aufbau → Beleg → Angebot → Gespraech. Vorher waren es zwoelf
 * Sektionen mit drei parallelen Ordnungen („Drei Lagen", „Fuenf Ebenen",
 * „Drei Arten anzufangen"); keine davon hatte Platz, als Bild zu wirken.
 *
 *   1 Hero              wer wir sind — die Zeile aus dem Schluss als Untertitel
 *   2 Betriebsfluss     das Problem als Bild: sechs Schritte, sechs Werkzeuge
 *   3 Das Haus          fuenf Ebenen EINMAL, kompakt (ersetzt Lagen + Kacheln)
 *   4 SelectedWork      echte Oberflaechen der eigenen Produkte
 *   5 EntryLine         die Angebote aus `lib/offers.ts`
 *   6 Faelle            freigegebene Kundenfaelle — ohne Freigabe die Beleglage
 *   7 CompanyTeaser     wer dahinter steht
 *   8 ClosingCta        sprechen
 *
 * Gegangen (Komponenten bleiben im Bestand, geloescht ist nichts):
 * `HouseStatement` (die Aussage steht im Hero), `Lagen` + `CapabilityTiles`
 * (im kompakten Haus), `ImpactBand` (eine Jahreszahl und zwei
 * Tatsachen, die Hero und Firmen-Zeile schon nennen).
 * `InsightsTeaser` erscheint erst ab zwei Notizen.
 *
 * Die Datei ist keine Route (`app/_routes/`), sondern die eine Quelle fuer
 * `/` und `/tr` usw. — keine Fassung kann der anderen davonlaufen.
 */
export async function HomeRoute() {
  /* B-1 — die Erlaubnislage des Admin entscheidet, was hier steht. */
  const { faelle } = await oeffentlicheFaelle()
  return (
    <main id="top">
      <Hero />
      <Betriebsfluss />
      <HouseArchitecture variant="kompakt" />
      <SelectedWork />
      <EntryLine />
      {faelle.length > 0 ? <CaseStudies faelle={faelle} /> : <Beleglage />}
      <CompanyTeaser />
      <InsightsTeaser />
      <ClosingCta />
    </main>
  )
}
