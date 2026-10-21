import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Manrope, M_PLUS_Rounded_1c, Readex_Pro } from "next/font/google"
import "@/app/globals.css"

/* Markenschriften (Owner-Entscheidung): Manrope + M PLUS Rounded 1c, Arabisch Readex Pro. */
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" })
const mplusRounded = M_PLUS_Rounded_1c({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], variable: "--font-mplus", display: "swap", preload: false })
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" })
/* Exakt dieselben Optionen wie in components/site-shell.tsx, damit next/font dieselbe bereits geladene Schrift wiederverwendet. */
const readex = Readex_Pro({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "creaDIG Solutions · Investor Room",
  description: "Confidential investor room of creaDIG Solutions.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f7fa" }

export default function InvestorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`bg-background text-[15px] ${manrope.variable} ${mplusRounded.variable} ${jetbrains.variable} ${readex.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">{children}</body>
    </html>
  )
}
