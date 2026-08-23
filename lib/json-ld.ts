import { dictionary, type Locale } from "@/lib/dictionary"
import { localeUrl } from "@/lib/routes"

/**
 * SEC-7 — strukturierte Daten sicher in ein <script>-Element schreiben.
 *
 * ---------------------------------------------------------------------------
 * DAS PROBLEM
 * An zehn Stellen stand `dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }}`.
 * `JSON.stringify` escapt fuer JavaScript korrekt — aber der Browser liest ein
 * `<script>`-Element zuerst als HTML. Enthaelt irgendein Feld die Zeichenfolge
 * `</script`, endet das Element genau dort, und alles danach landet als Markup
 * im Dokument.
 *
 * Heute kommen alle Werte aus `lib/site-data.ts` und `lib/dictionary.ts` und
 * sind harmlos. Aber genau dorthin traegt der Owner kuenftig Kundennamen,
 * Bewertungen und Fallbeschreibungen ein — Texte, die er nicht als Code liest
 * und bei denen niemand an diese Datei denkt. Die Luecke entsteht nicht heute,
 * sondern beim ersten fremden Text.
 *
 * ---------------------------------------------------------------------------
 * DIE LOESUNG
 * `<` wird zur Escape-Sequenz. Das ist innerhalb eines JSON-Strings dasselbe
 * Zeichen — die strukturierten Daten bleiben unveraendert gueltig —, aber der
 * HTML-Parser sieht kein `<` mehr und kann das Element nicht vorzeitig
 * schliessen.
 *
 * Dazu die beiden Unicode-Zeilentrenner U+2028 und U+2029: in JSON gueltige
 * Zeichen, in JavaScript aber echte Zeilenumbrueche. In einem `<script>`-Block
 * zerlegen sie sonst die Zeile.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

/**
 * GROW-1 — die Brotkrume, zweisprachig und aus einer Quelle.
 *
 * Sie stand vorher in jeder Route noch einmal, jedes Mal mit dem hart
 * geschriebenen Wort „Startseite". Auf `/tr/…` waere daraus eine deutsche
 * Brotkrume ueber tuerkischem Inhalt geworden — und mit zehn Kopien haette
 * man das an zehn Stellen uebersehen koennen.
 *
 * `trail` enthaelt die Stufen UNTER der Startseite, jeweils mit deutschem
 * Basispfad; das Sprachpraefix setzt `localeUrl`.
 */
export function breadcrumbList(
  locale: Locale,
  trail: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dictionary[locale].meta.breadcrumbHome,
        item: localeUrl("/", locale),
      },
      ...trail.map((step, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: step.name,
        item: localeUrl(step.path, locale),
      })),
    ],
  }
}
