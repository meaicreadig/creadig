"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { registryWorks, workHref } from "@/lib/site-data"

/**
 * Referenzregister (B2) — die dichte Zweitansicht der Werkschau.
 *
 * Das Karten-Grid zeigt wenige Projekte gross; das Register zeigt alle auf
 * einen Blick. Aufbau je Zeile: Mono-Nummer links, Name + Branche in der
 * Mitte, Jahr und Region rechts. Hover zieht die Gold-Linie ueber die
 * Zeilenkante — dieselbe Bewegung wie bei Prozess-Schritten und
 * Leistungs-Ebenen, damit die Seite eine Handschrift behaelt.
 *
 * Quelle ist `registryWorks` und damit exakt dieselbe Liste wie im Grid:
 * zwei Darstellungen, eine Wahrheit. Das Jahr steht nur da, wo es belegt ist.
 */
export function WorkRegistry() {
  const { t } = useLocale()

  return (
    <div>
      {/* Spaltenkopf — erklaert die Zeilen, ohne eine Tabelle zu bauen. */}
      <div className="border-line-strong hidden border-b pb-3 md:grid md:grid-cols-12 md:items-baseline md:gap-x-8 md:px-2">
        <span className="eyebrow text-muted-foreground md:col-span-1">№</span>
        <span className="eyebrow text-muted-foreground md:col-span-5">{t.portfolio.colProject}</span>
        <span className="eyebrow text-muted-foreground md:col-span-3">{t.portfolio.colSector}</span>
        <span className="eyebrow text-muted-foreground md:col-span-3 md:text-right">
          {t.portfolio.colRegion}
        </span>
      </div>

      <ul>
        {registryWorks.map((work, i) => {
          const number = String(i + 1).padStart(2, "0")

          return (
            <Reveal key={work.slug} as="li" delay={0.04 * i} y={12}>
              {/* Seit PHASE A fuehrt jede Zeile auf die eigene Seite des Werks
                  — dieselbe Adresse wie die Karte daneben (site-data.workHref). */}
              <Link
                href={workHref(work)}
                className="group border-line hover:bg-foreground/[0.03] relative block border-t transition-colors duration-500"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                />
                <div className="grid items-baseline gap-x-8 gap-y-2 px-2 py-6 md:grid-cols-12">
                  <span className="eyebrow text-gold-text md:col-span-1">{number}</span>

                  <span className="text-subhead flex items-center gap-2 text-xl md:col-span-5">
                    {work.name}
                    <ArrowUpRight
                      className="text-gold size-4 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                    />
                  </span>

                  <span className="type-small text-muted-foreground md:col-span-3">
                    {work.sector}
                  </span>

                  <span className="text-meta text-muted-foreground md:col-span-3 md:text-right">
                    {/*
                      Jahr und Region stehen beide nur, wo sie belegt sind.
                      Fehlt beides, bleibt die Spalte leer — das ist richtig:
                      Sie traegt kein Label, das ins Leere zeigen koennte.
                    */}
                    {[work.year, work.region].filter(Boolean).join(" · ")}
                  </span>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </ul>

      <p className="text-muted-foreground/80 text-meta border-line mt-6 border-t pt-6">
        {t.portfolio.registryNote}
      </p>
    </div>
  )
}
