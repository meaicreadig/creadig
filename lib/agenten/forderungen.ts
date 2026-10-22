import "server-only"

import { legeFreigabeAn } from "@/lib/assistent/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import { dokumentMail, sendeDokumentMail, type MailArt } from "@/lib/finanz/auftraege/mail"
import { formatEuro, heuteBerlin, naechsteMahnstufe, tageZwischen } from "@/lib/finanz/auftraege/rechnen"
import { bezahltCent, ladeDokument, ladeDokumente, vermerkeNachfass, type Dokument } from "@/lib/finanz/auftraege/store"
import { finanzDb } from "@/lib/finanz/store"
import { tabelleFehlt } from "@/lib/neon-abfrage"

/**
 * Abteilung Finanzen — Tahsilat (Forderungsmanagement).
 *
 * Gestuft wie das Mahnwesen der Finanzseite (lib/finanz/auftraege/rechnen.ts):
 *   ab  3 Tagen überfällig → freundliche Zahlungserinnerung
 *   ab 14 Tagen            → 1. Mahnung
 *   ab 28 Tagen            → 2. Mahnung + Auftrag an die Geschäftsführung
 * Je Rechnung und Stufe genau ein Entwurf (Schlüssel `forderung:<id>:<stufe>`).
 * Der Text kommt aus derselben Vorlage, die /finanz/vorgang versendet — es gibt
 * nur EINE Mahnsprache. Versendet wird nichts: der Entwurf liegt sichtbar in
 * deiner Freigabe, verbindlich (mit Mahnstufe im Beleg) sendet /finanz/vorgang/<id>.
 */

const STUFE_TEXT = ["", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"] as const
const OFFEN = new Set(["versendet", "teilbezahlt"])
const PROGNOSE_TAGE = 30

const kundeName = (d: Dokument) => d.kunde.firma || d.kunde.name || "Kunde"

/** Offene Forderungen der nächsten 30 Tage und schon überfällige (Brutto; Teilzahlungen sind nicht abgezogen). */
export function forderungsPrognose(rechnungen: Dokument[], heute = heuteBerlin()) {
  let faelligBald = 0
  let ueberfaellig = 0
  for (const d of rechnungen) {
    if (!OFFEN.has(d.status) || !d.faelligAm) continue
    const brutto = d.summen?.bruttoCent ?? 0
    const tage = tageZwischen(heute, d.faelligAm)
    if (tage < 0) ueberfaellig += brutto
    else if (tage <= PROGNOSE_TAGE) faelligBald += brutto
  }
  return { faelligBaldCent: faelligBald, ueberfaelligCent: ueberfaellig }
}

export async function forderungsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const db = await finanzDb()
  if (!db) return { ergebnis: "Keine Rechnungsdaten", anzahl: 0 }
  let rechnungen: Dokument[]
  try {
    rechnungen = await ladeDokumente(db, ["rechnung"])
  } catch (e) {
    if (tabelleFehlt(e, "fin_dokumente")) return { ergebnis: "Keine Rechnungsdaten", anzahl: 0 }
    throw e
  }
  const heute = heuteBerlin()
  let entwuerfe = 0
  let eskaliert = 0

  for (const d of rechnungen) {
    if (!OFFEN.has(d.status) || !d.faelligAm) continue
    const tage = tageZwischen(d.faelligAm, heute)
    const stufe = naechsteMahnstufe(tage, d.mahnstufe)
    if (!stufe) continue

    const empfaenger = d.kunde.email?.trim() || null
    const vorlage = d.token ? dokumentMail(d, `mahnung_${stufe}` as MailArt) : null
    const betrag = formatEuro(d.summen?.bruttoCent ?? 0, d.sprache)
    const inhalt = [
      vorlage?.text ?? `Rechnung ${d.nummer} über ${betrag} ist seit ${tage} Tagen überfällig.`,
      "",
      "---",
      `${STUFE_TEXT[stufe]} · Rechnung ${d.nummer} · ${kundeName(d)} · ${betrag} · ${tage} Tage überfällig`,
      empfaenger ? null : "Keine Mailadresse beim Kunden hinterlegt – bitte im Vorgang ergänzen.",
      `Verbindlich senden (setzt die Mahnstufe im Beleg): /finanz/vorgang/${d.id}`,
    ]
      .filter((z) => z !== null)
      .join("\n")

    const id = await legeFreigabeAn({
      art: "mail",
      titel: `${STUFE_TEXT[stufe]}: ${d.nummer} (${kundeName(d)})`,
      inhalt,
      empfaenger,
      betreff: vorlage?.betreff ?? `${STUFE_TEXT[stufe]} · Rechnung ${d.nummer}`,
      quelle: `forderung:${d.id}:${stufe}`,
      agent: "forderungen",
      extra: { warum: `${tage} Tage überfällig`, bezug: `finanz:${d.id}` },
    })
    if (!id) continue
    entwuerfe++

    if (stufe === 3) {
      const auftrag = await legeAuftragAn({
        von: "finanzen",
        an: "geschaeftsfuehrung",
        titel: `Forderung eskaliert: ${d.nummer} (${kundeName(d)})`,
        inhalt: `Rechnung ${d.nummer} über ${betrag} ist ${tage} Tage überfällig, die 2. Mahnung liegt als Entwurf bereit. Entscheide: persönlich anrufen, Ratenzahlung anbieten oder Inkasso/Mahnbescheid vorbereiten. Keine Zahlen erfinden.`,
        quelle: `forderung:${d.id}:eskalation`,
      })
      if (auftrag) eskaliert++
    }
  }

  const p = forderungsPrognose(rechnungen, heute)
  const teile = [
    entwuerfe ? `${entwuerfe} Mahn-Entwurf/-Entwürfe` : "Keine neue Mahnstufe fällig",
    eskaliert ? `${eskaliert} an die Geschäftsführung eskaliert` : null,
    `überfällig ${formatEuro(p.ueberfaelligCent)}`,
    `fällig in 30 Tagen ${formatEuro(p.faelligBaldCent)}`,
  ].filter(Boolean)
  return { ergebnis: teile.join(" · "), anzahl: entwuerfe }
}

