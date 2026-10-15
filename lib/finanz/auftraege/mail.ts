import "server-only"

import { siteUrl } from "@/lib/termine/mail"
import { LOGO_PFAD } from "@/lib/mailing/vorlage"
import { DOK_TEXT, formatDatum, formatEuro, type Sprache } from "@/lib/finanz/auftraege/rechnen"
import type { Dokument } from "@/lib/finanz/auftraege/store"

/**
 * Mails rund um Angebot & Rechnung — Webseiten-Design (hell, Blau, runde Karten,
 * keine Linien), Tabellen + Inline-Styles für Outlook/Gmail. Der Kunde bekommt
 * immer einen persönlichen Link zur Online-Ansicht (dort: annehmen, drucken, PDF).
 */

export type MailArt = "versand" | "nachfrage" | "mahnung_1" | "mahnung_2" | "mahnung_3" | "bestaetigung"

const BLAU = "#2F5BEA"
const TINTE = "#0D1A2E"
const TEXT = "#33405A"
const GRAU = "#6B7891"
const NEBEL = "#EEF3FF"
const ZEMIN = "#F5F7FA"
const GOLD = "#BE904E"
const TITEL = "Manrope,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif"
const SCHRIFT = "'M PLUS Rounded 1c','Segoe UI',-apple-system,Helvetica,Arial,sans-serif"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export const dokumentUrl = (token: string) => `${siteUrl()}/dokument/${token}`

function anrede(d: Dokument): string {
  const name = d.kunde.name.trim()
  if (d.sprache === "en") return name ? `Dear ${name},` : "Dear Sir or Madam,"
  return name ? `Guten Tag ${name},` : "Sehr geehrte Damen und Herren,"
}

type Inhalt = { betreff: string; kennung: string; titel: string; absaetze: string[]; knopf: string }

