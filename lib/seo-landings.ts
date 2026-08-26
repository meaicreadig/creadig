import type { Localized } from "@/lib/site-data"
import { servicePages } from "@/lib/service-pages"

/**
 * MP10-5 — DIE SEO-LANDINGS. STRUKTUR STEHT, INHALT WARTET AUF DEN OWNER.
 *
 * ---------------------------------------------------------------------------
 * WAS DAS IST UND WAS ES NICHT IST
 * Gemeint sind Seiten wie „Webentwicklung Osnabrück" oder „Prozess-
 * automatisierung für KMU": eine Adresse je Suchabsicht, die es wirklich zu
 * bedienen gilt. Nicht gemeint ist der uebliche Keyword-Teppich — dreissig
 * Staedtenamen ueber demselben Text, jeder mit eigenem `<title>`. Der
 * funktioniert seit Jahren nicht mehr, und er ist auf einer Seite, deren
 * ganzes Argument Ehrlichkeit ist, teurer als er einbringt.
 *
 * Die Regel dieser Datei ist deshalb streng:
 *
 *   EINE Landing = EINE Leistung, die es unter `/leistungen/<slug>` wirklich
 *   gibt, plus HOECHSTENS ein Ort, an dem wir wirklich arbeiten. Der Text ist
 *   eigener Text, keine Variante mit ausgetauschtem Stadtnamen.
 *
 * `serviceSlug` wird gegen `servicePages` geprueft (siehe `landingService`).
 * Eine Landing, die auf eine Leistung zeigt, die es nicht gibt, ist eine
 * Sackgasse mit Titel — sie erscheint gar nicht erst.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE LISTE LEER IST
 * Welche Staedte und welche Leistungen beworben werden sollen, ist eine
 * Vertriebsentscheidung, keine technische. Sie steht als Owner-Punkt auf
 * `/status`. Solange die Liste leer ist, existiert keine einzige dieser
 * Adressen — kein Platzhalter, kein „Demnaechst", kein Eintrag in der
 * Sitemap.
 *
 * ---------------------------------------------------------------------------
 * WO SIE AUSGELIEFERT WERDEN
 * Unter der Wurzel (`/webentwicklung-osnabrueck`), aber NICHT ueber eine
 * eigene `[slug]`-Route: Die haette der Catch-all-Route den Vorrang genommen,
 * die heute jede unbekannte Adresse auf die gebaute 404-Seite fuehrt. Die
 * Landings laufen deshalb durch dieselbe Catch-all-Route — sie prueft zuerst
 * diese Liste und faellt nur durch, wenn nichts passt.
 */
export type SeoLanding = {
  /** Adresse unter der Wurzel, ohne Schraegstrich: "webentwicklung-osnabrueck". */
  slug: string
  /**
   * Ort, an dem wir wirklich arbeiten — oder `null` fuer eine ueberregionale
   * Leistungs-Landing. Kein Ort, an dem wir noch nie einen Kunden hatten.
   */
  city: string | null
  /** Muss in `servicePages` existieren und dort `published` sein. */
  serviceSlug: string
  h1: Localized
  lead: Localized
  metaTitle: Localized
  metaDescription: Localized
  /**
   * Der eigene Text. Absaetze, keine Aufzaehlung von Suchbegriffen.
   *
   * Regel: Was hier steht, muss auch stimmen, wenn man den Ortsnamen
   * streicht. Ein Satz, der nur mit dem Stadtnamen funktioniert, ist Fuellung.
   */
  body: Localized[]
  published: boolean
}

/** TODO (Owner): Städte/Leistungen benennen. Leer = es gibt keine Landing. */
export const seoLandings: SeoLanding[] = []

/** Die Leistung hinter einer Landing — `undefined`, wenn der Slug ins Leere zeigt. */
export function landingService(landing: SeoLanding) {
  return servicePages.find((page) => page.slug === landing.serviceSlug && page.published)
}

/**
 * Nur was veroeffentlicht ist UND auf eine existierende Leistung zeigt.
 * Beide Bedingungen, weil eine halbe Landing schlechter ist als keine.
 */
export const publishedSeoLandings = seoLandings.filter(
  (landing) => landing.published && landingService(landing) !== undefined,
)

export function findSeoLanding(slug: string) {
  return publishedSeoLandings.find((landing) => landing.slug === slug)
}
