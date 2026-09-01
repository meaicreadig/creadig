import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { leadStoreConfigured } from "@/lib/lead-store"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"

/**
 * Impressum und Datenschutz (GROW-1).
 *
 * Beide bleiben `noindex, follow`: Sie müssen erreichbar sein und ihre Links
 * weitergeben, gehören aber nicht in den Suchindex. Deshalb tragen sie zwar
 * hreflang — verlinkt ist verlinkt —, kämpfen aber um keine Platzierung.
 *
 * Die Rechtsseiten sind der einzige Ort, an dem die türkische Fassung KEINE
 * eigene Rechtswirkung entfaltet: Verbindlich ist die deutsche. Das steht so
 * im Fußtext der Seiten (`legal.privacyNote`) und ist keine Formalie —
 * Impressumspflicht und DSGVO-Auskunft richten sich nach deutschem Recht.
 */
export function legalMetadata(kind: "imprint" | "privacy", locale: Locale): Metadata {
  const t = dictionary[locale].legal
  const path = kind === "imprint" ? "/impressum" : "/datenschutz"
  return pageMetadata({
    locale,
    path,
    title: kind === "imprint" ? t.imprintTitle : t.privacyTitle,
    description:
      kind === "imprint" ? t.imprintMetaDescription : t.privacyMetaDescription,
    noIndex: true,
  })
}

export function LegalRoute({ kind }: { kind: "imprint" | "privacy" }) {
  /*
   * GATE 4 — hier wird die Datenschutz-Aussage an die Wirklichkeit gebunden.
   * Serverseitig gemessen, als Prop hinuebergereicht; der Text kann damit
   * nicht mehr von dem abweichen, was die Anwendung tatsaechlich tut.
   */
  return <LegalPage kind={kind} storesLeads={leadStoreConfigured()} />
}
