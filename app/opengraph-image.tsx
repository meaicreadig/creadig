import { readFileSync } from "node:fs"
import path from "node:path"
import { ImageResponse } from "next/og"

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
 */
export const alt = "creaDIG — System-Haus für Marke, Web und KI"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Die aufgehellte Variante — das Bild steht auf dunklem Grund.
const LOGO = readFileSync(
  path.join(process.cwd(), "public", "brand", "creadig-logo-light.svg"),
).toString("base64")

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#201e1b",
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
            background: "linear-gradient(90deg, #8f6a33 0%, #e4c378 50%, #8f6a33 100%)",
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
              color: "#fbfbf9",
              maxWidth: 860,
              letterSpacing: -1.5,
            }}
          >
            Wir bauen, was andere nicht sehen.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.5,
              color: "#a7a099",
              maxWidth: 760,
            }}
          >
            Das Dach über unseren Systemen — von Marke bis KI. Wir bauen sie. Und wir
            betreiben sie.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", height: 1, background: "#3e3932" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#a7a099",
              letterSpacing: 2,
            }}
          >
            <div style={{ display: "flex" }}>
              SYSTEM-HAUS · MARKE · WEB · KI
            </div>
            <div style={{ display: "flex", color: "#d3a763" }}>
              SEIT 2017 · OSNABRÜCK · DE &amp; CH
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
