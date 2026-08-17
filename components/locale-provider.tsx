"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { dictionary, type Dictionary, type Locale } from "@/lib/dictionary"
import { CONSENT_CHANGE_EVENT, hasConsent } from "@/lib/consent"

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
  const localeRef = useRef<Locale>("de")
  localeRef.current = locale

  useEffect(() => {
    // `?lang=tr` gewinnt: Wer einen tuerkischen Link weitergibt, will, dass er
    // auf Tuerkisch aufgeht — unabhaengig davon, was im Browser des Empfaengers
    // gespeichert ist. Der Parameter wird nicht gespeichert; er ist ein
    // Einstiegspunkt, keine Praeferenz. Dasselbe liest das Boot-Skript in
    // app/layout.tsx, damit `<html lang>` schon vor dem ersten Paint stimmt.
    const fromUrl = new URLSearchParams(window.location.search).get("lang")
    if (fromUrl === "tr" || fromUrl === "de") {
      setLocaleState(fromUrl)
      return
    }
    // Ohne Komfort-Einwilligung wird nichts gelesen — die Wahl gilt dann nur
    // für die laufende Sitzung (siehe lib/consent.ts).
    if (!hasConsent("functional")) return
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
    if (!hasConsent("functional")) return
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Nicht kritisch: die Wahl gilt dann nur für diese Sitzung.
    }
  }, [])

  // Wird die Komfort-Kategorie nachträglich erlaubt, sichern wir die aktuelle
  // Wahl. Beim Widerruf räumt lib/consent.ts den Schlüssel selbst weg.
  useEffect(() => {
    const onConsentChange = () => {
      if (!hasConsent("functional")) return
      try {
        window.localStorage.setItem(STORAGE_KEY, localeRef.current)
      } catch {
        // Ohne Storage bleibt es bei der Sitzungs-Wahl.
      }
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange)
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
