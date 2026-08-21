import type { Localized } from "@/lib/site-data"

/**
 * System-Notes (PHASE A — Gerüst).
 *
 * ---------------------------------------------------------------------------
 * WAS DAS IST
 * Kein Blog im Marketing-Sinn. Notizen aus dem Bau: warum eine Entscheidung so
 * und nicht anders gefallen ist, was ein System im Betrieb gelehrt hat, welche
 * Annahme sich als falsch herausgestellt hat. Für ein Haus, das eigene
 * Produkte baut, ist das der einzige Inhaltstyp, der wirklich belegt ist —
 * alles andere wäre nacherzähltes Branchenwissen.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE LISTE LEER IST — UND BLEIBT, BIS ES ETWAS GIBT
 * Ein Insights-Bereich mit drei erfundenen Beispielartikeln wäre in zehn
 * Minuten gebaut. Er wäre auch das Erste, was ein Interessent als Fassade
 * erkennt. Die Struktur steht hier, der Inhalt kommt vom Owner — und bis
 * dahin sagt die Seite genau das, statt es zu verstecken.
 *
 * Solange nichts veröffentlicht ist, nimmt sich die Route zusätzlich aus dem
 * Suchindex (`noindex, follow`) und aus der Sitemap. Eine leere Seite in den
 * Index zu schieben ist dünner Inhalt und schadet der ganzen Domain.
 *
 * ---------------------------------------------------------------------------
 * SO KOMMT EIN EINTRAG DAZU
 *   {
 *     slug: "warum-wir-kassensysteme-nicht-kaufen",
 *     date: "2026-09-01",
 *     topic: { de: "Operations", tr: "Operasyon" },
 *     title: { de: "…", tr: "…" },
 *     teaser: { de: "…", tr: "…" },
 *     published: true,
 *   }
 * Beide Sprachen sind Pflicht — ein halb übersetzter Eintrag kommt gar nicht
 * erst ins Repo, dafür sorgt der Typ.
 */
export type Insight = {
  slug: string
  /** Veröffentlichungsdatum, ISO (YYYY-MM-DD). Bestimmt die Reihenfolge. */
  date: string
  /** Einordnung in zwei bis drei Worten. */
  topic: Localized
  title: Localized
  /** Zwei bis drei Sätze — was drinsteht, nicht was drinstehen könnte. */
  teaser: Localized
  /** Auf `false` verschwindet der Eintrag aus Liste UND Sitemap. */
  published: boolean
}

/** LEER, und das ist der ehrliche Zustand. TODO (Owner): erste Notiz. */
export const insights: Insight[] = []

/** Nur Veröffentlichtes verlässt die Datei — neueste zuerst. */
export const publishedInsights = insights
  .filter((entry) => entry.published)
  .sort((a, b) => b.date.localeCompare(a.date))
