import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { heuteBerlin, naechsteMahnstufe, tageZwischen } from "@/lib/finanz/auftraege/rechnen"
import { ladeDokumente } from "@/lib/finanz/auftraege/store"
import { berechneLage } from "@/lib/finanz/lage"
import { ladeBelege } from "@/lib/finanz/belege"
import { ladeOffeneBankUmsaetze } from "@/lib/finanz/bank-abgleich"
import { protokolliere } from "@/lib/finanz/store"
import { mailLayout, sendeMail, siteUrl } from "@/lib/termine/mail"

/**
 * Besitzer-Morgenmail (Phase 7) — fasst zusammen, was heute Aufmerksamkeit
 * braucht. Verschickt NIE selbst eine Mahnung oder Buchung — jeder
 * Mahnungsversand bleibt ein Klick in /finanz/vorgang/[id] (nachfassen()),
 * jede Belegzuordnung und jeder Bank-Abgleich ebenso. Diese Mail ist ein
 * Hinweis, keine Handlung. Höchstens eine pro Tag (siehe sendeMorgenmailFallsFaellig()).
 */

export type MorgenBericht = {
  heute: string
  faelligeMahnungen: { id: string; nummer: string; kunde: string; stufe: number; tageUeberfaellig: number }[]
  fristen: { titel: string; faellig: string; tageBis: number }[]
  paragraph19Hinweis: string | null
  belegeImKorb: number
  bankUmsaetzeOffen: number
  /** Kompass()-Hinweise mit schwere="neutral" — Wachstum/Kapital, keine Störung, aber auch nicht nur bei Problemen interessant. */
  wachstumsHinweise: string[]
}

export async function erstelleMorgenBericht(db: Abfrage): Promise<MorgenBericht> {
  const heute = heuteBerlin()
  const [lage, rechnungen, belege, bankUmsaetze] = await Promise.all([
    berechneLage(db),
    ladeDokumente(db, ["rechnung"]),
    ladeBelege(db, null),
    ladeOffeneBankUmsaetze(db),
  ])

  const faelligeMahnungen = rechnungen
    .filter((d) => (d.status === "versendet" || d.status === "teilbezahlt") && d.faelligAm)
    .map((d) => {
      const tage = tageZwischen(d.faelligAm as string, heute)
      const stufe = naechsteMahnstufe(tage, d.mahnstufe)
      return stufe ? { id: d.id, nummer: d.nummer ?? "", kunde: d.kunde.firma || d.kunde.name, stufe: Number(stufe), tageUeberfaellig: tage } : null
    })
    .filter((x): x is { id: string; nummer: string; kunde: string; stufe: number; tageUeberfaellig: number } => x !== null)

  const fristen = lage.fristen
    .filter((f) => !f.erledigt && tageZwischen(heute, f.faellig) <= 14)
    .map((f) => ({ titel: f.titel, faellig: f.faellig, tageBis: tageZwischen(heute, f.faellig) }))

  const paragraph19Hinweis = lage.hinweise.find((h) => h.text.includes("§ 19"))?.text ?? null
  const wachstumsHinweise = lage.hinweise.filter((h) => h.schwere === "neutral").map((h) => h.text)

  return { heute, faelligeMahnungen, fristen, paragraph19Hinweis, belegeImKorb: belege.korbAnzahl, bankUmsaetzeOffen: bankUmsaetze.length, wachstumsHinweise }
}

/** "Ruhig" meint: nichts Dringendes — Wachstumshinweise zählen bewusst nicht mit, die sind gerade an ruhigen Tagen am nützlichsten. */
function istDringend(b: MorgenBericht): boolean {
  return b.faelligeMahnungen.length > 0 || b.fristen.length > 0 || Boolean(b.paragraph19Hinweis) || b.belegeImKorb > 0 || b.bankUmsaetzeOffen > 0
}

