"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { plusTage, geschaeftsTag } from "@/lib/geschaeftszeit"
import { mailLayout, sendeMail, siteUrl, terminZeitText } from "@/lib/termine/mail"
import {
  GESPRAECHSARTEN,
  einladungsKontakt,
  entferneSperre,
  holeEinstellungen,
  legeBuchungslinkAn,
  legeSperreAn,
  protokolliere,
  sageTerminAb,
  setzeNaechstenSchritt,
  speichereEinstellungen,
  type Gespraechsart,
  type Sperre,
} from "@/lib/termine/store"
import { gueltigesRaster, ortszeitZuUtc, type Wochenraster } from "@/lib/termine/verfuegbarkeit"

const PFAD = "/admin/termine"

async function rolle(): Promise<string> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, PFAD)) throw new Error("Nicht berechtigt")
  return zugang.rolle
}

function feld(form: FormData, name: string, max = 300): string | null {
  const v = form.get(name)
  if (typeof v !== "string") return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

function zahl(form: FormData, name: string, min: number, max: number, standard: number): number {
  const n = Number(form.get(name))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : standard
}

function zurueck(meldung: string, extra = ""): never {
  redirect(`${PFAD}?meldung=${encodeURIComponent(meldung)}${extra}`)
}

/* ------------------------------------------------------------------------ */

export async function verfuegbarkeitSpeichern(form: FormData): Promise<void> {
  const von = await rolle()
  const week: Wochenraster = {}
  for (let d = 0; d <= 6; d++) {
    const roh = feld(form, `w${d}`, 200)
    if (!roh) continue
    week[String(d)] = roh
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.split(/\s*[-–]\s*/).map((x) => x.padStart(5, "0")) as [string, string])
  }
  if (!gueltigesRaster(week)) zurueck("Zeiten bitte als 09:00-12:00, 13:00-17:00 eingeben.")
  const alt = await holeEinstellungen()
  await speichereEinstellungen(
    {
      timezone: alt.timezone,
      week,
      bufferMin: zahl(form, "puffer", 0, 120, alt.bufferMin),
      minNoticeHours: zahl(form, "vorlauf", 0, 336, alt.minNoticeHours),
      horizonDays: zahl(form, "horizont", 1, 90, alt.horizonDays),
    },
    von,
  )
  revalidatePath(PFAD)
  zurueck("Verfügbarkeit gespeichert.")
}

export async function sperreAnlegen(form: FormData): Promise<void> {
  const von = await rolle()
  const kind = (feld(form, "art") ?? "unavailable") as Sperre["kind"]
  if (!["unavailable", "tentative", "soft_hold"].includes(kind)) zurueck("Unbekannte Art.")
  const tagVon = feld(form, "tag_von")
  const tagBis = feld(form, "tag_bis") ?? tagVon
  if (!tagVon || !tagBis || !/^\d{4}-\d{2}-\d{2}$/.test(tagVon) || !/^\d{4}-\d{2}-\d{2}$/.test(tagBis)) zurueck("Bitte ein Datum wählen.")
  const { timezone } = await holeEinstellungen()
  const zeitVon = feld(form, "zeit_von") ?? "00:00"
  const zeitBis = feld(form, "zeit_bis")
  const start = ortszeitZuUtc(tagVon, zeitVon, timezone)
  const end = zeitBis ? ortszeitZuUtc(tagBis, zeitBis, timezone) : ortszeitZuUtc(plusTage(tagBis, 1), "00:00", timezone)
  if (!(end > start)) zurueck("Das Ende muss nach dem Beginn liegen.")
  await legeSperreAn({ kind, start, end, label: feld(form, "label", 120) }, von)
  revalidatePath(PFAD)
  zurueck("Sperre eingetragen.")
}

export async function sperreEntfernen(form: FormData): Promise<void> {
  await rolle()
  const id = feld(form, "id", 80)
  if (id) await entferneSperre(id)
  revalidatePath(PFAD)
  zurueck("Sperre entfernt.")
}

