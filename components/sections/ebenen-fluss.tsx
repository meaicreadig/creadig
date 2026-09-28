"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Spur } from "@/components/sections/betriebsfluss"
import { serviceLayerKeys } from "@/lib/site-data"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { useSeenOnce } from "@/lib/use-seen-once"

/**
 * PHASE 3 · Das Systembild der Leistungen.
 *
 * Dieselbe Spur wie auf der Startseite, nur eine Ebene hoeher: Dort sind die
 * Stationen die Schritte eines Auftrags, hier die fuenf Ebenen des Hauses.
 * Oben stehen sie bei fuenf Anbietern (getrennt), unten bei einem Haus
 * (verbunden). Kein neues Vokabular — dieselbe Linie, dieselbe Bewegung,
 * dieselbe Modell-Kennzeichnung am Bild.
 *
 * Die Stationsnamen kommen aus `services.layers` und `serviceLayerKeys`,
 * damit Reihenfolge und Namen nie von den Ebenen darunter abweichen.
 */
export function EbenenFluss() {
  const { t } = useLocale()
  const copy = t.leistungenPage.flow
  const stationen = serviceLayerKeys.map((key) => t.services.layers[key].name)
  const reduce = usePrefersReducedMotion()
  const { ref, seen, bereit } = useSeenOnce<HTMLElement>()

  const zustand = !bereit || seen || reduce ? "verbunden" : "getrennt"

  return (
    <section
      ref={ref}
      id="ebenen-systembild"
      aria-labelledby="ebenen-systembild-title"
      className="section-seam"
      data-state={zustand}
    >
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="ebenen-systembild-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        <div className="mt-14 flex flex-col gap-12 md:gap-14">
          <Spur
            stationen={stationen}
            werkzeuge={copy.vendors}
            gebrochen
            label={copy.todayLabel}
            zaehler={copy.todayCount}
            note={copy.todayNote}
            puls={false}
            uebergabeSr={copy.handoffSr}
          />
          <Spur
            stationen={stationen}
            gebrochen={false}
            label={copy.systemLabel}
            zaehler={copy.systemCount}
            note={copy.systemNote}
            puls={false}
            eigentum={copy.ownership}
          />
        </div>

        <p className="text-meta text-muted-foreground border-line mt-10 max-w-xl border-t pt-4">
          {copy.modelNote}
        </p>
      </div>
    </section>
  )
}
