import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Manrope, M_PLUS_Rounded_1c } from "next/font/google"
import localFont from "next/font/local"
import "@/app/globals.css"

/* Markenschriften (Owner-Entscheidung): Manrope + M PLUS Rounded 1c, Arabisch Readex Pro. */
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" })
const mplusRounded = M_PLUS_Rounded_1c({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], variable: "--font-mplus", display: "swap", preload: false })
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" })
/* Readex Pro lokal (variable 300–700): ein zweiter Google-Abruf derselben Schrift ließ den Vercel-Build scheitern. */
const readex = localFont({
  src: "./fonts/readex-arabic.woff2",
  weight: "300 700",
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
