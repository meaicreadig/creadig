import "server-only"

/**
 * Sucht die öffentliche Kontaktadresse einer Firma auf ihrer eigenen Webseite
 * (Startseite, Impressum, Kontakt). Nur Adressen der eigenen Domain – keine Erfindung.
 */

const UNTERSEITEN = ["", "/impressum", "/kontakt", "/impressum/", "/kontakt/", "/imprint", "/contact"]
const BEVORZUGT = ["info", "kontakt", "mail", "office", "hallo", "hello", "post", "buero", "service", "vorstand"]
const MUELL = /\.(png|jpe?g|gif|svg|webp)$|^(noreply|no-reply|datenschutz|privacy|webmaster|example)@|sentry|wixpress|@example\./i

function domainVon(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

function sichereUrl(url: string): URL | null {
  try {
    const u = new URL(url)
    if (u.protocol !== "https:" && u.protocol !== "http:") return null
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(u.hostname) || u.hostname.endsWith(".internal")) return null
    return u
  } catch {
    return null
  }
}

async function ladeSeite(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; creaDIG-Kontaktsuche/1.0)", Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    })
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return ""
    return (await res.text()).slice(0, 400_000)
  } catch {
    return ""
  }
}

function adressenIn(html: string): string[] {
  const klar = html
    .replace(/&#64;|&commat;/gi, "@")
    .replace(/&#46;/g, ".")
    .replace(/\s*[[(]\s*(at|ät)\s*[\])]\s*/gi, "@")
    .replace(/\s*[[(]\s*(dot|punkt)\s*[\])]\s*/gi, ".")
  const treffer = klar.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? []
  return [...new Set(treffer.map((t) => t.toLowerCase().replace(/^mailto:/, "")))].filter((t) => !MUELL.test(t))
}

function bewertung(adresse: string, domain: string): number {
  const [lokal, host] = adresse.split("@")
  let punkte = 0
  if (host === domain || host.endsWith(`.${domain}`) || domain.endsWith(`.${host}`)) punkte += 10
  const rang = BEVORZUGT.indexOf(lokal)
  if (rang >= 0) punkte += 5 - rang * 0.3
  return punkte
}

export async function findeKontaktMail(website: string): Promise<string | null> {
  const basis = sichereUrl(website)
  const domain = basis ? domainVon(basis.href) : null
  if (!basis || !domain) return null
  const wurzel = `${basis.protocol}//${basis.host}`
  const gefunden = new Set<string>()
  for (const pfad of UNTERSEITEN) {
    const html = await ladeSeite(`${wurzel}${pfad}`)
    if (!html) continue
    for (const a of adressenIn(html)) gefunden.add(a)
    const besteEigene = [...gefunden].filter((a) => bewertung(a, domain) >= 10)
    if (besteEigene.length && pfad !== "") break
  }
  const liste = [...gefunden].sort((a, b) => bewertung(b, domain) - bewertung(a, domain))
  const beste = liste[0]
  return beste && bewertung(beste, domain) >= 10 ? beste : null
}
