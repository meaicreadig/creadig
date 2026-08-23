/**
 * Einwilligungs-Verwaltung (DSGVO / § 25 TDDDG).
 *
 * Stand der Seite — SEC-4:
 * Der Satz „Kommt später ein Dienst mit Drittlandbezug dazu, gehört der
 * Hinweis hierher" stand hier seit dem ersten Tag. Mit GROW-2 ist genau das
 * eingetreten: Vercel Web Analytics ist ein Dienst von Vercel Inc. in den
 * USA. Die Standardvertragsklauseln aus dem Auftragsverarbeitungsvertrag
 * decken die Übermittlung ab, aber sie ersetzen nicht die Aufklärung — wer
 * hier zustimmt, muss vorher wissen, wohin seine Zugriffsdaten gehen.
 * Deshalb steht der Hinweis nach Art. 49 Abs. 1 lit. a DSGVO jetzt im Banner
 * (`consent.thirdCountry` in `dictionary.ts`), sichtbar ÜBER den Schaltern
 * und nicht in einem aufklappbaren Detail.
 *
 * Die Schriften bleiben unberührt: Poppins und JetBrains Mono lädt
 * `next/font` beim Build herunter, ausgeliefert werden sie vom eigenen
 * Server. Maps und Werbe-Tags gibt es weiterhin nicht.
 *
 * Was tatsächlich gespeichert wird:
 *   essential  — immer aktiv, nicht abwählbar: diese Einwilligung selbst
 *                (`creadig_consent`).
 *   functional — Komfort: Sprachwahl (`creadig_lang`) und Erscheinungsbild
 *                (`creadig-theme`). Ohne Einwilligung gilt die Wahl nur für
 *                die laufende Sitzung.
 *   statistics — Reichweitenmessung: Vercel Web Analytics. Setzt KEINE
 *                Cookies und legt keine geräteübergreifende Kennung an, wird
 *                aber trotzdem erst nach ausdrücklicher Einwilligung geladen
 *                (`components/consent/gated-analytics.tsx`). Cookiefrei heißt
 *                nicht einwilligungsfrei — gemessen wird trotzdem.
 */

export const CONSENT_STORAGE_KEY = "creadig_consent"

/**
 * Bei inhaltlichen Änderungen an den Kategorien hochzählen — dann wird neu
 * gefragt.
 *
 * 1 → 2 (GROW-2): Unter Version 1 stand bei `statistics` der Satz „Wir setzen
 * derzeit keinen Analyse-Dienst ein." Das war zum Zeitpunkt der Zustimmung
 * wahr und ist es jetzt nicht mehr. Eine Einwilligung, die sich auf eine
 * andere Beschreibung bezog, gilt nicht weiter — also wird jeder noch einmal
 * gefragt.
 *
 * 2 → 3 (SEC-4): Version 2 nannte den Dienst, verschwieg aber, dass er in
 * den USA läuft. Eine Einwilligung nach Art. 49 Abs. 1 lit. a DSGVO ist nur
 * wirksam, wenn der Betroffene über das Drittland und dessen Risiken
 * unterrichtet wurde — das war sie nicht. Also wird erneut gefragt.
 */
export const CONSENT_VERSION = 3

/** Fired auf `window`, sobald sich die Einwilligung ändert. */
export const CONSENT_CHANGE_EVENT = "creadig:consent-change"

/** Fired auf `window`, um das Banner erneut zu öffnen (Footer-Link „Cookie-Einstellungen"). */
export const CONSENT_OPEN_EVENT = "creadig:open-consent"

/** Essenziell ist nicht abwählbar und taucht deshalb hier nicht auf. */
export const optionalCategories = ["functional", "statistics"] as const

export type OptionalCategory = (typeof optionalCategories)[number]

export type ConsentChoice = Record<OptionalCategory, boolean>

export type StoredConsent = ConsentChoice & {
  version: number
  decidedAt: string
}

export const ACCEPT_ALL: ConsentChoice = { functional: true, statistics: true }
export const ESSENTIAL_ONLY: ConsentChoice = { functional: false, statistics: false }

/** Schlüssel, die von der Komfort-Kategorie abhängen — bei Widerruf entfernt. */
const FUNCTIONAL_KEYS = ["creadig_lang", "creadig-theme"]

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    // Storage kann blockiert sein (Private Mode, Policy) — dann gilt: nichts gespeichert.
    return null
  }
}

/** Gespeicherte Entscheidung — `null`, solange keine oder eine veraltete vorliegt. */
export function readConsent(): StoredConsent | null {
  const store = safeLocalStorage()
  if (!store) return null
  try {
    const raw = store.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredConsent>
    if (parsed?.version !== CONSENT_VERSION) return null
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : "",
      functional: parsed.functional === true,
      statistics: parsed.statistics === true,
    }
  } catch {
    return null
  }
}

/** Prüft eine einzelne Kategorie. Ohne Entscheidung gilt: nicht eingewilligt. */
export function hasConsent(category: OptionalCategory): boolean {
  return readConsent()?.[category] === true
}

/**
 * Speichert die Entscheidung und meldet sie an die Seite.
 * Wird die Komfort-Kategorie abgewählt, werden die dazugehörigen Schlüssel
 * sofort entfernt — Widerruf muss wirken, nicht nur behauptet werden.
 */
export function writeConsent(choice: ConsentChoice): StoredConsent {
  const record: StoredConsent = {
    ...choice,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  }

  const store = safeLocalStorage()
  if (store) {
    try {
      store.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
      if (!choice.functional) {
        for (const key of FUNCTIONAL_KEYS) store.removeItem(key)
      }
    } catch {
      // Ohne Storage gilt die Entscheidung nur für diese Sitzung.
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<StoredConsent>(CONSENT_CHANGE_EVENT, { detail: record }))
  }

  return record
}

/** Öffnet das Banner erneut — z. B. aus dem Footer heraus. */
export function openConsentSettings(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
}
