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
  /** Warum kein (oder ein vorsichtiger) Vorschlag — Sammelzahlung, mehrdeutig, Überzahlung. */
  hinweis: string | null
}

const normalisiere = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").trim()
const eurText = (cent: number) => (cent / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
/** Bank-Referenzen können Sonderzeichen tragen — die Zahlungs-ID bleibt trotzdem stabil und gültig. */
const zahlungsSchluessel = (ref: string) => {
  let h = 0
  for (const c of ref) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0
  return `${ref.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 48)}-${(h >>> 0).toString(36)}`
}

export type AusgehenderBankUmsatz = { id: string; datum: string; betragCent: number; verwendungszweck: string; gegenpartei: string | null }

/** Abbuchungen ohne Zuordnung — sie gehören zu einem Beleg (Ausgabe), nicht zu einer Rechnung. */
export async function ladeAusgehendeBankUmsaetze(db: Abfrage): Promise<AusgehenderBankUmsatz[]> {
  const r = await db(
    `SELECT id, to_char(datum,'YYYY-MM-DD') AS datum, betrag_cent, verwendungszweck, gegenpartei
       FROM fin_bank_umsaetze WHERE status = 'offen' AND betrag_cent < 0 ORDER BY datum DESC LIMIT 200`,
    [],
  )
  return r.map((x) => ({ id: String(x.id), datum: String(x.datum), betragCent: -Number(x.betrag_cent), verwendungszweck: String(x.verwendungszweck ?? ""), gegenpartei: x.gegenpartei ? String(x.gegenpartei) : null }))
}

/** Abbuchung als Ausgabe buchen (idempotent über die Umsatz-ID), z. B. Bankgebühr ohne Beleg-Datei oder Beleg folgt. */
export async function bucheAusgehendenUmsatz(db: Abfrage, umsatzId: string, kategorie: string, ustSatz: number, geschaeftsfeld: string | null): Promise<boolean> {
  const [u] = await db(
    `UPDATE fin_bank_umsaetze SET status='zugeordnet' WHERE id=$1 AND status='offen' AND betrag_cent < 0
      RETURNING to_char(datum,'YYYY-MM-DD') AS datum, betrag_cent, verwendungszweck, gegenpartei`,
    [umsatzId],
  )
  if (!u) return false
  await db(
    `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, gegenpartei, notiz, quelle, quelle_ref, geschaeftsfeld)
     VALUES ($1,'ausgabe','gebucht',$2,$3,$4,$5,$6,$7,'bank',$8,$9) ON CONFLICT (id) DO NOTHING`,
    [`bank-aus-${zahlungsSchluessel(umsatzId)}`, String(u.datum), -Number(u.betrag_cent), ustSatz, kategorie, u.gegenpartei ?? null, String(u.verwendungszweck ?? "").slice(0, 300) || null, umsatzId, geschaeftsfeld],
  )
  return true
}

export type OffeneRechnungFuerAbgleich = { id: string; nummer: string; kunde: string; offenCent: number }

/** Alle offenen Rechnungen mit ihrem aktuellen Rest — Grundlage für den Vorschlag UND für die manuelle Zuordnung in der Oberfläche. */
export async function ladeOffeneRechnungenFuerAbgleich(db: Abfrage): Promise<OffeneRechnungFuerAbgleich[]> {
  const r = await db(
    `SELECT fd.id, fd.nummer, fd.kunde, (fd.summen->>'bruttoCent')::bigint AS brutto_cent,
            coalesce((SELECT sum(z.cent) FROM fin_zahlungen z WHERE z.dokument_id = fd.id), 0) AS bezahlt_cent
       FROM fin_dokumente fd
      WHERE fd.art = 'rechnung' AND fd.status IN ('versendet','teilbezahlt') AND fd.nummer IS NOT NULL
      ORDER BY fd.created_at ASC`,
    [],
  )
  return r.map((x) => ({
    id: String(x.id),
    nummer: String(x.nummer),
    kunde: (() => { const k = x.kunde as { firma?: string; name?: string }; return k.firma || k.name || "" })(),
    offenCent: Number(x.brutto_cent ?? 0) - Number(x.bezahlt_cent ?? 0),
  }))
}

export async function ladeOffeneBankUmsaetze(db: Abfrage): Promise<OffenerBankUmsatz[]> {
  const umsaetze = await db(
    `SELECT id, to_char(datum,'YYYY-MM-DD') AS datum, betrag_cent, verwendungszweck, gegenpartei
       FROM fin_bank_umsaetze WHERE status = 'offen' AND betrag_cent > 0 ORDER BY datum DESC LIMIT 200`,
    [],
  )
  if (umsaetze.length === 0) return []

  const kandidaten = await ladeOffeneRechnungenFuerAbgleich(db)

  return umsaetze.map((u) => {
    const zweck = String(u.verwendungszweck ?? "")
    const zweckNorm = normalisiere(zweck)
    const betrag = Number(u.betrag_cent)
    const gegenpartei = u.gegenpartei ? String(u.gegenpartei) : null

    let vorschlag: OffenerBankUmsatz["vorschlag"] = null
    let hinweis: string | null = null
    /* Jede Nummer als ganzes Wort — "RE-2026-1" darf nicht in "RE-2026-12" stecken. */
    const zweckGross = ` ${zweck.toUpperCase().replace(/[^A-Z0-9-]+/g, " ")} `
    const perNummer = kandidaten.filter((k) => zweckGross.includes(` ${k.nummer.toUpperCase()} `))
    if (perNummer.length === 1) {
      const k = perNummer[0]
      vorschlag = { dokumentId: k.id, nummer: k.nummer, kunde: k.kunde, offenCent: k.offenCent, grund: `Rechnungsnummer ${k.nummer} im Verwendungszweck gefunden` }
      if (betrag > k.offenCent) hinweis = `Der Betrag ist ${eurText(betrag - k.offenCent)} höher als der offene Rest — bitte prüfen, bevor du bestätigst.`
    } else if (perNummer.length > 1) {
      /* Sammelüberweisung: kein Automatik-Vorschlag, der alles auf die erste Rechnung legt. */
      const summe = perNummer.reduce((s, k) => s + Math.max(0, k.offenCent), 0)
      hinweis = `Sammelzahlung für ${perNummer.map((k) => k.nummer).join(", ")} (zusammen offen ${eurText(summe)}). Bitte je Rechnung einzeln über "Manuell zuordnen" aufteilen.`
    } else {
      const passend = kandidaten
        .filter((k) => {
          if (k.offenCent <= 0 || Math.abs(k.offenCent - betrag) > 100) return false
          const kundeNorm = normalisiere(k.kunde)
          return kundeNorm.length > 2 && (zweckNorm.includes(kundeNorm) || (gegenpartei && normalisiere(gegenpartei).includes(kundeNorm)))
        })
        .sort((a, b) => Math.abs(a.offenCent - betrag) - Math.abs(b.offenCent - betrag))
      const [erster, zweiter] = passend
      const gleichGut = erster && zweiter && Math.abs(erster.offenCent - betrag) === Math.abs(zweiter.offenCent - betrag)
      if (gleichGut) {
        hinweis = `Mehrere Rechnungen passen gleich gut (${passend.slice(0, 4).map((k) => k.nummer).join(", ")}). Bitte selbst wählen.`
      } else if (erster) {
        vorschlag = { dokumentId: erster.id, nummer: erster.nummer, kunde: erster.kunde, offenCent: erster.offenCent, grund: "Betrag und Kunde passen zum offenen Rest" }
      }
    }

    return {
      id: String(u.id),
      datum: String(u.datum),
      bruttoCent: betrag,
      verwendungszweck: zweck,
      gegenpartei,
      vorschlag,
      hinweis,
    }
  })
}

export type ZuordnungErgebnis = { ok: true; stand: Zahlungsstand } | { ok: false; fehler: string }

export async function bestaetigeZuordnung(db: Abfrage, umsatzId: string, dokumentId: string): Promise<ZuordnungErgebnis> {
  /* Erst den Umsatz atomar beanspruchen — ein zweiter, gleichzeitiger Klick findet ihn nicht mehr "offen" und bucht nichts. */
  const [u] = await db(
    `UPDATE fin_bank_umsaetze SET status='zugeordnet', zugeordnet_dokument_id=$2
      WHERE id=$1 AND status='offen' AND betrag_cent > 0
      RETURNING to_char(datum,'YYYY-MM-DD') AS datum, betrag_cent`,
    [umsatzId, dokumentId],
  )
  if (!u) return { ok: false, fehler: "Dieser Umsatz ist schon zugeordnet oder nicht mehr offen." }

  /* Feste Zahlungs-ID aus dem Umsatz: selbst ein Wiederholungsversuch legt keine zweite Zahlung an. */
  const r = await erfasseZahlung(db, dokumentId, Number(u.betrag_cent), String(u.datum), "bank", umsatzId, `bank-${zahlungsSchluessel(umsatzId)}`)
  if (!r.ok) {
    await db(`UPDATE fin_bank_umsaetze SET status='offen', zugeordnet_dokument_id=NULL WHERE id=$1 AND zugeordnet_dokument_id=$2`, [umsatzId, dokumentId])
    return r
  }
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
