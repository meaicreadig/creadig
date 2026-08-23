import { Suspense } from "react"
import type { Metadata } from "next"
import { TerminWizard } from "@/components/termin/termin-wizard"
import { dictionary, type Locale } from "@/lib/dictionary"
import { localeAlternates, localeUrl, openGraphLocale } from "@/lib/routes"

/**
 * Der Termin-Assistent (GROW-1).
 *
 * Die Kopfdaten standen hart in der Route, auf Deutsch — und die alte
 * Beschreibung versprach noch, die Anfrage gehe „als fertige Nachricht an
 * unser WhatsApp". Seit dem Lead-Weg (`app/api/lead`) stimmt das nicht mehr.
 * Beides liegt jetzt zweisprachig im Wörterbuch.
 */
export function terminMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].termin
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates("/termin", locale),
    openGraph: {
      title: `${copy.metaTitle} · creaDIG`,
      description: copy.metaDescription,
      url: localeUrl("/termin", locale),
      locale: openGraphLocale[locale],
      type: "website",
    },
  }
}

export function TerminRoute() {
  return (
    // useSearchParams (Paket-Vorauswahl) braucht eine Suspense-Grenze,
    // damit die Route statisch vorgerendert werden kann.
    <Suspense fallback={<div className="min-h-dvh" />}>
      <TerminWizard />
    </Suspense>
  )
}
