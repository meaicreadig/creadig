import "server-only"

/*
  Sicherheitsmeldungen ohne Sprachmodell dazwischen.

  23.10.2026: Die PHP-Lücken (21.10., Tagesschau, ZEIT, ARD) fehlten im
  Bulletin, weil alles an einer einzigen Perplexity-Suche hing. Was das BSI
  als kritisch einstuft, darf nicht davon abhängen, ob ein Modell es findet.
  Deshalb lesen wir zwei Feeds direkt und geben sie als Pflicht-Funde mit.
*/

export type SicherheitsFund = {
  ressort: "sicherheit"
  titel: string
  fakten: string
  quelle: string
  url: string
  datum?: string
  /** Web-Kern betroffen oder kritisch laut BSI – wird immer Schwerpunkt. */
  pflicht: boolean
}

const WID = "https://wid.cert-bund.de/content/public/securityAdvisory/rss"
const HEISE = "https://www.heise.de/security/rss/news-atom.xml"

/** Software, die bei kleinen Betrieben mit Website, Shop und Mail läuft. */
const RELEVANT =
  /\bphp\b|wordpress|woocommerce|joomla|typo3|drupal|shopware|magento|prestashop|plesk|cpanel|apache|nginx|openssl|mysql|mariadb|exchange|outlook|microsoft 365|chrome|firefox|safari|fritz|router|vpn|fortinet|ivanti|citrix|windows|ransomware|phishing|webhost|hoster/i

/*
  Der Kern unter den Websites unserer Kunden. Eine hohe Warnung hier ist immer
  Schwerpunkt: Die PHP-Lücke stufte das BSI „hoch“ ein, nicht „kritisch“.
*/
const KERN = /php|wordpress|woocommerce|joomla|typo3|drupal|shopware|magento|prestashop|plesk|cpanel|apache|nginx|openssl|mysql|mariadb/i

const TAG_MS = 86_400_000

const ent = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()

const feld = (block: string, name: string) => block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? ""

const isoTag = (d: string) => {
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString().slice(0, 10)
}

async function lade(url: string): Promise<string> {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "user-agent": "creaDIG-Bulletin/1.0" } })
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`)
  return r.text()
}

/** BSI-WID: neue Warnungen der letzten 3 Tage; kritisch immer, hoch nur bei relevanter Software. */
async function wid(jetzt: number): Promise<SicherheitsFund[]> {
  const xml = await lade(WID)
  const gesehen = new Set<string>()
  const out: SicherheitsFund[] = []
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const titel = ent(feld(item, "title"))
    const stufe = ent(feld(item, "category")).toLowerCase()
    const datum = feld(item, "pubDate")
    if (jetzt - new Date(datum).getTime() > 3 * TAG_MS) continue
    const kritisch = stufe === "kritisch"
    if (!kritisch && !(stufe === "hoch" && RELEVANT.test(titel))) continue
    /* Updates derselben Warnung nur einmal – sonst füllt Chrome allein die Liste. */
    const produkt = titel.replace(/\[[^\]]*\]\s*/g, "").trim()
    if (gesehen.has(produkt)) continue
    gesehen.add(produkt)
    out.push({
      ressort: "sicherheit",
      titel: `BSI-Warnung (${stufe}): ${produkt}`,
      fakten: ent(feld(item, "description")),
      quelle: "BSI Warn- und Informationsdienst",
      url: ent(feld(item, "link")),
      datum: isoTag(datum),
      pflicht: KERN.test(titel) || (kritisch && RELEVANT.test(titel)),
    })
  }
  return out.slice(0, 4)
}

/** heise Security: Meldungen der letzten 2 Tage zu verbreiteter Web- und Bürosoftware. */
async function heise(jetzt: number): Promise<SicherheitsFund[]> {
  const xml = await lade(HEISE)
  const out: SicherheitsFund[] = []
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const titel = ent(feld(entry, "title"))
    const fakten = ent(feld(entry, "summary"))
    const datum = feld(entry, "updated")
    if (jetzt - new Date(datum).getTime() > 2 * TAG_MS) continue
    if (!RELEVANT.test(`${titel} ${fakten}`)) continue
    const url = entry.match(/<link[^>]*href="([^"]+)"/)?.[1]
    if (!url) continue
    const pflicht =
      KERN.test(titel) || /kritisch|aktiv ausgenutzt|angegriffen|angriffswelle|notfall|zero-day|0-day/i.test(`${titel} ${fakten}`)
    out.push({ ressort: "sicherheit", titel, fakten, quelle: "heise security", url, datum: isoTag(datum), pflicht })
  }
  return out.slice(0, 3)
}

/** Fällt ein Feed aus, bleibt der andere – das Bulletin läuft nie daran kaputt. */
export async function sicherheitsFunde(): Promise<SicherheitsFund[]> {
  const jetzt = Date.now()
  const [a, b] = await Promise.all([
    wid(jetzt).catch((e) => (console.warn("[bulletin] WID", e instanceof Error ? e.message : e), [])),
    heise(jetzt).catch((e) => (console.warn("[bulletin] heise", e instanceof Error ? e.message : e), [])),
  ])
  return [...a, ...b]
}
