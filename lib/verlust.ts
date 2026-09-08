/**
 * G16 · DIE VERLUST-SCHLEIFE — warum verloren, und was der Markt daraus lernt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ES SCHON GAB — UND WAS FEHLTE
 *
 * `lib/sales-playbook.ts` fuehrt seit Gate 3 sieben Verlustgruende, mit
 * einer Begruendung, die stimmt:
 *
 *     „Fuenfzig verschieden formulierte Absagen ergeben keine Erkenntnis.
 *      Sechs Gruende ergeben eine."
 *
 * Die Liste ist richtig. Sie hatte nur zwei Loecher, und beide sind der
 * Grund, warum aus ihr nie Erkenntnis wurde:
 *
 *   1 · SIE BAND NICHTS. Im Formular steht ein `<input>` mit `<datalist>` —
 *       eine VORSCHLAGSliste. Der Platzhalter sagt es selbst: „Grund waehlen
 *       oder frei formulieren." Wer tippt, tippt, was er will, und in der
 *       Spalte stehen wieder fuenfzig Formulierungen.
 *
 *   2 · SIE FUEHRTE NIRGENDWOHIN. Ein Grund wurde gespeichert und dort
 *       gelesen, wo er entstand — auf der Detailseite des einen Vorgangs.
 *       Zurueck ins Zielbild (G09) reiste er nie. Niemand konnte fragen:
 *       „Wie oft haben wir das schon gehoert, und was heisst das fuer die
 *       Annahme, dass Handwerk unser Kernmarkt ist?"
 *
 * Der Gate-Vertrag von G16 benennt genau das zweite Loch:
 *
 *     „die Verlust-Schleife (warum verloren → Marktwissen zurueck nach G09)"
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIESE DATEI KEINE ACHTE LISTE ANLEGT
 *
 * Der erste Entwurf hat genau das getan: acht eigene Schluessel,
 * sauber benannt, mit Bedeutung und Lehre — und damit eine ZWEITE Wahrheit
 * ueber denselben Sachverhalt. In vier Wochen waere sie eine andere gewesen
 * als die im Playbook, und in den Datenbankzeilen haette die alte gestanden.
 *
 * Die Bezeichnungen hier sind deshalb WOERTLICH die aus `LOST_REASONS`. Das
 * ist kein Stil, sondern Voraussetzung: In `lost_reason` stehen bereits
 * Zeilen mit genau diesen Zeichenketten. Ein neuer Schluessel haette sie
 * alle zu „unbekannt" gemacht — oder, schlimmer, jemand haette sie
 * „zugeordnet" und damit Gruende erfunden, die nie jemand genannt hat.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DIESE DATEI NICHT TUT
 *
 * Sie rechnet keinen Score und sagt nichts vorher. Und sie erklaert einen
 * Verlust nicht fuer bedeutsam, weil er einmal vorkam — dieselbe Regel wie
 * bei `classify()` in G09, die zwei Signale verlangt, weil ein einzelnes
 * fast jeder Betrieb hat.
 */

import { HYPOTHESES, type Hypothesis } from "@/lib/market"
import { LOST_REASONS } from "@/lib/sales-playbook"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · WAS JEDER GRUND LEHRT
 * ═══════════════════════════════════════════════════════════════════════════ */

export type VerlustLehre = {
  /** WOERTLICH der Eintrag aus `LOST_REASONS`. */
  grund: (typeof LOST_REASONS)[number]
  /** Was dieser Grund ueber den Vorgang aussagt. */
  bedeutet: string
  /** Was das Haus daraus lernen kann — und was ausdruecklich nicht. */
  lehrt: string
  /**
   * Welche Annahmen aus G09 dieser Grund beruehrt. Leer heisst: Er sagt
   * ueber das Zielbild nichts. Das ist eine Aussage, keine Luecke.
   */
  beruehrt: readonly string[]
}

