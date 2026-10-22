/**
 * creaDIG-Mailvorlage im Webseiten-Design: helles Blau-Grau, Königsblau als Hauptfarbe,
 * Logo-Gold als Akzent, runde Formen, Markenschriften (Manrope + M PLUS Rounded 1c).
 * Bewusst ohne `server-only`: dieselbe Funktion rendert die Live-Vorschau im
 * Studio, die .eml-Datei und die versendete Mail — was man sieht, ist was ankommt.
 * Tabellen + Inline-Styles für Outlook/Gmail; Apple Mail und iOS bekommen
 * zusätzlich Webfonts und dezente Bewegung (Lichtlinie, Knopf-Glanz).
 *
 * Text-Syntax im Inhalt: Leerzeile = neuer Absatz, "## " = Zwischentitel,
 * Zeilen mit "- " = Vorteilsliste ("Titel: Text" macht den Titel fett,
 * optional "[icon] " davor, z. B. "- [shield] Sicher: ..."),
 * "> " = hervorgehobene Aussage, **so** = fett (in der Überschrift: blau).
 */

import { MAIL_PRODUKTE, type MailProdukt } from "@/lib/mailing/produkte"

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
const GOLD = "#BE904E"
const GOLD_HELL = "#E4C378"
const GOLD_NEBEL = "#FBF5EA"
const TINTE = "#0D1A2E"
const TEXT = "#33405A"
const GRAU = "#6B7891"
const LINIE = "#E3E8F0"
const NEBEL = "#EEF3FF"
const ZEMIN = "#F5F7FA"
const WEISS = "#FFFFFF"

const TITEL = "Manrope,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif"
const SCHRIFT = "'M PLUS Rounded 1c',Nunito,'Segoe UI',-apple-system,Helvetica,Arial,sans-serif"
/** Markenschriften als eigene Dateien (latin), damit sie nicht an blockierten Google-Fonts scheitern. */
export const MAIL_SCHRIFTEN = ["manrope.woff2", "mplus-400.woff2", "mplus-700.woff2"] as const
export const schriftPfad = (datei: string) => `/fonts/mail/${datei}`
type Schrift = (datei: string) => string

function schriftCss(src: Schrift): string {
  const face = (familie: string, gewicht: string, datei: string) =>
    `@font-face{font-family:'${familie}';font-style:normal;font-weight:${gewicht};font-display:swap;src:url('${src(datei)}') format('woff2')}`
  return [
    face("Manrope", "200 800", "manrope.woff2"),
    face("M PLUS Rounded 1c", "400", "mplus-400.woff2"),
    face("M PLUS Rounded 1c", "700", "mplus-700.woff2"),
  ].join("\n")
}

export const LOGO_PFAD = "/brand/creadig-mail-logo.png"
export const LOGO_CID = "creadig-logo"
export const FIRMA = "creaDIG Solutions"

export const LISTEN_ICONS = ["layers", "shield", "user", "zap", "sparkles", "clock", "calendar", "globe"] as const
type ListenIcon = (typeof LISTEN_ICONS)[number]
const ICON_FOLGE: ListenIcon[] = ["layers", "shield", "user", "zap", "sparkles", "clock"]

const iconPfad = (name: string, art: "list" | "gold") => `/brand/mail/${name}-${art}.png`

/** Alle Bilder, die eine Mail verwenden kann – für das Einbetten in .eml-Dateien. */
export function mailBildPfade(): string[] {
  return [
    LOGO_PFAD,
    ...LISTEN_ICONS.map((n) => iconPfad(n, "list")),
    ...["phone", "mail", "globe"].map((n) => iconPfad(n, "gold")),
    ...Object.values(MAIL_PRODUKTE).map((p) => p.bild),
  ]
}

export function cidFuer(pfad: string): string {
  return pfad === LOGO_PFAD ? LOGO_CID : `creadig-${pfad.split("/").pop()?.replace(/\.(png|jpe?g)$/, "")}`
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function inline(s: string, fett = TINTE): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, `<strong style="color:${fett};font-weight:700">$1</strong>`)
}

