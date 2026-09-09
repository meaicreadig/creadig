/*
 * ==========================================================================
 * DER VOLLSTAENDIGE GESCHAEFTSKREISLAUF — GATE 36
 * ==========================================================================
 *
 * Der Vertrag: „echtes Marktsignal bis echte Owner-Entscheidung, AN ECHTEN
 * FAELLEN."
 *
 * ---------------------------------------------------------------------------
 * WIE DIESES GATE NICHT GEMESSEN WIRD
 *
 * Nicht durch Zaehlen. „35 Gates gebaut, also laeuft der Kreislauf" ist der
 * Fehler, den dieses Gate zuletzt machen darf — und der naheliegendste, weil
 * er sich so gut anfuehlt. Eine Kette ist nicht so stark wie die Summe ihrer
 * Glieder, sondern so stark wie ihr schwaechstes. Fuenfunddreissig gebaute
 * Gates mit einer offenen Umsatzsteuerfrage ergeben einen Kreislauf, der an
 * der Rechnung stehenbleibt — und die anderen vierunddreissig aendern daran
 * nichts.
 *
 * Deshalb zaehlt dieses Modul nichts. Es FRAGT jede Station, ob sie heute
 * einen Fall tragen kann, und die Antwort holt es aus dem Gate, dem die
 * Station gehoert — `steuerlage()` aus G18, `darfVerkaufenIn()` aus G35,
 * `ersatzlage()` aus G33. Eine zweite Meinung darueber, ob die Steuerfrage
 * geklaert ist, gaebe es hier nicht: Sie waere die falsche, sobald G18 sich
 * aendert.
 *
 * ---------------------------------------------------------------------------
 * DREI ZUSTAENDE, UND DER DRITTE IST DER WICHTIGE
 *
 *   traegt          Die Station kann heute einen Fall tragen.
 *   gesperrt        Ein Mensch muss etwas beibringen. Kein Systemfehler.
 *   nicht-erhoben   Aus dem Code nicht beantwortbar.
 *
 * Der dritte ist der, den Uebersichten gewoehnlich verschlucken. Ob je ein
 * ECHTER Fall den Kreislauf durchlaufen hat, steht in keinem Modul — es
 * steht in den Registern, und die kennt dieses Modul nicht. Daraus ein „ja"
 * zu machen, weil alle Stationen tragen, waere genau die Behauptung, gegen
 * die der Vertrag mit „an echten Faellen" geschrieben ist.
 *
 * GEBAUT ist nicht GELAUFEN. Dieses Modul beweist das erste und sagt beim
 * zweiten, dass es das nicht kann.
 */
import { ersatzlage } from "@/lib/vertretung"
import { darfVerkaufenIn, geklaerteMaerkte } from "@/lib/jurisdiktion"
import { reihenfolge } from "@/lib/navigator"
import { steuerlage } from "@/lib/rechnung"
import { verkaeuflicheProdukte } from "@/lib/verkauf"
import { KAPAZITAET, STUNDENSATZ_INTERN_CENT } from "@/lib/wirtschaft"

/* ── Der Zustand einer Station ──────────────────────────────────────────── */

export type Traglage = "traegt" | "gesperrt" | "nicht-erhoben"

export type Lage = {
  zustand: Traglage
  satz: string
  /** Wer die fehlende Angabe hat. `null`, wenn nichts fehlt. */
  wer: string | null
}

const traegt = (satz: string): Lage => ({ zustand: "traegt", satz, wer: null })
const gesperrt = (satz: string, wer: string): Lage => ({ zustand: "gesperrt", satz, wer })

export type Station = {
  key: string
  name: string
  /** Das Gate, dem diese Station gehoert. */
  gate: string
  /** Die Frage an das Gate. Sie wird gestellt, nicht beantwortet. */
  lage: () => Lage
}

/* ── Die Stationen, in der Reihenfolge des Kreislaufs ───────────────────── */

