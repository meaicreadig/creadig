"use client"

import { SystemNode } from "@/components/creative/system"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

/**
 * DIE THESENLINIE — die visuelle These im ersten Sichtfenster.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM HIER KEIN ZEICHEN STEHT
 *
 * Im Hero standen schon zwei Motive: ein Knoten-Netz und eine
 * Schienen-Treppe. Beide hat der Owner am 29.08.2026 abgelehnt, und die
 * Begruendung steht in `components/hero/system-field.tsx`: „Der Hero braucht
 * keinen zweiten Satz neben der Headline — er braucht Ruhe und Rangordnung."
 *
 * Diese Datei ist deshalb ausdruecklich KEIN dritter Anlauf auf ein Zeichen.
 * Ein Zeichen ist Schmuck hinter der Schrift; es konkurriert mit der
 * Headline. Hier wird nichts hinzugefuegt — ein Element, das ohnehin da war,
 * bekommt eine Bedeutung.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS VORHER AN DIESER STELLE WAR
 *
 * Ein `border-t`. Ein Trennstrich zwischen Headline und Unterzeile, der
 * genau so viel sagte wie jeder Trennstrich: nichts.
 *
 * Jetzt sagt dieselbe Linie den Satz, auf dem die ganze Firma steht:
 *
 *     Links hoert sie immer wieder auf — drei Stuecke, zwei Luecken.
 *     In der Mitte steht ein Knoten: hier faengt das System an.
 *     Rechts laeuft sie durch.
 *
 * Das ist die These in einem Element, ohne ein einziges zusaetzliches Wort
 * und ohne dass die Kopfzeile Platz verliert. Wer sie nicht bemerkt, verliert
 * nichts — der Abschnitt „Das Systembild" sagt dasselbe ausfuehrlich.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM SIE NICHT ANGESAGT WIRD
 *
 * `aria-hidden`, weil sie keine Information traegt, die nicht kurz darunter
 * in Worten steht. Eine Vorlesestimme, die „Linie, unterbrochen, Knoten,
 * Linie" sagt, erklaert niemandem etwas; sie haelt nur auf.
 *
 * Bewegung: ein einzelner Knoten am Ende pulst — die Richtung, in die die
 * Arbeit laeuft. Bei `prefers-reduced-motion` steht er still und die Linie
 * ist trotzdem vollstaendig. Nichts hier wird eingeblendet, nichts ist
 * zwischendurch unsichtbar (D-28).
 */
export function ThesisLine() {
  const reduce = usePrefersReducedMotion()

  return (
    <div aria-hidden="true" className="flex w-full items-center">
      {/*
        Der unterbrochene Teil. Drei Stuecke, dazwischen echtes Papier —
        keine gestrichelte Linie: Eine Strichelung ist ein Linienstil, eine
        Luecke ist ein Zustand.
      */}
      {/*
        PHASE 1 · PREMIUM — die Linie erzaehlt ihren Satz einmal in der Zeit:
        Die drei Stuecke setzen sich (`thesis-piece`), danach zieht die
        Goldstrecke vom Knoten aus durch (`thesis-draw`). Beides ist reines
        CSS, laeuft einmal und endet im selben Bild wie vorher. Der Startwert
        ist nie null (D-28), bei reduzierter Bewegung gibt es keine Animation.
      */}
      <span className="flex flex-[1.1] items-center gap-4">
        <span className="thesis-piece bg-muted-foreground/40 h-px flex-1" style={{ animationDelay: "0.1s" }} />
        <span className="thesis-piece bg-muted-foreground/40 h-px flex-1" style={{ animationDelay: "0.18s" }} />
        <span className="thesis-piece bg-muted-foreground/40 h-px flex-1" style={{ animationDelay: "0.26s" }} />
      </span>

      {/* Hier faengt das System an. */}
      <span className="mx-3 flex items-center">
        <SystemNode ton="verbunden" gross />
      </span>

      {/* Und hier laeuft es durch. */}
      <span className="flex flex-[1.4] items-center">
        <span className="thesis-draw bg-gold/80 h-[2px] flex-1 rounded-full" />
        <SystemNode ton="verbunden" gross puls={!reduce} verzug={4} />
      </span>
    </div>
  )
}
