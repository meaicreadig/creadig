const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })
const EUR_RUND = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

export const eur = (cent: number) => EUR.format(cent / 100)
export const eurRund = (cent: number) => EUR_RUND.format(cent / 100)

const MONAT = new Intl.DateTimeFormat("de-DE", { month: "short", timeZone: "UTC" })
export const monatKurz = (schluessel: string) => MONAT.format(new Date(`${schluessel}-01T00:00:00Z`))

const TAG = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
export const tag = (iso: string) => TAG.format(new Date(`${iso}T00:00:00Z`))
