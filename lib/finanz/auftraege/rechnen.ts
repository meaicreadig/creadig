/**
 * Angebote & Rechnungen — der reine Rechenkern (kein Server-Code), damit der
 * Editor im Browser und der Server beim Festschreiben exakt dieselbe Zahl sehen.
 * Alle Beträge in Cent, gerundet je Steuergruppe (wie es auf dem Papier steht).
 */

export type DokArt = "angebot" | "rechnung" | "storno"
export type Sprache = "de" | "en" | "tr"
export type SteuerModus = "normal" | "klein" | "reverse" | "drittland"

export type AngebotStatus = "entwurf" | "versendet" | "angenommen" | "abgelehnt" | "aenderung" | "ersetzt" | "verworfen"
export type RechnungStatus = "entwurf" | "versendet" | "bezahlt" | "storniert" | "verworfen"
export type DokStatus = AngebotStatus | RechnungStatus

export type Kunde = {
  name: string
  firma: string
  strasse: string
  plzOrt: string
  land: string
  email: string
  ustId: string
}

export type Position = {
  titel: string
  beschreibung: string
  menge: number
  einheit: string
  preisCent: number
  ustSatz: number
  optional: boolean
  gewaehlt: boolean
}

export type Entwurf = {
  sprache: Sprache
  titel: string
  kunde: Kunde
  datum: string
  gueltigBis: string | null
  zahlungszielTage: number
  leistungszeitraum: string
  einleitung: string
  schluss: string
  rabattProzent: number
  geschaeftsfeld: string
  positionen: Position[]
}

export type Gruppe = { satz: number; nettoCent: number; ustCent: number; bruttoCent: number }
export type Summen = {
  zwischenCent: number
  rabattCent: number
  nettoCent: number
  ustCent: number
  bruttoCent: number
  gruppen: Gruppe[]
  optionalCent: number
}

export const UST_SAETZE = [19, 7, 0] as const
export const EINHEITEN = ["Stück", "Stunde", "Tag", "Monat", "Pauschal", "Jahr"] as const

const EU = new Set(["AT", "BE", "BG", "CY", "CZ", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"])

export const LAENDER: { code: string; label: string }[] = [
  { code: "DE", label: "Deutschland" },
  { code: "AT", label: "Österreich" },
  { code: "CH", label: "Schweiz" },
  { code: "NL", label: "Niederlande" },
  { code: "FR", label: "Frankreich" },
  { code: "BE", label: "Belgien" },
  { code: "TR", label: "Türkei" },
  { code: "AE", label: "Vereinigte Arabische Emirate" },
  { code: "SA", label: "Saudi-Arabien" },
  { code: "QA", label: "Katar" },
  { code: "KW", label: "Kuwait" },
  { code: "BH", label: "Bahrain" },
  { code: "OM", label: "Oman" },
  { code: "GB", label: "Vereinigtes Königreich" },
  { code: "US", label: "USA" },
  { code: "PL", label: "Polen" },
  { code: "IT", label: "Italien" },
  { code: "ES", label: "Spanien" },
]

/** Wie wird besteuert? Entscheidet sich am Kunden, nicht an der Position. */
export function steuerModus(kunde: Pick<Kunde, "land" | "ustId">, ustPflichtig: boolean): SteuerModus {
  if (!ustPflichtig) return "klein"
  const land = (kunde.land || "DE").toUpperCase()
  if (land === "DE") return "normal"
  if (EU.has(land)) return kunde.ustId.trim() ? "reverse" : "normal"
  return "drittland"
}

export function zaehlt(p: Position): boolean {
  return !p.optional || p.gewaehlt
}

export function positionNetto(p: Position): number {
  return Math.round(p.menge * p.preisCent)
}

export function berechne(positionen: Position[], rabattProzent: number, modus: SteuerModus): Summen {
  const rabatt = Math.min(Math.max(rabattProzent || 0, 0), 100)
  const proSatz = new Map<number, number>()
  let zwischen = 0
  let optional = 0
  for (const p of positionen) {
    const netto = positionNetto(p)
    if (!zaehlt(p)) {
      optional += netto
      continue
    }
    const satz = modus === "normal" ? p.ustSatz : 0
    proSatz.set(satz, (proSatz.get(satz) ?? 0) + netto)
    zwischen += netto
  }
  const gruppen: Gruppe[] = [...proSatz.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([satz, roh]) => {
      const nettoCent = Math.round(roh * (1 - rabatt / 100))
      const ustCent = Math.round((nettoCent * satz) / 100)
      return { satz, nettoCent, ustCent, bruttoCent: nettoCent + ustCent }
    })
  const nettoCent = gruppen.reduce((s, g) => s + g.nettoCent, 0)
  const ustCent = gruppen.reduce((s, g) => s + g.ustCent, 0)
  return { zwischenCent: zwischen, rabattCent: zwischen - nettoCent, nettoCent, ustCent, bruttoCent: nettoCent + ustCent, gruppen, optionalCent: optional }
}

export function addTage(iso: string, tage: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + tage)
  return d.toISOString().slice(0, 10)
}

export function heuteBerlin(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })
}

