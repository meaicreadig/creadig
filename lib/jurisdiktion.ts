/**
 * G35 · DACH-FAEHIGKEIT — Jurisdiktion, Waehrung, Recht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER VERTRAG NENNT DEN ZUSTAND RICHTIG
 *
 *     „CASSAMEA ist CH, meAI ist DE & CH. Die Internationalisierung ist kein
 *      Fernziel, SIE IST HALB DA."
 *
 * Genau das ist das Problem. Halb da heisst: Die Seite spricht von DACH, ein
 * Produkt ist ausdruecklich fuer Schweizer Anforderungen gebaut, zwei Kunden
 * sitzen in der Schweiz — und gleichzeitig steht im Hypothesen-Register:
 *
 *     „Rechnungs- und Rechtslage fuer CH ist ungeklaert (G35).
 *      VERKAUFEN KOENNTEN WIR HEUTE NICHT SAUBER."
 *
 * Beides steht nebeneinander, und nichts haelt sie zusammen. Ein Verkauf in
 * die Schweiz waere heute moeglich, ohne dass irgendetwas widerspricht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DIESES MODUL TUT — UND WAS ES NIEMALS TUN WIRD
 *
 * Es ERKLAERT keine Rechtslage. Umsatzsteuer, Reverse Charge, anwendbares
 * Recht, Gerichtsstand: Das sind Tatsachen, die ein Steuerberater und ein
 * Anwalt feststellen, nicht ein Modul. Grundregel 1 dieses Hauses steht dem
 * ausdruecklich entgegen, und `offers.md` fuehrt Rechtsberatung auf der
 * Verbotsliste.
 *
 * Es haelt fest, WAS ERKLAERT IST und was nicht — und es sagt Nein, solange
 * nichts erklaert ist. Dieselbe Bauart wie in G16 (die Datenschutzerklaerung
 * ist der Schluessel) und G18 (der Steuerstatus ist es).
 *
 * Der Unterschied zwischen „wir liefern nicht in die Schweiz" und „wir haben
 * die Schweiz nie geklaert" ist der ganze Punkt: Das eine ist eine
 * Entscheidung, das andere eine Luecke. Heute steht die Luecke da, und sie
 * sagt es auch.
 */

import { steuerlage } from "@/lib/rechnung"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE MAERKTE
 * ═══════════════════════════════════════════════════════════════════════════ */

export const MAERKTE = ["DE", "AT", "CH"] as const
export type Markt = (typeof MAERKTE)[number]

/**
 * Was fuer einen Markt geklaert sein muss, bevor dorthin verkauft wird.
 *
 * Vier Punkte, und keiner davon ist eine Programmierfrage:
 *
 *   `steuer`   Wie wird abgerechnet? (Umsatzsteuer, Reverse Charge, …)
 *   `waehrung` In welcher Waehrung? Ein Preis in der falschen ist kein Preis.
 *   `recht`    Welches Recht gilt, welcher Gerichtsstand?
 *   `lieferung` Duerfen wir dort ueberhaupt leisten?
 */
export const PUNKTE = ["steuer", "waehrung", "recht", "lieferung"] as const
export type Punkt = (typeof PUNKTE)[number]

export type Klaerung = {
  /**
   * Was gilt — in einem Satz. `null` heisst UNGEKLAERT, und das ist etwas
   * anderes als „gilt nicht".
   */
  gilt: string | null
  /** Wer es festgestellt hat. Ein Mensch mit Fach, kein Modul. */
  festgestelltVon: string | null
  /** Wann. */
  am: string | null
  /** Wo es nachzulesen ist. */
  fundstelle: string | null
}

export type Marktlage = {
  markt: Markt
  waehrung: "EUR" | "CHF"
  klaerungen: Record<Punkt, Klaerung>
}

const OFFEN: Klaerung = { gilt: null, festgestelltVon: null, am: null, fundstelle: null }

/**
 * DER BESTAND — Deutschland teilweise, die Schweiz gar nicht.
 *
 * Fuer DE ist die Steuerfrage dieselbe wie in G18 und wird von dort gelesen,
 * nicht hier zweitgefuehrt. Alles andere ist offen, und zwar ehrlich offen:
 * Ein `gilt`-Satz, den niemand festgestellt hat, waere erfundene
 * Rechtsauskunft.
 */
