/**
 * Loest Pfade auf, die Node nicht kennt, die Anwendung aber benutzt.
 *
 * Node kann Typen inzwischen selbst entfernen; was ihm fehlt, sind zwei
 * Dinge aus der Werkzeugkette von Next: der Pfad-Alias `@/…` aus
 * `tsconfig.json` und die Gewohnheit, Endungen wegzulassen
 * (`./product-media.generated`). Ohne beides muesste ein Pruefskript den
 * Anwendungscode NACHBAUEN — und ein Nachbau prueft sich selbst, nicht die
 * Anwendung. Deshalb dieser Haken: dieselbe Datei, derselbe Code, dieselben
 * SQL-Zeilen wie in Produktion.
 *
 * Nur fuer Skripte. Die Anwendung selbst laeuft ueber Next und braucht ihn nie.
 */
import { registerHooks } from "node:module"
import { existsSync } from "node:fs"

const ROOT = new URL("../../", import.meta.url)

/**
 * Dieselbe Reihenfolge, die Next benutzt: erst die Datei, wie sie dasteht,
 * dann `.ts`, `.tsx`, dann das Verzeichnis mit `index.ts`.
 *
 * Die Endung wird NICHT geraten. `./product-media.generated` sieht mit einer
 * Endungsheuristik aus, als haette es schon eine — deshalb wird hier nicht
 * gemustert, sondern nachgesehen, was existiert.
 */
const fund = (href) => {
  for (const kandidat of [href, `${href}.ts`, `${href}.tsx`, `${href}/index.ts`]) {
    if (existsSync(new URL(kandidat))) return kandidat
  }
  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const treffer = fund(new URL(specifier.slice(2), ROOT).href)
      if (treffer) return { url: treffer, shortCircuit: true }
      return nextResolve(specifier, context)
    }

    /*
     * Relative Angaben bekommen erst Nodes eigene Aufloesung. Erst wenn die
     * scheitert, wird nach einer Endung gesucht — so aendert dieser Haken
     * nichts an Pfaden, die ohne ihn schon funktionierten.
     */
    if (specifier.startsWith(".") && context.parentURL) {
      try {
        return nextResolve(specifier, context)
      } catch (fehler) {
        const treffer = fund(new URL(specifier, context.parentURL).href)
        if (treffer) return { url: treffer, shortCircuit: true }
        throw fehler
      }
    }

    return nextResolve(specifier, context)
  },
})
