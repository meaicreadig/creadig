"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Portfolio } from "@/components/sections/portfolio"
import { CaseStudies } from "@/components/sections/case-studies"
import { Reviews } from "@/components/sections/reviews"
import { Beleglage } from "@/components/sections/beleglage"
import { ClosingCta } from "@/components/sections/closing-cta"
import { genannteClientWorks } from "@/lib/site-data"

/**
 * KUNDENWERK ALS EIGENE ROUTE.
 *
 * ---------------------------------------------------------------------------
 * GATE 01 · WEB-0005 — DIE SEITE HATTE KEINE EIGENE AUFGABE
 * Bis hierher rief sie `<Portfolio />` auf, und `Portfolio` zeigt
 * `productWorks` — dieselben vier eigenen Produkte wie `/produkte`. Gemessen
 * in Gate 00: identische vier Ziel-Links auf beiden Seiten, kein einziges
 * eigenes Ziel auf dieser. Zwei Hauptmenuepunkte, eine Sammlung.
 *
 * Die Trennung, die Gate 01 gezogen hat:
 *
 *   `/produkte`  kanonischer Ort der eigenen Produkte. Bleibt im Hauptmenue.
 *   `/arbeiten`  Ort fuer Kundenarbeit mit schriftlicher Freigabe.
 *
 * ---------------------------------------------------------------------------
 * WARUM HIER HEUTE FAST NICHTS STEHT — UND WARUM DAS RICHTIG IST
 * `genannteClientWorks` ist leer: Ohne schriftliche Freigabe nennt G13 keinen
 * Kunden. Diese Seite hat damit heute nichts zu zeigen, das sie von
 * `/produkte` unterscheidet.
 *
 * Die Alternative waere gewesen, die eigenen Produkte stehen zu lassen und die
 * Ueberschrift „Arbeiten" ueber ihnen zu behalten. Das ist genau der Befund,
 * den das externe Audit als ersten notiert hat: „Arbeiten" laesst
 * Kundenarbeit erwarten und liefert Eigenbau. Eine duenne, wahre Seite ist
 * besser als eine volle, die etwas anderes verspricht als sie haelt.
 *
 * Die Route bleibt: erreichbar, in der Sitemap, in der Fusszeile verlinkt.
 * Aus dem Hauptmenue ist sie genommen (`lib/navigation.ts`). Sie kommt
 * zurueck, sobald die erste Freigabe vorliegt — das ist Owner-Entscheidung
 * OD-2, keine Ableitung aus einem Datenstand.
 *
 * `Portfolio` steht weiterhin im Bestand und wird hier wieder aufgerufen,
 * sobald `genannteClientWorks` traegt. Case-Studies und Bewertungen bleiben
 * gated: Beide rendern nichts, solange keine Freigabe vorliegt — kein
 * „Demnaechst", keine Beispielfaelle.
 */
export function ArbeitenPageBody() {
  const { t } = useLocale()
  const ohneKundenwerk = genannteClientWorks.length === 0

  return (
    <main>
      <PageHeader
        eyebrow={t.arbeitenPage.eyebrow}
        title={t.arbeitenPage.title}
        crumbLabel={t.nav.arbeiten}
        lead={ohneKundenwerk ? t.arbeitenPage.leadOhneKundenwerk : t.arbeitenPage.lead}
      >
        {/*
          Der Verweis steht im Kopf und nicht am Seitenende: Wer diese Seite
          oeffnet, sucht gebaute Arbeit. Findet er hier keine, muss der Weg zu
          der, die es gibt, im ersten Blickfeld stehen — nicht hinter zwei
          leeren Sektionen.
        */}
        {ohneKundenwerk && (
          <div className="border-line mt-12 border-t pt-6">
            <Link
              href="/produkte"
              className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {t.arbeitenPage.ohneKundenwerkCta}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        )}
      </PageHeader>
      {/*
        Die Werkschau erscheint erst mit freigegebenem Kundenwerk. Vorher zeigt
        sie eigene Produkte — und genau das war WEB-0005.
      */}
      {/*
        DIE BELEGLAGE — nur im Nullzustand.

        Sobald freigegebenes Kundenwerk existiert, steht der Beweis oben auf
        der Seite und braucht keine Erklaerung, warum er fehlt. Die Rangfolge
        waere dann eine Relativierung des eigenen Belegs — genau das
        Gegenteil ihrer Aufgabe.
      */}
      {ohneKundenwerk && <Beleglage />}

      {!ohneKundenwerk && <Portfolio heading={false} />}
      <CaseStudies />
      <Reviews />
      {/*
        GATE 02 — DER ABSCHLUSS SPRACH UEBER ETWAS, DAS NICHT DA WAR.

        Die Variante `work` sagt: „Wir sagen Ihnen ehrlich, ob Ihr Vorhaben zu
        dem passt, was Sie hier gesehen haben." Sie stammt aus der Zeit, als
        diese Seite eine Werkschau war. Seit Gate 01 steht hier keine Arbeit
        mehr — der Satz verweist auf einen leeren Bildschirm.

        Solange keine Freigabe vorliegt, traegt die Seite den Grundfall.
        Sobald Kundenwerk erscheint, ist die Variante wieder richtig.
      */}
      <ClosingCta variant={ohneKundenwerk ? "default" : "work"} />
    </main>
  )
}
