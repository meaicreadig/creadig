import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { belegeSchema } from "@/lib/finanz/belege"
import { NETTO_ROH_SQL, NETTO_SQL, ladeFelder, type FelderBild } from "@/lib/finanz/felder"

/**
 * EÜR nach § 4 Abs. 3 EStG — Zufluss-/Abflussprinzip (§ 11 EStG): gezählt
 * wird, was tatsächlich zu-/abgeflossen ist (fin_buchungen, status='gebucht'),
 * nicht was in Rechnung gestellt wurde. Netto gerechnet (dieselbe Formel wie
 * lib/finanz/felder.ts, importiert statt zweimal geschrieben), Privatentnahme
 * ausgeschlossen (keine Betriebsausgabe).
 *
 * KEINE STEUERBERATUNG. Die POSITION je Kategorie ist eine Arbeitszuordnung
 * zu den Gruppen der Anlage EÜR — die genaue Zeilennummer verschiebt sich von
 * Formularjahr zu Formularjahr leicht (das BMF nummeriert nahezu jedes Jahr
 * neu durch). Welche Zeile im konkreten Jahrgang zutrifft, entscheidet der
 * Steuerberater; diese Datei liefert die Summe und die Gruppe, nicht die
 * amtliche Zeilennummer.
 */

export type EuerZeile = { kategorie: string; position: string; cent: number; anzahl: number }
export type EuerErgebnis = {
  jahr: string
  einnahmen: EuerZeile[]
  ausgaben: EuerZeile[]
  summeEinnahmenCent: number
  summeAusgabenCent: number
  gewinnCent: number
  privatentnahmeCent: number
  jeGeschaeftsfeld: FelderBild["felder"]
}

const POSITION_EINNAHME: Record<string, string> = {
  "Projekt / Kunde": "Betriebseinnahmen",
  "Produkt-Abo": "Betriebseinnahmen",
  "Fibero-Rechnung": "Betriebseinnahmen",
  Beratung: "Betriebseinnahmen",
  Sonstiges: "Übrige Betriebseinnahmen",
}

const POSITION_AUSGABE: Record<string, string> = {
  "Software & Hosting": "Betriebsausgaben – EDV, Software, Lizenzen",
  Hardware: "Betriebsausgaben – Geringwertige Wirtschaftsgüter / Abschreibungen (AfA)",
  Marketing: "Betriebsausgaben – Werbekosten",
  "Büro & Miete": "Betriebsausgaben – Raumkosten",
  "Fahrzeug & Reise": "Betriebsausgaben – Kfz- und Reisekosten",
  Fremdleistung: "Betriebsausgaben – Fremdleistungen",
  Versicherung: "Betriebsausgaben – Versicherungen, Beiträge",
  "Bank & Gebühren": "Betriebsausgaben – Sonstige unbeschränkt abziehbare Betriebsausgaben",
  Weiterbildung: "Betriebsausgaben – Sonstige unbeschränkt abziehbare Betriebsausgaben",
  Sonstiges: "Übrige Betriebsausgaben",
}

export async function berechneEuer(db: Abfrage, jahr: string): Promise<EuerErgebnis> {
  await belegeSchema(db)
  const p = [`${jahr}-01-01`, `${Number(jahr) + 1}-01-01`]
  const basis = `b.storniert_at IS NULL AND b.status = 'gebucht' AND b.datum >= $1 AND b.datum < $2`

  const [zeilen, privat, afaVortrag, jeGeschaeftsfeld] = await Promise.all([
    db(
      `SELECT b.art, b.kategorie, sum(${NETTO_SQL}) AS netto, count(*) AS c
         FROM fin_buchungen b WHERE ${basis} AND b.kategorie <> 'Privatentnahme' GROUP BY 1, 2`,
      p,
    ),
    db(
      `SELECT coalesce(sum(b.brutto_cent), 0) AS s FROM fin_buchungen b
        WHERE ${basis} AND b.kategorie = 'Privatentnahme'`,
      p,
    ),
    // Abschreibung eines in einem FRÜHEREN Jahr angeschafften Anlageguts, die auch dieses Jahr noch läuft.
    db(
      `SELECT b.kategorie, extract(year FROM b.datum)::int AS start, b.afa_jahre AS n, ${NETTO_ROH_SQL} AS netto
         FROM fin_buchungen b
        WHERE b.storniert_at IS NULL AND b.status = 'gebucht' AND b.afa_jahre > 0 AND b.datum < $1`,
      [p[0]],
    ),
    ladeFelder(db, jahr),
  ])

  const karte = new Map<string, { art: "einnahme" | "ausgabe"; cent: number; anzahl: number }>()
  for (const r of zeilen) {
    const k = String(r.kategorie)
    const art = r.art === "einnahme" ? "einnahme" : "ausgabe"
    const z = karte.get(k) ?? { art, cent: 0, anzahl: 0 }
    z.cent += Number(r.netto)
    z.anzahl += Number(r.c)
    karte.set(k, z)
  }
  for (const r of afaVortrag) {
    const n = Number(r.n)
    const netto = Number(r.netto)
    const proJahr = netto / n
    const rate = Math.round(Math.max(0, Math.min(proJahr, netto - (Number(jahr) - Number(r.start)) * proJahr)))
    if (rate <= 0) continue
    const k = String(r.kategorie)
    const z = karte.get(k) ?? { art: "ausgabe", cent: 0, anzahl: 0 }
    z.cent += rate
    karte.set(k, z)
  }

  const einnahmen: EuerZeile[] = []
  const ausgaben: EuerZeile[] = []
  for (const [kategorie, z] of karte) {
    const zeile = { kategorie, position: (z.art === "einnahme" ? POSITION_EINNAHME : POSITION_AUSGABE)[kategorie] ?? "Übrige Betriebseinnahmen/-ausgaben", cent: z.cent, anzahl: z.anzahl }
    if (z.art === "einnahme") einnahmen.push(zeile)
    else ausgaben.push(zeile)
  }
  einnahmen.sort((a, b) => b.cent - a.cent)
  ausgaben.sort((a, b) => b.cent - a.cent)

  const summeEinnahmenCent = einnahmen.reduce((s, z) => s + z.cent, 0)
  const summeAusgabenCent = ausgaben.reduce((s, z) => s + z.cent, 0)

  return {
    jahr,
    einnahmen,
    ausgaben,
    summeEinnahmenCent,
    summeAusgabenCent,
    gewinnCent: summeEinnahmenCent - summeAusgabenCent,
    privatentnahmeCent: Number(privat[0]?.s ?? 0),
    jeGeschaeftsfeld: jeGeschaeftsfeld.felder,
  }
}
