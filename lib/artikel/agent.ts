import "server-only"

import { generateText } from "ai"

import { insightCategoryKeys, type InsightCategoryKey } from "@/lib/insights"
import type { Meldung } from "@/lib/bulletin/store"

import { artikelOhneBild, bulletinRefBekannt, ladeArtikel, setzeBild, speichereEntwurf, type Artikel, type ArtikelBlock, type Zwei } from "./store"
import { erzeugeBild } from "@/lib/assistent/bild"
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
  /** Fokus-Keyword; ohne wählt der Autor selbst, wonach ein Inhaber suchen würde. */
  keyword?: string
  /** Suchanfragen aus der Search Console, für die creadig.de schon erscheint. */
  suchanfragen?: string[]
  /** Anlass war selbst ein LinkedIn-Beitrag – kein zweiter Begleitpost. */
  ohneLinkedin?: boolean
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

  const prompt = `Du schreibst für creadig.de, die Webseite von creaDIG Solutions.
${firmenText("voll")}

${a.anlass}

Schreibe einen EIGENEN Fachartikel mit Haltung (keine Nacherzählung, keine Kopie): Was bedeutet das konkret für Betriebe im deutschsprachigen Raum, was sollte ein Inhaber jetzt tun, wo liegen Grenzen. 700–1000 Wörter, klare Zwischenüberschriften, eine kurze Liste mit konkreten Schritten, ein Hinweis-Block ("note") mit der Quelle bzw. Rechtsgrundlage als Satz. Sachlich, selbstbewusst, ohne Werbefloskeln, ohne erfundene Zahlen, Fristen oder Kundenbeispiele — was du nicht sicher weißt, lässt du weg. Keine Rechtsberatung versprechen. Suchmaschinenstark: das Kernthema steht im Titel und im ersten Absatz.
SEO (Google):
- Fokus-Keyword: ${a.keyword ? `„${a.keyword}“` : "wähle selbst die Suchanfrage, die ein Inhaber dazu bei Google eintippen würde (2–4 Wörter)"}. Es steht natürlich formuliert im Titel, im metaTitel (vorn), im ersten Satz und in mindestens einer Zwischenüberschrift — nie gestopft.
- Zwischenüberschriften als echte Fragen, die Leute googeln. Vor dem Hinweis-Block ein Abschnitt „Häufige Fragen“ (heading) mit 2–3 kurzen Frage-Überschriften (heading) und je einer direkten Antwort in 2–3 Sätzen (text).
- metaBeschreibung: 140–155 Zeichen, mit Keyword, sagt was der Leser bekommt.
${a.suchanfragen?.length ? `- Diese Suchanfragen zeigt Google schon für creadig.de — greife passende davon wörtlich auf, unpassende lässt du weg: ${a.suchanfragen.join(" | ")}` : ""}
Alles auf Deutsch ("de") UND natürlichem Türkisch ("tr", keine Wort-für-Wort-Übersetzung).
Zusätzlich "linkedin": ein LinkedIn-Beitrag auf Deutsch (600–900 Zeichen, erster Satz als Haken, ohne Hashtag-Wand, max. 3 Hashtags am Ende), der neugierig auf den Artikel macht.

Antworte NUR mit JSON:
{"slug":"kurzer-deutscher-url-slug-mit-keyword","keyword":"","metaBeschreibung":{"de":"","tr":""},"topic":{"de":"Themenwort","tr":""},"titel":{"de":"","tr":""},"teaser":{"de":"2 Sätze","tr":""},"metaTitel":{"de":"max 60 Zeichen","tr":""},"body":[{"kind":"text","text":{"de":"","tr":""}},{"kind":"heading","text":{"de":"","tr":""}},{"kind":"list","items":{"de":["",""],"tr":["",""]}},{"kind":"note","text":{"de":"","tr":""}}],"linkedin":""}`
  /* 24.10.2026: Der zweisprachige JSON-Artikel brach ohne Token-Budget ab („nicht sauber geschrieben").
     Jetzt mit großem Budget und einem zweiten Versuch. */
  let j: Record<string, unknown> | null = null
  for (let versuch = 0; versuch < 2 && !(j && blocke(j.body).length >= 4); versuch++) {
    const { text } = await generateText({ model: AUTOR, prompt, maxOutputTokens: 16000 })
    const s = text.indexOf("{")
    const e = text.lastIndexOf("}")
    try {
      j = s >= 0 && e > s ? (JSON.parse(text.slice(s, e + 1)) as Record<string, unknown>) : null
    } catch {
      j = null
    }
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
    linkedin: !a.ohneLinkedin && typeof j.linkedin === "string" ? j.linkedin.trim() : "",
    keyword: typeof j.keyword === "string" && j.keyword.trim() ? j.keyword.trim() : (a.keyword ?? null),
    metaBeschreibung: zwei(j.metaBeschreibung),
    quelleName: a.quelleName,
    quelleUrl: a.quelleUrl,
    bulletinRef: a.ref,
  })
  const art = await ladeArtikel(slug)
  if (art) await ergaenzeBild(art).catch((e) => console.error("[artikel] bild", e instanceof Error ? e.message : e))
  /* 24.10.2026: Entwurf wird Karte im Assistenten – sonst liegt er ungesehen unter /admin/redaktion. */
  await (await import("./karte")).legeArtikelKarte(slug).catch((e) => console.error("[artikel] karte", e instanceof Error ? e.message : e))
  return { slug, ergebnis: `Artikel-Entwurf „${titel.de}“ als Karte im Assistenten vorgelegt` }
}

/**
 * Titelbild zum Artikel: erst eine Szene, die die Kernaussage zeigt (nicht
 * das Schlagwort — „KI" als leuchtendes Gehirn ist genau das Bild, das wir
 * nicht wollen), dann das Bild in der creaDIG-Bildsprache.
 */
export async function ergaenzeBild(art: Artikel): Promise<boolean> {
  if (art.bildPfad) return true
  const absatz = art.body.find((b) => b.kind === "text")
  const { text } = await generateText({
    model: "openai/gpt-5.4-mini",
    prompt: `Artikel: ${art.titel.de}
Anreißer: ${art.teaser.de}
${absatz && absatz.kind === "text" ? `Einstieg: ${absatz.text.de.slice(0, 600)}` : ""}

Beschreibe EIN Titelfoto dazu: eine konkrete, ruhige Szene aus dem Alltag eines kleinen Betriebs in Deutschland (Handwerk, Gastronomie, Büro, Verein), die die Kernaussage zeigt — mit Gegenständen, Händen oder einem Ort, ohne Gesichter, ohne Schrift, ohne Bildschirminhalte, ohne Roboter oder leuchtende KI-Symbole.
Antworte NUR mit JSON: {"idee":"one English sentence","alt":{"de":"1 Satz","tr":"1 cümle"}}`,
  })
  const j = (() => {
    try {
      return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as { idee?: string; alt?: unknown }
    } catch {
      return null
    }
  })()
  if (!j?.idee) return false
  const pfad = await erzeugeBild(`insights/${art.slug}.png`, j.idee)
  if (!pfad) return false
  await setzeBild(art.slug, pfad, zwei(j.alt) ?? art.titel)
  return true
}

/** Holt für ältere Artikel das Titelbild nach — höchstens `n` pro Lauf, Bilder kosten. */
export async function ergaenzeFehlendeBilder(n = 2): Promise<number> {
  let k = 0
  for (const a of await artikelOhneBild(n)) if (await ergaenzeBild(a).catch(() => false)) k++
  return k
}
