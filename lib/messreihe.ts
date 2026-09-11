/*
 * ===========================================================================
 * MESSREIHE — WAS GEZÄHLT WIRD, BEVOR JEMAND ETWAS BEHAUPTET
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1, 11.09.2026.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESES MODUL ÜBERHAUPT EXISTIERT
 *
 * Phase 3 hat für fibero einen Betriebsbeleg veroeffentlicht und dabei eine
 * Zeile ins Register geschrieben, die seither jede Behauptung blockiert:
 *
 *   gemessen: false — bei allen neun Aussagen.
 *
 * Das war richtig. Es gibt keine Aufzeichnung darueber, wie lange dieselben
 * Vorgaenge vor fibero gedauert haben, und ohne Vorher-Messung waere jede
 * Prozentzahl zurueckgerechnet.
 *
 * Die Versuchung an dieser Stelle ist gross und immer dieselbe: sich die
 * Vergangenheit zu schaetzen. „Frueher waren es zwoelf Schritte" klingt
 * plausibel, ist gratis und laesst sich nie widerlegen — genau deshalb ist es
 * die teuerste Zeile, die eine Seite haben kann.
 *
 * Dieses Modul macht den anderen Weg gangbar: AB HEUTE messen, damit in
 * einigen Monaten ein echter Beleg existiert. Es erzeugt heute keinen Beweis.
 * Es erzeugt die Bedingung dafuer.
 *
 * ---------------------------------------------------------------------------
 * DAS VORBILD STEHT SCHON IM HAUS
 *
 * `lib/ownerlast.ts` (Gate 27) misst seit Wochen die Owner-Last: eine Zeile je
 * Messtag, ein Mindestabstand, bevor ein Urteil faellt, und ein ausdrueckliches
 * Feld dafuer, dass eine Messung NICHT stattfinden konnte. Dieses Modul folgt
 * demselben Bauplan, nur fuer beliebige Kennzahlen.
 *
 * Was uebernommen wird:
 *   · Ein Verlauf laesst sich nicht ableiten — er muss gespeichert werden.
 *     Das ist die einzige Ausnahme von der Hausregel „nicht speichern, was
 *     sich ableiten laesst".
 *   · Ein Tag, ein Wert. Zwei Messungen desselben Tages waeren zwei
 *     Wahrheiten ueber denselben Tag.
 *   · Kein gespeicherter Trend, kein gespeichertes Prozent. Das Urteil faellt
 *     aus den Werten und den Regeln hier — und faellt ausdruecklich NICHT,
 *     wenn die Grundlage nicht traegt.
 *
 * ---------------------------------------------------------------------------
 * DIE DREI WEIGERUNGEN
 *
 * Dieses Modul rechnet NICHT, wenn:
 *
 *   1 · nur eine Seite existiert. Ein Ausgangswert allein ist kein
 *       Fortschritt, ein Nachher allein erst recht nicht.
 *   2 · Einheit oder Methode sich unterscheiden. Minuten gegen Vorgaenge,
 *       oder „gezaehlt" gegen „geschaetzt", ergibt eine Zahl ohne Aussage.
 *   3 · der Abstand zu kurz ist oder zu wenige Faelle darin liegen. Zwei
 *       Tage und drei Vorgaenge sind ein Zufall, kein Effekt.
 *
 * In allen drei Faellen ist das Ergebnis kein 0 und kein „unveraendert",
 * sondern `nicht-vergleichbar` mit dem Grund im Klartext.
 */

/* ── Was gemessen wird ──────────────────────────────────────────────────── */

/**
 * Die Art der Kennzahl. Sie entscheidet, wie ein Unterschied zu lesen ist:
 * Bei `aufwand` und `fehler` ist WENIGER besser, bei `menge` sagt eine
 * Veraenderung fuer sich genommen gar nichts — sie ist Kontext.
 */
export type Kennzahlart =
  /** Zeit oder Schritte je Vorgang. Weniger ist besser. */
  | "aufwand"
  /** Korrekturen, Nacharbeit, Fehlbuchungen. Weniger ist besser. */
  | "fehler"
  /**
   * Rueckstand oder Handanteil — ungeprüfte Fakten, manuell erfasste
   * Vorgaenge. Weniger ist besser. Bewusst von `menge` getrennt: Ein
   * fallender Anteil ungepruefter Fakten IST eine Verbesserung, eine
   * fallende Zahl an Auftraegen ist es nicht.
   */
  | "rueckstand"
  /**
   * Durchsatz, Fallzahl, Volumen. Eine Veraenderung sagt fuer sich genommen
   * NICHTS ueber Qualitaet — sie ist Kontext fuer die anderen Kennzahlen.
   */
  | "menge"

