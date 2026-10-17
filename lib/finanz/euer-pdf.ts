import "server-only"

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { eur } from "@/components/finanz/format"
import type { EuerErgebnis } from "@/lib/finanz/euer"

/** Lesbare EÜR-Übersicht als PDF fürs Steuerberater-Paket — keine amtliche Anlage EÜR, siehe lib/finanz/euer.ts. */
export async function erzeugeEuerPdf(e: EuerErgebnis, firmenname: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  let page = pdf.addPage([595.28, 841.89])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const GRAU = rgb(0.4, 0.4, 0.45)
  let y = 800
  const links = 50
  const zeile = (text: string, x: number, groesse = 10, f = font, farbe = rgb(0, 0, 0)) => {
    if (y < 80) { page = pdf.addPage([595.28, 841.89]); y = 800 }
    page.drawText(text, { x, y, size: groesse, font: f, color: farbe })
  }
  const ab = (n: number) => { y -= n }
  const abschnitt = (titel: string, zeilen: { kategorie: string; position: string; cent: number }[]) => {
    zeile(titel, links, 12, bold); ab(18)
    for (const z of zeilen) {
      zeile(z.position, links, 9, font, GRAU); ab(11)
      zeile(z.kategorie, links + 10, 10); zeile(eur(z.cent), 470, 10); ab(16)
    }
  }

  zeile(firmenname, links, 14, bold); ab(18)
  zeile(`Einnahmenüberschussrechnung (§ 4 Abs. 3 EStG) — ${e.jahr}`, links, 12); ab(10)
  zeile("Zufluss-/Abflussprinzip (§ 11 EStG) — keine Steuerberatung, zur Durchsicht mit dem Steuerberater.", links, 8, font, GRAU); ab(26)

  abschnitt("Betriebseinnahmen", e.einnahmen)
  ab(6)
  zeile("Summe Betriebseinnahmen", links, 10, bold); zeile(eur(e.summeEinnahmenCent), 470, 10, bold); ab(22)

  abschnitt("Betriebsausgaben", e.ausgaben)
  ab(6)
  zeile("Summe Betriebsausgaben", links, 10, bold); zeile(eur(e.summeAusgabenCent), 470, 10, bold); ab(22)

  zeile("Gewinn / Verlust", links, 12, bold); zeile(eur(e.gewinnCent), 470, 12, bold); ab(20)
  if (e.privatentnahmeCent > 0) {
    zeile(`nachrichtlich: Privatentnahmen ${eur(e.privatentnahmeCent)} (bewegen das Konto, nicht den Gewinn)`, links, 8, font, GRAU)
    ab(20)
  }

  if (e.jeGeschaeftsfeld.length > 0) {
    ab(10)
    zeile("Ergebnis je Geschäftsfeld", links, 12, bold); ab(18)
    for (const f of e.jeGeschaeftsfeld) {
      zeile(f.label, links, 10)
      zeile(eur(f.einCent - f.ausCent), 470, 10)
      ab(15)
    }
  }

  return pdf.save()
}
