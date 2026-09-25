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

/*
 * S4 — DIE UEBERSCHRIFT STEHT IM SERVER-HTML.
 *
 * Der Assistent liest `useSearchParams` und rendert deshalb erst im Browser;
 * das Server-HTML trug bis hierher nur ein leeres `<div>` — kein H1, kein
 * Satz, fuer Suchmaschinen und ohne JavaScript eine leere Seite. Die
 * Ersatzansicht zeigt jetzt denselben Kopf in derselben Geometrie wie der
 * Assistent. Es steht zu jedem Zeitpunkt genau EIN H1 im Dokument.
 */
function TerminKopf({ locale }: { locale: Locale }) {
  const t = dictionary[locale].termin
  return (
    <main className="relative min-h-dvh">
      <div className="relative mx-auto w-full max-w-4xl px-6 pt-32 pb-24 md:px-10 md:pt-40">
        <p className="eyebrow text-gold-text mt-15">{t.eyebrowNeutral}</p>
        <h1 className="type-h1 mt-6 text-balance">{t.title}</h1>
        <p className="type-lead text-muted-foreground mt-6 max-w-xl text-pretty">{t.lead}</p>
      </div>
    </main>
  )
}

export function TerminRoute({ locale }: { locale: Locale }) {
  return (
    // useSearchParams (Paket-Vorauswahl) braucht eine Suspense-Grenze,
    // damit die Route statisch vorgerendert werden kann.
    <Suspense fallback={<TerminKopf locale={locale} />}>
      <TerminWizard />
    </Suspense>
  )
}
