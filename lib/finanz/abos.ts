import "server-only"

import { mitSchemaMarker } from "@/lib/finanz/schema-marker"
import type { Abfrage } from "@/lib/neon-abfrage"
import { addTage, type Kunde, type Position } from "@/lib/finanz/auftraege/rechnen"
import { auftraegeSchema, legeEntwurfAn, merkeKunde, verlauf } from "@/lib/finanz/auftraege/store"

/**
 * Wiederkehrende Rechnungen (Abos, Retainer, Wartung).
 *
 * Der Takt legt nur einen ENTWURF an, rechtzeitig vor dem Termin — Prüfen,
 * Festschreiben und Versenden bleibt ein Klick des Owners in /finanz/rechnungen.
 * Nichts verlässt das Haus von allein, und kein Abo löscht oder ändert je eine
 * bestehende Rechnung. Beenden heißt pausieren/archivieren, nie löschen.
 *
 * Idempotent: der Termin rückt per bedingtem UPDATE vor (nur wenn er noch der
 * alte ist) — zwei gleichzeitige Läufe erzeugen genau einen Entwurf.
 */

export { INTERVALLE, INTERVALL_LABEL, kundenSchluessel } from "@/lib/finanz/abos-shared"
export type { Intervall } from "@/lib/finanz/abos-shared"
import { INTERVALLE, INTERVALL_LABEL, type Intervall } from "@/lib/finanz/abos-shared"

/** So viele Tage vor dem Termin liegt der Entwurf bereit. */
export const VORLAUF_TAGE = 5

