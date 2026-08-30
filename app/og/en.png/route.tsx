import { renderOgImage } from "@/app/_routes/og-image"

/** Gate 3 — das englische Gegenstueck zu `app/og/de.png`. */
export const dynamic = "force-static"

export function GET() {
  return renderOgImage("en")
}
