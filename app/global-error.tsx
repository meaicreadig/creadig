"use client"

import { useEffect, useState } from "react"
import "@/app/globals.css"
import { StatusPageBody } from "@/components/pages/status-page-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { TR_PREFIX } from "@/lib/routes"

/**
 * BF-3 — die letzte Instanz.
 *
 * ---------------------------------------------------------------------------
 * WANN SIE ÜBERHAUPT ERSCHEINT
 * Nur, wenn das Wurzel-Layout selbst wirft. Dann gibt es kein `SiteShell`,
 * keine Navigation, keine Fußzeile und keinen `LocaleProvider` — Next ersetzt
 * den ganzen Baum. Deshalb rendert diese Datei `<html>` und `<body>` selbst
 * und zieht das Stylesheet direkt herein; ohne das wäre der letzte Bildschirm
 * der Seite unformatierter schwarzer Text auf Weiß.
 *
 * ---------------------------------------------------------------------------
 * DIE SPRACHE
 * Sie kommt hier nicht aus der Route, weil es keine Layout-Kette mehr gibt,
 * die sie hereinreichen könnte. Wir lesen sie nach dem Mounten aus der Adresse
 * und starten mit Deutsch. Der Sprung von Deutsch nach Türkisch ist auf diesem
 * einen Bildschirm hinnehmbar — die Alternative wäre, jedem Türkischsprachigen
 * dauerhaft Deutsch zu zeigen.
 *
 * Die Schriften fehlen bewusst: `next/font` hängt am Wurzel-Layout, und genau
 * das ist hier ausgefallen. Die Seite fällt auf die Systemschrift zurück und
 * bleibt lesbar.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [locale, setLocale] = useState<Locale>("de")

  useEffect(() => {
    const path = window.location.pathname
    if (path === TR_PREFIX || path.startsWith(`${TR_PREFIX}/`)) setLocale("tr")
  }, [])

  useEffect(() => {
    console.error("[global-error] Wurzel-Layout ausgefallen:", error.digest ?? error.message)
  }, [error])

  const copy = dictionary[locale].errorPages.serverError

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StatusPageBody
          locale={locale}
          eyebrow={copy.eyebrow}
          title={copy.title}
          lead={copy.lead}
          action={{ label: copy.retry, onClick: reset }}
        />
      </body>
    </html>
  )
}
