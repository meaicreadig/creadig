import { istKeinUmsatz, nettoCent, plusMonate, ustCent, type Buchung, type Einstellungen, type Frist } from "@/lib/finanz/rechnen"

/**
 * Umsatzsteuer-Voranmeldung — das Rechenwerk hinter der Frist.
 *
 * Ist-Versteuerung (wie überall in Finanz): gezählt wird, was im Zeitraum
 * gebucht (zu-/abgeflossen) ist. Rein und ohne Datenbank — `buchungen` kommt
 * von `ladeAlles`, `heute` wird hereingereicht.
 *
 * KEINE STEUERBERATUNG und KEIN ELSTER: Diese Datei liefert die Zahlen in der
 * Reihenfolge des Formulars zum Abtippen. Was sie nicht erkennt, steht als
 * Hinweis dabei (0 %-Umsätze ohne Einordnung, § 13b, innergemeinschaftliche
 * Erwerbe) — die Zuordnung zu den Kennzahlen 41/43/45/46/47/48 entscheidet
 * der Steuerberater.
 */

export type UstVaZeitraum = { von: string; bis: string; titel: string }

export type UstVa = {
  zeitraum: UstVaZeitraum
  /** Kz 81 — steuerpflichtige Umsätze 19 %: Bemessungsgrundlage, volle Euro (ELSTER verlangt sie so), abgerundet. */
  kz81Cent: number
  /** Kz 86 — 7 %. */
  kz86Cent: number
  /** Umsatzsteuer lt. Buchführung (cent-genau). ELSTER rechnet sie aus den abgerundeten Kz 81/86 selbst — kleine Abweichung möglich. */
  ust19Cent: number
  ust7Cent: number
  /** Kz 66 — abziehbare Vorsteuer aus Rechnungen anderer Unternehmer. */
  kz66Cent: number
  /** Kz 83 — verbleibende Vorauszahlung (positiv = zahlen, negativ = Erstattung). */
  kz83Cent: number
  /** Einnahmen ohne USt (0 %) — gehören je nach Art in Kz 41/43/45/48 und sind NICHT automatisch zugeordnet. */
  ohneUstCent: number
  anzahl: { umsaetze: number; vorsteuer: number }
  hinweise: string[]
}

/** Zeitraum einer USt-Frist: aus `periodeEnde` und dem Rhythmus der Einstellungen. */
export function zeitraumFuerFrist(f: Pick<Frist, "titel" | "periodeEnde" | "art">, rhythmus: Einstellungen["ustRhythmus"]): UstVaZeitraum | null {
  if (f.art !== "ust" || !f.periodeEnde) return null
  const bis = f.periodeEnde
  const naechsterTag = plusMonate(`${bis.slice(0, 7)}-01`, 1)
  const von = rhythmus === "monatlich" ? `${bis.slice(0, 7)}-01` : plusMonate(naechsterTag, -3)
  return { von, bis, titel: f.titel }
}

const euroAbgerundet = (cent: number) => Math.floor(cent / 100) * 100

export function berechneUstVa(buchungen: Buchung[], zeitraum: UstVaZeitraum): UstVa {
  const imZeitraum = buchungen.filter(
    (b) => !b.storniert && b.status === "gebucht" && !b.ohneGeldfluss && b.datum >= zeitraum.von && b.datum <= zeitraum.bis,
  )
  let netto19 = 0
  let netto7 = 0
  let ust19 = 0
  let ust7 = 0
  let vorsteuer = 0
  let ohneUst = 0
  let umsaetze = 0
  let vorsteuerAnzahl = 0

  for (const b of imZeitraum) {
    if (b.art === "einnahme") {
      if (istKeinUmsatz(b.kategorie)) continue
      if (b.ustSatz === 19) {
        netto19 += nettoCent(b, true)
        ust19 += ustCent(b, true)
        umsaetze++
      } else if (b.ustSatz === 7) {
        netto7 += nettoCent(b, true)
        ust7 += ustCent(b, true)
        umsaetze++
      } else {
        ohneUst += b.bruttoCent
      }
    } else if (b.ustSatz > 0 && !b.archiviert && b.kategorie !== "Privatentnahme") {
      /* Archivierte Belege (z. B. Tank bei km-Pauschale) sind abgegolten — kein Vorsteuerabzug. */
      vorsteuer += ustCent(b, true)
      vorsteuerAnzahl++
    }
  }

  const hinweise: string[] = []
  if (ohneUst > 0) hinweise.push("Einnahmen ohne USt (0 %) sind nicht automatisch einer Kennzahl zugeordnet (z. B. Kz 41 Ausland, Kz 48 steuerfrei). Mit dem Steuerberater klären.")
  hinweise.push("Reverse-Charge-Leistungen (§ 13b) und innergemeinschaftliche Erwerbe erkennt die Buchführung nicht — sie gehören in Kz 46/47/52 bzw. 89/93 und müssen von Hand ergänzt werden, falls es sie gibt.")
  if (imZeitraum.length === 0) hinweise.push("Im Zeitraum sind keine gebuchten Bewegungen. Zahllast = 0 — nur eintragen, wenn das stimmt.")

  return {
    zeitraum,
    kz81Cent: euroAbgerundet(netto19),
    kz86Cent: euroAbgerundet(netto7),
    ust19Cent: ust19,
    ust7Cent: ust7,
    kz66Cent: vorsteuer,
    kz83Cent: ust19 + ust7 - vorsteuer,
    ohneUstCent: ohneUst,
    anzahl: { umsaetze, vorsteuer: vorsteuerAnzahl },
    hinweise,
  }
}
