import type { Localized } from "@/lib/site-data"

/*
 * ==========================================================================
 * HERKUNFT JEDES BILDES (W4 · §11)
 * ==========================================================================
 *
 * Die Wahrheitsgrenze: Koennte ein Besucher glauben, das Bild zeige etwas
 * Reales von creaDIG — einen Kunden, einen Mitarbeiter, einen Raum, einen
 * Einsatz? Wenn ja und es ist generiert, ist das Bild verboten.
 *
 * Gemessen am 25.09.2026 liegt unter `public/works/` kein einziges Foto: Alle
 * sieben Aufnahmen sind generierte Szenen — Menschen, Raeume, Geraete, eine
 * Jacke mit fibero-Aufdruck —, in die zum Teil eine echte Oberflaeche
 * montiert wurde. Sie wirken dokumentarisch, und genau das ist der Fehler.
 * Sie bleiben im Bestand (Herkunft steht hier), aber keine Karte, kein Fall
 * und kein Produktbeleg verweist mehr auf sie. `check-herkunft.mjs` haelt
 * das fest.
 *
 * Ersatzziel steht je Eintrag: Was es braucht, damit an dieser Stelle wieder
 * ein Bild stehen darf.
 *
 * Die generierten Ordner (`public/works/products/`, `public/images/unternehmen/`)
 * haben ihre eigene Buchfuehrung (`*-media.generated.ts`) und stehen hier nicht.
 */
export type MediaOrigin = "real-ui" | "real-photo" | "illustration"

export type MediaProvenance = {
  src: string
  origin: MediaOrigin
  /** Wie das Bild entstanden ist — ein Satz, nachpruefbar. */
  herkunft: string
  alt: Localized | null
  replaceWith: "founder-portrait" | "field-photo" | "customer-site" | "product-screen" | null
}

const SZENE = "Generierte Szene mit montierter Oberfläche; Menschen, Raum und Gerät sind nicht real."

export const mediaProvenance: MediaProvenance[] = [
  { src: "/works/fibero.jpg", origin: "illustration", herkunft: `${SZENE} Techniker in fibero-Jacke.`, alt: null, replaceWith: "product-screen" },
  { src: "/works/meai.jpg", origin: "illustration", herkunft: SZENE, alt: null, replaceWith: "product-screen" },
  { src: "/works/cassamea.jpg", origin: "illustration", herkunft: SZENE, alt: null, replaceWith: "product-screen" },
  { src: "/works/meahv.jpg", origin: "illustration", herkunft: SZENE, alt: null, replaceWith: "product-screen" },
  { src: "/works/nv-swiss.jpg", origin: "illustration", herkunft: `${SZENE} Die Person ist nicht der Kunde.`, alt: null, replaceWith: "customer-site" },
  { src: "/works/maqam.jpg", origin: "illustration", herkunft: SZENE, alt: null, replaceWith: "customer-site" },
  { src: "/works/bir-damla-hayir.jpg", origin: "illustration", herkunft: SZENE, alt: null, replaceWith: "customer-site" },
  { src: "/works/rumis-maison.png", origin: "illustration", herkunft: "Nicht bestätigtes Projekt; erscheint nirgends.", alt: null, replaceWith: null },
  {
    src: "/images/ico-osnabrueck.jpg",
    origin: "real-photo",
    herkunft: "Fassade des ICO InnovationsCentrum Osnabrück (Sitz). Echtes Foto; Nutzungsrecht beim Owner zu bestätigen.",
    alt: {
      de: "Fassade des ICO InnovationsCentrum Osnabrück",
      tr: "ICO InnovationsCentrum Osnabrück binasının cephesi",
      en: "Façade of the ICO InnovationsCentrum Osnabrück",
      ar: "واجهة مبنى ICO InnovationsCentrum Osnabrück",
    },
    replaceWith: null,
  },
]

export function herkunftVon(src: string): MediaProvenance | undefined {
  return mediaProvenance.find((m) => m.src === src)
}

/** Ein Bild darf als Beleg (Produkt, Fall, Kundenarbeit) nur stehen, wenn es echt ist. */
export function taugtAlsBeleg(src: string | null | undefined): boolean {
  if (!src) return true
  const h = herkunftVon(src)
  return h !== undefined && h.origin !== "illustration"
}
