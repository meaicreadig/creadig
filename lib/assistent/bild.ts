import "server-only"

import { put } from "@vercel/blob"
import { generateImage } from "ai"

/**
 * Die Bildsprache von creaDIG — EIN Stil für LinkedIn und /insights.
 *
 * 23.10.2026: Bis hierher malte `gpt-image-1-mini` „Menschen bei der Arbeit".
 * Genau daran erkennt man KI-Bilder: glatte Gesichter, zu viele Finger,
 * Büros, die es nicht gibt. Deshalb keine Gesichter mehr, sondern Dinge und
 * Orte, die zum Thema gehören — Werkbank, Kasse, Klemmbrett, Bildschirm von
 * hinten —, fotografiert wie eine Reportage. Dazu ein Wiedererkennungszeichen:
 * genau ein kobaltblaues Objekt im Bild (CI #2F5BEA).
 *
 * Modell: FLUX.2 pro über das AI Gateway — dieselbe Klasse, die Higgsfield
 * anbietet, aber ohne zweites Konto im Betrieb. Fällt es aus, malt das alte
 * Modell, damit kein Beitrag ohne Bild in die Freigabe geht.
 */
export const BILDSTIL =
  "Documentary editorial photograph, shot on 35mm film, natural window light, muted warm-grey palette with exactly one cobalt blue (#2F5BEA) object as the only saturated colour, real textures and slight film grain, calm and precise composition with generous negative space, a real small business setting in Germany (workshop, café counter, office desk, construction site), objects and hands only — no faces, no posed people, no text, no letters, no numbers, no logos, no watermarks, no screens with readable content, no futuristic or glowing AI imagery, no robots."

const MODELLE = [
  { id: "bfl/flux-2-pro", format: { aspectRatio: "3:2" as const } },
  { id: "openai/gpt-image-1-mini", format: { size: "1536x1024" as const } },
]

/** Malt ein Bild zur Idee und legt es privat im Blob ab. Gibt den Pfad zurück, sonst null. */
export async function erzeugeBild(pfad: string, idee: string): Promise<string | null> {
  for (const m of MODELLE) {
    try {
      const { image } = await generateImage({ model: m.id, prompt: `${idee}. ${BILDSTIL}`, ...m.format })
      await put(pfad, Buffer.from(image.uint8Array), {
        access: "private",
        contentType: image.mediaType || "image/png",
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      return pfad
    } catch (e) {
      console.error(`[bild] ${m.id}`, e instanceof Error ? e.message : e)
    }
  }
  return null
}
