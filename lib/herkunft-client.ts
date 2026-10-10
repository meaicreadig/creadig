/**
 * Erstkontakt im Arbeitsspeicher der geoeffneten Seite.
 *
 * Bewusst KEIN Cookie, kein localStorage, kein sessionStorage: Ein Eintrag im
 * Endgeraet waere nach § 25 TDDDG einwilligungspflichtig. Eine Modul-Variable
 * ueberlebt die clientseitige Navigation der App und verschwindet mit dem Tab.
 *
 * Ob die Werte gespeichert werden, entscheidet weiterhin der Server
 * (`kampagneSpeicherbar` in lib/herkunft.ts) anhand der Datenschutzerklaerung.
 */

type Erstkontakt = {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
}

const PARAMETER: ReadonlyArray<[keyof Erstkontakt, string]> = [
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["utmTerm", "utm_term"],
  ["utmContent", "utm_content"],
]

const MAX_LAENGE = 80

let erstkontakt: Erstkontakt | null = null

function kuerzen(wert: string | null): string {
  return (wert ?? "").trim().slice(0, MAX_LAENGE)
}

function verweisHost(): string {
  try {
    if (!document.referrer) return ""
    const host = new URL(document.referrer).hostname.replace(/^www\./, "")
    return host === window.location.hostname.replace(/^www\./, "") ? "" : host
  } catch {
    return ""
  }
}

/** Einmal pro Tab beim ersten Seitenaufruf. Spaetere Aufrufe aendern nichts. */
export function merkeErstkontakt(): void {
  if (erstkontakt || typeof window === "undefined") return

  const params = new URLSearchParams(window.location.search)
  const aus = Object.fromEntries(
    PARAMETER.map(([feld, name]) => [feld, kuerzen(params.get(name))]),
  ) as Erstkontakt

  if (!aus.utmSource) {
    const host = verweisHost()
    if (host) {
      aus.utmSource = kuerzen(host)
      aus.utmMedium = aus.utmMedium || "referral"
    }
  }

  erstkontakt = aus
}

/** Felder fuer die Lead-Route; leer, wenn nichts bekannt ist. */
export function herkunftFuerAnfrage(): Partial<Erstkontakt> {
  if (!erstkontakt) merkeErstkontakt()
  if (!erstkontakt) return {}
  return Object.fromEntries(
    Object.entries(erstkontakt).filter(([, wert]) => wert !== ""),
  ) as Partial<Erstkontakt>
}
