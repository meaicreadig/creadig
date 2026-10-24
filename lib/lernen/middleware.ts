import type { LanguageModelMiddleware } from "ai"

import { aktuellerKontext } from "./kontext"
import { lektionenText } from "./store"

/**
 * Das Firmengedächtnis in jedem Prompt (Katman 5, 24.10.2026).
 *
 * Hängt am Standard-Provider (instrumentation.ts) und damit an allen
 * generateText-Aufrufen mit Modell-String – ohne jede Datei einzeln
 * anzufassen. Nur innerhalb eines Agenten-, Chat- oder Motorlaufs (Kontext
 * gesetzt); öffentliche Wege der Website bekommen nichts Internes zu sehen.
 * Fehler hier brechen nie einen Aufruf: dann eben ohne Gedächtnis.
 */
export const gedaechtnisMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v4",
  transformParams: async ({ params }) => {
    const k = aktuellerKontext()
    if (!k?.agent || k.ohne) return params
    try {
      const text = await lektionenText(k.agent)
      if (!text) return params
      const [erste, ...rest] = params.prompt
      /* An die vorhandene Systemanweisung anhängen statt eine zweite davorzusetzen – manche Modelle wollen genau eine. */
      const prompt =
        erste?.role === "system"
          ? [{ ...erste, content: `${erste.content}\n\n${text}` }, ...rest]
          : [{ role: "system" as const, content: text }, ...params.prompt]
      return { ...params, prompt }
    } catch (e) {
      console.error("[lernen] middleware", e instanceof Error ? e.message : e)
      return params
    }
  },
}
