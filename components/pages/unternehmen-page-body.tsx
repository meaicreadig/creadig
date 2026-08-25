"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { CompanyChapters } from "@/components/sections/company-chapters"
import { HouseArchitecture } from "@/components/sections/house-architecture"
import { About } from "@/components/sections/about"
import { WorkModel } from "@/components/sections/work-model"
import { CompanyPhotos } from "@/components/sections/company-photos"
import { LogoWall } from "@/components/sections/logo-wall"
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
          {/*
            Erst die Kategorie, dann die Haltung. Umgekehrt gelesen ist der
            Haltungssatz eine Behauptung ohne Bezugsrahmen — „System-Haus"
            heisst fuer die meisten Leser zunaechst „IT-Systemhaus", und
            genau das raeumt der Kategorie-Satz ab (KIZILELMA §10.1).
          */}
          <p className="eyebrow text-gold-text">{t.brand.categoryLabel}</p>
          <p className="type-statement mt-4 max-w-4xl text-balance">{t.brand.category}</p>
          <p className="type-body text-foreground/85 mt-8 max-w-3xl text-pretty">
            {copy.statement}
          </p>
        </div>
      </PageHeader>

      {/*
        Der Weg zuerst (KIZILELMA §7: das Dach als Ursprung), dann wer
        dahintersteht, dann fuer wen gearbeitet wird. Vorher begann die Seite
        mit "Ueber uns" und hatte damit keine Herkunft — nur einen Zustand.
      */}
      <CompanyChapters />
      {/*
        Das Haus in einer Ansicht (V2-4d). Es steht direkt hinter dem Weg:
        erst wie es entstanden ist, dann wie es heute geordnet ist — und
        erst danach, wer darin arbeitet.
      */}
      <HouseArchitecture />
      <About />
      {/*
        „Wer macht das?" war die groesste Luecke der Seite (§10.6). Sie steht
        direkt hinter „Ueber uns", weil sie dessen Fortsetzung ist: erst was
        das Haus ist, dann wer darin arbeitet — und erst danach, fuer wen.
      */}
      <WorkModel />
      {/*
        Echte Fotos aus dem Haus (§10.6). Rendert nur, wenn unter
        public/images/unternehmen/ wirklich eins liegt — heute keins, also
        keine Sektion. Kein Stock, kein Platzhalter, kein dritter Zustand.
      */}
      <CompanyPhotos />
      <LogoWall />
      {/* Standort + Parallax — die Server-Komponente entscheidet über das Foto.
          Bewusst ohne Reveal-Huelle: Die Sektion bringt ihre eigene
          Scroll-Kopplung mit, ein zweiter Opacity-Uebergang darueber wuerde
          nur gegen sie arbeiten. */}
      {location}
      {/*
        Hier stand die Zertifizierungs-Sektion mit vier Kacheln. Alle vier
        Eintraege sind unbelegt und deshalb entfernt (V2-5 · §9.9) — die
        offene Frage steht im Audit-Backlog, nicht auf der Seite.
      */}
      <ClosingCta />
    </main>
  )
}
