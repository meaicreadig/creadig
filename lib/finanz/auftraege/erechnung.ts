import "server-only"

import { berechne, positionNetto, steuerModus as modusFuer, zaehlt, type Position, type SteuerModus } from "@/lib/finanz/auftraege/rechnen"
import type { Dokument, Firma } from "@/lib/finanz/auftraege/store"

/**
 * E-Rechnung nach EN 16931 im Format XRechnung 3.0 (UN/CEFACT CII-Syntax).
 * Wird aus dem festgeschriebenen Dokument erzeugt — gleiche Zahlen wie auf dem Papier.
 */

const GUIDELINE = "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0"
const PROZESS = "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0"

const EINHEIT_CODE: Record<string, string> = {
  "Stück": "H87",
  Stunde: "HUR",
  Tag: "DAY",
  Monat: "MON",
  Pauschal: "LS",
  Jahr: "ANN",
}

const BEFREIUNG: Partial<Record<SteuerModus, { kategorie: string; grund: string; code?: string }>> = {
  klein: { kategorie: "E", grund: "Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG" },
  reverse: { kategorie: "AE", grund: "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)", code: "VATEX-EU-AE" },
  drittland: { kategorie: "O", grund: "Nicht im Inland steuerbare Leistung", code: "VATEX-EU-O" },
}

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
const betrag = (cent: number) => (cent / 100).toFixed(2)
const datum102 = (iso: string) => iso.slice(0, 10).replace(/-/g, "")

function plzOrt(s: string): { plz: string; ort: string } {
  const m = s.trim().match(/^([A-Z]{0,3}-?\d{3,10})\s+(.+)$/i)
  return m ? { plz: m[1], ort: m[2] } : { plz: "", ort: s.trim() }
}

function kategorie(modus: SteuerModus, satz: number): string {
  const b = BEFREIUNG[modus]
  if (b) return b.kategorie
  return satz === 0 ? "Z" : "S"
}

function adresse(strasse: string, ortZeile: string, land: string): string {
  const { plz, ort } = plzOrt(ortZeile)
  return `<ram:PostalTradeAddress>${plz ? `<ram:PostcodeCode>${x(plz)}</ram:PostcodeCode>` : ""}<ram:LineOne>${x(strasse)}</ram:LineOne><ram:CityName>${x(ort)}</ram:CityName><ram:CountryID>${x(land)}</ram:CountryID></ram:PostalTradeAddress>`
}

/** Was fehlt für eine gültige XRechnung (über die normalen Pflichtangaben hinaus)? */
export function fehltFuerERechnung(d: Dokument, firma: Firma): string[] {
  const fehlt: string[] = []
  if (d.art !== "rechnung") fehlt.push("E-Rechnung gibt es nur für Rechnungen")
  if (!d.nummer) fehlt.push("Rechnung ist noch nicht festgeschrieben")
  if (!firma.email.trim()) fehlt.push("Deine E-Mail-Adresse (Grundlagen)")
  if (!firma.telefon.trim()) fehlt.push("Deine Telefonnummer (Grundlagen)")
  if (!firma.strasse.trim() || !firma.plzOrt.trim()) fehlt.push("Deine Anschrift (Grundlagen)")
  if (!firma.steuernummer.trim() && !firma.ustId.trim()) fehlt.push("Steuernummer oder USt-IdNr. (Grundlagen)")
  if (!firma.iban.trim()) fehlt.push("IBAN (Grundlagen)")
  if (!d.kunde.email.trim()) fehlt.push("E-Mail des Kunden")
  if (!(d.kunde.firma.trim() || d.kunde.name.trim())) fehlt.push("Name oder Firma des Kunden")
  if (!d.kunde.strasse.trim() || !d.kunde.plzOrt.trim()) fehlt.push("Anschrift des Kunden")
  return fehlt
}

export type ERechnung = { ok: true; xml: string; dateiname: string } | { ok: false; fehlt: string[] }