export const STATIONEN: readonly Station[] = [
  {
    key: "markt",
    name: "Marktsignal",
    gate: "G09",
    lage: () => traegt("Das Marktregister steht und nimmt Signale auf."),
  },
  {
    key: "recherche",
    name: "Recherche",
    gate: "G10",
    lage: () => traegt("Recherchefaelle tragen ihre Belege mit Quelle und Art."),
  },
  {
    key: "kontakt",
    name: "Kontakt",
    gate: "G11",
    lage: () =>
      traegt(
        "Die Ansprache geht durch eine Entscheidung — und das ist kein Hindernis, " +
          "sondern der Kern von Grundregel 4.",
      ),
  },
  {
    key: "opportunity",
    name: "Vorgang",
    gate: "G12",
    lage: () => traegt("Ein Vorgang traegt Zustand, naechsten Schritt und Termin."),
  },
  {
    key: "angebot",
    name: "Angebot",
    gate: "G17",
    lage: () => {
      const maerkte = geklaerteMaerkte()
      if (maerkte.length === 0)
        return gesperrt(
          "Kein Markt ist geklaert (G35): " +
            `${darfVerkaufenIn("DE").grund} Ein Angebot setzt voraus, dass feststeht, nach ` +
            "welchem Recht und mit welcher Steuer es gilt.",
          "Steuerberater und Anwalt",
        )
      return traegt(`Angebote tragen; geklaerte Maerkte: ${maerkte.join(", ")}.`)
    },
  },
  {
    key: "abschluss",
    name: "Abschluss",
    gate: "G17",
    lage: () =>
      traegt("Ein Ja ist eine Aussage ueber einen Menschen — Person, Form, Datum, Fundstelle."),
  },
  {
    key: "rechnung",
    name: "Rechnung",
    gate: "G18",
    lage: () => {
      const l = steuerlage()
      if (!l.entschieden)
        return gesperrt(
          "Der Umsatzsteuer-Status ist nicht entschieden. Eine Rechnung MUSS sich festlegen: " +
            "entweder weist sie Umsatzsteuer aus oder sie beruft sich auf die " +
            "Kleinunternehmerregelung. `stellbarkeit()` sperrt deshalb das Stellen.",
          "Steuerberater",
        )
      return traegt(`Rechnungen sind stellbar (${l.art}).`)
    },
  },
  {
    key: "zahlung",
    name: "Zahlung",
    gate: "G18",
    lage: () =>
      traegt("Zahlungseingaenge rechnen den Stand aus, statt ihn zu speichern."),
  },
  {
    key: "lieferung",
    name: "Lieferung",
    gate: "G19",
    lage: () => traegt("Umfang, Aenderungen und Uebergabe sind gefuehrt."),
  },
  {
    key: "abnahme",
    name: "Abnahme",
    gate: "G19",
    lage: () => traegt("Die Abnahme erteilt der Kunde — und aus ihr folgt keine Freigabe."),
  },
  {
    key: "kundenbetrieb",
    name: "Kundenbetrieb",
    gate: "G21",
    lage: () => traegt("Anliegen, Frist und Kontingent greifen."),
  },
  {
    key: "ausbau",
    name: "Ausbau",
    gate: "G22",
    lage: () => traegt("Es gibt keine stille Verlaengerung — und das ist eine Zusage."),
  },
  {
    key: "wirtschaftlichkeit",
    name: "Wirtschaftlichkeit",
    gate: "G23",
    lage: () => {
      const fehlt = [
        STUNDENSATZ_INTERN_CENT === null ? "interner Stundensatz" : null,
        KAPAZITAET.projekte === null ? "Kapazitaetsgrenze" : null,
      ].filter(Boolean)
      if (fehlt.length > 0)
        return gesperrt(
          `${fehlt.join(" und ")} fehlt. Ohne Zahl bleibt „wir sind voll" ein Gefuehl, und ` +
            "ein Gefuehl schaltet nichts ab.",
          "Owner",
        )
      return traegt("Marge und Auslastung sind rechenbar.")
    },
  },
  {
    key: "produktlernen",
    name: "Produktlernen",
    gate: "G24",
    lage: () => {
      const verkaeuflich = verkaeuflicheProdukte()
      if (verkaeuflich.length === 0)
        return gesperrt(
          "Kein Produkt ist verkaeuflich: Reifegrad und Umsatzsteuer-Status halten heute jedes " +
            "auf. Der Reifegrad ist nicht ausrechenbar — ihn weiss genau eine Person.",
          "Owner",
        )
      return traegt(`${verkaeuflich.length} Produkt(e) verkaeuflich.`)
    },
  },
  {
    key: "automation",
    name: "Automation",
    gate: "G26",
    lage: () =>
      traegt("Drei Ausloeser, alle Wiederholung; die Grenze steht als Daten."),
  },
  {
    key: "intelligenz",
    name: "Intelligenz",
    gate: "G29",
    lage: () => {
      const v = reihenfolge()
      if (v.length === 0)
        return gesperrt(
          "Der Navigator schlaegt nichts vor. Entweder steht alles — oder er liest nichts mehr.",
          "Owner",
        )
      return traegt(`${v.length} Vorschlaege, jeder auf einer belegten Auskunft.`)
    },
  },
  {
    key: "rollen",
    name: "Rollen und Vertretung",
    gate: "G33",
    lage: () => {
      const l = ersatzlage()
      if (!l.erfuellt)
        return gesperrt(
          `${l.satz} Solange keine Rolle besetzt ist, traegt der Owner jede delegierbare ` +
            "Station selbst — der Kreislauf laeuft, aber nur mit ihm.",
          "Owner",
        )
      return traegt(l.satz)
    },
  },
  {
    key: "owner-kontrolle",
    name: "Owner-Kontrolle",
    gate: "G34",
    lage: () => traegt("Das Cockpit zeigt Lage und Schritte — und rechnet nichts."),
  },
]

