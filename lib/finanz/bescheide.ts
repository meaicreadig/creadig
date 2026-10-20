import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { plusTage } from "@/lib/finanz/rechnen"

/**
 * Steuerbescheide — die Ablage für das, was das Finanzamt festsetzt.
 *
 * Bisher rechnete Finanz die ESt-Vorauszahlung mit der Quote aus den
 * Einstellungen und kannte keinen Bescheid. Hier steht, was tatsächlich
 * festgesetzt wurde, und es wirkt auf die Fristen (und damit auf die
 * Liquidität):
 *   Vorauszahlung   setzt den Betrag der offenen ESt-Vorauszahlungen ab einem Datum
 *   Nachzahlung     legt eine Frist an (Bekanntgabe + 30 Tage), mit Betrag
 *   Erstattung      legt eine Frist mit NEGATIVEM Betrag an — erwarteter Zufluss
 *
 * Nur Metadaten. Das Original (PDF) bleibt dort, wo du es ablegst — ein
 * Dateiupload kommt mit dem Beleg-Archiv, nicht doppelt hierher.
 */

export const BESCHEID_ARTEN = {
  vorauszahlung: "Festsetzung Vorauszahlungen",
  nachzahlung: "Nachzahlung",
  erstattung: "Erstattung",
  sonstig: "Sonstiger Bescheid (nur Ablage)",
} as const
export type BescheidArt = keyof typeof BESCHEID_ARTEN

export const STEUERARTEN = { est: "Einkommensteuer", ust: "Umsatzsteuer", gewerbe: "Gewerbesteuer", sonstig: "Sonstige" } as const
export type Steuerart = keyof typeof STEUERARTEN

