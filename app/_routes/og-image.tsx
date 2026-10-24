import { readFileSync } from "node:fs"
import path from "node:path"
import { ImageResponse } from "next/og"
import { type Locale } from "@/lib/dictionary"

/**
 * Vorschaubild für WhatsApp, LinkedIn, X und jede andere Vorschau.
 *
 * Bewusst mit dem ECHTEN Logo (SVG) und der Markenschrift Manrope. Das
 * Signaturmotiv rechts ist das „Haus mit 5 Ebenen“ — dieselbe Struktur wie
 * das Menü der Seite. Kein Branchen-Fokus, kein „bis zur Rechnung“: die
 * Vorschau spricht jedes Unternehmen an.
 */
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const copy = {
  de: {
    alt: "creaDIG — Ein eigenes System für Ihr Unternehmen",
    headline: "Ein eigenes System",
    headlineAccent: "für Ihr Unternehmen.",
    lead: "Marke, Web, Abläufe und KI aus einer Hand. Wir bauen und betreiben es — Code und Daten gehören Ihnen.",
    disciplines: "SYSTEM-HAUS FÜR DIGITALE BETRIEBE",
    origin: "SEIT 2017 · OSNABRÜCK",
    levels: ["Marke", "Web", "Abläufe", "Systeme", "KI"],
  },
  tr: {
    alt: "creaDIG — İşletmenize ait tek bir sistem",
    headline: "İşletmenize ait",
    headlineAccent: "tek bir sistem.",
    lead: "Marka, web, süreçler ve yapay zekâ tek elden. Biz kurar ve işletiriz — kod ve veriler sizindir.",
    disciplines: "DİJİTAL İŞLETMELER İÇİN SİSTEM EVİ",
    origin: "2017'DEN BERİ · OSNABRÜCK",
    levels: ["Marka", "Web", "Süreçler", "Sistemler", "Yapay zekâ"],
  },
  en: {
    alt: "creaDIG — one system that belongs to your company",
    headline: "One system that",
    headlineAccent: "belongs to your company.",
    lead: "Brand, web, operations and AI from one house. We build and run it — code and data belong to you.",
    disciplines: "SYSTEMS HOUSE FOR DIGITAL OPERATIONS",
    origin: "SINCE 2017 · OSNABRÜCK",
    levels: ["Brand", "Web", "Operations", "Systems", "AI"],
  },
  ar: {
    alt: "creaDIG — نظام واحد يملكه عملكم",
    headline: "نظام واحد",
    headlineAccent: "يملكه عملكم.",
    lead: "العلامة والويب والعمليات والذكاء الاصطناعي من بيت واحد. نبنيه ونشغّله — الشيفرة والبيانات ملك لكم.",
    disciplines: "بيت أنظمة للمنشآت الرقمية",
    origin: "منذ 2017 · أوسنابروك",
    levels: ["العلامة", "الويب", "العمليات", "الأنظمة", "الذكاء"],
  },
} as const

export function ogAlt(locale: Locale) {
  return copy[locale].alt
}

const NAVY = "#0a1322"
const INK = "#eef2f8"
const MUTED = "#93a1b8"
// Aktuelle CI-Akzentfarbe (app/globals.css --primary) — nicht mehr das alte Gold.
const ACCENT = "#2f5bea"
const ACCENT_DEEP = "#1e40af"

// Die aufgehellte Variante — das Bild steht auf dunklem Grund.
const LOGO = readFileSync(
  path.join(process.cwd(), "public", "brand", "creadig-logo-light.svg"),
).toString("base64")

/** Manrope aus Google Fonts (TTF für Satori). Fällt still auf die Standardschrift zurück. */
async function loadManrope(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Manrope:wght@${weight}&display=swap`,
    ).then((r) => r.text())
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1]
    if (!url) return null
    return await fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export async function renderOgImage(locale: Locale) {
  const t = copy[locale]
  const rtl = locale === "ar"
  const [bold, medium] = rtl ? [null, null] : await Promise.all([loadManrope(700), loadManrope(500)])
  const fonts = [
    bold && { name: "Manrope", data: bold, weight: 700 as const, style: "normal" as const },
    medium && { name: "Manrope", data: medium, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 700 | 500; style: "normal" }[]

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: rtl ? "row-reverse" : "row",
          background: NAVY,
          fontFamily: fonts.length ? "Manrope" : undefined,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: `linear-gradient(90deg, ${ACCENT_DEEP} 0%, ${ACCENT} 50%, ${ACCENT_DEEP} 100%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 790,
            padding: "76px 0 64px 76px",
            ...(rtl ? { padding: "76px 76px 64px 0", alignItems: "flex-end", textAlign: "right" } : {}),
          }}
        >
          <img src={`data:image/svg+xml;base64,${LOGO}`} width={300} height={32} alt="creaDIG" />

          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: -2,
                color: INK,
              }}
            >
              <span>{t.headline}</span>
              <span style={{ color: ACCENT }}>{t.headlineAccent}</span>
            </div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 500, lineHeight: 1.5, color: MUTED, maxWidth: 640 }}>
              {t.lead}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 3,
              color: MUTED,
            }}
          >
            <span>{t.disciplines}</span>
            <span style={{ color: ACCENT_DEEP }}>·</span>
            <span style={{ color: ACCENT }}>{t.origin}</span>
          </div>
        </div>

        {/* Signatur: das Haus mit 5 Ebenen. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            gap: 10,
          }}
        >
          {t.levels.map((level, i) => (
            <div
              key={level}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: 260,
                height: 52,
                padding: "0 20px",
                borderRadius: 6,
                border: `1px solid ${i === 0 ? ACCENT : "#22324f"}`,
                background: i === 0 ? "rgba(47,91,234,0.14)" : "#0f1b30",
                color: i === 0 ? ACCENT : INK,
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              <span>{level}</span>
              <span style={{ fontSize: 15, color: i === 0 ? ACCENT : "#5d6c86", letterSpacing: 2 }}>{`0${5 - i}`}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
