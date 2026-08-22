"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { CompanyChapters } from "@/components/sections/company-chapters"
import { About } from "@/components/sections/about"
import { LogoWall } from "@/components/sections/logo-wall"
import { Certifications } from "@/components/sections/certifications"
import { ClosingCta } from "@/components/sections/closing-cta"

/**
 * Unternehmensseite (PHASE A).
 *
 * Was hier zusammenkommt, lag bisher über die Startseite verstreut: „Über
 * uns", die Logo-Wand, der Standort und die Zertifizierungen. Einzeln
 * betrachtet war jedes davon eine Sektion; zusammen sind sie die Antwort auf
 * die Frage, die ein Interessent vor der Beauftragung wirklich stellt — wer
 * seid ihr eigentlich.
 *
 * Der Standort kommt als Server-Komponente von der Route (`location`), weil
 * er zur Bauzeit prüft, ob das ICO-Foto im Repo liegt. Fehlt es, rendert das
 * Signatur-Mesh statt eines kaputten Bildes — dieselbe gated-Logik wie überall.
 */
export function UnternehmenPageBody({ location }: { location: React.ReactNode }) {
  const { t } = useLocale()
  const copy = t.unternehmenPage

  return (
    <main>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title}
        crumbLabel={t.nav.unternehmen} lead={copy.lead}>
        <div className="border-line mt-12 border-t pt-8">
          <p className="type-statement max-w-4xl text-balance">{copy.statement}</p>
        </div>
      </PageHeader>

      {/*
        Der Weg zuerst (KIZILELMA §7: das Dach als Ursprung), dann wer
        dahintersteht, dann fuer wen gearbeitet wird. Vorher begann die Seite
        mit "Ueber uns" und hatte damit keine Herkunft — nur einen Zustand.
      */}
      <CompanyChapters />
      <About />
      <LogoWall />
      {/* Standort + Parallax — die Server-Komponente entscheidet über das Foto.
          Bewusst ohne Reveal-Huelle: Die Sektion bringt ihre eigene
          Scroll-Kopplung mit, ein zweiter Opacity-Uebergang darueber wuerde
          nur gegen sie arbeiten. */}
      {location}
      <Certifications />
      <ClosingCta />
    </main>
  )
}