const P = `margin:0 0 18px;font-size:15px;line-height:1.75;color:${TEXT};font-family:${SCHRIFT}`

type Bild = (pfad: string) => string

function liste(zeilen: string[], bild: Bild): string {
  const reihen = zeilen
    .map((z, i) => {
      let roh = z.trim().slice(2)
      let icon: string = ICON_FOLGE[i % ICON_FOLGE.length]
      const tag = roh.match(/^\[([a-z]+)\]\s*/) ?? roh.match(new RegExp(`^(${LISTEN_ICONS.join("|")})\\s+(?=[A-ZÄÖÜ])`))
      if (tag) {
        if ((LISTEN_ICONS as readonly string[]).includes(tag[1])) icon = tag[1]
        roh = roh.slice(tag[0].length)
      }
      const doppel = roh.indexOf(": ")
      const inhalt =
        doppel > 0 && doppel < 60
          ? `<strong style="display:block;color:${TINTE};font-size:15px;font-weight:800;margin-bottom:4px;font-family:${TITEL}">${inline(roh.slice(0, doppel))}</strong>${inline(roh.slice(doppel + 2))}`
          : inline(roh)
      const abstand = i === zeilen.length - 1 ? "0" : "12px"
      return `<tr><td style="padding:0 0 ${abstand}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${WEISS}" style="background:${WEISS};border:1px solid ${LINIE};border-radius:22px;box-shadow:0 6px 18px rgba(13,26,46,0.04)"><tr>
<td valign="top" width="68" style="width:68px;padding:18px 0 18px 18px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" width="44" height="44" bgcolor="${NEBEL}" style="width:44px;height:44px;background:${NEBEL};border-radius:22px"><img src="${esc(bild(iconPfad(icon, "list")))}" width="22" height="22" alt="" style="display:block;border:0;width:22px;height:22px"></td></tr></table></td>
<td valign="middle" style="padding:18px 22px 18px 6px;font-size:14px;line-height:1.65;color:${TEXT};font-family:${SCHRIFT}">${inhalt}</td></tr></table></td></tr>`
    })
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 28px">${reihen}</table>`
}