/** Woher ein Wert kommt. `geschaetzt` existiert, damit es sichtbar bleibt. */
export type Messquelle =
  /** Aus dem System gezaehlt — eine Abfrage, ein Feld, ein Protokoll. */
  | "system-zaehlung"
  /** Von einem Menschen mitgeschrieben, waehrend er arbeitet. */
  | "handaufschrieb"
  /** Gestoppte Zeit an echten Vorgaengen. */
  | "zeitmessung"
  /**
   * Geschaetzt. Traegt keinen oeffentlichen Beleg — steht hier nur, damit
   * eine Schaetzung als Schaetzung erfasst werden kann statt sich als
   * Zaehlung zu tarnen.
   */
  | "schaetzung"

/** Nur diese Quellen tragen eine oeffentliche Zahl. */
export const BELEGENDE_QUELLEN: readonly Messquelle[] = [
  "system-zaehlung",
  "handaufschrieb",
  "zeitmessung",
]

export function quelleTraegt(q: Messquelle): boolean {
  return BELEGENDE_QUELLEN.includes(q)
}

/**
 * Die Definition einer Kennzahl. Sie steht VOR der ersten Messung fest —
 * sonst waehlt man hinterher die Definition, unter der die Zahl am besten
 * aussieht.
 */
export type Kennzahl = {
  key: string
  /** Das Subjekt, ueber das gemessen wird (Produkt-Slug, Prozessname). */
  subjekt: string
  art: Kennzahlart
  /** Was genau gezaehlt wird — ein Satz, den zwei Personen gleich lesen. */
  definition: string
  einheit: string
  /** Woher der Wert kommen soll. Weicht eine Probe ab, ist sie nicht vergleichbar. */
  quelle: Messquelle
  /** Was ausdruecklich NICHT mitgezaehlt wird. */
  ausgenommen: string
  /** Wer misst. Eine Kennzahl ohne Verantwortlichen wird nicht gemessen. */
  verantwortlich: string
  /** Ab wann erhoben wird, ISO. */
  startetAm: string
}

/* ── Eine einzelne Probe ────────────────────────────────────────────────── */

/**
 * Zu welcher Seite des Vergleichs eine Probe gehoert.
 *
 * `ausgang` ist BEWUSST nicht „vorher" genannt. Fuer fibero gibt es kein
 * Vorher — das System laeuft laengst. Was heute erhoben wird, ist der
 * Ausgangsstand MIT fibero, und er taugt fuer kuenftige Vergleiche (Version A
 * gegen B, Handgriff gegen Automatik). Er taugt NIE als „vor fibero".
 * Siehe `lib/fibero-messung.ts`.
 */
export type Seite = "ausgang" | "danach"

export type Probe = {
  kennzahl: string
  seite: Seite
  /** Tag der Erhebung, ISO. */
  am: string
  wert: number
  /** Ueber wie viele Faelle. Ein Wert aus drei Faellen ist kein Wert. */
  faelle: number
  quelle: Messquelle
  /** Wer sie erhoben hat. */
  von: string
  notiz?: string | null
}

/* ── Was ein Vergleich braucht ──────────────────────────────────────────── */

/** Unter diesem Abstand sagt ein Vergleich nichts. Wie `MIND_ABSTAND_TAGE` in Gate 27. */
export const MIND_ABSTAND_TAGE = 28
/** Und unter dieser Fallzahl je Seite auch nicht. */
export const MIND_FAELLE = 20

export type Vergleichsurteil =
  | "verbessert"
  | "verschlechtert"
  | "unveraendert"
  | "nicht-vergleichbar"

export type Vergleich = {
  urteil: Vergleichsurteil
  /** Nur gesetzt, wenn das Urteil nicht `nicht-vergleichbar` ist. */
  ausgang: number | null
  danach: number | null
  /** Unterschied in der Einheit der Kennzahl. Nie ein Prozentwert ohne Basis. */
  unterschied: number | null
  /**
   * Prozent — nur wo weniger besser ist, nur bei positivem Ausgangswert,
   * und nur wenn der Vergleich ueberhaupt traegt. Sonst `null`.
   */
  prozent: number | null
  /** Der Satz, der erklaert, warum das Urteil so lautet. */
  grund: string
  /** Darf daraus eine oeffentliche Zahl werden? */
  oeffentlichVerwendbar: boolean
}

function tageZwischen(a: string, b: string): number {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime())
  return Math.round(ms / 86_400_000)
}

/** Die juengste Probe einer Seite — aeltere bleiben als Verlauf erhalten. */
function juengste(proben: readonly Probe[], seite: Seite): Probe | null {
  const passend = proben.filter((p) => p.seite === seite)
  if (passend.length === 0) return null
  return passend.reduce((a, b) => (a.am >= b.am ? a : b))
}

/**
 * Der Vergleich. Er faellt lieber gar kein Urteil als ein schwaches.
 *
 * Die Reihenfolge der Pruefungen ist Absicht: Zuerst das, was gar nicht da
 * ist, dann das, was nicht zusammenpasst, zuletzt das, was zu duenn ist. So
 * bekommt der Owner immer den ERSTEN echten Grund genannt und nicht den
 * zufaellig zuletzt geprueften.
 */
