"use client"

import { SystemRail } from "@/components/creative/system"

/** Eine Spur: sechs Stationen, gleich breite Zellen. */
export function Spur({
  stationen,
  werkzeuge,
  gebrochen,
  label,
  zaehler,
  note,
  puls,
  uebergabeSr,
  eigentum,
}: {
  stationen: readonly string[]
  werkzeuge?: readonly string[]
  gebrochen: boolean
  label: string
  zaehler: string
  note: string
  puls: boolean
  uebergabeSr?: string
  eigentum?: string
}) {
  return (
    <div data-spur={gebrochen ? "getrennt" : "system"}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`eyebrow ${gebrochen ? "text-muted-foreground" : "text-gold-text"}`}>
          {label}
        </span>
        <span className={`text-subhead text-base ${gebrochen ? "text-muted-foreground" : "text-foreground"}`}>
          {zaehler}
        </span>
        <span className="type-small text-muted-foreground">{note}</span>
      </div>

      <div className="betriebsfluss-spur">
        <ol className="mt-6 flex flex-col md:flex-row md:items-stretch">
          {stationen.map((station, i) => {
            const ersteZelle = i === 0
            const letzteZelle = i === stationen.length - 1
            const werkzeug = werkzeuge?.[i]

            return (
              <li key={station} className="flex flex-1 items-stretch gap-4 md:flex-col md:gap-0">
                <SystemRail
                  ton={gebrochen ? "offen" : "verbunden"}
                  achse="fluss"
                  erste={ersteZelle}
                  letzte={letzteZelle}
                  puls={puls}
                  verzug={i}
                />

                {/*
                  Mobil steht das Werkzeug RECHTS neben der Station, nicht
                  darunter — sonst verdoppelt sich die Hoehe der Spur. Ab md
                  stehen beide mittig unter dem Knoten.
                */}
                <span className="flex flex-wrap items-baseline gap-x-3 self-center py-4 md:mt-4 md:flex-col md:items-center md:gap-y-1 md:self-auto md:py-0 md:text-center">
                  <span
                    className={`text-base md:text-lg ${gebrochen ? "text-muted-foreground" : "text-foreground"}`}
                  >
                    {station}
                  </span>
                  {werkzeug && <span className="text-meta text-muted-foreground">{werkzeug}</span>}
                  {gebrochen && !letzteZelle && uebergabeSr && (
                    <span className="sr-only">{uebergabeSr}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>

        {eigentum && (
          <p className="mt-6 flex justify-end md:mt-5">
            <span className="border-gold/60 text-gold-text text-meta inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
              <span aria-hidden="true" className="bg-gold size-[7px] rounded-full" />
              {eigentum}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