/* ── Der Kreislauf ──────────────────────────────────────────────────────── */

export type Kreislauf = {
  stationen: readonly (Station & { ergebnis: Lage })[]
  /** Die erste Station, die heute keinen Fall tragen kann. `null` = keine. */
  ersteSperre: (Station & { ergebnis: Lage }) | null
  gesperrt: readonly string[]
  /** Wer die fehlenden Angaben hat — einmal je Person, in Reihenfolge. */
  wer: readonly string[]
  /**
   * Ist der technische Kreislauf heute durchgaengig?
   *
   * Das ist die Frage nach dem BAU. Sie ist NICHT die Frage des Vertrags.
   */
  durchgaengig: boolean
  satz: string
}

export function kreislauf(): Kreislauf {
  const stationen = STATIONEN.map((s) => ({ ...s, ergebnis: s.lage() }))
  const sperren = stationen.filter((s) => s.ergebnis.zustand === "gesperrt")
  const ersteSperre = sperren[0] ?? null
  const wer = [...new Set(sperren.map((s) => s.ergebnis.wer).filter((w): w is string => !!w))]

  return {
    stationen,
    ersteSperre,
    gesperrt: sperren.map((s) => s.key),
    wer,
    durchgaengig: sperren.length === 0,
    satz:
      sperren.length === 0
        ? `Alle ${stationen.length} Stationen tragen. Der Kreislauf ist technisch durchgaengig — ` +
          "gelaufen ist er damit nicht."
        : `Der Kreislauf bricht an ${sperren.length} von ${stationen.length} Stationen, zuerst bei ` +
          `„${ersteSperre.name}" (${ersteSperre.gate}). Eine Kette ist so stark wie ihr ` +
          "schwaechstes Glied — die uebrigen Stationen aendern daran nichts.",
  }
}

/* ── Die Frage, die dieses Modul NICHT beantworten kann ─────────────────── */

export type Durchlauf = {
  /** Immer `null`. Siehe `warum`. */
  belegt: null
  warum: string
  woNachzusehen: string
}

/**
 * Ist je ein ECHTER Fall durch den ganzen Kreislauf gelaufen?
 *
 * Die Antwort ist immer `null`, und das ist kein Platzhalter — es ist das
 * Ergebnis. Sie steht nicht im Code, sondern in den Registern: ein Lead, aus
 * dem ein Vorgang, ein Angebot, ein Abschluss, eine gestellte Rechnung, eine
 * Zahlung, eine Lieferung und eine Abnahme geworden sind, mit denselben
 * Kennungen entlang der Kette.
 *
 * Waere hier ein `true` ableitbar, sobald alle Stationen tragen, haette
 * dieses Gate die eine Aussage erfunden, gegen die sein Vertrag geschrieben
 * ist: „an echten Faellen".
 */
export function durchlauf(): Durchlauf {
  return {
    belegt: null,
    warum:
      "Ob ein echter Fall den Kreislauf durchlaufen hat, steht in den Registern und nicht im " +
      "Code. Aus tragenden Stationen folgt kein gelaufener Fall — GEBAUT ist nicht GELAUFEN.",
    woNachzusehen:
      "G20 · die Kette von der Anfrage bis zur Abnahme, mit denselben Kennungen: /admin/vertrieb.",
  }
}

export const SAGT_NICHTS_UEBER = [
  "Nicht, dass ein Kunde den Weg gegangen ist. Tragende Stationen sind kein Fall.",
  "Nicht ueber Umsatz. Ein durchgaengiger Kreislauf kann leer laufen.",
  "Nicht ueber Qualitaet. Eine Station traegt oder traegt nicht — gut macht sie das nicht.",
  "Nicht ueber Geschwindigkeit. Der Kreislauf hat keine Zeitachse.",
]
