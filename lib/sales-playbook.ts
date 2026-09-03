import { SALES_STATES, type SalesStatus } from "@/lib/lead-store"

/**
 * Das Vertriebs-Regelwerk — die Sätze, die sonst nur im Kopf stehen.
 *
 * ===========================================================================
 * WARUM ES DIESE DATEI GIBT
 * Die Vertriebsfläche konnte bis hierher alles speichern und nichts erklären.
 * Neun Stufen standen als Auswahlliste da: Neu, Kontaktiert, Qualifiziert,
 * Discovery, Audit, Angebot, Verhandlung, Gewonnen, Verloren. Was „Qualifiziert“
 * verlangt, worin sich „Discovery“ von „Audit“ unterscheidet und wann ein
 * Vorgang wirklich in „Verhandlung“ gehört, stand nirgends — es stand im Kopf
 * dessen, der die Liste angelegt hat.
 *
 * Ein Vertrieb, dessen Regeln nur im Kopf stehen, ist genau so lange
 * verlässlich, wie derselbe Mensch ihn führt und sich erinnert. Beim zweiten
 * Menschen — oder beim ersten vollen Monat — wird aus derselben Auswahlliste
 * eine andere Bedeutung, und ab da vergleicht man Zahlen, die nichts
 * miteinander zu tun haben.
 *
 * Hier stehen die Regeln. Nicht als Vorschrift, die etwas erzwingt, sondern
 * als Text an genau der Stelle, an der entschieden wird.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER BEWUSST NICHT STEHT
 * Keine Punktzahl, keine Wahrscheinlichkeit, keine automatische
 * Qualifizierung, kein „heisser Lead“. Aus dem, was dieses Haus über einen
 * Vorgang weiss, lässt sich keine Kaufwahrscheinlichkeit rechnen — und eine
 * erfundene Zahl ist schlimmer als keine, weil man ihr glaubt.
 *
 * Was hier steht, ist Handwerk: Woran erkennt man, dass eine Stufe erreicht
 * ist, und was muss als Nächstes passieren.
 */

/* ========================================================================== *
 * DIE STUFEN
 * ========================================================================== */

export type StageRule = {
  /** Was die Stufe im Betrieb bedeutet — ein Satz, kein Absatz. */
  meaning: string
  /** Woran man erkennt, dass ein Vorgang HIER angekommen ist. */
  entry: string
  /** Was typischerweise als Nächstes ansteht. Vorschlag, keine Pflicht. */
  suggests: string | null
  /**
   * Ob die Stufe einen laufenden Vorgang beschreibt. Abgeschlossene Vorgänge
   * brauchen keinen nächsten Schritt — bei allen anderen ist ein fehlender
   * Schritt ein Befund und keine Kleinigkeit.
   */
  active: boolean
}

/**
 * DISCOVERY UND AUDIT — ZWEI NAMEN, EIN SCHRITT.
 *
 * Gate 3 hat die öffentliche Sprache entschieden: Was zwischen „wir reden“
 * und „hier ist ein Angebot“ liegt, heisst in diesem Haus **Systemgespräch**
 * — 45 Minuten, kostenlos, Umfang zuschneiden. Es gibt keinen zweiten,
 * bezahlten Audit-Schritt im Vertrieb; die Barrierefreiheits-Prüfung ist ein
 * PRODUKT mit Festpreis, keine Pipeline-Stufe.
 *
 * Beide Werte bleiben in der Datenbank gültig und beide tragen hier
 * dieselbe Bedeutung. Bestehende Zeilen werden NICHT umgeschrieben: Ohne
 * lesbaren Zugang zu den echten Daten wäre das Raten, und geraten wird an
 * Vertriebsdaten nicht. Neu vergeben wird nur noch `discovery`.
 */
export const STAGE_RULES: Record<SalesStatus, StageRule> = {
  new: {
    meaning: "Ein Vorgang ist angelegt, aber noch niemand hat mit dem Menschen gesprochen.",
    entry: "Aus einer Anfrage entstanden oder von Hand angelegt.",
    suggests: "Kontakt aufnehmen",
    active: true,
  },
  contacted: {
    meaning: "Es gab einen echten Kontakt — Telefonat, Mail-Antwort, Gespräch.",
    entry: "Jemand hat geantwortet. Eine abgeschickte Mail allein ist kein Kontakt.",
    suggests: "Erstberatung vereinbaren",
    active: true,
  },
  qualified: {
    meaning: "Es gibt ein echtes Problem, creaDIG kann es plausibel lösen, und der Betrieb will darüber reden.",
    entry:
      "Drei Dinge sind bekannt: das Problem, der Betrieb (oder der Mensch dahinter) " +
      "und die Bereitschaft zum nächsten Schritt. Kein Budget nötig — danach fragt " +
      "dieses Haus im Erstgespräch nicht.",
    suggests: "Systemgespräch vereinbaren",
    active: true,
  },
  discovery: {
    meaning: "Systemgespräch — der Umfang wird zugeschnitten.",
    entry:
      "Das Systemgespräch ist vereinbart oder geführt. Was danach feststehen muss, " +
      "steht im Aufnahmebogen darunter: bestätigtes Problem, betroffene Ebenen, " +
      "gewünschtes Ergebnis, Einschränkungen.",
    suggests: "Umfang klären",
    active: true,
  },
  audit: {
    meaning: "Systemgespräch — der Umfang wird zugeschnitten. (Altbestand: früher „Audit“.)",
    entry:
      "Gleichbedeutend mit „Systemgespräch“. Der Wert wird nicht mehr neu vergeben; " +
      "bestehende Vorgänge behalten ihn, damit keine Zeile verändert wird.",
    suggests: "Umfang klären",
    active: true,
  },
  proposal: {
    meaning: "Ein Angebot ist beim Betrieb — mit Umfang, Preis und Zeitrahmen.",
    entry:
      "Der Umfang steht so weit, dass eine Zahl genannt werden kann. Ohne " +
      "verstandenen Umfang gibt es keinen Festpreis — das ist die Preisdoktrin " +
      "des Hauses, nicht eine Vorsichtsmassnahme.",
    suggests: "Angebot nachfassen",
    active: true,
  },
  negotiation: {
    meaning: "Über ein vorliegendes Angebot wird verhandelt — Umfang, Preis oder Termin.",
    entry:
      "Der Betrieb hat das Angebot und äussert sich dazu. „Wir sind noch im Gespräch“ " +
      "ist KEINE Verhandlung — das ist Angebot mit offenem Nachfassen.",
    suggests: "Entscheidung abwarten",
    active: true,
  },
  won: {
    meaning: "Zusage. Der Auftrag ist erteilt.",
    entry:
      "Eine ausdrückliche Zusage liegt vor — schriftlich oder im Gespräch bestätigt. " +
      "Freundliche Worte sind keine Zusage.",
    suggests: null,
    active: false,
  },
  lost: {
    meaning: "Der Vorgang ist beendet, ohne Auftrag.",
    entry: "Absage, oder es kommt seit Langem nichts mehr zurück. Der Grund gehört dazu.",
    suggests: null,
    active: false,
  },
}

