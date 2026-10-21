import "server-only"

import { generateText } from "ai"

import {
  RESSORTS,
  ausgabeExistiert,
  istRessort,
  ladeAusgabe,
  speichereAusgabe,
  type Meldung,
  type RessortId,
  type Zweisprachig,
} from "./store"

const RECHERCHE = "perplexity/sonar"
const REDAKTION = "openai/gpt-5.4-mini"

const heute = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })

const FIRMA = `creaDIG Solutions (Einzelunternehmen in Niedersachsen, Inhaber Muhammed Emin Akyol). Eine KI-geführte Technologie-Firma: vertikale SaaS (fibero für Glasfaser-Montagefirmen, stammo digitale Wallet-Treuekarte für Gastronomie/Handel), Web- und Systementwicklung für Betriebe, eigenes KI-Betriebssystem mit Agenten, islamische Digitalangebote. Märkte: Deutschland/EU (Kunden), Türkei (Lieferkraft), Golfstaaten (Kapital, Partner).`

type Fund = { ressort: string; titel: string; fakten: string; quelle: string; url: string; datum?: string }

function json<T>(text: string, auf: "[" | "{"): T | null {
  const zu = auf === "[" ? "]" : "}"
  const start = text.indexOf(auf)
  const ende = text.lastIndexOf(zu)
  if (start < 0 || ende <= start) return null
  try {
    return JSON.parse(text.slice(start, ende + 1)) as T
  } catch {
    return null
  }
}

const zwei = (v: unknown): Zweisprachig | null => {
  const o = v as Partial<Zweisprachig> | null
  return o && typeof o.de === "string" && o.de.trim() ? { de: o.de.trim(), tr: (o.tr ?? o.de).trim() } : null
}

async function recherchiere(tag: string): Promise<Fund[]> {
  const ressorts = RESSORTS.map((r) => `${r.id} = ${r.de}`).join("; ")
  const { text } = await generateText({
    model: RECHERCHE,
    prompt: `Du bist Nachrichten-Rechercheur. Stand: ${tag}. Finde die wichtigsten ECHTEN Meldungen der letzten 7 Tage (weltweit) zu diesen Ressorts: ${ressorts}.
Beispiele, worauf es ankommt: neue KI-Modelle und Preise (OpenAI, Google, Anthropic, Meta, Mistral, xAI), KI-Agenten in Unternehmen, Automatisierung im Mittelstand, Änderungen bei Meta/Instagram/LinkedIn/Google-Suche/SEO, Chip-Produktion (TSMC, Nvidia, Intel Magdeburg, ASML, Exportkontrollen), humanoide Roboter und Industrierobotik, EU AI Act/DSGVO/Digitalpolitik, Tech-Investitionen in Deutschland, Türkei, VAE, Saudi-Arabien, Katar.
Je Ressort 2 Meldungen, insgesamt 12–14. Nur überprüfbare Meldungen mit direkter Artikel-URL einer seriösen Quelle. Nichts erfinden, im Zweifel weglassen.
Antworte NUR mit einem JSON-Array: [{"ressort":"ki|automation|medien|chips|robotik|recht|maerkte","titel":"","fakten":"2–3 Sätze nüchterne Fakten mit Zahlen","quelle":"Medienname","url":"https://…","datum":"YYYY-MM-DD"}]`,
  })
  return (json<Fund[]>(text, "[") ?? []).filter((f) => f?.titel && f?.url?.startsWith("http") && istRessort(f.ressort))
}

type Einordnung = {
  lage: Zweisprachig
  meldungen: { nr: number; titel: Zweisprachig; kurz: Zweisprachig; fuerUns: Zweisprachig; gewicht: number; artikel: Zweisprachig | null }[]
}

