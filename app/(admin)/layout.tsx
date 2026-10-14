import type { Metadata, Viewport } from "next"

import { adminSprache } from "@/lib/admin-i18n/server"
import { JetBrains_Mono, Manrope, M_PLUS_Rounded_1c } from "next/font/google"
import "@/app/globals.css"

/**
 * MP-G · G.1 — Wurzel-Layout des Control Centers.
 *
 * ---------------------------------------------------------------------------
 * WARUM EINE EIGENE GRUPPE UND EIN EIGENES WURZEL-LAYOUT
 * Dieses Projekt hat kein `app/layout.tsx`: `(de)` und `(tr)` sind zwei
 * gleichrangige Wurzeln, damit jede ihr eigenes `<html lang>` setzen kann.
 * Eine dritte Wurzel braucht darum ebenfalls eine eigene Gruppe.
 *
 * Das ist kein Formalismus, sondern die richtige Trennung: Das Control Center
 * ist keine Sprachfassung der Website. Es hat keine Navigation der Marke,
 * keinen Footer, keinen WhatsApp-Knopf, kein Consent-Banner und keine
 * Analytics — es misst nichts, es wird benutzt.
 *
 * ---------------------------------------------------------------------------
 * WAS BEWUSST FEHLT
 *   Analytics       Eine interne Oberfläche zu vermessen, misst den Owner.
 *   Consent-Banner  Es gibt nichts einzuwilligen; hier läuft kein Dienst.
 *   Theme-Umschalter Später. Heute genügt die Systemeinstellung.
 *   TR              Einsprachig deutsch (MP-G §50, Owner-Freigabe steht aus).
 */

/* Dieselben Markenschriften wie die Webseite (Owner-Entscheidung, nicht ändern ohne Freigabe). */
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
})

const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-mplus",
  display: "swap",
  preload: false,
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "Control Center", template: "%s · Control Center" },
  /* Eine Innenansicht gehört in keinen Index — und in kein Archiv. */
  robots: { index: false, follow: false, nocache: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f7fa",
  colorScheme: "light",
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  /* ADM-01 — `lang` folgt der gewählten Admin-Sprache (Screenreader, Silbentrennung, Suche). */
  const sprache = await adminSprache()
  return (
    <html
      lang={sprache}
      className={`admin-marke bg-background ${manrope.variable} ${mplusRounded.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
