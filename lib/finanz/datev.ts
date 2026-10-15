import "server-only"

/**
 * DATEV-Buchungsstapel (Format "EXTF", Kategorie 21), SKR03. Eine einfache,
 * bankjournal-artige Verbuchung (Ist-Versteuerung, cash-basis): jede Buchung
 * bewegt das Bankkonto (1200) gegen ein Erlös-/Aufwandskonto — passend zur
 * Zufluss-/Abflussrechnung der EÜR (lib/finanz/euer.ts), nicht zur vollen
 * doppelten Buchführung mit Debitoren/Kreditoren.
 *
 * KEINE STEUERBERATUNG. Die Kontierung ist ein Vorschlag:
 *   - Erlöskonten (8400/8300/8200) nach Umsatzsteuersatz sind SKR03-Standard
 *     und in jedem Kontenrahmen gleich — darauf verlässt sich dieser Export.
 *   - ALLE Aufwandskategorien laufen bewusst auf ein Sammelkonto (4800,
 *     "Sonstige betriebliche Aufwendungen") statt auf eine selbst erfundene
 *     Kategorie-zu-Spezialkonto-Zuordnung, die im Einzelfall falsch wäre.
 *     Die Finanz-Kategorie steht im Buchungstext — der Steuerberater sortiert
 *     in DATEV per Textsuche in Minuten um, statt eine falsche Kontierung
 *     stillschweigend zu übernehmen.
 */

export type DatevBuchung = {
  datum: string
  bruttoCent: number
  ustSatz: number
  art: "einnahme" | "ausgabe"
  kategorie: string
  gegenpartei: string | null
  belegnummer: string | null
}

const BANK_KONTO = "1200"
const PRIVATENTNAHME_KONTO = "1800"
const SAMMELKONTO_AUSGABE = "4800"
const ERLOESKONTO: Record<number, string> = { 19: "8400", 7: "8300", 0: "8200" }

/** DATEV-Automatikkonten-Schlüssel (SKR03-Standard): 3/2 = USt 19/7 % auf Erlöse, 9/8 = Vorsteuer 19/7 % auf Aufwand. */
function buSchluessel(art: "einnahme" | "ausgabe", ustSatz: number): string {
  if (ustSatz === 19) return art === "einnahme" ? "3" : "9"
  if (ustSatz === 7) return art === "einnahme" ? "2" : "8"
  return ""
}

function csvFeld(s: string): string {
  return `"${s.replace(/"/g, '""')}"`
}

const betragDatev = (cent: number) => (Math.abs(cent) / 100).toFixed(2).replace(".", ",")
const datumDatev = (iso: string) => `${iso.slice(8, 10)}${iso.slice(5, 7)}` // TTMM — das Jahr steht im WJ-Header

/**
 * @param jahr z. B. "2026"
 * @param erstelltAm Zeitstempel fuer die Kopfzeile (Default: jetzt) — als Parameter, damit der Drill deterministisch pruefen kann.
 */
export function erzeugeDatevCsv(buchungen: DatevBuchung[], jahr: string, erstelltAm = new Date()): string {
  const wjBeginn = `${jahr}0101`
  const von = `${jahr}0101`
  const bis = `${jahr}1231`
  const zeitstempel = erstelltAm.toISOString().replace(/[-:T]/g, "").slice(0, 14) + "000"

  const kopf = [
    csvFeld("EXTF"), "700", "21", csvFeld("Buchungsstapel"), "13",
    zeitstempel, "", "", "", "",
    wjBeginn, "4", von, bis,
    csvFeld(`Finanz-Export creaDIG ${jahr}`), "", "1", "0", "0", csvFeld("EUR"),
    "", "", "", "", "", "", "", "",
  ].join(";")

  const spalten = [
    "Umsatz (ohne Soll/Haben-Kz)", "Soll/Haben-Kennzeichen", "WKZ Umsatz", "Kurs", "Basis-Umsatz", "WKZ Basis-Umsatz",
    "Konto", "Gegenkonto (ohne BU-Schlüssel)", "BU-Schlüssel", "Belegdatum", "Belegfeld 1", "Belegfeld 2", "Skonto", "Buchungstext",
  ]
    .map(csvFeld)
    .join(";")

  const zeilen = buchungen.map((b) => {
    const istEinnahme = b.art === "einnahme"
    const gegenkonto = istEinnahme ? (ERLOESKONTO[b.ustSatz] ?? ERLOESKONTO[0]) : b.kategorie === "Privatentnahme" ? PRIVATENTNAHME_KONTO : SAMMELKONTO_AUSGABE
    const text = [b.kategorie, b.gegenpartei].filter(Boolean).join(" · ").slice(0, 60)
    return [
      betragDatev(b.bruttoCent),
      istEinnahme ? "S" : "H",
      "", "", "", "",
      BANK_KONTO,
      gegenkonto,
      buSchluessel(b.art, b.ustSatz),
      datumDatev(b.datum),
      csvFeld((b.belegnummer ?? "").slice(0, 36)),
      "", "",
      csvFeld(text),
    ].join(";")
  })

  return [kopf, spalten, ...zeilen].join("\r\n") + "\r\n"
}
