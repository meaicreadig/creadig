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

import {
  NIEMALS_AUTOMATISCH,
  WIRKUNGEN,
  HANDLUNGEN,
  handlungFuer,
  istEreignis,
  type Ereignis,
  type Wirkung,
} from "@/lib/ereignis"
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
  /**
   * Die Handlung — WOERTLICH aus `HANDLUNGEN` (G26), nie vom Aufrufer.
   *
   * Bis zum 09.09.2026 stand hier der Satz, den der Aufrufer mitgab. Damit
   * konnte die Spur etwas anderes behaupten als geschehen war: Ein Agent
   * reichte intern weiter und schrieb „Das Angebot per Mail rausschicken"
   * ins Protokoll. Eine Pruefspur, deren Inhalt der Geprüfte bestimmt, ist
   * keine — und Nachvollziehbarkeit ist die einzige Begruendung, aus der
   * dieses Gate ueberhaupt Handlungen zulaesst.
   */
  was: string
  /** Der konkrete Zusatz des Aufrufers. Beschreibt den Fall, nie die Handlung. */
  dazu: string | null
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
export function spurTraegt(s: Spur | null): boolean {
  /* `handeln()` gibt bei jedem Nein `spur: null` zurueck — der haeufigste
     Aufruf ist deshalb `spurTraegt(h.spur)`, und der darf nicht werfen.
     Keine Spur ist keine tragende Spur; das ist dieselbe Antwort. */
  if (!s) return false
  if (!s.agent?.trim() || !istRolle(s.imNamenVon)) return false
  if (!(WIRKUNGEN as readonly string[]).includes(s.wirkung)) return false
  /* Der Handlungssatz muss einer aus dem Katalog sein — nicht irgendeiner. */
  const vorgesehen = HANDLUNGEN.find((h) => h.was === s.was)
  if (!vorgesehen || vorgesehen.wirkung !== s.wirkung) return false
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
 *   1 Ist die Handlung ueberhaupt eine der vorgesehenen (G26 `HANDLUNGEN`)?
 *   2 Passt die genannte Wirkung zu dieser Handlung?
 *   3 Beschreibt die Spur etwas, das nie automatisch geschehen darf?
 *   4 Traegt die Vollmacht (gueltig, nicht abgelaufen, nicht widerrufen)?
 *   5 Deckt sie dieses Ereignis?
 *   6 Deckt sie diese Wirkung?
 *   7 Entsteht eine vollstaendige Spur?
 *
 * DIE ERSTE FRAGE IST AM 09.09.2026 DAZUGEKOMMEN, UND SIE HAT DIE RICHTUNG
 * GEDREHT.
 *
 * Vorher stand hier nur die Verbotsliste, und geprueft wurde der frei
 * gewaehlte Satz `was`. Das hielt gegen die drei kuratierten Ausloeser und
 * gegen niemanden sonst: „ein Angebot senden" war verboten, „Das Angebot per
 * Mail rausschicken" ging durch. Eine Grenze, die man durch Umformulieren
 * verschiebt, ist keine.
 *
 * Jetzt muss der Aufrufer eine Handlung BENENNEN, die es gibt. Unbekannt
 * heisst nein — nicht „nicht verboten".
 *
 * Die Verbotsliste bleibt trotzdem stehen (Frage 3). Sie prueft nicht mehr,
 * ob gehandelt werden darf, sondern ob die Spur ehrlich beschriftet ist: Wer
 * „chronik-notieren" nennt und „eine Rechnung stellen" dazuschreibt, bekommt
 * ein Nein statt eines irrefuehrenden Protokolleintrags.
 *
 * Was nie automatisch geschehen darf, darf auch kein beauftragter Agent tun.
 * Eine Vollmacht erweitert die Grenze nicht — sie liegt innerhalb.
 */
export function handeln(input: {
  vollmacht: Vollmacht
  ereignis: string
  wirkung: string
  /** Der Schluessel einer Handlung aus `HANDLUNGEN` (G26). Unbekannt heisst nein. */
  handlung: string
  /**
   * Der konkrete Zusatz zum Fall — welche Frist, welches Stueck.
   *
   * Er beschreibt NICHT die Handlung; die steht im Katalog. Er landet in der
   * Spur als `dazu` und entscheidet nichts.
   */
  dazu?: string
  an: string
  wann?: string
  heute?: Date
}): Handlung {
  const heute = input.heute ?? new Date()

  const vorgesehen = handlungFuer(input.handlung)
  if (!vorgesehen) {
    return {
      erlaubt: false,
      grund:
        `„${input.handlung}" ist keine vorgesehene Handlung. Erlaubt ist, was in HANDLUNGEN ` +
        "steht (G26) — unbekannt heisst nein, nicht „nicht verboten\". Wer etwas anderes " +
        "braucht, braucht keinen Agenten, sondern einen Menschen.",
      spur: null,
    }
  }

  if (vorgesehen.wirkung !== input.wirkung) {
    return {
      erlaubt: false,
      grund:
        `Die Handlung „${vorgesehen.key}" hat die Wirkung „${vorgesehen.wirkung}", genannt wurde ` +
        `„${input.wirkung}". Eine Spur, die eine andere Wirkung behauptet als die Handlung hat, ` +
        "ist eine falsche Spur.",
      spur: null,
    }
  }

  /*
   * Der zweite Guertel, jetzt auf dem Zusatz.
   *
   * Die Handlung selbst kann nichts Verbotenes mehr sein — sie kommt aus dem
   * Katalog. Was der Aufrufer noch faerben koennte, ist der Zusatz, und ein
   * Zusatz, der eine verbotene Handlung beschreibt, ist entweder eine
   * falsche Beschriftung oder eine Absicht. Beides ist ein Nein.
   */
  const verboten = NIEMALS_AUTOMATISCH.find((n) =>
    (input.dazu ?? "").toLowerCase().includes(n.was.toLowerCase()),
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
    was: vorgesehen.was,
    dazu: input.dazu?.trim() ? input.dazu.trim() : null,
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
