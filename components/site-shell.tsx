import type { Metadata, Viewport } from "next"
import { Poppins, JetBrains_Mono } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LocaleProvider } from "@/components/locale-provider"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { StickyWhatsApp } from "@/components/sticky-whatsapp"
import { CookieConsent } from "@/components/consent/cookie-consent"
import { GatedAnalytics } from "@/components/consent/gated-analytics"
import {
  address,
  aggregateRating,
  approvedReviews,
  packages,
  retainer,
  retainerPublished,
  socialProfiles,
} from "@/lib/site-data"
import { dictionary, type Locale } from "@/lib/dictionary"
import { jsonLdScript } from "@/lib/json-ld"
import { SITE_URL, localeAlternates, localeUrl, openGraphLocale } from "@/lib/routes"
import { ogImage } from "@/lib/page-metadata"

/**
 * GROW-1 — das gemeinsame Gerüst beider Sprachbäume.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES ZWEI WURZEL-LAYOUTS GIBT
 * `<html lang>` lässt sich nur an einer Stelle setzen: im Wurzel-Layout. Solange
 * es nur eines gab, stand dort fest `lang="de"` — auch auf einer türkischen
 * Seite. Das ist nicht nur ein SEO-Signal, das falsch steht, sondern ein
 * sichtbarer Fehler: `text-transform: uppercase` macht aus dem türkischen i
 * nach deutscher Regel ein I statt İ, und „İletişim" wird zu „ILETISIM" — ein
 * anderes Wort.
 *
 * Next erlaubt mehrere Wurzel-Layouts, wenn jedes in einer eigenen
 * Routen-Gruppe liegt und `app/layout.tsx` entfällt. Genau das tun `(de)` und
 * `(tr)`. Beide rendern dieses Gerüst und reichen nur ihre Sprache herein;
 * alles andere — Schriften, Boot-Skript, Organisations-Daten, Navigation,
 * Footer — steht hier ein einziges Mal.
 *
 * Der Preis: Ein Wechsel zwischen den Bäumen lädt die Seite ganz neu statt per
 * Client-Navigation. Das betrifft genau eine Bewegung, den Sprachschalter, und
 * dort ist ein voller Ladevorgang ohnehin ehrlicher — es ist eine andere
 * Adresse.
 */

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
 * Die Kopfdaten der jeweiligen Sprachwurzel.
 *
 * `alternates` verbindet beide Startseiten über hreflang — ohne das hielte
 * Google `/` und `/tr` für zwei Fassungen desselben Inhalts und würde eine
 * davon aussortieren.
 */