export const ABOS_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_abos (
    id text PRIMARY KEY,
    titel text NOT NULL,
    kunde jsonb NOT NULL,
    positionen jsonb NOT NULL,
    geschaeftsfeld text NOT NULL DEFAULT 'digitalprodukte',
    intervall text NOT NULL CHECK (intervall IN ('monat','quartal','jahr')),
    naechste date NOT NULL,
    zahlungsziel_tage int NOT NULL DEFAULT 14,
    aktiv boolean NOT NULL DEFAULT true,
    letzter_entwurf_id text,
    erstellt_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS fin_abos_faellig_idx ON fin_abos (naechste) WHERE aktiv`,
]

let bereit: Promise<void> | null = null
export async function abosSchema(db: Abfrage): Promise<void> {
  bereit ??= (async () => {
    await auftraegeSchema(db)
    await mitSchemaMarker(db, "abos", ABOS_SCHEMA)
  })().catch((e) => {
    bereit = null
    throw e
  })
  await bereit
}

/** Monatsarithmetik mit Klemmung auf den letzten Tag (31.01. + 1 Monat = 28./29.02.). Rein. */
export function addMonate(iso: string, n: number): string {
  const [j, m, t] = iso.split("-").map(Number)
  const ziel = j * 12 + (m - 1) + n
  const jahr = Math.floor(ziel / 12)
  const monat = (ziel % 12) + 1
  const letzter = new Date(Date.UTC(jahr, monat, 0)).getUTCDate()
  return `${jahr}-${String(monat).padStart(2, "0")}-${String(Math.min(t, letzter)).padStart(2, "0")}`
}

const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
/** „Oktober 2026“ bzw. „Oktober – Dezember 2026“ — der Leistungszeitraum der Rechnung zum Termin. Rein. */
export function zeitraumText(termin: string, intervall: Intervall): string {
  const [j, m] = termin.split("-").map(Number)
  if (intervall === "monat") return `${MONATE[m - 1]} ${j}`
  const bis = addMonate(termin, INTERVALLE[intervall] - 1)
  const [j2, m2] = bis.split("-").map(Number)
  return j === j2 ? `${MONATE[m - 1]} – ${MONATE[m2 - 1]} ${j}` : `${MONATE[m - 1]} ${j} – ${MONATE[m2 - 1]} ${j2}`
}

export type Abo = {
  id: string
  titel: string
  kunde: Kunde
  positionen: Position[]
  geschaeftsfeld: string
  intervall: Intervall
  naechste: string
  zahlungszielTage: number
  aktiv: boolean
  letzterEntwurfId: string | null
}

const zeile = (r: Record<string, unknown>): Abo => ({
  id: String(r.id),
  titel: String(r.titel),
  kunde: r.kunde as Kunde,
  positionen: r.positionen as Position[],
  geschaeftsfeld: String(r.geschaeftsfeld),
  intervall: r.intervall as Intervall,
  naechste: String(r.naechste_text),
  zahlungszielTage: Number(r.zahlungsziel_tage),
  aktiv: Boolean(r.aktiv),
  letzterEntwurfId: (r.letzter_entwurf_id as string | null) ?? null,
})

export async function ladeAbos(db: Abfrage): Promise<Abo[]> {
  await abosSchema(db)
  return (await db(`SELECT *, to_char(naechste,'YYYY-MM-DD') AS naechste_text FROM fin_abos ORDER BY aktiv DESC, fin_abos.naechste`, [])).map(zeile)
}

export type AboEingabe = { titel: string; kunde: Kunde; beschreibung: string; nettoCent: number; ustSatz: number; intervall: Intervall; start: string; geschaeftsfeld: string }

export async function legeAboAn(db: Abfrage, e: AboEingabe): Promise<{ ok: true; id: string } | { ok: false; fehler: string }> {
  await abosSchema(db)
  if (!e.titel.trim()) return { ok: false, fehler: "Titel fehlt." }
  if (!(e.intervall in INTERVALLE)) return { ok: false, fehler: "Intervall ungültig." }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.start)) return { ok: false, fehler: "Starttermin fehlt." }
  if (!(e.nettoCent > 0)) return { ok: false, fehler: "Betrag muss größer als 0 sein." }
  if (!e.kunde.name.trim() && !e.kunde.firma.trim()) return { ok: false, fehler: "Kunde fehlt." }
  const positionen: Position[] = [
    { titel: e.titel.trim(), beschreibung: e.beschreibung.trim(), menge: 1, einheit: INTERVALL_LABEL[e.intervall], preisCent: e.nettoCent, ustSatz: e.ustSatz, optional: false, gewaehlt: true },
  ]
  const id = `abo-${crypto.randomUUID()}`
  await db(
    `INSERT INTO fin_abos (id, titel, kunde, positionen, geschaeftsfeld, intervall, naechste) VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7::date)`,
    [id, e.titel.trim().slice(0, 120), JSON.stringify(e.kunde), JSON.stringify(positionen), e.geschaeftsfeld, e.intervall, e.start],
  )
  await merkeKunde(db, e.kunde)
  return { ok: true, id }
}

/** Pausieren/Fortsetzen — nie löschen: die Historie der erzeugten Entwürfe bleibt am Abo. */
export async function setzeAboAktiv(db: Abfrage, id: string, aktiv: boolean): Promise<void> {
  await abosSchema(db)
  await db(`UPDATE fin_abos SET aktiv = $2 WHERE id = $1`, [id, aktiv])
}

/**
 * Legt für jedes fällige Abo (Termin ≤ heute + Vorlauf) EINEN Rechnungs-Entwurf an
 * und rückt den Termin um einen Intervall vor. Ein Abo, das lange stillstand,
 * holt sich pro Lauf einen Entwurf — keine Lawine auf einmal.
 */
export async function erzeugeFaelligeAboEntwuerfe(db: Abfrage, heute: string): Promise<{ id: string; aboId: string; zeitraum: string }[]> {
  await abosSchema(db)
  const grenze = addTage(heute, VORLAUF_TAGE)
  const faellig = (await db(`SELECT *, to_char(naechste,'YYYY-MM-DD') AS naechste_text FROM fin_abos WHERE aktiv AND naechste <= $1::date ORDER BY fin_abos.naechste`, [grenze])).map(zeile)
  const erzeugt: { id: string; aboId: string; zeitraum: string }[] = []
  for (const a of faellig) {
    const neu = addMonate(a.naechste, INTERVALLE[a.intervall])
    /* Bedingtes Vorrücken ist die Sperre gegen Doppelläufe. */
    const gewonnen = await db(`UPDATE fin_abos SET naechste = $3::date WHERE id = $1 AND naechste = $2::date AND aktiv RETURNING id`, [a.id, a.naechste, neu])
    if (!gewonnen.length) continue
    const zeitraum = zeitraumText(a.naechste, a.intervall)
    const id = await legeEntwurfAn(db, "rechnung", {
      titel: a.titel,
      kunde: a.kunde,
      positionen: a.positionen,
      geschaeftsfeld: a.geschaeftsfeld,
      zahlungszielTage: a.zahlungszielTage,
      leistungszeitraum: zeitraum,
    })
    await db(`UPDATE fin_abos SET letzter_entwurf_id = $2 WHERE id = $1`, [a.id, id])
    await verlauf(db, id, "aus_abo", { aboId: a.id, zeitraum })
    erzeugt.push({ id, aboId: a.id, zeitraum })
  }
  return erzeugt
}
