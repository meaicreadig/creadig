import { navLinks } from "@/lib/site-data"
import { publishedInsights } from "@/lib/insights"

/* ==========================================================================
 * GATE 01 · DIE HAUPTNAVIGATION ALS EIGENE ENTSCHEIDUNG
 * ==========================================================================
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE DATEI EXISTIERT
 * Die fuenf Rubriken stehen in `lib/site-data.ts` (`navLinks`). Diese Datei
 * ist unter G18 gesperrt — Gate 01 darf sie nicht anfassen. Die Regel, WELCHE
 * dieser Rubriken heute im Hauptmenue steht, ist aber eine Entscheidung von
 * Gate 01 und keine Stammdatenfrage.
 *
 * Also wird `navLinks` hier nur GELESEN und die Auswahl daneben gebaut. Die
 * Quelle bleibt eine; die Regel wohnt dort, wo sie entschieden wurde.
 *
 * ---------------------------------------------------------------------------
 * ZWEI AUSSCHLUESSE, BEIDE MIT BEFUND
 *
 * `/insights` — WEB-0018. Ein einziger veroeffentlichter Beitrag traegt einen
 * von fuenf Hauptnavigationspunkten. Wer darauf klickt, findet eine Rubrik mit
 * sechs angelegten Faechern und einem Text darin. Ein Hauptmenuepunkt ist ein
 * Versprechen auf Umfang; eingeloest wird es ab `INSIGHTS_NAV_SCHWELLE`
 * Beitraegen. Bis dahin steht die Rubrik in der Fusszeile — erreichbar,
 * verlinkt, indexiert, aber nicht beworben.
 *
 * `/arbeiten` — WEB-0005. Die Route zeigte dieselben vier eigenen Produkte wie
 * `/produkte`, also zwei Hauptmenuepunkte auf dieselbe Sammlung. Gate 01 hat
 * `/produkte` zum kanonischen Ort der eigenen Produkte erklaert; `/arbeiten`
 * ist ab jetzt fuer freigegebene Kundenarbeit reserviert. Solange
 * `genannteClientWorks` leer ist, hat die Route nichts zu zeigen, das sie von
 * `/produkte` unterscheidet — und was nichts Eigenes zeigt, gehoert nicht ins
 * Hauptmenue. Die Route bleibt bestehen, bleibt in der Sitemap und bleibt in
 * der Fusszeile. Sie kommt zurueck, sobald die erste Freigabe vorliegt
 * (Owner-Entscheidung OD-2).
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT PASSIERT
 * Keine Rubrik wird hier erfunden, umbenannt oder umsortiert. Die Reihenfolge
 * ist die von `navLinks`; entfernt wird nur, was seine Rubrik heute nicht
 * traegt. Wer eine sechste Rubrik will, traegt sie in `navLinks` ein — nicht
 * hier.
 * ========================================================================== */

/**
 * Ab wie vielen veroeffentlichten Beitraegen `/insights` einen eigenen
 * Hauptmenuepunkt bekommt.
 *
 * Drei, nicht einer: Die Startseiten-Teaserreihe zeigt bis zu drei Beitraege
 * (`MAX_TEASERS` in `insights-teaser.tsx`). Ab drei fuellt die Rubrik ihre
 * eigene Anreisserflaeche — vorher ist sie eine Ueberschrift ueber einer
 * Luecke.
 */
export const INSIGHTS_NAV_SCHWELLE = 3

/** `true`, sobald `/insights` genug traegt, um im Hauptmenue zu stehen. */
export const insightsNavReif = publishedInsights.length >= INSIGHTS_NAV_SCHWELLE

/**
 * Routen, die Gate 01 aus dem Hauptmenue genommen hat, mit der Bedingung, die
 * sie zurueckbringt. Der Gate-Pruefer liest diese Liste — so kann keine
 * Ausnahme entstehen, die niemand begruendet hat.
 */
export const navAusnahmen = [
  {
    href: "/insights",
    befund: "WEB-0018",
    zurueck: () => insightsNavReif,
  },
  {
    href: "/arbeiten",
    befund: "WEB-0005",
    /*
     * Bewusst `false` und nicht `genannteClientWorks.length > 0`: Ob
     * `/arbeiten` mit der ersten Freigabe automatisch wieder ins Hauptmenue
     * rueckt, ist eine Owner-Entscheidung (OD-2) und keine Ableitung. Eine
     * Rubrik, die sich selbst ins Menue schaltet, sobald irgendwo ein
     * Datensatz kippt, ist genau die Sorte Automatik, die spaeter niemand
     * erklaert bekommt.
     */
    zurueck: () => false,
  },
] as const

const ausgeschlossen = new Set<string>(
  navAusnahmen.filter((a) => !a.zurueck()).map((a) => a.href),
)

/**
 * Die Rubriken, die heute im Hauptmenue und im mobilen Menue stehen.
 *
 * Ersetzt `mainNavLinks` aus `lib/site-data.ts` an genau einer Stelle:
 * `components/site-nav.tsx`. Die Fusszeile liest weiterhin `navLinks` und
 * zeigt damit alle fuenf Rubriken — das ist der Unterschied zwischen
 * „nicht beworben" und „nicht erreichbar".
 */
export const hauptNavLinks = navLinks.filter((link) => !ausgeschlossen.has(link.href))
