/**
 * creaDIG-Mailvorlage (Logo, Nachtblau-Bühne, Logo-Gold, warmes Papier).
 * Bewusst ohne `server-only`: dieselbe Funktion rendert die Live-Vorschau im
 * Studio, die .eml-Datei und die versendete Mail — was man sieht, ist was ankommt.
 * Nur Tabellen + Inline-Styles, damit Outlook, Apple Mail und Gmail gleich aussehen.
 *
 * Text-Syntax im Inhalt: Leerzeile = neuer Absatz, "## " = Zwischentitel,
 * Zeilen mit "- " = Vorteilsliste ("Titel: Text" macht den Titel fett),
 * "> " = hervorgehobene Aussage, **so** = fett.
 */

export type KampagnenInhalt = {
  subject: string
  preheader: string
  headline: string
  body: string
  ctaText: string
  ctaUrl: string
}

const NACHT = "#0F1B2D"
const GOLD = "#BE904E"
const GOLD_HELL = "#E4C378"
const TEXT = "#2E3440"
const GRAU = "#6B7280"
const LINIE = "#ECE6DA"
const PAPIER = "#FAF6EC"
const STEIN = "#F1EFE9"
const WEISS = "#FFFFFF"
const SCHRIFT = "Manrope,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"

export const LOGO_PFAD = "/brand/creadig-mail-logo.png"
export const LOGO_CID = "creadig-logo"

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function inline(s: string): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, `<strong style="color:${NACHT};font-weight:700">$1</strong>`)
}

const P = `margin:0 0 18px;font-size:15px;line-height:1.75;color:${TEXT};font-family:${SCHRIFT}`

function liste(zeilen: string[]): string {
  const reihen = zeilen
    .map((z) => {
      const roh = z.trim().slice(2)
      const doppel = roh.indexOf(": ")
      const inhalt =
        doppel > 0 && doppel < 60
          ? `<strong style="display:block;color:${NACHT};font-size:15px;font-weight:700;margin-bottom:2px">${inline(roh.slice(0, doppel))}</strong>${inline(roh.slice(doppel + 2))}`
          : inline(roh)
      return `<tr><td valign="top" style="width:34px;padding:10px 0"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" width="22" height="22" style="width:22px;height:22px;background:${GOLD};border-radius:11px;color:${WEISS};font-size:12px;font-weight:700;line-height:22px;font-family:${SCHRIFT}">&#10003;</td></tr></table></td><td valign="top" style="padding:10px 0;font-size:14px;line-height:1.65;color:${TEXT};font-family:${SCHRIFT}">${inhalt}</td></tr>`
    })
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;background:${PAPIER};border-radius:12px"><tr><td style="padding:10px 22px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${reihen}</table></td></tr></table>`
}

function bloecke(body: string): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith("## ")) {
        return `<p style="margin:30px 0 4px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};font-weight:700;font-family:${SCHRIFT}">&mdash;&nbsp;&nbsp;creaDIG</p><h2 style="margin:0 0 14px;font-size:20px;line-height:1.3;color:${NACHT};font-weight:800;font-family:${SCHRIFT}">${inline(b.slice(3))}</h2>`
      }
      const zeilen = b.split("\n")
      if (zeilen.every((z) => z.trim().startsWith("- "))) return liste(zeilen)
      if (zeilen.every((z) => z.trim().startsWith("> "))) {
        const satz = zeilen.map((z) => inline(z.trim().slice(2))).join("<br>")
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 24px"><tr><td style="padding:4px 0 4px 20px;border-left:2px solid ${GOLD}"><p style="margin:0;font-size:19px;line-height:1.5;color:${NACHT};font-weight:700;font-family:${SCHRIFT}">${satz}</p></td></tr></table>`
      }
      return `<p style="${P}">${inline(b).replace(/\n/g, "<br>")}</p>`
    })
    .join("")
}