export function tageZwischen(von: string, bis: string): number {
  return Math.round((Date.parse(`${bis}T12:00:00Z`) - Date.parse(`${von}T12:00:00Z`)) / 86_400_000)
}

export const leererKunde = (): Kunde => ({ name: "", firma: "", strasse: "", plzOrt: "", land: "DE", email: "", ustId: "" })

export const leerePosition = (): Position => ({
  titel: "",
  beschreibung: "",
  menge: 1,
  einheit: "Pauschal",
  preisCent: 0,
  ustSatz: 19,
  optional: false,
  gewaehlt: false,
})

/* ------------------------------------------------------------------------ */
/* Nachfassen & Mahnwesen — reine Regeln, damit Liste und Mail übereinstimmen */
/* ------------------------------------------------------------------------ */

export type Mahnstufe = 0 | 1 | 2 | 3
export const MAHN_SCHWELLE: Record<1 | 2 | 3, number> = { 1: 3, 2: 14, 3: 28 }

/** Welche Stufe ist jetzt dran (oder null)? Tage = Tage seit Fälligkeit. */
export function naechsteMahnstufe(tageUeberfaellig: number, aktuell: number): 1 | 2 | 3 | null {
  /* Immer nur eine Stufe weiter — niemand bekommt die 2. Mahnung ohne die Erinnerung davor. */
  const naechste = aktuell + 1
  if (naechste > 3) return null
  return tageUeberfaellig >= MAHN_SCHWELLE[naechste as 1 | 2 | 3] ? (naechste as 1 | 2 | 3) : null
}

/* ------------------------------------------------------------------------ */
/* Texte auf dem Dokument (DE/EN)                                            */
/* ------------------------------------------------------------------------ */

