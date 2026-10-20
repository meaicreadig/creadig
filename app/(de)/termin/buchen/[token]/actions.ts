"use server"

import { headers } from "next/headers"

import { bucketKey, withinLimit } from "@/lib/lead-guard"
import { icsEreignis, icsKalender, mailLayout, sendeMail, terminZeitText } from "@/lib/termine/mail"
import { bucheTermin, holeEinstellungen, linkSprache } from "@/lib/termine/store"
import { TERMIN_TEXTE } from "@/lib/termine/texte"

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
  /* Die Sprache kommt aus dem Link in der Datenbank, nie vom Browser. */
  const sprache = await linkSprache(String(eingabe.token ?? ""))
  const F = TERMIN_TEXTE[sprache].fehler
  if (eingabe.website) return { ok: false, fehler: F.abgelehnt }
  const name = String(eingabe.name ?? "").trim().slice(0, 120)
  const email = String(eingabe.email ?? "").trim().toLowerCase().slice(0, 200)
  const note = String(eingabe.note ?? "").trim().slice(0, 1000) || null
  if (name.length < 2) return { ok: false, fehler: F.name }
  if (!EMAIL.test(email)) return { ok: false, fehler: F.email }
  if (!Number.isInteger(eingabe.start)) return { ok: false, fehler: F.start }

  const h = await headers()
  const adresse = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  if (!withinLimit(await bucketKey("termin-buchen", adresse), 8, Date.now())) {
    return { ok: false, fehler: F.zuViele }
  }

  const ergebnis = await bucheTermin({ token: eingabe.token, start: eingabe.start, name, email, note })
  if (!ergebnis.ok) {
    if (ergebnis.grund === "vergeben") return { ok: false, fehler: F.vergeben, neuLaden: true }
    if (ergebnis.grund === "link") return { ok: false, fehler: F.link, neuLaden: true }
    return { ok: false, fehler: F.spaeter }
  }

  const { termin } = ergebnis
  const T = TERMIN_TEXTE[termin.locale]
  const { timezone } = await holeEinstellungen()
  const zeit = terminZeitText(termin, timezone, termin.locale)
  const art = T.art[termin.meetingKind as keyof typeof T.art] ?? T.art.kennenlernen
  const details: [string, string][] = [
    [T.mail.labelTermin, zeit],
    [T.mail.labelArt, art],
    [T.mail.labelReferenz, termin.reference],
  ]

  const gastText = T.mail.bestaetigtText(termin.guestName)
  const ics = icsKalender([icsEreignis(termin, { titel: T.mail.ics(art), beschreibung: `${T.mail.labelReferenz} ${termin.reference}` })], "PUBLISH")
  /* Die Inhaber-Mail bleibt deutsch: Sie geht an uns, nicht an den Gast. */
  const de = TERMIN_TEXTE.de
  const artDe = de.art[termin.meetingKind as keyof typeof de.art] ?? de.art.kennenlernen
  const zeitDe = terminZeitText(termin, timezone, "de")
  const detailsDe: [string, string][] = [["Termin", zeitDe], ["Art", artDe], ["Referenz", termin.reference]]
  const ownerIcs = icsKalender([icsEreignis(termin, { titel: `${artDe}: ${termin.guestName}`, beschreibung: `${termin.guestEmail}${termin.guestNote ? `\n${termin.guestNote}` : ""}\nReferenz ${termin.reference}` })], "PUBLISH")

  /* Mailfehler kippen die Buchung nicht — der Termin steht in der Datenbank. */
  await Promise.allSettled([
    sendeMail({
      to: termin.guestEmail,
      subject: T.mail.bestaetigtSubject(zeit),
      text: `${gastText.join("\n\n")}\n\n${details.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
      html: mailLayout({ vorschau: T.mail.bestaetigtVorschau(zeit), titel: T.mail.bestaetigtTitel, absaetze: gastText, details, locale: termin.locale }),
      ics,
    }),
    process.env.LEAD_TO?.trim()
      ? sendeMail({
          to: process.env.LEAD_TO.trim(),
          subject: `Neue Buchung · ${termin.guestName} · ${zeitDe}`,
          text: `${termin.guestName} <${termin.guestEmail}> hat gebucht (Sprache: ${termin.locale}).\n${detailsDe.map(([k, v]) => `${k}: ${v}`).join("\n")}${termin.guestNote ? `\nNotiz: ${termin.guestNote}` : ""}`,
          html: mailLayout({
            vorschau: `${termin.guestName} hat gebucht`,
            titel: "Neue Terminbuchung",
            absaetze: [`${termin.guestName} (${termin.guestEmail}) hat einen Termin gebucht.`, ...(termin.guestNote ? [`Notiz: ${termin.guestNote}`] : [])],
            details: detailsDe,
          }),
          ics: ownerIcs,
          replyTo: termin.guestEmail,
        })
      : Promise.resolve(),
  ])

  return { ok: true, reference: termin.reference, zeit }
}
