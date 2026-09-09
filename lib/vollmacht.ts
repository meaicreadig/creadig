/**
 * G30 · HANDELNDE AGENTEN UNTER REGELN — begrenzte Vollmacht, Rechte,
 * Uebersteuerung, Pruefspur.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI STUFEN, UND WARUM SIE DREI GATES SIND
 *
 * Die Roadmap sagt den Grund in einer Zeile:
 *
 *     „Drei Gates, weil die Vollmacht sich RADIKAL unterscheidet:
 *      lesen ≠ vorschlagen ≠ handeln."
 *
 *   G28  liest     — Betriebsgedaechtnis, Belegpflicht, kein Speicher
 *   G29  schlaegt vor — Navigator, Entscheidung beim Menschen
 *   G30  handelt   — und genau deshalb steht hier eine Vollmacht
 *
 * Wer die drei zusammenlegt, bekommt ein System, das liest, daraus
 * schliesst und danach handelt — ohne dass irgendwo ein Mensch dazwischen
 * war. Das ist nicht mehr Automation, das ist Stellvertretung.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * VIER EIGENSCHAFTEN, DIE EINE VOLLMACHT ERST ZU EINER MACHEN
 *
 * 1 · SIE IST KLEINER ALS DIE ROLLE, DIE SIE ERTEILT. Ein Agent kann nie
 *     mehr als der Mensch, der ihn beauftragt hat. Das ist keine Hoeflichkeit
 *     — es ist die einzige Art, wie Verantwortung zurechenbar bleibt: Wer
 *     mehr kann als sein Auftraggeber, handelt fuer niemanden.
 *
 * 2 · SIE ENDET. Eine Vollmacht ohne Ablauf ist keine begrenzte Vollmacht,
 *     sondern eine dauerhafte. Und die verlaengert sich durch Vergessen.
 *
 * 3 · SIE IST SOFORT WIDERRUFBAR. Wie ein Widerruf in Gate 13: Er wirkt
 *     JETZT, nicht zum naechsten Lauf.
 *
 * 4 · SIE HINTERLAESST EINE SPUR. Eine Handlung ohne Pruefspur ist nicht
 *     nachvollziehbar, und was niemand nachvollziehen kann, kann niemand
 *     verantworten. Deshalb ist die Spur kein Protokoll NEBEN der Handlung,
 *     sondern ihre Bedingung.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ES HEUTE GIBT
 *
 * Nichts. `AGENTEN` ist leer, und kein Agent handelt.
 *
 * Das ist derselbe ehrliche Zustand wie bei den Rollen (G32): Das System
 * kann es, eingerichtet ist es nicht. Ein Agent, den niemand beauftragt
 * hat, waere eine Vollmacht, die sich selbst erteilt.
 */

import { NIEMALS_AUTOMATISCH, WIRKUNGEN, istEreignis, type Ereignis, type Wirkung } from "@/lib/ereignis"
import { FLAECHEN, ROLLEN, istRolle, type Rolle } from "@/lib/rollen"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE VOLLMACHT
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Vollmacht = {
  agent: string
  /**
   * Die Rolle, in deren Namen gehandelt wird. Der Agent kann NIE mehr als
   * sie — das ist die Bedingung fuer Zurechenbarkeit.
   */
  imNamenVon: Rolle
  /** Wer sie erteilt hat. Ein Mensch, kein System. */
  erteiltVon: string
  erteiltAm: string
  /** Wann sie endet. Pflicht — ohne Ende ist sie nicht begrenzt. */
  gueltigBis: string
  /** Worauf er reagieren darf. Leer heisst: auf nichts. */
  ereignisse: Ereignis[]
  /** Was er tun darf. Immer eine Teilmenge der vier Wirkungen aus G26. */
  wirkungen: Wirkung[]
  /** Sofort wirksam, wie ein Widerruf in G13. */
  widerrufenAm?: string
}

/**
 * DER BESTAND — leer, und das ist die wahre Angabe.
 *
 * Kein Agent handelt. Das System kann es; beauftragt hat niemand.
 */
export const AGENTEN: readonly Vollmacht[] = []

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · OB SIE UEBERHAUPT EINE IST
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Mangel = { feld: string; satz: string }

/** Wie lange eine Vollmacht hoechstens laufen darf. */
export const VOLLMACHT_MAX_TAGE = 90

