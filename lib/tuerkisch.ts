/**
 * ADM-07 · A24/H30 — İ, I, ı, i: VIER BUCHSTABEN, EIN BETRIEB.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS GEMESSEN WURDE (22.09.2026)
 *
 * Der Betrieb „İzmir Işık Tesisat" steht in der Datenbank. Gesucht wurde
 * nach vier Schreibweisen:
 *
 *   izmir  → gefunden      (ILIKE ist unempfindlich gegen Gross/Klein)
 *   İZMİR  → gefunden      (dito)
 *   ışık   → NICHT gefunden
 *   isik   → NICHT gefunden
 *
 * Der Grund ist nicht die Gross-/Kleinschreibung, sondern das türkische
 * Alphabet: `ş` und `ı` sind eigene Buchstaben. Für Postgres ist `ı` nicht
 * die Kleinform von `I`, und `ş` nicht `s`. Wer den Betrieb angelegt hat,
 * tippt ihn beim Suchen selten identisch — und die Nische dieses Hauses ist
 * ausdrücklich die türkischsprachige Kundschaft in Europa. Eine Suche, die
 * „Işık" nur bei exakt „Işık" findet, ist dort keine Suche.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE LÖSUNG: BEIDE SEITEN AUF DENSELBEN NENNER
 *
 * Nicht die Daten werden verändert — gespeichert bleibt „İzmir Işık
 * Tesisat", mit jedem Zeichen. Verglichen wird eine abgeleitete Form:
 * türkische (und deutsche) Sonderbuchstaben auf ihre Grundform, dann klein.
 * Dieselbe Umrechnung geschieht in SQL für die Spalte und in JavaScript für
 * das Suchwort — sonst treffen sich die beiden nie.
 *
 * `translate()` VOR `lower()`: `lower('İ')` ergibt in Postgres ein `i` mit
 * kombinierendem Punkt, und der vergleicht sich mit nichts mehr.
 *
 * Nebenwirkung, bewusst in Kauf genommen: Auch „Müller" findet „Muller"
 * und umgekehrt. In einem Haus mit deutschen und türkischen Namen ist das
 * die richtige Richtung — gesucht wird nach Menschen, nicht nach Bytes.
 */

/** Die Zeichen, die ersetzt werden — Quelle und Ziel Zeichen für Zeichen gleich lang. */
export const TUERKISCH_VON = "İIıŞşĞğÜüÖöÇçÂâÎîÛûßẞ"
export const TUERKISCH_NACH = "IIiSsGgUuOoCcAaIiUuss"

/** Die Vergleichsform eines Wortes — dieselbe Regel wie `sqlTuerkisch()`. */
export function tuerkischVergleich(wert: string): string {
  let raus = ""
  for (const zeichen of wert) {
    const i = TUERKISCH_VON.indexOf(zeichen)
    raus += i === -1 ? zeichen : TUERKISCH_NACH[i]
  }
  return raus.toLowerCase()
}

/**
 * Dieselbe Umrechnung als SQL-Ausdruck für eine Spalte.
 *
 * Kein Index nutzt das — bei einem Haus mit ein paar tausend Zeilen ist ein
 * sequenzieller Vergleich billiger als ein Ausdrucksindex, den beim nächsten
 * Feld jemand vergisst. Steht die Zahl irgendwann anders da, gehört hier ein
 * `CREATE INDEX ... ON (tuerkisch(spalte))` hin, kein zweites Suchfeld.
 */
export function sqlTuerkisch(spalte: string): string {
  return `lower(translate(coalesce(${spalte}, ''), '${TUERKISCH_VON}', '${TUERKISCH_NACH}'))`
}