export function shellMetadata(locale: Locale): Metadata {
  const t = dictionary[locale]
  return {
    metadataBase: new URL(SITE_URL),
    alternates: localeAlternates("/", locale),
    title: {
      default: t.meta.siteTitle,
      template: "%s · creaDIG",
    },
    description: t.meta.siteDescription,
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
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      locale: openGraphLocale[locale],
      // Die jeweils andere Sprache — OpenGraph kennt dafür `alternateLocale`.
      alternateLocale: openGraphLocale[locale === "de" ? "tr" : "de"],
      type: "website",
      siteName: "creaDIG",
      url: localeUrl("/", locale),
      /*
       * T-1 — das Bild kommt jetzt aus derselben Quelle wie auf jeder
       * Unterseite (`lib/page-metadata.ts`) und nicht mehr aus der
       * Dateikonvention. Die lieferte eine Adresse mit zwei Streuwerten, an
       * die ein gemeinsamer Kopfdaten-Helfer nicht herankommt — und sobald
       * eine Unterseite ein eigenes `openGraph` setzte, fiel das Bild ganz
       * weg. Eine Mechanik statt zwei.
       */
      images: ogImage(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      images: ogImage(locale),
    },
    robots: { index: true, follow: true },
  }
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
 * Es geht nur noch um das Erscheinungsbild: Dunkelmodus-Rueckkehrer sahen die
 * Seite sonst hell aufblitzen, bevor React `.dark` setzt.
 *
 * Die Sprache steht nicht mehr hier drin. Sie kommt seit GROW-1 aus der Route
 * und ist damit schon im Server-HTML richtig — ein Skript, das `<html lang>`
 * nachtraeglich korrigiert, waere jetzt ein Skript, das etwas Richtiges
 * ueberschreibt.
 *
 * Einwilligungs-konform: Gelesen wird nur, wenn `creadig_consent` die
 * Komfort-Kategorie erlaubt (siehe lib/consent.ts). Ohne Einwilligung bleibt
 * es hell, genau wie im ThemeProvider.
 */
const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement;
var c=JSON.parse(localStorage.getItem('creadig_consent')||'null');
if(c&&c.functional&&localStorage.getItem('creadig-theme')==='dark'){
  d.classList.add('dark');d.style.colorScheme='dark';
}
}catch(e){}})();`

/**
 * Organisations-Daten für Suchmaschinen.
 *
 * Bewertungen und Social-Profile hängen sich NUR an, wenn es sie wirklich
 * gibt (E-K2 / E-K7). Ein `aggregateRating` ohne echte Bewertungen wäre
 * nicht bloß unehrlich — Google wertet erfundene Sterne-Auszeichnungen als
 * Richtlinienverstoß und straft die Domain dafür ab.
 *
 * Sprachabhängig, seit es zwei Sprachbäume gibt: Namen und Beschreibungen der
 * Angebote kommen aus dem Wörterbuch der jeweiligen Sprache, `url` zeigt auf
 * die eigene Fassung. Sonst stünde unter `/tr` ein deutscher Angebotskatalog.
 */
function organizationSchema(locale: Locale) {
  const t = dictionary[locale]
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "creaDIG",
    description: t.meta.organizationDescription,
    foundingDate: "2017",
    areaServed: ["DE", "CH"],
    inLanguage: locale,
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
    url: localeUrl("/", locale),
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
        name: t.packages.items[pkg.key].name,
        description: t.packages.items[pkg.key].who,
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
    ...(retainerPublished && retainer.amount
      ? {
          makesOffer: {
            "@type": "Offer",
            name: t.packages.retainerEyebrow,
            description: retainer.description?.[locale],
            priceCurrency: "EUR",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: retainer.amount,
              priceCurrency: "EUR",
              billingDuration: 1,
              unitCode: "MON",
            },
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
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
}

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {/* Muss als Erstes stehen: laeuft synchron, bevor der Body gemalt wird. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationSchema(locale)) }}
        />
        <ThemeProvider>
          <LocaleProvider locale={locale}>
            {/*
              BF-A3 / F5 — die Sprungmarke. Sie muss die ERSTE Station der
              Tastatur sein, steht also vor der Navigation, und sie muss
              sichtbar werden, sobald sie den Fokus hat: eine Sprungmarke, die
              man nicht sieht, ist fuer Sehende mit Tastatur wertlos.

              `sr-only` blendet sie aus, `focus:not-sr-only` holt sie zurueck.
              Ziel ist `#inhalt`, das jede Seite ueber ihr <main> traegt.
            */}
            <a
              href="#inhalt"
              className="sr-only focus:not-sr-only focus:bg-background focus:text-foreground focus:border-gold focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:border focus:px-5 focus:py-3 focus:text-sm focus:tracking-wide"
            >
              {dictionary[locale].nav.skipToContent}
            </a>
            <SiteNav />
            {/*
              `tabIndex={-1}` ist hier kein Zierrat: Ohne ihn springt der
              Browser bei manchen Zielen nur die Bildlaufposition an und
              laesst den Fokus stehen — der naechste Tastendruck faengt dann
              wieder in der Navigation an, und die Sprungmarke haette nichts
              bewirkt.
            */}
            <div id="inhalt" tabIndex={-1}>
              {children}
            </div>
            <SiteFooter />
            <StickyWhatsApp />
            <CookieConsent />
            {/* Laedt erst nach Einwilligung in die Kategorie `statistics`. */}
            <GatedAnalytics />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
