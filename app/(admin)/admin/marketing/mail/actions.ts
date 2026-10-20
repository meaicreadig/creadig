"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { siteUrl } from "@/lib/termine/mail"
import { einzelmailHtml, einzelmailText, type Einzelmail } from "@/lib/mailing/eml"
import { ergaenzeExtra, setzeFreigabe, setzeMailKopf } from "@/lib/assistent/store"
import { markiereAntwort, protokolliereStudioMail } from "@/lib/assistent/versand"
import { schreibeEinzelmail, schreibeKampagne, type KampagnenAnlass, type KiEinzelmail, type KiKampagne } from "@/lib/mailing/ki"
import {
  aktiveEmpfaenger,
  empfaengerEintragen,
  empfaengerStatus,
  kampagne,
  kampagneAbschliessen,
  kampagneAnlegen,
  kampagneLoeschen,
  kampagneSpeichern,
  kontaktFuerVerteiler,
  zustellungErgebnis,
  zustellungenVormerken,
  type Basis,
} from "@/lib/mailing/store"
import { anredeFuer, kampagnenHtml, kampagnenText, type KampagnenInhalt } from "@/lib/mailing/vorlage"

const PFAD = "/admin/marketing/mail"

async function darf(aendernd = true): Promise<boolean> {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd })
  return z.verdict === "ok" && Boolean(z.rolle) && darfBetreten(z.rolle, "/admin/marketing")
}

function bereinigt(k: KampagnenInhalt): KampagnenInhalt {
  return {
    subject: String(k.subject ?? "").trim().slice(0, 120),
    preheader: String(k.preheader ?? "").trim().slice(0, 160),
    headline: String(k.headline ?? "").trim().slice(0, 140),
    body: String(k.body ?? "").slice(0, 8000),
    ctaText: String(k.ctaText ?? "").trim().slice(0, 40),
    ctaUrl: String(k.ctaUrl ?? "").trim().slice(0, 500),
  }
}

function pruefen(k: KampagnenInhalt): string | null {
  if (!k.subject) return "Betreff fehlt."
  if (k.body.trim().length < 40) return "Inhalt ist zu kurz."
  if (k.ctaText && !/^https:\/\/[^\s]+$/.test(k.ctaUrl)) return "Knopf-Link muss mit https:// beginnen."
  return null
}

function absender() {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  const replyTo = process.env.MAIL_REPLY_TO?.trim() || process.env.LEAD_TO?.trim() || undefined
  return key && from ? { key, from, replyTo } : null
}

type Ergebnis = { ok: true; hinweis?: string } | { fehler: string }

export async function kiEntwurf(anlass: KampagnenAnlass, stichpunkte: string): Promise<KiKampagne> {
  if (!(await darf(false))) return { fehler: "Kein Zugang." }
  if (stichpunkte.trim().length < 10) return { fehler: "Bitte ein paar Stichpunkte eingeben." }
  return schreibeKampagne(anlass, stichpunkte)
}

/* Persönliche Einzelmail ------------------------------------------------------ */

function einzelBereinigt(m: Einzelmail): Einzelmail {
  const s = (v: unknown, n: number) => String(v ?? "").slice(0, n)
  return {
    an: s(m.an, 200).trim(),
    subject: s(m.subject, 140).trim(),
    preheader: s(m.preheader, 160).trim(),
    headline: s(m.headline, 140).trim(),
    anrede: s(m.anrede, 120).trim(),
    body: s(m.body, 8000),
    ctaText: s(m.ctaText, 40).trim(),
    ctaUrl: s(m.ctaUrl, 500).trim(),
    zweitText: s(m.zweitText, 40).trim(),
    zweitUrl: s(m.zweitUrl, 500).trim(),
  gruss: s(m.gruss, 60).trim(),
  absender: s(m.absender, 60).trim(),
  kennung: s(m.kennung, 60).trim(),
  ctaHinweis: s(m.ctaHinweis, 160).trim(),
  telefon: s(m.telefon, 40).trim(),
  kontaktMail: s(m.kontaktMail, 200).trim(),
  }
  }

export async function kiEinzelmail(anweisung: string, entwurf: Einzelmail): Promise<KiEinzelmail> {
  if (!(await darf(false))) return { fehler: "Kein Zugang." }
  if (anweisung.trim().length < 5) return { fehler: "Sag der KI kurz, was sie schreiben oder ändern soll." }
  const m = einzelBereinigt(entwurf)
  const bisher = m.body.trim()
    ? [`Betreff: ${m.subject}`, `Kennung: ${m.kennung}`, `Titel: ${m.headline}`, `Hinweis: ${m.ctaHinweis}`, `Anrede: ${m.anrede}`, m.body, `Knopf: ${m.ctaText}`, `Zweitknopf: ${m.zweitText}`, `Gruß: ${m.gruss}`].join("\n")
    : ""
  return schreibeEinzelmail(anweisung, bisher, m.an)
}

