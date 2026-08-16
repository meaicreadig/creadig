"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { dictionary, type Dictionary, type Locale } from "@/lib/dictionary"

type LocaleContextValue = {
  locale: Locale
  t: Dictionary
  toggleLocale: () => void
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "de",
  t: dictionary.de,
  toggleLocale: () => {},
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("de")

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "de" ? "tr" : "de"))
  }, [])

  const value = useMemo(
    () => ({ locale, t: dictionary[locale] as Dictionary, toggleLocale, setLocale }),
    [locale, toggleLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
