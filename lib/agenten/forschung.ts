import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import type { Abfrage } from "@/lib/neon-abfrage"

import { FORSCHUNG_PROJEKTE, forschungszulageSchaetzung, type ForschungProjekt } from "./regeln"

export { FORSCHUNG_PROJEKTE, FORSCHUNG_SATZ, forschungszulageSchaetzung, type ForschungProjekt } from "./regeln"

/**
 * Ar-Ge saat kaydı — Stundennachweis für die Forschungszulage (FZulG).
 * Die BSFZ will sehen, WAS technisch unsicher war und WIE VIEL Zeit es
 * gekostet hat — zeitnah festgehalten, nicht im Nachhinein geschätzt.
 * Deshalb: ein Eintrag je Tag und Projekt, Tätigkeit + technische Unsicherheit.
 * Die Euro-Zahl ist eine SCHÄTZUNG (lib/agenten/regeln.ts), keine Steuerberatung.
 */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS forschung_stunden (
    id text PRIMARY KEY,
    tag date NOT NULL,
    projekt text NOT NULL CHECK (projekt IN ('fibero','stammo','meai','creadig-os','sonstiges')),
    stunden numeric(5,2) NOT NULL CHECK (stunden > 0 AND stunden <= 16),
    taetigkeit text NOT NULL,
    unsicherheit text,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS forschung_stunden_tag_idx ON forschung_stunden (tag DESC)`,
]

let bereit: Promise<void> | null = null
async function db(): Promise<Abfrage | null> {
  const q = await assistentDb()
  if (!q) return null
  if (!bereit) {
    bereit = (async () => {
      for (const ddl of SCHEMA) await q(ddl, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
  return q
}

export type StundenEintrag = { id: string; tag: string; projekt: ForschungProjekt; stunden: number; taetigkeit: string; unsicherheit: string | null }

export function istProjekt(v: unknown): v is ForschungProjekt {
  return typeof v === "string" && (FORSCHUNG_PROJEKTE as readonly string[]).includes(v)
}

export async function trageStundenEin(e: Omit<StundenEintrag, "id">): Promise<string> {
  const q = await db()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.tag)) throw new Error("Datum fehlt")
  if (!istProjekt(e.projekt)) throw new Error("Unbekanntes Projekt")
  if (!(e.stunden > 0 && e.stunden <= 16)) throw new Error("Stunden zwischen 0,25 und 16")
  if (e.taetigkeit.trim().length < 5) throw new Error("Tätigkeit beschreiben")
  const id = `fst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  await q(
    `INSERT INTO forschung_stunden (id, tag, projekt, stunden, taetigkeit, unsicherheit) VALUES ($1, $2::date, $3, $4, $5, $6)`,
    [id, e.tag, e.projekt, Math.round(e.stunden * 4) / 4, e.taetigkeit.trim().slice(0, 1000), e.unsicherheit?.trim().slice(0, 1000) || null],
  )
  return id
}

export async function ladeStunden(wochen = 8): Promise<StundenEintrag[]> {
  const q = await db()
  if (!q) return []
  const rows = (await q(
    `SELECT id, to_char(tag,'YYYY-MM-DD') AS tag, projekt, stunden::float AS stunden, taetigkeit, unsicherheit
       FROM forschung_stunden WHERE tag > current_date - make_interval(days => $1) ORDER BY tag DESC, created_at DESC`,
    [wochen * 7],
  )) as StundenEintrag[]
  return rows.map((r) => ({ ...r, stunden: Number(r.stunden) }))
}

/** Stunden der letzten 7 Tage. */
export async function wochenSumme(): Promise<number> {
  const q = await db()
  if (!q) return 0
  const rows = (await q(`SELECT coalesce(sum(stunden), 0)::float AS s FROM forschung_stunden WHERE tag > current_date - 7`, [])) as { s: number }[]
  return Number(rows[0]?.s ?? 0)
}

export type JahresZeile = { projekt: ForschungProjekt; stunden: number; schaetzungEur: number }

/** Stunden je Projekt im laufenden Jahr und die geschätzte Forschungszulage. */
export async function jahresUebersicht(jahr = new Date().getFullYear()): Promise<{ zeilen: JahresZeile[]; stunden: number; schaetzungEur: number }> {
  const q = await db()
  if (!q) return { zeilen: [], stunden: 0, schaetzungEur: 0 }
  const rows = (await q(
    `SELECT projekt, sum(stunden)::float AS stunden FROM forschung_stunden WHERE extract(year FROM tag) = $1 GROUP BY projekt ORDER BY 2 DESC`,
    [jahr],
  )) as { projekt: ForschungProjekt; stunden: number }[]
  const zeilen = rows.map((r) => ({ projekt: r.projekt, stunden: Number(r.stunden), schaetzungEur: forschungszulageSchaetzung(Number(r.stunden)) }))
  const stunden = zeilen.reduce((s, z) => s + z.stunden, 0)
  return { zeilen, stunden, schaetzungEur: forschungszulageSchaetzung(stunden) }
}

/** Wöchentlicher Lauf: erinnert über die Morgenmail, wenn die Woche ohne Nachweis blieb. */
export async function forschungsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const woche = await wochenSumme()
  if (woche === 0) return { ergebnis: "Keine Ar-Ge-Stunden diese Woche erfasst", anzahl: 0 }
  const jahr = await jahresUebersicht()
  return {
    ergebnis: `${woche.toLocaleString("de-DE")} Ar-Ge-Stunden diese Woche · ${jahr.stunden.toLocaleString("de-DE")} h im Jahr · Zulage geschätzt ${jahr.schaetzungEur.toLocaleString("de-DE")} €`,
    anzahl: Math.round(woche),
  }
}
