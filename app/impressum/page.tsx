import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung und Kontakt von creaDIG.",
  alternates: { canonical: "/impressum" },
  robots: { index: false, follow: true },
}

export default function ImpressumPage() {
  return <LegalPage kind="imprint" />
}
