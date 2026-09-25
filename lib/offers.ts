import type { Locale } from "@/lib/dictionary"

/*
 * ==========================================================================
 * DIE EINE PREISQUELLE (Final Implementation · W1 Commercial Truth)
 * ==========================================================================
 *
 * Vorher stand jeder Betrag zweimal: als Zahl in `site-data.ts` und als
 * fertiger Satz im Woerterbuch — „Das Website-Paket kostet 3.900 € netto",
 * viermal, je Sprache einmal. Wer den Preis aenderte, aenderte die Kachel und
 * vergass die FAQ. Die Seite hat danach zwei Preise fuer dieselbe Sache, und
 * der Kaeufer glaubt den niedrigeren.
 *
 * Jetzt steht jeder Betrag HIER und nur hier. Das Woerterbuch traegt
 * Platzhalter (`{price:website}`), die beim Laden des Woerterbuchs gefuellt
 * werden — `fillOfferTokens()` unten. Ein Platzhalter ohne veroeffentlichtes
 * Angebot bricht den Build, statt eine leere Stelle auszuliefern.
 *
 * Diese Datei importiert zur Laufzeit NICHTS aus dem Haus. Das Woerterbuch
 * liest sie beim Laden; ein Import in die Gegenrichtung waere ein Zyklus.
 */

type L = Record<Locale, string>

/*
 * Die Formatregeln sind unveraendert aus `site-data.ts` hierher gezogen
 * (GATE 05): eine Quelle, ein Formatierer. Arabisch gruppiert mit PUNKT und
 * westlichen Ziffern, so wie es die arabische Fassung ueberall schreibt.
 */
const PRICE_FORMAT: Record<Locale, { tag: string; wrap: (n: string) => string }> = {
  de: { tag: "de-DE", wrap: (n) => `${n} €` },
  tr: { tag: "tr-TR", wrap: (n) => `${n} €` },
  en: { tag: "en-GB", wrap: (n) => `€${n}` },
  ar: { tag: "de-DE", wrap: (n) => `${n} يورو` },
}

export function formatPrice(amount: number, locale: Locale): string {
  const format = PRICE_FORMAT[locale]
  return format.wrap(new Intl.NumberFormat(format.tag).format(amount))
}

/** Eine Spanne mit EINER Waehrungsangabe: „2.000–4.000 €", „€2,000–4,000". */
export function formatRange(from: number, to: number, locale: Locale): string {
  const format = PRICE_FORMAT[locale]
  const n = new Intl.NumberFormat(format.tag)
  return format.wrap(`${n.format(from)}–${n.format(to)}`)
}

/** Derselbe Betrag in allen Sprachen — fuer Felder, die `Localized` erwarten. */
export function localizedPrice(amount: number): L {
  return {
    de: formatPrice(amount, "de"),
    tr: formatPrice(amount, "tr"),
    en: formatPrice(amount, "en"),
    ar: formatPrice(amount, "ar"),
  }
}

export function localizedRange(from: number, to: number): L {
  return {
    de: formatRange(from, to, "de"),
    tr: formatRange(from, to, "tr"),
    en: formatRange(from, to, "en"),
    ar: formatRange(from, to, "ar"),
  }
}

/*
 * Die Umsatzsteuer als EINE Zahl. Ob sie ausgewiesen wird, entscheidet der
 * Steuerstatus (`steuerstatusFreigegeben()` in site-data) — offen beim Owner.
 * Die Hoehe steht hier, damit sie nicht in zwanzig Saetzen steht.
 */
export const VAT_PERCENT = 19