export const VERLUST_LEHREN: readonly VerlustLehre[] = [
  {
    grund: "Kein Bedarf",
    bedeutet: "Das Problem, das dieses Haus loest, hat der Betrieb nicht.",
    lehrt:
      "Am meisten ueber das Zielbild — und am unangenehmsten. Haeuft sich das in " +
      "einer Gruppe, ist die Gruppe nicht der Markt, egal wie gut die Annahme klang.",
    beruehrt: ["handwerk", "mehrstandort", "tr-de"],
  },
  {
    grund: "Wirtschaftlich nicht passend",
    bedeutet: "Der Betrieb wollte es und hielt es fuer zu teuer.",
    lehrt:
      "Etwas ueber die Preisleiter, NICHT ueber die Passung. Wer den Preis nennt, " +
      "hat den Nutzen verstanden — sonst haette er den Bedarf verneint.",
    beruehrt: [],
  },
  {
    grund: "Keine Rückmeldung",
    bedeutet: "Der Vorgang ist verstummt. Es gab nie eine Entscheidung.",
    lehrt:
      "Nichts ueber den Markt und viel ueber uns: Ein verstummter Vorgang ist " +
      "meistens ein Nachfassen, das nicht stattgefunden hat (G11).",
    beruehrt: [],
  },
  {
    grund: "Andere Lösung gewählt",
    /*
     * DIESER EINE TRAEGT ZWEI LEHREN, UND DAS BLEIBT SO.
     *
     * „Andere Loesung" heisst entweder „ein Mitbewerber" oder „sie machen es
     * selbst" — und das sind zwei verschiedene Befunde: der eine ueber den
     * Wettbewerb, der andere ueber die Betriebsgroesse. Trennen waere
     * praeziser.
     *
     * Es wird trotzdem nicht getrennt, und zwar aus demselben Grund, aus dem
     * das Playbook bestehende Zeilen nicht umdeutet: In der Spalte stehen
     * schon Zeilen mit genau dieser Bezeichnung, und niemand kann heute
     * sagen, welche der beiden gemeint war. Eine neue Kategorie einzufuehren
     * hiesse, die alten Zeilen entweder zu verlieren oder zu raten.
     *
     * Statt zu raten, sagt die Rueckmeldung es: Haeuft sich dieser Grund,
     * lautet die naechste Frage nicht „was heisst das", sondern „welche der
     * beiden war es" — und die beantwortet ein Mensch an den Vorgaengen.
     */
    bedeutet: "Es wurde etwas anderes gemacht — von jemand anderem oder selbst.",
    lehrt:
      "Zweierlei, und welches, sagt dieser Grund nicht: Wettbewerb (dann zaehlt, " +
      "ob derselbe Name wiederkommt) oder Eigenbau (dann zaehlt die Betriebsgroesse). " +
      "Haeuft er sich, ist die naechste Arbeit, ihn aufzuteilen — an den Vorgaengen, " +
      "nicht an dieser Tabelle.",
    beruehrt: ["handwerk"],
  },
  {
    grund: "Zeitpunkt passt nicht",
    bedeutet: "Das Problem ist da, das Budget oder die Ruhe gerade nicht.",
    lehrt:
      "Nichts ueber das Zielbild — aber es ist KEIN Nein. Ein Vorgang, der hier " +
      "endet, gehoert in die Wiederansprache (G11), nicht in den Papierkorb.",
    beruehrt: [],
  },
  {
    grund: "Nicht passend für creaDIG",
    bedeutet: "Das Haus wollte nicht — Ausschluss, Kapazitaet oder Bauchgefuehl.",
    lehrt:
      "Ob die Ausschlussliste aus G09 stimmt. Steht der Grund nicht dort, ist es " +
      "entweder ein neuer Ausschluss oder eine Entscheidung, die niemand belegen kann.",
    beruehrt: ["handwerk", "naehe", "mehrstandort"],
  },
  {
    grund: "Sonstiges",
    /*
     * DER EINZIGE, DER NICHTS LEHRT — UND DESHALB GEZAEHLT WIRD.
     *
     * „Sonstiges" ist kein Grund, sondern das Eingestaendnis, dass die Liste
     * diesen Fall nicht kennt. Als einzelner Eintrag ist das in Ordnung; als
     * HAEUFUNG ist es der wichtigste Befund ueber die Liste selbst, denn dann
     * fehlt eine Kategorie.
     */
    bedeutet: "Keiner der sechs traf zu.",
    lehrt:
      "Nichts ueber den Markt — aber etwas ueber diese Liste. Haeuft sich diese " +
      "Angabe, fehlt eine Kategorie, und die findet man nur in den Notizen.",
    beruehrt: [],
  },
] as const

export function lehreZu(grund: string | null | undefined): VerlustLehre | null {
  if (!grund) return null
  return VERLUST_LEHREN.find((l) => l.grund === grund) ?? null
}

