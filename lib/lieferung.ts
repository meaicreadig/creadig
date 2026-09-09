/**
 * G19 · LIEFERUNG & ABNAHME — eine Lieferung ohne Abnahme ist keine.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE REGELN STEHEN SCHON — AUF DER OEFFENTLICHEN SEITE
 *
 * Dieses Gate erfindet keinen Prozess. Was ein Projekt schuldet, verspricht
 * das Haus laengst, und zwar woertlich:
 *
 *   `dictionary.de.faq` — „Das System und alle Daten darin gehoeren Ihnen,
 *   vom ersten Tag an. … Danach bleibt alles bei Ihnen: CODE, INHALTE,
 *   ZUGAENGE UND DOMAIN — wir haendigen aus, was wir haben."
 *
 *   `dictionary.de.packages` — „Fester Livetermin: VIER WOCHEN AB
 *   MATERIALEINGANG. 50 % bei Start, 50 % BEI IHRER FREIGABE."
 *
 * Vier Stuecke bei der Uebergabe. Eine Frist, die am Materialeingang
 * beginnt. Und eine Zahlung, die an der Abnahme haengt.
 *
 * Nichts davon war gebaut. Es gab keine Tabelle, kein Projekt, keine
 * Abnahme — die Zusagen standen auf der Seite und wirkten nirgends. Genau
 * die Bauart, die dieses Haus in G13, G15, G16 und G17 gefunden hat: ein
 * Versprechen ohne Durchsetzung.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DREI SAETZE, DIE DIESES GATE TRAEGT
 *
 * 1 · DER UMFANG KOMMT AUS DEM ANGEBOT, NICHT AUS EINEM FELD.
 *
 *     Ein Projekt ohne angenommenes Angebot gibt es nicht, und sein Umfang
 *     wird nicht abgetippt. Wer ihn abtippt, hat in vier Wochen zwei
 *     Umfaenge, und der Kunde hat den anderen.
 *
 * 2 · DER LIVETERMIN WIRD GERECHNET, NICHT EINGETRAGEN.
 *
 *     „Vier Wochen ab Materialeingang" ist eine oeffentliche Zusage. Ein
 *     eingetragenes Datum daneben waere eine zweite Wahrheit gegen sie —
 *     und die eingetragene gewinnt immer die falsche. Ohne
 *     Materialeingang gibt es KEINEN Termin, nicht „in vier Wochen".
 *
 * 3 · EINE AENDERUNG OHNE JA AENDERT NICHTS.
 *
 *     Das Angebot traegt seine Abgrenzung im Abschnitt 03, damit die
 *     Nachforderung gar nicht erst entsteht. Wirkt eine Aenderung schon,
 *     bevor jemand ihr zugestimmt hat, war die Abgrenzung umsonst — dann
 *     ist der Umfang wieder das, was zuletzt jemand gesagt hat.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE BELEG-SCHLEIFE ZURUECK NACH G13
 *
 * Die Roadmap sagt: „hier beginnt die Beleg-Schleife nach G13". Sie ist der
 * Grund, warum NV SWISS, maqam und Bir Damla Hayir heute nirgends stehen —
 * es gibt keine schriftliche Freigabe.
 *
 * Der Moment, in dem man sie bekommt, ist die Abnahme: Der Kunde hat gerade
 * bestaetigt, dass es funktioniert. Danach wird es nur schwerer.
 *
 * Dieses Modul MERKT diesen Moment an und erzeugt ihn nicht: `belegMoment()`
 * sagt, dass jetzt gefragt werden kann. Eine Freigabe entsteht weiterhin
 * ausschliesslich in `lib/proof.ts`, aus einem Dokument, das ein Mensch
 * unterschrieben hat. Ein System, das aus einer Abnahme eine Freigabe
 * ableitet, hat eine Zustimmung erfunden.
 */

import type { Annahme } from "@/lib/angebot"
import { annahmeTraegt } from "@/lib/angebot"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE VIER STUECKE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was uebergeben wird — WOERTLICH aus dem oeffentlichen Versprechen.
 *
 * Die Reihenfolge ist die des FAQ-Satzes. Wer hier ein fuenftes Stueck
 * ergaenzt, ohne es auf der Seite zu versprechen, baut eine Pflicht, die
 * niemand kennt; wer eines streicht, bricht eine Zusage. `check-lieferung`
 * haelt beide Seiten gegeneinander.
 */
