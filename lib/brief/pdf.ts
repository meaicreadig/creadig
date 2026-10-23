import "server-only"

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib"

import { address, contact } from "@/lib/site-data"

/**
 * Geschäftsbrief nach DIN 5008, Form B — passt in jeden DL-Fensterumschlag
 * (LetterXpress liest die Anschrift aus dem Fenster).
 *
 * Maße in Millimetern ab der linken oberen Ecke: Anschriftfeld 20 mm von
 * links, Rücksendezeile bei 47 mm, Anschrift ab 63 mm; Text links 25 mm.
 */

export type Anschrift = { firma: string; zusatz?: string; strasse: string; plz: string; ort: string; land?: string }

const MM = 2.8346
const A4 = { b: 595.28, h: 841.89 }
const y = (mm: number) => A4.h - mm * MM

/* Die Standardschrift kennt nur WinAnsi — türkische Buchstaben würden den Druck abbrechen. */
const ERSATZ: Record<string, string> = { ş: "s", Ş: "S", ğ: "g", Ğ: "G", ı: "i", İ: "I", " ": " ", " ": " " }
const WINANSI_EXTRA = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ")
export function sauber(s: string): string {
  return [...s.replace(/[şŞğĞıİ  ]/g, (c) => ERSATZ[c] ?? c)]
    .map((c) => (c === "\n" || (c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 256) || WINANSI_EXTRA.has(c) ? c : c.normalize("NFKD").replace(/[^\x20-\xff]/g, "")))
    .join("")
}

function umbrechen(text: string, font: PDFFont, groesse: number, breite: number): string[] {
  const out: string[] = []
  for (const absatz of text.split("\n")) {
    if (!absatz.trim()) {
      out.push("")
      continue
    }
    let zeile = ""
    for (const wort of absatz.split(/\s+/)) {
      const probe = zeile ? `${zeile} ${wort}` : wort
      if (font.widthOfTextAtSize(probe, groesse) > breite && zeile) {
        out.push(zeile)
        zeile = wort
      } else zeile = probe
    }
    out.push(zeile)
  }
  return out
}

export async function erzeugeBriefPdf(b: { an: Anschrift; betreff: string; text: string; datum?: Date }): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(sauber(b.betreff))
  pdf.setAuthor(address.owner)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fett = await pdf.embedFont(StandardFonts.HelveticaBold)
  const SCHWARZ = rgb(0.1, 0.1, 0.12)
  const GRAU = rgb(0.42, 0.42, 0.46)
  const BLAU = rgb(0.184, 0.357, 0.918)
  let seite = pdf.addPage([A4.b, A4.h])

  /* Kopf: Marke rechts oben, dünne Linie in Kobalt. */
  seite.drawText("creaDIG", { x: A4.b - 25 * MM - fett.widthOfTextAtSize("creaDIG", 16), y: y(22), size: 16, font: fett, color: BLAU })
  seite.drawLine({ start: { x: 25 * MM, y: y(30) }, end: { x: A4.b - 20 * MM, y: y(30) }, thickness: 0.6, color: BLAU })

  const ruecksende = sauber(`${address.company} · ${address.owner} · ${address.street} · ${address.postalCode} ${address.city}`)
  seite.drawText(ruecksende, { x: 20 * MM, y: y(48), size: 7, font, color: GRAU })

  const anschrift = [b.an.firma, b.an.zusatz ?? "z. Hd. der Geschäftsleitung", b.an.strasse, `${b.an.plz} ${b.an.ort}`, b.an.land && !/^(de|deutschland|germany)$/i.test(b.an.land) ? b.an.land.toUpperCase() : null]
    .filter(Boolean)
    .map((z) => sauber(String(z)))
  anschrift.forEach((z, i) => seite.drawText(z, { x: 20 * MM, y: y(64 + i * 4.6), size: 10, font, color: SCHWARZ }))

  const datum = (b.datum ?? new Date()).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" })
  seite.drawText(sauber(`${address.city}, ${datum}`), { x: 125 * MM, y: y(98), size: 10, font, color: SCHWARZ })

  seite.drawText(sauber(b.betreff).slice(0, 90), { x: 25 * MM, y: y(108), size: 11, font: fett, color: SCHWARZ })

  const breite = A4.b - 45 * MM
  let hoehe = 120
  for (const z of umbrechen(sauber(b.text), font, 10.5, breite)) {
    if (hoehe > 270) {
      seite = pdf.addPage([A4.b, A4.h])
      hoehe = 30
    }
    if (z) seite.drawText(z, { x: 25 * MM, y: y(hoehe), size: 10.5, font, color: SCHWARZ })
    hoehe += 5.2
  }

  /* Fuß: Kontakt und der Widerspruchsweg — wer keine Post mehr will, sagt es einmal. */
  const fuss = [
    sauber(`${address.company} · ${address.owner} · ${address.street} · ${address.postalCode} ${address.city} · ${contact.email} · creadig.de`),
    sauber(`Sie möchten keine Post mehr von uns? Eine kurze Nachricht an ${contact.email} genügt.`),
  ]
  for (const p of pdf.getPages())
    fuss.forEach((z, i) => p.drawText(z, { x: 25 * MM, y: y(282 + i * 4), size: 7, font, color: GRAU }))

  return pdf.save()
}
