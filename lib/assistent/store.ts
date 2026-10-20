import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

/** Legt sich selbst an (additiv), weil die Produktions-DATABASE_URL "Sensitive" ist. */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS assistent_nachrichten (
    id text PRIMARY KEY,
    rolle text NOT NULL CHECK (rolle IN ('user','assistant')),
    text text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS assistent_nachrichten_zeit_idx ON assistent_nachrichten (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS assistent_freigaben (
    id text PRIMARY KEY,
    art text NOT NULL CHECK (art IN ('mail','aufgabe','termin','linkedin','kapital','notiz')),
    titel text NOT NULL,
    inhalt text NOT NULL DEFAULT '',
    empfaenger text,
    betreff text,
    status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','freigegeben','verworfen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    erledigt_at timestamptz)`,
  `CREATE INDEX IF NOT EXISTS assistent_freigaben_offen_idx ON assistent_freigaben (created_at DESC) WHERE status = 'offen'`,
  `ALTER TABLE assistent_freigaben ADD COLUMN IF NOT EXISTS quelle text`,
  `ALTER TABLE assistent_freigaben ADD COLUMN IF NOT EXISTS agent text`,
  `CREATE INDEX IF NOT EXISTS assistent_freigaben_quelle_idx ON assistent_freigaben (quelle)`,
  `CREATE TABLE IF NOT EXISTS assistent_laeufe (
    id text PRIMARY KEY,
    agent text NOT NULL,
    ergebnis text NOT NULL DEFAULT '',
    anzahl int NOT NULL DEFAULT 0,
    fehler text,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS assistent_laeufe_agent_idx ON assistent_laeufe (agent, created_at DESC)`,
]

export const FREIGABE_ARTEN = ["mail", "aufgabe", "termin", "linkedin", "kapital", "notiz"] as const
export type FreigabeArt = (typeof FREIGABE_ARTEN)[number]

export type Nachricht = { id: string; rolle: "user" | "assistant"; text: string; zeit: string }
export type Freigabe = {
  id: string
  art: FreigabeArt
  titel: string
  inhalt: string
  empfaenger: string | null
  betreff: string | null
  status: "offen" | "freigegeben" | "verworfen"
  agent: string | null
  zeit: string
}

export type Lauf = { agent: string; ergebnis: string; anzahl: number; fehler: string | null; zeit: string }

/** Schutz gegen Kreditverbrauch: so viele Fragen pro Tag. */
export const TAGESLIMIT = 60

let bereit: Promise<void> | null = null

export async function assistentDb(): Promise<Abfrage | null> {
  const q = neonAbfrage()
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

const neueId = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export async function ladeVerlauf(limit = 40): Promise<Nachricht[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT id, rolle, text, created_at FROM assistent_nachrichten ORDER BY created_at DESC LIMIT $1`,
    [limit],
  )) as { id: string; rolle: "user" | "assistant"; text: string; created_at: string | Date }[]
  return rows
    .reverse()
    .map((r) => ({ id: r.id, rolle: r.rolle, text: r.text, zeit: new Date(r.created_at).toISOString() }))
}

export async function speichereNachricht(rolle: "user" | "assistant", text: string): Promise<Nachricht> {
  const q = await assistentDb()
  const id = neueId("msg")
  if (q) await q(`INSERT INTO assistent_nachrichten (id, rolle, text) VALUES ($1, $2, $3)`, [id, rolle, text])
  return { id, rolle, text, zeit: new Date().toISOString() }
}

export async function fragenHeute(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(
    `SELECT count(*)::int AS n FROM assistent_nachrichten
     WHERE rolle = 'user' AND created_at >= date_trunc('day', now() AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'Europe/Berlin'`,
    [],
  )) as { n: number }[]
  return rows[0]?.n ?? 0
}

export async function legeFreigabeAn(f: {
  art: FreigabeArt
  titel: string
  inhalt: string
  empfaenger?: string | null
  betreff?: string | null
  /** Stabiler Schlüssel – dieselbe Quelle wird nie zweimal vorgeschlagen. */
  quelle?: string | null
  agent?: string | null
}): Promise<string | null> {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  if (f.quelle && (await quelleBekannt(f.quelle))) return null
  const id = neueId("frg")
  await q(
    `INSERT INTO assistent_freigaben (id, art, titel, inhalt, empfaenger, betreff, quelle, agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      f.art,
      f.titel.slice(0, 160),
      f.inhalt.slice(0, 6000),
      f.empfaenger ?? null,
      f.betreff?.slice(0, 200) ?? null,
      f.quelle ?? null,
      f.agent ?? null,
    ],
  )
  return id
}

export async function quelleBekannt(quelle: string): Promise<boolean> {
  const q = await assistentDb()
  if (!q) return true
  const rows = (await q(`SELECT 1 FROM assistent_freigaben WHERE quelle = $1 LIMIT 1`, [quelle])) as unknown[]
  return rows.length > 0
}

export async function protokolliereLauf(l: { agent: string; ergebnis: string; anzahl: number; fehler?: string | null }) {
  const q = await assistentDb()
  if (!q) return
  await q(`INSERT INTO assistent_laeufe (id, agent, ergebnis, anzahl, fehler) VALUES ($1, $2, $3, $4, $5)`, [
    neueId("lauf"),
    l.agent,
    l.ergebnis.slice(0, 300),
    l.anzahl,
    l.fehler?.slice(0, 300) ?? null,
  ])
}

/** Letzter Lauf je Agent. */
export async function letzteLaeufe(): Promise<Record<string, Lauf>> {
  const q = await assistentDb()
  if (!q) return {}
  const rows = (await q(
    `SELECT DISTINCT ON (agent) agent, ergebnis, anzahl, fehler, created_at FROM assistent_laeufe ORDER BY agent, created_at DESC`,
    [],
  )) as { agent: string; ergebnis: string; anzahl: number; fehler: string | null; created_at: string | Date }[]
  return Object.fromEntries(
    rows.map((r) => [r.agent, { agent: r.agent, ergebnis: r.ergebnis, anzahl: r.anzahl, fehler: r.fehler, zeit: new Date(r.created_at).toISOString() }]),
  )
}

export async function ladeFreigaben(): Promise<Freigabe[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT id, art, titel, inhalt, empfaenger, betreff, status, agent, created_at FROM assistent_freigaben
     WHERE status = 'offen' OR erledigt_at > now() - interval '3 days'
     ORDER BY (status = 'offen') DESC, created_at DESC LIMIT 50`,
    [],
  )) as (Omit<Freigabe, "zeit"> & { created_at: string | Date })[]
  return rows.map(({ created_at, ...r }) => ({ ...r, zeit: new Date(created_at).toISOString() }))
}

export async function setzeFreigabe(id: string, status: "freigegeben" | "verworfen"): Promise<void> {
  const q = await assistentDb()
  if (!q) throw new Error("Datenbank nicht verfügbar")
  await q(`UPDATE assistent_freigaben SET status = $2, erledigt_at = now() WHERE id = $1 AND status = 'offen'`, [
    id,
    status,
  ])
}
