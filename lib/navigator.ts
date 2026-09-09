/**
 * G29 · VORBEREITUNG & EMPFEHLUNG — Empfehlung mit Beleg, Entscheidung beim
 * Menschen. Hier wohnt der Digitale Betriebsnavigator.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WORAUF ER AUFSETZT — UND WAS ER NICHT NOCH EINMAL BAUT
 *
 * `docs/sales/qualification-canon.md` sagt es selbst:
 *
 *     „Der kuenftige Betriebsnavigator benutzt diese Routen und diese
 *      Treiber. ER ERFINDET KEINE ZWEITE QUALIFIZIERUNG."
 *
 * Dasselbe gilt fuer alles andere: Der Navigator rechnet nichts neu. Er
 * liest das Betriebsgedaechtnis (G28) und macht aus einer LAGE einen
 * VORSCHLAG. Die Lage gehoert G28, die Entscheidung gehoert einem Menschen,
 * und dazwischen liegt genau dieses Modul.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DREI REGELN
 *
 * 1 · KEINE EMPFEHLUNG OHNE BELEG. Jeder Vorschlag traegt die Auskunft, aus
 *     der er stammt, und damit deren Fundstellen. Ein Vorschlag ohne Beleg
 *     waere ein Bauchgefuehl mit Systemstimme — und dem widerspricht
 *     niemand, weil es aussieht wie eine Auswertung.
 *
 * 2 · NICHT ERHOBEN HEISST MESSEN, NICHT REPARIEREN. Das ist die schaerfste
 *     Regel hier, und sie kommt direkt aus G28: Wo eine Lage `null` ist,
 *     darf der Vorschlag nur lauten „erheben". Wer aus einem Unbekannten
 *     eine Reparatur ableitet, behebt etwas, das niemand gemessen hat — und
 *     haelt danach das Ergebnis fuer bestaetigt.
 *
 * 3 · DER NAVIGATOR HANDELT NICHT. Er gibt Vorschlaege zurueck. Kein
 *     Schreibzugriff, kein Speicher, kein Versand, keine Statusaenderung.
 *     „Wiederholung automatisieren, nicht Verantwortung" steht als Regel bei
 *     G26 — hier gilt sie schon.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM EIN VORSCHLAG EINE HANDLUNG NENNEN MUSS
 *
 * „Die Freigaben stehen aus" ist keine Empfehlung, sondern eine Wiederholung
 * der Lage. Ein Vorschlag, den niemand TUN kann, kostet Aufmerksamkeit und
 * erzeugt nichts. Deshalb traegt jeder eine Handlung, einen Adressaten und
 * — wo es sie gibt — die Stelle, an der sie geschieht.
 */

import { kontext, type Auskunft } from "@/lib/gedaechtnis"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE FORM EINES VORSCHLAGS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Woraufhin ein Vorschlag entsteht.
 *
 * `messen` und `beheben` sind bewusst getrennt und nicht zwei Grade
 * derselben Sache: Das eine folgt aus einem Unbekannten, das andere aus
 * einem Befund. Wer sie zusammenlegt, verliert genau die Unterscheidung,
 * fuer die G28 gebaut wurde.
 */
export const ANLASS_ARTEN = ["messen", "beheben"] as const
export type AnlassArt = (typeof ANLASS_ARTEN)[number]

export type Vorschlag = {
  key: string
  art: AnlassArt
  /** Was zu tun ist — eine Handlung, kein Zustand. */
  handlung: string
  /** Wer sie tun kann. */
  wer: "owner" | "haus"
  /** Warum — der Satz aus der Lage, nicht eine neue Behauptung. */
  weil: string
  /** Die Auskunft, aus der er stammt. Traegt ihre eigenen Fundstellen. */
  quelle: Auskunft
}