function inhalt(d: Dokument, art: MailArt): Inhalt {
  const en = d.sprache === "en"
  const T = DOK_TEXT[d.sprache]
  const name = d.art === "angebot" ? T.angebot : d.art === "storno" ? T.storno : T.rechnung
  const nr = `${d.nummer}${d.art === "angebot" && d.version > 1 ? ` (${T.version} ${d.version})` : ""}`
  const betrag = formatEuro(d.summen?.bruttoCent ?? 0, d.sprache)
  const thema = d.titel ? ` · ${d.titel}` : ""
  const faellig = d.faelligAm ? formatDatum(d.faelligAm, d.sprache) : ""
  const gueltig = d.gueltigBis ? formatDatum(d.gueltigBis, d.sprache) : ""

  if (art === "versand" && d.art === "angebot") {
    return {
      betreff: `${name} ${nr}${thema}`,
      kennung: `${name} ${nr}`,
      titel: d.titel || (en ? "Your quotation" : "Ihr Angebot"),
      absaetze: en
        ? [`thank you for your interest. Please find our quotation below – you can review it online, select optional services and accept it with one click.`, gueltig ? `The quotation is valid until ${gueltig}.` : ""]
        : [`vielen Dank für Ihr Interesse. Anbei erhalten Sie unser Angebot – Sie können es online ansehen, optionale Leistungen auswählen und mit einem Klick annehmen.`, gueltig ? `Das Angebot ist gültig bis ${gueltig}. Bei Fragen oder Änderungswünschen antworten Sie einfach auf diese Mail.` : ""],
      knopf: en ? "View quotation" : "Angebot ansehen",
    }
  }
  if (art === "versand" && d.art === "storno") {
    return {
      betreff: `${name} ${nr}`,
      kennung: `${name} ${nr}`,
      titel: en ? "Cancellation of your invoice" : "Stornierung Ihrer Rechnung",
      absaetze: [d.einleitung, en ? "No payment is required for the cancelled invoice." : "Für die stornierte Rechnung ist keine Zahlung mehr nötig."],
      knopf: en ? "View document" : "Dokument ansehen",
    }
  }
  if (art === "versand") {
    return {
      betreff: `${name} ${nr}${thema}`,
      kennung: `${name} ${nr}`,
      titel: en ? `Invoice over ${betrag}` : `Rechnung über ${betrag}`,
      absaetze: en
        ? [`thank you for your trust. Please find your invoice below.`, `Please transfer ${betrag} by ${faellig}, quoting ${d.nummer}.`]
        : [`vielen Dank für Ihr Vertrauen. Anbei erhalten Sie Ihre Rechnung.`, `Bitte überweisen Sie ${betrag} bis zum ${faellig} unter Angabe der Nummer ${d.nummer}.`],
      knopf: en ? "View invoice" : "Rechnung ansehen",
    }
  }
  if (art === "nachfrage") {
    return {
      betreff: en ? `Follow-up: ${name} ${nr}` : `Kurze Rückfrage zu ${name} ${nr}`,
      kennung: `${name} ${nr}`,
      titel: en ? "Any questions about our quotation?" : "Haben Sie Fragen zu unserem Angebot?",
      absaetze: en
        ? [`I wanted to briefly follow up on our quotation${thema}. If anything is unclear or you would like changes, just let me know – you can also request changes directly online.`, gueltig ? `The quotation is valid until ${gueltig}.` : ""]
        : [`ich wollte kurz nachfragen, ob Sie unser Angebot${thema ? ` „${d.titel}“` : ""} schon ansehen konnten. Wenn etwas unklar ist oder Sie Änderungen wünschen, sagen Sie mir einfach Bescheid – das geht auch direkt online.`, gueltig ? `Das Angebot gilt bis ${gueltig}.` : ""],
      knopf: en ? "View quotation" : "Angebot ansehen",
    }
  }
  if (art === "bestaetigung") {
    return {
      betreff: en ? `Order confirmation · ${name} ${nr}` : `Auftragsbestätigung · ${name} ${nr}`,
      kennung: en ? "Order confirmation" : "Auftragsbestätigung",
      titel: en ? "Thank you – your order is confirmed." : "Vielen Dank – Ihr Auftrag ist bestätigt.",
      absaetze: en
        ? [`we have received your acceptance of quotation ${nr} (${betrag}). We will be in touch shortly with the next steps.`, `You can view the accepted version at any time via the link below.`]
        : [`wir haben Ihre Annahme des Angebots ${nr} (${betrag}) erhalten. Wir melden uns in Kürze mit den nächsten Schritten.`, `Die angenommene Fassung können Sie jederzeit über den Link unten ansehen.`],
      knopf: en ? "View accepted quotation" : "Angenommenes Angebot ansehen",
    }
  }
  const stufe = Number(art.slice(-1)) as 1 | 2 | 3
  const titelDe = { 1: "Freundliche Zahlungserinnerung", 2: "1. Mahnung", 3: "2. Mahnung" }[stufe]
  const titelEn = { 1: "Friendly payment reminder", 2: "First reminder", 3: "Final reminder" }[stufe]
  const tonDe = {
    1: `sicher ist es im Alltag untergegangen: Die Rechnung ${d.nummer} über ${betrag} war am ${faellig} fällig. Falls Sie bereits überwiesen haben, betrachten Sie diese Nachricht bitte als gegenstandslos.`,
    2: `leider konnten wir zur Rechnung ${d.nummer} über ${betrag} (fällig am ${faellig}) noch keinen Zahlungseingang feststellen. Bitte überweisen Sie den Betrag innerhalb der nächsten 7 Tage.`,
    3: `trotz unserer Erinnerungen ist die Rechnung ${d.nummer} über ${betrag} (fällig am ${faellig}) weiterhin offen. Bitte begleichen Sie den Betrag umgehend, spätestens innerhalb von 7 Tagen. Sollte es ein Problem geben, melden Sie sich bitte direkt bei uns.`,
  }[stufe]
  const tonEn = {
    1: `this may have slipped through: invoice ${d.nummer} over ${betrag} was due on ${faellig}. If you have already paid, please disregard this message.`,
    2: `we have not yet received payment for invoice ${d.nummer} over ${betrag} (due ${faellig}). Please transfer the amount within the next 7 days.`,
    3: `despite our reminders, invoice ${d.nummer} over ${betrag} (due ${faellig}) is still outstanding. Please settle the amount immediately, within 7 days at the latest. If there is a problem, please contact us directly.`,
  }[stufe]
  return {
    betreff: `${en ? titelEn : titelDe} · ${name} ${d.nummer}`,
    kennung: `${name} ${d.nummer}`,
    titel: en ? titelEn : titelDe,
    absaetze: [en ? tonEn : tonDe],
    knopf: en ? "View invoice" : "Rechnung ansehen",
  }
}

function eckdaten(d: Dokument): [string, string][] {
  const T = DOK_TEXT[d.sprache]
  const z: [string, string][] = [[T.nummer, String(d.nummer)]]
  z.push([T.gesamt, formatEuro(d.summen?.bruttoCent ?? 0, d.sprache)])
  if (d.art === "angebot" && d.gueltigBis) z.push([T.gueltig, formatDatum(d.gueltigBis, d.sprache)])
  if (d.art === "rechnung" && d.faelligAm) z.push([T.faellig, formatDatum(d.faelligAm, d.sprache)])
  return z
}

export function dokumentMail(d: Dokument, art: MailArt): { betreff: string; html: string; text: string } {
  const i = inhalt(d, art)
  const url = dokumentUrl(String(d.token))
  const f = d.absender
  const lang = d.sprache satisfies Sprache
  const absaetze = [anrede(d), ...i.absaetze.filter(Boolean)]
  const gruss = lang === "en" ? "Kind regards" : "Viele Grüße"
  const inhaber = f?.inhaber || "Muhammed Emin Akyol"

  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(i.betreff)}</title></head>
