"use server"

import { cookies } from "next/headers"
import { generateText } from "ai"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"

export type PostAnlass = "lieferung" | "einwand" | "beleg" | "build"
export type PostErgebnis = { text: string } | { fehler: string }

const ANLASS: Record<PostAnlass, string> = {
  lieferung: "Ein Projekt wurde ausgeliefert. Zeige, welches unsichtbare Problem jetzt gelöst ist.",
  einwand: "Ein typischer Kundeneinwand. Nimm ihn ernst und beantworte ihn ruhig und konkret.",
  beleg: "Ein belegbares Ergebnis. Nenne nur Zahlen, die in den Stichpunkten stehen.",
  build: "Eine Build Note: ein Blick hinter die Kulissen, wie ein System entsteht.",
}

const SYSTEM = `Du schreibst LinkedIn-Beiträge für creaDIG, ein System-Haus für digitale Betriebe aus Osnabrück (seit 2017).
Haltung: "Wir bauen, was andere nicht sehen" – das Unsichtbare im Betrieb sichtbar machen (Marke, Web, Betriebssoftware, Automation, KI/meAI).
Zielgruppe: Inhaber und Entscheider kleiner und mittlerer Betriebe im DACH-Raum.
Regeln:
- Deutsch, per Sie, ruhig, präzise, ohne Werbesprache und ohne Superlative.
- Erste Zeile ist ein konkreter Einstieg, der ohne "mehr anzeigen" trägt.
- Kurze Absätze, 120–220 Wörter, keine Emojis, höchstens 3 Hashtags am Ende.
- Erfinde keine Kunden, Zahlen oder Ergebnisse. Nutze nur, was in den Stichpunkten steht.
- Schluss mit einer offenen Frage oder einem leisen nächsten Schritt, kein "Jetzt anfragen!".
Gib nur den Beitragstext aus.`

export async function postEntwerfen(anlass: PostAnlass, stichpunkte: string): Promise<PostErgebnis> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/marketing")) {
    return { fehler: "Nicht berechtigt" }
  }
  const eingabe = stichpunkte.trim().slice(0, 2000)
  if (eingabe.length < 10 || !(anlass in ANLASS)) return { fehler: "Bitte ein paar Stichpunkte eingeben." }

  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM,
      prompt: `Anlass: ${ANLASS[anlass]}\n\nStichpunkte:\n${eingabe}`,
      maxOutputTokens: 900,
    })
    return { text: text.trim() }
  } catch {
    return { fehler: "Entwurf konnte nicht erzeugt werden. Bitte erneut versuchen." }
  }
}