export const UEBERGABE_STUECKE = [
  {
    key: "code",
    label: "Code",
    was: "Das Repository oder das Archiv — vollstaendig, nicht als Auszug.",
  },
  {
    key: "inhalte",
    label: "Inhalte",
    was: "Texte, Bilder, Dokumente, in bearbeitbarer Form.",
  },
  {
    key: "zugaenge",
    /*
     * MIT UMLAUT, UND ZWAR ABSICHTLICH.
     *
     * Der Probelauf hat hier „Zugaenge" gefunden und „Zugänge" verlangt —
     * so steht es im FAQ-Satz. Das sieht nach Kosmetik aus und ist keine:
     * Diese Liste ist die WOERTLICHE Uebernahme eines oeffentlichen
     * Versprechens, und die Pruefung haelt beide Fassungen gegeneinander.
     * Waere sie nachsichtig mit der Schreibweise, waere sie es beim
     * naechsten Mal auch mit einem Stueck, das jemand still umbenannt hat.
     */
    label: "Zugänge",
    was: "Konten und Rechte, uebertragen — nicht Zugangsdaten in einer Nachricht.",
  },
  {
    key: "domain",
    label: "Domain",
    was: "Auf den Kunden umgeschrieben, mit Nachweis beim Registrar.",
  },
] as const

export type UebergabeKey = (typeof UEBERGABE_STUECKE)[number]["key"]

