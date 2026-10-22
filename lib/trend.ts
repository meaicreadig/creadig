import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { neonAbfrage } from "@/lib/neon-abfrage"

/**
 * Der Verlauf des KI-Teams — Tag für Tag, aus den Rohtabellen.
 *
 * Bewusst NICHT aus `agent_noten` (Schnappschüsse der Qualitätsrunde): Die
 * gibt es erst ab dem ersten Lauf, ein Verlauf daraus wäre wochenlang leer.
 * Läufe, Freigaben und Veröffentlichungen stehen dagegen seit Wochen in der
 * Datenbank — der Verlauf ist also vom ersten Tag an echt.
 *
 * Freigabequote: freigegeben / (freigegeben + verworfen) im gleitenden
 * 7-Tage-Fenster, nach Entscheidungstag. `null`, wenn im Fenster nichts
 * entschieden wurde — keine erfundene 0 %.
 */

export type TrendTag = {
  tag: string
  laeufe: number
  fehler: number
  entwuerfe: number
  quote7: number | null
  webNote: number | null
  veroeffentlicht: number
}

export async function ladeTrend(tage = 14): Promise<TrendTag[]> {
  const aq = await assistentDb().catch(() => null)
  const q = neonAbfrage()
  if (!aq) return []

  const [arbeit, web, veroeffentlicht] = await Promise.all([
    aq(
      `WITH t AS (SELECT generate_series(current_date - ($1::int - 1), current_date, interval '1 day')::date AS tag)
       SELECT to_char(t.tag, 'YYYY-MM-DD') AS tag,
              (SELECT count(*) FROM assistent_laeufe l WHERE l.created_at::date = t.tag)::int AS laeufe,
              (SELECT count(*) FROM assistent_laeufe l WHERE l.created_at::date = t.tag AND l.fehler IS NOT NULL)::int AS fehler,
              (SELECT count(*) FROM assistent_freigaben f WHERE f.created_at::date = t.tag
                  AND f.agent IS NOT NULL AND f.art NOT IN ('aufgabe', 'notiz'))::int AS entwuerfe,
              (SELECT count(*) FROM assistent_freigaben f WHERE f.status = 'freigegeben' AND f.agent IS NOT NULL
                  AND f.art NOT IN ('aufgabe', 'notiz') AND f.erledigt_at::date BETWEEN t.tag - 6 AND t.tag)::int AS frei7,
              (SELECT count(*) FROM assistent_freigaben f WHERE f.status = 'verworfen' AND f.agent IS NOT NULL
                  AND f.art NOT IN ('aufgabe', 'notiz') AND f.erledigt_at::date BETWEEN t.tag - 6 AND t.tag)::int AS verw7
         FROM t ORDER BY t.tag`,
      [tage],
    ).catch(() => []),
    q
      ? q(
          `SELECT DISTINCT ON (erstellt_at::date) to_char(erstellt_at::date, 'YYYY-MM-DD') AS tag, gesamt
             FROM webseite_pruefungen WHERE erstellt_at > now() - make_interval(days => $1)
            ORDER BY erstellt_at::date, erstellt_at DESC`,
          [tage],
        ).catch(() => [])
      : [],
    q
      ? q(
          `SELECT to_char(veroeffentlicht_am, 'YYYY-MM-DD') AS tag, count(*)::int AS n FROM publications
            WHERE veroeffentlicht_am > current_date - $1::int AND coalesce(zustand, 'veroeffentlicht') = 'veroeffentlicht'
            GROUP BY 1`,
          [tage],
        ).catch(() => [])
      : [],
  ])

  const note = new Map(web.map((r) => [String(r.tag), Number(r.gesamt)]))
  const pub = new Map(veroeffentlicht.map((r) => [String(r.tag), Number(r.n)]))
  return arbeit.map((r) => {
    const frei = Number(r.frei7)
    const verw = Number(r.verw7)
    const tag = String(r.tag)
    return {
      tag,
      laeufe: Number(r.laeufe),
      fehler: Number(r.fehler),
      entwuerfe: Number(r.entwuerfe),
      quote7: frei + verw > 0 ? frei / (frei + verw) : null,
      webNote: note.get(tag) ?? null,
      veroeffentlicht: pub.get(tag) ?? 0,
    }
  })
}

/**
 * Textzeile für Mails: ▁▂▃▅▇ — eine Reihe Zahlen als Kurve, ohne Bild.
 * `bereich` für Größen mit fester Skala (Quote 0..1, Note 0..100): Sonst
 * sähe ein Rückgang von 75 auf 50 % aus wie ein Absturz auf null.
 */
export function sparkline(werte: (number | null)[], bereich?: [number, number]): string {
  const STUFEN = "▁▂▃▄▅▆▇█"
  const da = werte.filter((w): w is number => w !== null)
  if (!da.length) return ""
  const [min, max] = bereich ?? [Math.min(...da), Math.max(...da)]
  return werte
    .map((w) => (w === null ? "·" : STUFEN[max === min ? 3 : Math.round(((w - min) / (max - min)) * (STUFEN.length - 1))]))
    .join("")
}
