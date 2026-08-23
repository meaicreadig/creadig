import { renderOgImage } from "@/app/_routes/og-image"

/** T-1 — das tuerkische Gegenstueck zu `app/og/de.png`. */
export const dynamic = "force-static"

export function GET() {
  return renderOgImage("tr")
}
