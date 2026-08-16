"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { dictionary, type Dictionary, type Locale } from "@/lib/dictionary"

type LocaleContextValue = {
  locale: Locale
  t: Dictionary
  toggleLocale: () => void
  setLocale: (locale: Locale) => void
}

const STORAGE_KEY = "creadig_lang"

const LocaleContext = createContext<LocaleContextValue>({
  locale: "de",
  t: dictionary.de,
  toggleLocale: () => {},
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // DE ist primär und zugleich der Server-Render — die gespeicherte Wahl wird
  // erst nach der Hydration angewandt, damit kein Markup-Mismatch entsteht.
  const [locale, setLocaleState] = useState<Locale>("de")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === "tr" || stored === "de") setLocaleState(stored)
    } catch {
      // localStorage kann blockiert sein — DE bleibt der Fallback.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Nicht kritisch: die Wahl gilt dann nur für diese Sitzung.
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === "de" ? "tr" : "de")
  }, [locale, setLocale])

  const value = useMemo(
    () => ({ locale, t: dictionary[locale] as Dictionary, toggleLocale, setLocale }),
    [locale, toggleLocale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