/** Deckt das Verzeichnis wirklich jeden Grund der Liste ab? */
export function lehrenVollstaendig(): boolean {
  return LOST_REASONS.every((r) => VERLUST_LEHREN.some((l) => l.grund === r))
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE REGEL AM VORGANG
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was einem verlorenen Vorgang fehlt.
 *
 * Freitext ist kein Fehler des Menschen, der ihn getippt hat — es war das
 * Feld, das ihn eingeladen hat. Deshalb meldet diese Funktion ihn als das,
 * was er ist: eine Zeile, die nicht zurueckreisen kann.
 */
export function fehltAmVerlust(grund: string | null): string[] {
  const fehlt: string[] = []
  const g = (grund ?? "").trim()
  if (g.length === 0) {
    fehlt.push("Kein Verlustgrund. Ein Vorgang, der verloren ist, sagt nicht warum.")
    return fehlt
  }
  if (!lehreZu(g)) {
    fehlt.push(
      `Der Grund „${g}" steht nicht im Verzeichnis. Ein Satz reist nicht zurueck ` +
        `ins Zielbild — er laesst sich nicht zaehlen und nicht gegen eine Annahme halten.`,
    )
  }
  return fehlt
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE SCHLEIFE ZURUECK NACH G09
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ab wann eine Haeufung etwas bedeutet.
 *
 * Drei, aus demselben Grund, aus dem `classify()` zwei Signale verlangt und
 * das Hypothesen-Register „drei unabhaengige Mehrstandort-Kunden" fordert:
 * Ein Fall ist ein Zufall, zwei sind eine Beobachtung, drei sind ein Muster.
 * Wer bei einem anfaengt, dreht das Zielbild nach dem letzten Gespraech.
 */
export const MUSTER_AB = 3

export type Rueckmeldung = {
  lehre: VerlustLehre
  anzahl: number
  /** Ab `MUSTER_AB` ein Muster; darunter eine Beobachtung. */
  muster: boolean
  beruehrt: Hypothesis[]
}

export type Schleife = {
  rueckmeldungen: Rueckmeldung[]
  /** Verluste, deren Grund im Verzeichnis nicht vorkommt — Altbestand oder Freitext. */
  ohneVerzeichnis: number
  /** Verluste ganz ohne Grund. */
  ohneGrund: number
}

/**
 * Was die verlorenen Vorgaenge dem Zielbild sagen.
 *
 * Reine Rechnung, keine Abfrage: Sie bekommt die Gruende und gibt zurueck,
 * was daraus folgt. Damit laesst sie sich pruefen, ohne dass eine Datenbank
 * laufen muss — und die Masse und der Waechter rufen dieselbe Funktion.
 *
 * Der Altbestand wird GEZAEHLT und nicht zugeordnet. Einen Grund
 * nachtraeglich zu erfinden ist schlimmer, als keinen zu haben — das steht
 * schon im Playbook, und es gilt hier weiter.
 */
export function marktRueckmeldung(gruende: readonly (string | null)[]): Schleife {
  const zaehler = new Map<string, number>()
  let ohneVerzeichnis = 0
  let ohneGrund = 0

  for (const g of gruende) {
    const wert = (g ?? "").trim()
    if (wert.length === 0) {
      ohneGrund++
      continue
    }
    if (!lehreZu(wert)) {
      ohneVerzeichnis++
      continue
    }
    zaehler.set(wert, (zaehler.get(wert) ?? 0) + 1)
  }

  const rueckmeldungen = [...zaehler.entries()]
    .map(([grund, anzahl]) => {
      const lehre = lehreZu(grund)!
      return {
        lehre,
        anzahl,
        muster: anzahl >= MUSTER_AB,
        beruehrt: HYPOTHESES.filter((h) => lehre.beruehrt.includes(h.key)),
      }
    })
    .sort((a, b) => b.anzahl - a.anzahl)

  return { rueckmeldungen, ohneVerzeichnis, ohneGrund }
}

/**
 * Welche Annahmen aus G09 durch Verluste unter Druck stehen.
 *
 * Nur MUSTER zaehlen. Und nur Annahmen, die noch offen sind: Eine bereits
 * widerlegte noch einmal zu widerlegen bringt nichts, und eine gestuetzte
 * kippt nicht an drei Verlusten — sie bekommt einen Gegenbeleg, den ein
 * Mensch beurteilt. Das Register entscheidet weiterhin ein Mensch; diese
 * Funktion legt ihm nur vor, was er sonst nie gesehen haette.
 */
export function unterDruck(schleife: Schleife): {
  hypothese: Hypothesis
  wegen: { grund: string; anzahl: number }[]
}[] {
  const karte = new Map<string, { hypothese: Hypothesis; wegen: { grund: string; anzahl: number }[] }>()
  for (const r of schleife.rueckmeldungen) {
    if (!r.muster) continue
    for (const h of r.beruehrt) {
      if (h.status === "widerlegt") continue
      if (!karte.has(h.key)) karte.set(h.key, { hypothese: h, wegen: [] })
      karte.get(h.key)!.wegen.push({ grund: r.lehre.grund, anzahl: r.anzahl })
    }
  }
  return [...karte.values()]
}