export const DOK_TEXT = {
  de: {
    angebot: "Angebot",
    rechnung: "Rechnung",
    storno: "Stornorechnung",
    nummer: "Nummer",
    datum: "Datum",
    gueltig: "Gültig bis",
    faellig: "Zahlbar bis",
    leistung: "Leistungszeitraum",
    version: "Version",
    pos: "Pos.",
    beschreibung: "Leistung",
    menge: "Menge",
    preis: "Einzelpreis",
    betrag: "Betrag",
    optional: "Optional",
    zwischen: "Zwischensumme",
    rabatt: "Rabatt",
    netto: "Nettobetrag",
    ust: "USt.",
    gesamt: "Gesamtbetrag",
    optionalSumme: "Optionale Leistungen (nicht enthalten)",
    zahlung: "Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer bis zum",
    bank: "Bankverbindung",
    steuernr: "Steuernummer",
    ustid: "USt-IdNr.",
    ihreUstid: "Ihre USt-IdNr.",
    inhaber: "Inhaber",
    storniert: "Diese Rechnung storniert die Rechnung",
    hinweis: {
      normal: "",
      klein: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
      reverse: "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge).",
      drittland: "Nicht im Inland steuerbare Leistung (§ 3a Abs. 2 UStG).",
    } satisfies Record<SteuerModus, string>,
  },
  en: {
    angebot: "Quotation",
    rechnung: "Invoice",
    storno: "Cancellation invoice",
    nummer: "Number",
    datum: "Date",
    gueltig: "Valid until",
    faellig: "Due date",
    leistung: "Service period",
    version: "Version",
    pos: "No.",
    beschreibung: "Service",
    menge: "Qty",
    preis: "Unit price",
    betrag: "Amount",
    optional: "Optional",
    zwischen: "Subtotal",
    rabatt: "Discount",
    netto: "Net amount",
    ust: "VAT",
    gesamt: "Total",
    optionalSumme: "Optional services (not included)",
    zahlung: "Please transfer the amount quoting the invoice number by",
    bank: "Bank details",
    steuernr: "Tax number",
    ustid: "VAT ID",
    ihreUstid: "Your VAT ID",
    inhaber: "Owner",
    storniert: "This invoice cancels invoice",
    hinweis: {
      normal: "",
      klein: "No VAT is charged pursuant to § 19 German VAT Act (small business).",
      reverse: "Reverse charge: VAT to be accounted for by the recipient (Art. 196 Directive 2006/112/EC).",
      drittland: "Service not taxable in Germany (place of supply outside Germany).",
    } satisfies Record<SteuerModus, string>,
  },
  tr: {
    angebot: "Teklif",
    rechnung: "Fatura",
    storno: "İptal faturası",
    nummer: "Numara",
    datum: "Tarih",
    gueltig: "Geçerlilik tarihi",
    faellig: "Son ödeme tarihi",
    leistung: "Hizmet dönemi",
    version: "Versiyon",
    pos: "Sıra",
    beschreibung: "Hizmet",
    menge: "Miktar",
    preis: "Birim fiyat",
    betrag: "Tutar",
    optional: "Opsiyonel",
    zwischen: "Ara toplam",
    rabatt: "İskonto",
    netto: "Net tutar",
    ust: "KDV",
    gesamt: "Genel toplam",
    optionalSumme: "Opsiyonel hizmetler (dahil değildir)",
    zahlung: "Lütfen tutarı fatura numarasını belirterek şu tarihe kadar havale ediniz:",
    bank: "Banka bilgileri",
    steuernr: "Vergi numarası",
    ustid: "KDV numarası",
    ihreUstid: "KDV numaranız",
    inhaber: "İşletme sahibi",
    storniert: "Bu fatura şu faturayı iptal eder:",
    hinweis: {
      normal: "",
      klein: "§ 19 Alman KDV Kanunu uyarınca (küçük işletme) KDV hesaplanmamıştır.",
      reverse: "Ters vergilendirme (Reverse Charge): KDV, hizmeti alan tarafından beyan edilir (AB Direktifi 2006/112/EC Madde 196).",
      drittland: "Almanya'da vergiye tabi olmayan hizmet (ifa yeri Almanya dışında).",
    } satisfies Record<SteuerModus, string>,
  },
} as const

export const ART_LABEL: Record<DokArt, string> = { angebot: "Angebot", rechnung: "Rechnung", storno: "Storno" }

export const STATUS_LABEL: Record<string, string> = {
  entwurf: "Entwurf",
  versendet: "Versendet",
  geoeffnet: "Geöffnet",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
  aenderung: "Änderung gewünscht",
  ersetzt: "Ersetzt",
  abgelaufen: "Abgelaufen",
  bezahlt: "Bezahlt",
  ueberfaellig: "Überfällig",
  storniert: "Storniert",
  verworfen: "Verworfen",
}

const LOCALE: Record<Sprache, string> = { de: "de-DE", en: "en-GB", tr: "tr-TR" }

export function formatEuro(cent: number, sprache: Sprache = "de"): string {
  return new Intl.NumberFormat(LOCALE[sprache], { style: "currency", currency: "EUR" }).format(cent / 100)
}

export function formatDatum(iso: string, sprache: Sprache = "de"): string {
  return new Intl.DateTimeFormat(LOCALE[sprache], { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

export function formatMenge(n: number, sprache: Sprache = "de"): string {
  return new Intl.NumberFormat(LOCALE[sprache], { maximumFractionDigits: 3 }).format(n)
}