async function resendEinzelmail(roh: Einzelmail): Promise<{ ok: true; hinweis: string; mailId?: string } | { fehler: string }> {
  if (!(await darf())) return { fehler: "Kein Zugang." }
  const m = einzelBereinigt(roh)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.an)) return { fehler: "Empfänger-Adresse fehlt oder ist ungültig." }
  if (!m.subject || m.body.trim().length < 40) return { fehler: "Betreff oder Inhalt fehlt." }
  const a = absender()
  if (!a) return { fehler: "Mailversand ist nicht eingerichtet – nutze den .eml-Download." }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${a.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: a.from,
      to: [m.an],
      ...(a.replyTo ? { reply_to: a.replyTo, bcc: [a.replyTo] } : {}),
      subject: m.subject,
      html: einzelmailHtml(m, siteUrl()),
      text: einzelmailText(m),
    }),
  })
  if (!res.ok) return { fehler: `Versand fehlgeschlagen (${res.status}).` }
  const mailId = ((await res.json().catch(() => ({}))) as { id?: string }).id
  return { ok: true, mailId, hinweis: `An ${m.an} gesendet${a.replyTo ? ` (Kopie an ${a.replyTo})` : ""}.` }
}

function studioInhalt(m: Einzelmail): string {
  return [m.anrede, m.body].filter(Boolean).join("\n\n")
}

/** Frei im Mail Studio geschrieben: senden und ins Versandprotokoll (Antwort + Nachfassen). */
export async function einzelmailSenden(roh: Einzelmail): Promise<Ergebnis> {
  const r = await resendEinzelmail(roh)
  if ("ok" in r) {
    const m = einzelBereinigt(roh)
    await protokolliereStudioMail({ an: m.an, betreff: m.subject, inhalt: studioInhalt(m), mailId: r.mailId }).catch(() => undefined)
    revalidatePath(PFAD)
  }
  return r
}

/** Antwort eingegangen: Kette stoppen, kein weiteres Nachfassen. */
export async function antwortErhalten(formData: FormData): Promise<void> {
  if (!(await darf())) return
  const id = String(formData.get("id") ?? "").slice(0, 80)
  if (id) await markiereAntwort(id)
  revalidatePath(PFAD)
  revalidatePath("/admin/assistent")
}

/** Aus dem Assistenten geöffnet: senden und die Freigabe als gesendet markieren (startet das Nachfassen). */
export async function einzelmailFuerFreigabe(freigabeId: string, roh: Einzelmail): Promise<Ergebnis> {
  const r = await resendEinzelmail(roh)
  if ("ok" in r) {
    const m = einzelBereinigt(roh)
    await setzeMailKopf(freigabeId, m.an, m.subject).catch(() => undefined)
    await ergaenzeExtra(freigabeId, { gesendetAt: new Date().toISOString(), fehler: undefined, ...(r.mailId ? { mailId: r.mailId } : {}) }).catch(() => undefined)
    revalidatePath(PFAD)
    await setzeFreigabe(freigabeId, "freigegeben").catch(() => undefined)
    revalidatePath("/admin/assistent")
  }
  return r
}

export async function neueKampagne(): Promise<void> {
  if (!(await darf())) return
  const id = await kampagneAnlegen({ ctaUrl: `${siteUrl()}/termin` })
  redirect(`${PFAD}/${id}`)
}

export async function speichern(id: string, roh: KampagnenInhalt): Promise<Ergebnis> {
  if (!(await darf())) return { fehler: "Kein Zugang." }
  const ok = await kampagneSpeichern(id, bereinigt(roh))
  if (!ok) return { fehler: "Bereits versendete Kampagnen sind gesperrt." }
  revalidatePath(PFAD)
  return { ok: true }
}

export async function loeschen(id: string): Promise<void> {
  if (!(await darf())) return
  await kampagneLoeschen(id)
  revalidatePath(PFAD)
  redirect(PFAD)
}

export async function testSenden(id: string, roh: KampagnenInhalt): Promise<Ergebnis> {
  if (!(await darf())) return { fehler: "Kein Zugang." }
  const k = bereinigt(roh)
  const problem = pruefen(k)
  if (problem) return { fehler: problem }
  const a = absender()
  const an = process.env.MAIL_REPLY_TO?.trim() || process.env.LEAD_TO?.trim()
  if (!a || !an) return { fehler: "Mailversand ist nicht eingerichtet." }
  await kampagneSpeichern(id, k)
  const abmeldeUrl = `${siteUrl()}/mail/abmelden/test`
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${a.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: a.from,
      to: [an],
      subject: `[Test] ${k.subject}`,
      html: kampagnenHtml(k, { siteUrl: siteUrl(), abmeldeUrl, anrede: anredeFuer("Muhammed Emin Akyol") }),
      text: kampagnenText(k, { abmeldeUrl, anrede: anredeFuer("Muhammed Emin Akyol") }),
    }),
  })
  if (!res.ok) return { fehler: `Versand fehlgeschlagen (${res.status}).` }
  return { ok: true, hinweis: `Test an ${an} gesendet.` }
}

