import { Suspense } from "react"
import type { Metadata } from "next"
import { TerminWizard } from "@/components/termin/termin-wizard"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"

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
  return pageMetadata({
    locale,
    path: "/termin",
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
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
