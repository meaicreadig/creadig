import "server-only"

import { generateText } from "ai"

/**
 * Optionaler KI-Vorschlag fuer einen hochgeladenen Beleg (Phase 2). Liest nur
 * aus — der Mensch bestaetigt immer, bevor etwas gespeichert wird (siehe
 * components/finanz/belege/upload.tsx). Ohne KI-Zugang geht es genauso,
 * nur ohne Vorausfuellung: derselbe Schalter-Gedanke wie beim Fibero-Abgleich
 * (fiberoKonfiguriert()) — ein fehlendes optionales Modul ist kein Fehler.
 */

const SYSTEM = `Du liest Belege (Kassenbons, Rechnungen, Quittungen) fuer die Finanzbuchhaltung
von creaDIG Solutions (Deutschland) aus einem Bild oder PDF.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, keine Erklaerung, kein Markdown, kein Codeblock:
{"datum":"YYYY-MM-DD"|null,"haendler":string|null,"bruttoCent":number|null,"ustSatz":0|7|19|null,"kategorie":string|null}

Regeln:
- datum: das Belegdatum (Kaufdatum), NICHT das heutige Datum.
- bruttoCent: der GESAMTBETRAG in Cent als ganze Zahl (23,50 € → 2350).
- ustSatz: der deutsche Satz 0, 7 oder 19 — aus dem Beleg erkennbar oder plausibel.
- kategorie: ein kurzes, allgemeines Wort (z. B. "Büro", "Reise", "Bewirtung", "Software", "Material").
- Erfinde nichts. Ist ein Feld nicht lesbar oder unsicher, setze es auf null.`

export type BelegVorschlag = {
  datum: string | null
  haendler: string | null
  bruttoCent: number | null
  ustSatz: 0 | 7 | 19 | null
  kategorie: string | null
}

/** true/false ohne zu verraten, ob es gerade funktioniert — nur, ob ueberhaupt ein Zugang konfiguriert sein koennte. */
export const belegKiBereit = () => Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)

export async function leseBelegAus(bytes: Buffer, mimeType: string): Promise<BelegVorschlag | null> {
  if (!belegKiBereit()) return null
  try {
    const istPdf = mimeType === "application/pdf"
    const { text } = await generateText({
      model: "openai/gpt-5.4-mini",
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Lies diesen Beleg aus und antworte nur mit dem JSON-Objekt." },
            istPdf ? { type: "file", data: bytes, mediaType: mimeType } : { type: "image", image: bytes },
          ],
        },
      ],
      maxOutputTokens: 400,
    })
    const anfang = text.indexOf("{")
    const ende = text.lastIndexOf("}")
    if (anfang === -1 || ende === -1) return null
    const json = JSON.parse(text.slice(anfang, ende + 1)) as Record<string, unknown>

    const satzZahl = Number(json.ustSatz)
    const satz = ([0, 7, 19] as const).includes(satzZahl as 0 | 7 | 19) ? (satzZahl as 0 | 7 | 19) : null
    const bruttoZahl = Math.round(Number(json.bruttoCent))
    return {
      datum: typeof json.datum === "string" && /^\d{4}-\d{2}-\d{2}$/.test(json.datum) ? json.datum : null,
      haendler: typeof json.haendler === "string" && json.haendler.trim() ? json.haendler.trim().slice(0, 160) : null,
      bruttoCent: Number.isFinite(bruttoZahl) && bruttoZahl > 0 ? bruttoZahl : null,
      ustSatz: satz,
      kategorie: typeof json.kategorie === "string" && json.kategorie.trim() ? json.kategorie.trim().slice(0, 60) : null,
    }
  } catch (e) {
    console.error("[beleg-ki]", e instanceof Error ? e.message : e)
    return null
  }
}