function bloecke(body: string, bild: Bild): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith("## ")) {
        return `<h2 style="margin:34px 0 14px;font-size:20px;line-height:1.3;color:${TINTE};font-weight:800;letter-spacing:-0.2px;font-family:${TITEL}">${inline(b.slice(3), BLAU)}</h2>`
      }
      const zeilen = b.split("\n")
      if (zeilen.every((z) => z.trim().startsWith("- "))) return liste(zeilen, bild)
      if (zeilen.every((z) => z.trim().startsWith("> "))) {
        const satz = zeilen.map((z) => inline(z.trim().slice(2), GOLD)).join("<br>")
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 30px"><tr><td align="center" bgcolor="${GOLD_NEBEL}" style="background:${GOLD_NEBEL};background-image:linear-gradient(135deg,#FCF7EE 0%,${GOLD_NEBEL} 60%,#F8EEDC 100%);border-radius:26px;padding:26px 30px 30px">
<p style="margin:0 0 2px;font-size:46px;line-height:1;color:${GOLD};font-weight:800;font-family:${TITEL}">&ldquo;</p>
<p style="margin:0;font-size:22px;line-height:1.4;color:${TINTE};font-weight:800;letter-spacing:-0.3px;font-family:${TITEL}">${satz}</p></td></tr></table>`
      }
      return `<p style="${P}">${inline(b).replace(/\n/g, "<br>")}</p>`
    })
    .join("")
}

function knopf(text: string, href: string, art: "voll" | "rand"): string {
  const voll = art === "voll"
  return `<td style="padding:0 10px 10px 0"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${voll ? BLAU : WEISS}" class="${voll ? "glanz" : ""}" style="background:${voll ? BLAU : WEISS};${voll ? `background-image:linear-gradient(135deg,${BLAU},${BLAU_TIEF});` : ""}border-radius:999px;${voll ? `box-shadow:0 10px 26px rgba(47,91,234,0.32)` : `border:1.5px solid ${BLAU}`}"><a href="${esc(href)}" style="display:inline-block;padding:${voll ? "16px 32px" : "14.5px 28px"};font-size:15px;font-weight:700;color:${voll ? WEISS : BLAU};text-decoration:none;border-radius:999px;font-family:${TITEL}">${esc(text)}${voll ? "&nbsp;&nbsp;&rarr;" : ""}</a></td></tr></table></td>`
}

function kontaktZeile(icon: string, text: string, href: string, bild: Bild): string {
  return `<tr><td style="padding:0 0 8px"><a href="${esc(href)}" style="text-decoration:none"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" width="30" height="30" align="center" bgcolor="${GOLD_NEBEL}" style="width:30px;height:30px;background:${GOLD_NEBEL};border-radius:15px"><img src="${esc(bild(iconPfad(icon, "gold")))}" width="15" height="15" alt="" style="display:block;border:0;width:15px;height:15px"></td>
<td valign="middle" style="padding-left:12px;font-size:14px;color:${TINTE};font-family:${SCHRIFT}">${esc(text)}</td></tr></table></a></td></tr>`
}

function kontakt(o: { telefon?: string; email?: string; web: string }, bild: Bild): string {
  const reihen: string[] = []
  if (o.telefon?.trim()) reihen.push(kontaktZeile("phone", o.telefon, `tel:${o.telefon.replace(/[^\d+]/g, "")}`, bild))
  if (o.email?.trim()) reihen.push(kontaktZeile("mail", o.email, `mailto:${o.email}`, bild))
  reihen.push(kontaktZeile("globe", o.web.replace(/^https?:\/\//, "").replace(/\/$/, ""), o.web, bild))
  return `<table role="presentation" cellpadding="0" cellspacing="0">${reihen.join("")}</table>`
}

/** Produkt sichtbar vorstellen: echtes Bild der Webseite, Logo-Zeile, Nutzen, drei Punkte, Weg zur Seite. */
function produktKarte(p: MailProdukt, bild: Bild): string {
  const host = p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
  const punkte = p.punkte
    .map(
      (x) =>
        `<tr><td valign="top" width="22" style="width:22px;padding:0 0 8px;font-size:14px;line-height:1.6;color:${BLAU};font-weight:800;font-family:${TITEL}">&#10003;</td><td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:${TEXT};font-family:${SCHRIFT}">${esc(x)}</td></tr>`,
    )
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 30px"><tr><td bgcolor="${WEISS}" style="background:${WEISS};border:1px solid ${LINIE};border-radius:28px;box-shadow:0 12px 32px rgba(13,26,46,0.07);overflow:hidden">
<a href="${esc(p.url)}" style="display:block;text-decoration:none"><img src="${esc(bild(p.bild))}" width="560" alt="${esc(p.bildAlt)}" style="display:block;border:0;width:100%;max-width:560px;height:auto;border-radius:28px 28px 0 0"></a>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="px" style="padding:24px 30px 26px">
<p style="margin:0 0 4px;font-size:22px;line-height:1.2;color:${TINTE};font-weight:800;letter-spacing:-0.3px;font-family:${TITEL}">${esc(p.name)}</p>
<p style="margin:0 0 14px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:${GOLD};font-weight:800;font-family:${TITEL}">${esc(p.kennung)}</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${TEXT};font-family:${SCHRIFT}">${esc(p.nutzen)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px">${punkte}</table>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>${knopf(`${host} ansehen`, p.url, "rand")}</tr></table>
</td></tr></table></td></tr></table>`
}

export const ABSENDER = "Emin Akyol"

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
    absender?: string
    /** Wie Bildpfade (z. B. "/brand/…png") zu src werden: Vorschau relativ, .eml per cid:. */
    bildSrc?: Bild
    /** Wie Schriftdateien zu URLs werden: Standard = absolute Webseiten-URL, .eml = data:-URI. */
    schriftSrc?: Schrift
    kennung?: string
    ctaHinweis?: string
    telefon?: string
    email?: string
    /** Zeile unter dem Absendernamen, Standard "Gründer · creaDIG Solutions". */
    rolle?: string
    /** Stellt ein Produkt mit Webseiten-Bild vor (vor dem nächsten Schritt). */
    produkt?: MailProdukt
  },
): string {
  const bild: Bild = o.bildSrc ?? ((p) => `${o.siteUrl}${p}`)
  const ctaHref = o.ctaHref ?? k.ctaUrl
  const hatHaupt = Boolean(k.ctaText.trim() && k.ctaUrl.trim())
  const hatZweit = Boolean(o.zweitLink?.text.trim() && o.zweitLink.url.trim())
  const knoepfe =
    hatHaupt || hatZweit
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 8px"><tr><td bgcolor="${NEBEL}" style="background:${NEBEL};background-image:linear-gradient(135deg,#E6EEFF 0%,${NEBEL} 60%,#F7F9FF 100%);border-radius:28px;padding:32px 32px 22px">
<p style="margin:0 0 12px;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${GOLD};font-weight:800;font-family:${TITEL}">N&auml;chster Schritt</p>
<p style="margin:0 0 22px;font-size:18px;line-height:1.45;color:${TINTE};font-weight:800;letter-spacing:-0.2px;font-family:${TITEL}">${esc(o.ctaHinweis?.trim() || "Wählen Sie direkt einen passenden Termin – oder schreiben Sie mir in einer Minute.")}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>${hatHaupt ? knopf(k.ctaText, ctaHref, "voll") : ""}${hatZweit && o.zweitLink ? knopf(o.zweitLink.text, o.zweitLink.url, "rand") : ""}</tr></table>
</td></tr></table>`
      : ""
  const abmeldung = o.abmeldeUrl
    ? `<br>Sie erhalten diese Nachricht, weil Sie mit ${FIRMA} in Kontakt stehen. <a href="${esc(o.abmeldeUrl)}" style="color:${GRAU};text-decoration:underline">Abmelden</a>`
    : ""
  const anrede = o.anrede ? `<p style="${P};color:${TINTE};font-weight:700">${esc(o.anrede)}</p>` : ""
  const pixel = o.pixelUrl ? `<img src="${esc(o.pixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">` : ""
  const kennung = o.kennung?.trim()
    ? `<p style="margin:0 0 16px;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${GOLD};font-weight:800;font-family:${TITEL}">${esc(o.kennung)}</p>`
    : ""
  const schrift: Schrift = o.schriftSrc ?? ((d) => `${o.siteUrl}${schriftPfad(d)}`)

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(k.subject)}</title>
<style>
${schriftCss(schrift)}
:root{color-scheme:light only;supported-color-schemes:light only}
@keyframes atem{0%,100%{box-shadow:0 10px 26px rgba(47,91,234,.30)}50%{box-shadow:0 14px 38px rgba(47,91,234,.55)}}
@keyframes auf{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fluss{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.glanz{animation:atem 2.8s ease-in-out infinite}
.auf{animation:auf .9s cubic-bezier(.2,.7,.2,1) both}
.fluss{background-size:240% 240%!important;animation:fluss 14s ease-in-out infinite,auf 1.1s cubic-bezier(.2,.7,.2,1) .15s both}
@media (prefers-reduced-motion:reduce){.glanz,.auf,.fluss{animation:none!important}}
@media (max-width:620px){.px{padding-left:22px!important;padding-right:22px!important}.px-hero{padding-left:14px!important;padding-right:14px!important}.hero{padding:32px 24px!important}.h1{font-size:27px!important}}
</style></head>
<body style="margin:0;padding:0;background:${ZEMIN};font-family:${SCHRIFT};-webkit-font-smoothing:antialiased">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(k.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${ZEMIN}" style="background:${ZEMIN}"><tr><td align="center" style="padding:36px 12px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${WEISS}" style="max-width:640px;background:${WEISS};border-radius:32px;overflow:hidden;box-shadow:0 24px 64px rgba(13,26,46,0.08)">
<tr><td align="center" class="px auf" style="padding:44px 40px 34px"><img src="${esc(bild(LOGO_PFAD))}" width="236" alt="creaDIG" style="display:block;border:0;width:236px;height:auto;max-width:100%;margin:0 auto">
<p style="margin:14px 0 0;font-size:10.5px;letter-spacing:3.2px;text-transform:uppercase;color:${GRAU};font-weight:700;font-family:${TITEL}">System-Haus f&uuml;r digitale Betriebe</p></td></tr>
<tr><td class="px-hero" style="padding:0 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td bgcolor="${NEBEL}" class="hero fluss" style="background:${NEBEL};background-image:linear-gradient(120deg,#E9EFFF 0%,#F4F7FF 35%,${GOLD_NEBEL} 65%,#EEF3FF 100%);border-radius:28px;padding:42px 40px 44px">
${kennung}<h1 class="h1" style="margin:0;font-size:32px;line-height:1.2;color:${TINTE};font-weight:800;letter-spacing:-0.7px;font-family:${TITEL}">${inline(k.headline || k.subject, BLAU)}</h1>
</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:40px 44px 8px">
${anrede}${bloecke(k.body, bild)}${o.produkt ? produktKarte(o.produkt, bild) : ""}${knoepfe}
</td></tr>
<tr><td class="px" style="padding:30px 44px 40px">
<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:${TEXT};font-family:${SCHRIFT}">${esc(o.gruss ?? "Viele Grüße")}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:22px"><tr><td>
<p style="margin:0;font-size:19px;font-weight:800;color:${TINTE};letter-spacing:-0.2px;font-family:${TITEL}">${esc(o.absender || ABSENDER)}</p>
<p style="margin:4px 0 0;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:${GOLD};font-weight:700;font-family:${TITEL}">${o.rolle ? esc(o.rolle) : `Gr&uuml;nder &middot; ${FIRMA}`}</p>
</td></tr></table>
${kontakt({ telefon: o.telefon, email: o.email, web: o.siteUrl }, bild)}
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px"><tr><td style="padding:22px 20px 0;text-align:center;font-size:12px;line-height:1.7;color:${GRAU};font-family:${SCHRIFT}">
${FIRMA} &middot; Osnabr&uuml;ck &middot; <a href="${esc(o.siteUrl)}/impressum" style="color:${GRAU}">Impressum</a> &middot; <a href="${esc(o.siteUrl)}/datenschutz" style="color:${GRAU}">Datenschutz</a>${abmeldung}
</td></tr></table>${pixel}</td></tr></table></body></html>`
}

const ICON_WORT = new RegExp(`^(\\s*[-•]\\s+)\\[?(?:${LISTEN_ICONS.join("|")})\\]?\\s+(?=\\S)`, "gim")
const ohneIconTags = (s: string) => s.replace(/^- \[[a-z]+\]\s*/gm, "- ").replace(ICON_WORT, "$1")

export function kampagnenText(k: KampagnenInhalt, o: { abmeldeUrl: string; ctaHref?: string; anrede?: string }): string {
  const teile = [
    k.headline.replace(/\*\*/g, "") || k.subject,
    o.anrede ?? "",
    ohneIconTags(k.body).replace(/^## /gm, "").replace(/^- /gm, "• ").replace(/^> /gm, "").replace(/\*\*/g, ""),
    k.ctaText && k.ctaUrl ? `${k.ctaText}: ${o.ctaHref ?? k.ctaUrl}` : "",
    `Viele Grüße\nMuhammed Emin Akyol\nGründer · ${FIRMA}`,
    `—\n${FIRMA} · Osnabrück\nAbmelden: ${o.abmeldeUrl}`,
  ]
  return teile.filter(Boolean).join("\n\n")
}

export function textOhneIcons(s: string): string {
  return ohneIconTags(s)
}

export function anredeFuer(name: string | null): string {
  const n = (name ?? "").trim()
  return n ? `Guten Tag ${n},` : "Guten Tag,"
}