/** Ein Vorschlag ohne Beleg, Handlung oder Adressat ist keiner. */
export function vorschlagTraegt(v: Vorschlag): boolean {
  if (!(ANLASS_ARTEN as readonly string[]).includes(v.art)) return false
  if ((v.handlung?.trim().length ?? 0) < 12) return false
  if (!v.weil?.trim()) return false
  if (!v.quelle || v.quelle.belege.length === 0) return false
  /*
   * Eine Handlung ist ein Verb. „Freigaben stehen aus" ist ein Zustand und
   * wiederholt nur die Lage — davon wird niemand taetig.
   */
  return !/^(die|der|das|es)\s/i.test(v.handlung.trim())
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE ABLEITUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was zu einer Auskunft zu tun waere.
 *
 * Die Zuordnung steht hier und nicht in G28 — das Gedaechtnis soll nicht
 * mitentscheiden. Und sie ist absichtlich mager: Zu jeder Lage gehoert
 * genau EINE Handlung. Zwei Vorschlaege zu derselben Lage heissen, dass die
 * Lage nicht scharf genug ist.
 */
const HANDLUNGEN: Record<string, { handlung: string; wer: "owner" | "haus" }> = {
  freigaben: {
    handlung: "Je Kundenarbeit eine schriftliche Freigabe einholen und als `releases`-Eintrag hinterlegen.",
    wer: "owner",
  },
  inhalte: {
    handlung: "Je leerem Fach einen Beitrag aus dem eigenen Betrieb schreiben und gegenlesen lassen.",
    wer: "owner",
  },
  attribution: {
    handlung: "Einen Satz zur Herkunft der Anfrage in die Datenschutzerklaerung aufnehmen — oder es bewusst lassen.",
    wer: "owner",
  },
  produktstand: {
    handlung: "Je Produkt den Reifegrad bestaetigen: Stufe, wer bestaetigt, woran man es sieht.",
    wer: "owner",
  },
  verkaeuflich: {
    handlung: "Reifegrad und Umsatzsteuer-Status klaeren — beides haelt heute jedes Produkt auf.",
    wer: "owner",
  },
  rollen: {
    handlung: "Einen Wert fuer eine eingeschraenkte Rollen-Variable setzen, damit ein zweiter Mensch arbeiten kann.",
    wer: "owner",
  },
  wirtschaftlichkeit: {
    handlung: "Aufwand je Projekt erfassen und den internen Stundensatz hinterlegen.",
    wer: "owner",
  },
  sichtschuld: {
    handlung: "Zeilen ohne Eigentuemer zuordnen oder streichen.",
    wer: "haus",
  },
  verlustwissen: {
    handlung: "Verlorene Vorgaenge mit einem Grund aus dem Verzeichnis versehen.",
    wer: "haus",
  },
  betriebszusage: {
    handlung: "Anliegen mit Art und Eingangszeitpunkt erfassen, damit Frist und Kontingent greifen.",
    wer: "haus",
  },
}

/**
 * Die Vorschlaege zur aktuellen Lage.
 *
 * `steht === true` erzeugt NICHTS. Das ist wichtiger, als es aussieht: Ein
 * Navigator, der auch zu Erledigtem etwas sagt, fuellt den Blick mit
 * Bestaetigung — und die naechste echte Meldung geht darin unter.
 */
export function vorschlaege(lagen: readonly Auskunft[] = kontext()): Vorschlag[] {
  const raus: Vorschlag[] = []
  for (const a of lagen) {
    if (a.steht === true) continue
    const h = HANDLUNGEN[a.key]
    if (!h) continue
    const v: Vorschlag = {
      key: a.key,
      /*
       * HIER LIEGT DIE REGEL AUS G28.
       *
       * `null` heisst nicht erhoben — dann kann der Vorschlag nur „messen"
       * sein. Aus einem Unbekannten eine Reparatur abzuleiten hiesse,
       * etwas zu beheben, das niemand gemessen hat, und danach das
       * Ergebnis fuer bestaetigt zu halten.
       */
      art: a.steht === null ? "messen" : "beheben",
      handlung: h.handlung,
      wer: h.wer,
      weil: a.antwort,
      quelle: a,
    }
    if (vorschlagTraegt(v)) raus.push(v)
  }
  return raus
}

/** Was gemessen werden muss, bevor man ueberhaupt etwas beheben kann. */
export function zuMessen(lagen?: readonly Auskunft[]): Vorschlag[] {
  return vorschlaege(lagen).filter((v) => v.art === "messen")
}

/** Was behoben werden kann, weil die Lage bekannt ist. */
export function zuBeheben(lagen?: readonly Auskunft[]): Vorschlag[] {
  return vorschlaege(lagen).filter((v) => v.art === "beheben")
}

/**
 * Die Reihenfolge — und warum sie nicht nach Dringlichkeit geht.
 *
 * Erst messen, dann beheben. Nicht weil Messen wichtiger waere, sondern
 * weil eine Reparatur an einer ungemessenen Stelle die Messung fuer immer
 * unmoeglich macht: Danach weiss niemand mehr, wie es vorher war.
 *
 * Innerhalb der beiden Gruppen wird NICHT sortiert. Eine Rangfolge waere
 * eine Entscheidung, und die gehoert dem Menschen.
 */
export function reihenfolge(lagen?: readonly Auskunft[]): Vorschlag[] {
  return [...zuMessen(lagen), ...zuBeheben(lagen)]
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · WAS DER NAVIGATOR NICHT TUT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Diese Konstante steht hier, damit die Entscheidung nachlesbar ist und das
 * Gate sie pruefen kann.
 *
 * Der Navigator hat keinen Schreibzugriff, keinen Speicher, keinen Versand
 * und keine Statusaenderung. Er gibt Vorschlaege zurueck; was daraus wird,
 * entscheidet ein Mensch.
 *
 * „Wiederholung automatisieren, NICHT Verantwortung" steht als Regel bei
 * G26. Hier gilt sie schon — und zwar bevor es eine Automation gibt, die
 * sie brechen koennte.
 */
export const NAVIGATOR_HANDELT_NICHT =
  "Der Navigator schlaegt vor und fuehrt nicht aus. Kein Schreibzugriff, kein Versand, " +
  "keine Statusaenderung. Die Entscheidung gehoert einem Menschen — und eine Empfehlung, " +
  "die sich selbst ausfuehrt, ist keine Empfehlung, sondern eine Anweisung ohne Absender."
