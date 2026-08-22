import { cn } from "@/lib/utils"

/**
 * Statuszeichen vor der Stand-Angabe (PHASE B).
 *
 * ---------------------------------------------------------------------------
 * WARUM
 * Der Stand stand bisher nur als Fließtext da: „Im Tagesbetrieb",
 * „Im Aufbau", „Im Aufbau · live unter meai.run". Nebeneinander gelesen
 * verschwimmt der Unterschied — und genau der ist die ehrlichste Information
 * auf einer Produktseite. Ein Produkt, das läuft, und eines, das gebaut wird,
 * dürfen nicht gleich aussehen. Sonst liest sich „Im Aufbau" wie ein
 * Versprechen statt wie ein Zustand.
 *
 * ---------------------------------------------------------------------------
 * WOHER DER ZUSTAND KOMMT
 * Aus `Work.live` — derselben Angabe, die auch die Werkschau-Karte auszeichnet.
 * Kein neues Feld, keine zweite Wahrheit: Läuft es, ist der Punkt gefüllt;
 * wird es gebaut, ist er offen. Zwei Zustände, weil es nur zwei belegte gibt.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEIN GRÜN
 * Beide Design-Entwürfe zeigen an dieser Stelle einen grünen Punkt. Grün ist
 * aber keine Hausfarbe, und die Palette ist gesperrt. Der Unterschied kommt
 * darum aus der Form statt aus der Farbe — gefüllt gegen offen liest sich auf
 * hellem wie auf dunklem Grund, und in Graustufen ebenfalls.
 */
export function StatusDot({ live, className }: { live?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        // Beide Zustaende gleich gross, damit die Grundlinie nicht springt.
        "inline-block size-2 shrink-0 rounded-full",
        // Der offene Ring lag zuerst auf der Linienfarbe und war damit fast
        // unsichtbar — „im Aufbau" las sich wie ein Rendering-Fehler statt wie
        // ein Zustand. Gold mit halber Deckung bleibt in der Palette und ist
        // eindeutig als Ring erkennbar.
        live ? "bg-gold" : "border-gold/60 border bg-transparent",
        className,
      )}
    />
  )
}