export const BESCHEIDE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_bescheide (
    id text PRIMARY KEY,
    art text NOT NULL CHECK (art IN ('vorauszahlung','nachzahlung','erstattung','sonstig')),
    steuerart text NOT NULL CHECK (steuerart IN ('est','ust','gewerbe','sonstig')),
    jahr int NOT NULL,
    datum date NOT NULL,
    betrag_cent bigint,
    gueltig_ab date,
    aktenzeichen text,
    ablageort text,
    notiz text,
    frist_ids text[] NOT NULL DEFAULT '{}',
    storniert_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now())`,
]

let bereit: Promise<void> | null = null
export async function bescheideSchema(db: Abfrage): Promise<void> {
  bereit ??= (async () => {
    for (const q of BESCHEIDE_SCHEMA) await db(q, [])
  })().catch((e) => {
    bereit = null
    throw e
  })
  await bereit
}

export type Bescheid = {
  id: string
  art: BescheidArt
  steuerart: Steuerart
  jahr: number
  datum: string
  betragCent: number | null
  gueltigAb: string | null
  aktenzeichen: string | null
  ablageort: string | null
  notiz: string | null
  fristIds: string[]
  storniert: boolean
}

const alsBescheid = (r: Record<string, unknown>): Bescheid => ({
  id: String(r.id),
  art: r.art as BescheidArt,
  steuerart: r.steuerart as Steuerart,
  jahr: Number(r.jahr),
  datum: String(r.datum),
  betragCent: r.betrag_cent === null ? null : Number(r.betrag_cent),
  gueltigAb: r.gueltig_ab ? String(r.gueltig_ab) : null,
  aktenzeichen: (r.aktenzeichen as string | null) ?? null,
  ablageort: (r.ablageort as string | null) ?? null,
  notiz: (r.notiz as string | null) ?? null,
  fristIds: (r.frist_ids as string[] | null) ?? [],
  storniert: Boolean(r.storniert_at),
})

const SPALTEN = `id, art, steuerart, jahr, to_char(datum,'YYYY-MM-DD') AS datum, betrag_cent, to_char(gueltig_ab,'YYYY-MM-DD') AS gueltig_ab,
  aktenzeichen, ablageort, notiz, frist_ids, storniert_at`

export async function ladeBescheide(db: Abfrage): Promise<Bescheid[]> {
  await bescheideSchema(db)
  return (await db(`SELECT ${SPALTEN} FROM fin_bescheide ORDER BY datum DESC, created_at DESC`, [])).map(alsBescheid)
}

export type BescheidEingabe = {
  art: BescheidArt
  steuerart: Steuerart
  jahr: number
  datum: string
  /** Vorauszahlung: Betrag je Termin. Nachzahlung/Erstattung: Gesamtbetrag. Immer positiv eingeben. */
  betragCent: number | null
  gueltigAb: string | null
  aktenzeichen: string | null
  ablageort: string | null
  notiz: string | null
}

export type BescheidErgebnis = { ok: true; id: string; fristen: number } | { ok: false; fehler: string }

const ISO = /^\d{4}-\d{2}-\d{2}$/

export async function legeBescheidAn(db: Abfrage, e: BescheidEingabe): Promise<BescheidErgebnis> {
  await bescheideSchema(db)
  if (!ISO.test(e.datum)) return { ok: false, fehler: "Datum des Bescheids fehlt." }
  if (!Number.isInteger(e.jahr) || e.jahr < 2000 || e.jahr > 2100) return { ok: false, fehler: "Jahr ungültig." }
  if (e.art !== "sonstig" && (!e.betragCent || e.betragCent <= 0)) return { ok: false, fehler: "Betrag fehlt." }
  if (e.art === "vorauszahlung" && (!e.gueltigAb || !ISO.test(e.gueltigAb))) return { ok: false, fehler: "„Gilt ab“ fehlt — ab wann gilt die Vorauszahlung?" }

  const id = `bescheid-${crypto.randomUUID()}`
  const fristIds: string[] = []

  if (e.art === "vorauszahlung" && e.steuerart === "est") {
    /* Nur Fristen, die noch offen sind und nach „gilt ab“ liegen; ein bereits erledigter Termin bleibt wie er war. */
    const rows = await db(
      `UPDATE fin_fristen SET betrag_cent = $1 WHERE art = 'est' AND erledigt_at IS NULL AND faellig >= $2::date RETURNING id`,
      [e.betragCent, e.gueltigAb],
    )
    fristIds.push(...rows.map((r) => String(r.id)))
  } else if (e.art === "nachzahlung" || e.art === "erstattung") {
    const frist = `bescheid-frist-${id}`
    const titel = `${e.art === "nachzahlung" ? "Nachzahlung" : "Erstattung erwartet:"} ${STEUERARTEN[e.steuerart]} ${e.jahr}`.replace(":", "")
    await db(
      `INSERT INTO fin_fristen (id, titel, art, faellig, betrag_cent) VALUES ($1,$2,'sonstig',$3::date,$4)`,
      [frist, titel, plusTage(e.datum, 30), e.art === "nachzahlung" ? e.betragCent : -(e.betragCent as number)],
    )
    fristIds.push(frist)
  }

  await db(
    `INSERT INTO fin_bescheide (id, art, steuerart, jahr, datum, betrag_cent, gueltig_ab, aktenzeichen, ablageort, notiz, frist_ids)
     VALUES ($1,$2,$3,$4,$5::date,$6,$7::date,$8,$9,$10,$11::text[])`,
    [id, e.art, e.steuerart, e.jahr, e.datum, e.betragCent, e.gueltigAb, e.aktenzeichen, e.ablageort, e.notiz, fristIds],
  )
  return { ok: true, id, fristen: fristIds.length }
}

/** Storniert den Bescheid und entfernt die von ihm angelegten Nachzahlungs-/Erstattungsfristen (nur, wenn noch offen). Vorauszahlungs-Beträge bleiben stehen — sie sind eine Tatsache, bis der nächste Bescheid sie ersetzt. */
export async function storniereBescheid(db: Abfrage, id: string): Promise<boolean> {
  await bescheideSchema(db)
  const rows = await db(`UPDATE fin_bescheide SET storniert_at = now() WHERE id = $1 AND storniert_at IS NULL RETURNING art, frist_ids`, [id])
  const r = rows[0]
  if (!r) return false
  if (r.art === "nachzahlung" || r.art === "erstattung") {
    await db(`DELETE FROM fin_fristen WHERE id = ANY($1::text[]) AND erledigt_at IS NULL`, [r.frist_ids])
  }
  return true
}