export async function terminAbsagen(form: FormData): Promise<void> {
  const von = await rolle()
  const id = feld(form, "id", 80)
  if (!id) zurueck("Termin fehlt.")
  const grund = feld(form, "grund", 300)
  const termin = await sageTerminAb(id, grund, von)
  if (!termin) zurueck("Termin war schon abgesagt.")
  const zeit = terminZeitText(termin)
  const text = [
    `Hallo ${termin.guestName},`,
    `leider muss ich unseren Termin am ${zeit} absagen.${grund ? ` ${grund}` : ""}`,
    "Ich melde mich mit einem neuen Vorschlag.",
    "Viele Grüße\nMuhammed Emin Akyol · creaDIG",
  ]
  await sendeMail({
    to: termin.guestEmail,
    subject: `Termin abgesagt · ${termin.reference}`,
    text: text.join("\n\n"),
    html: mailLayout({ vorschau: "Ihr Termin wurde abgesagt", titel: "Termin abgesagt", absaetze: text, details: [["Termin", zeit], ["Referenz", termin.reference]] }),
  })
  revalidatePath(PFAD)
  zurueck("Termin abgesagt, Gast informiert.")
}

/* ------------------------------------------------------------------------ */
/* Terminmail an einen Kontakt                                               */
/* ------------------------------------------------------------------------ */

export async function terminmailSenden(form: FormData): Promise<void> {
  const von = await rolle()
  const kontaktId = feld(form, "kontakt", 80)
  if (!kontaktId) zurueck("Kontakt fehlt.")
  const kontakt = await einladungsKontakt(kontaktId)
  const ziel = `&kontakt=${encodeURIComponent(kontaktId)}`
  if (!kontakt) zurueck("Kontakt nicht gefunden.")
  if (kontakt.gesperrt) zurueck(`Nicht senden: Kontakt ist gesperrt (${kontakt.gesperrt}).`, ziel)

  const test = form.get("test") === "1"
  const empfaenger = test ? process.env.LEAD_TO?.trim() : kontakt.email
  if (!empfaenger) zurueck(test ? "Keine Testadresse (LEAD_TO) hinterlegt." : "Kontakt hat keine E-Mail-Adresse.", ziel)

  const art = (feld(form, "art") ?? "kennenlernen") as Gespraechsart
  if (!(art in GESPRAECHSARTEN)) zurueck("Unbekannte Gesprächsart.", ziel)
  const betreff = feld(form, "betreff", 160)
  const text = feld(form, "text", 4000)
  if (!betreff || !text) zurueck("Betreff und Text dürfen nicht leer sein.", ziel)
  if (!text.includes("{link}")) zurueck("Der Text braucht den Platzhalter {link} für den Buchungslink.", ziel)
  /* Offene Platzhalter = unfertige Personalisierung → nicht senden. */
  const offen = text.replace("{link}", "").match(/\{[^}]+\}|\[[A-ZÄÖÜ ]{3,}\]/)
  if (offen) zurueck(`Text enthält noch einen Platzhalter: ${offen[0]}`, ziel)

  const woche = feld(form, "woche", 10)
  const windowFrom = woche && /^\d{4}-\d{2}-\d{2}$/.test(woche) ? woche : null
  const token = await legeBuchungslinkAn({
    contactId: kontakt.id,
    organisationId: kontakt.organisationId,
    meetingKind: art,
    topic: feld(form, "thema", 160),
    windowFrom,
    windowTo: windowFrom ? plusTage(windowFrom, 6) : null,
    gueltigTage: zahl(form, "gueltig", 1, 30, 10),
    von,
  })
  const link = `${siteUrl()}/termin/buchen/${token}`
  const fertig = text.replace("{link}", link)
  const absaetze = fertig.split(/\n{2,}/)

  const versand = await sendeMail({
    to: empfaenger,
    subject: test ? `[TEST] ${betreff}` : betreff,
    text: fertig,
    html: mailLayout({ vorschau: betreff, titel: betreff, absaetze: absaetze.map((p) => p.replace(link, "").trim()).filter(Boolean), knopf: { text: "Termin wählen", href: link } }),
  })
  if (!versand.ok) zurueck(versand.grund === "nicht_eingerichtet" ? "Mailversand ist nicht eingerichtet." : `Versand fehlgeschlagen: ${versand.detail ?? ""}`, ziel)

  await protokolliere(kontakt.id, test ? "terminmail_test" : "terminmail", `${test ? "Test-" : ""}Terminmail gesendet · ${GESPRAECHSARTEN[art].label}`, { token: token.slice(0, 6), an: test ? "test" : "kontakt" }, von)
  if (!test) await setzeNaechstenSchritt(kontakt.id, "Auf Terminbuchung warten", plusTage(geschaeftsTag(), 3))
  revalidatePath(PFAD)
  zurueck(test ? `Testmail an ${empfaenger} gesendet.` : `Terminmail an ${kontakt.name} gesendet.`, test ? ziel : "")
}