/**
 * Freigabe einer Tahsilat-Karte = verbindlicher Versand wie /finanz/vorgang: offener Betrag,
 * Mahnstufe im Beleg, Verlaufseintrag. Die Stufe bestimmt die Regel zum Versandzeitpunkt,
 * nicht der Entwurf – war sie inzwischen bezahlt oder schon gemahnt, geht nichts raus.
 */
export async function sendeForderung(dokumentId: string): Promise<{ ok: true; id: string } | { ok: false; grund: string }> {
  const db = await finanzDb()
  if (!db) return { ok: false, grund: "Finanz-Speicher nicht verbunden." }
  const d = await ladeDokument(db, dokumentId)
  if (!d || d.art !== "rechnung" || !OFFEN.has(d.status)) return { ok: false, grund: "Rechnung ist nicht mehr offen – nichts gesendet." }
  const stufe = d.faelligAm ? naechsteMahnstufe(tageZwischen(d.faelligAm, heuteBerlin()), d.mahnstufe) : null
  if (!stufe) return { ok: false, grund: "Für diese Rechnung ist gerade keine Mahnstufe fällig – nichts gesendet." }
  const offenCent = d.status === "teilbezahlt" && d.summen ? d.summen.bruttoCent - (await bezahltCent(db, d.id)) : d.summen?.bruttoCent
  const mahnDokument = d.summen && offenCent !== undefined ? { ...d, summen: { ...d.summen, bruttoCent: offenCent } } : d
  const r = await sendeDokumentMail({ ...mahnDokument, mahnstufe: stufe }, `mahnung_${stufe}` as MailArt)
  if (!r.ok) return { ok: false, grund: r.grund }
  await vermerkeNachfass(db, d.id, stufe)
  return { ok: true, id: `forderung:${d.id}:${stufe}` }
}
