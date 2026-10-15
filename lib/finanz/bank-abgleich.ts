import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import type { BankUmsatz } from "@/lib/finanz/bank-import"
import { erfasseZahlung, type Zahlungsstand } from "@/lib/finanz/auftraege/store"

/**
 * Bank-Abgleich (Phase 6): importierte Umsaetze gegen offene Rechnungen
 * vorschlagen — Bestaetigung bleibt immer ein Klick eines Menschen (siehe
 * bestaetigeZuordnung()), nichts wird automatisch verbucht.
 */

export async function importiereBankUmsaetze(db: Abfrage, umsaetze: BankUmsatz[], quelle: "csv" | "camt053"): Promise<number> {
  let importiert = 0
  for (const u of umsaetze) {
    const r = await db(
      `INSERT INTO fin_bank_umsaetze (id, datum, betrag_cent, verwendungszweck, gegenpartei, quelle, rohdaten)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) ON CONFLICT (id) DO NOTHING RETURNING id`,
      [u.ref, u.datum, u.betragCent, u.verwendungszweck, u.gegenpartei, quelle, JSON.stringify(u)],
    )
    if (r.length) importiert++
  }
  return importiert
}

export type OffenerBankUmsatz = {
  id: string
  datum: string
  bruttoCent: number
  verwendungszweck: string
  gegenpartei: string | null
  vorschlag: { dokumentId: string; nummer: string; kunde: string; offenCent: number; grund: string } | null
}

const normalisiere = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").trim()

export async function ladeOffeneBankUmsaetze(db: Abfrage): Promise<OffenerBankUmsatz[]> {
  const umsaetze = await db(
    `SELECT id, to_char(datum,'YYYY-MM-DD') AS datum, betrag_cent, verwendungszweck, gegenpartei
       FROM fin_bank_umsaetze WHERE status = 'offen' AND betrag_cent > 0 ORDER BY datum DESC LIMIT 200`,
    [],
  )
  if (umsaetze.length === 0) return []

  const offeneRechnungen = await db(
    `SELECT fd.id, fd.nummer, fd.kunde, (fd.summen->>'bruttoCent')::bigint AS brutto_cent,
            coalesce((SELECT sum(z.cent) FROM fin_zahlungen z WHERE z.dokument_id = fd.id), 0) AS bezahlt_cent
       FROM fin_dokumente fd
      WHERE fd.art = 'rechnung' AND fd.status IN ('versendet','teilbezahlt') AND fd.nummer IS NOT NULL`,
    [],
  )
  const kandidaten = offeneRechnungen.map((r) => ({
    id: String(r.id),
    nummer: String(r.nummer),
    kunde: (() => { const k = r.kunde as { firma?: string; name?: string }; return k.firma || k.name || "" })(),
    offenCent: Number(r.brutto_cent ?? 0) - Number(r.bezahlt_cent ?? 0),
  }))

  return umsaetze.map((u) => {
    const zweck = String(u.verwendungszweck ?? "")
    const zweckNorm = normalisiere(zweck)
    const betrag = Number(u.betrag_cent)
    const gegenpartei = u.gegenpartei ? String(u.gegenpartei) : null

    let vorschlag: OffenerBankUmsatz["vorschlag"] = null
    const perNummer = kandidaten.find((k) => zweck.toUpperCase().includes(k.nummer))
    if (perNummer) {
      vorschlag = { dokumentId: perNummer.id, nummer: perNummer.nummer, kunde: perNummer.kunde, offenCent: perNummer.offenCent, grund: `Rechnungsnummer ${perNummer.nummer} im Verwendungszweck gefunden` }
    } else {
      const perBetragUndKunde = kandidaten.find((k) => {
        if (k.offenCent <= 0 || Math.abs(k.offenCent - betrag) > 100) return false
        const kundeNorm = normalisiere(k.kunde)
        return kundeNorm.length > 2 && (zweckNorm.includes(kundeNorm) || (gegenpartei && normalisiere(gegenpartei).includes(kundeNorm)))
      })
      if (perBetragUndKunde) {
        vorschlag = { dokumentId: perBetragUndKunde.id, nummer: perBetragUndKunde.nummer, kunde: perBetragUndKunde.kunde, offenCent: perBetragUndKunde.offenCent, grund: "Betrag und Kunde passen zum offenen Rest" }
      }
    }

    return {
      id: String(u.id),
      datum: String(u.datum),
      bruttoCent: betrag,
      verwendungszweck: zweck,
      gegenpartei,
      vorschlag,
    }
  })
}

export type ZuordnungErgebnis = { ok: true; stand: Zahlungsstand } | { ok: false; fehler: string }

export async function bestaetigeZuordnung(db: Abfrage, umsatzId: string, dokumentId: string): Promise<ZuordnungErgebnis> {
  const [u] = await db(`SELECT to_char(datum,'YYYY-MM-DD') AS datum, betrag_cent, status FROM fin_bank_umsaetze WHERE id = $1`, [umsatzId])
  if (!u || u.status !== "offen") return { ok: false, fehler: "Dieser Umsatz ist nicht mehr offen." }

  const r = await erfasseZahlung(db, dokumentId, Number(u.betrag_cent), String(u.datum), "bank", umsatzId)
  if (!r.ok) return r
  await db(`UPDATE fin_bank_umsaetze SET status='zugeordnet', zugeordnet_dokument_id=$2 WHERE id=$1`, [umsatzId, dokumentId])
  return r
}

export async function ignoriereUmsatz(db: Abfrage, umsatzId: string): Promise<void> {
  await db(`UPDATE fin_bank_umsaetze SET status='ignoriert' WHERE id=$1 AND status='offen'`, [umsatzId])
}

/** Letzter importierter Bank-Saldo-relevanter Umsatz — fürs optionale Übernehmen in die Kontostand-Einstellung. */
export async function letzterBankUmsatzAm(db: Abfrage): Promise<string | null> {
  const [r] = await db(`SELECT to_char(max(datum),'YYYY-MM-DD') AS d FROM fin_bank_umsaetze`, [])
  return r?.d ? String(r.d) : null
}
