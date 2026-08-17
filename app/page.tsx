import { Hero } from "@/components/sections/hero"
import { ImpactBand } from "@/components/sections/impact-band"
import { LogoWall } from "@/components/sections/logo-wall"
import { Portfolio } from "@/components/sections/portfolio"
import { CaseStudies } from "@/components/sections/case-studies"
import { Services } from "@/components/sections/services"
import { MeaiSpotlight } from "@/components/sections/meai-spotlight"
import { Process } from "@/components/sections/process"
import { Certifications } from "@/components/sections/certifications"
import { About } from "@/components/sections/about"
import { Location } from "@/components/sections/location"
import { Packages } from "@/components/sections/packages"
import { Contact } from "@/components/sections/contact"

export default function Page() {
  return (
    <main id="top">
      <Hero />
      <ImpactBand />
      <LogoWall />
      <Portfolio />
      {/* Rendert erst, wenn eine freigegebene Case-Study vorliegt (E-K1). */}
      <CaseStudies />
      <Services />
      <MeaiSpotlight />
      <Process />
      <Certifications />
      <About />
      <Location />
      <Packages />
      <Contact />
    </main>
  )
}