function knopf(text: string, href: string, art: "voll" | "rand"): string {
  const voll = art === "voll"
  return `<td style="padding:0 10px 10px 0"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${voll ? NACHT : WEISS}" style="background:${voll ? NACHT : WEISS};border-radius:8px;${voll ? `border-bottom:3px solid ${GOLD}` : `border:1.5px solid ${NACHT}`}"><a href="${esc(href)}" style="display:inline-block;padding:${voll ? "15px 28px" : "13.5px 24px"};font-size:15px;font-weight:700;color:${voll ? WEISS : NACHT};text-decoration:none;font-family:${SCHRIFT}">${esc(text)}${voll ? `&nbsp;&nbsp;<span style="color:${GOLD_HELL}">&rarr;</span>` : ""}</a></td></tr></table></td>`
}

function kontaktZeile(o: { telefon?: string; email?: string; web: string }): string {
  const teile: string[] = []
  if (o.telefon?.trim()) teile.push(`<a href="tel:${esc(o.telefon.replace(/[^\d+]/g, ""))}" style="color:${WEISS};text-decoration:none">${esc(o.telefon)}</a>`)
  if (o.email?.trim()) teile.push(`<a href="mailto:${esc(o.email)}" style="color:${WEISS};text-decoration:none">${esc(o.email)}</a>`)
  teile.push(`<a href="${esc(o.web)}" style="color:${WEISS};text-decoration:none">${esc(o.web.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>`)
  return teile.join(`<span style="color:${GOLD_HELL}">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`)
}

