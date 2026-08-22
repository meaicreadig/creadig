import { PRODUCT_SCREENS } from "./product-media.generated"

/**
 * Echte Produkt-Aufnahmen — die Gated-Maschine für die Produkt-Welten.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE DATEI EXISTIERT
 * Die härteste gesperrte Regel des Projekts lautet: kein erfundenes Material,
 * keine Fake-UI, kein Deko-Laptop. Genau an Produktseiten bricht diese Regel
 * erfahrungsgemäß zuerst — eine leere Seite sieht dünn aus, und die
 * Versuchung, „irgendein Interface" danebenzulegen, ist groß.
 *
 * Darum entscheidet nicht das Markup, ob ein Interface gezeigt wird, sondern
 * das Dateisystem: Liegt unter `public/works/products/<slug>/` eine echte
 * Aufnahme, rendert die Sektion. Liegt dort nichts, rendert sie nicht. Es gibt
 * keinen dritten Zustand und keinen Platzhalter, der so tut als ob.
 *
 * ---------------------------------------------------------------------------
 * WIE DER OWNER SIE FÜLLT
 * Screenshots aus dem laufenden System nach
 *   public/works/products/meai/…       (meai, fibero, cassamea, meahv)
 * legen — Dateiname beliebig, alphabetisch sortiert ist die Reihenfolge.
 * Kein Code-Eingriff nötig; der nächste `npm run build` nimmt sie auf.
 *
 * ---------------------------------------------------------------------------
 * WARUM HIER KEIN `fs` MEHR STEHT (TECH-2)
 * Bis hierher lief `readdirSync(process.cwd(), …)` zur Render-Zeit. Das war
 * gleich zweimal falsch:
 *
 *   - Der Datei-Tracer von Next sieht einen `fs`-Zugriff auf `process.cwd()`,
 *     kann nicht wissen, was davon gebraucht wird, und packt vorsichtshalber
 *     den halben Repo-Root in die Function. Das war die Wurzel der zu großen
 *     Serverless-Function — die Exclude-Liste in `next.config.ts` behandelt
 *     nur das Symptom.
 *   - `process.cwd()` zeigt im Serverless-Bundle nicht auf das Repo. Was
 *     lokal funktionierte, hätte in der Cloud nie etwas gefunden.
 *
 * Das Verzeichnis wird jetzt genau einmal gelesen — von
 * `scripts/generate-product-media.mjs` im `prebuild`-Hook, der daraus
 * `product-media.generated.ts` schreibt. Die Regel bleibt dieselbe, nur der
 * Zeitpunkt ist ein anderer: Bauzeit statt Betrieb.
 */

/**
 * Öffentliche Pfade der echten Aufnahmen eines Produkts, alphabetisch.
 * Leeres Array = es liegt nichts vor, die Sektion versteckt sich.
 */
export function productScreens(slug: string): string[] {
  return [...(PRODUCT_SCREENS[slug] ?? [])]
}
