import "server-only"

import { generateText } from "ai"

import { schreibeArtikel } from "@/lib/artikel/agent"

import {
  RESSORTS,
  ausgabeExistiert,
  beendeLauf,
  starteLauf,
  istRessort,
  ladeAusgabe,
  speichereAusgabe,
  type Meldung,
  type RessortId,
  type Zweisprachig,
} from "./store"
import { firmenText } from "@/lib/firmenwahrheit"

const RECHERCHE = "perplexity/sonar"
const REDAKTION = "openai/gpt-5.4-mini"

const heute = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })

/** Quelle: lib/firmenwahrheit.ts */
const FIRMA = firmenText("voll")

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
Je Ressort 1–2 Meldungen, insgesamt 10–12. Nur überprüfbare Meldungen mit direkter Artikel-URL einer seriösen Quelle. Nichts erfinden, im Zweifel weglassen.
Antworte NUR mit einem JSON-Array: [{"ressort":"ki|automation|medien|chips|robotik|recht|maerkte","titel":"","fakten":"2–3 Sätze nüchterne Fakten mit Zahlen","quelle":"Medienname","url":"https://…","datum":"YYYY-MM-DD"}]`,
  })
  return (json<Fund[]>(text, "[") ?? []).filter((f) => f?.titel && f?.url?.startsWith("http") && istRessort(f.ressort))
}

type Einordnung = {
  lage: Zweisprachig
  meldungen: { nr: number; titel: Zweisprachig; kurz: Zweisprachig; fuerUns: Zweisprachig; gewicht: number; artikel: Zweisprachig | null }[]
}

const zeileVon = (f: Fund, i: number) => `#${i} [${f.ressort}] ${f.titel} — ${f.fakten} (${f.quelle})`

async function lageText(funde: Fund[]): Promise<Zweisprachig | null> {
  const { text } = await generateText({
    model: REDAKTION,
    prompt: `Du bist Chefredakteur eines internen Lage-Bulletins für den Inhaber von ${FIRMA}
Schreibe aus diesen recherchierten Meldungen 3–4 Sätze Leitartikel: was diese Woche in Tech/KI/Medien wirklich zählt und was der Inhaber daraus mitnehmen sollte. Klar, souverän, ohne Floskeln, keine neuen Fakten.
${funde.map(zeileVon).join("\n")}
Antworte NUR mit JSON: {"de":"","tr":""} (tr = natürliches Türkisch).`,
  })
  return zwei(json(text, "{"))
}

async function ordnePaket(funde: Fund[], start: number): Promise<Einordnung["meldungen"]> {
  const { text } = await generateText({
    model: REDAKTION,
    prompt: `Du ordnest Meldungen für den Inhaber von ${FIRMA} ein. Erfinde KEINE neuen Fakten.
Für JEDE Meldung (#nr behalten): "titel" (prägnant, max. 12 Wörter), "kurz" (2 Sätze Fakten), "fuerUns" (1–2 Sätze: konkrete Bedeutung für creaDIG – Chance, Risiko oder Handlung; ehrlich "kaum Bezug", wenn es keinen gibt), "gewicht" (3 = Schwerpunkt, höchstens 1 in dieser Liste; 2 = wichtig; 1 = Randnotiz), "artikel" (nur wenn creaDIG daraus einen eigenen, suchmaschinenstarken Fachartikel mit Haltung schreiben kann: Arbeitstitel; sonst null).
Alles auf Deutsch ("de") UND natürlichem Türkisch ("tr").
${funde.map((f, i) => zeileVon(f, start + i)).join("\n")}
Antworte NUR mit JSON: {"meldungen":[{"nr":0,"titel":{"de":"","tr":""},"kurz":{"de":"","tr":""},"fuerUns":{"de":"","tr":""},"gewicht":2,"artikel":{"de":"","tr":""}}]}`,
  })
  return json<{ meldungen: Einordnung["meldungen"] }>(text, "{")?.meldungen ?? []
}

