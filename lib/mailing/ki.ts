import "server-only"

import { generateText } from "ai"

import { firmengehirnText } from "@/lib/firmengehirn"
import type { KampagnenInhalt } from "@/lib/mailing/vorlage"

export type KampagnenAnlass = "einblick" | "angebot" | "fall" | "einladung"
export type KiKampagne = { inhalt: Omit<KampagnenInhalt, "ctaUrl"> } | { fehler: string }

const ANLASS: Record<KampagnenAnlass, string> = {
  einblick: "Ein fachlicher Einblick: ein Problem, das Inhaber kleiner Betriebe kennen, und wie man es sichtbar und lösbar macht.",
  angebot: "Ein konkretes Angebot von creaDIG (z. B. Betriebscheck). Nutzen zuerst, dann was genau passiert, dann der nächste Schritt.",
  fall: "Ein Praxisfall. Nur Fakten aus den Stichpunkten, keine erfundenen Zahlen oder Kundennamen.",
  einladung: "Eine Einladung zu einem kurzen Gespräch oder Termin. Ruhig, ohne Druck.",
}

const SYSTEM = `Du schreibst Newsletter-/Kampagnen-Mails für creaDIG im Namen von Muhammed Emin Akyol.
Grundlage ist ausschließlich das Firmengehirn und die Stichpunkte. Erfinde keine Zahlen, Preise, Kunden oder Zusagen.
Stil: Deutsch (außer die Stichpunkte verlangen Türkisch/Englisch), per Sie, ruhig, präzise, keine Werbesprache, keine Superlative, keine Emojis.
Keine Anrede und keine Grußformel schreiben – beides setzt die Vorlage selbst.
Inhalt: 120–220 Wörter. Kurze Absätze, getrennt durch Leerzeile. Optional EIN Zwischentitel mit "## " und EINE Liste mit Zeilen "- ".
Antwortformat exakt, jede Marke auf eigener Zeile:
BETREFF: <max. 60 Zeichen, konkret, keine Großbuchstaben-Wörter>
VORSCHAU: <Vorschautext im Postfach, max. 90 Zeichen, ergänzt den Betreff>
TITEL: <Überschrift in der Mail, max. 70 Zeichen>
KNOPF: <Text für den Handlungsknopf, 2–4 Wörter>
---
<Inhalt>`

export async function schreibeKampagne(anlass: KampagnenAnlass, stichpunkte: string): Promise<KiKampagne> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: `${SYSTEM}\n\nANLASS: ${ANLASS[anlass] ?? ANLASS.einblick}`,
      prompt: `FIRMENGEHIRN:\n${firmengehirnText()}\n\nSTICHPUNKTE VON MUHAMMED:\n${stichpunkte.slice(0, 2000)}`,
      maxOutputTokens: 3000,
    })
    const feld = (k: string) => text.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? ""
    const body = text.split(/\n-{3,}\n/)[1]?.trim() ?? ""
    const subject = feld("BETREFF")
    if (!subject || !body) return { fehler: "Entwurf unvollständig. Bitte erneut versuchen." }
    return {
      inhalt: {
        subject: subject.slice(0, 120),
        preheader: feld("VORSCHAU").slice(0, 160),
        headline: feld("TITEL").slice(0, 140),
        ctaText: feld("KNOPF").slice(0, 40),
        body: body.slice(0, 6000),
      },
    }
  } catch {
    return { fehler: "Entwurf konnte nicht erzeugt werden (KI nicht erreichbar)." }
  }
}
