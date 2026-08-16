import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Kein Tracking, keine Werbe-Cookies, keine Analyse-Dienste. Was creaDIG verarbeitet und was nicht.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: true },
}

export default function DatenschutzPage() {
  return <LegalPage kind="privacy" />
}