export type UebergabeEintrag = {
  am: string
  /** Wie es uebergeben wurde — der Weg, nicht das Gefuehl. */
  wie: string
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE FRIST
 * ═══════════════════════════════════════════════════════════════════════════ */

/** „Vier Wochen ab Materialeingang" — die oeffentliche Zusage, in Tagen. */
export const FRIST_TAGE = 28

/**
 * Der Livetermin. Gerechnet, nie eingetragen.
 *
 * `null` heisst NICHT „steht noch nicht fest", sondern „das Material ist
 * nicht da". Der Unterschied ist der ganze Punkt: Die Frist beginnt am
 * Materialeingang, und solange der fehlt, laeuft sie nicht. Ein Projekt,
 * das ohne Material einen Termin traegt, hat eine Zusage gegeben, die
 * niemand halten muss.
 */
export function livetermin(materialEingang: string | null): string | null {
  if (!materialEingang || !/^\d{4}-\d{2}-\d{2}$/.test(materialEingang)) return null
  const d = new Date(`${materialEingang}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  d.setUTCDate(d.getUTCDate() + FRIST_TAGE)
  return d.toISOString().slice(0, 10)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE AENDERUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Worauf eine Aenderung wirkt. Beides ist der Normalfall, nicht die Ausnahme. */
export const AENDERUNG_WIRKT = ["umfang", "zeit", "beides"] as const
export type AenderungWirkung = (typeof AENDERUNG_WIRKT)[number]

export type Aenderung = {
  id: string
  was: string
  /** Wer sie verlangt hat — Kunde oder Haus. Beides kommt vor. */
  verlangtVon: string
  wirkung: AenderungWirkung
  /**
   * Wie viele Tage sie kostet. `0` ist eine Aussage („kostet keine Zeit"),
   * `null` heisst „noch nicht beziffert" — und dann ist sie nicht zustimmbar.
   */
  tage: number | null
  /**
   * Die Zustimmung. Dieselben vier Angaben wie bei einer Annahme (G17) und
   * einer Freigabe (G13): Person, Rolle, Form, Datum, Fundstelle.
   *
   * `null` heisst: Es ist ein Wunsch, keine Aenderung.
   */
  zugestimmt: Annahme | null
}

/** Eine Aenderung wirkt erst, wenn ihr jemand zugestimmt hat. */
export function wirktBereits(a: Aenderung): boolean {
  return annahmeTraegt(a.zugestimmt) && a.tage !== null
}

/**
 * Der Termin nach allen ZUGESTIMMTEN Aenderungen.
 *
 * Ein Wunsch verschiebt nichts. Genau deshalb rechnet diese Funktion nicht
 * ueber alle Aenderungen, sondern nur ueber die, die ein Mensch bestaetigt
 * hat — sonst waere die Abgrenzung aus Angebotsabschnitt 03 wieder
 * wirkungslos.
 */
export function terminMitAenderungen(
  materialEingang: string | null,
  aenderungen: readonly Aenderung[],
): string | null {
  const basis = livetermin(materialEingang)
  if (!basis) return null
  const tage = aenderungen
    .filter((a) => wirktBereits(a) && a.wirkung !== "umfang")
    .reduce((n, a) => n + (a.tage ?? 0), 0)
  if (tage === 0) return basis
  const d = new Date(`${basis}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + tage)
  return d.toISOString().slice(0, 10)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DAS PROJEKT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const PROJEKT_ZUSTAENDE = {
  aufgesetzt: {
    label: "Aufgesetzt",
    was: "Das Ja steht, das Projekt existiert. Das Material fehlt noch.",
    verlangt: "ein angenommenes Angebot.",
  },
  laeuft: {
    label: "Laeuft",
    was: "Das Material ist da, die Frist laeuft.",
    verlangt: "einen Materialeingang — ohne ihn laeuft keine Frist.",
  },
  abgenommen: {
    label: "Abgenommen",
    was: "Der Kunde hat bestaetigt, dass es funktioniert.",
    verlangt: "eine Abnahme mit Person, Form, Datum und Fundstelle.",
  },
  uebergeben: {
    label: "Uebergeben",
    was: "Code, Inhalte, Zugaenge und Domain sind beim Kunden.",
    verlangt: "die Abnahme und alle vier Stuecke aus dem oeffentlichen Versprechen.",
  },
} as const

export type ProjektZustand = keyof typeof PROJEKT_ZUSTAENDE

export type Projekt = {
  id: string
  opportunityId: string
  /** Das angenommene Angebot. Ohne es gibt es kein Projekt. */
  offerId: string
  materialEingang: string | null
  aenderungen: Aenderung[]
  abnahme: Annahme | null
  uebergabe: Partial<Record<UebergabeKey, UebergabeEintrag>>
  zustand: ProjektZustand
  erstelltAm: string
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · DIE PRUEFUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Mangel = { bereich: string; satz: string }

/**
 * Was einem Projekt fehlt, um in diesen Zustand zu gehen.
 *
 * Reine Rechnung, kein Speicher — dieselbe Funktion fuer Oberflaeche, Gate
 * und Probelauf.
 */
export function fehltFuerZustand(projekt: Projekt, ziel: ProjektZustand): Mangel[] {
  const fehlt: Mangel[] = []

  if (!projekt.offerId?.trim()) {
    fehlt.push({
      bereich: "Grundlage",
      satz:
        "Kein angenommenes Angebot. Ein Projekt ohne Ja ist eine Absichtserklaerung, " +
        "und sein Umfang waere das, was zuletzt jemand gesagt hat.",
    })
  }

  if (ziel === "aufgesetzt") return fehlt

  if (!projekt.materialEingang) {
    fehlt.push({
      bereich: "Material",
      satz:
        "Kein Materialeingang. Die oeffentliche Zusage lautet: vier Wochen ab Materialeingang. " +
        "Ohne ihn laeuft keine Frist, und ein Termin waere erfunden.",
    })
  }

  /* Eine Aenderung, die nicht beziffert ist, kann niemand zustimmen. */
  for (const a of projekt.aenderungen) {
    if (a.zugestimmt && a.tage === null) {
      fehlt.push({
        bereich: "Aenderung",
        satz: `„${a.was}" ist zugestimmt, aber nicht beziffert. Eine Zustimmung zu einer unbekannten Zahl ist keine.`,
      })
    }
  }

  if (ziel === "laeuft") return fehlt

  if (!annahmeTraegt(projekt.abnahme)) {
    fehlt.push({
      bereich: "Abnahme",
      satz:
        "Keine belastbare Abnahme. Eine Lieferung ohne Abnahme ist keine — und ein Haken ohne " +
        "Person, Form, Datum und Fundstelle ist keine Abnahme.",
    })
  }

  if (ziel === "abgenommen") return fehlt

  for (const stueck of UEBERGABE_STUECKE) {
    const e = projekt.uebergabe[stueck.key]
    if (!e || !e.am?.trim() || (e.wie?.trim().length ?? 0) < 4) {
      fehlt.push({
        bereich: "Uebergabe",
        satz: `${stueck.label} fehlt oder ist ohne Weg festgehalten. ${stueck.was}`,
      })
    }
  }

  return fehlt
}

export function darfInZustand(projekt: Projekt, ziel: ProjektZustand): boolean {
  return fehltFuerZustand(projekt, ziel).length === 0
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6 · DIE BELEG-SCHLEIFE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ist jetzt der Moment, in dem man nach einer Freigabe fragen kann?
 *
 * Ja, sobald die Abnahme steht: Der Kunde hat gerade bestaetigt, dass es
 * funktioniert. Danach wird es nur schwerer.
 *
 * Diese Funktion ERZEUGT nichts. Sie sagt nur, dass gefragt werden kann —
 * die Freigabe selbst entsteht ausschliesslich in `lib/proof.ts`, aus einem
 * Dokument, das ein Mensch unterschrieben hat. Ein System, das aus einer
 * Abnahme eine Freigabe ableitet, hat eine Zustimmung erfunden; und genau
 * das ist der Fehler, gegen den Gate 13 gebaut wurde.
 */
export function belegMoment(projekt: Projekt): boolean {
  return annahmeTraegt(projekt.abnahme)
}

export const BELEG_FRAGE =
  "Die Abnahme steht. Das ist der Moment fuer die Frage nach der schriftlichen Freigabe " +
  "(Nennung, Logo, Fallstudie, Zahl, Zitat) — spaeter wird sie nur schwerer. " +
  "Eintragen laesst sie sich ausschliesslich als `releases`-Eintrag am Werk (Gate 13); " +
  "aus einer Abnahme folgt KEINE Freigabe."