const STUFEN_TEXT = ["", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"]

function berichtMail(b: MorgenBericht): { subject: string; text: string; html: string } {
  const basis = siteUrl()
  const absaetze: string[] = []
  const details: [string, string][] = []
  const dringend = istDringend(b)

  if (!dringend) {
    absaetze.push("Heute ist nichts Dringendes offen — kein Mahnungsfall, keine Frist in den nächsten 14 Tagen, kein unbearbeiteter Eingang.")
  } else {
    if (b.faelligeMahnungen.length) {
      details.push([
        "Fällige Mahnungen",
        b.faelligeMahnungen.map((m) => `${m.nummer} · ${m.kunde} · ${STUFEN_TEXT[m.stufe]} (${m.tageUeberfaellig} Tage überfällig)`).join("\n"),
      ])
    }
    if (b.fristen.length) {
      details.push(["Fristen (≤14 Tage)", b.fristen.map((f) => `${f.titel} · fällig ${f.faellig} (${f.tageBis >= 0 ? `in ${f.tageBis} Tagen` : `${-f.tageBis} Tage überfällig`})`).join("\n")])
    }
    if (b.paragraph19Hinweis) details.push(["§ 19 Kleinunternehmer", b.paragraph19Hinweis])
    if (b.belegeImKorb > 0) details.push(["Belege im Eingangskorb", `${b.belegeImKorb} Beleg(e) noch ohne Geschäftsfeld`])
    if (b.bankUmsaetzeOffen > 0) details.push(["Bank-Import", `${b.bankUmsaetzeOffen} Umsatz/Umsätze warten auf Zuordnung`])
    absaetze.push("Kurzer Überblick über das, was heute Aufmerksamkeit braucht. Nichts davon wurde automatisch verschickt oder gebucht — jede Handlung bleibt ein Klick in Finanz.")
  }
  if (b.wachstumsHinweise.length) details.push(["Wachstum & Kapital", b.wachstumsHinweise.join("\n")])

  const text = `${absaetze.join("\n\n")}\n\n${details.map(([k, v]) => `${k}:\n${v}`).join("\n\n")}\n\n${basis}/finanz`
  const html = mailLayout({
    vorschau: dringend ? "Kurzer Finanz-Überblick für heute." : "Heute ist nichts Dringendes offen.",
    titel: `Finanz-Überblick · ${b.heute}`,
    absaetze,
    details,
    knopf: { text: "In Finanz öffnen", href: `${basis}/finanz` },
  })
  return { subject: dringend ? `Finanz-Überblick · ${b.heute}` : `Finanz: alles ruhig · ${b.heute}`, text, html }
}

/** Höchstens eine Morgenmail pro Tag — ein zweiter Cron-Lauf oder ein manueller Trigger am selben Tag verschickt nichts erneut. */
export async function sendeMorgenmailFallsFaellig(db: Abfrage): Promise<{ versendet: boolean; grund?: string }> {
  const heute = heuteBerlin()
  const [schon] = await db(`SELECT 1 FROM fin_protokoll WHERE aktion = 'morgenmail_gesendet' AND daten->>'datum' = $1 LIMIT 1`, [heute])
  if (schon) return { versendet: false, grund: "heute bereits verschickt" }

  const to = process.env.LEAD_TO?.trim()
  if (!to) return { versendet: false, grund: "LEAD_TO fehlt — keine Empfängeradresse eingerichtet" }

  const bericht = await erstelleMorgenBericht(db)
  const mail = berichtMail(bericht)
  const versand = await sendeMail({ to, subject: mail.subject, text: mail.text, html: mail.html })
  if (!versand.ok) return { versendet: false, grund: versand.grund === "nicht_eingerichtet" ? "RESEND_API_KEY/MAIL_FROM fehlt" : versand.detail }

  await protokolliere(db, "morgenmail_gesendet", { datum: heute, mahnungen: bericht.faelligeMahnungen.length, fristen: bericht.fristen.length, belegeImKorb: bericht.belegeImKorb, bankUmsaetzeOffen: bericht.bankUmsaetzeOffen, wachstumsHinweise: bericht.wachstumsHinweise.length })
  return { versendet: true }
}
