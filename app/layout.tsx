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
import {
  address,
  aggregateRating,
  approvedReviews,
  packages,
  socialProfiles,
} from "@/lib/site-data"
import { dictionary } from "@/lib/dictionary"

// CEO-Entscheidung: Poppins — rund-geometrisch, passt zum Logo. Nicht Geist.
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

// Monospace nur für Eyebrows und Kennziffern.
// `latin-ext` ist Pflicht, nicht Komfort: Ohne diesen Subset fehlen ş, ğ, ı,
// İ und ç — und genau die stehen in den türkischen Labels. Der Browser fiele
// dort auf eine System-Monospace zurück, mitten im Wort.
const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
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
  /*
   * Bild und Alt-Text liefert app/opengraph-image.tsx — Next haengt sie
   * automatisch an OpenGraph UND an die Twitter-Card. Hier steht nur, welche
   * Karte X/Twitter rendern soll: `summary_large_image` statt der kleinen
   * quadratischen Vorschau.
   */
  twitter: {
    card: "summary_large_image",
    title: "creaDIG — Wir bauen, was andere nicht sehen.",
    description:
      "System-Haus seit 2017. Eigene Produkte, echte Kunden, KI-Systeme, die wir bauen und betreiben.",
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

/**
 * Blockierendes Inline-Skript, das VOR dem ersten Paint laeuft.
 *
 * Zwei Fehler, eine Ursache — beides wurde bisher erst nach der Hydration
 * gesetzt, also nachdem der Browser schon gemalt hatte:
 *
 * E-F1  Dunkelmodus-Rueckkehrer sahen die Seite hell aufblitzen, bevor
 *       React `.dark` setzte.
 * E-F2  `<html lang>` stand fest auf "de". Bei tuerkischer Oberflaeche machte
 *       `text-transform: uppercase` daraus das deutsche i -> I statt des
 *       tuerkischen i -> İ. „İletişim" wurde zu „ILETISIM" — ein anderes Wort.
 *
 * Einwilligungs-konform: Gelesen wird nur, wenn `creadig_consent` die
 * Komfort-Kategorie erlaubt (siehe lib/consent.ts). Ohne Einwilligung bleibt
 * es bei Hell + Deutsch, genau wie im ThemeProvider und LocaleProvider.
 * Die Sprache aus `?lang=` gilt dagegen immer — sie steht in der URL, die der
 * Besucher selbst aufgerufen hat, und wird nirgends gespeichert.
 */
const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement;
var q=new URLSearchParams(location.search).get('lang');
var lang=(q==='tr'||q==='de')?q:null;
var c=JSON.parse(localStorage.getItem('creadig_consent')||'null');
if(c&&c.functional){
  if(localStorage.getItem('creadig-theme')==='dark'){d.classList.add('dark');d.style.colorScheme='dark';}
  if(!lang){var s=localStorage.getItem('creadig_lang');if(s==='tr'||s==='de')lang=s;}
}
if(lang)d.lang=lang;
}catch(e){}})();`

/**
 * Organisations-Daten für Suchmaschinen.
 *
 * Bewertungen und Social-Profile hängen sich NUR an, wenn es sie wirklich
 * gibt (E-K2 / E-K7). Ein `aggregateRating` ohne echte Bewertungen wäre
 * nicht bloß unehrlich — Google wertet erfundene Sterne-Auszeichnungen als
 * Richtlinienverstoß und straft die Domain dafür ab.
 */
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
  ...(socialProfiles.length > 0 ? { sameAs: socialProfiles.map((p) => p.url) } : {}),
  /*
   * Die drei Pakete als Angebotskatalog (E-K3). Preise und Namen kommen aus
   * derselben Quelle wie die Anzeige — sie koennen nicht auseinanderlaufen.
   * `MON` ist die UN/CEFACT-Einheit fuer Monat.
   */
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "creaDIG Pakete",
    itemListElement: packages.map((pkg) => ({
      "@type": "Offer",
      name: dictionary.de.packages.items[pkg.key].name,
      description: dictionary.de.packages.items[pkg.key].who,
      priceCurrency: "EUR",
      price: pkg.amount,
      ...(pkg.period
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: pkg.amount,
              priceCurrency: "EUR",
              billingDuration: 1,
              unitCode: pkg.period,
            },
          }
        : {}),
      availability: "https://schema.org/InStock",
    })),
  },
  ...(aggregateRating
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.value,
          reviewCount: aggregateRating.count,
          bestRating: 5,
        },
      }
    : {}),
  ...(approvedReviews.length > 0
    ? {
        review: approvedReviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.name },
          datePublished: r.date,
          reviewBody: r.text,
          inLanguage: r.lang,
          ...(r.rating !== null
            ? {
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                },
              }
            : {}),
        })),
      }
    : {}),
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
        {/* Muss als Erstes stehen: laeuft synchron, bevor der Body gemalt wird. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
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
