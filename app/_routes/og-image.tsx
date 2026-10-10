import { readFileSync } from "node:fs"
import path from "node:path"
import { ImageResponse } from "next/og"
import { type Locale } from "@/lib/dictionary"

/**
 * Vorschaubild für WhatsApp, LinkedIn, X und jede andere Vorschau.
 *
 * Bis hierher gab es keins: Wer den Link teilte, verschickte einen grauen
 * Kasten mit einer URL — für ein Haus, das Marke verkauft, der schlechteste
 * erste Eindruck.
 *
 * Bewusst mit dem ECHTEN Logo statt nachgesetzter Schrift: `ImageResponse`
 * bringt nur eine generische Fallback-Schrift mit; „creaDIG" in Noto Sans
 * wäre eine andere Marke. Die Wortmarke kommt darum als SVG herein, alles
 * andere ist Fläche und Linie — beides braucht keine Schrift.
 *
 * ---------------------------------------------------------------------------
 * ZWEISPRACHIG SEIT GROW-1
 * Wer einen türkischen Link teilt, teilte bis hierher eine deutsche Vorschau.
 * Es gibt jetzt zwei Bilder — `/opengraph-image` und `/tr/opengraph-image` —
 * aus dieser einen Vorlage. Sie liegen in den beiden Routen-Gruppen, weil
 * zwei Dateien desselben Namens sonst um dieselbe Adresse stritten.
 */
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const copy = {
  de: {
    alt: "creaDIG — Digitale Systeme für Handwerks- und Servicebetriebe",
    headline: "Von der Anfrage bis zur Rechnung: ein System.",
    lead:
      "Für Handwerks- und Servicebetriebe. Wir bauen und betreiben es. Code und Daten gehören Ihnen.",
    disciplines: "SYSTEM-HAUS FÜR DIGITALE BETRIEBE",
    origin: "SEIT 2017 · OSNABRÜCK",
  },
  tr: {
    alt: "creaDIG — Zanaat ve servis işletmeleri için dijital sistemler",
    headline: "Talepten faturaya kadar: tek sistem.",
    lead:
      "Zanaat ve servis işletmeleri için. Biz kurar ve işletiriz. Kod ve veriler sizindir.",
    disciplines: "DIJITAL IŞLETMELER IÇIN SISTEM EVI",
    origin: "2017'DEN BERI · OSNABRÜCK",
  },
  en: {
    alt: "creaDIG — digital systems for trade and service businesses",
    headline: "From enquiry to invoice: one system.",
    lead:
      "For trade and service businesses. We build and run it. Code and data belong to you.",
    disciplines: "SYSTEMS HOUSE FOR DIGITAL OPERATIONS",
    origin: "SINCE 2017 · OSNABRÜCK",
  },
  ar: {
    alt: "creaDIG — أنظمة رقمية لمنشآت الحِرف والخدمات",
    headline: "من الطلب حتى الفاتورة: نظام واحد.",
    lead:
      "لمنشآت الحِرف والخدمات. نبنيه ونشغّله. الشيفرة والبيانات ملك لكم.",
    disciplines: "بيت أنظمة للمنشآت الرقمية",
    origin: "منذ 2017 · أوسنابروك",
  },
} as const

export function ogAlt(locale: Locale) {
  return copy[locale].alt
}

// Die aufgehellte Variante — das Bild steht auf dunklem Grund.
const LOGO = readFileSync(
  path.join(process.cwd(), "public", "brand", "creadig-logo-light.svg"),
).toString("base64")

export function renderOgImage(locale: Locale) {
  const t = copy[locale]
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a1322",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Gold-Hairline oben — dieselbe Geste wie über jeder Sektions-Headline. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #3d6bf5 0%, #a9c4ff 50%, #3d6bf5 100%)",
          }}
        />

        {/* Andeutung des Signatur-Motivs: drei Dreiecke, ruhig, am rechten Rand. */}
        <div
          style={{
            position: "absolute",
            right: -80,
            top: 90,
            width: 520,
            height: 520,
            display: "flex",
            background:
              "linear-gradient(135deg, rgba(211,167,99,0.16) 0%, rgba(211,167,99,0) 62%)",
            transform: "rotate(45deg)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <img
            src={`data:image/svg+xml;base64,${LOGO}`}
            width={560}
            height={60}
            alt="creaDIG"
          />
          <div
            style={{
              display: "flex",
              fontSize: 52,
              lineHeight: 1.15,
              color: "#eef2f8",
              maxWidth: 860,
              letterSpacing: -1.5,
            }}
          >
            {t.headline}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.5,
              color: "#93a1b8",
              maxWidth: 760,
            }}
          >
            {t.lead}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", height: 1, background: "#1b2a43" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#93a1b8",
              letterSpacing: 2,
            }}
          >
            <div style={{ display: "flex" }}>{t.disciplines}</div>
            <div style={{ display: "flex", color: "#8fb0ff" }}>{t.origin}</div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
