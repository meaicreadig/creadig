import "server-only"

import { generateText } from "ai"

import { insightCategoryKeys, type InsightCategoryKey } from "@/lib/insights"
import type { Meldung } from "@/lib/bulletin/store"

import { bulletinRefBekannt, speichereEntwurf, type ArtikelBlock, type Zwei } from "./store"
import { firmenText } from "@/lib/firmenwahrheit"

const AUTOR = "openai/gpt-5.4"

const KATEGORIE: Record<string, InsightCategoryKey> = {
  ki: "ai",
  automation: "automation",
  medien: "praxis",
  chips: "systems",
  robotik: "automation",
  recht: "betrieb",
  maerkte: "betrieb",
}

const zwei = (v: unknown): Zwei | null => {
  const o = v as Partial<Zwei> | null
  return o && typeof o.de === "string" && o.de.trim() ? { de: o.de.trim(), tr: (o.tr || o.de).trim() } : null
}

const slugVon = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)

function blocke(roh: unknown): ArtikelBlock[] {
  if (!Array.isArray(roh)) return []
  const out: ArtikelBlock[] = []
  for (const b of roh as Record<string, unknown>[]) {
    if (b?.kind === "list") {
      const i = b.items as { de?: unknown; tr?: unknown } | undefined
      const de = Array.isArray(i?.de) ? (i!.de as unknown[]).map(String).filter(Boolean) : []
      if (de.length === 0) continue
      const tr = Array.isArray(i?.tr) && (i!.tr as unknown[]).length === de.length ? (i!.tr as unknown[]).map(String) : de
      out.push({ kind: "list", items: { de, tr } })
    } else if (b?.kind === "heading" || b?.kind === "text" || b?.kind === "note") {
      const text = zwei(b.text)
      if (text) out.push({ kind: b.kind, text })
    }
  }
  return out
}

type Anlass = {
  /** Was der Artikel behandelt — wörtlich in den Prompt. */
  anlass: string
  kategorie: InsightCategoryKey
  quelleName: string | null
  quelleUrl: string | null
  /** Eindeutig je Anlass (Bulletin-Meldung oder Planthema) — verhindert Doppelentwürfe. */
  ref: string
}

/**
 * Schreibt aus einer Bulletin-Meldung einen eigenen Fachartikel für creadig.de.
 * Ergebnis ist immer ein ENTWURF – öffentlich wird er erst, wenn Emin freigibt.
 */
export async function schreibeArtikel(m: Meldung, ausgabeId: string): Promise<{ slug: string | null; ergebnis: string }> {
  const kategorie = KATEGORIE[m.ressort] ?? "ai"
  return entwerfe({
    anlass: `Anlass (echte Meldung, nicht verändern, nichts dazuerfinden):
Titel: ${m.titel.de}
Fakten: ${m.kurz.de}
Bedeutung für uns: ${m.fuerUns.de}
Quelle: ${m.quelle} (${m.url})
Arbeitstitel: ${m.artikel?.de ?? m.titel.de}`,
    kategorie: insightCategoryKeys.includes(kategorie) ? kategorie : "ai",
    quelleName: m.quelle,
    quelleUrl: m.url,
    ref: `${ausgabeId}:${m.nr}`,
  })
}

/** Gemeinsamer Kern: Anlass → zweisprachiger Entwurf in `web_artikel`. */
export async function entwerfe(a: Anlass): Promise<{ slug: string | null; ergebnis: string }> {
  if (await bulletinRefBekannt(a.ref)) return { slug: null, ergebnis: "Artikel zu diesem Anlass liegt schon vor" }

  const { text } = await generateText({
    model: AUTOR,
    prompt: `Du schreibst für creadig.de, die Webseite von creaDIG Solutions.
${firmenText("voll")}

${a.anlass}

Schreibe einen EIGENEN Fachartikel mit Haltung (keine Nacherzählung, keine Kopie): Was bedeutet das konkret für Betriebe im deutschsprachigen Raum, was sollte ein Inhaber jetzt tun, wo liegen Grenzen. 700–1000 Wörter, klare Zwischenüberschriften, eine kurze Liste mit konkreten Schritten, ein Hinweis-Block ("note") mit der Quelle bzw. Rechtsgrundlage als Satz. Sachlich, selbstbewusst, ohne Werbefloskeln, ohne erfundene Zahlen, Fristen oder Kundenbeispiele — was du nicht sicher weißt, lässt du weg. Keine Rechtsberatung versprechen. Suchmaschinenstark: das Kernthema steht im Titel und im ersten Absatz.
Alles auf Deutsch ("de") UND natürlichem Türkisch ("tr", keine Wort-für-Wort-Übersetzung).
Zusätzlich "linkedin": ein LinkedIn-Beitrag auf Deutsch (600–900 Zeichen, erster Satz als Haken, ohne Hashtag-Wand, max. 3 Hashtags am Ende), der neugierig auf den Artikel macht.

Antworte NUR mit JSON:
{"slug":"kurzer-deutscher-url-slug","topic":{"de":"Themenwort","tr":""},"titel":{"de":"","tr":""},"teaser":{"de":"2 Sätze","tr":""},"metaTitel":{"de":"max 60 Zeichen","tr":""},"body":[{"kind":"text","text":{"de":"","tr":""}},{"kind":"heading","text":{"de":"","tr":""}},{"kind":"list","items":{"de":["",""],"tr":["",""]}},{"kind":"note","text":{"de":"","tr":""}}],"linkedin":""}`,
  })

  const s = text.indexOf("{")
  const e = text.lastIndexOf("}")
  let j: Record<string, unknown> | null = null
  try {
    j = s >= 0 && e > s ? (JSON.parse(text.slice(s, e + 1)) as Record<string, unknown>) : null
  } catch {
    j = null
  }
  const titel = zwei(j?.titel)
  const teaser = zwei(j?.teaser)
  const body = blocke(j?.body)
  if (!j || !titel || !teaser || body.length < 4) return { slug: null, ergebnis: "Artikel konnte nicht sauber geschrieben werden" }

  const slug = await speichereEntwurf({
    slug: slugVon(String(j.slug || titel.de)) || `artikel-${Date.now()}`,
    kategorie: a.kategorie,
    topic: zwei(j.topic) ?? { de: "KI", tr: "Yapay zekâ" },
    titel,
    teaser,
    metaTitel: zwei(j.metaTitel) ?? titel,
    body,
    linkedin: typeof j.linkedin === "string" ? j.linkedin.trim() : "",
    quelleName: a.quelleName,
    quelleUrl: a.quelleUrl,
    bulletinRef: a.ref,
  })
  return { slug, ergebnis: `Artikel-Entwurf „${titel.de}“ bereit` }
}
