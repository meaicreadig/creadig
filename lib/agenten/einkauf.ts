import "server-only"

import { finanzDb } from "@/lib/finanz/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"

import { slug } from "./ki"

/**
 * EINKAUF — laufende Kosten im Blick, ohne KI.
 *
 * 23.10.2026 neu (Abteilung stand leer). Quelle sind die Belege der
 * Buchhaltung: Ein Händler, der in mindestens zwei Monaten auftaucht, ist ein
 * laufender Vertrag. Steigt sein letzter Betrag um mehr als 10 % oder kommt
 * ein neuer laufender Händler dazu, geht ein Auftrag an den Einkauf (prüfen,
 * kündigen, Alternative suchen). Kündigen oder wechseln entscheidet Emin.
 */

type Zeile = { haendler: string; monat: string; brutto: number; datum: string }

export async function einkaufsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const db = await finanzDb().catch(() => null)
  if (!db) return { ergebnis: "Keine Finanzdatenbank", anzahl: 0 }
  const rows = (await db(
    `SELECT lower(trim(haendler)) AS haendler, to_char(datum, 'YYYY-MM') AS monat, sum(brutto_cent)::bigint AS brutto, max(datum)::text AS datum
       FROM fin_belege
      WHERE NOT archiviert AND art = 'beleg' AND brutto_cent > 0 AND trim(haendler) <> '' AND datum >= CURRENT_DATE - 150
      GROUP BY 1, 2 ORDER BY 1, 2`,
    [],
  )) as Zeile[]

  const je = new Map<string, Zeile[]>()
  for (const r of rows) je.set(r.haendler, [...(je.get(r.haendler) ?? []), { ...r, brutto: Number(r.brutto) }])

  let laufendCent = 0
  let laufend = 0
  let n = 0
  for (const [h, monate] of je) {
    if (monate.length < 2) continue
    laufend++
    const letzte = monate[monate.length - 1]
    const vorher = monate[monate.length - 2]
    laufendCent += letzte.brutto
    const neu = monate.length === 2 && monate[0].monat >= new Date(Date.now() - 75 * 86400000).toISOString().slice(0, 7)
    const anstieg = vorher.brutto > 0 && letzte.brutto > vorher.brutto * 1.1 && letzte.brutto - vorher.brutto >= 500
    if (!anstieg && !neu) continue
    const id = await legeAuftragAn({
      von: "einkauf",
      an: "einkauf",
      titel: anstieg ? `Preisanstieg · ${h}` : `Neuer laufender Vertrag · ${h}`,
      inhalt: `${anstieg ? `Letzter Monat ${(letzte.brutto / 100).toFixed(2)} € statt ${(vorher.brutto / 100).toFixed(2)} € (${letzte.monat} vs. ${vorher.monat}).` : `Seit ${monate[0].monat} jeden Monat, zuletzt ${(letzte.brutto / 100).toFixed(2)} €.`}\n\nPrüfen: Wird es genutzt? Gibt es einen günstigeren Tarif oder eine Alternative? Kündigung oder Wechsel nur als Vorschlag an Emin.`,
      quelle: `einkauf:${slug(h)}:${letzte.monat}`,
    })
    if (id) n++
  }
  return {
    ergebnis: `${laufend} laufende Verträge, zuletzt ${(laufendCent / 100).toFixed(0)} € im Monat – ${n} zur Prüfung`,
    anzahl: n,
  }
}
