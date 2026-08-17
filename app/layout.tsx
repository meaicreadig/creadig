import type { Metadata, Viewport } from "next"
import { Poppins, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LocaleProvider } from "@/components/locale-provider"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { StickyWhatsApp } from "@/components/sticky-whatsapp"
import { AiAssistant } from "@/components/ai-assistant"
import { CookieConsent } from "@/components/consent/cookie-consent"
import { address } from "@/lib/site-data"

// CEO-Entscheidung: Poppins — rund-geometrisch, passt zum Logo. Nicht Geist.
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

// Monospace nur für Eyebrows und Kennziffern.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
})

/**
 * Domain-ready: Die Seite läuft heute auf creadig.vercel.app, soll aber ohne
 * Rebuild auf creadig.de umziehen können. Nur diese eine Variable steuert
 * Canonicals und OG-URLs — die DNS-Umstellung macht der Owner im Registrar.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "creaDIG — System-Haus für Marke, Web und KI",
    template: "%s · creaDIG",
  },
  description:
    "creaDIG ist das Dach über eigenen Systemen — von Marke bis KI. Wir bauen sie. Und wir betreiben sie. System-Haus, Deutschland & Schweiz.",
  keywords: [
    "creaDIG",
    "System-Haus",
    "meAI",
    "fibero",
    "CASSAMEA",
    "meahv",
    "Digitalagentur",
    "KI-Systeme",
    "Osnabrück",
    "go-digital",
    "Schweiz",
  ],
  authors: [{ name: "creaDIG" }],
  openGraph: {
    title: "creaDIG — Wir bauen, was andere nicht sehen.",
    description:
      "System-Haus seit 2017. Eigene Produkte, echte Kunden, KI-Systeme, die wir bauen und betreiben.",
    locale: "de_DE",
    type: "website",
    siteName: "creaDIG",
    url: "/",
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#201e1b" },
  ],
  width: "device-width",
  initialScale: 1,
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "creaDIG",
  description:
    "System-Haus für Marke, Web, Operations, Automation und KI. Eigene Produkte: meAI, fibero, CASSAMEA, meahv.",
  foundingDate: "2017",
  areaServed: ["DE", "CH"],
  // Sitz: ICO InnovationsCentrum Osnabrück. Die Schweiz ist Markt, nicht Sitz.
  address: {
    "@type": "PostalAddress",
    streetAddress: `${address.venue}, ${address.street}`,
    postalCode: address.postalCode,
    addressLocality: address.city,
    addressCountry: address.countryCode,
  },
  founder: { "@type": "Person", name: address.owner },
  telephone: "+41765045879",
  url: SITE_URL,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="de"
      className={`${poppins.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <ThemeProvider>
          <LocaleProvider>
            <SiteNav />
            {children}
            <SiteFooter />
            <StickyWhatsApp />
            <AiAssistant />
            <CookieConsent />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
