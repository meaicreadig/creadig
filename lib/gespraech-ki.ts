import { generateText } from "ai"
import { firmenText } from "@/lib/firmenwahrheit"

/**
 * Macht aus einer rohen Mitschrift (eingefügter Chat, Stichpunkte, beliebige
 * Sprache) eine professionelle Gesprächsnotiz in der Sprache der Oberfläche.
 * Ergebnis wird je Sprache in `activities.data.ki[sprache]` gespeichert.
 */

export type KiSprache = "de" | "tr"

export type Aufbereitung = {
  titel: string
  zusammenfassung: string
  punkte: string[]
  naechsterSchritt: string | null
}

const MODELL = "openai/gpt-5.4-mini"

const ANWEISUNG: Record<KiSprache, string> = {
  de: `Du bist Vertriebsassistent von creaDIG Solutions.
${firmenText("voll")}
Du bekommst eine ROHE Gesprächsmitschrift – oft eingefügte Chatnachrichten, Stichpunkte, Tippfehler, gemischte Sprachen (Deutsch/Türkisch).
Formuliere daraus eine professionelle, sachliche Gesprächsnotiz auf DEUTSCH.
Regeln:
- Nur Fakten aus der Mitschrift. Nichts erfinden, keine Zahlen/Preise/Termine dazudichten.
- Grußformeln, Smalltalk, Zeitstempel und Chat-Präfixe ("[19.10.26, 15:26] Name:") weglassen.
- Neutral in der dritten Person ("Herr Başer möchte …", "Wir haben zugesagt …"). "Wir" = creaDIG.
- titel: max. 80 Zeichen, worum es ging.
- zusammenfassung: 2–4 klare Sätze.
- punkte: 2–6 kurze Kernpunkte (Bedarf, Vereinbarungen, offene Fragen).
- naechsterSchritt: ein konkreter nächster Schritt, falls erkennbar, sonst null.
Antworte NUR mit JSON: {"titel":"","zusammenfassung":"","punkte":[""],"naechsterSchritt":null}`,
  tr: `creaDIG Solutions'ın (sahibi Muhammed Emin Akyol) satış asistanısın.
Sana HAM bir görüşme notu verilecek – çoğu zaman yapıştırılmış sohbet mesajları, notlar, yazım hataları, karışık dil (Türkçe/Almanca).
Bundan profesyonel, sade bir görüşme notu çıkar, TÜRKÇE yaz.
Kurallar:
- Sadece metindeki bilgiler. Hiçbir şey uydurma; rakam, fiyat, tarih ekleme.
- Selamlaşma, sohbet, zaman damgaları ve sohbet önekleri ("[19.10.26, 15:26] İsim:") çıkarılsın.
- Üçüncü şahıs, tarafsız ("Murat Bey … istiyor", "Biz … söz verdik"). "Biz" = creaDIG.
- titel: en fazla 80 karakter, konu.
- zusammenfassung: 2–4 net cümle.
- punkte: 2–6 kısa ana madde (ihtiyaç, anlaşmalar, açık sorular).
- naechsterSchritt: belliyse somut bir sonraki adım, değilse null.
SADECE JSON ile cevap ver: {"titel":"","zusammenfassung":"","punkte":[""],"naechsterSchritt":null}`,
}

function text(v: unknown, max: number): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null
}

export async function bereiteAuf(
  roh: string,
  sprache: KiSprache,
  kontext: { kontakt: string; firma: string | null },
): Promise<Aufbereitung | null> {
  const eingabe = roh.trim().slice(0, 12000)
  if (eingabe.length < 3) return null
  try {
    const { text: antwort } = await generateText({
      model: MODELL,
      system: ANWEISUNG[sprache],
      prompt: `Kontakt: ${kontext.kontakt}${kontext.firma ? ` (${kontext.firma})` : ""}\n\nMITSCHRIFT:\n${eingabe}`,
      maxOutputTokens: 1200,
      abortSignal: AbortSignal.timeout(25000),
    })
    const json = JSON.parse(antwort.slice(antwort.indexOf("{"), antwort.lastIndexOf("}") + 1)) as Record<string, unknown>
    const titel = text(json.titel, 100)
    const zusammenfassung = text(json.zusammenfassung, 900)
    if (!titel || !zusammenfassung) return null
    const punkte = (Array.isArray(json.punkte) ? json.punkte : [])
      .map((p) => text(p, 220))
      .filter((p): p is string => p !== null)
      .slice(0, 6)
    return { titel, zusammenfassung, punkte, naechsterSchritt: text(json.naechsterSchritt, 200) }
  } catch (e) {
    console.error("[gespraech-ki] Aufbereitung fehlgeschlagen:", (e as Error).message)
    return null
  }
}

export function leseAufbereitung(data: unknown, sprache: KiSprache): Aufbereitung | null {
  const ki = (data as { ki?: Record<string, unknown> } | null)?.ki
  const a = ki?.[sprache] as Partial<Aufbereitung> | undefined
  if (!a || typeof a.titel !== "string" || typeof a.zusammenfassung !== "string") return null
  return {
    titel: a.titel,
    zusammenfassung: a.zusammenfassung,
    punkte: Array.isArray(a.punkte) ? a.punkte.filter((p): p is string => typeof p === "string") : [],
    naechsterSchritt: typeof a.naechsterSchritt === "string" ? a.naechsterSchritt : null,
  }
}
