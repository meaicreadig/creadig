import "server-only"

import { generateText } from "ai"

/** Gemeinsames Werkzeug der KI-Abteilungen, die 23.10.2026 dazukamen. */
export const MODELL = "openai/gpt-5.4-mini"
export const RECHERCHE_MODELL = "perplexity/sonar"

export const berlinTag = (d = new Date()) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })

export function kw(d = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const jahr = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return `${t.getUTCFullYear()}-${Math.ceil(((t.getTime() - jahr.getTime()) / 86400000 + 1) / 7)}`
}

export function json<T>(text: string): T | null {
  const a = text.search(/[[{]/)
  const b = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"))
  if (a < 0 || b <= a) return null
  try {
    return JSON.parse(text.slice(a, b + 1)) as T
  } catch {
    return null
  }
}

/** Echte Recherche mit Quellen. Ohne einen einzigen Link ist es Modellwissen — dann null. */
export async function recherchiere(frage: string): Promise<string | null> {
  const { text } = await generateText({
    model: RECHERCHE_MODELL,
    prompt: `Stand: ${berlinTag()}. ${frage}
Antworte mit 3–6 konkreten, überprüfbaren Funden als Stichpunkte: was, für wen, Datum oder Frist, Quelle mit direkter URL. Nichts erfinden; lieber weniger Funde. Keine Einleitung.`,
  })
  const funde = text.trim()
  return /https?:\/\//.test(funde) ? funde.slice(0, 3500) : null
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
