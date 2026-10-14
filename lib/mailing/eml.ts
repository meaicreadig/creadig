/**
 * Baut eine .eml-Datei (RFC 5322, multipart/alternative: Text + HTML).
 * "X-Unsent: 1" lässt Outlook/Apple Mail die Datei als fertigen Entwurf öffnen,
 * den man nur noch absendet. Läuft im Browser und auf dem Server.
 */

import { FIRMA, kampagnenHtml, LOGO_CID } from "@/lib/mailing/vorlage"

export function einzelmailHtml(m: Einzelmail, siteUrl: string, logoSrc?: string): string {
  return kampagnenHtml(
    { subject: m.subject, preheader: m.preheader, headline: m.headline, body: m.body, ctaText: m.ctaText, ctaUrl: m.ctaUrl },
    {
      siteUrl,
      logoSrc,
      anrede: m.anrede || undefined,
      gruss: m.gruss || undefined,
      zweitLink: { text: m.zweitText, url: m.zweitUrl },
      kennung: m.kennung,
      ctaHinweis: m.ctaHinweis,
      telefon: m.telefon,
      email: m.kontaktMail,
    },
  )
}

export type Einzelmail = {
  kennung: string
  ctaHinweis: string
  telefon: string
  kontaktMail: string
  an: string
  subject: string
  preheader: string
  headline: string
  anrede: string
  body: string
  ctaText: string
  ctaUrl: string
  zweitText: string
  zweitUrl: string
  gruss: string
}

function base64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ""
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

function zeilen76(b64: string): string {
  return b64.match(/.{1,76}/g)?.join("\r\n") ?? ""
}

function kopfWort(s: string): string {
  return /^[\x20-\x7E]*$/.test(s) ? s : `=?UTF-8?B?${base64Utf8(s)}?=`
}

export function einzelmailText(m: Einzelmail): string {
  return [
    m.anrede,
    m.body.replace(/^## /gm, "").replace(/^- /gm, "• ").replace(/^> /gm, "").replace(/\*\*/g, ""),
    m.ctaText && m.ctaUrl ? `${m.ctaText}: ${m.ctaUrl}` : "",
    m.zweitText && m.zweitUrl ? `${m.zweitText}: ${m.zweitUrl}` : "",
    `${m.gruss || "Viele Grüße"}\nMuhammed Emin Akyol\nGründer · ${FIRMA}`,
    ["—", m.telefon, m.kontaktMail, `${FIRMA} · Osnabrück · creadig.de`].filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n")
}

/** html muss das Logo als `cid:${LOGO_CID}` referenzieren, wenn logoPngBase64 mitkommt. */
export function baueEml(m: Einzelmail, html: string, von?: string, logoPngBase64?: string): string {
  const grenze = `creadig-${Math.random().toString(36).slice(2)}`
  const bund = `${grenze}-rel`
  const htmlTeil = [
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    zeilen76(base64Utf8(html)),
  ]
  const htmlBlock = logoPngBase64
    ? [
        `Content-Type: multipart/related; boundary="${bund}"`,
        "",
        `--${bund}`,
        ...htmlTeil,
        `--${bund}`,
        'Content-Type: image/png; name="creadig-logo.png"',
        "Content-Transfer-Encoding: base64",
        `Content-ID: <${LOGO_CID}>`,
        'Content-Disposition: inline; filename="creadig-logo.png"',
        "",
        zeilen76(logoPngBase64),
        `--${bund}--`,
      ]
    : htmlTeil
  const kopf = [
    von ? `From: ${von}` : "",
    m.an ? `To: ${m.an}` : "",
    `Subject: ${kopfWort(m.subject)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    "MIME-Version: 1.0",
    "X-Unsent: 1",
    `Content-Type: multipart/alternative; boundary="${grenze}"`,
  ].filter(Boolean)

  return [
    ...kopf,
    "",
    `--${grenze}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    zeilen76(base64Utf8(einzelmailText(m))),
    `--${grenze}`,
    ...htmlBlock,
    `--${grenze}--`,
    "",
  ].join("\r\n")
}