/*
 * ==========================================================================
 * DIE ANGEBOTE — in Kundensprache, ohne „Entry/Core"
 * ==========================================================================
 *
 * Website          Festpreis. Der Regelpreis ist DER Preis.
 * Website-Pilot    Pilotplatz je Gewerk — ein Tausch: niedrigerer Preis gegen
 *                  eine schriftliche Referenzfreigabe (Name, Screens, ein Zitat
 *                  nach 90 Tagen). Aus dem Rabatt wird eine Maschine fuer
 *                  Belege, statt ein Zeichen von Unsicherheit zu sein.
 * Systemanalyse    Festpreis, anrechenbar — die zweite sichtbare Zahl UEBER
 *                  der Website. `amount: null` bis der Owner die Zahl nennt
 *                  (O3); bis dahin `published: false` und NICHT oeffentlich.
 *                  „Festpreis folgt" auf der Seite waere eine Luecke, die
 *                  jeder als Verlegenheit liest.
 * Pruefung (BFSG)  Festpreis, eigener Einstieg.
 * Betreuung        Website-Betreuung, monatlich. Erscheint NUR im Kontext
 *                  Website/Betrieb — nie als Preis fuer Systemarbeit.
 *
 * Das Systemprojekt steht hier bewusst nicht: Es hat keinen Betrag, sondern
 * kommt aus der Analyse („Angebot nach Analyse").
 */
export type PriceMode = "fixed" | "after-analysis" | "recurring"
export type OfferKey = "website" | "website-pilot" | "analyse" | "audit" | "betreuung"

export type Offer = {
  key: OfferKey
  priceMode: PriceMode
  /** `null` = nicht oeffentlich rendern. */
  amount: number | null
  period: "month" | null
  label: L
  /** Die Gegenleistung, an der ein Preis haengt (Pilot: die Referenzfreigabe). */
  condition?: L
  cta: "erstgespraech" | "systemgespraech" | "pruefung"
  published: boolean
}

const PILOT_AMOUNT = 2400

export const offers: Offer[] = [
  {
    key: "website",
    priceMode: "fixed",
    amount: 3900,
    period: null,
    label: {
      de: "Website",
      tr: "Web sitesi",
      en: "Website",
      ar: "الموقع",
    },
    cta: "erstgespraech",
    published: true,
  },
  {
    key: "website-pilot",
    priceMode: "fixed",
    amount: PILOT_AMOUNT,
    period: null,
    label: {
      de: "Pilotplatz je Gewerk",
      tr: "Meslek dalı başına pilot yer",
      en: "Pilot place per trade",
      ar: "مقعد تجريبي لكل حرفة",
    },
    condition: {
      de: `Pilotplatz je Gewerk: ${formatPrice(PILOT_AMOUNT, "de")} gegen schriftliche Referenzfreigabe`,
      tr: `Meslek dalı başına pilot yer: yazılı referans izni karşılığında ${formatPrice(PILOT_AMOUNT, "tr")}`,
      en: `Pilot place per trade: ${formatPrice(PILOT_AMOUNT, "en")} in exchange for written permission to use you as a reference`,
      ar: `مقعد تجريبي لكل حرفة: ${formatPrice(PILOT_AMOUNT, "ar")} مقابل إذن مكتوب بذكركم كمرجع`,
    },
    cta: "erstgespraech",
    published: true,
  },
  {
    key: "analyse",
    priceMode: "fixed",
    /* O3 — die Zahl und die Anrechnungsregel nennt der Owner. */
    amount: null,
    period: null,
    label: {
      de: "Systemanalyse",
      tr: "Sistem analizi",
      en: "System analysis",
      ar: "تحليل النظام",
    },
    cta: "systemgespraech",
    published: false,
  },
  {
    key: "audit",
    priceMode: "fixed",
    amount: 1500,
    period: null,
    label: {
      de: "Barrierefreiheits-Prüfung",
      tr: "Erişilebilirlik denetimi",
      en: "Accessibility audit",
      ar: "فحص إتاحة الوصول",
    },
    cta: "pruefung",
    published: true,
  },
  {
    key: "betreuung",
    priceMode: "recurring",
    amount: 149,
    period: "month",
    label: {
      de: "Website-Betreuung",
      tr: "Web sitesi bakımı",
      en: "Website care",
      ar: "رعاية الموقع",
    },
    cta: "erstgespraech",
    published: true,
  },
]

