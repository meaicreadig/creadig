import { Suspense } from "react"
import type { Metadata } from "next"
import { TerminWizard } from "@/components/termin/termin-wizard"

export const metadata: Metadata = {
  title: "Termin anfragen",
  description:
    "In vier Schritten zum Gespräch: Terminart wählen, Wunschtermin setzen, Angaben ergänzen — die Anfrage geht als fertige Nachricht an unser WhatsApp.",
  alternates: { canonical: "/termin" },
}

export default function TerminPage() {
  return (
    // useSearchParams (Paket-Vorauswahl) braucht eine Suspense-Grenze,
    // damit die Route statisch vorgerendert werden kann.
    <Suspense fallback={<div className="min-h-dvh" />}>
      <TerminWizard />
    </Suspense>
  )
}
