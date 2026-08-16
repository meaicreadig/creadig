import type { Metadata, Viewport } from "next"
import { Poppins, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

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

export const metadata: Metadata = {
  title: {
    default: "creaDIG — System-Haus für Marke, Web und KI",
    template: "%s · creaDIG",
  },
  description:
    "creaDIG ist das Dach über eigenen Systemen — von Marke bis KI. Wir bauen sie. Und wir betreiben sie. System-Haus seit 2018, Deutschland & Schweiz.",
  keywords: [
    "creaDIG",
    "System-Haus",
    "meAI",
    "CASSAMEA",
    "FIBERO",
    "Digitalagentur",
    "KI-Systeme",
    "Diepholz",
    "Schweiz",
  ],
  authors: [{ name: "creaDIG" }],
  openGraph: {
    title: "creaDIG — Wir bauen, was andere nicht sehen.",
    description:
      "System-Haus seit 2018. Eigene Produkte, echte Kunden, KI-Systeme, die wir bauen und betreiben.",
    locale: "de_DE",
    type: "website",
    siteName: "creaDIG",
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
    "System-Haus für Marke, Web, Operations, Automation und KI. Eigene Produkte: meAI, CASSAMEA, PLANEX, NÛR.",
  foundingDate: "2018",
  areaServed: ["DE", "CH"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Diepholz",
    addressCountry: "DE",
  },
  founder: { "@type": "Person", name: "Muhammed Emin Akyol" },
  telephone: "+41765045879",
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
