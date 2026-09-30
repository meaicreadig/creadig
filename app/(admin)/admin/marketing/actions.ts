"use server"

import { cookies } from "next/headers"
import { generateText } from "ai"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { neonAbfrage } from "@/lib/neon-abfrage"
import { KATALOG } from "@/lib/sichtbarkeit"
import { revalidatePath } from "next/cache"

export type PostAnlass = "lieferung" | "einwand" | "beleg" | "build"
export type Plattform = "person" | "firma" | "instagram" | "google"
export type PostErgebnis = { texte: Record<Plattform, string> } | { fehler: string }

const PLATTFORMEN: Plattform[] = ["person", "firma", "instagram", "google"]

const ANLASS: Record<PostAnlass, string> = {
  lieferung: "Ein Projekt wurde ausgeliefert. Zeige, welches unsichtbare Problem jetzt gelöst ist.",
  einwand: "Ein typischer Kundeneinwand. Nimm ihn ernst und beantworte ihn ruhig und konkret.",
  beleg: "Ein belegbares Ergebnis. Nenne nur Zahlen, die in den Stichpunkten stehen.",
  build: "Eine Build Note: ein Blick hinter die Kulissen, wie ein System entsteht.",
}

const SYSTEM = `Du schreibst Social-Media-Texte für creaDIG, ein System-Haus für digitale Betriebe aus Osnabrück (seit 2017).
Haltung: "Wir bauen, was andere nicht sehen" – das Unsichtbare im Betrieb sichtbar machen (Marke, Web, Betriebssoftware, Automation, KI/meAI).
Zielgruppe: Inhaber und Entscheider kleiner und mittlerer Betriebe in Deutschland, Österreich und der Schweiz.
Allgemein: Deutsch, per Sie, ruhig, präzise, keine Werbesprache, keine Superlative, keine Emojis.
Erfinde keine Kunden, Zahlen oder Ergebnisse. Nutze nur, was in den Stichpunkten steht.

Schreibe aus denselben Stichpunkten vier Fassungen, jede unter ihrer eigenen Markierungszeile:
### PERSON
LinkedIn, persönliches Profil des Gründers, Ich-Form. Erste Zeile trägt ohne "mehr anzeigen". Kurze Absätze, 120–220 Wörter, höchstens 3 Hashtags am Ende, Schluss mit offener Frage.
### FIRMA
LinkedIn-Unternehmensseite, Wir-Form, sachlicher. 80–150 Wörter, höchstens 3 Hashtags, leiser nächster Schritt.
### INSTAGRAM
Bildunterschrift. Starker erster Satz, 60–120 Wörter, kurze Zeilen. Danach eine Zeile "Slides:" mit 4 sehr kurzen Folientexten (je max. 8 Wörter, nummeriert). Am Ende 5–8 Hashtags inkl. #osnabrück.
### GOOGLE
Beitrag im Google-Unternehmensprofil. 50–90 Wörter, lokal (Osnabrück/Region), konkreter Nutzen, keine Hashtags.

Gib nur die vier Abschnitte mit den Markierungszeilen aus.`

function zerlegen(roh: string): Record<Plattform, string> | null {
  const teile = roh.split(/^###\s*(PERSON|FIRMA|INSTAGRAM|GOOGLE)\s*$/m)
  const texte = {} as Record<Plattform, string>
  for (let i = 1; i < teile.length; i += 2) {
    const schluessel = teile[i].toLowerCase() as Plattform
    texte[schluessel] = teile[i + 1]?.trim() ?? ""
  }
  return PLATTFORMEN.every((p) => texte[p]) ? texte : null
}

export async function sichtbarkeitUmschalten(formData: FormData): Promise<void> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/marketing")) return
  const key = String(formData.get("key") ?? "")
  if (!KATALOG.some((e) => e.key === key)) return
  const eingetragen = formData.get("eingetragen") === "1"
  const q = neonAbfrage()
  if (!q) return
  try {
    await q(
      `INSERT INTO visibility_listings (key, eingetragen, actor, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (key) DO UPDATE SET eingetragen = EXCLUDED.eingetragen, actor = EXCLUDED.actor, updated_at = now()`,
      [key, eingetragen, zugang.rolle],
    )
  } catch {
    return
  }
  revalidatePath("/admin/marketing")
}

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
      maxOutputTokens: 5000,
    })
    const texte = zerlegen(text)
    return texte ? { texte } : { fehler: "Entwurf unvollständig. Bitte erneut versuchen." }
  } catch {
    return { fehler: "Entwurf konnte nicht erzeugt werden. Bitte erneut versuchen." }
  }
}
