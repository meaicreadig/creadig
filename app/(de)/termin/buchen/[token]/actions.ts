"use server"

import { headers } from "next/headers"

import { bucketKey, withinLimit } from "@/lib/lead-guard"
import { icsEreignis, icsKalender, mailLayout, sendeMail, terminZeitText } from "@/lib/termine/mail"
import { GESPRAECHSARTEN, bucheTermin, holeEinstellungen } from "@/lib/termine/store"

export type BuchenAntwort =
  | { ok: true; reference: string; zeit: string }
  | { ok: false; fehler: string; neuLaden?: boolean }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function terminBuchen(eingabe: {
  token: string
  start: number
  name: string
  email: string
  note: string
  website: string
}): Promise<BuchenAntwort> {
  if (eingabe.website) return { ok: false, fehler: "Anfrage abgelehnt." }
  const name = String(eingabe.name ?? "").trim().slice(0, 120)
  const email = String(eingabe.email ?? "").trim().toLowerCase().slice(0, 200)
  const note = String(eingabe.note ?? "").trim().slice(0, 1000) || null
  if (name.length < 2) return { ok: false, fehler: "Bitte Ihren Namen angeben." }
  if (!EMAIL.test(email)) return { ok: false, fehler: "Bitte eine gültige E-Mail-Adresse angeben." }
  if (!Number.isInteger(eingabe.start)) return { ok: false, fehler: "Bitte einen Termin wählen." }

  const h = await headers()
  const adresse = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  if (!withinLimit(await bucketKey("termin-buchen", adresse), 8, Date.now())) {
    return { ok: false, fehler: "Zu viele Versuche. Bitte in einigen Minuten erneut." }
  }

  const ergebnis = await bucheTermin({ token: eingabe.token, start: eingabe.start, name, email, note })
  if (!ergebnis.ok) {
    if (ergebnis.grund === "vergeben") return { ok: false, fehler: "Dieser Termin wurde gerade vergeben. Bitte einen anderen wählen.", neuLaden: true }
    if (ergebnis.grund === "link") return { ok: false, fehler: "Dieser Buchungslink ist nicht mehr gültig.", neuLaden: true }
    return { ok: false, fehler: "Buchung gerade nicht möglich. Bitte später erneut." }
  }

  const { termin } = ergebnis
  const { timezone } = await holeEinstellungen()
  const zeit = terminZeitText(termin, timezone)
  const art = GESPRAECHSARTEN[termin.meetingKind as keyof typeof GESPRAECHSARTEN]?.label ?? "Gespräch"
  const details: [string, string][] = [
    ["Termin", zeit],
    ["Art", art],
    ["Referenz", termin.reference],
  ]

  const gastText = [`Hallo ${termin.guestName},`, "vielen Dank – Ihr Termin ist eingetragen. Die Kalenderdatei hängt an.", "Falls etwas dazwischenkommt, antworten Sie einfach auf diese Mail.", "Viele Grüße\nMuhammed Emin Akyol · creaDIG"]
  const ics = icsKalender([icsEreignis(termin, { titel: `${art} mit creaDIG`, beschreibung: `Referenz ${termin.reference}` })], "PUBLISH")
  const ownerIcs = icsKalender([icsEreignis(termin, { titel: `${art}: ${termin.guestName}`, beschreibung: `${termin.guestEmail}${termin.guestNote ? `\n${termin.guestNote}` : ""}\nReferenz ${termin.reference}` })], "PUBLISH")

  /* Mailfehler kippen die Buchung nicht — der Termin steht in der Datenbank. */
  await Promise.allSettled([
    sendeMail({
      to: termin.guestEmail,
      subject: `Termin bestätigt · ${zeit}`,
      text: `${gastText.join("\n\n")}\n\n${details.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
      html: mailLayout({ vorschau: `Ihr Termin am ${zeit}`, titel: "Ihr Termin ist bestätigt", absaetze: gastText, details }),
      ics,
    }),
    process.env.LEAD_TO?.trim()
      ? sendeMail({
          to: process.env.LEAD_TO.trim(),
          subject: `Neue Buchung · ${termin.guestName} · ${zeit}`,
          text: `${termin.guestName} <${termin.guestEmail}> hat gebucht.\n${details.map(([k, v]) => `${k}: ${v}`).join("\n")}${termin.guestNote ? `\nNotiz: ${termin.guestNote}` : ""}`,
          html: mailLayout({
            vorschau: `${termin.guestName} hat gebucht`,
            titel: "Neue Terminbuchung",
            absaetze: [`${termin.guestName} (${termin.guestEmail}) hat einen Termin gebucht.`, ...(termin.guestNote ? [`Notiz: ${termin.guestNote}`] : [])],
            details,
          }),
          ics: ownerIcs,
          replyTo: termin.guestEmail,
        })
      : Promise.resolve(),
  ])

  return { ok: true, reference: termin.reference, zeit }
}
