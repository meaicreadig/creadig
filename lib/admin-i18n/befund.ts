import { ABSCHNITTE } from "@/lib/angebot"
import type { Befund } from "@/lib/angebot"
import type { Mangel } from "@/lib/lieferung"
import type { AdminTexte } from "@/lib/admin-i18n"

/**
 * ADM-05 · H21 — aus einem Maschinenwert wird ein Satz.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIESE SCHICHT ZWISCHEN SPEICHER UND OBERFLÄCHE LIEGT
 *
 * Bis zum 17.09.2026 schrieb der Server seine Befunde als fertige deutsche
 * Sätze. Sie erschienen deshalb auch in der türkischen Oberfläche auf
 * Deutsch — und das Sprach-Gate konnte es nicht sehen, weil es sichtbaren
 * Text im JSX zählt und nicht Text, der über eine Server Action ankommt.
 *
 * Jetzt trägt ein Befund nur noch `bereich`, `code` und ein paar Werte. Den
 * Satz baut diese Datei, aus dem Wörterbuch, in der Sprache des Menschen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EINE AUSNAHME, UND WARUM SIE RICHTIG IST
 *
 * `wo` ist bei einem Angebotsabschnitt die DEUTSCHE Überschrift („06 Preis“).
 * Sie benennt keinen Bereich der Oberfläche, sondern einen Abschnitt des
 * Dokuments, das der Kunde auf Deutsch bekommt. Wer auf Türkisch „06 Fiyat“
 * liest und dann deutschen Text in ein Feld tippt, das beim Kunden „06
 * Preis“ heißt, arbeitet an einem Dokument, das er nicht sieht.
 *
 * Die REGEL zu diesem Abschnitt wird übersetzt — sie ist eine Anweisung
 * dieses Hauses, kein Teil des Dokuments.
 */

/** Setzt `{platzhalter}` ein. Fehlt ein Wert, bleibt die Stelle leer statt „undefined“. */
function fuelle(vorlage: string, werte: Record<string, string>): string {
  return vorlage.replace(/\{(\w+)\}/g, (_, k: string) => werte[k] ?? "").replace(/\s{2,}/g, " ").trim()
}

const ABSCHNITT_KEYS = new Set(ABSCHNITTE.map((a) => a.key as string))

/** Die Überschrift eines Abschnitts, so wie sie im Angebot steht. */
function abschnittUeberschrift(key: string): string | null {
  const a = ABSCHNITTE.find((x) => x.key === key)
  return a ? `${a.nummer} ${a.titel}` : null
}

export type Zeile = { wo: string; satz: string }

/**
 * Ein Befund oder ein Mangel als Zeile, wie sie der `Speicherstand` zeigt.
 *
 * Beide Arten laufen durch dieselbe Funktion: Für den Menschen davor ist
 * „was fehlt noch“ eine Frage, nicht zwei.
 */
export function befundZeile(b: Befund | Mangel, t: AdminTexte): Zeile {
  const f = t.befunde
  const werte: Record<string, string> = { ...(b.werte ?? {}) }

  /* Ein Beleg der Angebotsreife bringt seinen eigenen Satz mit. */
  if (werte.beleg) {
    const reife = f.reife[werte.beleg as keyof typeof f.reife]
    if (reife) {
      werte.beleg = reife.label
      werte.warum = reife.warum
    }
  }
  /* Ein Übergabestück ebenso. */
  if (werte.stueck) {
    const stueck = f.uebergabestueck[werte.stueck as keyof typeof f.uebergabestueck]
    if (stueck) {
      werte.stueck = stueck.label
      werte.was = stueck.was
    }
  }
  /* Und ein leerer Pflichtabschnitt trägt seine Regel nach. */
  if (ABSCHNITT_KEYS.has(b.bereich)) {
    werte.regel = f.abschnittRegel[b.bereich as keyof typeof f.abschnittRegel] ?? ""
  }

  const vorlage = f.code[b.code as keyof typeof f.code]
  return {
    wo: abschnittUeberschrift(b.bereich) ?? f.bereich[b.bereich as keyof typeof f.bereich] ?? b.bereich,
    /* Kein leerer Satz: Ein unbekannter Code nennt sich selbst, statt zu schweigen. */
    satz: vorlage ? fuelle(vorlage, werte) : b.code,
  }
}

export function befundZeilen(liste: readonly (Befund | Mangel)[], t: AdminTexte): Zeile[] {
  return liste.map((b) => befundZeile(b, t))
}