<body style="margin:0;padding:0;background:${ZEMIN};font-family:${SCHRIFT}">
<span style="display:none;max-height:0;overflow:hidden">${esc(i.titel)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ZEMIN}"><tr><td align="center" style="padding:32px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:32px">
<tr><td align="center" style="padding:36px 32px 8px"><img src="${siteUrl()}${LOGO_PFAD}" alt="creaDIG" width="200" style="display:block;width:200px;height:auto;border:0"></td></tr>
<tr><td style="padding:20px 24px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NEBEL};border-radius:24px"><tr><td style="padding:28px 28px 26px">
<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:${GOLD};font-family:${SCHRIFT}">${esc(i.kennung)}</p>
<h1 style="margin:0;font-size:26px;line-height:1.25;color:${TINTE};font-family:${TITEL};font-weight:700">${esc(i.titel)}</h1>
</td></tr></table></td></tr>
<tr><td style="padding:28px 36px 4px">
${absaetze.map((p, n) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${n === 0 ? TINTE : TEXT};${n === 0 ? "font-weight:700;" : ""}font-family:${SCHRIFT}">${esc(p)}</p>`).join("")}
</td></tr>
<tr><td style="padding:4px 36px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ZEMIN};border-radius:20px">
${eckdaten(d).map(([k, v]) => `<tr><td style="padding:12px 20px;font-size:13px;color:${GRAU};font-family:${SCHRIFT}">${esc(k)}</td><td align="right" style="padding:12px 20px;font-size:15px;color:${TINTE};font-weight:700;font-family:${TITEL}">${esc(v)}</td></tr>`).join("")}
</table></td></tr>
<tr><td align="center" style="padding:24px 36px 8px"><a href="${esc(url)}" style="display:inline-block;background:${BLAU};color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:15px 30px;border-radius:999px;font-family:${TITEL}">${esc(i.knopf)}</a></td></tr>
<tr><td style="padding:24px 36px 36px">
<p style="margin:0;font-size:15px;line-height:1.6;color:${TEXT};font-family:${SCHRIFT}">${gruss}<br><strong style="color:${TINTE};font-family:${TITEL}">${esc(inhaber)}</strong><br><span style="color:${GRAU}">creaDIG Solutions</span></p>
</td></tr></table>
<p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:${GRAU};font-family:${SCHRIFT}">creaDIG Solutions · ${esc(inhaber)}${f?.strasse ? ` · ${esc(f.strasse)}, ${esc(f.plzOrt)}` : ""}<br><a href="${siteUrl()}/impressum" style="color:${GRAU}">Impressum</a> · <a href="${siteUrl()}/datenschutz" style="color:${GRAU}">Datenschutz</a></p>
</td></tr></table></body></html>`

  const text = [
    ...absaetze,
    "",
    ...eckdaten(d).map(([k, v]) => `${k}: ${v}`),
    "",
    `${i.knopf}: ${url}`,
    "",
    `${gruss}`,
    inhaber,
    "creaDIG Solutions",
  ].join("\n")

  return { betreff: i.betreff, html, text }
}

export type MailErgebnis = { ok: true } | { ok: false; grund: string }

export async function sendeDokumentMail(d: Dokument, art: MailArt): Promise<MailErgebnis> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  if (!key || !from) return { ok: false, grund: "Mailversand ist nicht eingerichtet (RESEND_API_KEY / LEAD_FROM)." }
  if (!d.kunde.email?.trim() || !d.token) return { ok: false, grund: "Empfänger oder Kundenlink fehlt." }
  const kopie = process.env.MAIL_REPLY_TO?.trim() || process.env.LEAD_TO?.trim() || undefined
  const m = dokumentMail(d, art)
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `${d.id}-${art}-${d.mahnstufe}-${d.version}` },
    body: JSON.stringify({
      from,
      to: [d.kunde.email.trim()],
      ...(kopie ? { reply_to: kopie, bcc: [kopie] } : {}),
      subject: m.betreff,
      html: m.html,
      text: m.text,
    }),
  })
  if (!res.ok) return { ok: false, grund: `Versand fehlgeschlagen (Resend ${res.status}).` }
  return { ok: true }
}

/** Kurze Nachricht an den Inhaber, wenn ein Kunde reagiert. */
export async function meldeInhaber(d: Dokument, was: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  const an = process.env.LEAD_TO?.trim()
  if (!key || !from || !an) return
  const kunde = d.kunde.firma || d.kunde.name
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [an],
      subject: `${was}: ${d.nummer} · ${kunde}`,
      text: `${kunde} – ${was}.\n${d.antwortName ? `Name: ${d.antwortName}\n` : ""}${d.antwortText ? `Nachricht: ${d.antwortText}\n` : ""}\nIn creaDIG Finanz öffnen: https://finanz.creadig.de/vorgang/${d.id}`,
    }),
  }).catch(() => undefined)
}