/** Die Stufen, die neu vergeben werden. `audit` bleibt gültig, aber wird nicht angeboten. */
export const OFFERED_STAGES: SalesStatus[] = SALES_STATES.filter((s) => s !== "audit")

/* ========================================================================== *
 * DER NÄCHSTE SCHRITT
 * ========================================================================== */

/**
 * Elf Formulierungen, die immer wieder vorkommen — als Vorschlag, nicht als
 * Zwang. Das Feld bleibt frei beschreibbar.
 *
 * WARUM VORSCHLÄGE UND KEINE LISTE ZUM AUSWÄHLEN
 * Eine feste Liste erzwingt, dass jeder Schritt in eine der elf Schubladen
 * passt. Der zwölfte Fall kommt garantiert, und dann steht dort der
 * nächstbeste Eintrag statt der Wahrheit. Ein Vorschlag beschleunigt den
 * Regelfall und lässt den Sonderfall in Ruhe.
 */
export const NEXT_ACTIONS = [
  "Kontakt aufnehmen",
  "Rückruf",
  "Erstberatung vereinbaren",
  "Systemgespräch vereinbaren",
  "Unterlagen anfordern",
  "Umfang klären",
  "Angebot erstellen",
  "Angebot nachfassen",
  "Entscheidung abwarten",
  "Beziehung pflegen",
  "Termin bestätigen",
] as const

/* ========================================================================== *
 * WARUM EIN VORGANG VERLOREN GING
 * ========================================================================== */

/**
 * Sechs Gründe und ein Freitextfeld.
 *
 * WARUM ÜBERHAUPT EINE LISTE
 * Der Grund stand bisher als Freitext da. Freitext beantwortet die Frage
 * „warum haben wir diesen einen verloren“ und keine einzige darüber hinaus:
 * Fünfzig verschieden formulierte Absagen ergeben keine Erkenntnis. Sechs
 * Gründe ergeben eine.
 *
 * WARUM DAS FREITEXTFELD BLEIBT
 * Weil der Grund fast nie vollständig in ein Wort passt. Die Kategorie sagt,
 * WO es gescheitert ist; der Satz daneben sagt, WAS wirklich los war.
 *
 * Bestehende Zeilen behalten ihren Freitext unverändert — er wird weder
 * umgedeutet noch einer Kategorie zugeordnet. Einen Grund nachträglich zu
 * erfinden ist schlimmer, als keinen zu haben.
 */
export const LOST_REASONS = [
  "Kein Bedarf",
  "Wirtschaftlich nicht passend",
  "Keine Rückmeldung",
  "Andere Lösung gewählt",
  "Zeitpunkt passt nicht",
  "Nicht passend für creaDIG",
  "Sonstiges",
] as const

/* ========================================================================== *
 * WORAUS DIE ANFRAGE KAM — UND WAS ZUERST ZU TUN IST
 * ========================================================================== */

/**
 * Gate 3 hat fünf Eingangsabsichten festgelegt. Jede sagt bereits etwas
 * darüber, was sinnvollerweise als Erstes passiert.
 *
 * Das ist ein VORSCHLAG für das Formularfeld, keine automatische Entscheidung:
 * Es entsteht kein Vorgang von selbst, keine Stufe wechselt von selbst, und
 * wer etwas anderes eintragen will, tippt es einfach.
 */
export const ENTRY_INTENT: Record<string, { label: string; firstAction: string }> = {
  betriebscheck: {
    label: "Betriebscheck — der Befund liegt bei der Anfrage",
    firstAction: "Rückruf",
  },
  termin: {
    label: "Terminwunsch — Gesprächsart und Wunschzeiten stehen in der Nachricht",
    firstAction: "Termin bestätigen",
  },
  kontakt: {
    label: "Direkte Frage über das Kontaktformular",
    firstAction: "Kontakt aufnehmen",
  },
  kurzcheck: {
    label: "Kurz-Check zu einer bestehenden Seite",
    firstAction: "Rückruf",
  },
}

/**
 * Der vorgeschlagene erste Schritt zu einer Quelle. Unbekannte Quellen
 * bekommen den neutralsten Vorschlag, den es gibt — nicht gar keinen.
 */
export function firstActionFor(source: string): string {
  return ENTRY_INTENT[source]?.firstAction ?? "Kontakt aufnehmen"
}
