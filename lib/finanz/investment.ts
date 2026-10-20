import "server-only"

import { mitSchemaMarker } from "@/lib/finanz/schema-marker"
import type { Abfrage } from "@/lib/neon-abfrage"
import type { Monat } from "@/lib/finanz/rechnen"

/**
 * Investment — was nach Steuern und Puffer übrig ist, und wohin es geht.
 *
 * Drei Quellen, keine zweite Wahrheit:
 *   Konto / Steuertopf / Puffer   aus dem Hauptbuch (`berechneLage`)
 *   Geschäftsfelder               aus `ladeFelder` — was zurückfließt, wenn man in ein Feld investiert
 *   Anlagen                       die einzige NEUE Tabelle: was außerhalb des Kontos liegt
 *                                 (Tagesgeld, ETF, Aktien, Beteiligungen …), vom Owner geführt
 *
 * Es gibt KEINE Live-Kurse und KEINE Anlageberatung: Werte trägt der Owner mit
 * Stichtag ein; jede Zahl kennt ihr Alter. Eine Seite, die Kurse erfindet oder
 * rät, wäre die falsche Art von Selbstsicherheit.
 */

export const KLASSEN = {
  tagesgeld: "Tagesgeld / Festgeld",
  etf: "ETF / Fonds",
  aktie: "Einzelaktien",
  krypto: "Krypto",
  immobilie: "Immobilie",
  beteiligung: "Beteiligung / Unternehmen",
  sonstig: "Sonstiges",
} as const
export type Klasse = keyof typeof KLASSEN

/** Wie viele Monatsausgaben als Reserve unangetastet bleiben, bevor etwas „investierbar“ heißt. Dieselbe 6 wie im Kompass. */
export const PUFFER_MONATE = 6
/** Wert älter als so viele Tage: die Oberfläche warnt, dass die Zahl veraltet sein kann. */
export const VERALTET_NACH_TAGEN = 45
/** Ab diesem Anteil einer Klasse am Anlagevermögen gibt es einen ruhigen Hinweis. */
export const KLASSEN_KONZENTRATION = 0.6

