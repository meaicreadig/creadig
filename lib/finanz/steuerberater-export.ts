import "server-only"

import { createHash } from "node:crypto"
import { get } from "@vercel/blob"
import JSZip from "jszip"

import type { Abfrage } from "@/lib/neon-abfrage"
import { berechneEuer } from "@/lib/finanz/euer"
import { erzeugeEuerPdf } from "@/lib/finanz/euer-pdf"
import { erzeugeDatevCsv, type DatevBuchung } from "@/lib/finanz/datev"
import { ladeBelegeFuerExport } from "@/lib/finanz/belege"
import { ladeDokumente, ladeFirma, type Dokument } from "@/lib/finanz/auftraege/store"
import { erzeugeXRechnung } from "@/lib/finanz/auftraege/erechnung"
import { erzeugeRechnungsPdf } from "@/lib/finanz/auftraege/pdf"

/**
 * Das Steuerberater-Paket (Phase 5): ein ZIP je Jahr mit
 *   a) DATEV-Buchungsstapel (EXTF, SKR03)
 *   b) alle Beleg-Dateien mit sprechenden Namen
 *   c) alle Ausgangsrechnungen als PDF + XRechnung-XML
 *   d) EÜR als PDF
 *   e) Prüfsummenliste (SHA-256 jeder beigelegten Datei)
 * Download ist in der Route (app/(finanz)/finanz/steuern/export/route.ts)
 * auf die Rolle owner beschränkt — hier nur das Zusammenstellen.
 */

async function datevBuchungenFuerJahr(db: Abfrage, jahr: string): Promise<DatevBuchung[]> {
  const r = await db(
    `SELECT b.id, to_char(b.datum,'YYYY-MM-DD') AS datum, b.brutto_cent, b.ust_satz, b.art, b.kategorie, b.gegenpartei,
            COALESCE(
              CASE WHEN b.quelle = 'rechnung' THEN fd.nummer END,
              CASE WHEN b.quelle = 'beleg' THEN COALESCE(fb.belegnummer, fb.id) END,
              CASE WHEN b.quelle = 'fibero' THEN b.quelle_ref END,
              b.id
            ) AS belegnummer
       FROM fin_buchungen b
       LEFT JOIN fin_dokumente fd ON b.quelle = 'rechnung' AND fd.id = b.quelle_ref
       LEFT JOIN fin_belege fb ON b.quelle = 'beleg' AND fb.id = b.quelle_ref
      WHERE b.storniert_at IS NULL AND b.status = 'gebucht' AND b.datum >= $1 AND b.datum < $2
      ORDER BY b.datum, b.id`,
    [`${jahr}-01-01`, `${Number(jahr) + 1}-01-01`],
  )
  return r.map((x) => ({
    datum: String(x.datum),
    bruttoCent: Number(x.brutto_cent),
    ustSatz: Number(x.ust_satz ?? 0),
    art: x.art === "einnahme" ? "einnahme" : "ausgabe",
    kategorie: String(x.kategorie ?? ""),
    gegenpartei: x.gegenpartei ? String(x.gegenpartei) : null,
    belegnummer: x.belegnummer ? String(x.belegnummer) : null,
  }))
}

const sichererDateiname = (s: string) => s.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120)

export type ExportFortschritt = { schritt: string }

export async function erzeugeSteuerberaterPaket(db: Abfrage, jahr: string, onFortschritt?: (f: ExportFortschritt) => void): Promise<Buffer> {
  const melde = (schritt: string) => onFortschritt?.({ schritt })
  const zip = new JSZip()
  const pruefsummen: string[] = []
  const hinzufuegen = (pfad: string, inhalt: Buffer | string) => {
    const bytes = typeof inhalt === "string" ? Buffer.from(inhalt, "utf-8") : inhalt
    zip.file(pfad, bytes)
    pruefsummen.push(`${createHash("sha256").update(bytes).digest("hex")}  ${pfad}`)
  }

  melde("EÜR berechnen")
  const { firma, ustPflichtig } = await ladeFirma(db)
  const euer = await berechneEuer(db, jahr)
  hinzufuegen(`euer/EUER_${jahr}.pdf`, Buffer.from(await erzeugeEuerPdf(euer, firma.name)))

  melde("DATEV-Buchungsstapel erzeugen")
  const buchungen = await datevBuchungenFuerJahr(db, jahr)
  hinzufuegen(`datev/EXTF_Buchungsstapel_${jahr}.csv`, erzeugeDatevCsv(buchungen, jahr))

  melde("Ausgangsrechnungen sammeln")
  const alle = await ladeDokumente(db, ["rechnung", "storno"])
  const imJahr = alle.filter((d) => d.nummer && d.datum.startsWith(jahr))
  for (const d of imJahr as Dokument[]) {
    const basisname = sichererDateiname(`${d.nummer}_${d.kunde.firma || d.kunde.name || "Kunde"}`)
    try {
      hinzufuegen(`rechnungen/${basisname}.pdf`, Buffer.from(await erzeugeRechnungsPdf(d, d.absender ?? firma)))
    } catch (e) {
      melde(`PDF fehlgeschlagen: ${d.nummer} (${e instanceof Error ? e.message : "unbekannt"})`)
    }
    if (d.art === "rechnung") {
      const x = erzeugeXRechnung(d, d.absender ?? firma, ustPflichtig)
      if (x.ok) hinzufuegen(`rechnungen/${basisname}_xrechnung.xml`, x.xml)
    }
  }

  melde("Belege sammeln")
  const belege = await ladeBelegeFuerExport(db, jahr)
  for (const b of belege) {
    const name = sichererDateiname(`${b.datum ?? "ohne-datum"}_${b.haendler || "Beleg"}_${b.id.slice(0, 8)}`)
    if (b.erechnungXml) hinzufuegen(`belege/${name}.xml`, b.erechnungXml)
    if (b.dateiPfad) {
      try {
        const blob = await get(b.dateiPfad, { access: "private" })
        if (blob?.stream) {
          const chunks: Uint8Array[] = []
          for await (const c of blob.stream as unknown as AsyncIterable<Uint8Array>) chunks.push(c)
          const endung = b.dateiName?.includes(".") ? b.dateiName.slice(b.dateiName.lastIndexOf(".")) : ""
          hinzufuegen(`belege/${name}${endung}`, Buffer.concat(chunks))
        }
      } catch (e) {
        melde(`Beleg-Datei fehlgeschlagen: ${b.id} (${e instanceof Error ? e.message : "unbekannt"})`)
      }
    }
  }

  melde("Prüfsummenliste schreiben")
  zip.file("PRUEFSUMMEN.sha256", pruefsummen.sort().join("\n") + "\n")

  melde("ZIP packen")
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
}