export function vergleiche(kennzahl: Kennzahl, proben: readonly Probe[]): Vergleich {
  const eigene = proben.filter((p) => p.kennzahl === kennzahl.key)
  const a = juengste(eigene, "ausgang")
  const d = juengste(eigene, "danach")

  const leer: Omit<Vergleich, "grund"> = {
    urteil: "nicht-vergleichbar",
    ausgang: a?.wert ?? null,
    danach: d?.wert ?? null,
    unterschied: null,
    prozent: null,
    oeffentlichVerwendbar: false,
  }

  if (!a && !d) return { ...leer, grund: "Noch keine Probe erhoben." }
  if (!a) return { ...leer, grund: "Es gibt nur einen Wert danach. Ohne Ausgangsstand ist er kein Fortschritt." }
  if (!d) return { ...leer, grund: "Der Ausgangsstand steht. Ein Wert danach fehlt noch." }

  /* Unterschiedliche Quelle heisst unterschiedliche Methode. */
  if (a.quelle !== d.quelle) {
    return {
      ...leer,
      grund: `Die beiden Werte stammen aus verschiedenen Quellen (${a.quelle} gegen ${d.quelle}). Das ist kein Vergleich, das sind zwei Messungen.`,
    }
  }
  if (!quelleTraegt(a.quelle)) {
    return { ...leer, grund: "Geschätzte Werte tragen keinen Vergleich." }
  }

  const abstand = tageZwischen(a.am, d.am)
  if (abstand < MIND_ABSTAND_TAGE) {
    return {
      ...leer,
      grund: `Zwischen den Messungen liegen ${abstand} Tage. Unter ${MIND_ABSTAND_TAGE} sagt der Unterschied nichts über den Prozess, sondern über die Woche.`,
    }
  }
  if (a.faelle < MIND_FAELLE || d.faelle < MIND_FAELLE) {
    return {
      ...leer,
      grund: `Gemessen über ${a.faelle} und ${d.faelle} Fälle. Unter ${MIND_FAELLE} je Seite ist das ein Zufall, kein Effekt.`,
    }
  }

  const unterschied = d.wert - a.wert
  /* Bei Aufwand und Fehlern ist weniger besser; bei Menge sagt es nichts. */
  const wenigerIstBesser =
    kennzahl.art === "aufwand" || kennzahl.art === "fehler" || kennzahl.art === "rueckstand"
  if (!wenigerIstBesser) {
    return {
      urteil: "nicht-vergleichbar",
      ausgang: a.wert,
      danach: d.wert,
      unterschied,
      prozent: null,
      grund: `„${kennzahl.definition}" ist eine Mengenangabe. Eine Veränderung daran ist Kontext, keine Verbesserung — mehr Vorgänge sind weder gut noch schlecht.`,
      oeffentlichVerwendbar: false,
    }
  }

  if (unterschied === 0) {
    return {
      urteil: "unveraendert",
      ausgang: a.wert,
      danach: d.wert,
      unterschied: 0,
      prozent: 0,
      grund: "Kein messbarer Unterschied.",
      oeffentlichVerwendbar: true,
    }
  }

  const prozent = a.wert > 0 ? (Math.abs(unterschied) / a.wert) * 100 : null
  return {
    urteil: unterschied < 0 ? "verbessert" : "verschlechtert",
    ausgang: a.wert,
    danach: d.wert,
    unterschied,
    prozent,
    grund:
      `${a.wert} → ${d.wert} ${kennzahl.einheit} · ` +
      `${a.faelle} gegen ${d.faelle} Fälle · ${abstand} Tage Abstand · Quelle: ${a.quelle}.`,
    oeffentlichVerwendbar: true,
  }
}

/**
 * Traegt eine einzelne Probe eine oeffentliche Zahl?
 *
 * Nicht dasselbe wie ein Vergleich: Auch ein Einzelwert kann veroeffentlicht
 * werden („so viele Vorgaenge im Monat"), aber nur mit Quelle, Datum und
 * genug Faellen dahinter.
 */
export function probeTraegt(p: Probe): { traegt: boolean; grund: string } {
  if (!quelleTraegt(p.quelle)) return { traegt: false, grund: "Geschätzte Werte werden nicht veröffentlicht." }
  if (!p.am || Number.isNaN(new Date(p.am).getTime()))
    return { traegt: false, grund: "Ohne Erhebungsdatum ist eine Zahl nicht nachprüfbar." }
  if (!p.von || p.von.trim().length < 2)
    return { traegt: false, grund: "Ohne benannten Erheber gibt es niemanden, der sie verantwortet." }
  if (p.faelle < MIND_FAELLE)
    return { traegt: false, grund: `Nur ${p.faelle} Fälle — unter ${MIND_FAELLE} ist das kein Wert.` }
  return { traegt: true, grund: `Gezählt am ${p.am} über ${p.faelle} Fälle (${p.quelle}).` }
}
