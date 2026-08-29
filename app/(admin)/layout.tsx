import type { Metadata, Viewport } from "next"
import { Poppins, JetBrains_Mono, M_PLUS_Rounded_1c } from "next/font/google"
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mplus",
  display: "swap",
  preload: false,
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
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
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${poppins.variable} ${mplusRounded.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
