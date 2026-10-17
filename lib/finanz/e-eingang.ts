import "server-only"

import { XMLParser } from "fast-xml-parser"
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRawStream, PDFString, PDFHexString, PDFRef, decodePDFRawStream } from "pdf-lib"

/**
 * Eingehende E-Rechnungen (Phase 3) — UBL und CII (beides erlaubte Syntaxen
 * der XRechnung, EN 16931) sowie ZUGFeRD/Factur-X (dieselbe CII-XML,
 * eingebettet in ein PDF). lib/finanz/auftraege/erechnung.ts ERZEUGT CII fuer
 * die eigenen Ausgangsrechnungen; dieses Modul LIEST beide Syntaxen fuer
 * eingehende Rechnungen — unterschiedliche Richtung, verwandtes Format.
 *
 * Nur Extraktion zur Vorausfuellung. Der Mensch bestaetigt immer (siehe
 * ladeBelegHoch() in lib/finanz/belege.ts) — eine Fehllesung fuellt ein
 * falsches Feld vor, erzeugt aber nie von selbst eine Buchung.
 */

export type ERechnungDaten = {
  format: "ubl" | "cii"
  lieferant: string | null
  rechnungsnummer: string | null
  datum: string | null
  faellig: string | null
  nettoCent: number | null
  ustCent: number | null
  bruttoCent: number | null
  iban: string | null
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
})

/** Erster Nachfahre mit diesem lokalen Tag-Namen, egal wie tief — Pfade unterscheiden sich leicht je Profil (XRechnung/Peppol), der Tag-Name nicht. */
function find(node: unknown, tag: string): unknown {
  if (node === null || typeof node !== "object") return undefined
  const obj = node as Record<string, unknown>
  if (tag in obj) return obj[tag]
  for (const k of Object.keys(obj)) {
    if (k.startsWith("@_") || k === "#text") continue
    const treffer = find(obj[k], tag)
    if (treffer !== undefined) return treffer
  }
  return undefined
}

function text(v: unknown): string | null {
  if (v === undefined || v === null) return null
  if (typeof v === "object") {
    const o = v as Record<string, unknown>
    if ("#text" in o) return text(o["#text"])
    return null
  }
  const s = String(v).trim()
  return s || null
}

function geld(v: unknown): number | null {
  const s = text(v)
  if (s === null) return null
  const n = Number(s.replace(",", "."))
  return Number.isFinite(n) ? Math.round(n * 100) : null
}

/** CII-Datum "102" (YYYYMMDD) oder ein ISO-Datum direkt. */
function datum(v: unknown): string | null {
  const s = text(v)
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  return null
}

function ausCII(doc: Record<string, unknown>): ERechnungDaten {
  const wurzel = find(doc, "CrossIndustryInvoice") ?? doc
  const kopf = find(wurzel, "ExchangedDocument")
  const vertrag = find(wurzel, "ApplicableHeaderTradeAgreement")
  const abwicklung = find(wurzel, "ApplicableHeaderTradeSettlement")
  const summen = find(abwicklung, "SpecifiedTradeSettlementHeaderMonetarySummation")
  const zahlungsmittel = find(abwicklung, "SpecifiedTradeSettlementPaymentMeans")
  const zahlungsbedingung = find(abwicklung, "SpecifiedTradePaymentTerms")
  return {
    format: "cii",
    lieferant: text(find(find(vertrag, "SellerTradeParty"), "Name")),
    rechnungsnummer: text(find(kopf, "ID")),
    datum: datum(find(find(kopf, "IssueDateTime"), "DateTimeString")),
    faellig: datum(find(find(zahlungsbedingung, "DueDateDateTime"), "DateTimeString")),
    nettoCent: geld(find(summen, "TaxBasisTotalAmount")),
    ustCent: geld(find(summen, "TaxTotalAmount")),
    bruttoCent: geld(find(summen, "GrandTotalAmount")),
    iban: text(find(find(zahlungsmittel, "PayeePartyCreditorFinancialAccount"), "IBANID")),
  }
}

function ausUBL(doc: Record<string, unknown>): ERechnungDaten {
  const wurzel = (find(doc, "Invoice") ?? doc) as Record<string, unknown>
  const verkaeufer = find(wurzel, "AccountingSupplierParty")
  const summen = find(wurzel, "LegalMonetaryTotal")
  const zahlungsmittel = find(wurzel, "PaymentMeans")
  return {
    format: "ubl",
    lieferant: text(find(find(verkaeufer, "PartyLegalEntity"), "RegistrationName")) ?? text(find(find(verkaeufer, "PartyName"), "Name")),
    rechnungsnummer: text(find(wurzel, "ID")),
    datum: datum(find(wurzel, "IssueDate")),
    faellig: datum(find(wurzel, "DueDate")),
    nettoCent: geld(find(summen, "TaxExclusiveAmount")),
    ustCent: geld(find(wurzel, "TaxAmount")),
    bruttoCent: geld(find(summen, "PayableAmount")) ?? geld(find(summen, "TaxInclusiveAmount")),
    iban: text(find(find(zahlungsmittel, "PayeeFinancialAccount"), "ID")),
  }
}

