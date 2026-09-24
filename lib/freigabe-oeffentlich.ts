import { unstable_cache } from "next/cache"

import { FREIGABEN_TAG, projektionOhneCache } from "@/lib/freigabe-projektion"

/**
 * B-1 · DIE ZWISCHENGESPEICHERTE FASSUNG — MIT EINER MARKE, DIE EIN WIDERRUF ZIEHT.
 *
 * Warum eine eigene Datei: `next/cache` gibt es nur im Anfragekontext von
 * Next. Ein Probelauf hat keinen, und die Regeln der Projektion muessen sich
 * gegen echte Zeilen pruefen lassen. Die Logik liegt deshalb nebenan
 * (`lib/freigabe-projektion.ts`), und hier steht nur die Huelle.
 *
 * `revalidate: 300` ist die Obergrenze fuer den Fall, dass niemand die Marke
 * zieht. Der Normalfall ist schneller: Erteilen und Widerrufen im Admin rufen
 * `revalidateTag(FREIGABEN_TAG)`, und die naechste Anfrage sieht den neuen
 * Stand. Damit ist „ein Widerruf wirkt zeitnah" keine Zusage, sondern eine
 * Zahl: sofort im Normalfall, spaetestens nach fuenf Minuten.
 */
export const oeffentlicheFaelle = unstable_cache(projektionOhneCache, ["freigabe-projektion-v1"], {
  tags: [FREIGABEN_TAG],
  revalidate: 300,
})
