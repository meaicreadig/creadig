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
 */

export function SystemField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute top-[34%] left-[58%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--gold) 12%, transparent), transparent 66%)",
        }}
      />
      <div className="from-background via-background/70 absolute inset-0 bg-gradient-to-r to-transparent" />
      <div className="from-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
    </div>
  )
}