async function ordneEin(funde: Fund[]): Promise<Einordnung | null> {
  const liste = funde.map((f, i) => `#${i} [${f.ressort}] ${f.titel} — ${f.fakten} (${f.quelle})`).join("\n")
  const { text } = await generateText({
    model: REDAKTION,
    prompt: `Du bist Chefredakteur eines internen Lage-Bulletins für den Inhaber von ${FIRMA}
Unten stehen recherchierte Meldungen. Erfinde KEINE neuen Fakten, ordne nur ein.

Aufgabe:
1. "lage": 3–4 Sätze Leitartikel – was diese Woche in Tech/KI/Medien wirklich zählt und was der Inhaber daraus mitnehmen sollte. Klar, souverän, ohne Floskeln.
2. Für JEDE Meldung (#nr behalten): "titel" (prägnant, max. 12 Wörter), "kurz" (2 Sätze Fakten), "fuerUns" (1–2 Sätze: konkrete Bedeutung für creaDIG – Chance, Risiko oder Handlung; ehrlich "kaum Bezug", wenn es keinen gibt), "gewicht" (3 = Schwerpunkt, höchstens 3 Meldungen; 2 = wichtig; 1 = Randnotiz), "artikel" (nur wenn creaDIG daraus einen eigenen, suchmaschinenstarken Fachartikel mit eigener Haltung schreiben kann: Arbeitstitel; sonst null).
Alles jeweils auf Deutsch ("de") UND natürlichem Türkisch ("tr").

Meldungen:
${liste}

Antworte NUR mit JSON: {"lage":{"de":"","tr":""},"meldungen":[{"nr":0,"titel":{"de":"","tr":""},"kurz":{"de":"","tr":""},"fuerUns":{"de":"","tr":""},"gewicht":2,"artikel":{"de":"","tr":""}}]}`,
  })
  return json<Einordnung>(text, "{")
}

/** Erstellt die Ausgabe des Tages. Ohne `erzwingen` nur einmal pro Tag. */
export async function erstelleBulletin(opt: { erzwingen?: boolean } = {}): Promise<{ ergebnis: string; anzahl: number }> {
  const tag = heute()
  if (!opt.erzwingen && (await ausgabeExistiert(tag))) return { ergebnis: "Heutige Ausgabe liegt schon vor", anzahl: 0 }

  const funde = await recherchiere(tag)
  if (funde.length < 3) return { ergebnis: "Zu wenige belegte Meldungen gefunden – nächster Versuch beim nächsten Takt", anzahl: 0 }

  const e = await ordneEin(funde)
  const lage = zwei(e?.lage)
  if (!e || !lage) return { ergebnis: "Einordnung fehlgeschlagen – nächster Versuch beim nächsten Takt", anzahl: 0 }

  const meldungen: Meldung[] = []
  for (const m of e.meldungen ?? []) {
    const f = funde[m.nr]
    const titel = zwei(m.titel)
    if (!f || !titel) continue
    meldungen.push({
      nr: meldungen.length,
      ressort: f.ressort as RessortId,
      titel,
      kurz: zwei(m.kurz) ?? { de: f.fakten, tr: f.fakten },
      fuerUns: zwei(m.fuerUns) ?? { de: "—", tr: "—" },
      gewicht: m.gewicht === 3 ? 3 : m.gewicht === 1 ? 1 : 2,
      quelle: f.quelle || new URL(f.url).hostname,
      url: f.url,
      datum: /^\d{4}-\d{2}-\d{2}$/.test(f.datum ?? "") ? f.datum! : null,
      artikel: zwei(m.artikel),
    })
  }
  meldungen.sort((a, b) => b.gewicht - a.gewicht)

  await speichereAusgabe({ id: tag, lage, meldungen })
  const schwer = meldungen.filter((m) => m.gewicht === 3).length
  return { ergebnis: `Bulletin ${tag}: ${meldungen.length} Meldungen, ${schwer} Schwerpunkte`, anzahl: meldungen.length }
}

/** Kurzer Anlass-Stoff für die Redaktion: die Schwerpunkte der letzten Ausgabe. */
export async function bulletinStoff(): Promise<string> {
  const a = await ladeAusgabe().catch(() => null)
  if (!a) return "—"
  return a.meldungen
    .filter((m) => m.gewicht >= 2)
    .slice(0, 4)
    .map((m) => `${m.titel.de} (${m.quelle}) – für uns: ${m.fuerUns.de}`)
    .join(" || ")
}
