/**
 * SystemField — der Hero-Grund.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VORHER STAND
 * Zuerst `ArchitecturalField` (Perspektive + Wachstumskurve + Dreiecksrastern),
 * dann `SignatureMotif` als Knoten-Netz und als Schienen-Treppe. Beide Zeichen
 * hat der Owner abgelehnt (29.08.2026). Der Hero braucht keinen zweiten
 * Satz neben der Headline — er braucht Ruhe und Rangordnung.
 *
 * ---------------------------------------------------------------------------
 * WAS JETZT NOCH DA IST
 * Nur die Waerme und die Verlaeufe, die die Typografie freistellen. Kein
 * Client-JS, kein framer-motion, kein Zeichen. Wenn spaeter ein neues Motiv
 * kommt, haengt es hier wieder ein — bis dahin bleibt der Grund still.
 *
 * ---------------------------------------------------------------------------
 * PHASE 1 · PREMIUM (28.09.2026)
 * Der goldene Radialschein stand rechts neben der Headline und las sich im
 * Bild als grauer Fleck — auf Papier wird 12 % Gold zu Schmutz, nicht zu
 * Waerme. Er ist entfernt; die Rangordnung traegt jetzt allein die Schrift
 * und die Thesenlinie. Uebrig bleibt nur der Abschluss nach unten, der den
 * Uebergang zur Fussleiste des Hero weich haelt.
 */

export function SystemField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="from-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
    </div>
  )
}
