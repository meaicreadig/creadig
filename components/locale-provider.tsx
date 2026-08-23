"use client"

import { createContext, useContext, useMemo } from "react"
import { dictionary, type Dictionary, type Locale } from "@/lib/dictionary"

type LocaleContextValue = {
  locale: Locale
  t: Dictionary
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "de",
  t: dictionary.de,
})

/**
 * GROW-1 — die Sprache kommt jetzt von der Route, nicht mehr aus dem Browser.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VERSCHWUNDEN IST UND WARUM DAS BESSER IST
 * Vorher stand hier eine Zustandsmaschine: Erstrender auf Deutsch, danach ein
 * `useEffect`, der `?lang=` prüfte, dann `localStorage`, dann die Einwilligung
 * in die Komfort-Kategorie, dazu ein Ereignis-Abo für den Fall, dass jemand
 * die Einwilligung nachträglich erteilt. Die türkische Fassung erschien also
 * frühestens nach der Hydration — für einen Crawler nie.
 *
 * Jetzt trägt die URL die Sprache (`/leistungen` gegen `/tr/leistungen`), und
 * das Layout gibt sie als Eigenschaft herein. Damit ist sie schon im
 * Server-HTML richtig, es gibt keinen Umschalt-Moment nach dem ersten Paint,
 * und der Zustand kann gar nicht mehr von der Adresse abweichen.
 *
 * ---------------------------------------------------------------------------
 * DIE SPRACHWAHL WIRD NICHT MEHR GESPEICHERT
 * `creadig_lang` ist weg. Das ist kein Verlust, sondern der Punkt: Eine
 * gespeicherte Vorliebe, die die URL überstimmt, macht dieselbe Adresse für
 * zwei Menschen zu zwei verschiedenen Seiten — und das ist genau der Fehler,
 * den die alte Lösung hatte. Wer türkisch lesen will, verlinkt `/tr/…` und
 * bekommt türkisch; wer den Schalter drückt, wechselt die Adresse.
 *
 * Ein Wert weniger im lokalen Speicher heißt zugleich: ein Punkt weniger,
 * für den die Einwilligung gebraucht wird (siehe lib/consent.ts).
 */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const value = useMemo(
    () => ({ locale, t: dictionary[locale] as Dictionary }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