export const MARKTLAGEN: readonly Marktlage[] = [
  {
    markt: "DE",
    waehrung: "EUR",
    klaerungen: {
      /* Kommt aus G18. Steht dort auf „offen", steht es hier auch. */
      steuer: OFFEN,
      waehrung: {
        gilt: "EUR. Alle veroeffentlichten Preise sind in Euro, netto.",
        festgestelltVon: "Owner",
        am: "2026-08-22",
        fundstelle: "lib/site-data.ts, packages/retainer",
      },
      recht: OFFEN,
      lieferung: {
        gilt: "Sitz und Haupttaetigkeit. Hier wird geliefert.",
        festgestelltVon: "Owner",
        am: "2026-08-22",
        fundstelle: "Impressum, Sitz Osnabrueck",
      },
    },
  },
  { markt: "AT", waehrung: "EUR", klaerungen: { steuer: OFFEN, waehrung: OFFEN, recht: OFFEN, lieferung: OFFEN } },
  { markt: "CH", waehrung: "CHF", klaerungen: { steuer: OFFEN, waehrung: OFFEN, recht: OFFEN, lieferung: OFFEN } },
]

export function lageZu(markt: string): Marktlage | null {
  return MARKTLAGEN.find((m) => m.markt === markt) ?? null
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · OB EINE KLAERUNG EINE IST
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Dieselben vier Angaben wie bei jeder anderen belastbaren Aussage in
 * diesem Haus: was, wer, wann, wo nachzulesen. Ein `gilt`-Satz ohne die
 * anderen drei ist eine Meinung ueber Recht — und die ist gefaehrlicher als
 * gar keine.
 */
export function klaerungTraegt(k: Klaerung): boolean {
  if (!k.gilt?.trim()) return false
  if (!k.festgestelltVon?.trim()) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(k.am ?? "")) return false
  return (k.fundstelle?.trim().length ?? 0) >= 8
}

export type Luecke = { markt: Markt; punkt: Punkt; satz: string }

const WARUM: Record<Punkt, string> = {
  steuer: "Ohne geklaerte Abrechnung kann niemand eine Rechnung stellen, die traegt.",
  waehrung: "Ein Preis in der falschen Waehrung ist kein Preis, sondern eine Verhandlung.",
  recht: "Ohne anwendbares Recht und Gerichtsstand steht im Streitfall nichts fest.",
  lieferung: "Ob dort ueberhaupt geleistet werden darf, entscheidet nicht der Wunsch.",
}

export function luecken(markt: Markt): Luecke[] {
  const lage = lageZu(markt)
  if (!lage) return [{ markt, punkt: "recht", satz: `Der Markt „${markt}" ist nicht gefuehrt.` }]

  const raus: Luecke[] = []
  for (const punkt of PUNKTE) {
    /*
     * Die Steuerfrage wird NICHT zweitgefuehrt. Sie steht in G18, und wenn
     * sie dort offen ist, ist sie hier offen — zwei Fassungen derselben
     * Rechtsfrage waeren in vier Wochen zwei verschiedene.
     */
    if (punkt === "steuer" && markt === "DE") {
      if (steuerlage().art === "offen") {
        raus.push({ markt, punkt, satz: `${WARUM.steuer} Der Status ist offen (G18).` })
      }
      continue
    }
    if (!klaerungTraegt(lage.klaerungen[punkt])) {
      raus.push({ markt, punkt, satz: WARUM[punkt] })
    }
  }
  return raus
}

/**
 * Darf in diesen Markt verkauft werden?
 *
 * Nein, solange etwas offen ist — und der Grund nennt WAS. Das ist die
 * Fortsetzung der Verkaufsschwelle aus G25 auf die Landkarte: Dort waren es
 * sechs Bedingungen fuer ein Produkt, hier sind es vier fuer einen Markt.
 */
export function darfVerkaufenIn(markt: string): { ja: boolean; grund: string } {
  const m = MAERKTE.find((x) => x === markt)
  if (!m) return { ja: false, grund: `„${markt}" ist kein gefuehrter Markt.` }
  const l = luecken(m)
  if (l.length === 0) return { ja: true, grund: `${m} ist geklaert.` }
  return {
    ja: false,
    grund:
      `${m} ist nicht geklaert: ${l.map((x) => x.punkt).join(", ")}. ` +
      "Das ist eine Luecke, keine Entscheidung — und der Unterschied ist der ganze Punkt.",
  }
}

/** Die geklaerten Maerkte. Heute keiner. */
export function geklaerteMaerkte(): Markt[] {
  return MAERKTE.filter((m) => luecken(m).length === 0)
}

/**
 * Der Satz, der die Lage beschreibt — und der bewusst nicht „wir liefern
 * nicht in die Schweiz" lautet.
 */
export const HALB_DA =
  "Die Internationalisierung ist halb da: Ein Produkt ist fuer Schweizer Anforderungen gebaut, " +
  "zwei Kunden sitzen dort, und die Seite nennt DACH als Markt. Geklaert ist keiner der drei " +
  "Maerkte. Das ist eine Luecke, keine Entscheidung."
