import "server-only"

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { DOK_TEXT, formatDatum, formatEuro, formatMenge, positionNetto, zaehlt } from "@/lib/finanz/auftraege/rechnen"
import type { Dokument, Firma } from "@/lib/finanz/auftraege/store"

/**
 * Eine einfache, rechtlich vollständige PDF-Fassung eines festgeschriebenen
 * Dokuments — fürs Steuerberater-Paket (Phase 5). Keine Nachbildung der
 * Live-Vorschau (components/finanz/auftraege/dokument-blatt.tsx, HTML/CSS);
 * ein eigenständiges, mit pdf-lib gezeichnetes Layout, damit der Export ohne
 * Headless-Browser auskommt (in einer Vercel-Funktion unpraktikabel). Trägt
 * dieselben Zahlen und Pflichtangaben wie die Web-Ansicht — andere Optik,
 * gleicher Inhalt.
 */
export async function erzeugeRechnungsPdf(d: Dokument, firma: Firma): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  let page = pdf.addPage([595.28, 841.89])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const T = DOK_TEXT[d.sprache]
  const SCHWARZ = rgb(0.08, 0.08, 0.1)
  const GRAU = rgb(0.4, 0.4, 0.45)

  let y = 800
  const links = 50
  const neueSeite = () => {
    page = pdf.addPage([595.28, 841.89])
    y = 800
  }
  const zeile = (text: string, x: number, groesse = 10, f = font, farbe = SCHWARZ) => {
    if (y < 80) neueSeite()
    page.drawText(text, { x, y, size: groesse, font: f, color: farbe })
  }
  const ab = (n: number) => { y -= n }

  zeile(firma.name, links, 13, bold); ab(15)
  if (firma.inhaber) { zeile(firma.inhaber, links); ab(12) }
  if (firma.strasse) { zeile(firma.strasse, links); ab(12) }
  if (firma.plzOrt) { zeile(firma.plzOrt, links); ab(12) }
  if (firma.email) { zeile(firma.email, links); ab(12) }
  ab(14)

  const kundenName = d.kunde.firma || d.kunde.name
  zeile(kundenName, links, 11, bold); ab(14)
  if (d.kunde.firma && d.kunde.name) { zeile(d.kunde.name, links); ab(12) }
  if (d.kunde.strasse) { zeile(d.kunde.strasse, links); ab(12) }
  if (d.kunde.plzOrt) { zeile(d.kunde.plzOrt, links); ab(12) }
  ab(20)

  zeile(`${T[d.art]} ${d.nummer ?? ""}${d.version > 1 ? ` · ${T.version} ${d.version}` : ""}`, links, 15, bold); ab(20)
  zeile(`${T.datum}: ${formatDatum(d.datum, d.sprache)}`, links); ab(13)
  if (d.art === "angebot" && d.gueltigBis) { zeile(`${T.gueltig}: ${formatDatum(d.gueltigBis, d.sprache)}`, links); ab(13) }
  if (d.art !== "angebot" && d.faelligAm) { zeile(`${T.faellig}: ${formatDatum(d.faelligAm, d.sprache)}`, links); ab(13) }
  if (d.leistungszeitraum) { zeile(`${T.leistung}: ${d.leistungszeitraum}`, links); ab(13) }
  ab(10)

  if (d.einleitung) {
    for (const teil of umbrechen(d.einleitung, 95)) { zeile(teil, links); ab(13) }
    ab(8)
  }

  const spaltenX = { pos: links, titel: links + 25, menge: 330, preis: 390, betrag: 470 }
  zeile(T.pos, spaltenX.pos, 9, bold, GRAU)
  zeile(T.beschreibung, spaltenX.titel, 9, bold, GRAU)
  zeile(T.menge, spaltenX.menge, 9, bold, GRAU)
  zeile(T.preis, spaltenX.preis, 9, bold, GRAU)
  zeile(T.betrag, spaltenX.betrag, 9, bold, GRAU)
  ab(16)

  d.positionen.forEach((p, i) => {
    const bezeichnung = zaehlt(p) ? p.titel : `${p.titel} (${T.optional})`
    zeile(String(i + 1), spaltenX.pos, 10)
    zeile(bezeichnung.slice(0, 48), spaltenX.titel, 10)
    zeile(`${formatMenge(p.menge, d.sprache)} ${p.einheit}`, spaltenX.menge, 10)
    zeile(formatEuro(p.preisCent, d.sprache), spaltenX.preis, 10)
    zeile(formatEuro(positionNetto(p), d.sprache), spaltenX.betrag, 10)
    ab(15)
  })
  ab(10)

  if (d.summen) {
    const rechts = (label: string, wert: string, f = font) => { zeile(label, 390, 10, f); zeile(wert, 470, 10, f); ab(14) }
    if (d.rabattProzent > 0) rechts(`${T.zwischen}`, formatEuro(d.summen.zwischenCent, d.sprache))
    if (d.rabattProzent > 0) rechts(`${T.rabatt} ${d.rabattProzent}%`, `− ${formatEuro(d.summen.rabattCent, d.sprache)}`)
    rechts(T.netto, formatEuro(d.summen.nettoCent, d.sprache))
    for (const g of d.summen.gruppen) rechts(`${T.ust} ${g.satz}%`, formatEuro(g.ustCent, d.sprache))
    rechts(T.gesamt, formatEuro(d.summen.bruttoCent, d.sprache), bold)
  }
  ab(10)

  const steuerHinweis = d.steuerModus ? T.hinweis[d.steuerModus] : ""
  if (steuerHinweis) { zeile(steuerHinweis, links, 9, font, GRAU); ab(14) }
  if (d.art === "rechnung" && d.faelligAm) { zeile(`${T.zahlung} ${formatDatum(d.faelligAm, d.sprache)}.`, links, 9); ab(14) }

  if (firma.iban) {
    ab(6)
    zeile(T.bank, links, 9, bold, GRAU); ab(12)
    zeile(`IBAN ${firma.iban}${firma.bic ? ` · BIC ${firma.bic}` : ""}`, links, 9); ab(12)
    if (firma.bank) { zeile(firma.bank, links, 9); ab(12) }
  }

  ab(10)
  const steuerangabe = firma.ustId ? `${T.ihreUstid}: ${firma.ustId}` : firma.steuernummer ? `${T.steuernr}: ${firma.steuernummer}` : ""
  if (steuerangabe) { zeile(steuerangabe, links, 8, font, GRAU); ab(11) }
  if (d.pruefsumme) { zeile(`SHA-256: ${d.pruefsumme}`, links, 7, font, GRAU) }

  return pdf.save()
}

function umbrechen(text: string, maxZeichen: number): string[] {
  const woerter = text.split(/\s+/)
  const zeilen: string[] = []
  let aktuell = ""
  for (const w of woerter) {
    if ((aktuell + " " + w).trim().length > maxZeichen) {
      if (aktuell) zeilen.push(aktuell)
      aktuell = w
    } else {
      aktuell = (aktuell + " " + w).trim()
    }
  }
  if (aktuell) zeilen.push(aktuell)
  return zeilen
}
