"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { CONSENT_CHANGE_EVENT, hasConsent } from "@/lib/consent"

type Theme = "light" | "dark"

const STORAGE_KEY = "creadig-theme"

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Light is the intended default and primary look for creaDIG.
  const [theme, setTheme] = useState<Theme>("light")
  // Bis das Boot-Skript ausgelesen ist, darf nichts an die Klasse geschrieben
  // werden — sonst nimmt der Sync-Effekt den State ("light") fuer bare Muenze
  // und entfernt `.dark` wieder, das das Skript gerade gesetzt hat. Genau das
  // waere das Flackern zurueck, das E-F1 beseitigen soll.
  const [adopted, setAdopted] = useState(false)
  const themeRef = useRef<Theme>("light")
  themeRef.current = theme

  useEffect(() => {
    // Die Wahrheit steht im DOM: Das Boot-Skript in app/layout.tsx hat
    // `.dark` bereits vor dem ersten Paint gesetzt — einwilligungsgeprueft.
    // Hier wird sie nur uebernommen, nicht neu ermittelt.
    if (document.documentElement.classList.contains("dark")) setTheme("dark")
    setAdopted(true)
  }, [])

  useEffect(() => {
    if (!adopted) return
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
  }, [theme, adopted])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light"
      if (hasConsent("functional")) {
        try {
          window.localStorage.setItem(STORAGE_KEY, next)
        } catch {
          // Nicht kritisch: die Wahl gilt dann nur für diese Sitzung.
        }
      }
      return next
    })
  }, [])

  // Nachträglich erteilte Komfort-Einwilligung sichert die aktuelle Wahl.
  useEffect(() => {
    const onConsentChange = () => {
      if (!hasConsent("functional")) return
      try {
        window.localStorage.setItem(STORAGE_KEY, themeRef.current)
      } catch {
        // Ohne Storage bleibt es bei der Sitzungs-Wahl.
      }
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange)
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