export function erzeugeXRechnung(d: Dokument, firmaAktuell: Firma, ustPflichtig: boolean): ERechnung {
  const firma = d.absender ?? firmaAktuell
  const fehlt = fehltFuerERechnung(d, firma)
  if (fehlt.length) return { ok: false, fehlt }

  const modus: SteuerModus = d.steuerModus ?? modusFuer(d.kunde, ustPflichtig)
  const summen = d.summen ?? berechne(d.positionen, d.rabattProzent, modus)
  const satzVon = (p: Position) => (modus === "normal" ? p.ustSatz : 0)
  const zeilen = d.positionen.filter(zaehlt)
  const befreiung = BEFREIUNG[modus]

  const rohProSatz = new Map<number, number>()
  for (const p of zeilen) rohProSatz.set(satzVon(p), (rohProSatz.get(satzVon(p)) ?? 0) + positionNetto(p))

  const positionen = zeilen
    .map((p, i) => {
      const satz = satzVon(p)
      return `<ram:IncludedSupplyChainTradeLineItem>
<ram:AssociatedDocumentLineDocument><ram:LineID>${i + 1}</ram:LineID></ram:AssociatedDocumentLineDocument>
<ram:SpecifiedTradeProduct><ram:Name>${x(p.titel || "Leistung")}</ram:Name>${p.beschreibung.trim() ? `<ram:Description>${x(p.beschreibung)}</ram:Description>` : ""}</ram:SpecifiedTradeProduct>
<ram:SpecifiedLineTradeAgreement><ram:NetPriceProductTradePrice><ram:ChargeAmount>${betrag(p.preisCent)}</ram:ChargeAmount></ram:NetPriceProductTradePrice></ram:SpecifiedLineTradeAgreement>
<ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="${EINHEIT_CODE[p.einheit] ?? "C62"}">${p.menge}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
<ram:SpecifiedLineTradeSettlement><ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>${kategorie(modus, satz)}</ram:CategoryCode><ram:RateApplicablePercent>${satz}</ram:RateApplicablePercent></ram:ApplicableTradeTax><ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${betrag(positionNetto(p))}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation></ram:SpecifiedLineTradeSettlement>
</ram:IncludedSupplyChainTradeLineItem>`
    })
    .join("\n")

  const steuern = summen.gruppen
    .map((g) => `<ram:ApplicableTradeTax><ram:CalculatedAmount>${betrag(g.ustCent)}</ram:CalculatedAmount><ram:TypeCode>VAT</ram:TypeCode>${befreiung ? `<ram:ExemptionReason>${x(befreiung.grund)}</ram:ExemptionReason>` : ""}<ram:BasisAmount>${betrag(g.nettoCent)}</ram:BasisAmount><ram:CategoryCode>${kategorie(modus, g.satz)}</ram:CategoryCode>${befreiung?.code ? `<ram:ExemptionReasonCode>${befreiung.code}</ram:ExemptionReasonCode>` : ""}<ram:RateApplicablePercent>${g.satz}</ram:RateApplicablePercent></ram:ApplicableTradeTax>`)
    .join("")

  const rabatte = summen.gruppen
    .map((g) => ({ g, nachlass: (rohProSatz.get(g.satz) ?? g.nettoCent) - g.nettoCent }))
    .filter((r) => r.nachlass > 0)
    .map(({ g, nachlass }) => `<ram:SpecifiedTradeAllowanceCharge><ram:ChargeIndicator><udt:Indicator>false</udt:Indicator></ram:ChargeIndicator><ram:ActualAmount>${betrag(nachlass)}</ram:ActualAmount><ram:Reason>Rabatt ${d.rabattProzent} %</ram:Reason><ram:CategoryTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>${kategorie(modus, g.satz)}</ram:CategoryCode><ram:RateApplicablePercent>${g.satz}</ram:RateApplicablePercent></ram:CategoryTradeTax></ram:SpecifiedTradeAllowanceCharge>`)
    .join("")

  const sellerSteuer = [
    firma.ustId.trim() && modus !== "drittland" ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${x(firma.ustId.trim())}</ram:ID></ram:SpecifiedTaxRegistration>` : "",
    firma.steuernummer.trim() ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="FC">${x(firma.steuernummer.trim())}</ram:ID></ram:SpecifiedTaxRegistration>` : "",
  ].join("")
  const kaeuferSteuer = d.kunde.ustId.trim() && modus !== "drittland" ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${x(d.kunde.ustId.trim())}</ram:ID></ram:SpecifiedTaxRegistration>` : ""
  const kaeuferName = d.kunde.firma.trim() || d.kunde.name.trim()

  const notizen = [d.einleitung, d.leistungszeitraum ? `Leistungszeitraum: ${d.leistungszeitraum}` : "", befreiung?.grund ?? "", d.schluss]
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => `<ram:IncludedNote><ram:Content>${x(n)}</ram:Content></ram:IncludedNote>`)
    .join("")

  const faellig = d.faelligAm ?? d.datum
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100">
<rsm:ExchangedDocumentContext>
<ram:BusinessProcessSpecifiedDocumentContextParameter><ram:ID>${PROZESS}</ram:ID></ram:BusinessProcessSpecifiedDocumentContextParameter>
<ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>${GUIDELINE}</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter>
</rsm:ExchangedDocumentContext>
<rsm:ExchangedDocument>
<ram:ID>${x(d.nummer ?? "")}</ram:ID>
<ram:TypeCode>380</ram:TypeCode>
<ram:IssueDateTime><udt:DateTimeString format="102">${datum102(d.datum)}</udt:DateTimeString></ram:IssueDateTime>
${notizen}
</rsm:ExchangedDocument>
<rsm:SupplyChainTradeTransaction>
${positionen}
<ram:ApplicableHeaderTradeAgreement>
<ram:BuyerReference>${x(d.nummer ?? "")}</ram:BuyerReference>
<ram:SellerTradeParty>
<ram:Name>${x(firma.name)}</ram:Name>
<ram:DefinedTradeContact><ram:PersonName>${x(firma.inhaber || firma.name)}</ram:PersonName><ram:TelephoneUniversalCommunication><ram:CompleteNumber>${x(firma.telefon)}</ram:CompleteNumber></ram:TelephoneUniversalCommunication><ram:EmailURIUniversalCommunication><ram:URIID>${x(firma.email)}</ram:URIID></ram:EmailURIUniversalCommunication></ram:DefinedTradeContact>
${adresse(firma.strasse, firma.plzOrt, "DE")}
<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${x(firma.email)}</ram:URIID></ram:URIUniversalCommunication>
${sellerSteuer}
</ram:SellerTradeParty>
<ram:BuyerTradeParty>
<ram:Name>${x(kaeuferName)}</ram:Name>
${d.kunde.firma.trim() && d.kunde.name.trim() ? `<ram:DefinedTradeContact><ram:PersonName>${x(d.kunde.name)}</ram:PersonName></ram:DefinedTradeContact>` : ""}
${adresse(d.kunde.strasse, d.kunde.plzOrt, (d.kunde.land || "DE").toUpperCase())}
<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${x(d.kunde.email.trim())}</ram:URIID></ram:URIUniversalCommunication>
${kaeuferSteuer}
</ram:BuyerTradeParty>
</ram:ApplicableHeaderTradeAgreement>
<ram:ApplicableHeaderTradeDelivery>
<ram:ActualDeliverySupplyChainEvent><ram:OccurrenceDateTime><udt:DateTimeString format="102">${datum102(d.datum)}</udt:DateTimeString></ram:OccurrenceDateTime></ram:ActualDeliverySupplyChainEvent>
</ram:ApplicableHeaderTradeDelivery>
<ram:ApplicableHeaderTradeSettlement>
<ram:PaymentReference>${x(d.nummer ?? "")}</ram:PaymentReference>
<ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
<ram:SpecifiedTradeSettlementPaymentMeans><ram:TypeCode>58</ram:TypeCode><ram:PayeePartyCreditorFinancialAccount><ram:IBANID>${x(firma.iban.replace(/\s+/g, ""))}</ram:IBANID><ram:AccountName>${x(firma.name)}</ram:AccountName></ram:PayeePartyCreditorFinancialAccount>${firma.bic.trim() ? `<ram:PayeeSpecifiedCreditorFinancialInstitution><ram:BICID>${x(firma.bic.trim())}</ram:BICID></ram:PayeeSpecifiedCreditorFinancialInstitution>` : ""}</ram:SpecifiedTradeSettlementPaymentMeans>
${steuern}
${rabatte}
<ram:SpecifiedTradePaymentTerms><ram:Description>Zahlbar innerhalb von ${d.zahlungszielTage} Tagen ohne Abzug.</ram:Description><ram:DueDateDateTime><udt:DateTimeString format="102">${datum102(faellig)}</udt:DateTimeString></ram:DueDateDateTime></ram:SpecifiedTradePaymentTerms>
<ram:SpecifiedTradeSettlementHeaderMonetarySummation>
<ram:LineTotalAmount>${betrag(summen.zwischenCent)}</ram:LineTotalAmount>
<ram:ChargeTotalAmount>0.00</ram:ChargeTotalAmount>
<ram:AllowanceTotalAmount>${betrag(summen.rabattCent)}</ram:AllowanceTotalAmount>
<ram:TaxBasisTotalAmount>${betrag(summen.nettoCent)}</ram:TaxBasisTotalAmount>
<ram:TaxTotalAmount currencyID="EUR">${betrag(summen.ustCent)}</ram:TaxTotalAmount>
<ram:GrandTotalAmount>${betrag(summen.bruttoCent)}</ram:GrandTotalAmount>
<ram:TotalPrepaidAmount>0.00</ram:TotalPrepaidAmount>
<ram:DuePayableAmount>${betrag(summen.bruttoCent)}</ram:DuePayableAmount>
</ram:SpecifiedTradeSettlementHeaderMonetarySummation>
</ram:ApplicableHeaderTradeSettlement>
</rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`
  return { ok: true, xml, dateiname: `${(d.nummer ?? "rechnung").replace(/[^A-Za-z0-9_-]/g, "_")}_xrechnung.xml` }
}
