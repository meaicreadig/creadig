import { LocaleProvider } from "@/components/locale-provider"
import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/sections/hero"
import { ImpactBand } from "@/components/sections/impact-band"
import { LogoWall } from "@/components/sections/logo-wall"
import { Portfolio } from "@/components/sections/portfolio"
import { Services } from "@/components/sections/services"
import { MeaiSpotlight } from "@/components/sections/meai-spotlight"
import { Process } from "@/components/sections/process"
import { About } from "@/components/sections/about"
import { Packages } from "@/components/sections/packages"
import { Contact } from "@/components/sections/contact"
import { SiteFooter } from "@/components/site-footer"
import { StickyWhatsApp } from "@/components/sticky-whatsapp"
import { AiAssistant } from "@/components/ai-assistant"

export default function Page() {
  return (
    <LocaleProvider>
      <SiteNav />
      <main id="top">
        <Hero />
        <ImpactBand />
        <LogoWall />
        <Portfolio />
        <Services />
        <MeaiSpotlight />
        <Process />
        <About />
        <Packages />
        <Contact />
      </main>
      <SiteFooter />
      <StickyWhatsApp />
      <AiAssistant />
    </LocaleProvider>
  )
}
