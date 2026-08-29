import { SignatureMotif } from "@/components/brand/signature-motif"

/**
 * SystemField — der Hero-Grund.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VORHER STAND
 * `ArchitecturalField`: ein perspektivischer Boden aus 41 Linien, eine
 * exponentielle Aufwaertskurve mit drei Goldpunkten, dazu das alte
 * Dreiecksraster — drei Bilder uebereinander, gekoppelt an den Scroll ueber
 * `useScroll`/`useTransform`. Handwerklich in Ordnung, inhaltlich ein
 * Widerspruch: Die Kurve und das Raster waren zwei konkurrierende Zeichen,
 * und zwei Zeichen sind keins.
 *
 * Mit SIG-02 traegt der Hero denselben Bau wie jede andere Flaeche der Seite
 * — die fuenf Ebenen als fuenf Knoten. Nur hier atmen sie, und nur hier
 * laeuft ein Signal die Kette hinauf. Das ist die eine Bewegung dieser
 * Sektion, und sie sagt etwas: die Richtung, in der dieses Haus baut.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEIN CLIENT-JS MEHR
 * Der alte Grund hing an `framer-motion` und lief bei jedem Scroll-Frame.
 * Hier ist nichts mehr davon uebrig: Glut, Bau und Signal sind CSS und SVG.
 * Das Motiv selbst behandelt `prefers-reduced-motion` — wer sie gesetzt hat,
 * sieht denselben Bau in Ruhe, nicht ein leeres Feld.
 *
 * Die beiden Verlaeufe sind kein Effekt, sondern Rangordnung: Sie loeschen
 * den Grund genau dort, wo die Headline steht. Die Typografie fuehrt, das
 * Zeichen begleitet.
 */
export function SystemField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Die Waerme hinter dem System — rechts, wo die Typografie nicht steht. */}
      <div
        className="absolute top-[34%] left-[58%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--gold) 12%, transparent), transparent 66%)",
        }}
      />

      {/*
        Die Verlaeufe liegen UNTER dem Zeichen und ueber der Glut — und sie
        laufen nach RECHTS, nicht nach unten.

        Vorher lagen sie obenauf und verliefen von oben nach unten: Der obere
        Rand war deckend, und genau dort steht der hoechste Knoten. Das
        Zeichen wurde also von der eigenen Kulisse zugedeckt und war im
        Hellmodus fast weg. Jetzt deckt der Verlauf die LINKE Haelfte, wo die
        Headline steht, und laesst die rechte frei, wo das Zeichen steht.
      */}
      <div className="from-background via-background/70 absolute inset-0 bg-gradient-to-r to-transparent" />
      <div className="from-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />

      <SignatureMotif role="field" />
    </div>
  )
}
