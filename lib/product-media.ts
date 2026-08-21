import { existsSync, readdirSync } from "node:fs"
import path from "node:path"

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
 * Kein Code-Eingriff nötig; der nächste Build nimmt sie auf.
 *
 * Die Prüfung läuft ausschließlich zur Bauzeit (Server-Komponente) — im
 * Browser wird nie ein Bild-Request für eine Datei gestellt, die es nicht
 * gibt, und damit steht auch kein 404 in der Konsole.
 */
const MEDIA_ROOT = ["public", "works", "products"]

/** Was ein Browser sicher darstellt — alles andere wird ignoriert. */
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"])

/**
 * Öffentliche Pfade der echten Aufnahmen eines Produkts, alphabetisch.
 * Leeres Array = es liegt nichts vor, die Sektion versteckt sich.
 */
export function productScreens(slug: string): string[] {
  const dir = path.join(process.cwd(), ...MEDIA_ROOT, slug)
  if (!existsSync(dir)) return []

  try {
    return readdirSync(dir)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort()
      .map((file) => `/${MEDIA_ROOT.slice(1).join("/")}/${slug}/${file}`)
  } catch {
    // Unlesbares Verzeichnis behandeln wir wie ein leeres: lieber nichts
    // zeigen als einen Build an einem Bild scheitern lassen.
    return []
  }
}
