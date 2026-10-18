import { istKeinUmsatz, type Buchung } from "@/lib/finanz/rechnen"

/**
 * § 19 Abs. 1 UStG, Fassung ab 01.01.2025 (Jahressteuergesetz 2024, BGBl. 2024
 * I Nr. 387): Kleinunternehmer ist, wessen Vorjahresumsatz 25.000 € nicht
 * überschritten hat UND dessen Umsatz im laufenden Jahr 100.000 € nicht
 * überschreitet. NEU seit 2025: Überschreitet der laufende Umsatz die
 * 100.000 €, endet die Kleinunternehmerregelung UNTERJÄHRIG — ab genau dem
 * Umsatz, der die Grenze überschreitet, nicht erst zum Jahreswechsel (bis
 * 2024 war das anders: da zählte nur eine Prognose zu Jahresbeginn).
 *
 * "Umsatz" hier wie im Gesetz: netto, nach vereinnahmten Entgelten (Ist-
 * Versteuerung) — nicht nach gestellten Rechnungen. Deshalb fin_buchungen
 * mit status='gebucht' (tatsächlich zugeflossen), nicht fin_dokumente.
 */
export const PARAGRAPH19_VORJAHR_GRENZE_CENT = 25_000_00
export const PARAGRAPH19_LAUFENDES_JAHR_GRENZE_CENT = 100_000_00

export type Paragraph19Ampel = "ruhig" | "achtung" | "kritisch" | "ueberschritten"

export type Paragraph19Status = {
  vorjahr: number
  vorjahrUmsatzCent: number
  vorjahrUeberschritten: boolean
  laufendesJahr: number
  laufendesJahrUmsatzCent: number
  anteilLaufendesJahr: number
  abstandLaufendesJahrCent: number
  ampel: Paragraph19Ampel
  /** Datum und Buchungs-ID, an der die 100.000-€-Grenze im laufenden Jahr ueberschritten wurde — null, solange nicht ueberschritten. */
  ueberschrittenAm: string | null
  ueberschrittenBeiBuchungId: string | null
}

/** Netto aus dem, was die Buchung SELBST traegt (ust_satz) — nicht aus der heutigen Einstellung, damit ein Uebergangsjahr (teils § 19, teils regelbesteuert) richtig gezaehlt wird. */
function nettoDerBuchung(b: Pick<Buchung, "bruttoCent" | "ustSatz">): number {
  return b.ustSatz > 0 ? Math.round((b.bruttoCent * 100) / (100 + b.ustSatz)) : b.bruttoCent
}

export function paragraph19Status(buchungen: Buchung[], heute: string): Paragraph19Status {
  const jahr = Number(heute.slice(0, 4))
  const einnahmenJahr = (j: number) =>
    buchungen
      .filter((b) => !b.storniert && b.art === "einnahme" && b.status === "gebucht" && b.datum.startsWith(String(j)) && !istKeinUmsatz(b.kategorie))
      .sort((a, b) => a.datum.localeCompare(b.datum))

  const vorjahrUmsatzCent = einnahmenJahr(jahr - 1).reduce((s, b) => s + nettoDerBuchung(b), 0)

  let kumuliert = 0
  let ueberschrittenAm: string | null = null
  let ueberschrittenBeiBuchungId: string | null = null
  for (const b of einnahmenJahr(jahr)) {
    kumuliert += nettoDerBuchung(b)
    if (kumuliert > PARAGRAPH19_LAUFENDES_JAHR_GRENZE_CENT && ueberschrittenAm === null) {
      ueberschrittenAm = b.datum
      ueberschrittenBeiBuchungId = b.id
    }
  }
  const laufendesJahrUmsatzCent = kumuliert
  const vorjahrUeberschritten = vorjahrUmsatzCent > PARAGRAPH19_VORJAHR_GRENZE_CENT
  const anteilLaufendesJahr = laufendesJahrUmsatzCent / PARAGRAPH19_LAUFENDES_JAHR_GRENZE_CENT

  const ampel: Paragraph19Ampel =
    ueberschrittenAm !== null || vorjahrUeberschritten
      ? "ueberschritten"
      : anteilLaufendesJahr >= 0.95
        ? "kritisch"
        : anteilLaufendesJahr >= 0.8
          ? "achtung"
          : "ruhig"

  return {
    vorjahr: jahr - 1,
    vorjahrUmsatzCent,
    vorjahrUeberschritten,
    laufendesJahr: jahr,
    laufendesJahrUmsatzCent,
    anteilLaufendesJahr,
    abstandLaufendesJahrCent: PARAGRAPH19_LAUFENDES_JAHR_GRENZE_CENT - laufendesJahrUmsatzCent,
    ampel,
    ueberschrittenAm,
    ueberschrittenBeiBuchungId,
  }
}

export type Paragraph19Projektion = {
  projektionCent: number
  zieleCent: number
  sichtbar: boolean
}

/**
 * Vorausschauende Projektion (Phase 4, Säulen-Durchlauf): echter laufender
 * Jahresumsatz (status.laufendesJahrUmsatzCent, rechtlich verbindlich) PLUS
 * offene Beratungs-Ziele mit Frist im laufenden Jahr (lib/finanz/ziele.ts,
 * offeneBeratungsZieleCent() — dort bereits ohne Platzhalter gefiltert).
 * Rein additiv: ändert NIE status selbst, beeinflusst keine § 19-Aktion.
 */
export function paragraph19Projektion(status: Paragraph19Status, offeneBeratungsZieleCent: number): Paragraph19Projektion {
  return {
    projektionCent: status.laufendesJahrUmsatzCent + offeneBeratungsZieleCent,
    zieleCent: offeneBeratungsZieleCent,
    sichtbar: offeneBeratungsZieleCent > 0,
  }
}