export function fehltAnVollmacht(v: Vollmacht, heute = new Date()): Mangel[] {
  const m: Mangel[] = []

  if (!v.agent?.trim()) m.push({ feld: "Agent", satz: "Ohne Namen ist nicht zurechenbar, wer gehandelt hat." })
  if (!istRolle(v.imNamenVon)) {
    m.push({ feld: "Rolle", satz: "Keine gueltige Rolle. Ein Agent handelt im Namen eines Menschen, nicht fuer sich." })
  }
  if (!v.erteiltVon?.trim()) {
    m.push({ feld: "Erteilt von", satz: "Niemand hat sie erteilt. Eine Vollmacht, die sich selbst erteilt, ist keine." })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.erteiltAm ?? "")) {
    m.push({ feld: "Erteilt am", satz: "Kein Datum." })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.gueltigBis ?? "")) {
    m.push({
      feld: "Gueltig bis",
      satz: "Kein Ende. Eine Vollmacht ohne Ablauf ist keine begrenzte — und sie verlaengert sich durch Vergessen.",
    })
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(v.erteiltAm ?? "")) {
    const tage =
      (new Date(`${v.gueltigBis}T00:00:00Z`).getTime() - new Date(`${v.erteiltAm}T00:00:00Z`).getTime()) /
      86_400_000
    if (tage > VOLLMACHT_MAX_TAGE) {
      m.push({
        feld: "Gueltig bis",
        satz: `${Math.round(tage)} Tage — hoechstens ${VOLLMACHT_MAX_TAGE}. Wer laenger braucht, erteilt sie neu und sieht dabei hin.`,
      })
    }
    if (tage <= 0) m.push({ feld: "Gueltig bis", satz: "Endet vor dem Beginn." })
  }

  if (v.ereignisse.length === 0) {
    m.push({ feld: "Ereignisse", satz: "Auf nichts. Eine Vollmacht ohne Anlass ist ein Freibrief oder ein Irrtum." })
  }
  for (const e of v.ereignisse) {
    if (!istEreignis(e)) m.push({ feld: "Ereignisse", satz: `„${e}" gibt es nicht (G26).` })
  }
  if (v.wirkungen.length === 0) {
    m.push({ feld: "Wirkungen", satz: "Darf nichts. Dann braucht es auch keine Vollmacht." })
  }
  for (const w of v.wirkungen) {
    if (!(WIRKUNGEN as readonly string[]).includes(w)) {
      m.push({ feld: "Wirkungen", satz: `„${w}" ist keine der vier Wirkungen aus G26.` })
    }
  }

  /*
   * DIE WICHTIGSTE PRUEFUNG: kleiner als die Rolle.
   *
   * Ein Agent im Namen der Redaktion darf nichts, was die Redaktion nicht
   * darf. Gepruefte Groesse ist hier die Zahl der Flaechen — eine Rolle
   * ohne Flaechen kann keine Vollmacht tragen, weil sie selbst nichts sieht.
   */
  if (istRolle(v.imNamenVon)) {
    const flaechen = FLAECHEN.filter((f) => f.fuer.includes(v.imNamenVon)).length
    if (flaechen === 0) {
      m.push({
        feld: "Rolle",
        satz: `Die Rolle „${ROLLEN[v.imNamenVon].label}" sieht selbst nichts. Ein Agent kann nie mehr als sie.`,
      })
    }
  }

  if (abgelaufen(v, heute)) {
    m.push({ feld: "Gueltig bis", satz: `Abgelaufen am ${v.gueltigBis}.` })
  }
  if (v.widerrufenAm) {
    m.push({ feld: "Widerruf", satz: `Am ${v.widerrufenAm} widerrufen — sofort, nicht zum naechsten Lauf.` })
  }

  return m
}

export function abgelaufen(v: Vollmacht, heute = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.gueltigBis ?? "")) return false
  return heute.toISOString().slice(0, 10) > v.gueltigBis
}

