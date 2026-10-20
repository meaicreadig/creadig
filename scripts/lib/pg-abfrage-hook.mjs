/** Hängt `scripts/lib/pg-abfrage.mjs` an die Stelle von `@/lib/neon-abfrage` (nach alias-hook.mjs laden). */
import { registerHooks } from "node:module"

const ERSATZ = new URL("./pg-abfrage.mjs", import.meta.url).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/lib/neon-abfrage") return { url: ERSATZ, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})
