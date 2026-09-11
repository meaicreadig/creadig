/*
 * ===========================================================================
 * fibero — DER MESSPLAN
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1, 11.09.2026.
 *
 * ---------------------------------------------------------------------------
 * DIE EINE FRAGE, DIE VORHER BEANTWORTET WERDEN MUSSTE
 *
 * Gibt es irgendwo einen aufgezeichneten Zustand VOR fibero?
 *
 * Nachgesehen am 11.09.2026 im fibero-Repository, nicht angenommen:
 * `lib/db/schema.ts` fuehrt keine Aufwands-, Zeit- oder Schrittzahl aus der
 * Zeit davor. `work_objects.timeline` beginnt mit dem Datensatz, also mit
 * fibero. `duration_s` gehoert zum Routen-Zwischenspeicher und misst eine
 * Wegzeit, keinen Bearbeitungsaufwand. `audit_log` protokolliert Aenderungen
 * im System — auch erst ab dem System.
 *
 *   HISTORISCHER VORHER-STAND: EXISTIERT NICHT.
 *
 * Das ist keine Luecke, die dieser Lauf schliessen koennte. Sie ist
 * endgueltig: Der Zustand vor einem System laesst sich nicht nachtraeglich
 * messen, sobald das System laeuft.
 *
 * ---------------------------------------------------------------------------
 * WAS STATTDESSEN BEGINNT
 *
 * Ein AUSGANGSSTAND MIT fibero. Er heisst in `lib/messreihe.ts` deshalb
 * `ausgang` und nicht `vorher` — das ist kein Wortspiel, sondern die Grenze:
 *
 *   Er taugt fuer:   „Version A gegen Version B",
 *                    „Handgriff gegen Automatik",
 *                    „vor der Anbindung X gegen danach".
 *
 *   Er taugt NIE fuer: „vor fibero".
 *
 * Wer diese beiden Saetze verwechselt, hat eine Zahl, die sich gut liest und
 * nicht stimmt. `scripts/check-beleg-betrieb.mjs` prueft deshalb bei jedem
 * Bau, dass auf keiner oeffentlichen Seite ein Vorher-Anspruch steht.
 *
 * ---------------------------------------------------------------------------
 * WARUM GENAU DIESE FUENF
 *
 * Jede Kennzahl haengt an einem Feld, das das System HEUTE schon fuehrt.
 * Eine Kennzahl, fuer die erst etwas gebaut werden muesste, wird nie
 * gemessen — sie wandert in die naechste Woche, bis niemand mehr fragt.
 *
 * Vier davon sind aus dem Bestand ableitbar, also auch rueckwirkend INNERHALB
 * von fibero. Eine (`bearbeitungszeit`) ist es nicht: Sie verlangt, dass
 * jemand mitschreibt. Sie steht trotzdem hier, weil sie die einzige ist, die
 * den Aufwand je Vorgang direkt misst — und sie ist ausdruecklich als
 * Handaufschrieb gekennzeichnet, damit niemand sie fuer eine Systemzahl haelt.
 */
import type { Kennzahl } from "@/lib/messreihe"

/**
 * DER TAG, AN DEM DIE ERHEBUNG BEGINNT.
 *
 * Kein rueckdatierter Start. Wer spaeter wissen will, ab wann gemessen wurde,
 * liest hier — und nicht in einem Commit-Datum.
 */
export const MESSUNG_START = "2026-09-11"

/** Dass es keinen Vorher-Stand gibt, ist eine Tatsache und kein Zustand, der sich ändert. */
export const HISTORISCHER_VORHERSTAND_VORHANDEN = false

export const HISTORISCHER_BEFUND =
  "Im fibero-Repository existiert keine Aufzeichnung eines Zustands vor fibero. " +
  "`work_objects.timeline` beginnt mit dem Datensatz, `audit_log` mit dem System. " +
  "Ein Vorher-Stand kann nicht nachträglich entstehen."

export const fiberoKennzahlen: Kennzahl[] = [
  {
    key: "fibero-durchlauf",
    subjekt: "fibero",
    art: "aufwand",
    definition:
      "Tage von der Anlage eines Objekts bis zu seinem Abschluss — gerechnet aus timeline.created und timeline.completed, Median über alle im Zeitraum abgeschlossenen Objekte.",
    einheit: "Tage",
    quelle: "system-zaehlung",
    ausgenommen:
      "Objekte ohne completed-Zeitstempel, stornierte Objekte und Abbrüche vor Ort (u > 0) — sie laufen nie bis zum Abschluss und würden den Median verzerren.",
    verantwortlich: "Owner",
    startetAm: MESSUNG_START,
  },
  {
    key: "fibero-ungeprueft",
    subjekt: "fibero",
    art: "rueckstand",
    definition:
      "Anteil der Objekte im Zeitraum, deren Fakten am Stichtag noch auf reviewStatus = open stehen.",
    einheit: "%",
    quelle: "system-zaehlung",
    ausgenommen: "Objekte, die am Stichtag jünger als sieben Tage sind — sie sind zu Recht noch offen.",
    verantwortlich: "Owner",
    startetAm: MESSUNG_START,
  },
  {
    key: "fibero-handeingabe",
    subjekt: "fibero",
    art: "rueckstand",
    definition:
      "Anteil der Objekte im Zeitraum mit sourceType = manual, also von Hand angelegt statt aus PDF oder Excel übernommen.",
    einheit: "%",
    quelle: "system-zaehlung",
    ausgenommen: "Objekte, die absichtlich von Hand entstehen (Sonderfälle ohne Beleg).",
    verantwortlich: "Owner",
    startetAm: MESSUNG_START,
  },
  {
    key: "fibero-belegautomatik",
    subjekt: "fibero",
    art: "rueckstand",
    definition:
      "Anteil der Belege im Zeitraum, die NICHT über den Postfach-Abgleich hereinkamen, sondern von Hand erfasst wurden — gezählt gegen email_import_log.",
    einheit: "%",
    quelle: "system-zaehlung",
    ausgenommen: "Kassenbons ohne Mailbeleg, solange es dafür keinen Weg gibt.",
    verantwortlich: "Owner",
    startetAm: MESSUNG_START,
  },
  {
    key: "fibero-bearbeitungszeit",
    subjekt: "fibero",
    art: "aufwand",
    definition:
      "Minuten, die ein Mensch an einem Objekt arbeitet — von der Anlage bis zum geprüften Fakt, mitgeschrieben an echten Vorgängen.",
    einheit: "Minuten",
    quelle: "handaufschrieb",
    ausgenommen:
      "Wartezeiten, Unterbrechungen und Rückfragen an Dritte. Gemessen wird die Zeit am Vorgang, nicht die Zeit bis zum Abschluss.",
    verantwortlich: "Owner",
    startetAm: MESSUNG_START,
  },
]

/**
 * Die strukturellen Zahlen aus Phase 3 bleiben, was sie sind.
 *
 * Drei Datenherkuenfte, acht Faktenfelder, zwei Pruefstaende: aus dem Schema
 * abgezaehlt, jederzeit nachpruefbar — und ausdruecklich KEINE Leistungswerte.
 * Sie stehen hier nur, damit die Trennung im Code sichtbar ist und niemand
 * sie spaeter in dieselbe Tabelle schreibt wie eine Messung.
 */
export const STRUKTURELL_NICHT_LEISTUNG = ["herkunft", "fakten", "pruefstand"] as const
