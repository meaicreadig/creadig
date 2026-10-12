/**
 * Kampagnen-Vorlage im creaDIG-Auftritt (Nachtblau, Logo-Gold).
 * Bewusst ohne `server-only`: dieselbe Funktion rendert die Live-Vorschau im
 * Studio und die versendete Mail — was man sieht, ist was ankommt.
 *
 * Text-Syntax im Inhalt: Leerzeile = neuer Absatz, "## " = Zwischentitel,
 * Zeilen mit "- " = Liste.
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
const TEXT = "#1C2433"
const GRAU = "#5B6474"
const LINIE = "#E4E1DA"
const ZEMENT = "#F3F2EF"
const SCHRIFT = "Manrope,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function bloecke(body: string): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith("## ")) {
        return `<h2 style="margin:28px 0 10px;font-size:17px;line-height:1.35;color:${NACHT};font-weight:700">${esc(b.slice(3))}</h2>`
      }
      const zeilen = b.split("\n")
      if (zeilen.every((z) => z.trim().startsWith("- "))) {
        return `<table role="presentation" width="100%" style="margin:0 0 16px">${zeilen
          .map(
            (z) =>
              `<tr><td valign="top" style="width:18px;padding:3px 0;color:${GOLD};font-size:15px;line-height:1.6">&#9670;</td><td style="padding:3px 0;font-size:15px;line-height:1.6;color:${TEXT}">${esc(z.trim().slice(2))}</td></tr>`,
          )
          .join("")}</table>`
      }
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${TEXT}">${esc(b).replace(/\n/g, "<br>")}</p>`
    })
    .join("")
}

export function kampagnenHtml(
  k: KampagnenInhalt,
  o: { siteUrl: string; abmeldeUrl: string; ctaHref?: string; pixelUrl?: string; anrede?: string },
): string {
  const ctaHref = o.ctaHref ?? k.ctaUrl
  const knopf =
    k.ctaText.trim() && k.ctaUrl.trim()
      ? `<table role="presentation" style="margin:8px 0 8px"><tr><td style="background:${NACHT};border-radius:6px;border-bottom:3px solid ${GOLD}"><a href="${esc(ctaHref)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;font-family:${SCHRIFT}">${esc(k.ctaText)} &rarr;</a></td></tr></table>`
      : ""
  const anrede = o.anrede ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${TEXT}">${esc(o.anrede)}</p>` : ""
  const pixel = o.pixelUrl ? `<img src="${esc(o.pixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">` : ""

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(k.subject)}</title></head>
<body style="margin:0;padding:0;background:${ZEMENT};font-family:${SCHRIFT}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(k.preheader)}</span>
<table role="presentation" width="100%" style="background:${ZEMENT}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden">
<tr><td style="background:${NACHT};padding:26px 32px 22px">
<span style="font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:0.01em">crea<span style="color:${GOLD_HELL}">DIG</span></span>
<span style="display:block;margin-top:4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD_HELL}">System-Haus für digitale Betriebe</span>
</td></tr>
<tr><td style="height:3px;background:${GOLD}"></td></tr>
<tr><td style="padding:34px 32px 10px">
<h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;color:${NACHT};font-weight:800">${esc(k.headline || k.subject)}</h1>
${anrede}${bloecke(k.body)}${knopf}
<p style="margin:26px 0 0;font-size:15px;line-height:1.6;color:${TEXT}">Viele Grüße<br><strong style="color:${NACHT}">Muhammed Emin Akyol</strong><br><span style="color:${GRAU}">Gründer · creaDIG</span></p>
</td></tr>
<tr><td style="padding:24px 32px 0"><div style="height:1px;background:${LINIE}"></div></td></tr>
<tr><td style="padding:18px 32px 28px;font-size:12px;line-height:1.65;color:${GRAU}">
creaDIG solutions UG (haftungsbeschränkt) · Osnabrück<br>
<a href="${esc(o.siteUrl)}" style="color:${GRAU}">creadig.de</a> · <a href="${esc(o.siteUrl)}/impressum" style="color:${GRAU}">Impressum</a> · <a href="${esc(o.siteUrl)}/datenschutz" style="color:${GRAU}">Datenschutz</a><br>
Sie erhalten diese Nachricht, weil Sie mit creaDIG in Kontakt stehen. <a href="${esc(o.abmeldeUrl)}" style="color:${NACHT};font-weight:600">Abmelden</a>
</td></tr></table>${pixel}</td></tr></table></body></html>`
}

export function kampagnenText(k: KampagnenInhalt, o: { abmeldeUrl: string; ctaHref?: string; anrede?: string }): string {
  const teile = [
    k.headline || k.subject,
    o.anrede ?? "",
    k.body.replace(/^## /gm, "").replace(/^- /gm, "• "),
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
