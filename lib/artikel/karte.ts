import "server-only"

import { assistentDb, legeFreigabeAn, quelleBekannt } from "@/lib/assistent/store"

import { ladeArtikel, ladeArtikelListe } from "./store"

/**
 * Artikel-Entwürfe dorthin, wo Emin entscheidet (24.10.2026).
 *
 * Bis hierher lagen Entwürfe nur unter /admin/redaktion bzw. /admin/bulletin.
 * Dort sah sie niemand – zwei Entwürfe lagen tagelang, und weil „ein Entwurf
 * wartet schon“ jeden neuen Plan-Artikel sperrte, erschien seit August kein
 * einziger Fachartikel auf creadig.de. Jetzt wird jeder Entwurf eine Karte
 * im Assistenten: Freigeben = veröffentlichen (DE + TR, Sitemap, LinkedIn-
 * Begleitpost als eigene Karte), Verwerfen = Thema erledigt.
 *
 * Zweiter Weg: Emins eigene LinkedIn-Beiträge werden zu Fachartikeln auf der
 * Website – dieselbe Haltung, ausgebaut, mit Fokus-Keyword für Google.
 */

/** Karte „Artikel veröffentlichen“ – genau eine je Entwurf. */
export async function legeArtikelKarte(slug: string): Promise<string | null> {
  const quelle = `artikel-freigabe:${slug}`
  if (await quelleBekannt(quelle)) return null
  const a = await ladeArtikel(slug)
  if (!a || a.zustand !== "entwurf") return null
  const vonLinkedin = a.bulletinRef?.startsWith("li:")
  return legeFreigabeAn({
    art: "notiz",
    titel: `Artikel veröffentlichen: ${a.titel.de}`.slice(0, 160),
    inhalt: [
      a.teaser.de,
      "",
      a.keyword ? `Google-Stichwort: „${a.keyword}“` : null,
      `Abschnitte: ${a.body.filter((b) => b.kind === "heading").length} · Sprachen: Deutsch und Türkisch${a.bildPfad ? " · mit Titelbild" : ""}`,
      `Ganzen Text lesen: /admin/redaktion`,
      "",
      `Beim Freigeben erscheint der Artikel unter creadig.de/insights/${a.slug} (DE + TR) und in der Sitemap.${vonLinkedin ? "" : " Der LinkedIn-Begleitbeitrag kommt als eigene Karte."}`,
    ]
      .filter((z) => z !== null)
      .join("\n"),
    quelle,
    agent: "redaktion",
    extra: {
      artikelSlug: a.slug,
      fuerEmin: true,
      warum: vonLinkedin
        ? "Aus deinem LinkedIn-Beitrag ausgebaut – damit er auch über Google gefunden wird."
        : a.bulletinRef?.startsWith("plan:") || a.bulletinRef?.startsWith("gsc:")
          ? "Aus dem Redaktionsplan: ein Thema, nach dem Inhaber bei Google suchen, mit Verweis auf unser Angebot."
          : "Aus dem Bulletin: aktueller Anlass mit Einordnung für Betriebe.",
    },
  })
}

/** Nachholen: Entwürfe ohne Karte (z. B. vor dem 24.10. entstanden). */
export async function artikelKartenNachholen(): Promise<number> {
  let n = 0
  for (const a of await ladeArtikelListe("entwurf").catch(() => [])) if (await legeArtikelKarte(a.slug).catch(() => null)) n++
  return n
}

/**
 * Höchstens ein freigegebener LinkedIn-Beitrag je Lauf wird zum Website-Artikel.
 * Beiträge, die selbst aus einem Artikel stammen (quelle artikel:…), nicht.
 */
export async function linkedinZuArtikel(): Promise<string | null> {
  const q = await assistentDb()
  if (!q) return null
  const beitraege = (await q(
    `SELECT id, titel, inhalt FROM assistent_freigaben
      WHERE art = 'linkedin' AND status = 'freigegeben' AND coalesce(quelle, '') NOT LIKE 'artikel:%'
        AND created_at > now() - interval '90 days'
      ORDER BY created_at ASC`,
    [],
  )) as { id: string; titel: string; inhalt: string }[]
  const { bulletinRefBekannt } = await import("./store")
  for (const b of beitraege) {
    const ref = `li:${b.id}`
    if (await bulletinRefBekannt(ref)) continue
    const { entwerfe } = await import("./agent")
    const r = await entwerfe({
      anlass: `Grundlage ist ein eigener LinkedIn-Beitrag des Inhabers (bereits veröffentlicht). Übernimm seine Haltung und Kernaussage, baue sie zu einem gründlichen Fachartikel aus – nicht wörtlich kopieren, keine neuen Behauptungen oder Zahlen hinzufügen.
Titel des Beitrags: ${b.titel}
Text des Beitrags:
"""${b.inhalt.slice(0, 3000)}"""`,
      kategorie: "praxis",
      quelleName: "creaDIG Redaktion",
      quelleUrl: null,
      ref,
      ohneLinkedin: true,
    })
    return r.slug ? `LinkedIn-Beitrag „${b.titel.slice(0, 60)}“ als Artikel-Entwurf vorgelegt` : r.ergebnis
  }
  return null
}
