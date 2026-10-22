import "server-only"

import { neonAbfrage } from "@/lib/neon-abfrage"

/**
 * Was creaDIG veröffentlicht hat — als Ereignis für das Netz und als Wissen
 * für jeden Agenten.
 *
 * Bis 22.10.2026 ging eine Veröffentlichung ins Register und nirgends sonst
 * hin: Der LinkedIn-Agent kannte nur seine eigenen alten Titel, Vertrieb und
 * Kundenservice wussten nichts von einem neuen Artikel, den sie hätten
 * verlinken können. Jetzt gilt:
 *
 *   1. Jede Veröffentlichung (Website, LinkedIn, Instagram, von Hand) wird im
 *      Register erfasst — `recordPublication`/`markPublished` melden sie hier.
 *   2. `meldeInhalt` schreibt das Ereignis `inhalt_veroeffentlicht` in den
 *      Strom (motor/ereignis) — sichtbar für Karne, Netz und Folgeagenten.
 *   3. `inhalteText()` gibt jedem Agenten-Prompt die letzten Inhalte mit.
 *   4. Den LinkedIn-Beitrag zu einem neuen Artikel legt lib/artikel/veroeffentlichen.ts an
 *      (genau einen) — nicht dieses Ereignis, sonst gäbe es zwei Karten.
 */

export type Inhalt = { id: string; was: string; kanal: string; am: string; url: string | null }

/** Ereignis in den Strom — wirft nie, die Veröffentlichung selbst darf daran nicht scheitern. */
export async function meldeInhalt(i: Inhalt): Promise<void> {
  try {
    const { ereignis } = await import("@/lib/motor/ereignis")
    await ereignis(
      "inhalt_veroeffentlicht",
      { subjekt: `inhalt:${i.id}`, daten: { was: i.was, kanal: i.kanal, am: i.am, url: i.url }, schluessel: `inhalt:${i.id}` },
      { ohneTakt: true },
    )
  } catch (e) {
    console.error("[inhalte] melden", e instanceof Error ? e.message : e)
  }
}

/** Die zuletzt veröffentlichten Inhalte, neueste zuerst — aus dem Register, der einen Wahrheit. */
export async function aktuelleInhalte(tage = 60, limit = 12): Promise<Inhalt[]> {
  const q = neonAbfrage()
  if (!q) return []
  const rows = await q(
    `SELECT id, was, kanal, veroeffentlicht_am, url FROM publications
      WHERE veroeffentlicht_am IS NOT NULL AND veroeffentlicht_am >= current_date - $1::int
        AND coalesce(zustand, 'veroeffentlicht') = 'veroeffentlicht'
      ORDER BY veroeffentlicht_am DESC, created_at DESC LIMIT $2`,
    [tage, limit],
  ).catch(() => [])
  return rows.map((r) => ({
    id: String(r.id),
    was: String(r.was),
    kanal: String(r.kanal),
    am: new Date(String(r.veroeffentlicht_am)).toISOString().slice(0, 10),
    url: (r.url as string | null) ?? null,
  }))
}

/** Prompt-Baustein: was schon draußen ist — aufgreifen, verlinken, nicht doppelt schreiben. */
export async function inhalteText(tage = 60): Promise<string> {
  const liste = await aktuelleInhalte(tage).catch(() => [])
  if (!liste.length) return "BEREITS VERÖFFENTLICHT: in den letzten Wochen nichts."
  return [
    "BEREITS VERÖFFENTLICHT (darfst du aufgreifen und verlinken; nicht dasselbe Thema noch einmal schreiben):",
    ...liste.map((i) => `- ${i.am} · ${i.kanal} · ${i.was}${i.url ? ` · ${i.url}` : ""}`),
  ].join("\n")
}
