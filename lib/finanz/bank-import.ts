import "server-only"

import { createHash } from "node:crypto"
import { XMLParser } from "fast-xml-parser"

/**
 * Bank-Import (Phase 6), zuerst ohne PSD2: CSV oder camt.053 hochladen.
 * Jeder Umsatz einmal — ueber eine Bankreferenz (camt.053: AcctSvcrRef) oder,
 * wenn keine vorliegt (die meisten CSV-Exporte), eine Pruefsumme aus Datum +
 * Betrag + Verwendungszweck. Reines Lesen: es wird nichts an die Bank
 * zurueckgeschrieben, nur hier abgelegt und spaeter manuell zugeordnet.
 */

export type BankUmsatz = {
  ref: string
  datum: string
  betragCent: number
  verwendungszweck: string
  gegenpartei: string | null
}

const alsArray = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v])
const text = (v: unknown): string => {
  if (v === undefined || v === null) return ""
  if (typeof v === "object") return text((v as Record<string, unknown>)["#text"])
  return String(v).trim()
}
const pruefsummenRef = (datum: string, betragCent: number, verwendungszweck: string) =>
  `csv-${createHash("sha256").update(`${datum}|${betragCent}|${verwendungszweck}`).digest("hex").slice(0, 24)}`

const camtParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", removeNSPrefix: true, trimValues: true })

/** ISO 20022 camt.053.001.0x — Kontoauszug. Ntry = ein Umsatz, TxDtls traegt Verwendungszweck und Gegenpartei. */
export function leseCamt053(xml: string): BankUmsatz[] {
  const doc = camtParser.parse(xml) as Record<string, unknown>
  const stmts = alsArray((doc?.Document as Record<string, unknown>)?.BkToCstmrStmt && ((doc.Document as Record<string, unknown>).BkToCstmrStmt as Record<string, unknown>).Stmt) as Record<string, unknown>[]
  const umsaetze: BankUmsatz[] = []

  for (const stmt of stmts) {
    const eintraege = alsArray(stmt.Ntry as Record<string, unknown> | Record<string, unknown>[])
    eintraege.forEach((e, i) => {
      const betrag = Number(text((e.Amt as Record<string, unknown>) ?? e.Amt))
      const richtung = text(e.CdtDbtInd) === "CRDT" ? 1 : -1
      const bookgDt = e.BookgDt as Record<string, unknown> | undefined
      const valDt = e.ValDt as Record<string, unknown> | undefined
      const datum = text(bookgDt?.Dt) || text(valDt?.Dt)
      const ref = text(e.AcctSvcrRef) || text(e.NtryRef) || `camt-${datum}-${i}`
      const txDtls = alsArray((e.NtryDtls as Record<string, unknown>)?.TxDtls as Record<string, unknown> | Record<string, unknown>[])[0] as Record<string, unknown> | undefined
      const rmtInf = txDtls?.RmtInf as Record<string, unknown> | undefined
      const verwendungszweck = alsArray(rmtInf?.Ustrd as string | string[]).map(text).filter(Boolean).join(" ")
      const rltdPties = txDtls?.RltdPties as Record<string, unknown> | undefined
      const parteiObj = (richtung > 0 ? rltdPties?.Dbtr : rltdPties?.Cdtr) as Record<string, unknown> | undefined
      const gegenpartei = text(parteiObj?.Nm) || null

      if (!datum || !Number.isFinite(betrag)) return
      umsaetze.push({ ref, datum, betragCent: Math.round(betrag * 100) * richtung, verwendungszweck, gegenpartei })
    })
  }
  return umsaetze
}

const SPALTEN_DATUM = ["buchungstag", "valutadatum", "datum", "wertstellung"]
const SPALTEN_BETRAG = ["betrag", "umsatz", "betrag (eur)", "betrag eur"]
const SPALTEN_ZWECK = ["verwendungszweck", "buchungstext", "vwz", "zahlungsreferenz"]
const SPALTEN_PARTEI = ["beguenstigter/zahlungspflichtiger", "empfaenger", "auftraggeber", "name", "zahlungsbeteiligter"]

function normalisiereHeader(h: string): string {
  return h.trim().toLowerCase().replace(/^﻿/, "").replace(/"/g, "")
}
function findeSpalte(header: string[], kandidaten: string[]): number {
  for (const k of kandidaten) {
    const i = header.findIndex((h) => h === k || h.includes(k))
    if (i >= 0) return i
  }
  return -1
}
function parseCsvZeile(zeile: string, trenner: string): string[] {
  const felder: string[] = []
  let feld = ""
  let inQuotes = false
  for (let i = 0; i < zeile.length; i++) {
    const c = zeile[i]
    if (c === '"') {
      if (inQuotes && zeile[i + 1] === '"') { feld += '"'; i++ } else inQuotes = !inQuotes
    } else if (c === trenner && !inQuotes) {
      felder.push(feld); feld = ""
    } else feld += c
  }
  felder.push(feld)
  return felder.map((f) => f.trim())
}
function parseBetrag(s: string): number | null {
  const bereinigt = s.replace(/[€\s]/g, "")
  const normalisiert = /,\d{1,2}$/.test(bereinigt) ? bereinigt.replace(/\./g, "").replace(",", ".") : bereinigt.replace(",", ".")
  const n = Number(normalisiert)
  return Number.isFinite(n) ? n : null
}
function parseDatum(s: string): string | null {
  const dmy = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
  if (dmy) {
    const jahr = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]
    return `${jahr}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  return null
}

/** CSV-Export einer deutschen Bank — Spaltennamen variieren je Bank, deshalb erkannt statt fest vorausgesetzt. */
export function leseBankCsv(text: string): BankUmsatz[] {
  const zeilen = text.split(/\r?\n/).filter((z) => z.trim())
  if (zeilen.length < 2) return []
  const trenner = (zeilen[0].match(/;/g)?.length ?? 0) >= (zeilen[0].match(/,/g)?.length ?? 0) ? ";" : ","
  const header = parseCsvZeile(zeilen[0], trenner).map(normalisiereHeader)
  const iDatum = findeSpalte(header, SPALTEN_DATUM)
  const iBetrag = findeSpalte(header, SPALTEN_BETRAG)
  const iZweck = findeSpalte(header, SPALTEN_ZWECK)
  const iPartei = findeSpalte(header, SPALTEN_PARTEI)
  if (iDatum === -1 || iBetrag === -1) return []

  const umsaetze: BankUmsatz[] = []
  for (const zeile of zeilen.slice(1)) {
    const felder = parseCsvZeile(zeile, trenner)
    const datum = parseDatum(felder[iDatum] ?? "")
    const betrag = parseBetrag(felder[iBetrag] ?? "")
    if (!datum || betrag === null) continue
    const verwendungszweck = iZweck >= 0 ? (felder[iZweck] ?? "") : ""
    const gegenpartei = iPartei >= 0 ? (felder[iPartei] ?? null) || null : null
    const betragCent = Math.round(betrag * 100)
    umsaetze.push({ ref: pruefsummenRef(datum, betragCent, verwendungszweck), datum, betragCent, verwendungszweck, gegenpartei })
  }
  return umsaetze
}
