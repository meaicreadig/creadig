import { contentType, ogAlt, renderOgImage, size } from "@/app/_routes/og-image"

/** Vorschaubild des deutschen Baums — `/opengraph-image`. */
export const alt = ogAlt("de")
export { size, contentType }

export default function OpengraphImage() {
  return renderOgImage("de")
}