/** Parallel in kleinen Paketen – ein einziger großer Aufruf lief über das Zeitlimit. */
async function ordneEin(funde: Fund[]): Promise<Einordnung | null> {
  const pakete: Promise<Einordnung["meldungen"]>[] = []
  for (let i = 0; i < funde.length; i += 4) pakete.push(ordnePaket(funde.slice(i, i + 4), i).catch(() => []))
  const [lage, ...teile] = await Promise.all([lageText(funde).catch(() => null), ...pakete])
  if (!lage) return null
  return { lage, meldungen: teile.flat() }
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

  /* Erkennen heißt handeln: aus der Lage werden sofort Aufträge an die zuständigen Abteilungen. */
  const verteilt = await verteileLage(tag, lage.de, meldungen).catch((e) => {
    console.error("[bulletin] verteilen", e instanceof Error ? e.message : e)
    return 0
  })

  /* Die Redaktion wartet nicht auf einen Klick: die stärkste Artikelidee wird sofort als Entwurf geschrieben. */
  let artikel = ""
  const top = meldungen.find((m) => m.artikel && m.gewicht === 3) ?? meldungen.find((m) => m.artikel)
  if (top) {
    artikel = await schreibeArtikel(top, tag)
      .then((r) => ` · ${r.ergebnis}`)
      .catch(() => "")
  }
  return {
    ergebnis: `Bulletin ${tag}: ${meldungen.length} Meldungen, ${schwer} Schwerpunkte${verteilt ? `, ${verteilt} Aufträge an Abteilungen` : ""}${artikel}`,
    anzahl: meldungen.length,
  }
}

async function verteileLage(tag: string, lage: string, meldungen: Meldung[]): Promise<number> {
  const { ABTEILUNGEN } = await import("@/lib/zentrale/abteilungen")
  const { legeAuftragAn } = await import("@/lib/koordination/koordinator")
  const ids = new Set(ABTEILUNGEN.map((a) => a.id))
  const { text } = await generateText({
    model: "openai/gpt-5.4-mini",
    prompt: `Du bist der Chief of Staff von creaDIG Solutions.
${FIRMA}
Aus der heutigen Marktlage leitest du bis zu 3 KONKRETE interne Aufträge ab, die creaDIG nach vorne bringen. Jeder Auftrag geht an genau eine Abteilung, die ihn selbst bearbeiten kann (Analyse, Entwurf, Konzept, Positionierung). Nichts, was Geld kostet oder nach außen geht.
Abteilungen: ${ABTEILUNGEN.map((a) => `${a.id} (${a.name.de})`).join(", ")}

LAGE: ${lage}
MELDUNGEN:
${meldungen.slice(0, 6).map((m) => `- ${m.titel.de} – für uns: ${m.fuerUns.de}`).join("\n")}

Antworte NUR mit JSON: {"auftraege":[{"an":"<id>","titel":"max 12 Wörter","inhalt":"was genau zu tun ist, 2-3 Sätze, mit Bezug zur Meldung"}]}`,
    maxOutputTokens: 900,
  })
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)
  const p = JSON.parse(json || "{}") as { auftraege?: { an?: string; titel?: string; inhalt?: string }[] }
  let n = 0
  for (const [i, a] of (p.auftraege ?? []).slice(0, 3).entries()) {
    if (!a.an || !ids.has(a.an) || !a.titel || !a.inhalt) continue
    const id = await legeAuftragAn({
      von: "unternehmenskommunikation",
      an: a.an,
      titel: a.titel.slice(0, 160),
      inhalt: `${a.inhalt}\n\nAnlass: Bulletin vom ${tag}.`,
      quelle: `bulletin:${tag}:${i}`,
    }).catch(() => null)
    if (id) n++
  }
  return n
}

/** Startet die Ausgabe im Hintergrund und merkt sich den Lauf, damit die Seite den Fortschritt zeigt. */
export async function bulletinImHintergrund(): Promise<void> {
  await starteLauf()
  try {
    const r = await erstelleBulletin({ erzwingen: true })
    await beendeLauf(r.ergebnis, r.anzahl > 0)
  } catch {
    await beendeLauf("Recherche gerade nicht erreichbar – bitte später erneut", false).catch(() => undefined)
  }
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
