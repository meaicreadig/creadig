"use client"

import { useEffect } from "react"
import { StatusPageBody } from "@/components/pages/status-page-body"
import { dictionary } from "@/lib/dictionary"

/**
 * BF-3 — die deutsche Fehlerseite.
 *
 * Sie fängt alles, was beim Rendern einer Seite im deutschen Baum wirft. Das
 * Layout bleibt stehen (Navigation, Fußzeile), nur der Inhalt wird ersetzt —
 * der Besucher ist also nicht raus aus der Seite, sondern hat weiterhin jeden
 * Weg vor sich.
 *
 * `reset()` rendert das Segment neu. Bei einem vorübergehenden Fehler ist die
 * Seite danach da; bei einem dauerhaften bleibt diese Ansicht stehen und die
 * beiden direkten Kontaktwege darunter greifen.
 */
const copy = dictionary.de.errorPages.serverError

export default function DeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Ohne diese Zeile steht der Fehler nirgends — der Besucher sieht eine
    // Seite, wir sehen gar nichts. `digest` ist der Schluessel, mit dem sich
    // der Eintrag im Server-Log wiederfinden laesst.
    console.error("[error] deutscher Baum:", error.digest ?? error.message)
  }, [error])

  return (
    <StatusPageBody
      locale="de"
      eyebrow={copy.eyebrow}
      title={copy.title}
      lead={copy.lead}
      action={{ label: copy.retry, onClick: reset }}
    />
  )
}
