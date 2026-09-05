/**
 * Loest `@/…` fuer Skripte auf, die den echten Anwendungscode fahren.
 *
 * Node kann Typen inzwischen selbst entfernen; was ihm fehlt, ist der
 * Pfad-Alias aus `tsconfig.json`. Ohne ihn muesste ein Pruefskript den
 * Anwendungscode NACHBAUEN — und ein Nachbau prueft sich selbst, nicht die
 * Anwendung. Deshalb dieser Haken: dieselbe Datei, derselbe Code, dieselben
 * SQL-Zeilen wie in Produktion.
 *
 * Nur fuer Skripte. Die Anwendung selbst laeuft ueber Next und braucht ihn nie.
 */
import { registerHooks } from "node:module"
import { existsSync } from "node:fs"

const ROOT = new URL("../../", import.meta.url)

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context)
    const basis = new URL(specifier.slice(2), ROOT)
    for (const kandidat of [basis.href, `${basis.href}.ts`, `${basis.href}.tsx`, `${basis.href}/index.ts`]) {
      if (existsSync(new URL(kandidat))) return { url: kandidat, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})
