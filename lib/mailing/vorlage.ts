/**
 * creaDIG-Mailvorlage im Webseiten-Design: helles Blau-Grau, Königsblau als Akzent,
 * runde Formen, Markenschriften (Manrope + M PLUS Rounded 1c) per Webfont.
 * Bewusst ohne `server-only`: dieselbe Funktion rendert die Live-Vorschau im
 * Studio, die .eml-Datei und die versendete Mail — was man sieht, ist was ankommt.
 * Tabellen + Inline-Styles für Outlook/Gmail; Apple Mail und iOS bekommen
 * zusätzlich Webfonts und dezente Bewegung (Lichtlinie, Knopf-Glanz).
 *
 * Text-Syntax im Inhalt: Leerzeile = neuer Absatz, "## " = Zwischentitel,
 * Zeilen mit "- " = Vorteilsliste ("Titel: Text" macht den Titel fett),
 * "> " = hervorgehobene Aussage, **so** = fett (in der Überschrift: blau).
 */

export type KampagnenInhalt = {
  subject: string
  preheader: string
  headline: string
  body: string
  ctaText: string
  ctaUrl: string
}

const BLAU = "#2F5BEA"
const BLAU_TIEF = "#1E3FAE"
const BLAU_HELL = "#8FB0FF"
const TINTE = "#0D1A2E"
const TEXT = "#33405A"
const GRAU = "#6B7891"
const LINIE = "#DDE3EC"
const NEBEL = "#EEF3FF"
const ZEMIN = "#F5F7FA"
const WEISS = "#FFFFFF"

const TITEL = "Manrope,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif"
const SCHRIFT = "'M PLUS Rounded 1c',Nunito,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif"
const FONTS = "https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap"

export const LOGO_PFAD = "/brand/creadig-mail-logo.png"
export const LOGO_CID = "creadig-logo"
export const FIRMA = "creaDIG Solutions"

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function inline(s: string, fett = TINTE): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, `<strong style="color:${fett};font-weight:700">$1</strong>`)
}

const P = `margin:0 0 18px;font-size:15px;line-height:1.75;color:${TEXT};font-family:${SCHRIFT}`

function liste(zeilen: string[]): string {
  const reihen = zeilen
    .map((z, i) => {
      const roh = z.trim().slice(2)
      const doppel = roh.indexOf(": ")
      const inhalt =
        doppel > 0 && doppel < 60
          ? `<strong style="display:block;color:${TINTE};font-size:15px;font-weight:700;margin-bottom:3px;font-family:${TITEL}">${inline(roh.slice(0, doppel))}</strong>${inline(roh.slice(doppel + 2))}`
          : inline(roh)
      const abstand = i === zeilen.length - 1 ? "0" : "10px"
      return `<tr><td style="padding:0 0 ${abstand}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${WEISS}" style="background:${WEISS};border:1px solid ${LINIE};border-radius:18px"><tr>
<td valign="top" style="width:38px;padding:16px 0 16px 18px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" width="26" height="26" bgcolor="${NEBEL}" style="width:26px;height:26px;background:${NEBEL};border-radius:13px;color:${BLAU};font-size:13px;font-weight:700;line-height:26px;font-family:Arial,'Segoe UI Symbol',sans-serif">&#10003;</td></tr></table></td>
<td valign="top" style="padding:16px 20px 16px 12px;font-size:14px;line-height:1.65;color:${TEXT};font-family:${SCHRIFT}">${inhalt}</td></tr></table></td></tr>`
    })
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px">${reihen}</table>`
}

function bloecke(body: string): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith("## ")) {
        return `<h2 style="margin:32px 0 12px;font-size:20px;line-height:1.3;color:${TINTE};font-weight:800;letter-spacing:-0.2px;font-family:${TITEL}">${inline(b.slice(3), BLAU)}</h2>`
      }
      const zeilen = b.split("\n")
      if (zeilen.every((z) => z.trim().startsWith("- "))) return liste(zeilen)
      if (zeilen.every((z) => z.trim().startsWith("> "))) {
        const satz = zeilen.map((z) => inline(z.trim().slice(2), BLAU)).join("<br>")
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 28px"><tr><td align="center" bgcolor="${NEBEL}" style="background:${NEBEL};border-radius:24px;padding:28px 28px"><p style="margin:0;font-size:21px;line-height:1.4;color:${BLAU_TIEF};font-weight:800;letter-spacing:-0.3px;font-family:${TITEL}">${satz}</p></td></tr></table>`
      }
      return `<p style="${P}">${inline(b).replace(/\n/g, "<br>")}</p>`
    })
    .join("")
}

