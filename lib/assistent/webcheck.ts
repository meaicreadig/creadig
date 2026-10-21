/**
 * Kurzer, ehrlicher Webseiten-Check für Erstmails: nur Befunde, die man von außen
 * sicher messen kann. Kein Befund wird erfunden – im Zweifel bleibt die Liste leer.
 */
export type WebCheck = {
  erreichbar: boolean
  https: boolean
  mobil: boolean
  ladezeitMs: number | null
  groesseKb: number | null
  copyrightJahr: number | null
  titel: string | null
  befunde: string[]
}

export async function pruefeWebseite(website: string): Promise<WebCheck> {
  const leer: WebCheck = {
    erreichbar: false,
    https: website.startsWith("https://"),
    mobil: false,
    ladezeitMs: null,
    groesseKb: null,
    copyrightJahr: null,
    titel: null,
    befunde: [],
  }
  let url: URL
  try {
    url = new URL(website)
  } catch {
    return leer
  }
  const start = Date.now()
  let html = ""
  let endUrl = url.toString()
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; creaDIG-Webcheck/1.0)" },
    })
    if (!res.ok) return leer
    endUrl = res.url || endUrl
    html = (await res.text()).slice(0, 1_500_000)
  } catch {
    return leer
  }
  const ladezeitMs = Date.now() - start
  const groesseKb = Math.round(Buffer.byteLength(html, "utf8") / 1024)
  const https = endUrl.startsWith("https://")
  const mobil = /<meta[^>]+name=["']viewport["']/i.test(html)
  const titel = html.match(/<title[^>]*>([^<]{1,140})<\/title>/i)?.[1]?.trim() ?? null
  const jahre = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/gi)].map((m) => Number(m[1]))
  const copyrightJahr = jahre.length ? Math.max(...jahre) : null
  const jetzt = new Date().getFullYear()

  const befunde: string[] = []
  if (!https) befunde.push("Die Seite läuft ohne verschlüsselte Verbindung (kein HTTPS), Browser zeigen dann „Nicht sicher“ an.")
  if (!mobil) befunde.push("Die Seite ist nicht für Handys eingerichtet und wird dort klein und schwer lesbar angezeigt.")
  if (ladezeitMs > 3500) befunde.push(`Die Startseite braucht rund ${Math.round(ladezeitMs / 100) / 10} Sekunden, bis sie antwortet.`)
  if (copyrightJahr && copyrightJahr <= jetzt - 3) befunde.push(`Im Fußbereich steht noch ${copyrightJahr}, das wirkt auf Besucher veraltet.`)
  if (!titel) befunde.push("Die Seite hat keinen Seitentitel, damit wird sie bei Google schlechter gefunden.")

  return { erreichbar: true, https, mobil, ladezeitMs, groesseKb, copyrightJahr, titel, befunde }
}

export function webcheckNotiz(c: WebCheck): string {
  if (!c.erreichbar) return "Webseiten-Check: Seite nicht erreichbar."
  const teile = [
    c.https ? "HTTPS ok" : "kein HTTPS",
    c.mobil ? "mobil ok" : "nicht mobil",
    c.ladezeitMs ? `${c.ladezeitMs} ms` : null,
    c.groesseKb ? `${c.groesseKb} KB` : null,
    c.copyrightJahr ? `© ${c.copyrightJahr}` : null,
  ].filter(Boolean)
  return `Webseiten-Check: ${teile.join(" · ")}${c.befunde.length ? `\nBefunde:\n- ${c.befunde.join("\n- ")}` : "\nKeine sichtbaren Mängel."}`
}
