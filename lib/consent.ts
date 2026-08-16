/**
 * Einwilligungs-Verwaltung (DSGVO / § 25 TDDDG).
 *
 * Ehrlichkeits-Hinweis zum Stand der Seite:
 * Wir laden **keine** Dienste aus Drittländern. Poppins und JetBrains Mono
 * werden über `next/font` beim Build heruntergeladen und vom eigenen Server
 * ausgeliefert; es gibt kein Analytics, keine Maps, keine Werbe-Tags. Deshalb
 * steht im Banner bewusst **kein** USA-Transfer-Hinweis nach Art. 49 Abs. 1
 * lit. a DSGVO — er wäre schlicht unwahr. Kommt später ein Dienst mit
 * Drittlandbezug dazu, gehört der Hinweis hierher und in `dictionary.ts`.
 *
 * Was tatsächlich gespeichert wird:
 *   essential  — immer aktiv, nicht abwählbar: diese Einwilligung selbst
 *                (`creadig_consent`).
 *   functional — Komfort: Sprachwahl (`creadig_lang`) und Erscheinungsbild
 *                (`creadig-theme`). Ohne Einwilligung gilt die Wahl nur für
 *                die laufende Sitzung.
 *   statistics — Reichweitenmessung. Derzeit im Einsatz: keine. Die
 *                Entscheidung wird trotzdem gespeichert und muss von jedem
 *                künftigen Skript abgefragt werden.
 */

export const CONSENT_STORAGE_KEY = "creadig_consent"

/** Bei inhaltlichen Änderungen an den Kategorien hochzählen — dann wird neu gefragt. */
export const CONSENT_VERSION = 1

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
