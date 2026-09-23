/**
 * ADM-07 · H27 — `notFound()` IST KEIN DATENBANKFEHLER.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER SCHIEFGING
 *
 * Die Detailseiten laden ihre Daten in einem `try` und beantworten einen
 * Fehler mit „nicht verfügbar" — richtig, solange der Fehler von der
 * Datenbank kommt. `notFound()` wirft aber ebenfalls, und zwar MITTEN in
 * demselben `try`. Damit wurde aus einer erfundenen Kennung nicht „nicht
 * gefunden", sondern eine 200 mit dem Satz, die Datenbank sei nicht
 * erreichbar.
 *
 * Zwei Schäden in einem:
 *   1 · A21 — eine geratene Kennung bekam keine Absage, sondern eine Seite.
 *   2 · A19 — „nicht erreichbar" stand da, obwohl alles erreichbar war.
 *       Genau die Verwechslung, die dieses Programm überall sonst verbietet.
 *
 * Next markiert seine eigenen Steuerfehler (`notFound`, `redirect`) mit
 * einem `digest`, der mit `NEXT_` beginnt. Wer sie fängt, muss sie
 * weiterreichen — sonst fängt er die Navigation, nicht den Fehler.
 */
export function istNavigationsfehler(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_")
  )
}
