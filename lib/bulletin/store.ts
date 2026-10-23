import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

export type Zweisprachig = { de: string; tr: string }

export const RESSORTS = [
  { id: "ki", de: "KI & Modelle", tr: "Yapay zekâ & modeller" },
  { id: "automation", de: "Automatisierung & Agenten", tr: "Otomasyon & ajanlar" },
  { id: "medien", de: "Medien & Plattformen", tr: "Medya & platformlar" },
  { id: "chips", de: "Chips & Hardware", tr: "Çip & donanım" },
  { id: "robotik", de: "Robotik", tr: "Robotik" },
  { id: "recht", de: "Recht & Politik", tr: "Hukuk & politika" },
  /* 23.10.2026: Die PHP-Lücken (php.net, 21.10.) kamen per Hoster-Mail, nicht
     übers Bulletin — Sicherheit war kein Ressort. Für Betriebe mit Website
     ist das oft die wichtigste Nachricht der Woche. */
  { id: "sicherheit", de: "IT-Sicherheit & Schwachstellen", tr: "BT güvenliği & açıklar" },
  { id: "maerkte", de: "Märkte DACH · Türkei · Golf", tr: "Pazarlar DACH · Türkiye · Körfez" },
] as const
export type RessortId = (typeof RESSORTS)[number]["id"]
export const istRessort = (v: unknown): v is RessortId => RESSORTS.some((r) => r.id === v)

export type Meldung = {
  nr: number
  ressort: RessortId
  titel: Zweisprachig
  kurz: Zweisprachig
  /** Was die Nachricht für creaDIG bedeutet – der eigentliche Wert des Bulletins. */
  fuerUns: Zweisprachig
  /** 3 = Schwerpunkt, 2 = wichtig, 1 = Randnotiz. */
  gewicht: 1 | 2 | 3
  quelle: string
  url: string
  datum: string | null
  /** Ein eigener Artikel, den creaDIG daraus schreiben könnte (Website, LinkedIn, Google). */
  artikel: Zweisprachig | null
}

export type Ausgabe = {
  id: string
  erstelltAm: string
  lage: Zweisprachig
  meldungen: Meldung[]
}

let bereit: Promise<void> | null = null

/* Legt sich selbst an: die Prod-DATABASE_URL ist "Sensitive" und von außen nicht migrierbar. */
function schema(db: Abfrage): Promise<void> {
  bereit ??= db(
    `CREATE TABLE IF NOT EXISTS bulletin_ausgaben (
      id text PRIMARY KEY,
      erstellt_at timestamptz NOT NULL DEFAULT now(),
      lage jsonb NOT NULL,
      meldungen jsonb NOT NULL DEFAULT '[]'::jsonb
    )`,
    [],
  )
    .then(() => undefined)
    .catch((e) => {
      bereit = null
      throw e
    })
  return bereit
}

async function db(): Promise<Abfrage | null> {
  const abfrage = neonAbfrage()
  if (!abfrage) return null
  await schema(abfrage)
  return abfrage
}

function zeile(r: Record<string, unknown>): Ausgabe {
  return {
    id: String(r.id),
    erstelltAm: new Date(String(r.erstellt_at)).toISOString(),
    lage: r.lage as Zweisprachig,
    meldungen: (r.meldungen as Meldung[]) ?? [],
  }
}

export async function speichereAusgabe(a: Omit<Ausgabe, "erstelltAm">): Promise<void> {
  const d = await db()
  if (!d) throw new Error("Keine Datenbank")
  await d(
    `INSERT INTO bulletin_ausgaben (id, lage, meldungen) VALUES ($1, $2::jsonb, $3::jsonb)
     ON CONFLICT (id) DO UPDATE SET lage = EXCLUDED.lage, meldungen = EXCLUDED.meldungen, erstellt_at = now()`,
    [a.id, JSON.stringify(a.lage), JSON.stringify(a.meldungen)],
  )
}

export async function ladeAusgabe(id?: string | null): Promise<Ausgabe | null> {
  const d = await db()
  if (!d) return null
  const rows = id
    ? await d(`SELECT * FROM bulletin_ausgaben WHERE id = $1`, [id])
    : await d(`SELECT * FROM bulletin_ausgaben ORDER BY id DESC LIMIT 1`, [])
  return rows[0] ? zeile(rows[0]) : null
}

export async function ladeArchiv(anzahl = 21): Promise<{ id: string; anzahl: number }[]> {
  const d = await db()
  if (!d) return []
  const rows = await d(
    `SELECT id, jsonb_array_length(meldungen) AS anzahl FROM bulletin_ausgaben ORDER BY id DESC LIMIT $1`,
    [anzahl],
  )
  return rows.map((r) => ({ id: String(r.id), anzahl: Number(r.anzahl) }))
}

export type Lauf = { laeuft: boolean; start: string | null; ergebnis: string | null; ok: boolean }

const LAUF_TABELLE = `CREATE TABLE IF NOT EXISTS bulletin_lauf (
  id text PRIMARY KEY, start_at timestamptz, ende_at timestamptz, ergebnis text, ok boolean
)`

export async function starteLauf(): Promise<void> {
  const d = await db()
  if (!d) return
  await d(LAUF_TABELLE, [])
  await d(
    `INSERT INTO bulletin_lauf (id, start_at, ende_at, ergebnis, ok) VALUES ('aktuell', now(), NULL, NULL, NULL)
     ON CONFLICT (id) DO UPDATE SET start_at = now(), ende_at = NULL, ergebnis = NULL, ok = NULL`,
    [],
  )
}

export async function beendeLauf(ergebnis: string, ok: boolean): Promise<void> {
  const d = await db()
  if (!d) return
  await d(`UPDATE bulletin_lauf SET ende_at = now(), ergebnis = $1, ok = $2 WHERE id = 'aktuell'`, [ergebnis, ok])
}

/** Ein Lauf ohne Ende, der älter als 6 Minuten ist, gilt als abgebrochen. */
export async function ladeLauf(): Promise<Lauf> {
  const d = await db()
  const leer: Lauf = { laeuft: false, start: null, ergebnis: null, ok: true }
  if (!d) return leer
  await d(LAUF_TABELLE, [])
  const r = (await d(
    `SELECT start_at, ende_at, ergebnis, ok, (ende_at IS NULL AND start_at > now() - interval '6 minutes') AS laeuft FROM bulletin_lauf WHERE id = 'aktuell'`,
    [],
  ))[0]
  if (!r) return leer
  return {
    laeuft: Boolean(r.laeuft),
    start: r.start_at ? new Date(String(r.start_at)).toISOString() : null,
    ergebnis: r.ergebnis ? String(r.ergebnis) : r.ende_at || r.laeuft ? null : "Letzte Recherche wurde abgebrochen – bitte erneut starten",
    ok: r.ok !== false && !(!r.ende_at && !r.laeuft),
  }
}

export async function ausgabeExistiert(id: string): Promise<boolean> {
  const d = await db()
  if (!d) return false
  const rows = await d(`SELECT 1 FROM bulletin_ausgaben WHERE id = $1`, [id])
  return rows.length > 0
}