export const ANLAGEN_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_anlagen (
    id text PRIMARY KEY,
    name text NOT NULL,
    klasse text NOT NULL CHECK (klasse IN ('tagesgeld','etf','aktie','krypto','immobilie','beteiligung','sonstig')),
    einstand_cent bigint NOT NULL DEFAULT 0 CHECK (einstand_cent >= 0),
    seit date NOT NULL DEFAULT CURRENT_DATE,
    notiz text,
    archiviert_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS fin_anlagen_staende (
    anlage_id text NOT NULL REFERENCES fin_anlagen (id),
    datum date NOT NULL,
    wert_cent bigint NOT NULL CHECK (wert_cent >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (anlage_id, datum))`,
]

let bereit: Promise<void> | null = null
export async function anlagenSchema(db: Abfrage): Promise<void> {
  bereit ??= (async () => {
    await mitSchemaMarker(db, "anlagen", ANLAGEN_SCHEMA)
  })().catch((e) => {
    bereit = null
    throw e
  })
  await bereit
}

export type Anlage = {
  id: string
  name: string
  klasse: Klasse
  einstandCent: number
  seit: string
  notiz: string | null
  /** Letzter eingetragener Wert (Stichtag) — null = noch nie bewertet. */
  wertCent: number | null
  stand: string | null
}

export async function ladeAnlagen(db: Abfrage): Promise<Anlage[]> {
  await anlagenSchema(db)
  const rows = await db(
    `SELECT a.id, a.name, a.klasse, a.einstand_cent, to_char(a.seit,'YYYY-MM-DD') AS seit, a.notiz,
            s.wert_cent, to_char(s.datum,'YYYY-MM-DD') AS stand
       FROM fin_anlagen a
       LEFT JOIN LATERAL (SELECT wert_cent, datum FROM fin_anlagen_staende WHERE anlage_id = a.id ORDER BY datum DESC LIMIT 1) s ON true
      WHERE a.archiviert_at IS NULL ORDER BY a.created_at`,
    [],
  )
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    klasse: r.klasse as Klasse,
    einstandCent: Number(r.einstand_cent),
    seit: String(r.seit),
    notiz: (r.notiz as string | null) ?? null,
    wertCent: r.wert_cent === null ? null : Number(r.wert_cent),
    stand: r.stand ? String(r.stand) : null,
  }))
}

export type AnlageEingabe = { name: string; klasse: Klasse; einstandCent: number; seit: string; wertCent: number | null; notiz: string | null }

const ISO = /^\d{4}-\d{2}-\d{2}$/

export async function legeAnlageAn(db: Abfrage, e: AnlageEingabe, heute: string): Promise<{ ok: true; id: string } | { ok: false; fehler: string }> {
  await anlagenSchema(db)
  if (!e.name.trim()) return { ok: false, fehler: "Name fehlt." }
  if (!(e.klasse in KLASSEN)) return { ok: false, fehler: "Klasse ungültig." }
  if (!ISO.test(e.seit)) return { ok: false, fehler: "Datum fehlt." }
  if (e.einstandCent < 0) return { ok: false, fehler: "Einstand darf nicht negativ sein." }
  const id = `anlage-${crypto.randomUUID()}`
  await db(`INSERT INTO fin_anlagen (id, name, klasse, einstand_cent, seit, notiz) VALUES ($1,$2,$3,$4,$5::date,$6)`, [id, e.name.trim().slice(0, 120), e.klasse, e.einstandCent, e.seit, e.notiz])
  /* Ohne eigenen Wert gilt der Einstand als erster Stand — ehrlich: „wir haben nichts anderes“. */
  await db(`INSERT INTO fin_anlagen_staende (anlage_id, datum, wert_cent) VALUES ($1,$2::date,$3)`, [id, e.wertCent === null ? e.seit : heute, e.wertCent ?? e.einstandCent])
  return { ok: true, id }
}

/** Trägt einen neuen Stichtagswert ein (derselbe Tag überschreibt — ein Wert je Tag). */
export async function bewerteAnlage(db: Abfrage, id: string, wertCent: number, datum: string): Promise<boolean> {
  await anlagenSchema(db)
  if (!ISO.test(datum) || wertCent < 0) return false
  const da = await db(`SELECT 1 FROM fin_anlagen WHERE id = $1 AND archiviert_at IS NULL`, [id])
  if (!da.length) return false
  await db(
    `INSERT INTO fin_anlagen_staende (anlage_id, datum, wert_cent) VALUES ($1,$2::date,$3)
     ON CONFLICT (anlage_id, datum) DO UPDATE SET wert_cent = EXCLUDED.wert_cent`,
    [id, datum, wertCent],
  )
  return true
}

export async function archiviereAnlage(db: Abfrage, id: string): Promise<void> {
  await anlagenSchema(db)
  await db(`UPDATE fin_anlagen SET archiviert_at = now() WHERE id = $1 AND archiviert_at IS NULL`, [id])
}

/* ------------------------------------------------------------------------ */
/* Rechnen — rein                                                            */
/* ------------------------------------------------------------------------ */

export type Investierbar = {
  /** Konto minus Steuertopf (= „frei“ im Kompass). */
  freiCent: number
  /** PUFFER_MONATE × durchschnittliche Monatsausgaben — bleibt liegen. */
  reserveCent: number
  schnittAusgabeCent: number
  /** Was über Steuern UND Reserve hinaus frei ist; nie negativ. */
  investierbarCent: number
  /** Monate, die das freie Geld deckt — null, wenn es keine Ausgaben-Historie gibt. */
  reichweite: number | null
}

export function investierbar(freiCent: number, verlauf: Monat[]): Investierbar {
  const voll = verlauf.slice(0, -1).filter((m) => m.ausCent > 0)
  const schnitt = voll.length ? Math.round(voll.reduce((s, m) => s + m.ausCent, 0) / voll.length) : 0
  const reserve = schnitt * PUFFER_MONATE
  return {
    freiCent,
    reserveCent: reserve,
    schnittAusgabeCent: schnitt,
    investierbarCent: Math.max(0, freiCent - reserve),
    reichweite: schnitt > 0 ? Math.max(0, freiCent / schnitt) : null,
  }
}

/** Was passiert mit der Reichweite, wenn `betragCent` angelegt wird? Rein rechnerisch, ohne Rendite. */
export function nachAnlage(i: Investierbar, betragCent: number): { reichweite: number | null; unterReserve: boolean; ueberInvestierbar: boolean } {
  const rest = i.freiCent - betragCent
  return {
    reichweite: i.schnittAusgabeCent > 0 ? Math.max(0, rest / i.schnittAusgabeCent) : null,
    unterReserve: i.schnittAusgabeCent > 0 && rest < i.reserveCent,
    ueberInvestierbar: betragCent > i.investierbarCent,
  }
}

export type KlassenAnteil = { klasse: Klasse; label: string; wertCent: number; anteil: number }
export type Vermoegensbild = {
  anlagenWertCent: number
  einstandCent: number
  /** Gewinn/Verlust gegenüber Einstand, nur für bewertete Anlagen. */
  ergebnisCent: number
  /** Ergebnis ÷ Einstand; null ohne Einstand. */
  renditeProzent: number | null
  klassen: KlassenAnteil[]
  konzentriert: KlassenAnteil | null
  veraltet: Anlage[]
  /** Konto (frei) + Anlagen — das gesamte frei verfügbare Vermögen. */
  gesamtCent: number
}

export function vermoegensbild(anlagen: Anlage[], freiCent: number, heute: string): Vermoegensbild {
  const bewertet = anlagen.filter((a) => a.wertCent !== null)
  const anlagenWertCent = bewertet.reduce((s, a) => s + (a.wertCent as number), 0)
  const einstandCent = bewertet.reduce((s, a) => s + a.einstandCent, 0)
  const ergebnisCent = anlagenWertCent - einstandCent
  const je = new Map<Klasse, number>()
  for (const a of bewertet) je.set(a.klasse, (je.get(a.klasse) ?? 0) + (a.wertCent as number))
  const klassen = [...je.entries()]
    .map(([klasse, wertCent]) => ({ klasse, label: KLASSEN[klasse], wertCent, anteil: anlagenWertCent > 0 ? wertCent / anlagenWertCent : 0 }))
    .filter((k) => k.wertCent > 0)
    .sort((a, b) => b.wertCent - a.wertCent)
  const tage = (von: string) => Math.floor((Date.parse(`${heute}T00:00:00Z`) - Date.parse(`${von}T00:00:00Z`)) / 86_400_000)
  return {
    anlagenWertCent,
    einstandCent,
    ergebnisCent,
    renditeProzent: einstandCent > 0 ? (ergebnisCent / einstandCent) * 100 : null,
    klassen,
    konzentriert: klassen.length >= 2 && klassen[0].anteil >= KLASSEN_KONZENTRATION ? klassen[0] : null,
    veraltet: anlagen.filter((a) => a.stand !== null && tage(a.stand) > VERALTET_NACH_TAGEN),
    gesamtCent: Math.max(0, freiCent) + anlagenWertCent,
  }
}

/**
 * Was bringt ein Euro im eigenen Geschäft? Je Geschäftsfeld: Rückfluss pro
 * ausgegebenem Euro (Einnahmen ÷ Ausgaben, netto, laufendes Jahr). Ein Feld mit
 * Ausgaben und ohne Einnahmen steht ehrlich bei 0 — keine Division durch null.
 */
export type FeldRendite = { key: string; label: string; einCent: number; ausCent: number; ruckfluss: number | null }
export function feldRendite(felder: { key: string; label: string; einCent: number; ausCent: number }[]): FeldRendite[] {
  return felder
    .filter((f) => f.key !== "privat" && (f.einCent > 0 || f.ausCent > 0))
    .map((f) => ({ ...f, ruckfluss: f.ausCent > 0 ? f.einCent / f.ausCent : null }))
    .sort((a, b) => (b.ruckfluss ?? -1) - (a.ruckfluss ?? -1))
}
