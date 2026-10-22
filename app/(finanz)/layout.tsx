import type { Metadata, Viewport } from "next"
import { manrope, mplusRounded, jetbrains } from "@/app/schriften"
import "@/app/globals.css"

/* Markenschriften der Webseite (Owner-Entscheidung, nicht ändern ohne Freigabe). */

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
