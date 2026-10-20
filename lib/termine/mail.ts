import "server-only"

import type { Termin } from "@/lib/termine/store"

/**
 * CreaDIGMailLayout — eine HTML-Hülle für alle Termin-Mails, plus ICS.
 * Tabellen-Layout und Inline-Styles, damit Outlook, Apple Mail und Gmail
 * gleich aussehen; helles Schema, Dark-Mode-Clients invertieren lesbar.
 */

const NACHT = "#0F1B2D"
const GOLD = "#BE904E"
const TEXT = "#1C2433"
const GRAU = "#5B6474"
const LINIE = "#E4E1DA"

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim()
  if (raw) return raw.replace(/\/$/, "")
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return "https://creadig.de"
}

export function mailLayout(o: {
  vorschau: string
  titel: string
  absaetze: string[]
  knopf?: { text: string; href: string }
  details?: [string, string][]
}): string {
  const absaetze = o.absaetze
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${TEXT}">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("")
  const details = o.details?.length
    ? `<table role="presentation" width="100%" style="border-collapse:collapse;margin:8px 0 20px;border:1px solid ${LINIE};border-radius:8px">${o.details
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px 14px;font-size:13px;color:${GRAU};width:38%;border-bottom:1px solid ${LINIE}">${esc(k)}</td><td style="padding:10px 14px;font-size:14px;color:${TEXT};border-bottom:1px solid ${LINIE}">${esc(v)}</td></tr>`,
        )
        .join("")}</table>`
    : ""
  const knopf = o.knopf
    ? `<table role="presentation" style="margin:4px 0 24px"><tr><td style="background:${NACHT};border-radius:6px"><a href="${esc(o.knopf.href)}" style="display:inline-block;padding:13px 22px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none">${esc(o.knopf.text)}</a></td></tr></table>`
    : ""
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(o.titel)}</title></head>
<body style="margin:0;padding:0;background:#F3F2EF;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${esc(o.vorschau)}</span>
<table role="presentation" width="100%" style="background:#F3F2EF"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border-radius:10px;overflow:hidden">
<tr><td style="background:${NACHT};padding:20px 28px"><span style="font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:0.02em">crea<span style="color:${GOLD}">DIG</span></span></td></tr>
<tr><td style="height:3px;background:${GOLD}"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 18px;font-size:20px;line-height:1.3;color:${NACHT}">${esc(o.titel)}</h1>
${absaetze}${details}${knopf}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid ${LINIE};font-size:12px;line-height:1.6;color:${GRAU}">
creaDIG solutions UG (haftungsbeschränkt) · <a href="${siteUrl()}/impressum" style="color:${GRAU}">Impressum</a> · <a href="${siteUrl()}/datenschutz" style="color:${GRAU}">Datenschutz</a><br>
Sie möchten keine weiteren Nachrichten? Eine kurze Antwort auf diese Mail genügt.
</td></tr></table></td></tr></table></body></html>`
}

/* ------------------------------------------------------------------------ */
/* ICS                                                                       */
/* ------------------------------------------------------------------------ */

function icsZeit(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}
function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
}

export function icsEreignis(t: Termin, o: { titel: string; beschreibung: string; methode?: "REQUEST" | "PUBLISH" | "CANCEL" }): string {
  const status = t.status === "cancelled" ? "CANCELLED" : "CONFIRMED"
  return [
    "BEGIN:VEVENT",
    `UID:${t.id}@creadig`,
    `DTSTAMP:${icsZeit(new Date().toISOString())}`,
    `DTSTART:${icsZeit(t.startsAt)}`,
    `DTEND:${icsZeit(t.endsAt)}`,
    `SUMMARY:${icsText(o.titel)}`,
    `DESCRIPTION:${icsText(o.beschreibung)}`,
    `STATUS:${status}`,
    "END:VEVENT",
  ].join("\r\n")
}

export function icsKalender(ereignisse: string[], methode: "REQUEST" | "PUBLISH" | "CANCEL" = "PUBLISH", name = "creaDIG Termine"): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//creaDIG//Termine//DE",
    "CALSCALE:GREGORIAN",
    `METHOD:${methode}`,
    `X-WR-CALNAME:${icsText(name)}`,
    ...ereignisse,
    "END:VCALENDAR",
    "",
  ].join("\r\n")
}

/* ------------------------------------------------------------------------ */
/* Versand                                                                   */
/* ------------------------------------------------------------------------ */

export type Versand = { ok: true } | { ok: false; grund: "nicht_eingerichtet" | "fehler"; detail?: string }

export function mailEingerichtet(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && (process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()))
}

export async function sendeMail(m: {
  to: string
  subject: string
  html: string
  text: string
  ics?: string
  replyTo?: string
  /** Überschreibt nur den Anzeigenamen, die Absenderadresse bleibt die verifizierte. */
  fromName?: string
}): Promise<Versand> {
  const key = process.env.RESEND_API_KEY?.trim()
  const roh = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  if (!key || !roh) return { ok: false, grund: "nicht_eingerichtet" }
  const from = m.fromName ? `${m.fromName.replace(/[<>"]/g, "")} <${roh.match(/<([^>]+)>/)?.[1] ?? roh}>` : roh
  const replyTo = m.replyTo ?? (process.env.MAIL_REPLY_TO?.trim() || process.env.LEAD_TO?.trim() || undefined)
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [m.to],
      subject: m.subject,
      html: m.html,
      text: m.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(m.ics
        ? { attachments: [{ filename: "termin.ics", content: Buffer.from(m.ics, "utf8").toString("base64"), content_type: "text/calendar; charset=utf-8" }] }
        : {}),
    }),
  })
  if (!res.ok) return { ok: false, grund: "fehler", detail: `Resend ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}` }
  return { ok: true }
}

export function terminZeitText(t: { startsAt: string; endsAt: string }, timezone = "Europe/Berlin"): string {
  const s = new Date(t.startsAt)
  const e = new Date(t.endsAt)
  const tag = s.toLocaleDateString("de-DE", { timeZone: timezone, weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const von = s.toLocaleTimeString("de-DE", { timeZone: timezone, hour: "2-digit", minute: "2-digit" })
  const bis = e.toLocaleTimeString("de-DE", { timeZone: timezone, hour: "2-digit", minute: "2-digit" })
  return `${tag}, ${von}–${bis} Uhr`
}