export function gueltig(v: Vollmacht, heute = new Date()): boolean {
  return fehltAnVollmacht(v, heute).length === 0
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE PRUEFSPUR
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Spur = {
  /** Wer gehandelt hat. */
  agent: string
  /** In wessen Namen. */
  imNamenVon: Rolle
  /** Was geschehen ist. */
  wirkung: Wirkung
  was: string
  /** Woraufhin — das Ereignis, das es ausgeloest hat (G26). */
  wegen: Ereignis
  /** Woran — der Gegenstand. */
  an: string
  wann: string
}

/**
 * Eine Handlung ohne Spur gibt es nicht.
 *
 * Die Spur ist nicht ein Protokoll NEBEN der Handlung, sondern ihre
 * Bedingung: `handeln()` gibt ohne vollstaendige Spur nichts zurueck. Was
 * niemand nachvollziehen kann, kann niemand verantworten.
 */
export function spurTraegt(s: Spur): boolean {
  if (!s.agent?.trim() || !istRolle(s.imNamenVon)) return false
  if (!(WIRKUNGEN as readonly string[]).includes(s.wirkung)) return false
  if ((s.was?.trim().length ?? 0) < 8) return false
  if (!istEreignis(s.wegen)) return false
  if (!s.an?.trim()) return false
  return !Number.isNaN(new Date(s.wann).getTime())
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DIE ENTSCHEIDUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Handlung = { erlaubt: boolean; grund: string; spur: Spur | null }

/**
 * Darf dieser Agent das jetzt tun?
 *
 * Die Reihenfolge der Fragen ist Absicht — jede kann allein Nein sagen, und
 * die harten kommen zuerst:
 *
 *   1 Ist die Handlung ueberhaupt automatisierbar (G26-Verbotsliste)?
 *   2 Traegt die Vollmacht (gueltig, nicht abgelaufen, nicht widerrufen)?
 *   3 Deckt sie dieses Ereignis?
 *   4 Deckt sie diese Wirkung?
 *   5 Entsteht eine vollstaendige Spur?
 *
 * Frage 1 steht vorn, weil sie unabhaengig von jeder Vollmacht gilt: Was
 * nie automatisch geschehen darf, darf auch kein beauftragter Agent tun.
 * Eine Vollmacht erweitert die Grenze nicht — sie liegt innerhalb.
 */
export function handeln(input: {
  vollmacht: Vollmacht
  ereignis: string
  wirkung: string
  was: string
  an: string
  wann?: string
  heute?: Date
}): Handlung {
  const heute = input.heute ?? new Date()

  const verboten = NIEMALS_AUTOMATISCH.find((n) =>
    input.was.toLowerCase().includes(n.was.toLowerCase()),
  )
  if (verboten) {
    return {
      erlaubt: false,
      grund: `Das darf nie automatisch geschehen (${verboten.gate}): ${verboten.weil} Eine Vollmacht erweitert die Grenze nicht.`,
      spur: null,
    }
  }

  const maengel = fehltAnVollmacht(input.vollmacht, heute)
  if (maengel.length > 0) {
    return { erlaubt: false, grund: `Die Vollmacht traegt nicht: ${maengel[0].satz}`, spur: null }
  }
  if (!istEreignis(input.ereignis) || !input.vollmacht.ereignisse.includes(input.ereignis)) {
    return { erlaubt: false, grund: `Die Vollmacht deckt „${input.ereignis}" nicht.`, spur: null }
  }
  if (!input.vollmacht.wirkungen.includes(input.wirkung as Wirkung)) {
    return { erlaubt: false, grund: `Die Vollmacht deckt die Wirkung „${input.wirkung}" nicht.`, spur: null }
  }

  const spur: Spur = {
    agent: input.vollmacht.agent,
    imNamenVon: input.vollmacht.imNamenVon,
    wirkung: input.wirkung as Wirkung,
    was: input.was,
    wegen: input.ereignis,
    an: input.an,
    wann: input.wann ?? heute.toISOString(),
  }
  if (!spurTraegt(spur)) {
    return {
      erlaubt: false,
      grund: "Es entstuende keine vollstaendige Pruefspur. Was niemand nachvollziehen kann, kann niemand verantworten.",
      spur: null,
    }
  }
  return { erlaubt: true, grund: "Innerhalb der Vollmacht.", spur }
}

/**
 * Der Widerruf.
 *
 * Er wirkt SOFORT — dieselbe Doktrin wie bei einer Freigabe in Gate 13. Der
 * Eintrag bleibt stehen; man muss erklaeren koennen, warum damals.
 */
export function widerrufen(v: Vollmacht, am: string): Vollmacht {
  return { ...v, widerrufenAm: am }
}

/** Der Satz zur Lage — heute handelt niemand. */
export const KEINE_AGENTEN =
  "Kein Agent handelt. Das System kann es; beauftragt hat niemand. Eine Vollmacht, die sich " +
  "selbst erteilt, waere keine — sie braucht einen Menschen, ein Ende und eine Spur."
