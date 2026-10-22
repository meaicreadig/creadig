import type { Metadata, Viewport } from "next"
import { manrope, mplusRounded, jetbrains, readex } from "@/app/schriften"
import "@/app/globals.css"

/* Markenschriften (Owner-Entscheidung): Manrope + M PLUS Rounded 1c, Arabisch Readex Pro — lokal, siehe app/schriften. */

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
