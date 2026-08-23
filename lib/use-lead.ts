"use client"

import { useCallback, useEffect, useRef } from "react"

/**
 * BF-2 — die Formularseite des Missbrauchsschutzes.
 *
 * Beide Formulare (Kontakt und Termin-Assistent) schicken an dieselbe Route
 * und müssen dasselbe Token mitbringen. Damit die Regel nicht an zwei Stellen
 * halb umgesetzt ist, steht sie hier ein einziges Mal:
 *
 *   - Beim Aufbau des Formulars wird ein Token geholt. Der Zeitpunkt dieses
 *     Aufrufs ist die Uhr, gegen die der Server prüft — deshalb holt der Hook
 *     es beim Mounten und nicht erst beim Klick.
 *   - Fehlt es beim Absenden (Netz weg, Antwort verschluckt), wird es genau
 *     dann noch einmal geholt.
 *   - Ist es abgelaufen, weil der Tab stundenlang offen lag, holt der Hook ein
 *     neues und schickt einmal nach. Der Mensch sieht davon nichts — er hat
 *     nichts falsch gemacht.
 *
 * Was der Hook NICHT tut: bei `token_invalid` nachschicken. Dahinter steckt
 * entweder ein manipuliertes Token oder ein Absenden schneller, als ein Mensch
 * tippen kann — beides gehört nicht wiederholt, sondern abgelehnt.
 */

export type LeadResponse = { ok?: boolean; error?: string }

const TOKEN_URL = "/api/lead"

/**
 * Der Server lehnt Token ab, die jünger als zwei Sekunden sind. Musste der
 * Hook eines nachholen (der Aufruf beim Mounten ist schiefgegangen), wartet er
 * diese Spanne ab, statt den Menschen in eine Ablehnung laufen zu lassen, die
 * gar nicht ihm gilt.
 */
const MIN_TOKEN_AGE_MS = 2_500

export function useLeadSubmit() {
  const token = useRef<string | null>(null)
  const fetchedAt = useRef(0)

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch(TOKEN_URL, { method: "GET", cache: "no-store" })
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; token?: string }
        | null
      token.current = response.ok && typeof data?.token === "string" ? data.token : null
      fetchedAt.current = Date.now()
    } catch {
      // Ohne Token wird das Absenden abgelehnt — das ist die richtige Antwort,
      // wenn die eigene Route gerade nicht erreichbar ist.
      token.current = null
    }
    return token.current
  }, [])

  useEffect(() => {
    void fetchToken()
  }, [fetchToken])

  /**
   * Schickt die Anfrage ab. Gibt die Antwort der Route zurück — die Formulare
   * entscheiden selbst, welchen Text sie daraus machen.
   */
  const submit = useCallback(
    async (payload: Record<string, unknown>): Promise<LeadResponse & { status: number }> => {
      async function post(): Promise<LeadResponse & { status: number }> {
        const response = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, token: token.current }),
        })
        const data = (await response.json().catch(() => null)) as LeadResponse | null
        return { ...(data ?? {}), status: response.status }
      }

      if (!token.current) await fetchToken()

      const age = Date.now() - fetchedAt.current
      if (token.current && age < MIN_TOKEN_AGE_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, MIN_TOKEN_AGE_MS - age))
      }

      const first = await post()
      if (first.error === "token_expired") {
        await fetchToken()
        if (token.current) return await post()
      }
      return first
    },
    [fetchToken],
  )

  return submit
}