/*
 * Die Behebung nach einer Pruefung hat KEINEN Festpreis — fuer Ungesehenes
 * nennt niemand seriös eine Zahl. Die Spanne ist Erfahrung aus dem eigenen
 * Durchgang und steht als solche auf der Seite, nie als Angebot.
 */
export const remediationRange = { from: 2000, to: 4000 } as const

export function findOffer(key: OfferKey): Offer {
  const found = offers.find((o) => o.key === key)
  if (!found) throw new Error(`Angebot fehlt: ${key}`)
  return found
}

/** Der Betrag eines veroeffentlichten Angebots, sonst `null`. */
export function offerAmount(key: OfferKey): number | null {
  const o = findOffer(key)
  return o.published ? o.amount : null
}

export const publishedOffers = offers.filter((o) => o.published && o.amount !== null)

/*
 * ==========================================================================
 * PLATZHALTER IM WOERTERBUCH
 * ==========================================================================
 *
 *   {price:<key>}      Betrag des Angebots, in der Schreibweise der Sprache
 *   {condition:<key>}  die Bedingung (Pilot: Referenzfreigabe)
 *   {range:behebung}   die Erfahrungsspanne der Behebung
 *   {vat}              die Umsatzsteuer in Prozent, als Zahl
 *
 * Ein Platzhalter auf ein unveroeffentlichtes Angebot WIRFT. Das ist
 * Absicht: Lieber bricht der Build, als dass „Festpreis {price:analyse}"
 * oder ein leerer Satz ausgeliefert wird.
 */
const TOKEN = /\{(price|condition|range|vat|sprachen)(?::([\w-]+))?\}/g

/*
 * W2 — die Beratungssprachen als EINE Angabe. Englisch und Arabisch nannten
 * drei Sprachen, Deutsch und Tuerkisch zwei — dieselbe Firma, zwei Zusagen.
 * `{sprachen}` = „und"-Reihe, `{sprachen:oder}` = „oder"-Reihe.
 */
export const BERATUNGSSPRACHEN: Record<Locale, { und: string; oder: string }> = {
  de: { und: "Deutsch, Türkisch und Englisch", oder: "Deutsch, Türkisch oder Englisch" },
  tr: { und: "Almanca, Türkçe ve İngilizce", oder: "Almanca, Türkçe veya İngilizce" },
  en: { und: "German, Turkish and English", oder: "German, Turkish or English" },
  ar: { und: "الألمانية والتركية والإنجليزية", oder: "الألمانية أو التركية أو الإنجليزية" },
}

export function fillOfferTokens(text: string, locale: Locale): string {
  if (!text.includes("{")) return text
  return text.replace(TOKEN, (whole, kind: string, key: string | undefined) => {
    if (kind === "vat") return String(VAT_PERCENT)
    if (kind === "sprachen") return BERATUNGSSPRACHEN[locale][key === "oder" ? "oder" : "und"]
    if (kind === "range") {
      if (key !== "behebung") throw new Error(`Unbekannte Spanne im Text: ${whole}`)
      return formatRange(remediationRange.from, remediationRange.to, locale)
    }
    const o = offers.find((x) => x.key === key)
    if (!o || !o.published) throw new Error(`Preis-Platzhalter ohne veroeffentlichtes Angebot: ${whole}`)
    if (kind === "price") {
      if (o.amount === null) throw new Error(`Preis-Platzhalter ohne Betrag: ${whole}`)
      return formatPrice(o.amount, locale)
    }
    if (!o.condition) throw new Error(`Bedingungs-Platzhalter ohne Bedingung: ${whole}`)
    return o.condition[locale]
  })
}

/** Fuellt alle Zeichenketten eines Sprachbaums; Form und Typ bleiben gleich. */
export function fillOfferTokensDeep<T>(value: T, locale: Locale): T {
  if (typeof value === "string") return fillOfferTokens(value, locale) as T
  if (Array.isArray(value)) return value.map((v) => fillOfferTokensDeep(v, locale)) as T
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = fillOfferTokensDeep(v, locale)
    return out as T
  }
  return value
}