/** XML-Text → erkanntes Format + extrahierte Daten, oder null, wenn weder UBL noch CII erkennbar ist. */
export function leseERechnungXml(xml: string): ERechnungDaten | null {
  let doc: Record<string, unknown>
  try {
    doc = parser.parse(xml) as Record<string, unknown>
  } catch {
    return null
  }
  if (find(doc, "CrossIndustryInvoice") !== undefined) return ausCII(doc)
  if (find(doc, "Invoice") !== undefined) return ausUBL(doc)
  return null
}

const ZUGFERD_DATEINAMEN = ["factur-x.xml", "zugferd-invoice.xml", "xrechnung.xml", "ZUGFeRD-invoice.xml"]

/** Loest eine Referenz (indirekt oder schon aufgeloest) zu ihrem Objekt auf. */
function aufloesen(pdf: PDFDocument, ref: unknown): unknown {
  if (ref === undefined) return undefined
  return ref instanceof PDFRef ? pdf.context.lookup(ref) : ref
}

/** Sammelt alle (Dateiname, Filespec)-Paare aus einem Namens-Baum — flach ODER mit /Kids, eine Ebene tief reicht fuer ein einzelnes eingebettetes Dokument. */
function namenPaare(pdf: PDFDocument, baum: PDFDict | undefined): [string, unknown][] {
  if (!baum) return []
  const paare: [string, unknown][] = []
  const direkt = aufloesen(pdf, baum.get(PDFName.of("Names")))
  if (direkt instanceof PDFArray) {
    for (let i = 0; i + 1 < direkt.size(); i += 2) {
      const nameObj = direkt.get(i)
      const name = nameObj instanceof PDFString || nameObj instanceof PDFHexString ? nameObj.decodeText() : String(nameObj)
      paare.push([name, direkt.get(i + 1)])
    }
  }
  const kids = aufloesen(pdf, baum.get(PDFName.of("Kids")))
  if (kids instanceof PDFArray) {
    for (let i = 0; i < kids.size(); i++) {
      const kind = aufloesen(pdf, kids.get(i))
      if (kind instanceof PDFDict) paare.push(...namenPaare(pdf, kind))
    }
  }
  return paare
}

/** ZUGFeRD/Factur-X: dieselbe CII-XML, als eingebettete Datei im PDF (keine eigene Syntax). */
export async function leseEingebettetesXml(pdfBytes: Uint8Array): Promise<string | null> {
  try {
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true, updateMetadata: false })
    const names = aufloesen(pdf, pdf.catalog.get(PDFName.of("Names")))
    const embeddedFiles = names instanceof PDFDict ? aufloesen(pdf, names.get(PDFName.of("EmbeddedFiles"))) : undefined
    const paare = namenPaare(pdf, embeddedFiles instanceof PDFDict ? embeddedFiles : undefined)

    for (const [dateiname, specRef] of paare) {
      if (!ZUGFERD_DATEINAMEN.some((n) => dateiname.toLowerCase().includes(n.toLowerCase()))) continue
      const spec = aufloesen(pdf, specRef)
      const ef = spec instanceof PDFDict ? aufloesen(pdf, spec.get(PDFName.of("EF"))) : undefined
      const stream = ef instanceof PDFDict ? aufloesen(pdf, ef.get(PDFName.of("F"))) : undefined
      if (stream instanceof PDFRawStream) {
        const bytes = decodePDFRawStream(stream).decode()
        return Buffer.from(bytes).toString("utf-8")
      }
    }
    return null
  } catch (e) {
    console.error("[e-eingang] ZUGFeRD-Extraktion", e instanceof Error ? e.message : e)
    return null
  }
}

/** Haupteinstieg: erkennt PDF (ZUGFeRD/Factur-X) vs. reine XML-Datei (UBL/CII) und liefert in beiden Faellen dieselbe Struktur. */
export async function leseERechnung(bytes: Buffer, mimeType: string): Promise<{ xml: string; daten: ERechnungDaten } | null> {
  if (mimeType === "application/pdf" || bytes.subarray(0, 5).toString("latin1") === "%PDF-") {
    const xml = await leseEingebettetesXml(bytes)
    if (!xml) return null
    const daten = leseERechnungXml(xml)
    return daten ? { xml, daten } : null
  }
  const xml = bytes.toString("utf-8")
  const daten = leseERechnungXml(xml)
  return daten ? { xml, daten } : null
}
