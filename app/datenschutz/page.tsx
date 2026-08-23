import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Kein Tracking über Websites hinweg, keine Werbe-Cookies, keine Profilbildung. Was creaDIG verarbeitet, wer es im Auftrag tut und wie lange es bleibt.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: true },
}

export default function DatenschutzPage() {
  return <LegalPage kind="privacy" />
}