export async function versenden(id: string, roh: KampagnenInhalt): Promise<Ergebnis> {
  if (!(await darf())) return { fehler: "Kein Zugang." }
  const k = bereinigt(roh)
  const problem = pruefen(k)
  if (problem) return { fehler: problem }
  const a = absender()
  if (!a) return { fehler: "Mailversand ist nicht eingerichtet." }
  const vorhanden = await kampagne(id)
  if (!vorhanden) return { fehler: "Kampagne nicht gefunden." }
  if (vorhanden.status === "entwurf") await kampagneSpeichern(id, k)
  if ((await aktiveEmpfaenger()).length === 0) return { fehler: "Der Verteiler ist leer." }

  const basis = siteUrl()
  const offen = await zustellungenVormerken(id)
  let gesendet = 0
  let fehler = 0
  for (let i = 0; i < offen.length; i += 50) {
    const stapel = offen.slice(i, i + 50)
    const mails = stapel.map((z) => {
      const abmeldeUrl = `${basis}/mail/abmelden/${z.token}`
      const ctaHref = `${basis}/api/mail/k/${z.id}`
      const anrede = anredeFuer(z.name)
      return {
        from: a.from,
        to: [z.email],
        subject: k.subject,
        html: kampagnenHtml(k, { siteUrl: basis, abmeldeUrl, ctaHref, pixelUrl: `${basis}/api/mail/o/${z.id}`, anrede }),
        text: kampagnenText(k, { abmeldeUrl, ctaHref, anrede }),
        ...(a.replyTo ? { reply_to: a.replyTo } : {}),
        headers: {
          "List-Unsubscribe": `<${basis}/api/mail/abmelden/${z.token}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }
    })
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${a.key}`, "Content-Type": "application/json", "Idempotency-Key": `${id}-${i}-${stapel[0].id}` },
        body: JSON.stringify(mails),
      })
      if (res.ok) {
        await zustellungErgebnis(stapel.map((z) => z.id), true)
        gesendet += stapel.length
      } else {
        await zustellungErgebnis(stapel.map((z) => z.id), false, `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
        fehler += stapel.length
      }
    } catch (e) {
      await zustellungErgebnis(stapel.map((z) => z.id), false, String(e).slice(0, 300))
      fehler += stapel.length
    }
  }
  if (gesendet > 0) await kampagneAbschliessen(id)
  revalidatePath(PFAD)
  revalidatePath(`${PFAD}/${id}`)
  if (gesendet === 0 && fehler === 0) return { ok: true, hinweis: "Alle Empfänger hatten diese Kampagne bereits." }
  if (gesendet === 0) return { fehler: `Versand fehlgeschlagen (${fehler} Empfänger).` }
  return { ok: true, hinweis: `${gesendet} Mails versendet${fehler ? `, ${fehler} fehlgeschlagen` : ""}.` }
}

/* Verteiler ---------------------------------------------------------------- */

function basisAus(v: FormDataEntryValue | null): Basis | null {
  return v === "einwilligung" || v === "bestandskunde" ? v : null
}

export async function empfaengerHinzufuegen(formData: FormData): Promise<void> {
  if (!(await darf())) return
  const email = String(formData.get("email") ?? "").trim()
  const basis = basisAus(formData.get("basis"))
  const quelle = String(formData.get("quelle") ?? "").trim().slice(0, 200)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !basis || quelle.length < 3 || formData.get("bestaetigt") !== "1") return
  const name = String(formData.get("name") ?? "").trim().slice(0, 120) || null
  await empfaengerEintragen({ email: email.slice(0, 200), name, basis, source: quelle })
  revalidatePath(PFAD)
}

export async function kontakteUebernehmen(formData: FormData): Promise<void> {
  if (!(await darf())) return
  const basis = basisAus(formData.get("basis"))
  const quelle = String(formData.get("quelle") ?? "").trim().slice(0, 200)
  if (!basis || quelle.length < 3 || formData.get("bestaetigt") !== "1") return
  const ids = formData.getAll("kontakt").map(String).slice(0, 200)
  for (const id of ids) {
    const c = await kontaktFuerVerteiler(id.slice(0, 80))
    if (c) await empfaengerEintragen({ email: c.email, name: c.name, basis, source: quelle, contactId: c.id })
  }
  revalidatePath(PFAD)
}

export async function empfaengerUmschalten(formData: FormData): Promise<void> {
  if (!(await darf())) return
  const id = String(formData.get("id") ?? "").slice(0, 80)
  const status = formData.get("status") === "aktiv" ? "aktiv" : "abgemeldet"
  await empfaengerStatus(id, status)
  revalidatePath(PFAD)
}
