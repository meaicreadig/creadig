import { Hero } from "@/components/sections/hero"
import { ImpactBand } from "@/components/sections/impact-band"
import { LogoWall } from "@/components/sections/logo-wall"
import { Portfolio } from "@/components/sections/portfolio"
import { CaseStudies } from "@/components/sections/case-studies"
import { Reviews } from "@/components/sections/reviews"
import { Services } from "@/components/sections/services"
import { HouseProducts } from "@/components/sections/house-products"
import { MeaiSpotlight } from "@/components/sections/meai-spotlight"
import { Process } from "@/components/sections/process"
import { Certifications } from "@/components/sections/certifications"
import { About } from "@/components/sections/about"
import { Location } from "@/components/sections/location"
import { Packages } from "@/components/sections/packages"
import { Faq } from "@/components/sections/faq"
import { Contact } from "@/components/sections/contact"
import { ClosingCta } from "@/components/sections/closing-cta"
import { dictionary } from "@/lib/dictionary"

/**
 * FAQPage für Suchmaschinen (E-K5).
 *
 * Bewusst hier und nicht in der FAQ-Komponente: Die Sektion ist eine
 * Client-Komponente, deren Sprache erst nach der Hydration feststeht. Ein
 * Crawler sieht das Server-HTML, und das ist deutsch — also stehen hier die
 * deutschen Fragen. Dieselben Texte, dieselbe Quelle.
 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: dictionary.de.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
}

export default function Page() {
  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <ImpactBand />
      <LogoWall />
      <Portfolio />
      {/* Rendert erst, wenn eine freigegebene Case-Study vorliegt (E-K1). */}
      <CaseStudies />
      <Services />
      {/* Die vier eigenen Produkte gleichwertig — davor, nicht anstelle des Flaggschiffs (B3). */}
      <HouseProducts />
      <MeaiSpotlight />
      <Process />
      <Certifications />
      {/* Rendert erst, wenn echte Bewertungen vorliegen (E-K2). */}
      <Reviews />
      <About />
      <Location />
      <Packages />
      {/* Direkt vor dem Formular: nimmt die Fragen weg, die sonst bremsen. */}
      <Faq />
      <Contact />
      {/* Schlussstrich statt abruptem Ende (B1). */}
      <ClosingCta />
    </main>
  )
}
