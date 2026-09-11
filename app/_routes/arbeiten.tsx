import type { Metadata } from "next"
import { ArbeitenPageBody } from "@/components/pages/arbeiten-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { genannteClientWorks, registryWorks, workHref } from "@/lib/site-data"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { localeUrl } from "@/lib/routes"

/**
 * Werkschau (PHASE A · zweisprachig seit GROW-1).
 *
 * Bis PHASE A war „Arbeiten" ein Anker auf der Startseite. Jetzt ist es eine
 * Adresse — mit Karten- und Registeransicht, Kundenfällen (gated) und
 * Bewertungen (gated).
 */
export function arbeitenMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].arbeitenPage
  /*
   * Auch der Suchtreffer haelt sich an die Freigabelage. „Eigene Produkte
   * UND Kundenwerk" in der Ergebnisliste ist dieselbe Zusage wie im
   * Vorspann — und wer ihr folgt, findet vier eigene Produkte.
   */
  const ohneKundenwerk = genannteClientWorks.length === 0
  return pageMetadata({
    locale,
    path: "/arbeiten",
    title: ohneKundenwerk ? copy.metaTitleOhneKundenwerk : copy.metaTitle,
    description: ohneKundenwerk ? copy.metaDescriptionOhneKundenwerk : copy.metaDescription,
    /*
     * PHASE 6 · COMMERCIAL COMPLETION — DIE INDEXENTSCHEIDUNG.
     *
     * Diese Seite traegt heute 82 Woerter: eine Ueberschrift, den Satz, dass
     * keine Freigabe vorliegt, und einen Verweis auf die Produkte. Das ist
     * duenner Inhalt, und duenner Inhalt schadet nicht nur der Seite selbst,
     * sondern der Bewertung der ganzen Domain.
     *
     * Drei Wege standen zur Wahl:
     *
     *   index, follow — eine fast leere Seite konkurriert um „creaDIG
     *     Arbeiten" und liefert dem Sucher nichts. Verworfen.
     *
     *   Weiterleitung auf /produkte — genau die Vermischung, die Gate 01
     *     mit D-16 aufgeloest hat: `/produkte` ist der Ort der eigenen
     *     Produkte, `/arbeiten` der fuer freigegebene Kundenarbeit. Eine
     *     Weiterleitung wuerde die Trennung technisch zuruecknehmen und die
     *     Adresse fuer den Tag verbrennen, an dem sie traegt. Verworfen.
     *
     *   noindex, follow — die Seite bleibt erreichbar, bleibt verlinkt, gibt
     *     ihre Verweiskraft weiter und steht nicht im Index. Gewaehlt.
     *
     * Die Bedingung ist dieselbe wie der sichtbare Text und wie die
     * strukturierten Daten: `genannteClientWorks.length === 0`. Sobald die
     * erste Freigabe vorliegt, steht die Seite ohne Code-Aenderung wieder im
     * Index — in allen vier Sprachen zugleich. Denselben Mechanismus benutzt
     * `/insights` seit seiner Einfuehrung.
     */
    noIndex: ohneKundenwerk,
  })
}

/*
 * PHASE 1 · COMMERCIAL COMPLETION — DIE STRUKTURIERTEN DATEN BESCHRIEBEN EINE
 * LISTE, DIE AUF DER SEITE NICHT STAND.
 *
 * Gemessen am 11.09.2026 auf der ausgelieferten Seite: Der sichtbare Text
 * sagt „Heute liegt keine solche Freigabe vor, deshalb steht hier niemand" —
 * und im selben Dokument lag eine `ItemList` namens „Arbeiten — eigene
 * Produkte und Kundenwerk" mit fibero, meAI, CASSAMEA und meahv samt URLs.
 *
 * Das ist kein Schoenheitsfehler. Strukturierte Daten sind eine Aussage an
 * Dritte darueber, was auf dieser Seite steht; eine Liste mit vier Eintraegen
 * auf einer Seite mit null Eintraegen ist schlicht falsch — und sie traegt
 * ausgerechnet das Wort „Kundenwerk" in den Namen, waehrend die Seite sagt,
 * dass es keines gibt.
 *
 * Die Metadaten daneben hielten sich laengst an die Freigabelage
 * (`ohneKundenwerk`). Die `ItemList` tut es jetzt auch: Solange die Seite
 * nichts auflistet, listet auch das Schema nichts auf. Die Produkte stehen
 * strukturiert auf `/produkte` — dort, wo sie auch sichtbar sind.
 */
function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  const brotkrume = breadcrumbList(locale, [{ name: t.nav.arbeiten, path: "/arbeiten" }])
  if (genannteClientWorks.length === 0) return [brotkrume]
  return [
    brotkrume,
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t.arbeitenPage.metaTitle,
      itemListElement: registryWorks.map((work, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: work.name,
        url: localeUrl(workHref(work), locale),
      })),
    },
  ]
}

export function ArbeitenRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <ArbeitenPageBody />
    </>
  )
}