function knopf(text: string, href: string, art: "voll" | "rand"): string {
  const voll = art === "voll"
  return `<td style="padding:0 10px 10px 0"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${voll ? BLAU : WEISS}" class="${voll ? "glanz" : ""}" style="background:${voll ? BLAU : WEISS};border-radius:999px;${voll ? `box-shadow:0 8px 22px rgba(47,91,234,0.32)` : `border:1.5px solid ${BLAU}`}"><a href="${esc(href)}" style="display:inline-block;padding:${voll ? "15px 30px" : "13.5px 26px"};font-size:15px;font-weight:700;color:${voll ? WEISS : BLAU};text-decoration:none;border-radius:999px;font-family:${TITEL}">${esc(text)}${voll ? "&nbsp;&nbsp;&rarr;" : ""}</a></td></tr></table></td>`
}

function chip(inhalt: string, href: string): string {
  return `<td style="padding:0 8px 8px 0"><a href="${esc(href)}" style="display:inline-block;padding:9px 16px;background:${ZEMIN};border:1px solid ${LINIE};border-radius:999px;font-size:13px;color:${TINTE};text-decoration:none;font-family:${SCHRIFT}">${inhalt}</a></td>`
}

function kontaktChips(o: { telefon?: string; email?: string; web: string }): string {
  const teile: string[] = []
  if (o.telefon?.trim()) teile.push(chip(`<span style="color:${BLAU};font-weight:700">Tel</span>&nbsp; ${esc(o.telefon)}`, `tel:${o.telefon.replace(/[^\d+]/g, "")}`))
  if (o.email?.trim()) teile.push(chip(`<span style="color:${BLAU}">@</span>&nbsp; ${esc(o.email)}`, `mailto:${o.email}`))
  teile.push(chip(`<span style="color:${BLAU}">&#9679;</span>&nbsp; ${esc(o.web.replace(/^https?:\/\//, "").replace(/\/$/, ""))}`, o.web))
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${teile.join("")}</tr></table>`
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
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 8px"><tr><td bgcolor="${ZEMIN}" style="background:${ZEMIN};border-radius:28px;border:1px solid ${LINIE};padding:30px 30px 20px">
<p style="margin:0 0 10px"><span style="display:inline-block;padding:5px 12px;background:${WEISS};border-radius:999px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${BLAU};font-weight:700;font-family:${TITEL}">N&auml;chster Schritt</span></p>
<p style="margin:0 0 20px;font-size:17px;line-height:1.5;color:${TINTE};font-weight:700;font-family:${TITEL}">${esc(o.ctaHinweis?.trim() || "Wählen Sie direkt einen passenden Termin – oder schreiben Sie mir in einer Minute.")}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>${hatHaupt ? knopf(k.ctaText, ctaHref, "voll") : ""}${hatZweit && o.zweitLink ? knopf(o.zweitLink.text, o.zweitLink.url, "rand") : ""}</tr></table>
</td></tr></table>`
      : ""
  const abmeldung = o.abmeldeUrl
    ? `<br>Sie erhalten diese Nachricht, weil Sie mit creaDIG in Kontakt stehen. <a href="${esc(o.abmeldeUrl)}" style="color:${GRAU};text-decoration:underline">Abmelden</a>`
    : ""
  const anrede = o.anrede ? `<p style="${P};color:${TINTE};font-weight:700">${esc(o.anrede)}</p>` : ""
  const pixel = o.pixelUrl ? `<img src="${esc(o.pixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">` : ""
  const kennung = o.kennung?.trim()
    ? `<p style="margin:0 0 18px"><span style="display:inline-block;padding:6px 14px;background:${WEISS};border-radius:999px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${BLAU};font-weight:700;font-family:${TITEL}">&#9679;&nbsp; ${esc(o.kennung)}</span></p>`
    : ""

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>${esc(k.subject)}</title>
<link rel="stylesheet" href="${FONTS}">
<style>
@import url('${FONTS}');
@keyframes licht{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes atem{0%,100%{box-shadow:0 8px 22px rgba(47,91,234,.30)}50%{box-shadow:0 10px 34px rgba(47,91,234,.55)}}
@keyframes auf{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.licht{background-image:linear-gradient(90deg,${BLAU} 0%,${BLAU_HELL} 25%,${BLAU} 50%,${BLAU_HELL} 75%,${BLAU} 100%)!important;background-size:200% 100%!important;animation:licht 4s linear infinite}
.glanz{animation:atem 2.8s ease-in-out infinite}
.auf{animation:auf .8s ease-out both}
@media (prefers-reduced-motion:reduce){.licht,.glanz,.auf{animation:none!important}}
@media (max-width:620px){.px{padding-left:22px!important;padding-right:22px!important}.hero{padding:30px 24px!important}.h1{font-size:27px!important}}
</style></head>
<body style="margin:0;padding:0;background:${ZEMIN};font-family:${SCHRIFT};-webkit-font-smoothing:antialiased">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(k.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${ZEMIN}" style="background:${ZEMIN}"><tr><td align="center" style="padding:36px 12px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${WEISS}" style="max-width:640px;background:${WEISS};border-radius:32px;overflow:hidden;box-shadow:0 20px 60px rgba(13,26,46,0.08)">
<tr><td align="center" class="px" style="padding:34px 40px 26px"><img src="${esc(logo)}" width="168" alt="creaDIG" style="display:block;border:0;width:168px;height:auto;max-width:100%"></td></tr>
<tr><td class="px" style="padding:0 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td bgcolor="${NEBEL}" class="hero auf" style="background:${NEBEL};background-image:linear-gradient(135deg,#E6EEFF 0%,${NEBEL} 55%,#F7F9FF 100%);border-radius:26px;padding:40px 36px 36px">
${kennung}<h1 class="h1" style="margin:0;font-size:32px;line-height:1.18;color:${TINTE};font-weight:800;letter-spacing:-0.6px;font-family:${TITEL}">${inline(k.headline || k.subject, BLAU)}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr><td width="96" height="4" bgcolor="${BLAU}" class="licht" style="width:96px;height:4px;line-height:4px;font-size:0;background:${BLAU};border-radius:2px">&nbsp;</td></tr></table>
</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:38px 44px 8px">
${anrede}${bloecke(k.body)}${knoepfe}
</td></tr>
<tr><td class="px" style="padding:26px 44px 38px">
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${TEXT};font-family:${SCHRIFT}">${esc(o.gruss ?? "Viele Grüße")}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:18px"><tr>
<td valign="middle" width="52"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" width="52" height="52" bgcolor="${BLAU}" style="width:52px;height:52px;background:${BLAU};background-image:linear-gradient(135deg,${BLAU},${BLAU_TIEF});border-radius:26px;color:${WEISS};font-size:17px;font-weight:800;line-height:52px;font-family:${TITEL}">EA</td></tr></table></td>
<td valign="middle" style="padding-left:16px"><p style="margin:0;font-size:17px;font-weight:800;color:${TINTE};font-family:${TITEL}">Muhammed Emin Akyol</p><p style="margin:3px 0 0;font-size:13px;color:${GRAU};font-family:${SCHRIFT}">Gr&uuml;nder &middot; ${FIRMA}</p></td>
</tr></table>
${kontaktChips({ telefon: o.telefon, email: o.email, web: o.siteUrl })}
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px"><tr><td style="padding:20px 20px 0;text-align:center;font-size:12px;line-height:1.7;color:${GRAU};font-family:${SCHRIFT}">
${FIRMA} &middot; Osnabr&uuml;ck &middot; <a href="${esc(o.siteUrl)}/impressum" style="color:${GRAU}">Impressum</a> &middot; <a href="${esc(o.siteUrl)}/datenschutz" style="color:${GRAU}">Datenschutz</a>${abmeldung}
</td></tr></table>${pixel}</td></tr></table></body></html>`
}

export function kampagnenText(k: KampagnenInhalt, o: { abmeldeUrl: string; ctaHref?: string; anrede?: string }): string {
  const teile = [
    k.headline || k.subject,
    o.anrede ?? "",
    k.body.replace(/^## /gm, "").replace(/^- /gm, "• ").replace(/^> /gm, "").replace(/\*\*/g, ""),
    k.ctaText && k.ctaUrl ? `${k.ctaText}: ${o.ctaHref ?? k.ctaUrl}` : "",
    `Viele Grüße\nMuhammed Emin Akyol\nGründer · ${FIRMA}`,
    `—\n${FIRMA} · Osnabrück\nAbmelden: ${o.abmeldeUrl}`,
  ]
  return teile.filter(Boolean).join("\n\n")
}

export function anredeFuer(name: string | null): string {
  const n = (name ?? "").trim()
  return n ? `Guten Tag ${n},` : "Guten Tag,"
}