export function kampagnenHtml(
  k: KampagnenInhalt,
  o: {
    siteUrl: string
    abmeldeUrl?: string
    ctaHref?: string
    pixelUrl?: string
    anrede?: string
    zweitLink?: { text: string; url: string }
    gruss?: string
    logoSrc?: string
    kennung?: string
    ctaHinweis?: string
    telefon?: string
    email?: string
  },
): string {
  const ctaHref = o.ctaHref ?? k.ctaUrl
  const logo = o.logoSrc ?? `${o.siteUrl}${LOGO_PFAD}`
  const hatHaupt = Boolean(k.ctaText.trim() && k.ctaUrl.trim())
  const hatZweit = Boolean(o.zweitLink?.text.trim() && o.zweitLink.url.trim())
  const knoepfe =
    hatHaupt || hatZweit
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 6px;background:${PAPIER};border-radius:14px;border:1px solid ${LINIE}"><tr><td style="padding:26px 26px 16px">
<p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};font-weight:700;font-family:${SCHRIFT}">N&auml;chster Schritt</p>
<p style="margin:0 0 18px;font-size:16px;line-height:1.55;color:${NACHT};font-weight:700;font-family:${SCHRIFT}">${esc(o.ctaHinweis?.trim() || "Wählen Sie direkt einen passenden Termin – oder schreiben Sie mir in einer Minute.")}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>${hatHaupt ? knopf(k.ctaText, ctaHref, "voll") : ""}${hatZweit && o.zweitLink ? knopf(o.zweitLink.text, o.zweitLink.url, "rand") : ""}</tr></table>
</td></tr></table>`
      : ""
  const abmeldung = o.abmeldeUrl
    ? `<br>Sie erhalten diese Nachricht, weil Sie mit creaDIG in Kontakt stehen. <a href="${esc(o.abmeldeUrl)}" style="color:${GRAU};text-decoration:underline">Abmelden</a>`
    : ""
  const anrede = o.anrede ? `<p style="${P};color:${NACHT};font-weight:600">${esc(o.anrede)}</p>` : ""
  const pixel = o.pixelUrl ? `<img src="${esc(o.pixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">` : ""
  const kennung = o.kennung?.trim()
    ? `<p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${GOLD_HELL};font-weight:700;font-family:${SCHRIFT}">${esc(o.kennung)}</p>`
    : ""

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>${esc(k.subject)}</title>
<style>@media (max-width:620px){.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:26px!important}}</style></head>
<body style="margin:0;padding:0;background:${STEIN};font-family:${SCHRIFT};-webkit-font-smoothing:antialiased">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(k.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${STEIN}" style="background:${STEIN}"><tr><td align="center" style="padding:32px 12px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:${WEISS};border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(15,27,45,0.10)">
<tr><td align="center" class="px" style="background:${WEISS};padding:30px 44px 26px"><img src="${esc(logo)}" width="174" height="48" alt="creaDIG" style="display:block;border:0;width:174px;height:auto;max-width:100%"></td></tr>
<tr><td height="3" bgcolor="${GOLD}" style="height:3px;line-height:3px;font-size:0;background:${GOLD};background-image:linear-gradient(90deg,${GOLD},${GOLD_HELL},${GOLD})">&nbsp;</td></tr>
<tr><td bgcolor="${NACHT}" class="px" style="background:${NACHT};padding:40px 44px 38px">
${kennung}<h1 class="h1" style="margin:0;font-size:30px;line-height:1.2;color:${WEISS};font-weight:800;letter-spacing:-0.4px;font-family:${SCHRIFT}">${inline(k.headline || k.subject).replace(/color:#0F1B2D/g, `color:${GOLD_HELL}`)}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td width="48" height="2" bgcolor="${GOLD}" style="width:48px;height:2px;line-height:2px;font-size:0;background:${GOLD}">&nbsp;</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:38px 44px 8px">
${anrede}${bloecke(k.body)}${knoepfe}
</td></tr>
<tr><td class="px" style="padding:22px 44px 34px">
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${TEXT};font-family:${SCHRIFT}">${esc(o.gruss ?? "Viele Grüße")}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="3" bgcolor="${GOLD}" style="width:3px;background:${GOLD};border-radius:2px">&nbsp;</td>
<td style="padding:2px 0 2px 16px"><p style="margin:0;font-size:17px;font-weight:800;color:${NACHT};font-family:${SCHRIFT}">Muhammed Emin Akyol</p><p style="margin:3px 0 0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${GRAU};font-family:${SCHRIFT}">Gr&uuml;nder &nbsp;&middot;&nbsp; creaDIG</p></td>
</tr></table>
</td></tr>
<tr><td bgcolor="${GOLD}" class="px" style="background:${GOLD};background-image:linear-gradient(100deg,#AD8A3C,${GOLD} 45%,#C9A060);padding:20px 44px;text-align:center;font-size:12px;letter-spacing:0.4px;line-height:1.8;color:${WEISS};font-family:${SCHRIFT}">${kontaktZeile({ telefon: o.telefon, email: o.email, web: o.siteUrl })}</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px"><tr><td style="padding:18px 20px 0;text-align:center;font-size:11px;line-height:1.7;color:${GRAU};font-family:${SCHRIFT}">
creaDIG solutions UG (haftungsbeschr&auml;nkt) &middot; Osnabr&uuml;ck<br>
<a href="${esc(o.siteUrl)}/impressum" style="color:${GRAU}">Impressum</a> &middot; <a href="${esc(o.siteUrl)}/datenschutz" style="color:${GRAU}">Datenschutz</a>${abmeldung}
</td></tr></table>${pixel}</td></tr></table></body></html>`
}

export function kampagnenText(k: KampagnenInhalt, o: { abmeldeUrl: string; ctaHref?: string; anrede?: string }): string {
  const teile = [
    k.headline || k.subject,
    o.anrede ?? "",
    k.body.replace(/^## /gm, "").replace(/^- /gm, "• ").replace(/^> /gm, "").replace(/\*\*/g, ""),
    k.ctaText && k.ctaUrl ? `${k.ctaText}: ${o.ctaHref ?? k.ctaUrl}` : "",
    "Viele Grüße\nMuhammed Emin Akyol\nGründer · creaDIG",
    `—\ncreaDIG solutions UG (haftungsbeschränkt) · Osnabrück\nAbmelden: ${o.abmeldeUrl}`,
  ]
  return teile.filter(Boolean).join("\n\n")
}

export function anredeFuer(name: string | null): string {
  const n = (name ?? "").trim()
  return n ? `Guten Tag ${n},` : "Guten Tag,"
}
