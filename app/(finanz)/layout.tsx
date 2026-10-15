import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Manrope, M_PLUS_Rounded_1c } from "next/font/google"
import "@/app/globals.css"

/* Markenschriften der Webseite (Owner-Entscheidung, nicht ändern ohne Freigabe). */
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" })
const mplusRounded = M_PLUS_Rounded_1c({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], variable: "--font-mplus", display: "swap", preload: false })
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" })

export const metadata: Metadata = {
  title: { default: "creaDIG Finanz", template: "%s · creaDIG Finanz" },
  description: "Die Finanzabteilung von creaDIG Solutions.",
  robots: { index: false, follow: false, nocache: true },
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f7fa" }

export default function FinanzRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`bg-background text-[15px] ${manrope.variable} ${mplusRounded.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">{children}</body>
    </html>
  )
}
