/**
 * Läuft einmal beim Start jeder Server-Instanz (Next.js).
 *
 * Katman 5: Der Standard-Provider des AI SDK bekommt das Firmengedächtnis als
 * Middleware – jeder generateText-Aufruf mit Modell-String (z. B.
 * "openai/gpt-5.4-mini") geht damit durch lib/lernen/middleware.ts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const [{ gateway, wrapProvider }, { gedaechtnisMiddleware }] = await Promise.all([import("ai"), import("@/lib/lernen/middleware")])
  globalThis.AI_SDK_DEFAULT_PROVIDER = wrapProvider({ provider: gateway, languageModelMiddleware: gedaechtnisMiddleware })
}
