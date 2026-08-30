import type { MetadataRoute } from "next"
import { publishedInsights, readableInsights } from "@/lib/insights"
import { publishedSeoLandings } from "@/lib/seo-landings"
import { publishedServicePages } from "@/lib/service-pages"
import { clientWorks, productWorks } from "@/lib/site-data"
import { localeUrl, locales, DEFAULT_LOCALE } from "@/lib/routes"

/**
 * Die Sitemap — jetzt zweisprachig (GROW-1).
 *
 * ---------------------------------------------------------------------------
 * WAS SIE ABBILDET
 * Seit PHASE A die ganze Informations-Architektur: fünf Bereiche plus die
 * Detailseiten. Alle Listen kommen aus derselben Quelle wie die Routen selbst
 * — wird eine Leistungsseite auf `published: false` gesetzt oder ein Produkt
 * entfernt, verschwindet sie automatisch aus Routing UND Sitemap. Keine
 * Sitemap, die auf 404 zeigt.
 *
 * ---------------------------------------------------------------------------
 * WARUM JEDER EINTRAG SEINE ÜBERSETZUNG NENNT
 * Jede Seite steht zweimal drin: `/leistungen` und `/tr/leistungen`. Beide
 * tragen zusätzlich `alternates.languages` mit BEIDEN Adressen. Das ist keine
 * Dopplung, sondern die Bedingung, unter der Google die zwei Fassungen als
 * dieselbe Seite in zwei Sprachen erkennt statt als doppelten Inhalt — und
 * hreflang gilt nur, wenn beide Seiten wechselseitig aufeinander zeigen.
 * Genau das leistet der `languages`-Block hier, zusätzlich zu den
 * Kopfdaten der Seiten.
 *
 * `/insights` steht nur drin, wenn dort etwas veröffentlicht ist — eine leere
 * Seite gehört nicht in den Index (siehe lib/insights.ts).
 *
 * Rechtsseiten stehen bewusst NICHT drin: Sie sind `noindex`. Eine Sitemap,
 * die eine Seite anbietet, die sich selbst aus dem Index nimmt, gibt zwei
 * gegensätzliche Anweisungen — und Google meldet das als Fehler.
 */

/** Ein Pfad (deutsche Schreibweise) mit seinen Sitemap-Eigenschaften. */
type Entry = {
  path: string
  changeFrequency: "weekly" | "monthly" | "yearly"
  priority: number
}

const entries: Entry[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },

  // Die fünf Bereiche der Firmen-Navigation.
  { path: "/leistungen", changeFrequency: "monthly", priority: 0.9 },
  ...publishedServicePages.map((page) => ({
    path: `/leistungen/${page.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),

  { path: "/produkte", changeFrequency: "monthly", priority: 0.9 },
  ...productWorks.map((product) => ({
    path: `/produkte/${product.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),

  { path: "/arbeiten", changeFrequency: "monthly", priority: 0.8 },
  ...clientWorks.map((work) => ({
    path: `/arbeiten/${work.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  })),

  { path: "/unternehmen", changeFrequency: "monthly", priority: 0.8 },
  ...(publishedInsights.length > 0
    ? [{ path: "/insights", changeFrequency: "weekly" as const, priority: 0.6 }]
    : []),
  /*
   * BF-A9 — jede Notiz mit Fliesstext hat eine eigene Adresse und steht
   * deshalb einzeln drin. Eintraege ohne Text (nur Anreisser in der Liste)
   * haben keine Seite und duerfen hier auch nicht auftauchen — eine Sitemap,
   * die auf 404 zeigt, ist schlimmer als eine unvollstaendige.
   */
  ...readableInsights.map((entry) => ({
    path: `/insights/${entry.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  })),

  /* MP10-4 — der Betrieb ist das einzige wiederkehrende Angebot und hat
     seit dieser Runde eine eigene Adresse. */
  { path: "/betrieb", changeFrequency: "monthly", priority: 0.7 },

  /* MP10-4 — „Integration first": die Frage, die vor jedem Angebot steht. */
  { path: "/systeme", changeFrequency: "monthly", priority: 0.7 },

  /* MP-D — das erste Werkzeug der Seite, nicht nur eine Darstellung. */
  { path: "/betriebscheck", changeFrequency: "monthly", priority: 0.8 },

  /*
   * MP-E — der erste vertikale Einstieg. GENAU EINER: Die Stadt-und-Gewerk-
   * Streuung liegt in `lib/seo-landings.ts` und ist leer, weil keine Stadt
   * bestaetigt ist. Eine Sitemap mit Adressen, die es nicht gibt, ist
   * schlimmer als eine kurze Sitemap.
   */
  { path: "/branchen/handwerk", changeFrequency: "monthly", priority: 0.7 },

  { path: "/kontakt", changeFrequency: "monthly", priority: 0.9 },
  { path: "/termin", changeFrequency: "monthly", priority: 0.8 },

  /*
   * BF-A4 — die Erklaerung zur Barrierefreiheit steht drin, Impressum und
   * Datenschutz nicht. Kein Widerspruch: Die beiden sind `noindex`, diese
   * Seite nicht. Sie ist ein Beleg, kein Pflichttext — wer nach
   * Barrierefreiheit und einer Agentur sucht, soll sie finden.
   *
   * Der tuerkische Pfad heisst `/tr/erisilebilirlik`; `localeUrl` setzt das
   * aus der Tabelle in `lib/routes.ts`, hier steht wie ueberall der deutsche.
   */
  { path: "/barrierefreiheit", changeFrequency: "yearly", priority: 0.5 },

  /*
   * MP10-5 — SEO-Landings. Heute keine: Die Liste ist Owner-gegatet, und
   * eine Sitemap mit Adressen, die es nicht gibt, ist schlimmer als eine
   * kurze Sitemap.
   */
  ...publishedSeoLandings.map((landing) => ({
    path: `/${landing.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
]

export default function sitemap(): MetadataRoute.Sitemap {
  return entries.flatMap((entry) =>
    locales.map((locale) => ({
      url: localeUrl(entry.path, locale),
      changeFrequency: entry.changeFrequency,
      // Deutsch ist der Schwerpunktmarkt und führt deshalb; der Abstand ist
      // klein genug, dass die türkische Fassung nicht abgehängt wird.
      priority: locale === DEFAULT_LOCALE ? entry.priority : Math.round((entry.priority - 0.1) * 10) / 10,
      /*
       * Identisch zu den Kopfdaten der Seiten. Weichen Sitemap und Seite in
       * ihren hreflang-Angaben voneinander ab, meldet Google beides als
       * Fehler und wertet keines.
       *
       * Gate 3: aus `locales` abgeleitet statt de/tr getippt. Eine Sprache,
       * die in der Liste steht, hat einen gebauten Routenbaum — damit kann
       * hier kein hreflang-Ziel entstehen, das es nicht gibt.
       */
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((l) => [l, localeUrl(entry.path, l)])),
          "x-default": localeUrl(entry.path, DEFAULT_LOCALE),
        },
      },
    })),
  )
}
